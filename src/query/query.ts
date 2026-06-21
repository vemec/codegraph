import type { Graph, GraphEdge, GraphNode, EdgeKind } from '../model/types.ts';

export interface Relation {
  edge: GraphEdge;
  node: GraphNode;
}

export interface NeighborsResult {
  node: GraphNode;
  /** Otras coincidencias del mismo nombre (para desambiguar). */
  alternatives: GraphNode[];
  outgoing: Relation[];
  incoming: Relation[];
}

export interface ImpactResult {
  node: GraphNode;
  alternatives: GraphNode[];
  /** Who depends on this symbol (calls/uses/inherits/implements it). No `contains`. */
  dependents: Relation[];
}

/** Edges that represent a real dependency (not mere structural containment). */
const DEPENDENCY_KINDS: ReadonlySet<EdgeKind> = new Set<EdgeKind>([
  'calls',
  'renders',
  'references',
  'extends',
  'implements',
  'imports',
]);

/** Resolves a text query to nodes: by exact id, or by name/suffix. */
export function findNodes(graph: Graph, q: string): GraphNode[] {
  const exact = graph.nodes.filter((n) => n.id === q);
  if (exact.length > 0) return exact;
  const lower = q.toLowerCase();
  return graph.nodes.filter(
    (n) => n.name.toLowerCase() === lower || n.id.toLowerCase().endsWith(`::${lower}`),
  );
}

function byId(graph: Graph): Map<string, GraphNode> {
  return new Map(graph.nodes.map((n) => [n.id, n]));
}

/** Is the incoming edge just "the file that declares me"? That is not a dependent. */
function isContainerEdge(edge: GraphEdge, source: GraphNode | undefined): boolean {
  return edge.kind === 'contains' && source?.kind === 'file';
}

/** Node neighborhood: what it uses (outgoing) and who uses it (incoming), without
 * the file->symbol edge noise in the incoming set. */
export function neighbors(graph: Graph, q: string): NeighborsResult | undefined {
  const matches = findNodes(graph, q);
  const node = matches[0];
  if (!node) return undefined;
  const nodes = byId(graph);
  const outgoing: Relation[] = [];
  const incoming: Relation[] = [];
  for (const edge of graph.edges) {
    if (edge.from === node.id) {
      const target = nodes.get(edge.to);
      if (target) outgoing.push({ edge, node: target });
    } else if (edge.to === node.id) {
      const source = nodes.get(edge.from);
      if (source && !isContainerEdge(edge, source)) incoming.push({ edge, node: source });
    }
  }
  return { node, alternatives: matches.slice(1), outgoing, incoming };
}

/** Direct impact: who depends on the symbol (calls, uses, inherits, or implements it). */
export function impact(graph: Graph, q: string): ImpactResult | undefined {
  const matches = findNodes(graph, q);
  const node = matches[0];
  if (!node) return undefined;
  const nodes = byId(graph);
  const dependents: Relation[] = [];
  for (const edge of graph.edges) {
    if (edge.to === node.id && DEPENDENCY_KINDS.has(edge.kind)) {
      const source = nodes.get(edge.from);
      if (source) dependents.push({ edge, node: source });
    }
  }
  return { node, alternatives: matches.slice(1), dependents };
}

/** Shortest path (BFS, directed edges) between two symbols. */
export function shortestPath(graph: Graph, fromQ: string, toQ: string): GraphNode[] | undefined {
  const from = findNodes(graph, fromQ)[0];
  const to = findNodes(graph, toQ)[0];
  if (!from || !to) return undefined;

  const adj = new Map<string, string[]>();
  for (const e of graph.edges) {
    const list = adj.get(e.from) ?? [];
    list.push(e.to);
    adj.set(e.from, list);
  }
  const nodes = byId(graph);

  const prev = new Map<string, string>();
  const queue = [from.id];
  const seen = new Set([from.id]);
  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (cur === to.id) {
      const path: GraphNode[] = [];
      let at: string | undefined = cur;
      while (at) {
        const n = nodes.get(at);
        if (n) path.unshift(n);
        at = prev.get(at);
      }
      return path;
    }
    for (const next of adj.get(cur) ?? []) {
      if (!seen.has(next)) {
        seen.add(next);
        prev.set(next, cur);
        queue.push(next);
      }
    }
  }
  return undefined;
}
