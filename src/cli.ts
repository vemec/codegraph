import type { Graph } from './model/types.js';

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as p from '@clack/prompts';
import chalk from 'chalk';

import { buildGraph, type BuildCache, type BuildEvent } from './build.js';
import { toHtml } from './outputs/html.js';
import { toIndexMarkdown } from './outputs/index.js';
import { toJson } from './outputs/json.js';
import { toMermaid } from './outputs/mermaid.js';
import { computeStats, edgeKindsByFreq } from './outputs/stats.js';
import {
  blastRadius,
  findNodes,
  impact,
  neighbors,
  shortestPath,
  summarizeImpact,
  unused,
  type Relation,
} from './query/query.js';
import { openInBrowser } from './util/open.js';
import { VERSION } from './version.js';

// We only show spinners/prompts/colors when there's a person at a terminal.
// An agent or CI (stdout redirected) gets plain logs on stderr and clean data on
// stdout — chalk disables colors when not a TTY, so nothing gets polluted.
const interactiveTerminal = process.stdout.isTTY && !process.env.CI;

export function flag(
  args: Array<string>,
  name: string,
  fallback?: string,
): string | undefined {
  const i = args.indexOf(name);

  if (i < 0) {
    return fallback;
  }

  const value = args[i + 1];

  // flag present but with no value (last token, or another flag right after):
  // likely a typo — we warn instead of silently falling back to the default.
  if (value === undefined || value.startsWith('--')) {
    process.stderr.write(
      `⚠ ${name} got no value; using the default${fallback === undefined ? '' : ` (${fallback})`}.\n`,
    );

    return fallback;
  }

  return value;
}

export function hasFlag(args: Array<string>, name: string): boolean {
  return args.includes(name);
}

/** Positive integer from a flag, with a fallback if missing or invalid. */
export function intFlag(
  args: Array<string>,
  name: string,
  fallback: number,
): number {
  const raw = flag(args, name);

  if (raw === undefined) {
    return fallback;
  }

  const n = Number(raw);

  return Number.isInteger(n) && n > 0 ? n : fallback;
}

export function loadGraph(file: string): Graph {
  let raw: string;

  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    raw = fs.readFileSync(file, 'utf8');
  } catch {
    throw new Error(
      `Could not read the graph at "${file}". Did you run \`codegraph <source> --out\` first?`,
    );
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(
      `The graph at "${file}" is not valid JSON (written halfway?). Regenerate it.`,
    );
  }

  const g = parsed as Partial<Graph>;

  if (!Array.isArray(g.nodes) || !Array.isArray(g.edges)) {
    throw new Error(
      `The file "${file}" doesn't look like a graph (missing nodes/edges). Is it the right graph.json?`,
    );
  }

  return parsed as Graph;
}

export function helpText(): string {
  const c = chalk;
  const cmd = (s: string) => c.cyan(s);
  const arg = (s: string) => c.yellow(s);
  const dim = (s: string) => c.dim(s);

  return `${c.bold.cyan('codegraph')} ${dim(`v${VERSION}`)} ${dim('— code knowledge graph for AI agents')}

${c.bold('GENERATE')}
  ${cmd('codegraph')} ${arg('<source>')} ${dim('[options]')}        Build the graph of a repo
    ${dim('<source>')}            local path · GitHub URL · ${arg('org/repo')} shorthand
    ${cmd('--out')} ${arg('<dir>')}          output folder ${dim('(default ./graph)')}
    ${cmd('--ignore')} ${arg('a,b,c')}       extra dirs to ignore ${dim('(on top of node_modules, dist…)')}
    ${cmd('--include-tests')}      include tests and mocks ${dim('(excluded by default)')}
    ${cmd('--no-cache')}           force a full rebuild ${dim('(ignore the incremental cache)')}
    ${cmd('--top')} ${arg('<n>')}            god nodes in the index ${dim('(default 15)')}
    ${cmd('--open')}               open the Graph Explorer in the browser when done

${c.bold('QUERY')} ${dim('(all accept --json for parseable output)')}
  ${cmd('codegraph query')} ${arg('<graph.json>')} ${cmd('impact')} ${arg('<symbol>')} ${dim('[--depth N]')}   what breaks if I change it? (transitive with --depth)
  ${cmd('codegraph query')} ${arg('<graph.json>')} ${cmd('neighbors')} ${arg('<symbol>')}   what X uses and who uses X
  ${cmd('codegraph query')} ${arg('<graph.json>')} ${cmd('path')} ${arg('<A> <B>')}          shortest path between two
  ${cmd('codegraph query')} ${arg('<graph.json>')} ${cmd('unused')}                symbols with no dependents

${c.bold('VISUALIZE')}
  ${cmd('codegraph open')} ${dim('[dir]')}                    open the Graph Explorer (graph.html) in the browser ${dim('(default ./graph)')}
  ${cmd('codegraph mermaid')} ${arg('<graph.json>')} ${arg('<symbol>')} ${dim('[--depth 2]')}   focused subgraph (Mermaid)

${c.bold('AGENT / MCP')}
  ${cmd('codegraph init')}                        install the skill + register the MCP (user-scoped)
  ${cmd('codegraph enable')} ${dim('/')} ${cmd('disable')}            turn the MCP server on/off (skill untouched)
  ${cmd('codegraph status')}                      is the MCP enabled?
  ${cmd('codegraph mcp')}                         run the MCP server (stdio) — used by your agent

${c.bold('EXAMPLES')}
  ${dim('$')} codegraph . --out ./graph
  ${dim('$')} codegraph query ./graph/graph.json impact handleBaseError
  ${dim('$')} codegraph query ./graph/graph.json unused

${dim('If a name matches several symbols, use the exact id: "path/to/file.ts::name".')}
`;
}

