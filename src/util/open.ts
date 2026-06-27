import { spawn } from 'node:child_process';

/**
 * Opens a file (or URL) in the OS default application — used to pop the Graph
 * Explorer in the human's browser, from the CLI or, crucially, from the MCP
 * server (which runs on the human's machine, so the agent can open it for them).
 *
 * Detached + unref'd so we never block the caller (the agent's stdio loop, or the
 * CLI). Returns false if no opener could be launched, so the caller can fall back
 * to printing the path.
 */
export function openInBrowser(target: string): boolean {
  let opener: { cmd: string; args: Array<string> };

  if (process.platform === 'darwin') {
    opener = { cmd: 'open', args: [target] };
  } else if (process.platform === 'win32') {
    opener = { cmd: 'cmd', args: ['/c', 'start', '', target] };
  } else {
    opener = { cmd: 'xdg-open', args: [target] };
  }

  try {
    const child = spawn(opener.cmd, opener.args, {
      stdio: 'ignore',
      detached: true,
    });

    child.on('error', () => {}); // swallow ENOENT (no opener on a headless box)
    child.unref();

    return true;
  } catch {
    return false;
  }
}
