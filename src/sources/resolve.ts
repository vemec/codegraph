import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export interface ResolvedSource {
  /** Absolute root where the code to analyze lives. */
  root: string;
  /** Relative (posix) files eligible for parsing. */
  files: string[];
  /** How the source was requested (for metadata). */
  source: string;
  /** Commit SHA, if this is a git repo. */
  commit?: string;
  /** true if there are uncommitted changes in the analyzed path. */
  dirty?: boolean;
  /** If cloned to a temp dir, function used to clean it up. */
  cleanup?: () => void;
}

const GITHUB_URL = /^https?:\/\/github\.com\//i;
const ORG_REPO = /^[\w.-]+\/[\w.-]+$/;

/** Dirs that are almost always noise: build, deps, version control. */
export const DEFAULT_IGNORED_DIRS = [
  'node_modules', '.git', 'dist', 'build', 'out', 'coverage', '.next', 'vendor',
];
/** Test/mock dirs: noise for the production code relationship graph. */
export const TEST_DIRS = ['__tests__', '__mocks__', '__snapshots__', 'tests', 'test'];
const TEST_FILE = /\.(spec|test)\.[mc]?[jt]sx?$/;

export interface SourceOptions {
  /** Extra dirs to ignore, in addition to the defaults. */
  ignore?: string[];
  /** Include test files and dirs (excluded by default). */
  includeTests?: boolean;
}

function git(cwd: string, args: string[]): string | undefined {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return undefined;
  }
}

function gitSha(cwd: string): string | undefined {
  return git(cwd, ['rev-parse', 'HEAD']);
}

/** Are there uncommitted changes in `dir` (scoped to that path)? undefined if not a repo.
 * Scoping to the path is what makes analyzing a subdirectory correct. */
function gitDirty(dir: string): boolean | undefined {
  if (gitSha(dir) === undefined) return undefined;
  const status = git(dir, ['status', '--porcelain', '--', '.']);
  return status === undefined ? undefined : status.length > 0;
}

function listFiles(root: string, options: SourceOptions = {}): string[] {
  const ignored = new Set([
    ...DEFAULT_IGNORED_DIRS,
    ...(options.includeTests ? [] : TEST_DIRS),
    ...(options.ignore ?? []),
  ]);
  const out: string[] = [];
  const seen = new Set<string>(); // realpaths visitados: corta ciclos de symlinks
  const walk = (dir: string): void => {
    let real: string;
    try {
      real = fs.realpathSync(dir);
    } catch {
      return; // symlink roto / permiso denegado: lo saltamos en vez de explotar
    }
    if (seen.has(real)) return;
    seen.add(real);
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (ignored.has(entry.name)) continue;
        walk(path.join(dir, entry.name));
      } else if (entry.isFile()) {
        if (!options.includeTests && TEST_FILE.test(entry.name)) continue;
        out.push(path.relative(root, path.join(dir, entry.name)).split(path.sep).join('/'));
      }
    }
  };
  walk(root);
  return out.sort();
}

function cloneRepo(url: string, options: SourceOptions): ResolvedSource {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'codegraph-'));
  try {
    execFileSync('git', ['clone', '--depth', '1', url, tmp], { stdio: 'pipe' });
  } catch {
    fs.rmSync(tmp, { recursive: true, force: true });
    throw new Error(`Could not clone ${url}. Check the URL and your access to the repo.`);
  }
  return {
    root: tmp,
    files: listFiles(tmp, options),
    source: url,
    commit: gitSha(tmp),
    cleanup: () => fs.rmSync(tmp, { recursive: true, force: true }),
  };
}

/**
 * Resolves the source to a local root + file list. Accepts:
 *  - local path (relative or absolute) to a directory
 *  - GitHub URL (https://github.com/org/repo) -> clones it into a temp dir
 *  - "org/repo" shortcut -> assumes GitHub
 */
export function resolveSource(input: string, options: SourceOptions = {}): ResolvedSource {
  if (GITHUB_URL.test(input)) {
    return cloneRepo(input.replace(/\.git$/, '') + '.git', options);
  }

  const local = path.resolve(input);
  if (fs.existsSync(local) && fs.statSync(local).isDirectory()) {
    return {
      root: local,
      files: listFiles(local, options),
      source: input,
      commit: gitSha(local),
      dirty: gitDirty(local),
    };
  }

  if (ORG_REPO.test(input)) {
    return cloneRepo(`https://github.com/${input}.git`, options);
  }

  throw new Error(
    `Unrecognized source: "${input}". Use a local path, a GitHub URL, or the org/repo shortcut.`,
  );
}
