import type { Connector } from '../connector.js';
import type { GraphEdge, GraphFragment, GraphNode } from '../../model/types.js';

import fs from 'node:fs';
import path from 'node:path';

/** Dependency sections of a package.json we turn into `imports` edges. */
const DEP_SECTIONS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
] as const;

function toPosix(p: string): string {
  return p.split(path.sep).join('/');
}

function moduleOf(rel: string): string {
  const dir = path.posix.dirname(rel);

  return dir === '' || dir === '.' ? '.' : dir;
}

/**
 * Reads `package.json` manifests as graph nodes: a file node per manifest with an
 * `imports` edge to each declared dependency (as an external node). This completes
 * the dependency picture — a CLI tool or a build dep declared but not imported in
 * code still shows up — and the external nodes dedupe with the ones the language
 * connectors create from real imports (same `ext:<name>` id).
 */
export class PackageJsonConnector implements Connector {
  readonly name = 'package.json';

  readonly lang = 'json';

  match(files: Array<string>): Array<string> {
    return files.filter(
      (f) => f === 'package.json' || f.endsWith('/package.json'),
    );
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async extract(files: Array<string>, root: string): Promise<GraphFragment> {
    const nodes: Array<GraphNode> = [];
    const edges: Array<GraphEdge> = [];
    const nodeIds = new Set<string>();
    const addNode = (n: GraphNode): void => {
      if (nodeIds.has(n.id)) {
        return;
      }

      nodeIds.add(n.id);
      nodes.push(n);
    };

    for (const rel of files) {
      let manifest: Record<string, unknown> | undefined;

      try {
        manifest = JSON.parse(
          fs.readFileSync(path.join(root, rel), 'utf8'),
        ) as Record<string, unknown>;
      } catch {
        // unreadable or malformed: skip, don't abort the build
      }

      if (manifest) {
        addNode({
          id: rel,
          kind: 'file',
          name: path.posix.basename(rel),
          file: rel,
          line: 0,
          endLine: 0,
          module: moduleOf(toPosix(rel)),
          lang: this.lang,
          exported: false,
          nativeKind: 'package.json',
        });

        const allDeps = DEP_SECTIONS.flatMap((section) => {
          const deps = manifest[section];

          return deps && typeof deps === 'object' ? Object.keys(deps) : [];
        });

        for (const dep of allDeps) {
          const id = `ext:${dep}`;

          addNode({
            id,
            kind: 'external',
            name: dep,
            file: dep,
            line: 0,
            endLine: 0,
            module: 'external',
            lang: this.lang,
            exported: false,
          });
          edges.push({
            from: rel,
            to: id,
            kind: 'imports',
            confidence: 'exact',
          });
        }
      }
    }

    return Promise.resolve({ nodes, edges });
  }
}
