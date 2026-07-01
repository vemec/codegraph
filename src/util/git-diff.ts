import { execFileSync } from 'node:child_process';

/** Returns the list of files modified between two git refs (relative to the repo root). */
export function getChangedFiles(
  cwd: string,
  base = 'HEAD~1',
  head = 'HEAD',
): Array<string> {
  try {
    const out = execFileSync(
      'git',
      ['diff', '--name-only', `${base}..${head}`],
      { cwd, encoding: 'utf8', timeout: 10_000 },
    );

    return out.split('\n').filter(Boolean);
  } catch (err) {
    throw new Error(
      `git diff failed in "${cwd}": ${err instanceof Error ? err.message : String(err)}. Is this a git repository?`,
    );
  }
}
