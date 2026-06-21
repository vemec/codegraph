import type { Graph } from '../model/types.ts';

/** Deterministic graph serialization (stable keys, 2-space indentation). */
export function toJson(graph: Graph): string {
  return JSON.stringify(graph, null, 2) + '\n';
}
