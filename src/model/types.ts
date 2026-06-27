/**
 * Central graph contract. It is language-AGNOSTIC: neither the core nor the
 * outputs know whether the nodes come from TypeScript, Go or whatever. Only the
 * connectors layer translates a concrete language to this common vocabulary.
 */

/** NORMALIZED node vocabulary. Each connector maps its native constructs to one
 *  of these (the raw detail goes in `nativeKind`).
 *  - `class` also covers Go's `struct`.
 *  - `external` is a symbol/module from outside the repo (a dependency). */
export type NodeKind =
  | 'class'
  | 'export'
  | 'external'
  | 'file'
  | 'function'
  | 'interface'
  | 'method';

/** NORMALIZED edge vocabulary. */
export type EdgeKind =
  | 'calls' // symbol invokes another symbol (exact if it resolves)
  | 'contains' // file declares symbol  (exact)
  | 'extends' // class inheritance (exact)
  | 'implements' // interface implementation (exact)
  | 'imports' // file imports module/file (exact)
  | 'references' // use/read of a symbol (exact if it resolves)
  | 'renders'; // component uses another via JSX <Comp/> (exact if it resolves)

/** Whether the edge was resolved by the toolchain or is an inference. */
export type Confidence = 'exact' | 'inferred';

export interface GraphNode {
  /** Stable and unique: "rel/path.ts" for files, "rel/path.ts::symbol" for symbols. */
  id: string;
  kind: NodeKind;
  name: string;
  /** Path relative to the source root. For `external` it may be the module. */
  file: string;
  /** 1-based line where the declaration starts. 0 if not applicable. */
  line: number;
  /** 1-based line where the declaration ends. 0 if not applicable. Lets us pull the
   *  exact source of a symbol (e.g. the MCP `explore` tool). */
  endLine: number;
  /** Grouper for coloring/clustering (folder/package). */
  module: string;
  /** Language of the connector that produced it: 'ts', 'go', ... */
  lang: string;
  exported: boolean;
  /** Raw native construct, optional: 'struct', 'arrow', 'method'... */
  nativeKind?: string;
  /** Call signature resolved by the type-checker, for invocables (functions/methods):
   *  `(a: string) => Promise<void>`. Lets a consumer show how to call X without its body. */
  signature?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  kind: EdgeKind;
  confidence: Confidence;
}

export interface GraphMeta {
  /** How it was invoked: path or URL of the source. */
  source: string;
  /** Absolute local path of the analyzed repo, when the source is local. Lets the
   *  Graph Explorer build `file:line` → editor links. Omitted for remote sources
   *  (cloned into a temp dir that no longer exists). */
  root?: string;
  /** SHA of the analyzed commit, if the source is a git repo. */
  commit?: string;
  /** true if the working tree had uncommitted changes when the graph was generated:
   *  the graph reflects the disk, not `commit`, so the commit-based freshness
   *  check isn't reliable. undefined if the source isn't a git repo. */
  dirty?: boolean;
  generatedAt: string;
  /** Languages present (one per connector that contributed nodes). */
  languages: Array<string>;
  /** Frameworks detected from the root package.json dependencies (Next.js, Express…). */
  frameworks?: Array<string>;
  counts: { nodes: number; edges: number };
}

export interface Graph {
  meta: GraphMeta;
  nodes: Array<GraphNode>;
  edges: Array<GraphEdge>;
}

/**
 * What a connector returns: just nodes and edges. The orchestrator merges them
 * into the final graph and fills in the metadata.
 */
export interface GraphFragment {
  nodes: Array<GraphNode>;
  edges: Array<GraphEdge>;
}
