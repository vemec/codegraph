import type { Connector } from '../connector.js';
import type { GraphEdge, GraphFragment, GraphNode } from '../../model/types.js';

import fs from 'node:fs';
import path from 'node:path';

import {
  ModuleKind,
  ModuleResolutionKind,
  Node,
  Project,
  ts,
  type SourceFile,
} from 'ts-morph';

const SUPPORTED = /\.(ts|tsx|mts|cts|js|jsx|mjs|cjs)$/;

function toPosix(p: string): string {
  return p.split(path.sep).join('/');
}

function relPath(filePath: string, root: string): string {
  return toPosix(path.relative(root, filePath));
}

function moduleOf(rel: string): string {
  const dir = path.posix.dirname(rel);

  return dir === '' || dir === '.' ? '.' : dir;
}

/**
 * Stable id for a declaration. Used BOTH when registering nodes and when
 * resolving calls, so that both sides match exactly.
 */
function declId(decl: Node, root: string): string | undefined {
  const rel = relPath(decl.getSourceFile().getFilePath(), root);

  if (
    Node.isFunctionDeclaration(decl) ||
    Node.isClassDeclaration(decl) ||
    Node.isInterfaceDeclaration(decl)
  ) {
    const name = decl.getName();

    return name ? `${rel}::${name}` : undefined;
  }

  if (Node.isMethodDeclaration(decl) || Node.isMethodSignature(decl)) {
    const cls = decl.getFirstAncestor(
      (a) => Node.isClassDeclaration(a) || Node.isInterfaceDeclaration(a),
    );
    const owner =
      cls && (Node.isClassDeclaration(cls) || Node.isInterfaceDeclaration(cls))
        ? cls.getName()
        : undefined;
    const name = decl.getName();

    return owner && name ? `${rel}::${owner}.${name}` : undefined;
  }

  if (Node.isVariableDeclaration(decl) || Node.isEnumDeclaration(decl)) {
    const name = decl.getName();

    return name ? `${rel}::${name}` : undefined;
  }

  return undefined;
}

export class TypeScriptConnector implements Connector {
  readonly name = 'typescript';

  readonly lang = 'ts';

  match(files: Array<string>): Array<string> {
    return files.filter((f) => SUPPORTED.test(f) && !f.endsWith('.d.ts'));
  }

