import type { Graph, GraphMeta } from '../model/types.js';

import fs from 'node:fs';
import path from 'node:path';

import { EXPLORER_CLIENT } from './explorer-client.generated.js';
export { moduleGroup } from '../model/modules.js';

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
};

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => HTML_ESCAPES[c]!);
}

/** Serializes for embedding inside <script>: escapes `<` (which would cut
 *  `</script>`) and the line separators U+2028/U+2029 (which break JS literals),
 *  without altering the value parsed back when read. */
function embedJson(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/** Extracts a human-readable repo/folder name from the graph metadata. */
function repoName(meta: GraphMeta): string {
  // GitHub URL: https://github.com/org/repo[.git]
  const ghMatch = /github\.com\/[\w.-]+\/([\w.-]+)/i.exec(meta.source);

  if (ghMatch) {
    return ghMatch[1]!.replace(/\.git$/, '');
  }

  // "org/repo" shorthand
  const shortMatch = /^[\w.-]+\/([\w.-]+)$/.exec(meta.source);

  if (shortMatch) {
    return shortMatch[1]!;
  }

  // Local path — prefer absolute root for a reliable basename
  return path.basename(meta.root ?? meta.source) || meta.source;
}

export interface DiffInfo {
  base: string;
  head: string;
  changedIds: Array<string>;
  impactedIds: Array<string>;
}

export interface HtmlOptions {
  diff?: DiffInfo;
}

const MAX_SRC_LINES = 80;
const MAX_SRC_TOTAL = 1_400_000;

function buildSourceMap(graph: Graph): Record<string, string> {
  const { root } = graph.meta;

  if (!root) {
    return {};
  }

  // Group embeddable nodes by file so each file is read only once.
  type NodeSlice = { id: string; line: number; endLine: number };

  const byFile = new Map<string, Array<NodeSlice>>();

  for (const n of graph.nodes) {
    const embeddable =
      n.line > 0 &&
      n.endLine > n.line &&
      n.kind !== 'external' &&
      n.kind !== 'file' &&
      n.endLine - n.line <= MAX_SRC_LINES;

    if (embeddable) {
      const bucket = byFile.get(n.file) ?? byFile.set(n.file, []).get(n.file)!;

      bucket.push({ id: n.id, line: n.line, endLine: n.endLine });
    }
  }

  const map: Record<string, string> = {};

  let total = 0;

  for (const [file, slices] of byFile) {
    if (total > MAX_SRC_TOTAL) {
      break;
    }

    try {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const lines = fs.readFileSync(path.join(root, file), 'utf8').split('\n');

      for (const { id, line, endLine } of slices) {
        const snippet = lines.slice(line - 1, endLine).join('\n');

        map[id] = snippet;
        total += snippet.length;
      }
    } catch {
      // file not readable, skip all slices from this file
    }
  }

  return map;
}

/**
 * The Graph Explorer: a single, self-contained HTML page that renders the Code
 * Graph with Sigma (WebGL) + graphology — for a human to see the shape of a
 * codebase and explore relationships by hand. It ships fully OFFLINE: the Sigma
 * client is bundled (see `scripts/build-explorer.mjs`) and inlined here, no CDN.
 *
 * The full graph is embedded as `window.__GRAPH__`; all the interaction logic
 * (progressive expand/collapse, stable layout, search, info panel, edge filters)
 * lives in `src/explorer/client.ts`. This function only assembles the shell.
 */
export function toHtml(graph: Graph, options: HtmlOptions = {}): string {
  const sourceMap = buildSourceMap(graph);
  const data = embedJson({
    nodes: graph.nodes,
    edges: graph.edges,
    meta: graph.meta,
  });

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Code Graph — ${escapeHtml(graph.meta.source)}</title>
<style>
  :root {
    color-scheme: dark;
    --bg:#0d1117; --panel:#0b0f14; --card:#161b22; --card-2:#1c2230;
    --line:#21262d; --line-2:#30363d; --ink:#e6edf3; --muted:#8b949e; --faint:#6e7681;
    --accent:#58a6ff; --ok:#3fb950; --radius:10px;
  }
  * { box-sizing: border-box; }
  html, body { height: 100%; margin: 0; }
  body { font: 13px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; background: var(--bg); color: var(--ink); }
  #graph { position: absolute; inset: 0; left: 340px; }

  /* ---- panel shell ---- */
  #panel { position: absolute; top: 0; bottom: 0; left: 0; width: 340px; display: flex; flex-direction: column; background: var(--panel); border-right: 1px solid var(--line); }
  .panel-head { padding: 16px 16px 12px; border-bottom: 1px solid var(--line); }
  .panel-body { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 12px; }
  .panel-foot { padding: 12px 14px; border-top: 1px solid var(--line); }
  .panel-body::-webkit-scrollbar { width: 10px; }
  .panel-body::-webkit-scrollbar-thumb { background: #21262d; border-radius: 6px; border: 2px solid var(--panel); }
  .panel-body::-webkit-scrollbar-thumb:hover { background: #30363d; }

  .brand { display: flex; align-items: center; gap: 9px; min-width: 0; }
  .brand-text { min-width: 0; }
  .brand b { font-size: 15px; font-weight: 700; letter-spacing: -.01em; }
  .brand .dim { color: var(--faint); font-weight: 400; }
  .repo-name { color: var(--accent); font-size: 12px; font-weight: 600; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  #metaline { color: var(--muted); font-size: 11px; margin-top: 7px; }
  .muted { color: var(--muted); }

  /* ---- search ---- */
  .searchbox { position: relative; }
  #search { width: 100%; padding: 9px 11px; background: var(--card); border: 1px solid var(--line-2); border-radius: 8px; color: var(--ink); font: inherit; transition: border-color .15s, box-shadow .15s; }
  #search::placeholder { color: var(--faint); }
  #search:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px rgba(88,166,255,.15); }
  #ac { position: absolute; left: 0; right: 0; top: calc(100% + 4px); z-index: 20; background: var(--card); border: 1px solid var(--line-2); border-radius: 8px; max-height: 260px; overflow-y: auto; display: none; box-shadow: 0 8px 24px rgba(0,0,0,.4); }
  #ac div { padding: 7px 11px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
  #ac div:hover, #ac div.sel { background: var(--card-2); }
  #ac .k { color: var(--faint); font-size: 10px; text-transform: uppercase; letter-spacing: .04em; }

  /* ---- cards / sections ---- */
  .card { background: var(--card); border: 1px solid var(--line); border-radius: var(--radius); padding: 12px; }
  .card-head { display: flex; justify-content: space-between; align-items: center; font-size: 10.5px; text-transform: uppercase; letter-spacing: .07em; color: var(--muted); font-weight: 600; margin-bottom: 10px; }
  .badge { background: var(--card-2); color: var(--muted); border-radius: 20px; padding: 1px 9px; font-size: 10px; font-weight: 600; }

  /* ---- modules list ---- */
  #moduleList { max-height: 230px; overflow-y: auto; margin: -3px; padding: 3px; }
  #moduleList .mod { display: flex; align-items: center; gap: 8px; padding: 5px 7px; cursor: pointer; border-radius: 7px; transition: background .12s; }
  #moduleList .mod:hover { background: var(--card-2); }
  #moduleList .mod.on { background: rgba(88,166,255,.1); color: var(--accent); font-weight: 600; }
  #moduleList .sw { width: 11px; height: 11px; border-radius: 50%; flex: 0 0 auto; }
  #moduleList .count { margin-left: auto; color: var(--faint); font-size: 10px; }

  /* ---- relationships + toggles ---- */
  #edgeFilters label, .toggle { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 4px 2px; user-select: none; }
  #edgeFilters input, .toggle input { accent-color: var(--accent); }
  #edgeFilters .count { margin-left: auto; color: var(--faint); font-size: 10px; }
  #layerLegend { margin: 6px 0 2px 24px; display: flex; flex-direction: column; gap: 5px; }
  #layerLegend .legend-row { display: flex; align-items: center; gap: 8px; font-size: 12px; }
  #layerLegend .sw { width: 11px; height: 11px; border-radius: 50%; flex: 0 0 auto; }
  #layerLegend small { color: var(--faint); font-size: 10px; }

  /* ---- info card ---- */
  #info { background: var(--card); border: 1px solid var(--line); border-radius: var(--radius); padding: 13px; word-break: break-word; }
  #info.empty { color: var(--muted); }
  #info .hint-row { display: flex; gap: 9px; align-items: flex-start; padding: 5px 0; }
  #info .hint-row .ico { color: var(--accent); flex: 0 0 auto; }
  .node-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .kind { font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; padding: 2px 7px; border-radius: 6px; color: #0d1117; }
  .node-name { font-size: 15px; font-weight: 700; word-break: break-all; }
  .loc { display: inline-flex; align-items: center; gap: 5px; margin-top: 8px; color: var(--accent); font-size: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; text-decoration: none; }
  .loc:hover { text-decoration: underline; }
  .loc.plain { color: var(--muted); }
  .sig { margin-top: 8px; }
  .sig code { display: block; background: var(--card-2); border: 1px solid var(--line); border-radius: 6px; padding: 6px 8px; font-size: 11px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--accent); white-space: pre-wrap; word-break: break-word; }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
  .chip { background: var(--card-2); border: 1px solid var(--line); border-radius: 6px; padding: 2px 8px; font-size: 11px; color: var(--muted); }
  .chip.ok { color: var(--ok); border-color: rgba(63,185,80,.35); }
  .actions { display: flex; flex-direction: column; gap: 8px; margin-top: 13px; }
  .action { text-align: left; background: var(--card-2); border: 1px solid var(--line-2); border-radius: 8px; padding: 9px 11px; cursor: pointer; color: var(--ink); font: inherit; transition: border-color .12s, background .12s; }
  .action:hover { background: #232b3a; border-color: var(--accent); }
  .action b { display: block; font-size: 12.5px; font-weight: 600; }
  .action small { display: block; color: var(--muted); font-size: 11px; margin-top: 1px; }
  .rel-head { display: flex; justify-content: space-between; margin: 14px 0 4px; font-size: 10.5px; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); font-weight: 600; }
  .rel { display: flex; align-items: center; gap: 8px; padding: 4px 6px; margin: 0 -6px; border-radius: 7px; cursor: pointer; transition: background .12s; }
  .rel:hover { background: var(--card-2); }
  .rel .ek { font-size: 8.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .03em; padding: 2px 6px; border-radius: 5px; flex: 0 0 auto; min-width: 64px; text-align: center; }
  .rel .rn { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  /* ---- buttons ---- */
  .btn { width: 100%; padding: 9px; background: var(--card); color: var(--ink); border: 1px solid var(--line-2); border-radius: 8px; cursor: pointer; font: inherit; transition: background .12s, border-color .12s; }
  .btn:hover { background: var(--card-2); border-color: var(--faint); }

  #hint { position: absolute; bottom: 12px; left: 352px; color: var(--muted); font-size: 11px; background: rgba(13,17,23,.85); backdrop-filter: blur(4px); padding: 6px 11px; border: 1px solid var(--line); border-radius: 7px; }

  /* breadcrumb of expanded modules — "where am I" */
  #context { position: absolute; top: 12px; left: 352px; right: 12px; display: flex; flex-wrap: wrap; gap: 6px; align-items: center; pointer-events: none; }
  #context .ctx-label { color: var(--muted); font-size: 11px; }
  #context .ctx-chip { pointer-events: auto; display: inline-flex; align-items: center; gap: 7px; background: rgba(22,27,34,.92); backdrop-filter: blur(4px); border: 1px solid var(--line-2); border-radius: 20px; padding: 4px 11px; font-size: 12px; cursor: pointer; transition: border-color .12s; }
  #context .ctx-chip:hover { border-color: var(--accent); }
  #context .ctx-chip .sw { width: 9px; height: 9px; border-radius: 50%; flex: 0 0 auto; }
  #context .ctx-chip .x { color: var(--faint); font-size: 13px; line-height: 1; }
  #context .ctx-chip:hover .x { color: var(--ink); }
  .src-block{margin-top:10px;background:#010409;border:1px solid var(--line);border-radius:8px;overflow:auto;max-height:220px}
  .src-block pre{margin:0;padding:10px 12px;font:11px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre}
  .src-kw{color:#ff7b72}.src-st{color:#a5d6ff}.src-cm{color:#8b949e;font-style:italic}.src-nm{color:#79c0ff}
  .src-ln{color:#484f58;user-select:none;display:inline-block;width:2.4em;text-align:right;margin-right:10px;border-right:1px solid #21262d;padding-right:6px}
  #diffToggleWrap{margin-bottom:2px}
</style>
</head>
<body>
<div id="panel">
  <div class="panel-head">
    <div class="brand">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" style="flex:0 0 auto">
        <line x1="6" y1="17" x2="12" y2="6.5" stroke="#30363d" stroke-width="1.6"/>
        <line x1="12" y1="6.5" x2="18" y2="15" stroke="#30363d" stroke-width="1.6"/>
        <line x1="6" y1="17" x2="18" y2="15" stroke="#30363d" stroke-width="1.6"/>
        <circle cx="12" cy="6.5" r="3.1" fill="#58a6ff"/>
        <circle cx="6" cy="17" r="2.6" fill="#a371f7"/>
        <circle cx="18" cy="15" r="2.6" fill="#3fb950"/>
      </svg>
      <div class="brand-text">
        <b>code<span class="dim">graph</span></b>
        <div class="repo-name" title="${escapeHtml(graph.meta.source)}">${escapeHtml(repoName(graph.meta))}</div>
      </div>
    </div>
    <div id="metaline"></div>
  </div>

  <div class="panel-body">
    <div class="searchbox">
      <input type="search" id="search" placeholder="Search a symbol…" autocomplete="off" />
      <div id="ac"></div>
    </div>

    <section id="info" class="empty"></section>

    <section class="card">
      <div class="card-head"><span>Filters</span></div>
      <div style="display:flex;align-items:center;gap:8px;font-size:12px;padding:2px 0">
        <span style="color:var(--muted)">Min connections</span>
        <input type="range" id="minDeg" min="0" max="20" value="0" style="flex:1;accent-color:var(--accent)">
        <span id="minDegVal" style="color:var(--faint);font-size:11px;min-width:14px;text-align:right">0</span>
      </div>
      <input type="text" id="moduleFilter" placeholder="Module regex filter…" style="width:100%;margin-top:6px;padding:6px 9px;background:var(--card-2);border:1px solid var(--line-2);border-radius:6px;color:var(--ink);font:11px ui-monospace,SFMono-Regular,Menlo,monospace" />
    </section>

    <section class="card">
      <div class="card-head"><span>Modules</span><span class="badge" id="visN">0</span></div>
      <div id="moduleList"></div>
    </section>

    <section class="card">
      <div class="card-head"><span>Relationships</span></div>
      <div id="edgeFilters"></div>
    </section>

    <section class="card">
      <div class="card-head"><span>Display</span></div>
      <div id="diffToggleWrap" style="display:none">
        <label class="toggle"><input type="checkbox" id="diffMode"><span style="display:flex;flex-direction:column;gap:2px"><span>Diff <span id="diffLabel" style="color:var(--accent);font-size:10px"></span></span><span style="color:var(--faint);font-size:10px">changed=amber · impacted=red</span></span></label>
      </div>
      <label class="toggle"><input type="checkbox" id="showExternals"><span>External dependencies</span></label>
      <label class="toggle"><input type="checkbox" id="colorByLayer"><span>Colour by architectural layer</span></label>
      <div id="layerLegend" style="display:none">
        <div class="legend-row"><span class="sw" style="background:#f85149"></span>Application <small>unstable — edge / app code</small></div>
        <div class="legend-row"><span class="sw" style="background:#d29922"></span>Intermediate <small>balanced coupling</small></div>
        <div class="legend-row"><span class="sw" style="background:#1f6feb"></span>Foundation <small>stable — used widely, change carefully</small></div>
      </div>
    </section>
  </div>

  <div class="panel-foot">
    <button id="reset" class="btn">Reset view</button>
  </div>
</div>
<div id="graph"></div>
<div id="context"></div>
<div id="hint">/ = search · Esc = deselect · drag a node · scroll = zoom · click a module to expand · click a symbol to explore</div>
<script>${options.diff ? `window.__DIFF__ = ${embedJson(options.diff)};` : ''}window.__SOURCES__ = ${embedJson(sourceMap)};window.__GRAPH__ = ${data};</script>
<script>${EXPLORER_CLIENT}</script>
</body>
</html>
`;
}
