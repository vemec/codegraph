# Changelog

## 0.2.1

- Fix `tsconfig.json`: add `rootDir: "./src"` so TypeScript outputs `lib/cli.js` at the correct path. Without this the compiled output went to `lib/src/cli.js`, breaking the `bin` entry and the global install.

## 0.2.0

### `analyze_diff` — diff impact as a first-class tool

New MCP tool and CLI subcommand that maps a git diff to graph impact. Given a commit
range (`base..head`, default `HEAD~1..HEAD`), it runs `git diff --name-only`, finds
the symbols in the changed files, and returns their dependents — the blast radius of a
PR or commit beyond the changed lines themselves.

- MCP: `analyze_diff(base?, head?, depth?)` — available in any git repo, no setup
- CLI: `codegraph query <graph.json> diff [--base <ref>] [--head <ref>] [--depth N]`

### `search_symbols` — semantic search, no API key

New MCP tool and CLI subcommand that finds symbols by what they **do**, not their exact
name. Uses `all-MiniLM-L6-v2` via `@huggingface/transformers` — runs fully offline,
no API key, model downloaded once and cached locally.

- MCP: `search_symbols(query, limit?)` — builds embeddings automatically on first call
- CLI: `codegraph query <graph.json> search "<free text>" [--limit N]`
  (build step: `codegraph . --with-embeddings`)
- Embeddings stored alongside the graph in `~/.cache/codegraph/<hash>/`

### SKILL.md rewrite

The codegraph skill was rewritten so agents use it proactively, without being asked:
- Frontmatter now captures "index / analyze / map / understand" triggers
- New "Reach for this proactively" section with concrete activation signals
- New "Keeping the graph fresh — when to regenerate" section with staleness signals
- MCP auto-build made explicit: tools build the graph on demand, no manual step needed
- `survey_repo` and `analyze_impact` descriptions updated to prompt proactive use

## 0.1.2

- Add `prepare` script so `lib/` is built automatically on `npm publish`.
- Default CLI output dir changed from `./graph` to `~/.cache/codegraph/<hash>/` — repos stay clean without needing a `.gitignore` entry. CLI and MCP now share the same cache directory for the same local repo.
- Complete `innersource.json` with real project metadata.

## 0.1.1

- Fix `repository.url` in `package.json` to use the canonical `git+https://` prefix
  (flagged by `npm pkg fix`).

## 0.1.0

First release. A code knowledge graph for TS/JS repos that an agent (or you) can query
for relationships — impact, who uses what, how things connect — instead of grepping
blindly. Relationships are resolved by the TypeScript type-checker, so they're exact.

### Graph & connectors

- **TS/JS connector** via ts-morph: relationships resolved by the type-checker (not
  name-guessed), including JSX `renders` and barrel / re-export resolution.
- **Node kinds**: file, function, class, interface, method, export, external.
  **Edge kinds**: `contains`, `imports`, `extends`, `implements`, `calls`, `renders`,
  `references` (by-value uses — callbacks/handlers passed without calling, `new X`,
  enums). Deterministic output, safe to diff/version.
- **`package.json` connector**: declared dependencies become external nodes with
  `imports` edges, so a dep that's installed but not yet imported in code still shows up.
- **Resolved call signatures** on functions/methods (`(a: string) => Promise<void>`),
  type-checker-accurate.
- **Pluggable connectors** — add a language by implementing the `Connector` contract.
- **Incremental rebuilds**: per-file content hashing + reverse-dependency invalidation;
  unchanged files reuse their cached fragment.

### Queries (all accept `--json`)

- **`impact`** — direct dependents summarized by risk: total, how many are exported
  (the change can leak outside the repo), grouped by module. `--depth N` for the
  transitive blast radius, each node tagged with its distance.
- **`neighbors`** — what a symbol uses and who uses it, plus its resolved signature.
- **`path`** — shortest dependency path between two symbols.
- **`unused`** — dead-code candidates (symbols with no dependents).
- **`mermaid`** — focused subgraph for a symbol.

### Survey (`GRAPH_INDEX.md`)

Read it to orient before opening files: headline stats, **god nodes** (most connected),
detected **frameworks** (Next.js, Express, NestJS…), **architectural layers** (modules
ranked by Robert Martin's instability, measured from the graph), **cross-module
dependencies** (directed coupling), and a per-module breakdown.

### MCP server (for agents)

- `codegraph mcp` exposes 6 tools — `inspect_symbol`, `analyze_impact`, `survey_repo`,
  `find_dead_code`, `trace_path`, `open_explorer`. Multi-repo: each targets the repo
  you're working in, graph built on demand and cached centrally (`~/.cache/codegraph/`)
  so repos stay clean. Built on the SDK's low-level API, stdio transport, lazy-loaded.
- `codegraph init` installs the skill + registers the MCP (user-scoped, idempotent);
  `enable` / `disable` / `status` toggle the server without touching the skill.

### Graph Explorer

- A single, fully **offline** HTML (Sigma/WebGL + graphology, no CDN). Progressive
  expandable mixed graph: start at the module overview, expand a module to reveal its
  symbols, expand a symbol to reveal its neighbors. Stable incremental layout (the node
  you click stays put), node dragging, hover/selection highlight with eased animation,
  blast-radius heat-map, edge-kind filters, **colour-by-architectural-layer** toggle,
  resolved signature in the info panel, `file:line` → editor links.
- `codegraph open [dir]` and `--open` on build pop it in the browser.

### CLI

- Coloured grouped help, synchronous progress bar, interactive mode, ASCII banner, and
  `codegraph --version`. `graph.json` is portable (no absolute paths) and deterministic;
  it's built on demand, not meant to be committed. Entire project is in English.
