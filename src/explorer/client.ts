/* eslint-disable import/no-extraneous-dependencies */
/**
 * Graph Explorer — the human-facing, interactive visualization of a Code Graph.
 *
 * Bundled by `scripts/build-explorer.mjs` (esbuild, IIFE) with Sigma + graphology
 * inlined, then embedded into `graph.html` by `src/outputs/html.ts`. It runs fully
 * offline: no CDN, no network. The full graph is injected as `window.__GRAPH__`.
 *
 * Model: a progressive, expandable MIXED graph. It starts with one super-node per
 * Module (folder group) and the aggregated dependency edges between modules. From
 * there the human "shows more" through two doors:
 *   - expand a module  -> reveals its member nodes (files + symbols);
 *   - expand a symbol  -> reveals its direct neighbors (1 hop, incremental).
 * Edges that point into something still collapsed are aggregated onto its module
 * super-node and resolve when that module is expanded. `contains` is never drawn —
 * containment IS the expansion hierarchy. Layout is stable: existing nodes keep
 * their position, only freshly revealed nodes are placed (around their parent);
 * never a global re-layout, which disorients.
 */
import { EdgeCurvedArrowProgram } from '@sigma/edge-curve';
import { createNodeBorderProgram } from '@sigma/node-border';
import Graph from 'graphology';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import Sigma from 'sigma';

import { MODULE_GROUP_DEPTH, moduleGroup } from '../model/modules.js';

interface RawNode {
  id: string;
  kind: string;
  name: string;
  file: string;
  line: number;
  module: string;
  lang: string;
  exported: boolean;
  signature?: string;
}

interface RawEdge {
  from: string;
  to: string;
  kind: string;
  confidence: string;
}

interface RawGraph {
  nodes: Array<RawNode>;
  edges: Array<RawEdge>;
  meta: {
    source: string;
    root?: string;
    languages: Array<string>;
    counts: { nodes: number; edges: number };
    dirty?: boolean;
  };
}

declare global {
  interface Window {
    __GRAPH__: RawGraph;
  }
}

// eslint-disable-next-line no-underscore-dangle
const RAW = window.__GRAPH__;

/** Drawn edge kinds = dependency only. `contains` is the expansion hierarchy. */
const DRAWN_KINDS = [
  'imports',
  'calls',
  'renders',
  'extends',
  'implements',
  'references',
];
const EDGE_COLORS: Record<string, string> = {
  imports: '#1f6feb',
  calls: '#3fb950',
  renders: '#f0883e',
  extends: '#a371f7',
  implements: '#d29922',
  references: '#db61a2',
  mixed: '#6e7681',
};
const PALETTE = [
  '#58a6ff',
  '#3fb950',
  '#d29922',
  '#a371f7',
  '#db61a2',
  '#f0883e',
  '#56d4dd',
  '#e34c26',
  '#8957e5',
  '#2ea043',
  '#bc8cff',
  '#39c5cf',
];

const groupOf = (module: string): string =>
  moduleGroup(module, MODULE_GROUP_DEPTH);

// ---- precomputed indexes over the full (static) graph ----
const byId = new Map<string, RawNode>(RAW.nodes.map((n) => [n.id, n]));
const groupNames = Array.from(
  new Set(
    RAW.nodes
      .filter((n) => n.kind !== 'external')
      .map((n) => groupOf(n.module)),
  ),
).sort();
const colorOfGroup = (g: string) =>
  PALETTE[groupNames.indexOf(g) % PALETTE.length]!;

const membersOfGroup = new Map<string, Array<string>>();

for (const n of RAW.nodes) {
  if (n.kind !== 'external') {
    const g = groupOf(n.module);

    (membersOfGroup.get(g) ?? membersOfGroup.set(g, []).get(g)!).push(n.id);
  }
}

const drawnEdges = RAW.edges.filter((e) => DRAWN_KINDS.includes(e.kind));
const degree = new Map<string, number>();
const neighbors = new Map<string, Set<string>>();

type EdgeEntry = { out: Array<RawEdge>; inc: Array<RawEdge> };

const edgesByNode = new Map<string, EdgeEntry>();

for (const e of drawnEdges) {
  degree.set(e.from, (degree.get(e.from) ?? 0) + 1);
  degree.set(e.to, (degree.get(e.to) ?? 0) + 1);
  (neighbors.get(e.from) ?? neighbors.set(e.from, new Set()).get(e.from)!).add(
    e.to,
  );
  (neighbors.get(e.to) ?? neighbors.set(e.to, new Set()).get(e.to)!).add(
    e.from,
  );
  (
    edgesByNode.get(e.from) ??
    edgesByNode.set(e.from, { out: [], inc: [] }).get(e.from)!
  ).out.push(e);
  (
    edgesByNode.get(e.to) ??
    edgesByNode.set(e.to, { out: [], inc: [] }).get(e.to)!
  ).inc.push(e);
}

// ---- architectural layers (Robert Martin's instability, measured per module group) ----
// I = fanOut / (fanIn + fanOut): high = depends on many / used by few (application/edge),
// low = used widely / depends on little (foundation). The same metric survey_repo prints,
// computed here over the drawn (dependency) edges so the canvas can be coloured by layer.
type Layer = 'Application' | 'Foundation' | 'Intermediate';

const LAYER_COLORS: Record<Layer, string> = {
  Application: '#f85149',
  Intermediate: '#d29922',
  Foundation: '#1f6feb',
};
const layerByGroup = new Map<string, Layer>();

