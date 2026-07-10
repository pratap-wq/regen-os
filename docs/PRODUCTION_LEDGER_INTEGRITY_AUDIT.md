# Production History and Ledger Integrity Audit

Read-only live audit performed on 2026-07-10 against the RegenOS Google Sheets database. No sheet rows were changed.

## Result

- Inventory ledger data rows: 1,702
- Production ledger rows: 937
- Active production ledger rows: 907
- Inactive or voided production ledger rows: 30
- Active duplicate movement groups: 0
- Negative `qtyIn` or `qtyOut` rows: 0
- Double-negated `OUT` rows: 0
- Materials with a negative active balance: 87
- Production batch IDs contributing `OUT` movements to those negative balances: 175

The negative figures are not caused by arithmetic double-negation or active ledger duplication during edits. They are caused by active consumption recorded under material names that lack equivalent canonical inward/opening movements. Examples include `Unwashed Regrinds`, `Mixed PPCP Buckets`, `Mixed Regrind`, `Flakes Unwashed`, and recipe strings stored as inventory item names.

## Edit audit

`WB-20260710-583C` has 36 related production ledger rows: 6 active and 30 voided. This is audit history from repeated edits, not active double-counting. The previous update path scanned every historical matching row individually, so each additional edit made later edits slower.

Six duplicate operational IDs make ID-based Extrusion editing ambiguous:

- `E2-20260606-A-001`
- `E1-20260625-A-001`
- `E1-20260625-B-001`
- `E1-20260626-B-001`
- `E1-20260616-B-001`
- `E1-20260627-C-001`

The backend now blocks editing an ambiguous duplicate ID instead of silently updating the first matching row.

## Diagnostic route

`productionLedger.audit` is read-only. Its response includes:

- active and voided row counts
- negative quantity and double-negation checks
- active duplicate movement groups
- edited batches
- duplicate operational batch IDs
- negative material balances
- the complete `negativeBalanceAffectedBatchIds` array

Deploying `apps-script/Code.js` is required before the route is available on the live Apps Script URL. No data repair is performed by this route.
