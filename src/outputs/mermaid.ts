import { findNodes } from '../query/query.ts';
import type { Graph, GraphNode } from '../model/types.ts';

const EDGE_ARROW: Record<string, string> = {
  contains: '-.->',
  imports: '-.->',
  calls: '-->',
  renders: '-->',
  extends: '==>',
  implements: '==>',
  references: '-->',
};

function safeId(index: number): string {
  return `n${index}`;
}
function label(n: GraphNode): string {
  return `${n.name}<br/><small>${n.kind}</small>`.replace(/"/g, "'");
}

/**
 * Focused Mermaid subgraph around a symbol (bidirectional BFS up to `depth`).
 * Intended for pasting into a PR or a .md - Mermaid performs best when bounded.
 */
export function toMermaid(graph: Graph, symbol: string, depth = 2): string {
  const start = findNodes(graph, symbol)[0];
  if (!start) return `%% symbol not found: ${symbol}`;

  const adj = new Map<string, Set<string>>();
  for (const e of graph.edges) {
    (adj.get(e.from) ?? adj.set(e.from, new Set()).get(e.from)!).add(e.to);
    (adj.get(e.to) ?? adj.set(e.to, new Set()).get(e.to)!).add(e.from);
  }

  const included = new Set([start.id]);
  let frontier = [start.id];
  for (let d = 0; d < depth; d++) {
    const next: string[] = [];
    for (const id of frontier) {
      for (const nb of adj.get(id) ?? []) {
        if (!included.has(nb)) {
          included.add(nb);
          next.push(nb);
        }
      }
    }
    frontier = next;
  }

  const ids = [...included];
  const idx = new Map(ids.map((id, i) => [id, i]));
  const byId = new Map(graph.nodes.map((n) => [n.id, n]));

  const out: string[] = ['flowchart LR'];
  for (const id of ids) {
    const n = byId.get(id);
    if (n) out.push(`  ${safeId(idx.get(id)!)}["${label(n)}"]`);
  }
  for (const e of graph.edges) {
    if (included.has(e.from) && included.has(e.to)) {
      const arrow = EDGE_ARROW[e.kind] ?? '-->';
      out.push(`  ${safeId(idx.get(e.from)!)} ${arrow}|${e.kind}| ${safeId(idx.get(e.to)!)}`);
    }
  }
  out.push(`  classDef focus fill:#ffd966,stroke:#bf9000,stroke-width:2px;`);
  out.push(`  class ${safeId(idx.get(start.id)!)} focus;`);
  return out.join('\n');
}
