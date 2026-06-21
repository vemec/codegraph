/**
 * Public API for programmatic use (scripts, integrations).
 * The CLI lives in cli.ts; this is for `import { buildGraph } from 'codegraph'`.
 */
export { buildGraph, type BuildResult } from './build.ts';
export { GraphBuilder, degrees } from './model/graph.ts';
export type {
  Graph,
  GraphNode,
  GraphEdge,
  GraphFragment,
  GraphMeta,
  NodeKind,
  EdgeKind,
  Confidence,
} from './model/types.ts';
export type { Connector } from './connectors/connector.ts';
export { allConnectors, applicableConnectors } from './connectors/registry.ts';
export { resolveSource, type ResolvedSource } from './sources/resolve.ts';
export {
  findNodes,
  impact,
  neighbors,
  shortestPath,
  type ImpactResult,
  type NeighborsResult,
  type Relation,
} from './query/query.ts';
export { toJson } from './outputs/json.ts';
export { toIndexMarkdown } from './outputs/index.ts';
export { toHtml } from './outputs/html.ts';
export { toMermaid } from './outputs/mermaid.ts';
