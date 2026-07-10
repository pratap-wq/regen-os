import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../apps-script/Code.js", import.meta.url), "utf8");
const context = vm.createContext({ console, Date, JSON, Math, Number, String, Object, Array, RegExp, isNaN, parseInt });
vm.runInContext(source, context);

context.__sources = {
  rmRows: [{ inwardId: "RM-1", status: "ACTIVE", qcStatus: "APPROVED", material: "White Buckets", netWeight: 100 }],
  grinderRows: [
    { grinderBatchId: "GB-1", date: "2026-07-01", status: "ACTIVE", feedComposition: '[{"material":"White Buckets","qtyKg":50}]', outputComposition: '[{"material":"White Regrind (Unwashed)","qtyKg":45}]' },
    { grinderBatchId: "GB-DELETED", date: "2026-07-02", status: "DELETED", feedComposition: '[{"material":"White Buckets","qtyKg":20}]', outputComposition: '[{"material":"White Regrind (Unwashed)","qtyKg":18}]' },
    { grinderBatchId: "GB-FREE", date: "2026-07-05", status: "DELETED", feedComposition: '[{"material":"White Buckets","qtyKg":5}]', outputComposition: '[{"material":"White Regrind (Unwashed)","qtyKg":4}]' },
  ],
  washRows: [
    { washBatchId: "WB-1", date: "2026-07-01", status: "ACTIVE", sourceGrinderBatchId: "GB-1", feedComposition: '[{"material":"White Regrind (Unwashed)","qtyKg":40}]', outputComposition: '[{"material":"White Regrind (Washed)","qtyKg":35}]' },
    { washBatchId: "WB-ORPHAN", date: "2026-07-02", status: "ACTIVE", sourceGrinderBatchId: "GB-DELETED", feedComposition: '[{"material":"White Regrind (Unwashed)","qtyKg":10}]', outputComposition: '[{"material":"White Regrind (Washed)","qtyKg":8}]' },
    { washBatchId: "WB-NO-SOURCE", date: "2026-07-03", status: "ACTIVE", feedComposition: '[{"material":"White Regrind (Unwashed)","qtyKg":7}]', outputComposition: '[{"material":"White Regrind (Washed)","qtyKg":6}]' },
  ],
  sortingRows: [
    { sortingBatchId: "SB-1", date: "2026-07-03", status: "ACTIVE", sourceWashBatchId: "WB-1", feedComposition: '[{"material":"White Regrind (Washed)","qtyKg":10}]', outputComposition: '[{"material":"White Sorted Regrind","qtyKg":9}]' },
  ],
  extrusionRows: [
    { extrusionBatchId: "EX-DIRECT", date: "2026-07-03", status: "ACTIVE", sourceWashBatchId: "WB-1", feedComposition: '[{"materialType":"WHITE_FLAKES","qtyKg":15}]', outputComposition: '[{"material":"E1","qtyKg":14}]' },
    { extrusionBatchId: "EX-SORTED", date: "2026-07-03", status: "ACTIVE", sourceSortingBatchId: "SB-1", feedComposition: '[{"materialType":"SORTED_FLAKES","qtyKg":4}]', outputComposition: '[{"material":"E2","qtyKg":3}]' },
  ],
  dispatchRows: [
    { dispatchId: "DIS-1", date: "2026-07-04", status: "ACTIVE", sourceExtrusionBatchId: "EX-SORTED", quantityKg: 3, dispatchLines: '[{"sourceExtrusionBatchId":"EX-SORTED","dispatchQtyKg":3}]' },
  ],
};

const audit = vm.runInContext("productionFlowIntegrityFromRows_(__sources)", context);
assert.equal(audit.ok, true);
assert.equal(audit.readOnly, true);
assert.equal(audit.orphanedConsumers.some((row) => row.downstreamBatchId === "WB-ORPHAN" && row.upstreamBatchId === "GB-DELETED"), true);
assert.equal(audit.missingSourceReferences.some((row) => row.recordId === "WB-NO-SOURCE"), true);
assert.equal(audit.deletedUpstreamWithActiveConsumers.some((row) => row.upstreamBatchId === "GB-DELETED"), true);
assert.equal(audit.deletedUpstreamWithActiveConsumers.some((row) => row.upstreamBatchId === "GB-FREE"), false);
assert.equal(audit.repairPreview.some((row) => row.upstreamBatchId === "GB-DELETED" && row.proposedAction === "RESTORE_UPSTREAM_RECORD"), true);

context.__sheets = {
  Wash_Batches: context.__sources.washRows,
  Sorting_Batches: context.__sources.sortingRows,
  Extrusion_Batches: context.__sources.extrusionRows,
  Dispatches: context.__sources.dispatchRows,
};
vm.runInContext("getRowsAsObjects = function(name) { return __sheets[name] || []; };", context);

assert.throws(() => vm.runInContext('assertProductionDeleteReferentialIntegrity_("GRINDER", "GB-1", {})', context), /active Wash record WB-1/);
assert.throws(() => vm.runInContext('assertProductionDeleteReferentialIntegrity_("WASH", "WB-1", {})', context), /active Sorting record SB-1|active Extrusion record EX-DIRECT/);
assert.throws(() => vm.runInContext('assertProductionDeleteReferentialIntegrity_("SORTING", "SB-1", {})', context), /active Extrusion record EX-SORTED/);
assert.throws(() => vm.runInContext('assertProductionDeleteReferentialIntegrity_("EXTRUSION", "EX-SORTED", {})', context), /active Dispatch record DIS-1/);
assert.equal(vm.runInContext('assertProductionDeleteReferentialIntegrity_("GRINDER", "GB-FREE", {})', context), true);

const before = vm.runInContext("productionAvailabilityFromOperationalRows_(__sources)", context);
context.__remarksOnly = JSON.parse(JSON.stringify(context.__sources));
context.__remarksOnly.washRows[0].remarks = "operator note";
const remarksOnly = vm.runInContext("productionAvailabilityFromOperationalRows_(__remarksOnly)", context);
assert.deepEqual(JSON.parse(JSON.stringify(remarksOnly.processAvailability)), JSON.parse(JSON.stringify(before.processAvailability)));

context.__quantityEdit = JSON.parse(JSON.stringify(context.__sources));
context.__quantityEdit.washRows[0].feedComposition = '[{"material":"White Regrind (Unwashed)","qtyKg":41}]';
const quantityEdit = vm.runInContext("productionAvailabilityFromOperationalRows_(__quantityEdit)", context);
assert.equal(quantityEdit.processAvailability.unwashedRegrindKg, before.processAvailability.unwashedRegrindKg - 1);
assert.equal(before.details.directExtrusionWashedInputKg, 15);
assert.equal(before.details.extrusionSortedInputKg, 4);

console.log("Production flow-integrity regression checks passed (16/16).");
