---
description: Record a period scorecard
---

# Record a period scorecard

Read CLAUDE.md.

```bash
npm run assurance -- scorecard --supplier="SUP-01" --period=YYYY-MM-DD --delivery=95 --quality=98 --evidence="private-reference" --actor="Reviewer" --json
```

Scores must be observed values from 0 to 100 and the period cannot be in the future. Do not invent scores. A period can be recorded once.

If a name is ambiguous, show the candidates and stop the change. Report the current result and the next responsible owner. Nothing sends or publishes.
