import pkg from '../package.json' with { type: 'json' };

/** Single source of truth for the package version — used by the CLI (`--version`,
 *  help, banner) and the MCP server handshake. Inlined from package.json at build
 *  time, so there's nothing to keep in sync by hand. */
export const VERSION: string = pkg.version;
