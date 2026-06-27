# MCP tools reference

The codegraph MCP server exposes six tools. All tools accept an optional `root` parameter (defaults to `cwd`). The `root` must be under an **allowed directory** — by default `process.cwd()` or `os.tmpdir()`; add extra paths via the `CODEGRAPH_ALLOW_ROOTS` environment variable (colon-separated).

---

## `inspect_symbol`

Look up a symbol and get everything about it in one call.

**Parameters**

| Name    | Type     | Required | Description |
|---------|----------|----------|-------------|
| `query` | `string` | ✅       | Symbol name (`login`) or exact ID (`src/auth.ts::login`). |
| `root`  | `string` | —        | Repo path. Defaults to `cwd`. |

**Returns**

- Symbol location (`file:line`)
- Type-checker-resolved call signature
- What it uses (outgoing edges)
- Who uses it (incoming edges)
- Exact source code (4-space indented, injection-safe)
- Disambiguation note if multiple symbols match the name

**When to use**

Your default first move. Before grepping or opening files, call this to understand what a symbol is and how it connects.

---

## `analyze_impact`

Find what would break if you change a symbol.

**Parameters**

| Name     | Type     | Required | Description |
|----------|----------|----------|-------------|
| `symbol` | `string` | ✅       | Symbol name or exact ID. |
| `depth`  | `number` | —        | Hops to traverse. `1` = direct dependents (default). `>1` = transitive blast radius. |
| `root`   | `string` | —        | Repo path. |

**Returns**

- At `depth=1`: total dependents, how many are exported, grouped by module.
- At `depth>1`: every reachable node in the transitive blast radius, each tagged with its distance.

**When to use**

Before changing, refactoring, or deleting a symbol. Use `depth=1` to gauge the risk; use `depth=3` (or higher) to see the full downstream chain.

---

## `trace_path`

Find the shortest dependency path between two symbols.

**Parameters**

| Name   | Type     | Required | Description |
|--------|----------|----------|-------------|
| `from` | `string` | ✅       | Source symbol name or ID. |
| `to`   | `string` | ✅       | Target symbol name or ID. |
| `root` | `string` | —        | Repo path. |

**Returns**

The chain of symbols from `from` to `to` (each with its file), or a message if no path exists.

**When to use**

"How does component A end up calling service B?" — when you need to trace a data or call flow across layers.

---

## `find_dead_code`

List symbols with no dependents in the graph.

**Parameters**

| Name   | Type     | Required | Description |
|--------|----------|----------|-------------|
| `root` | `string` | —        | Repo path. |

**Returns**

All nodes (functions, classes, methods, exports) with zero incoming edges, with their kind, scope (exported / local), file, and line.

**Important:** "no dependents" ≠ "safe to delete". A symbol may be a public API consumed outside the repo, an entry point, or used dynamically. Verify before removing.

---

## `survey_repo`

Get a high-level map of the repo — orient before reading files.

**Parameters**

| Name   | Type     | Required | Description |
|--------|----------|----------|-------------|
| `root` | `string` | —        | Repo path. |

**Returns**

- Headline stats (nodes, edges, files, exported symbols, external deps)
- **God nodes**: the most-connected symbols (high impact, change carefully)
- **Architectural layers**: modules ranked by instability (`I = fan-out / (fan-in + fan-out)`)
- **Cross-module dependencies**: which modules depend on which
- Per-module symbol breakdown

**When to use**

First call in an unfamiliar repo, or when planning a refactor and needing to understand the module structure.

---

## `open_explorer`

Open the Graph Explorer in the browser for a visual overview.

**Parameters**

| Name   | Type     | Required | Description |
|--------|----------|----------|-------------|
| `root` | `string` | —        | Repo path. |

**Returns**

A confirmation that the browser was launched (or the path to open manually if it couldn't).

**What opens**

A self-contained HTML file with an interactive WebGL graph (Sigma.js). Modules appear as clusters; click a module to expand its symbols; click a symbol to see its neighbors; search to jump anywhere. Fully offline — no CDN.

---

## Security model

All tool responses sanitize metadata fields (symbol names, file paths, signatures) by stripping newlines before embedding them in Markdown. This prevents a crafted repository from injecting Markdown headings or agent instructions into tool responses via symbol names.

The `root` parameter is validated against an allowlist (not a blocklist) to prevent path-traversal attacks.
