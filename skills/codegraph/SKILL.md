---
name: codegraph
description: Find what code depends on what in a TS/JS repo without grepping blindly — which files to touch when changing something, whether it's safe to delete or refactor a symbol, who uses or renders a component, what implements an interface, how one module connects to another, or how to orient in an unfamiliar repo. Uses a code graph (calls, imports, inheritance, JSX render) resolved by the TypeScript type-checker, so relationships are exact, not name-guessed. If the `codegraph` MCP server is installed, use its tools (inspect_symbol, analyze_impact, trace_path, find_dead_code, survey_repo); otherwise the `codegraph` CLI gives the same answers from a graph.json.
---

# codegraph — navigate code by its relationship graph

You have a knowledge graph of the codebase: nodes (files, functions, classes,
interfaces, methods) and edges:

- `calls` — a symbol invokes another
- `renders` — a component uses another via JSX (`<Comp/>`)
- `imports` — a file imports from another (also covers `export ... from` re-exports, so barrels/index.ts aren't dead ends)
- `extends` / `implements` — class inheritance / interface implementation
- `references` — a value use that isn't a call: `new X`, a function/component passed
  **by reference** (callback/handler, e.g. `arr.map(save)` or `onClick={save}`), or an
  enum used as a value. Captured for **exported** symbols — so passing a handler around
  counts as a dependency, not just calling it.
- `contains` — a file declares a symbol

Resolved with the TypeScript type-checker (JSX and barrel/re-export resolution
included), so relationships are **exact**, not guessed by name.

## Golden rule

For **relationship** questions that span files — impact, who uses what, how
something flows — query the graph BEFORE grepping. Only grep or open files to
read the concrete contents of what the graph already pointed you to.

## Two ways to query (prefer the MCP tools)

If the **`codegraph` MCP server** is available, you'll see these tools — use them
directly (they target the current repo automatically and stay fresh on their own):

- **`inspect_symbol(query)`** — a symbol's location, what it uses, who uses it, AND its
  source inline. One call instead of grepping then opening the file. The default move.
- **`analyze_impact(symbol, depth?)`** — what breaks if you change it. `depth>1` = transitive
  blast radius (the whole chain, not just the first ring).
- **`survey_repo()`** — orient on an unfamiliar repo: stats + god nodes + modules.
- **`find_dead_code()`** — dead-code candidates (symbols with no dependents).
- **`trace_path(from, to)`** — how two symbols connect.
- **`open_explorer()`** — open the **visual** Graph Explorer in the human's browser.
  This is for the _person_, not for you: reach for it when they want to SEE the
  codebase's shape, modules and connections rather than read a text answer (e.g.
  "show me", "let me see the map", "open the graph"). You keep using the tools above
  for your own answers.

No MCP? Use the **CLI** against a `graph.json` (same answers) — see Commands below.

## Turning the tools on/off (when the user asks)

The MCP server can be toggled from the CLI, user-scoped, without removing the skill:

```
codegraph status     # is it enabled?
codegraph enable     # register the MCP in Claude Code
codegraph disable    # unregister it
```

Do this **only when the user explicitly asks** to turn the codegraph tools on or off —
it changes their Claude Code config, don't do it on your own initiative.
**Important — it takes effect on the next agent restart**: Claude Code loads MCP servers
at session start, so `enable` won't make the tools appear in the _current_ session. Tell
the user to restart the agent to pick them up; meanwhile, fall back to the `codegraph`
**CLI** for this session. If you _do_ have the tools available now, the server is already
enabled — no need to run `enable`.

## Before you trust it: locate the graph and check freshness

A stale graph gives fast, CONFIDENT, wrong answers — worse than none. Before using it:

1. **Locate it.** Look for `./graph/graph.json` and `./graph/GRAPH_INDEX.md` (or
   wherever the repo keeps them). If there's none, don't invent: either generate it
   (`codegraph . --out ./graph`) or fall back to grep for this task.
   Note: by default the graph **excludes tests and mocks** (`.spec`/`.test`,
   `__tests__`, etc.) — if a symbol that only lives in a test doesn't show up, that's why.
