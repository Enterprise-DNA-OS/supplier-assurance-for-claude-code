---
description: Log a supplier conversation
---

# Log a supplier conversation

Read CLAUDE.md.

```bash
npm run assurance -- log --supplier="SUP-01" --note="Observed fact and next action" --actor="Reviewer" --json
```

Log facts supplied by the operator. This does not send a message or invalidate approval by itself.

If a name is ambiguous, show the candidates and stop the change. Report the current result and the next responsible owner. Nothing sends or publishes.
