# Semantic Search with ck

When searching code, choose the right tool:

| Query Type | Tool | Example |
|------------|------|---------|
| Conceptual/semantic | `ck` | "error handling", "auth flow" |
| Exact pattern/regex | Grep | `useState.*onClick` |
| File paths | Glob | `**/*.test.ts` |

## Usage

```bash
# Semantic search (finds related code by meaning)
ck "how are errors handled"
ck "authentication" --limit 20

# Hybrid (semantic + keyword filtering)
ck "database queries" --grep "SELECT"
```

## When to Use

- `/ride` code extraction → `ck` for discovering patterns
- "Where is X handled?" → `ck`
- "Find all usages of Y" → Grep (exact match)

## Fallback

If `ck` unavailable, use Explore agent or Grep + Glob combination.