{
  const gFanIn = new Map<string, number>();
  const gFanOut = new Map<string, number>();

  for (const e of drawnEdges) {
    const a = byId.get(e.from);
    const b = byId.get(e.to);

    if (a && b && a.kind !== 'external' && b.kind !== 'external') {
      const ga = groupOf(a.module);
      const gb = groupOf(b.module);

      if (ga !== gb) {
        gFanOut.set(ga, (gFanOut.get(ga) ?? 0) + 1);
        gFanIn.set(gb, (gFanIn.get(gb) ?? 0) + 1);
      }
    }
  }

  for (const g of groupNames) {
    const ce = gFanOut.get(g) ?? 0;
    const ca = gFanIn.get(g) ?? 0;
    const i = ca + ce === 0 ? 0 : ce / (ca + ce);

    let layer: Layer;

    if (i >= 0.66) {
      layer = 'Application';
    } else if (i >= 0.33) {
      layer = 'Intermediate';
    } else {
      layer = 'Foundation';
    }

    layerByGroup.set(g, layer);
  }
}

// ---- mutable view state ----
const expandedModules = new Set<string>();
const visibleSymbols = new Set<string>(); // individually revealed nodes from collapsed modules
const activeKinds = new Set<string>(DRAWN_KINDS);

let showExternals = false;
// How nodes are coloured: by module (distinct hue per folder) or by architectural layer.
let colorMode: 'layer' | 'module' = 'module';

/** Group colour under the current mode: a distinct hue per module, or its layer's colour. */
const groupColor = (g: string): string =>
  colorMode === 'layer'
    ? LAYER_COLORS[layerByGroup.get(g) ?? 'Foundation']
    : colorOfGroup(g);
const colorOfNode = (n: RawNode): string =>
  n.kind === 'external' ? '#8b949e' : groupColor(groupOf(n.module));
const positions = new Map<string, { x: number; y: number }>();

let firstRender = true;

const container = document.getElementById('graph')!;
const graph = new Graph({ type: 'directed', multi: false });

// Focus state drives the reducers below. Hovering a node, or selecting one (click),
// lights it + its neighbors and recedes the rest, which is what makes a dense graph
// readable. Hover is transient; selection persists until you click elsewhere.
let hoveredNode: string | null = null;
let hoverNeighbors = new Set<string>();
let selectedNode: string | null = null;
let selectedNeighbors = new Set<string>();

// Animated "grow" factor (0..1) per node so the focused node eases in/out of its
// hero size instead of snapping. Driven by a requestAnimationFrame tween.
const sizeBoost = new Map<string, number>();

let focusRaf = 0;
// Blast-radius mode: repId -> min distance (0 = origin). Colours the chain of
// transitive dependents over the CURRENT view (no expansion); null = off.
let blast: Map<string, number> | null = null;

const DIM_NODE = '#1b212b'; // node receded into the background
const DIM_EDGE = '#1b212b';
const BG = '#0d1117';

/** Heat gradient by distance for the blast radius (closer = hotter). */
function blastColor(d: number): string {
  if (d <= 1) {
    return '#ff7b72';
  }

  if (d === 2) {
    return '#f0883e';
  }

  if (d === 3) {
    return '#d29922';
  }

  return '#9e7515';
}

// Reverse-dependency adjacency: for an edge from->to, `from` depends on `to`, so
// `from` is a dependent of `to`. BFS over this from a symbol = its blast radius.
const dependentsAdj = new Map<string, Array<string>>();

for (const e of drawnEdges) {
  (dependentsAdj.get(e.to) ?? dependentsAdj.set(e.to, []).get(e.to)!).push(
    e.from,
  );
}

const LABEL_BASE = '#c9d1d9'; // titles at rest: calm, readable (light on dark canvas)
const LABEL_NEIGHBOR = '#e6edf3'; // a focused node's neighbors: bright but a step below
const DIM_LABEL = '#3d444d'; // receded titles, when shown at all

// Bordered nodes: a thin ring (bg-coloured by default) makes each node a crisp
// disc and separates overlapping ones; the ring also doubles as a focus halo
// (set white via `borderColor` in the reducer).
const NodeBorder = createNodeBorderProgram({
  borders: [
    {
      color: { attribute: 'borderColor', defaultValue: BG },
      size: { value: 0.14 },
    },
    { color: { attribute: 'color' }, size: { fill: true } },
  ],
});

/** Custom hover label: Sigma's default draws a WHITE box, which clashed with our
 *  white focus title (white-on-white = invisible). This draws a dark tooltip pill
 *  with light text to the right of the node. */
function drawHoverLabel(
  context: CanvasRenderingContext2D,
  data: { label?: string | null; x: number; y: number; size: number },
  settings: { labelSize: number; labelFont: string; labelWeight: string },
): void {
  const { label } = data;

  if (!label) {
    return;
  }

  const size = settings.labelSize;

  context.font = `${settings.labelWeight} ${size}px ${settings.labelFont}`;

  const w = context.measureText(label).width;
  const padX = 9;
  const padY = 6;
  const boxH = size + padY * 2;
  const boxX = data.x + data.size + 6;
  const boxY = data.y - boxH / 2;
  const boxW = w + padX * 2;

  context.beginPath();

  if (context.roundRect) {
    context.roundRect(boxX, boxY, boxW, boxH, 7);
  } else {
    context.rect(boxX, boxY, boxW, boxH);
  }

  context.fillStyle = 'rgba(28,34,48,0.97)';
  context.fill();
  context.lineWidth = 1;
  context.strokeStyle = '#30363d';
  context.stroke();
  context.fillStyle = '#ffffff';
  context.textAlign = 'left';
  context.textBaseline = 'middle';
  context.fillText(label, boxX + padX, data.y);
}

