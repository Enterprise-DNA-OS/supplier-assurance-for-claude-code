# Command guide

Use `npm run assurance -- COMMAND --option=value`. All commands accept `--json`; boolean flags are bare. Unknown or duplicate options fail. Mutations require `--actor=Name`. Actor names are recorded assertions, not login identities.

| Command | Options |
|---|---|
| help | None |
| suppliers | None |
| supplier | --supplier |
| onboarding-queue | None |
| evidence-due | --days |
| reviews-due | --days |
| corrective-actions | None |
| performance | None |
| spend | None |
| concentration | None |
| compliance | None |
| attention | None |
| weekly-review | None |
| activity | --supplier |
| add-supplier | --reference, --name, --owner, --category, --country, --criticality, --personal-data, --overseas, --insurance-required, --spend, --currency, --actor |
| set-supplier | --supplier, --name, --owner, --category, --country, --criticality, --personal-data, --overseas, --insurance-required, --spend, --currency, --actor |
| record-evidence | --supplier, --kind, --evidence, --reviewed, --expires, --note, --actor |
| open-finding | --supplier, --title, --severity, --owner, --due, --actor |
| close-finding | --id, --resolution, --actor |
| scorecard | --supplier, --period, --delivery, --quality, --evidence, --actor |
| approve-supplier | --supplier, --due, --rationale, --evidence, --actor |
| suspend-supplier | --supplier, --reason, --actor |
| archive-supplier | --supplier, --reason, --actor |
| log | --supplier, --note, --actor |
| draft-review | --supplier |
| import | --file, --id-column, --name-column, --owner-column, --category-column, --dry-run, --actor |
| export | None |

Dates use real YYYY-MM-DD values. Evidence and scorecard dates cannot be in the future. Review dates cannot be in the past. Scores range from 0 to 100. criticality is unknown, low, medium or high. personal-data and overseas are unknown, yes or no. insurance-required is true or false. Evidence kind is identity, insurance, security or overseas. Finding severity is low, medium, high or critical. Spend is a nonnegative decimal with at most two places, or unknown to clear a value. Currency is a three-letter uppercase code.

Use `supplier --supplier=REFERENCE` for full history. A unique ID prefix or case-insensitive name works too. Ambiguous matches list candidates and exit 1. Review qualification is recomputed on each read.

Evidence-due includes missing evidence and everything expired or expiring within the horizon. Reviews-due includes all suppliers needing approval even if their previous due date is later. Archived records stay in exports but are excluded from working queues.

Import requires the positional source name gatekeeper. Read [the replacement guide](replace-gatekeeper.md) before importing. Mutations are transactional; a failed batch rolls back all rows. `--dry-run` is available only on import and always rolls back.
