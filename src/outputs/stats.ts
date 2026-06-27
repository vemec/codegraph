import type { Graph } from '../model/types.js';

import { degrees } from '../model/graph.js';
import { unused } from '../query/query.js';

export interface TopNode {
  name: string;
  kind: string;
  file: string;
  line: number;
  degree: number;
}

/** A directed dependency between two modules, with how many edges back it. */
export interface ModuleDependency {
  from: string;
  to: string;
  count: number;
}

/**
 * Module-level architecture: how many real dependency edges cross from one module
 * into another. Aggregates the per-symbol edges up to their modules, dropping
 * structural `contains`, self-loops and edges into external deps — what's left is
 * the directed coupling between the repo's own modules.
 */
export function moduleDependencies(graph: Graph): Array<ModuleDependency> {
  const moduleOfId = new Map<string, string>();

  for (const n of graph.nodes) {
    if (n.kind !== 'external') {
      moduleOfId.set(n.id, n.module);
    }
  }

  const counts = new Map<string, Map<string, number>>();

  for (const e of graph.edges) {
    if (e.kind !== 'contains') {
      const from = moduleOfId.get(e.from);
      const to = moduleOfId.get(e.to);

      if (from && to && from !== to) {
        const targets =
          counts.get(from) ?? counts.set(from, new Map()).get(from)!;

        targets.set(to, (targets.get(to) ?? 0) + 1);
      }
    }
  }

  const out: Array<ModuleDependency> = [];

  for (const [from, targets] of counts) {
    for (const [to, count] of targets) {
      out.push({ from, to, count });
    }
  }

  return out.sort((a, b) => b.count - a.count);
}

/** Robert Martin's stability metric for one module. */
export interface ModuleStability {
  module: string;
  /** Ca — afferent coupling: dependency edges coming IN from other modules. */
  fanIn: number;
  /** Ce — efferent coupling: dependency edges going OUT to other modules. */
  fanOut: number;
  /** I = Ce / (Ca + Ce), in [0, 1]. High = unstable (edge/app layer), low = stable (foundation). */
  instability: number;
  /** Band derived from instability, the layer reading. */
  layer: 'Application' | 'Foundation' | 'Intermediate';
}

function layerOf(instability: number): ModuleStability['layer'] {
  if (instability >= 0.66) {
    return 'Application';
  }

  if (instability >= 0.33) {
    return 'Intermediate';
  }

  return 'Foundation';
}

/**
 * Architectural layers, MEASURED from the dependency graph (not guessed from path
 * names). For each module, Martin's instability `I = Ce / (Ca + Ce)`: a module that
 * depends on many and is depended-on by few (`I → 1`) is an application/edge layer;
 * one that everything depends on but depends on little (`I → 0`) is foundational.
 * Sorting by I top-down IS the layering. Built on `moduleDependencies`, so external
 * deps and structural `contains` are already excluded.
 */
export function moduleStability(graph: Graph): Array<ModuleStability> {
  const fanIn = new Map<string, number>();
  const fanOut = new Map<string, number>();
  const modules = new Set<string>();

  for (const d of moduleDependencies(graph)) {
    fanOut.set(d.from, (fanOut.get(d.from) ?? 0) + d.count);
    fanIn.set(d.to, (fanIn.get(d.to) ?? 0) + d.count);
    modules.add(d.from);
    modules.add(d.to);
  }

  const out: Array<ModuleStability> = [];

  for (const module of modules) {
    const ca = fanIn.get(module) ?? 0;
    const ce = fanOut.get(module) ?? 0;
    const total = ca + ce;
    const instability = total === 0 ? 0 : ce / total;

    out.push({
      module,
      fanIn: ca,
      fanOut: ce,
      instability,
      layer: layerOf(instability),
    });
  }

  // Most unstable first: the application/edge layers on top, foundation at the bottom.
  return out.sort(
    (a, b) => b.instability - a.instability || b.fanOut - a.fanOut,
  );
}

