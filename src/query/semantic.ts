import type { Graph, GraphNode } from '../model/types.js';

import fs from 'node:fs';
import path from 'node:path';

const MODEL = 'Xenova/all-MiniLM-L6-v2';
const DIM = 384;
const BATCH_SIZE = 32;

const EMBEDDINGS_BIN = 'embeddings.bin';
const EMBEDDINGS_META = 'embeddings-meta.json';

interface EmbeddingsMeta {
  ids: Array<string>;
  dim: number;
  model: string;
}

// Module-level cache: one embedder instance per process lifetime.
// Lazy-loaded so the heavy import only happens when semantic search is used.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let embedderPromise: Promise<any> | undefined;

// Coalesces concurrent buildEmbeddings calls for the same outDir: if two
// MCP requests arrive before embeddings exist, only one build runs and both
// await the same promise — preventing interleaved writes to embeddings.bin.
const buildInFlight = new Map<string, Promise<void>>();

async function getEmbedder() {
  if (!embedderPromise) {
    const attempt = (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let mod: any;

      try {
        mod = await import('@huggingface/transformers');
      } catch {
        throw new Error(
          'Semantic search requires @huggingface/transformers. ' +
            'Install it with: npm install @huggingface/transformers',
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      return mod.pipeline('feature-extraction', MODEL);
    })();

    // Reset on failure so the next call retries instead of replaying the
    // same rejected promise for the rest of the process lifetime.
    attempt.catch(() => {
      embedderPromise = undefined;
    });

    embedderPromise = attempt;
  }

  return embedderPromise;
}

/** The text fed to the model for a node. Short, info-dense. */
function nodeText(n: GraphNode): string {
  const sig = n.signature ? ` ${n.signature}` : '';

  return `${n.kind} ${n.name}${sig} in ${n.file}`;
}

/** Nodes worth embedding: skip file-level and external nodes. */
function embeddableNodes(graph: Graph): Array<GraphNode> {
  return graph.nodes.filter((n) => n.kind !== 'file' && n.kind !== 'external');
}

/** Cosine similarity — both vectors must already be normalized (L2 = 1). */
function dot(
  a: Float32Array,
  b: Float32Array,
  offset: number,
  dim: number,
): number {
  let s = 0;

  for (let d = 0; d < dim; d += 1) {
    s += a[offset + d]! * b[d]!;
  }

  return s;
}

/**
 * Generates embeddings for all meaningful nodes in the graph and writes two
 * files to `outDir`:
 *   - `embeddings.bin`  — flat Float32Array (N × DIM floats, little-endian)
 *   - `embeddings-meta.json` — `{ ids, dim, model }` mapping index → node id
 */
export async function buildEmbeddings(
  graph: Graph,
  outDir: string,
): Promise<void> {
  const nodes = embeddableNodes(graph);

  if (nodes.length === 0) {
    return;
  }

  const embedder = await getEmbedder();
  const texts = nodes.map(nodeText);
  const flat = new Float32Array(nodes.length * DIM);

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    // Batches must be sent sequentially — the embedder is stateful and
    // does not expose a parallel batch API.
    // eslint-disable-next-line no-await-in-loop, @typescript-eslint/no-explicit-any
    const out: any = await embedder(batch, {
      pooling: 'mean',
      normalize: true,
    });

    // out.data is a flat Float32Array of shape [batchSize * DIM]
    flat.set(out.data as Float32Array, i * DIM);
  }

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, EMBEDDINGS_BIN), Buffer.from(flat.buffer));

  const meta: EmbeddingsMeta = {
    ids: nodes.map((n) => n.id),
    dim: DIM,
    model: MODEL,
  };

  fs.writeFileSync(path.join(outDir, EMBEDDINGS_META), JSON.stringify(meta));
}

export interface SemanticResult {
  node: GraphNode;
  score: number;
}

/**
 * Loads embeddings from `outDir` and returns the top-`limit` nodes most
 * semantically similar to `query`. Returns an empty array if no embeddings
 * file exists (run `buildEmbeddings` first, or rebuild with `--with-embeddings`).
 */
export async function semanticSearch(
  graph: Graph,
  query: string,
  outDir: string,
  limit = 10,
): Promise<Array<SemanticResult>> {
  const binPath = path.join(outDir, EMBEDDINGS_BIN);
  const metaPath = path.join(outDir, EMBEDDINGS_META);

  if (!fs.existsSync(binPath) || !fs.existsSync(metaPath)) {
    return [];
  }

  const meta: EmbeddingsMeta = JSON.parse(
    fs.readFileSync(metaPath, 'utf8'),
  ) as EmbeddingsMeta;

  const raw = fs.readFileSync(binPath);
  const { dim } = meta;
  const expectedFloats = meta.ids.length * dim;
  const actualFloats = raw.byteLength / 4;

  if (actualFloats < expectedFloats) {
    // Truncated binary (e.g. from a killed buildEmbeddings run) — return empty
    // rather than reading out-of-bounds and silently propagating NaN scores.
    return [];
  }

  const stored = new Float32Array(raw.buffer, raw.byteOffset, actualFloats);
  const embedder = await getEmbedder();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const qOut: any = await embedder(query, { pooling: 'mean', normalize: true });
  const qVec = new Float32Array(qOut.data as Float32Array);

  const byId = new Map(graph.nodes.map((n) => [n.id, n]));
  const scores: Array<{ id: string; score: number }> = [];

  for (let i = 0; i < meta.ids.length; i += 1) {
    scores.push({
      id: meta.ids[i]!,
      score: dot(stored, qVec, i * dim, dim),
    });
  }

  scores.sort((a, b) => b.score - a.score);

  // Filter stale IDs and NaN scores BEFORE slicing so they don't consume
  // slots in the top-limit window. NaN can arise from a corrupt binary that
  // passed the size check (e.g. extra padding) — never return them to callers.
  return scores
    .map((s) => ({ node: byId.get(s.id), score: s.score }))
    .filter(
      (s): s is SemanticResult =>
        s.node !== undefined && !Number.isNaN(s.score),
    )
    .slice(0, limit);
}

/** Returns true if embeddings exist in `outDir`. */
export function hasEmbeddings(outDir: string): boolean {
  return (
    fs.existsSync(path.join(outDir, EMBEDDINGS_BIN)) &&
    fs.existsSync(path.join(outDir, EMBEDDINGS_META))
  );
}

/**
 * Ensures embeddings exist for `outDir`, building them if needed.
 * Concurrent callers for the same directory are coalesced into one build
 * so that concurrent MCP requests never write to the same files in parallel.
 */
export async function ensureEmbeddings(
  graph: Graph,
  outDir: string,
): Promise<void> {
  if (hasEmbeddings(outDir)) {
    return;
  }

  const flying = buildInFlight.get(outDir);

  if (flying !== undefined) {
    await flying;

    return;
  }

  const promise = buildEmbeddings(graph, outDir).finally(() => {
    buildInFlight.delete(outDir);
  });

  buildInFlight.set(outDir, promise);

  await promise;
}
