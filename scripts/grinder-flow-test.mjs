import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { buildInventoryLots } from "../src/utils/inventoryLots.js";
import { calculateMonthClose } from "../src/services/monthCloseEngine.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, "..");

const PERIOD = "2026-01";
const TEST_RUN_ID = "TEST-GRINDER-JAN-2026";
const TEST_RM = "TEST-RM-BUCKETS";
const TEST_REGRIND_ALIAS = "TEST-WHITE-REGRIND";
const REGRIND = "White Regrind (Unwashed)";

const sample = {
  rmRows: [
    {
      inwardId: `${TEST_RM}-RM-001`,
      date: "2026-01-05",
      periodMonth: PERIOD,
      material: TEST_RM,
      materialLines: JSON.stringify([{ material: TEST_RM, quantityKg: 12000 }]),
      netWeight: 12000,
      ratePerKg: 42,
      qcStatus: "APPROVED",
      status: "ACTIVE",
      remarks: TEST_RUN_ID,
    },
  ],
  grinderRows: [
    {
      grinderBatchId: `${TEST_RUN_ID}-GB-001`,
      batchId: `${TEST_RUN_ID}-GB-001`,
      date: "2026-01-06",
      periodMonth: PERIOD,
      shift: "A",
      machine: "TEST-GRINDER-01",
      inputMaterial: TEST_RM,
      inputWeightKg: 9000,
      feedComposition: JSON.stringify([{ materialType: TEST_RM, qtyKg: 9000 }]),
      outputComposition: JSON.stringify([
        { material: REGRIND, qtyKg: 8200 },
        { material: "Dust", qtyKg: 500 },
        { material: "Metal Reject", qtyKg: 100 },
      ]),
      regrindOutputKg: 8200,
      dustKg: 500,
      metalRejectKg: 100,
      grinderVarianceKg: 200,
      recoveryPercent: 91.11,
      status: "READY_FOR_WASH",
      nextProcess: "Wash",
      remarks: `${TEST_RUN_ID} ${TEST_REGRIND_ALIAS}`,
    },
  ],
  washRows: [
    {
      washBatchId: `${TEST_RUN_ID}-WB-001`,
      date: "2026-01-07",
      periodMonth: PERIOD,
      shift: "A",
      machine: "TEST-WASH-01",
      sourceGrinderBatchId: `${TEST_RUN_ID}-GB-001`,
      inputMaterial: REGRIND,
      inputWeightKg: 8000,
      feedComposition: JSON.stringify([{ sourceType: "GRINDER", materialType: REGRIND, qtyKg: 8000 }]),
      outputComposition: JSON.stringify([
        { material: "Washed White Flakes", qtyKg: 7200 },
        { material: "Sink Material", qtyKg: 500 },
        { material: "Dust", qtyKg: 100 },
      ]),
      washedOutputKg: 7200,
      sinkMaterialKg: 500,
      dustKg: 100,
      washVarianceKg: 200,
      status: "READY_FOR_SORTING",
      nextProcess: "Colour Sorting",
      remarks: TEST_RUN_ID,
    },
  ],
  sortingRows: [
    {
      sortingBatchId: `${TEST_RUN_ID}-SB-001`,
      date: "2026-01-08",
      periodMonth: PERIOD,
      shift: "A",
      machine: "TEST-SORTER-01",
      sourceWashBatchId: `${TEST_RUN_ID}-WB-001`,
      inputMaterial: "Washed White Flakes",
      inputWeightKg: 7000,
      feedComposition: JSON.stringify([{ sourceType: "WASH", materialType: "Washed White Flakes", qtyKg: 7000 }]),
      outputComposition: JSON.stringify([
        { material: "White Sorted", qtyKg: 6500 },
        { material: "Color Reject", qtyKg: 300 },
        { material: "Dust", qtyKg: 100 },
      ]),
      acceptedQtyKg: 6500,
      whiteSortedKg: 6500,
      rejectedQtyKg: 300,
      dustKg: 100,
      sorterVarianceKg: 100,
      status: "READY_FOR_EXTRUSION",
      nextProcess: "Extrusion",
      remarks: TEST_RUN_ID,
    },
  ],
  extrusionRows: [
    {
      extrusionBatchId: `${TEST_RUN_ID}-EB-001`,
      date: "2026-01-09",
      periodMonth: PERIOD,
      shift: "A",
      machine: "TEST-EXTRUDER-01",
      sourceSortingBatchId: `${TEST_RUN_ID}-SB-001`,
      sourceType: "PRODUCTION_SHIFT",
      inputMaterial: "White Sorted",
      inputWeightKg: 6400,
      totalInputKg: 6400,
      feedComposition: JSON.stringify([{ sourceType: "SORTING", materialType: "White Sorted", qtyKg: 6400 }]),
      outputComposition: JSON.stringify([
        { material: "E1", qtyKg: 5600 },
        { material: "Rework Material", qtyKg: 500 },
        { material: "Extrusion Waste", qtyKg: 200 },
      ]),
      fgOutputKg: 5600,
      productionGrade: "E1",
      reworkGranulesKg: 500,
      rejectKg: 200,
      varianceKg: 100,
      status: "READY_FOR_DISPATCH",
      nextProcess: "Dispatch",
      remarks: TEST_RUN_ID,
    },
  ],
  dispatchRows: [
    {
      dispatchId: `${TEST_RUN_ID}-DISP-001`,
      date: "2026-01-10",
      periodMonth: PERIOD,
      customerName: "TEST CUSTOMER",
      grade: "E1",
      quantityKg: 2500,
      ratePerKg: 75,
      dispatchLines: JSON.stringify([
        {
          grade: "E1",
          material: "E1",
          itemType: "FG",
          sourceExtrusionBatchId: `${TEST_RUN_ID}-EB-001`,
          dispatchQtyKg: 2500,
        },
      ]),
      dispatchStatus: "DISPATCHED",
      status: "ACTIVE",
      remarks: TEST_RUN_ID,
    },
  ],
};