  // eslint-disable-next-line complexity, @typescript-eslint/require-await
  async extract(
    files: Array<string>,
    root: string,
    onProgress?: (done: number, total: number) => void,
    knownIds: ReadonlySet<string> = new Set(),
  ): Promise<GraphFragment> {
    // `knownIds` = ids of nodes that exist in OTHER (cached, unchanged) files.
    // For an incremental build we only add `files` (the dirty set) to the project
    // — the TS compiler pulls in their dependencies for type resolution — so an
    // edge resolving into an unchanged file must be validated against `knownIds`,
    // not just the nodes registered in this pass. Empty on a full build.
    // If the repo has a tsconfig, we use it: it brings the `paths` (aliases like
    // @hooks/*) and baseUrl, without which aliased imports/calls don't resolve.
    // `skipAddingFilesFromTsConfig` avoids parsing the whole repo: we only add
    // the files assigned to us further down.
    const fallbackOptions = {
      allowJs: true,
      checkJs: false,
      module: ModuleKind.ESNext,
      moduleResolution: ModuleResolutionKind.Bundler,
      jsx: ts.JsxEmit.ReactJSX,
    };
    // We use the repo's tsconfig (it brings the `paths`/aliases). But some
    // tsconfig files (solution-style, extends to a missing base) leave the type-checker
    // in a broken state → we fall back to default options instead of blowing up.
    const tsConfigFilePath = path.join(root, 'tsconfig.json');

    let project: Project;

    try {
      project = fs.existsSync(tsConfigFilePath)
        ? new Project({ tsConfigFilePath, skipAddingFilesFromTsConfig: true })
        : new Project({
            compilerOptions: fallbackOptions,
            skipAddingFilesFromTsConfig: true,
          });
    } catch {
      project = new Project({
        compilerOptions: fallbackOptions,
        skipAddingFilesFromTsConfig: true,
      });
    }

    // addSourceFileAtPath (exact) instead of addSourceFilesAtPaths (interprets
    // globs): the paths come from a real readdir and may contain glob
    // metacharacters (`[`, `{`, `*`) in the name, which would break matching.
    const sourceFiles: Array<SourceFile> = [];

    for (const f of files) {
      try {
        sourceFiles.push(project.addSourceFileAtPath(path.join(root, f)));
      } catch {
        // a file ts-morph can't parse: we skip it instead of aborting.
      }
    }

    const nodes: Array<GraphNode> = [];
    const edges: Array<GraphEdge> = [];
    const nodeIds = new Set<string>();
    // Ids of exported symbols: by-value references (callbacks, handlers) are
    // only captured if they point here — what crosses the file boundary.
    const exportedIds = new Set<string>();

    const addNode = (n: GraphNode): void => {
      if (nodeIds.has(n.id)) {
        return;
      }

      nodeIds.add(n.id);
      nodes.push(n);
    };
    const ensureFileNode = (sf: SourceFile): string => {
      const rel = relPath(sf.getFilePath(), root);

      addNode({
        id: rel,
        kind: 'file',
        name: path.posix.basename(rel),
        file: rel,
        line: 0,
        endLine: sf.getEndLineNumber(),
        module: moduleOf(rel),
        lang: this.lang,
        exported: false,
      });

      return rel;
    };
    const ensureExternal = (spec: string): string => {
      const id = `ext:${spec}`;

      addNode({
        id,
        kind: 'external',
        name: spec,
        file: spec,
        line: 0,
        endLine: 0,
        module: 'external',
        lang: this.lang,
        exported: false,
      });

      return id;
    };

    // Progress for the UI: two passes over the files (registration + resolution),
    // which is where the time goes (AST parsing and type-checker).
    const total = sourceFiles.length * 2;

    let processed = 0;

    // --- Pass 1: register nodes (files + declared symbols) ---
    for (const sf of sourceFiles) {
      const rel = ensureFileNode(sf);
      const { lang } = this;

      // Call signature resolved by the type-checker, for invocables: `(a: string) => T`.
      // Built from params + return type (getType().getText() yields `typeof name`/absolute
      // import paths, useless here). `getText(node)` resolves type names relative to this
      // scope. Length-capped to avoid a wall of inferred generics; resolution can throw
      // on some symbols → swallow and skip.
      const signatureOf = (node: Node): string | undefined => {
        const fn = node as unknown as {
          getParameters?: () => Array<{ getText: () => string }>;
          getReturnType?: () => { getText: (enclosing?: Node) => string };
        };

        if (!fn.getParameters || !fn.getReturnType) {
          return undefined;
        }

        try {
          const params = fn
            .getParameters()
            .map((p) => p.getText())
            .join(', ');
          const ret = fn.getReturnType().getText(node);
          const text = `(${params}) => ${ret}`.replace(/\s+/g, ' ').trim();

          return text.length > 200 ? `${text.slice(0, 199)}…` : text;
        } catch {
          return undefined;
        }
      };

      const symbol = (
        id: string,
        kind: GraphNode['kind'],
        name: string,
        line: number,
        endLine: number,
        exported: boolean,
        nativeKind: string,
        signature?: string,
      ): void => {
        addNode({
          id,
          kind,
          name,
          file: rel,
          line,
          endLine,
          module: moduleOf(rel),
          lang,
          exported,
          nativeKind,
          signature,
        });

        if (exported) {
          exportedIds.add(id);
        }

        edges.push({
          from: rel,
          to: id,
          kind: 'contains',
          confidence: 'exact',
        });
      };

      for (const fn of sf.getFunctions()) {
        const name = fn.getName();

        if (name) {
          symbol(
            `${rel}::${name}`,
            'function',
            name,
            fn.getStartLineNumber(),
            fn.getEndLineNumber(),
            fn.isExported(),
            'function',
            signatureOf(fn),
          );
        } else if (fn.isDefaultExport()) {
          // `export default function () {}` has no name: we name it after the
          // file so the export is visible in the graph (typical of pages).
          const base = path.posix.basename(rel).replace(/\.[mc]?[jt]sx?$/, '');

          symbol(
            `${rel}::default`,
            'function',
            base,
            fn.getStartLineNumber(),
            fn.getEndLineNumber(),
            true,
            'default-export',
            signatureOf(fn),
          );
        }
      }

      for (const iface of sf.getInterfaces()) {
        const id = declId(iface, root);

        if (id) {
          symbol(
            id,
            'interface',
            iface.getName(),
            iface.getStartLineNumber(),
            iface.getEndLineNumber(),
            iface.isExported(),
            'interface',
          );

          for (const m of iface.getMethods()) {
            const mid = declId(m, root);

            if (mid) {
              symbol(
                mid,
                'method',
                m.getName(),
                m.getStartLineNumber(),
                m.getEndLineNumber(),
                false,
                'method-signature',
                signatureOf(m),
              );
            }
          }
        }
      }

      for (const cls of sf.getClasses()) {
        const cid = declId(cls, root);

        if (cid) {
          symbol(
            cid,
            'class',
            cls.getName() ?? '(anon)',
            cls.getStartLineNumber(),
            cls.getEndLineNumber(),
            cls.isExported(),
            'class',
          );

          for (const m of cls.getMethods()) {
            const mid = declId(m, root);

            if (mid) {
              symbol(
                mid,
                'method',
                m.getName(),
                m.getStartLineNumber(),
                m.getEndLineNumber(),
                false,
                'method',
                signatureOf(m),
              );
              edges.push({
                from: cid,
                to: mid,
                kind: 'contains',
                confidence: 'exact',
              });
            }
          }
        }
      }

      for (const en of sf.getEnums()) {
        symbol(
          `${rel}::${en.getName()}`,
          'export',
          en.getName(),
          en.getStartLineNumber(),
          en.getEndLineNumber(),
          en.isExported(),
          'enum',
        );
      }

      for (const vd of sf.getVariableDeclarations()) {
        const init = vd.getInitializer();
        const isFn =
          init !== undefined &&
          (Node.isArrowFunction(init) || Node.isFunctionExpression(init));
        const exported = vd.getVariableStatement()?.isExported() ?? false;

        if (isFn || exported) {
          // ignore internal consts that aren't functions
          const id = declId(vd, root);

          if (id) {
            symbol(
              id,
              isFn ? 'function' : 'export',
              vd.getName(),
              vd.getStartLineNumber(),
              vd.getEndLineNumber(),
              exported,
              isFn ? 'arrow' : 'variable',
              isFn && init ? signatureOf(init) : undefined,
            );
          }
        }
      }

      processed += 1;
      onProgress?.(processed, total);
    }

    // --- Pass 2: edges that require resolution (imports, inheritance, calls) ---
    const isNodeModule = (sf: SourceFile): boolean =>
      sf.getFilePath().includes('/node_modules/');

    // The ts-morph type-checker can throw (e.g. "reading 'flags'") on symbols
    // from some repos/tsconfig; a failed resolution must not kill the build:
    // we skip it and continue (that edge stays unresolved, the rest isn't lost).
    const resolveTo = (expr: Node | undefined): string | undefined => {
      if (!expr) {
        return undefined;
      }

      try {
        let sym = expr.getSymbol();

        if (!sym) {
          return undefined;
        }

        const aliased = sym.getAliasedSymbol();

        if (aliased) {
          sym = aliased;
        }

        for (const decl of sym.getDeclarations()) {
          const id = declId(decl, root);

          if (id && (nodeIds.has(id) || knownIds.has(id))) {
            return id;
          }
        }
      } catch {
        return undefined;
      }

      return undefined;
    };

    const enclosingId = (node: Node): string | undefined => {
      let cur = node.getParent();

      while (cur) {
        const id = declId(cur, root);

        if (id && nodeIds.has(id)) {
          return id;
        }

        cur = cur.getParent();
      }

      return undefined;
    };

    // Resolves an identifier, but ONLY if it points to a known exported symbol.
    const resolveToExported = (id: Node): string | undefined => {
      const target = resolveTo(id);

      return target && exportedIds.has(target) ? target : undefined;
    };

    // Is this identifier already covered by another edge (calls/new/renders/imports)
    // or is it in a type position? If so, we don't count it as `references` to
    // avoid duplicating or adding type noise (we don't build a type graph in this pass).
    const skipAsReference = (id: Node): boolean => {
      const parent = id.getParent();

      if (!parent) {
        return true;
      }

      // direct callee of a call / construction → already covered by calls / references(new)
      if (
        (Node.isCallExpression(parent) || Node.isNewExpression(parent)) &&
        parent.getExpression() === id
      ) {
        return true;
      }

      // JSX tag <Comp/> → already covered by renders
      if (
        (Node.isJsxOpeningElement(parent) ||
          Node.isJsxSelfClosingElement(parent) ||
          Node.isJsxClosingElement(parent)) &&
        parent.getTagNameNode() === id
      ) {
        return true;
      }

      // the member name in `a.b` (the `.b`): we care about the object (left side),
      // not the member name (avoids double-counting with calls).
      if (
        Node.isPropertyAccessExpression(parent) &&
        parent.getNameNode() === id
      ) {
        return true;
      }

      // inside an import/export ... from → already covered by imports / re-exports
      if (
        id.getFirstAncestor(
          (a) => Node.isImportDeclaration(a) || Node.isExportDeclaration(a),
        )
      ) {
        return true;
      }

      // type position (`x: Foo`, generics, `extends Foo`...): a value identifier
      // never hangs off a TypeNode, so if we find one above, it's a type.
      let c: ts.Node | undefined = id.compilerNode.parent;

      while (c && !ts.isSourceFile(c)) {
        if (
          c.kind >= ts.SyntaxKind.FirstTypeNode &&
          c.kind <= ts.SyntaxKind.LastTypeNode
        ) {
          return true;
        }

        c = c.parent;
      }

      return false;
    };

    for (const sf of sourceFiles) {
      const fileId = relPath(sf.getFilePath(), root);

      const resolveModuleTo = (
        spec: string,
        target: SourceFile | undefined,
      ): string =>
        target &&
        !isNodeModule(target) &&
        !relPath(target.getFilePath(), root).startsWith('..')
          ? ensureFileNode(target)
          : ensureExternal(spec);

      // imports
      for (const imp of sf.getImportDeclarations()) {
        edges.push({
          from: fileId,
          to: resolveModuleTo(
            imp.getModuleSpecifierValue(),
            imp.getModuleSpecifierSourceFile(),
          ),
          kind: 'imports',
          confidence: 'exact',
        });
      }

      // re-exports: `export { x } from './y'` / `export * from './y'`. Without this the
      // barrel stays as a mute node and navigation breaks at the index.ts files. We
      // model it as `imports` (the barrel depends on y), which is what the agent
      // needs for impact/navigation.
      for (const exp of sf.getExportDeclarations()) {
        const spec = exp.getModuleSpecifierValue();

        if (spec) {
          // `export { x }` without `from` doesn't re-export another module
          edges.push({
            from: fileId,
            to: resolveModuleTo(spec, exp.getModuleSpecifierSourceFile()),
            kind: 'imports',
            confidence: 'exact',
          });
        }
      }

      // inheritance / implementation
      for (const cls of sf.getClasses()) {
        const cid = declId(cls, root);

        if (cid) {
          const ext = cls.getExtends();
          const extId = resolveTo(ext?.getExpression());

          if (extId) {
            edges.push({
              from: cid,
              to: extId,
              kind: 'extends',
              confidence: 'exact',
            });
          }

          for (const impl of cls.getImplements()) {
            const implId = resolveTo(impl.getExpression());

            if (implId) {
              edges.push({
                from: cid,
                to: implId,
                kind: 'implements',
                confidence: 'exact',
              });
            }
          }
        }
      }

      for (const iface of sf.getInterfaces()) {
        const iid = declId(iface, root);

        if (iid) {
          for (const ext of iface.getExtends()) {
            const extId = resolveTo(ext.getExpression());

            if (extId) {
              edges.push({
                from: iid,
                to: extId,
                kind: 'extends',
                confidence: 'exact',
              });
            }
          }
        }
      }

      // calls and constructions. If the expression is not inside a registered
      // symbol (module-level code: `bootstrap()` at the top, IIFEs), we hang it
      // off the file node instead of discarding it — the module runs it when
      // loaded, so "who triggers X" doesn't lose the top-level case.
      sf.forEachDescendant((node) => {
        if (Node.isCallExpression(node)) {
          const fromId = enclosingId(node) ?? fileId;
          const toId = resolveTo(node.getExpression());

          if (toId && fromId !== toId) {
            edges.push({
              from: fromId,
              to: toId,
              kind: 'calls',
              confidence: 'exact',
            });
          }
        } else if (Node.isNewExpression(node)) {
          const fromId = enclosingId(node) ?? fileId;
          const toId = resolveTo(node.getExpression());

          if (toId && fromId !== toId) {
            edges.push({
              from: fromId,
              to: toId,
              kind: 'references',
              confidence: 'exact',
            });
          }
        } else if (
          Node.isJsxOpeningElement(node) ||
          Node.isJsxSelfClosingElement(node)
        ) {
          // A React component is used via JSX <Comp/>, which is NOT a CallExpression.
          // Lowercase tags (<div/>) are intrinsic and don't resolve to a node.
          const fromId = enclosingId(node) ?? fileId;
          const toId = resolveTo(node.getTagNameNode());

          if (toId && fromId !== toId) {
            edges.push({
              from: fromId,
              to: toId,
              kind: 'renders',
              confidence: 'exact',
            });
          }
        } else if (Node.isIdentifier(node) && !skipAsReference(node)) {
          // By-value reference to an exported symbol: callback/handler passed without
          // calling (`arr.map(save)`, `onClick={save}`), assigned function, enum usage.
          // Closes the graph's blind spot: without this, those uses left no edge.
          const toId = resolveToExported(node);

          if (toId) {
            const fromId = enclosingId(node) ?? fileId;

            if (fromId !== toId) {
              edges.push({
                from: fromId,
                to: toId,
                kind: 'references',
                confidence: 'exact',
              });
            }
          }
        }
      });
      processed += 1;
      onProgress?.(processed, total);
    }

    return { nodes, edges };
  }
}
