#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { buildGraph } from './build.ts';
import type { Graph } from './model/types.ts';
import { toHtml } from './outputs/html.ts';
import { toIndexMarkdown } from './outputs/index.ts';
import { toJson } from './outputs/json.ts';
import { toMermaid } from './outputs/mermaid.ts';
import { findNodes, impact, neighbors, shortestPath, type Relation } from './query/query.ts';

function flag(args: string[], name: string, fallback?: string): string | undefined {
  const i = args.indexOf(name);
  if (i < 0) return fallback;
  const value = args[i + 1];
  // Flag present but missing a value (last token or another flag right after it):
  // likely a typo, so warn instead of silently falling back.
  if (value === undefined || value.startsWith('--')) {
    process.stderr.write(`⚠ ${name} received no value; using the default${fallback !== undefined ? ` (${fallback})` : ''}.\n`);
    return fallback;
  }
  return value;
}
function hasFlag(args: string[], name: string): boolean {
  return args.includes(name);
}
/** Positive integer from a flag, with a fallback if it is missing or invalid. */
function intFlag(args: string[], name: string, fallback: number): number {
  const raw = flag(args, name);
  if (raw === undefined) return fallback;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

function loadGraph(file: string): Graph {
  let raw: string;
  try {
    raw = fs.readFileSync(file, 'utf8');
  } catch {
    throw new Error(`Could not read the graph in "${file}". Did you run \`codegraph <source> --out\` first?`);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`The graph in "${file}" is not valid JSON (was it left half-written?). Regenerate it.`);
  }
  const g = parsed as Partial<Graph>;
  if (!g || !Array.isArray(g.nodes) || !Array.isArray(g.edges)) {
    throw new Error(`The file "${file}" does not look like a graph (missing nodes/edges). Is this the right graph.json?`);
  }
  return parsed as Graph;
}

const USAGE = `codegraph - code knowledge graph

Usage:
  codegraph <source> [options]           Build graph (local path | GitHub URL | org/repo)
    --out <dir>          Output directory (default ./graph)
    --ignore a,b,c       Extra dirs to ignore (in addition to the defaults)
    --include-tests      Include tests and mocks (excluded by default)
    --top <n>            Top nodes in the index (default 15)
  codegraph query <graph.json> impact <symbol>        Who depends on X (what breaks if I touch it?)
  codegraph query <graph.json> neighbors <symbol>     What X uses and who uses X
  codegraph query <graph.json> path <A> <B>            Shortest path between two symbols
  codegraph mermaid <graph.json> <symbol> [--depth 2] Focused subgraph (Mermaid)

  Queries accept --json for parseable output.
  If a name matches multiple symbols, use the exact id: "path/to/file.ts::name".
`;

async function cmdBuild(source: string, args: string[]): Promise<void> {
  const out = path.resolve(flag(args, '--out', './graph')!);
  const ignore = flag(args, '--ignore')?.split(',').map((s) => s.trim()).filter(Boolean);
  const includeTests = hasFlag(args, '--include-tests');
  const top = intFlag(args, '--top', 15);
  fs.mkdirSync(out, { recursive: true });
  process.stderr.write(`Analyzing ${source} ...\n`);
  const { graph, ran } = await buildGraph(source, { ignore, includeTests });
  fs.writeFileSync(path.join(out, 'graph.json'), toJson(graph));
  fs.writeFileSync(path.join(out, 'GRAPH_INDEX.md'), toIndexMarkdown(graph, top));
  fs.writeFileSync(path.join(out, 'graph.html'), toHtml(graph));
  for (const r of ran) process.stderr.write(`  ${r.connector}: ${r.files} files\n`);
  process.stderr.write(
    `\nOK · ${graph.meta.counts.nodes} nodes · ${graph.meta.counts.edges} edges -> ${out}\n` +
      `  graph.json · GRAPH_INDEX.md · graph.html\n`,
  );
}