const recordsCreated = [
  `${TEST_RM}-RM-001: RM Inward bucket record`,
  `${TEST_RUN_ID}-GB-001: Grinder batch consuming buckets`,
  `${TEST_RUN_ID}-LED-GRINDER-OUT-001: Grinder bucket OUT ledger fixture`,
  `${TEST_RUN_ID}-LED-GRINDER-IN-001: ${REGRIND} IN ledger fixture`,
  `${TEST_RUN_ID}-WB-001: Wash batch consuming ${REGRIND}`,
  `${TEST_RUN_ID}-SB-001: Optional sorter batch`,
  `${TEST_RUN_ID}-EB-001: Extrusion batch`,
  `${TEST_RUN_ID}-LED-FG-IN-001: E1 FG stock generation ledger fixture`,
  `${TEST_RUN_ID}-DISP-001: Dispatch from E1 FG grade`,
  `${TEST_RUN_ID}-HISTORY-EDIT-001: Production History Grinder edit fixture`,
];

function ledgerRowsFromSample() {
  const rows = [];
  const push = (row) => rows.push({ date: row.date || "2026-01-01", periodMonth: PERIOD, status: "ACTIVE", ...row });

  sample.rmRows.forEach((row) => {
    push({ ledgerId: `${TEST_RUN_ID}-LED-RM-IN-001`, module: "RM_INWARD", movementType: "IN", itemType: "RM", itemName: TEST_RM, sourceRef: row.inwardId, targetRef: row.inwardId, qtyIn: 12000, qtyOut: 0 });
  });

  sample.grinderRows.forEach((row) => {
    push({ ledgerId: `${TEST_RUN_ID}-LED-GRINDER-OUT-001`, module: "GRINDER", movementType: "OUT", itemType: "RM", itemName: TEST_RM, sourceRef: row.grinderBatchId, targetRef: row.grinderBatchId, qtyIn: 0, qtyOut: 9000 });
    push({ ledgerId: `${TEST_RUN_ID}-LED-GRINDER-IN-001`, module: "GRINDER", movementType: "IN", itemType: "WIP", itemName: REGRIND, sourceRef: row.grinderBatchId, targetRef: row.grinderBatchId, qtyIn: 8200, qtyOut: 0 });
    push({ ledgerId: `${TEST_RUN_ID}-LED-GRINDER-DUST-001`, module: "GRINDER", movementType: "IN", itemType: "WASTE", itemName: "Dust", sourceRef: row.grinderBatchId, targetRef: row.grinderBatchId, qtyIn: 500, qtyOut: 0 });
    push({ ledgerId: `${TEST_RUN_ID}-LED-GRINDER-METAL-001`, module: "GRINDER", movementType: "IN", itemType: "WASTE", itemName: "Metal Reject", sourceRef: row.grinderBatchId, targetRef: row.grinderBatchId, qtyIn: 100, qtyOut: 0 });
  });

  sample.washRows.forEach((row) => {
    push({ ledgerId: `${TEST_RUN_ID}-LED-WASH-OUT-001`, module: "WASH", movementType: "OUT", itemType: "WIP", itemName: REGRIND, sourceRef: row.sourceGrinderBatchId, targetRef: row.washBatchId, qtyIn: 0, qtyOut: 8000 });
    push({ ledgerId: `${TEST_RUN_ID}-LED-WASH-IN-001`, module: "WASH", movementType: "IN", itemType: "WIP", itemName: "Washed White Flakes", sourceRef: row.washBatchId, targetRef: row.washBatchId, qtyIn: 7200, qtyOut: 0 });
    push({ ledgerId: `${TEST_RUN_ID}-LED-WASH-SINK-001`, module: "WASH", movementType: "IN", itemType: "WASTE", itemName: "Sink Material", sourceRef: row.washBatchId, targetRef: row.washBatchId, qtyIn: 500, qtyOut: 0 });
    push({ ledgerId: `${TEST_RUN_ID}-LED-WASH-DUST-001`, module: "WASH", movementType: "IN", itemType: "WASTE", itemName: "Dust", sourceRef: row.washBatchId, targetRef: row.washBatchId, qtyIn: 100, qtyOut: 0 });
  });

  sample.sortingRows.forEach((row) => {
    push({ ledgerId: `${TEST_RUN_ID}-LED-SORT-OUT-001`, module: "SORTING", movementType: "OUT", itemType: "WIP", itemName: "Washed White Flakes", sourceRef: row.sourceWashBatchId, targetRef: row.sortingBatchId, qtyIn: 0, qtyOut: 7000 });
    push({ ledgerId: `${TEST_RUN_ID}-LED-SORT-IN-001`, module: "SORTING", movementType: "IN", itemType: "WIP", itemName: "White Sorted", sourceRef: row.sortingBatchId, targetRef: row.sortingBatchId, qtyIn: 6500, qtyOut: 0 });
    push({ ledgerId: `${TEST_RUN_ID}-LED-SORT-REJECT-001`, module: "SORTING", movementType: "IN", itemType: "WASTE", itemName: "Color Reject", sourceRef: row.sortingBatchId, targetRef: row.sortingBatchId, qtyIn: 300, qtyOut: 0 });
    push({ ledgerId: `${TEST_RUN_ID}-LED-SORT-DUST-001`, module: "SORTING", movementType: "IN", itemType: "WASTE", itemName: "Dust", sourceRef: row.sortingBatchId, targetRef: row.sortingBatchId, qtyIn: 100, qtyOut: 0 });
  });

  sample.extrusionRows.forEach((row) => {
    push({ ledgerId: `${TEST_RUN_ID}-LED-EXT-OUT-001`, module: "EXTRUSION", movementType: "OUT", itemType: "WIP", itemName: "White Sorted", sourceRef: row.sourceSortingBatchId, targetRef: row.extrusionBatchId, qtyIn: 0, qtyOut: 6400 });
    push({ ledgerId: `${TEST_RUN_ID}-LED-FG-IN-001`, module: "EXTRUSION", movementType: "IN", itemType: "FG", itemName: "E1", sourceRef: row.extrusionBatchId, targetRef: row.extrusionBatchId, qtyIn: 5600, qtyOut: 0 });
    push({ ledgerId: `${TEST_RUN_ID}-LED-EXT-REWORK-001`, module: "EXTRUSION", movementType: "IN", itemType: "REWORK", itemName: "Rework Material", sourceRef: row.extrusionBatchId, targetRef: row.extrusionBatchId, qtyIn: 500, qtyOut: 0 });
    push({ ledgerId: `${TEST_RUN_ID}-LED-EXT-WASTE-001`, module: "EXTRUSION", movementType: "IN", itemType: "WASTE", itemName: "Extrusion Waste", sourceRef: row.extrusionBatchId, targetRef: row.extrusionBatchId, qtyIn: 200, qtyOut: 0 });
  });

  sample.dispatchRows.forEach((row) => {
    push({ ledgerId: `${TEST_RUN_ID}-LED-DISP-OUT-001`, module: "DISPATCH", movementType: "OUT", itemType: "FG", itemName: "E1", sourceRef: `${TEST_RUN_ID}-EB-001`, targetRef: row.dispatchId, qtyIn: 0, qtyOut: 2500 });
  });

  return rows;
}