function printHelp(): void {
  process.stdout.write(helpText());
}

/** ASCII logo: the box-drawing wordmark + an organic little graph on the right,
 *  framed with clack's gutter (┌ corner + │ bars) so it reads as one block. */
export function printBanner(): void {
  const c = chalk;
  const word = [
    '┏┓┏┓┳┓┏┓┏┓┳┓┏┓┏┓┓┏',
    '┃ ┃┃┃┃┣ ┃┓┣┫┣┫┃┃┣┫',
    '┗┛┗┛┻┛┗┛┗┛┛┗┛┗┣┛┛┗',
  ];
  // An organic, off-grid little graph (3 rows, aligned to the wordmark height).
  const graph = ['   ●', '  ╱ ╲', ' ◆───●'];
  const colorChar = (ch: string): string => {
    if (ch === '●' || ch === '◆') {
      return c.cyan(ch);
    }

    if ('╱╲─│╭╮╰╯'.includes(ch)) {
      return c.dim(ch);
    }

    return ch;
  };
  const colorGraph = (s: string): string =>
    Array.from(s).map(colorChar).join('');

  const bar = c.gray('│');
  const lines = [
    ...word.map(
      (w, i) =>
        `${c.gray(i === 0 ? '┌' : '│')}  ${c.cyan(w)}     ${colorGraph(graph[i] ?? '')}`,
    ),
    bar,
    `${bar}  ${c.dim(`code knowledge graph for agents · v${VERSION}`)}`,
  ];

  process.stdout.write(`${lines.join('\n')}\n`);
}

/**
 * A tiny SYNCHRONOUS progress bar on stderr. clack's `progress` is timer-driven
 * (it only repaints on a setInterval tick), so it can't animate while ts-morph
 * blocks the event loop for the whole extraction — the bar would sit frozen and
 * jump to done. This writes on every update with `\r`, so it animates regardless.
 */
export function makeBar(label: string) {
  const width = 26;

  let lastPct = -1;

  process.stderr.write('\x1b[?25l'); // hide cursor

  return {
    update(done: number, total: number): void {
      const pct =
        total > 0 ? Math.min(100, Math.floor((done / total) * 100)) : 0;

      if (pct === lastPct) {
        return;
      } // throttle to 1% steps

      lastPct = pct;

      const filled = Math.round((width * pct) / 100);
      const fill =
        chalk.cyan('█'.repeat(filled)) + chalk.dim('░'.repeat(width - filled));

      process.stderr.write(
        `\r${chalk.gray('│')}  ${label} ${fill} ${chalk.bold(`${pct}`.padStart(3))}%`,
      );
    },
    done(): void {
      process.stderr.write('\r\x1b[K\x1b[?25h'); // clear the line + restore cursor
    },
  };
}

