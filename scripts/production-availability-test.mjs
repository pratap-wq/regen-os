import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../apps-script/Code.js", import.meta.url), "utf8");
const context = vm.createContext({ console, Date, JSON, Math, Number, String, Object, Array, RegExp, isNaN, parseInt });
vm.runInContext(source, context);

context.__sources = {
  rmRows: [
    { inwardId: "RM-1", qcStatus: "APPROVED", materialLines: JSON.stringify([{ material: "White Buckets", quantityKg: 100 }, { material: "Virgin PP", quantityKg: 20 }]), status: "ACTIVE" },
    { inwardId: "RM-PENDING", qcStatus: "PENDING", material: "White Buckets", netWeight: 500, status: "ACTIVE" },
    { inwardId: "RM-DELETED", qcStatus: "APPROVED", material: "White Buckets", netWeight: 999, status: "DELETED" },
  ],
  grinderRows: [
    { grinderBatchId: "GB-EDIT", status: "DELETED", feedComposition: JSON.stringify([{ material: "White Buckets", qtyKg: 50 }]), outputComposition: JSON.stringify([{ material: "White Regrind (Unwashed)", qtyKg: 45 }]) },
    { grinderBatchId: "GB-EDIT", status: "ACTIVE", feedComposition: JSON.stringify([{ material: "White Buckets", qtyKg: 60 }]), outputComposition: JSON.stringify([{ material: "White Regrind (Unwashed)", qtyKg: 55 }, { material: "Dust", qtyKg: 5 }]) },
  ],
  washRows: [
    { washBatchId: "WB-1", status: "ACTIVE", feedComposition: JSON.stringify([{ material: "White Regrind (Unwashed)", qtyKg: 40 }, { material: "White Buckets", qtyKg: 5 }]), outputComposition: JSON.stringify([{ material: "White Regrind (Washed)", qtyKg: 35 }, { material: "Sink Material", qtyKg: 5 }]) },
  ],
  sortingRows: [
    { sortingBatchId: "SB-1", status: "ACTIVE", feedComposition: JSON.stringify([{ material: "White Regrind (Washed)", qtyKg: 10 }]), outputComposition: JSON.stringify([{ material: "White Sorted Regrind", qtyKg: 9 }, { material: "Colour Reject", qtyKg: 1 }]) },
  ],
  extrusionRows: [
    { extrusionBatchId: "EX-DIRECT", status: "ACTIVE", feedComposition: JSON.stringify([{ material: "White Regrind (Washed)", qtyKg: 15 }, { material: "Virgin PP", qtyKg: 5 }]), outputComposition: JSON.stringify([{ material: "E1", qtyKg: 14 }, { material: "Lumps", qtyKg: 1 }]) },
    { extrusionBatchId: "EX-SORTED", status: "ACTIVE", feedComposition: JSON.stringify([{ material: "White Sorted Regrind", qtyKg: 4 }, { material: "Rework Material", qtyKg: 2 }]), outputComposition: JSON.stringify([{ material: "E2", qtyKg: 5 }, { material: "Rework Material", qtyKg: 1 }]) },
  ],
};

const result = vm.runInContext("productionAvailabilityFromOperationalRows_(__sources)", context);

assert.deepEqual(
  JSON.parse(JSON.stringify(result.processAvailability)),
  { whiteBucketsKg: 40, unwashedRegrindKg: 15, washedRegrindKg: 10, sortedRegrindKg: 5 }
);
assert.equal(result.details.approvedRmBucketInwardKg, 100);
assert.equal(result.details.grinderBucketInputKg, 60);
assert.equal(result.details.grinderUnwashedOutputKg, 55);
assert.equal(result.details.washUnwashedInputKg, 40);
assert.equal(result.details.washWashedOutputKg, 35);
assert.equal(result.details.sorterWashedInputKg, 10);
assert.equal(result.details.directExtrusionWashedInputKg, 15);
assert.equal(result.details.sorterAcceptedOutputKg, 9);
assert.equal(result.details.extrusionSortedInputKg, 4);
assert.equal(result.availability["Virgin PP"], 15);
assert.equal(result.availability["Rework Material"], -1);

console.log("Production operational availability regression checks passed (12/12).");
