import type { Graph, GraphEdge, GraphNode } from './model/types.js';

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { applicableConnectors } from './connectors/registry.js';
import { GraphBuilder } from './model/graph.js';
import { detectFrameworks } from './sources/frameworks.js';
import { resolveSource, type SourceOptions } from './sources/resolve.js';

export interface BuildResult {
  graph: Graph;
  /** Which connectors ran and how many files each one took. */
  ran: Array<{ connector: string; files: number }>;
  /** Updated cache to persist for the next (incremental) build. */
  cache: BuildCache;
}

/** Per-file extracted fragment + content hash. Persisting this lets a rebuild
 *  re-extract only the files that changed (and the ones that depend on them). */
export interface BuildCache {
  version: number;
  source: string;
  files: Record<
    string,
    { hash: string; nodes: Array<GraphNode>; edges: Array<GraphEdge> }
  >;
}

// Bump when the extracted node/edge shape changes, so stale caches are discarded
// (else unchanged files keep their old fragments). v2: added `signature` to nodes.
const CACHE_VERSION = 2;

/** Pipeline progress events, so the UI (CLI) can give feedback without the
 *  core knowing anything about spinners/colors. Programmatic consumers ignore it. */
export type BuildEvent =
  | { phase: 'built'; nodes: number; edges: number }
  | { phase: 'connector:done'; connector: string; nodes: number; edges: number }
  | { phase: 'connector:start'; connector: string; files: number }
  | { phase: 'incremental'; changed: number; reused: number }
  | { phase: 'parsing'; connector: string; done: number; total: number }
  | { phase: 'resolved'; files: number; commit?: string; dirty?: boolean };

export interface BuildOptions extends SourceOptions {
  /** Previous cache to reuse for unchanged files (incremental rebuild). */
  cache?: BuildCache;
}

function hashFile(abs: string): string {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  return createHash('sha256').update(fs.readFileSync(abs)).digest('hex');
}

/** File part of a node id: "a/b.ts::sym" → "a/b.ts"; "a/b.ts" → itself; "ext:x" → null. */
function fileOfId(id: string): string | null {
  if (id.startsWith('ext:')) {
    return null;
  }

  const i = id.indexOf('::');

  return i === -1 ? id : id.slice(0, i);
}

type FileFragment = {
  hash: string;
  nodes: Array<GraphNode>;
  edges: Array<GraphEdge>;
};

/**
 * Central pipeline: resolves the source, dispatches the files to each applicable
 * connector and merges the fragments into a single deterministic graph.
 *
 * Incremental: when `options.cache` matches the source, only files whose content
 * hash changed — plus files whose cached edges point INTO a changed/removed file
 * (reverse deps, to catch renames/removals) — are re-extracted. Unchanged files
 * reuse their cached fragment. If nothing changed, no connector runs at all.
 */
