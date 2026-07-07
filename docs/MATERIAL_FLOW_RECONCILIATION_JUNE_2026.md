# RegenOS V1 June 2026 Material-Flow Reconciliation

Status: diagnosis and safe dry-run support only. No live migration is executed by this change.

## Scope

Audit June 2026 material naming and quantity flow across:

- RM_Inward
- Wash_Batches
- Sorting_Batches
- Extrusion_Batches
- Dispatches
- Inventory_Ledger
- Material_Master
- Production_Materials
- RM_Quality
- FG_Quality
- Month_Close
- Physical_Counts
- Inventory_Adjustments

## Root cause identified from code path

Month Close is currently stage-based, not material-ledger based:

- RM closing = RM receiving - wash input
- Washed closing = wash output - sorting input
- Sorted closing = sorting accepted - extrusion input
- FG closing = extrusion output - dispatch

This means `White Sorted` can go negative when extrusion consumes sorted material but June source data does not contain matching sorting output.

The backend rebuild/migration code also defaults extrusion input to `White Sorted` when old rows do not provide a clear input material. If June production physically skipped sorting, the correct V1 interpretation should be direct flow:

`Washed White Flakes -> Extrusion -> E1/E2/E3`

not:

`White Sorted -> Extrusion`

## Materials needing merge / normalization

| Old / found name | Suggested V1 material | Category | Merge? | Reason |
|---|---|---:|---:|---|
| White Flakes | White Flakes | RM | No | Valid RM material |
| Washed Material | Washed White Flakes | WIP | Yes | Generic stage name; not a material master name |
| Washed Flakes | Washed White Flakes | WIP | Yes | Alias |
| Washed White Flakes | Washed White Flakes | WIP | No | Valid WIP material |
| White Sorted | White Sorted Flakes | WIP | Yes | Should be material-specific, not stage shorthand |
| Sorted Material | White Sorted Flakes | WIP | Yes | Generic stage name; causes apples-to-oranges close |
| E1 / E2 / E3 | E1 / E2 / E3 | FG | No | Valid FG grades |
| Sink Material | Sink Material | WASTE | No | Valid waste material |
| Dust | Dust | WASTE | No | Valid waste material |
| Lumps | Lumps | REWORK | No | Reusable/rework material |
| Purging | Purging | REWORK | No | Reusable/rework material |
| Rework Granules | Rework Material | REWORK | Yes | Alias |
| Virgin Material | Virgin PP | ADDITIVE | Yes | Alias |
| Master Batch | Masterbatch | ADDITIVE | Yes | Alias |
| Anti Oxidant | Antioxidant | ADDITIVE | Yes | Alias |
| `E1: 25000 Kg` | E1 | FG | Yes | Quantity text must not be part of material name |
| Recipe/feed text | Not an inventory material | UNKNOWN | Yes | Must move to recipe/components, not Inventory_Ledger |

## Negative inventory cause to verify with live audit

The expected bad pattern is:

1. `Sorting_Batches` has little/no `whiteSortedKg` or `acceptedQtyKg`.
2. `Extrusion_Batches` consumes `inputWeightKg` with missing/blank `inputMaterial`.
3. Rebuild logic defaults blank extrusion input to `White Sorted`.
4. Month Close computes `sortingClosingKg = sortingAcceptedKg - extrusionInputKg`.
5. Result: `White Sorted` / sorted WIP appears negative even if the factory actually ran Wash -> Extrusion.

The new diagnostic route returns `directFlowDiagnosis` with:

- `sortingProducedKg`
- `extrusionSortedConsumedKg`
- `washedProducedKg`
- `likelyDirectWashToExtrusion`
- root-cause text

## Direct-flow rule proposed

If June sorting output is missing or zero, extrusion should not be forced to consume `White Sorted` or `White Sorted Flakes`.

Rule:

> If `Sorting_Batches` has no matching sorted output for the month and extrusion input material is blank, generic, sorted-feed recipe text, or feed-composition text, treat extrusion base input as washed material.

Washed material selection:

- Use `Washed White Flakes` when June wash output is mainly white.
- Use `Washed Mixed` when June wash output is mainly mixed.

Never write recipe/feed text as `Inventory_Ledger.itemName`.

Examples that must be removed from inventory material names:

