import fs from 'node:fs';
import path from 'node:path';

/** Maps a declared dependency (exact package name) to a human framework label.
 *  Allowlist on purpose: a guess is worse than nothing for "what is this repo".
 *  Scoped to APP frameworks (what the repo is built ON) — not bundlers or test
 *  runners, which are tooling and would muddy the "what is this" signal. */
const FRAMEWORK_BY_DEP: Record<string, string> = {
  next: 'Next.js',
  react: 'React',
  'react-native': 'React Native',
  vue: 'Vue',
  '@angular/core': 'Angular',
  svelte: 'Svelte',
  '@sveltejs/kit': 'SvelteKit',
  'solid-js': 'Solid',
  preact: 'Preact',
  astro: 'Astro',
  nuxt: 'Nuxt',
  electron: 'Electron',
  express: 'Express',
  fastify: 'Fastify',
  '@nestjs/core': 'NestJS',
  koa: 'Koa',
  '@hapi/hapi': 'hapi',
  '@remix-run/react': 'Remix',
  gatsby: 'Gatsby',
};

/** All dependency sections, so a framework declared only as a devDependency still counts. */
const DEP_SECTIONS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
] as const;

/**
 * Detects the frameworks a repo uses from its root `package.json` dependencies.
 * Surfaced in the graph metadata so `survey_repo` can say "this is a Next.js app"
 * up front, before any file is opened. Returns a sorted, de-duplicated list;
 * empty if there's no readable manifest or no known framework.
 */
export function detectFrameworks(root: string): Array<string> {
  let manifest: Record<string, unknown>;

  try {
    manifest = JSON.parse(
      fs.readFileSync(path.join(root, 'package.json'), 'utf8'),
    ) as Record<string, unknown>;
  } catch {
    return [];
  }

  const found = new Set<string>();

  for (const section of DEP_SECTIONS) {
    const deps = manifest[section];

    if (deps && typeof deps === 'object') {
      for (const dep of Object.keys(deps)) {
        const label = FRAMEWORK_BY_DEP[dep];

        if (label) {
          found.add(label);
        }
      }
    }
  }

  return Array.from(found).sort();
}
