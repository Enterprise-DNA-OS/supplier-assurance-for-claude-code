---
description: Add a supplier for onboarding
---

# Add a supplier for onboarding

Read CLAUDE.md.

```bash
npm run assurance -- add-supplier --reference="NEW-01" --name="New supplier" --owner="Casey" --category="Packaging" --actor="Reviewer" --json
```

Use the supplied values only. New records start unapproved. Ask for missing required fields.

If a name is ambiguous, show the candidates and stop the change. Report the current result and the next responsible owner. Nothing sends or publishes.