- `WHITE FLAKES: + ANTIOXIDANT: + MASTERBATCH:`
- `SORTED FLAKES: + ANTIOXIDANT: + MASTERBATCH:`
- `ANTIOXIDANT: + MASTERBATCH:`

This supports the actual physical flow:

`RM -> Wash -> Extrusion -> FG`

when color sorting was skipped.

## New diagnostic / migration functions

Routes:

- `materialFlow.auditJune2026`
- `materialFlow.migrationPlanJune2026`
- `materialFlow.migrateJuneToV1`
- `materialFlow.migrateJuneToV1Chunk`
- `materialFlow.verifyJune2026`

Apps Script function:

- `migrateJuneMaterialFlowToV1(dryRun)`

Dry-run URL:

```text
?fn=materialFlow.migrateJuneToV1&dryRun=true
```

Lightweight plan URL:

```text
?fn=materialFlow.migrationPlanJune2026
```

Chunked dry-run URL:

```text
?fn=materialFlow.migrateJuneToV1Chunk&dryRun=true&chunkSize=100&cursor=0
```

Chunked live URL, only after approval:

```text
?fn=materialFlow.migrateJuneToV1Chunk&dryRun=false&chunkSize=100&cursor=0
```

Verify URL:

```text
?fn=materialFlow.verifyJune2026
```

Audit URL:

```text
?fn=materialFlow.auditJune2026&periodMonth=2026-06
```

Live migration URL, only after approval:

```text
?fn=materialFlow.migrateJuneToV1&dryRun=false
```

## Safe transformation behavior

Dry run:

- Reads all relevant source sheets.
- Builds proposed V1 movements.
- Returns before/after balances.
- Does not modify data.

Live run, only if manually called with `dryRun=false`:

- Backs up `Inventory_Ledger`.
- Removes only June 2026 ledger rows.
- Rebuilds June 2026 ledger rows from source sheets.
- Preserves source sheet rows.
- Adds `legacyMaterialName` on rebuilt ledger rows.
- Uses `legacySourceSheet` and `legacySourceId` for traceability.
- Prevents duplicate June ledger rows by replacing the June ledger slice.
- Excludes `STORE` materials from the manufacturing material-flow dry-run and manufacturing Month Close audit.
- Returns `whiteSortedReconciliation` showing whether negative White Sorted/White Sorted Flakes is removed.
- Chunked migration replaces only June manufacturing ledger rows. June STORE ledger rows are preserved.
- FG quality refs such as `E1-20260601-A-001` are excluded from inventory material names.

Month Close manufacturing grouping after normalization:

- RM: White Flakes, White Regrind, Mixed Material, approved RM inputs
- WIP: Washed White Flakes, Washed Mixed, White Sorted Flakes when sorting really occurred
- FG: E1, E2, E3, E4, E5
- WASTE: Sink Material, Dust, Wrapper Reject, Micro Plastic, Color Reject
- REWORK: Lumps, Purging, Rework Material

Stores are excluded from manufacturing material close unless closing Stores specifically.

## db.runMigrations requirement

Recommended before live migration.

Reason: `Inventory_Ledger` now includes `legacyMaterialName` to preserve the old source material label in rebuilt ledger rows.

## Deployment checklist

1. Deploy Apps Script with `clasp push`.
2. Run `db.runMigrations`.
3. Run lightweight plan:
   `?fn=materialFlow.migrationPlanJune2026`
4. Run audit if a detailed material list is needed:
   `?fn=materialFlow.auditJune2026&periodMonth=2026-06`
5. Review:
   - `materials`
   - `negativeInventory`
   - `directFlowDiagnosis`
   - `proposedNormalizationMap`
6. Run chunked dry-run migration:
   `?fn=materialFlow.migrateJuneToV1Chunk&dryRun=true&chunkSize=100&cursor=0`
7. Continue using returned `nextCursor` until `done=true`.
8. Compare before/after balances.
9. Only after approval, run live chunks:
   `?fn=materialFlow.migrateJuneToV1Chunk&dryRun=false&chunkSize=100&cursor=0`
10. Continue using returned `nextCursor` until `done=true`.
11. Verify:
   `?fn=materialFlow.verifyJune2026`
12. Re-open Month Close for June 2026 and verify no material is negative unless backed by real physical variance.
