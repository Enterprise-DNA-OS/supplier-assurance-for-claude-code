---
description: Record a supplier approval review
---

# Record a supplier approval review

Read CLAUDE.md.

```bash
npm run assurance -- approve-supplier --supplier="SUP-01" --due=YYYY-MM-DD --rationale="Reason for approval" --evidence="private-review-reference" --actor="Reviewer" --json
```

Read the supplier and compliance evidence first. Use the named reviewer and agreed date. Never bypass missing evidence or a critical finding. This records an internal decision only.

If a name is ambiguous, show the candidates and stop the change. Report the current result and the next responsible owner. Nothing sends or publishes.
