import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { resolveSource } from '../src/sources/resolve.ts';

let root: string;

beforeAll(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'cg-opts-'));
  fs.mkdirSync(path.join(root, 'src'));
  fs.mkdirSync(path.join(root, 'generated'));
  fs.writeFileSync(path.join(root, 'src/a.ts'), 'export const a = 1;');
  fs.writeFileSync(path.join(root, 'src/a.spec.ts'), 'test("x", () => {});');
  fs.writeFileSync(path.join(root, 'generated/big.ts'), 'export const g = 1;');
});
afterAll(() => fs.rmSync(root, { recursive: true, force: true }));

describe('SourceOptions', () => {
  it('excluye tests por defecto', () => {
    const files = resolveSource(root).files;
    expect(files).toContain('src/a.ts');
    expect(files).not.toContain('src/a.spec.ts');
  });

  it('incluye tests con includeTests', () => {
    const files = resolveSource(root, { includeTests: true }).files;
    expect(files).toContain('src/a.spec.ts');
  });

  it('respeta dirs extra en ignore', () => {
    const files = resolveSource(root, { ignore: ['generated'] }).files;
    expect(files).not.toContain('generated/big.ts');
    expect(files).toContain('src/a.ts');
  });

  it('dirty es undefined cuando la fuente no es un repo git', () => {
    // root es un tmpdir sin git init
    expect(resolveSource(root).dirty).toBeUndefined();
    expect(resolveSource(root).commit).toBeUndefined();
  });
});