/** Snapshot of the result: headline stats + edges-by-kind + top god-nodes + freshness. */
export function summaryText(
  graph: Graph,
  out: string,
  ran: Array<{ connector: string; files: number }>,
): string {
  const c = chalk;
  const s = computeStats(graph, 5);

  const edges = edgeKindsByFreq(s.byEdgeKind)
    .map(([k, n]) => `${c.cyan(k)} ${c.dim(String(n))}`)
    .join('  ');
  const gods = s.topConnected
    .map(
      (t) =>
        `  ${c.dim(String(t.degree).padStart(3))} ${t.name} ${c.dim(`(${t.file})`)}`,
    )
    .join('\n');
  const fresh = graph.meta.commit
    ? `${graph.meta.commit.slice(0, 7)}${graph.meta.dirty ? c.yellow(' (uncommitted changes)') : ''}`
    : c.dim('no git');
  const connectors = ran
    .map((r) => `${r.connector} ${c.dim(`(${r.files} files)`)}`)
    .join(', ');
  const unusedTag =
    s.unusedExports > 0
      ? c.yellow(String(s.unusedExports))
      : String(s.unusedExports);

  return [
    `${c.bold(String(s.nodes))} nodes · ${c.bold(String(s.edges))} edges · ${c.dim(`density ${s.density.toFixed(1)}`)}`,
    `${c.dim('files')} ${s.files}  ${c.dim('symbols')} ${s.symbols}  ${c.dim('exported')} ${s.exported}  ${c.dim('unused exports')} ${unusedTag}  ${c.dim('modules')} ${s.modules}  ${c.dim('ext deps')} ${s.externalDeps}`,
    `${c.dim('connectors:')} ${connectors}   ${c.dim('commit:')} ${fresh}`,
    '',
    `${c.dim('edges:')} ${edges}`,
    '',
    c.dim('most connected:'),
    gods,
    '',
    `${c.dim('output:')} ${c.cyan(out)}  ${c.dim('· graph.json · GRAPH_INDEX.md · graph.html')}`,
  ].join('\n');
}

export async function cmdBuild(
  source: string,
  args: Array<string>,
  opts: { intro?: boolean } = {},
): Promise<void> {
  const out = path.resolve(flag(args, '--out', './graph')!);
  const ignore = flag(args, '--ignore')
    ?.split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const includeTests = hasFlag(args, '--include-tests');
  const top = intFlag(args, '--top', 15);

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.mkdirSync(out, { recursive: true });

  // Incremental cache: a local-only file next to the outputs. `--no-cache` forces
  // a full rebuild. Read it before, write the updated one after.
  const cachePath = path.join(out, '.codegraph-cache.json');

  let cache: BuildCache | undefined;

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!hasFlag(args, '--no-cache') && fs.existsSync(cachePath)) {
    try {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      cache = JSON.parse(fs.readFileSync(cachePath, 'utf8')) as BuildCache;
    } catch {
      cache = undefined; // corrupt cache: ignore, do a full build
    }
  }

  if (interactiveTerminal && (opts.intro ?? true)) {
    printBanner();
  }

  // Progress bar (our own, synchronous) on a TTY; on non-TTY (agent/CI) plain
  // stderr logs, without the bar that would spew cursor escapes.
  let bar: ReturnType<typeof makeBar> | null = null;

  const onEvent = (e: BuildEvent): void => {
    if (!interactiveTerminal) {
      if (e.phase === 'resolved') {
        const meta = e.commit
          ? ` · ${e.commit.slice(0, 7)}${e.dirty ? ' (dirty)' : ''}`
          : '';

        process.stderr.write(`Analyzing ${source} · ${e.files} files${meta}\n`);
      } else if (e.phase === 'incremental') {
        process.stderr.write(
          `  incremental: ${e.changed} to re-extract, ${e.reused} cached\n`,
        );
      } else if (e.phase === 'connector:done') {
        process.stderr.write(
          `  ${e.connector}: ${e.nodes} nodes, ${e.edges} edges\n`,
        );
      }

      return;
    }

    switch (e.phase) {
      case 'resolved': {
        const meta = e.commit
          ? ` · ${chalk.dim(e.commit.slice(0, 7))}${e.dirty ? chalk.yellow(' (dirty)') : ''}`
          : '';

        p.log.step(
          `Scanning ${chalk.cyan(source)} — ${chalk.bold(String(e.files))} files${meta}`,
        );

        break;
      }
      case 'incremental': {
        if (e.changed === 0) {
          p.log.step(
            chalk.green(`Nothing changed — reusing ${e.reused} cached files`),
          );
        } else {
          p.log.step(
            `Incremental: ${chalk.bold(String(e.changed))} to re-extract · ${chalk.dim(`${e.reused} cached`)}`,
          );
        }

        break;
      }
      case 'parsing': {
        if (!bar) {
          bar = makeBar(`Parsing with ${chalk.cyan(e.connector)}`);
        }

        bar.update(e.done, e.total);

        break;
      }
      case 'connector:done':
        bar?.done();
        bar = null;
        p.log.step(
          `${chalk.cyan(e.connector)} — ${chalk.bold(String(e.nodes))} nodes, ${chalk.bold(String(e.edges))} edges`,
        );

        break;

      default:
        break;
    }
  };

  const {
    graph,
    ran,
    cache: nextCache,
  } = await buildGraph(source, { ignore, includeTests, cache }, onEvent);
  const htmlPath = path.join(out, 'graph.html');

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFileSync(path.join(out, 'graph.json'), toJson(graph));
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFileSync(
    path.join(out, 'GRAPH_INDEX.md'),
    toIndexMarkdown(graph, top),
  );
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFileSync(htmlPath, toHtml(graph));
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFileSync(cachePath, JSON.stringify(nextCache));

  if (hasFlag(args, '--open')) {
    openInBrowser(htmlPath);
  }

  if (interactiveTerminal) {
    // log.message (not p.note): note measures width counting chalk's ANSI escapes
    // and breaks the text char-by-char. log.message only prefixes the gutter, so
    // the colored summary renders cleanly.
    p.log.success(chalk.bold('Graph generated'));
    p.log.message(summaryText(graph, out, ran));

    if (opts.intro ?? true) {
      p.outro(chalk.green('Done ✦'));
    }
  } else {
    process.stderr.write(
      `\nOK · ${graph.meta.counts.nodes} nodes · ${graph.meta.counts.edges} edges → ${out}\n`,
    );
    process.stderr.write(`  graph.json · GRAPH_INDEX.md · graph.html\n`);

    for (const r of ran) {
      process.stderr.write(`  ${r.connector}: ${r.files} files\n`);
    }
  }
}

