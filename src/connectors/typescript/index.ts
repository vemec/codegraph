import fs from 'node:fs';
import path from 'node:path';
import { ModuleKind, ModuleResolutionKind, Node, Project, ts, type SourceFile } from 'ts-morph';
import type { Connector } from '../connector.ts';
import type { GraphEdge, GraphFragment, GraphNode } from '../../model/types.ts';

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
 * Stable id for a declaration. Used both when registering nodes and when
 * resolving calls, so both sides match exactly.
 */
function declId(decl: Node, root: string): string | undefined {
  const rel = relPath(decl.getSourceFile().getFilePath(), root);
  if (Node.isFunctionDeclaration(decl) || Node.isClassDeclaration(decl) || Node.isInterfaceDeclaration(decl)) {
    const name = decl.getName();
    return name ? `${rel}::${name}` : undefined;
  }
  if (Node.isMethodDeclaration(decl) || Node.isMethodSignature(decl)) {
    const cls = decl.getFirstAncestor(
      (a) => Node.isClassDeclaration(a) || Node.isInterfaceDeclaration(a),
    );
    const owner = cls && (Node.isClassDeclaration(cls) || Node.isInterfaceDeclaration(cls)) ? cls.getName() : undefined;
    const name = decl.getName();
    return owner && name ? `${rel}::${owner}.${name}` : undefined;
  }
  if (Node.isVariableDeclaration(decl)) {
    const name = decl.getName();
    return name ? `${rel}::${name}` : undefined;
  }
  return undefined;
}

export class TypeScriptConnector implements Connector {
  readonly name = 'typescript';
  readonly lang = 'ts';

  match(files: string[]): string[] {
    return files.filter((f) => SUPPORTED.test(f) && !f.endsWith('.d.ts'));
  }

