import { applicableConnectors } from './connectors/registry.ts';
import { GraphBuilder } from './model/graph.ts';
import type { Graph } from './model/types.ts';
import { resolveSource, type SourceOptions } from './sources/resolve.ts';

export interface BuildResult {
  graph: Graph;
  /** Which connectors ran and how many files each one processed. */
  ran: { connector: string; files: number }[];
}

/**
 * Central pipeline: resolves the source, dispatches files to each applicable
 * connector, and merges the fragments into one deterministic graph.
 */
export async function buildGraph(input: string, options: SourceOptions = {}): Promise<BuildResult> {
  const resolved = resolveSource(input, options);
  try {
    const builder = new GraphBuilder();
    const ran: BuildResult['ran'] = [];

    for (const { connector, files } of applicableConnectors(resolved.files)) {
      const fragment = await connector.extract(files, resolved.root);
      builder.addFragment(fragment);
      ran.push({ connector: connector.name, files: files.length });
    }

    const graph = builder.build({
      source: resolved.source,
      commit: resolved.commit,
      dirty: resolved.dirty,
      generatedAt: new Date().toISOString(),
    });

    return { graph, ran };
  } finally {
    resolved.cleanup?.();
  }
}
