import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { TypeScriptConnector } from '../src/connectors/typescript/index.ts';
import { GraphBuilder } from '../src/model/graph.ts';
import type { GraphEdge } from '../src/model/types.ts';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');

async function fragment() {
  const connector = new TypeScriptConnector();
  const files = ['src/db.ts', 'src/models.ts', 'src/auth.ts'];
  return connector.extract(connector.match(files), root);
}

function hasEdge(edges: GraphEdge[], from: string, kind: string, to: string): boolean {
  return edges.some((e) => e.from === from && e.kind === kind && e.to === to);
}

describe('TypeScriptConnector', () => {
  it('registers file and symbol nodes', async () => {
    const { nodes } = await fragment();
    const ids = new Set(nodes.map((n) => n.id));
    expect(ids.has('src/db.ts')).toBe(true);
    expect(ids.has('src/db.ts::DatabasePool')).toBe(true);
    expect(ids.has('src/db.ts::DatabasePool.connect')).toBe(true);
    expect(ids.has('src/db.ts::makePool')).toBe(true);
    expect(ids.has('src/models.ts::Identifiable')).toBe(true);
    expect(ids.has('src/auth.ts::login')).toBe(true);
  });

  it('marks exported and lang correctly', async () => {
    const { nodes } = await fragment();
    const pool = nodes.find((n) => n.id === 'src/db.ts::DatabasePool')!;
    expect(pool.exported).toBe(true);
    expect(pool.lang).toBe('ts');
    expect(pool.kind).toBe('class');
  });

  it('extracts contains (file -> symbol)', async () => {
    const { edges } = await fragment();
    expect(hasEdge(edges, 'src/db.ts', 'contains', 'src/db.ts::DatabasePool')).toBe(true);
    expect(hasEdge(edges, 'src/db.ts::DatabasePool', 'contains', 'src/db.ts::DatabasePool.connect')).toBe(true);
  });

  it('extracts imports resolved to the target file', async () => {
    const { edges } = await fragment();
    expect(hasEdge(edges, 'src/auth.ts', 'imports', 'src/db.ts')).toBe(true);
    expect(hasEdge(edges, 'src/auth.ts', 'imports', 'src/models.ts')).toBe(true);
  });

  it('extracts extends and implements', async () => {
    const { edges } = await fragment();
    expect(hasEdge(edges, 'src/models.ts::Admin', 'extends', 'src/models.ts::BaseUser')).toBe(true);
    expect(hasEdge(edges, 'src/models.ts::BaseUser', 'implements', 'src/models.ts::Identifiable')).toBe(true);
  });

  it('resolves calls with the type-checker (cross-file and methods)', async () => {
    const { edges } = await fragment();
    expect(hasEdge(edges, 'src/auth.ts::login', 'calls', 'src/db.ts::makePool')).toBe(true);
    expect(hasEdge(edges, 'src/auth.ts::login', 'calls', 'src/db.ts::DatabasePool.connect')).toBe(true);
    expect(hasEdge(edges, 'src/auth.ts::login', 'calls', 'src/models.ts::Admin.role')).toBe(true);
  });

  it('resolves new as a reference to the class', async () => {
    const { edges } = await fragment();
    expect(hasEdge(edges, 'src/auth.ts::login', 'references', 'src/models.ts::Admin')).toBe(true);
  });
});

describe('JSX (React components)', () => {
  it('captures <Comp/> as a renders edge, even with a renamed default import', async () => {
    const connector = new TypeScriptConnector();
    const files = ['src/Parent.tsx', 'src/Child.tsx'];
    const { edges } = await connector.extract(connector.match(files), root);
    // Parent renders <ChildComponent/> (alias of the Child default export)
    expect(hasEdge(edges, 'src/Parent.tsx::Parent', 'renders', 'src/Child.tsx::Child')).toBe(true);
    // Intrinsic tags (<div>, <span>) do not generate edges
    expect(edges.some((e) => e.kind === 'renders' && e.to.includes('div'))).toBe(false);
  });
});

describe('GraphBuilder', () => {
  it('produces deterministic output and complete metadata', async () => {
    const frag = await fragment();
    const g1 = new GraphBuilder().addFragment(frag).build({ source: 'x', generatedAt: 'fixed' });
    const g2 = new GraphBuilder().addFragment(frag).build({ source: 'x', generatedAt: 'fixed' });
    expect(JSON.stringify(g1)).toBe(JSON.stringify(g2));
    expect(g1.meta.languages).toEqual(['ts']);
    expect(g1.meta.counts.nodes).toBe(g1.nodes.length);
  });
});
