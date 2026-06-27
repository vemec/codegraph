# Architecture

codegraph is a CLI + MCP server that analyzes a codebase and produces a language-agnostic **knowledge graph** of symbols and their relationships. An AI agent queries the graph to navigate code without grepping blindly.

## High-level flow

```
source (path / GitHub URL / org/repo)
  └─▶ sources/resolve.ts      resolve + list files
  └─▶ connectors/*            extract nodes + edges per language
  └─▶ model/graph.ts          merge fragments into a Graph
  └─▶ outputs/*               serialize (JSON, Markdown, HTML, Mermaid)
  └─▶ query/query.ts          answer questions (impact, neighbors, path, unused)
```

## Package layout

```
src/
  build.ts              orchestrator — wires sources → connectors → outputs
  cli.ts                entry point; command dispatch
  version.ts            single source of truth for the package version

  model/
    types.ts            Graph, GraphNode, GraphEdge, GraphMeta (language-agnostic)
    graph.ts            GraphBuilder — merges fragments, degree index, WeakMap cache
    modules.ts          module grouper (folder → module name)

  connectors/
    connector.ts        Connector interface (match / extract)
    registry.ts         list of active connectors
    typescript/         TypeScript + JSX via ts-morph
    json/               package.json dependency edges

  sources/
    resolve.ts          local path / GitHub URL / org-repo → file list
    frameworks.ts       detect Next.js, Express, etc. from package.json

  outputs/
    json.ts             graph.json serializer
    index.ts            GRAPH_INDEX.md generator
    html.ts             Graph Explorer HTML shell
    mermaid.ts          focused Mermaid subgraph
    stats.ts            instability, modules, edge counts
    explorer/           client-side Sigma.js code (bundled by esbuild, not tsc)

  query/
    query.ts            impact / blastRadius / neighbors / shortestPath / unused

  mcp/
    server.ts           MCP server (GraphStore, tool handlers, rootOf allowlist)

  util/
    open.ts             cross-platform browser launcher
```

## The graph model

Everything lives in `model/types.ts`. Two key invariants:

- **Node IDs are stable and unique:** `rel/path.ts` for file nodes, `rel/path.ts::SymbolName` for symbols, `rel/path.ts::ClassName.methodName` for methods.
- **The model is language-agnostic:** connectors map their native constructs to the normalized `NodeKind` / `EdgeKind` vocabulary. Raw detail lives in `nativeKind`.

## Connector interface

```ts
interface Connector {
  readonly name: string;   // 'typescript', 'package.json', ...
  readonly lang: string;   // 'ts', 'json', ...
  match(files: string[]): string[];                     // which files this connector owns
  extract(files, root, onProgress?, knownIds?): Promise<GraphFragment>;
}
```

The orchestrator (`build.ts`) calls `applicableConnectors(files)` → runs each connector in parallel → merges fragments with `GraphBuilder`.

## Incremental builds

`build.ts` keeps a `BuildCache` — a per-file map of `{ hash, nodes, edges }`. On each run:

1. Hash every file.
2. Files whose hash changed (or are new) go to the connector for re-extraction.
3. Files whose hash is unchanged reuse cached fragments, **unless** one of their dependents changed (reverse-dep invalidation keeps renames and deletions correct).
4. Merge fresh + reused fragments → new Graph.

## MCP server

`mcp/server.ts` wraps the graph as a long-running process. It holds a `GraphStore` (LRU Map, max 5 entries) keyed by absolute repo root. On each tool call:

1. `rootOf(args)` validates the `root` param against an **allowlist** (`process.cwd()`, `os.tmpdir()`, `CODEGRAPH_ALLOW_ROOTS`).
2. `GraphStore.get(root)` returns the cached graph or builds it (debounced, with in-flight coalescing so concurrent calls don't double-build).
3. The tool handler runs a query and returns sanitized Markdown.

## Graph Explorer

The visual explorer (`graph.html`) is a **single self-contained HTML** — Sigma.js + graphology + the client code bundled by `scripts/build-explorer.mjs` (esbuild, IIFE target) and inlined as a string constant. The HTML shell is assembled by `outputs/html.ts`. No CDN, no network required.
