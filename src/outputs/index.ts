import type { Graph, GraphNode } from '../model/types.js';

import { degrees } from '../model/graph.js';
import { moduleDependencies, moduleStability, statsMarkdown } from './stats.js';

/** Strips newlines from a metadata field before embedding it into Markdown output. */
function safeMeta(s: string): string {
  return s
    .replace(/[\r\n  ]/g, ' ')
    .replace(/  +/g, ' ')
    .trim();
}

/** How many God nodes and how many members per module to list by default. */
const DEFAULT_TOP = 15;
const MODULE_MEMBERS = 8;
/** How many cross-module dependencies to list (the architecture at a glance). */
const TOP_MODULE_DEPS = 15;

function symbolNodes(graph: Graph): Array<GraphNode> {
  return graph.nodes.filter((n) => n.kind !== 'file' && n.kind !== 'external');
}

/**
 * Generates GRAPH_INDEX.md: the HUMAN-READABLE map the agent reads before grepping.
 * It summarizes God nodes (most connected), modules and entry points without
 * dumping the JSON. Starts with a Snapshot of the result's headline stats.
 * @param top how many God nodes to list (default 15).
 */
export function toIndexMarkdown(graph: Graph, top = DEFAULT_TOP): string {
  const deg = degrees(graph);
  const lines: Array<string> = [];

  lines.push('# Code Graph — Index');
  lines.push('');

  const dirtyTag = graph.meta.dirty
    ? ' ⚠ working tree with uncommitted changes'
    : '';

  lines.push(
    `> Source: \`${graph.meta.source}\`${graph.meta.commit ? ` @ \`${graph.meta.commit.slice(0, 8)}\`${dirtyTag}` : ''}`,
  );
  lines.push(`> Generated: ${graph.meta.generatedAt}`);
  lines.push(
    `> Languages: ${graph.meta.languages.join(', ') || '—'} · Nodes: ${graph.meta.counts.nodes} · Edges: ${graph.meta.counts.edges}`,
  );

  if (graph.meta.frameworks && graph.meta.frameworks.length > 0) {
    lines.push(`> Frameworks: ${graph.meta.frameworks.join(', ')}`);
  }

  lines.push('');
  lines.push(
    'Map of code relationships. Use it to orient before reading files: the',
  );
  lines.push(
    '**God nodes** are the most connected symbols (touching them has wide impact), and the',
  );
  lines.push(
    '**per-module breakdown** tells you what lives where. For specific detail, query `graph.json`.',
  );
  lines.push('');

  // --- Snapshot (persisted stats of the result) ---
  lines.push(statsMarkdown(graph));

  // --- God nodes ---
  lines.push('## God nodes (most connected)');
  lines.push('');

  const symbols = symbolNodes(graph)
    .map((n) => ({ n, d: deg.get(n.id) ?? 0 }))
    .sort((a, b) => b.d - a.d)
    .slice(0, top);

  if (symbols.length === 0) {
    lines.push('_(no symbols)_');
  } else {
    lines.push('| Symbol | Kind | Connections | Location |');
    lines.push('|---|---|--:|---|');

    for (const { n, d } of symbols) {
      lines.push(
        `| \`${safeMeta(n.name)}\` | ${safeMeta(n.kind)} | ${d} | \`${safeMeta(n.file)}:${n.line}\` |`,
      );
    }
  }

  lines.push('');

  // --- Architectural layers (measured by instability, not guessed by name) ---
  const stability = moduleStability(graph);

  if (stability.length > 0) {
    lines.push('## Architectural layers');
    lines.push('');
    lines.push(
      'Modules ranked by **instability** `I = fan-out / (fan-in + fan-out)`, measured from',
    );
    lines.push(
      'the dependency graph. High I = depends on many, used by few (application/edge layer);',
    );
    lines.push(
      'low I = used widely, depends on little (foundation). The order IS the layering.',
    );
    lines.push('');
    lines.push('| Module | Layer | Fan-in | Fan-out | Instability |');
    lines.push('|---|---|--:|--:|--:|');

    for (const s of stability) {
      lines.push(
        `| \`${safeMeta(s.module)}\` | ${safeMeta(s.layer)} | ${s.fanIn} | ${s.fanOut} | ${s.instability.toFixed(2)} |`,
      );
    }

    lines.push('');
  }

  // --- Cross-module dependencies (the architecture at a glance) ---
  const moduleDeps = moduleDependencies(graph);

  if (moduleDeps.length > 0) {
    lines.push('## Cross-module dependencies');
    lines.push('');
    lines.push(
      'Directed coupling between modules (how many edges cross from one into another).',
    );
    lines.push('');
    lines.push('| From | → | To | Edges |');
    lines.push('|---|:-:|---|--:|');

    for (const d of moduleDeps.slice(0, TOP_MODULE_DEPS)) {
      lines.push(
        `| \`${safeMeta(d.from)}\` | → | \`${safeMeta(d.to)}\` | ${d.count} |`,
      );
    }

    lines.push('');
  }

  // --- Per-module breakdown ---
  lines.push('## Modules');
  lines.push('');

  const byModule = new Map<string, Array<GraphNode>>();

  for (const n of symbolNodes(graph)) {
    const list = byModule.get(n.module) ?? [];

    list.push(n);
    byModule.set(n.module, list);
  }

  for (const moduleName of Array.from(byModule.keys()).sort()) {
    const members = byModule.get(moduleName)!;
    const topMembers = members
      .map((n) => ({ n, d: deg.get(n.id) ?? 0 }))
      .sort((a, b) => b.d - a.d)
      .slice(0, MODULE_MEMBERS)
      .map(({ n }) => `\`${safeMeta(n.name)}\``)
      .join(', ');

    lines.push(
      `- **${safeMeta(moduleName)}** (${members.length}) — ${topMembers}`,
    );
  }

  lines.push('');

  return lines.join('\n');
}
