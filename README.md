# Supplier Assurance for Claude Code

Know which suppliers are ready to use, whose evidence has expired and which corrective actions need an owner. Keep those decisions in a database you own.

| Do it yourself | We customise it | We run it for you |
|---|---|---|
| Free, MIT licensed. Install the fictional register and try the weekly review. | Your evidence rules, supplier fields, Gatekeeper mappings and business views. | Installed and operated through Omni by Enterprise DNA. One setup fee, then a retainer. |
| [Quick start](#quick-start) | [Get your version built](https://enterprisedna.co/omni/book?offer=replace-software&utm_campaign=gatekeeper&utm_medium=customise) | [Book a call](https://enterprisedna.co/omni/book?offer=replace-software&utm_campaign=gatekeeper&utm_medium=managed) |

For the operations owner who approves suppliers and follows up on performance. Works with Claude Code, Codex, OpenCode or Cursor. Gatekeeper covers a broader vendor and contract lifecycle. This base covers supplier assurance: onboarding, evidence, qualification reviews, scorecards and corrective actions. [Scope and sources](docs/research.md).

## Quick start

Node 20 or later on Windows or Linux:

```bash
git clone https://github.com/Enterprise-DNA-OS/supplier-assurance-for-claude-code.git
cd supplier-assurance-for-claude-code
npm install
npm run demo
npm test
npm run view
npm run docs
```

Local PGlite uses `.data/db`, with one process at a time. `DATABASE_URL` selects Postgres 15 or later. The fictional Harbour seed includes expired insurance, missing overseas-data evidence, an overdue corrective action, a stale scorecard and a supplier ready for use. Dates are relative to first seed. Repeated seeds preserve existing work.

For business records, select a fresh `DATA_DIR` or database, run migrations without the demo seed, then follow the [replacement guide](docs/replace-gatekeeper.md).

## Five weekly jobs

1. `/onboarding-queue`: give new suppliers an owner and complete their classification.
2. `/evidence-due`: replace expired evidence and chase missing reviews.
3. `/reviews-due`: approve suppliers against the evidence recorded today.
4. `/corrective-actions`: close defects with a recorded resolution.
5. `/weekly-review`: combine reviews, evidence, actions and scorecards.

There are 27 CLI commands and 28 slash recipes. Every CLI command accepts `--json`. Run `npm run assurance -- help` or read [the command guide](docs/cli.md). Names match without case, references match exactly and IDs accept unique prefixes. Ambiguous names list candidates and exit 1.

## Approval means current evidence

Suppliers need an owner, a criticality and a personal-information classification. Identity review is always required. Insurance review is required when your policy says so. Suppliers handling personal information need a security review, and overseas recipients need an applicability and safeguards review.

Approval is blocked by missing or expired evidence and open critical findings. Updating a supplier, adding evidence, recording a scorecard or changing a finding invalidates its previous approval. Evidence expiry and review deadlines also invalidate approval as time passes. The next approval records its reviewer, rationale, evidence reference and next review date.

This records an internal decision. It does not inspect documents, verify identities, screen sanctions, perform credit checks, certify compliance or place orders. Actor names are recorded assertions, not authenticated signatures. A shared service needs access control and authenticated operators. [Rules and their sources](docs/compliance.md).

## Ten questions for your supplier meeting

Gatekeeper has configurable reports and conversational analysis. These are questions this base answers today, not unsupported claims that Gatekeeper cannot answer them.

| Question | Command |
|---|---|
| Which new suppliers still need classification and an owner? | `onboarding-queue` |
| Whose insurance evidence is already expired? | `evidence-due` |
| Which overseas suppliers lack a recorded safeguards review? | `compliance` |
| Which suppliers need a new approval after their records changed? | `reviews-due` |
| Which corrective actions are overdue, and who owns them? | `corrective-actions` |
| Which scorecards are below target or too old to rely on? | `performance` |
| What annual spend is recorded by category and currency? | `spend` |
| Which categories have no currently approved supplier? | `concentration` |
| What evidence and decisions support one supplier's status? | `supplier` |
| What needs attention at Monday's meeting? | `weekly-review` |

Recorded spend is an annual estimate, not a payment ledger. Missing amounts remain unknown. Currency totals stay separate. Category counts show recorded alternatives, not proof of substitutability. Scorecards use local policies: a score under 80 needs review and one older than 90 days is stale. Change these rules to match your agreements.

## Your first hour: ten things to ask for

1. Put our business name and colours on supplier review documents.
2. Find expired insurance and missing identity reviews.
3. Give each new supplier a responsible owner.
4. Separate Australian and New Zealand annual spend.
5. Show categories with no supplier approved today.
6. Draft an evidence request for the oldest overdue review.
7. Record a corrective action with its owner and due date.
8. Test our Gatekeeper vendor export without saving it.
9. Add a business-unit field through `/customise`.
10. Add our quarterly supplier review snapshot through `/new-view`.

## Bring the vendor register across

```bash
npm run assurance -- import gatekeeper --file=vendors.csv --actor="Migration operator" --dry-run
npm run assurance -- import gatekeeper --file=vendors.csv --actor="Migration operator"
```

The importer requires Gatekeeper IDs and names, accepts mappings for renamed headings and preserves every source field. Exact repeat imports are safe. Changed source rows, duplicate IDs or invalid records roll back the entire file. Suppliers enter onboarding with unverified classifications. A source status of Live never implies local approval.

Contracts, attachments, portal users, workflow history and risk records need separate reconciliation. The fixture is synthetic, not a customer export. One command imports the vendor register, not a complete Gatekeeper account. [Mappings and cutover checks](docs/replace-gatekeeper.md).

## Review documents and views

`npm run docs` produces approval briefs, evidence request drafts and corrective action plans as branded HTML. `npm run view` produces two read-only snapshots: the week and supplier performance. Change `brand.json` once to set your business name, logo and colours. Print documents to PDF from your browser. Output stays local and is ignored by Git.

`draft-review` writes an internal review to `drafts/`. Nothing sends. `/customise` changes the schema and policies through a reviewed migration. `/new-view` adds a read-only snapshot. [Why there is no front end](docs/why-no-front-end.md).

## Verification and backups

`npm test` creates a temporary database, runs every CLI command and checks stale approvals, expiry, critical findings, atomic imports, source preservation, currency separation, repeated migrations and seeds, drafts, full exports and escaped HTML. The same suite runs against a fresh disposable Postgres database with `TEST_DATABASE_URL`. GitHub checks are configured for Linux, Windows and Postgres.

`export` writes all seven record sets as JSON. This is an interchange snapshot, not an automatic restore command. Back up the database and referenced evidence separately. The private database schema grants no access to public users. Read [operating instructions](CLAUDE.md) before sharing access.

MIT licence. Not affiliated with Gatekeeper or Anthropic. Hosting and agent use have separate costs. [Book 30 minutes with Sam](https://enterprisedna.co/omni/book?offer=replace-software&utm_campaign=gatekeeper&utm_medium=readme).