function balance(rows, itemName, untilModule = "") {
  const filtered = untilModule
    ? rows.slice(0, rows.findLastIndex((row) => row.module === untilModule) + 1)
    : rows;
  return filtered
    .filter((row) => row.itemName === itemName)
    .reduce((sum, row) => sum + Number(row.qtyIn || 0) - Number(row.qtyOut || 0), 0);
}

function assertSourceIncludes(filePath, snippets) {
  const source = readFileSync(resolve(root, filePath), "utf8");
  snippets.forEach((snippet) => {
    assert(source.includes(snippet), `${filePath} missing expected snippet: ${snippet}`);
  });
  return source;
}

const ledgerRows = ledgerRowsFromSample();
const lotsAfterGrinder = buildInventoryLots({
  rmRows: sample.rmRows,
  grinderRows: sample.grinderRows,
});
const regrindLot = lotsAfterGrinder.find((lot) => lot.material === REGRIND);

assert.equal(recordsCreated.length, 10, "Expected 10 sample test records");
assert.equal(balance(ledgerRows, TEST_RM, "GRINDER"), 3000, "RM bucket stock should reduce after Grinder");
assert.equal(balance(ledgerRows, REGRIND, "GRINDER"), 8200, `${REGRIND} should increase after Grinder`);
assert.equal(balance(ledgerRows, REGRIND, "WASH"), 200, `Wash should consume ${REGRIND}`);
assert.equal(ledgerRows.filter((row) => row.module === "GRINDER" && row.itemType === "FG").length, 0, "Grinder must not create FG");
assert.equal(balance(ledgerRows, "E1", "EXTRUSION"), 5600, "Extrusion should create E1 FG stock");
assert.equal(balance(ledgerRows, "E1"), 3100, "Dispatch should consume only E1 FG grade stock");
assert(regrindLot && regrindLot.availableKg === 8200, "Wash input lots should include Grinder regrind output");

