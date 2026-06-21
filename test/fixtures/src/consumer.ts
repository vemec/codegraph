// Imports through the barrel - the call must resolve to the REAL symbol
// (widgets.ts::widgetHelper), not stay on the barrel.
import { widgetHelper, makePool } from './barrel';

export function useWidgets(): string {
  const pool = makePool();
  return widgetHelper() + pool.connect();
}