/** Relations sorted by edge kind and then name, for stable output. */
function sortRelations(rels: Relation[]): Relation[] {
  return [...rels].sort((a, b) =>
    a.edge.kind !== b.edge.kind ? a.edge.kind.localeCompare(b.edge.kind) : a.node.name.localeCompare(b.node.name),
  );
}
function altsLine(alternatives: { id: string }[]): string {
  if (alternatives.length === 0) return '';
  const ids = alternatives.map((a) => a.id).join(', ');
  return `⚠ ${alternatives.length} more symbol(s) share that name: ${ids}\n  (use the exact id to disambiguate)\n\n`;
}

function cmdQuery(args: string[]): void {
  const json = args.includes('--json');
  const rest = args.filter((a) => a !== '--json');
  const [file, sub, ...params] = rest;
  if (!file || !sub) throw new Error(USAGE);
  const graph = loadGraph(file);

  if (sub === 'impact') {
    const res = impact(graph, params[0] ?? '');
    if (!res) return void process.stderr.write(`Not found: ${params[0]}\n`);
    if (json) return void process.stdout.write(JSON.stringify(res, null, 2) + '\n');
    process.stdout.write(`# Impact of changing \`${res.node.name}\` (${res.node.kind}) - ${res.node.file}:${res.node.line}\n\n`);
    process.stdout.write(altsLine(res.alternatives));
    process.stdout.write(`${res.dependents.length} direct dependent(s):\n`);
    for (const d of sortRelations(res.dependents)) {
      process.stdout.write(`  ${d.edge.kind.padEnd(11)} ${d.node.name} (${d.node.file}:${d.node.line})\n`);
    }
  } else if (sub === 'neighbors') {
    const res = neighbors(graph, params[0] ?? '');
    if (!res) return void process.stderr.write(`Not found: ${params[0]}\n`);
    if (json) return void process.stdout.write(JSON.stringify(res, null, 2) + '\n');
    process.stdout.write(`# ${res.node.name} (${res.node.kind}) — ${res.node.file}:${res.node.line}\n\n`);
    process.stdout.write(altsLine(res.alternatives));
    process.stdout.write(`Uses (${res.outgoing.length}):\n`);
    for (const o of sortRelations(res.outgoing)) {
      process.stdout.write(`  ${o.edge.kind.padEnd(11)} ${o.node.name} (${o.node.file})\n`);
    }
    process.stdout.write(`\nUsed by (${res.incoming.length}):\n`);
    for (const i of sortRelations(res.incoming)) {
      process.stdout.write(`  ${i.edge.kind.padEnd(11)} ${i.node.name} (${i.node.file})\n`);
    }
  } else if (sub === 'path') {
    // Warn if either endpoint is ambiguous: shortestPath takes the first match
    // silently, and a repeated name could yield an unexpected symbol path.
    for (const q of [params[0], params[1]]) {
      const ms = findNodes(graph, q ?? '');
      if (ms.length > 1) {
        process.stderr.write(`⚠ "${q}" matches ${ms.length} symbols; using ${ms[0]!.id}. Use the exact id to disambiguate.\n`);
      }
    }
    const p = shortestPath(graph, params[0] ?? '', params[1] ?? '');
    if (!p) return void process.stderr.write(`No path between ${params[0]} and ${params[1]}\n`);
    if (json) return void process.stdout.write(JSON.stringify(p, null, 2) + '\n');
    process.stdout.write(p.map((n) => `${n.name} (${n.file})`).join('\n  ↓ ') + '\n');
  } else {
    throw new Error(USAGE);
  }
}

function cmdMermaid(args: string[]): void {
  const [file, symbol, ...rest] = args;
  if (!file || !symbol) throw new Error(USAGE);
  const depth = intFlag(rest, '--depth', 2);
  process.stdout.write(toMermaid(loadGraph(file), symbol, depth) + '\n');
}

async function main(): Promise<void> {
  const [cmd, ...args] = process.argv.slice(2);
  if (!cmd || cmd === '-h' || cmd === '--help') return void process.stdout.write(USAGE);
  if (cmd === 'query') return cmdQuery(args);
  if (cmd === 'mermaid') return cmdMermaid(args);
  await cmdBuild(cmd, args); // anything else is the source to analyze
}

main().catch((err) => {
  process.stderr.write(`Error: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