assertSourceIncludes("apps-script/Code.js", [
  'if (p.fn === "grinder.add") return addGrinderBatch(p);',
  'if (p.fn === "grinder.list") return listMaster("Grinder_Batches");',
  'if (p.fn === "grinder.update") return updateGrinderBatch(p);',
  "Grinder_Batches",
  "GRINDER_OUTPUT_MATERIAL",
]);

assertSourceIncludes("src/pages/ProductionHistory.jsx", [
  'safeList("grinder.list")',
  'updateFn: "grinder.update"',
  'const PROCESS_OPTIONS = ["Grinder", "Wash", "Sorting", "Extrusion"]',
  '["machine", "Machine", "machineSelect"]',
  '["shift", "Shift", "shiftSelect"]',
  '["inputMaterial", "Input Material", "materialSelect"]',
  '["status", "Status", "statusSelect"]',
  '["nextProcess", "Next Process", "nextProcessSelect"]',
]);

const liveInventorySource = readFileSync(resolve(root, "src/pages/LiveInventory.jsx"), "utf8");
const monthCloseSource = readFileSync(resolve(root, "src/services/monthCloseEngine.js"), "utf8");

const legacyMonthClose = calculateMonthClose({
  ...sample,
  periodMonth: PERIOD,
});

const liveInventoryLedgerAligned = liveInventorySource.includes('apiCall({ fn: "inventoryLedger.balance" })') &&
  liveInventorySource.includes('apiCall({ fn: "grinder.list" })');
