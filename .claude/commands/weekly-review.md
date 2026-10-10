---
description: Prepare Monday supplier review
---

# Prepare Monday supplier review

Read CLAUDE.md.

```bash
npm run assurance -- weekly-review --json
```

This command combines reviews-due, evidence-due, corrective-actions and performance. Write a dated internal brief with owners and next actions. Do not infer approval from an old status.

If a name is ambiguous, show the candidates and stop the change. Report the current result and the next responsible owner. Nothing sends or publishes.