/** Relations sorted by edge kind then name, for stable output. */
export function sortRelations(rels: Array<Relation>): Array<Relation> {
  return Array.from(rels).sort((a, b) =>
    a.edge.kind === b.edge.kind
      ? a.node.name.localeCompare(b.node.name)
      : a.edge.kind.localeCompare(b.edge.kind),
  );
}

export function altsLine(alternatives: Array<{ id: string }>): string {
  if (alternatives.length === 0) {
    return '';
  }

  const ids = alternatives.map((a) => a.id).join(', ');

  return `${chalk.yellow('⚠')} ${alternatives.length} more symbol(s) with that name: ${ids}\n  (use the exact id to disambiguate)\n\n`;
}

type QueryContext = {
  graph: Graph;
  params: Array<string>;
  rest: Array<string>;
  json: boolean;
};

const queryHandlers: Record<string, (ctx: QueryContext) => void> = {
  impact({ graph, params, rest, json }) {
    const depth = intFlag(rest, '--depth', 1);

    if (depth > 1) {
      const res = blastRadius(graph, params[0] ?? '', depth);

      if (!res) {
        process.stderr.write(`Not found: ${params[0] ?? ''}\n`);

        return;
      }

      if (json) {
        process.stdout.write(`${JSON.stringify(res, null, 2)}\n`);

        return;
      }

      process.stdout.write(
        `# Blast radius of ${chalk.bold(res.node.name)} (${res.node.kind}) — ${chalk.dim(`${res.node.file}:${res.node.line}`)} ${chalk.dim(`· depth ${depth}`)}\n\n`,
      );
      process.stdout.write(altsLine(res.alternatives));
      process.stdout.write(
        `${res.reached.length} affected across ${res.maxDepth} level(s):\n`,
      );

      for (const r of res.reached) {
        process.stdout.write(
          `  ${chalk.dim(`[${r.distance}]`)} ${chalk.cyan(r.via.kind.padEnd(11))} ${r.node.name} ${chalk.dim(`(${r.node.file}:${r.node.line})`)}\n`,
        );
      }

      return;
    }

    const res = impact(graph, params[0] ?? '');

    if (!res) {
      process.stderr.write(`Not found: ${params[0] ?? ''}\n`);

      return;
    }

    if (json) {
      process.stdout.write(`${JSON.stringify(res, null, 2)}\n`);

      return;
    }

    process.stdout.write(
      `# Impact of changing ${chalk.bold(res.node.name)} (${res.node.kind}) — ${chalk.dim(`${res.node.file}:${res.node.line}`)}\n\n`,
    );
    process.stdout.write(altsLine(res.alternatives));

    if (res.dependents.length === 0) {
      process.stdout.write(
        chalk.dim(
          'No direct dependents (dead code, public API, or dynamic usage — verify before deleting).\n',
        ),
      );

      return;
    }

    const sum = summarizeImpact(res.dependents);

    process.stdout.write(
      `${sum.total} direct dependent(s) · ${chalk.yellow(`${sum.exported} exported`)} · across ${sum.byModule.length} module(s)${chalk.dim(' · --depth N for the transitive radius')}:\n`,
    );

    for (const g of sum.byModule) {
      process.stdout.write(
        `  ${chalk.bold(g.module)} ${chalk.dim(`(${g.relations.length})`)}\n`,
      );

      for (const d of sortRelations(g.relations)) {
        process.stdout.write(
          `    ${chalk.cyan(d.edge.kind.padEnd(11))} ${d.node.name}${d.node.exported ? chalk.yellow(' [exported]') : ''} ${chalk.dim(`(${d.node.file}:${d.node.line})`)}\n`,
        );
      }
    }
  },

  neighbors({ graph, params, json }) {
    const res = neighbors(graph, params[0] ?? '');

    if (!res) {
      process.stderr.write(`Not found: ${params[0] ?? ''}\n`);

      return;
    }

    if (json) {
      process.stdout.write(`${JSON.stringify(res, null, 2)}\n`);

      return;
    }

    process.stdout.write(
      `# ${chalk.bold(res.node.name)} (${res.node.kind}) — ${chalk.dim(`${res.node.file}:${res.node.line}`)}\n`,
    );

    if (res.node.signature) {
      process.stdout.write(
        `${chalk.dim('Signature:')} ${res.node.signature}\n`,
      );
    }

    process.stdout.write('\n');
    process.stdout.write(altsLine(res.alternatives));
    process.stdout.write(`Uses (${res.outgoing.length}):\n`);

    for (const o of sortRelations(res.outgoing)) {
      process.stdout.write(
        `  ${chalk.cyan(o.edge.kind.padEnd(11))} ${o.node.name} ${chalk.dim(`(${o.node.file})`)}\n`,
      );
    }

    process.stdout.write(`\nUsed by (${res.incoming.length}):\n`);

    for (const i of sortRelations(res.incoming)) {
      process.stdout.write(
        `  ${chalk.cyan(i.edge.kind.padEnd(11))} ${i.node.name} ${chalk.dim(`(${i.node.file})`)}\n`,
      );
    }
  },

  unused({ graph, json }) {
    const res = unused(graph);

    if (json) {
      process.stdout.write(`${JSON.stringify(res, null, 2)}\n`);

      return;
    }

    process.stdout.write(
      `# Symbols with no dependents in the graph (${res.length})\n`,
    );
    process.stdout.write(
      chalk.yellow(
        `⚠ "no dependents" ≠ "safe to delete": it may be public API, an entry point or dynamic usage; ` +
          `tests are excluded from the graph. Verify in the file before deleting.\n\n`,
      ),
    );

    for (const n of res) {
      const scope = n.exported ? 'export' : 'local';

      process.stdout.write(
        `  ${chalk.cyan(n.kind.padEnd(10))} ${chalk.dim(scope.padEnd(6))} ${n.name} ${chalk.dim(`(${n.file}:${n.line})`)}\n`,
      );
    }
  },

  path({ graph, params, json }) {
    for (const q of [params[0], params[1]]) {
      const ms = findNodes(graph, q ?? '');

      if (ms.length > 1) {
        process.stderr.write(
          `⚠ "${q ?? ''}" matches ${ms.length} symbols; using ${ms[0]!.id}. Use the exact id to disambiguate.\n`,
        );
      }
    }

    const route = shortestPath(graph, params[0] ?? '', params[1] ?? '');

    if (!route) {
      process.stderr.write(
        `No path between ${params[0] ?? ''} and ${params[1] ?? ''}\n`,
      );

      return;
    }

    if (json) {
      process.stdout.write(`${JSON.stringify(route, null, 2)}\n`);

      return;
    }

    process.stdout.write(
      `${route.map((n) => `${n.name} (${n.file})`).join('\n  ↓ ')}\n`,
    );
  },
};

