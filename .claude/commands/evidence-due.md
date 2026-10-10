---
description: Review missing and expiring evidence
---

# Review missing and expiring evidence

Read CLAUDE.md.

```bash
npm run assurance -- evidence-due --days=30 --json
```

Separate missing, expired and due soon evidence. Draft requests only. Do not send.

If a name is ambiguous, show the candidates and stop the change. Report the current result and the next responsible owner. Nothing sends or publishes.
