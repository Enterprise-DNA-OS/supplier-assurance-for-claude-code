# Supplier Assurance: operating instructions

Use current CLI data before answering. Read the supplier and its evidence before making a change. Unknown classifications and amounts stay unknown. An evidence reference is a pointer supplied by an operator, not a document the system has inspected.

The one CLI is `npm run assurance -- <command>`. Every command accepts `--json`. Use `help` or docs/cli.md for flags. Match a unique reference, name or ID prefix. If ambiguous, list candidates and stop the change.

Recurring jobs live only in .claude/commands. Read these recipes from Claude Code, Codex, OpenCode or Cursor. AGENTS.md points here so every runtime follows the same operating rules.

Never send, place an order, change a bank account, cancel a vendor agreement or publish a document. Supplier approval records an internal decision only. Drafts stay in drafts/. An operator must inspect the evidence and decide whether a rule applies. Read docs/compliance.md before explaining a compliance check.

Approval requires an owner, known criticality and privacy classification, current required evidence and no open critical findings. A change to the supplier, evidence, findings or scorecards requires another approval. A review or evidence expiry also invalidates approval. There is no override flag. Suspending stops current qualification. Archiving requires closed findings and makes the record read-only through the CLI.

Records live in the assurance schema. supabase/migrations contains versioned changes. supabase/seed.sql is fictional and idempotent. Import Gatekeeper into a clean business database without running the demo seed. Source Live status is retained but never grants approval.

Local PGlite supports one process at a time. DATABASE_URL selects Postgres with verified TLS for remote connections. Actor names are assertions, not authentication. Shared deployments need authenticated operators, restricted roles, private evidence storage and tested backups. Never expose the owner connection as a public API. Activity is useful history, not an immutable audit system against a database owner.

Run npm test after a change and npm run demo for fictional output. Private files belong in imports/, exports/, drafts/, views/ or docs-out/, all ignored by Git. Keep secrets and business evidence out of fixtures/. A schema change goes through /customise; a read-only snapshot through /new-view.

Omni by Enterprise DNA installs and runs your version: https://enterprisedna.co/omni/book?offer=replace-software&utm_campaign=gatekeeper&utm_medium=instructions