export function cmdQuery(args: Array<string>): void {
  const json = args.includes('--json');
  const rest = args.filter((a) => a !== '--json');
  const [file, sub, ...params] = rest;

  if (!file || !sub) {
    throw new Error(helpText());
  }

  const graph = loadGraph(file);
  const handler = queryHandlers[sub];

  if (!handler) {
    throw new Error(helpText());
  }

  handler({ graph, params, rest, json });
}

export function cmdMermaid(args: Array<string>): void {
  const [file, symbol, ...rest] = args;

  if (!file || !symbol) {
    throw new Error(helpText());
  }

  const depth = intFlag(rest, '--depth', 2);

  process.stdout.write(`${toMermaid(loadGraph(file), symbol, depth)}\n`);
}

/** Interactive flow when a person runs `codegraph` with no args in a terminal. */
// eslint-disable-next-line complexity
export async function interactive(): Promise<void> {
  printBanner();

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const claudeOk = claudeAvailable();
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const mcpOn = claudeOk && mcpRegistered();

  let mcpHint: string;

  if (!claudeOk) {
    mcpHint = 'needs the claude CLI';
  } else if (mcpOn) {
    mcpHint = 'turn the agent tools off';
  } else {
    mcpHint = 'turn the agent tools on';
  }

  const cmd = await p.select({
    message: 'What do you want to do?',
    options: [
      { value: 'build', label: 'Generate the graph of a repo' },
      {
        value: 'impact',
        label: 'Impact of a symbol',
        hint: 'what breaks if I change it',
      },
      {
        value: 'neighbors',
        label: 'Neighborhood of a symbol',
        hint: 'what it uses and who uses it',
      },
      {
        value: 'path',
        label: 'Path between two symbols',
        hint: 'how A connects to B',
      },
      {
        value: 'unused',
        label: 'Symbols with no dependents',
        hint: 'dead-code candidates',
      },
      {
        value: 'mcp',
        label: mcpOn ? 'Disable the codegraph MCP' : 'Enable the codegraph MCP',
        hint: mcpHint,
      },
      { value: 'help', label: 'Show the full help' },
    ],
  });

  if (p.isCancel(cmd)) {
    return p.cancel('Cancelled.');
  }

  if (cmd === 'help') {
    p.outro('Here goes the help 👇');

    return printHelp();
  }

  if (cmd === 'mcp') {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    cmdMcpToggle(mcpOn ? 'disable' : 'enable');

    return p.outro(chalk.green('Done ✦'));
  }

  if (cmd === 'build') {
    const src = await p.text({
      message: 'Source to analyze (local path, GitHub URL, or org/repo)',
      placeholder: '.',
      defaultValue: '.',
    });

    if (p.isCancel(src)) {
      return p.cancel('Cancelled.');
    }

    return cmdBuild(src || '.', ['--out', './graph'], { intro: false });
  }

  // queries: need the graph.json and (except unused) a symbol
  const file = await p.text({
    message: 'Path to graph.json',
    placeholder: './graph/graph.json',
    defaultValue: './graph/graph.json',
  });

  if (p.isCancel(file)) {
    return p.cancel('Cancelled.');
  }

  const graphFile = file || './graph/graph.json';

  if (cmd === 'unused') {
    p.outro('Looking for symbols with no dependents…');

    return cmdQuery([graphFile, 'unused']);
  }

  if (cmd === 'path') {
    const from = await p.text({ message: 'From symbol', placeholder: 'login' });

    if (p.isCancel(from) || !from) {
      return p.cancel('Cancelled.');
    }

    const to = await p.text({ message: 'To symbol', placeholder: 'connect' });

    if (p.isCancel(to) || !to) {
      return p.cancel('Cancelled.');
    }

    p.outro(`Tracing the path from ${from} to ${to}…`);

    return cmdQuery([graphFile, 'path', from, to]);
  }

  const sym = await p.text({
    message: 'Symbol to query',
    placeholder: 'handleBaseError',
  });

  if (p.isCancel(sym) || !sym) {
    return p.cancel('Cancelled.');
  }

  p.outro(`Querying ${cmd} of ${sym}…`);

  return cmdQuery([graphFile, cmd, sym]);
}