const sigma = new Sigma(graph, container, {
  defaultEdgeType: 'curved',
  edgeProgramClasses: { curved: EdgeCurvedArrowProgram },
  defaultNodeType: 'bordered',
  nodeProgramClasses: { bordered: NodeBorder },
  defaultDrawNodeHover: drawHoverLabel,
  renderEdgeLabels: false,
  labelColor: { attribute: 'labelColor', color: LABEL_BASE },
  labelFont: 'system-ui, -apple-system, sans-serif',
  labelSize: 13,
  labelWeight: '600',
  labelDensity: 1.2,
  labelGridCellSize: 70,
  labelRenderedSizeThreshold: 5,
  defaultNodeColor: '#58a6ff',
  defaultEdgeColor: '#30363d',
  zIndex: true,
  minCameraRatio: 0.04,
  maxCameraRatio: 14,
  nodeReducer: (node, data) => {
    // The focused node is the hero: bigger, bright white ring + white title on the
    // dark canvas. We do NOT use Sigma's "highlighted" hover box — with the custom
    // border program it isn't drawn reliably, and a dark title on a missing box just
    // looked hidden. White-on-dark is robust and reads clearly. The growth is eased
    // via `sizeBoost` (a tween) so it doesn't snap between sizes.
    const t = sizeBoost.get(node) ?? 0;
    const hero = (d: Record<string, unknown>) => ({
      ...d,
      size: ((d.size as number) ?? 6) * (1 + 0.5 * t) + 2 * t,
      zIndex: 10,
      forceLabel: true,
      labelColor: '#ffffff',
      borderColor: '#ffffff',
    });

    // blast-radius mode wins: heat-colour the chain, recede the rest.
    if (blast) {
      const d = blast.get(node);

      if (d === undefined) {
        return {
          ...data,
          color: DIM_NODE,
          borderColor: BG,
          labelColor: DIM_LABEL,
          label: '',
          zIndex: 0,
        };
      }

      if (d === 0) {
        return hero(data);
      }

      const c = blastColor(d);

      return {
        ...data,
        color: c,
        borderColor: c,
        labelColor: LABEL_NEIGHBOR,
        forceLabel: d <= 2,
        zIndex: 2,
      };
    }

    // a node still easing in/out of focus stays the hero while t > 0.
    if (t > 0.01) {
      return hero(data);
    }

    const focus = hoveredNode ?? selectedNode;

    if (!focus) {
      return data;
    }

    const ring = hoveredNode ? hoverNeighbors : selectedNeighbors;

    if (ring.has(node)) {
      return {
        ...data,
        zIndex: 2,
        forceLabel: true,
        labelColor: LABEL_NEIGHBOR,
        borderColor: '#525c66',
      };
    }

    return {
      ...data,
      color: DIM_NODE,
      borderColor: BG,
      labelColor: DIM_LABEL,
      label: '',
      zIndex: 0,
    };
  },
  edgeReducer: (edge, data) => {
    if (blast) {
      const [s, t] = graph.extremities(edge);
      const ds = blast.get(s);
      const dt = blast.get(t);

      if (ds !== undefined && dt !== undefined) {
        return {
          ...data,
          color: blastColor(Math.max(ds, dt) || 1),
          zIndex: 2,
          size: Math.max(2, data.size ?? 1),
        };
      }

      return { ...data, color: DIM_EDGE, zIndex: 0 };
    }

    const focus = hoveredNode ?? selectedNode;

    if (!focus) {
      return data;
    }

    if (graph.hasExtremity(edge, focus)) {
      return { ...data, zIndex: 2, size: Math.max(2, data.size ?? 1) };
    }

    return { ...data, color: DIM_EDGE, zIndex: 0 };
  },
});
const camera = sigma.getCamera();

/** Tween the focused node's `sizeBoost` toward 1 and every other boosted node back
 *  toward 0, refreshing each frame — so focus grows/shrinks smoothly on hover/click
 *  instead of snapping. Stops itself when everything has settled. */
function focusTick(): void {
  const focus = hoveredNode ?? selectedNode;

  if (focus) {
    sizeBoost.set(focus, sizeBoost.get(focus) ?? 0);
  }

  let active = false;

  for (const [id, v] of Array.from(sizeBoost)) {
    const target = id === focus ? 1 : 0;
    const nv = v + (target - v) * 0.22; // ease toward target

    if (target === 1 && nv > 0.985) {
      sizeBoost.set(id, 1);
    } else if (target === 0 && nv < 0.02) {
      sizeBoost.delete(id);
    } else {
      sizeBoost.set(id, nv);
      active = true;
    }
  }

  sigma.refresh({ skipIndexation: true });
  focusRaf = active ? requestAnimationFrame(focusTick) : 0;
}

/** Kick the focus tween (and force at least one repaint for non-size changes). */
function bumpFocus(): void {
  if (!focusRaf) {
    focusRaf = requestAnimationFrame(focusTick);
  }
}

/** A present non-external node maps to itself if revealed, else to its module
 *  super-node. External maps to itself only when externals are shown. */
function representativeOf(id: string): string | null {
  const n = byId.get(id);

  if (!n) {
    return null;
  }

  if (n.kind === 'external') {
    return showExternals ? id : null;
  }

  const g = groupOf(n.module);

  if (expandedModules.has(g) || visibleSymbols.has(id)) {
    return id;
  }

  return `mod:${g}`;
}

