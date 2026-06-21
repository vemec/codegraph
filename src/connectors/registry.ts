import type { Connector } from './connector.ts';
import { TypeScriptConnector } from './typescript/index.ts';

/**
 * Available connector registry. To add a language (for example Go),
 * implement `Connector` and add it here - nothing else changes.
 */
const connectors: Connector[] = [new TypeScriptConnector()];

export function allConnectors(): Connector[] {
  return connectors;
}

/** Returns only the connectors that have at least one file to parse. */
export function applicableConnectors(files: string[]): { connector: Connector; files: string[] }[] {
  const result: { connector: Connector; files: string[] }[] = [];
  for (const connector of connectors) {
    const matched = connector.match(files);
    if (matched.length > 0) result.push({ connector, files: matched });
  }
  return result;
}
