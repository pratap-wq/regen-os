# FG Selling Price Lineage Audit

Date: 2026-07-10
Scope: FG Rate Management, Dispatch, reporting, costing, traceability, and June 2026 read-only reconciliation.

## Approved source and snapshot model

`FG_Rates` is the selling-rate master. A Dispatch resolves a rate independently for every FG line using dispatch date, grade, and customer. Customer-specific active rates take priority over an active default grade rate. A missing valid rate blocks the complete Dispatch.

The saved Dispatch is the historical commercial source. New and commercially edited rows store grade-line `rateId`, `ratePerKg`, `rateSource`, validity dates, and `lineValue`. The Dispatch header stores total quantity, `dispatchValue`, and `weightedAvgRatePerKg`. Inventory Ledger remains quantity-only.

Legacy Dispatch rows are normalized only while reading. A missing line rate uses the saved Dispatch header rate and is marked `LEGACY_HEADER_RATE`; the current FG rate master is never used to reprice history.

## Price-flow matrix

| Source screen / route | Source sheet | Destination / consumer | Destination sheet or output | Authoritative fields | Historical or current master | Finding and correction |
|---|---|---|---|---|---|---|
| FG Rate Management / `fgRate.add`, `fgRate.update`, `fgRates.list` and compatibility `fgRate.list` | FG_Rates | Dispatch rate resolution | Dispatch save preview and backend | rateId, grade, customerName, ratePerKg, effectiveFrom, effectiveTo, status | Current master for new or intentionally repriced Dispatch only | Month/year were previously not persisted correctly and validity fields were absent from the UI/bootstrap. They are now stored and returned. |
| New Dispatch / `dispatch.add` | FG_Rates + operator grade lines | Dispatches | Dispatches | dispatchLines[].rateId/ratePerKg/rateSource/rateEffectiveFrom/rateEffectiveTo/lineValue; quantityKg; dispatchValue; weightedAvgRatePerKg; price audit fields | Current master resolved once, then saved snapshot | Previously one header rate could represent all lines. Each line is now resolved and saved independently; any missing line rate blocks save. |
| Dispatch edit / `dispatch.get`, `dispatch.update` | Existing Dispatches row; FG_Rates only when a pricing key changes | Dispatches | Dispatches | saved line prices and header totals | Saved historical snapshot unless date, customer, or grade changes | Read normalization now supplies legacy saved header prices to the edit form. Non-commercial edits preserve rates; quantity recalculates value; date/customer/grade changes re-resolve. |
| Dispatch History / `dispatch.historySummary` | Dispatches | Dispatch page totals and rows | JSON response | saved dispatchValue; normalized legacy line values | Saved historical | Previously relied on header fields only. It now returns normalized lines, saved value, weighted average, and price source. |
| CEO Dashboard / `dashboard.ceoSummary` | Dispatches | CEO Dashboard | JSON summary revenue | saved/normalized dispatchValue | Saved historical | Historical revenue no longer uses `quantityKg * current/assumed master rate`; it uses the saved Dispatch commercial snapshot. |
| Dashboard frontend fallback | Dispatches API rows | Dashboard.jsx | Revenue KPI and cost engine | shared `dispatchRevenue()` | Saved historical | Replaced page-local quantity-times-rate calculation with shared normalization. |
| Factory Dashboard | Operational production/stores data | Factory dashboard | No FG revenue KPI found | Not applicable | Not applicable | No selling-price consumer was found, so no change was required. |
| Month Close backend / `monthClose.controlRoom` | Dispatches | Monthly Close money summary | moneySummary.salesValue | saved/normalized dispatchValue | Saved historical | Removed active FG_Rates lookup/fallback from historical month close. Deleted Dispatches remain excluded upstream. |
| Month Close frontend service | Dispatches rows | monthCloseEngine | salesValue, manufacturing profit | shared `dispatchRevenue()` | Saved historical | Replaced quantity-times-header-rate calculation. |
| Cost/profit engine | Dispatches rows | costEngine / Dashboard | revenue, average selling price, gross margin, profit | shared `dispatchRevenue()` | Saved historical; assumed price only when there is no Dispatch revenue | Actual Dispatch value now takes priority and is not repriced from FG_Rates. |
| Traceability | Dispatches | Traceability page | Read-only trace details | grade-line qty, saved rate, rate source, line value, Dispatch total | Saved historical | Added grade-wise price and total Dispatch value. |
| Printable/exported Dispatch history | `dispatch.historySummary` rows through DataTable | Current table/export payload | Client export | dispatchValue and weightedAvgRatePerKg | Saved historical | The current Dispatch table/export contract receives normalized saved values. No separate invoice/print implementation was found. |
| Invoice or sales report | Codebase search | None found | None | None | Not applicable | No independent invoice/sales-report repricing path exists in the current codebase. |
| Apps Script compatibility routes | FG_Rates | `fgRate.list/add/update` aliases | FG_Rates | same master fields | Current master | Compatibility aliases remain wired to the same FG_Rates handlers; no second rate master was introduced. |
| Inventory Ledger | Dispatches quantity movements | Inventory and availability | Inventory_Ledger | grade, qtyOut, sourceRef | No selling price | Confirmed unchanged. Selling-price changes do not alter inventory quantities. |

## June 2026 read-only reconciliation

Source: live Google Sheet and deployed read-only routes. No data was modified.

| Check | Result |
|---|---:|
| Active Dispatch count | 25 |
| Total dispatched quantity | 446,875 kg |
| Direct normalized Dispatch revenue | Rs. 50,088,625 |
| Dispatch History total | Rs. 50,088,625 |
| CEO Dashboard revenue | Rs. 50,088,625 |
| Month Close sales value | Rs. 50,088,625 |
| Difference across all four totals | Rs. 0 |
| Rows with missing rate | 0 |
| Rows with zero rate | 0 |
| Rows with no saved dispatchValue | 25 |
| Rows normalized from saved legacy header rate | 25 |
| Multi-grade rows incorrectly sharing one common rate | 0 |

The 25 historical June rows remain unchanged. Their values are reconstructed from each row's saved header rate and line quantities, never from today's FG_Rates.

## Regression coverage

`npm run test:dispatch-pricing` runs 16 named checks covering single/multi-grade pricing, customer/default rates, date boundaries, open-ended validity, missing-rate blocking, edit preservation/re-resolution, deleted rows, cross-consumer revenue reconciliation, and protection from later master-rate changes.
