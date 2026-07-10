import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../apps-script/Code.js", import.meta.url), "utf8");
const context = vm.createContext({ console, Date, JSON, Math, Number, String, Object, Array, RegExp, isNaN, parseInt, Utilities: { formatDate: () => "2026-07-10" }, Session: { getScriptTimeZone: () => "UTC" } });
vm.runInContext(source, context);

context.__materials = [
  { materialId: "MAT-WHITE", materialCode: "WHITE_BUCKETS", materialName: "White Buckets", category: "RM", status: "ACTIVE" },
  { materialId: "MAT-E1", materialCode: "E1", materialName: "E1", category: "FG", status: "ACTIVE" },
];
context.__sheets = {
  Inventory_Ledger: [
    { date: "2026-05-31", itemType: "RM", itemName: "Mixed PPCP Buckets", qtyIn: 80, qtyOut: 0, status: "ACTIVE" },
    { date: "2026-06-01", movementType: "OPENING", sourceType: "CUTOVER_OPENING", itemType: "RM", itemName: "White Buckets", qtyIn: 25, qtyOut: 0, status: "APPROVED" },
    { date: "2026-06-02", itemType: "RM", itemName: "Mixed PPCP Buckets", qtyIn: 100, qtyOut: 90, status: "ACTIVE" },
    { date: "2026-06-02", itemType: "RM", itemName: "White Buckets", qtyIn: 10, qtyOut: 4, status: "ACTIVE" },
    { date: "2026-06-03", itemType: "FG", itemName: "E1", qtyIn: 20, qtyOut: 5, status: "ACTIVE" },
  ],
  Opening_Balances: [],
  Inventory_Adjustments: [],
};
vm.runInContext(
  `
    getMaterialMasterRows_ = function() { return __materials; };
    getRowsAsObjects = function(name) { return __sheets[name] || []; };
    output = function(value) { return value; };
  `,
  context
);

const preview = vm.runInContext("getInventoryCutoverPreview({})", context);
const white = preview.rows.find((row) => row.materialCode === "WHITE_BUCKETS");
const e1 = preview.rows.find((row) => row.materialCode === "E1");

assert.equal(preview.cutoverDate, "2026-06-01");
assert.equal(white.allHistoryBalanceKg, 121);
assert.equal(white.legacyAliasBalanceKg, 90);
assert.equal(white.preCutoverInKg, 80);
assert.equal(white.postCutoverInKg, 10);
assert.equal(white.postCutoverOutKg, 4);
assert.equal(white.approvedOpeningKg, 25);
assert.equal(white.operationalBalanceKg, 31);
assert.equal(white.physicalConfirmationRequired, false);
assert.equal(e1.openingMissing, undefined);
assert.equal(e1.physicalConfirmationRequired, true);
assert.equal(e1.operationalBalanceKg, null);

console.log("Inventory cutover preview regression checks passed (11/11).");

