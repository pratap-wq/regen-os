import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../apps-script/Code.js", import.meta.url), "utf8");
const context = vm.createContext({ console, Date, JSON, Math, Number, String, Object, Array, RegExp, isNaN, parseInt });
vm.runInContext(source, context);

function evaluate(expression) {
  return vm.runInContext(expression, context);
}

const before = {
  date: "2026-07-09",
  inputMaterial: "White Regrind (Unwashed)",
  inputWeightKg: 7621,
  feedComposition: '[{"material":"White Regrind (Unwashed)","qtyKg":7621}]',
  outputComposition: '[{"material":"White Regrind (Washed)","qtyKg":6804}]',
  washedOutputKg: 6804,
  dustKg: 260,
  remarks: "before",
};
context.__before = before;
context.__nonCommercial = { ...before, remarks: "after", operatorName: "Uday" };
context.__quantityEdit = { ...before, inputWeightKg: 7600 };
context.__dateEdit = { ...before, date: "2026-07-10" };

assert.equal(evaluate('productionLedgerImpactChanged_("WASH", __before, __nonCommercial)'), false);
assert.equal(evaluate('productionLedgerImpactChanged_("WASH", __before, __quantityEdit)'), true);
assert.equal(evaluate('productionLedgerImpactChanged_("WASH", __before, __dateEdit)'), true);

context.__sheets = {
  Inventory_Ledger: [
    { ledgerId: "L1", date: "2026-07-09", module: "WASH", movementType: "OUT", itemType: "RM", itemName: "Input", targetRef: "WB-1", qtyIn: 0, qtyOut: 100, status: "ACTIVE" },
    { ledgerId: "L2", date: "2026-07-09", module: "WASH", movementType: "OUT", itemType: "RM", itemName: "Input", targetRef: "WB-1", qtyIn: 0, qtyOut: 100, status: "ACTIVE" },
    { ledgerId: "L3", date: "2026-07-09", module: "WASH", movementType: "OUT", itemType: "RM", itemName: "Input", targetRef: "WB-1", qtyIn: 0, qtyOut: -5, status: "ACTIVE" },
    { ledgerId: "L4", date: "2026-07-09", module: "WASH", movementType: "IN", itemType: "WIP", itemName: "Output", targetRef: "WB-1", qtyIn: 180, qtyOut: 0, status: "VOIDED" },
  ],
  Grinder_Batches: [],
  Wash_Batches: [{ washBatchId: "WB-1" }],
  Sorting_Batches: [],
  Extrusion_Batches: [
    { extrusionBatchId: "EX-DUP" },
    { extrusionBatchId: "EX-DUP" },
  ],
};
vm.runInContext("getRowsAsObjects = function(name) { return __sheets[name] || []; }; output = function(value) { return value; };", context);
const audit = evaluate("auditProductionLedger({})");

assert.equal(audit.readOnly, true);
assert.equal(audit.negativeQuantityRowCount, 1);
assert.equal(audit.doubleNegatedOutRowCount, 1);
assert.equal(audit.duplicateActiveMovementGroupCount, 1);
assert.equal(audit.operationalDuplicateBatchIdCount, 1);
assert.equal(audit.negativeBalanceAffectedBatchIdCount, 1);
assert.deepEqual(Array.from(audit.affectedBatchIds), ["WB-1", "EX-DUP"]);

context.__deletedIndex = { "GRINDER|GB-DELETED": true };
context.__deletedLedgerRows = [
  { ledgerId: "DG-1", module: "GRINDER", targetRef: "GB-DELETED", qtyIn: 0, qtyOut: 50, status: "ACTIVE" },
  { ledgerId: "DG-2", module: "GRINDER", targetRef: "GB-DELETED", qtyIn: 45, qtyOut: 0, status: "ACTIVE" },
  { ledgerId: "DG-3", module: "GRINDER", targetRef: "GB-DELETED", qtyIn: 1, qtyOut: 0, status: "VOIDED" },
  { ledgerId: "WG-1", module: "WASH", targetRef: "GB-DELETED", qtyIn: 40, qtyOut: 0, status: "ACTIVE" },
];
const deletedCandidates = evaluate("productionLedgerDeletedSourceCandidates_(__deletedLedgerRows, __deletedIndex)");
assert.deepEqual(Array.from(deletedCandidates, (row) => row.ledgerId), ["DG-1", "DG-2"]);
context.__deletedCandidates = deletedCandidates;
const deletedSummary = evaluate("productionLedgerDeletedSourceSummary_(__deletedCandidates)");
assert.equal(deletedSummary.ledgerRowsMatched, 2);
assert.equal(deletedSummary.sourceRecordsMatched, 1);
assert.equal(deletedSummary.qtyInKg, 45);
assert.equal(deletedSummary.qtyOutKg, 50);
assert.equal(deletedSummary.netInventoryImpactKg, -5);

context.__events = [];
context.__updateData = {};
vm.runInContext(`
  LockService = { getScriptLock: function() { return { tryLock: function() { return true; }, releaseLock: function() {} }; } };
  productionHistoryRecordConfig_ = function() { return { sheetName: "Wash_Batches", idField: "washBatchId", headers: [] }; };
  ensureHeaders_ = function() {};
  findSheetObjectRowById_ = function() {
    return { object: __before, headers: [], values: [], rowNumber: 2, sheet: {} };
  };
  validateOperationalWrite_ = function() {};
  prepareProductionRecordUpdate_ = function(stage, existing, data) {
    return { patch: data, ledgerBatch: { moves: [{ direction: "OUT", qtyKg: data.inputWeightKg || existing.inputWeightKg }] } };
  };
  voidProductionLedgerRows_ = function() { __events.push("void"); return { count: 2, previousRows: [] }; };
  appendProductionLedgerBatch_ = function() { __events.push("append"); return 2; };
  applySheetObjectPatch_ = function() { __events.push("operational"); };
  output = function(value) { return value; };
`, context);

context.__events.length = 0;
context.__updateData = { remarks: "updated" };
const nonCommercialUpdate = evaluate('updateProductionRecordWithLedger_("WASH", "WB-1", __updateData)');
assert.equal(nonCommercialUpdate.ok, true);
assert.equal(nonCommercialUpdate.ledgerUnchanged, true);
assert.deepEqual(Array.from(context.__events), ["operational"]);

context.__events.length = 0;
context.__updateData = { inputWeightKg: 7000 };
const inventoryUpdate = evaluate('updateProductionRecordWithLedger_("WASH", "WB-1", __updateData)');
assert.equal(inventoryUpdate.ok, true);
assert.equal(inventoryUpdate.ledgerPosted, true);
assert.deepEqual(Array.from(context.__events), ["void", "append", "operational"]);

context.__events.length = 0;
context.__updateData = { status: "DELETED" };
const deleteUpdate = evaluate('updateProductionRecordWithLedger_("WASH", "WB-1", __updateData)');
assert.equal(deleteUpdate.deleted, true);
assert.equal(deleteUpdate.ledgerVoided, true);
assert.deepEqual(Array.from(context.__events), ["void", "operational"]);

console.log("Production ledger integrity regression checks passed (25/25).");
