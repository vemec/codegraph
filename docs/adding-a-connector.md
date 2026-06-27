# Adding a language connector

A connector teaches codegraph to parse a new language and emit graph fragments in the common schema. The TypeScript connector (`src/connectors/typescript/`) is the reference implementation.

## The `Connector` interface

```ts
// src/connectors/connector.ts
interface Connector {
  readonly name: string;  // 'go', 'python', ...
  readonly lang: string;  // 'go', 'py', ...

  // From the full list of source files, which ones this connector owns.
  match: (files: Array<string>) => Array<string>;

  // Parse the matched files and return nodes + edges.
  extract: (
    files: Array<string>,
    root: string,
    onProgress?: (done: number, total: number) => void,
    knownIds?: ReadonlySet<string>,
  ) => Promise<GraphFragment>;
}
```

- `match` is called once with the full file list; return only the files your connector handles.
- `extract` receives those files, the absolute repo root, and (for incremental builds) the IDs of nodes that came from other connectors' cached fragments (`knownIds`) — these are valid targets for edges.
- Return a `GraphFragment: { nodes: GraphNode[], edges: GraphEdge[] }`. The orchestrator merges all fragments and fills in `meta`.

## Step-by-step

### 1. Create `src/connectors/<lang>/index.ts`

```ts
import type { Connector, GraphFragment } from '../../model/types.js';

export class GoConnector implements Connector {
  readonly name = 'go';
  readonly lang  = 'go';

  match(files: Array<string>): Array<string> {
    return files.filter((f) => f.endsWith('.go') && !f.includes('_test.go'));
  }

  async extract(
    files: Array<string>,
    root: string,
    onProgress?: (done: number, total: number) => void,
  ): Promise<GraphFragment> {
    const nodes = [];
    const edges = [];

    for (let i = 0; i < files.length; i += 1) {
      const rel = files[i];
      // ... parse the file, emit nodes and edges ...
      onProgress?.(i + 1, files.length);
    }

    return { nodes, edges };
  }
}
```

### 2. Register it in `src/connectors/registry.ts`

```ts
import { GoConnector } from './go/index.js';

const connectors: Array<Connector> = [
  new TypeScriptConnector(),
  new PackageJsonConnector(),
  new GoConnector(),           // ← add here
];
```

That's it. The orchestrator picks it up automatically.

### 3. Node ID conventions

Follow the existing pattern so the query layer and Graph Explorer work correctly:

| Node type | ID format | Example |
|-----------|-----------|---------|
| File | `rel/path.go` | `pkg/auth/handler.go` |
| Top-level function/method | `rel/path.go::FuncName` | `pkg/auth/handler.go::Login` |
| Method on a type | `rel/path.go::TypeName.MethodName` | `pkg/auth/handler.go::Handler.Login` |
| External import | `ext:module-path` | `ext:github.com/gin-gonic/gin` |

### 4. Map to normalized kinds

| Your language concept | `NodeKind` to use |
|-----------------------|------------------|
| Source file | `file` |
| Struct, class | `class` |
| Interface, trait | `interface` |
| Function, arrow | `function` |
| Method | `method` |
| Re-export | `export` |
| External dependency | `external` |

### 5. `knownIds` for cross-connector edges

When a Go file imports a TypeScript-generated node (rare, but possible in monorepos), use `knownIds` to validate that the target actually exists before emitting an edge:

```ts
if (knownIds?.has(targetId) || localNodeIds.has(targetId)) {
  edges.push({ from: srcId, to: targetId, kind: 'imports', confidence: 'exact' });
}
```

## Out-of-process connectors

For languages where calling the native toolchain from Node.js is impractical (e.g. Rust, Java), the connector can shell out or call a separate binary:

```ts
async extract(files, root) {
  const raw = execFileSync('codegraph-go-connector', ['--root', root], {
    encoding: 'utf8',
  });
  return JSON.parse(raw) as GraphFragment;  // binary emits the same schema
}
```

The binary just needs to emit `{ nodes, edges }` matching the `GraphFragment` shape — the JSON schema is the cross-language contract.

## Testing

Add a `tests/<lang>.spec.ts` following the pattern in `tests/extract.spec.ts`:

```ts
import { GoConnector } from '../src/connectors/go/index.js';
import { GraphBuilder } from '../src/model/graph.js';

const root = path.join(/* fixtures dir */);
const conn = new GoConnector();
const files = conn.match(['pkg/auth/handler.go', 'pkg/db/pool.go']);
const frag  = await conn.extract(files, root);

test('registers file nodes', () => {
  const ids = new Set(frag.nodes.map((n) => n.id));
  expect(ids.has('pkg/auth/handler.go')).toBe(true);
});
```
