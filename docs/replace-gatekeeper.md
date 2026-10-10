# Bring your Gatekeeper vendor register across

The [vendor's export instructions](https://knowledge.gatekeeperhq.com/en/docs/vendor-data-bulk-import), checked 10 October 2026, describe CSV exports from the Vendors list. Export the full list with Gatekeeper IDs. A filtered view or current page can omit records. Keep the original export as a private archive.

## Test the file, then import it

Use a fresh database and run `npm run migrate` without seeding fictional data. Set DATA_DIR for local storage or DATABASE_URL for your own Postgres database. These are ordinary environment variables on Windows and Linux; the CLI has no shell-specific dependency.

```bash
npm run assurance -- import gatekeeper --file=vendors.csv --actor="Migration operator" --dry-run
npm run assurance -- import gatekeeper --file=vendors.csv --actor="Migration operator"
```

The first validates every row inside a rolled-back transaction. It saves no suppliers, activity or import batches. The second commits the whole file or nothing. The CSV parser handles UTF-8 BOMs, CRLF, quoted commas, escaped quotes and embedded newlines.

## Field mapping

| Gatekeeper heading | Local record |
|---|---|
| Gatekeeper ID | Stable source_id and a reference prefixed GK-. Required. |
| Name, Vendor Name or Supplier Name | Supplier name. Required. |
| Owner or Vendor Owner | Owner, retained as text when available. |
| Category, Vendor Type or Type | Supplier category. |
| All columns | Preserved unchanged in source_payload, including custom fields. |

The vendor's mapping depends on tenant configuration. For different headings:

```bash
npm run assurance -- import gatekeeper --file=vendors.csv --id-column="Gatekeeper ID" --name-column="Legal Name" --owner-column="Relationship Owner" --category-column="Service Category" --actor="Migration operator" --dry-run
```

The fixture has synthetic rows and representative headings from the documented workflow. It is not a customer export. Reconcile actual headings and counts before relying on a migration.

## What requires review

Every imported supplier starts in onboarding. Source status, dates, spend and risk values stay in the original fields but are not assumed approved or mapped into controls. Assign the owner, category, criticality, privacy classification and insurance requirement. Add checked evidence before approving.

Contracts, attachments, contacts, portal users, terms, workflow history, scorecards, findings and approvals require separate mapping. Evidence references point to private files managed outside this database.

Identical rows are skipped, even if column order changes. Changed rows fail rather than overwriting decisions. Reconcile the difference, record local changes through set-supplier and retain the new export separately. No automatic source-snapshot replacement is included. Duplicate IDs or missing mandatory values fail the entire file.

## Cutover checks

1. Compare source and imported counts and inspect source_payload samples.
2. Check aliases, unknown classifications, currencies and missing evidence.
3. Run the weekly review alongside Gatekeeper and reconcile findings.
4. Produce approval briefs and confirm rules with the owner.
5. Back up the database and evidence and test restoration before changing subscriptions.

One command imports the vendor register. A full replacement needs mapping and owner review. Omni by Enterprise DNA handles this work for one setup fee followed by a retainer. [Book a call](https://enterprisedna.co/omni/book?offer=replace-software&utm_campaign=gatekeeper&utm_medium=replace-guide).
