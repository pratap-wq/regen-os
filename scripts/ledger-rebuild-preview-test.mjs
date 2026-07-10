import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../apps-script/Code.js", import.meta.url), "utf8");
const context = vm.createContext({ console, Date, JSON, Math, Number, String, Object, Array, RegExp, isNaN, parseInt });
vm.runInContext(source, context);

context.__materials = [
  ["WHITE_BUCKETS", "White Buckets", "RM"], ["WHITE_REGRIND_UNWASHED", "White Regrind (Unwashed)", "RM"],
  ["WHITE_REGRIND_WASHED", "White Regrind (Washed)", "WIP"], ["WHITE_SORTED_REGRIND", "White Sorted Regrind", "WIP"],
  ["DUST", "Dust", "WASTE"], ["E1", "E1", "FG"], ["E2", "E2", "FG"],
  ["REWORK_MATERIAL", "Rework Material", "REWORK"], ["MASTERBATCH", "Masterbatch", "ADDITIVE"],
].map(([materialCode, materialName, category]) => ({
  materialId: `MAT-${materialCode}`, materialCode, materialName, category, status: "ACTIVE",
  appearsInDispatch: category === "FG" ? "YES" : "NO",
}));

vm.runInContext(`
  getMaterialMasterRows_ = function() { return __materials; };
  dispatchLineGrade_ = function(line, fallback) {
    var value = String(line && (line.grade || line.material || line.materialName) || fallback || "").trim().toUpperCase();
    return /^E[1-5]$/.test(value) ? value : "";
  };
  generateBatchId = (function() { var n = 0; return function(prefix) { n += 1; return prefix + "-TEST-" + n; }; })();
  output = function(value) { return value; };
`, context);

context.__sources = {
  rmRows: [
    { inwardId: "RM-1", date: "2026-07-01", status: "APPROVED", qcStatus: "APPROVED", materialLines: '[{"material":"White Buckets","quantityKg":100}]' },
    { inwardId: "RM-PENDING", date: "2026-07-01", status: "QC_PENDING", qcStatus: "PENDING", material: "White Buckets", netWeight: 999 },
  ],
  grinderRows: [
    { grinderBatchId: "GB-1", date: "2026-07-02", status: "ACTIVE", feedComposition: '[{"material":"White Buckets","qtyKg":60}]', outputComposition: '[{"material":"White Regrind (Unwashed)","qtyKg":55},{"material":"Dust","qtyKg":5}]' },
  ],
  washRows: [
    { washBatchId: "WB-1", date: "2026-07-03", status: "ACTIVE", feedComposition: '[{"material":"White Regrind (Unwashed)","qtyKg":40}]', outputComposition: '[{"material":"White Regrind (Washed)","qtyKg":35},{"material":"Dust","qtyKg":5}]' },
  ],
  sortingRows: [
    { sortingBatchId: "SB-1", date: "2026-07-04", status: "ACTIVE", feedComposition: '[{"material":"White Regrind (Washed)","qtyKg":10}]', outputComposition: '[{"material":"White Sorted Regrind","qtyKg":9},{"material":"Dust","qtyKg":1}]' },
  ],
  extrusionRows: [
    { extrusionBatchId: "EX-DIRECT", date: "2026-07-05", status: "ACTIVE", feedComposition: '[{"material":"White Regrind (Washed)","qtyKg":15},{"material":"Masterbatch","qtyKg":1}]', outputComposition: '[{"material":"E1","qtyKg":14},{"material":"Rework Material","qtyKg":2}]' },
    { extrusionBatchId: "EX-SORTED", date: "2026-07-05", status: "ACTIVE", feedComposition: '[{"material":"White Sorted Regrind","qtyKg":4}]', outputComposition: '[{"material":"E2","qtyKg":4}]' },
  ],
  dispatchRows: [
    { dispatchId: "DIS-1", date: "2026-07-06", status: "ACTIVE", dispatchLines: '[{"grade":"E1","dispatchQtyKg":5},{"grade":"E2","dispatchQtyKg":2}]' },
  ],
  adjustmentRows: [
    { adjustmentId: "IA-1", date: "2026-07-06", status: "APPROVED", itemCode: "E1", quantityKg: 1 },
  ],
};

const built = vm.runInContext("ledgerPreviewBuildExpected_(__sources, __materials)", context);
const expected = JSON.parse(JSON.stringify(built.expected));

assert.equal(expected.filter((row) => row.sourceId === "RM-1" && row.direction === "IN").length, 1);
assert.equal(expected.some((row) => row.sourceId === "RM-PENDING"), false);
assert.equal(expected.filter((row) => row.sourceId === "GB-1" && row.direction === "OUT").length, 1);
assert.equal(expected.filter((row) => row.sourceId === "GB-1" && row.direction === "IN").length, 2);
assert.equal(expected.filter((row) => row.sourceId === "WB-1" && row.direction === "OUT").length, 1);
assert.equal(expected.filter((row) => row.sourceId === "WB-1" && row.direction === "IN").length, 2);
assert.equal(expected.some((row) => row.sourceId === "EX-DIRECT" && row.materialCode === "WHITE_REGRIND_WASHED" && row.direction === "OUT"), true);
assert.equal(expected.some((row) => row.sourceId === "SB-1" && row.materialCode === "WHITE_SORTED_REGRIND" && row.direction === "IN"), true);
assert.equal(expected.filter((row) => row.sourceId === "EX-DIRECT" && row.direction === "OUT").length, 2);
assert.equal(expected.filter((row) => row.sourceId === "EX-DIRECT" && row.direction === "IN").length, 2);
assert.equal(expected.filter((row) => row.sourceId === "DIS-1" && row.direction === "OUT").length, 2);
assert.equal(expected.filter((row) => row.sourceId === "IA-1" && row.direction === "IN").length, 1);
assert.equal(expected.every((row) => row.movementIdentity.split("|").length === 6), true);

context.__ledger = expected.map((row, index) => ({
  ledgerId: `LED-${index + 1}`, date: row.date, module: row.sourceType, movementType: row.direction,
  itemType: row.category, materialId: row.materialId, materialCode: row.materialCode, itemName: row.materialName,
  sourceRef: row.sourceId, targetRef: row.sourceId, qtyIn: row.qtyIn, qtyOut: row.qtyOut,
  status: "ACTIVE", movementIdentity: row.movementIdentity,
}));
context.__balances = vm.runInContext("getOperationalInventoryBalances_({ materialRows: __materials, ledgerRows: __ledger })", context);
const balances = JSON.parse(JSON.stringify(context.__balances.byMaterialCode));
assert.equal(balances.WHITE_BUCKETS.balanceKg, 40);
assert.equal(balances.E1.balanceKg, 10);
assert.equal(balances.E2.balanceKg, 2);

vm.runInContext(`
  getRowsAsObjects = function(name) {
    if (name === "Inventory_Ledger") return __ledger;
    if (name === "Material_Master") return __materials;
    if (name === "Machine_Master" || name === "Extrusion_Batches") return [];
    return [];
  };
`, context);
const fg = vm.runInContext("fgLedgerBalanceForGrades_(['E1','E2'])", context);
assert.equal(fg.E1, balances.E1.balanceKg);
assert.equal(fg.E2, balances.E2.balanceKg);

console.log("Ledger rebuild preview and shared-balance regression checks passed (18/18).");