/** The full set of node ids that should be on screen for the current state. */
function presentNodes(): { nodes: Set<string>; superNodes: Set<string> } {
  const nodes = new Set<string>();
  const superNodes = new Set<string>();

  for (const g of groupNames) {
    if (expandedModules.has(g)) {
      for (const id of membersOfGroup.get(g) ?? []) {
        nodes.add(id);
      }
    } else {
      superNodes.add(`mod:${g}`);
      nodes.add(`mod:${g}`);
    }
  }

  for (const id of visibleSymbols) {
    nodes.add(id);
  }

  return { nodes, superNodes };
}

function nodeAttrs(
  id: string,
  ring: { i: number; n: number; cx: number; cy: number } | null,
) {
  const pos = positions.get(id);

  let x: number;
  let y: number;

  if (pos) {
    ({ x, y } = pos);
  } else if (ring) {
    // Golden-angle spiral around the parent: spreads any number of fresh nodes
    // evenly without piling them on a single ring.
    const a = ring.i * 2.399963229728653;
    const r = 70 + 38 * Math.sqrt(ring.i + 1);

    x = ring.cx + r * Math.cos(a);
    y = ring.cy + r * Math.sin(a);
  } else {
    x = (Math.random() - 0.5) * 10;
    y = (Math.random() - 0.5) * 10;
  }

  positions.set(id, { x, y });

  if (id.startsWith('mod:')) {
    const g = id.slice(4);
    const count = (membersOfGroup.get(g) ?? []).length;

    return {
      x,
      y,
      label: `${g}  (${count})`,
      size: 12 + Math.min(34, Math.sqrt(count) * 3.2),
      color: groupColor(g),
      borderColor: BG,
      labelColor: LABEL_BASE,
      kind: 'module',
      forceLabel: true,
      zIndex: 2,
    };
  }

  const n = byId.get(id)!;

  return {
    x,
    y,
    label: n.name,
    size: 5 + Math.min(22, Math.sqrt(degree.get(id) ?? 0) * 3.4),
    color: colorOfNode(n),
    borderColor: BG,
    labelColor: LABEL_BASE,
    kind: n.kind,
    zIndex: 1,
  };
}

/** Recompute the visible mixed graph from state, preserving positions. Newly
 *  revealed nodes are seeded on a spiral around `seed` (or around `focus`'s
 *  position) so they don't pile at the origin; the rest stay put. `focus`, if it
 *  already existed, is pinned in place after the settle. */
// eslint-disable-next-line complexity
function render(focus?: string, seed?: { x: number; y: number }): void {
  // 1. snapshot current positions so nothing jumps when we rebuild.
  graph.forEachNode((id, attr) => positions.set(id, { x: attr.x, y: attr.y }));

  const { nodes: target } = presentNodes();

  // 2. aggregate edges; collect referenced externals so they become present too.
  const agg = new Map<
    string,
    { from: string; to: string; kinds: Set<string>; count: number }
  >();

  for (const e of drawnEdges) {
    const a = activeKinds.has(e.kind) ? representativeOf(e.from) : null;
    const b = activeKinds.has(e.kind) ? representativeOf(e.to) : null;

    // both endpoints must be (or become) present
    const aOk =
      a !== null &&
      (target.has(a) ||
        a.startsWith('mod:') ||
        byId.get(a)?.kind === 'external');
    const bOk =
      b !== null &&
      (target.has(b) ||
        b.startsWith('mod:') ||
        byId.get(b)?.kind === 'external');

    if (a && b && a !== b && aOk && bOk) {
      if (showExternals && byId.get(a)?.kind === 'external') {
        target.add(a);
      }

      if (showExternals && byId.get(b)?.kind === 'external') {
        target.add(b);
      }

      if (target.has(a) && target.has(b)) {
        const key = `${a}${b}`;
        const cur = agg.get(key);

        if (cur) {
          cur.kinds.add(e.kind);
          cur.count += 1;
        } else {
          agg.set(key, { from: a, to: b, kinds: new Set([e.kind]), count: 1 });
        }
      }
    }
  }

  // 3. diff nodes: drop the gone, add the new (placed around focus when fresh).
  const fresh = Array.from(target).filter(
    (id) => !graph.hasNode(id) && !positions.has(id),
  );
  const center = seed ?? (focus ? positions.get(focus) : undefined);
  const ringCtx = center
    ? { cx: center.x, cy: center.y, n: fresh.length }
    : null;
  const ringIndex = new Map(fresh.map((id, i) => [id, i]));

  for (const id of Array.from(graph.nodes())) {
    if (!target.has(id)) {
      graph.dropNode(id);
    }
  }

  for (const id of target) {
    const ring =
      ringCtx && ringIndex.has(id)
        ? { ...ringCtx, i: ringIndex.get(id)! }
        : null;

    if (graph.hasNode(id)) {
      graph.mergeNodeAttributes(id, nodeAttrs(id, null));
    } else {
      graph.addNode(id, nodeAttrs(id, ring));
    }
  }

  // 4. rebuild edges.
  graph.clearEdges();

  for (const { from, to, kinds, count } of agg.values()) {
    const kind: string = kinds.size === 1 ? Array.from(kinds)[0]! : 'mixed';

    graph.addDirectedEdge(from, to, {
      color: EDGE_COLORS[kind] ?? '#6e7681',
      size: Math.min(7, 1.2 + Math.log2(count + 1) * 0.9),
      type: 'curved',
      curvature: 0.3,
      kind,
    });
  }

  // 5. layout. First render spreads the module overview with plenty of room;
  //    afterwards, when nodes are revealed, a short seeded settle pushes the new
  //    ones apart (existing ones are already at rest, so they barely move) — this
  //    is what stops freshly expanded neighbors from piling onto the parent.
  if (graph.order > 0) {
    const base = forceAtlas2.inferSettings(graph);
    const bh = graph.order > 200;

    if (firstRender) {
      forceAtlas2.assign(graph, {
        iterations: 450,
        settings: {
          ...base,
          gravity: 0.18,
          scalingRatio: 220,
          slowDown: 6,
          adjustSizes: true,
          barnesHutOptimize: bh,
        },
      });
      firstRender = false;
    } else if (fresh.length > 0) {
      // Anchor the node you clicked: settle so the new neighbors spread out, then
      // translate the whole layout back so the clicked node stays exactly where it
      // was — it no longer "teleports" away on expand.
      const anchor =
        focus && graph.hasNode(focus) ? { ...positions.get(focus)! } : null;

      forceAtlas2.assign(graph, {
        iterations: 240,
        settings: {
          ...base,
          gravity: 0.15,
          scalingRatio: 280,
          slowDown: 12,
          adjustSizes: true,
          outboundAttractionDistribution: true,
          barnesHutOptimize: bh,
        },
      });

      if (anchor && graph.hasNode(focus!)) {
        const dx = anchor.x - graph.getNodeAttribute(focus!, 'x');
        const dy = anchor.y - graph.getNodeAttribute(focus!, 'y');

        if (dx || dy) {
          graph.updateEachNodeAttributes((_id, a) => ({
            ...a,
            x: (a.x as number) + dx,
            y: (a.y as number) + dy,
          }));
        }
      }
    }

    graph.forEachNode((id, attr) =>
      positions.set(id, { x: attr.x, y: attr.y }),
    );
  }

  sigma.refresh();
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  updateVisibleCount();
}

