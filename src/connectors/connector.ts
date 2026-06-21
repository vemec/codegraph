import type { GraphFragment } from '../model/types.ts';

/**
 * Contract implemented by every language connector. The orchestrator knows
 * nothing about the language: it only asks each connector which files it owns
 * and requests the graph fragment. Adding a language = a new connector, with
 * no changes to the core or outputs.
 */
export interface Connector {
  /** Language identifier: 'typescript', 'go', ... */
  readonly name: string;
  /** Short label stored in `GraphNode.lang`: 'ts', 'go', ... */
  readonly lang: string;

  /** From the full source file list, which ones this connector parses. */
  match(files: string[]): string[];

  /**
   * Parses its files and returns nodes + edges in the shared schema.
   * @param files paths relative to `root` assigned to this connector.
   * @param root absolute root of the source.
   */
  extract(files: string[], root: string): Promise<GraphFragment>;
}
