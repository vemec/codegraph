import type { Graph, GraphNode } from '../model/types.js';

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { buildGraph, type BuildCache } from '../build.js';
import { toHtml } from '../outputs/html.js';
import { toIndexMarkdown } from '../outputs/index.js';
import {
  blastRadius,
  diffImpact,
  impact,
  neighbors,
  shortestPath,
  summarizeImpact,
  unused,
} from '../query/query.js';
import { ensureEmbeddings, semanticSearch } from '../query/semantic.js';
import { getChangedFiles } from '../util/git-diff.js';
import { openInBrowser } from '../util/open.js';
import { VERSION } from '../version.js';

const REBUILD_DEBOUNCE_MS = 800; // skip re-hashing on bursts of calls
const MAX_SOURCE_LINES = 120;

/**
 * Holds one in-memory graph per repo root and keeps it fresh incrementally. The
 * MCP is multi-repo: each tool targets a `root` (defaults to the server's cwd =
 * the repo the agent is working in), and the graph is built on demand and cached
 * centrally (~/.cache/codegraph/<hash>) so repos are never polluted.
 */
export class GraphStore {
  private static readonly MAX_ENTRIES = 5;

  private entries = new Map<
    string,
    { graph: Graph; cache: BuildCache; built: number }
  >();

  private inFlight = new Map<string, Promise<Graph>>();

  cacheDir(absRoot: string): string {
    const id = createHash('sha256').update(absRoot).digest('hex').slice(0, 16);

    return path.join(os.homedir(), '.cache', 'codegraph', id);
  }

  private cacheFile(absRoot: string): string {
    return path.join(this.cacheDir(absRoot), 'cache.json');
  }

  /** Where the Graph Explorer HTML is written for a root (under the central cache,
   *  so the repo stays clean). */
  explorerFile(absRoot: string): string {
    return path.join(this.cacheDir(absRoot), 'graph.html');
  }

  private loadDiskCache(absRoot: string): BuildCache | undefined {
    try {
      return JSON.parse(
        fs.readFileSync(this.cacheFile(absRoot), 'utf8'),
      ) as BuildCache;
    } catch {
      return undefined;
    }
  }

  private saveDiskCache(absRoot: string, cache: BuildCache): void {
    try {
      const file = this.cacheFile(absRoot);

      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, JSON.stringify(cache));
    } catch {
      // best-effort: a missing cache just means a full rebuild next time
    }
  }

  async get(root: string): Promise<Graph> {
    const abs = path.resolve(root);
    const existing = this.entries.get(abs);

    if (existing && Date.now() - existing.built < REBUILD_DEBOUNCE_MS) {
      // Refresh LRU position on hit
      this.entries.delete(abs);
      this.entries.set(abs, existing);

      return existing.graph;
    }

    // Coalesce concurrent builds for the same root into one promise
    const flying = this.inFlight.get(abs);

    if (flying !== undefined) {
      return flying;
    }

    const prevCache = existing?.cache ?? this.loadDiskCache(abs);

    const promise = (async () => {
      try {
        const { graph, cache } = await buildGraph(abs, { cache: prevCache });

        // LRU eviction: drop the oldest entry when at capacity
        if (
          !this.entries.has(abs) &&
          this.entries.size >= GraphStore.MAX_ENTRIES
        ) {
          const oldest = this.entries.keys().next().value;

          if (oldest !== undefined) {
            this.entries.delete(oldest);
          }
        }

        this.entries.delete(abs);
        this.entries.set(abs, { graph, cache, built: Date.now() });
        this.saveDiskCache(abs, cache);

        return graph;
      } finally {
        this.inFlight.delete(abs);
      }
    })();

    this.inFlight.set(abs, promise);

    return promise;
  }
}

/**
 * Allowlist-based root validation. Only paths under an explicitly approved
 * base directory are accepted — a deny-list would be incomplete (can't enumerate
 * every sensitive path on every OS/user). Defaults to the server's cwd and the
 * OS temp directory (where the tool itself clones remote repos). Additional roots
 * can be added via CODEGRAPH_ALLOW_ROOTS (colon-separated absolute paths).
 */
function getAllowedRoots(): Array<string> {
  const extras =
    process.env.CODEGRAPH_ALLOW_ROOTS?.split(':')
      .filter(Boolean)
      .map((p) => path.resolve(p)) ?? [];

  return [process.cwd(), os.tmpdir(), ...extras];
}

function isUnder(parent: string, child: string): boolean {
  return child === parent || child.startsWith(`${parent}${path.sep}`);
}

