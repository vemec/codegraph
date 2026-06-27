import type {
  Graph,
  GraphEdge,
  GraphNode,
  EdgeKind,
  NodeKind,
} from '../model/types.js';

export interface Relation {
  edge: GraphEdge;
  node: GraphNode;
}

export interface NeighborsResult {
  node: GraphNode;
  /** Other matches with the same name (for disambiguation). */
  alternatives: Array<GraphNode>;
  outgoing: Array<Relation>;
  incoming: Array<Relation>;
}

export interface ImpactResult {
  node: GraphNode;
  alternatives: Array<GraphNode>;
  /** Who depends on this symbol (calls/uses/inherits/implements it). Without `contains`. */
  dependents: Array<Relation>;
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

/** Symbols a dev would delete/refactor. Excludes `file`/`external` (not symbols)
 *  and `method`: methods trigger too many false positives (React/Angular
 *  lifecycle, overrides, interface signatures) for a bulk listing. */
const DELETABLE_KINDS: ReadonlySet<NodeKind> = new Set<NodeKind>([
  'function',
  'class',
  'interface',
  'export',
]);

// ---------------------------------------------------------------------------
// Per-graph index — built once per Graph instance, cached via WeakMap so it's
// GC'd automatically when the graph is dropped from GraphStore.
// ---------------------------------------------------------------------------

type GraphIndex = {
  byId: Map<string, GraphNode>;
  outEdges: Map<string, Array<GraphEdge>>;
  inEdges: Map<string, Array<GraphEdge>>;
  /** DEPENDENCY_KINDS only: target id → dependents. Used by blastRadius. */
  revDepAdj: Map<string, Array<{ from: string; edge: GraphEdge }>>;
  /** Forward adjacency (all edges): from id → [to ids]. Used by shortestPath. */
  fwdAdj: Map<string, Array<string>>;
  /** Node ids that have at least one incoming DEPENDENCY_KINDS edge. Used by unused(). */
  hasDependent: Set<string>;
};

const indexCache = new WeakMap<Graph, GraphIndex>();

function getIndex(graph: Graph): GraphIndex {
  const cached = indexCache.get(graph);

  if (cached) {
    return cached;
  }

  const byId = new Map<string, GraphNode>(graph.nodes.map((n) => [n.id, n]));
  const outEdges = new Map<string, Array<GraphEdge>>();
  const inEdges = new Map<string, Array<GraphEdge>>();
  const revDepAdj = new Map<string, Array<{ from: string; edge: GraphEdge }>>();
  const fwdAdj = new Map<string, Array<string>>();
  const hasDependent = new Set<string>();

  for (const e of graph.edges) {
    (outEdges.get(e.from) ?? outEdges.set(e.from, []).get(e.from)!).push(e);
    (inEdges.get(e.to) ?? inEdges.set(e.to, []).get(e.to)!).push(e);
    (fwdAdj.get(e.from) ?? fwdAdj.set(e.from, []).get(e.from)!).push(e.to);

    if (DEPENDENCY_KINDS.has(e.kind)) {
      (revDepAdj.get(e.to) ?? revDepAdj.set(e.to, []).get(e.to)!).push({
        from: e.from,
        edge: e,
      });
      hasDependent.add(e.to);
    }
  }

  const idx: GraphIndex = {
    byId,
    outEdges,
    inEdges,
    revDepAdj,
    fwdAdj,
    hasDependent,
  };

  indexCache.set(graph, idx);

  return idx;
}

// ---------------------------------------------------------------------------
// Public query API
// ---------------------------------------------------------------------------

/** Is the incoming edge just "the file that declares me"? That's not a dependent. */
function isContainerEdge(
  edge: GraphEdge,
  source: GraphNode | undefined,
): boolean {
  return edge.kind === 'contains' && source?.kind === 'file';
}

/** Resolves a text query to nodes: by exact id (O(1) via cached index), or by name/suffix. */
export function findNodes(graph: Graph, q: string): Array<GraphNode> {
  const { byId } = getIndex(graph);
  const exact = byId.get(q);

  if (exact) {
    return [exact];
  }

  const lower = q.toLowerCase();

  return graph.nodes.filter(
    (n) =>
      n.name.toLowerCase() === lower ||
      n.id.toLowerCase().endsWith(`::${lower}`),
  );
}

/** Symbols with NO incoming dependent in the graph: dead-code candidates.
 *  NOTE — "no dependents here" ≠ "deletable": it may be a public API consumed outside
 *  the repo, an entry point (e.g. a default export the router mounts dynamically),
 *  or used dynamically. And tests are excluded from the graph by default, so
 *  something used ONLY in tests also shows up here. It's a starting point, not a verdict. */
export function unused(graph: Graph): Array<GraphNode> {
  const { hasDependent } = getIndex(graph);

  return graph.nodes
    .filter((n) => DELETABLE_KINDS.has(n.kind) && !hasDependent.has(n.id))
    .sort((a, b) =>
      a.file !== b.file ? a.file.localeCompare(b.file) : a.line - b.line,
    );
}

/** Neighborhood of a node: what it uses (outgoing) and who uses it (incoming), without
 *  the noise of the file→symbol edge in the incoming ones. */
export function neighbors(
  graph: Graph,
  q: string,
): NeighborsResult | undefined {
  const matches = findNodes(graph, q);
  const node = matches[0];

  if (!node) {
    return undefined;
  }

  const { byId, outEdges, inEdges } = getIndex(graph);

  const outgoing: Array<Relation> = [];

  for (const e of outEdges.get(node.id) ?? []) {
    const target = byId.get(e.to);

    if (target) {
      outgoing.push({ edge: e, node: target });
    }
  }

  const incoming: Array<Relation> = [];

  for (const e of inEdges.get(node.id) ?? []) {
    const source = byId.get(e.from);

    if (source && !isContainerEdge(e, source)) {
      incoming.push({ edge: e, node: source });
    }
  }

  return { node, alternatives: matches.slice(1), outgoing, incoming };
}

/** Direct impact: who depends on the symbol (calls, uses, inherits or implements it). */
export function impact(graph: Graph, q: string): ImpactResult | undefined {
  const matches = findNodes(graph, q);
  const node = matches[0];

  if (!node) {
    return undefined;
  }

  const { byId, inEdges } = getIndex(graph);

  const dependents: Array<Relation> = [];

  for (const e of inEdges.get(node.id) ?? []) {
    if (DEPENDENCY_KINDS.has(e.kind)) {
      const source = byId.get(e.from);

      if (source) {
        dependents.push({ edge: e, node: source });
      }
    }
  }

  return { node, alternatives: matches.slice(1), dependents };
}

export interface ImpactSummary {
  total: number;
  /** How many dependents are exported — i.e. the change can propagate outside the repo. */
  exported: number;
  /** Dependents grouped by their module, most-affected module first. */
  byModule: Array<{ module: string; relations: Array<Relation> }>;
}

/** Turns a flat dependent list into a risk summary: total, how many cross the public-API
 *  boundary (exported), and which modules are touched — what a reader needs to judge a
 *  change without scanning a long flat list. */
export function summarizeImpact(dependents: Array<Relation>): ImpactSummary {
  const groups = new Map<string, Array<Relation>>();

  for (const d of dependents) {
    (
      groups.get(d.node.module) ??
      groups.set(d.node.module, []).get(d.node.module)!
    ).push(d);
  }

  const byModule = Array.from(groups.entries(), ([module, relations]) => ({
    module,
    relations,
  })).sort(
    (a, b) =>
      b.relations.length - a.relations.length ||
      a.module.localeCompare(b.module),
  );

  return {
    total: dependents.length,
    exported: dependents.filter((d) => d.node.exported).length,
    byModule,
  };
}

export interface ReachedNode {
  node: GraphNode;
  /** Hops from the queried symbol: 1 = direct dependent, 2 = depends on a direct dependent, … */
  distance: number;
  /** The edge by which this node was first reached (its `from` is this node). */
  via: GraphEdge;
}

export interface BlastRadiusResult {
  node: GraphNode;
  alternatives: Array<GraphNode>;
  /** All transitive dependents, shortest-distance-first then by name. */
  reached: Array<ReachedNode>;
  maxDepth: number;
}

/**
 * Transitive impact ("blast radius"): everything that depends on a symbol,
 * directly OR through a chain of dependencies, up to `depth` hops. BFS over the
 * reverse dependency graph, so each node's `distance` is its minimum hop count.
 */
export function blastRadius(
  graph: Graph,
  q: string,
  depth = Infinity,
): BlastRadiusResult | undefined {
  const matches = findNodes(graph, q);
  const node = matches[0];

  if (!node) {
    return undefined;
  }

  const { byId, revDepAdj } = getIndex(graph);

  const reached: Array<ReachedNode> = [];
  const seen = new Set<string>([node.id]);

  let frontier = [node.id];
  let maxDepth = 0;

  for (let dist = 1; frontier.length > 0 && dist <= depth; dist += 1) {
    const next: Array<string> = [];

    for (const id of frontier) {
      for (const { from, edge } of revDepAdj.get(id) ?? []) {
        const n = !seen.has(from) ? byId.get(from) : undefined;

        if (n) {
          seen.add(from);
          reached.push({ node: n, distance: dist, via: edge });
          next.push(from);
          maxDepth = dist;
        }
      }
    }

    frontier = next;
  }

  reached.sort((a, b) =>
    a.distance !== b.distance
      ? a.distance - b.distance
      : a.node.name.localeCompare(b.node.name),
  );

  return { node, alternatives: matches.slice(1), reached, maxDepth };
}

/** Shortest path (BFS, directed edges) between two symbols. */
export function shortestPath(
  graph: Graph,
  fromQ: string,
  toQ: string,
): Array<GraphNode> | undefined {
  const from = findNodes(graph, fromQ)[0];
  const to = findNodes(graph, toQ)[0];

  if (!from || !to) {
    return undefined;
  }

  const { byId, fwdAdj } = getIndex(graph);

  const prev = new Map<string, string>();
  const queue = [from.id];
  const seen = new Set([from.id]);

  let head = 0;

  while (head < queue.length) {
    const cur = queue[head]!;

    head += 1;

    if (cur === to.id) {
      const path: Array<GraphNode> = [];

      let at: string | undefined = cur;

      while (at) {
        const n = byId.get(at);

        if (n) {
          path.unshift(n);
        }

        at = prev.get(at);
      }

      return path;
    }

    for (const next of fwdAdj.get(cur) ?? []) {
      if (!seen.has(next)) {
        seen.add(next);
        prev.set(next, cur);
        queue.push(next);
      }
    }
  }

  return undefined;
}