/**
 * `open`: pop the Graph Explorer (graph.html) in the browser. Takes a graph dir
 * or the .html directly; defaults to ./graph. The visual is for the human — the
 * agent reads graph.json / the MCP.
 */
export function cmdOpen(args: Array<string>): void {
  const target = args.find((a) => !a.startsWith('--')) ?? './graph';
  const html = target.endsWith('.html')
    ? path.resolve(target)
    : path.resolve(target, 'graph.html');

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!fs.existsSync(html)) {
    throw new Error(
      `No graph.html at "${html}". Generate it first: \`codegraph <source> --out ${path.dirname(html)}\` (or add --open).`,
    );
  }

  if (openInBrowser(html)) {
    process.stderr.write(`Opening ${html}\n`);
  } else {
    process.stderr.write(
      `Couldn't launch a browser. Open it manually:\n  ${html}\n`,
    );
  }
}

/** Absolute path to this CLI entry (works in dev via tsx and built via tsup). */
function cliPath(): string {
  return fileURLToPath(import.meta.url);
}

/** The bundled skill, shipped with the package (skills/ is in package `files`). */
function skillSource(): string {
  return path.join(
    path.dirname(cliPath()),
    '..',
    'skills',
    'codegraph',
    'SKILL.md',
  );
}

function claudeAvailable(): boolean {
  try {
    execFileSync('claude', ['--version'], { stdio: 'ignore' });

    return true;
  } catch {
    return false;
  }
}