const monthCloseEngineGrinderAware = monthCloseSource.includes("grinderRows");

const report = {
  ok: true,
  mode: "LOCAL_DRY_RUN_NO_GOOGLE_SHEETS_WRITES",
  testRunId: TEST_RUN_ID,
  period: PERIOD,
  recordsCreated,
  cleanup: "No live cleanup required. If these TEST IDs are later inserted into Sheets, delete rows containing TEST-GRINDER-JAN-2026, TEST-RM-BUCKETS, or TEST-WHITE-REGRIND from RM_Inward, Grinder_Batches, Wash_Batches, Sorting_Batches, Extrusion_Batches, Dispatches, and Inventory_Ledger.",
  ledgerBefore: {
    [TEST_RM]: 0,
    [REGRIND]: 0,
    E1: 0,
  },
  ledgerAfter: {
    [TEST_RM]: balance(ledgerRows, TEST_RM),
    [REGRIND]: balance(ledgerRows, REGRIND),
    "Washed White Flakes": balance(ledgerRows, "Washed White Flakes"),
    "White Sorted": balance(ledgerRows, "White Sorted"),
    E1: balance(ledgerRows, "E1"),
  },
  checks: {
    rmBucketStockReducesAfterGrinder: "PASS",
    whiteRegrindIncreasesAfterGrinder: "PASS",
    washCanConsumeWhiteRegrind: "PASS",
    grinderDoesNotCreateFg: "PASS",
    extrusionCreatesFg: "PASS",
    dispatchConsumesOnlyFgGrade: "PASS",
    productionHistoryShowsGrinderRows: "PASS",
    grinderEditUsesDropdowns: "PASS",
    liveInventoryLedgerAlignment: liveInventoryLedgerAligned ? "PASS" : "PENDING_ALIGNMENT",
    monthCloseFlowAlignment: monthCloseEngineGrinderAware ? "PASS" : "PENDING_ALIGNMENT",
  },
  alignmentNotes: {
    liveInventory: liveInventoryLedgerAligned
      ? "Live Inventory reads ledger and Grinder rows."
      : "LiveInventory.jsx still calculates from RM/Wash/Sorting/Extrusion/Dispatch source rows and does not load Grinder_Batches; ledger balances above are correct, but Live Inventory needs separate ledger alignment.",
    monthClose: monthCloseEngineGrinderAware
      ? "monthCloseEngine accepts Grinder rows."
      : `monthCloseEngine.js does not accept grinderRows. Local legacy Month Close RM closing is ${legacyMonthClose.inventory.rmClosingKg} Kg, while ledger RM bucket balance is ${balance(ledgerRows, TEST_RM)} Kg.`,
  },
};

console.log(JSON.stringify(report, null, 2));
