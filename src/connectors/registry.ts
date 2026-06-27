import type { Connector } from './connector.js';

import { PackageJsonConnector } from './json/index.js';
import { TypeScriptConnector } from './typescript/index.js';

/**
 * Registry of available connectors. To add a language (e.g. Go), implement the
 * `Connector` and add it here — nothing else changes.
 */
const connectors: Array<Connector> = [
  new TypeScriptConnector(),
  new PackageJsonConnector(),
];

export function allConnectors(): Array<Connector> {
  return connectors;
}

/** Returns only the connectors that have at least one file to parse. */
export function applicableConnectors(
  files: Array<string>,
): Array<{ connector: Connector; files: Array<string> }> {
  const result: Array<{ connector: Connector; files: Array<string> }> = [];

  for (const connector of connectors) {
    const matched = connector.match(files);

    if (matched.length > 0) {
      result.push({ connector, files: matched });
    }
  }

  return result;
}