function rootOf(args: Record<string, unknown>): string {
  const r = args.root;
  const resolved = path.resolve(
    typeof r === 'string' && r.trim() ? r : process.cwd(),
  );

  const allowed = getAllowedRoots();

  if (!allowed.some((base) => isUnder(base, resolved))) {
    throw new Error(
      `Root path "${resolved}" is outside the allowed directories. ` +
        `Allowed: ${allowed.join(', ')}. ` +
        `Add extra roots via CODEGRAPH_ALLOW_ROOTS (colon-separated).`,
    );
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isDirectory()) {
    throw new Error(`Root path is not a valid directory: ${resolved}`);
  }

  return resolved;
}

/** Strips newlines and other line-break characters from a metadata field so
 *  that a crafted repository cannot inject Markdown headings or agent
 *  instructions into tool responses via symbol names, file paths, or signatures. */
function safeMeta(s: string): string {
  return s
    .replace(/[\r\n\u0085\u2028\u2029]/g, ' ')
    .replace(/  +/g, ' ')
    .trim();
}

function alternativesNote(matches: Array<GraphNode>): string {
  if (matches.length <= 1) {
    return '';
  }

  return `\n⚠ ${matches.length - 1} more symbol(s) with that name — use the exact id to disambiguate:\n${matches
    .slice(1)
    .map((m) => `  ${safeMeta(m.id)}`)
    .join('\n')}\n`;
}

/** The exact source of a symbol, sliced from its file by [line, endLine]. */
export function sourceOf(absRoot: string, node: GraphNode): string {
  if (!node.line) {
    return '';
  }

  try {
    const lines = fs
      .readFileSync(path.join(absRoot, node.file), 'utf8')
      .split('\n');
    const end = Math.min(
      node.endLine || node.line,
      node.line + MAX_SOURCE_LINES - 1,
    );
    const slice = lines.slice(node.line - 1, end).join('\n');
    const truncated =
      (node.endLine || node.line) > end ? '\n… (truncated)' : '';

    return slice + truncated;
  } catch {
    return '';
  }
}