/** A snapshot of the graph: the headline numbers a reader wants after a build. */
export interface GraphStats {
  nodes: number;
  edges: number;
  files: number;
  externals: number;
  /** Declared symbols (everything that isn't a file or an external dependency). */
  symbols: number;
  exported: number;
  modules: number;
  /** Exported symbols nothing else in the repo depends on (dead-code candidates). */
  unusedExports: number;
  /** Average relationships per node: edges / nodes. */
  density: number;
  byNodeKind: Record<string, number>;
  byEdgeKind: Record<string, number>;
  /** Distinct external packages/modules referenced. */
  externalDeps: number;
  topConnected: Array<TopNode>;
}

export function computeStats(graph: Graph, topN = 5): GraphStats {
  const byNodeKind: Record<string, number> = {};
  const byEdgeKind: Record<string, number> = {};
  const modules = new Set<string>();

  let files = 0;
  let externals = 0;
  let exported = 0;

  for (const n of graph.nodes) {
    byNodeKind[n.kind] = (byNodeKind[n.kind] ?? 0) + 1;

    if (n.kind === 'file') {
      files += 1;
    } else if (n.kind === 'external') {
      externals += 1;
    } else {
      modules.add(n.module);

      if (n.exported) {
        exported += 1;
      }
    }
  }

  for (const e of graph.edges) {
    byEdgeKind[e.kind] = (byEdgeKind[e.kind] ?? 0) + 1;
  }

  const symbols = graph.nodes.length - files - externals;
  const deg = degrees(graph);
  const topConnected = graph.nodes
    .filter((n) => n.kind !== 'file' && n.kind !== 'external')
    .map((n) => ({
      name: n.name,
      kind: n.kind,
      file: n.file,
      line: n.line,
      degree: deg.get(n.id) ?? 0,
    }))
    .sort((a, b) => b.degree - a.degree)
    .slice(0, topN);

  return {
    nodes: graph.nodes.length,
    edges: graph.edges.length,
    files,
    externals,
    symbols,
    exported,
    modules: modules.size,
    unusedExports: unused(graph).filter((n) => n.exported).length,
    density:
      graph.nodes.length === 0 ? 0 : graph.edges.length / graph.nodes.length,
    byNodeKind,
    byEdgeKind,
    externalDeps: externals,
    topConnected,
  };
}

/** Order edge kinds by frequency for display. */
export function edgeKindsByFreq(
  byEdgeKind: Record<string, number>,
): Array<[string, number]> {
  return Object.entries(byEdgeKind).sort((a, b) => b[1] - a[1]);
}

/** Markdown snapshot block for GRAPH_INDEX.md — a persisted summary of the result. */
export function statsMarkdown(graph: Graph): string {
  const s = computeStats(graph, 0);
  const nk = (k: string) => s.byNodeKind[k] ?? 0;
  const lines: Array<string> = [];

  lines.push('## Snapshot');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|---|--:|');
  lines.push(`| Files | ${s.files} |`);
  lines.push(`| Symbols | ${s.symbols} |`);
  lines.push(`| — functions | ${nk('function')} |`);
  lines.push(`| — classes | ${nk('class')} |`);
  lines.push(`| — interfaces | ${nk('interface')} |`);
  lines.push(`| — methods | ${nk('method')} |`);
  lines.push(`| — other exports | ${nk('export')} |`);
  lines.push(`| Exported symbols | ${s.exported} |`);
  lines.push(`| Unused exports | ${s.unusedExports} |`);
  lines.push(`| Modules | ${s.modules} |`);
  lines.push(`| External deps | ${s.externalDeps} |`);
  lines.push(`| Edges | ${s.edges} |`);
  lines.push(`| Density (edges/node) | ${s.density.toFixed(1)} |`);
  lines.push('');
  lines.push(
    `**Edges by kind:** ${edgeKindsByFreq(s.byEdgeKind)
      .map(([k, n]) => `${k} ${n}`)
      .join(' · ')}`,
  );
  lines.push('');

  return lines.join('\n');
}