// ---- camera / focus helpers ----
function centerOn(id: string): void {
  if (!graph.hasNode(id)) {
    return;
  }

  const d = sigma.getNodeDisplayData(id);

  if (d) {
    camera
      .animate(
        { x: d.x, y: d.y, ratio: Math.min(camera.ratio, 0.6) },
        { duration: 350 },
      )
      .catch(() => undefined);
  }
}

/** Persisted selection: the clicked/searched symbol stays highlighted (its title
 *  at max contrast, neighbors a notch below, the rest receded) until you click
 *  empty space. Distinct from the transient hover. */
function setSelected(id: string | null): void {
  blast = null; // any normal selection exits blast-radius mode
  selectedNode = id && graph.hasNode(id) ? id : null;
  selectedNeighbors = selectedNode
    ? new Set(graph.neighbors(selectedNode))
    : new Set();
  bumpFocus();
}

/** Blast radius of a symbol: highlight everything that transitively DEPENDS on it,
 *  coloured by hop distance, over the current view — without expanding anything. */
function setBlast(originId: string): void {
  const dist = new Map<string, number>([[originId, 0]]);
  const queue = [originId];

  while (queue.length) {
    const cur = queue.shift()!;
    const d = dist.get(cur)!;

    for (const dep of dependentsAdj.get(cur) ?? []) {
      if (!dist.has(dep)) {
        dist.set(dep, d + 1);
        queue.push(dep);
      }
    }
  }

  // collapse to the representatives present in the view (no node is revealed).
  const rep = new Map<string, number>();

  for (const [sym, d] of dist) {
    const r = representativeOf(sym);

    if (r) {
      rep.set(r, Math.min(rep.get(r) ?? Infinity, d));
    }
  }

  blast = rep;
  selectedNode = null;
  selectedNeighbors = new Set();

  const n = byId.get(originId);
  const total = dist.size - 1;
  const byDist = new Map<number, number>();

  for (const [, d] of dist) {
    if (d > 0) {
      byDist.set(d, (byDist.get(d) ?? 0) + 1);
    }
  }

  const rows = Array.from(byDist)
    .sort((a, b) => a[0] - b[0])
    .map(([d, c]) => {
      const col = blastColor(d);

      return `<div class="rel"><span class="ek" style="color:${col};background:${col}22">${d} hop${d > 1 ? 's' : ''}</span><span class="rn">${c} dependent${c === 1 ? '' : 's'}</span></div>`;
    })
    .join('');

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  infoEl.className = '';
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  infoEl.innerHTML =
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    `<div class="node-head"><span class="kind" style="background:#ff7b72">blast</span><span class="node-name">${esc(n?.name ?? originId)}</span></div>` +
    `<div class="chips"><span class="chip">${total} dependent${total === 1 ? '' : 's'}, transitive</span></div>${
      rows
        ? `<div class="rel-head"><span>By distance</span></div>${rows}`
        : '<div class="chips"><span class="chip">nothing depends on it</span></div>'
    }<div class="actions"><button class="action" id="clearBlast"><b>← Back</b><small>exit the blast-radius view</small></button></div>`;
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  infoEl
    .querySelector<HTMLElement>('#clearBlast')
    ?.addEventListener('click', () => {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      clearBlast();
      setSelected(originId);
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      showInfo(originId);
    });
  bumpFocus();
}

function clearBlast(): void {
  if (!blast) {
    return;
  }

  blast = null;
  bumpFocus();
}

/** `file:line` → editor deep link (only when the repo is local, so the path exists). */
function editorUrl(file: string, line: number): string {
  const abs = `${RAW.meta.root ?? ''}/${file}`.replace(/\/{2,}/g, '/');

  return `vscode://file${encodeURI(abs)}:${line || 1}:1`;
}