const TOOLS = [
  {
    name: 'inspect_symbol',
    description:
      "Look up a symbol (or file) in this repo and get, in ONE call, what you'd otherwise grep and open " +
      'files for: its exact location, its resolved call signature (type-checker-accurate params + return ' +
      'type, for functions/methods), what it uses, who uses it, and its source code inline. Relationships ' +
      'are resolved by the TypeScript type-checker, so they are exact — not guessed by name. Your DEFAULT ' +
      "first move to understand 'what is X', 'how do I call X', 'how does X connect', 'show me X and what " +
      "touches it' — before reaching for grep. " +
      'The graph is built automatically on first call and cached — no manual build step needed.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Symbol name, or exact id "path/file.ts::name".',
        },
        root: {
          type: 'string',
          description:
            'Repo path to analyze. Defaults to the current working directory.',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'analyze_impact',
    description:
      'Before you change, refactor or delete a symbol, find out what would BREAK: its dependents — the ' +
      'callers, users, subclasses, interface implementers and JSX renderers that depend on it. depth=1 ' +
      '(default) summarizes the risk: how many dependents, how many are exported (the change can leak ' +
      'outside the repo), grouped by module; depth>1 returns the transitive blast radius (the whole ' +
      "downstream chain, each tagged with its distance). Use it to gauge a change's reach. " +
      'Call this PROACTIVELY before any refactor — do not skip it to save a tool call. ' +
      'To understand a symbol (not assess a change), use inspect_symbol instead.',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: 'Symbol name or exact id.' },
        depth: {
          type: 'number',
          description:
            'Hops to traverse. 1 = direct dependents (default); >1 = transitive.',
        },
        root: { type: 'string', description: 'Repo path. Defaults to cwd.' },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'trace_path',
    description:
      'Trace how two symbols are connected: the shortest dependency chain from one to the other through the ' +
      "graph. Use for 'how does A reach/use B', 'is there a link between these two', 'trace the flow between " +
      "X and Y'.",
    inputSchema: {
      type: 'object',
      properties: {
        from: {
          type: 'string',
          description: 'Start symbol (name or exact id).',
        },
        to: { type: 'string', description: 'End symbol (name or exact id).' },
        root: { type: 'string', description: 'Repo path. Defaults to cwd.' },
      },
      required: ['from', 'to'],
    },
  },
  {
    name: 'find_dead_code',
    description:
      'List symbols with no dependents in the graph — dead-code candidates — to answer "is this dead / safe ' +
      'to remove" at repo scale. Caveat: "no dependents" ≠ "safe to delete": it may be public API, an entry ' +
      'point, or used dynamically; tests are excluded from the graph. Verify in the file before deleting.',
    inputSchema: {
      type: 'object',
      properties: {
        root: { type: 'string', description: 'Repo path. Defaults to cwd.' },
      },
    },
  },
  {
    name: 'survey_repo',
    description:
      'Index and orient in a repo: builds the code graph automatically (incremental, cached in ' +
      '~/.cache/codegraph/ — the repo stays clean), then returns headline stats (files, symbols, edges, ' +
      "dead exports…), the most-connected 'god nodes' (touching them has wide impact), and the per-module " +
      "breakdown. Use this as the FIRST call whenever the user asks to 'index', 'analyze', 'map', or " +
      "'understand' a codebase, or before opening any files in an unfamiliar repo. " +
      'On subsequent calls the graph is rebuilt incrementally (only changed files re-extracted).',
    inputSchema: {
      type: 'object',
      properties: {
        root: { type: 'string', description: 'Repo path. Defaults to cwd.' },
      },
    },
  },
  {
    name: 'search_symbols',
    description:
      'Semantic similarity search: find symbols by meaning, not exact name. Use when you know ' +
      'what something DOES but not what it\'s CALLED — e.g. "error handling middleware", ' +
      '"rate limiting logic", "payment validation". Returns the top matches ranked by ' +
      'similarity. Requires embeddings to be built first (run: `codegraph <source> ' +
      '--with-embeddings`). If not available, the tool will build them on first call (one-time cost).',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'Free-text description of what you\'re looking for (e.g. "JWT token validation").',
        },
        limit: {
          type: 'number',
          description: 'Max results to return (default: 10).',
        },
        root: {
          type: 'string',
          description: 'Repo path. Defaults to cwd.',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'analyze_diff',
    description:
      'Given a git commit range, identify which symbols changed and what that impacts — ' +
      'the blast radius of a PR or commit beyond the changed lines themselves. ' +
      'Runs `git diff --name-only base..head`, maps changed files to graph nodes, and ' +
      'returns the affected symbols plus their dependents. Default range is HEAD~1..HEAD (last commit). ' +
      'depth=1 (default) gives direct dependents; depth>1 gives the transitive chain. ' +
      'Use proactively when reviewing or about to merge a PR, or after a commit to understand its reach. ' +
      'Requires the repo to be a git repository.',
    inputSchema: {
      type: 'object',
      properties: {
        base: {
          type: 'string',
          description: 'Base git ref (default: HEAD~1).',
        },
        head: {
          type: 'string',
          description: 'Head git ref (default: HEAD).',
        },
        depth: {
          type: 'number',
          description:
            'Hops for transitive impact. 1 = direct dependents (default); >1 = transitive.',
        },
        root: {
          type: 'string',
          description: 'Repo path. Defaults to cwd.',
        },
      },
    },
  },
  {
    name: 'open_explorer',
    description:
      "Open the Graph Explorer — the visual, interactive map of this repo's code graph — in the HUMAN's " +
      'web browser (it runs on their machine). This is for the person, not for you: use it when the user ' +
      'wants to SEE the shape of the codebase, the modules and how things connect, rather than read a text ' +
      'answer. It builds the graph if needed and pops the page open. You keep using the other tools for answers.',
    inputSchema: {
      type: 'object',
      properties: {
        root: {
          type: 'string',
          description: 'Repo path to visualize. Defaults to cwd.',
        },
      },
    },
  },
];

export function text(s: string): {
  content: Array<{ type: 'text'; text: string }>;
} {
  return { content: [{ type: 'text', text: s }] };
}

type ToolContext = {
  graph: Graph;
  absRoot: string;
  freshness: string;
  args: Record<string, unknown>;
  store: GraphStore;
};

const toolHandlers: Record<
  string,
  (ctx: ToolContext) => string | Promise<string>
