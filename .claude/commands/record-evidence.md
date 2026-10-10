---
description: Record a checked evidence reference
---

# Record a checked evidence reference

Read CLAUDE.md.

```bash
npm run assurance -- record-evidence --supplier="SUP-01" --kind=insurance --evidence="private-reference" --reviewed=YYYY-MM-DD --expires=YYYY-MM-DD --note="What was checked" --actor="Reviewer" --json
```

Inspect the evidence before recording it. Replace placeholder dates. The new entry supersedes the earlier entry and invalidates approval. Never assume a document is valid from its filename.

If a name is ambiguous, show the candidates and stop the change. Report the current result and the next responsible owner. Nothing sends or publishes.
