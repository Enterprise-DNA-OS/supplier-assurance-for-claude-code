---
description: Archive a supplier record
---

# Archive a supplier record

Read CLAUDE.md.

```bash
npm run assurance -- archive-supplier --supplier="SUP-01" --reason="Relationship ended" --actor="Reviewer" --json
```

Only after the owner says the relationship ended and all findings are closed. Archive preserves records and makes them read-only through this CLI. No external agreement is cancelled.

If a name is ambiguous, show the candidates and stop the change. Report the current result and the next responsible owner. Nothing sends or publishes.