> = {
  inspect_symbol({ graph, absRoot, freshness, args }) {
    const query = String(args.query ?? '');
    const res = neighbors(graph, query);

    if (!res) {
      return `No symbol found for "${query}" in ${absRoot}.`;
    }

    const n = res.node;
    const uses =
      res.outgoing
        .map(
          (o) =>
            `  ${o.edge.kind.padEnd(11)} ${safeMeta(o.node.name)} (${safeMeta(o.node.file)})`,
        )
        .join('\n') || '  (none)';
    const usedBy =
      res.incoming
        .map(
          (i) =>
            `  ${i.edge.kind.padEnd(11)} ${safeMeta(i.node.name)} (${safeMeta(i.node.file)}:${i.node.line})`,
        )
        .join('\n') || '  (none)';
    const src = sourceOf(absRoot, n);
    // Use 4-space indented block (not a fenced block) so source content containing
    // triple-backtick runs cannot break out of the code section and inject
    // arbitrary Markdown/instructions into the agent's context.
    const srcBlock = src
      ? `\n\nSource (${safeMeta(n.file)}:${n.line}):\n\n${src
          .split('\n')
          .map((l) => `    ${l}`)
          .join('\n')}`
      : '';
    const sigBlock = n.signature
      ? `\nSignature: ${safeMeta(n.signature)}\n`
      : '';

    return (
      `# ${safeMeta(n.name)} (${safeMeta(n.kind)}) — ${safeMeta(n.file)}:${n.line}${alternativesNote([n, ...res.alternatives])}\n${
        sigBlock
      }\nUses (${res.outgoing.length}):\n${uses}\n` +
      `\nUsed by (${res.incoming.length}):\n${usedBy}${srcBlock}${freshness}`
    );
  },

  analyze_impact({ graph, absRoot, freshness, args }) {
    const symbol = String(args.symbol ?? '');
    const depth =
      typeof args.depth === 'number' && args.depth > 1
        ? Math.floor(args.depth)
        : 1;

    if (depth > 1) {
      const res = blastRadius(graph, symbol, depth);

      if (!res) {
        return `No symbol found for "${symbol}" in ${absRoot}.`;
      }

      const rows =
        res.reached
          .map(
            (r) =>
              `  [${r.distance}] ${r.via.kind.padEnd(11)} ${safeMeta(r.node.name)} (${safeMeta(r.node.file)}:${r.node.line})`,
          )
          .join('\n') || '  (none)';

      return `# Blast radius of ${safeMeta(res.node.name)} (${safeMeta(res.node.kind)}) — depth ${depth}${alternativesNote([res.node, ...res.alternatives])}\n\n${res.reached.length} affected across ${res.maxDepth} level(s):\n${rows}${freshness}`;
    }

    const res = impact(graph, symbol);

    if (!res) {
      return `No symbol found for "${symbol}" in ${absRoot}.`;
    }

    if (res.dependents.length === 0) {
      return `# Impact of changing ${safeMeta(res.node.name)} (${safeMeta(res.node.kind)}) — ${safeMeta(res.node.file)}:${res.node.line}${alternativesNote([res.node, ...res.alternatives])}\n\nNo direct dependents in the graph (dead code, public API consumed outside the repo, or used dynamically — verify before assuming it's safe to delete).${freshness}`;
    }

    const sum = summarizeImpact(res.dependents);
    const groups = sum.byModule
      .map((g) => {
        const rows = g.relations
          .map(
            (d) =>
              `    ${d.edge.kind.padEnd(11)} ${safeMeta(d.node.name)}${d.node.exported ? ' [exported]' : ''} (${safeMeta(d.node.file)}:${d.node.line})`,
          )
          .join('\n');

        return `  ${safeMeta(g.module)} (${g.relations.length}):\n${rows}`;
      })
      .join('\n');
    const headline = `${sum.total} direct dependent(s) · ${sum.exported} exported (public API) · across ${sum.byModule.length} module(s)`;

    return `# Impact of changing ${safeMeta(res.node.name)} (${safeMeta(res.node.kind)}) — ${safeMeta(res.node.file)}:${res.node.line}${alternativesNote([res.node, ...res.alternatives])}\n\n${headline}\n${groups}${freshness}`;
  },

  survey_repo({ graph, freshness }) {
    return toIndexMarkdown(graph) + freshness;
  },

  find_dead_code({ graph, freshness }) {
    const res = unused(graph);
    const rows =
      res
        .map(
          (n) =>
            `  ${safeMeta(n.kind).padEnd(10)} ${(n.exported ? 'export' : 'local').padEnd(6)} ${safeMeta(n.name)} (${safeMeta(n.file)}:${n.line})`,
        )
        .join('\n') || '  (none)';

    return `# Symbols with no dependents (${res.length})\n⚠ "no dependents" ≠ "safe to delete": may be public API, an entry point or dynamic usage; tests are excluded.\n\n${rows}${freshness}`;
  },

  trace_path({ graph, absRoot, freshness, args }) {
    const from = String(args.from ?? '');
    const to = String(args.to ?? '');
    const route = shortestPath(graph, from, to);

    if (!route) {
      return `No path between "${from}" and "${to}" in ${absRoot}.`;
    }

    return (
      route
        .map((n) => `${safeMeta(n.name)} (${safeMeta(n.file)})`)
        .join('\n  ↓ ') + freshness
    );
  },

  analyze_diff({ graph, absRoot, freshness, args }) {
    const base =
      typeof args.base === 'string' && args.base.trim() ? args.base : 'HEAD~1';
    const head =
      typeof args.head === 'string' && args.head.trim() ? args.head : 'HEAD';
    const depth =
      typeof args.depth === 'number' && args.depth > 1
        ? Math.floor(args.depth)
        : 1;

    const changedFiles = getChangedFiles(absRoot, base, head);

    if (changedFiles.length === 0) {
      return `No files changed between ${base} and ${head} in ${absRoot}.${freshness}`;
    }

    const res = diffImpact(graph, changedFiles, depth);

    const filesSection = changedFiles.map((f) => `  ${safeMeta(f)}`).join('\n');

    const symbolsSection =
      res.changedSymbols.length > 0
        ? res.changedSymbols
            .map(
              (n) =>
                `  ${safeMeta(n.kind).padEnd(10)} ${safeMeta(n.name)} (${safeMeta(n.file)}:${n.line})`,
            )
            .join('\n')
        : '  (no symbols from changed files found in graph)';

    const impactSection =
      res.impacted.length > 0
        ? res.impacted
            .map(
              (r) =>
                `  [${r.distance}] ${r.via.kind.padEnd(11)} ${safeMeta(r.node.name)}${r.node.exported ? ' [exported]' : ''} (${safeMeta(r.node.file)}:${r.node.line})`,
            )
            .join('\n')
        : '  (none)';

    return (
      `# Diff impact: ${safeMeta(base)}..${safeMeta(head)}\n\n` +
      `Changed files (${changedFiles.length}):\n${filesSection}\n\n` +
      `Changed symbols in graph (${res.changedSymbols.length}):\n${symbolsSection}\n\n` +
      `Impacted symbols (${res.impacted.length}) — depth ${depth}:\n${impactSection}${freshness}`
    );
  },

  async search_symbols({ graph, absRoot, freshness, args, store }) {
    const query = String(args.query ?? '');
    const limit =
      typeof args.limit === 'number' && args.limit > 0
        ? Math.floor(args.limit)
        : 10;
    const outDir = store.cacheDir(absRoot);

    await ensureEmbeddings(graph, outDir);

    const results = await semanticSearch(graph, query, outDir, limit);

    if (results.length === 0) {
      return `No semantic matches for "${query}" in ${absRoot}. The graph may have no embeddable symbols.${freshness}`;
    }

    const rows = results
      .map(
        (r) =>
          `  ${(r.score * 100).toFixed(1).padStart(5)}%  ${safeMeta(r.node.kind).padEnd(10)} ${safeMeta(r.node.name)}${r.node.signature ? `  ${safeMeta(r.node.signature)}` : ''} (${safeMeta(r.node.file)}:${r.node.line})`,
      )
      .join('\n');

    return `# Semantic search: "${query}" — top ${results.length} matches\n\n${rows}${freshness}`;
  },

  open_explorer({ graph, absRoot, freshness, store }) {
    const file = store.explorerFile(absRoot);

    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, toHtml(graph));

    const launched = openInBrowser(file);

    return launched
      ? `Opened the Graph Explorer in the browser for ${absRoot}.\nIf it didn't appear, open it manually: ${file}${freshness}`
      : `Couldn't launch a browser. Open the Graph Explorer manually: ${file}${freshness}`;
  },
};

