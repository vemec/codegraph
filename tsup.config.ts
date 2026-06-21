import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli.ts', 'src/index.ts'],
  format: ['esm'],
  target: 'node20',
  clean: true,
  dts: true,
  // ts-morph queda como dependencia externa (no se bundlea): es pesada y se
  // resuelve desde node_modules en runtime.
  external: ['ts-morph'],
});
