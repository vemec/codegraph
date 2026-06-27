import type { Graph } from '../model/types.js';

/** Deterministic graph serialization (stable keys, 2-space indent).
 *  `meta.root` is dropped: it's the absolute local path of the machine that
 *  generated the graph — environment-specific, so it must not leak into the
 *  portable data file (it's only used to build editor links in the HTML view). */
export function toJson(graph: Graph): string {
  const meta = { ...graph.meta };

  delete meta.root;

  return `${JSON.stringify({ ...graph, meta }, null, 2)}\n`;
}