// eslint-disable-next-line complexity
export async function buildGraph(
  input: string,
  options: BuildOptions = {},
  onEvent?: (e: BuildEvent) => void,
): Promise<BuildResult> {
  const resolved = resolveSource(input, options);

  try {
    onEvent?.({
      phase: 'resolved',
      files: resolved.files.length,
      commit: resolved.commit,
      dirty: resolved.dirty,
    });

    const prev: BuildCache['files'] =
      options.cache?.version === CACHE_VERSION &&
      options.cache.source === resolved.source
        ? options.cache.files
        : {};

    // Only files a connector actually handles take part in the incremental
    // accounting — the rest (json, css, …) are never extracted nor cached, so
    // counting them as "changed" would be noise.
    const applicable = applicableConnectors(resolved.files);
    const handledFiles = applicable.flatMap((a) => a.files);

    // Current files + content hashes. Changed = hash mismatch vs cache, or unreadable (always re-extract).
    const currentFiles = new Set(handledFiles);
    const hashes = new Map<string, string>();
    const changed = new Set<string>();

    for (const f of handledFiles) {
      try {
        const h = hashFile(path.join(resolved.root, f));

        hashes.set(f, h);

        const c = prev[f];

        if (c?.hash !== h) {
          changed.add(f);
        }
      } catch {
        hashes.set(f, ''); // placeholder so cache bucketing doesn't get undefined
        changed.add(f);
      }
    }

    const removed = Object.keys(prev).filter((f) => !currentFiles.has(f));

    // Reverse deps: unchanged files whose cached edges resolve into a changed or
    // removed file may have stale edges (renamed/deleted target) → re-extract them.
    const invalidated = new Set([...changed, ...removed]);
    const reverseDeps = new Set<string>();

    const isInvalidatedDep = (frag: BuildCache['files'][string]): boolean =>
      frag.edges.some((e) => {
        const target = fileOfId(e.to);

        return Boolean(target && invalidated.has(target));
      });

    for (const [f, frag] of Object.entries(prev)) {
      if (currentFiles.has(f) && !changed.has(f) && isInvalidatedDep(frag)) {
        reverseDeps.add(f);
      }
    }

    const dirty = new Set([...changed, ...reverseDeps]);
    // Nodes from files we are NOT re-extracting: valid targets for cross-file edges.
    const cleanFiles = handledFiles.filter((f) => !dirty.has(f));
    const knownIds = new Set<string>();

    for (const f of cleanFiles) {
      for (const n of prev[f]?.nodes ?? []) {
        knownIds.add(n.id);
      }
    }

    onEvent?.({
      phase: 'incremental',
      changed: dirty.size,
      reused: cleanFiles.length,
    });

    const newCacheFiles: BuildCache['files'] = {};
    const builder = new GraphBuilder();
    const ran: BuildResult['ran'] = [];

    // Carry over unchanged files straight from the cache.
    for (const f of cleanFiles) {
      const c = prev[f];

      if (c) {
        newCacheFiles[f] = c;
        builder.addFragment({ nodes: c.nodes, edges: c.edges });
      }
    }

    for (const { connector, files } of applicable) {
      ran.push({ connector: connector.name, files: files.length });

      const dirtyForConnector = files.filter((f) => dirty.has(f));

      if (dirtyForConnector.length > 0) {
        onEvent?.({
          phase: 'connector:start',
          connector: connector.name,
          files: dirtyForConnector.length,
        });

        // eslint-disable-next-line no-await-in-loop
        const fragment = await connector.extract(
          dirtyForConnector,
          resolved.root,
          (done, total) =>
            onEvent?.({
              phase: 'parsing',
              connector: connector.name,
              done,
              total,
            }),
          knownIds,
        );

        builder.addFragment(fragment);
        onEvent?.({
          phase: 'connector:done',
          connector: connector.name,
          nodes: fragment.nodes.length,
          edges: fragment.edges.length,
        });

        // Bucket the flat fragment back into per-file fragments for the cache.
        const idToFile = new Map<string, string>();

        for (const n of fragment.nodes) {
          idToFile.set(n.id, n.file);
        }

        const buckets = new Map<string, FileFragment>();

        for (const f of dirtyForConnector) {
          buckets.set(f, { hash: hashes.get(f)!, nodes: [], edges: [] });
        }

        for (const n of fragment.nodes) {
          buckets.get(n.file)?.nodes.push(n);
        }

        for (const e of fragment.edges) {
          const edgeFile = idToFile.get(e.from) ?? fileOfId(e.from);

          buckets.get(edgeFile ?? '')?.edges.push(e);
        }

        for (const [f, frag] of buckets) {
          newCacheFiles[f] = frag;
        }
      }
    }

    const graph = builder.build({
      source: resolved.source,
      // only local sources keep a usable path (remote clones live in a temp dir
      // that gets cleaned up); used by the Explorer for editor links.
      root: resolved.cleanup ? undefined : resolved.root,
      commit: resolved.commit,
      dirty: resolved.dirty,
      generatedAt: new Date().toISOString(),
      frameworks: detectFrameworks(resolved.root),
    });

    onEvent?.({
      phase: 'built',
      nodes: graph.meta.counts.nodes,
      edges: graph.meta.counts.edges,
    });

    return {
      graph,
      ran,
      cache: {
        version: CACHE_VERSION,
        source: resolved.source,
        files: newCacheFiles,
      },
    };
  } finally {
    resolved.cleanup?.();
  }
}
