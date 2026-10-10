---
description: Import a Gatekeeper vendor register
---

# Import a Gatekeeper vendor register

Read CLAUDE.md.

```bash
npm run assurance -- import gatekeeper --file="vendors.csv" --actor="Migration operator" --dry-run --json
```

Read docs/replace-gatekeeper.md. Compare source headings and counts, run the dry run, then remove --dry-run for the authorised import. Keep the export private. Never invent classifications from vendor status.

If a name is ambiguous, show the candidates and stop the change. Report the current result and the next responsible owner. Nothing sends or publishes.
