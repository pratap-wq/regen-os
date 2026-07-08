# Grinder E2E Test Plan

Mode: local dry-run only. Do not deploy and do not write these rows to Google Sheets unless management approves a live test window.

Test period: January 2026.

Test identifiers:

- `TEST-GRINDER-JAN-2026`
- `TEST-RM-BUCKETS`
- `TEST-WHITE-REGRIND`

Run:

```bash
npm.cmd run test:grinder
npm.cmd run build
node --check apps-script\Code.js
```

The local dry-run creates 10 in-memory sample fixtures covering RM Inward, Grinder, `White Regrind (Unwashed)`, Wash, Sorter, Extrusion, FG stock, Dispatch, and Production History edit visibility.

Expected ledger outcome:

- `TEST-RM-BUCKETS`: 3000 Kg closing.
- `White Regrind (Unwashed)`: 200 Kg closing after Wash consumption.
- `Washed White Flakes`: 200 Kg closing after Sorter consumption.
- `White Sorted`: 100 Kg closing after Extrusion consumption.
- `E1`: 3100 Kg closing after Dispatch.

Cleanup:

No cleanup is required for the local dry-run because no Sheet rows are inserted.

If the same TEST identifiers are later inserted into Google Sheets, delete rows containing `TEST-GRINDER-JAN-2026`, `TEST-RM-BUCKETS`, or `TEST-WHITE-REGRIND` from:

- `RM_Inward`
- `Grinder_Batches`
- `Wash_Batches`
- `Sorting_Batches`
- `Extrusion_Batches`
- `Dispatches`
- `Inventory_Ledger`

Known alignment checks:

- Grinder ledger flow is tested locally.
- Production History Grinder visibility and dropdown edit hooks are tested by source inspection.
- Live Inventory currently needs separate ledger alignment if it does not load ledger balances and `Grinder_Batches`.
- The older local `monthCloseEngine` needs separate Grinder/ledger alignment if it does not accept `grinderRows`.