  async extract(files: string[], root: string): Promise<GraphFragment> {
    // If the repo has a tsconfig, use it: it brings in `paths` (aliases like
    // @hooks/*) and baseUrl, without which aliased imports/calls do not resolve.
    // `skipAddingFilesFromTsConfig` avoids parsing the whole repo: we only add
    // the files assigned below.
    const fallbackOptions = {
      allowJs: true,
      checkJs: false,
      module: ModuleKind.ESNext,
      moduleResolution: ModuleResolutionKind.Bundler,
      jsx: ts.JsxEmit.ReactJSX,
    };
    // Use the repo tsconfig (with `paths`/aliases). But some tsconfigs
    // (solution-style, or ones extending a missing base) leave the type-checker
    // in a broken state -> fall back to defaults instead of crashing.
    const tsConfigFilePath = path.join(root, 'tsconfig.json');
    let project: Project;
    try {
      project = fs.existsSync(tsConfigFilePath)
        ? new Project({ tsConfigFilePath, skipAddingFilesFromTsConfig: true })
        : new Project({ compilerOptions: fallbackOptions, skipAddingFilesFromTsConfig: true });
    } catch {
      project = new Project({ compilerOptions: fallbackOptions, skipAddingFilesFromTsConfig: true });
    }
    // Use addSourceFileAtPath (exact) instead of addSourceFilesAtPaths (glob
    // aware): the paths come from a real readdir and may contain glob metacharacters
    // (`[`, `{`, `*`) in the name, which would break matching.
    const sourceFiles: SourceFile[] = [];
    for (const f of files) {
      try {
        sourceFiles.push(project.addSourceFileAtPath(path.join(root, f)));
      } catch {
        // File that ts-morph cannot parse: skip it instead of aborting.
      }
    }

    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const nodeIds = new Set<string>();

    const addNode = (n: GraphNode): void => {
      if (nodeIds.has(n.id)) return;
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
        module: 'external',
        lang: this.lang,
        exported: false,
      });
      return id;
    };

    // --- Pass 1: register nodes (files + declared symbols) ---
    for (const sf of sourceFiles) {
      const rel = ensureFileNode(sf);
      const lang = this.lang;

      const symbol = (
        id: string,
        kind: GraphNode['kind'],
        name: string,
        line: number,
        exported: boolean,
        nativeKind: string,
      ): void => {
        addNode({ id, kind, name, file: rel, line, module: moduleOf(rel), lang, exported, nativeKind });
        edges.push({ from: rel, to: id, kind: 'contains', confidence: 'exact' });
      };

      for (const fn of sf.getFunctions()) {
        const name = fn.getName();
        if (name) {
          symbol(`${rel}::${name}`, 'function', name, fn.getStartLineNumber(), fn.isExported(), 'function');
        } else if (fn.isDefaultExport()) {
          // `export default function () {}` has no name: we name it after the
          // file so the export stays visible in the graph (typical for pages).
          const base = path.posix.basename(rel).replace(/\.[mc]?[jt]sx?$/, '');
          symbol(`${rel}::default`, 'function', base, fn.getStartLineNumber(), true, 'default-export');
        }
      }
      for (const iface of sf.getInterfaces()) {
        const id = declId(iface, root);
        if (!id) continue;
        symbol(id, 'interface', iface.getName(), iface.getStartLineNumber(), iface.isExported(), 'interface');
        for (const m of iface.getMethods()) {
          const mid = declId(m, root);
          if (mid) symbol(mid, 'method', m.getName(), m.getStartLineNumber(), false, 'method-signature');
        }
      }
      for (const cls of sf.getClasses()) {
        const cid = declId(cls, root);
        if (!cid) continue;
        symbol(cid, 'class', cls.getName() ?? '(anon)', cls.getStartLineNumber(), cls.isExported(), 'class');
        for (const m of cls.getMethods()) {
          const mid = declId(m, root);
          if (mid) {
            symbol(mid, 'method', m.getName(), m.getStartLineNumber(), false, 'method');
            edges.push({ from: cid, to: mid, kind: 'contains', confidence: 'exact' });
          }
        }
      }
      for (const vd of sf.getVariableDeclarations()) {
        const init = vd.getInitializer();
        const isFn = init !== undefined && (Node.isArrowFunction(init) || Node.isFunctionExpression(init));
        const exported = vd.getVariableStatement()?.isExported() ?? false;
        if (!isFn && !exported) continue; // ignorar consts internas que no son funciones
        const id = declId(vd, root);
        if (id) {
          symbol(id, isFn ? 'function' : 'export', vd.getName(), vd.getStartLineNumber(), exported, isFn ? 'arrow' : 'variable');
        }
      }
    }

    // --- Pass 2: edges that require resolution (imports, inheritance, calls) ---
    const isNodeModule = (sf: SourceFile): boolean => sf.getFilePath().includes('/node_modules/');

    // ts-morph's type-checker can throw (for example "reading 'flags'") on symbols
    // in some repos/tsconfigs; a failed resolution should not kill the build:
    // skip it and keep going (that edge stays unresolved, the rest is preserved).
    const resolveTo = (expr: Node | undefined): string | undefined => {
      if (!expr) return undefined;
      try {
        let sym = expr.getSymbol();
        if (!sym) return undefined;
        const aliased = sym.getAliasedSymbol();
        if (aliased) sym = aliased;
        for (const decl of sym.getDeclarations()) {
          const id = declId(decl, root);
          if (id && nodeIds.has(id)) return id;
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
        if (id && nodeIds.has(id)) return id;
        cur = cur.getParent();
      }
      return undefined;
    };

    for (const sf of sourceFiles) {
      const fileId = relPath(sf.getFilePath(), root);

      // imports
      for (const imp of sf.getImportDeclarations()) {
        const spec = imp.getModuleSpecifierValue();
        const target = imp.getModuleSpecifierSourceFile();
        let toId: string;
        if (target && !isNodeModule(target) && !relPath(target.getFilePath(), root).startsWith('..')) {
          toId = ensureFileNode(target);
        } else {
          toId = ensureExternal(spec);
        }
        edges.push({ from: fileId, to: toId, kind: 'imports', confidence: 'exact' });
      }

      // inheritance / implementation
      for (const cls of sf.getClasses()) {
        const cid = declId(cls, root);
        if (!cid) continue;
        const ext = cls.getExtends();
        const extId = resolveTo(ext?.getExpression());
        if (extId) edges.push({ from: cid, to: extId, kind: 'extends', confidence: 'exact' });
        for (const impl of cls.getImplements()) {
          const implId = resolveTo(impl.getExpression());
          if (implId) edges.push({ from: cid, to: implId, kind: 'implements', confidence: 'exact' });
        }
      }
      for (const iface of sf.getInterfaces()) {
        const iid = declId(iface, root);
        if (!iid) continue;
        for (const ext of iface.getExtends()) {
          const extId = resolveTo(ext.getExpression());
          if (extId) edges.push({ from: iid, to: extId, kind: 'extends', confidence: 'exact' });
        }
      }

      // calls and constructions. If the expression is not inside a registered
      // symbol (module-level code: a top-level `bootstrap()`, IIFEs), attach it
      // to the file node instead of dropping it - the module executes it on load,
      // so "who triggers X" does not lose the top-level case.
      sf.forEachDescendant((node) => {
        if (Node.isCallExpression(node)) {
          const fromId = enclosingId(node) ?? fileId;
          const toId = resolveTo(node.getExpression());
          if (toId && fromId !== toId) {
            edges.push({ from: fromId, to: toId, kind: 'calls', confidence: 'exact' });
          }
        } else if (Node.isNewExpression(node)) {
          const fromId = enclosingId(node) ?? fileId;
          const toId = resolveTo(node.getExpression());
          if (toId && fromId !== toId) {
            edges.push({ from: fromId, to: toId, kind: 'references', confidence: 'exact' });
          }
        } else if (Node.isJsxOpeningElement(node) || Node.isJsxSelfClosingElement(node)) {
          // A React component is used via JSX <Comp/>, which is NOT a CallExpression.
          // Lowercase tags (<div/>) are intrinsic and do not resolve to a node.
          const fromId = enclosingId(node) ?? fileId;
          const toId = resolveTo(node.getTagNameNode());
          if (toId && fromId !== toId) {
            edges.push({ from: fromId, to: toId, kind: 'renders', confidence: 'exact' });
          }
        }
      });
    }

    return { nodes, edges };
  }
}