function toggleModule(g: string, center = false): void {
  const members = membersOfGroup.get(g) ?? [];

  let seed: { x: number; y: number } | undefined;

  if (expandedModules.has(g)) {
    // Collapsing: drop back to the super-node, placed at the centroid of its
    // members so it doesn't pop in from a random spot.
    expandedModules.delete(g);

    for (const id of members) {
      visibleSymbols.delete(id);
    }

    const pts = members
      .map((id) => positions.get(id))
      .filter(Boolean) as Array<{
      x: number;
      y: number;
    }>;

    if (pts.length) {
      const c = pts.reduce((a, p) => ({ x: a.x + p.x, y: a.y + p.y }), {
        x: 0,
        y: 0,
      });

      positions.set(`mod:${g}`, { x: c.x / pts.length, y: c.y / pts.length });
    }
  } else {
    // Expanding: seed the revealed symbols on a spiral around where the module
    // super-node sat, so they fan out from there instead of piling at the origin.
    expandedModules.add(g);
    seed = positions.get(`mod:${g}`);
  }

  render(undefined, seed);
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  syncModuleList();
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  syncContext();
  setSelected(null); // module focus changed — drop any stale symbol selection

  if (center && graph.hasNode(`mod:${g}`)) {
    centerOn(`mod:${g}`);
  }
}

function revealSymbol(id: string, center = true): void {
  const n = byId.get(id);

  if (!n) {
    return;
  }

  if (n.kind === 'external') {
    showExternals = true;
  }

  visibleSymbols.add(id);
  render(id);

  if (center) {
    centerOn(id);
  }

  setSelected(id);
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  showInfo(id);
}

/** Expand a symbol: reveal its direct neighbors (1 hop, incremental). */
function expandSymbol(id: string): void {
  for (const nb of neighbors.get(id) ?? []) {
    const n = byId.get(nb);

    if (n && (n.kind !== 'external' || showExternals)) {
      visibleSymbols.add(nb);
    }
  }

  render(id);
  setSelected(id);
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  showInfo(id);
}

// ---- info panel ----
const infoEl = document.getElementById('info')!;
const KIND_COLORS: Record<string, string> = {
  function: '#3fb950',
  method: '#56d4dd',
  class: '#a371f7',
  interface: '#d29922',
  export: '#58a6ff',
  external: '#8b949e',
  enum: '#f0883e',
  file: '#6e7681',
};
const kindColor = (k: string) => KIND_COLORS[k] ?? '#58a6ff';

const EMPTY_INFO =
  '<div class="hint-row"><span class="ico">◆</span><span>Click a <b>module</b> to expand it into its symbols.</span></div>' +
  '<div class="hint-row"><span class="ico">●</span><span>Click a <b>symbol</b> to inspect it and reveal its neighbors.</span></div>' +
  '<div class="hint-row"><span class="ico">⌕</span><span>Search to jump straight to any symbol.</span></div>';

function showEmptyInfo(): void {
  infoEl.className = 'empty';
  infoEl.innerHTML = EMPTY_INFO;
}

/* eslint-disable @typescript-eslint/no-use-before-define */
function showInfo(id: string): void {
  infoEl.className = '';

  if (id.startsWith('mod:')) {
    const g = id.slice(4);
    const count = (membersOfGroup.get(g) ?? []).length;
    const layer = layerByGroup.get(g) ?? 'Foundation';

    infoEl.innerHTML =
      `<div class="node-head"><span class="kind" style="background:${groupColor(g)}">module</span><span class="node-name">${esc(g)}</span></div>` +
      `<div class="chips"><span class="chip">${count} members</span><span class="chip" style="color:${LAYER_COLORS[layer]}">${layer} layer</span></div>` +
      `<div class="actions"><button class="action" data-expand-mod="${esc(g)}"><b>Expand module</b><small>reveal the ${count} symbols inside</small></button></div>`;
    bindInfo();

    return;
  }

  const n = byId.get(id);

  if (!n) {
    return;
  }

  const out: Array<string> = [];
  const inc: Array<string> = [];
  const nodeEdges = edgesByNode.get(id);

  for (const e of nodeEdges?.out ?? []) {
    out.push(rel(e.kind, e.to));
  }

  for (const e of nodeEdges?.inc ?? []) {
    inc.push(rel(e.kind, e.from));
  }

  const locText = `${esc(n.file)}${n.line ? `:${n.line}` : ''}`;
  const loc = RAW.meta.root
    ? `<a class="loc" href="${editorUrl(n.file, n.line)}" title="Open in your editor">↗ ${locText}</a>`
    : `<span class="loc plain">${locText}</span>`;
  const nb = (neighbors.get(id) ?? new Set()).size;
  const sig = n.signature
    ? `<div class="sig"><code>${esc(n.signature)}</code></div>`
    : '';

  infoEl.innerHTML =
    `<div class="node-head"><span class="kind" style="background:${kindColor(n.kind)}">${esc(n.kind)}</span><span class="node-name">${esc(n.name)}</span></div>${
      loc
    }${
      sig
    }<div class="chips"><span class="chip">${esc(groupOf(n.module))}</span><span class="chip">${degree.get(id) ?? 0} connections</span>${n.exported ? '<span class="chip ok">exported</span>' : ''}</div>` +
    `<div class="actions">` +
    `<button class="action" data-expand="${esc(id)}"><b>Expand neighbors</b><small>reveal its ${nb} direct link${nb === 1 ? '' : 's'} on the canvas</small></button>` +
    `<button class="action" data-blast="${esc(id)}"><b>Blast radius</b><small>highlight everything that breaks if you change it</small></button>` +
    `</div>${
      out.length
        ? `<div class="rel-head"><span>Uses</span><span>${out.length}</span></div>${out.join('')}`
        : ''
    }${
      inc.length
        ? `<div class="rel-head"><span>Used by</span><span>${inc.length}</span></div>${inc.join('')}`
        : ''
    }`;
  bindInfo();
}
/* eslint-enable @typescript-eslint/no-use-before-define */

