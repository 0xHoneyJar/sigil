# Shared Context Store

Bridge between Sigil (design physics) and Loa (architecture). This directory stores context gathered during complexity detection and handoff protocols.

## Structure

```
context/
├── .context-config.yaml    # TTL and permission settings
├── indexer/                 # DX Physics: block range caches
│   └── {chainId}/
│       └── {contract}-{event}.json
├── ecosystem/               # Multi-repo relationships
│   └── repos.yaml
├── domain/                  # Contract/system documentation
│   └── {topic}.md
└── sessions/                # Temporary handoff state
    └── {date}-{id}.json
```

## Purpose

When Sigil detects complexity (indexer work, multi-repo references, unknown contracts), it gathers context via appropriate handlers and stores results here. This context is then available for:

- `/craft` — enriched physics with domain knowledge
- `/implement` — block ranges for fast testing
- Loa commands — ecosystem awareness

## TTL

| Context Type | Expiration |
|--------------|------------|
| indexer      | 24 hours   |
| ecosystem    | 7 days     |
| domain       | 30 days    |
| sessions     | 1 hour     |

## Write Permissions

| Framework | Allowed Paths |
|-----------|---------------|
| Sigil     | indexer/**, sessions/** |
| Loa       | domain/**, ecosystem/**, sessions/** |

Conflict resolution: last-write-wins with audit trail.
