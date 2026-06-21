import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { TypeScriptConnector } from '../src/connectors/typescript/index.ts';
import { GraphBuilder } from '../src/model/graph.ts';
import type { Graph } from '../src/model/types.ts';
import { impact, neighbors, shortestPath } from '../src/query/query.ts';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');
let graph: Graph;

beforeAll(async () => {
  const connector = new TypeScriptConnector();
  const files = ['src/db.ts', 'src/models.ts', 'src/auth.ts'];
  const fragment = await connector.extract(connector.match(files), root);
  graph = new GraphBuilder().addFragment(fragment).build({ source: 'fixtures', generatedAt: 'fixed' });
});

describe('impact', () => {
  it('lists real dependents (extends), without file containment', () => {
    const res = impact(graph, 'BaseUser')!;
    const names = res.dependents.map((d) => `${d.node.name}:${d.edge.kind}`);
    expect(names).toContain('Admin:extends');
    expect(res.dependents.every((d) => d.edge.kind !== 'contains')).toBe(true);
  });

  it('detects who calls a function', () => {
    const res = impact(graph, 'makePool')!;
    expect(res.dependents.some((d) => d.node.name === 'login' && d.edge.kind === 'calls')).toBe(true);
  });
});

describe('neighbors', () => {
  it('excludes the file->symbol edge from "used by"', () => {
    const res = neighbors(graph, 'DatabasePool')!;
    const incomingFiles = res.incoming.map((i) => i.node.kind);
    expect(incomingFiles).not.toContain('file');
    // makePool does `new DatabasePool()` -> real incoming reference
    expect(res.incoming.some((i) => i.node.name === 'makePool')).toBe(true);
  });
});

describe('disambiguation', () => {
  it('reports alternatives when a name matches multiple symbols', () => {
    // `id` exists as a method in Identifiable and BaseUser
    const res = neighbors(graph, 'id')!;
    expect(res.alternatives.length).toBeGreaterThanOrEqual(1);
  });
});

describe('shortestPath', () => {
  it('finds the path between two symbols', () => {
    const p = shortestPath(graph, 'login', 'connect');
    expect(p?.map((n) => n.name)).toEqual(['login', 'connect']);
  });
});