/** `codegraph mcp` by absolute path so it resolves regardless of PATH. */
function mcpServerCmd(): Array<string> {
  return [process.execPath, cliPath(), 'mcp'];
}

/** The manual `claude mcp add` line, shown when we can't run it ourselves. */
function mcpAddCommand(): string {
  return `claude mcp add -s user codegraph -- ${mcpServerCmd().join(' ')}`;
}

/** Whether the MCP server is currently registered (user-scoped) in Claude Code. */
function mcpRegistered(): boolean {
  try {
    execFileSync('claude', ['mcp', 'get', 'codegraph'], { stdio: 'ignore' });

    return true;
  } catch {
    return false;
  }
}

/** Register (or re-register) the MCP, user-scoped. Remove-then-add = idempotent. */
function registerMcp(): boolean {
  try {
    execFileSync('claude', ['mcp', 'remove', '-s', 'user', 'codegraph'], {
      stdio: 'ignore',
    });
  } catch {
    // not registered yet — fine
  }

  execFileSync(
    'claude',
    ['mcp', 'add', '-s', 'user', 'codegraph', '--', ...mcpServerCmd()],
    { stdio: 'ignore' },
  );

  return true;
}

/** Unregister the MCP, user-scoped. */
function unregisterMcp(): boolean {
  execFileSync('claude', ['mcp', 'remove', '-s', 'user', 'codegraph'], {
    stdio: 'ignore',
  });

  return true;
}

/**
 * `init`: leave everything ready for an MCP-capable agent — install the skill
 * (the agent's judgment) and register the MCP server (the tools), user-scoped so
 * it works across every repo. Idempotent.
 */
