---
description: Close a resolved corrective action
---

# Close a resolved corrective action

Read CLAUDE.md.

```bash
npm run assurance -- close-finding --id="finding-id" --resolution="Resolution and evidence checked" --actor="Reviewer" --json
```

Read the action and inspect the outcome before closing. Closing requires a resolution and invalidates approval.

If a name is ambiguous, show the candidates and stop the change. Report the current result and the next responsible owner. Nothing sends or publishes.
