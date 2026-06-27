import type { GraphFragment } from '../model/types.js';

/**
 * Contract that every language connector implements. The orchestrator knows
 * NOTHING about the language: it just asks each connector which files are its
 * own and requests the graph fragment. Adding a language = a new connector,
 * without touching the core or the outputs.
 */
export interface Connector {
  /** Language identifier: 'typescript', 'go', ... */
  readonly name: string;
  /** Short tag that goes in `GraphNode.lang`: 'ts', 'go', ... */
  readonly lang: string;

  /** From the full list of source files, which ones this connector parses. */
  match: (files: Array<string>) => Array<string>;

  /**
   * Parses ITS files and returns nodes + edges in the common schema.
   * @param files paths relative to `root` assigned to this connector.
   * @param root  absolute root of the source.
   * @param onProgress optional progress callback (processed, total) for the UI.
   * @param knownIds ids of nodes from OTHER (cached) files, valid as cross-file
   *   edge targets during an incremental build. Empty on a full build.
   */
  extract: (
    files: Array<string>,
    root: string,
    onProgress?: (done: number, total: number) => void,
    knownIds?: ReadonlySet<string>,
  ) => Promise<GraphFragment>;
}
