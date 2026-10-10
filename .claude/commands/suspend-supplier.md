---
description: Suspend supplier qualification
---

# Suspend supplier qualification

Read CLAUDE.md.

```bash
npm run assurance -- suspend-supplier --supplier="SUP-01" --reason="Owner decision" --actor="Reviewer" --json
```

Record an authorised suspension. It does not cancel an agreement or prevent orders in another system.

If a name is ambiguous, show the candidates and stop the change. Report the current result and the next responsible owner. Nothing sends or publishes.
