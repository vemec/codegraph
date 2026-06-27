/**
 * Public codegraph API for programmatic use (scripts, integrations).
 * The CLI lives in cli.ts; this is for `import { buildGraph } from 'codegraph'`.
 */
export {
  buildGraph,
  type BuildResult,
  type BuildEvent,
  type BuildOptions,
  type BuildCache,
} from './build.js';
export { GraphBuilder, degrees } from './model/graph.js';
export type {
  Graph,
  GraphNode,
  GraphEdge,
  GraphFragment,
  GraphMeta,
  NodeKind,
  EdgeKind,
  Confidence,
} from './model/types.js';
export type { Connector } from './connectors/connector.js';
export { allConnectors, applicableConnectors } from './connectors/registry.js';
export { resolveSource, type ResolvedSource } from './sources/resolve.js';
export {
  findNodes,
  impact,
  blastRadius,
  type BlastRadiusResult,
  type ReachedNode,
  neighbors,
  shortestPath,
  unused,
  type ImpactResult,
  type NeighborsResult,
  type Relation,
} from './query/query.js';
export { toJson } from './outputs/json.js';
export { toIndexMarkdown } from './outputs/index.js';
export { toHtml } from './outputs/html.js';
export { toMermaid } from './outputs/mermaid.js';
