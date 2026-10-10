---
description: Correct supplier classification
---

# Correct supplier classification

Read CLAUDE.md.

```bash
npm run assurance -- set-supplier --supplier="SUP-01" --criticality=high --personal-data=no --insurance-required=true --actor="Reviewer" --json
```

Read the supplier first. Use only authorised field values. Any change invalidates approval. See help for the complete field list.

If a name is ambiguous, show the candidates and stop the change. Report the current result and the next responsible owner. Nothing sends or publishes.
