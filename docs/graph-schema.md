# Graph JSON schema

`graph.json` is the portable output of `codegraph <source>`. It's a self-contained snapshot of the analyzed repo at a point in time.

## Top-level shape

```json
{
  "meta":  { ... },
  "nodes": [ ...GraphNode ],
  "edges": [ ...GraphEdge ]
}
```

---

## `meta`

| Field          | Type              | Description |
|----------------|-------------------|-------------|
| `source`       | `string`          | How the analysis was invoked: local path, GitHub URL, or `org/repo` shorthand. |
| `root`         | `string?`         | Absolute path of the repo on disk. Omitted for remote sources (cloned to a temp dir). Lets the Graph Explorer build `file:line` → editor links. |
| `commit`       | `string?`         | SHA of the analyzed commit, if the source is a git repo. |
| `dirty`        | `boolean?`        | `true` if the working tree had uncommitted changes. When `true`, the graph reflects disk state, not `commit`. |
| `generatedAt`  | `string`          | ISO 8601 timestamp. |
| `languages`    | `string[]`        | Languages present, one entry per connector that contributed nodes (e.g. `["ts", "json"]`). |
| `frameworks`   | `string[]?`       | Frameworks detected from `package.json` dependencies (e.g. `["next", "express"]`). |
| `counts`       | `{ nodes, edges }` | Quick summary — total node and edge count. |

---

## `GraphNode`

| Field        | Type       | Description |
|--------------|------------|-------------|
| `id`         | `string`   | **Stable unique identifier.** `rel/path.ts` for file nodes; `rel/path.ts::SymbolName` for top-level symbols; `rel/path.ts::ClassName.methodName` for methods. |
| `kind`       | `NodeKind` | See below. |
| `name`       | `string`   | Short display name (e.g. `handleBaseError`, `Card`). |
| `file`       | `string`   | Path relative to the repo root. For `external` nodes it may be the module name. |
| `line`       | `number`   | 1-based start line of the declaration. `0` for file and external nodes. |
| `endLine`    | `number`   | 1-based end line. `0` when not applicable. Used to slice source inline. |
| `module`     | `string`   | Grouper for coloring/clustering: the folder segment (e.g. `src/components`). |
| `lang`       | `string`   | Language tag from the connector: `ts`, `json`, etc. |
| `exported`   | `boolean`  | Whether the symbol is exported from its file. |
| `nativeKind` | `string?`  | Raw construct before normalization: `arrow`, `method`, `struct`, etc. |
| `signature`  | `string?`  | Type-checker-resolved call signature for functions/methods: `(a: string) => Promise<void>`. |

### `NodeKind` values

| Value       | Meaning |
|-------------|---------|
| `file`      | A source file. One per analyzed file. |
| `class`     | A class (or Go `struct`). |
| `interface` | A TypeScript interface or Go interface. |
| `function`  | A top-level function or arrow function. |
| `method`    | A method on a class or object. |
| `export`    | A re-export or barrel export. |
| `external`  | A symbol or module from outside the repo (a dependency). ID format: `ext:module-name`. |

---

## `GraphEdge`

| Field        | Type         | Description |
|--------------|--------------|-------------|
| `from`       | `string`     | Source node ID. |
| `to`         | `string`     | Target node ID. |
| `kind`       | `EdgeKind`   | See below. |
| `confidence` | `Confidence` | `exact` if resolved by the type-checker; `inferred` for heuristic matches. |

### `EdgeKind` values

| Value        | Direction       | Meaning |
|--------------|-----------------|---------|
| `contains`   | file → symbol   | A file declares a symbol. |
| `imports`    | file → file/ext | A file imports another file or an external module. Includes re-exports. |
| `calls`      | symbol → symbol | A function/method invokes another. |
| `extends`    | class → class   | Class inheritance. |
| `implements` | class → iface   | A class implements an interface. |
| `renders`    | comp → comp     | A React component renders another via JSX `<Comp />`. |
| `references` | symbol → symbol | A symbol reads/uses another (e.g. `new X`, callback reference, enum value). |

---

## Example

```json
{
  "meta": {
    "source": ".",
    "root": "/Users/you/projects/my-app",
    "commit": "a1b2c3d",
    "dirty": false,
    "generatedAt": "2025-01-15T10:00:00.000Z",
    "languages": ["ts"],
    "counts": { "nodes": 312, "edges": 891 }
  },
  "nodes": [
    {
      "id": "src/auth.ts",
      "kind": "file",
      "name": "auth.ts",
      "file": "src/auth.ts",
      "line": 0,
      "endLine": 0,
      "module": "src",
      "lang": "ts",
      "exported": false
    },
    {
      "id": "src/auth.ts::login",
      "kind": "function",
      "name": "login",
      "file": "src/auth.ts",
      "line": 12,
      "endLine": 28,
      "module": "src",
      "lang": "ts",
      "exported": true,
      "signature": "(username: string, password: string) => Promise<User>"
    }
  ],
  "edges": [
    {
      "from": "src/auth.ts",
      "to": "src/auth.ts::login",
      "kind": "contains",
      "confidence": "exact"
    },
    {
      "from": "src/auth.ts::login",
      "to": "ext:bcrypt",
      "kind": "imports",
      "confidence": "exact"
    }
  ]
}
```