export async function handleTool(
  store: GraphStore,
  name: string,
  args: Record<string, unknown>,
): Promise<string> {
  const root = rootOf(args);
  const absRoot = path.resolve(root);
  const graph = await store.get(root);
  const freshness = graph.meta.dirty
    ? '\n(note: working tree has uncommitted changes)\n'
    : '';

  const handler = toolHandlers[name];

  if (!handler) {
    return `Unknown tool: ${name}`;
  }

  return handler({ graph, absRoot, freshness, args, store });
}

export async function runMcpServer(): Promise<void> {
  // Name the long-lived process so it's identifiable in `ps`/Activity Monitor
  // (and killable with `pkill -f codegraph-mcp`) instead of a generic "node".
  process.title = 'codegraph-mcp';

  const server = new Server(
    { name: 'codegraph', version: VERSION },
    { capabilities: { tools: {} } },
  );
  const store = new GraphStore();

  server.setRequestHandler(ListToolsRequestSchema, () => ({
    tools: TOOLS,
  }));
  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const args = req.params.arguments ?? {};

    try {
      const out = await handleTool(store, req.params.name, args);

      return text(out);
    } catch (err) {
      return {
        ...text(`Error: ${err instanceof Error ? err.message : String(err)}`),
        isError: true,
      };
    }
  });

  const transport = new StdioServerTransport();

  await server.connect(transport);
}
