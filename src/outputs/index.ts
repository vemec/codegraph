import { degrees } from '../model/graph.ts';
import type { Graph, GraphNode } from '../model/types.ts';

/** How many top nodes and module members to list by default. */
const DEFAULT_TOP = 15;
const MODULE_MEMBERS = 8;

function symbolNodes(graph: Graph): GraphNode[] {
  return graph.nodes.filter((n) => n.kind !== 'file' && n.kind !== 'external');
}

/**
 * Generates GRAPH_INDEX.md: the readable map the agent checks before grepping.
 * Summarizes top nodes, modules, and entry points without dumping the JSON.
 * @param top how many top nodes to list (default 15).
 */
export function toIndexMarkdown(graph: Graph, top = DEFAULT_TOP): string {
  const deg = degrees(graph);
  const lines: string[] = [];

  lines.push('# Code Graph - Index');
  lines.push('');
  const dirtyTag = graph.meta.dirty ? ' ⚠ working tree has uncommitted changes' : '';
  lines.push(`> Source: \`${graph.meta.source}\`${graph.meta.commit ? ` @ \`${graph.meta.commit.slice(0, 8)}\`${dirtyTag}` : ''}`);
  lines.push(`> Generated: ${graph.meta.generatedAt}`);
  lines.push(`> Languages: ${graph.meta.languages.join(', ') || '—'} · Nodes: ${graph.meta.counts.nodes} · Edges: ${graph.meta.counts.edges}`);
  lines.push('');
  lines.push('Relationship map for the code. Use it to orient yourself before reading files: ');
  lines.push('the **top nodes** are the most connected symbols (touching them has broad impact), and the');
  lines.push('**module breakdown** tells you what lives where. For precise detail, inspect `graph.json`.');
  lines.push('');

  // --- Top nodes ---
  lines.push('## Top Nodes');
  lines.push('');
  const symbols = symbolNodes(graph)
    .map((n) => ({ n, d: deg.get(n.id) ?? 0 }))
    .sort((a, b) => b.d - a.d)
    .slice(0, top);
  if (symbols.length === 0) {
    lines.push('_(no symbols)_');
  } else {
    lines.push('| Symbol | Type | Connections | Location |');
    lines.push('|---|---|--:|---|');
    for (const { n, d } of symbols) {
      lines.push(`| \`${n.name}\` | ${n.kind} | ${d} | \`${n.file}:${n.line}\` |`);
    }
  }
  lines.push('');

  // --- Module breakdown ---
  lines.push('## Modules');
  lines.push('');
  const byModule = new Map<string, GraphNode[]>();
  for (const n of symbolNodes(graph)) {
    const list = byModule.get(n.module) ?? [];
    list.push(n);
    byModule.set(n.module, list);
  }
  for (const moduleName of [...byModule.keys()].sort()) {
    const members = byModule.get(moduleName)!;
    const top = members
      .map((n) => ({ n, d: deg.get(n.id) ?? 0 }))
      .sort((a, b) => b.d - a.d)
      .slice(0, MODULE_MEMBERS)
      .map(({ n }) => `\`${n.name}\``)
      .join(', ');
    lines.push(`- **${moduleName}** (${members.length}) — ${top}`);
  }
  lines.push('');

  return lines.join('\n');
}
