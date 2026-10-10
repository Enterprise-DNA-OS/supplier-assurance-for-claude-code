---
description: Record a supplier corrective action
---

# Record a supplier corrective action

Read CLAUDE.md.

```bash
npm run assurance -- open-finding --supplier="SUP-01" --title="Action required" --severity=high --owner="Casey" --due=YYYY-MM-DD --actor="Reviewer" --json
```

Use the owner-agreed severity and date. Critical findings block approval.

If a name is ambiguous, show the candidates and stop the change. Report the current result and the next responsible owner. Nothing sends or publishes.
