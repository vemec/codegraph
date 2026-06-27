import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { TypeScriptConnector } from '../src/connectors/typescript/index.ts';
import type { GraphEdge } from '../src/model/types.ts';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');
let edges: GraphEdge[];

beforeAll(async () => {
  const connector = new TypeScriptConnector();
  const files = [
    'src/widgets.ts', 'src/barrel.ts', 'src/db.ts', 'src/consumer.ts',
    'src/Card.tsx', 'src/Dashboard.tsx',
  ];
  ({ edges } = await connector.extract(connector.match(files), root));
});

function hasEdge(from: string, kind: string, to: string): boolean {
  return edges.some((e) => e.from === from && e.kind === kind && e.to === to);
}

describe('coverage: re-exports / barrels', () => {
  it('resolves a call through a barrel to the real symbol', () => {
    // consumer imports widgetHelper from ./barrel, which re-exports it from ./widgets
    expect(hasEdge('src/consumer.ts::useWidgets', 'calls', 'src/widgets.ts::widgetHelper')).toBe(true);
  });

  it('resolves through export * (wildcard) to the real symbol', () => {
    // makePool arrives via `export * from './db'` in the barrel
    expect(hasEdge('src/consumer.ts::useWidgets', 'calls', 'src/db.ts::makePool')).toBe(true);
  });
});

describe('coverage: components wrapped in HOCs', () => {
  it('captures the render of a memoized component', () => {
    expect(hasEdge('src/Dashboard.tsx::Dashboard', 'renders', 'src/Card.tsx::Card')).toBe(true);
  });
});

describe('moduleGroup', () => {
  it('groups by the first 2 path segments', async () => {
    const { moduleGroup } = await import('../src/outputs/html.ts');
    expect(moduleGroup('app/components/Calculate/hooks')).toBe('app/components');
    expect(moduleGroup('services')).toBe('services');
    expect(moduleGroup('.')).toBe('(root)');
  });
});

describe('seguridad: HTML no inyectable', () => {
  it('escapa </script> en nombres embebidos en graph.html', async () => {
    const { toHtml } = await import('../src/outputs/html.ts');
    const graph = {
      meta: { source: '</script><img src=x onerror=alert(1)>', generatedAt: 'x', languages: ['ts'], counts: { nodes: 1, edges: 0 } },
      nodes: [{ id: 'a</script>', kind: 'function' as const, name: '</script>evil', file: 'a.ts', line: 1, endLine: 1, module: '.', lang: 'ts', exported: true }],
      edges: [],
    };
    const html = toHtml(graph);
    // The data's </script> must not appear raw inside the data <script>
    expect(html).not.toContain('"name":"</script>');
    expect(html).toContain('\\u003c/script>');
  });
});

describe('coverage: anonymous default export', () => {
  it('gives it a node named after the file', async () => {
    const { TypeScriptConnector } = await import('../src/connectors/typescript/index.ts');
    const c = new TypeScriptConnector();
    const { nodes } = await c.extract(['src/AnonPage.tsx'], root);
    const n = nodes.find((x) => x.id === 'src/AnonPage.tsx::default');
    expect(n?.name).toBe('AnonPage');
    expect(n?.exported).toBe(true);
  });
});
