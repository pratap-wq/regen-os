import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../apps-script/Code.js", import.meta.url), "utf8");
const context = vm.createContext({
  console,
  Date,
  JSON,
  Math,
  Number,
  String,
  Object,
  Array,
  RegExp,
  isNaN,
  parseInt,
});
vm.runInContext(source, context);

function evaluate(expression) {
  return vm.runInContext(expression, context);
}

assert.equal(evaluate('canonicalLegacyMaterialForInventory_("Mixed PPCP Buckets")'), "White Buckets");
assert.equal(evaluate('canonicalLegacyMaterialForInventory_("White PPCP Buckets")'), "White Buckets");
assert.equal(evaluate('canonicalLegacyMaterialForInventory_("MIXED_PPCP_BUCKETS")'), "White Buckets");
assert.equal(evaluate('canonicalLegacyMaterialForInventory_("WHITE_PPCP_BUCKETS")'), "White Buckets");

context.__sheets = {
  Machine_Master: [],
  Inventory_Ledger: [
    { itemType: "RM", itemName: "Mixed PPCP Buckets", qtyIn: 100, qtyOut: 0, status: "ACTIVE" },
    { itemType: "RM", itemName: "White PPCP Buckets", qtyIn: 50, qtyOut: 0, status: "ACTIVE" },
    { itemType: "RM", itemName: "White Buckets", qtyIn: 0, qtyOut: 120, status: "ACTIVE" },
  ],
};
context.__materials = [
  {
    materialId: "MAT-WHITE-BUCKETS",
    materialCode: "WHITE_BUCKETS",
    materialName: "White Buckets",
    category: "RM",
    status: "ACTIVE",
  },
];
vm.runInContext(
  `
    getRowsAsObjects = function(name) { return __sheets[name] || []; };
    getMaterialMasterRows_ = function() { return __materials; };
    output = function(value) { return value; };
  `,
  context
);

const bootstrap = evaluate("getProductionEntryBootstrap()");
const bootstrapWhiteBuckets = bootstrap.inventoryRows.find((row) => row.materialName === "White Buckets");
assert.deepEqual(
  { qtyIn: bootstrapWhiteBuckets.qtyIn, qtyOut: bootstrapWhiteBuckets.qtyOut, qtyKg: bootstrapWhiteBuckets.qtyKg },
  { qtyIn: 150, qtyOut: 120, qtyKg: 30 }
);

const liveSummary = evaluate("getInventoryLiveSummary()");
const liveWhiteBuckets = liveSummary.rows.find((row) => row.materialName === "White Buckets");
assert.equal(liveWhiteBuckets.qtyKg, 30);
assert.equal(liveSummary.manualReviewRows.length, 0);

const ledgerBalance = evaluate("getInventoryLedgerBalance()");
const ledgerWhiteBuckets = ledgerBalance.rows.find((row) => row.itemName === "White Buckets");
assert.equal(ledgerWhiteBuckets.qty, 30);

assert.throws(
  () => evaluate('assertProductionMaterialAllowed_("Mixed PPCP Buckets", "RM_INWARD", "INPUT", "RM inward material")'),
  /canonical Material_Master/
);
assert.throws(
  () => evaluate('assertProductionMaterialAllowed_("White PPCP Buckets", "GRINDER", "INPUT", "GRINDER input material")'),
  /canonical Material_Master/
);

vm.runInContext(
  `
    ensureInventoryAdjustmentSheet_ = function() {};
    ensurePhysicalCountsSheet_ = function() {};
  `,
  context
);
assert.throws(
  () => evaluate('addInventoryAdjustment({ itemCode: "Mixed PPCP Buckets" })'),
  /canonical Material_Master/
);
assert.throws(
  () => evaluate('savePhysicalCount({ materialPhysicalLinesJson: JSON.stringify([{ material: "White PPCP Buckets" }]) })'),
  /canonical Material_Master/
);

console.log("Inventory legacy bucket normalization regression checks passed (10/10).");