export function cmdInit(args: Array<string>): void {
  const print = hasFlag(args, '--print'); // dry-run: write nothing, just show what it would do

  if (interactiveTerminal) {
    printBanner();
  }

  const dest = path.join(
    os.homedir(),
    '.claude',
    'skills',
    'codegraph',
    'SKILL.md',
  );

  if (print) {
    p.log.step(`Would install the skill → ${chalk.cyan(dest)}`);
    p.log.step(`Would register the MCP:\n  ${chalk.cyan(mcpAddCommand())}`);
    p.note(
      'Dry run — nothing was changed. Run `codegraph init` (no --print) to apply.',
      'Preview',
    );

    if (interactiveTerminal) {
      p.outro(chalk.green('Done ✦'));
    }

    return;
  }

  // 1) Install the skill (user-scoped, so it applies in any repo).
  let skillOk = false;

  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(skillSource(), dest);
    skillOk = true;
  } catch (err) {
    p.log.warn(
      `Couldn't install the skill: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  // 2) Register the MCP server, user-scoped.
  let mcpOk = false;

  if (claudeAvailable()) {
    try {
      registerMcp();
      mcpOk = true;
    } catch (err) {
      p.log.warn(
        `Couldn't register the MCP automatically: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  if (skillOk) {
    p.log.success(`Skill installed → ${chalk.cyan(dest)}`);
  }

  if (mcpOk) {
    p.log.success(
      `MCP server registered (user-scoped) as ${chalk.cyan('codegraph')}`,
    );
  } else {
    p.log.step(`Register the MCP yourself:\n  ${chalk.cyan(mcpAddCommand())}`);
  }

  p.note(
    `The agent now has the ${chalk.cyan('codegraph')} tools and the skill that tells it when to\n` +
      `use them. Toggle the server anytime with ${chalk.cyan('codegraph disable')} / ${chalk.cyan('codegraph enable')}.\n` +
      `Works in any repo — the graph is built on demand. Restart your agent to pick it up.`,
    'Ready',
  );

  if (interactiveTerminal) {
    p.outro(chalk.green('Done ✦'));
  }
}

/** `enable` / `disable`: turn the MCP server on/off in Claude Code without touching
 *  the skill. `status` reports whether it's currently registered. */
export function cmdMcpToggle(action: 'disable' | 'enable' | 'status'): void {
  if (!claudeAvailable()) {
    process.stderr.write(
      `The \`claude\` CLI isn't on PATH, so the MCP can't be toggled here.\n`,
    );

    if (action !== 'status') {
      process.stderr.write(
        `Do it manually:\n  ${action === 'enable' ? mcpAddCommand() : 'claude mcp remove -s user codegraph'}\n`,
      );
    }

    return;
  }

  if (action === 'status') {
    const on = mcpRegistered();

    process.stdout.write(
      `codegraph MCP: ${on ? chalk.green('enabled') : chalk.yellow('disabled')}\n`,
    );

    return;
  }

  try {
    if (action === 'enable') {
      registerMcp();
      process.stderr.write(
        `${chalk.green('✓')} codegraph MCP enabled (user-scoped). Restart your agent to pick it up.\n`,
      );
    } else {
      if (!mcpRegistered()) {
        process.stderr.write(`codegraph MCP is already disabled.\n`);

        return;
      }

      unregisterMcp();
      process.stderr.write(
        `${chalk.green('✓')} codegraph MCP disabled. Re-enable with \`codegraph enable\`.\n`,
      );
    }
  } catch (err) {
    process.stderr.write(
      `${chalk.red('Error:')} ${err instanceof Error ? err.message : String(err)}\n`,
    );
  }
}

export async function main(): Promise<void> {
  const [cmd, ...args] = process.argv.slice(2);

  if (cmd === '-h' || cmd === '--help') {
    printHelp();

    return;
  }

  if (cmd === '-v' || cmd === '--version' || cmd === 'version') {
    process.stdout.write(`codegraph ${VERSION}\n`);

    return;
  }

  if (!cmd) {
    if (interactiveTerminal) {
      await interactive();
    } else {
      printHelp();
    }

    return;
  }

  if (cmd === 'query') {
    cmdQuery(args);

    return;
  }

  if (cmd === 'mermaid') {
    cmdMermaid(args);

    return;
  }

  if (cmd === 'open') {
    cmdOpen(args);

    return;
  }

  if (cmd === 'init') {
    cmdInit(args);

    return;
  }

  if (cmd === 'enable') {
    cmdMcpToggle('enable');

    return;
  }

  if (cmd === 'disable') {
    cmdMcpToggle('disable');

    return;
  }

  if (cmd === 'status') {
    cmdMcpToggle('status');

    return;
  }

  // Lazy-import the MCP server so its SDK isn't loaded for normal CLI use.
  if (cmd === 'mcp') {
    await (await import('./mcp/server.js')).runMcpServer();

    return;
  }

  await cmdBuild(cmd, args); // anything else is the source to analyze
}

main().catch((err) => {
  process.stderr.write(
    `${chalk.red('Error:')} ${err instanceof Error ? err.message : String(err)}\n`,
  );
  process.exit(1);
});