function rel(kind: string, otherId: string): string {
  const o = byId.get(otherId);
  const label = o ? o.name : otherId;
  const c = EDGE_COLORS[kind] ?? '#8b949e';

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return `<div class="rel" data-id="${esc(otherId)}"><span class="ek" style="color:${c};background:${c}22">${kind}</span><span class="rn">${esc(label)}</span></div>`;
}

function bindInfo(): void {
  infoEl
    .querySelectorAll<HTMLElement>('.rel')
    .forEach((el) =>
      el.addEventListener('click', () => revealSymbol(el.dataset.id!)),
    );
  infoEl
    .querySelectorAll<HTMLElement>('[data-expand]')
    .forEach((el) =>
      el.addEventListener('click', () => expandSymbol(el.dataset.expand!)),
    );
  infoEl
    .querySelectorAll<HTMLElement>('[data-expand-mod]')
    .forEach((el) =>
      el.addEventListener('click', () =>
        toggleModule(el.dataset.expandMod!, true),
      ),
    );
  infoEl
    .querySelectorAll<HTMLElement>('[data-blast]')
    .forEach((el) =>
      el.addEventListener('click', () => setBlast(el.dataset.blast!)),
    );
}

// ---- module list (legend + expand/collapse toggles) ----
const moduleListEl = document.getElementById('moduleList')!;

function syncModuleList(): void {
  moduleListEl.innerHTML = groupNames
    .map((g) => {
      const on = expandedModules.has(g);
      const count = (membersOfGroup.get(g) ?? []).length;

      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      return `<div class="mod${on ? ' on' : ''}" data-mod="${esc(g)}"><span class="sw" style="background:${groupColor(g)}"></span>${esc(g)}<span class="count">${on ? '−' : count}</span></div>`;
    })
    .join('');
  moduleListEl
    .querySelectorAll<HTMLElement>('.mod')
    .forEach((el) =>
      el.addEventListener('click', () =>
        toggleModule(el.dataset.mod!, !expandedModules.has(el.dataset.mod!)),
      ),
    );
}

// ---- context breadcrumb: which modules are open (where am I) ----
const contextEl = document.getElementById('context')!;

function syncContext(): void {
  const open = Array.from(expandedModules).sort();

  if (!open.length) {
    contextEl.innerHTML =
      '<span class="ctx-label">Viewing all modules — click one to drill in</span>';

    return;
  }

  /* eslint-disable @typescript-eslint/no-use-before-define */
  contextEl.innerHTML = `<span class="ctx-label">Expanded:</span>${open
    .map(
      (g) =>
        `<span class="ctx-chip" data-g="${esc(g)}" title="Collapse ${esc(g)}"><span class="sw" style="background:${groupColor(g)}"></span>${esc(g)}<span class="x">✕</span></span>`,
    )
    .join('')}`;
  /* eslint-enable @typescript-eslint/no-use-before-define */
  contextEl
    .querySelectorAll<HTMLElement>('.ctx-chip')
    .forEach((el) =>
      el.addEventListener('click', () => toggleModule(el.dataset.g!, false)),
    );
}

// ---- edge-kind toggles ----
const edgeFiltersEl = document.getElementById('edgeFilters')!;
const edgeKindCounts: Record<string, number> = {};

for (const e of drawnEdges) {
  edgeKindCounts[e.kind] = (edgeKindCounts[e.kind] ?? 0) + 1;
}

edgeFiltersEl.innerHTML = DRAWN_KINDS.filter((k) => edgeKindCounts[k])
  .map(
    (k) =>
      `<label><input type="checkbox" class="ef" value="${k}" checked> <span style="color:${EDGE_COLORS[k] ?? ''}">■</span> ${k}<span class="count">${edgeKindCounts[k] ?? 0}</span></label>`,
  )
  .join('');
edgeFiltersEl.querySelectorAll<HTMLInputElement>('.ef').forEach((c) =>
  c.addEventListener('change', () => {
    if (c.checked) {
      activeKinds.add(c.value);
    } else {
      activeKinds.delete(c.value);
    }

    render();
  }),
);

// ---- externals toggle ----
const extToggle = document.getElementById('showExternals') as HTMLInputElement;

extToggle.addEventListener('change', () => {
  showExternals = extToggle.checked;

  if (!showExternals) {
    for (const id of Array.from(visibleSymbols)) {
      if (byId.get(id)?.kind === 'external') {
        visibleSymbols.delete(id);
      }
    }
  }

  render();
});

// ---- colour-by-layer toggle ----
// Recolours nodes in place (no re-layout): the reducer overlays focus/blast on top of
// whatever base colour we set here, so we just update the attribute and refresh.
const layerToggle = document.getElementById('colorByLayer') as HTMLInputElement;
const layerLegend = document.getElementById('layerLegend')!;

layerToggle.addEventListener('change', () => {
  colorMode = layerToggle.checked ? 'layer' : 'module';
  layerLegend.style.display = layerToggle.checked ? '' : 'none';
  graph.forEachNode((id) => {
    const color = id.startsWith('mod:')
      ? groupColor(id.slice(4))
      : colorOfNode(byId.get(id)!);

    graph.setNodeAttribute(id, 'color', color);
  });
  sigma.refresh({ skipIndexation: true });
  syncModuleList();
  syncContext();
});