2. **Check freshness.** Read `meta.commit`, `meta.generatedAt`, and **`meta.dirty`**
   in `graph.json` (`GRAPH_INDEX.md` shows `⚠ working tree with uncommitted changes`
   when `dirty` is true). If `dirty` is true, or the repo changed since that commit
   (especially in the files you care about), the graph may be stale: regenerate it,
   or treat results as a hint and **verify specific edges** (by opening the file)
   before acting on anything irreversible.
3. **When in doubt, verify.** The graph tells you _where to look_; for a critical
   decision (deleting, changing a signature) confirm in the real file.

## When to use it (and when not)

The graph's value scales with how **spread out** the answer is:

- ✅ **Impact / dependencies at repo scale** ("what breaks if I touch X?", "who
  calls Y?", "is it safe to delete this?") → one query, no files opened.
- ✅ **React components** ("which screens render this component?", "what classes
  implement this interface?") → `impact` lists them via `renders` / `implements`.
- ✅ **Trace a flow** between two distant points in the code.
- ✅ **Orient in an unfamiliar repo** → read `GRAPH_INDEX.md` first (God nodes +
  modules) before opening anything.
- ⚠️ **Something scoped to a single file you already have open** → just open and
  read it; the graph adds overhead with no benefit.
- ❌ Reading a function body, strings, config, business logic → normal grep/Read.
  The graph is about relationships, not contents.

## Commands

The graph lives at `./graph/graph.json` (generated by `npm run graph` /
`codegraph . --out ./graph`). All queries accept `--json` for parseable output.

**Impact — "what breaks if I change this?"** (the headline use)

```
codegraph query ./graph/graph.json impact <symbol>
codegraph query ./graph/graph.json impact <symbol> --depth 3   # transitive blast radius
```

By default lists the real DIRECT dependents (who calls/uses/inherits/implements it),
without the file→symbol containment noise. Example output:

```
# Impact of changing MepBaseService (class) — services/MepBaseService.ts:18
2 direct dependent(s):
  calls       OperationService (services/operation/index.ts:10)
  extends     OperationService (services/operation/index.ts:10)
```

Add `--depth N` for the **transitive** blast radius: everything affected within N hops,
each tagged with its distance (`[1]` direct, `[2]` depends on a direct dependent, …).
Use it to gauge the full reach of a change, not just the first ring. For a component,
the dependents are the screens that render it (`renders` edges); for an interface, the
classes that implement it.

**Neighborhood — what X uses and who uses X**

```
codegraph query ./graph/graph.json neighbors <symbol>
```

"Usa" = outgoing (what it consumes). "Usado por" = incoming (who consumes it).

**Flow — shortest path between two symbols**

```
codegraph query ./graph/graph.json path <A> <B>
```

**Dead code — every symbol with no dependents (repo-wide)**

```
codegraph query ./graph/graph.json unused
```

The batch form of "is it safe to delete this?". Lists exported/internal symbols
that nothing in the repo calls, renders, references, extends, or implements.
**Read the caveat it prints**: "no dependents here" ≠ "deletable" — it also surfaces
the repo's public API (consumed from outside), entry points (e.g. a default export
the router mounts dynamically), and dynamic usage; tests are excluded from the graph,
so something used only in tests shows up here too. Use it to _find candidates_, then
confirm each in the real file before deleting. (Methods are omitted — lifecycle/override/
interface-signature methods are too noisy for a bulk list; use `impact <Class.method>` instead.)

**Focused diagram for a PR or to reason about**

```
codegraph mermaid ./graph/graph.json <symbol> --depth 2
```

**Show the human the visual map** (the Graph Explorer — for the person, not for you)

```
codegraph open ./graph          # opens ./graph/graph.html in the browser
codegraph . --out ./graph --open  # build and open in one step
```

Interactive, offline page: starts at the modules overview, expand a module to see its
symbols, click a symbol to reveal its neighbors, search to jump anywhere. Offer it when
the user wants to _see_ the structure rather than read an answer.

## Disambiguation

If a name matches several symbols (e.g. two `getTicket` in different files), the
query warns with a `⚠` and lists the ids. Re-query with the **exact id**
`path/to/file.ts::name` to target the one you want.

## Typical flow

`GRAPH_INDEX.md` to orient → `impact`/`neighbors`/`path` to narrow down to the
files that matter → open only those files. Fewer files read, fewer steps, fewer tokens.
