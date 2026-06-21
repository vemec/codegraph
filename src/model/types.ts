/**
 * Core graph contract. It is language-agnostic: neither the core nor the
 * outputs know whether nodes come from TypeScript, Go, or anything else. Only
 * the connector layer translates a concrete language into this shared vocabulary.
 */

/** Normalized node vocabulary. Each connector maps its native constructs to
 * one of these (raw detail lives in `nativeKind`).
 * - `class` also covers Go `struct`.
 * - `external` is a symbol/module outside the repo (a dependency). */
export type NodeKind =
  | 'file'
  | 'function'
  | 'method'
  | 'class'
  | 'interface'
  | 'export'
  | 'external';

/** Normalized edge vocabulary, ordered from highest to lowest typical confidence. */
export type EdgeKind =
  | 'contains' // file declares symbol (exact)
  | 'imports' // file imports module/file (exact)
  | 'extends' // class inheritance (exact)
  | 'implements' // interface implementation (exact)
  | 'calls' // symbol invokes another symbol (exact if resolved)
  | 'renders' // component uses another via JSX <Comp/> (exact if resolved)
  | 'references'; // use/read of a symbol (exact if resolved)

/** Whether the edge was resolved by the toolchain or inferred. */
export type Confidence = 'exact' | 'inferred';

export interface GraphNode {
  /** Stable and unique: "rel/path.ts" for files, "rel/path.ts::symbol" for symbols. */
  id: string;
  kind: NodeKind;
  name: string;
  /** Path relative to the source root. For `external` this can be the module. */
  file: string;
  /** 1-based line where the declaration starts. 0 if not applicable. */
  line: number;
  /** Grouping key for coloring/clustering (folder/package). */
  module: string;
  /** Language of the connector that produced it: 'ts', 'go', ... */
  lang: string;
  exported: boolean;
  /** Raw native construct, optional: 'struct', 'arrow', 'method'... */
  nativeKind?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  kind: EdgeKind;
  confidence: Confidence;
}

export interface GraphMeta {
  /** How it was invoked: source path or URL. */
  source: string;
  /** SHA of the analyzed commit, if the source is a git repo. */
  commit?: string;
  /** true if the working tree had uncommitted changes when the graph was generated:
   * the graph reflects disk state, not `commit`, so commit-based freshness checks
   * are not reliable. undefined if the source is not a git repo. */
  dirty?: boolean;
  generatedAt: string;
  /** Languages present (one per connector that contributed nodes). */
  languages: string[];
  counts: { nodes: number; edges: number };
}

export interface Graph {
  meta: GraphMeta;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * What a connector returns: nodes and edges only. The orchestrator merges them
 * into the final graph and fills in the metadata.
 */
export interface GraphFragment {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