// ---- search (typeahead over symbols) ----
const search = document.getElementById('search') as HTMLInputElement;
const ac = document.getElementById('ac')!;
const searchable = RAW.nodes.filter(
  (n) => n.kind !== 'file' && n.kind !== 'external',
);

let acItems: Array<RawNode> = [];
let acSel = -1;

search.addEventListener('input', () => {
  const q = search.value.trim().toLowerCase();

  if (!q) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    hideAc();

    return;
  }

  acItems = searchable
    .filter((n) => n.name.toLowerCase().includes(q))
    .slice(0, 12);

  if (!acItems.length) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    hideAc();

    return;
  }

  acSel = -1;
  ac.innerHTML = acItems
    .map(
      (n, i) =>
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        `<div data-i="${i}">${esc(n.name)}<span class="k">${n.kind}</span></div>`,
    )
    .join('');
  ac.querySelectorAll<HTMLElement>('div').forEach((d) =>
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    d.addEventListener('click', () => pick(+d.dataset.i!)),
  );
  ac.style.display = 'block';
});
search.addEventListener('keydown', (e) => {
  if (ac.style.display !== 'block') {
    return;
  }

  if (e.key === 'ArrowDown') {
    acSel = Math.min(acSel + 1, acItems.length - 1);
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    paintAc();
    e.preventDefault();
  } else if (e.key === 'ArrowUp') {
    acSel = Math.max(acSel - 1, 0);
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    paintAc();
    e.preventDefault();
  } else if (e.key === 'Enter' && acSel >= 0) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    pick(acSel);
  } else if (e.key === 'Escape') {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    hideAc();
  }
});

function paintAc(): void {
  ac.querySelectorAll<HTMLElement>('div').forEach((d, i) =>
    d.classList.toggle('sel', i === acSel),
  );
}

function hideAc(): void {
  ac.style.display = 'none';
}

function pick(i: number): void {
  const item = acItems[i];

  if (!item) {
    return;
  }

  hideAc();
  search.value = item.name;
  revealSymbol(item.id);
}

document.addEventListener('click', (e) => {
  if (!(e.target as HTMLElement).closest('.searchbox')) {
    hideAc();
  }
});

// ---- canvas interactions: hover highlight ----
sigma.on('enterNode', ({ node }) => {
  hoveredNode = node;
  hoverNeighbors = new Set(graph.neighbors(node));
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  container.style.cursor = draggedNode ? 'grabbing' : 'pointer';
  bumpFocus();
});
sigma.on('leaveNode', () => {
  hoveredNode = null;
  hoverNeighbors = new Set();
  container.style.cursor = 'default';
  bumpFocus();
});

// ---- canvas interactions: drag a node freely ----
let draggedNode: string | null = null;
let dragMoved = false;

const captor = sigma.getMouseCaptor();

sigma.on('downNode', ({ node }) => {
  draggedNode = node;
  dragMoved = false;
  graph.setNodeAttribute(node, 'highlighted', true);
  container.style.cursor = 'grabbing';
});
captor.on('mousemovebody', (e) => {
  if (!draggedNode) {
    return;
  }

  const pos = sigma.viewportToGraph(e);

  graph.setNodeAttribute(draggedNode, 'x', pos.x);
  graph.setNodeAttribute(draggedNode, 'y', pos.y);
  positions.set(draggedNode, { x: pos.x, y: pos.y });
  dragMoved = true;
  // stop Sigma from also panning the camera while we drag the node
  e.preventSigmaDefault();
  e.original.preventDefault();
  e.original.stopPropagation();
});

function endDrag(): void {
  if (draggedNode) {
    graph.removeNodeAttribute(draggedNode, 'highlighted');
  }

  draggedNode = null;
  container.style.cursor = hoveredNode ? 'pointer' : 'default';
}

captor.on('mouseup', endDrag);
window.addEventListener('mouseup', endDrag); // catch releases outside the canvas

// ---- canvas interactions: click to expand (suppressed right after a drag) ----
sigma.on('clickNode', ({ node }) => {
  if (dragMoved) {
    dragMoved = false;

    return;
  }

  if (node.startsWith('mod:')) {
    toggleModule(node.slice(4), true);
  } else {
    showInfo(node);
    expandSymbol(node);
  }
});

// click empty space clears the persisted selection (back to the plain view).
sigma.on('clickStage', () => {
  if (dragMoved) {
    dragMoved = false;

    return;
  }

  if (selectedNode || blast) {
    setSelected(null);
    showEmptyInfo();
  }
});

// ---- reset ----
document.getElementById('reset')!.addEventListener('click', () => {
  expandedModules.clear();
  visibleSymbols.clear();
  positions.clear();
  selectedNode = null;
  selectedNeighbors = new Set();
  blast = null;
  firstRender = true;
  graph.clear();

  for (const c of edgeFiltersEl.querySelectorAll<HTMLInputElement>('.ef')) {
    c.checked = true;
    activeKinds.add(c.value);
  }

  render();
  syncModuleList();
  syncContext();
  camera.animatedReset().catch(() => undefined);
});

function updateVisibleCount(): void {
  const el = document.getElementById('visN');

  if (el) {
    el.textContent = String(graph.order);
  }
}

function esc(s: string): string {
  return s.replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!,
  );
}

// ---- boot ----
document.getElementById('metaline')!.textContent =
  `${RAW.meta.languages.join(', ')} · ${RAW.meta.counts.nodes ?? 0} nodes · ${RAW.meta.counts.edges ?? 0} edges${RAW.meta.dirty ? ' · ⚠ uncommitted' : ''}`;
showEmptyInfo();
syncModuleList();
syncContext();
render();
camera.animatedReset().catch(() => undefined);
