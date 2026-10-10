---
description: Customise supplier assurance
---

# Customise supplier assurance

Read CLAUDE.md and the current migration before editing. Translate the owner's request into a field, classification or rule. Describe its impact on existing approvals. Back up the database first. Add the next numbered migration under supabase/migrations, then update the CLI and affected views and documents. Never rewrite an applied migration.

Test the change in a temporary database with npm test, including the failure case it affects. Inspect the resulting records. Apply with npm run migrate only to the intended database. Update the operating instructions and recipe. Keep one CLI and one command library. No external system changes or messages.
