// REGEN OS BACKEND - CLEAN CODE.GS
// Google Apps Script + Google Sheets

const SHEET_ID = "165IV2wQxli0Qi7K0s-bl7IuxnmoPUkirYbXPiedDUIE";

function doGet(e) {
  try {
    const p = e.parameter || {};

    if (!p.fn) {
      return output({
        ok: true,
        message: "Regen OS API running",
        timestamp: new Date(),
      });
    }

    if (p.fn === "health") {
      return output({
        ok: true,
        message: "Regen OS API running",
        timestamp: new Date(),
      });
    }
    if (p.fn === "debug.routes") return output(debugRoutes());

    // Masters
    if (p.fn === "machines.list") return listMaster("Machine_Master");
    if (p.fn === "categories.list") return listMaster("Material_Categories");
    if (p.fn === "grades.list") return listMaster("Production_Grades");
    if (p.fn === "colors.list") return listMaster("Color_Master");
    if (p.fn === "factoryMaster.list") return listFactoryMaster(p);
    if (p.fn === "factoryMaster.add") return addFactoryMaster(p);
    if (p.fn === "factoryMaster.update") return updateFactoryMaster(p);
    if (p.fn === "factoryMaster.disable") return disableFactoryMaster(p);
    if (p.fn === "factoryMaster.merge") return mergeFactoryMaster(p);
    if (p.fn === "productionMaterials.list") return listMaster("Production_Materials");
    if (p.fn === "productionMaterials.add") return addProductionMaterial(p);
    if (p.fn === "productionMaterials.update") return updateProductionMaterial(p);
    if (p.fn === "productionMaterials.seedDefaults") return seedProductionMaterials();
    if (p.fn === "productionMaterialMaster.list") return listProductionMaterialMaster(p);
    if (p.fn === "productionMaterialMaster.seedDefaults") return seedProductionMaterialMaster(p);
    if (p.fn === "materialAliasMap.list") return listMaterialAliasMap(p);
    if (p.fn === "materialAliasMap.seedDefaults") return seedMaterialAliasMap(p);
    if (p.fn === "materialMaster.list") return listMaterialMaster(p);
    if (p.fn === "materialMaster.add") return addMaterialMaster(p);
    if (p.fn === "materialMaster.update") return updateMaterialMaster(p);
    if (p.fn === "materialMaster.seedDefaults") return seedMaterialMasterDefaults(p);
    if (p.fn === "materialMaster.buildFromExisting") return buildMaterialMasterFromExisting(p);
    if (p.fn === "productionRecipes.list") return listProductionRecipes(p);
    if (p.fn === "productionRecipes.add") return addProductionRecipe(p);
    if (p.fn === "productionRecipes.update") return updateProductionRecipe(p);
    if (p.fn === "recipeComponents.list") return listRecipeComponents(p);
    if (p.fn === "recipeComponents.add") return addRecipeComponent(p);
    if (p.fn === "recipeComponents.update") return updateRecipeComponent(p);
    if (p.fn === "materialBuckets.list") return archivedModelResponse_("Material_Buckets");
    if (p.fn === "materialBuckets.add") return archivedModelResponse_("Material_Buckets", true);
    if (p.fn === "materialReceiving.list") return archivedModelResponse_("Material_Receiving");
    if (p.fn === "materialReceiving.add") return archivedModelResponse_("Material_Receiving", true);
    if (p.fn === "transformationRuns.list") return archivedModelResponse_("Transformation_Runs");
    if (p.fn === "transformationRuns.add") return archivedModelResponse_("Transformation_Runs", true);
    if (p.fn === "manufacturingCutover.migrateReceiving") return migrateLegacyReceiving(p);
    if (p.fn === "manufacturingCutover.migrateWash") return migrateLegacyWash(p);
    if (p.fn === "manufacturingCutover.migrateSorting") return migrateLegacySorting(p);
    if (p.fn === "manufacturingCutover.migrateExtrusion") return migrateLegacyExtrusion(p);
    if (p.fn === "manufacturingCutover.migrateInventory") return migrateLegacyInventory(p);
    if (p.fn === "manufacturingCutover.validateJune2026") return validateManufacturingCutover(p);
    if (p.fn === "physicalCounts.get") return getPhysicalCount(p);
    if (p.fn === "physicalCounts.save") return savePhysicalCount(p);
    // RM
    if (p.fn === "rm.add") return addRM(p);
    if (p.fn === "rm.list") return listMaster("RM_Inward");
    if (p.fn === "rm.update") return updateRM(p);

    // Suppliers
    if (p.fn === "supplier.add") return addSupplier(p);
    if (p.fn === "supplier.update") return updateSupplier(p);
    if (p.fn === "suppliers.list") return listMaster("Suppliers");
    if (p.fn === "customers.list") return listMaster("Customers");

    // Grinder
    if (p.fn === "grinder.add") return addGrinderBatch(p);
    if (p.fn === "grinder.list") return listMaster("Grinder_Batches");
    if (p.fn === "grinder.update") return updateGrinderBatch(p);

    // Wash
    if (p.fn === "wash.add") return addWashBatch(p);
    if (p.fn === "wash.list") return listMaster("Wash_Batches");
    if (p.fn === "wash.update") return updateWashBatch(p);
    if (p.fn === "wash.availableForSorting") return listWashAvailableForSorting();
    if (p.fn === "wash.availableForExtrusion") return listWashAvailableForExtrusion();

    // Sorting / Colour Sorter
    if (p.fn === "sorting.add" || p.fn === "colorSorter.add") return addSortingBatch(p);
    if (p.fn === "sorting.list" || p.fn === "colorSorter.list") return listMaster("Sorting_Batches");
    if (p.fn === "sorting.update" || p.fn === "colorSorter.update") return updateSortingBatch(p);
    if (p.fn === "sorting.availableForExtrusion") return listSortingAvailableForExtrusion();

    // Extrusion
    if (p.fn === "extrusion.add") return addExtrusionBatch(p);
    if (p.fn === "extrusion.list") return listMaster("Extrusion_Batches");
    if (p.fn === "extrusion.update") return updateExtrusionBatch(p);

    // Dispatch
    if (p.fn === "dispatch.add") return addDispatch(p);
    if (p.fn === "dispatch.list") return listMaster("Dispatches");
    if (p.fn === "dispatch.update") return updateDispatch(p);
    if (p.fn === "dispatch.patchOldData") return patchOldDispatchData();
    // FG Rates
    if (p.fn === "fgRates.add") return addFgRate(p);
    if (p.fn === "fgRates.list") return listMaster("FG_Rates");
    if (p.fn === "fgRates.update") return updateFgRate(p);
    if (p.fn === "fgRate.add") return addFgRate(p);
    if (p.fn === "fgRate.list") return listMaster("FG_Rates");
    if (p.fn === "fgRate.update") return updateFgRate(p);

    // Factory Expenses
    if (p.fn === "factoryExpenses.add") return addFactoryExpense(p);
    if (p.fn === "factoryExpenses.list") return listMaster("Factory_Expenses");
    if (p.fn === "factoryExpenses.update") return updateFactoryExpense(p);
    if (p.fn === "factoryExpenses.delete") return deleteFactoryExpense(p);
    if (p.fn === "factoryExpenses.disable") return deleteFactoryExpense(p);
    if (p.fn === "factoryExpense.add") return addFactoryExpense(p);
    if (p.fn === "factoryExpense.list") return listMaster("Factory_Expenses");
    if (p.fn === "factoryExpense.update") return updateFactoryExpense(p);
    if (p.fn === "factoryExpense.delete") return deleteFactoryExpense(p);
    if (p.fn === "factoryExpense.disable") return deleteFactoryExpense(p);
    if (p.fn === "factoryCostMaster.add") return addFactoryCostMaster(p);
    if (p.fn === "factoryCostMaster.list") return listMaster("Factory_Cost_Master");
    if (p.fn === "factoryCostMaster.update") return updateFactoryCostMaster(p);
   // Factory Cost Master
if (p.fn === "factoryCostMaster.add") return addFactoryCostMaster(p);
if (p.fn === "factoryCostMaster.list") return listMaster("Factory_Cost_Master");
if (p.fn === "factoryCostMaster.update") return updateFactoryCostMaster(p);

    // Stores / Consumables
    if (p.fn === "storesMaster.add") return addStoresMaster(p);
    if (p.fn === "storesMaster.list") return listMaster("Stores_Master");
    if (p.fn === "storesMaster.update") return updateStoresMaster(p);
    if (p.fn === "storesInward.add") return addStoresInward(p);
    if (p.fn === "storesInward.list") return listMaster("Stores_Inward");
    if (p.fn === "storesInward.update") return updateStoresInward(p);
    if (p.fn === "storesIssue.add") return addStoresIssue(p);
    if (p.fn === "storesIssue.list") return listMaster("Stores_Issue");
    if (p.fn === "storesIssue.update") return updateStoresIssue(p);
    if (p.fn === "consumables.add") return addStoresMaster(p);
    if (p.fn === "consumables.list") return listMaster("Stores_Master");
    if (p.fn === "consumables.update") return updateStoresMaster(p);

    // Monthly Close v1 compatibility
    if (p.fn === "monthClose.add") return addMonthClose(p);
    if (p.fn === "monthClose.list") return listMaster("Month_Close");
    if (p.fn === "monthClose.materialGroups") return output(getMonthCloseMaterialGroups(p));
    if (p.fn === "monthClose.materialRepair.preview") return output(previewMonthCloseMaterialRepair(p));
    if (p.fn === "monthClose.materialRepair.run") return output(runMonthCloseMaterialRepair(p));
    if (p.fn === "monthClose.materialRepair.verify") return output(verifyMonthCloseMaterialRepair(p));

    // MONTH CLOSE
    
function addMonthClose(data = {}) {
  const sh = getSheet("Month_Close");

  ensureHeaders_("Month_Close", [
    "closeId",
    "periodMonth",
    "status",

    "rmInwardKg",
    "rmValue",
    "avgRmPrice",

    "washInputKg",
    "washedOutputKg",
    "sortingInputKg",
    "sortingAcceptedKg",
    "extrusionInputKg",
    "fgProducedKg",
    "dispatchKg",

    "productionTon",
    "dispatchTon",
    "salesValue",
    "salesPerKg",

    "washLossKg",
    "sortingLossKg",
    "extrusionLossKg",
    "totalLossKg",
    "totalLossPercent",

    "washRecovery",
    "sortingRecovery",
    "extrusionRecovery",
    "overallRecovery",

    "rmSystemClosingKg",
    "washSystemClosingKg",
    "sortingSystemClosingKg",
    "fgSystemClosingKg",

    "rmPhysicalKg",
    "washPhysicalKg",
    "sortingPhysicalKg",
    "fgPhysicalKg",
    "storesPhysicalValue",

    "rmVarianceKg",
    "washVarianceKg",
    "sortingVarianceKg",
    "fgVarianceKg",

    "storesInwardValue",
    "storesIssueQty",
    "factoryExpenses",
    "estimatedRmConsumedValue",
    "conversionCost",
    "grossProfit",
    "manufacturingProfit",
    "profitPercent",
    "profitPerKg",
    "profitPerTon",
    "processingCostPerKg",

    "avgQuality",
    "downtimeHours",

    "productionSignoff",
    "storesSignoff",
    "accountsSignoff",
    "qcSignoff",
    "ceoSignoff",

    "exceptions",
    "remarks",

    "closedBy",
    "createdBy",
    "createdAt",
  ]);

  const closeId = data.closeId || generateBatchId("MCLOSE");
  const periodMonth = data.periodMonth || getPeriodMonth(todayYmd());

  const validation = validateMonthClosePayload_(data);
  if (!validation.ok) {
    return output({
      ok: false,
      error: validation.error,
      blockers: validation.blockers,
    });
  }

  if (isMonthClosed_(periodMonth)) {
    return output({
      ok: false,
      error: "Month already closed: " + periodMonth,
    });
  }

  appendObjectRow(sh, {
    closeId,
    periodMonth,
    status: data.status || "Closed",

    rmInwardKg: num(data.rmInwardKg),
    rmValue: num(data.rmValue),
    avgRmPrice: num(data.avgRmPrice),

    washInputKg: num(data.washInputKg),
    washedOutputKg: num(data.washedOutputKg),
    sortingInputKg: num(data.sortingInputKg),
    sortingAcceptedKg: num(data.sortingAcceptedKg),
    extrusionInputKg: num(data.extrusionInputKg),
    fgProducedKg: num(data.fgProducedKg),
    dispatchKg: num(data.dispatchKg),

    productionTon: num(data.productionTon),
    dispatchTon: num(data.dispatchTon),
    salesValue: num(data.salesValue),
    salesPerKg: num(data.salesPerKg),

    washLossKg: num(data.washLossKg),
    sortingLossKg: num(data.sortingLossKg),
    extrusionLossKg: num(data.extrusionLossKg),
    totalLossKg: num(data.totalLossKg),
    totalLossPercent: num(data.totalLossPercent),

    washRecovery: num(data.washRecovery),
    sortingRecovery: num(data.sortingRecovery),
    extrusionRecovery: num(data.extrusionRecovery),
    overallRecovery: num(data.overallRecovery),

    rmSystemClosingKg: num(data.rmSystemClosingKg),
    washSystemClosingKg: num(data.washSystemClosingKg),
    sortingSystemClosingKg: num(data.sortingSystemClosingKg),
    fgSystemClosingKg: num(data.fgSystemClosingKg),

    rmPhysicalKg: num(data.rmPhysicalKg),
    washPhysicalKg: num(data.washPhysicalKg),
    sortingPhysicalKg: num(data.sortingPhysicalKg),
    fgPhysicalKg: num(data.fgPhysicalKg),
    storesPhysicalValue: num(data.storesPhysicalValue),

    rmVarianceKg: num(data.rmVarianceKg),
    washVarianceKg: num(data.washVarianceKg),
    sortingVarianceKg: num(data.sortingVarianceKg),
    fgVarianceKg: num(data.fgVarianceKg),

    storesInwardValue: num(data.storesInwardValue),
    storesIssueQty: num(data.storesIssueQty),
    factoryExpenses: num(data.factoryExpenses),
    estimatedRmConsumedValue: num(data.estimatedRmConsumedValue),
    conversionCost: num(data.conversionCost),
    grossProfit: num(data.grossProfit),
    manufacturingProfit: num(data.manufacturingProfit),
    profitPercent: num(data.profitPercent),
    profitPerKg: num(data.profitPerKg),
    profitPerTon: num(data.profitPerTon),
    processingCostPerKg: num(data.processingCostPerKg),

    avgQuality: num(data.avgQuality),
    downtimeHours: num(data.downtimeHours),

    productionSignoff: data.productionSignoff || "",
    storesSignoff: data.storesSignoff || "",
    accountsSignoff: data.accountsSignoff || "",
    qcSignoff: data.qcSignoff || "",
    ceoSignoff: data.ceoSignoff || "",

    exceptions: data.exceptions || "",
    remarks: data.remarks || "",

    closedBy: data.ceoSignoff || data.closedBy || "System",
    createdBy: data.createdBy || "System",
    createdAt: new Date(),
  });

  try {
    const lockSh = getSheet("Month_Locks");

    ensureHeaders_("Month_Locks", [
      "lockId",
      "periodMonth",
      "status",
      "lockedBy",
      "lockedAt",
      "remarks",
    ]);

    appendObjectRow(lockSh, {
      lockId: generateBatchId("MLOCK"),
      periodMonth,
      status: "LOCKED",
      lockedBy: data.ceoSignoff || data.closedBy || "System",
      lockedAt: new Date(),
      remarks: data.remarks || "Monthly close completed",
    });
  } catch (err) {}

  return output({
    ok: true,
    closeId,
    periodMonth,
    message: "Monthly close snapshot saved and month locked",
  });
}
function validateMonthClosePayload_(data) {
  const blockers = [];
  [
    ["Production sign-off", data.productionSignoff],
    ["Stores sign-off", data.storesSignoff],
    ["Accounts sign-off", data.accountsSignoff],
    ["CEO sign-off", data.ceoSignoff],
  ].forEach(function(pair) {
    if (!String(pair[1] || "").trim()) blockers.push(pair[0] + " is required");
  });

  let exceptionRows = [];
  try {
    exceptionRows = JSON.parse(data.exceptions || "[]");
  } catch (err) {
    blockers.push("Stock check rows are invalid");
  }
  if (!Array.isArray(exceptionRows) || exceptionRows.length === 0) {
    blockers.push("Stock check rows are required");
    exceptionRows = [];
  }

  exceptionRows.forEach(function(row) {
    const label = row.stockType || row.materialName || row.key || "Stock row";
    const hasPhysical = row.hasPhysical === true || row.hasPhysical === "true" || row.physicalKg !== "" && row.physicalKg !== null && row.physicalKg !== undefined;
    const difference = num(row.differenceKg);
    const reason = String(row.reason || "").trim();
    const status = String(row.status || "").toUpperCase();
    if (!hasPhysical) blockers.push(label + ": actual stock is required");
    if (status.indexOf("APPROVAL PENDING") !== -1) blockers.push(label + ": approval is pending");
    if (Math.abs(difference) > 0.01 && !reason && status.indexOf("RECONCILED") === -1) {
      blockers.push(label + ": difference reason is required");
    }
  });

  return {
    ok: blockers.length === 0,
    blockers,
    error: blockers.length ? "Month cannot be closed: " + blockers.slice(0, 5).join("; ") : "",
  };
}
function addFactoryCostMaster(data = {}) {
  const sh = getSheet("Factory_Cost_Master");

  ensureHeaders_("Factory_Cost_Master", [
    "costId",
    "periodMonth",
    "costHead",
    "amount",
    "allocationType",
    "remarks",
    "status",
    "createdBy",
    "createdAt",
  ]);

  const costId = data.costId || generateBatchId("FCM");
  validateOperationalWrite_(data);

  appendObjectRow(sh, {
    costId,
    periodMonth: data.periodMonth || getPeriodMonth(todayYmd()),
    costHead: data.costHead || "",
    amount: num(data.amount),
    allocationType: data.allocationType || "FIXED",
    remarks: data.remarks || "",
    status: data.status || "ACTIVE",
    createdBy: data.createdBy || "System",
    createdAt: new Date(),
  });

  return output({ ok: true, costId });
}

function updateFactoryCostMaster(data = {}) {
  validateOperationalWrite_(
    data,
    getRowById_("Factory_Cost_Master", "costId", data.costId)
  );

  return updateById("Factory_Cost_Master", "costId", data.costId, {
    periodMonth: data.periodMonth || "",
    costHead: data.costHead || "",
    amount: num(data.amount),
    allocationType: data.allocationType || "",
    remarks: data.remarks || "",
    status: data.status || "",
  });
}
    // Quality
    if (p.fn === "quality.rm.add") return addRmQuality(p);
    if (p.fn === "quality.rm.list") return listMaster("RM_Quality");
    if (p.fn === "quality.rm.update") return updateRmQuality(p);

    if (p.fn === "quality.fg.add") return addFgQuality(p);
    if (p.fn === "quality.fg.list") return listMaster("FG_Quality");
    if (p.fn === "quality.fg.update") return updateFgQuality(p);

    if (p.fn === "quality.syncOldData") return syncOldQualityData();
    if (p.fn === "quality.migrateLegacyCleanup") {
      return output(migrateQualityLegacyCleanup(p.dryRun === true || String(p.dryRun || "").toLowerCase() === "true"));
    }

    // Alerts
    if (p.fn === "alerts.settings.add") return addAlertSetting(p);
    if (p.fn === "alerts.settings.list") return listMaster("Alert_Settings");
    if (p.fn === "alerts.settings.update") return updateAlertSetting(p);
    if (p.fn === "alerts.log.list") return listMaster("Alert_Log");
    if (p.fn === "alerts.run") return runAlertEngine();

    // Inventory Ledger
    if (p.fn === "inventoryLedger.list") return listMaster("Inventory_Ledger");
    if (p.fn === "inventoryLedger.add") return addInventoryLedger(p);
    if (p.fn === "inventoryLedger.balance") return getInventoryLedgerBalance();
    if (p.fn === "inventoryLedger.liveBalance") return getInventoryLedgerLiveBalance(p);
    if (p.fn === "inventoryLedger.audit") return auditInventoryLedger(p);
    if (p.fn === "inventoryLedger.rebuild") return rebuildInventoryLedger(p);
    if (p.fn === "materialNormalization.preview") return output(previewSpreadsheetMaterialNormalization(p));
    if (p.fn === "systemHealth.connectivity") return output(systemHealthConnectivity(p));
    if (p.fn === "materialFlow.auditJune2026") return auditJuneMaterialFlowV1(p);
    if (p.fn === "materialFlow.migrationPlanJune2026") return output(materialFlowMigrationPlanJune2026(p));
    if (p.fn === "materialFlow.migrateJuneToV1") return output(migrateJuneMaterialFlowToV1(p.dryRun !== false && String(p.dryRun || "true").toLowerCase() !== "false"));
    if (p.fn === "materialFlow.migrateJuneToV1Chunk") return output(migrateJuneMaterialFlowToV1Chunk(p));
    if (p.fn === "materialFlow.verifyJune2026") return output(verifyJuneMaterialFlowV1(p));
    if (p.fn === "materialFlow.rebuildJuneLedgerV1") return rebuildJuneLedgerV1(p);
    if (p.fn === "materialFlow.verifyJuneLedgerV1") return verifyJuneLedgerV1(p);
    if (p.fn === "materialMerge.whiteBuckets.preview") return output(previewWhitePpcpBucketMerge(p));
    if (p.fn === "materialMerge.whiteBuckets.run") return output(runWhitePpcpBucketMerge(p));
    if (p.fn === "trace.batch") return traceBatch(p);
    if (p.fn === "inventory.summary") {
      return output({
        ok: true,
        inventory: calculateInventoryBackend({
          rmRows: getRowsAsObjects("RM_Inward"),
          washRows: getRowsAsObjects("Wash_Batches"),
          sortingRows: getRowsAsObjects("Sorting_Batches"),
          extrusionRows: getRowsAsObjects("Extrusion_Batches"),
          dispatchRows: getRowsAsObjects("Dispatches"),
          storesInwardRows: getRowsAsObjects("Stores_Inward"),
          storesIssueRows: getRowsAsObjects("Stores_Issue"),
        }),
      });
    }
// Inventory Adjustments
if (p.fn === "inventoryAdjustments.add") return addInventoryAdjustment(p);
if (p.fn === "inventoryAdjustments.list") return listInventoryAdjustments(p);
if (p.fn === "inventoryAdjustments.update") return updateInventoryAdjustment(p);
if (p.fn === "inventoryAdjustments.approve") return approveInventoryAdjustment(p);
if (p.fn === "inventoryAdjustments.approveMonthClose") return approveMonthCloseInventoryAdjustment(p);
if (p.fn === "inventoryAdjustments.reject") return rejectInventoryAdjustment(p);
if (p.fn === "inventoryAdjustments.summary") return inventoryAdjustmentsSummary(p);

// Month Audit / Monthly Close
if (p.fn === "monthAudit.summary") return monthAuditSummary(p);
if (p.fn === "monthAudit.close") return closeMonthAudit(p);
if (p.fn === "openingBalances.list") return listOpeningBalances(p);
if (p.fn === "monthLocks.list") return listMaster("Month_Locks");

// Database schema health / migrations
if (p.fn === "db.health") return dbHealth(p);
if (p.fn === "db.validateSchema") return dbValidateSchema(p);
if (p.fn === "db.runMigrations") return dbRunMigrations(p);
if (p.fn === "db.repairHeaders") return dbRepairHeaders(p);

    return output({
      ok: false,
      error: "Unknown fn: " + p.fn,
    });
  } catch (err) {
    return output({
      ok: false,
      error: err.toString(),
      stack: err.stack || "",
    });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || "{}");
    return doGet({ parameter: body });
  } catch (err) {
    return output({
      ok: false,
      error: err.toString(),
    });
  }
}

function getSheet(name) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sh = ss.getSheetByName(name);
  if (!sh) throw new Error("Sheet not found: " + name);
  return sh;
}

function output(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function debugRoutes() {
  return {
    ok: true,
    route: "debug.routes",
    mode: "READ_ONLY",
    routes: [
      "health",
      "debug.routes",
      "machines.list",
      "categories.list",
      "grades.list",
      "colors.list",
      "factoryMaster.list",
      "factoryMaster.add",
      "factoryMaster.update",
      "factoryMaster.disable",
      "factoryMaster.merge",
      "productionMaterials.list",
      "productionMaterials.add",
      "productionMaterials.update",
      "productionMaterials.seedDefaults",
      "productionMaterialMaster.list",
      "productionMaterialMaster.seedDefaults",
      "materialAliasMap.list",
      "materialAliasMap.seedDefaults",
      "materialMaster.list",
      "materialMaster.add",
      "materialMaster.update",
      "materialMaster.seedDefaults",
      "materialMaster.buildFromExisting",
      "rm.add",
      "rm.list",
      "rm.update",
      "grinder.add",
      "grinder.list",
      "grinder.update",
      "wash.add",
      "wash.list",
      "wash.update",
      "sorting.add",
      "sorting.list",
      "sorting.update",
      "colorSorter.add",
      "colorSorter.list",
      "colorSorter.update",
      "extrusion.add",
      "extrusion.list",
      "extrusion.update",
      "dispatch.add",
      "dispatch.list",
      "dispatch.update",
      "storesMaster.add",
      "storesMaster.list",
      "storesMaster.update",
      "storesInward.add",
      "storesInward.list",
      "storesInward.update",
      "storesIssue.add",
      "storesIssue.list",
      "storesIssue.update",
      "monthClose.add",
      "monthClose.list",
      "monthClose.materialGroups",
      "monthClose.materialRepair.preview",
      "monthClose.materialRepair.run",
      "monthClose.materialRepair.verify",
      "inventoryLedger.list",
      "inventoryLedger.add",
      "inventoryLedger.balance",
      "inventoryLedger.liveBalance",
      "inventoryLedger.audit",
      "inventoryLedger.rebuild",
      "materialNormalization.preview",
      "systemHealth.connectivity",
      "materialFlow.auditJune2026",
      "materialFlow.migrationPlanJune2026",
      "materialFlow.migrateJuneToV1",
      "materialFlow.migrateJuneToV1Chunk",
      "materialFlow.verifyJune2026",
      "materialFlow.rebuildJuneLedgerV1",
      "materialFlow.verifyJuneLedgerV1",
      "trace.batch",
      "inventory.summary",
      "inventoryAdjustments.list",
      "inventoryAdjustments.add",
      "inventoryAdjustments.update",
      "inventoryAdjustments.approve",
      "inventoryAdjustments.approveMonthClose",
      "inventoryAdjustments.reject",
      "inventoryAdjustments.summary",
      "monthAudit.summary",
      "monthAudit.close",
      "openingBalances.list",
      "monthLocks.list",
      "db.health",
      "db.validateSchema",
      "db.runMigrations",
      "db.repairHeaders",
    ],
  };
}

// ============================================================
// DATABASE MIGRATION ENGINE
// Safe, idempotent Google Sheets schema validation and repair.
// Never deletes data, never renames operational sheets.
// ============================================================

const REGEN_DB_SCHEMA_VERSION = "2026.07.08-v4-material-alias-health";

const REGEN_DB_SCHEMA = {
  Month_Close: [
    "closeId",
    "periodMonth",
    "status",
    "rmInwardKg",
    "rmValue",
    "avgRmPrice",
    "washInputKg",
    "washedOutputKg",
    "sortingInputKg",
    "sortingAcceptedKg",
    "extrusionInputKg",
    "fgProducedKg",
    "dispatchKg",
    "productionTon",
    "dispatchTon",
    "salesValue",
    "salesPerKg",
    "washLossKg",
    "sortingLossKg",
    "extrusionLossKg",
    "totalLossKg",
    "totalLossPercent",
    "washRecovery",
    "sortingRecovery",
    "extrusionRecovery",
    "overallRecovery",
    "rmSystemClosingKg",
    "washSystemClosingKg",
    "sortingSystemClosingKg",
    "fgSystemClosingKg",
    "rmPhysicalKg",
    "washPhysicalKg",
    "sortingPhysicalKg",
    "fgPhysicalKg",
    "storesPhysicalValue",
    "rmVarianceKg",
    "washVarianceKg",
    "sortingVarianceKg",
    "fgVarianceKg",
    "storesInwardValue",
    "storesIssueQty",
    "factoryExpenses",
    "estimatedRmConsumedValue",
    "conversionCost",
    "grossProfit",
    "manufacturingProfit",
    "profitPercent",
    "profitPerKg",
    "profitPerTon",
    "processingCostPerKg",
    "avgQuality",
    "downtimeHours",
    "productionSignoff",
    "storesSignoff",
    "accountsSignoff",
    "qcSignoff",
    "ceoSignoff",
    "exceptions",
    "remarks",
    "closedBy",
    "createdBy",
    "createdAt",
  ],
  Month_Locks: [
    "lockId",
    "periodMonth",
    "status",
    "lockedBy",
    "lockedAt",
    "remarks",
  ],
  Physical_Counts: [
    "countId",
    "periodMonth",
    "rmPhysicalKg",
    "washPhysicalKg",
    "sortingPhysicalKg",
    "fgPhysicalKg",
    "storesPhysicalValue",
    "productionSignoff",
    "storesSignoff",
    "accountsSignoff",
    "qcSignoff",
    "ceoSignoff",
    "remarks",
    "savedBy",
    "savedAt",
    "status",
  ],
  Inventory_Adjustments: [
    "adjustmentId",
    "periodMonth",
    "date",
    "module",
    "itemType",
    "itemCode",
    "adjustmentType",
    "quantityKg",
    "value",
    "reason",
    "remarks",
    "sourceRef",
    "closeMonth",
    "material",
    "systemQty",
    "physicalQty",
    "differenceQty",
    "differenceValue",
    "status",
    "approvedBy",
    "approvedAt",
    "createdBy",
    "createdAt",
    "updatedAt",
  ],
  Factory_Cost_Master: [
    "costId",
    "periodMonth",
    "costHead",
    "amount",
    "allocationType",
    "remarks",
    "status",
    "createdBy",
    "createdAt",
  ],
  Factory_Expenses: [
    "entryId",
    "month",
    "year",
    "category",
    "itemName",
    "amount",
    "remarks",
    "createdBy",
    "createdAt",
    "expenseId",
    "date",
    "periodMonth",
    "description",
    "paidBy",
    "status",
    "deletedBy",
    "deletedAt",
  ],
  Material_Master: [
    "materialId",
    "materialCode",
    "materialName",
    "category",
    "unit",
    "status",
    "defaultQualityRequired",
    "defaultStorageLocation",
    "createdBy",
    "createdAt",
    "updatedAt",
    "updatedBy",
    "disabledBy",
    "disabledAt",
    "mergedIntoId",
    "mergedBy",
    "mergedAt",
    "favorite",
  ],
  Production_Recipes: [
    "recipeId",
    "recipeCode",
    "recipeName",
    "outputMaterialId",
    "outputMaterialCode",
    "processType",
    "status",
    "remarks",
    "createdBy",
    "createdAt",
    "updatedAt",
    "updatedBy",
    "disabledBy",
    "disabledAt",
    "mergedIntoId",
    "mergedBy",
    "mergedAt",
    "favorite",
  ],
  Recipe_Components: [
    "componentId",
    "recipeId",
    "inputMaterialId",
    "inputMaterialCode",
    "componentType",
    "standardPercent",
    "standardKg",
    "tolerancePercent",
    "status",
    "createdBy",
    "createdAt",
    "updatedAt",
    "updatedBy",
    "disabledBy",
    "disabledAt",
    "mergedIntoId",
    "mergedBy",
    "mergedAt",
    "favorite",
  ],
  Customers: [
    "customerId",
    "customerName",
    "customerCode",
    "customerUnit",
    "contactPerson",
    "phone",
    "email",
    "gstNo",
    "address",
    "status",
    "createdBy",
    "createdAt",
    "updatedBy",
    "updatedAt",
    "disabledBy",
    "disabledAt",
    "mergedIntoId",
    "mergedBy",
    "mergedAt",
    "favorite",
  ],
  Quality_Test_Master: [
    "testId",
    "testName",
    "testCode",
    "materialCategory",
    "unit",
    "specMin",
    "specMax",
    "status",
    "createdBy",
    "createdAt",
    "updatedBy",
    "updatedAt",
    "disabledBy",
    "disabledAt",
    "mergedIntoId",
    "mergedBy",
    "mergedAt",
    "favorite",
  ],
  Expense_Category_Master: [
    "categoryId",
    "categoryName",
    "categoryCode",
    "expenseType",
    "status",
    "createdBy",
    "createdAt",
    "updatedBy",
    "updatedAt",
    "disabledBy",
    "disabledAt",
    "mergedIntoId",
    "mergedBy",
    "mergedAt",
    "favorite",
  ],
  Production_Materials: [
    "materialId",
    "materialName",
    "materialType",
    "unit",
    "standardRate",
    "isActive",
    "remarks",
    "status",
    "createdBy",
    "createdAt",
  ],
  Production_Material_Master: [
    "materialId",
    "materialName",
    "canonicalName",
    "category",
    "stageAllowed",
    "directionAllowed",
    "active",
    "aliases",
    "sortOrder",
    "remarks",
    "createdBy",
    "createdAt",
    "updatedBy",
    "updatedAt",
  ],
  Material_Alias_Map: [
    "aliasId",
    "aliasName",
    "canonicalName",
    "category",
    "stageAllowed",
    "directionAllowed",
    "active",
    "confidence",
    "source",
    "remarks",
    "createdBy",
    "createdAt",
    "updatedBy",
    "updatedAt",
  ],
  RM_Inward: [
    "inwardId",
    "date",
    "supplier",
    "vehicleNo",
    "poNumber",
    "supplierGrnNumber",
    "supplierInvoiceNumber",
    "invoiceDate",
    "material",
    "materialLines",
    "materialSummary",
    "quantityKg",
    "grossWeight",
    "tareWeight",
    "netWeight",
    "sampleRequired",
    "qcStatus",
    "moisture",
    "contamination",
    "estimatedRecovery",
    "ratePerKg",
    "remarks",
    "createdBy",
    "createdAt",
    "color",
    "status",
    "transportPaidBy",
    "transportCost",
    "transportRemarks",
    "taxableValue",
    "gstPercent",
    "gstAmount",
    "invoiceTotal",
    "grandTotal",
    "freight",
    "transportCharges",
    "otherCharges",
    "roundOff",
    "paymentStatus",
    "advancePaid",
    "outstandingAmount",
    "commercialRemarks",
  ],
  Suppliers: [
    "supplierId",
    "supplierName",
    "name",
    "supplierType",
    "city",
    "state",
    "address",
    "contactPerson",
    "phone",
    "email",
    "gstNo",
    "panNo",
    "msmeNo",
    "bankName",
    "accountName",
    "accountNumber",
    "ifscCode",
    "materialType",
    "qualityRating",
    "recoveryPercent",
    "contaminationRisk",
    "paymentTerms",
    "creditDays",
    "isPreferred",
    "isActive",
    "remarks",
    "createdAt",
  ],
  FG_Rates: [
    "rateId",
    "month",
    "year",
    "grade",
    "ratePerKg",
    "isActive",
    "remarks",
    "createdBy",
    "createdAt",
    "date",
    "customerName",
    "freightPerKg",
    "status",
  ],
  Grinder_Batches: [
    "grinderBatchId",
    "batchId",
    "date",
    "periodMonth",
    "shift",
    "machine",
    "entryMode",
    "inputMaterial",
    "inputWeightKg",
    "feedComposition",
    "outputComposition",
    "regrindOutputKg",
    "dustKg",
    "metalRejectKg",
    "grinderVarianceKg",
    "recoveryPercent",
    "operatorName",
    "supervisorName",
    "machineRunningHours",
    "downtimeHours",
    "downtimeReason",
    "remarks",
    "status",
    "nextProcess",
    "linkedWashBatchId",
    "createdBy",
    "createdAt",
    "updatedAt",
  ],
  Wash_Batches: [
    "washBatchId",
    "date",
    "shift",
    "machine",
    "entryMode",
    "periodMonth",
    "inputMaterial",
    "inputWeightKg",
    "washedOutputKg",
    "raffiaKg",
    "wrappersKg",
    "microPlasticKg",
    "sinkMaterialKg",
    "ironScrapKg",
    "otherColorKg",
    "dustKg",
    "sludgeKg",
    "estimatedRecoveryPercent",
    "operatorName",
    "remarks",
    "status",
    "createdBy",
    "createdAt",
    "sortingRequired",
    "nextProcess",
    "sourceRmInwardId",
    "sourceGrinderBatchId",
    "linkedSortingBatchId",
    "linkedExtrusionBatchId",
    "supervisorName",
    "machineRunningHours",
    "downtimeHours",
    "downtimeReason",
    "visualCleanlinessRating",
    "moistureRating",
    "odourRating",
    "blackSpecsRating",
    "colorConsistencyRating",
    "overallQualityRating",
    "qcRemarks",
    "batchId",
    "sourceRMId",
    "supplier",
    "availableRMQty",
    "washVarianceKg",
    "recoverySeverity",
  ],
  Sorting_Batches: [
    "sortingBatchId",
    "sourceWashBatchId",
    "date",
    "shift",
    "machine",
    "inputWeightKg",
    "acceptedQtyKg",
    "rejectedQtyKg",
    "rubberRejectKg",
    "blackSpecsRejectKg",
    "raffiaRejectKg",
    "operatorName",
    "remarks",
    "status",
    "createdBy",
    "createdAt",
    "nextProcess",
    "sortingDecision",
    "linkedExtrusionBatchId",
    "rejectedMaterialAction",
    "recoverableRejectKg",
    "unrecoverableRejectKg",
    "supervisorName",
    "machineRunningHours",
    "downtimeHours",
    "downtimeReason",
    "visualCleanlinessRating",
    "moistureRating",
    "odourRating",
    "blackSpecsRating",
    "colorConsistencyRating",
    "overallQualityRating",
    "qcRemarks",
  ],
  Extrusion_Batches: [
    "extrusionBatchId",
    "sourceSortingBatchId",
    "date",
    "shift",
    "machine",
    "entryMode",
    "periodMonth",
    "inputMaterial",
    "inputWeightKg",
    "fgOutputKg",
    "lumpsKg",
    "purgingKg",
    "microPlasticKg",
    "shadeVariationKg",
    "reworkGranulesKg",
    "lumpsReusedKg",
    "lumpsSoldKg",
    "lumpsDiscardedKg",
    "purgingReusedKg",
    "purgingSoldKg",
    "purgingDiscardedKg",
    "dustKg",
    "productionGrade",
    "operatorName",
    "remarks",
    "status",
    "createdBy",
    "createdAt",
    "sourceType",
    "sourceBatchId",
    "linkedPackingBatchId",
    "directWashBypass",
    "sortingRequired",
    "meshTypeUsed",
    "meshRejectionKg",
    "vacuumRejectKg",
    "virginMaterialKg",
    "masterBatchKg",
    "antiOxidantKg",
    "batteryFlakesKg",
    "dosingRecipe",
    "dfcBladeConsumption",
    "lineRecoveryPercent",
    "finalYieldPercent",
    "holdReason",
    "supervisorName",
    "machineRunningHours",
    "downtimeHours",
    "downtimeReason",
    "visualCleanlinessRating",
    "moistureRating",
    "odourRating",
    "blackSpecsRating",
    "colorConsistencyRating",
    "overallQualityRating",
    "qcRemarks",
    "batchId",
    "sourceWashBatchId",
    "sourceSupplier",
    "availableSourceQty",
    "totalInputKg",
    "feedComposition",
    "rejectKg",
    "meshRejectKg",
    "floorSpillageKg",
    "totalRecoverableKg",
    "totalNonRecoverableKg",
    "totalOutputKg",
    "varianceKg",
    "recoveryPercent",
    "recoveryMaterialPercent",
    "virginRatioPercent",
    "batteryRatioPercent",
    "additiveRatioPercent",
    "nextProcess",
    "recoverySeverity",
    "lotNo",
  ],
  Dispatches: [
    "dispatchId",
    "date",
    "customerName",
    "invoiceNo",
    "vehicleNo",
    "grade",
    "lotNo",
    "quantityKg",
    "noOfBags",
    "ratePerKg",
    "dispatchLocation",
    "remarks",
    "createdBy",
    "createdAt",
    "sourceExtrusionBatchId",
    "sourceSupplier",
    "availableFGQty",
    "customerUnit",
    "driverName",
    "dispatchStatus",
    "status",
    "linkedFgBatchId",
    "transporterName",
    "ewayBillNo",
    "dispatchLines",
    "productionDate",
    "productionShift",
    "updatedAt",
  ],
  Stores_Master: [
    "itemId",
    "itemName",
    "category",
    "uom",
    "minStock",
    "isActive",
    "remarks",
    "createdBy",
    "createdAt",
    "unit",
    "reorderLevel",
    "preferredSupplier",
    "standardRate",
    "status",
    "minLevel",
    "maxLevel",
    "vendor",
  ],
  Stores_Inward: [
    "inwardId",
    "date",
    "itemName",
    "category",
    "qty",
    "rate",
    "totalAmount",
    "supplier",
    "remarks",
    "createdBy",
    "createdAt",
    "storesInwardId",
    "unit",
    "vendor",
    "invoiceNo",
    "minLevel",
    "status",
    "inwardStatus",
  ],
  Stores_Issue: [
    "issueId",
    "date",
    "itemName",
    "category",
    "qty",
    "department",
    "purpose",
    "remarks",
    "createdBy",
    "createdAt",
    "storesIssueId",
    "unit",
    "status",
    "issueStatus",
    "issueRate",
    "issueValue",
    "rateSource",
    "issuedTo",
  ],
  Inventory_Ledger: [
    "ledgerId",
    "date",
    "module",
    "movementType",
    "itemType",
    "materialId",
    "itemName",
    "sourceRef",
    "targetRef",
    "qtyIn",
    "qtyOut",
    "unit",
    "remarks",
    "status",
    "createdBy",
    "createdAt",
    "legacySourceSheet",
    "legacySourceId",
    "legacyMaterialName",
    "migrationId",
    "migratedAt",
  ],
  Material_Buckets: [
    "bucketId",
    "bucketName",
    "bucketType",
    "materialFamily",
    "processStage",
    "defaultNextProcess",
    "qualitySampleDefault",
    "qualityTestType",
    "status",
    "createdBy",
    "createdAt",
  ],
  Material_Receiving: [
    "receivingId",
    "date",
    "periodMonth",
    "supplier",
    "vehicleNo",
    "weighbridgeSlipNo",
    "totalTruckWeightKg",
    "qualitySampleRequired",
    "remarks",
    "status",
    "createdBy",
    "createdAt",
    "legacySourceSheet",
    "legacySourceId",
    "migrationId",
    "migratedAt",
  ],
  Material_Receiving_Lines: [
    "lineId",
    "receivingId",
    "grnId",
    "materialBucket",
    "bucketType",
    "quantityKg",
    "ratePerKg",
    "value",
    "qualitySampleRequired",
    "status",
    "createdBy",
    "createdAt",
    "legacySourceSheet",
    "legacySourceId",
    "migrationId",
    "migratedAt",
  ],
  Transformation_Runs: [
    "runId",
    "date",
    "periodMonth",
    "shift",
    "processType",
    "machine",
    "operator",
    "remarks",
    "totalInputKg",
    "totalOutputKg",
    "varianceKg",
    "recoveryPercent",
    "lossPercent",
    "status",
    "createdBy",
    "createdAt",
    "legacySourceSheet",
    "legacySourceId",
    "migrationId",
    "migratedAt",
  ],
  Transformation_Inputs: [
    "inputId",
    "runId",
    "inputBucket",
    "quantityKg",
    "status",
    "createdBy",
    "createdAt",
    "legacySourceSheet",
    "legacySourceId",
    "migrationId",
    "migratedAt",
  ],
  Transformation_Outputs: [
    "outputId",
    "runId",
    "outputBucket",
    "quantityKg",
    "outputType",
    "status",
    "createdBy",
    "createdAt",
    "legacySourceSheet",
    "legacySourceId",
    "migrationId",
    "migratedAt",
  ],
  RM_Quality: [
    "qualityId",
    "qualityRef",
    "date",
    "sourceType",
    "sourceRef",
    "rmInwardId",
    "legacyQualityRef",
    "rubberLevel",
    "metalContaminationPercent",
    "dustPercent",
    "rubberPercent",
    "ppPercent",
    "sinkMaterialPercent",
    "moisturePercent",
    "contaminationPercent",
    "mfi",
    "visualRating",
    "formOfMaterial",
    "conditionOfMaterial",
    "sampleQtyGm",
    "dryDustGm",
    "colouredFlakesGm",
    "rubberContaminationNo",
    "ppGm",
    "sinkMaterialGm",
    "dryDustPercent",
    "colouredFlakesPercent",
    "ppPercent",
    "sinkMaterialPercent",
    "acceptGm",
    "remarks",
    "decision",
    "qcStatus",
    "status",
    "testedBy",
    "migrationStatus",
    "createdBy",
    "createdAt",
  ],
  FG_Quality: [
    "qualityId",
    "qualityRef",
    "date",
    "sourceType",
    "sourceRef",
    "extrusionBatchId",
    "fgBatchCode",
    "legacyQualityRef",
    "grade",
    "machine",
    "shift",
    "quantity",
    "moisturePercent",
    "mfi",
    "izod",
    "ashPercent",
    "colour",
    "blackDots",
    "appearance",
    "bagWeight1Kg",
    "bagWeight2Kg",
    "bagWeight3Kg",
    "bagWeight4Kg",
    "avgBagWeightKg",
    "remarks",
    "decision",
    "qcStatus",
    "status",
    "testedBy",
    "migrationStatus",
    "createdBy",
    "createdAt",
  ],
  Alert_Settings: [
    "alertId",
    "module",
    "item",
    "condition",
    "threshold",
    "severity",
    "notifyType",
    "emails",
    "enabled",
    "remarks",
    "createdAt",
  ],
  Alert_Log: [
    "logId",
    "alertId",
    "module",
    "item",
    "severity",
    "currentValue",
    "threshold",
    "message",
    "emails",
    "triggeredAt",
    "status",
  ],
  System_Metadata: [
    "key",
    "value",
    "updatedAt",
    "updatedBy",
  ],
};

function getRequiredDbSchema_() {
  return REGEN_DB_SCHEMA;
}

function dbHealth(data) {
  return output(buildDatabaseHealth_());
}

function dbValidateSchema(data) {
  return output(buildDatabaseHealth_());
}

function dbRepairHeaders(data) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const schema = getRequiredDbSchema_();
  const changes = [];

  Object.keys(schema).forEach((sheetName) => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return;

    const duplicateChanges = repairDuplicateHeaders_(sheet);
    if (duplicateChanges.length) {
      changes.push({
        sheet: sheetName,
        action: "repairDuplicateHeaders",
        changes: duplicateChanges,
      });
    }

    const missing = addMissingHeaders_(sheet, schema[sheetName]);
    if (missing.length) {
      changes.push({
        sheet: sheetName,
        action: "addMissingHeaders",
        headers: missing,
      });
    }

    freezeHeaderRow_(sheet);
  });

  updateSystemMetadata_("lastHeaderRepairAt", new Date().toISOString());
  updateSystemMetadata_("schemaVersion", REGEN_DB_SCHEMA_VERSION);

  return output({
    ok: true,
    schemaVersion: REGEN_DB_SCHEMA_VERSION,
    changes,
    health: buildDatabaseHealth_(),
  });
}

function dbRunMigrations(data) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const schema = getRequiredDbSchema_();
  const changes = [];

  Object.keys(schema).forEach((sheetName) => {
    let sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.getRange(1, 1, 1, schema[sheetName].length).setValues([schema[sheetName]]);
      changes.push({
        sheet: sheetName,
        action: "createSheet",
        headers: schema[sheetName],
      });
    } else {
      const duplicateChanges = repairDuplicateHeaders_(sheet);
      if (duplicateChanges.length) {
        changes.push({
          sheet: sheetName,
          action: "repairDuplicateHeaders",
          changes: duplicateChanges,
        });
      }

      const missing = addMissingHeaders_(sheet, schema[sheetName]);
      if (missing.length) {
        changes.push({
          sheet: sheetName,
          action: "addMissingHeaders",
          headers: missing,
        });
      }
    }

    freezeHeaderRow_(sheet);
  });

  updateSystemMetadata_("schemaVersion", REGEN_DB_SCHEMA_VERSION);
  updateSystemMetadata_("lastMigrationAt", new Date().toISOString());
  updateSystemMetadata_("lastMigrationBy", "RegenOS Database Migration Engine");

  return output({
    ok: true,
    schemaVersion: REGEN_DB_SCHEMA_VERSION,
    changes,
    health: buildDatabaseHealth_(),
  });
}

function buildDatabaseHealth_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const schema = getRequiredDbSchema_();
  const requiredSheets = Object.keys(schema);
  const allSheets = ss.getSheets();
  const existingSheetNames = allSheets.map((sheet) => sheet.getName());
  const missingSheets = requiredSheets.filter((name) => existingSheetNames.indexOf(name) === -1);
  const extraSheets = existingSheetNames.filter((name) => requiredSheets.indexOf(name) === -1);
  const missingColumns = [];
  const duplicateHeaders = [];
  const emptySheets = [];

  allSheets.forEach((sheet) => {
    const sheetName = sheet.getName();
    const headers = getHeadersForSheet_(sheet);
    const duplicateInfo = findDuplicateHeaders_(headers);

    if (duplicateInfo.length) {
      duplicateHeaders.push({
        sheet: sheetName,
        duplicates: duplicateInfo,
      });
    }

    if (isSheetHeaderOnlyOrEmpty_(sheet)) {
      emptySheets.push(sheetName);
    }

    if (schema[sheetName]) {
      const missing = schema[sheetName].filter((header) => headers.indexOf(header) === -1);
      if (missing.length) {
        missingColumns.push({
          sheet: sheetName,
          columns: missing,
        });
      }
    }
  });

  const needsMigration =
    missingSheets.length > 0 ||
    missingColumns.length > 0 ||
    duplicateHeaders.length > 0;

  return {
    ok: true,
    schemaVersion: REGEN_DB_SCHEMA_VERSION,
    requiredSheets,
    missingSheets,
    missingColumns,
    duplicateHeaders,
    extraSheets,
    emptySheets,
    schemaStatus: needsMigration ? "NEEDS_MIGRATION" : "OK",
    recommendedAction: needsMigration
      ? "Run db.runMigrations. Extra sheets are reported only and will not be deleted, hidden, or renamed."
      : "No schema migration required. Extra sheets are reported only.",
  };
}

function getHeadersForSheet_(sheet) {
  const lastColumn = Math.max(sheet.getLastColumn(), 1);
  const values = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  return values.map((value) => String(value || "").trim());
}

function findDuplicateHeaders_(headers) {
  const seen = {};
  const duplicates = {};

  headers.forEach((header, index) => {
    if (!header) return;

    if (!seen[header]) {
      seen[header] = [];
    }

    seen[header].push(index + 1);
  });

  Object.keys(seen).forEach((header) => {
    if (seen[header].length > 1) {
      duplicates[header] = seen[header];
    }
  });

  return Object.keys(duplicates).map((header) => ({
    header,
    columns: duplicates[header],
  }));
}

function repairDuplicateHeaders_(sheet) {
  const headers = getHeadersForSheet_(sheet);
  const counts = {};
  const changes = [];

  headers.forEach((header, index) => {
    if (!header) {
      const replacement = "unnamedColumn" + (index + 1);
      sheet.getRange(1, index + 1).setValue(replacement);
      changes.push({
        column: index + 1,
        from: "",
        to: replacement,
      });
      return;
    }

    counts[header] = (counts[header] || 0) + 1;

    if (counts[header] > 1) {
      const replacement = makeUniqueHeaderName_(headers, header, counts[header]);
      sheet.getRange(1, index + 1).setValue(replacement);
      headers[index] = replacement;
      changes.push({
        column: index + 1,
        from: header,
        to: replacement,
      });
    }
  });

  return changes;
}

function makeUniqueHeaderName_(headers, baseName, duplicateNumber) {
  let candidate = baseName + "_duplicate" + duplicateNumber;
  let counter = duplicateNumber;

  while (headers.indexOf(candidate) !== -1) {
    counter += 1;
    candidate = baseName + "_duplicate" + counter;
  }

  return candidate;
}

function addMissingHeaders_(sheet, requiredHeaders) {
  let headers = getHeadersForSheet_(sheet);
  const added = [];

  requiredHeaders.forEach((header) => {
    if (headers.indexOf(header) !== -1) return;

    const nextColumn = Math.max(sheet.getLastColumn(), 0) + 1;
    sheet.getRange(1, nextColumn).setValue(header);
    added.push(header);
    headers = getHeadersForSheet_(sheet);
  });

  return added;
}

function freezeHeaderRow_(sheet) {
  try {
    sheet.setFrozenRows(1);
  } catch (err) {
    // Some sheet states may reject freezing. Schema repair must continue.
  }
}

function isSheetHeaderOnlyOrEmpty_(sheet) {
  if (sheet.getLastRow() <= 1) return true;

  const values = sheet
    .getRange(2, 1, sheet.getLastRow() - 1, Math.max(sheet.getLastColumn(), 1))
    .getValues();

  return values.every((row) =>
    row.every((cell) => cell === "" || cell === null)
  );
}

function updateSystemMetadata_(key, value) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName("System_Metadata");

  if (!sheet) {
    sheet = ss.insertSheet("System_Metadata");
    sheet.getRange(1, 1, 1, REGEN_DB_SCHEMA.System_Metadata.length)
      .setValues([REGEN_DB_SCHEMA.System_Metadata]);
    freezeHeaderRow_(sheet);
  } else {
    addMissingHeaders_(sheet, REGEN_DB_SCHEMA.System_Metadata);
    freezeHeaderRow_(sheet);
  }

  const headers = getHeadersForSheet_(sheet);
  const keyIndex = headers.indexOf("key");
  const valueIndex = headers.indexOf("value");
  const updatedAtIndex = headers.indexOf("updatedAt");
  const updatedByIndex = headers.indexOf("updatedBy");
  const lastRow = sheet.getLastRow();

  if (lastRow > 1) {
    const keys = sheet.getRange(2, keyIndex + 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < keys.length; i += 1) {
      if (String(keys[i][0]) === String(key)) {
        const rowNumber = i + 2;
        sheet.getRange(rowNumber, valueIndex + 1).setValue(value);
        sheet.getRange(rowNumber, updatedAtIndex + 1).setValue(new Date());
        sheet.getRange(rowNumber, updatedByIndex + 1).setValue("Migration Engine");
        return;
      }
    }
  }

  const row = new Array(headers.length).fill("");
  row[keyIndex] = key;
  row[valueIndex] = value;
  row[updatedAtIndex] = new Date();
  row[updatedByIndex] = "Migration Engine";
  sheet.appendRow(row);
}

function testDatabaseHealth() {
  const health = buildDatabaseHealth_();
  Logger.log(JSON.stringify(health, null, 2));
  return health;
}

function addProductionMaterial(data = {}) {
  const sh = getSheet("Production_Materials");

  ensureHeaders_("Production_Materials", [
    "materialId",
    "materialName",
    "materialType",
    "unit",
    "standardRate",
    "isActive",
    "remarks",
    "status",
    "createdBy",
    "createdAt",
    "deletedBy",
    "deletedAt",
  ]);

  const materialId = data.materialId || generateBatchId("PM");

  appendObjectRow(sh, {
    materialId,
    materialName: data.materialName || "",
    materialType: data.materialType || "",
    unit: data.unit || "Kg",
    standardRate: num(data.standardRate),
    isActive: data.isActive || "TRUE",
    remarks: data.remarks || "",
    status: data.status || "ACTIVE",
    createdBy: data.createdBy || "System",
    createdAt: new Date(),
  });

  return output({ ok: true, materialId });
}

function updateProductionMaterial(data = {}) {
  return updateById(
    "Production_Materials",
    "materialId",
    data.materialId,
    {
      materialName: data.materialName || "",
      materialType: data.materialType || "",
      unit: data.unit || "Kg",
      standardRate: num(data.standardRate),
      isActive: data.isActive || "TRUE",
      remarks: data.remarks || "",
      status: data.status || "",
    }
  );
}

function seedProductionMaterials() {
  const sh = getSheet("Production_Materials");

  ensureHeaders_("Production_Materials", [
    "materialId",
    "materialName",
    "materialType",
    "unit",
    "standardRate",
    "isActive",
    "remarks",
    "status",
    "createdBy",
    "createdAt",
  ]);

  const existing = getRowsAsObjects("Production_Materials").filter(
    (r) => String(r.status || "").toUpperCase() !== "DELETED"
  );

  if (existing.length > 0) {
    return output({
      ok: true,
      message: "Production materials already exist",
      count: existing.length,
    });
  }

  const defaults = [
    ["White PPCP Buckets", "RM", "Kg"],
    ["Battery Scrap", "RM", "Kg"],
    ["Imported Flakes", "RM", "Kg"],
    ["Washed Flakes", "WASHED", "Kg"],
    ["Sorted White", "SORTED", "Kg"],
    ["Sorted Commodity", "SORTED", "Kg"],
    ["Virgin PP", "ADDITIVE", "Kg"],
    ["Titanium Dioxide", "ADDITIVE", "Kg"],
    ["Masterbatch", "ADDITIVE", "Kg"],
    ["Calcium", "ADDITIVE", "Kg"],
    ["Lumps", "REWORK", "Kg"],
    ["Purging", "REWORK", "Kg"],
    ["Rework Granules", "REWORK", "Kg"],
  ];

  defaults.forEach((x) => {
    appendObjectRow(sh, {
      materialId: generateBatchId("PM"),
      materialName: x[0],
      materialType: x[1],
      unit: x[2],
      standardRate: 0,
      isActive: "TRUE",
      remarks: "Default seeded material",
      status: "ACTIVE",
      createdBy: "System",
      createdAt: new Date(),
    });
  });

  return output({
    ok: true,
    message: "Default production materials created",
    count: defaults.length,
  });
}

const PRODUCTION_MATERIAL_MASTER_DEFAULTS = [
  ["White PPCP Buckets", "White PPCP Buckets", "RM", "RM_INWARD,GRINDER", "INPUT", "White Bucket|White Buckets|Mixed Bucket|Mixed Buckets|Mixed PPCP Buckets"],
  ["White Regrind (Unwashed)", "White Regrind (Unwashed)", "WIP", "RM_INWARD,GRINDER,WASH", "OUTPUT,INPUT", "Flakes|Flakes Unwashed|Unwashed White Flakes|White Flakes (Unwashed)|Grinder Flakes|Unwashed Regrind|Unwashed Regrinds|White Regrind|White Regrind Unwashed|Regrinds"],
  ["White Regrind (Washed)", "White Regrind (Washed)", "WIP", "RM_INWARD,WASH,SORTING,EXTRUSION", "OUTPUT,INPUT", "Washed Flakes|Washed White Flakes|White Washed Flakes|Washed Regrind|White Regrind Washed|Washed Mixed"],
  ["White Sorted Regrind", "White Sorted Regrind", "WIP", "SORTING,EXTRUSION", "OUTPUT,INPUT", "White Sorted Flakes|White Sorted|Sorted White|Sorted Material"],
  ["Virgin PPCP", "Virgin PPCP", "ADDITIVE", "RM_INWARD,EXTRUSION", "INPUT", "Virgin PP|Virgin Material|Virgin"],
  ["Battery PPCP", "Battery PPCP", "RM_CONSUMABLE", "RM_INWARD,EXTRUSION", "INPUT", "Battery Scrap|Battery Flakes|Battery Regrind"],
  ["Masterbatch", "Masterbatch", "ADDITIVE", "RM_INWARD,EXTRUSION", "INPUT", "Master Batch|Colour Masterbatch|Color Masterbatch"],
  ["Antioxidant", "Antioxidant", "ADDITIVE", "EXTRUSION", "INPUT", "ANTIOXIDANT|Anti Oxidant"],
  ["E1", "E1", "FG", "EXTRUSION,DISPATCH", "OUTPUT,INPUT", "E1"],
  ["E2", "E2", "FG", "EXTRUSION,DISPATCH", "OUTPUT,INPUT", "E2"],
  ["E3", "E3", "FG", "EXTRUSION,DISPATCH", "OUTPUT,INPUT", "E3"],
  ["E4", "E4", "FG", "EXTRUSION,DISPATCH", "OUTPUT,INPUT", "E4"],
  ["E5", "E5", "FG", "EXTRUSION,DISPATCH", "OUTPUT,INPUT", "E5"],
  ["Dust", "Dust", "WASTE", "GRINDER,WASH", "OUTPUT", "Dust"],
  ["Metal Reject", "Metal Reject", "WASTE", "GRINDER,WASH", "OUTPUT", "Metal Reject"],
  ["Rubber Reject", "Rubber Reject", "WASTE", "WASH", "OUTPUT", "Rubber Reject"],
  ["Wrapper Reject", "Wrapper Reject", "WASTE", "WASH", "OUTPUT", "Wrapper Reject|Wrappers"],
  ["Sink Material", "Sink Material", "WASTE", "WASH", "OUTPUT", "Sink Material"],
  ["Micro Plastic Reject", "Micro Plastic Reject", "WASTE", "EXTRUSION", "OUTPUT", "Micro Plastic"],
  ["Lumps", "Lumps", "WASTE", "EXTRUSION", "OUTPUT", "Lumps"],
  ["Rework Material", "Rework Material", "REWORK", "EXTRUSION", "OUTPUT,INPUT", "Rework Material"],
  ["Extrusion Waste", "Extrusion Waste", "WASTE", "EXTRUSION", "OUTPUT", "Extrusion Waste"],
  ["Purging Waste", "Purging Waste", "WASTE", "EXTRUSION", "OUTPUT", "Purging"],
  ["Colour Reject", "Colour Reject", "WASTE", "SORTING", "OUTPUT", "Colour Reject|Color Reject|Flakes Dominant Colour"],
  ["Raffia Reject", "Raffia Reject", "WASTE", "WASH,SORTING", "OUTPUT", "Raffia Reject"],
];

const PRODUCTION_MATERIAL_ALIAS_MAP = {
  "FLAKES": "White Regrind (Unwashed)",
  "UNWASHED WHITE FLAKES": "White Regrind (Unwashed)",
  "WHITE FLAKES (UNWASHED)": "White Regrind (Unwashed)",
  "GRINDER FLAKES": "White Regrind (Unwashed)",
  "UNWASHED REGRIND": "White Regrind (Unwashed)",
  "UNWASHED REGRINDS": "White Regrind (Unwashed)",
  "FLAKES UNWASHED": "White Regrind (Unwashed)",
  "WHITE PPCP BUCKETS": "White PPCP Buckets",
  "WHITE BUCKET": "White PPCP Buckets",
  "WHITE BUCKETS": "White PPCP Buckets",
  "MIXED BUCKET": "White PPCP Buckets",
  "MIXED BUCKETS": "White PPCP Buckets",
  "MIXED PPCP BUCKETS": "White PPCP Buckets",
  "WHITE REGRIND": "White Regrind (Unwashed)",
  "WHITE REGRIND UNWASHED": "White Regrind (Unwashed)",
  "REGRINDS": "White Regrind (Unwashed)",
  "WASHED FLAKES": "White Regrind (Washed)",
  "WASHED WHITE FLAKES": "White Regrind (Washed)",
  "WHITE WASHED FLAKES": "White Regrind (Washed)",
  "WASHED REGRIND": "White Regrind (Washed)",
  "WHITE REGRIND WASHED": "White Regrind (Washed)",
  "WASHED MIXED": "White Regrind (Washed)",
  "VIRGIN PP": "Virgin PPCP",
  "VIRGIN MATERIAL": "Virgin PPCP",
  "VIRGIN": "Virgin PPCP",
  "BATTERY SCRAP": "Battery PPCP",
  "BATTERY FLAKES": "Battery PPCP",
  "BATTERY REGRIND": "Battery PPCP",
  "BATTERY_REGRIND": "Battery PPCP",
  "MASTERBATCH": "Masterbatch",
  "MASTER BATCH": "Masterbatch",
  "COLOUR MASTERBATCH": "Masterbatch",
  "COLOR MASTERBATCH": "Masterbatch",
  "WHITE SORTED FLAKES": "White Sorted Regrind",
  "WHITE SORTED": "White Sorted Regrind",
  "SORTED WHITE": "White Sorted Regrind",
  "SORTED MATERIAL": "White Sorted Regrind",
  "ANTIOXIDANT": "Antioxidant",
  "ANTI OXIDANT": "Antioxidant",
  "WRAPPER REJECT": "Wrapper Reject",
  "SINK MATERIAL": "Sink Material",
  "FLAKES DOMINANT COLOUR": "Colour Reject",
  "RAFFIA REJECT": "Raffia Reject",
  "MICRO PLASTIC": "Micro Plastic Reject",
  "LUMPS": "Lumps",
  "REWORK MATERIAL": "Rework Material",
  "EXTRUSION WASTE": "Extrusion Waste",
  "PURGING": "Purging Waste",
};

const MATERIAL_ALIAS_MAP_DEFAULTS = [
  ["Flakes", "White Regrind (Unwashed)", "WIP", "RM_INWARD,WASH", "INPUT", "TRUE", 95, "seed"],
  ["Flakes Unwashed", "White Regrind (Unwashed)", "WIP", "RM_INWARD,WASH", "INPUT", "TRUE", 95, "seed"],
  ["White Bucket", "White PPCP Buckets", "RM", "RM_INWARD,GRINDER", "INPUT", "TRUE", 100, "seed"],
  ["White Buckets", "White PPCP Buckets", "RM", "RM_INWARD,GRINDER", "INPUT", "TRUE", 100, "seed"],
  ["White PPCP Buckets", "White PPCP Buckets", "RM", "RM_INWARD,GRINDER", "INPUT", "TRUE", 100, "seed"],
  ["Mixed Bucket", "White PPCP Buckets", "RM", "RM_INWARD,GRINDER", "INPUT", "TRUE", 100, "seed"],
  ["Mixed Buckets", "White PPCP Buckets", "RM", "RM_INWARD,GRINDER", "INPUT", "TRUE", 100, "seed"],
  ["Mixed PPCP Buckets", "White PPCP Buckets", "RM", "RM_INWARD,GRINDER", "INPUT", "TRUE", 100, "seed"],
  ["Unwashed White Flakes", "White Regrind (Unwashed)", "WIP", "RM_INWARD,GRINDER,WASH", "INPUT,OUTPUT", "TRUE", 100, "seed"],
  ["White Flakes (Unwashed)", "White Regrind (Unwashed)", "WIP", "RM_INWARD,WASH", "INPUT", "TRUE", 100, "seed"],
  ["Unwashed Regrind", "White Regrind (Unwashed)", "WIP", "RM_INWARD,GRINDER,WASH", "INPUT,OUTPUT", "TRUE", 100, "seed"],
  ["Unwashed Regrinds", "White Regrind (Unwashed)", "WIP", "RM_INWARD,WASH", "INPUT", "TRUE", 100, "seed"],
  ["White Regrind", "White Regrind (Unwashed)", "WIP", "RM_INWARD,GRINDER,WASH", "INPUT,OUTPUT", "TRUE", 95, "seed"],
  ["White Regrind Unwashed", "White Regrind (Unwashed)", "WIP", "RM_INWARD,GRINDER,WASH", "INPUT,OUTPUT", "TRUE", 100, "seed"],
  ["Grinder Flakes", "White Regrind (Unwashed)", "WIP", "GRINDER,WASH", "OUTPUT,INPUT", "TRUE", 100, "seed"],
  ["Regrinds", "White Regrind (Unwashed)", "WIP", "RM_INWARD,GRINDER,WASH", "INPUT,OUTPUT", "TRUE", 90, "seed"],
  ["Washed White Flakes", "White Regrind (Washed)", "WIP", "WASH,SORTING,EXTRUSION", "OUTPUT,INPUT", "TRUE", 100, "seed"],
  ["White Washed Flakes", "White Regrind (Washed)", "WIP", "WASH,SORTING,EXTRUSION", "OUTPUT,INPUT", "TRUE", 100, "seed"],
  ["Washed Regrind", "White Regrind (Washed)", "WIP", "WASH,SORTING,EXTRUSION", "OUTPUT,INPUT", "TRUE", 100, "seed"],
  ["White Regrind Washed", "White Regrind (Washed)", "WIP", "WASH,SORTING,EXTRUSION", "OUTPUT,INPUT", "TRUE", 100, "seed"],
  ["Washed Flakes", "White Regrind (Washed)", "WIP", "WASH,SORTING,EXTRUSION", "OUTPUT,INPUT", "TRUE", 100, "seed"],
  ["Washed Mixed", "White Regrind (Washed)", "WIP", "WASH,SORTING,EXTRUSION", "OUTPUT,INPUT", "TRUE", 95, "seed"],
  ["White Sorted", "White Sorted Regrind", "WIP", "SORTING,EXTRUSION", "OUTPUT,INPUT", "TRUE", 100, "seed"],
  ["White Sorted Flakes", "White Sorted Regrind", "WIP", "SORTING,EXTRUSION", "OUTPUT,INPUT", "TRUE", 100, "seed"],
  ["Sorted White", "White Sorted Regrind", "WIP", "SORTING,EXTRUSION", "OUTPUT,INPUT", "TRUE", 100, "seed"],
  ["Sorted Material", "White Sorted Regrind", "WIP", "SORTING,EXTRUSION", "OUTPUT,INPUT", "TRUE", 95, "seed"],
  ["Virgin PP", "Virgin PPCP", "ADDITIVE", "RM_INWARD,EXTRUSION", "INPUT", "TRUE", 100, "seed"],
  ["Virgin Material", "Virgin PPCP", "ADDITIVE", "RM_INWARD,EXTRUSION", "INPUT", "TRUE", 100, "seed"],
  ["Battery Scrap", "Battery PPCP", "RM", "RM_INWARD,EXTRUSION", "INPUT", "TRUE", 100, "seed"],
  ["Battery Flakes", "Battery PPCP", "RM", "RM_INWARD,EXTRUSION", "INPUT", "TRUE", 100, "seed"],
  ["Battery Regrind", "Battery PPCP", "RM", "RM_INWARD,EXTRUSION", "INPUT", "TRUE", 100, "seed"],
  ["BATTERY_REGRIND", "Battery PPCP", "RM", "RM_INWARD,EXTRUSION", "INPUT", "TRUE", 100, "seed"],
  ["MASTERBATCH", "Masterbatch", "ADDITIVE", "RM_INWARD,EXTRUSION", "INPUT", "TRUE", 100, "seed"],
  ["ANTIOXIDANT", "Antioxidant", "ADDITIVE", "EXTRUSION", "INPUT", "TRUE", 100, "seed"],
  ["Wrapper Reject", "Wrapper Reject", "WASTE", "WASH", "OUTPUT", "TRUE", 100, "seed"],
  ["Sink Material", "Sink Material", "WASTE", "WASH", "OUTPUT", "TRUE", 100, "seed"],
  ["Flakes Dominant Colour", "Colour Reject", "WASTE", "SORTING", "OUTPUT", "TRUE", 100, "seed"],
  ["Raffia Reject", "Raffia Reject", "WASTE", "WASH,SORTING", "OUTPUT", "TRUE", 100, "seed"],
  ["Micro Plastic", "Micro Plastic Reject", "WASTE", "EXTRUSION", "OUTPUT", "TRUE", 100, "seed"],
  ["Lumps", "Lumps", "WASTE", "EXTRUSION", "OUTPUT", "TRUE", 100, "seed"],
  ["Rework Material", "Rework Material", "REWORK", "EXTRUSION", "OUTPUT,INPUT", "TRUE", 100, "seed"],
  ["Extrusion Waste", "Extrusion Waste", "WASTE", "EXTRUSION", "OUTPUT", "TRUE", 100, "seed"],
  ["Purging", "Purging Waste", "WASTE", "EXTRUSION", "OUTPUT", "TRUE", 100, "seed"],
];

function productionMaterialMasterHeaders_() {
  return REGEN_DB_SCHEMA.Production_Material_Master;
}

function materialAliasMapHeaders_() {
  return REGEN_DB_SCHEMA.Material_Alias_Map;
}

function materialAliasKey_(value) {
  return String(value || "").trim().toUpperCase().replace(/[^A-Z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function materialAliasRowsFromDefaults_() {
  return MATERIAL_ALIAS_MAP_DEFAULTS.map(function(row, index) {
    return {
      aliasId: "MAL-" + String(index + 1).padStart(3, "0"),
      aliasName: row[0],
      canonicalName: row[1],
      category: row[2],
      stageAllowed: row[3],
      directionAllowed: row[4],
      active: row[5],
      confidence: row[6],
      source: row[7],
      remarks: "Default RegenOS material alias",
      createdBy: "System",
      createdAt: "",
      updatedBy: "",
      updatedAt: "",
    };
  });
}

function getMaterialAliasMapRows_() {
  const byAlias = {};
  materialAliasRowsFromDefaults_().forEach(function(row) {
    byAlias[materialAliasKey_(row.aliasName)] = row;
  });

  try {
    getRowsAsObjects("Material_Alias_Map").forEach(function(row) {
      const status = String(row.active || row.status || "TRUE").toUpperCase();
      if (status === "FALSE" || status === "NO" || status === "INACTIVE" || status === "DELETED") return;
      const key = materialAliasKey_(row.aliasName);
      if (!key) return;
      const fallback = byAlias[key] || {};
      byAlias[key] = {
        ...fallback,
        ...row,
        aliasName: row.aliasName || fallback.aliasName || "",
        canonicalName: row.canonicalName || fallback.canonicalName || "",
      };
    });
  } catch (err) {
    // Material_Alias_Map may not exist until db.runMigrations is executed.
  }

  return Object.values(byAlias);
}

function materialAliasLookup_(value) {
  const key = materialAliasKey_(value);
  if (!key) return null;
  return getMaterialAliasMapRows_().find(function(row) {
    return materialAliasKey_(row.aliasName) === key;
  }) || null;
}

function listMaterialAliasMap(data = {}) {
  return output({
    ok: true,
    rows: getMaterialAliasMapRows_(),
    source: "Material_Alias_Map + defaults",
  });
}

function seedMaterialAliasMap(data = {}) {
  createSheetIfMissing_("Material_Alias_Map", materialAliasMapHeaders_());
  ensureHeaders_("Material_Alias_Map", materialAliasMapHeaders_());
  const sh = getSheet("Material_Alias_Map");
  const headers = getHeaders(sh);
  const existing = {};
  getRowsAsObjects("Material_Alias_Map").forEach(function(row) {
    const key = materialAliasKey_(row.aliasName);
    if (key) existing[key] = true;
  });

  const now = new Date();
  const values = materialAliasRowsFromDefaults_()
    .filter(function(row) { return !existing[materialAliasKey_(row.aliasName)]; })
    .map(function(row) {
      return headers.map(function(header) {
        if (header === "createdAt") return now;
        return row[header] !== undefined ? row[header] : "";
      });
    });

  if (values.length) {
    sh.getRange(sh.getLastRow() + 1, 1, values.length, headers.length).setValues(values);
  }

  return output({
    ok: true,
    route: "materialAliasMap.seedDefaults",
    inserted: values.length,
    totalAliases: getMaterialAliasMapRows_().length,
    message: values.length ? "Material_Alias_Map seeded." : "Material_Alias_Map already had all default aliases.",
  });
}

function productionMaterialRowsFromDefaults_() {
  return PRODUCTION_MATERIAL_MASTER_DEFAULTS.map(function(row, index) {
    return {
      materialId: "PMM-" + (index + 1),
      materialName: row[0],
      canonicalName: row[1],
      category: row[2],
      stageAllowed: row[3],
      directionAllowed: row[4],
      active: "TRUE",
      aliases: row[5],
      sortOrder: index + 1,
      remarks: "Canonical production material",
      createdBy: "System",
      createdAt: new Date(),
    };
  });
}

function seedProductionMaterialMaster() {
  createSheetIfMissing_("Production_Material_Master", productionMaterialMasterHeaders_());
  const sh = getSheet("Production_Material_Master");
  ensureHeaders_("Production_Material_Master", productionMaterialMasterHeaders_());

  const existing = {};
  getRowsAsObjects("Production_Material_Master").forEach(function(row) {
    existing[materialCode_(row.canonicalName || row.materialName)] = true;
  });

  let inserted = 0;
  productionMaterialRowsFromDefaults_().forEach(function(row) {
    const key = materialCode_(row.canonicalName);
    if (existing[key]) return;
    appendObjectRow(sh, row);
    existing[key] = true;
    inserted += 1;
  });

  return output({
    ok: true,
    inserted,
    rows: getProductionMaterialMasterRows_(),
    message: "Production Material Master seed completed",
  });
}

function listProductionMaterialMaster(data = {}) {
  createSheetIfMissing_("Production_Material_Master", productionMaterialMasterHeaders_());
  ensureHeaders_("Production_Material_Master", productionMaterialMasterHeaders_());

  if (!getRowsAsObjects("Production_Material_Master").filter(function(row) { return !isDeleted_(row); }).length) {
    seedProductionMaterialMaster();
  }

  const stage = String(data.stage || "").trim().toUpperCase();
  const direction = String(data.direction || "").trim().toUpperCase();

  let rows = getProductionMaterialMasterRows_();
  if (stage && direction) {
    rows = rows.filter(function(row) {
      return productionMaterialAllowedFor_(row, stage, direction);
    });
  }

  rows.sort(function(a, b) {
    return num(a.sortOrder) - num(b.sortOrder);
  });

  return output({ ok: true, rows });
}

function getProductionMaterialMasterRows_() {
  let rows = [];
  try {
    rows = getRowsAsObjects("Production_Material_Master")
      .filter(function(row) { return !isDeleted_(row); });
  } catch (err) {
    rows = [];
  }
  if (!rows.length) return productionMaterialRowsFromDefaults_();

  const defaultsByCanonical = {};
  productionMaterialRowsFromDefaults_().forEach(function(row) {
    defaultsByCanonical[materialCode_(row.canonicalName || row.materialName)] = row;
  });

  const byCanonical = {};
  productionMaterialRowsFromDefaults_().forEach(function(row) {
    byCanonical[materialCode_(row.canonicalName || row.materialName)] = row;
  });

  rows.forEach(function(row) {
    const originalCanonical = row.canonicalName || row.materialName;
    const canonicalName = productionMaterialCanonicalForList_(originalCanonical);
    const key = materialCode_(canonicalName);
    const defaultRow = defaultsByCanonical[key];
    const isAliasRow = materialCode_(originalCanonical) !== key;
    const normalizedRow = {
      ...row,
      materialName: canonicalName,
      canonicalName,
    };
    byCanonical[key] = defaultRow ? {
      ...defaultRow,
      ...normalizedRow,
      active: isAliasRow ? defaultRow.active : normalizedRow.active,
      status: isAliasRow ? defaultRow.status : normalizedRow.status,
      stageAllowed: mergeCsvValues_(normalizedRow.stageAllowed, defaultRow.stageAllowed),
      directionAllowed: mergeCsvValues_(normalizedRow.directionAllowed, defaultRow.directionAllowed),
      aliases: normalizedRow.aliases || defaultRow.aliases,
    } : normalizedRow;
  });

  return Object.keys(byCanonical).map(function(key) {
    return byCanonical[key];
  });
}

function productionMaterialCanonicalForList_(value) {
  const clean = String(value || "").trim().replace(/\s+/g, " ");
  return PRODUCTION_MATERIAL_ALIAS_MAP[clean.toUpperCase()] || clean;
}

function mergeCsvValues_(primary, fallback) {
  const seen = {};
  return String(primary || "")
    .split(",")
    .concat(String(fallback || "").split(","))
    .map(function(value) { return value.trim(); })
    .filter(function(value) {
      if (!value) return false;
      const key = value.toUpperCase();
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    })
    .join(",");
}

function productionMaterialAllowedFor_(row, stage, direction) {
  const active = String(row.active || row.isActive || row.status || "TRUE").toUpperCase();
  if (active === "FALSE" || active === "INACTIVE" || active === "DELETED" || active === "DISABLED") return false;

  const stages = String(row.stageAllowed || "").toUpperCase().split(",").map(function(x) { return x.trim(); });
  const directions = String(row.directionAllowed || "").toUpperCase().split(",").map(function(x) { return x.trim(); });

  return stages.indexOf(String(stage || "").toUpperCase()) !== -1 &&
    directions.indexOf(String(direction || "").toUpperCase()) !== -1;
}

function normalizeProductionMaterialName_(value) {
  const clean = String(value || "").trim().replace(/\s+/g, " ");
  if (!clean) return { canonicalName: "", known: false, originalName: "" };

  const upper = clean.toUpperCase();
  const aliasRow = materialAliasLookup_(clean);
  const alias = aliasRow && aliasRow.canonicalName
    ? aliasRow.canonicalName
    : PRODUCTION_MATERIAL_ALIAS_MAP[upper];
  if (alias) {
    return {
      canonicalName: alias,
      known: true,
      originalName: clean,
      source: aliasRow ? "Material_Alias_Map" : "built-in alias",
    };
  }
  const rows = getProductionMaterialMasterRows_();
  const match = rows.find(function(row) {
    const canonical = String(row.canonicalName || row.materialName || "").trim().toUpperCase();
    const materialName = String(row.materialName || "").trim().toUpperCase();
    const aliases = String(row.aliases || "").toUpperCase().split("|").map(function(x) { return x.trim(); });
    return canonical === upper || materialName === upper || aliases.indexOf(upper) !== -1;
  });

  if (match) {
    return {
      canonicalName: match.canonicalName || match.materialName,
      known: true,
      originalName: clean,
    };
  }

  return {
    canonicalName: clean,
    known: false,
    originalName: clean,
  };
}

function assertProductionMaterialAllowed_(value, stage, direction, label) {
  const normalized = normalizeProductionMaterialName_(value);
  if (!normalized.canonicalName) return "";

  if (!normalized.known) {
    throw new Error((label || "Production material") + " needs manual review: " + normalized.originalName);
  }

  const row = getProductionMaterialMasterRows_().find(function(item) {
    return String(item.canonicalName || item.materialName || "").trim().toUpperCase() ===
      normalized.canonicalName.toUpperCase();
  });

  if (!row || !productionMaterialAllowedFor_(row, stage, direction)) {
    throw new Error(
      (label || "Production material") +
        " is not allowed for " +
        stage +
        " " +
        direction +
        ": " +
        normalized.canonicalName
    );
  }

  return normalized.canonicalName;
}

function normalizeProductionComposition_(value, stage, direction, label) {
  if (!value) return "";

  let rows = value;
  if (typeof value === "string") {
    try {
      rows = JSON.parse(value);
    } catch (err) {
      throw new Error((label || "Production composition") + " is invalid JSON.");
    }
  }

  if (!Array.isArray(rows)) return "";

  const isInput = String(direction || "").toUpperCase() === "INPUT";

  return JSON.stringify(rows.map(function(row) {
    const material = ["material", "materialType", "sourceType", "inputBucket", "outputMaterial"]
      .map(function(key) { return row[key]; })
      .find(function(v) { return String(v || "").trim(); });
    const canonical = assertProductionMaterialAllowed_(material, stage, direction, label);
    const next = { ...row };

    if (canonical) {
      if (isInput) {
        next.sourceType = canonical;
        next.materialType = canonical;
      } else {
        next.material = canonical;
      }
    }

    return next;
  }));
}

function normalizeProductionBatchPayload_(data, stage) {
  const next = { ...data };
  const stageName = String(stage || "").toUpperCase();

  if (next.feedComposition) {
    next.feedComposition = normalizeProductionComposition_(next.feedComposition, stageName, "INPUT", stageName + " input material");
  }

  if (next.outputComposition) {
    next.outputComposition = normalizeProductionComposition_(next.outputComposition, stageName, "OUTPUT", stageName + " output material");
  }

  if (next.inputMaterial && String(next.inputMaterial).indexOf(":") === -1 && String(next.inputMaterial).indexOf("+") === -1) {
    next.inputMaterial = assertProductionMaterialAllowed_(next.inputMaterial, stageName, "INPUT", stageName + " input material");
  }

  if (next.productionGrade) {
    next.productionGrade = assertProductionMaterialAllowed_(next.productionGrade, "EXTRUSION", "OUTPUT", "Production grade");
  }

  return next;
}

const MATERIAL_MASTER_CATEGORIES = ["RM", "WIP", "FG", "REWORK", "WASTE", "STORE", "ADDITIVE"];

function materialMasterHeaders_() {
  return REGEN_DB_SCHEMA.Material_Master;
}

function recipeHeaders_() {
  return REGEN_DB_SCHEMA.Production_Recipes;
}

function recipeComponentHeaders_() {
  return REGEN_DB_SCHEMA.Recipe_Components;
}

function materialCode_(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
}

function normalizeMaterialCategory_(value) {
  const category = String(value || "").trim().toUpperCase();
  if (category === "STORES") return "STORE";
  if (MATERIAL_MASTER_CATEGORIES.indexOf(category) !== -1) return category;
  throw new Error("Material category must be RM, WIP, FG, REWORK, WASTE, STORE, or ADDITIVE");
}

function listMaterialMaster() {
  createSheetIfMissing_("Material_Master", materialMasterHeaders_());
  return output({
    ok: true,
    rows: getMaterialMasterRows_(),
  });
}

function addMaterialMaster(data = {}) {
  createSheetIfMissing_("Material_Master", materialMasterHeaders_());
  const sh = getSheet("Material_Master");
  ensureHeaders_("Material_Master", materialMasterHeaders_());

  const materialName = String(data.materialName || data.name || "").trim();
  if (!materialName) throw new Error("Material name is required");

  const category = normalizeMaterialCategory_(data.category || data.materialType);
  const materialCode = materialCode_(data.materialCode || materialName);
  const existing = getMaterialMasterRows_();
  const duplicate = existing.find((row) =>
    materialCode_(row.materialCode || row.materialName) === materialCode ||
    String(row.materialName || "").trim().toUpperCase() === materialName.toUpperCase()
  );

  if (duplicate) {
    return output({
      ok: true,
      alreadyExists: true,
      materialId: duplicate.materialId,
      materialCode: duplicate.materialCode || materialCode,
    });
  }

  const materialId = data.materialId || generateBatchId("MAT");

  appendObjectRow(sh, {
    materialId,
    materialCode,
    materialName,
    category,
    unit: data.unit || "Kg",
    status: data.status || "ACTIVE",
    defaultQualityRequired: data.defaultQualityRequired || "NO",
    defaultStorageLocation: data.defaultStorageLocation || "",
    createdBy: data.createdBy || "System",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return output({ ok: true, materialId, materialCode });
}

function updateMaterialMaster(data = {}) {
  createSheetIfMissing_("Material_Master", materialMasterHeaders_());
  ensureHeaders_("Material_Master", materialMasterHeaders_());

  if (!data.materialId) {
    return output({ ok: false, error: "Missing materialId" });
  }

  const materialName = String(data.materialName || data.name || "").trim();
  if (!materialName) throw new Error("Material name is required");

  return updateById("Material_Master", "materialId", data.materialId, {
    materialCode: materialCode_(data.materialCode || materialName),
    materialName,
    category: normalizeMaterialCategory_(data.category || data.materialType),
    unit: data.unit || "Kg",
    status: data.status || "ACTIVE",
    defaultQualityRequired: data.defaultQualityRequired || "NO",
    defaultStorageLocation: data.defaultStorageLocation || "",
    updatedAt: new Date(),
  });
}

function buildMaterialMasterFromExisting(data = {}) {
  createSheetIfMissing_("Material_Master", materialMasterHeaders_());
  ensureHeaders_("Material_Master", materialMasterHeaders_());

  const dryRun = String(data.dryRun || "").toUpperCase() === "TRUE";
  const materialSheet = getSheet("Material_Master");
  const existingRows = getMaterialMasterRows_();
  const existingKeys = {};

  existingRows.forEach((row) => {
    const key = materialBuilderKey_(row.materialName || row.materialCode || row.name);
    if (key) existingKeys[key] = true;
  });

  const collected = collectExistingMaterialNames_();
  const grouped = {};
  const reviewRows = [];

  collected.forEach((entry) => {
    const normalized = normalizeMaterialBuilderName_(entry.originalName);
    if (!normalized.name) return;

    const key = materialBuilderKey_(normalized.name);
    if (!key) return;

    const category = categorizeMaterialBuilderName_(normalized.name, entry);
    const isDuplicate = !!grouped[key];
    const alreadyExists = !!existingKeys[key];

    if (!grouped[key]) {
      grouped[key] = {
        key,
        normalizedName: normalized.name,
        category: category.category,
        confidence: category.confidence,
        reason: category.reason,
        sources: {},
        originals: [],
        alreadyExists,
      };
    }

    grouped[key].sources[entry.sourceSheet] = true;
    grouped[key].originals.push(entry.originalName);
    grouped[key].alreadyExists = grouped[key].alreadyExists || alreadyExists;
    if (category.confidence > grouped[key].confidence) {
      grouped[key].category = category.category;
      grouped[key].confidence = category.confidence;
      grouped[key].reason = category.reason;
    }

    reviewRows.push({
      originalName: entry.originalName,
      normalizedName: normalized.name,
      category: category.category,
      confidence: category.confidence,
      sourceSheet: entry.sourceSheet,
      sourceField: entry.sourceField,
      sourceId: entry.sourceId || "",
      action: alreadyExists ? "EXISTS" : isDuplicate ? "DUPLICATE" : "CANDIDATE",
      reason: normalized.reason || category.reason,
    });
  });

  const candidates = Object.values(grouped).sort((a, b) =>
    String(a.normalizedName).localeCompare(String(b.normalizedName), undefined, { numeric: true })
  );

  let added = 0;
  const now = new Date();

  if (!dryRun) {
    const materialHeaders = getHeaders(materialSheet);
    const materialValues = [];

    candidates.forEach((candidate) => {
      if (candidate.alreadyExists) return;

      const category = candidate.category === "Needs Review" ? "Needs Review" : candidate.category;
      const payload = {
        materialId: generateBatchId("MAT"),
        materialCode: materialCode_(candidate.normalizedName),
        materialName: candidate.normalizedName,
        category,
        unit: "Kg",
        status: category === "Needs Review" ? "NEEDS_REVIEW" : "ACTIVE",
        defaultQualityRequired: defaultQualityRequiredForMaterial_(category),
        defaultStorageLocation: "",
        createdBy: "Material Master Builder",
        createdAt: now,
        updatedBy: "Material Master Builder",
        updatedAt: now,
      };

      materialValues.push(materialHeaders.map((header) => payload[header] !== undefined ? payload[header] : ""));

      existingKeys[candidate.key] = true;
      added += 1;
    });

    if (materialValues.length) {
      materialSheet
        .getRange(materialSheet.getLastRow() + 1, 1, materialValues.length, materialHeaders.length)
        .setValues(materialValues);
    }
  }

  const report = writeMaterialMasterBuilderReport_(reviewRows, candidates, dryRun);
  const unknown = candidates.filter((row) => row.category === "Needs Review");
  const duplicatesRemoved = Math.max(collected.length - candidates.length, 0);
  const finalCount = dryRun
    ? existingRows.length
    : getRowsAsObjects("Material_Master").filter((row) => !isDeleted_(row)).length;

  return output({
    ok: true,
    dryRun,
    materialsFound: collected.length,
    normalizedMaterials: candidates.length,
    duplicatesRemoved,
    existingMaterialsSkipped: candidates.filter((row) => row.alreadyExists).length,
    materialsAdded: added,
    finalMaterialMasterCount: finalCount,
    unknownMaterialsRequiringReview: unknown.length,
    unknownMaterials: unknown.map((row) => row.normalizedName),
    reportSheet: report.sheetName,
    reportRows: report.rows,
    message: dryRun
      ? "Material Master Builder dry run complete. Material_Master was not changed."
      : "Material_Master populated from existing operational material names.",
  });
}

function collectExistingMaterialNames_() {
  const entries = [];

  collectMaterialFields_(entries, "RM_Inward", ["material"], "inwardId");
  collectMaterialFields_(entries, "Wash_Batches", ["inputMaterial"], "washBatchId");
  collectMaterialFields_(entries, "Sorting_Batches", ["inputMaterial", "acceptedMaterial", "rejectedMaterialAction"], "sortingBatchId");
  collectMaterialFields_(entries, "Extrusion_Batches", [
    "inputMaterial",
    "productionGrade",
    "sourceType",
    "feedComposition",
    "dosingRecipe",
  ], "extrusionBatchId");
  collectMaterialFields_(entries, "Dispatches", ["material", "grade", "dispatchLines"], "dispatchId");
  collectMaterialFields_(entries, "Inventory_Ledger", ["itemName"], "ledgerId");
  collectMaterialFields_(entries, "Stores_Master", ["itemName"], "itemId");
  collectMaterialFields_(entries, "Stores_Inward", ["itemName"], "inwardId");
  collectMaterialFields_(entries, "Stores_Issue", ["itemName"], "issueId");
  collectMaterialFields_(entries, "Production_Materials", ["materialName"], "materialId");
  collectMaterialFields_(entries, "Production_Material_Master", ["materialName", "canonicalName", "aliases"], "materialId");

  addKnownOutputMaterials_(entries);

  return entries;
}

function collectMaterialFields_(entries, sheetName, fields, idField) {
  let rows = [];
  try {
    rows = getRowsAsObjects(sheetName).filter((row) => !isDeleted_(row));
  } catch (err) {
    return;
  }

  rows.forEach((row) => {
    const sourceId = row[idField] || row.id || "";
    fields.forEach((field) => {
      const value = row[field];
      if (!value) return;

      if (field === "feedComposition" || field === "dispatchLines") {
        extractMaterialNamesFromJsonText_(entries, sheetName, field, sourceId, value);
        return;
      }

      splitMaterialBuilderText_(value).forEach((name) => {
        entries.push({
          originalName: name,
          sourceSheet: sheetName,
          sourceField: field,
          sourceId,
          row,
        });
      });
    });
  });
}

function extractMaterialNamesFromJsonText_(entries, sheetName, field, sourceId, value) {
  const text = String(value || "").trim();
  if (!text) return;

  try {
    const parsed = JSON.parse(text);
    const rows = Array.isArray(parsed) ? parsed : [parsed];
    rows.forEach((row) => {
      ["material", "materialName", "materialType", "sourceType", "grade", "itemName"].forEach((key) => {
        if (!row || !row[key]) return;
        entries.push({
          originalName: row[key],
          sourceSheet: sheetName,
          sourceField: field + "." + key,
          sourceId,
          row,
        });
      });
    });
  } catch (err) {
    splitMaterialBuilderText_(text).forEach((name) => {
      entries.push({
        originalName: name,
        sourceSheet: sheetName,
        sourceField: field,
        sourceId,
        row: {},
      });
    });
  }
}

function addKnownOutputMaterials_(entries) {
  const outputRules = [
    ["Wash_Batches", "washedOutputKg", "White Regrind (Washed)", "WIP"],
    ["Wash_Batches", "sinkMaterialKg", "Sink Material", "WASTE"],
    ["Wash_Batches", "dustKg", "Dust", "WASTE"],
    ["Wash_Batches", "sludgeKg", "Sludge", "WASTE"],
    ["Wash_Batches", "raffiaKg", "Raffia Reject", "WASTE"],
    ["Wash_Batches", "wrappersKg", "Wrappers", "WASTE"],
    ["Sorting_Batches", "acceptedQtyKg", "White Sorted Regrind", "WIP"],
    ["Sorting_Batches", "rejectedQtyKg", "Sorting Reject", "WASTE"],
    ["Extrusion_Batches", "lumpsKg", "Lumps", "REWORK"],
    ["Extrusion_Batches", "purgingKg", "Purging", "REWORK"],
    ["Extrusion_Batches", "reworkGranulesKg", "Rework Granules", "REWORK"],
    ["Extrusion_Batches", "rejectKg", "Extrusion Reject", "WASTE"],
    ["Extrusion_Batches", "vacuumRejectKg", "Vacuum Reject", "WASTE"],
    ["Extrusion_Batches", "meshRejectKg", "Mesh Reject", "WASTE"],
    ["Extrusion_Batches", "floorSpillageKg", "Floor Spillage", "WASTE"],
    ["Extrusion_Batches", "virginMaterialKg", "Virgin PPCP", "ADDITIVE"],
    ["Extrusion_Batches", "masterBatchKg", "Masterbatch", "ADDITIVE"],
    ["Extrusion_Batches", "antiOxidantKg", "Antioxidant", "ADDITIVE"],
    ["Extrusion_Batches", "batteryFlakesKg", "Battery PPCP", "RM"],
  ];

  outputRules.forEach(([sheetName, qtyField, materialName]) => {
    let rows = [];
    try {
      rows = getRowsAsObjects(sheetName).filter((row) => !isDeleted_(row));
    } catch (err) {
      return;
    }

    rows.forEach((row) => {
      if (Number(row[qtyField] || 0) <= 0) return;
      entries.push({
        originalName: materialName,
        sourceSheet: sheetName,
        sourceField: qtyField,
        sourceId: row.washBatchId || row.sortingBatchId || row.extrusionBatchId || "",
        row,
      });
    });
  });
}

function splitMaterialBuilderText_(value) {
  const text = String(value || "").trim();
  if (!text) return [];

  return text
    .split(/\s*(?:\+|\||,|;|\n)\s*/g)
    .map((part) => part.trim())
    .filter(Boolean);
}

function normalizeMaterialBuilderName_(value) {
  let text = String(value || "").trim();
  const original = text;
  let reason = "";

  text = text.replace(/\s+/g, " ");
  text = text.replace(/\b\d+(?:\.\d+)?\s*(?:kg|kgs|kilogram|kilograms|mt|tons?|tonnes?)\b/gi, " ");
  text = text.replace(/:\s*\d+(?:\.\d+)?\s*(?:kg|kgs|mt|tons?|tonnes?)?\b/gi, "");
  text = text.replace(/\bqty\s*[:=]?\s*\d+(?:\.\d+)?\b/gi, " ");
  text = text.replace(/\b(rate|amount|value)\s*[:=]?\s*\d+(?:\.\d+)?\b/gi, " ");
  text = text.replace(/\([^)]*\d+(?:\.\d+)?\s*(?:kg|kgs|mt|tons?|tonnes?)[^)]*\)/gi, " ");
  text = text.replace(/\{.*\}|\[.*\]/g, " ");
  text = text.replace(/\b(input|output|feed|composition|recipe|grade|material)\s*[:=]\s*/gi, " ");
  text = text.replace(/\s*[-–—]\s*$/g, "");
  text = text.replace(/\s{2,}/g, " ").trim();

  const gradeMatch = text.match(/\bE\s*([1-9])\b/i);
  if (gradeMatch) {
    text = "E" + gradeMatch[1];
    reason = "FG grade normalized";
  }

  if (/^E[1-9]\s*:/i.test(original)) {
    text = original.replace(/^(\s*E[1-9]).*$/i, "$1").toUpperCase();
    reason = "Removed dispatch quantity from FG grade";
  }

  text = titleCaseMaterialName_(text);
  if (!reason && original !== text) reason = "Cleaned spacing, quantities, or recipe text";

  return {
    name: text,
    reason,
  };
}

function titleCaseMaterialName_(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (/^E[1-9]$/i.test(text)) return text.toUpperCase();

  const upperKeep = ["PP", "PPCP", "HDPE", "PET", "LDPE", "PVC", "ABS", "FG", "RM", "WIP", "DFC", "KBM", "AMD"];

  return text
    .split(" ")
    .map((word) => {
      const clean = word.replace(/[^a-z0-9]/gi, "");
      if (upperKeep.indexOf(clean.toUpperCase()) !== -1) return word.toUpperCase();
      if (word === word.toUpperCase() && word.length <= 4) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function materialBuilderKey_(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\bKGS?\b/g, "KG")
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function categorizeMaterialBuilderName_(name, entry = {}) {
  const text = String(name || "").toUpperCase();
  const itemType = String(entry.row && entry.row.itemType || "").toUpperCase();
  const sourceSheet = String(entry.sourceSheet || "").toUpperCase();
  const sourceField = String(entry.sourceField || "").toUpperCase();

  if (["RM", "WIP", "FG", "WASTE", "STORE", "ADDITIVE", "REWORK"].indexOf(itemType) !== -1) {
    return { category: itemType, confidence: 95, reason: "Inventory Ledger itemType" };
  }

  if (/^E[1-9]$/.test(text)) return { category: "FG", confidence: 99, reason: "Finished goods grade" };
  if (sourceSheet.indexOf("STORES") !== -1) return { category: "STORE", confidence: 98, reason: "Stores sheet" };
  if (sourceSheet === "RM_INWARD") return { category: "RM", confidence: 95, reason: "RM inward source" };
  if (sourceField.indexOf("PRODUCTIONGRADE") !== -1 || sourceField.indexOf("GRADE") !== -1) return { category: "FG", confidence: 92, reason: "Grade field" };
  if (/VIRGIN|MASTERBATCH|ANTIOXIDANT|ADDITIVE|MB\b/.test(text)) return { category: "ADDITIVE", confidence: 92, reason: "Additive keyword" };
  if (/WHITE\s+REGRIND.*UNWASHED|UNWASHED.*REGRIND|WHITE\s+REGRIND.*WASHED|WASHED.*REGRIND/.test(text)) return { category: "WIP", confidence: 94, reason: "Production regrind WIP" };
  if (/REWORK|LUMP|PURGING|REGRIND/.test(text)) return { category: "REWORK", confidence: 88, reason: "Rework keyword" };
  if (/WASTE|REJECT|DUST|SINK|SLUDGE|RAFFIA|WRAPPER|SPILLAGE|VACUUM|MESH/.test(text)) return { category: "WASTE", confidence: 90, reason: "Waste keyword" };
  if (/WASHED|SORTED|COMMODITY|FLAKES - WASHED|FLAKES - SEMI/.test(text)) return { category: "WIP", confidence: 82, reason: "WIP keyword" };
  if (/FLAKE|BUCKET|BATTERY|JAR|LID|PPCP|SCRAP|GRANULE/.test(text)) return { category: "RM", confidence: 78, reason: "RM keyword" };

  return { category: "Needs Review", confidence: 20, reason: "No reliable category rule matched" };
}

function defaultQualityRequiredForMaterial_(category) {
  if (category === "RM" || category === "FG") return "YES";
  return "NO";
}

function writeMaterialMasterBuilderReport_(reviewRows, candidates, dryRun) {
  const sheetName = "Material_Master_Builder_Report";
  const headers = [
    "runId",
    "runAt",
    "dryRun",
    "originalName",
    "normalizedName",
    "category",
    "confidence",
    "sourceSheet",
    "sourceField",
    "sourceId",
    "action",
    "reason",
  ];

  createSheetIfMissing_(sheetName, headers);
  ensureHeaders_(sheetName, headers);
  const sh = getSheet(sheetName);
  const sheetHeaders = getHeaders(sh);
  const runId = generateBatchId("MMB");
  const runAt = new Date();

  const values = reviewRows.map((row) => {
    const payload = {
      runId,
      runAt,
      dryRun: dryRun ? "TRUE" : "FALSE",
      ...row,
    };

    return sheetHeaders.map((header) => payload[header] !== undefined ? payload[header] : "");
  });

  if (values.length) {
    sh.getRange(sh.getLastRow() + 1, 1, values.length, sheetHeaders.length).setValues(values);
  }

  return {
    sheetName,
    rows: reviewRows.length,
    candidateRows: candidates.length,
  };
}

function seedMaterialMasterDefaults() {
  createSheetIfMissing_("Material_Master", materialMasterHeaders_());
  const sh = getSheet("Material_Master");
  ensureHeaders_("Material_Master", materialMasterHeaders_());

  const defaults = materialMasterDefaultRows_();

  const existing = {};
  getMaterialMasterRows_().forEach((row) => {
    existing[materialCode_(row.materialCode || row.materialName)] = true;
  });

  let inserted = 0;
  defaults.forEach((row) => {
    const code = row[0];
    if (existing[code]) return;

    appendObjectRow(sh, {
      materialId: generateBatchId("MAT"),
      materialCode: code,
      materialName: row[1],
      category: row[2],
      unit: "Kg",
      status: "ACTIVE",
      defaultQualityRequired: "NO",
      defaultStorageLocation: "",
      createdBy: "seedMaterialMasterDefaults",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    existing[code] = true;
    inserted += 1;
  });

  return output({
    ok: true,
    inserted,
    message: "Material Master default seed completed",
  });
}

function listProductionRecipes() {
  createSheetIfMissing_("Production_Recipes", recipeHeaders_());
  createSheetIfMissing_("Recipe_Components", recipeComponentHeaders_());
  ensureHeaders_("Production_Recipes", recipeHeaders_());
  ensureHeaders_("Recipe_Components", recipeComponentHeaders_());
  const recipes = getRowsAsObjects("Production_Recipes").filter((row) => !isDeleted_(row));
  const components = getRowsAsObjects("Recipe_Components").filter((row) => !isDeleted_(row));
  return output({
    ok: true,
    rows: recipes.map((recipe) => ({
      ...recipe,
      components: components.filter((component) => String(component.recipeId) === String(recipe.recipeId)),
    })),
  });
}

function addProductionRecipe(data = {}) {
  createSheetIfMissing_("Production_Recipes", recipeHeaders_());
  const sh = getSheet("Production_Recipes");
  ensureHeaders_("Production_Recipes", recipeHeaders_());

  const outputMaterial = resolveMaterialMaster_(data.outputMaterialId, data.outputMaterialCode || data.outputMaterialName);
  const recipeId = data.recipeId || generateBatchId("RCP");
  const recipeName = String(data.recipeName || "").trim();
  if (!recipeName) throw new Error("Recipe name is required");

  appendObjectRow(sh, {
    recipeId,
    recipeCode: materialCode_(data.recipeCode || recipeName),
    recipeName,
    outputMaterialId: outputMaterial.materialId,
    outputMaterialCode: outputMaterial.materialCode,
    processType: String(data.processType || "").trim().toUpperCase(),
    status: data.status || "ACTIVE",
    remarks: data.remarks || "",
    createdBy: data.createdBy || "System",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return output({ ok: true, recipeId });
}

function updateProductionRecipe(data = {}) {
  createSheetIfMissing_("Production_Recipes", recipeHeaders_());
  ensureHeaders_("Production_Recipes", recipeHeaders_());
  if (!data.recipeId) return output({ ok: false, error: "Missing recipeId" });
  const outputMaterial = resolveMaterialMaster_(data.outputMaterialId, data.outputMaterialCode || data.outputMaterialName);

  return updateById("Production_Recipes", "recipeId", data.recipeId, {
    recipeCode: materialCode_(data.recipeCode || data.recipeName),
    recipeName: data.recipeName || "",
    outputMaterialId: outputMaterial.materialId,
    outputMaterialCode: outputMaterial.materialCode,
    processType: String(data.processType || "").trim().toUpperCase(),
    status: data.status || "ACTIVE",
    remarks: data.remarks || "",
    updatedAt: new Date(),
  });
}

function listRecipeComponents(data = {}) {
  createSheetIfMissing_("Recipe_Components", recipeComponentHeaders_());
  ensureHeaders_("Recipe_Components", recipeComponentHeaders_());
  let rows = getRowsAsObjects("Recipe_Components").filter((row) => !isDeleted_(row));
  if (data.recipeId) rows = rows.filter((row) => String(row.recipeId) === String(data.recipeId));
  return output({ ok: true, rows });
}

function addRecipeComponent(data = {}) {
  createSheetIfMissing_("Recipe_Components", recipeComponentHeaders_());
  const sh = getSheet("Recipe_Components");
  ensureHeaders_("Recipe_Components", recipeComponentHeaders_());
  if (!data.recipeId) throw new Error("recipeId is required");

  const material = resolveMaterialMaster_(data.inputMaterialId, data.inputMaterialCode || data.inputMaterialName);
  const componentId = data.componentId || generateBatchId("RC");

  appendObjectRow(sh, {
    componentId,
    recipeId: data.recipeId,
    inputMaterialId: material.materialId,
    inputMaterialCode: material.materialCode,
    componentType: material.category,
    standardPercent: num(data.standardPercent),
    standardKg: num(data.standardKg),
    tolerancePercent: num(data.tolerancePercent),
    status: data.status || "ACTIVE",
    createdBy: data.createdBy || "System",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return output({ ok: true, componentId });
}

function updateRecipeComponent(data = {}) {
  createSheetIfMissing_("Recipe_Components", recipeComponentHeaders_());
  ensureHeaders_("Recipe_Components", recipeComponentHeaders_());
  if (!data.componentId) return output({ ok: false, error: "Missing componentId" });
  const material = resolveMaterialMaster_(data.inputMaterialId, data.inputMaterialCode || data.inputMaterialName);

  return updateById("Recipe_Components", "componentId", data.componentId, {
    recipeId: data.recipeId || "",
    inputMaterialId: material.materialId,
    inputMaterialCode: material.materialCode,
    componentType: material.category,
    standardPercent: num(data.standardPercent),
    standardKg: num(data.standardKg),
    tolerancePercent: num(data.tolerancePercent),
    status: data.status || "ACTIVE",
    updatedAt: new Date(),
  });
}

function archivedModelResponse_(sheetName, isWrite) {
  return output({
    ok: !isWrite,
    archived: true,
    sheet: sheetName,
    rows: [],
    error: isWrite ? sheetName + " is archived in RegenOS v1 architecture freeze" : "",
    message: "Experimental bucket/transformation model is archived. Data is retained in Sheets but not used for active operations.",
  });
}

function factoryMasterConfigs_() {
  return {
    material: {
      sheet: "Material_Master",
      idField: "materialId",
      nameField: "materialName",
      codeField: "materialCode",
      idPrefix: "MAT",
      headers: materialMasterHeaders_(),
      defaults: { category: "RM", unit: "Kg", defaultQualityRequired: "NO" },
    },
    supplier: {
      sheet: "Suppliers",
      idField: "supplierId",
      nameField: "supplierName",
      codeField: "",
      idPrefix: "SUP",
      headers: (REGEN_DB_SCHEMA.Suppliers || []).concat(["status", "updatedBy", "updatedAt", "disabledBy", "disabledAt", "mergedIntoId", "mergedBy", "mergedAt", "favorite"]),
      defaults: { supplierType: "RAW_MATERIAL", isActive: "TRUE" },
    },
    customer: {
      sheet: "Customers",
      idField: "customerId",
      nameField: "customerName",
      codeField: "customerCode",
      idPrefix: "CUS",
      headers: REGEN_DB_SCHEMA.Customers,
      defaults: {},
    },
    machine: {
      sheet: "Machine_Master",
      idField: "machineId",
      nameField: "machineName",
      codeField: "machineCode",
      idPrefix: "MAC",
      headers: ["machineId", "machineCode", "machineName", "machineType", "processType", "status", "createdBy", "createdAt", "updatedBy", "updatedAt", "disabledBy", "disabledAt", "mergedIntoId", "mergedBy", "mergedAt", "favorite"],
      defaults: {},
    },
    recipe: {
      sheet: "Production_Recipes",
      idField: "recipeId",
      nameField: "recipeName",
      codeField: "recipeCode",
      idPrefix: "RCP",
      headers: recipeHeaders_(),
      defaults: { processType: "EXTRUSION" },
    },
    storeItem: {
      sheet: "Stores_Master",
      idField: "itemId",
      nameField: "itemName",
      codeField: "",
      idPrefix: "STI",
      headers: (REGEN_DB_SCHEMA.Stores_Master || []).concat(["updatedBy", "updatedAt", "disabledBy", "disabledAt", "mergedIntoId", "mergedBy", "mergedAt", "favorite"]),
      defaults: { unit: "Nos" },
    },
    qualityTest: {
      sheet: "Quality_Test_Master",
      idField: "testId",
      nameField: "testName",
      codeField: "testCode",
      idPrefix: "QTM",
      headers: REGEN_DB_SCHEMA.Quality_Test_Master,
      defaults: {},
    },
    expenseCategory: {
      sheet: "Expense_Category_Master",
      idField: "categoryId",
      nameField: "categoryName",
      codeField: "categoryCode",
      idPrefix: "EXC",
      headers: REGEN_DB_SCHEMA.Expense_Category_Master,
      defaults: {},
    },
    productGrade: {
      sheet: "Production_Grades",
      idField: "gradeId",
      nameField: "gradeName",
      codeField: "gradeCode",
      idPrefix: "GRD",
      headers: ["gradeId", "gradeCode", "gradeName", "status", "createdBy", "createdAt", "updatedBy", "updatedAt", "disabledBy", "disabledAt", "mergedIntoId", "mergedBy", "mergedAt", "favorite"],
      defaults: {},
    },
    storageLocation: {
      sheet: "Storage_Locations",
      idField: "locationId",
      nameField: "locationName",
      codeField: "locationCode",
      idPrefix: "LOC",
      headers: ["locationId", "locationCode", "locationName", "locationType", "status", "createdBy", "createdAt", "updatedBy", "updatedAt", "disabledBy", "disabledAt", "mergedIntoId", "mergedBy", "mergedAt", "favorite"],
      defaults: {},
    },
  };
}

function factoryMasterConfig_(type) {
  const key = String(type || "").trim();
  const config = factoryMasterConfigs_()[key];
  if (!config) throw new Error("Unsupported factory master type: " + key);
  return config;
}

function uniqueHeaders_(headers) {
  const seen = {};
  return (headers || []).filter((header) => {
    const key = String(header || "").trim();
    if (!key || seen[key]) return false;
    seen[key] = true;
    return true;
  });
}

function ensureFactoryMasterSheet_(config) {
  const headers = uniqueHeaders_(config.headers || []);
  createSheetIfMissing_(config.sheet, headers);
  ensureHeaders_(config.sheet, headers);
}

function normalizeFactoryMasterRow_(row, config) {
  const status = row.status || (String(row.isActive || "").toUpperCase() === "FALSE" ? "DISABLED" : "ACTIVE");
  return {
    ...row,
    id: row[config.idField] || "",
    name: row[config.nameField] || row.name || "",
    status,
    favorite: String(row.favorite || "").toUpperCase() === "TRUE",
  };
}

function listFactoryMaster(data = {}) {
  const config = factoryMasterConfig_(data.masterType || data.type);
  ensureFactoryMasterSheet_(config);

  const search = String(data.search || "").trim().toLowerCase();
  const includeDisabled = String(data.includeDisabled || "").toUpperCase() === "TRUE";

  let rows = getRowsAsObjects(config.sheet)
    .filter((row) => !isDeleted_(row))
    .map((row) => normalizeFactoryMasterRow_(row, config));

  if (!includeDisabled) {
    rows = rows.filter((row) => ["DISABLED", "INACTIVE", "MERGED"].indexOf(String(row.status || "").toUpperCase()) === -1);
  }

  if (search) {
    rows = rows.filter((row) => JSON.stringify(row).toLowerCase().indexOf(search) !== -1);
  }

  rows.sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), undefined, { numeric: true }));

  return output({ ok: true, masterType: data.masterType || data.type, rows });
}

function addFactoryMaster(data = {}) {
  const config = factoryMasterConfig_(data.masterType || data.type);
  ensureFactoryMasterSheet_(config);

  const sh = getSheet(config.sheet);
  const name = String(data.name || data[config.nameField] || "").trim();
  if (!name) throw new Error("Name is required");

  const duplicate = getRowsAsObjects(config.sheet)
    .filter((row) => !isDeleted_(row))
    .find((row) => String(row[config.nameField] || row.name || "").trim().toUpperCase() === name.toUpperCase());

  if (duplicate) {
    return output({ ok: true, alreadyExists: true, row: normalizeFactoryMasterRow_(duplicate, config) });
  }

  const headers = getHeaders(sh);
  const payload = {};
  headers.forEach((header) => {
    if (data[header] !== undefined) payload[header] = data[header];
  });

  payload[config.idField] = data[config.idField] || generateBatchId(config.idPrefix);
  payload[config.nameField] = name;
  if (config.codeField && !payload[config.codeField]) payload[config.codeField] = materialCode_(name);
  Object.keys(config.defaults || {}).forEach((key) => {
    if (payload[key] === undefined || payload[key] === "") payload[key] = config.defaults[key];
  });
  payload.status = data.status || "PENDING_APPROVAL";
  payload.createdBy = data.createdBy || "System";
  payload.createdAt = new Date();
  payload.updatedBy = data.updatedBy || data.createdBy || "System";
  payload.updatedAt = new Date();
  payload.favorite = data.favorite || "";

  appendObjectRow(sh, payload);
  return output({ ok: true, row: normalizeFactoryMasterRow_(payload, config) });
}

function updateFactoryMaster(data = {}) {
  const config = factoryMasterConfig_(data.masterType || data.type);
  ensureFactoryMasterSheet_(config);

  const id = data.id || data[config.idField];
  if (!id) return output({ ok: false, error: "Missing master item id" });

  const headers = getHeaders(getSheet(config.sheet));
  const patch = {};
  headers.forEach((header) => {
    if (data[header] !== undefined) patch[header] = data[header];
  });
  if (data.name !== undefined) patch[config.nameField] = data.name;
  if (config.codeField && !patch[config.codeField] && patch[config.nameField]) {
    patch[config.codeField] = materialCode_(patch[config.nameField]);
  }
  patch.updatedBy = data.updatedBy || data.createdBy || "System";
  patch.updatedAt = new Date();

  return updateById(config.sheet, config.idField, id, patch);
}

function disableFactoryMaster(data = {}) {
  const config = factoryMasterConfig_(data.masterType || data.type);
  ensureFactoryMasterSheet_(config);

  const id = data.id || data[config.idField];
  if (!id) return output({ ok: false, error: "Missing master item id" });

  return updateById(config.sheet, config.idField, id, {
    status: "DISABLED",
    isActive: "FALSE",
    disabledBy: data.disabledBy || data.updatedBy || data.createdBy || "System",
    disabledAt: new Date(),
    updatedBy: data.updatedBy || data.createdBy || "System",
    updatedAt: new Date(),
  });
}

function mergeFactoryMaster(data = {}) {
  const config = factoryMasterConfig_(data.masterType || data.type);
  ensureFactoryMasterSheet_(config);

  const fromId = data.fromId || data.id || data[config.idField];
  const intoId = data.intoId || data.mergedIntoId;

  if (!fromId || !intoId) {
    return output({ ok: false, error: "fromId and intoId are required for merge" });
  }

  return updateById(config.sheet, config.idField, fromId, {
    status: "MERGED",
    mergedIntoId: intoId,
    mergedBy: data.mergedBy || data.updatedBy || data.createdBy || "System",
    mergedAt: new Date(),
    updatedBy: data.updatedBy || data.createdBy || "System",
    updatedAt: new Date(),
  });
}

const WHITE_PPCP_BUCKET_MERGE = {
  targetCode: "WHITE_PPCP_BUCKETS",
  targetName: "White PPCP Buckets",
  sourceNames: [
    "Mixed PPCP Buckets",
    "Mixed Bucket",
    "Mixed Buckets",
    "MIXED_PPCP_BUCKETS",
    "MIXED_BUCKETS",
    "White Bucket",
    "White Buckets",
    "WHITE_BUCKETS",
  ],
};

function previewWhitePpcpBucketMerge(data = {}) {
  return whitePpcpBucketMerge_(data, true);
}

function runWhitePpcpBucketMerge(data = {}) {
  if (String(data.confirm || "").toUpperCase() !== "MERGE_WHITE_PPCP_BUCKETS") {
    return {
      ok: false,
      error: "Run merge requires confirm: MERGE_WHITE_PPCP_BUCKETS",
      preview: whitePpcpBucketMerge_(data, true),
    };
  }
  return whitePpcpBucketMerge_(data, false);
}

function whitePpcpBucketMerge_(data, previewOnly) {
  const runId = data.runId || generateBatchId(previewOnly ? "MBMP" : "MBMR");
  const note = "Merged Mixed/White bucket variants into White PPCP Buckets (" + runId + ")";
  const operations = [
    { sheetName: "RM_Inward", textFields: ["material"], jsonFields: ["materialLines"], summaryFields: ["materialSummary"], idField: "inwardId" },
    { sheetName: "Wash_Batches", textFields: ["inputMaterial"], jsonFields: ["feedComposition"], idField: "washBatchId" },
    { sheetName: "Inventory_Ledger", textFields: ["itemName", "legacyMaterialName"], codeFields: ["materialId"], idField: "ledgerId" },
    { sheetName: "Physical_Counts", jsonFields: ["materialPhysicalLinesJson"], idField: "countId" },
    { sheetName: "Inventory_Adjustments", textFields: ["itemCode", "material"], idField: "adjustmentId" },
    { sheetName: "Month_Close", jsonFields: ["exceptions"], idField: "closeId" },
    { sheetName: "Month_Close_Reconciliation", textFields: ["material", "materialName", "stockType", "itemCode"], jsonFields: ["exceptions"], idField: "reconciliationId", optional: true },
  ];

  if (!previewOnly) ensureWhitePpcpBucketMasterHeaders_();

  const summaries = operations.map(function(op) {
    return mergeMaterialSheet_(op, previewOnly, note);
  });
  const masterSummary = mergeWhitePpcpBucketMasters_(previewOnly, note);
  summaries.push(masterSummary);

  return {
    ok: true,
    mode: previewOnly ? "PREVIEW" : "RUN",
    runId,
    source: WHITE_PPCP_BUCKET_MERGE.sourceNames,
    target: {
      materialCode: WHITE_PPCP_BUCKET_MERGE.targetCode,
      materialName: WHITE_PPCP_BUCKET_MERGE.targetName,
    },
    summaries,
    totalRowsMatched: summaries.reduce(function(sum, row) { return sum + num(row.rowsMatched); }, 0),
    totalCellsChanged: summaries.reduce(function(sum, row) { return sum + num(row.cellsChanged); }, 0),
    message: previewOnly
      ? "Preview only. No spreadsheet data changed."
      : "Merge completed. Rows were updated in place; no rows were deleted.",
  };
}

function ensureWhitePpcpBucketMasterHeaders_() {
  createSheetIfMissing_("Material_Master", materialMasterHeaders_());
  createSheetIfMissing_("Production_Material_Master", productionMaterialMasterHeaders_());
  createSheetIfMissing_("Material_Alias_Map", materialAliasMapHeaders_());
  ensureHeaders_("Material_Master", materialMasterHeaders_().concat(["mergedInto", "mergeNote"]));
  ensureHeaders_("Production_Material_Master", productionMaterialMasterHeaders_().concat(["status", "mergedInto", "mergedIntoId", "mergeNote", "mergedBy", "mergedAt"]));
  ensureHeaders_("Material_Alias_Map", materialAliasMapHeaders_());
}

function mergeMaterialSheet_(op, previewOnly, note) {
  try {
    const sh = getSheet(op.sheetName);
    const headers = getHeaders(sh);
    const values = sh.getDataRange().getValues();
    const changes = [];

    for (let r = 1; r < values.length; r++) {
      let rowChanged = false;
      const sample = {};
      (op.textFields || []).forEach(function(field) {
        const col = headers.indexOf(field);
        if (col === -1) return;
        const current = values[r][col];
        const next = mergeBucketMaterialValue_(current);
        if (next !== current) {
          rowChanged = true;
          sample[field] = current;
          if (!previewOnly) sh.getRange(r + 1, col + 1).setValue(next);
          changes.push({ rowNumber: r + 1, field: field, from: current, to: next });
        }
      });
      (op.codeFields || []).forEach(function(field) {
        const col = headers.indexOf(field);
        if (col === -1) return;
        const current = values[r][col];
        const next = mergeBucketMaterialCodeValue_(current);
        if (next !== current) {
          rowChanged = true;
          sample[field] = current;
          if (!previewOnly) sh.getRange(r + 1, col + 1).setValue(next);
          changes.push({ rowNumber: r + 1, field: field, from: current, to: next });
        }
      });
      (op.jsonFields || []).forEach(function(field) {
        const col = headers.indexOf(field);
        if (col === -1) return;
        const current = values[r][col];
        const result = mergeBucketMaterialJson_(current);
        if (result.changed) {
          rowChanged = true;
          sample[field] = String(current || "").slice(0, 160);
          if (!previewOnly) sh.getRange(r + 1, col + 1).setValue(result.value);
          changes.push({ rowNumber: r + 1, field: field, from: sample[field], to: String(result.value || "").slice(0, 160) });
        }
      });
      if (rowChanged && !previewOnly) {
        appendMergeNoteToRow_(sh, headers, r + 1, note);
        (op.summaryFields || []).forEach(function(field) {
          const col = headers.indexOf(field);
          const materialLinesCol = headers.indexOf("materialLines");
          if (col === -1 || materialLinesCol === -1) return;
          const lines = parseRmMaterialLinesNoNormalize_(sh.getRange(r + 1, materialLinesCol + 1).getValue());
          if (lines.length) sh.getRange(r + 1, col + 1).setValue(materialLinesSummary_(lines));
        });
      }
    }

    return {
      sheetName: op.sheetName,
      rowsMatched: uniqueRowCount_(changes),
      cellsChanged: changes.length,
      sampleRows: changes.slice(0, 10),
    };
  } catch (err) {
    if (op.optional) return { sheetName: op.sheetName, skipped: true, error: err.message || String(err), rowsMatched: 0, cellsChanged: 0, sampleRows: [] };
    throw err;
  }
}

function mergeWhitePpcpBucketMasters_(previewOnly, note) {
  const materialSummary = mergeMaterialMasterSheet_(previewOnly, note);
  const productionSummary = mergeProductionMaterialMasterSheet_(previewOnly, note);
  const aliasSummary = ensureWhitePpcpBucketAliases_(previewOnly);
  return {
    sheetName: "Material_Master / Production_Material_Master / Material_Alias_Map",
    rowsMatched: materialSummary.rowsMatched + productionSummary.rowsMatched + aliasSummary.rowsMatched,
    cellsChanged: materialSummary.cellsChanged + productionSummary.cellsChanged + aliasSummary.cellsChanged,
    sampleRows: materialSummary.sampleRows.concat(productionSummary.sampleRows).concat(aliasSummary.sampleRows).slice(0, 12),
  };
}

function mergeMaterialMasterSheet_(previewOnly, note) {
  const sh = getSheet("Material_Master");
  const headers = getHeaders(sh);
  const values = sh.getDataRange().getValues();
  let targetRow = -1;
  const changes = [];
  for (let r = 1; r < values.length; r++) {
    const code = values[r][headers.indexOf("materialCode")];
    const name = values[r][headers.indexOf("materialName")];
    if (bucketMaterialKey_(code) === WHITE_PPCP_BUCKET_MERGE.targetCode || bucketMaterialKey_(name) === WHITE_PPCP_BUCKET_MERGE.targetCode) targetRow = r + 1;
  }
  if (targetRow === -1 && !previewOnly) {
    appendObjectRow(sh, {
      materialId: generateBatchId("MAT"),
      materialCode: WHITE_PPCP_BUCKET_MERGE.targetCode,
      materialName: WHITE_PPCP_BUCKET_MERGE.targetName,
      category: "RM",
      unit: "Kg",
      status: "ACTIVE",
      createdBy: "System",
      createdAt: new Date(),
      mergeNote: note,
    });
  }
  for (let r = 1; r < values.length; r++) {
    const code = values[r][headers.indexOf("materialCode")];
    const name = values[r][headers.indexOf("materialName")];
    const isTarget = bucketMaterialKey_(code) === WHITE_PPCP_BUCKET_MERGE.targetCode || bucketMaterialKey_(name) === WHITE_PPCP_BUCKET_MERGE.targetCode;
    const isMerge = bucketMaterialShouldMerge_(code) || bucketMaterialShouldMerge_(name);
    if (!isTarget && !isMerge) continue;
    if (isTarget) {
      changes.push({ rowNumber: r + 1, field: "target", from: name, to: WHITE_PPCP_BUCKET_MERGE.targetName });
      if (!previewOnly) {
        setCellByHeader_(sh, headers, r + 1, "materialCode", WHITE_PPCP_BUCKET_MERGE.targetCode);
        setCellByHeader_(sh, headers, r + 1, "materialName", WHITE_PPCP_BUCKET_MERGE.targetName);
        setCellByHeader_(sh, headers, r + 1, "status", "ACTIVE");
        appendMergeNoteToRow_(sh, headers, r + 1, note);
      }
    } else {
      changes.push({ rowNumber: r + 1, field: "merged", from: name || code, to: WHITE_PPCP_BUCKET_MERGE.targetName });
      if (!previewOnly) {
        setCellByHeader_(sh, headers, r + 1, "status", "MERGED");
        setCellByHeader_(sh, headers, r + 1, "mergedIntoId", WHITE_PPCP_BUCKET_MERGE.targetCode);
        setCellByHeader_(sh, headers, r + 1, "mergedInto", WHITE_PPCP_BUCKET_MERGE.targetCode);
        setCellByHeader_(sh, headers, r + 1, "mergedBy", "System");
        setCellByHeader_(sh, headers, r + 1, "mergedAt", new Date());
        appendMergeNoteToRow_(sh, headers, r + 1, note);
      }
    }
  }
  if (targetRow === -1) changes.push({ rowNumber: "new", field: "target", from: "", to: WHITE_PPCP_BUCKET_MERGE.targetName });
  return { rowsMatched: uniqueRowCount_(changes), cellsChanged: changes.length, sampleRows: changes.slice(0, 10) };
}

function mergeProductionMaterialMasterSheet_(previewOnly, note) {
  const sh = getSheet("Production_Material_Master");
  const headers = getHeaders(sh);
  const values = sh.getDataRange().getValues();
  let hasTarget = false;
  const changes = [];
  for (let r = 1; r < values.length; r++) {
    const name = values[r][headers.indexOf("materialName")];
    const canonical = values[r][headers.indexOf("canonicalName")];
    const isTarget = bucketMaterialKey_(name) === WHITE_PPCP_BUCKET_MERGE.targetCode || bucketMaterialKey_(canonical) === WHITE_PPCP_BUCKET_MERGE.targetCode;
    const isMerge = bucketMaterialShouldMerge_(name) || bucketMaterialShouldMerge_(canonical);
    if (isTarget) {
      hasTarget = true;
      changes.push({ rowNumber: r + 1, field: "target", from: canonical || name, to: WHITE_PPCP_BUCKET_MERGE.targetName });
      if (!previewOnly) {
        setCellByHeader_(sh, headers, r + 1, "materialName", WHITE_PPCP_BUCKET_MERGE.targetName);
        setCellByHeader_(sh, headers, r + 1, "canonicalName", WHITE_PPCP_BUCKET_MERGE.targetName);
        setCellByHeader_(sh, headers, r + 1, "active", "TRUE");
        setCellByHeader_(sh, headers, r + 1, "status", "ACTIVE");
        setCellByHeader_(sh, headers, r + 1, "aliases", "White Bucket|White Buckets|Mixed Bucket|Mixed Buckets|Mixed PPCP Buckets");
        appendMergeNoteToRow_(sh, headers, r + 1, note);
      }
    } else if (isMerge) {
      changes.push({ rowNumber: r + 1, field: "merged", from: canonical || name, to: WHITE_PPCP_BUCKET_MERGE.targetName });
      if (!previewOnly) {
        setCellByHeader_(sh, headers, r + 1, "active", "FALSE");
        setCellByHeader_(sh, headers, r + 1, "status", "MERGED");
        setCellByHeader_(sh, headers, r + 1, "mergedInto", WHITE_PPCP_BUCKET_MERGE.targetName);
        setCellByHeader_(sh, headers, r + 1, "mergedIntoId", WHITE_PPCP_BUCKET_MERGE.targetCode);
        setCellByHeader_(sh, headers, r + 1, "mergedBy", "System");
        setCellByHeader_(sh, headers, r + 1, "mergedAt", new Date());
        appendMergeNoteToRow_(sh, headers, r + 1, note);
      }
    }
  }
  if (!hasTarget) {
    changes.push({ rowNumber: "new", field: "target", from: "", to: WHITE_PPCP_BUCKET_MERGE.targetName });
    if (!previewOnly) {
      appendObjectRow(sh, {
        materialId: "PMM-WHITE-PPCP-BUCKETS",
        materialName: WHITE_PPCP_BUCKET_MERGE.targetName,
        canonicalName: WHITE_PPCP_BUCKET_MERGE.targetName,
        category: "RM",
        stageAllowed: "RM_INWARD,GRINDER",
        directionAllowed: "INPUT",
        active: "TRUE",
        aliases: "White Bucket|White Buckets|Mixed Bucket|Mixed Buckets|Mixed PPCP Buckets",
        sortOrder: 1,
        remarks: note,
        createdBy: "System",
        createdAt: new Date(),
      });
    }
  }
  return { rowsMatched: uniqueRowCount_(changes), cellsChanged: changes.length, sampleRows: changes.slice(0, 10) };
}

function ensureWhitePpcpBucketAliases_(previewOnly) {
  let sh;
  try {
    sh = getSheet("Material_Alias_Map");
  } catch (err) {
    if (previewOnly) return { rowsMatched: 0, cellsChanged: 0, sampleRows: [{ rowNumber: "-", field: "Material_Alias_Map", from: "missing", to: "will be created on run" }] };
    throw err;
  }
  const headers = getHeaders(sh);
  const existing = getRowsAsObjects("Material_Alias_Map").map(function(row) {
    return materialAliasKey_(row.aliasName || "");
  });
  const aliases = ["White Bucket", "White Buckets", "Mixed Bucket", "Mixed Buckets", "Mixed PPCP Buckets", "MIXED_BUCKETS", "MIXED_PPCP_BUCKETS"];
  const changes = [];
  aliases.forEach(function(alias) {
    if (existing.indexOf(materialAliasKey_(alias)) !== -1) return;
    changes.push({ rowNumber: "new", field: "aliasName", from: "", to: alias });
    if (!previewOnly) {
      appendObjectRow(sh, {
        aliasId: generateBatchId("MAL"),
        aliasName: alias,
        canonicalName: WHITE_PPCP_BUCKET_MERGE.targetName,
        category: "RM",
        stageAllowed: "RM_INWARD,GRINDER",
        directionAllowed: "INPUT",
        active: "TRUE",
        confidence: 100,
        source: "white-bucket-merge",
        createdAt: new Date(),
      });
    }
  });
  return { rowsMatched: changes.length, cellsChanged: changes.length, sampleRows: changes.slice(0, 10) };
}

function mergeBucketMaterialJson_(value) {
  if (!value) return { changed: false, value: value };
  try {
    const parsed = JSON.parse(value);
    const result = mergeBucketMaterialObject_(parsed);
    return { changed: result.changed, value: result.changed ? JSON.stringify(result.value) : value };
  } catch (err) {
    const next = mergeBucketMaterialText_(String(value));
    return { changed: next !== String(value), value: next };
  }
}

function mergeBucketMaterialObject_(value) {
  let changed = false;
  if (Array.isArray(value)) {
    const rows = value.map(function(item) {
      const result = mergeBucketMaterialObject_(item);
      if (result.changed) changed = true;
      return result.value;
    });
    return { changed: changed, value: rows };
  }
  if (value && typeof value === "object") {
    const next = {};
    Object.keys(value).forEach(function(key) {
      const current = value[key];
      if (["material", "materialName", "stockType", "itemCode", "itemName", "inputMaterial", "sourceType", "outputMaterial"].indexOf(key) !== -1) {
        const updated = mergeBucketMaterialValue_(current);
        if (updated !== current) changed = true;
        next[key] = updated;
        return;
      }
      if (["materialCode", "materialId"].indexOf(key) !== -1) {
        const updatedCode = mergeBucketMaterialCodeValue_(current);
        if (updatedCode !== current) changed = true;
        next[key] = updatedCode;
        return;
      }
      next[key] = current;
    });
    return { changed: changed, value: next };
  }
  const updated = mergeBucketMaterialValue_(value);
  return { changed: updated !== value, value: updated };
}

function mergeBucketMaterialText_(value) {
  let next = String(value || "");
  WHITE_PPCP_BUCKET_MERGE.sourceNames.concat(["White PPCP Buckets"]).sort(function(a, b) {
    return String(b).length - String(a).length;
  }).forEach(function(name) {
    if (!bucketMaterialShouldMerge_(name) && bucketMaterialKey_(name) !== WHITE_PPCP_BUCKET_MERGE.targetCode) return;
    next = next.replace(new RegExp(escapeRegExp_(name), "gi"), WHITE_PPCP_BUCKET_MERGE.targetName);
  });
  return next;
}

function mergeBucketMaterialValue_(value) {
  if (bucketMaterialShouldMerge_(value) || bucketMaterialKey_(value) === WHITE_PPCP_BUCKET_MERGE.targetCode) return WHITE_PPCP_BUCKET_MERGE.targetName;
  return value;
}

function mergeBucketMaterialCodeValue_(value) {
  if (bucketMaterialShouldMerge_(value) || bucketMaterialKey_(value) === WHITE_PPCP_BUCKET_MERGE.targetCode) return WHITE_PPCP_BUCKET_MERGE.targetCode;
  return value;
}

function bucketMaterialShouldMerge_(value) {
  const key = bucketMaterialKey_(value);
  if (!key) return false;
  return WHITE_PPCP_BUCKET_MERGE.sourceNames.map(bucketMaterialKey_).indexOf(key) !== -1;
}

function bucketMaterialKey_(value) {
  return materialCode_(value);
}

function parseRmMaterialLinesNoNormalize_(value) {
  if (!value) return [];
  try {
    const rows = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(rows) ? rows : [];
  } catch (err) {
    return [];
  }
}

function appendMergeNoteToRow_(sh, headers, rowNumber, note) {
  ["mergeNote", "remarks"].some(function(field) {
    const col = headers.indexOf(field);
    if (col === -1) return false;
    const current = sh.getRange(rowNumber, col + 1).getValue();
    if (String(current || "").indexOf(note) !== -1) return true;
    sh.getRange(rowNumber, col + 1).setValue([current, note].filter(Boolean).join(" | "));
    return true;
  });
}

function setCellByHeader_(sh, headers, rowNumber, field, value) {
  const col = headers.indexOf(field);
  if (col !== -1) sh.getRange(rowNumber, col + 1).setValue(value);
}

function uniqueRowCount_(changes) {
  const seen = {};
  (changes || []).forEach(function(change) {
    seen[String(change.rowNumber)] = true;
  });
  return Object.keys(seen).length;
}

function escapeRegExp_(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getMaterialMasterRows_() {
  try {
    const rows = getRowsAsObjects("Material_Master").filter((row) => !isDeleted_(row));
    const existing = {};

    rows.forEach(function(row) {
      existing[materialCode_(row.materialCode || row.materialName)] = true;
    });

    materialMasterDefaultRows_().forEach(function(row) {
      const code = row[0];
      if (existing[code]) return;
      rows.push({
        materialId: "DEFAULT-" + code,
        materialCode: code,
        materialName: row[1],
        category: row[2],
        unit: "Kg",
        status: "ACTIVE",
        defaultQualityRequired: "NO",
        defaultStorageLocation: "",
      });
      existing[code] = true;
    });

    return rows;
  } catch (err) {
    return materialMasterDefaultRows_().map(function(row) {
      return {
        materialId: "DEFAULT-" + row[0],
        materialCode: row[0],
        materialName: row[1],
        category: row[2],
        unit: "Kg",
        status: "ACTIVE",
      };
    });
  }
}
function num(v) {
  if (v === undefined || v === null || v === "") return 0;
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

function round2(v) {
  return Math.round(Number(v || 0) * 100) / 100;
}

function todayYmd() {
  return Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "yyyy-MM-dd"
  );
}

function normalizeDateOnly_(value) {
  if (!value) return todayYmd();

  const text = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
    return text.slice(0, 10);
  }

  return text.slice(0, 10);
}

function getPeriodMonth(dateValue) {
  const clean = normalizeDateOnly_(dateValue || todayYmd());

  if (/^\d{4}-\d{2}/.test(clean)) {
    return clean.slice(0, 7);
  }

  return todayYmd().slice(0, 7);
}

function getPeriodMonthFromPayload_(data = {}, dateValue) {
  const explicit = String(data.periodMonth || "").trim();

  if (/^\d{4}-\d{2}/.test(explicit)) {
    return explicit.slice(0, 7);
  }

  const year = String(data.year || "").trim();
  const monthValue = String(data.month || "").trim();

  if (/^\d{4}$/.test(year) && monthValue) {
    const monthMap = {
      jan: "01",
      january: "01",
      feb: "02",
      february: "02",
      mar: "03",
      march: "03",
      apr: "04",
      april: "04",
      may: "05",
      jun: "06",
      june: "06",
      jul: "07",
      july: "07",
      aug: "08",
      august: "08",
      sep: "09",
      sept: "09",
      september: "09",
      oct: "10",
      october: "10",
      nov: "11",
      november: "11",
      dec: "12",
      december: "12",
    };

    const monthKey = monthValue.toLowerCase();
    const monthNumber =
      monthMap[monthKey] ||
      (/^\d{1,2}$/.test(monthValue)
        ? String(Number(monthValue)).padStart(2, "0")
        : "");

    if (/^\d{2}$/.test(monthNumber)) {
      return `${year}-${monthNumber}`;
    }
  }

  return getPeriodMonth(dateValue);
}

function generateBatchId(prefix) {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const seq = Utilities.getUuid().slice(0, 4).toUpperCase();
  return `${prefix}-${y}${m}${d}-${seq}`;
}

function normalizeStatus(status) {
  return String(status || "").trim().toUpperCase();
}

function normalizeYesNo(value, defaultValue) {
  return String(value || defaultValue || "").trim().toUpperCase();
}

function getHeaders(sheet) {
  return sheet
    .getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1))
    .getValues()[0]
    .map((h) => String(h).trim());
}

function ensureHeaders_(sheetName, requiredHeaders) {
  const sh = getSheet(sheetName);
  let headers = getHeaders(sh);

  requiredHeaders.forEach((h) => {
    if (headers.indexOf(h) === -1) {
      sh.getRange(1, sh.getLastColumn() + 1).setValue(h);
      headers = getHeaders(sh);
    }
  });
}

function appendObjectRow(sheet, payload) {
  const headers = getHeaders(sheet);
  const row = headers.map((h) =>
    payload[h] !== undefined ? payload[h] : ""
  );
  sheet.appendRow(row);
}

function getRowsAsObjects(sheetName) {
  const sh = getSheet(sheetName);
  const values = sh.getDataRange().getValues();

  if (values.length === 0) return [];

  const headers = values[0].map((h) => String(h).trim());

  return values
    .slice(1)
    .filter((r) => r.some((c) => c !== "" && c !== null))
    .map((row) => {
      const obj = {};

      headers.forEach((h, i) => {
        if (!h) return;

        const v = row[i];

        if (v instanceof Date) {
          obj[h] = Utilities.formatDate(
            v,
            Session.getScriptTimeZone(),
            "yyyy-MM-dd"
          );
        } else {
          obj[h] = v;
        }
      });

      return obj;
    });
}

function isDeleted_(row) {
  return (
    String(row.status || "").toUpperCase() === "DELETED" ||
    String(row.dispatchStatus || "").toUpperCase() === "DELETED" ||
    String(row.inwardStatus || "").toUpperCase() === "DELETED" ||
    String(row.issueStatus || "").toUpperCase() === "DELETED" ||
    String(row.isActive || "").toUpperCase() === "FALSE"
  );
}

function listMaster(sheetName) {
  const rows = getRowsAsObjects(sheetName).filter((r) => !isDeleted_(r));
  return output({ ok: true, rows });
}

function updateById(sheetName, idColumn, idValue, patch) {
  if (!idValue) {
    return output({
      ok: false,
      error: "Missing ID for update: " + idColumn,
    });
  }

  const sh = getSheet(sheetName);
  const headers = getHeaders(sh);
  const idIndex = headers.indexOf(idColumn);

  if (idIndex === -1) {
    return output({
      ok: false,
      error: "ID column not found: " + idColumn,
    });
  }

  const values = sh.getDataRange().getValues();

  for (let r = 1; r < values.length; r++) {
    if (String(values[r][idIndex]) === String(idValue)) {
      Object.keys(patch).forEach((key) => {
        const colIndex = headers.indexOf(key);

        if (colIndex !== -1) {
          let value = patch[key];

          if (key === "date" || key === "productionDate") {
            value = normalizeDateOnly_(value);
          }

          if (key === "periodMonth") {
            value = value || getPeriodMonth(patch.date);
          }

          sh.getRange(r + 1, colIndex + 1).setValue(value);
        }
      });

      return output({
        ok: true,
        id: idValue,
      });
    }
  }

  return output({
    ok: false,
    error: "Record not found: " + idValue,
  });
}

function validateMonthLock(periodMonth) {
  if (!periodMonth) return;

  let sh;
  try {
    sh = getSheet("Month_Locks");
  } catch (err) {
    return;
  }

  const values = sh.getDataRange().getValues();
  if (values.length < 2) return;

  const headers = values[0].map((h) => String(h).trim());
  const monthIndex =
    headers.indexOf("periodMonth") !== -1
      ? headers.indexOf("periodMonth")
      : 0;

  const statusIndex =
    headers.indexOf("status") !== -1 ? headers.indexOf("status") : 1;

  for (let i = 1; i < values.length; i++) {
    if (
      String(values[i][monthIndex]) === String(periodMonth) &&
      String(values[i][statusIndex]).toUpperCase() === "LOCKED"
    ) {
      throw new Error("Month locked: " + periodMonth);
    }
  }
}

function writePeriodMonth_(data = {}) {
  if (data.periodMonth) return String(data.periodMonth).slice(0, 7);
  return getPeriodMonth(data.date || data.productionDate || todayYmd());
}

function getRowById_(sheetName, idColumn, idValue) {
  if (!idValue) return null;

  const rows = getRowsAsObjects(sheetName);
  return rows.find((r) => String(r[idColumn] || "") === String(idValue)) || null;
}

function validateOperationalWrite_(data = {}, existing = null) {
  if (existing) {
    validateMonthLock(writePeriodMonth_(existing));
  }

  validateMonthLock(writePeriodMonth_(data));
}

function isMonthClosed_(periodMonth) {
  if (!periodMonth) return false;

  try {
    const closeRows = getRowsAsObjects("Month_Close").filter((r) => !isDeleted_(r));
    if (closeRows.some((r) => String(r.periodMonth || "") === String(periodMonth))) {
      return true;
    }
  } catch (err) {}

  try {
    const lockRows = getRowsAsObjects("Month_Locks").filter((r) => !isDeleted_(r));
    return lockRows.some(
      (r) =>
        String(r.periodMonth || "") === String(periodMonth) &&
        String(r.status || "").toUpperCase() === "LOCKED"
    );
  } catch (err) {
    return false;
  }
}

// =====================================================
// MATERIAL MASTER + TRANSFORMATION RUNS
// Material-inventory manufacturing foundation.
// =====================================================

function transformationSchemaHeaders_(sheetName) {
  return REGEN_DB_SCHEMA[sheetName] || [];
}

function parseJsonArray_(value, fieldName) {
  if (Array.isArray(value)) return value;
  if (!value) return [];

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch (err) {}
  }

  throw new Error(fieldName + " must be an array");
}

function addMaterialBucket(data = {}) {
  const sh = getSheet("Material_Buckets");
  ensureHeaders_("Material_Buckets", transformationSchemaHeaders_("Material_Buckets"));

  const bucketName = String(data.bucketName || "").trim();
  const bucketType = String(data.bucketType || "").trim().toUpperCase();

  if (!bucketName) throw new Error("Material name is required");
  if (["RM", "WIP", "FG", "WASTE", "STORES"].indexOf(bucketType) === -1) {
    throw new Error("Material category must be RM, WIP, FG, WASTE, or STORES");
  }

  const bucketId = data.bucketId || generateBatchId("BKT");

  appendObjectRow(sh, {
    bucketId,
    bucketName,
    bucketType,
    materialFamily: data.materialFamily || "",
    processStage: data.processStage || "",
    defaultNextProcess: data.defaultNextProcess || "",
    qualitySampleDefault: data.qualitySampleDefault || "",
    qualityTestType: data.qualityTestType || "",
    status: data.status || "ACTIVE",
    createdBy: data.createdBy || "System",
    createdAt: new Date(),
  });

  return output({ ok: true, bucketId });
}

function seedStandardMaterialBuckets() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName("Material_Buckets");
  const headers = transformationSchemaHeaders_("Material_Buckets");

  if (!sh) {
    sh = ss.insertSheet("Material_Buckets");
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    freezeHeaderRow_(sh);
  } else {
    ensureHeaders_("Material_Buckets", headers);
  }

  const existingNames = {};

  getRowsAsObjects("Material_Buckets").forEach((row) => {
    const name = String(row.bucketName || "").trim().toLowerCase();
    if (name) existingNames[name] = true;
  });

  const standardBuckets = [
    ["White Flakes", "RM", "PP", "RECEIVING", "WASH"],
    ["White PPCP Buckets", "RM", "PP", "RECEIVING", "WASH"],
    ["Battery Scrap", "RM", "PP", "RECEIVING", "WASH"],
    ["Jars", "RM", "PP", "RECEIVING", "WASH"],
    ["Lids", "RM", "PP", "RECEIVING", "WASH"],
    ["PP Mixed", "RM", "PP", "RECEIVING", "WASH"],

    ["Washed White Flakes", "WIP", "PP", "WASH", "SORTING"],
    ["Washed Mixed", "WIP", "PP", "WASH", "SORTING"],
    ["White Sorted", "WIP", "PP", "SORTING", "EXTRUSION"],
    ["Commodity", "WIP", "PP", "SORTING", "EXTRUSION"],
    ["Mixed Sorted", "WIP", "PP", "SORTING", "EXTRUSION"],

    ["E1", "FG", "PP", "EXTRUSION", "DISPATCH"],
    ["E2", "FG", "PP", "EXTRUSION", "DISPATCH"],
    ["E3", "FG", "PP", "EXTRUSION", "DISPATCH"],
    ["E4", "FG", "PP", "EXTRUSION", "DISPATCH"],
    ["E5", "FG", "PP", "EXTRUSION", "DISPATCH"],

    ["Sink Material", "WASTE", "PP", "WASH", "REWORK"],
    ["Color Reject", "WASTE", "PP", "SORTING", "REWORK"],
    ["Dust", "WASTE", "PP", "ANY", "DISPOSAL"],
    ["Metal Reject", "WASTE", "PP", "RECEIVING", "DISPOSAL"],
    ["Extrusion Waste", "WASTE", "PP", "EXTRUSION", "REWORK"],
    ["Lumps", "WASTE", "PP", "EXTRUSION", "REWORK"],
    ["Purging", "WASTE", "PP", "EXTRUSION", "REWORK"],
    ["Rework Material", "WASTE", "PP", "REWORK", "REWORK"],
  ];

  const inserted = [];
  const skipped = [];

  standardBuckets.forEach((bucket) => {
    const bucketName = bucket[0];
    const key = bucketName.toLowerCase();

    if (existingNames[key]) {
      skipped.push(bucketName);
      return;
    }

    appendObjectRow(sh, {
      bucketId: generateBatchId("BKT"),
      bucketName,
      bucketType: bucket[1],
      materialFamily: bucket[2],
      processStage: bucket[3],
      defaultNextProcess: bucket[4],
      status: "ACTIVE",
      createdBy: "seedStandardMaterialBuckets",
      createdAt: new Date(),
    });

    existingNames[key] = true;
    inserted.push(bucketName);
  });

  const result = {
    ok: true,
    insertedCount: inserted.length,
    skippedCount: skipped.length,
    inserted,
    skipped,
  };

  Logger.log(JSON.stringify(result, null, 2));
  return result;
}

function cleanCodePart_(value, fallback) {
  const text = String(value || fallback || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, 8);

  return text || String(fallback || "GEN").toUpperCase();
}

function makeReceivingGrnId_(date, supplier, bucketName, sequence) {
  const compactDate = normalizeDateOnly_(date).replace(/-/g, "");
  const supplierCode = cleanCodePart_(supplier, "SUP");
  const bucketCode = cleanCodePart_(bucketName, "MAT");
  const seq = String(sequence).padStart(2, "0");

  return `GRN-${compactDate}-${supplierCode}-${bucketCode}-${seq}`;
}

function listMaterialReceiving(data = {}) {
  const receipts = getRowsAsObjects("Material_Receiving").filter((r) => !isDeleted_(r));
  const lines = getRowsAsObjects("Material_Receiving_Lines").filter((r) => !isDeleted_(r));

  const rows = receipts
    .map((receipt) => ({
      ...receipt,
      lines: lines.filter((line) => String(line.receivingId || "") === String(receipt.receivingId || "")),
    }))
    .sort((a, b) => String(b.createdAt || b.date || "").localeCompare(String(a.createdAt || a.date || "")));

  return output({ ok: true, rows });
}

function addMaterialReceiving(data = {}) {
  const receiptSh = getSheet("Material_Receiving");
  const lineSh = getSheet("Material_Receiving_Lines");

  ensureHeaders_("Material_Receiving", transformationSchemaHeaders_("Material_Receiving"));
  ensureHeaders_("Material_Receiving_Lines", transformationSchemaHeaders_("Material_Receiving_Lines"));

  const date = normalizeDateOnly_(data.date || todayYmd());
  const periodMonth = String(data.periodMonth || getPeriodMonth(date)).slice(0, 7);
  const supplier = String(data.supplier || "").trim();
  const vehicleNo = String(data.vehicleNo || "").trim();
  const materials = parseJsonArray_(data.materials, "materials")
    .map((row) => ({
      materialBucket: String(row.materialBucket || row.bucketName || "").trim(),
      bucketType: String(row.bucketType || "").trim().toUpperCase(),
      quantityKg: num(row.quantityKg),
      ratePerKg: num(row.ratePerKg),
      qualitySampleRequired: String(row.qualitySampleRequired || "").toUpperCase() === "YES" ? "YES" : "NO",
    }))
    .filter((row) => row.materialBucket || row.quantityKg > 0);

  if (!supplier) throw new Error("Supplier is required");
  if (!vehicleNo) throw new Error("Vehicle number is required");
  if (materials.length === 0) throw new Error("At least one material line is required");

  materials.forEach((row) => {
    if (!row.materialBucket) throw new Error("Material bucket is required");
    if (row.quantityKg <= 0) throw new Error("Material quantity must be greater than zero");
  });

  validateOperationalWrite_({ ...data, date, periodMonth });

  const receivingId = data.receivingId || generateBatchId("MRV");
  const createdBy = data.createdBy || "System";
  const totalTruckWeightKg = materials.reduce((s, row) => s + num(row.quantityKg), 0);
  const qualitySampleRequired =
    String(data.qualitySampleRequired || "").toUpperCase() === "YES" ||
    materials.some((row) => row.qualitySampleRequired === "YES")
      ? "YES"
      : "NO";
  const grns = [];

  appendObjectRow(receiptSh, {
    receivingId,
    date,
    periodMonth,
    supplier,
    vehicleNo,
    weighbridgeSlipNo: data.weighbridgeSlipNo || "",
    totalTruckWeightKg,
    qualitySampleRequired,
    remarks: data.remarks || "",
    status: data.status || "ACTIVE",
    createdBy,
    createdAt: new Date(),
  });

  materials.forEach((row, index) => {
    const grnId = makeReceivingGrnId_(date, supplier, row.materialBucket, index + 1);
    const value = round2(row.quantityKg * row.ratePerKg);

    appendObjectRow(lineSh, {
      lineId: generateBatchId("MRL"),
      receivingId,
      grnId,
      materialBucket: row.materialBucket,
      bucketType: row.bucketType || "",
      quantityKg: row.quantityKg,
      ratePerKg: row.ratePerKg,
      value,
      qualitySampleRequired: row.qualitySampleRequired,
      status: "ACTIVE",
      createdBy,
      createdAt: new Date(),
    });

    addInventoryLedger({
      date,
      module: "Material Receiving",
      movementType: "MATERIAL_RECEIVING_IN",
      itemType: "MATERIAL_BUCKET",
      itemName: row.materialBucket,
      sourceRef: grnId,
      targetRef: receivingId,
      qtyIn: row.quantityKg,
      qtyOut: 0,
      unit: "Kg",
      remarks: "Material receiving bucket posting",
      createdBy,
    });

    grns.push({
      grnId,
      materialBucket: row.materialBucket,
      quantityKg: row.quantityKg,
      qualitySampleRequired: row.qualitySampleRequired,
    });
  });

  return output({
    ok: true,
    receivingId,
    totalTruckWeightKg,
    qualitySampleRequired,
    grns,
  });
}

function listTransformationRuns(data = {}) {
  const runs = getRowsAsObjects("Transformation_Runs").filter((r) => !isDeleted_(r));
  const inputs = getRowsAsObjects("Transformation_Inputs").filter((r) => !isDeleted_(r));
  const outputs = getRowsAsObjects("Transformation_Outputs").filter((r) => !isDeleted_(r));

  const rows = runs
    .map((run) => ({
      ...run,
      inputs: inputs.filter((input) => String(input.runId || "") === String(run.runId || "")),
      outputs: outputs.filter((out) => String(out.runId || "") === String(run.runId || "")),
    }))
    .sort((a, b) => String(b.createdAt || b.date || "").localeCompare(String(a.createdAt || a.date || "")));

  return output({ ok: true, rows });
}

function addTransformationRun(data = {}) {
  const runSh = getSheet("Transformation_Runs");
  const inputSh = getSheet("Transformation_Inputs");
  const outputSh = getSheet("Transformation_Outputs");

  ensureHeaders_("Transformation_Runs", transformationSchemaHeaders_("Transformation_Runs"));
  ensureHeaders_("Transformation_Inputs", transformationSchemaHeaders_("Transformation_Inputs"));
  ensureHeaders_("Transformation_Outputs", transformationSchemaHeaders_("Transformation_Outputs"));

  const date = normalizeDateOnly_(data.date || todayYmd());
  const periodMonth = String(data.periodMonth || getPeriodMonth(date)).slice(0, 7);
  const processType = String(data.processType || "").trim().toUpperCase();
  const inputs = parseJsonArray_(data.inputs, "inputs")
    .map((row) => ({
      inputBucket: String(row.inputBucket || row.bucketName || "").trim(),
      quantityKg: num(row.quantityKg),
    }))
    .filter((row) => row.inputBucket || row.quantityKg > 0);
  const outputs = parseJsonArray_(data.outputs, "outputs")
    .map((row) => ({
      outputBucket: String(row.outputBucket || row.bucketName || "").trim(),
      quantityKg: num(row.quantityKg),
      outputType: String(row.outputType || "GOOD").trim().toUpperCase(),
    }))
    .filter((row) => row.outputBucket || row.quantityKg > 0);

  if (["WASH", "SORTING", "EXTRUSION", "REWORK"].indexOf(processType) === -1) {
    throw new Error("Process type must be WASH, SORTING, EXTRUSION, or REWORK");
  }

  if (inputs.length === 0) throw new Error("At least one input bucket is required");
  if (outputs.length === 0) throw new Error("At least one output bucket is required");

  inputs.forEach((row) => {
    if (!row.inputBucket) throw new Error("Input bucket is required");
    if (row.quantityKg <= 0) throw new Error("Input quantity must be greater than zero");
  });

  outputs.forEach((row) => {
    if (!row.outputBucket) throw new Error("Output bucket is required");
    if (row.quantityKg < 0) throw new Error("Output quantity cannot be negative");
    if (["GOOD", "WASTE", "REWORK", "LOSS"].indexOf(row.outputType) === -1) {
      throw new Error("Output type must be GOOD, WASTE, REWORK, or LOSS");
    }
  });

  validateOperationalWrite_({ ...data, date, periodMonth });

  const runId = data.runId || generateBatchId("TRN");
  const totalInputKg = inputs.reduce((s, row) => s + num(row.quantityKg), 0);
  const totalOutputKg = outputs.reduce((s, row) => s + num(row.quantityKg), 0);
  const goodOutputKg = outputs
    .filter((row) => row.outputType === "GOOD" || row.outputType === "REWORK")
    .reduce((s, row) => s + num(row.quantityKg), 0);
  const lossOutputKg = outputs
    .filter((row) => row.outputType === "WASTE" || row.outputType === "LOSS")
    .reduce((s, row) => s + num(row.quantityKg), 0);
  const varianceKg = round2(totalInputKg - totalOutputKg);
  const recoveryPercent = totalInputKg > 0 ? round2((goodOutputKg / totalInputKg) * 100) : 0;
  const lossPercent = totalInputKg > 0 ? round2(((lossOutputKg + Math.max(varianceKg, 0)) / totalInputKg) * 100) : 0;
  const createdBy = data.createdBy || data.operator || "System";

  appendObjectRow(runSh, {
    runId,
    date,
    periodMonth,
    shift: data.shift || "",
    processType,
    machine: data.machine || "",
    operator: data.operator || "",
    remarks: data.remarks || "",
    totalInputKg,
    totalOutputKg,
    varianceKg,
    recoveryPercent,
    lossPercent,
    status: data.status || "ACTIVE",
    createdBy,
    createdAt: new Date(),
  });

  inputs.forEach((row) => {
    appendObjectRow(inputSh, {
      inputId: generateBatchId("TRI"),
      runId,
      inputBucket: row.inputBucket,
      quantityKg: row.quantityKg,
      status: "ACTIVE",
      createdBy,
      createdAt: new Date(),
    });

    addInventoryLedger({
      date,
      module: "Material Transformation",
      movementType: "TRANSFORMATION_CONSUME",
      itemType: "MATERIAL_BUCKET",
      itemName: row.inputBucket,
      sourceRef: runId,
      targetRef: "",
      qtyIn: 0,
      qtyOut: row.quantityKg,
      unit: "Kg",
      remarks: processType + " input consumption",
      createdBy,
    });
  });

  outputs.forEach((row) => {
    appendObjectRow(outputSh, {
      outputId: generateBatchId("TRO"),
      runId,
      outputBucket: row.outputBucket,
      quantityKg: row.quantityKg,
      outputType: row.outputType,
      status: "ACTIVE",
      createdBy,
      createdAt: new Date(),
    });

    addInventoryLedger({
      date,
      module: "Material Transformation",
      movementType: "TRANSFORMATION_OUTPUT_" + row.outputType,
      itemType: "MATERIAL_BUCKET",
      itemName: row.outputBucket,
      sourceRef: "",
      targetRef: runId,
      qtyIn: row.quantityKg,
      qtyOut: 0,
      unit: "Kg",
      remarks: processType + " output posting",
      createdBy,
    });
  });

  return output({
    ok: true,
    runId,
    totalInputKg,
    totalOutputKg,
    varianceKg,
    recoveryPercent,
    lossPercent,
  });
}

// =====================================================
// MANUFACTURING OPERATING MODEL CUT-OVER
// One-time June 2026 migration helpers. These functions
// are idempotent and never run automatically.
// =====================================================

const MANUFACTURING_CUTOVER_MONTH = "2026-06";
const MANUFACTURING_MIGRATION_ID = "MOM-CUTOVER-2026-06";
let MANUFACTURING_MIGRATION_CACHE = null;

function resetMigrationCaches_() {
  MANUFACTURING_MIGRATION_CACHE = {
    sheetKeys: {},
    ledgerKeys: null,
  };
}

function migrationCache_() {
  if (!MANUFACTURING_MIGRATION_CACHE) resetMigrationCaches_();
  return MANUFACTURING_MIGRATION_CACHE;
}

function migrationMonth_(data = {}) {
  return String(data.periodMonth || data.month || MANUFACTURING_CUTOVER_MONTH).slice(0, 7);
}

function migrationNow_() {
  return new Date().toISOString();
}

function rowPeriodMonth_(row) {
  return String(row.periodMonth || getPeriodMonth(row.date || "") || "").slice(0, 7);
}

function isMigrationPeriod_(row, periodMonth) {
  return rowPeriodMonth_(row) === String(periodMonth || "").slice(0, 7);
}

function materialName_(value, fallback) {
  const raw = String(value || fallback || "").trim();
  if (!raw) return "Mixed Material";
  return raw
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function materialCategory_(materialName) {
  const name = String(materialName || "").toUpperCase();
  if (/^E[1-5]$/.test(name)) return "FG";
  if (name.indexOf("WASTE") !== -1 || name.indexOf("REJECT") !== -1 || name.indexOf("DUST") !== -1 || name.indexOf("SINK") !== -1 || name.indexOf("PURGING") !== -1 || name.indexOf("LUMP") !== -1) return "WASTE";
  if (name.indexOf("WHITE REGRIND (UNWASHED)") !== -1 || name.indexOf("WHITE REGRIND (WASHED)") !== -1 || (name.indexOf("REGRIND") !== -1 && (name.indexOf("UNWASHED") !== -1 || name.indexOf("WASHED") !== -1))) return "WIP";
  if (name.indexOf("WASHED") !== -1 || name.indexOf("SORTED") !== -1 || name.indexOf("COMMODITY") !== -1 || name.indexOf("REWORK") !== -1) return "WIP";
  return "RM";
}

function normalizeDispatchGrade_(value) {
  const raw = String(value || "").toUpperCase();
  const match = raw.match(/\bE[1-5]\b/);
  if (match) return match[0];
  return materialName_(value, "E1").toUpperCase();
}

function repairMigratedDispatchLedgerGrades_() {
  const sh = getSheet("Inventory_Ledger");
  const values = sh.getDataRange().getValues();
  if (values.length < 2) return 0;

  const headers = values[0].map((h) => String(h).trim());
  const itemNameIndex = headers.indexOf("itemName");
  const sourceSheetIndex = headers.indexOf("legacySourceSheet");
  const migrationIndex = headers.indexOf("migrationId");
  const movementIndex = headers.indexOf("movementType");

  if (itemNameIndex === -1 || sourceSheetIndex === -1 || migrationIndex === -1 || movementIndex === -1) {
    return 0;
  }

  let repaired = 0;

  for (let r = 1; r < values.length; r++) {
    const sourceSheet = String(values[r][sourceSheetIndex] || "");
    const migrationId = String(values[r][migrationIndex] || "");
    const movementType = String(values[r][movementIndex] || "");
    const itemName = String(values[r][itemNameIndex] || "");
    const normalized = normalizeDispatchGrade_(itemName);

    if (
      sourceSheet === "Dispatches" &&
      migrationId === MANUFACTURING_MIGRATION_ID &&
      movementType === "FG_DISPATCH_OUT" &&
      itemName &&
      normalized !== itemName
    ) {
      sh.getRange(r + 1, itemNameIndex + 1).setValue(normalized);
      repaired += 1;
    }
  }

  return repaired;
}

function migrationExists_(sheetName, legacySourceSheet, legacySourceId) {
  if (!legacySourceId) return false;
  const cache = migrationCache_();

  if (!cache.sheetKeys[sheetName]) {
    const keys = {};
    getRowsAsObjects(sheetName).forEach((row) => {
      const sourceSheet = String(row.legacySourceSheet || "");
      const sourceId = String(row.legacySourceId || "");
      if (sourceSheet && sourceId) keys[sourceSheet + "|" + sourceId] = true;
    });
    cache.sheetKeys[sheetName] = keys;
  }

  return Boolean(cache.sheetKeys[sheetName][legacySourceSheet + "|" + String(legacySourceId)]);
}

function ledgerMigrationExists_(legacySourceSheet, legacySourceId, movementType, itemName) {
  const cache = migrationCache_();

  if (!cache.ledgerKeys) {
    const keys = {};
    getRowsAsObjects("Inventory_Ledger").forEach((row) => {
      const sourceSheet = String(row.legacySourceSheet || "");
      const sourceId = String(row.legacySourceId || "");
      const type = String(row.movementType || "");
      const name = String(row.itemName || "");
      if (sourceSheet && sourceId && type && name) {
        keys[sourceSheet + "|" + sourceId + "|" + type + "|" + name] = true;
      }
    });
    cache.ledgerKeys = keys;
  }

  return Boolean(cache.ledgerKeys[
    legacySourceSheet + "|" + String(legacySourceId) + "|" + String(movementType || "") + "|" + String(itemName || "")
  ]);
}

function appendMigrationLedger_(payload, legacySourceSheet, legacySourceId) {
  const movementType = payload.movementType || "";
  const itemName = payload.itemName || "";

  if (ledgerMigrationExists_(legacySourceSheet, legacySourceId, movementType, itemName)) {
    return false;
  }

  addInventoryLedger({
    ...payload,
    legacySourceSheet,
    legacySourceId,
    migrationId: MANUFACTURING_MIGRATION_ID,
    migratedAt: migrationNow_(),
  });

  migrationCache_().ledgerKeys[
    legacySourceSheet + "|" + String(legacySourceId) + "|" + String(movementType || "") + "|" + String(itemName || "")
  ] = true;

  return true;
}

function appendMigrationRow_(sheetName, payload, legacySourceSheet, legacySourceId) {
  const sh = getSheet(sheetName);
  ensureHeaders_(sheetName, transformationSchemaHeaders_(sheetName));
  appendObjectRow(sh, {
    ...payload,
    legacySourceSheet,
    legacySourceId,
    migrationId: MANUFACTURING_MIGRATION_ID,
    migratedAt: migrationNow_(),
  });

  if (legacySourceSheet && legacySourceId) {
    const cache = migrationCache_();
    if (!cache.sheetKeys[sheetName]) cache.sheetKeys[sheetName] = {};
    cache.sheetKeys[sheetName][legacySourceSheet + "|" + String(legacySourceId)] = true;
  }
}

function migrationSummary_(functionName, periodMonth) {
  return {
    ok: true,
    functionName,
    periodMonth,
    migrationId: MANUFACTURING_MIGRATION_ID,
    legacyRowsRead: 0,
    rowsMigrated: 0,
    rowsSkippedAlreadyMigrated: 0,
    rowsFlaggedForReview: 0,
    ledgerMovementsCreated: 0,
    warnings: [],
    migrated: [],
  };
}

function makeLegacyRunId_(prefix, legacyId) {
  return `${prefix}-${String(legacyId || Utilities.getUuid()).replace(/[^A-Za-z0-9]/g, "").slice(0, 28)}`;
}

function aggregateInputRows_(rows) {
  const map = {};
  (rows || []).forEach((row) => {
    const material = materialName_(row.material, "");
    const quantityKg = num(row.quantityKg);
    if (!material || quantityKg <= 0) return;
    if (!map[material]) map[material] = { material, quantityKg: 0 };
    map[material].quantityKg += quantityKg;
  });
  return Object.keys(map).map((key) => ({
    material: map[key].material,
    quantityKg: round2(map[key].quantityKg),
  }));
}

function aggregateOutputRows_(rows) {
  const map = {};
  (rows || []).forEach((row) => {
    const material = materialName_(row.material, "");
    const outputType = String(row.outputType || "GOOD").toUpperCase();
    const quantityKg = num(row.quantityKg);
    if (!material || quantityKg <= 0) return;
    const key = material + "|" + outputType;
    if (!map[key]) map[key] = { material, outputType, quantityKg: 0 };
    map[key].quantityKg += quantityKg;
  });
  return Object.keys(map).map((key) => ({
    material: map[key].material,
    outputType: map[key].outputType,
    quantityKg: round2(map[key].quantityKg),
  }));
}

function addTransformationMigration_(options) {
  const legacySheet = options.legacySheet;
  const legacyId = String(options.legacyId || "");
  const runId = options.runId || makeLegacyRunId_("TRN", legacyId);
  const date = normalizeDateOnly_(options.date || todayYmd());
  const periodMonth = String(options.periodMonth || getPeriodMonth(date)).slice(0, 7);
  const inputs = aggregateInputRows_(options.inputs || []);
  const outputs = aggregateOutputRows_(options.outputs || []);

  if (migrationExists_("Transformation_Runs", legacySheet, legacyId)) {
    return { migrated: false, skipped: true, runId, ledgerMovementsCreated: 0 };
  }

  const totalInputKg = round2(inputs.reduce((s, row) => s + num(row.quantityKg), 0));
  const totalOutputKg = round2(outputs.reduce((s, row) => s + num(row.quantityKg), 0));
  const goodOutputKg = outputs
    .filter((row) => ["GOOD", "REWORK"].indexOf(String(row.outputType || "").toUpperCase()) !== -1)
    .reduce((s, row) => s + num(row.quantityKg), 0);
  const lossOutputKg = outputs
    .filter((row) => ["WASTE", "LOSS"].indexOf(String(row.outputType || "").toUpperCase()) !== -1)
    .reduce((s, row) => s + num(row.quantityKg), 0);
  const varianceKg = round2(totalInputKg - totalOutputKg);
  const recoveryPercent = totalInputKg > 0 ? round2((goodOutputKg / totalInputKg) * 100) : 0;
  const lossPercent = totalInputKg > 0 ? round2(((lossOutputKg + Math.max(varianceKg, 0)) / totalInputKg) * 100) : 0;
  const createdBy = options.createdBy || "Legacy Migration";

  appendMigrationRow_("Transformation_Runs", {
    runId,
    date,
    periodMonth,
    shift: options.shift || "",
    processType: options.processType,
    machine: options.machine || "",
    operator: options.operator || "",
    remarks: options.remarks || "Migrated from " + legacySheet,
    totalInputKg,
    totalOutputKg,
    varianceKg,
    recoveryPercent,
    lossPercent,
    status: options.status || "ACTIVE",
    createdBy,
    createdAt: new Date(),
  }, legacySheet, legacyId);

  let ledgerMovementsCreated = 0;

  inputs.forEach((row) => {
    appendMigrationRow_("Transformation_Inputs", {
      inputId: generateBatchId("TRI"),
      runId,
      inputBucket: row.material,
      quantityKg: num(row.quantityKg),
      status: "ACTIVE",
      createdBy,
      createdAt: new Date(),
    }, legacySheet, legacyId);

    if (appendMigrationLedger_({
      date,
      module: "Manufacturing Cutover",
      movementType: "TRANSFORMATION_INPUT",
      itemType: materialCategory_(row.material),
      itemName: row.material,
      sourceRef: legacyId,
      targetRef: runId,
      qtyIn: 0,
      qtyOut: num(row.quantityKg),
      unit: "Kg",
      remarks: `${options.processType} input migrated from ${legacySheet}`,
      createdBy,
    }, legacySheet, legacyId)) {
      ledgerMovementsCreated += 1;
    }
  });

  outputs.forEach((row) => {
    const outputType = String(row.outputType || "GOOD").toUpperCase();
    appendMigrationRow_("Transformation_Outputs", {
      outputId: generateBatchId("TRO"),
      runId,
      outputBucket: row.material,
      quantityKg: num(row.quantityKg),
      outputType,
      status: "ACTIVE",
      createdBy,
      createdAt: new Date(),
    }, legacySheet, legacyId);

    if (appendMigrationLedger_({
      date,
      module: "Manufacturing Cutover",
      movementType: "TRANSFORMATION_OUTPUT_" + outputType,
      itemType: materialCategory_(row.material),
      itemName: row.material,
      sourceRef: legacyId,
      targetRef: runId,
      qtyIn: num(row.quantityKg),
      qtyOut: 0,
      unit: "Kg",
      remarks: `${options.processType} output migrated from ${legacySheet}`,
      createdBy,
    }, legacySheet, legacyId)) {
      ledgerMovementsCreated += 1;
    }
  });

  return {
    migrated: true,
    skipped: false,
    runId,
    totalInputKg,
    totalOutputKg,
    varianceKg,
    recoveryPercent,
    ledgerMovementsCreated,
  };
}

function migrateLegacyReceiving(data = {}) {
  resetMigrationCaches_();
  const periodMonth = migrationMonth_(data);
  const summary = migrationSummary_("migrateLegacyReceiving", periodMonth);
  const rows = getRowsAsObjects("RM_Inward").filter((row) => !isDeleted_(row) && isMigrationPeriod_(row, periodMonth));
  summary.legacyRowsRead = rows.length;

  rows.forEach((row, index) => {
    const legacyId = String(row.inwardId || row.batchId || `RM-${index + 1}`);
    const material = materialName_(row.material || row.color, "Mixed Material");
    const quantityKg = num(row.netWeight || row.inputWeightKg || row.grossWeight);
    const date = normalizeDateOnly_(row.date || todayYmd());
    const receivingId = makeLegacyRunId_("MR", legacyId);
    const grnId = makeReceivingGrnId_(date, row.supplier || "SUPPLIER", material, index + 1);

    if (!quantityKg) {
      summary.rowsFlaggedForReview += 1;
      summary.warnings.push({ legacySourceId: legacyId, reason: "RM inward has no net weight" });
      return;
    }

    if (migrationExists_("Material_Receiving", "RM_Inward", legacyId)) {
      summary.rowsSkippedAlreadyMigrated += 1;
      return;
    }

    appendMigrationRow_("Material_Receiving", {
      receivingId,
      date,
      periodMonth,
      supplier: row.supplier || "",
      vehicleNo: row.vehicleNo || "",
      weighbridgeSlipNo: "",
      totalTruckWeightKg: quantityKg,
      qualitySampleRequired: (num(row.moisture) || num(row.contamination)) ? "YES" : "NO",
      remarks: row.remarks || "Migrated from RM Inward",
      status: row.status || "ACTIVE",
      createdBy: row.createdBy || "Legacy Migration",
      createdAt: row.createdAt || new Date(),
    }, "RM_Inward", legacyId);

    appendMigrationRow_("Material_Receiving_Lines", {
      lineId: generateBatchId("MRL"),
      receivingId,
      grnId,
      materialBucket: material,
      bucketType: materialCategory_(material),
      quantityKg,
      ratePerKg: num(row.ratePerKg),
      value: round2(quantityKg * num(row.ratePerKg)),
      qualitySampleRequired: (num(row.moisture) || num(row.contamination)) ? "YES" : "NO",
      status: row.status || "ACTIVE",
      createdBy: row.createdBy || "Legacy Migration",
      createdAt: row.createdAt || new Date(),
    }, "RM_Inward", legacyId);

    if (appendMigrationLedger_({
      date,
      module: "Manufacturing Cutover",
      movementType: "MATERIAL_RECEIVING_IN",
      itemType: materialCategory_(material),
      itemName: material,
      sourceRef: legacyId,
      targetRef: grnId,
      qtyIn: quantityKg,
      qtyOut: 0,
      unit: "Kg",
      remarks: "RM inward migrated to Material Receiving",
      createdBy: row.createdBy || "Legacy Migration",
    }, "RM_Inward", legacyId)) {
      summary.ledgerMovementsCreated += 1;
    }

    summary.rowsMigrated += 1;
    summary.migrated.push({ legacySourceId: legacyId, receivingId, grnId, material, quantityKg });
  });

  return output(summary);
}

function migrateLegacyWash(data = {}) {
  resetMigrationCaches_();
  const periodMonth = migrationMonth_(data);
  const summary = migrationSummary_("migrateLegacyWash", periodMonth);
  const rows = getRowsAsObjects("Wash_Batches").filter((row) => !isDeleted_(row) && isMigrationPeriod_(row, periodMonth));
  summary.legacyRowsRead = rows.length;

  rows.forEach((row, index) => {
    const legacyId = String(row.washBatchId || row.batchId || `WASH-${index + 1}`);
    const inputMaterial = normalizeProductionMaterialName_(materialName_(row.inputMaterial, "White Regrind (Unwashed)")).canonicalName;
    const washedMaterial = "White Regrind (Washed)";
    const outputs = [
      { material: washedMaterial, quantityKg: num(row.washedOutputKg), outputType: "GOOD" },
      { material: "Sink Material", quantityKg: num(row.sinkMaterialKg), outputType: "WASTE" },
      { material: "Color Reject", quantityKg: num(row.otherColorKg), outputType: "WASTE" },
      { material: "Dust", quantityKg: num(row.dustKg), outputType: "WASTE" },
      { material: "Raffia Reject", quantityKg: num(row.raffiaKg), outputType: "WASTE" },
      { material: "Wrapper Reject", quantityKg: num(row.wrappersKg), outputType: "WASTE" },
      { material: "Micro Plastic", quantityKg: num(row.microPlasticKg), outputType: "WASTE" },
      { material: "Metal Reject", quantityKg: num(row.ironScrapKg), outputType: "WASTE" },
      { material: "Sludge", quantityKg: num(row.sludgeKg), outputType: "WASTE" },
    ];
    const result = addTransformationMigration_({
      legacySheet: "Wash_Batches",
      legacyId,
      runId: makeLegacyRunId_("WASH", legacyId),
      date: row.date,
      periodMonth,
      shift: row.shift,
      processType: "WASH",
      machine: row.machine,
      operator: row.operatorName,
      remarks: row.remarks,
      status: row.status,
      createdBy: row.createdBy,
      inputs: [{ material: inputMaterial, quantityKg: num(row.inputWeightKg) }],
      outputs,
    });

    if (result.skipped) summary.rowsSkippedAlreadyMigrated += 1;
    if (result.migrated) {
      summary.rowsMigrated += 1;
      summary.ledgerMovementsCreated += result.ledgerMovementsCreated;
      summary.migrated.push({ legacySourceId: legacyId, runId: result.runId, ...result });
    }
    if (!num(row.inputWeightKg)) {
      summary.rowsFlaggedForReview += 1;
      summary.warnings.push({ legacySourceId: legacyId, reason: "Wash batch has no input weight" });
    }
  });

  return output(summary);
}

function migrateLegacySorting(data = {}) {
  resetMigrationCaches_();
  const periodMonth = migrationMonth_(data);
  const summary = migrationSummary_("migrateLegacySorting", periodMonth);
  const rows = getRowsAsObjects("Sorting_Batches").filter((row) => !isDeleted_(row) && isMigrationPeriod_(row, periodMonth));
  summary.legacyRowsRead = rows.length;

  rows.forEach((row, index) => {
    const legacyId = String(row.sortingBatchId || `SORT-${index + 1}`);
    const result = addTransformationMigration_({
      legacySheet: "Sorting_Batches",
      legacyId,
      runId: makeLegacyRunId_("SORT", legacyId),
      date: row.date,
      periodMonth,
      shift: row.shift,
      processType: "SORTING",
      machine: row.machine,
      operator: row.operatorName,
      remarks: row.remarks,
      status: row.status,
      createdBy: row.createdBy,
      inputs: [{ material: normalizeProductionMaterialName_(materialName_(row.inputMaterial, "White Regrind (Washed)")).canonicalName, quantityKg: num(row.inputWeightKg) }],
      outputs: [
        { material: "White Sorted Regrind", quantityKg: num(row.acceptedQtyKg), outputType: "GOOD" },
        { material: "Color Reject", quantityKg: num(row.rejectedQtyKg), outputType: "WASTE" },
        { material: "Rubber Reject", quantityKg: num(row.rubberRejectKg), outputType: "WASTE" },
        { material: "Black Specs Reject", quantityKg: num(row.blackSpecsRejectKg), outputType: "WASTE" },
        { material: "Raffia Reject", quantityKg: num(row.raffiaRejectKg), outputType: "WASTE" },
        { material: "Rework Material", quantityKg: num(row.recoverableRejectKg), outputType: "REWORK" },
        { material: "Sorting Waste", quantityKg: num(row.unrecoverableRejectKg), outputType: "WASTE" },
      ],
    });

    if (result.skipped) summary.rowsSkippedAlreadyMigrated += 1;
    if (result.migrated) {
      summary.rowsMigrated += 1;
      summary.ledgerMovementsCreated += result.ledgerMovementsCreated;
      summary.migrated.push({ legacySourceId: legacyId, runId: result.runId, ...result });
    }
    if (!num(row.inputWeightKg)) {
      summary.rowsFlaggedForReview += 1;
      summary.warnings.push({ legacySourceId: legacyId, reason: "Sorting batch has no input weight" });
    }
  });

  return output(summary);
}

function migrateLegacyExtrusion(data = {}) {
  resetMigrationCaches_();
  const periodMonth = migrationMonth_(data);
  const summary = migrationSummary_("migrateLegacyExtrusion", periodMonth);
  const rows = getRowsAsObjects("Extrusion_Batches").filter((row) => !isDeleted_(row) && isMigrationPeriod_(row, periodMonth));
  summary.legacyRowsRead = rows.length;

  rows.forEach((row, index) => {
    const legacyId = String(row.extrusionBatchId || row.batchId || `EXT-${index + 1}`);
    const grade = materialName_(row.productionGrade, "E1").toUpperCase();
    const baseInputKg = num(row.inputWeightKg || row.totalInputKg);
    const result = addTransformationMigration_({
      legacySheet: "Extrusion_Batches",
      legacyId,
      runId: makeLegacyRunId_("EXT", legacyId),
      date: row.date,
      periodMonth,
      shift: row.shift,
      processType: "EXTRUSION",
      machine: row.machine,
      operator: row.operatorName,
      remarks: row.remarks,
      status: row.status,
      createdBy: row.createdBy,
      inputs: [
        { material: normalizeProductionMaterialName_(materialName_(row.inputMaterial, "White Sorted Regrind")).canonicalName, quantityKg: baseInputKg },
        { material: "Virgin PPCP", quantityKg: num(row.virginMaterialKg) },
        { material: "Masterbatch", quantityKg: num(row.masterBatchKg) },
        { material: "Battery PPCP", quantityKg: num(row.batteryFlakesKg) },
        { material: "Rework Material", quantityKg: num(row.reworkGranulesKg) },
        { material: "Lumps", quantityKg: num(row.lumpsReusedKg) },
        { material: "Purging", quantityKg: num(row.purgingReusedKg) },
        { material: "Anti Oxidant", quantityKg: num(row.antiOxidantKg) },
      ],
      outputs: [
        { material: grade, quantityKg: num(row.fgOutputKg), outputType: "GOOD" },
        { material: "Lumps", quantityKg: num(row.lumpsKg), outputType: "REWORK" },
        { material: "Purging", quantityKg: num(row.purgingKg), outputType: "REWORK" },
        { material: "Dust", quantityKg: num(row.dustKg), outputType: "WASTE" },
        { material: "Extrusion Waste", quantityKg: num(row.microPlasticKg || row.rejectKg || row.meshRejectKg || row.meshRejectionKg), outputType: "WASTE" },
        { material: "Rework Material", quantityKg: num(row.shadeVariationKg), outputType: "REWORK" },
        { material: "Extrusion Waste", quantityKg: num(row.vacuumRejectKg) + num(row.floorSpillageKg), outputType: "WASTE" },
      ],
    });

    if (result.skipped) summary.rowsSkippedAlreadyMigrated += 1;
    if (result.migrated) {
      summary.rowsMigrated += 1;
      summary.ledgerMovementsCreated += result.ledgerMovementsCreated;
      summary.migrated.push({ legacySourceId: legacyId, runId: result.runId, ...result });
    }
    if (!baseInputKg) {
      summary.rowsFlaggedForReview += 1;
      summary.warnings.push({ legacySourceId: legacyId, reason: "Extrusion batch has no input weight" });
    }
  });

  return output(summary);
}

function migrateLegacyInventory(data = {}) {
  resetMigrationCaches_();
  const periodMonth = migrationMonth_(data);
  const summary = migrationSummary_("migrateLegacyInventory", periodMonth);
  const repairedDispatchGrades = repairMigratedDispatchLedgerGrades_();
  const dispatches = getRowsAsObjects("Dispatches").filter((row) => !isDeleted_(row) && isMigrationPeriod_(row, periodMonth));
  summary.legacyRowsRead = dispatches.length;
  if (repairedDispatchGrades) {
    summary.warnings.push({
      reason: "Repaired migrated dispatch ledger grade names to E1-E5",
      rowsRepaired: repairedDispatchGrades,
    });
  }

  dispatches.forEach((row, index) => {
    const legacyId = String(row.dispatchId || `DISP-${index + 1}`);
    const grade = normalizeDispatchGrade_(row.grade || row.productionGrade);
    const quantityKg = num(row.quantityKg);

    if (!quantityKg) {
      summary.rowsFlaggedForReview += 1;
      summary.warnings.push({ legacySourceId: legacyId, reason: "Dispatch has no quantity" });
      return;
    }

    if (appendMigrationLedger_({
      date: row.date,
      module: "Manufacturing Cutover",
      movementType: "FG_DISPATCH_OUT",
      itemType: "FG",
      itemName: grade,
      sourceRef: legacyId,
      targetRef: row.invoiceNo || "",
      qtyIn: 0,
      qtyOut: quantityKg,
      unit: "Kg",
      remarks: `Dispatch migrated for ${row.customerName || "customer"}`,
      createdBy: row.createdBy || "Legacy Migration",
    }, "Dispatches", legacyId)) {
      summary.rowsMigrated += 1;
      summary.ledgerMovementsCreated += 1;
      summary.migrated.push({ legacySourceId: legacyId, grade, quantityKg });
    } else {
      summary.rowsSkippedAlreadyMigrated += 1;
    }
  });

  return output(summary);
}

function validateManufacturingCutover(data = {}) {
  const periodMonth = migrationMonth_(data);
  const ledgerRows = getRowsAsObjects("Inventory_Ledger").filter((row) =>
    !isDeleted_(row) &&
    isMigrationPeriod_(row, periodMonth) &&
    String(row.migrationId || "") === MANUFACTURING_MIGRATION_ID
  );
  const byMaterial = {};
  const totals = {
    receivingKg: 0,
    productionConsumptionKg: 0,
    productionOutputKg: 0,
    dispatchKg: 0,
    closingInventoryKg: 0,
  };

  ledgerRows.forEach((row) => {
    const itemName = materialName_(row.itemName, "Unknown Material");
    if (!byMaterial[itemName]) {
      byMaterial[itemName] = {
        material: itemName,
        category: row.itemType || materialCategory_(itemName),
        openingKg: 0,
        receivingKg: 0,
        productionConsumptionKg: 0,
        productionOutputKg: 0,
        dispatchKg: 0,
        netMovementKg: 0,
        closingInventoryKg: 0,
        status: "OK",
      };
    }

    const qtyIn = num(row.qtyIn);
    const qtyOut = num(row.qtyOut);
    const movementType = String(row.movementType || "").toUpperCase();
    const bucket = byMaterial[itemName];

    if (movementType === "MATERIAL_RECEIVING_IN") {
      bucket.receivingKg += qtyIn;
      totals.receivingKg += qtyIn;
    } else if (movementType.indexOf("TRANSFORMATION_INPUT") !== -1 || movementType.indexOf("TRANSFORMATION_CONSUME") !== -1) {
      bucket.productionConsumptionKg += qtyOut;
      totals.productionConsumptionKg += qtyOut;
    } else if (movementType.indexOf("TRANSFORMATION_OUTPUT") !== -1) {
      bucket.productionOutputKg += qtyIn;
      totals.productionOutputKg += qtyIn;
    } else if (movementType.indexOf("DISPATCH") !== -1) {
      bucket.dispatchKg += qtyOut;
      totals.dispatchKg += qtyOut;
    }

    bucket.netMovementKg += qtyIn - qtyOut;
    bucket.closingInventoryKg = round2(bucket.openingKg + bucket.receivingKg - bucket.productionConsumptionKg + bucket.productionOutputKg - bucket.dispatchKg);
  });

  const materials = Object.keys(byMaterial)
    .sort()
    .map((name) => {
      const row = byMaterial[name];
      row.netMovementKg = round2(row.netMovementKg);
      row.closingInventoryKg = round2(row.closingInventoryKg);
      if (Math.abs(row.netMovementKg - row.closingInventoryKg) > 0.01) {
        row.status = "MISMATCH";
      }
      return row;
    });

  totals.closingInventoryKg = round2(materials.reduce((s, row) => s + row.closingInventoryKg, 0));
  const mismatches = materials.filter((row) => row.status !== "OK");
  const readiness = mismatches.length === 0 ? "READY_FOR_LEGACY_CODE_REMOVAL" : "RECONCILIATION_REQUIRED";

  return output({
    ok: true,
    functionName: "validateManufacturingCutover",
    periodMonth,
    formula: "Opening RM + Receiving - Production Consumption + Production Output - Dispatch = Closing Inventory",
    totals,
    materials,
    mismatches,
    reconciliationPercent: materials.length ? round2(((materials.length - mismatches.length) / materials.length) * 100) : 0,
    readiness,
    note: readiness === "READY_FOR_LEGACY_CODE_REMOVAL"
      ? "Ledger formula reconciles by material for the selected period."
      : "Do not remove legacy backend/pages until mismatches are resolved.",
  });
}
// RM

function normalizeRmMaterialForReceiving_(value, strict) {
  if (!String(value || "").trim()) return "";
  if (strict) return assertProductionMaterialAllowed_(value, "RM_INWARD", "INPUT", "RM inward material");

  const normalized = normalizeProductionMaterialName_(value);
  return normalized.known ? normalized.canonicalName : String(value || "").trim();
}

function materialMasterDefaultRows_() {
  return [
    ["WHITE_FLAKES", "White Flakes", "RM"],
    ["WHITE_PPCP_BUCKETS", "White PPCP Buckets", "RM"],
    ["BATTERY_SCRAP", "Battery Scrap", "RM"],
    ["BATTERY_REGRIND", "Battery Regrind", "RM"],
    ["JARS", "Jars", "RM"],
    ["LIDS", "Lids", "RM"],
    ["PP_MIXED", "PP Mixed", "RM"],
    ["WHITE_REGRIND_UNWASHED", "White Regrind (Unwashed)", "WIP"],
    ["WHITE_REGRIND_WASHED", "White Regrind (Washed)", "WIP"],
    ["WASHED_WHITE_FLAKES", "Washed White Flakes", "WIP"],
    ["WASHED_MIXED", "Washed Mixed", "WIP"],
    ["WHITE_SORTED", "White Sorted", "WIP"],
    ["WHITE_SORTED_REGRIND", "White Sorted Regrind", "WIP"],
    ["COMMODITY", "Commodity", "WIP"],
    ["MIXED_SORTED", "Mixed Sorted", "WIP"],
    ["REWORK_MATERIAL", "Rework Material", "REWORK"],
    ["E1", "E1", "FG"],
    ["E2", "E2", "FG"],
    ["E3", "E3", "FG"],
    ["E4", "E4", "FG"],
    ["E5", "E5", "FG"],
    ["VIRGIN_PP", "Virgin PP", "ADDITIVE"],
    ["VIRGIN_PPCP", "Virgin PPCP", "ADDITIVE"],
    ["BATTERY_PPCP", "Battery PPCP", "RM"],
    ["MASTERBATCH", "Masterbatch", "ADDITIVE"],
    ["ANTIOXIDANT", "Antioxidant", "ADDITIVE"],
    ["SINK_MATERIAL", "Sink Material", "WASTE"],
    ["MICRO_PLASTIC_REJECT", "Micro Plastic Reject", "WASTE"],
    ["WRAPPER_REJECT", "Wrapper Reject", "WASTE"],
    ["RAFFIA_REJECT", "Raffia Reject", "WASTE"],
    ["COLOR_REJECT", "Color Reject", "WASTE"],
    ["COLOUR_REJECT", "Colour Reject", "WASTE"],
    ["DUST", "Dust", "WASTE"],
    ["METAL_REJECT", "Metal Reject", "WASTE"],
    ["RUBBER_REJECT", "Rubber Reject", "WASTE"],
    ["EXTRUSION_WASTE", "Extrusion Waste", "WASTE"],
    ["LUMPS", "Lumps", "WASTE"],
    ["PURGING_WASTE", "Purging Waste", "WASTE"],
  ];
}

function parseRmMaterialLines_(value, fallbackMaterial, fallbackQty, options) {
  const opts = options || {};
  let rows = value;

  if (typeof value === "string" && value.trim()) {
    try {
      rows = JSON.parse(value);
    } catch (err) {
      rows = [];
    }
  }

  if (!Array.isArray(rows)) rows = [];

  const parsed = rows
    .map(function(row) {
      return {
        material: normalizeRmMaterialForReceiving_(row.material || row.materialName, opts.strict),
        quantityKg: num(row.quantityKg || row.qtyKg || row.quantity || row.netWeight),
        remarks: row.remarks || "",
        rate: num(row.rate || row.ratePerKg),
        amount: num(row.amount) || num(row.quantityKg || row.qtyKg || row.quantity || row.netWeight) * num(row.rate || row.ratePerKg),
      };
    })
    .filter(function(row) {
      return row.material && row.quantityKg > 0;
    });

  if (!parsed.length && fallbackMaterial && num(fallbackQty) > 0) {
    parsed.push({
      material: normalizeRmMaterialForReceiving_(fallbackMaterial, opts.strict),
      quantityKg: num(fallbackQty),
      remarks: "",
      rate: 0,
      amount: 0,
    });
  }

  return parsed;
}

function materialLinesSummary_(lines) {
  return (lines || [])
    .map(function(line) {
      return line.material + ": " + line.quantityKg + " Kg";
    })
    .join(" + ");
}

function generateRmReceivingRef_(dateValue, supplier) {
  const date = normalizeDateOnly_(dateValue || todayYmd());
  const compactDate = String(date).replace(/-/g, "");
  const supplierCode = cleanCodePart_(supplier, "SUP");
  const prefix = "MR-" + compactDate + "-" + supplierCode + "-";
  const rows = getRowsAsObjects("RM_Inward");
  const sequence =
    rows.filter(function(row) {
      return String(row.inwardId || "").indexOf(prefix) === 0;
    }).length + 1;

  return prefix + String(sequence).padStart(3, "0");
}

function postApprovedRmInventory_(inwardId, data = {}, dateValue) {
  const existing = getRowsAsObjects("Inventory_Ledger").find(function(row) {
    return (
      String(row.module || "").toUpperCase() === "RM_INWARD" &&
      String(row.targetRef || "") === String(inwardId || "") &&
      String(row.status || "ACTIVE").toUpperCase() !== "DELETED"
    );
  });

  if (existing) {
    return { posted: false, reason: "ALREADY_POSTED", ledgerId: existing.ledgerId || "" };
  }

  const lines = parseRmMaterialLines_(data.materialLines, data.material, data.netWeight || data.quantityKg);
  let posted = 0;
  const warnings = [];

  lines.forEach(function(line) {
    try {
      addInventoryLedger({
        date: dateValue || normalizeDateOnly_(data.date || todayYmd()),
        module: "RM_INWARD",
        movementType: "IN",
        itemType: "RM",
        itemName: line.material,
        sourceRef: data.supplier || "",
        targetRef: inwardId,
        qtyIn: line.quantityKg,
        qtyOut: 0,
        unit: "Kg",
        remarks: line.remarks || data.remarks || "",
        createdBy: data.createdBy || "Quality",
      });
      posted += 1;
    } catch (err) {
      warnings.push(line.material + ": " + err.message);
    }
  });

  return { posted: posted > 0, movements: posted, warnings };
}

function addRM(data = {}) {
  const sh = getSheet("RM_Inward");

  ensureHeaders_("RM_Inward", [
    "inwardId",
    "date",
    "supplier",
    "vehicleNo",
    "poNumber",
    "supplierGrnNumber",
    "supplierInvoiceNumber",
    "invoiceDate",
    "material",
    "materialLines",
    "materialSummary",
    "quantityKg",
    "color",
    "grossWeight",
    "tareWeight",
    "netWeight",
    "sampleRequired",
    "qcStatus",
    "moisture",
    "contamination",
    "estimatedRecovery",
    "ratePerKg",
    "remarks",
    "status",
    "createdBy",
    "createdAt",
    "transportPaidBy",
    "transportCost",
    "transportRemarks",
    "taxableValue",
    "gstPercent",
    "gstAmount",
    "invoiceTotal",
    "grandTotal",
    "freight",
    "transportCharges",
    "otherCharges",
    "roundOff",
    "paymentStatus",
    "advancePaid",
    "outstandingAmount",
    "commercialRemarks",
  ]);

  const date = normalizeDateOnly_(data.date || todayYmd());
  const inwardId = data.inwardId || data.batchId || generateRmReceivingRef_(date, data.supplier);
  const lines = parseRmMaterialLines_(data.materialLines, data.material, data.netWeight || data.quantityKg, { strict: true });
  const totalQty = lines.reduce(function(sum, line) { return sum + num(line.quantityKg); }, 0);
  const taxableValue = num(data.taxableValue) || lines.reduce(function(sum, line) { return sum + num(line.amount); }, 0);
  const gstPercent = num(data.gstPercent);
  const gstAmount = num(data.gstAmount) || (taxableValue > 0 && gstPercent > 0 ? taxableValue * gstPercent / 100 : 0);
  const otherCharges = num(data.otherCharges || data.transportCharges);
  const grandTotal =
    num(data.grandTotal || data.invoiceTotal) ||
    taxableValue + gstAmount + num(data.freight) + otherCharges + num(data.roundOff);
  const outstandingAmount = Math.max(grandTotal - num(data.advancePaid), 0);
  validateOperationalWrite_({ ...data, date });

  appendObjectRow(sh, {
    inwardId,
    date,
    supplier: data.supplier || "",
    vehicleNo: data.vehicleNo || "",
    poNumber: data.poNumber || "",
    supplierGrnNumber: data.supplierGrnNumber || "",
    supplierInvoiceNumber: data.supplierInvoiceNumber || "",
    invoiceDate: data.invoiceDate ? normalizeDateOnly_(data.invoiceDate) : "",
    material: data.material || (lines[0] && lines[0].material) || "",
    materialLines: JSON.stringify(lines),
    materialSummary: materialLinesSummary_(lines),
    quantityKg: totalQty,
    color: data.color || "",
    grossWeight: num(data.grossWeight),
    tareWeight: num(data.tareWeight),
    netWeight: totalQty || num(data.netWeight),
    sampleRequired: data.sampleRequired || "YES",
    qcStatus: data.qcStatus || "PENDING",

    transportPaidBy: data.transportPaidBy || "SUPPLIER",
    transportCost: num(data.transportCost),
    transportRemarks: data.transportRemarks || "",
    taxableValue,
    gstPercent,
    gstAmount,
    invoiceTotal: grandTotal,
    grandTotal,
    freight: num(data.freight),
    transportCharges: num(data.transportCharges),
    otherCharges,
    roundOff: num(data.roundOff),
    paymentStatus: data.paymentStatus || "Unpaid",
    advancePaid: num(data.advancePaid),
    outstandingAmount,
    commercialRemarks: data.commercialRemarks || "",

    moisture: data.moisture || "",
    contamination: data.contamination || "",
    estimatedRecovery: data.estimatedRecovery || "",
    ratePerKg: totalQty > 0 ? taxableValue / totalQty : num(data.ratePerKg),
    remarks: data.remarks || "",
    status: data.status || "QC_PENDING",
    createdBy: data.createdBy || "System",
    createdAt: new Date(),
  });

  let ledger = { posted: false, reason: "QC_PENDING" };
  if (String(data.qcStatus || "").toUpperCase() === "APPROVED") {
    ledger = postApprovedRmInventory_(inwardId, data, date);
  }
  return output({ ok: true, inwardId, ledger });
}

function updateRM(data = {}) {
  const idValue = data.inwardId || data.batchId;
  validateOperationalWrite_(
    data,
    getRowById_("RM_Inward", "inwardId", idValue)
  );

  ensureHeaders_("RM_Inward", [
    "status",
    "sampleRequired",
    "qcStatus",
    "poNumber",
    "supplierGrnNumber",
    "supplierInvoiceNumber",
    "invoiceDate",
    "materialLines",
    "materialSummary",
    "quantityKg",
    "transportPaidBy",
    "transportCost",
    "transportRemarks",
    "taxableValue",
    "gstPercent",
    "gstAmount",
    "invoiceTotal",
    "grandTotal",
    "freight",
    "transportCharges",
    "otherCharges",
    "roundOff",
    "paymentStatus",
    "advancePaid",
    "outstandingAmount",
    "commercialRemarks",
  ]);

  const lines = parseRmMaterialLines_(data.materialLines, data.material, data.netWeight || data.quantityKg, { strict: true });
  const totalQty = lines.reduce(function(sum, line) { return sum + num(line.quantityKg); }, 0);
  const taxableValue = num(data.taxableValue) || lines.reduce(function(sum, line) { return sum + num(line.amount); }, 0);
  const gstPercent = num(data.gstPercent);
  const gstAmount = num(data.gstAmount) || (taxableValue > 0 && gstPercent > 0 ? taxableValue * gstPercent / 100 : 0);
  const otherCharges = num(data.otherCharges || data.transportCharges);
  const grandTotal =
    num(data.grandTotal || data.invoiceTotal) ||
    taxableValue + gstAmount + num(data.freight) + otherCharges + num(data.roundOff);
  const outstandingAmount = Math.max(grandTotal - num(data.advancePaid), 0);

  return updateById("RM_Inward", "inwardId", idValue, {
    date: normalizeDateOnly_(data.date || todayYmd()),
    supplier: data.supplier || "",
    vehicleNo: data.vehicleNo || "",
    poNumber: data.poNumber || "",
    supplierGrnNumber: data.supplierGrnNumber || "",
    supplierInvoiceNumber: data.supplierInvoiceNumber || "",
    invoiceDate: data.invoiceDate ? normalizeDateOnly_(data.invoiceDate) : "",
    material: data.material || (lines[0] && lines[0].material) || "",
    materialLines: lines.length ? JSON.stringify(lines) : data.materialLines || "",
    materialSummary: lines.length ? materialLinesSummary_(lines) : data.materialSummary || data.material || "",
    quantityKg: totalQty || num(data.quantityKg),
    color: data.color || "",
    grossWeight: num(data.grossWeight),
    tareWeight: num(data.tareWeight),
    netWeight: totalQty || num(data.netWeight),
    sampleRequired: data.sampleRequired || "YES",
    qcStatus: data.qcStatus || "",

    transportPaidBy: data.transportPaidBy || "SUPPLIER",
    transportCost: num(data.transportCost),
    transportRemarks: data.transportRemarks || "",
    taxableValue,
    gstPercent,
    gstAmount,
    invoiceTotal: grandTotal,
    grandTotal,
    freight: num(data.freight),
    transportCharges: num(data.transportCharges),
    otherCharges,
    roundOff: num(data.roundOff),
    paymentStatus: data.paymentStatus || "Unpaid",
    advancePaid: num(data.advancePaid),
    outstandingAmount,
    commercialRemarks: data.commercialRemarks || "",

    remarks: data.remarks || "",
    status: data.status || "",
  });
}

// SUPPLIERS

function addSupplier(data = {}) {
  const sh = getSheet("Suppliers");

  ensureHeaders_("Suppliers", [
    "supplierId",
    "supplierName",
    "name",
    "supplierType",
    "city",
    "state",
    "address",
    "contactPerson",
    "phone",
    "email",
    "gstNo",
    "panNo",
    "msmeNo",
    "bankName",
    "accountName",
    "accountNumber",
    "ifscCode",
    "materialType",
    "qualityRating",
    "recoveryPercent",
    "contaminationRisk",
    "paymentTerms",
    "creditDays",
    "isPreferred",
    "isActive",
    "remarks",
    "createdAt",
  ]);

  const supplierId = data.supplierId || generateBatchId("SUP");
  const supplierName = data.supplierName || data.name || "";

  appendObjectRow(sh, {
    supplierId,
    supplierName,
    name: supplierName,
    supplierType: data.supplierType || "",
    city: data.city || "",
    state: data.state || "",
    address: data.address || "",
    contactPerson: data.contactPerson || "",
    phone: data.phone || "",
    email: data.email || "",
    gstNo: data.gstNo || "",
    panNo: data.panNo || "",
    msmeNo: data.msmeNo || "",
    bankName: data.bankName || "",
    accountName: data.accountName || "",
    accountNumber: data.accountNumber || "",
    ifscCode: data.ifscCode || "",
    materialType: data.materialType || "",
    qualityRating: data.qualityRating || "",
    recoveryPercent: num(data.recoveryPercent),
    contaminationRisk: data.contaminationRisk || "",
    paymentTerms: data.paymentTerms || "",
    creditDays: num(data.creditDays),
    isPreferred: data.isPreferred || "NO",
    isActive: data.isActive || "TRUE",
    remarks: data.remarks || "",
    createdAt: new Date(),
  });

  return output({
    ok: true,
    supplierId,
  });
}

function updateSupplier(data = {}) {
  const supplierName = data.supplierName || data.name || "";

  return updateById("Suppliers", "supplierId", data.supplierId, {
    supplierName,
    name: supplierName,
    supplierType: data.supplierType || "",
    city: data.city || "",
    state: data.state || "",
    address: data.address || "",
    contactPerson: data.contactPerson || "",
    phone: data.phone || "",
    email: data.email || "",
    gstNo: data.gstNo || "",
    panNo: data.panNo || "",
    msmeNo: data.msmeNo || "",
    bankName: data.bankName || "",
    accountName: data.accountName || "",
    accountNumber: data.accountNumber || "",
    ifscCode: data.ifscCode || "",
    materialType: data.materialType || "",
    qualityRating: data.qualityRating || "",
    recoveryPercent: num(data.recoveryPercent),
    contaminationRisk: data.contaminationRisk || "",
    paymentTerms: data.paymentTerms || "",
    creditDays: num(data.creditDays),
    isPreferred: data.isPreferred || "NO",
    isActive: data.isActive || "TRUE",
    remarks: data.remarks || "",
  });
}

// FG RATES

function addFgRate(data = {}) {
  const sh = getSheet("FG_Rates");

  ensureHeaders_("FG_Rates", [
    "rateId",
    "date",
    "grade",
    "customerName",
    "ratePerKg",
    "freightPerKg",
    "remarks",
    "status",
    "createdBy",
    "createdAt",
  ]);

  const rateId = data.rateId || generateBatchId("FGR");
  const date = normalizeDateOnly_(data.date || todayYmd());
  validateOperationalWrite_({ ...data, date });

  appendObjectRow(sh, {
    rateId,
    date,
    grade: data.grade || "",
    customerName: data.customerName || "",
    ratePerKg: num(data.ratePerKg),
    freightPerKg: num(data.freightPerKg),
    remarks: data.remarks || "",
    status: data.status || "ACTIVE",
    createdBy: data.createdBy || "System",
    createdAt: new Date(),
  });

  return output({ ok: true, rateId });
}

function updateFgRate(data = {}) {
  validateOperationalWrite_(
    data,
    getRowById_("FG_Rates", "rateId", data.rateId)
  );

  return updateById("FG_Rates", "rateId", data.rateId, {
    date: normalizeDateOnly_(data.date || todayYmd()),
    grade: data.grade || "",
    customerName: data.customerName || "",
    ratePerKg: num(data.ratePerKg),
    freightPerKg: num(data.freightPerKg),
    remarks: data.remarks || "",
    status: data.status || "",
  });
}

// FACTORY EXPENSES

function addFactoryExpense(data = {}) {
  const sh = getSheet("Factory_Expenses");

  ensureHeaders_("Factory_Expenses", [
    "expenseId",
    "date",
    "periodMonth",
    "category",
    "description",
    "amount",
    "paidBy",
    "remarks",
    "status",
    "createdBy",
    "createdAt",
  ]);

  const expenseId = data.expenseId || generateBatchId("EXP");
  const date = normalizeDateOnly_(data.date || todayYmd());
  const periodMonth = getPeriodMonthFromPayload_(data, date);
  validateOperationalWrite_({ ...data, date, periodMonth });

  appendObjectRow(sh, {
    expenseId,
    date,
    periodMonth,
    month: data.month || periodMonth.slice(5, 7),
    year: data.year || periodMonth.slice(0, 4),
    category: data.category || "",
    description: data.description || "",
    amount: num(data.amount),
    paidBy: data.paidBy || "",
    remarks: data.remarks || "",
    status: data.status || "ACTIVE",
    createdBy: data.createdBy || "System",
    createdAt: new Date(),
  });

  return output({ ok: true, expenseId });
}
function addFactoryCostMaster(data = {}) {
  const sh = getSheet("Factory_Cost_Master");

  ensureHeaders_("Factory_Cost_Master", [
    "costId",
    "periodMonth",
    "costHead",
    "amount",
    "allocationType",
    "remarks",
    "status",
    "createdBy",
    "createdAt",
  ]);

  const costId = data.costId || generateBatchId("FCM");
  validateOperationalWrite_(data);

  appendObjectRow(sh, {
    costId,
    periodMonth: data.periodMonth || getPeriodMonth(todayYmd()),
    costHead: data.costHead || "",
    amount: num(data.amount),
    allocationType: data.allocationType || "FIXED",
    remarks: data.remarks || "",
    status: data.status || "ACTIVE",
    createdBy: data.createdBy || "System",
    createdAt: new Date(),
  });

  return output({ ok: true, costId });
}

function updateFactoryCostMaster(data = {}) {
  validateOperationalWrite_(
    data,
    getRowById_("Factory_Cost_Master", "costId", data.costId)
  );

  return updateById("Factory_Cost_Master", "costId", data.costId, {
    periodMonth: data.periodMonth || "",
    costHead: data.costHead || "",
    amount: num(data.amount),
    allocationType: data.allocationType || "FIXED",
    remarks: data.remarks || "",
    status: data.status || "",
  });
}
function updateFactoryExpense(data = {}) {
  const date = normalizeDateOnly_(data.date || todayYmd());
  const periodMonth = getPeriodMonthFromPayload_(data, date);
  validateOperationalWrite_(
    { ...data, date, periodMonth },
    getRowById_("Factory_Expenses", "expenseId", data.expenseId)
  );

  return updateById("Factory_Expenses", "expenseId", data.expenseId, {
    date,
    periodMonth,
    month: data.month || periodMonth.slice(5, 7),
    year: data.year || periodMonth.slice(0, 4),
    category: data.category || "",
    description: data.description || data.itemName || "",
    amount: num(data.amount),
    paidBy: data.paidBy || "",
    remarks: data.remarks || "",
    status: data.status || "ACTIVE",
  });
}

function deleteFactoryExpense(data = {}) {
  if (!data.expenseId) {
    return output({ ok: false, error: "Missing expenseId" });
  }

  validateOperationalWrite_(
    data,
    getRowById_("Factory_Expenses", "expenseId", data.expenseId)
  );

  ensureHeaders_("Factory_Expenses", ["status", "deletedBy", "deletedAt"]);

  return updateById("Factory_Expenses", "expenseId", data.expenseId, {
    status: "DELETED",
    deletedBy: data.deletedBy || data.updatedBy || data.createdBy || "System",
    deletedAt: new Date(),
  });
}

function migrateFactoryExpensePeriods() {
  const sh = getSheet("Factory_Expenses");
  const values = sh.getDataRange().getValues();

  if (values.length < 2) {
    const emptyResult = {
      rowsChanged: 0,
      changes: [],
    };

    Logger.log(JSON.stringify(emptyResult, null, 2));
    return emptyResult;
  }

  const headers = values[0].map((h) => String(h).trim());
  const periodMonthIndex = headers.indexOf("periodMonth");

  if (periodMonthIndex === -1) {
    throw new Error("Factory_Expenses periodMonth column not found");
  }

  const amountIndex = headers.indexOf("amount");
  const descriptionIndex = headers.indexOf("description");
  const remarksIndex = headers.indexOf("remarks");
  const searchableIndexes = headers
    .map((header, index) => ({ header: header.toLowerCase(), index }))
    .filter(
      ({ header }) =>
        header === "remarks" ||
        header === "invoice" ||
        header === "description" ||
        header === "bill" ||
        header === "billtext" ||
        header.indexOf("invoice") !== -1 ||
        header.indexOf("bill") !== -1
    )
    .map(({ index }) => index);

  const newPeriodMonth = "2026-06-01";
  const changes = [];

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const searchText = searchableIndexes
      .map((index) => row[index])
      .filter((value) => value !== "" && value !== null && value !== undefined)
      .join(" ")
      .toLowerCase();

    const shouldMoveToJune =
      /\bjune[\s_]*2026\b/.test(searchText) ||
      searchText.indexOf("power bill june") !== -1 ||
      searchText.indexOf("security bill june") !== -1;

    if (!shouldMoveToJune) continue;

    const oldPeriodMonth = row[periodMonthIndex];

    if (String(oldPeriodMonth || "") === newPeriodMonth) continue;

    sh.getRange(i + 1, periodMonthIndex + 1).setValue(newPeriodMonth);

    changes.push({
      rowNumber: i + 1,
      oldPeriodMonth,
      newPeriodMonth,
      expenseAmount: amountIndex === -1 ? "" : row[amountIndex],
      expenseDescription:
        descriptionIndex !== -1 && row[descriptionIndex]
          ? row[descriptionIndex]
          : remarksIndex === -1
            ? ""
            : row[remarksIndex],
    });
  }

  const result = {
    rowsChanged: changes.length,
    changes,
  };

  Logger.log(JSON.stringify(result, null, 2));
  return result;
}
// =====================================================
// WASH BATCHES
// =====================================================

function parseManufacturingCompositionRows_(value, materialKeys, qtyKeys) {
  if (!value) return [];

  let rows = value;

  if (typeof value === "string") {
    try {
      rows = JSON.parse(value);
    } catch (err) {
      return [];
    }
  }

  if (!Array.isArray(rows)) return [];

  return rows
    .map(function(row) {
      const material = materialKeys
        .map(function(key) { return row[key]; })
        .find(function(v) { return String(v || "").trim(); });

      const qty = qtyKeys
        .map(function(key) { return row[key]; })
        .find(function(v) { return num(v) > 0; });

      return {
        material: String(material || "").trim(),
        qtyKg: num(qty)
      };
    })
    .filter(function(row) {
      return row.material && row.qtyKg > 0;
    });
}

function postManufacturingCompositionLedger_(options) {
  const inputs = parseManufacturingCompositionRows_(
    options.inputs,
    ["material", "materialType", "sourceType", "inputBucket"],
    ["qtyKg", "quantityKg", "consumeQty", "quantity"]
  );

  const outputs = parseManufacturingCompositionRows_(
    options.outputs,
    ["material", "materialType", "outputBucket", "outputMaterial"],
    ["qtyKg", "quantityKg", "outputQty", "quantity"]
  );

  const result = {
    inputMovements: 0,
    outputMovements: 0,
    warnings: []
  };

  inputs.forEach(function(row) {
    try {
      addInventoryLedger({
        date: options.date,
        module: options.module,
        movementType: "OUT",
        itemName: row.material,
        sourceRef: options.sourceRef,
        targetRef: options.targetRef,
        qtyIn: 0,
        qtyOut: row.qtyKg,
        unit: "Kg",
        remarks: options.module + " input",
        createdBy: options.createdBy || "System"
      });
      result.inputMovements += 1;
    } catch (err) {
      result.warnings.push("Input " + row.material + ": " + err.message);
    }
  });

  outputs.forEach(function(row) {
    try {
      addInventoryLedger({
        date: options.date,
        module: options.module,
        movementType: "IN",
        itemName: row.material,
        sourceRef: options.sourceRef,
        targetRef: options.targetRef,
        qtyIn: row.qtyKg,
        qtyOut: 0,
        unit: "Kg",
        remarks: options.module + " output",
        createdBy: options.createdBy || "System"
      });
      result.outputMovements += 1;
    } catch (err) {
      result.warnings.push("Output " + row.material + ": " + err.message);
    }
  });

  return result;
}

const GRINDER_OUTPUT_MATERIAL = "White Regrind (Unwashed)";

function normalizeGrinderOutputComposition_(data = {}) {
  let rows = [];

  if (data.outputComposition) {
    try {
      const parsed = typeof data.outputComposition === "string"
        ? JSON.parse(data.outputComposition)
        : data.outputComposition;
      rows = Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      rows = [];
    }
  }

  rows = rows
    .map(function(row) {
      const material = String(row.material || row.materialType || row.outputMaterial || "").trim();
      const qtyKg = num(row.qtyKg || row.quantityKg || row.outputQty || row.quantity);
      if (!material || qtyKg <= 0) return null;

      const upper = material.toUpperCase();
      if (/^E[1-5]$/.test(upper)) {
        throw new Error("Grinder cannot create finished goods grade " + material + ". Use " + GRINDER_OUTPUT_MATERIAL + ".");
      }

      return {
        material: upper.indexOf("REGRIND") !== -1 ? GRINDER_OUTPUT_MATERIAL : material,
        qtyKg: qtyKg,
        remarks: row.remarks || "",
      };
    })
    .filter(function(row) { return row; });

  const hasRegrind = rows.some(function(row) {
    return String(row.material || "").toUpperCase() === GRINDER_OUTPUT_MATERIAL.toUpperCase();
  });

  if (!hasRegrind && num(data.regrindOutputKg) > 0) {
    rows.unshift({
      material: GRINDER_OUTPUT_MATERIAL,
      qtyKg: num(data.regrindOutputKg),
      remarks: "",
    });
  }

  const hasDust = rows.some(function(row) {
    return String(row.material || "").toUpperCase().indexOf("DUST") !== -1;
  });

  if (!hasDust && num(data.dustKg) > 0) {
    rows.push({
      material: "Dust",
      qtyKg: num(data.dustKg),
      remarks: "",
    });
  }

  const hasMetalReject = rows.some(function(row) {
    return String(row.material || "").toUpperCase().indexOf("METAL") !== -1;
  });

  if (!hasMetalReject && num(data.metalRejectKg) > 0) {
    rows.push({
      material: "Metal Reject",
      qtyKg: num(data.metalRejectKg),
      remarks: "",
    });
  }

  if (!rows.length) return "";
  return JSON.stringify(rows);
}

function grinderOutputQtyFromComposition_(outputComposition) {
  return parseManufacturingCompositionRows_(
    outputComposition,
    ["material", "materialType", "outputMaterial"],
    ["qtyKg", "quantityKg", "outputQty", "quantity"]
  )
    .filter(function(row) {
      return String(row.material || "").toUpperCase() === GRINDER_OUTPUT_MATERIAL.toUpperCase() ||
        String(row.material || "").toUpperCase().indexOf("REGRIND") !== -1;
    })
    .reduce(function(sum, row) { return sum + num(row.qtyKg); }, 0);
}

function addGrinderBatch(data = {}) {
  validateOperationalWrite_(data);
  data = normalizeProductionBatchPayload_(data, "GRINDER");

  const sh = getSheet("Grinder_Batches");
  ensureHeaders_("Grinder_Batches", [
    "grinderBatchId",
    "batchId",
    "date",
    "periodMonth",
    "shift",
    "machine",
    "entryMode",
    "inputMaterial",
    "inputWeightKg",
    "feedComposition",
    "outputComposition",
    "regrindOutputKg",
    "dustKg",
    "metalRejectKg",
    "grinderVarianceKg",
    "recoveryPercent",
    "operatorName",
    "supervisorName",
    "machineRunningHours",
    "downtimeHours",
    "downtimeReason",
    "remarks",
    "status",
    "nextProcess",
    "linkedWashBatchId",
    "createdBy",
    "createdAt",
    "updatedAt",
  ]);

  const grinderBatchId = data.grinderBatchId || data.batchId || generateBatchId("GB");
  const date = normalizeDateOnly_(data.date || todayYmd());
  const outputComposition = normalizeGrinderOutputComposition_(data);
  const inputWeightKg = num(data.inputWeightKg);
  const regrindOutputKg = num(data.regrindOutputKg) || grinderOutputQtyFromComposition_(outputComposition);
  const dustKg = num(data.dustKg);
  const metalRejectKg = num(data.metalRejectKg);
  const totalOutputKg = regrindOutputKg + dustKg + metalRejectKg;
  const grinderVarianceKg =
    data.grinderVarianceKg !== undefined && data.grinderVarianceKg !== ""
      ? num(data.grinderVarianceKg)
      : inputWeightKg - totalOutputKg;
  const recoveryPercent =
    data.recoveryPercent !== undefined && data.recoveryPercent !== ""
      ? num(data.recoveryPercent)
      : inputWeightKg > 0
      ? round2((regrindOutputKg / inputWeightKg) * 100)
      : 0;

  if (inputWeightKg <= 0) {
    throw new Error("Grinder input weight is required.");
  }

  if (regrindOutputKg <= 0) {
    throw new Error("Grinder output must include " + GRINDER_OUTPUT_MATERIAL + ".");
  }

  appendObjectRow(sh, {
    grinderBatchId,
    batchId: grinderBatchId,
    date,
    periodMonth: data.periodMonth || getPeriodMonth(date),
    shift: data.shift || "",
    machine: data.machine || "",
    entryMode: data.entryMode || "DAILY",
    inputMaterial: data.inputMaterial || "",
    inputWeightKg,
    feedComposition: data.feedComposition || "",
    outputComposition,
    regrindOutputKg,
    dustKg,
    metalRejectKg,
    grinderVarianceKg,
    recoveryPercent,
    operatorName: data.operatorName || "",
    supervisorName: data.supervisorName || "",
    machineRunningHours: num(data.machineRunningHours),
    downtimeHours: num(data.downtimeHours),
    downtimeReason: data.downtimeReason || "",
    remarks: data.remarks || "",
    status: data.status || "READY_FOR_WASH",
    nextProcess: data.nextProcess || "Wash",
    linkedWashBatchId: data.linkedWashBatchId || "",
    createdBy: data.createdBy || "System",
    createdAt: new Date(),
    updatedAt: "",
  });

  const ledger = postManufacturingCompositionLedger_({
    date,
    module: "GRINDER",
    sourceRef: grinderBatchId,
    targetRef: grinderBatchId,
    inputs: data.feedComposition,
    outputs: outputComposition,
    createdBy: data.createdBy || "System",
  });

  return output({
    ok: true,
    grinderBatchId,
    batchId: grinderBatchId,
    outputMaterial: GRINDER_OUTPUT_MATERIAL,
    ledger,
  });
}

function updateGrinderBatch(data = {}) {
  const idValue = data.grinderBatchId || data.batchId;
  validateOperationalWrite_(
    data,
    getRowById_("Grinder_Batches", "grinderBatchId", idValue)
  );
  data = normalizeProductionBatchPayload_(data, "GRINDER");

  const date = normalizeDateOnly_(data.date || todayYmd());
  const outputComposition = normalizeGrinderOutputComposition_(data);
  const inputWeightKg = num(data.inputWeightKg);
  const regrindOutputKg = num(data.regrindOutputKg) || grinderOutputQtyFromComposition_(outputComposition);
  const dustKg = num(data.dustKg);
  const metalRejectKg = num(data.metalRejectKg);
  const totalOutputKg = regrindOutputKg + dustKg + metalRejectKg;

  return updateById(
    "Grinder_Batches",
    "grinderBatchId",
    idValue,
    {
      date,
      periodMonth: data.periodMonth || getPeriodMonth(date),
      shift: data.shift || "",
      machine: data.machine || "",
      entryMode: data.entryMode || "DAILY",
      inputMaterial: data.inputMaterial || "",
      inputWeightKg,
      feedComposition: data.feedComposition || "",
      outputComposition,
      regrindOutputKg,
      dustKg,
      metalRejectKg,
      grinderVarianceKg:
        data.grinderVarianceKg !== undefined && data.grinderVarianceKg !== ""
          ? num(data.grinderVarianceKg)
          : inputWeightKg - totalOutputKg,
      recoveryPercent:
        data.recoveryPercent !== undefined && data.recoveryPercent !== ""
          ? num(data.recoveryPercent)
          : inputWeightKg > 0
          ? round2((regrindOutputKg / inputWeightKg) * 100)
          : 0,
      operatorName: data.operatorName || "",
      supervisorName: data.supervisorName || "",
      machineRunningHours: num(data.machineRunningHours),
      downtimeHours: num(data.downtimeHours),
      downtimeReason: data.downtimeReason || "",
      remarks: data.remarks || "",
      status: data.status || "",
      nextProcess: data.nextProcess || "",
      linkedWashBatchId: data.linkedWashBatchId || "",
      updatedAt: new Date(),
    }
  );
}

function addWashBatch(data = {}) {

  validateOperationalWrite_(data);
  data = normalizeProductionBatchPayload_(data, "WASH");

  const sh = getSheet("Wash_Batches");

  ensureHeaders_("Wash_Batches",[
    "washBatchId","batchId","sourceRMId","sourceRmInwardId","supplier",
    "sourceGrinderBatchId",
    "availableRMQty","date","shift","machine","entryMode","periodMonth",
    "inputMaterial","inputWeightKg","feedComposition","outputComposition","washedOutputKg",
    "raffiaKg","wrappersKg","microPlasticKg","sinkMaterialKg",
    "ironScrapKg","otherColorKg","dustKg","sludgeKg",
    "washVarianceKg","estimatedRecoveryPercent","recoverySeverity",
    "operatorName","supervisorName","machineRunningHours",
    "downtimeHours","downtimeReason",
    "remarks","status","sortingRequired","nextProcess",
    "linkedSortingBatchId","linkedExtrusionBatchId",
    "createdBy","createdAt"
  ]);

  const washBatchId =
    data.washBatchId ||
    data.batchId ||
    generateBatchId("WB");

  const inputWeightKg = num(data.inputWeightKg);
  const washedOutputKg = num(data.washedOutputKg);

  const estimatedRecovery =
    inputWeightKg > 0
      ? round2((washedOutputKg / inputWeightKg) * 100)
      : 0;

  const sortingRequired =
    normalizeYesNo(data.sortingRequired,"YES");

  const nextProcess =
    sortingRequired === "YES"
      ? "Colour Sorting"
      : "Extrusion";

  const status =
    sortingRequired === "YES"
      ? "READY_FOR_SORTING"
      : "READY_FOR_EXTRUSION";

  appendObjectRow(sh,{
    washBatchId,
    batchId:washBatchId,

    sourceRMId:data.sourceRMId||"",
    sourceRmInwardId:data.sourceRmInwardId||"",
    sourceGrinderBatchId:data.sourceGrinderBatchId||"",
    supplier:data.supplier||"",
    availableRMQty:num(data.availableRMQty),

    date:normalizeDateOnly_(data.date||todayYmd()),
    shift:data.shift||"",
    machine:data.machine||"",
    entryMode:data.entryMode||"DAILY",
    periodMonth:data.periodMonth||getPeriodMonth(data.date),

    inputMaterial:data.inputMaterial||"",
    inputWeightKg,
    feedComposition:data.feedComposition||"",
    outputComposition:data.outputComposition||"",
    washedOutputKg,

    raffiaKg:num(data.raffiaKg),
    wrappersKg:num(data.wrappersKg),
    microPlasticKg:num(data.microPlasticKg),
    sinkMaterialKg:num(data.sinkMaterialKg),
    ironScrapKg:num(data.ironScrapKg),
    otherColorKg:num(data.otherColorKg),
    dustKg:num(data.dustKg),
    sludgeKg:num(data.sludgeKg),

    washVarianceKg:num(data.washVarianceKg),
    estimatedRecoveryPercent:estimatedRecovery,
    recoverySeverity:data.recoverySeverity||"",

    operatorName:data.operatorName||"",
    supervisorName:data.supervisorName||"",
    machineRunningHours:num(data.machineRunningHours),
    downtimeHours:num(data.downtimeHours),
    downtimeReason:data.downtimeReason||"",

    remarks:data.remarks||"",
    status,
    sortingRequired,
    nextProcess,

    linkedSortingBatchId:"",
    linkedExtrusionBatchId:"",

    createdBy:data.createdBy||"System",
    createdAt:new Date()
  });

  const ledger = postManufacturingCompositionLedger_({
    date: normalizeDateOnly_(data.date||todayYmd()),
    module: "WASH",
    sourceRef: washBatchId,
    targetRef: washBatchId,
    inputs: data.feedComposition,
    outputs: data.outputComposition,
    createdBy: data.createdBy||"System"
  });

  return output({
    ok:true,
    washBatchId,
    ledger
  });

}



function updateWashBatch(data = {}) {
  const idValue = data.washBatchId || data.batchId;
  validateOperationalWrite_(
    data,
    getRowById_("Wash_Batches", "washBatchId", idValue)
  );
  data = normalizeProductionBatchPayload_(data, "WASH");

  return updateById(
    "Wash_Batches",
    "washBatchId",
    idValue,
    {

      sourceRMId:data.sourceRMId||"",
      sourceRmInwardId:data.sourceRmInwardId||"",
      sourceGrinderBatchId:data.sourceGrinderBatchId||"",
      supplier:data.supplier||"",
      availableRMQty:num(data.availableRMQty),

      date:normalizeDateOnly_(data.date||todayYmd()),
      shift:data.shift||"",
      machine:data.machine||"",
      entryMode:data.entryMode||"DAILY",
      periodMonth:data.periodMonth||getPeriodMonth(data.date),

      inputMaterial:data.inputMaterial||"",
      inputWeightKg:num(data.inputWeightKg),
      washedOutputKg:num(data.washedOutputKg),

      raffiaKg:num(data.raffiaKg),
      wrappersKg:num(data.wrappersKg),
      microPlasticKg:num(data.microPlasticKg),
      sinkMaterialKg:num(data.sinkMaterialKg),
      ironScrapKg:num(data.ironScrapKg),
      otherColorKg:num(data.otherColorKg),
      dustKg:num(data.dustKg),
      sludgeKg:num(data.sludgeKg),

      washVarianceKg:num(data.washVarianceKg),
      estimatedRecoveryPercent:num(data.estimatedRecoveryPercent),
      recoverySeverity:data.recoverySeverity||"",

      operatorName:data.operatorName||"",
      supervisorName:data.supervisorName||"",
      machineRunningHours:num(data.machineRunningHours),
      downtimeHours:num(data.downtimeHours),
      downtimeReason:data.downtimeReason||"",

      remarks:data.remarks||"",
      status:data.status||"",
      sortingRequired:data.sortingRequired||"",
      nextProcess:data.nextProcess||"",
      linkedSortingBatchId:data.linkedSortingBatchId||"",
      linkedExtrusionBatchId:data.linkedExtrusionBatchId||""
    }
  );

}



function listWashAvailableForSorting(){

  const rows=getRowsAsObjects("Wash_Batches")
      .filter(r=>
          !isDeleted_(r) &&
          String(r.sortingRequired).toUpperCase()=="YES" &&
          String(r.status).toUpperCase()=="READY_FOR_SORTING"
      );

  return output({
      ok:true,
      rows
  });

}



function listWashAvailableForExtrusion(){

  const rows=getRowsAsObjects("Wash_Batches")
      .filter(r=>
          !isDeleted_(r) &&
          String(r.sortingRequired).toUpperCase()=="NO" &&
          String(r.status).toUpperCase()=="READY_FOR_EXTRUSION"
      );

  return output({
      ok:true,
      rows
  });

}



// =====================================================
// COLOUR SORTER
// =====================================================

function addSortingBatch(data={}){

    validateOperationalWrite_(data);
    data = normalizeProductionBatchPayload_(data, "SORTING");

    const sh=getSheet("Sorting_Batches");

    ensureHeaders_("Sorting_Batches",[
        "sortingBatchId","sourceWashBatchId","supplier",
        "date","periodMonth","shift","machine",
        "inputMaterial","inputWeightKg","feedComposition","outputComposition",
        "whiteSortedKg","whiteGreyKg","commodityKg","allMixSortedKg",
        "rejectedQtyKg","acceptedQtyKg",
        "sorterVarianceKg","recoveryPercent",
        "operatorName","supervisorName",
        "machineRunningHours","downtimeHours","downtimeReason",
        "remarks","status","createdBy","createdAt"
    ]);

    const sortingBatchId=
        data.sortingBatchId||
        generateBatchId("SB");

    appendObjectRow(sh,{

        sortingBatchId,

        sourceWashBatchId:data.sourceWashBatchId||"",
        supplier:data.supplier||"",

        date:normalizeDateOnly_(data.date||todayYmd()),
        periodMonth:data.periodMonth||getPeriodMonth(data.date),

        shift:data.shift||"",
        machine:data.machine||"",

        inputMaterial:data.inputMaterial||"",
        inputWeightKg:num(data.inputWeightKg),
        feedComposition:data.feedComposition||"",
        outputComposition:data.outputComposition||"",

        whiteSortedKg:num(data.whiteSortedKg),
        whiteGreyKg:num(data.whiteGreyKg),
        commodityKg:num(data.commodityKg),
        allMixSortedKg:num(data.allMixSortedKg),

        rejectedQtyKg:num(data.rejectedQtyKg),
        acceptedQtyKg:num(data.acceptedQtyKg),

        sorterVarianceKg:num(data.sorterVarianceKg),
        recoveryPercent:num(data.recoveryPercent),

        operatorName:data.operatorName||"",
        supervisorName:data.supervisorName||"",

        machineRunningHours:num(data.machineRunningHours),
        downtimeHours:num(data.downtimeHours),
        downtimeReason:data.downtimeReason||"",

        remarks:data.remarks||"",

        status:"READY_FOR_EXTRUSION",

        createdBy:data.createdBy||"System",
        createdAt:new Date()

    });

    const ledger = postManufacturingCompositionLedger_({
        date: normalizeDateOnly_(data.date||todayYmd()),
        module: "SORTING",
        sourceRef: sortingBatchId,
        targetRef: sortingBatchId,
        inputs: data.feedComposition,
        outputs: data.outputComposition,
        createdBy: data.createdBy||"System"
    });

    return output({
        ok:true,
        sortingBatchId,
        ledger
    });

}



function updateSortingBatch(data={}){
    validateOperationalWrite_(
        data,
        getRowById_("Sorting_Batches", "sortingBatchId", data.sortingBatchId)
    );
    data = normalizeProductionBatchPayload_(data, "SORTING");

    return updateById(
        "Sorting_Batches",
        "sortingBatchId",
        data.sortingBatchId,
        {

            sourceWashBatchId:data.sourceWashBatchId||"",
            supplier:data.supplier||"",

            date:normalizeDateOnly_(data.date||todayYmd()),
            periodMonth:data.periodMonth||getPeriodMonth(data.date),

            shift:data.shift||"",
            machine:data.machine||"",

            inputMaterial:data.inputMaterial||"",
            inputWeightKg:num(data.inputWeightKg),

            whiteSortedKg:num(data.whiteSortedKg),
            whiteGreyKg:num(data.whiteGreyKg),
            commodityKg:num(data.commodityKg),
            allMixSortedKg:num(data.allMixSortedKg),

            rejectedQtyKg:num(data.rejectedQtyKg),
            acceptedQtyKg:num(data.acceptedQtyKg),

            sorterVarianceKg:num(data.sorterVarianceKg),
            recoveryPercent:num(data.recoveryPercent),

            operatorName:data.operatorName||"",
            supervisorName:data.supervisorName||"",

            machineRunningHours:num(data.machineRunningHours),
            downtimeHours:num(data.downtimeHours),
            downtimeReason:data.downtimeReason||"",

            remarks:data.remarks||"",
            status:data.status||""
        }
    );

}



function listSortingAvailableForExtrusion(){

    const rows=getRowsAsObjects("Sorting_Batches")
        .filter(r=>
            !isDeleted_(r) &&
            String(r.status).toUpperCase()=="READY_FOR_EXTRUSION"
        );

    return output({
        ok:true,
        rows
    });

}
// EXTRUSION

function addExtrusionBatch(data = {}) {
  validateOperationalWrite_(data);
  data = normalizeProductionBatchPayload_(data, "EXTRUSION");

  const sh = getSheet("Extrusion_Batches");

  ensureHeaders_("Extrusion_Batches", [
    "extrusionBatchId",
    "batchId",
    "sourceType",
    "sourceBatchId",
    "sourceSortingBatchId",
    "sourceWashBatchId",
    "sourceSupplier",
    "availableSourceQty",
    "date",
    "shift",
    "machine",
    "entryMode",
    "periodMonth",
    "inputMaterial",
    "inputWeightKg",
    "totalInputKg",
    "feedComposition",
    "outputComposition",
    "fgOutputKg",
    "lumpsKg",
    "purgingKg",
    "reworkGranulesKg",
    "rejectKg",
    "vacuumRejectKg",
    "meshRejectKg",
    "floorSpillageKg",
    "totalRecoverableKg",
    "totalNonRecoverableKg",
    "totalOutputKg",
    "varianceKg",
    "recoveryPercent",
    "recoveryMaterialPercent",
    "virginRatioPercent",
    "batteryRatioPercent",
    "additiveRatioPercent",
    "productionGrade",
    "operatorName",
    "supervisorName",
    "machineRunningHours",
    "downtimeHours",
    "downtimeReason",
    "remarks",
    "status",
    "nextProcess",
    "recoverySeverity",
    "lotNo",
    "linkedPackingBatchId",
    "createdBy",
    "createdAt"
  ]);

  const extrusionBatchId =
    data.extrusionBatchId || data.batchId || generateBatchId("EX");

  const date = normalizeDateOnly_(data.date || todayYmd());

  const sourceType =
    data.sourceType ||
    (data.sourceSortingBatchId
      ? "SORTING"
      : data.sourceWashBatchId
      ? "WASH"
      : "PRODUCTION_SHIFT");

  const sourceBatchId =
    data.sourceBatchId ||
    data.sourceSortingBatchId ||
    data.sourceWashBatchId ||
    "";

  const inputWeightKg = num(data.inputWeightKg || data.totalInputKg);
  const totalInputKg = num(data.totalInputKg || data.inputWeightKg);

  const fgOutputKg = num(data.fgOutputKg);
  const lumpsKg = num(data.lumpsKg);
  const purgingKg = num(data.purgingKg);
  const reworkGranulesKg = num(data.reworkGranulesKg);
  const rejectKg = num(data.rejectKg);
  const vacuumRejectKg = num(data.vacuumRejectKg);
  const meshRejectKg = num(data.meshRejectKg);
  const floorSpillageKg = num(data.floorSpillageKg);

  const totalRecoverableKg =
    data.totalRecoverableKg !== undefined && data.totalRecoverableKg !== ""
      ? num(data.totalRecoverableKg)
      : fgOutputKg + lumpsKg + purgingKg + reworkGranulesKg;

  const totalNonRecoverableKg =
    data.totalNonRecoverableKg !== undefined && data.totalNonRecoverableKg !== ""
      ? num(data.totalNonRecoverableKg)
      : rejectKg + vacuumRejectKg + meshRejectKg + floorSpillageKg;

  const totalOutputKg =
    data.totalOutputKg !== undefined && data.totalOutputKg !== ""
      ? num(data.totalOutputKg)
      : totalRecoverableKg + totalNonRecoverableKg;

  const varianceKg =
    data.varianceKg !== undefined && data.varianceKg !== ""
      ? num(data.varianceKg)
      : totalInputKg - totalOutputKg;

  const recoveryPercent =
    data.recoveryPercent !== undefined && data.recoveryPercent !== ""
      ? num(data.recoveryPercent)
      : totalInputKg > 0
      ? round2((fgOutputKg / totalInputKg) * 100)
      : 0;

  appendObjectRow(sh, {
    extrusionBatchId,
    batchId: extrusionBatchId,

    sourceType,
    sourceBatchId,
    sourceSortingBatchId: data.sourceSortingBatchId || "",
    sourceWashBatchId: data.sourceWashBatchId || "",
    sourceSupplier: data.sourceSupplier || "",
    availableSourceQty: num(data.availableSourceQty),

    date,
    shift: data.shift || "",
    machine: data.machine || "",
    entryMode: data.entryMode || "DAILY",
    periodMonth: data.periodMonth || getPeriodMonth(date),

    inputMaterial: data.inputMaterial || "",
    inputWeightKg,
    totalInputKg,
    feedComposition: data.feedComposition || "",
    outputComposition: data.outputComposition || "",

    fgOutputKg,
    lumpsKg,
    purgingKg,
    reworkGranulesKg,
    rejectKg,
    vacuumRejectKg,
    meshRejectKg,
    floorSpillageKg,

    totalRecoverableKg,
    totalNonRecoverableKg,
    totalOutputKg,
    varianceKg,
    recoveryPercent,

    recoveryMaterialPercent: num(data.recoveryMaterialPercent),
    virginRatioPercent: num(data.virginRatioPercent),
    batteryRatioPercent: num(data.batteryRatioPercent),
    additiveRatioPercent: num(data.additiveRatioPercent),

    productionGrade: data.productionGrade || "",

    operatorName: data.operatorName || "",
    supervisorName: data.supervisorName || "",
    machineRunningHours: num(data.machineRunningHours),
    downtimeHours: num(data.downtimeHours),
    downtimeReason: data.downtimeReason || "",

    remarks: data.remarks || "",
    status: data.status || "READY_FOR_DISPATCH",
    nextProcess: data.nextProcess || "Dispatch",
    recoverySeverity: data.recoverySeverity || "",
    lotNo: data.lotNo || extrusionBatchId,
    linkedPackingBatchId: data.linkedPackingBatchId || "",

    createdBy: data.createdBy || "System",
    createdAt: new Date(),
  });

  const ledger = postManufacturingCompositionLedger_({
    date,
    module: "EXTRUSION",
    sourceRef: sourceBatchId || extrusionBatchId,
    targetRef: extrusionBatchId,
    inputs: data.feedComposition,
    outputs: data.outputComposition,
    createdBy: data.createdBy || "System"
  });

  return output({
    ok: true,
    extrusionBatchId,
    batchId: extrusionBatchId,
    sourceType,
    sourceBatchId,
    ledger,
  });
}

function updateExtrusionBatch(data = {}) {
  const date = normalizeDateOnly_(data.date || todayYmd());
  const idValue = data.extrusionBatchId || data.batchId;
  validateOperationalWrite_(
    { ...data, date },
    getRowById_("Extrusion_Batches", "extrusionBatchId", idValue)
  );
  data = normalizeProductionBatchPayload_(data, "EXTRUSION");

  return updateById(
    "Extrusion_Batches",
    "extrusionBatchId",
    idValue,
    {
      sourceType: data.sourceType || "",
      sourceBatchId: data.sourceBatchId || "",
      sourceSortingBatchId: data.sourceSortingBatchId || "",
      sourceWashBatchId: data.sourceWashBatchId || "",
      sourceSupplier: data.sourceSupplier || "",
      availableSourceQty: num(data.availableSourceQty),

      date,
      shift: data.shift || "",
      machine: data.machine || "",
      entryMode: data.entryMode || "DAILY",
      periodMonth: data.periodMonth || getPeriodMonth(date),

      inputMaterial: data.inputMaterial || "",
      inputWeightKg: num(data.inputWeightKg || data.totalInputKg),
      totalInputKg: num(data.totalInputKg || data.inputWeightKg),
      feedComposition: data.feedComposition || "",

      fgOutputKg: num(data.fgOutputKg),
      lumpsKg: num(data.lumpsKg),
      purgingKg: num(data.purgingKg),
      reworkGranulesKg: num(data.reworkGranulesKg),
      rejectKg: num(data.rejectKg),
      vacuumRejectKg: num(data.vacuumRejectKg),
      meshRejectKg: num(data.meshRejectKg),
      floorSpillageKg: num(data.floorSpillageKg),

      totalRecoverableKg: num(data.totalRecoverableKg),
      totalNonRecoverableKg: num(data.totalNonRecoverableKg),
      totalOutputKg: num(data.totalOutputKg),
      varianceKg: num(data.varianceKg),
      recoveryPercent: num(data.recoveryPercent),

      recoveryMaterialPercent: num(data.recoveryMaterialPercent),
      virginRatioPercent: num(data.virginRatioPercent),
      batteryRatioPercent: num(data.batteryRatioPercent),
      additiveRatioPercent: num(data.additiveRatioPercent),

      productionGrade: data.productionGrade || "",

      operatorName: data.operatorName || "",
      supervisorName: data.supervisorName || "",
      machineRunningHours: num(data.machineRunningHours),
      downtimeHours: num(data.downtimeHours),
      downtimeReason: data.downtimeReason || "",

      remarks: data.remarks || "",
      status: data.status || "",
      nextProcess: data.nextProcess || "",
      recoverySeverity: data.recoverySeverity || "",
      lotNo: data.lotNo || "",
      linkedPackingBatchId: data.linkedPackingBatchId || "",
    }
  );
}

// DISPATCH

// DISPATCH

function ensureDispatchHeaders_() {
  ensureHeaders_("Dispatches", [
    "dispatchId",
    "sourceExtrusionBatchId",
    "sourceSupplier",
    "availableFGQty",
    "date",
    "customerName",
    "customerUnit",
    "invoiceNo",
    "vehicleNo",
    "driverName",
    "grade",
    "lotNo",
    "quantityKg",
    "noOfBags",
    "ratePerKg",
    "dispatchLocation",
    "remarks",
    "dispatchStatus",
    "status",
    "linkedFgBatchId",
    "transporterName",
    "ewayBillNo",
    "dispatchLines",
    "productionDate",
    "productionShift",
    "createdBy",
    "createdAt",
    "updatedAt"
  ]);
}

function normalizeDispatchLines_(data = {}) {
  if (data.dispatchLines) {
    try {
      const parsed = JSON.parse(data.dispatchLines);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return JSON.stringify(parsed.map(function(x) {
          const grade = normalizeDispatchFgGrade_(x.grade || x.material || data.grade || data.material);
          return {
            sourceExtrusionBatchId: x.sourceExtrusionBatchId || "",
            lotNo: x.lotNo || x.sourceExtrusionBatchId || grade,
            grade,
            material: grade,
            itemType: "FG",
            productionDate: normalizeDateOnly_(x.productionDate || data.productionDate || data.date || todayYmd()),
            productionShift: x.productionShift || data.productionShift || "",
            availableKg: num(x.availableKg),
            dispatchQtyKg: num(x.dispatchQtyKg || x.quantityKg),
            remarks: x.remarks || "",
          };
        }).filter(function(x) {
          return x.grade && num(x.dispatchQtyKg) > 0;
        }));
      }
    } catch (err) {}
  }

  const sourceId = data.sourceExtrusionBatchId || data.linkedFgBatchId || "";
  const grade = normalizeDispatchFgGrade_(data.grade || data.material);

  return JSON.stringify([
    {
      sourceExtrusionBatchId: sourceId,
      lotNo: data.lotNo || sourceId || grade,
      grade,
      material: grade,
      itemType: "FG",
      productionDate: normalizeDateOnly_(data.productionDate || data.date || todayYmd()),
      productionShift: data.productionShift || "",
      availableKg: num(data.availableFGQty),
      dispatchQtyKg: num(data.quantityKg),
      remarks: data.remarks || "",
    },
  ]);
}

function parseDispatchLines_(dispatchLines) {
  try {
    const parsed = JSON.parse(dispatchLines || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

function normalizeDispatchFgGrade_(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const grade = normalizeDispatchGrade_(raw);
  return assertProductionMaterialAllowed_(grade, "DISPATCH", "INPUT", "Dispatch material");
}

function dispatchLineGrade_(line = {}, fallbackGrade) {
  return normalizeDispatchFgGrade_(line.grade || line.material || fallbackGrade);
}

function dispatchLineQty_(line = {}, fallbackQty) {
  return num(line.dispatchQtyKg || line.quantityKg || fallbackQty);
}

function dispatchQtyByGradeFromRow_(row = {}) {
  const byGrade = {};
  const lines = parseDispatchLines_(row.dispatchLines);

  if (lines.length > 0) {
    lines.forEach(function(line) {
      const grade = dispatchLineGrade_(line, row.grade || row.material);
      const qty = dispatchLineQty_(line, row.quantityKg);
      if (!grade || qty <= 0) return;
      byGrade[grade] = (byGrade[grade] || 0) + qty;
    });
    return byGrade;
  }

  const grade = normalizeDispatchFgGrade_(row.grade || row.material);
  const qty = num(row.quantityKg);
  if (grade && qty > 0) byGrade[grade] = qty;
  return byGrade;
}

function fgLedgerBalanceByGrade_() {
  const byGrade = {};

  getRowsAsObjects("Inventory_Ledger")
    .filter(function(row) { return !isDeleted_(row); })
    .filter(function(row) { return String(row.itemType || "").toUpperCase() === "FG"; })
    .forEach(function(row) {
      const grade = normalizeDispatchFgGrade_(row.itemName || row.material || row.grade);
      if (!grade) return;
      byGrade[grade] = (byGrade[grade] || 0) + num(row.qtyIn) - num(row.qtyOut);
    });

  return byGrade;
}

function fgProducedForBatch_(batchId) {
  if (!batchId) return 0;

  return getRowsAsObjects("Extrusion_Batches")
    .filter((r) => !isDeleted_(r))
    .filter((r) =>
      [r.extrusionBatchId, r.batchId, r.lotNo]
        .map((v) => String(v || ""))
        .includes(String(batchId))
    )
    .reduce((s, r) => s + num(r.fgOutputKg), 0);
}

function fgDispatchedForBatch_(batchId, excludeDispatchId) {
  if (!batchId) return 0;

  return getRowsAsObjects("Dispatches")
    .filter((r) => !isDeleted_(r))
    .filter((r) => String(r.dispatchId || "") !== String(excludeDispatchId || ""))
    .reduce((sum, r) => {
      const lines = parseDispatchLines_(r.dispatchLines);

      if (lines.length > 0) {
        return (
          sum +
          lines
            .filter((line) => String(line.sourceExtrusionBatchId || "") === String(batchId))
            .reduce((s, line) => s + num(line.dispatchQtyKg), 0)
        );
      }

      const sourceId = r.sourceExtrusionBatchId || r.linkedFgBatchId || "";
      return String(sourceId) === String(batchId) ? sum + num(r.quantityKg) : sum;
    }, 0);
}

function validateDispatchAvailability_(data = {}) {
  const lines = parseDispatchLines_(normalizeDispatchLines_(data))
    .filter(function(line) { return dispatchLineGrade_(line, data.grade || data.material) && dispatchLineQty_(line, data.quantityKg) > 0; });

  const requestedByGrade = {};

  lines.forEach(function(line) {
    const grade = dispatchLineGrade_(line, data.grade || data.material);
    requestedByGrade[grade] =
      (requestedByGrade[grade] || 0) + dispatchLineQty_(line, data.quantityKg);
  });

  const balanceByGrade = fgLedgerBalanceByGrade_();
  const existingRow = data.dispatchId
    ? getRowById_("Dispatches", "dispatchId", data.dispatchId)
    : null;
  const existingByGrade = existingRow ? dispatchQtyByGradeFromRow_(existingRow) : {};

  Object.keys(requestedByGrade).forEach(function(grade) {
    const available = num(balanceByGrade[grade]) + num(existingByGrade[grade]);

    if (requestedByGrade[grade] > available + 0.01) {
      throw new Error(
        "Dispatch exceeds available FG grade stock for " +
          grade +
          ". Available: " +
          round2(available) +
          " Kg"
      );
    }
  });
}

function addDispatch(data = {}) {
  const sh = getSheet("Dispatches");
  ensureDispatchHeaders_();

  const dispatchId = data.dispatchId || generateBatchId("DIS");
  const date = normalizeDateOnly_(data.date || todayYmd());
  const sourceId = "";
  const dispatchLines = normalizeDispatchLines_(data);
  const lineRows = parseDispatchLines_(dispatchLines);
  const headerGrade = lineRows.map(function(line) { return dispatchLineGrade_(line, data.grade || data.material); }).filter(Boolean).join(" | ");
  validateOperationalWrite_({ ...data, date });
  validateDispatchAvailability_({ ...data, dispatchId });

  appendObjectRow(sh, {
    dispatchId,
    sourceExtrusionBatchId: sourceId,
    sourceSupplier: data.sourceSupplier || "",
    availableFGQty: num(data.availableFGQty),
    date,
    customerName: data.customerName || "",
    customerUnit: data.customerUnit || "",
    invoiceNo: data.invoiceNo || "",
    vehicleNo: data.vehicleNo || "",
    driverName: data.driverName || "",
    grade: headerGrade || normalizeDispatchFgGrade_(data.grade || data.material),
    lotNo: data.lotNo || headerGrade,
    quantityKg: num(data.quantityKg),
    noOfBags: num(data.noOfBags),
    ratePerKg: num(data.ratePerKg),
    dispatchLocation: data.dispatchLocation || "",
    remarks: data.remarks || "",
    dispatchStatus: data.dispatchStatus || "DISPATCHED",
    status: data.status || "ACTIVE",
    linkedFgBatchId: "",
    transporterName: data.transporterName || "",
    ewayBillNo: data.ewayBillNo || "",
    dispatchLines,
    productionDate: normalizeDateOnly_(data.productionDate || date),
    productionShift: data.productionShift || "",
    createdBy: data.createdBy || "System",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  lineRows.forEach(function(line) {
    const grade = dispatchLineGrade_(line, data.grade || data.material);
    const qty = dispatchLineQty_(line, data.quantityKg);
    if (!grade || qty <= 0) return;
    addInventoryLedger({
      date,
      module: "DISPATCH",
      movementType: "OUT",
      itemType: "FG",
      itemName: grade,
      sourceRef: grade,
      targetRef: dispatchId,
      qtyIn: 0,
      qtyOut: qty,
      unit: "Kg",
      remarks: data.remarks || "FG dispatched",
      createdBy: data.createdBy || "System",
    });
  });

  return output({
    ok: true,
    dispatchId,
  });
}

function updateDispatch(data = {}) {
  ensureDispatchHeaders_();

  const date = normalizeDateOnly_(data.date || todayYmd());
  const sourceId = data.sourceExtrusionBatchId || data.linkedFgBatchId || "";
  const dispatchLines = normalizeDispatchLines_(data);
  const lineRows = parseDispatchLines_(dispatchLines);
  const headerGrade = lineRows.map(function(line) { return dispatchLineGrade_(line, data.grade || data.material); }).filter(Boolean).join(" | ");
  const isDeleted =
    String(data.status || "").toUpperCase() === "DELETED" ||
    String(data.dispatchStatus || "").toUpperCase() === "DELETED";
  validateOperationalWrite_(
    { ...data, date },
    getRowById_("Dispatches", "dispatchId", data.dispatchId)
  );

  if (!isDeleted) {
    validateDispatchAvailability_(data);
  }

  return updateById("Dispatches", "dispatchId", data.dispatchId, {
    sourceExtrusionBatchId: sourceId,
    sourceSupplier: data.sourceSupplier || "",
    availableFGQty: num(data.availableFGQty),
    date,
    customerName: data.customerName || "",
    customerUnit: data.customerUnit || "",
    invoiceNo: data.invoiceNo || "",
    vehicleNo: data.vehicleNo || "",
    driverName: data.driverName || "",
    grade: headerGrade || normalizeDispatchFgGrade_(data.grade || data.material),
    lotNo: data.lotNo || sourceId,
    quantityKg: num(data.quantityKg),
    noOfBags: num(data.noOfBags),
    ratePerKg: num(data.ratePerKg),
    dispatchLocation: data.dispatchLocation || "",
    remarks: data.remarks || "",
    dispatchStatus: isDeleted ? "DELETED" : data.dispatchStatus || "DISPATCHED",
    status: isDeleted ? "DELETED" : data.status || "ACTIVE",
    linkedFgBatchId: sourceId,
    transporterName: data.transporterName || "",
    ewayBillNo: data.ewayBillNo || "",
    dispatchLines,
    productionDate: normalizeDateOnly_(data.productionDate || date),
    productionShift: data.productionShift || "",
    updatedAt: new Date(),
  });
}

function patchOldDispatchData() {
  const sh = getSheet("Dispatches");
  ensureDispatchHeaders_();

  const headers = getHeaders(sh);
  const values = sh.getDataRange().getValues();

  let patched = 0;

  for (let r = 1; r < values.length; r++) {
    const row = {};
    headers.forEach((h, i) => {
      row[h] = values[r][i];
    });

    const statusUpper = String(row.status || "").toUpperCase();
    const dispatchStatusUpper = String(row.dispatchStatus || "").toUpperCase();

    const isDeleted =
      statusUpper === "DELETED" || dispatchStatusUpper === "DELETED";

    const sourceId = row.sourceExtrusionBatchId || row.linkedFgBatchId || "";
    const date = normalizeDateOnly_(row.date || todayYmd());
    const productionDate = normalizeDateOnly_(row.productionDate || date);

    const patch = {
      sourceExtrusionBatchId: sourceId,
      date,
      dispatchStatus: isDeleted ? "DELETED" : row.dispatchStatus || "DISPATCHED",
      status: isDeleted ? "DELETED" : row.status || "ACTIVE",
      linkedFgBatchId: row.linkedFgBatchId || sourceId,
      productionDate,
      productionShift: row.productionShift || "",
      dispatchLines: row.dispatchLines || normalizeDispatchLines_({
        sourceExtrusionBatchId: sourceId,
        linkedFgBatchId: sourceId,
        lotNo: row.lotNo || sourceId,
        grade: row.grade || "",
        productionDate,
        productionShift: row.productionShift || "",
        availableFGQty: row.availableFGQty || "",
        quantityKg: row.quantityKg || "",
        remarks: row.remarks || "",
      }),
      updatedAt: new Date(),
    };

    Object.keys(patch).forEach((key) => {
      const col = headers.indexOf(key);
      if (col !== -1) {
        sh.getRange(r + 1, col + 1).setValue(patch[key]);
      }
    });

    patched++;
  }

  return output({
    ok: true,
    message: "Dispatch patch completed",
    rowsPatched: patched,
  });
}
// =====================================================
// STORES MASTER
// =====================================================

function addStoresMaster(data = {}) {

  const sh = getSheet("Stores_Master");

  ensureHeaders_("Stores_Master",[
    "itemId","itemName","category","unit",
    "minLevel","maxLevel","remarks",
    "status","createdBy","createdAt"
  ]);

  const itemId = data.itemId || generateBatchId("STM");

  appendObjectRow(sh,{
    itemId,
    itemName:data.itemName||"",
    category:data.category||"",
    unit:data.unit||"",
    minLevel:num(data.minLevel),
    maxLevel:num(data.maxLevel),
    remarks:data.remarks||"",
    status:data.status||"ACTIVE",
    createdBy:data.createdBy||"System",
    createdAt:new Date()
  });

  return output({
    ok:true,
    itemId
  });

}

function updateStoresMaster(data={}){

  return updateById(
    "Stores_Master",
    "itemId",
    data.itemId,
    {

      itemName:data.itemName||"",
      category:data.category||"",
      unit:data.unit||"",
      minLevel:num(data.minLevel),
      maxLevel:num(data.maxLevel),
      remarks:data.remarks||"",
      status:data.status||""

    }
  );

}

// =====================================================
// STORES INWARD
// =====================================================

function addStoresInward(data={}){

  const sh=getSheet("Stores_Inward");
  validateOperationalWrite_(data);

  ensureHeaders_("Stores_Inward",[
    "inwardId","storesInwardId","date","itemName",
    "category","unit","qty","rate","totalAmount",
    "supplier","vendor","invoiceNo","minLevel",
    "remarks","status","inwardStatus",
    "createdBy","createdAt"
  ]);

  const inwardId =
      data.inwardId ||
      data.storesInwardId ||
      generateBatchId("SIN");

  const qty=num(data.qty);
  const rate=num(data.rate);

  appendObjectRow(sh,{

      inwardId,
      storesInwardId:inwardId,

      date:normalizeDateOnly_(data.date||todayYmd()),

      itemName:data.itemName||"",
      category:data.category||"",
      unit:data.unit||"",

      qty,
      rate,

      totalAmount:
          data.totalAmount!==undefined &&
          data.totalAmount!==""
              ? num(data.totalAmount)
              : qty*rate,

      supplier:data.supplier||"",
      vendor:data.vendor||data.supplier||"",
      invoiceNo:data.invoiceNo||"",
      minLevel:num(data.minLevel),

      remarks:data.remarks||"",

      status:data.status||"ACTIVE",
      inwardStatus:data.inwardStatus||"ACTIVE",

      createdBy:data.createdBy||"System",
      createdAt:new Date()

  });

  addInventoryLedger({

      date:data.date||todayYmd(),

      module:"STORES",
      movementType:"IN",

      itemType:"STORE",
      itemName:data.itemName||"",

      sourceRef:data.supplier||"",
      targetRef:inwardId,

      qtyIn:qty,
      qtyOut:0,

      unit:data.unit||"Nos",

      remarks:data.remarks||"",
      createdBy:data.createdBy||"System"

  });

  return output({
      ok:true,
      inwardId
  });

}

function updateStoresInward(data={}){
  const idValue = data.inwardId || data.storesInwardId;
  validateOperationalWrite_(
      data,
      getRowById_("Stores_Inward", "inwardId", idValue)
  );

  return updateById(
      "Stores_Inward",
      "inwardId",
      idValue,
      {

          date:normalizeDateOnly_(data.date||todayYmd()),

          itemName:data.itemName||"",
          category:data.category||"",
          unit:data.unit||"",

          qty:num(data.qty),
          rate:num(data.rate),

          totalAmount:num(data.totalAmount),

          supplier:data.supplier||"",
          vendor:data.vendor||"",
          invoiceNo:data.invoiceNo||"",
          minLevel:num(data.minLevel),

          remarks:data.remarks||"",

          status:data.status||"",
          inwardStatus:data.inwardStatus||""

      }
  );

}

// =====================================================
// STORES ISSUE
// =====================================================

function addStoresIssue(data={}){

  const sh=getSheet("Stores_Issue");
  validateOperationalWrite_(data);

  ensureHeaders_("Stores_Issue",[
      "issueId","date","department",
      "itemName","category","unit",
      "qty","issueRate","issueValue","rateSource","remarks","status",
      "issueStatus","issuedTo",
      "createdBy","createdAt"
  ]);

  const issueId=data.issueId||generateBatchId("ISS");
  const qty=num(data.qty);
  const issueRate=num(data.issueRate || data.rate);
  const issueValue =
      data.issueValue!==undefined &&
      data.issueValue!==""
          ? num(data.issueValue)
          : qty*issueRate;

  appendObjectRow(sh,{

      issueId,

      date:normalizeDateOnly_(data.date||todayYmd()),

      department:data.department||"",
      itemName:data.itemName||"",
      category:data.category||"",
      unit:data.unit||"",

      qty,
      issueRate,
      issueValue,
      rateSource:data.rateSource||"",

      remarks:data.remarks||"",

      status:data.status||"ACTIVE",
      issueStatus:data.issueStatus||"ACTIVE",

      issuedTo:data.issuedTo||"",

      createdBy:data.createdBy||"System",
      createdAt:new Date()

  });

  addInventoryLedger({

      date:data.date||todayYmd(),

      module:"STORES",
      movementType:"OUT",

      itemType:"STORE",
      itemName:data.itemName||"",

      sourceRef:issueId,
      targetRef:data.department||"",

      qtyIn:0,
      qtyOut:qty,

      unit:data.unit||"Nos",

      remarks:
          (data.remarks||"") +
          (issueRate ? " | Issue rate " + issueRate + " | Value " + issueValue : ""),
      createdBy:data.createdBy||"System"

  });

  return output({
      ok:true,
      issueId
  });

}

function updateStoresIssue(data={}){
  const existing = getRowById_("Stores_Issue", "issueId", data.issueId);
  validateOperationalWrite_(data, existing);

  const qty=num(data.qty);
  const issueRate=num(data.issueRate || data.rate);
  const issueValue =
      data.issueValue!==undefined &&
      data.issueValue!==""
          ? num(data.issueValue)
          : qty*issueRate;

  return updateById(
      "Stores_Issue",
      "issueId",
      data.issueId,
      {

          date:normalizeDateOnly_(data.date||todayYmd()),

          department:data.department||"",
          itemName:data.itemName||"",
          category:data.category||"",
          unit:data.unit||"",

          qty,
          issueRate,
          issueValue,
          rateSource:data.rateSource||"",

          remarks:data.remarks||"",

          status:data.status||"",
          issueStatus:data.issueStatus||"",
          issuedTo:data.issuedTo||""

      }
  );

}

// =====================================================
// INVENTORY LEDGER
// =====================================================

function addInventoryLedger(data={}){

  const sh=getSheet("Inventory_Ledger");

  ensureHeaders_("Inventory_Ledger",[
      "ledgerId","date",
      "module","movementType",
      "itemType","materialId","itemName",
      "sourceRef","targetRef",
      "qtyIn","qtyOut",
      "unit","remarks",
      "status",
      "createdBy",
      "createdAt",
      "legacySourceSheet",
      "legacySourceId",
      "legacyMaterialName",
      "migrationId",
      "migratedAt"
  ]);

  const material = validateInventoryLedgerMaterial_(data);

  appendObjectRow(sh,{

      ledgerId:data.ledgerId||generateBatchId("LED"),

      date:normalizeDateOnly_(data.date||todayYmd()),

      module:data.module||"",
      movementType:data.movementType||"",

      itemType:material.category,
      materialId:material.materialId,
      itemName:material.materialName,

      sourceRef:data.sourceRef||"",
      targetRef:data.targetRef||"",

      qtyIn:num(data.qtyIn),
      qtyOut:num(data.qtyOut),

      unit:data.unit||"Kg",

      remarks:data.remarks||"",

      status:data.status||"ACTIVE",

      createdBy:data.createdBy||"System",
      createdAt:new Date(),
      legacySourceSheet:data.legacySourceSheet||"",
      legacySourceId:data.legacySourceId||"",
      migrationId:data.migrationId||"",
      migratedAt:data.migratedAt||""

  });

}

function validateInventoryLedgerMaterial_(data = {}) {
  const itemType = String(data.itemType || "").trim().toUpperCase();
  const itemName = String(data.itemName || "").trim();

  if (itemType === "MATERIAL_BUCKET") {
    throw new Error("Inventory Ledger rejected MATERIAL_BUCKET itemType. Use Material_Master.");
  }

  if (!itemName && !data.materialId && !data.materialCode) {
    throw new Error("Inventory Ledger requires a Material Master material");
  }

  if (isInvalidInventoryItemName_(itemName)) {
    throw new Error("Inventory Ledger itemName must be a single Material Master item, not recipe text or combined material description: " + itemName);
  }

  const material = resolveMaterialMaster_(data.materialId, data.materialCode || itemName);
  const expectedCategory = normalizeMaterialCategoryForLedger_(itemType || material.category);

  if (expectedCategory && expectedCategory !== material.category) {
    throw new Error(
      "Inventory Ledger material category mismatch for " +
        material.materialName +
        ". Expected " +
        material.category +
        ", received " +
        expectedCategory
    );
  }

  return material;
}

function normalizeMaterialCategoryForLedger_(value) {
  const category = String(value || "").trim().toUpperCase();
  if (!category) return "";
  if (category === "STORES") return "STORE";
  if (category === "RM_CONSUMABLE" || category === "RM CONSUMABLE") return "RM";
  if (category === "LUMPS" || category === "PURGING") return "REWORK";
  if (category === "SORTING" || category === "WASH" || category === "WASHED") return "WIP";
  if (category === "PRODUCTION_SHIFT") return "WIP";
  if (MATERIAL_MASTER_CATEGORIES.indexOf(category) !== -1) return category;
  return "";
}

function isInvalidInventoryItemName_(value) {
  const text = String(value || "").trim();
  if (!text) return false;
  if (/\bE[1-5]\b\s*:\s*[\d,]+(?:\.\d+)?\s*(KG|KGS|KILOGRAMS)?/i.test(text)) return true;
  if (/[{}[\]]/.test(text)) return true;
  if (/\d+\s*%/.test(text)) return true;
  if (/\s\+\s|\s\/\s|,\s*\bE[1-5]\b/i.test(text)) return true;
  if (/FEED\s*COMPOSITION|RECIPE|DOSING/i.test(text)) return true;
  return false;
}

function resolveMaterialMaster_(materialId, materialCodeOrName) {
  const rows = getMaterialMasterRows_();

  if (!rows.length) {
    throw new Error("Material_Master is empty. Run db.runMigrations and materialMaster.seedDefaults before posting inventory.");
  }

  const id = String(materialId || "").trim();
  const key = materialCode_(materialCodeOrName);
  const name = String(materialCodeOrName || "").trim().toUpperCase();

  const material = rows.find((row) => {
    const rowId = String(row.materialId || "").trim();
    const rowCode = materialCode_(row.materialCode || row.materialName);
    const rowName = String(row.materialName || "").trim().toUpperCase();
    return (id && rowId === id) || (key && rowCode === key) || (name && rowName === name);
  });

  if (!material) {
    throw new Error("Material not found in Material_Master: " + (materialCodeOrName || materialId || ""));
  }

  const category = normalizeMaterialCategory_(material.category || material.materialType);

  return {
    materialId: material.materialId,
    materialCode: material.materialCode || materialCode_(material.materialName),
    materialName: material.materialName,
    category,
    unit: material.unit || "Kg",
  };
}

function getInventoryLedgerBalance(){

    const rows=getRowsAsObjects("Inventory_Ledger")
        .filter(r=>!isDeleted_(r));

    const balance={};

    rows.forEach(r=>{

        const key=(r.materialId || "")+"|"+r.itemType+"|"+r.itemName;

        if(!balance[key]){

            balance[key]={
                itemType:r.itemType,
                materialId:r.materialId || "",
                itemName:r.itemName,
                qty:0
            };

        }

        balance[key].qty+=
            num(r.qtyIn)-num(r.qtyOut);

    });

    return output({
        ok:true,
        rows:Object.values(balance)
    });

}

function getInventoryLedgerLiveBalance(data = {}) {
  const ledgerRows = getRowsAsObjects("Inventory_Ledger")
    .filter(function(row) { return !isDeleted_(row); });
  const productionRows = liveInventoryProductionMaterialRows_();
  const productionIndex = {};
  const aliasIndex = {};
  const groups = {};
  const manualGroups = {};
  const skipped = {
    storeRows: 0,
  };

  productionRows.forEach(function(row) {
    const canonicalName = String(row.canonicalName || row.materialName || "").trim();
    if (!canonicalName) return;
    const category = normalizeLiveInventoryCategory_(row.category);
    if (!category) return;

    const canonicalKey = canonicalName.toUpperCase();
    productionIndex[canonicalKey] = {
      material: canonicalName,
      category,
      materialId: row.materialId || "",
      sortOrder: num(row.sortOrder),
    };
    aliasIndex[canonicalKey] = productionIndex[canonicalKey];
    aliasIndex[String(row.materialName || canonicalName).trim().toUpperCase()] = productionIndex[canonicalKey];
    String(row.aliases || "")
      .split("|")
      .map(function(alias) { return alias.trim(); })
      .filter(function(alias) { return alias; })
      .forEach(function(alias) {
        aliasIndex[alias.toUpperCase()] = productionIndex[canonicalKey];
      });
  });

  ledgerRows.forEach(function(row) {
    const rawName = String(row.itemName || row.material || row.grade || "").trim();
    const itemType = normalizeMaterialCategoryForLedger_(row.itemType);
    const qtyIn = num(row.qtyIn);
    const qtyOut = num(row.qtyOut);
    if (!rawName || (qtyIn <= 0 && qtyOut <= 0)) return;

    if (itemType === "STORE") {
      skipped.storeRows += 1;
      return;
    }

    const normalized = normalizeLiveInventoryMaterial_(rawName, aliasIndex);

    if (!normalized.known) {
      const manualKey = rawName.toUpperCase() + "|" + (itemType || "MANUAL_REVIEW");
      if (!manualGroups[manualKey]) {
        manualGroups[manualKey] = {
          material: rawName,
          canonicalMaterial: "Needs Manual Review",
          category: "MANUAL_REVIEW",
          sourceCategory: itemType || row.itemType || "",
          qtyIn: 0,
          qtyOut: 0,
          balanceKg: 0,
          movementCount: 0,
          examples: [],
        };
      }
      manualGroups[manualKey].qtyIn += qtyIn;
      manualGroups[manualKey].qtyOut += qtyOut;
      manualGroups[manualKey].balanceKg += qtyIn - qtyOut;
      manualGroups[manualKey].movementCount += 1;
      if (manualGroups[manualKey].examples.length < 5) {
        manualGroups[manualKey].examples.push({
          date: normalizeDateOnly_(row.date || ""),
          module: row.module || "",
          movementType: row.movementType || "",
          sourceRef: row.sourceRef || "",
          targetRef: row.targetRef || "",
          qtyIn,
          qtyOut,
        });
      }
      return;
    }

    const key = normalized.material.toUpperCase();
    if (!groups[key]) {
      groups[key] = {
        material: normalized.material,
        canonicalMaterial: normalized.material,
        category: normalized.category,
        materialId: normalized.materialId || "",
        qtyIn: 0,
        qtyOut: 0,
        balanceKg: 0,
        movementCount: 0,
        sortOrder: normalized.sortOrder || 999,
      };
    }

    groups[key].qtyIn += qtyIn;
    groups[key].qtyOut += qtyOut;
    groups[key].balanceKg += qtyIn - qtyOut;
    groups[key].movementCount += 1;
  });

  const rows = Object.values(groups)
    .map(roundLiveInventoryBalanceRow_)
    .sort(function(a, b) {
      return num(a.sortOrder) - num(b.sortOrder) ||
        String(a.material).localeCompare(String(b.material), undefined, { numeric: true });
    });

  const manualReviewRows = Object.values(manualGroups)
    .map(roundLiveInventoryBalanceRow_)
    .sort(function(a, b) {
      return Math.abs(num(b.balanceKg)) - Math.abs(num(a.balanceKg)) ||
        String(a.material).localeCompare(String(b.material), undefined, { numeric: true });
    });

  const summary = rows.reduce(function(acc, row) {
    acc[row.category] = (acc[row.category] || 0) + num(row.balanceKg);
    acc.totalProductionKg += num(row.balanceKg);
    return acc;
  }, {
    RM: 0,
    WIP: 0,
    FG: 0,
    WASTE: 0,
    ADDITIVE: 0,
    totalProductionKg: 0,
    manualReviewCount: manualReviewRows.length,
    manualReviewBalanceKg: manualReviewRows.reduce(function(sum, row) { return sum + num(row.balanceKg); }, 0),
    ledgerRows: ledgerRows.length,
    skipped,
  });

  return output({
    ok: true,
    route: "inventoryLedger.liveBalance",
    source: "Inventory_Ledger",
    rows,
    manualReviewRows,
    summary,
    canonicalMaterials: productionRows.map(function(row) {
      return row.canonicalName || row.materialName || "";
    }).filter(function(name) { return name; }),
    note: "Live Inventory is grouped from Inventory_Ledger using canonical Production_Material_Master names. Stores are excluded from production inventory; approved extrusion additives are shown separately.",
  });
}

function normalizeLiveInventoryMaterial_(value, aliasIndex) {
  const clean = String(value || "").trim().replace(/\s+/g, " ");
  if (!clean) return { known: false, material: "", category: "MANUAL_REVIEW" };

  const productionMatch = aliasIndex[clean.toUpperCase()];
  if (productionMatch) {
    return {
      known: true,
      material: productionMatch.material,
      category: productionMatch.category,
      materialId: productionMatch.materialId || "",
      sortOrder: productionMatch.sortOrder || 999,
    };
  }

  const normalized = normalizeProductionMaterialName_(clean);
  const normalizedMatch = aliasIndex[String(normalized.canonicalName || "").toUpperCase()];
  if (normalized.known && normalizedMatch) {
    return {
      known: true,
      material: normalizedMatch.material,
      category: normalizedMatch.category,
      materialId: normalizedMatch.materialId || "",
      sortOrder: normalizedMatch.sortOrder || 999,
    };
  }

  return { known: false, material: clean, category: "MANUAL_REVIEW" };
}

function liveInventoryProductionMaterialRows_() {
  const byCanonical = {};

  productionMaterialRowsFromDefaults_().forEach(function(row) {
    const key = String(row.canonicalName || row.materialName || "").trim().toUpperCase();
    if (key) byCanonical[key] = row;
  });

  getProductionMaterialMasterRows_().forEach(function(row) {
    const key = String(row.canonicalName || row.materialName || "").trim().toUpperCase();
    if (!key) return;
    const fallback = byCanonical[key] || {};
    byCanonical[key] = {
      ...fallback,
      ...row,
      stageAllowed: mergeCsvValues_(row.stageAllowed, fallback.stageAllowed),
      directionAllowed: mergeCsvValues_(row.directionAllowed, fallback.directionAllowed),
      aliases: row.aliases || fallback.aliases || "",
    };
  });

  return Object.values(byCanonical);
}

function normalizeLiveInventoryCategory_(value) {
  const category = normalizeMaterialCategoryForLedger_(value);
  if (category === "RM" || category === "WIP" || category === "FG" || category === "WASTE" || category === "ADDITIVE") return category;
  return "";
}

function roundLiveInventoryBalanceRow_(row) {
  return {
    ...row,
    qtyIn: round2(num(row.qtyIn)),
    qtyOut: round2(num(row.qtyOut)),
    balanceKg: round2(num(row.balanceKg)),
  };
}

function rebuildInventoryLedger(data = {}) {
  const dryRun = String(data.dryRun || "").toUpperCase() === "TRUE";
  const lock = LockService.getScriptLock();

  if (!lock.tryLock(30000)) {
    return output({ ok: false, error: "Inventory ledger rebuild is already in progress" });
  }

  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const ledgerSheet = getSheet("Inventory_Ledger");
    const headers = inventoryLedgerHeaders_();
    ensureHeaders_("Inventory_Ledger", headers);

    const beforeRows = getRowsAsObjects("Inventory_Ledger").filter((row) => !isDeleted_(row));
    const beforeBalances = ledgerBalancesForItems_(beforeRows, ["E1", "E2", "E3"]);
    const backupSheetName = dryRun ? "" : backupInventoryLedger_(ss, ledgerSheet);
    const rebuilt = buildInventoryLedgerRowsFromSources_();
    const afterBalances = ledgerBalancesForItems_(rebuilt.rows, ["E1", "E2", "E3"]);
    const duplicatePhysicalMovementCount = auditFindPhysicalMovementDuplicates_(rebuilt.rows).length;

    if (!dryRun) {
      clearInventoryLedger_(ledgerSheet, headers);
      writeInventoryLedgerRows_(ledgerSheet, headers, rebuilt.rows);
    }

    return output({
      ok: true,
      route: "inventoryLedger.rebuild",
      dryRun,
      backupSheetName,
      beforeBalances,
      afterBalances,
      duplicatePhysicalMovementCount,
      rowsBefore: beforeRows.length,
      rowsRebuilt: rebuilt.rows.length,
      sourceCounts: rebuilt.sourceCounts,
      warnings: rebuilt.warnings,
      message: dryRun
        ? "Dry run complete. Inventory_Ledger was not changed."
        : "Inventory_Ledger was backed up, cleared, and rebuilt from source sheets.",
    });
  } finally {
    lock.releaseLock();
  }
}

function inventoryLedgerHeaders_() {
  return [
    "ledgerId",
    "date",
    "module",
    "movementType",
    "itemType",
    "materialId",
    "itemName",
    "sourceRef",
    "targetRef",
    "qtyIn",
    "qtyOut",
    "unit",
    "remarks",
    "status",
    "createdBy",
    "createdAt",
    "legacySourceSheet",
    "legacySourceId",
    "legacyMaterialName",
    "migrationId",
    "migratedAt",
  ];
}

function backupInventoryLedger_(ss, ledgerSheet) {
  const timestamp = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "yyyyMMdd_HHmmss"
  );
  const baseName = "Inventory_Ledger_Backup_" + timestamp;
  let backupName = baseName;
  let suffix = 1;

  while (ss.getSheetByName(backupName)) {
    backupName = baseName + "_" + suffix;
    suffix += 1;
  }

  const backup = ss.insertSheet(backupName);
  const values = ledgerSheet.getDataRange().getValues();
  if (values.length && values[0].length) {
    backup.getRange(1, 1, values.length, values[0].length).setValues(values);
    backup.setFrozenRows(1);
  }
  return backupName;
}

function clearInventoryLedger_(ledgerSheet, headers) {
  ledgerSheet.clearContents();
  ledgerSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  ledgerSheet.setFrozenRows(1);
}

function writeInventoryLedgerRows_(ledgerSheet, headers, rows) {
  if (!rows.length) return;
  const values = rows.map((row) => headers.map((header) => row[header] !== undefined ? row[header] : ""));
  ledgerSheet.getRange(2, 1, values.length, headers.length).setValues(values);
}

function appendInventoryLedgerRows_(ledgerSheet, headers, rows) {
  if (!rows.length) return;
  const values = rows.map((row) => headers.map((header) => row[header] !== undefined ? row[header] : ""));
  ledgerSheet.getRange(ledgerSheet.getLastRow() + 1, 1, values.length, headers.length).setValues(values);
}

function buildInventoryLedgerRowsFromSources_() {
  const ctx = {
    rows: [],
    sourceCounts: {},
    warnings: [],
    rebuildAt: new Date(),
  };

  rebuildFromRmInward_(ctx);
  rebuildFromGrinderBatches_(ctx);
  rebuildFromWashBatches_(ctx);
  rebuildFromSortingBatches_(ctx);
  rebuildFromExtrusionBatches_(ctx);
  rebuildFromDispatches_(ctx);
  rebuildFromStoresInward_(ctx);
  rebuildFromStoresIssue_(ctx);
  rebuildFromInventoryAdjustments_(ctx);

  return {
    rows: ctx.rows,
    sourceCounts: ctx.sourceCounts,
    warnings: ctx.warnings,
  };
}

function pushRebuiltLedgerRow_(ctx, sourceSheet, sourceId, payload) {
  const qtyIn = num(payload.qtyIn);
  const qtyOut = num(payload.qtyOut);
  if (qtyIn <= 0 && qtyOut <= 0) return false;

  const index = ctx.rows.length + 1;
  const material = resolveMaterialForRebuild_(payload);

  ctx.rows.push({
    ledgerId: payload.ledgerId || "RBL-" + sourceSheet.replace(/[^A-Za-z0-9]/g, "") + "-" + String(sourceId || index).replace(/[^A-Za-z0-9]/g, "").slice(0, 28) + "-" + index,
    date: normalizeDateOnly_(payload.date || todayYmd()),
    module: payload.module || "",
    movementType: payload.movementType || "",
    itemType: material.category || payload.itemType || "",
    materialId: material.materialId || "",
    itemName: material.materialName || payload.itemName || "",
    sourceRef: payload.sourceRef || sourceId || "",
    targetRef: payload.targetRef || "",
    qtyIn,
    qtyOut,
    unit: payload.unit || "Kg",
    remarks: payload.remarks || "",
    status: payload.status || "ACTIVE",
    createdBy: payload.createdBy || "Ledger Rebuild",
    createdAt: ctx.rebuildAt,
    legacySourceSheet: sourceSheet,
    legacySourceId: sourceId || "",
    legacyMaterialName: payload.legacyMaterialName || payload.itemName || "",
    migrationId: payload.migrationId || "LEDGER_REBUILD_FROM_SOURCE",
    migratedAt: payload.migratedAt || ctx.rebuildAt,
  });

  ctx.sourceCounts[sourceSheet] = (ctx.sourceCounts[sourceSheet] || 0) + 1;
  return true;
}

function resolveMaterialForRebuild_(payload = {}) {
  try {
    return resolveMaterialMaster_(payload.materialId, payload.materialCode || payload.itemName);
  } catch (err) {
    return {
      materialId: "",
      materialCode: "",
      materialName: payload.itemName || "",
      category: normalizeMaterialCategoryForLedger_(payload.itemType) || payload.itemType || "",
      unit: payload.unit || "Kg",
    };
  }
}

function rebuildFromRmInward_(ctx) {
  const rows = getRowsAsObjects("RM_Inward").filter((row) => !isDeleted_(row));
  rows.forEach((row, index) => {
    if (String(row.qcStatus || "").toUpperCase() && String(row.qcStatus || "").toUpperCase() !== "APPROVED") return;
    if (String(row.status || "").toUpperCase() === "QC_PENDING") return;

    const sourceId = String(row.inwardId || row.batchId || "RM-" + (index + 1));
    const lines = parseRmMaterialLines_(row.materialLines, row.material || row.color, row.netWeight || row.quantityKg || row.grossWeight);

    lines.forEach(function(line) {
      const material = materialName_(line.material, "Mixed Material");
      pushRebuiltLedgerRow_(ctx, "RM_Inward", sourceId, {
        date: row.date,
        module: "RM_INWARD",
        movementType: "IN",
        itemType: materialCategory_(material),
        itemName: material,
        sourceRef: row.supplier || sourceId,
        targetRef: sourceId,
        qtyIn: line.quantityKg,
        qtyOut: 0,
        unit: "Kg",
        remarks: "Approved RM receiving rebuilt from RM_Inward",
        createdBy: row.createdBy || "Ledger Rebuild",
      });
    });
  });
}

function rebuildFromGrinderBatches_(ctx) {
  const rows = getRowsAsObjects("Grinder_Batches").filter((row) => !isDeleted_(row));
  rows.forEach((row, index) => {
    const sourceId = String(row.grinderBatchId || row.batchId || "GRIND-" + (index + 1));
    const inputLines = parseManufacturingCompositionRows_(
      row.feedComposition,
      ["material", "materialType", "sourceType", "inputBucket"],
      ["qtyKg", "quantityKg", "consumeQty", "quantity"]
    );

    const inputs = inputLines.length
      ? inputLines
      : [{ material: materialName_(row.inputMaterial, "White PPCP Buckets"), qtyKg: num(row.inputWeightKg) }];

    inputs.forEach(function(input) {
      const inputMaterial = materialName_(input.material, "White PPCP Buckets");
      pushRebuiltLedgerRow_(ctx, "Grinder_Batches", sourceId, {
        date: row.date,
        module: "GRINDER",
        movementType: "OUT",
        itemType: materialCategory_(inputMaterial),
        itemName: inputMaterial,
        sourceRef: sourceId,
        targetRef: sourceId,
        qtyIn: 0,
        qtyOut: num(input.qtyKg),
        unit: "Kg",
        remarks: "Grinder input consumption rebuilt from Grinder_Batches",
        createdBy: row.createdBy || "Ledger Rebuild",
      });
    });

    const outputLines = parseManufacturingCompositionRows_(
      row.outputComposition,
      ["material", "materialType", "outputMaterial"],
      ["qtyKg", "quantityKg", "outputQty", "quantity"]
    );

    const outputs = outputLines.length
      ? outputLines
      : [
          { material: GRINDER_OUTPUT_MATERIAL, qtyKg: num(row.regrindOutputKg) },
          { material: "Dust", qtyKg: num(row.dustKg) },
          { material: "Metal Reject", qtyKg: num(row.metalRejectKg) },
        ];

    outputs.forEach(function(outputRow) {
      const outputMaterial = String(outputRow.material || "").toUpperCase().indexOf("REGRIND") !== -1
        ? GRINDER_OUTPUT_MATERIAL
        : materialName_(outputRow.material, "");

      pushRebuiltLedgerRow_(ctx, "Grinder_Batches", sourceId, {
        date: row.date,
        module: "GRINDER",
        movementType: "IN",
        itemType: materialCategory_(outputMaterial),
        itemName: outputMaterial,
        sourceRef: sourceId,
        targetRef: sourceId,
        qtyIn: num(outputRow.qtyKg),
        qtyOut: 0,
        unit: "Kg",
        remarks: "Grinder output rebuilt from Grinder_Batches",
        createdBy: row.createdBy || "Ledger Rebuild",
      });
    });
  });
}

function rebuildFromWashBatches_(ctx) {
  const rows = getRowsAsObjects("Wash_Batches").filter((row) => !isDeleted_(row));
  rows.forEach((row, index) => {
    const sourceId = String(row.washBatchId || row.batchId || "WASH-" + (index + 1));
    const inputMaterial = normalizeProductionMaterialName_(materialName_(row.inputMaterial, "White Regrind (Unwashed)")).canonicalName;
    const washedMaterial = "White Regrind (Washed)";

    pushRebuiltLedgerRow_(ctx, "Wash_Batches", sourceId, {
      date: row.date,
      module: "WASH",
      movementType: "OUT",
      itemType: materialCategory_(inputMaterial),
      itemName: inputMaterial,
      sourceRef: row.sourceRMId || row.sourceRmInwardId || "",
      targetRef: sourceId,
      qtyIn: 0,
      qtyOut: num(row.inputWeightKg),
      unit: "Kg",
      remarks: "Wash input consumption rebuilt from Wash_Batches",
      createdBy: row.createdBy || "Ledger Rebuild",
    });

    [
      { itemName: washedMaterial, qty: num(row.washedOutputKg), itemType: materialCategory_(washedMaterial), remarks: "Washed material output" },
      { itemName: "Sink Material", qty: num(row.sinkMaterialKg), itemType: "WASTE", remarks: "Wash sink material" },
      { itemName: "Color Reject", qty: num(row.otherColorKg), itemType: "WASTE", remarks: "Wash color reject" },
      { itemName: "Dust", qty: num(row.dustKg), itemType: "WASTE", remarks: "Wash dust" },
      { itemName: "Raffia Reject", qty: num(row.raffiaKg), itemType: "WASTE", remarks: "Wash raffia reject" },
      { itemName: "Wrapper Reject", qty: num(row.wrappersKg), itemType: "WASTE", remarks: "Wash wrapper reject" },
      { itemName: "Micro Plastic", qty: num(row.microPlasticKg), itemType: "WASTE", remarks: "Wash micro plastic" },
      { itemName: "Metal Reject", qty: num(row.ironScrapKg), itemType: "WASTE", remarks: "Wash metal reject" },
      { itemName: "Sludge", qty: num(row.sludgeKg), itemType: "WASTE", remarks: "Wash sludge" },
    ].forEach((output) => {
      pushRebuiltLedgerRow_(ctx, "Wash_Batches", sourceId, {
        date: row.date,
        module: "WASH",
        movementType: "IN",
        itemType: output.itemType,
        itemName: output.itemName,
        sourceRef: sourceId,
        targetRef: sourceId,
        qtyIn: output.qty,
        qtyOut: 0,
        unit: "Kg",
        remarks: output.remarks + " rebuilt from Wash_Batches",
        createdBy: row.createdBy || "Ledger Rebuild",
      });
    });
  });
}

function rebuildFromSortingBatches_(ctx) {
  const rows = getRowsAsObjects("Sorting_Batches").filter((row) => !isDeleted_(row));
  rows.forEach((row, index) => {
    const sourceId = String(row.sortingBatchId || row.batchId || "SORT-" + (index + 1));
    const inputMaterial = normalizeProductionMaterialName_(materialName_(row.inputMaterial, "White Regrind (Washed)")).canonicalName;

    pushRebuiltLedgerRow_(ctx, "Sorting_Batches", sourceId, {
      date: row.date,
      module: "SORTING",
      movementType: "OUT",
      itemType: materialCategory_(inputMaterial),
      itemName: inputMaterial,
      sourceRef: row.sourceWashBatchId || "",
      targetRef: sourceId,
      qtyIn: 0,
      qtyOut: num(row.inputWeightKg),
      unit: "Kg",
      remarks: "Sorting input consumption rebuilt from Sorting_Batches",
      createdBy: row.createdBy || "Ledger Rebuild",
    });

    [
      { itemName: "White Sorted Regrind", qty: num(row.whiteSortedKg || row.acceptedQtyKg), itemType: "WIP", remarks: "Sorting white sorted output" },
      { itemName: "Commodity", qty: num(row.commodityKg), itemType: "WIP", remarks: "Sorting commodity output" },
      { itemName: "Mixed Sorted", qty: num(row.allMixSortedKg), itemType: "WIP", remarks: "Sorting mixed output" },
      { itemName: "White Grey", qty: num(row.whiteGreyKg), itemType: "WIP", remarks: "Sorting white grey output" },
      { itemName: "Color Reject", qty: num(row.rejectedQtyKg), itemType: "WASTE", remarks: "Sorting rejected quantity" },
      { itemName: "Rubber Reject", qty: num(row.rubberRejectKg), itemType: "WASTE", remarks: "Sorting rubber reject" },
      { itemName: "Black Specs Reject", qty: num(row.blackSpecsRejectKg), itemType: "WASTE", remarks: "Sorting black specs reject" },
      { itemName: "Raffia Reject", qty: num(row.raffiaRejectKg), itemType: "WASTE", remarks: "Sorting raffia reject" },
      { itemName: "Rework Material", qty: num(row.recoverableRejectKg), itemType: "WIP", remarks: "Sorting recoverable reject" },
      { itemName: "Sorting Waste", qty: num(row.unrecoverableRejectKg), itemType: "WASTE", remarks: "Sorting unrecoverable reject" },
    ].forEach((output) => {
      pushRebuiltLedgerRow_(ctx, "Sorting_Batches", sourceId, {
        date: row.date,
        module: "SORTING",
        movementType: "IN",
        itemType: output.itemType,
        itemName: output.itemName,
        sourceRef: sourceId,
        targetRef: sourceId,
        qtyIn: output.qty,
        qtyOut: 0,
        unit: "Kg",
        remarks: output.remarks + " rebuilt from Sorting_Batches",
        createdBy: row.createdBy || "Ledger Rebuild",
      });
    });
  });
}

function rebuildFromExtrusionBatches_(ctx) {
  const rows = getRowsAsObjects("Extrusion_Batches").filter((row) => !isDeleted_(row));
  rows.forEach((row, index) => {
    const sourceId = String(row.extrusionBatchId || row.batchId || "EXT-" + (index + 1));
    const inputMaterial = normalizeProductionMaterialName_(materialName_(row.inputMaterial, "White Sorted Regrind")).canonicalName;
    const grade = normalizeFgMaterialName_(row.productionGrade || row.grade || "E1");

    [
      { itemName: inputMaterial, qty: num(row.inputWeightKg || row.totalInputKg), itemType: materialCategory_(inputMaterial), remarks: "Extrusion base input" },
      { itemName: "Virgin PPCP", qty: num(row.virginMaterialKg), itemType: "ADDITIVE", remarks: "Extrusion virgin input" },
      { itemName: "Masterbatch", qty: num(row.masterBatchKg), itemType: "ADDITIVE", remarks: "Extrusion masterbatch input" },
      { itemName: "Battery PPCP", qty: num(row.batteryFlakesKg), itemType: "RM", remarks: "Extrusion battery input" },
      { itemName: "Rework Material", qty: num(row.reworkGranulesKg), itemType: "WIP", remarks: "Extrusion rework input" },
      { itemName: "Lumps", qty: num(row.lumpsReusedKg), itemType: "WASTE", remarks: "Extrusion lumps reused" },
      { itemName: "Purging", qty: num(row.purgingReusedKg), itemType: "WASTE", remarks: "Extrusion purging reused" },
      { itemName: "Anti Oxidant", qty: num(row.antiOxidantKg), itemType: "RM", remarks: "Extrusion anti oxidant input" },
    ].forEach((input) => {
      pushRebuiltLedgerRow_(ctx, "Extrusion_Batches", sourceId, {
        date: row.date,
        module: "EXTRUSION",
        movementType: "OUT",
        itemType: input.itemType,
        itemName: input.itemName,
        sourceRef: row.sourceBatchId || row.sourceSortingBatchId || row.sourceWashBatchId || "",
        targetRef: sourceId,
        qtyIn: 0,
        qtyOut: input.qty,
        unit: "Kg",
        remarks: input.remarks + " rebuilt from Extrusion_Batches",
        createdBy: row.createdBy || "Ledger Rebuild",
      });
    });

    [
      { itemName: grade, qty: num(row.fgOutputKg), itemType: "FG", remarks: "FG output" },
      { itemName: "Lumps", qty: num(row.lumpsKg), itemType: "WASTE", remarks: "Extrusion lumps output" },
      { itemName: "Purging", qty: num(row.purgingKg), itemType: "WASTE", remarks: "Extrusion purging output" },
      { itemName: "Rework Material", qty: num(row.reworkGranulesKg || row.shadeVariationKg), itemType: "WIP", remarks: "Extrusion rework output" },
      { itemName: "Dust", qty: num(row.dustKg), itemType: "WASTE", remarks: "Extrusion dust output" },
      { itemName: "Extrusion Waste", qty: num(row.rejectKg) + num(row.vacuumRejectKg) + num(row.meshRejectKg || row.meshRejectionKg) + num(row.floorSpillageKg) + num(row.microPlasticKg), itemType: "WASTE", remarks: "Extrusion waste output" },
    ].forEach((outputRow) => {
      pushRebuiltLedgerRow_(ctx, "Extrusion_Batches", sourceId, {
        date: row.date,
        module: "EXTRUSION",
        movementType: "IN",
        itemType: outputRow.itemType,
        itemName: outputRow.itemName,
        sourceRef: sourceId,
        targetRef: sourceId,
        qtyIn: outputRow.qty,
        qtyOut: 0,
        unit: "Kg",
        remarks: outputRow.remarks + " rebuilt from Extrusion_Batches",
        createdBy: row.createdBy || "Ledger Rebuild",
      });
    });
  });
}

function rebuildFromDispatches_(ctx) {
  const rows = getRowsAsObjects("Dispatches").filter((row) => !isDeleted_(row));
  rows.forEach((row, index) => {
    const sourceId = String(row.dispatchId || "DISP-" + (index + 1));
    const lines = parseDispatchLines_(row.dispatchLines);
    const fallbackItems = parseFgDispatchItems_(row.grade || row.productionGrade, num(row.quantityKg));
    const items = [];

    if (lines.length) {
      lines.forEach((line) => {
        parseFgDispatchItems_(line.grade || row.grade || row.productionGrade, num(line.dispatchQtyKg || line.quantityKg)).forEach((item) => {
          items.push({
            itemName: item.itemName,
            quantityKg: item.quantityKg,
            sourceRef: line.sourceExtrusionBatchId || row.sourceExtrusionBatchId || row.linkedFgBatchId || sourceId,
          });
        });
      });
    } else {
      fallbackItems.forEach((item) => {
        items.push({
          itemName: item.itemName,
          quantityKg: item.quantityKg,
          sourceRef: row.sourceExtrusionBatchId || row.linkedFgBatchId || sourceId,
        });
      });
    }

    if (!items.length && num(row.quantityKg) > 0) {
      items.push({
        itemName: normalizeFgMaterialName_(row.grade || row.productionGrade || "UNKNOWN"),
        quantityKg: num(row.quantityKg),
        sourceRef: row.sourceExtrusionBatchId || row.linkedFgBatchId || sourceId,
      });
    }

    items.forEach((item) => {
      pushRebuiltLedgerRow_(ctx, "Dispatches", sourceId, {
        date: row.date,
        module: "DISPATCH",
        movementType: "OUT",
        itemType: "FG",
        itemName: item.itemName,
        sourceRef: item.sourceRef,
        targetRef: sourceId,
        qtyIn: 0,
        qtyOut: item.quantityKg,
        unit: "Kg",
        remarks: "Dispatch rebuilt from Dispatches",
        createdBy: row.createdBy || "Ledger Rebuild",
      });
    });
  });
}

function rebuildFromStoresInward_(ctx) {
  const rows = getRowsAsObjects("Stores_Inward").filter((row) => !isDeleted_(row));
  rows.forEach((row, index) => {
    const sourceId = String(row.inwardId || row.storesInwardId || "SIN-" + (index + 1));
    pushRebuiltLedgerRow_(ctx, "Stores_Inward", sourceId, {
      date: row.date,
      module: "STORES",
      movementType: "IN",
      itemType: "STORE",
      itemName: row.itemName || "",
      sourceRef: row.supplier || row.vendor || "",
      targetRef: sourceId,
      qtyIn: num(row.qty),
      qtyOut: 0,
      unit: row.unit || "Nos",
      remarks: "Stores inward rebuilt from Stores_Inward",
      createdBy: row.createdBy || "Ledger Rebuild",
    });
  });
}

function rebuildFromStoresIssue_(ctx) {
  const rows = getRowsAsObjects("Stores_Issue").filter((row) => !isDeleted_(row));
  rows.forEach((row, index) => {
    const sourceId = String(row.issueId || "ISS-" + (index + 1));
    pushRebuiltLedgerRow_(ctx, "Stores_Issue", sourceId, {
      date: row.date,
      module: "STORES",
      movementType: "OUT",
      itemType: "STORE",
      itemName: row.itemName || "",
      sourceRef: sourceId,
      targetRef: row.department || row.issuedTo || "",
      qtyIn: 0,
      qtyOut: num(row.qty),
      unit: row.unit || "Nos",
      remarks: "Stores issue rebuilt from Stores_Issue",
      createdBy: row.createdBy || "Ledger Rebuild",
    });
  });
}

function rebuildFromInventoryAdjustments_(ctx) {
  const rows = getRowsAsObjects("Inventory_Adjustments")
    .filter((row) => !isDeleted_(row))
    .filter((row) => String(row.status || "").toUpperCase() === "APPROVED");

  rows.forEach((row, index) => {
    const sourceId = String(row.adjustmentId || "IA-" + (index + 1));
    const quantityKg = num(row.quantityKg || row.quantity);
    const itemName = String(row.itemCode || row.material || row.itemName || "").trim();
    pushRebuiltLedgerRow_(ctx, "Inventory_Adjustments", sourceId, {
      date: row.date,
      module: "INVENTORY_ADJUSTMENT",
      movementType: quantityKg >= 0 ? "IN" : "OUT",
      itemType: row.itemType || materialCategory_(itemName),
      itemName,
      sourceRef: row.sourceRef || "",
      targetRef: sourceId,
      qtyIn: quantityKg > 0 ? quantityKg : 0,
      qtyOut: quantityKg < 0 ? Math.abs(quantityKg) : 0,
      unit: "Kg",
      remarks: "Approved adjustment rebuilt from Inventory_Adjustments",
      createdBy: row.approvedBy || row.createdBy || "Ledger Rebuild",
    });
  });
}

function auditJuneMaterialFlowV1(data = {}) {
  const periodMonth = data.periodMonth || "2026-06";
  const movements = buildJuneV1MaterialMovements_(periodMonth);
  const masterRows = safeRows_("Material_Master");
  const productionRows = safeRows_("Production_Materials");
  const rmRows = safeRows_("RM_Inward").filter((row) => materialFlowRowInPeriod_(row, periodMonth));
  const dispatchRows = safeRows_("Dispatches").filter((row) => materialFlowRowInPeriod_(row, periodMonth));
  const monthCloseRows = safeRows_("Month_Close").filter((row) => materialFlowRowInPeriod_(row, periodMonth));
  const materialIndex = {};
  const balances = {};

  movements.forEach((move) => {
    const key = move.originalName || "UNKNOWN";
    const normalized = materialFlowNormalizeMaterial_(move.originalName, move.category);
    if (!materialFlowIsManufacturingCategory_(normalized.category)) return;

    if (!materialIndex[key]) {
      materialIndex[key] = {
        originalName: key,
        sources: {},
        currentInferredCategory: move.category || normalized.category || "UNKNOWN",
        suggestedNormalizedName: normalized.name,
        suggestedNormalizedCategory: normalized.category,
        shouldMergeInto: normalized.mergeInto,
        quantityImpactBySource: {},
        netQuantityImpact: 0,
        causesNegativeInventory: false,
        appearsInMonthClose: false,
        appearsInProductionDropdowns: false,
        appearsInRMInwardDropdowns: false,
        appearsInDispatchDropdowns: false,
        examples: [],
      };
    }

    const item = materialIndex[key];
    item.sources[move.sourceSheet] = true;
    item.quantityImpactBySource[move.sourceSheet] =
      (item.quantityImpactBySource[move.sourceSheet] || 0) + num(move.qtyIn) - num(move.qtyOut);
    item.netQuantityImpact += num(move.qtyIn) - num(move.qtyOut);
    if (item.examples.length < 5) {
      item.examples.push({
        sourceSheet: move.sourceSheet,
        sourceId: move.sourceId,
        field: move.field,
        qtyIn: num(move.qtyIn),
        qtyOut: num(move.qtyOut),
      });
    }

    balances[normalized.name] = (balances[normalized.name] || 0) + num(move.qtyIn) - num(move.qtyOut);
  });

  addMasterOnlyMaterials_(materialIndex, masterRows, "Material_Master");
  addMasterOnlyMaterials_(materialIndex, productionRows, "Production_Materials");
  markDropdownAppearances_(materialIndex, masterRows, productionRows, rmRows, dispatchRows);
  markMonthCloseAppearances_(materialIndex, monthCloseRows);

  const materials = Object.keys(materialIndex).sort().map((key) => {
    const item = materialIndex[key];
    item.sources = Object.keys(item.sources).sort();
    item.normalizedBalance = balances[item.suggestedNormalizedName] || 0;
    item.causesNegativeInventory = item.normalizedBalance < -0.01;
    return item;
  });

  return output({
    ok: true,
    route: "materialFlow.auditJune2026",
    periodMonth,
    materialCount: materials.length,
    materials,
    balances,
    negativeInventory: materials.filter((item) => item.causesNegativeInventory),
    directFlowDiagnosis: diagnoseJuneDirectFlow_(periodMonth, movements),
    proposedNormalizationMap: proposedJuneMaterialNormalizationMap_(),
    migrationFunction: "migrateJuneMaterialFlowToV1(dryRun)",
    dryRunUrl: "?fn=materialFlow.migrateJuneToV1&dryRun=true",
    message: "Diagnosis only. No data was changed.",
  });
}

function migrateJuneMaterialFlowToV1(dryRun) {
  const isDryRun = dryRun !== false && String(dryRun || "true").toLowerCase() !== "false";
  const periodMonth = "2026-06";
  const movements = buildJuneV1MaterialMovements_(periodMonth);
  const rebuiltRows = movementsToJuneLedgerRows_(movements, periodMonth);
  const beforeRows = safeRows_("Inventory_Ledger").filter((row) => !isDeleted_(row));
  const beforeBalances = materialFlowBalancesFromLedger_(beforeRows, periodMonth);
  const afterBalances = materialFlowBalancesFromLedger_(rebuiltRows, periodMonth);

  const result = {
    ok: true,
    dryRun: isDryRun,
    migrationFunction: "migrateJuneMaterialFlowToV1",
    periodMonth,
    rowsBefore: beforeRows.filter((row) => isJuneManufacturingLedgerRow_(row, periodMonth)).length,
    rowsAfter: rebuiltRows.length,
    beforeBalances,
    afterBalances,
    whiteSortedReconciliation: {
      beforeWhiteSorted: num(beforeBalances["White Sorted"] || 0) + num(beforeBalances["White Sorted Flakes"] || 0),
      afterWhiteSorted: num(afterBalances["White Sorted"] || 0) + num(afterBalances["White Sorted Flakes"] || 0),
      negativeWhiteSortedRemoved:
        num(beforeBalances["White Sorted"] || 0) + num(beforeBalances["White Sorted Flakes"] || 0) < -0.01 &&
        num(afterBalances["White Sorted"] || 0) + num(afterBalances["White Sorted Flakes"] || 0) >= -0.01,
    },
    proposedNormalizationMap: proposedJuneMaterialNormalizationMap_(),
    warnings: [
      "Live migration rewrites June Inventory_Ledger rows from source sheets only.",
      "Source operational sheets are not deleted or overwritten.",
      "Run dryRun=true first and review negativeInventory/materials before live run.",
    ],
  };

  if (isDryRun) {
    result.message = "Dry run complete. No data was changed.";
    return result;
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    return { ok: false, error: "June material flow migration is already in progress" };
  }

  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const ledgerSheet = getSheet("Inventory_Ledger");
    const headers = inventoryLedgerHeaders_();
    ensureHeaders_("Inventory_Ledger", headers);
    const backupSheetName = backupInventoryLedger_(ss, ledgerSheet);
    const keepRows = beforeRows.filter((row) => !isJuneManufacturingLedgerRow_(row, periodMonth));
    clearInventoryLedger_(ledgerSheet, headers);
    writeInventoryLedgerRows_(ledgerSheet, headers, keepRows.concat(rebuiltRows));
    result.backupSheetName = backupSheetName;
    result.message = "June Inventory_Ledger rows were backed up and rebuilt using V1 material-flow mapping.";
    return result;
  } finally {
    lock.releaseLock();
  }
}

function materialFlowMigrationPlanJune2026(data = {}) {
  const periodMonth = data.periodMonth || "2026-06";
  const beforeRows = safeRows_("Inventory_Ledger").filter((row) => !isDeleted_(row));
  const rebuiltRows = movementsToJuneLedgerRows_(buildJuneV1MaterialMovements_(periodMonth), periodMonth);
  const beforeBalances = materialFlowBalancesFromLedger_(beforeRows, periodMonth);
  const afterBalances = materialFlowBalancesFromLedger_(rebuiltRows, periodMonth);

  return {
    ok: true,
    route: "materialFlow.migrationPlanJune2026",
    periodMonth,
    beforeBalances: compactManufacturingBalances_(beforeBalances),
    afterProjectedBalances: compactManufacturingBalances_(afterBalances),
    whiteSorted: whiteSortedReconciliation_(beforeBalances, afterBalances),
    negativeBalancesBefore: negativeManufacturingBalances_(beforeBalances),
    negativeBalancesAfter: negativeManufacturingBalances_(afterBalances),
    rowsToChangeCount: beforeRows.filter((row) => isJuneManufacturingLedgerRow_(row, periodMonth)).length,
    projectedRowsToWrite: rebuiltRows.length,
    backupSheetNamesThatWouldBeCreated: [previewBackupSheetName_("Inventory_Ledger_Backup")],
    warnings: juneMigrationWarnings_(),
  };
}

function migrateJuneMaterialFlowToV1Chunk(data = {}) {
  const periodMonth = data.periodMonth || "2026-06";
  const dryRun = data.dryRun !== false && String(data.dryRun || "true").toLowerCase() !== "false";
  const chunkSize = Math.max(1, Math.min(500, Number(data.chunkSize || 100)));
  const cursor = Math.max(0, Number(data.cursor || 0));
  const rebuiltRows = movementsToJuneLedgerRows_(buildJuneV1MaterialMovements_(periodMonth), periodMonth);
  const beforeRows = safeRows_("Inventory_Ledger").filter((row) => !isDeleted_(row));
  const beforeBalances = materialFlowBalancesFromLedger_(beforeRows, periodMonth);
  const afterBalances = materialFlowBalancesFromLedger_(rebuiltRows, periodMonth);
  const end = Math.min(cursor + chunkSize, rebuiltRows.length);
  const chunkRows = rebuiltRows.slice(cursor, end);
  const done = end >= rebuiltRows.length;
  const summary = {
    periodMonth,
    dryRun,
    cursor,
    chunkSize,
    processedRows: chunkRows.length,
    nextCursor: done ? "" : String(end),
    done,
    totalRows: rebuiltRows.length,
    whiteSorted: whiteSortedReconciliation_(beforeBalances, afterBalances),
    negativeBalancesAfter: negativeManufacturingBalances_(afterBalances),
    warnings: juneMigrationWarnings_(),
  };

  if (dryRun) {
    return {
      ok: true,
      route: "materialFlow.migrateJuneToV1Chunk",
      message: "Dry-run chunk complete. No data was changed.",
      processedRows: chunkRows.length,
      nextCursor: summary.nextCursor,
      done,
      summary,
    };
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    return { ok: false, error: "June material flow chunk migration is already in progress" };
  }

  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const ledgerSheet = getSheet("Inventory_Ledger");
    const headers = inventoryLedgerHeaders_();
    ensureHeaders_("Inventory_Ledger", headers);
    let backupSheetName = "";

    if (cursor === 0) {
      backupSheetName = backupInventoryLedger_(ss, ledgerSheet);
      const keepRows = beforeRows.filter((row) => !isJuneManufacturingLedgerRow_(row, periodMonth));
      clearInventoryLedger_(ledgerSheet, headers);
      writeInventoryLedgerRows_(ledgerSheet, headers, keepRows);
    }

    appendInventoryLedgerRows_(ledgerSheet, headers, chunkRows);

    return {
      ok: true,
      route: "materialFlow.migrateJuneToV1Chunk",
      backupSheetName,
      processedRows: chunkRows.length,
      nextCursor: summary.nextCursor,
      done,
      summary,
    };
  } finally {
    lock.releaseLock();
  }
}

function verifyJuneMaterialFlowV1(data = {}) {
  const periodMonth = data.periodMonth || "2026-06";
  const balances = materialFlowBalancesFromLedger_(safeRows_("Inventory_Ledger"), periodMonth);
  const monthCloseMaterials = ["White Flakes", "Washed White Flakes", "Washed Mixed", "White Sorted Flakes", "E1", "E2", "E3", "E4", "E5", "Sink Material", "Dust", "Wrapper Reject", "Micro Plastic", "Lumps", "Purging", "Rework Material"];

  return {
    ok: true,
    route: "materialFlow.verifyJune2026",
    periodMonth,
    negativeManufacturingMaterials: negativeManufacturingBalances_(balances),
    fgBalances: {
      E1: num(balances.E1),
      E2: num(balances.E2),
      E3: num(balances.E3),
      E4: num(balances.E4),
      E5: num(balances.E5),
    },
    wipBalances: {
      washedMixed: num(balances["Washed Mixed"]),
      washedWhiteFlakes: num(balances["Washed White Flakes"]),
      whiteSortedFlakes: num(balances["White Sorted Flakes"]),
    },
    monthCloseMaterialList: monthCloseMaterials.map((material) => ({
      material,
      balance: num(balances[material]),
      category: materialFlowNormalizeMaterial_(material, "").category,
    })),
  };
}

function rebuildJuneLedgerV1(data = {}) {
  const periodMonth = "2026-06";
  const isDryRun = data.dryRun !== false && String(data.dryRun || "true").toLowerCase() !== "false";
  const beforeRows = safeRows_("Inventory_Ledger").filter((row) => !isDeleted_(row));
  const rebuiltRows = buildJuneLedgerV1Rows_(periodMonth);
  const beforeBalances = materialFlowBalancesFromLedger_(beforeRows, periodMonth);
  const afterBalances = materialFlowBalancesFromLedger_(rebuiltRows, periodMonth);
  const juneRowsToReplace = beforeRows.filter((row) => isJuneManufacturingLedgerRow_(row, periodMonth));
  const summary = juneLedgerV1CompactSummary_(beforeBalances, afterBalances, juneRowsToReplace.length, rebuiltRows.length);

  const result = {
    ok: true,
    route: "materialFlow.rebuildJuneLedgerV1",
    periodMonth,
    dryRun: isDryRun,
    sourceSheetsUsed: [
      "RM_Inward",
      "Wash_Batches",
      "Sorting_Batches",
      "Extrusion_Batches",
      "Dispatches",
      "Inventory_Adjustments(APPROVED only)",
    ],
    backupSheetName: isDryRun ? previewBackupSheetName_("Inventory_Ledger_Backup") : "",
    summary,
    message: isDryRun
      ? "Dry run complete. No data was changed."
      : "June manufacturing Inventory_Ledger rows were backed up and rebuilt from source sheets.",
  };

  if (isDryRun) return result;

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    return { ok: false, route: "materialFlow.rebuildJuneLedgerV1", error: "June ledger rebuild is already in progress" };
  }

  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const ledgerSheet = getSheet("Inventory_Ledger");
    const headers = inventoryLedgerHeaders_();
    ensureHeaders_("Inventory_Ledger", headers);
    const backupSheetName = backupInventoryLedger_(ss, ledgerSheet);
    const keepRows = beforeRows.filter((row) => !isJuneManufacturingLedgerRow_(row, periodMonth));
    clearInventoryLedger_(ledgerSheet, headers);
    writeInventoryLedgerRows_(ledgerSheet, headers, keepRows.concat(rebuiltRows));
    result.backupSheetName = backupSheetName;
    result.summary.rowsPreserved = keepRows.length;
    result.summary.rowsWrittenTotal = keepRows.length + rebuiltRows.length;
    return result;
  } finally {
    lock.releaseLock();
  }
}

function verifyJuneLedgerV1(data = {}) {
  const periodMonth = "2026-06";
  const rows = safeRows_("Inventory_Ledger").filter((row) => !isDeleted_(row));
  const balances = materialFlowBalancesFromLedger_(rows, periodMonth);
  const monthCloseMaterials = juneManufacturingMonthCloseMaterials_();

  return {
    ok: true,
    route: "materialFlow.verifyJuneLedgerV1",
    periodMonth,
    juneManufacturingLedgerRows: rows.filter((row) => isJuneManufacturingLedgerRow_(row, periodMonth)).length,
    negativeManufacturingMaterials: negativeManufacturingBalances_(balances),
    fgBalances: {
      E1: num(balances.E1),
      E2: num(balances.E2),
      E3: num(balances.E3),
      E4: num(balances.E4),
      E5: num(balances.E5),
    },
    wipBalances: {
      washedMixed: num(balances["Washed Mixed"]),
      washedWhiteFlakes: num(balances["Washed White Flakes"]),
      whiteSortedFlakes: num(balances["White Sorted Flakes"]),
    },
    monthCloseMaterialList: monthCloseMaterials.map((material) => ({
      material,
      balance: num(balances[material]),
      category: materialFlowNormalizeMaterial_(material, "").category,
    })),
  };
}

function getMonthCloseMaterialGroups(data = {}) {
  const periodReceived = data.periodMonth || data.month || data.date || "";
  const periodMonth = normalizeMonthClosePeriod_(periodReceived) || normalizeMonthClosePeriod_(todayYmd());
  return buildCleanMonthCloseMaterialView_(periodMonth, periodReceived);
}

function previewMonthCloseMaterialRepair(data = {}) {
  const periodMonth = String(data.periodMonth || data.month || "2026-06").slice(0, 7);
  if (periodMonth !== "2026-06") {
    return {
      ok: false,
      route: "monthClose.materialRepair.preview",
      periodMonth,
      error: "Only June 2026 has an approved controlled repair plan. No data changed.",
    };
  }

  const preview = rebuildJuneLedgerV1({ dryRun: true });
  return {
    ok: true,
    route: "monthClose.materialRepair.preview",
    periodMonth,
    repair: preview,
    cleanMaterialView: buildCleanMonthCloseMaterialView_(periodMonth),
  };
}

function runMonthCloseMaterialRepair(data = {}) {
  const periodMonth = String(data.periodMonth || data.month || "2026-06").slice(0, 7);
  const confirm = String(data.confirm || "").toUpperCase();
  if (periodMonth !== "2026-06") {
    return {
      ok: false,
      route: "monthClose.materialRepair.run",
      periodMonth,
      error: "Only June 2026 has an approved controlled repair plan. No data changed.",
    };
  }

  if (confirm !== "YES") {
    return {
      ok: false,
      route: "monthClose.materialRepair.run",
      periodMonth,
      error: "Live repair requires confirm=YES. No data changed.",
    };
  }

  const repair = rebuildJuneLedgerV1({ dryRun: false });
  return {
    ok: true,
    route: "monthClose.materialRepair.run",
    periodMonth,
    repair,
    cleanMaterialView: buildCleanMonthCloseMaterialView_(periodMonth),
  };
}

function verifyMonthCloseMaterialRepair(data = {}) {
  const periodMonth = String(data.periodMonth || data.month || "2026-06").slice(0, 7);
  return {
    ok: true,
    route: "monthClose.materialRepair.verify",
    periodMonth,
    juneLedger: periodMonth === "2026-06" ? verifyJuneLedgerV1({ periodMonth }) : null,
    cleanMaterialView: buildCleanMonthCloseMaterialView_(periodMonth),
  };
}

function buildCleanMonthCloseMaterialView_(periodMonth, periodReceived) {
  createSheetIfMissing_("Material_Master", materialMasterHeaders_());
  ensureHeaders_("Material_Master", materialMasterHeaders_());
  const periodNormalized = normalizeMonthClosePeriod_(periodMonth) || periodMonth;
  const periodDiagnostics = monthCloseSheetPeriodDiagnostics_(periodNormalized);
  const ledgerRows = safeRows_("Inventory_Ledger").filter((row) => !isDeleted_(row));
  const materialMasterRows = safeRows_("Material_Master").filter((row) => {
    const status = String(row.status || "ACTIVE").toUpperCase();
    const category = monthCloseMaterialCategory_(row);
    return status !== "DELETED" && status !== "INACTIVE" && monthCloseIsStockCategory_(category);
  });
  const masterRows = monthCloseUniqueMasterRows_(materialMasterRows);
  const masterIndex = monthCloseMaterialMasterIndex_(masterRows);
  const groups = {
    RM: [],
    WIP: [],
    FG: [],
    WASTE: [],
    REWORK: [],
    ADDITIVE: [],
  };
  const groupTotals = {
    RM: 0,
    WIP: 0,
    FG: 0,
    WASTE: 0,
    REWORK: 0,
    ADDITIVE: 0,
  };
  const balances = {};
  const movementStats = {};
  const priorClosedOpening = monthClosePriorPhysicalOpening_(periodNormalized, masterRows);
  const monthEndBalances = {};
  const operationalView = monthCloseOperationalStockStats_(periodNormalized, masterIndex);
  const operationalStats = operationalView.stats || {};
  const unmappedLedgerRows = [];

  masterRows.forEach((material) => {
    const category = monthCloseMaterialCategory_(material);
    const materialId = String(material.materialId || material.materialCode || material.materialName || "").trim();
    if (!materialId || !groups[category]) return;
    balances[materialId] = monthCloseOpeningFromPriorClose_(material, priorClosedOpening);
    movementStats[materialId] = {
      opening: round2(balances[materialId]),
      inward: 0,
      consumed: 0,
      produced: 0,
      dispatched: 0,
      issued: 0,
      approvedAdjustments: 0,
    };
  });

  ledgerRows.forEach((row) => {
    const rawType = String(row.itemType || "").toUpperCase();

    const clean = materialFlowCleanName_(row.itemName || row.materialName || row.materialCode || "");
    const normalized = materialFlowNormalizeMaterial_(clean, row.itemType);
    const material = matchMonthCloseMaterial_(row, normalized, masterIndex);
    const qty = num(row.qtyIn) - num(row.qtyOut);
    const inSelectedMonth = materialFlowRowInPeriod_(row, periodNormalized);
    const beforeSelectedMonth = monthCloseRowBeforePeriod_(row, periodNormalized);

    if (!clean || clean === "Recipe Text" || materialFlowIsQualityReference_(row.itemName) || !material) {
      if (inSelectedMonth && unmappedLedgerRows.length < 25 && Math.abs(qty) > 0.001) {
        unmappedLedgerRows.push({
          ledgerId: row.ledgerId || "",
          date: row.date || "",
          itemName: row.itemName || "",
          itemType: row.itemType || "",
          qtyIn: num(row.qtyIn),
          qtyOut: num(row.qtyOut),
          reason: clean === "Recipe Text"
            ? "Recipe/feed text is not a material"
            : !clean || materialFlowIsQualityReference_(row.itemName)
            ? "Quality reference or blank material"
            : "No matching Material Master row",
        });
      }
      return;
    }

    const key = String(material.materialId || material.materialCode || material.materialName || "").trim();
    const stats = movementStats[key] || {
      opening: 0,
      inward: 0,
      consumed: 0,
      produced: 0,
      dispatched: 0,
      issued: 0,
      approvedAdjustments: 0,
    };

    if (beforeSelectedMonth && !priorClosedOpening.hasPriorClose) {
      balances[key] = round2(num(balances[key]) + qty);
      stats.opening = round2(num(stats.opening) + qty);
      movementStats[key] = stats;
      return;
    }

    if (!inSelectedMonth) return;

    const bucket = classifyMonthCloseLedgerMovement_(row);
    if (bucket === "monthEndBalance") {
      monthEndBalances[key] = round2(qty || num(row.qtyIn) || -num(row.qtyOut));
      movementStats[key] = stats;
      return;
    }

    if (bucket === "approvedAdjustments") {
      stats.approvedAdjustments = round2(num(stats.approvedAdjustments) + qty);
      balances[key] = round2(num(balances[key]) + qty);
    } else if (bucket === "consumed" || bucket === "dispatched" || bucket === "issued") {
      const outQty = Math.abs(num(row.qtyOut) || (qty < 0 ? qty : 0));
      stats[bucket] = round2(num(stats[bucket]) + outQty);
      balances[key] = round2(num(balances[key]) - outQty);
    } else {
      const inQty = Math.abs(num(row.qtyIn) || (qty > 0 ? qty : 0));
      stats[bucket] = round2(num(stats[bucket]) + inQty);
      balances[key] = round2(num(balances[key]) + inQty);
    }
    movementStats[key] = stats;
  });

  masterRows
    .slice()
    .sort((a, b) => String(a.materialName || "").localeCompare(String(b.materialName || "")))
    .forEach((material) => {
      const category = monthCloseMaterialCategory_(material);
      if (!groups[category]) return;
      const key = String(material.materialId || material.materialCode || material.materialName || "").trim();
      const balance = Object.prototype.hasOwnProperty.call(monthEndBalances, key)
        ? round2(monthEndBalances[key])
        : round2(balances[key]);
      let stats = movementStats[key] || {};
      let finalBalance = balance;
      const ops = operationalStats[key];
      const ledgerHasCurrentMovement =
        Math.abs(num(stats.inward)) > 0.01 ||
        Math.abs(num(stats.consumed)) > 0.01 ||
        Math.abs(num(stats.produced)) > 0.01 ||
        Math.abs(num(stats.dispatched)) > 0.01 ||
        Math.abs(num(stats.issued)) > 0.01 ||
        Math.abs(num(stats.approvedAdjustments)) > 0.01 ||
        Object.prototype.hasOwnProperty.call(monthEndBalances, key);
      if (!ledgerHasCurrentMovement && ops && monthCloseStatsHasMovement_(ops)) {
        stats = {
          opening: num(stats.opening),
          inward: num(ops.inward),
          consumed: num(ops.consumed),
          produced: num(ops.produced),
          dispatched: num(ops.dispatched),
          issued: num(ops.issued),
          approvedAdjustments: num(ops.approvedAdjustments),
        };
        finalBalance = round2(num(stats.opening) + num(ops.inward) + num(ops.produced) - num(ops.consumed) - num(ops.dispatched) - num(ops.issued) + num(ops.approvedAdjustments));
      }
      groups[category].push({
        materialId: material.materialId || "",
        materialCode: material.materialCode || "",
        materialName: material.materialName || material.name || "",
        category,
        unit: material.unit || "Kg",
        opening: round2(stats.opening),
        inward: round2(stats.inward),
        consumed: round2(stats.consumed),
        produced: round2(stats.produced),
        dispatched: round2(stats.dispatched),
        issued: round2(stats.issued),
        approvedAdjustments: round2(stats.approvedAdjustments),
        adjusted: round2(stats.approvedAdjustments),
        balance: finalBalance,
        systemStock: finalBalance,
        systemStockSource: !ledgerHasCurrentMovement && ops && monthCloseStatsHasMovement_(ops) ? "operational sheets" : "inventory ledger",
        status: material.status || "ACTIVE",
      });
    groupTotals[category] = round2(groupTotals[category] + finalBalance);
  });

  const invalidLedgerRows = findInvalidManufacturingLedgerRows_(ledgerRows, periodNormalized);
  const exceptionRows = monthCloseGuaranteedExceptionRows_(operationalView, groups);
  const movementSourceSummary = monthCloseMovementSourceSummary_(operationalView, groups, exceptionRows);
  movementSourceSummary.periodReceived = periodReceived || periodMonth || "";
  movementSourceSummary.periodNormalized = periodNormalized;
  movementSourceSummary.sheetRowCounts = periodDiagnostics.sheetRowCounts;
  movementSourceSummary.dateFieldDetected = periodDiagnostics.dateFieldDetected;
  movementSourceSummary.periodDiagnostics = periodDiagnostics;
  movementSourceSummary.mappingWarnings = (movementSourceSummary.mappingWarnings || []).concat(periodDiagnostics.warnings || []);

  return {
    ok: true,
    route: "monthClose.materialGroups",
    periodMonth: periodNormalized,
    periodReceived: periodReceived || periodMonth || "",
    periodNormalized,
    sheetRowCounts: periodDiagnostics.sheetRowCounts,
    dateFieldDetected: periodDiagnostics.dateFieldDetected,
    periodDiagnostics,
    source: "Material_Master + Inventory_Ledger",
    rule: "Month Close rows come only from Material_Master. STORE, recipe text, quality refs and unmapped free-text ledger rows are excluded from manufacturing close.",
    groupTotals,
    systemFields: {
      rmClosingKg: round2(groupTotals.RM),
      washClosingKg: round2(groupTotals.WIP),
      sortingClosingKg: 0,
      fgClosingKg: round2(groupTotals.FG),
      wasteClosingKg: round2(groupTotals.WASTE),
      reworkClosingKg: round2(groupTotals.REWORK),
      additiveClosingKg: round2(groupTotals.ADDITIVE),
      totalWipClosingKg: round2(groupTotals.WIP),
    },
    groups,
    rows: monthCloseStockCategories_().reduce((list, category) => list.concat(groups[category]), []),
    exceptionRows,
    storesSummary: monthCloseStoresSummary_(periodNormalized),
    movementSourceSummary,
    materialCount: masterRows.length,
    unmappedLedgerRows,
    invalidLedgerRows,
    negativeManufacturingMaterials: monthCloseNegativeMasterBalances_(groups),
    debug: monthCloseMaterialDebug_(groups, priorClosedOpening),
  };
}

function monthCloseMaterialCategory_(row) {
  const raw = String(row.category || row.materialType || row.materialCategory || row.bucketType || "").trim().toUpperCase();
  if (raw === "RAW MATERIAL" || raw === "RAW_MATERIAL" || raw === "RM MATERIAL" || raw === "RM MATERIALS") return "RM";
  if (raw === "WORK IN PROCESS" || raw === "WORK_IN_PROCESS" || raw === "WIP MATERIAL" || raw === "WIP MATERIALS") return "WIP";
  if (raw === "FINISHED GOODS" || raw === "FINISHED_GOODS" || raw === "FG MATERIAL" || raw === "FG MATERIALS") return "FG";
  if (raw === "REWORK MATERIAL" || raw === "REWORK MATERIALS") return "REWORK";
  if (raw === "WASTE MATERIAL" || raw === "WASTE MATERIALS") return "WASTE";
  if (raw === "ADDITIVE MATERIAL" || raw === "ADDITIVE MATERIALS") return "ADDITIVE";
  if (raw === "STORE" || raw === "STORES" || raw === "STORE ITEM" || raw === "STORE ITEMS") return "STORE";
  return normalizeMaterialCategoryForLedger_(raw);
}

function monthCloseStockCategories_() {
  return ["RM", "WIP", "FG", "REWORK", "WASTE", "ADDITIVE"];
}

function monthCloseIsStockCategory_(category) {
  return monthCloseStockCategories_().indexOf(String(category || "").toUpperCase()) !== -1;
}

function monthCloseUniqueMasterRows_(rows) {
  const seen = {};
  return rows.filter((row) => {
    const key = monthCloseMaterialKey_(row.materialId || row.materialCode || row.materialName);
    if (!key || seen[key]) return false;
    seen[key] = true;
    return true;
  });
}

function classifyMonthCloseLedgerMovement_(row) {
  const module = String(row.module || row.legacySourceSheet || "").toUpperCase();
  const movementType = String(row.movementType || "").toUpperCase();
  const itemType = String(row.itemType || "").toUpperCase();
  const qtyIn = num(row.qtyIn);
  const qtyOut = num(row.qtyOut);

  if (/MONTH.*END.*BALANCE|CLOSING.*BALANCE|SYSTEM.*BALANCE/.test(movementType)) return "monthEndBalance";
  if (/OPEN|OPENING/.test(module) || /OPEN|OPENING/.test(movementType)) return "opening";
  if (/INVENTORY_ADJUSTMENT|ADJUSTMENT/.test(module) || /ADJUSTMENT/.test(movementType)) return "approvedAdjustments";
  if (itemType === "STORE" && qtyOut > qtyIn) return "issued";
  if (/DISPATCH/.test(module) || /DISPATCH/.test(movementType)) return "dispatched";
  if (/RM_INWARD|RECEIVING|INWARD/.test(module)) return "inward";
  if (/WASH|SORT|EXTRUSION|PRODUCTION|TRANSFORMATION/.test(module)) {
    return qtyOut > qtyIn ? "consumed" : "produced";
  }
  return qtyOut > qtyIn ? "consumed" : "inward";
}

function monthClosePriorPhysicalOpening_(periodMonth, masterRows) {
  const result = { hasPriorClose: false, periodMonth: "", values: {} };
  const priorClose = safeRows_("Month_Close")
    .filter((row) => {
      const status = String(row.status || "").toUpperCase();
      const closeMonth = String(row.periodMonth || "").slice(0, 7);
      return closeMonth && closeMonth < periodMonth && status === "CLOSED";
    })
    .sort((a, b) => String(a.periodMonth || "").localeCompare(String(b.periodMonth || "")))
    .pop();

  if (!priorClose) return result;

  const closeMonth = String(priorClose.periodMonth || "").slice(0, 7);
  const physical = safeRows_("Physical_Counts")
    .filter((row) => String(row.periodMonth || "").slice(0, 7) === closeMonth)
    .sort((a, b) => String(a.savedAt || a.createdAt || "").localeCompare(String(b.savedAt || b.createdAt || "")))
    .pop();

  if (!physical) return result;

  const values = monthCloseParsePhysicalLineOpenings_(physical.materialPhysicalLinesJson, masterRows);
  result.hasPriorClose = Object.keys(values).length > 0;
  result.periodMonth = closeMonth;
  result.values = values;
  return result;
}

function monthCloseParsePhysicalLineOpenings_(jsonValue, masterRows) {
  const values = {};
  let rows = [];
  try {
    rows = typeof jsonValue === "string" ? JSON.parse(jsonValue || "[]") : jsonValue || [];
  } catch (err) {
    rows = [];
  }
  if (!Array.isArray(rows)) return values;

  const masterIndex = monthCloseMaterialMasterIndex_(masterRows);
  rows.forEach((line) => {
    const material = matchMonthCloseMaterial_(
      {
        materialId: line.materialId,
        materialCode: line.materialCode,
        itemName: line.materialName,
      },
      { name: line.materialName },
      masterIndex
    );
    if (!material) return;
    const key = String(material.materialId || material.materialCode || material.materialName || "").trim();
    if (!key) return;
    values[key] = round2(num(line.physicalKg));
  });
  return values;
}

function monthCloseOpeningFromPriorClose_(material, priorClosedOpening) {
  const key = String(material.materialId || material.materialCode || material.materialName || "").trim();
  if (!priorClosedOpening || !priorClosedOpening.hasPriorClose) return 0;
  if (!Object.prototype.hasOwnProperty.call(priorClosedOpening.values, key)) return 0;
  return round2(priorClosedOpening.values[key]);
}

function monthCloseRowBeforePeriod_(row, periodMonth) {
  const pm = normalizeMonthClosePeriod_(row.periodMonth || row.closeMonth || "");
  if (pm) return pm < periodMonth;
  const key = monthCloseRowPeriodKey_(row);
  return key && key < periodMonth;
}

function monthCloseRowPeriodKey_(row) {
  return normalizeMonthClosePeriod_(monthCloseFirstPeriodValue_(row));
}

function monthCloseMaterialDebug_(groups, priorClosedOpening) {
  const rows = [];
  monthCloseStockCategories_().forEach((category) => {
    (groups[category] || []).forEach((row) => {
      if (rows.length >= 20) return;
      rows.push({
        materialCode: row.materialCode || "",
        materialName: row.materialName || "",
        category,
        ledgerOpening: round2(row.opening),
        ledgerInward: round2(row.inward + row.produced),
        ledgerOutward: round2(row.consumed + row.dispatched + num(row.issued)),
        adjustment: round2(row.approvedAdjustments),
        calculatedSystemStock: round2(row.balance),
        source: row.systemStockSource || "",
      });
    });
  });
  return {
    openingSource: priorClosedOpening && priorClosedOpening.hasPriorClose
      ? "previous closed physical stock"
      : "ledger balance before selected month",
    previousClosedMonth: priorClosedOpening ? priorClosedOpening.periodMonth : "",
    sampleRows: rows,
  };
}

function monthCloseOperationalStockStats_(periodMonth, masterIndex) {
  const stats = {};
  const unmappedMovements = {};
  const movementSourceSummary = {
    rmReceivedKg: 0,
    rmUsedKg: 0,
    fgMadeKg: 0,
    dispatchedKg: 0,
    mappedKg: 0,
    unmappedKg: 0,
    mappingWarnings: [],
  };
  const moves = [];

  collectJuneReceivingMoves_(moves, periodMonth);
  collectJuneWashMoves_(moves, periodMonth);
  collectJuneSortingMoves_(moves, periodMonth);
  collectJuneExtrusionMoves_(moves, periodMonth);
  collectJuneDispatchMoves_(moves, periodMonth);
  collectJuneAdjustmentMoves_(moves, periodMonth);

  moves.forEach((move) => {
    const normalized = materialFlowNormalizeMaterial_(move.originalName, move.category);
    monthCloseAddMovementSourceSummary_(movementSourceSummary, move, false);
    const material = matchMonthCloseMaterial_(
      {
        materialId: "",
        materialCode: move.materialCode || move.itemCode || "",
        itemCode: move.itemCode || "",
        material: move.material || "",
        materialName: move.materialName || "",
        grade: move.grade || "",
        fgGrade: move.fgGrade || "",
        outputGrade: move.outputGrade || "",
        itemName: normalized.name || move.originalName,
      },
      normalized,
      masterIndex
    );
    if (!material) {
      monthCloseAddUnmappedMovement_(unmappedMovements, move, normalized);
      monthCloseAddMovementSourceSummary_(movementSourceSummary, move, true);
      return;
    }
    movementSourceSummary.mappedKg = round2(num(movementSourceSummary.mappedKg) + Math.abs(num(move.qtyIn) || num(move.qtyOut)));

    const key = String(material.materialId || material.materialCode || material.materialName || "").trim();
    if (!key) return;
    if (!stats[key]) {
      stats[key] = {
        opening: 0,
        inward: 0,
        consumed: 0,
        produced: 0,
        dispatched: 0,
        issued: 0,
        approvedAdjustments: 0,
      };
    }

    const qtyIn = num(move.qtyIn);
    const qtyOut = num(move.qtyOut);
    const bucket = monthCloseOperationalBucket_(move);

    if (bucket === "approvedAdjustments") {
      stats[key].approvedAdjustments = round2(num(stats[key].approvedAdjustments) + qtyIn - qtyOut);
    } else if (bucket === "consumed" || bucket === "dispatched" || bucket === "issued") {
      stats[key][bucket] = round2(num(stats[key][bucket]) + Math.abs(qtyOut || (qtyIn - qtyOut)));
    } else {
      stats[key][bucket] = round2(num(stats[key][bucket]) + Math.abs(qtyIn || (qtyIn - qtyOut)));
    }
  });

  return {
    stats,
    unmappedMovements: Object.values(unmappedMovements),
    movementSourceSummary,
  };
}

function monthCloseAddUnmappedMovement_(unmapped, move, normalized) {
  if (!materialFlowIsManufacturingCategory_(normalized.category)) return;
  if (normalized.name === "Recipe Text") return;
  const label = monthCloseUnmappedMovementLabel_(move, normalized);
  const key = label;
  if (!unmapped[key]) {
    unmapped[key] = {
      materialName: label,
      category: normalized.category || "UNKNOWN",
      originalNames: {},
      opening: 0,
      inward: 0,
      consumed: 0,
      produced: 0,
      dispatched: 0,
      issued: 0,
      approvedAdjustments: 0,
    };
  }
  unmapped[key].originalNames[move.originalName || normalized.name] = true;
  const qtyIn = num(move.qtyIn);
  const qtyOut = num(move.qtyOut);
  const bucket = monthCloseOperationalBucket_(move);
  if (bucket === "approvedAdjustments") {
    unmapped[key].approvedAdjustments = round2(num(unmapped[key].approvedAdjustments) + qtyIn - qtyOut);
  } else if (bucket === "consumed" || bucket === "dispatched" || bucket === "issued") {
    unmapped[key][bucket] = round2(num(unmapped[key][bucket]) + Math.abs(qtyOut || (qtyIn - qtyOut)));
  } else {
    unmapped[key][bucket] = round2(num(unmapped[key][bucket]) + Math.abs(qtyIn || (qtyIn - qtyOut)));
  }
}

function monthCloseUnmappedMovementLabel_(move, normalized) {
  const bucket = monthCloseOperationalBucket_(move);
  const category = String(normalized.category || move.category || "").toUpperCase();
  if (move.sourceSheet === "RM_Inward" || (category === "RM" && bucket === "inward")) return "Unmapped RM Received";
  if ((move.sourceSheet === "Wash_Batches" || move.sourceSheet === "Extrusion_Batches") && category === "RM" && bucket === "consumed") return "Unmapped RM Used";
  if (move.sourceSheet === "Extrusion_Batches" && category === "FG" && bucket === "produced") return "Unmapped FG Made";
  if (move.sourceSheet === "Dispatches" || bucket === "dispatched") return "Unmapped Dispatch";
  if (category === "WASTE" || category === "REWORK") return "Unmapped Waste / Rework";
  return "Unmapped " + (normalized.name || move.originalName || "Movement");
}

function monthCloseAddMovementSourceSummary_(summary, move, isUnmapped) {
  const qty = Math.abs(num(move.qtyIn) || num(move.qtyOut));
  const bucket = monthCloseOperationalBucket_(move);
  const category = String(move.category || "").toUpperCase();
  if (!isUnmapped) {
    if (move.sourceSheet === "RM_Inward") summary.rmReceivedKg = round2(num(summary.rmReceivedKg) + num(move.qtyIn));
    if ((move.sourceSheet === "Wash_Batches" || move.sourceSheet === "Extrusion_Batches") && category === "RM" && bucket === "consumed") {
      summary.rmUsedKg = round2(num(summary.rmUsedKg) + num(move.qtyOut));
    }
    if (move.sourceSheet === "Extrusion_Batches" && category === "FG" && bucket === "produced") {
      summary.fgMadeKg = round2(num(summary.fgMadeKg) + num(move.qtyIn));
    }
    if (move.sourceSheet === "Dispatches") summary.dispatchedKg = round2(num(summary.dispatchedKg) + num(move.qtyOut));
  }
  if (isUnmapped) {
    summary.unmappedKg = round2(num(summary.unmappedKg) + qty);
    if (summary.mappingWarnings.length < 20) {
      summary.mappingWarnings.push(monthCloseUnmappedMovementLabel_(move, materialFlowNormalizeMaterial_(move.originalName, move.category)) + ": " + (move.originalName || "blank") + " (" + qty + " kg)");
    }
  }
}

function monthCloseMovementSourceSummary_(operationalView, groups, exceptionRows) {
  const summary = operationalView.movementSourceSummary || {};
  const mappedFromRows = monthCloseStockCategories_().reduce((total, category) => {
    return total + (groups[category] || []).reduce((sum, row) => {
      return sum + Math.abs(num(row.inward)) + Math.abs(num(row.produced)) + Math.abs(num(row.consumed)) + Math.abs(num(row.dispatched)) + Math.abs(num(row.approvedAdjustments));
    }, 0);
  }, 0);
  const gapUnmappedKg = (exceptionRows || []).reduce((sum, row) => sum + Math.abs(num(row.inward)) + Math.abs(num(row.produced)) + Math.abs(num(row.consumed)) + Math.abs(num(row.dispatched)) + Math.abs(num(row.approvedAdjustments)), 0);
  const gapWarnings = (exceptionRows || [])
    .filter((row) => String(row.systemStockSource || "") === "source total gap")
    .map((row) => row.materialName + ": " + Math.abs(num(row.inward) || num(row.produced) || num(row.consumed) || num(row.dispatched)) + " kg");
  return {
    rmReceivedKg: round2(summary.rmReceivedKg),
    rmUsedKg: round2(summary.rmUsedKg),
    fgMadeKg: round2(summary.fgMadeKg),
    dispatchedKg: round2(summary.dispatchedKg),
    mappedKg: round2(Math.max(num(summary.mappedKg), mappedFromRows)),
    unmappedKg: round2(Math.max(num(summary.unmappedKg), gapUnmappedKg)),
    mappingWarnings: (summary.mappingWarnings || []).concat(gapWarnings).slice(0, 30),
  };
}

function monthCloseOperationalExceptionRows_(rows) {
  return rows
    .filter((row) => monthCloseStatsHasMovement_(row))
    .map((row, index) => {
      const balance = round2(num(row.opening) + num(row.inward) + num(row.produced) - num(row.consumed) - num(row.dispatched) - num(row.issued) + num(row.approvedAdjustments));
      return {
        materialId: "UNMAPPED-" + (index + 1),
        materialCode: "CHECK",
        materialName: row.materialName,
        category: row.category || "CHECK",
        unit: "Kg",
        opening: round2(row.opening),
        inward: round2(row.inward),
        consumed: round2(row.consumed),
        produced: round2(row.produced),
        dispatched: round2(row.dispatched),
        issued: round2(row.issued),
        approvedAdjustments: round2(row.approvedAdjustments),
        adjusted: round2(row.approvedAdjustments),
        balance,
        systemStock: balance,
        systemStockSource: "operational sheets - unmapped",
        status: "CHECK_MAPPING",
        originalNames: Object.keys(row.originalNames || {}).join(", "),
      };
    });
}

function monthCloseGuaranteedExceptionRows_(operationalView, groups) {
  const exceptions = monthCloseOperationalExceptionRows_(operationalView.unmappedMovements || []);
  const summary = operationalView.movementSourceSummary || {};
  const represented = monthCloseRepresentedMovement_(groups, exceptions);

  monthClosePushGapException_(exceptions, {
    label: "Unmapped RM Received",
    category: "RM",
    field: "inward",
    sourceKg: summary.rmReceivedKg,
    representedKg: represented.rmReceivedKg,
  });
  monthClosePushGapException_(exceptions, {
    label: "Unmapped RM Used",
    category: "RM",
    field: "consumed",
    sourceKg: summary.rmUsedKg,
    representedKg: represented.rmUsedKg,
  });
  monthClosePushGapException_(exceptions, {
    label: "Unmapped FG Made",
    category: "FG",
    field: "produced",
    sourceKg: summary.fgMadeKg,
    representedKg: represented.fgMadeKg,
  });
  monthClosePushGapException_(exceptions, {
    label: "Unmapped Dispatch",
    category: "FG",
    field: "dispatched",
    sourceKg: summary.dispatchedKg,
    representedKg: represented.dispatchedKg,
  });

  return exceptions.map((row, index) => ({
    ...row,
    materialId: row.materialId || "UNMAPPED-" + (index + 1),
  }));
}

function monthCloseRepresentedMovement_(groups, exceptionRows) {
  const rows = monthCloseStockCategories_().reduce((list, category) => list.concat(groups[category] || []), []).concat(exceptionRows || []);
  return rows.reduce((acc, row) => {
    const category = String(row.category || "").toUpperCase();
    if (category === "RM") {
      acc.rmReceivedKg += num(row.inward);
      acc.rmUsedKg += num(row.consumed);
    }
    if (category === "FG") {
      acc.fgMadeKg += num(row.produced);
      acc.dispatchedKg += num(row.dispatched);
    }
    return acc;
  }, { rmReceivedKg: 0, rmUsedKg: 0, fgMadeKg: 0, dispatchedKg: 0 });
}

function monthClosePushGapException_(exceptions, options) {
  const gap = round2(num(options.sourceKg) - num(options.representedKg));
  if (Math.abs(gap) <= 0.01) return;
  const row = {
    materialId: "",
    materialCode: "CHECK",
    materialName: options.label,
    category: options.category,
    unit: "Kg",
    opening: 0,
    inward: 0,
    consumed: 0,
    produced: 0,
    dispatched: 0,
    issued: 0,
    approvedAdjustments: 0,
    adjusted: 0,
    status: "CHECK_MAPPING",
    systemStockSource: "source total gap",
    originalNames: "Source total not allocated to material rows",
  };
  row[options.field] = Math.abs(gap);
  row.balance = round2(num(row.opening) + num(row.inward) + num(row.produced) - num(row.consumed) - num(row.dispatched) - num(row.issued) + num(row.approvedAdjustments));
  row.systemStock = row.balance;
  exceptions.push(row);
}

function collectMonthCloseStoresMoves_(moves, periodMonth) {
  safeRows_("Stores_Inward").filter((row) => materialFlowRowInPeriod_(row, periodMonth)).forEach((row, index) => {
    const sourceId = row.inwardId || row.storesInwardId || "STORE-IN-" + (index + 1);
    monthClosePushStoreMove_(moves, {
      sourceSheet: "Stores_Inward",
      sourceId,
      field: "itemName",
      originalName: row.itemName,
      category: "STORE",
      qtyIn: row.qty,
      date: row.date,
    });
  });

  safeRows_("Stores_Issue").filter((row) => materialFlowRowInPeriod_(row, periodMonth)).forEach((row, index) => {
    const sourceId = row.issueId || row.storesIssueId || "STORE-OUT-" + (index + 1);
    monthClosePushStoreMove_(moves, {
      sourceSheet: "Stores_Issue",
      sourceId,
      field: "itemName",
      originalName: row.itemName,
      category: "STORE",
      qtyOut: row.qty,
      date: row.date,
    });
  });
}

function monthCloseStoresSummary_(periodMonth) {
  const moves = [];
  const byItem = {};
  collectMonthCloseStoresMoves_(moves, periodMonth);

  moves.forEach((move) => {
    const name = materialFlowCleanName_(move.originalName || "Store Item");
    if (!name) return;
    if (!byItem[name]) {
      byItem[name] = {
        itemName: name,
        inwardQty: 0,
        issuedQty: 0,
        closingQty: 0,
      };
    }
    byItem[name].inwardQty = round2(num(byItem[name].inwardQty) + num(move.qtyIn));
    byItem[name].issuedQty = round2(num(byItem[name].issuedQty) + num(move.qtyOut));
    byItem[name].closingQty = round2(num(byItem[name].closingQty) + num(move.qtyIn) - num(move.qtyOut));
  });

  const rows = Object.values(byItem).sort((a, b) => Math.abs(num(b.issuedQty)) - Math.abs(num(a.issuedQty)));
  return {
    itemCount: rows.length,
    inwardQty: round2(rows.reduce((sum, row) => sum + num(row.inwardQty), 0)),
    issuedQty: round2(rows.reduce((sum, row) => sum + num(row.issuedQty), 0)),
    closingQty: round2(rows.reduce((sum, row) => sum + num(row.closingQty), 0)),
    topRows: rows.slice(0, 10),
  };
}

function monthClosePushStoreMove_(moves, payload) {
  const originalName = materialFlowCleanName_(payload.originalName || payload.itemName);
  if (!originalName) return;
  moves.push({
    sourceSheet: payload.sourceSheet || "",
    sourceId: payload.sourceId || "",
    field: payload.field || "",
    originalName,
    category: "STORE",
    qtyIn: num(payload.qtyIn),
    qtyOut: num(payload.qtyOut),
    date: payload.date || "",
  });
}

function monthCloseOperationalBucket_(move) {
  if (move.sourceSheet === "RM_Inward" || move.sourceSheet === "Stores_Inward") return "inward";
  if (move.sourceSheet === "Dispatches") return "dispatched";
  if (move.sourceSheet === "Stores_Issue") return "issued";
  if (move.sourceSheet === "Inventory_Adjustments") return "approvedAdjustments";
  if (num(move.qtyOut) > 0) return "consumed";
  return "produced";
}

function monthCloseStatsHasMovement_(stats) {
  return ["opening", "inward", "consumed", "produced", "dispatched", "issued", "approvedAdjustments"].some((key) => Math.abs(num(stats[key])) > 0.01);
}

function monthCloseMaterialMasterIndex_(masterRows) {
  const index = {};
  masterRows.forEach((row) => {
    [
      row.materialId,
      row.materialCode,
      row.materialName,
      materialCode_(row.materialName || ""),
      materialFlowNormalizeMaterial_(row.materialName || "", row.category).name,
    ].forEach((value) => {
      const key = monthCloseMaterialKey_(value);
      if (key && !index[key]) index[key] = row;
    });
  });
  return index;
}

function matchMonthCloseMaterial_(ledgerRow, normalized, masterIndex) {
  const candidates = [
    ledgerRow.materialId,
    ledgerRow.materialCode,
    ledgerRow.itemCode,
    ledgerRow.material,
    ledgerRow.materialName,
    ledgerRow.grade,
    ledgerRow.fgGrade,
    ledgerRow.outputGrade,
    ledgerRow.itemName,
    normalized && normalized.name,
    materialCode_(ledgerRow.itemName || ""),
    materialCode_(ledgerRow.materialName || ledgerRow.material || ledgerRow.grade || ""),
  ];

  for (let i = 0; i < candidates.length; i += 1) {
    const match = masterIndex[monthCloseMaterialKey_(candidates[i])];
    if (match) return match;
  }

  return null;
}

function monthCloseMaterialKey_(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "");
}

function monthCloseNegativeMasterBalances_(groups) {
  const rows = [];
  Object.keys(groups).forEach((category) => {
    groups[category].forEach((row) => {
      if (num(row.balance) < -0.01) {
        rows.push({
          material: row.materialName,
          category,
          balance: num(row.balance),
        });
      }
    });
  });
  return rows;
}

function findInvalidManufacturingLedgerRows_(rows, periodMonth) {
  const examples = [];
  rows.filter((row) => materialFlowRowInPeriod_(row, periodMonth)).forEach((row) => {
    if (examples.length >= 10) return;
    const rawName = String(row.itemName || "").trim();
    const clean = materialFlowCleanName_(rawName);
    const normalized = materialFlowNormalizeMaterial_(rawName, row.itemType);
    const rawCategory = String(row.itemType || "").toUpperCase();
    const isStore = rawCategory === "STORE";
    const invalid =
      clean === "Recipe Text" ||
      !clean ||
      materialFlowIsQualityReference_(rawName) ||
      (!isStore && !materialFlowIsManufacturingCategory_(normalized.category));

    if (invalid) {
      examples.push({
        ledgerId: row.ledgerId || "",
        date: row.date || "",
        itemName: rawName,
        itemType: row.itemType || "",
        reason: clean === "Recipe Text"
          ? "Recipe/feed text"
          : !clean
          ? "Blank or quality reference"
          : "Unknown manufacturing material type",
      });
    }
  });
  return {
    countShown: examples.length,
    examples,
    note: "STORE rows are intentionally excluded from manufacturing Month Close, not treated as invalid.",
  };
}

function buildJuneLedgerV1Rows_(periodMonth) {
  const moves = [];
  collectJuneReceivingMoves_(moves, periodMonth);
  collectJuneWashMoves_(moves, periodMonth);
  collectJuneSortingMoves_(moves, periodMonth);
  collectJuneExtrusionMoves_(moves, periodMonth);
  collectJuneDispatchMoves_(moves, periodMonth);
  collectJuneAdjustmentMoves_(moves, periodMonth);
  return movementsToJuneLedgerRows_(moves, periodMonth);
}

function juneLedgerV1CompactSummary_(beforeBalances, afterBalances, rowsToReplace, rowsToWrite) {
  return {
    rowsToReplace,
    rowsToWrite,
    beforeBalances: compactManufacturingBalances_(beforeBalances),
    afterProjectedBalances: compactManufacturingBalances_(afterBalances),
    whiteSorted: whiteSortedReconciliation_(beforeBalances, afterBalances),
    negativeBalancesBefore: negativeManufacturingBalances_(beforeBalances),
    negativeBalancesAfter: negativeManufacturingBalances_(afterBalances),
    fgBalancesAfter: {
      E1: num(afterBalances.E1),
      E2: num(afterBalances.E2),
      E3: num(afterBalances.E3),
      E4: num(afterBalances.E4),
      E5: num(afterBalances.E5),
    },
    wipBalancesAfter: {
      washedMixed: num(afterBalances["Washed Mixed"]),
      washedWhiteFlakes: num(afterBalances["Washed White Flakes"]),
      whiteSortedFlakes: num(afterBalances["White Sorted Flakes"]),
    },
    warnings: juneMigrationWarnings_(),
  };
}

function juneManufacturingMonthCloseMaterials_() {
  return [
    "White Flakes",
    "White Regrind (Unwashed)",
    "Mixed Material",
    "Washed White Flakes",
    "Washed Mixed",
    "White Sorted Flakes",
    "E1",
    "E2",
    "E3",
    "E4",
    "E5",
    "Sink Material",
    "Dust",
    "Wrapper Reject",
    "Micro Plastic",
    "Lumps",
    "Purging",
    "Rework Material",
  ];
}

function buildJuneV1MaterialMovements_(periodMonth) {
  const moves = [];
  collectJuneReceivingMoves_(moves, periodMonth);
  collectJuneWashMoves_(moves, periodMonth);
  collectJuneSortingMoves_(moves, periodMonth);
  collectJuneExtrusionMoves_(moves, periodMonth);
  collectJuneDispatchMoves_(moves, periodMonth);
  collectJuneLedgerMoves_(moves, periodMonth);
  collectJuneQualityMoves_(moves, periodMonth);
  collectJuneMonthCloseMoves_(moves, periodMonth);
  collectJunePhysicalCountMoves_(moves, periodMonth);
  collectJuneAdjustmentMoves_(moves, periodMonth);
  return moves;
}

function pushMaterialFlowMove_(moves, payload) {
  const originalName = materialFlowCleanName_(payload.originalName || payload.material || payload.itemName);
  if (!originalName) return;
  const normalized = materialFlowNormalizeMaterial_(originalName, payload.category);
  if (!materialFlowIsManufacturingCategory_(normalized.category)) return;
  if (normalized.name === "Recipe Text") return;

  moves.push({
    sourceSheet: payload.sourceSheet || "",
    sourceId: payload.sourceId || "",
    field: payload.field || "",
    originalName,
    category: payload.category || materialCategory_(originalName),
    qtyIn: num(payload.qtyIn),
    qtyOut: num(payload.qtyOut),
    date: payload.date || "",
  });
}

function collectJuneReceivingMoves_(moves, periodMonth) {
  safeRows_("RM_Inward").filter((row) => materialFlowRowInPeriod_(row, periodMonth)).forEach((row, index) => {
    const sourceId = row.inwardId || row.batchId || "RM-" + (index + 1);
    parseRmMaterialLines_(row.materialLines, row.material || row.color || "White Flakes", row.netWeight || row.quantityKg || row.grossWeight).forEach((line) => {
      pushMaterialFlowMove_(moves, { sourceSheet: "RM_Inward", sourceId, field: "material", originalName: line.material, category: "RM", qtyIn: line.quantityKg, date: row.date });
    });
  });
}

function collectJuneWashMoves_(moves, periodMonth) {
  safeRows_("Wash_Batches").filter((row) => materialFlowRowInPeriod_(row, periodMonth)).forEach((row, index) => {
    const sourceId = row.washBatchId || row.batchId || "WASH-" + (index + 1);
    const inputMaterial = normalizeProductionMaterialName_(materialName_(row.inputMaterial, "White Regrind (Unwashed)")).canonicalName;
    const washedMaterial = "White Regrind (Washed)";
    pushMaterialFlowMove_(moves, { sourceSheet: "Wash_Batches", sourceId, field: "inputMaterial", originalName: inputMaterial, category: "RM", qtyOut: row.inputWeightKg, date: row.date });
    pushMaterialFlowMove_(moves, { sourceSheet: "Wash_Batches", sourceId, field: "washedOutputKg", originalName: washedMaterial, category: "WIP", qtyIn: row.washedOutputKg, date: row.date });
    [["sinkMaterialKg", "Sink Material"], ["dustKg", "Dust"], ["otherColorKg", "Color Reject"], ["sludgeKg", "Sludge"], ["ironScrapKg", "Metal Reject"], ["raffiaKg", "Raffia Reject"], ["wrappersKg", "Wrapper Reject"]].forEach(([field, name]) => {
      pushMaterialFlowMove_(moves, { sourceSheet: "Wash_Batches", sourceId, field, originalName: name, category: "WASTE", qtyIn: row[field], date: row.date });
    });
  });
}

function collectJuneSortingMoves_(moves, periodMonth) {
  const rows = safeRows_("Sorting_Batches").filter((row) => materialFlowRowInPeriod_(row, periodMonth));
  const totalRecordedOutput = rows.reduce((sum, row) => {
    return sum +
      num(row.whiteSortedKg || row.acceptedQtyKg) +
      num(row.allMixSortedKg) +
      num(row.commodityKg) +
      num(row.rejectedQtyKg) +
      num(row.dustKg);
  }, 0);
  if (totalRecordedOutput <= 0) return;

  rows.forEach((row, index) => {
    const sourceId = row.sortingBatchId || row.batchId || "SORT-" + (index + 1);
    const inputMaterial = normalizeProductionMaterialName_(materialName_(row.inputMaterial, "White Regrind (Washed)")).canonicalName;
    pushMaterialFlowMove_(moves, { sourceSheet: "Sorting_Batches", sourceId, field: "inputMaterial", originalName: inputMaterial, category: "WIP", qtyOut: row.inputWeightKg, date: row.date });
    pushMaterialFlowMove_(moves, { sourceSheet: "Sorting_Batches", sourceId, field: "whiteSortedKg", originalName: "White Sorted Regrind", category: "WIP", qtyIn: num(row.whiteSortedKg || row.acceptedQtyKg), date: row.date });
    pushMaterialFlowMove_(moves, { sourceSheet: "Sorting_Batches", sourceId, field: "allMixSortedKg", originalName: "Mixed Sorted", category: "WIP", qtyIn: row.allMixSortedKg, date: row.date });
    pushMaterialFlowMove_(moves, { sourceSheet: "Sorting_Batches", sourceId, field: "commodityKg", originalName: "Commodity", category: "WIP", qtyIn: row.commodityKg, date: row.date });
    pushMaterialFlowMove_(moves, { sourceSheet: "Sorting_Batches", sourceId, field: "rejectedQtyKg", originalName: "Color Reject", category: "WASTE", qtyIn: row.rejectedQtyKg, date: row.date });
    pushMaterialFlowMove_(moves, { sourceSheet: "Sorting_Batches", sourceId, field: "dustKg", originalName: "Dust", category: "WASTE", qtyIn: row.dustKg, date: row.date });
  });
}

function collectJuneExtrusionMoves_(moves, periodMonth) {
  const washContext = juneWashOutputContext_(periodMonth);
  const sortingOutputKg = safeRows_("Sorting_Batches").filter((row) => materialFlowRowInPeriod_(row, periodMonth)).reduce((sum, row) => sum + num(row.whiteSortedKg || row.acceptedQtyKg), 0);
  safeRows_("Extrusion_Batches").filter((row) => materialFlowRowInPeriod_(row, periodMonth)).forEach((row, index) => {
    const sourceId = row.extrusionBatchId || row.batchId || "EXT-" + (index + 1);
    const explicitInput = materialFlowCleanName_(row.inputMaterial);
    const inputMaterial = juneExtrusionInputMaterial_(explicitInput, sortingOutputKg, washContext);
    const grade = normalizeFgMaterialName_(row.productionGrade || row.grade || "E1");
    pushMaterialFlowMove_(moves, { sourceSheet: "Extrusion_Batches", sourceId, field: "inputMaterial", originalName: inputMaterial, category: "WIP", qtyOut: row.inputWeightKg || row.totalInputKg, date: row.date });
    [["virginMaterialKg", "Virgin PPCP", "ADDITIVE"], ["masterBatchKg", "Masterbatch", "ADDITIVE"], ["antiOxidantKg", "Antioxidant", "ADDITIVE"], ["batteryFlakesKg", "Battery PPCP", "RM"], ["lumpsReusedKg", "Lumps", "REWORK"], ["purgingReusedKg", "Purging", "REWORK"], ["reworkGranulesKg", "Rework Material", "REWORK"]].forEach(([field, name, category]) => {
      pushMaterialFlowMove_(moves, { sourceSheet: "Extrusion_Batches", sourceId, field, originalName: name, category, qtyOut: row[field], date: row.date });
    });
    pushMaterialFlowMove_(moves, { sourceSheet: "Extrusion_Batches", sourceId, field: "fgOutputKg", originalName: grade, category: "FG", qtyIn: row.fgOutputKg, date: row.date });
    [["lumpsKg", "Lumps", "REWORK"], ["purgingKg", "Purging", "REWORK"], ["dustKg", "Dust", "WASTE"], ["rejectKg", "Extrusion Waste", "WASTE"], ["vacuumRejectKg", "Extrusion Waste", "WASTE"], ["meshRejectKg", "Extrusion Waste", "WASTE"], ["floorSpillageKg", "Extrusion Waste", "WASTE"]].forEach(([field, name, category]) => {
      pushMaterialFlowMove_(moves, { sourceSheet: "Extrusion_Batches", sourceId, field, originalName: name, category, qtyIn: row[field], date: row.date });
    });
  });
}

function collectJuneDispatchMoves_(moves, periodMonth) {
  safeRows_("Dispatches").filter((row) => materialFlowRowInPeriod_(row, periodMonth)).forEach((row, index) => {
    const sourceId = row.dispatchId || "DISP-" + (index + 1);
    const lines = parseDispatchLines_(row.dispatchLines);
    if (lines.length) {
      lines.forEach((line) => {
        parseFgDispatchItems_(line.grade || line.material || row.grade || row.productionGrade, num(line.dispatchQtyKg || line.quantityKg || row.quantityKg)).forEach((item) => {
          pushMaterialFlowMove_(moves, { sourceSheet: "Dispatches", sourceId, field: "dispatchLines", originalName: item.itemName, category: "FG", qtyOut: item.quantityKg, date: row.date });
        });
      });
      return;
    }
    parseFgDispatchItems_(row.material || row.grade || row.productionGrade || "E1", num(row.quantityKg)).forEach((item) => {
      pushMaterialFlowMove_(moves, { sourceSheet: "Dispatches", sourceId, field: "grade", originalName: item.itemName, category: "FG", qtyOut: item.quantityKg, date: row.date });
    });
  });
}

function collectJuneLedgerMoves_(moves, periodMonth) {
  safeRows_("Inventory_Ledger").filter((row) => materialFlowRowInPeriod_(row, periodMonth)).forEach((row) => {
    pushMaterialFlowMove_(moves, { sourceSheet: "Inventory_Ledger", sourceId: row.ledgerId, field: "itemName", originalName: row.itemName, category: row.itemType || "UNKNOWN", qtyIn: row.qtyIn, qtyOut: row.qtyOut, date: row.date });
  });
}

function collectJuneQualityMoves_(moves, periodMonth) {
  safeRows_("RM_Quality").filter((row) => materialFlowRowInPeriod_(row, periodMonth)).forEach((row) => pushMaterialFlowMove_(moves, { sourceSheet: "RM_Quality", sourceId: row.qualityId, field: "material", originalName: row.material || row.materialName, category: "RM", date: row.date }));
  safeRows_("FG_Quality").filter((row) => materialFlowRowInPeriod_(row, periodMonth)).forEach((row) => pushMaterialFlowMove_(moves, { sourceSheet: "FG_Quality", sourceId: row.qualityId, field: "grade", originalName: row.grade || row.productionGrade, category: "FG", qtyIn: row.quantityKg, date: row.date }));
}

function collectJuneMonthCloseMoves_(moves, periodMonth) {
  safeRows_("Month_Close").filter((row) => materialFlowRowInPeriod_(row, periodMonth)).forEach((row) => {
    pushMaterialFlowMove_(moves, { sourceSheet: "Month_Close", sourceId: row.closeId, field: "rmSystemClosingKg", originalName: "White Flakes", category: "RM", qtyIn: row.rmSystemClosingKg });
    pushMaterialFlowMove_(moves, { sourceSheet: "Month_Close", sourceId: row.closeId, field: "washSystemClosingKg", originalName: "Washed White Flakes", category: "WIP", qtyIn: row.washSystemClosingKg });
    pushMaterialFlowMove_(moves, { sourceSheet: "Month_Close", sourceId: row.closeId, field: "sortingSystemClosingKg", originalName: "White Sorted", category: "WIP", qtyIn: row.sortingSystemClosingKg });
    pushMaterialFlowMove_(moves, { sourceSheet: "Month_Close", sourceId: row.closeId, field: "fgSystemClosingKg", originalName: "E1", category: "FG", qtyIn: row.fgSystemClosingKg });
  });
}

function collectJunePhysicalCountMoves_(moves, periodMonth) {
  safeRows_("Physical_Counts").filter((row) => materialFlowRowInPeriod_(row, periodMonth)).forEach((row) => {
    pushMaterialFlowMove_(moves, { sourceSheet: "Physical_Counts", sourceId: row.countId, field: "rmPhysicalKg", originalName: "White Flakes", category: "RM", qtyIn: row.rmPhysicalKg });
    pushMaterialFlowMove_(moves, { sourceSheet: "Physical_Counts", sourceId: row.countId, field: "washPhysicalKg", originalName: "Washed White Flakes", category: "WIP", qtyIn: row.washPhysicalKg });
    pushMaterialFlowMove_(moves, { sourceSheet: "Physical_Counts", sourceId: row.countId, field: "sortingPhysicalKg", originalName: "White Sorted", category: "WIP", qtyIn: row.sortingPhysicalKg });
    pushMaterialFlowMove_(moves, { sourceSheet: "Physical_Counts", sourceId: row.countId, field: "fgPhysicalKg", originalName: "E1", category: "FG", qtyIn: row.fgPhysicalKg });
  });
}

function collectJuneAdjustmentMoves_(moves, periodMonth) {
  safeRows_("Inventory_Adjustments").filter((row) => {
    const status = String(row.status || row.approvalStatus || "").toUpperCase();
    return materialFlowRowInPeriod_(row, periodMonth) && status === "APPROVED";
  }).forEach((row) => {
    const qty = num(row.quantityKg);
    pushMaterialFlowMove_(moves, { sourceSheet: "Inventory_Adjustments", sourceId: row.adjustmentId, field: "itemCode", originalName: row.itemCode || row.material, category: row.itemType || "UNKNOWN", qtyIn: qty > 0 ? qty : 0, qtyOut: qty < 0 ? Math.abs(qty) : 0, date: row.date });
  });
}

function movementsToJuneLedgerRows_(movements, periodMonth) {
  const ctx = { rows: [], sourceCounts: {}, warnings: [], rebuildAt: new Date() };
  movements.filter((move) => ["RM_Inward", "Wash_Batches", "Sorting_Batches", "Extrusion_Batches", "Dispatches", "Inventory_Adjustments"].indexOf(move.sourceSheet) !== -1).forEach((move, index) => {
    const normalized = materialFlowNormalizeMaterial_(move.originalName, move.category);
    if (!materialFlowIsManufacturingCategory_(normalized.category)) return;
    if (normalized.name === "Recipe Text") return;

    pushRebuiltLedgerRow_(ctx, move.sourceSheet, move.sourceId || index + 1, {
      date: move.date || periodMonth + "-01",
      module: move.sourceSheet.replace(/_Batches|_Inward|es$/g, "").toUpperCase(),
      movementType: num(move.qtyIn) > 0 ? "IN" : "OUT",
      itemType: normalized.category,
      itemName: normalized.name,
      sourceRef: move.sourceId || "",
      targetRef: move.sourceId || "",
      qtyIn: move.qtyIn,
      qtyOut: move.qtyOut,
      unit: "Kg",
      remarks: "June V1 material-flow rebuild from " + move.sourceSheet,
      createdBy: "June V1 Material Migration",
      legacyMaterialName: move.originalName,
      migrationId: "JUNE_2026_MATERIAL_FLOW_V1",
    });
  });
  return ctx.rows;
}

function materialFlowNormalizeMaterial_(name, category) {
  const clean = materialFlowCleanName_(name);
  const upper = clean.toUpperCase();
  const aliasRow = materialAliasLookup_(clean);
  if (aliasRow && aliasRow.canonicalName) {
    return {
      name: aliasRow.canonicalName,
      category: normalizeMaterialCategoryForLedger_(aliasRow.category || category) || aliasRow.category || category || materialCategory_(aliasRow.canonicalName),
      mergeInto: aliasRow.canonicalName,
    };
  }
  const map = {
    "WHITE BUCKET": ["White PPCP Buckets", "RM", "White PPCP Buckets"],
    "WHITE BUCKETS": ["White PPCP Buckets", "RM", "White PPCP Buckets"],
    "WHITE PPCP BUCKETS": ["White PPCP Buckets", "RM", "White PPCP Buckets"],
    "MIXED BUCKET": ["White PPCP Buckets", "RM", "White PPCP Buckets"],
    "MIXED BUCKETS": ["White PPCP Buckets", "RM", "White PPCP Buckets"],
    "MIXED PPCP BUCKETS": ["White PPCP Buckets", "RM", "White PPCP Buckets"],
    "WASHED MATERIAL": ["White Regrind (Washed)", "WIP", "White Regrind (Washed)"],
    "WASHED FLAKES": ["White Regrind (Washed)", "WIP", "White Regrind (Washed)"],
    "WASHED WHITE FLAKES": ["White Regrind (Washed)", "WIP", "White Regrind (Washed)"],
    "WHITE WASHED FLAKES": ["White Regrind (Washed)", "WIP", "White Regrind (Washed)"],
    "WASHED REGRIND": ["White Regrind (Washed)", "WIP", "White Regrind (Washed)"],
    "SORTED MATERIAL": ["White Sorted Regrind", "WIP", "White Sorted Regrind"],
    "SORTED WHITE": ["White Sorted Regrind", "WIP", "White Sorted Regrind"],
    "SORTED FLAKES": ["White Sorted Regrind", "WIP", "White Sorted Regrind"],
    "WHITE SORTED": ["White Sorted Regrind", "WIP", "White Sorted Regrind"],
    "WHITE SORTED FLAKES": ["White Sorted Regrind", "WIP", "White Sorted Regrind"],
    "WHITE SORTED MATERIAL": ["White Sorted Regrind", "WIP", "White Sorted Regrind"],
    "REWORK GRANULES": ["Rework Material", "REWORK", "Rework Material"],
    "VIRGIN PP": ["Virgin PPCP", "ADDITIVE", "Virgin PPCP"],
    "VIRGIN MATERIAL": ["Virgin PPCP", "ADDITIVE", "Virgin PPCP"],
    "ANTI OXIDANT": ["Antioxidant", "ADDITIVE", "Antioxidant"],
    "MASTER BATCH": ["Masterbatch", "ADDITIVE", "Masterbatch"],
    "BATTERY SCRAP": ["Battery PPCP", "RM", "Battery PPCP"],
    "BATTERY FLAKES": ["Battery PPCP", "RM", "Battery PPCP"],
    "BATTERY REGRIND": ["Battery PPCP", "RM", "Battery PPCP"],
    "LUMPS": ["Lumps", "REWORK", "Lumps"],
    "PURGING": ["Purging", "REWORK", "Purging"],
    "REWORK": ["Rework Material", "REWORK", "Rework Material"],
    "RECIPE TEXT": ["Recipe Text", "UNKNOWN", "Do not store as inventory material"],
  };
  if (map[upper]) return { name: map[upper][0], category: map[upper][1], mergeInto: map[upper][2] };
  return { name: clean, category: normalizeMaterialCategoryForLedger_(category || materialCategory_(clean)) || "UNKNOWN", mergeInto: "" };
}

function materialFlowCleanName_(value) {
  let text = String(value || "").trim();
  if (!text) return "";
  if (materialFlowIsQualityReference_(text)) return "";
  text = text.replace(/\bE([1-5])\s*:\s*[\d,]+(?:\.\d+)?\s*(KG|KGS|KILOGRAMS)?/gi, "E$1");
  text = text.replace(/\b\d+(?:\.\d+)?\s*(kg|kgs|kilogram|kilograms|mt|tons?|tonnes?)\b/gi, " ");
  text = text.replace(/_/g, " ");
  text = text.replace(/\s+/g, " ").trim();
  if (materialFlowIsRecipeText_(text)) return "Recipe Text";
  text = text.replace(/:/g, " ");
  text = text.replace(/\s+/g, " ").trim();
  return text;
}

function materialFlowIsRecipeText_(value) {
  const text = String(value || "").trim();
  if (!text) return false;
  if (/FEED\s*COMPOSITION|RECIPE|DOSING/i.test(text)) return true;
  if (/:/.test(text) && /\+/.test(text)) return true;
  if (/(ANTIOXIDANT|MASTER\s*BATCH|MASTERBATCH|SORTED\s*FLAKES|WHITE\s*FLAKES)\s*:/i.test(text)) return true;
  return false;
}

function materialFlowIsQualityReference_(value) {
  const text = String(value || "").trim().toUpperCase();
  if (/^E[1-5]-\d{8}-[A-Z0-9]+-\d{3,}$/.test(text)) return true;
  if (/^MR-\d{8}-[A-Z0-9]+-\d{3,}$/.test(text)) return true;
  return false;
}

function juneWashOutputContext_(periodMonth) {
  const context = {
    whiteWashedKg: 0,
    mixedWashedKg: 0,
    defaultWashedMaterial: "White Regrind (Washed)",
  };

  safeRows_("Wash_Batches")
    .filter((row) => materialFlowRowInPeriod_(row, periodMonth))
    .forEach((row) => {
      const inputMaterial = materialName_(row.inputMaterial, "White Flakes");
      const washedKg = num(row.washedOutputKg);
      if (inputMaterial.toUpperCase().indexOf("WHITE") !== -1) {
        context.whiteWashedKg += washedKg;
      } else {
        context.mixedWashedKg += washedKg;
      }
    });

  context.defaultWashedMaterial =
    context.mixedWashedKg > context.whiteWashedKg ? "Washed Mixed" : "White Regrind (Washed)";
  return context;
}

function juneExtrusionInputMaterial_(explicitInput, sortingProducedKg, washContext) {
  const clean = materialFlowCleanName_(explicitInput);
  const upper = clean.toUpperCase();
  const directFlowInput = washContext.defaultWashedMaterial || "White Regrind (Washed)";

  if (sortingProducedKg <= 0.01) {
    if (!clean || clean === "Recipe Text" || /SORTED|WHITE\s*SORTED|SORTED\s*FLAKES/i.test(upper)) {
      return directFlowInput;
    }
  }

  if (!clean || clean === "Recipe Text") {
    return sortingProducedKg > 0.01 ? "White Sorted Regrind" : directFlowInput;
  }

  return normalizeProductionMaterialName_(clean).canonicalName;
}

function safeRows_(sheetName) {
  try {
    return getRowsAsObjects(sheetName).filter((row) => !isDeleted_(row));
  } catch (err) {
    return [];
  }
}

function normalizeMonthClosePeriod_(value) {
  if (value === null || value === undefined || value === "") return "";
  if (Object.prototype.toString.call(value) === "[object Date]" && !isNaN(value.getTime())) {
    return value.getFullYear() + "-" + String(value.getMonth() + 1).padStart(2, "0");
  }

  const text = String(value).trim();
  if (!text) return "";

  let match = text.match(/^(\d{4})[-/](\d{1,2})(?:[-/]\d{1,2})?/);
  if (match) return match[1] + "-" + String(Number(match[2])).padStart(2, "0");

  match = text.match(/^(\d{1,2})[-/](\d{4})$/);
  if (match) return match[2] + "-" + String(Number(match[1])).padStart(2, "0");

  const monthMap = {
    JAN: "01",
    JANUARY: "01",
    FEB: "02",
    FEBRUARY: "02",
    MAR: "03",
    MARCH: "03",
    APR: "04",
    APRIL: "04",
    MAY: "05",
    JUN: "06",
    JUNE: "06",
    JUL: "07",
    JULY: "07",
    AUG: "08",
    AUGUST: "08",
    SEP: "09",
    SEPT: "09",
    SEPTEMBER: "09",
    OCT: "10",
    OCTOBER: "10",
    NOV: "11",
    NOVEMBER: "11",
    DEC: "12",
    DECEMBER: "12",
  };
  const upper = text.toUpperCase().replace(/[_.,]+/g, " ");
  match = upper.match(/\b(JANUARY|JAN|FEBRUARY|FEB|MARCH|MAR|APRIL|APR|MAY|JUNE|JUN|JULY|JUL|AUGUST|AUG|SEPTEMBER|SEPT|SEP|OCTOBER|OCT|NOVEMBER|NOV|DECEMBER|DEC)\b\s+(\d{4})/);
  if (match && monthMap[match[1]]) return match[2] + "-" + monthMap[match[1]];
  match = upper.match(/\b(\d{4})\s+(JANUARY|JAN|FEBRUARY|FEB|MARCH|MAR|APRIL|APR|MAY|JUNE|JUN|JULY|JUL|AUGUST|AUG|SEPTEMBER|SEPT|SEP|OCTOBER|OCT|NOVEMBER|NOV|DECEMBER|DEC)\b/);
  if (match && monthMap[match[2]]) return match[1] + "-" + monthMap[match[2]];

  const d = new Date(text);
  if (!isNaN(d.getTime())) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
  }
  return "";
}

function monthClosePeriodFieldCandidates_() {
  return ["periodMonth", "closeMonth", "month", "date", "invoiceDate", "createdAt", "savedAt", "closedAt", "timestamp"];
}

function monthCloseFirstPeriodField_(row) {
  const candidates = monthClosePeriodFieldCandidates_();
  let fallback = "";
  for (let i = 0; i < candidates.length; i += 1) {
    const field = candidates[i];
    if (row[field] !== undefined && row[field] !== null && String(row[field]).trim() !== "") {
      if (!fallback) fallback = field;
      if (normalizeMonthClosePeriod_(row[field])) return field;
    }
  }
  return fallback;
}

function monthCloseFirstPeriodValue_(row) {
  const candidates = monthClosePeriodFieldCandidates_();
  for (let i = 0; i < candidates.length; i += 1) {
    const field = candidates[i];
    if (row[field] !== undefined && row[field] !== null && String(row[field]).trim() !== "" && normalizeMonthClosePeriod_(row[field])) {
      return row[field];
    }
  }
  const field = monthCloseFirstPeriodField_(row);
  return field ? row[field] : "";
}

function monthCloseSheetPeriodDiagnostics_(periodMonth) {
  const sheets = ["RM_Inward", "Wash_Batches", "Sorting_Batches", "Extrusion_Batches", "Dispatches", "Stores_Inward", "Stores_Issue"];
  const sheetRowCounts = {};
  const dateFieldDetected = {};
  const reasons = {};
  const warnings = [];

  sheets.forEach((sheetName) => {
    let rows = [];
    try {
      getSheet(sheetName);
      rows = getRowsAsObjects(sheetName).filter((row) => !isDeleted_(row));
    } catch (err) {
      sheetRowCounts[sheetName] = { totalRows: 0, selectedPeriodRows: 0 };
      dateFieldDetected[sheetName] = "";
      reasons[sheetName] = "sheet missing";
      warnings.push(sheetName + ": sheet missing");
      return;
    }

    const detectedCounts = {};
    rows.forEach((row) => {
      const field = monthCloseFirstPeriodField_(row);
      if (field) detectedCounts[field] = (detectedCounts[field] || 0) + 1;
    });
    const detectedField = Object.keys(detectedCounts).sort((a, b) => detectedCounts[b] - detectedCounts[a])[0] || "";
    const selectedPeriodRows = rows.filter((row) => materialFlowRowInPeriod_(row, periodMonth)).length;
    sheetRowCounts[sheetName] = {
      totalRows: rows.length,
      selectedPeriodRows,
    };
    dateFieldDetected[sheetName] = detectedField;

    if (!rows.length) {
      reasons[sheetName] = "sheet has no active rows";
      warnings.push(sheetName + ": sheet has no active rows");
    } else if (!detectedField) {
      reasons[sheetName] = "date column missing";
      warnings.push(sheetName + ": date/period column missing");
    } else if (!selectedPeriodRows) {
      reasons[sheetName] = "no rows in selected period";
      warnings.push(sheetName + ": no rows matched " + periodMonth + " using " + detectedField);
    } else {
      reasons[sheetName] = "matched selected period";
    }
  });

  return {
    periodNormalized: periodMonth,
    sheetRowCounts,
    dateFieldDetected,
    reasons,
    warnings,
  };
}

function materialFlowRowInPeriod_(row, periodMonth) {
  return normalizeMonthClosePeriod_(monthCloseFirstPeriodValue_(row)) === normalizeMonthClosePeriod_(periodMonth);
}

function addMasterOnlyMaterials_(materialIndex, rows, sourceSheet) {
  rows.forEach((row) => {
    const name = materialFlowCleanName_(row.materialName || row.itemName || row.gradeName || row.material || "");
    if (!name || materialIndex[name]) return;
    const normalized = materialFlowNormalizeMaterial_(name, row.category || row.materialType);
    if (!materialFlowIsManufacturingCategory_(normalized.category)) return;
    if (normalized.name === "Recipe Text") return;

    materialIndex[name] = {
      originalName: name,
      sources: { [sourceSheet]: true },
      currentInferredCategory: row.category || row.materialType || normalized.category,
      suggestedNormalizedName: normalized.name,
      suggestedNormalizedCategory: normalized.category,
      shouldMergeInto: normalized.mergeInto,
      quantityImpactBySource: {},
      netQuantityImpact: 0,
      causesNegativeInventory: false,
      appearsInMonthClose: false,
      appearsInProductionDropdowns: false,
      appearsInRMInwardDropdowns: false,
      appearsInDispatchDropdowns: false,
      examples: [],
    };
  });
}

function markDropdownAppearances_(materialIndex, masterRows, productionRows, rmRows, dispatchRows) {
  const masterNames = masterRows.map((row) => String(row.materialName || row.materialCode || "").toUpperCase());
  const productionNames = productionRows.map((row) => String(row.materialName || "").toUpperCase());
  const rmNames = rmRows.map((row) => String(row.material || row.color || "").toUpperCase());
  const dispatchNames = dispatchRows.map((row) => String(row.material || row.grade || row.productionGrade || "").toUpperCase());
  Object.keys(materialIndex).forEach((key) => {
    const item = materialIndex[key];
    const candidates = [item.originalName, item.suggestedNormalizedName].map((name) => String(name || "").toUpperCase());
    item.appearsInProductionDropdowns = candidates.some((name) => masterNames.indexOf(name) !== -1 || productionNames.indexOf(name) !== -1);
    item.appearsInRMInwardDropdowns = candidates.some((name) => masterNames.indexOf(name) !== -1 || rmNames.indexOf(name) !== -1);
    item.appearsInDispatchDropdowns = candidates.some((name) => masterNames.indexOf(name) !== -1 || dispatchNames.indexOf(name) !== -1 || /^E[1-5]$/.test(name));
  });
}

function markMonthCloseAppearances_(materialIndex, monthCloseRows) {
  const closeNames = ["White Flakes", "Washed White Flakes", "White Sorted", "White Sorted Flakes", "E1"];
  if (!monthCloseRows.length) closeNames.push("Material", "Washed Material", "Sorted Material", "Dispatch Material");
  Object.keys(materialIndex).forEach((key) => {
    const item = materialIndex[key];
    const candidates = [item.originalName, item.suggestedNormalizedName, item.shouldMergeInto].map((name) => String(name || "").toUpperCase());
    item.appearsInMonthClose = closeNames.some((name) => candidates.indexOf(String(name).toUpperCase()) !== -1);
  });
}

function diagnoseJuneDirectFlow_(periodMonth, movements) {
  const sortingProduced = movements.filter((m) => m.sourceSheet === "Sorting_Batches" && num(m.qtyIn) > 0 && /SORTED/i.test(m.originalName)).reduce((s, m) => s + num(m.qtyIn), 0);
  const extrusionSortedConsumed = movements.filter((m) => m.sourceSheet === "Extrusion_Batches" && num(m.qtyOut) > 0 && /SORTED/i.test(m.originalName)).reduce((s, m) => s + num(m.qtyOut), 0);
  const washProduced = movements.filter((m) => m.sourceSheet === "Wash_Batches" && num(m.qtyIn) > 0 && /WASHED/i.test(m.originalName)).reduce((s, m) => s + num(m.qtyIn), 0);
  return {
    periodMonth,
    sortingProducedKg: sortingProduced,
    extrusionSortedConsumedKg: extrusionSortedConsumed,
    washedProducedKg: washProduced,
    likelyDirectWashToExtrusion: sortingProduced <= 0.01 && extrusionSortedConsumed > 0.01,
    rootCause: sortingProduced <= 0.01 && extrusionSortedConsumed > 0.01
      ? "Extrusion is consuming a sorted-material alias while June source data does not show matching sorting output. Treat June as Wash -> Extrusion direct flow or normalize extrusion input to washed material."
      : "Review audit materials for alias mismatch and source/output timing.",
  };
}

function materialFlowBalancesFromLedger_(rows, periodMonth) {
  const balances = {};
  rows.filter((row) => materialFlowRowInPeriod_(row, periodMonth)).forEach((row) => {
    const normalized = materialFlowNormalizeMaterial_(row.itemName, row.itemType);
    if (!materialFlowIsManufacturingCategory_(normalized.category)) return;
    balances[normalized.name] = (balances[normalized.name] || 0) + num(row.qtyIn) - num(row.qtyOut);
  });
  return balances;
}

function isJuneManufacturingLedgerRow_(row, periodMonth) {
  if (!materialFlowRowInPeriod_(row, periodMonth)) return false;
  const normalized = materialFlowNormalizeMaterial_(row.itemName, row.itemType);
  return materialFlowIsManufacturingCategory_(normalized.category);
}

function materialFlowIsManufacturingCategory_(category) {
  return ["RM", "WIP", "FG", "REWORK", "WASTE", "ADDITIVE"].indexOf(String(category || "").toUpperCase()) !== -1;
}

function compactManufacturingBalances_(balances) {
  const compact = {};
  Object.keys(balances || {}).sort().forEach((material) => {
    const normalized = materialFlowNormalizeMaterial_(material, "");
    if (!materialFlowIsManufacturingCategory_(normalized.category)) return;
    compact[material] = round2(num(balances[material]));
  });
  return compact;
}

function negativeManufacturingBalances_(balances) {
  return Object.keys(balances || {}).sort()
    .filter((material) => num(balances[material]) < -0.01)
    .map((material) => ({ material, balance: round2(num(balances[material])) }));
}

function whiteSortedReconciliation_(beforeBalances, afterBalances) {
  const before = num(beforeBalances["White Sorted"] || 0) + num(beforeBalances["White Sorted Flakes"] || 0);
  const after = num(afterBalances["White Sorted"] || 0) + num(afterBalances["White Sorted Flakes"] || 0);
  return {
    beforeWhiteSorted: round2(before),
    afterWhiteSorted: round2(after),
    negativeWhiteSortedRemoved: before < -0.01 && after >= -0.01,
  };
}

function previewBackupSheetName_(prefix) {
  return prefix + "_" + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd_HHmmss");
}

function juneMigrationWarnings_() {
  return [
    "Chunk route does not return huge material arrays or examples.",
    "STORE materials are excluded from manufacturing migration summaries.",
    "Recipe/feed text and FG quality references are excluded from Inventory_Ledger itemName.",
    "Live chunk migration must start with cursor=0 and then continue with returned nextCursor; do not rerun the same live cursor.",
  ];
}

function proposedJuneMaterialNormalizationMap_() {
  return [
    { oldName: "White Flakes", normalizedName: "White Flakes", category: "RM", merge: false },
    { oldName: "Washed Material", normalizedName: "White Regrind (Washed)", category: "WIP", merge: true },
    { oldName: "Washed White Flakes", normalizedName: "White Regrind (Washed)", category: "WIP", merge: true },
    { oldName: "White Sorted", normalizedName: "White Sorted Regrind", category: "WIP", merge: true },
    { oldName: "Sorted Material", normalizedName: "White Sorted Regrind", category: "WIP", merge: true },
    { oldName: "E1", normalizedName: "E1", category: "FG", merge: false },
    { oldName: "E2", normalizedName: "E2", category: "FG", merge: false },
    { oldName: "E3", normalizedName: "E3", category: "FG", merge: false },
    { oldName: "Sink Material", normalizedName: "Sink Material", category: "WASTE", merge: false },
    { oldName: "Dust", normalizedName: "Dust", category: "WASTE", merge: false },
    { oldName: "Lumps", normalizedName: "Lumps", category: "REWORK", merge: false },
    { oldName: "Purging", normalizedName: "Purging", category: "REWORK", merge: false },
    { oldName: "Rework Granules", normalizedName: "Rework Material", category: "REWORK", merge: true },
    { oldName: "E1: 25000 Kg", normalizedName: "E1", category: "FG", merge: true },
    { oldName: "Recipe/feed text", normalizedName: "Do not store as inventory material", category: "UNKNOWN", merge: true },
  ];
}

function spreadsheetMaterialNormalizationTargets_() {
  return [
    { sheetName: "RM_Inward", idField: "inwardId", fields: ["material", "materialLines", "color"] },
    { sheetName: "Grinder_Batches", idField: "grinderBatchId", fields: ["inputMaterial", "outputMaterial", "inputLines", "outputLines", "outputComposition"] },
    { sheetName: "Wash_Batches", idField: "washBatchId", fields: ["inputMaterial", "outputMaterial", "outputComposition"] },
    { sheetName: "Sorting_Batches", idField: "sortingBatchId", fields: ["inputMaterial", "outputMaterial", "acceptedMaterial", "rejectedMaterialAction", "outputComposition"] },
    { sheetName: "Extrusion_Batches", idField: "extrusionBatchId", fields: ["inputMaterial", "productionGrade", "grade", "feedComposition", "outputComposition"] },
    { sheetName: "Dispatches", idField: "dispatchId", fields: ["material", "grade", "productionGrade", "dispatchLines"] },
    { sheetName: "Inventory_Ledger", idField: "ledgerId", fields: ["itemName"] },
    { sheetName: "Material_Master", idField: "materialId", fields: ["materialName"] },
    { sheetName: "Production_Materials", idField: "materialId", fields: ["materialName", "gradeName"] },
    { sheetName: "Production_Material_Master", idField: "materialId", fields: ["materialName", "canonicalName"] },
    { sheetName: "RM_Quality", idField: "qualityId", fields: ["material", "materialName"] },
    { sheetName: "FG_Quality", idField: "qualityId", fields: ["grade", "productionGrade", "material"] },
    { sheetName: "Month_Close", idField: "closeId", fields: ["material", "rmMaterial", "washMaterial", "sortingMaterial", "fgMaterial"] },
    { sheetName: "Physical_Counts", idField: "countId", fields: ["material", "rmMaterial", "washMaterial", "sortingMaterial", "fgMaterial"] },
  ];
}

function previewSpreadsheetMaterialNormalization(data = {}) {
  const periodMonth = normalizeMonthClosePeriod_(data.periodMonth || data.month || "");
  const includeAllRows = !periodMonth;
  const maxExamples = Math.max(1, Math.min(num(data.maxExamples) || 5, 20));
  const findings = {};
  const manualReview = {};
  const ignored = {
    blankValues: 0,
    recipeOrQualityReferences: 0,
    unchangedCanonicalValues: 0,
    missingSheets: [],
  };
  const scanned = {
    sheets: 0,
    rows: 0,
    cells: 0,
    materialTokens: 0,
  };

  spreadsheetMaterialNormalizationTargets_().forEach(function(target) {
    let rows = [];
    try {
      rows = getRowsAsObjects(target.sheetName).filter(function(row) { return !isDeleted_(row); });
    } catch (err) {
      ignored.missingSheets.push(target.sheetName);
      return;
    }

    scanned.sheets += 1;
    rows.forEach(function(row, index) {
      if (!includeAllRows && !materialNormalizationRowInPeriod_(row, periodMonth)) return;
      scanned.rows += 1;
      const sourceId = row[target.idField] || row.id || row.batchId || String(index + 2);

      target.fields.forEach(function(field) {
        if (row[field] === undefined || row[field] === null || String(row[field]).trim() === "") {
          ignored.blankValues += 1;
          return;
        }
        scanned.cells += 1;
        const entries = materialNormalizationEntriesFromCell_(row[field], field);
        entries.forEach(function(entry) {
          scanned.materialTokens += 1;
          const decision = materialNormalizationDecision_(entry.value, target.sheetName, field, row);
          if (decision.action === "IGNORE") {
            if (decision.reason === "Recipe/feed text or quality reference") ignored.recipeOrQualityReferences += 1;
            return;
          }
          if (decision.action === "UNCHANGED") {
            ignored.unchangedCanonicalValues += 1;
            return;
          }

          const bucket = decision.action === "MANUAL_REVIEW" ? manualReview : findings;
          const key = [
            decision.originalName.toUpperCase(),
            decision.normalizedName.toUpperCase(),
            target.sheetName,
            field,
            decision.action,
          ].join("|");
          if (!bucket[key]) {
            bucket[key] = {
              action: decision.action,
              originalName: decision.originalName,
              normalizedName: decision.normalizedName,
              category: decision.category,
              sheetName: target.sheetName,
              field,
              cellType: entry.cellType,
              rowCount: 0,
              examples: [],
              reason: decision.reason,
              risk: decision.risk,
            };
          }

          bucket[key].rowCount += 1;
          if (bucket[key].examples.length < maxExamples) {
            bucket[key].examples.push({
              sourceId,
              rowNumber: index + 2,
              originalCellValue: String(row[field]),
              jsonPath: entry.path || "",
              date: row.date || row.periodMonth || row.createdAt || "",
            });
          }
        });
      });
    });
  });

  const proposedChanges = Object.values(findings).sort(materialNormalizationFindingSort_);
  const manualReviewRows = Object.values(manualReview).sort(materialNormalizationFindingSort_);
  const groupedByOriginal = materialNormalizationGroupByOriginal_(proposedChanges, manualReviewRows);

  return {
    ok: true,
    route: "materialNormalization.preview",
    mode: "PREVIEW_ONLY_NO_SPREADSHEET_WRITES",
    periodMonth: periodMonth || "ALL",
    scanned,
    summary: {
      proposedChangeGroups: proposedChanges.length,
      proposedCellsOrTokens: proposedChanges.reduce(function(sum, row) { return sum + num(row.rowCount); }, 0),
      manualReviewGroups: manualReviewRows.length,
      manualReviewCellsOrTokens: manualReviewRows.reduce(function(sum, row) { return sum + num(row.rowCount); }, 0),
      unchangedCanonicalValues: ignored.unchangedCanonicalValues,
      recipeOrQualityReferencesIgnored: ignored.recipeOrQualityReferences,
      missingSheets: ignored.missingSheets,
    },
    proposedChanges,
    manualReviewRows,
    groupedByOriginal,
    approvedCanonicalNames: productionMaterialRowsFromDefaults_().map(function(row) {
      return row.canonicalName || row.materialName || "";
    }).filter(function(name) { return name; }),
    nextStep: "Review proposedChanges and manualReviewRows. Do not run an update until approved mappings and backup plan are confirmed.",
  };
}

function materialNormalizationEntriesFromCell_(value, field) {
  const text = String(value || "").trim();
  if (!text) return [];
  const entries = [];
  const isJsonLike = /^[\[{]/.test(text);

  if (isJsonLike) {
    try {
      const parsed = JSON.parse(text);
      materialNormalizationExtractJsonEntries_(entries, parsed, field);
      if (entries.length) return entries;
    } catch (err) {
      // Fall through to text parsing for malformed legacy cells.
    }
  }

  splitMaterialBuilderText_(text).forEach(function(part) {
    entries.push({
      value: part,
      path: field,
      cellType: "TEXT",
    });
  });
  return entries;
}

function materialNormalizationExtractJsonEntries_(entries, value, path) {
  if (Array.isArray(value)) {
    value.forEach(function(item, index) {
      materialNormalizationExtractJsonEntries_(entries, item, path + "[" + index + "]");
    });
    return;
  }
  if (!value || typeof value !== "object") return;

  ["material", "materialName", "materialType", "itemName", "grade", "productionGrade", "inputMaterial", "outputMaterial"].forEach(function(key) {
    if (value[key] === undefined || value[key] === null || String(value[key]).trim() === "") return;
    entries.push({
      value: value[key],
      path: path + "." + key,
      cellType: "JSON",
    });
  });
}

function materialNormalizationDecision_(value, sheetName, field, row) {
  const original = String(value || "").trim();
  const clean = materialFlowCleanName_(original);
  if (!clean || clean === "Recipe Text" || materialFlowIsQualityReference_(original)) {
    return {
      action: "IGNORE",
      originalName: original,
      normalizedName: "",
      category: "",
      reason: "Recipe/feed text or quality reference",
      risk: "NONE",
    };
  }

  const storesOnly = materialNormalizationStoresOnly_(original, sheetName, field, row) || materialNormalizationStoresOnly_(clean, sheetName, field, row);
  if (storesOnly) {
    return {
      action: "IGNORE",
      originalName: original,
      normalizedName: storesOnly.canonicalName,
      category: "STORES_ONLY",
      reason: storesOnly.reason,
      risk: "NONE",
    };
  }

  const contextAlias = materialNormalizationContextAlias_(clean, sheetName, field);
  if (contextAlias) {
    return {
      action: materialNormalizationKey_(clean) === materialNormalizationKey_(contextAlias.canonicalName) ? "UNCHANGED" : "NORMALIZE",
      originalName: original,
      normalizedName: contextAlias.canonicalName,
      category: contextAlias.category,
      reason: contextAlias.reason,
      risk: materialNormalizationRisk_(sheetName, field),
    };
  }

  const grade = materialNormalizationFgGrade_(clean);
  if (grade && grade !== clean.toUpperCase()) {
    return {
      action: "NORMALIZE",
      originalName: original,
      normalizedName: grade,
      category: "FG",
      reason: "FG grade alias or dispatch quantity text",
      risk: "LOW",
    };
  }

  const production = normalizeProductionMaterialName_(clean);
  const flow = materialFlowNormalizeMaterial_(clean, materialNormalizationSourceCategory_(sheetName, field, row));
  const normalizedName = production.known ? production.canonicalName : flow.name;
  const category = normalizeMaterialCategoryForLedger_(flow.category) || flow.category || materialCategory_(normalizedName);
  const sameName = materialNormalizationKey_(clean) === materialNormalizationKey_(normalizedName);
  const knownCanonical = production.known ||
    materialNormalizationKey_(flow.name) !== materialNormalizationKey_(clean) ||
    /^E[1-5]$/.test(String(normalizedName || "").toUpperCase());

  if (!normalizedName || normalizedName === "Recipe Text") {
    return {
      action: "IGNORE",
      originalName: original,
      normalizedName: "",
      category: "",
      reason: "Recipe/feed text or quality reference",
      risk: "NONE",
    };
  }

  if (sameName && knownCanonical) {
    return {
      action: "UNCHANGED",
      originalName: original,
      normalizedName,
      category,
      reason: "Already canonical",
      risk: "NONE",
    };
  }

  if (!knownCanonical || category === "UNKNOWN" || category === "Needs Review") {
    return {
      action: "MANUAL_REVIEW",
      originalName: original,
      normalizedName: normalizedName || "Needs Manual Review",
      category: category || "UNKNOWN",
      reason: "No approved canonical mapping",
      risk: "HIGH",
    };
  }

  return {
    action: "NORMALIZE",
    originalName: original,
    normalizedName,
    category,
    reason: production.known ? "Production material alias" : "Material flow alias",
    risk: materialNormalizationRisk_(sheetName, field),
  };
}

function materialNormalizationStoresOnly_(value, sheetName, field, row) {
  const key = materialAliasKey_(value);
  const contextText = [
    sheetName,
    field,
    row && row.sourceSheet,
    row && row.legacySourceSheet,
    row && row.sourceRef,
    row && row.targetRef,
    row && row.legacySourceId,
    row && row.ledgerId,
  ].join(" ").toUpperCase();
  if (/STORES[_ ]?INWARD|STORES[_ ]?ISSUE|RBL-STORESINWARD|RBL-STORESISSUE/.test(contextText)) {
    return {
      canonicalName: String(value || "").trim(),
      reason: "Stores-source ledger row excluded from production material migration",
    };
  }
  const storesOnly = {
    "CUT RESISTANCE HAND GLOVES": "Cut Resistance Hand Gloves",
    "3 PLY MASK": "3 PLY Mask",
    "PERMANENT MARKER": "Permanent Marker",
    "SAFETY GOGGLES": "Safety Goggles",
    "COTTON HAND GLOVES": "Cotton Hand Gloves",
    "DETTOL ANTI SPECTIC LIQUID": "Dettol Anti-Spectic liquid",
    "DFC BLADES": "DFC Blades",
    "25 KG PP WOVEN SACKS": "25 Kg PP Woven Sacks",
    "COUNTRY WOOD PALLETS 1200 MM X 1000 MM": "Country Wood Pallets 1200 mm X 1000 mm",
    "HEAD CAP": "Head Cap",
    "LIZOL 1LTR": "LIZOL 1LTR",
    "NOSE MASK": "Nose Mask",
    "STAPLER SMALL": "Stapler Small",
    "TISSUE PAPER": "TISSUE PAPER",
    "ZIP LOCK COVER 6X8": "ZIP Lock Cover 6X8",
    "25KG BAG": "25kg Bag",
    "4 CUTTING WHEEL": "4\" Cutting Wheel",
    "CAUSTIC FLAKES": "Caustic Flakes",
    "2 1 2 X 2 UPVC BUSH": "2 1/2\" X 2\" UPVC Bush",
    "2 UPVC FTA": "2\" UPVC FTA",
    "2 UPVC MTA": "2\" UPVC MTA",
  };
  if (!storesOnly[key]) return null;
  return {
    canonicalName: storesOnly[key],
    reason: "Stores-only item excluded from production material migration",
  };
}

function materialNormalizationContextAlias_(value, sheetName, field) {
  const key = materialAliasKey_(value);
  const sheet = String(sheetName || "").toUpperCase();
  const sourceField = String(field || "").toUpperCase();
  if (key === "MIXED REGRIND" && sheet === "WASH_BATCHES" && (sourceField.indexOf("INPUT") !== -1 || sourceField.indexOf("FEED") !== -1 || sourceField.indexOf("MATERIAL") !== -1)) {
    return {
      canonicalName: "White Regrind (Unwashed)",
      category: "WIP",
      reason: "Context mapping: Mixed Regrind in Wash input/feed means unwashed regrind input",
    };
  }
  if (sheet === "EXTRUSION_BATCHES" && sourceField.indexOf("FEEDCOMPOSITION") !== -1 && key === "WHITE FLAKES") {
    return {
      canonicalName: "White Regrind (Washed)",
      category: "WIP",
      reason: "Context mapping: WHITE_FLAKES in Extrusion feed means washed regrind input",
    };
  }
  return null;
}

function materialNormalizationFgGrade_(value) {
  const text = String(value || "").trim().toUpperCase();
  const match = text.match(/\bE\s*([1-5])\b/);
  if (!match) return "";
  return "E" + match[1];
}

function materialNormalizationSourceCategory_(sheetName, field, row) {
  if (row && row.itemType) return row.itemType;
  const sheet = String(sheetName || "").toUpperCase();
  const sourceField = String(field || "").toUpperCase();
  if (sheet === "DISPATCHES" || sourceField.indexOf("GRADE") !== -1) return "FG";
  if (sheet === "INVENTORY_LEDGER") return row && row.itemType || "";
  if (sheet.indexOf("STORES") !== -1) return "STORE";
  if (sheet === "RM_INWARD") return "RM";
  if (sheet === "FG_QUALITY") return "FG";
  if (/VIRGIN|MASTER|ADDITIVE/.test(String(row && row[field] || "").toUpperCase())) return "ADDITIVE";
  return "";
}

function materialNormalizationRisk_(sheetName, field) {
  const sheet = String(sheetName || "").toUpperCase();
  if (sheet === "INVENTORY_LEDGER") return "HIGH";
  if (sheet === "DISPATCHES") return "MEDIUM";
  if (String(field || "").indexOf(".") !== -1) return "MEDIUM";
  return "LOW";
}

function materialNormalizationRowInPeriod_(row, periodMonth) {
  if (!periodMonth) return true;
  return normalizeMonthClosePeriod_(monthCloseFirstPeriodValue_(row)) === periodMonth;
}

function materialNormalizationKey_(value) {
  return String(value || "").trim().toUpperCase().replace(/[^A-Z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function materialNormalizationFindingSort_(a, b) {
  return String(a.sheetName).localeCompare(String(b.sheetName), undefined, { numeric: true }) ||
    String(a.field).localeCompare(String(b.field), undefined, { numeric: true }) ||
    num(b.rowCount) - num(a.rowCount) ||
    String(a.originalName).localeCompare(String(b.originalName), undefined, { numeric: true });
}

function materialNormalizationGroupByOriginal_(proposedChanges, manualReviewRows) {
  const groups = {};
  proposedChanges.concat(manualReviewRows).forEach(function(row) {
    const key = row.originalName;
    if (!groups[key]) {
      groups[key] = {
        originalName: row.originalName,
        normalizedNames: {},
        totalCount: 0,
        actions: {},
        sheets: {},
      };
    }
    groups[key].normalizedNames[row.normalizedName] = true;
    groups[key].actions[row.action] = true;
    groups[key].sheets[row.sheetName] = true;
    groups[key].totalCount += num(row.rowCount);
  });

  return Object.values(groups).map(function(group) {
    return {
      originalName: group.originalName,
      normalizedNames: Object.keys(group.normalizedNames).sort(),
      totalCount: group.totalCount,
      actions: Object.keys(group.actions).sort(),
      sheets: Object.keys(group.sheets).sort(),
    };
  }).sort(function(a, b) {
    return num(b.totalCount) - num(a.totalCount) ||
      String(a.originalName).localeCompare(String(b.originalName), undefined, { numeric: true });
  });
}

function systemHealthConnectivity(data = {}) {
  const maxSamples = Math.max(1, Math.min(num(data.maxSamples) || 5, 20));
  const checks = [
    healthUnknownMaterialNames_(maxSamples),
    healthAliasCoverage_(maxSamples),
    healthLedgerUnknownMaterials_(maxSamples),
    healthProductionStageDirection_(maxSamples),
    healthDispatchFgGrades_(maxSamples),
    healthStoresProductionLinks_(maxSamples),
    healthMonthCloseReadiness_(maxSamples),
    healthJuneMigrationReadiness_(maxSamples),
  ];
  const counts = { red: 0, yellow: 0, green: 0 };
  checks.forEach(function(check) {
    counts[String(check.status || "yellow").toLowerCase()] = num(counts[String(check.status || "yellow").toLowerCase()]) + 1;
  });

  return {
    ok: true,
    route: "systemHealth.connectivity",
    mode: "READ_ONLY_NO_SPREADSHEET_WRITES",
    generatedAt: new Date().toISOString(),
    overallStatus: counts.red > 0 ? "red" : counts.yellow > 0 ? "yellow" : "green",
    summary: {
      red: counts.red,
      yellow: counts.yellow,
      green: counts.green,
      totalChecks: checks.length,
    },
    checks,
  };
}

function healthCard_(key, title, module, status, rowCount, sampleRows, recommendedAction) {
  return {
    key,
    title,
    module,
    status,
    rowCount: num(rowCount),
    sampleRows: sampleRows || [],
    recommendedAction,
  };
}

function healthStatus_(count, yellowWhenZero) {
  if (count > 0) return "red";
  return yellowWhenZero ? "yellow" : "green";
}

function healthUnknownMaterialNames_(maxSamples) {
  const preview = previewSpreadsheetMaterialNormalization({ maxExamples: maxSamples });
  const rows = preview.manualReviewRows || [];
  return healthCard_(
    "unknownMaterialNames",
    "Unknown Material Names",
    "All material-bearing sheets",
    healthStatus_(rows.length, false),
    rows.reduce(function(sum, row) { return sum + num(row.rowCount); }, 0),
    rows.slice(0, maxSamples),
    rows.length
      ? "Review manualReviewRows from materialNormalization.preview and approve mappings before Month Close."
      : "No unknown material names detected by preview."
  );
}

function healthAliasCoverage_(maxSamples) {
  const rows = getMaterialAliasMapRows_();
  const canonicalNames = {};
  productionMaterialRowsFromDefaults_().forEach(function(row) {
    canonicalNames[materialAliasKey_(row.canonicalName || row.materialName)] = true;
  });
  const missingCanonical = rows.filter(function(row) {
    return !canonicalNames[materialAliasKey_(row.canonicalName)];
  }).slice(0, maxSamples);

  return healthCard_(
    "aliasCoverage",
    "Alias Map Coverage",
    "Material_Alias_Map",
    missingCanonical.length ? "yellow" : "green",
    missingCanonical.length,
    missingCanonical,
    missingCanonical.length
      ? "Add or correct canonical names in Material_Alias_Map / Production_Material_Master."
      : "Default aliases resolve to approved canonical production materials."
  );
}

function healthLedgerUnknownMaterials_(maxSamples) {
  const rows = safeRows_("Inventory_Ledger").filter(function(row) {
    if (isDeleted_(row)) return false;
    const name = materialFlowCleanName_(row.itemName || "");
    if (!name || name === "Recipe Text" || materialFlowIsQualityReference_(name)) return false;
    const normalized = normalizeProductionMaterialName_(name);
    const category = normalizeMaterialCategoryForLedger_(row.itemType || materialCategory_(name));
    if (category === "STORE") return false;
    return !normalized.known && !/^E[1-5]$/.test(name.toUpperCase());
  });

  return healthCard_(
    "ledgerUnknownMaterials",
    "Ledger Rows With Unknown Materials",
    "Inventory_Ledger",
    healthStatus_(rows.length, false),
    rows.length,
    rows.slice(0, maxSamples).map(function(row) {
      return {
        ledgerId: row.ledgerId || "",
        date: row.date || "",
        itemName: row.itemName || "",
        itemType: row.itemType || "",
        qtyIn: num(row.qtyIn),
        qtyOut: num(row.qtyOut),
      };
    }),
    rows.length
      ? "Map these names through Material_Alias_Map or mark them for manual review before Month Close."
      : "Inventory_Ledger material names resolve or are excluded store rows."
  );
}

function healthProductionStageDirection_(maxSamples) {
  const issues = [];
  [
    { sheet: "Grinder_Batches", idField: "grinderBatchId", stage: "GRINDER", inputFields: ["inputMaterial", "feedComposition"], outputFields: ["outputComposition"] },
    { sheet: "Wash_Batches", idField: "washBatchId", stage: "WASH", inputFields: ["inputMaterial", "feedComposition"], outputFields: ["outputComposition"] },
    { sheet: "Sorting_Batches", idField: "sortingBatchId", stage: "SORTING", inputFields: ["inputMaterial", "feedComposition"], outputFields: ["outputComposition"] },
    { sheet: "Extrusion_Batches", idField: "extrusionBatchId", stage: "EXTRUSION", inputFields: ["inputMaterial", "feedComposition"], outputFields: ["outputComposition", "productionGrade"] },
  ].forEach(function(config) {
    safeRows_(config.sheet).forEach(function(row, index) {
      if (isDeleted_(row)) return;
      config.inputFields.forEach(function(field) {
        healthCheckProductionMaterialCell_(issues, row, index, config, field, "INPUT");
      });
      config.outputFields.forEach(function(field) {
        healthCheckProductionMaterialCell_(issues, row, index, config, field, "OUTPUT");
      });
    });
  });

  return healthCard_(
    "productionStageDirection",
    "Invalid Production Stage/Direction Materials",
    "Production",
    healthStatus_(issues.length, false),
    issues.length,
    issues.slice(0, maxSamples),
    issues.length
      ? "Correct source rows or Material_Alias_Map/Production_Material_Master stage permissions before migration."
      : "Production material rows match stage and direction rules."
  );
}

function healthCheckProductionMaterialCell_(issues, row, index, config, field, direction) {
  const entries = materialNormalizationEntriesFromCell_(row[field], field);
  entries.forEach(function(entry) {
    const value = String(entry.value || "").trim();
    if (!value || materialFlowIsQualityReference_(value)) return;
    const contextAlias = materialNormalizationContextAlias_(materialFlowCleanName_(value), config.sheet, field);
    const normalized = contextAlias
      ? { known: true, canonicalName: contextAlias.canonicalName }
      : normalizeProductionMaterialName_(value);
    if (!normalized.known) {
      issues.push({
        sheet: config.sheet,
        rowNumber: index + 2,
        sourceId: row[config.idField] || "",
        field,
        value,
        normalizedName: normalized.canonicalName,
        issue: "Needs Manual Review",
      });
      return;
    }
    const masterRow = getProductionMaterialMasterRows_().find(function(item) {
      return materialAliasKey_(item.canonicalName || item.materialName) === materialAliasKey_(normalized.canonicalName);
    });
    if (!masterRow || !productionMaterialAllowedFor_(masterRow, config.stage, direction)) {
      issues.push({
        sheet: config.sheet,
        rowNumber: index + 2,
        sourceId: row[config.idField] || "",
        field,
        value,
        normalizedName: normalized.canonicalName,
        stage: config.stage,
        direction,
        issue: "Not allowed for stage/direction",
      });
    }
  });
}

function healthDispatchFgGrades_(maxSamples) {
  const issues = [];
  safeRows_("Dispatches").forEach(function(row, index) {
    if (isDeleted_(row)) return;
    const lines = parseDispatchLines_(row.dispatchLines);
    const targets = lines.length ? lines : [{ grade: row.grade || row.material || row.productionGrade || "" }];
    targets.forEach(function(line) {
      const grade = dispatchLineGrade_(line, row.grade || row.material);
      if (!/^E[1-5]$/.test(String(grade || "").toUpperCase())) {
        issues.push({
          rowNumber: index + 2,
          dispatchId: row.dispatchId || "",
          value: line.grade || line.material || row.grade || row.material || "",
          resolvedGrade: grade || "",
          issue: "Dispatch grade does not resolve to E1-E5",
        });
      }
    });
  });

  return healthCard_(
    "dispatchFgGrades",
    "Dispatch Rows Not Resolving To E1-E5",
    "Dispatch",
    healthStatus_(issues.length, false),
    issues.length,
    issues.slice(0, maxSamples),
    issues.length
      ? "Normalize dispatch lines to FG grades E1-E5 before ledger repair."
      : "Dispatch rows resolve to FG grade lines."
  );
}

function healthStoresProductionLinks_(maxSamples) {
  const productionApproved = ["VIRGIN PPCP", "BATTERY PPCP", "MASTERBATCH"];
  const issues = [];
  safeRows_("Stores_Master").forEach(function(row, index) {
    if (isDeleted_(row)) return;
    const normalized = normalizeProductionMaterialName_(row.itemName || row.materialName || "");
    const canonical = String(normalized.canonicalName || "").toUpperCase();
    if (productionApproved.indexOf(canonical) === -1) return;
    if (row.materialId || row.linkedMaterialId || row.materialCode) return;
    issues.push({
      rowNumber: index + 2,
      itemId: row.itemId || "",
      itemName: row.itemName || row.materialName || "",
      canonicalName: normalized.canonicalName,
      issue: "Production-approved stores item has no Material_Master link",
    });
  });

  return healthCard_(
    "storesProductionLinks",
    "Stores Items That Need Production Material Links",
    "Stores",
    issues.length ? "yellow" : "green",
    issues.length,
    issues.slice(0, maxSamples),
    issues.length
      ? "Add linked Material_Master id/code before allowing Stores issue to feed Extrusion consumption."
      : "No unlinked production-approved Stores items detected."
  );
}

function healthMonthCloseReadiness_(maxSamples) {
  const ledgerUnknown = healthLedgerUnknownMaterials_(maxSamples);
  const monthCloseOldRows = [];
  safeRows_("Month_Close").forEach(function(row, index) {
    ["washSystemClosingKg", "sortingSystemClosingKg", "fgSystemClosingKg"].forEach(function(field) {
      if (num(row[field]) !== 0) {
        monthCloseOldRows.push({
          rowNumber: index + 2,
          closeId: row.closeId || "",
          periodMonth: row.periodMonth || "",
          field,
          value: num(row[field]),
          issue: "Legacy aggregate close field needs ledger/canonical reconciliation",
        });
      }
    });
  });
  const count = num(ledgerUnknown.rowCount) + monthCloseOldRows.length;
  return healthCard_(
    "monthCloseReadiness",
    "Month Close Readiness",
    "Month Close",
    count ? "yellow" : "green",
    count,
    monthCloseOldRows.slice(0, maxSamples),
    count
      ? "Finish alias review, ledger repair dry-run, and Month Close ledger alignment before closing."
      : "No obvious Month Close blockers found in preview checks."
  );
}

function healthJuneMigrationReadiness_(maxSamples) {
  const preview = previewSpreadsheetMaterialNormalization({ periodMonth: "2026-06", maxExamples: maxSamples });
  const manualCount = preview.summary ? num(preview.summary.manualReviewCellsOrTokens) : 0;
  const proposedCount = preview.summary ? num(preview.summary.proposedCellsOrTokens) : 0;
  const rowCount = manualCount + proposedCount;
  return healthCard_(
    "june2026MigrationReadiness",
    "June 2026 Migration Readiness",
    "Migration / Repair",
    manualCount ? "red" : proposedCount ? "yellow" : "green",
    rowCount,
    (preview.groupedByOriginal || []).slice(0, maxSamples),
    manualCount
      ? "Resolve June manual-review names before migration."
      : proposedCount
      ? "Review proposed June mappings, backup sheets, then run dry-run migration."
      : "June preview did not find material normalization work."
  );
}

function normalizeFgMaterialName_(value) {
  const raw = String(value || "").trim().toUpperCase();
  const match = raw.match(/\bE[1-5]\b/);
  return match ? match[0] : raw;
}

function parseFgDispatchItems_(label, fallbackQty) {
  const text = String(label || "").trim();
  const items = [];
  const pattern = /\b(E[1-5])\b[^0-9]*([\d,]+(?:\.\d+)?)\s*(?:KG|KGS|KILOGRAMS)?/gi;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    items.push({
      itemName: String(match[1] || "").toUpperCase(),
      quantityKg: num(String(match[2] || "").replace(/,/g, "")),
    });
  }

  if (items.length) {
    return items.filter((item) => item.itemName && item.quantityKg > 0);
  }

  const itemName = normalizeFgMaterialName_(text);
  if (!itemName || num(fallbackQty) <= 0) return [];
  return [{ itemName, quantityKg: num(fallbackQty) }];
}

function ledgerBalancesForItems_(rows, itemNames) {
  const wanted = {};
  itemNames.forEach((item) => {
    wanted[String(item || "").toUpperCase()] = {
      itemName: String(item || "").toUpperCase(),
      qtyIn: 0,
      qtyOut: 0,
      balance: 0,
    };
  });

  rows.forEach((row) => {
    const itemType = String(row.itemType || "").toUpperCase();
    const itemName = normalizeFgMaterialName_(row.itemName);
    if (itemType !== "FG" || !wanted[itemName]) return;
    wanted[itemName].qtyIn += num(row.qtyIn);
    wanted[itemName].qtyOut += num(row.qtyOut);
    wanted[itemName].balance += num(row.qtyIn) - num(row.qtyOut);
  });

  return Object.keys(wanted).map((key) => ({
    itemName: wanted[key].itemName,
    qtyIn: round2(wanted[key].qtyIn),
    qtyOut: round2(wanted[key].qtyOut),
    balance: round2(wanted[key].balance),
  }));
}

function auditInventoryLedger(data = {}) {
  const periodMonth = auditPeriodMonth_(data.periodMonth || data.month || "");
  const ledgerRows = getRowsAsObjects("Inventory_Ledger")
    .filter((row) => !isDeleted_(row));
  const scopedLedgerRows = periodMonth
    ? ledgerRows.filter((row) => auditRowPeriod_(row) === periodMonth)
    : ledgerRows;

  const duplicateGroups = auditGroupRows_(
    scopedLedgerRows,
    ["movementType", "sourceRef", "legacySourceSheet", "legacySourceId", "itemType", "itemName"]
  ).filter((group) => group.count > 1);

  const duplicateLegacyMovements = auditGroupRows_(
    scopedLedgerRows.filter((row) => row.legacySourceSheet || row.legacySourceId),
    ["legacySourceSheet", "legacySourceId", "movementType", "itemType", "itemName"]
  ).filter((group) => group.count > 1);

  const physicalMovementDuplicates = auditFindPhysicalMovementDuplicates_(scopedLedgerRows);
  const materialBalances = auditGroupRows_(scopedLedgerRows, ["itemType", "itemName"]);
  const ledgerFgBalances = materialBalances.filter((row) => String(row.itemType || "").toUpperCase() === "FG");
  const ledgerFgMovementBreakdown = auditGroupRows_(
    scopedLedgerRows.filter((row) => String(row.itemType || "").toUpperCase() === "FG"),
    ["module", "movementType", "legacySourceSheet", "itemName"]
  );

  const extrusionRows = auditRowsForPeriod_("Extrusion_Batches", periodMonth);
  const dispatchRows = auditRowsForPeriod_("Dispatches", periodMonth);
  const legacyExtrusionFgOutput = auditLegacyExtrusionFg_(extrusionRows);
  const legacyDispatchQty = auditLegacyDispatchFg_(dispatchRows);

  return output({
    ok: true,
    route: "inventoryLedger.audit",
    periodMonth: periodMonth || "ALL",
    rowsAudited: scopedLedgerRows.length,
    ledgerRowsTotal: ledgerRows.length,
    groupingFields: [
      "movementType",
      "sourceRef",
      "legacySourceSheet",
      "legacySourceId",
      "itemType",
      "itemName",
    ],
    duplicateGroupCount: duplicateGroups.length,
    duplicateLegacyMovementCount: duplicateLegacyMovements.length,
    duplicatePhysicalMovementCount: physicalMovementDuplicates.length,
    duplicateGroups: duplicateGroups.slice(0, 100),
    duplicateLegacyMovements: duplicateLegacyMovements.slice(0, 100),
    duplicatePhysicalMovements: physicalMovementDuplicates.slice(0, 100),
    materialBalances,
    fgComparison: {
      ledgerFgBalances,
      ledgerFgMovementBreakdown,
      legacyExtrusionRows: extrusionRows.length,
      legacyExtrusionFgOutput,
      legacyDispatchRows: dispatchRows.length,
      legacyDispatchQty,
    },
    idempotencyAssessment: {
      migrationLedgerKey: "legacySourceSheet|legacySourceId|movementType|itemName",
      exactMigrationDuplicatesFound: duplicateLegacyMovements.length,
      note:
        "Migration ledger append is idempotent for the exact legacy source, movement type, and material. This audit also flags duplicate physical movements across old operational ledger rows and migration ledger rows.",
    },
    likelyRootCause:
      "Dispatch availability reads Inventory_Ledger balance. After cut-over, the ledger can contain both old operational EXTRUSION/DISPATCH rows and new Manufacturing Cutover migration rows for the same physical production/dispatch, inflating balances even when migration reruns are exact-idempotent.",
  });
}

function auditPeriodMonth_(value) {
  const text = String(value || "").trim();
  if (/^\d{4}-\d{2}/.test(text)) return text.slice(0, 7);
  return "";
}

function auditRowPeriod_(row) {
  const explicit = auditPeriodMonth_(row.periodMonth);
  if (explicit) return explicit;
  return getPeriodMonth(row.date || row.createdAt || todayYmd());
}

function auditRowsForPeriod_(sheetName, periodMonth) {
  return getRowsAsObjects(sheetName)
    .filter((row) => !isDeleted_(row))
    .filter((row) => !periodMonth || auditRowPeriod_(row) === periodMonth);
}

function auditGroupRows_(rows, fields) {
  const map = {};

  rows.forEach((row) => {
    const key = fields.map((field) => String(row[field] || "")).join("|");
    if (!map[key]) {
      const group = {
        key,
        count: 0,
        qtyIn: 0,
        qtyOut: 0,
        balance: 0,
        examples: [],
      };
      fields.forEach((field) => {
        group[field] = row[field] || "";
      });
      map[key] = group;
    }

    map[key].count += 1;
    map[key].qtyIn += num(row.qtyIn);
    map[key].qtyOut += num(row.qtyOut);
    map[key].balance += num(row.qtyIn) - num(row.qtyOut);

    if (map[key].examples.length < 3) {
      map[key].examples.push({
        date: row.date || "",
        module: row.module || "",
        movementType: row.movementType || "",
        sourceRef: row.sourceRef || "",
        targetRef: row.targetRef || "",
        legacySourceSheet: row.legacySourceSheet || "",
        legacySourceId: row.legacySourceId || "",
        itemType: row.itemType || "",
        itemName: row.itemName || "",
        qtyIn: num(row.qtyIn),
        qtyOut: num(row.qtyOut),
        remarks: row.remarks || "",
      });
    }
  });

  return Object.keys(map)
    .map((key) => ({
      ...map[key],
      qtyIn: round2(map[key].qtyIn),
      qtyOut: round2(map[key].qtyOut),
      balance: round2(map[key].balance),
    }))
    .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));
}

function auditFindPhysicalMovementDuplicates_(rows) {
  const relevantRows = rows.filter((row) => {
    const itemType = String(row.itemType || "").toUpperCase();
    const moduleName = String(row.module || "").toUpperCase();
    const movementType = String(row.movementType || "").toUpperCase();
    return (
      itemType === "FG" &&
      (
        moduleName === "EXTRUSION" ||
        moduleName === "DISPATCH" ||
        moduleName === "MANUFACTURING CUTOVER" ||
        movementType.indexOf("TRANSFORMATION_OUTPUT") === 0 ||
        movementType === "FG_DISPATCH_OUT"
      )
    );
  }).map((row) => {
    const direction = num(row.qtyIn) >= num(row.qtyOut) ? "IN" : "OUT";
    return {
      ...row,
      movementDirection: direction,
    };
  });

  return auditGroupRows_(relevantRows, ["itemType", "itemName", "sourceRef", "movementDirection"]).filter((group) => {
    const modules = {};
    group.examples.forEach((row) => {
      if (row.module) modules[row.module] = true;
    });
    return group.count > 1 && Object.keys(modules).length > 1;
  });
}

function auditFgMaterial_(value) {
  const raw = String(value || "").trim().toUpperCase();
  const match = raw.match(/\bE[1-5]\b/);
  return match ? match[0] : raw || "UNKNOWN";
}

function auditLegacyExtrusionFg_(rows) {
  const map = {};
  rows.forEach((row) => {
    const grade = auditFgMaterial_(row.productionGrade || row.grade);
    if (!map[grade]) map[grade] = { itemName: grade, rows: 0, fgOutputKg: 0 };
    map[grade].rows += 1;
    map[grade].fgOutputKg += num(row.fgOutputKg);
  });
  return Object.keys(map)
    .map((key) => ({
      itemName: key,
      rows: map[key].rows,
      fgOutputKg: round2(map[key].fgOutputKg),
    }))
    .sort((a, b) => b.fgOutputKg - a.fgOutputKg);
}

function auditLegacyDispatchFg_(rows) {
  const map = {};

  rows.forEach((row) => {
    const lines = parseDispatchLines_(row.dispatchLines);
    if (lines.length > 0) {
      lines.forEach((line) => {
        const grade = auditFgMaterial_(line.grade || row.grade);
        const quantityKg = num(line.dispatchQtyKg || line.quantityKg);
        if (!map[grade]) map[grade] = { itemName: grade, rows: 0, quantityKg: 0 };
        map[grade].rows += 1;
        map[grade].quantityKg += quantityKg;
      });
      return;
    }

    const grade = auditFgMaterial_(row.grade || row.productionGrade);
    if (!map[grade]) map[grade] = { itemName: grade, rows: 0, quantityKg: 0 };
    map[grade].rows += 1;
    map[grade].quantityKg += num(row.quantityKg);
  });

  return Object.keys(map)
    .map((key) => ({
      itemName: key,
      rows: map[key].rows,
      quantityKg: round2(map[key].quantityKg),
    }))
    .sort((a, b) => b.quantityKg - a.quantityKg);
}
// QUALITY

function rmQualityHeaders_() {
  return [
    "qualityId",
    "qualityRef",
    "date",
    "sourceType",
    "sourceRef",
    "rmInwardId",
    "legacyQualityRef",
    "rubberLevel",
    "metalContaminationPercent",
    "dustPercent",
    "rubberPercent",
    "ppPercent",
    "sinkMaterialPercent",
    "moisturePercent",
    "contaminationPercent",
    "mfi",
    "visualRating",
    "formOfMaterial",
    "conditionOfMaterial",
    "sampleQtyGm",
    "dryDustGm",
    "colouredFlakesGm",
    "rubberContaminationNo",
    "ppGm",
    "sinkMaterialGm",
    "dryDustPercent",
    "colouredFlakesPercent",
    "acceptGm",
    "remarks",
    "decision",
    "qcStatus",
    "status",
    "testedBy",
    "migrationStatus",
    "createdBy",
    "createdAt",
  ];
}

function fgQualityHeaders_() {
  return [
    "qualityId",
    "qualityRef",
    "date",
    "sourceType",
    "sourceRef",
    "extrusionBatchId",
    "fgBatchCode",
    "legacyQualityRef",
    "grade",
    "machine",
    "shift",
    "quantity",
    "moisturePercent",
    "mfi",
    "izod",
    "ashPercent",
    "colour",
    "blackDots",
    "appearance",
    "bagWeight1Kg",
    "bagWeight2Kg",
    "bagWeight3Kg",
    "bagWeight4Kg",
    "avgBagWeightKg",
    "remarks",
    "decision",
    "qcStatus",
    "status",
    "testedBy",
    "migrationStatus",
    "createdBy",
    "createdAt",
  ];
}

function addRmQuality(data = {}) {
  const sh = getSheet("RM_Quality");

  ensureHeaders_("RM_Quality", rmQualityHeaders_());

  const qualityId = data.qualityId || generateBatchId("RMQ");
  const date = normalizeDateOnly_(data.date || todayYmd());
  const sourceRef = data.sourceRef || data.rmInwardId || data.inwardId || "";
  const qualityRef = data.qualityRef || sourceRef || qualityId;
  const decision = String(data.decision || data.qcStatus || data.status || "APPROVED").toUpperCase();

  appendObjectRow(sh, {
    qualityId,
    qualityRef,
    date,
    sourceType: data.sourceType || "INCOMING_MATERIAL",
    sourceRef,
    rmInwardId: sourceRef,
    legacyQualityRef: data.legacyQualityRef || "",
    rubberLevel: data.rubberLevel || "",
    metalContaminationPercent: num(data.metalContaminationPercent),
    dustPercent: num(data.dustPercent || data.moisturePercent),
    rubberPercent: "",
    ppPercent: num(data.ppPercent),
    sinkMaterialPercent: num(data.sinkMaterialPercent),
    moisturePercent: num(data.dustPercent || data.moisturePercent),
    contaminationPercent: num(data.contaminationPercent),
    mfi: num(data.mfi),
    visualRating: data.visualRating || "",
    formOfMaterial: data.formOfMaterial || "",
    conditionOfMaterial: data.conditionOfMaterial || "",
    sampleQtyGm: num(data.sampleQtyGm),
    dryDustGm: num(data.dryDustGm),
    colouredFlakesGm: num(data.colouredFlakesGm),
    rubberContaminationNo: num(data.rubberContaminationNo),
    ppGm: num(data.ppGm),
    sinkMaterialGm: num(data.sinkMaterialGm),
    dryDustPercent: num(data.dryDustPercent),
    colouredFlakesPercent: num(data.colouredFlakesPercent),
    acceptGm: num(data.acceptGm),
    remarks: data.remarks || "",
    decision,
    qcStatus: decision,
    status: decision,
    testedBy: data.testedBy || data.createdBy || "Quality",
    migrationStatus: data.migrationStatus || "",
    createdBy: data.createdBy || "System",
    createdAt: new Date(),
  });

  const rmInwardId = sourceRef;
  let receivingUpdate = { updated: false };
  let ledger = { posted: false, reason: "NOT_APPROVED" };

  if (rmInwardId) {
    const rmRow = getRowById_("RM_Inward", "inwardId", rmInwardId);
    ensureHeaders_("RM_Inward", ["qcStatus", "status"]);
    const receivingStatus =
      decision === "APPROVED"
        ? "APPROVED"
        : decision === "REJECTED"
        ? "REJECTED"
        : "HOLD";

    updateById("RM_Inward", "inwardId", rmInwardId, {
      qcStatus: receivingStatus,
      status: receivingStatus,
    });

    receivingUpdate = { updated: true, qcStatus: receivingStatus };

    if (decision === "APPROVED" && rmRow) {
      ledger = postApprovedRmInventory_(
        rmInwardId,
        {
          ...rmRow,
          createdBy: data.createdBy || "Quality",
        },
        normalizeDateOnly_(rmRow.date || data.date || todayYmd())
      );
    }
  }

  return output({ ok: true, qualityId, receivingUpdate, ledger });
}

function updateRmQuality(data = {}) {
  ensureHeaders_("RM_Quality", rmQualityHeaders_());
  const sourceRef = data.sourceRef || data.rmInwardId || data.inwardId || "";
  const decision = String(data.decision || data.qcStatus || data.status || "").toUpperCase();
  const result = updateById("RM_Quality", "qualityId", data.qualityId, {
    qualityRef: data.qualityRef || "",
    date: normalizeDateOnly_(data.date || todayYmd()),
    sourceType: data.sourceType || "INCOMING_MATERIAL",
    sourceRef,
    rmInwardId: sourceRef,
    legacyQualityRef: data.legacyQualityRef || "",
    rubberLevel: data.rubberLevel || "",
    metalContaminationPercent: num(data.metalContaminationPercent),
    dustPercent: num(data.dustPercent || data.moisturePercent),
    rubberPercent: data.rubberPercent ? num(data.rubberPercent) : "",
    ppPercent: num(data.ppPercent),
    sinkMaterialPercent: num(data.sinkMaterialPercent),
    moisturePercent: num(data.dustPercent || data.moisturePercent),
    contaminationPercent: num(data.contaminationPercent),
    mfi: num(data.mfi),
    visualRating: data.visualRating || "",
    formOfMaterial: data.formOfMaterial || "",
    conditionOfMaterial: data.conditionOfMaterial || "",
    sampleQtyGm: num(data.sampleQtyGm),
    dryDustGm: num(data.dryDustGm),
    colouredFlakesGm: num(data.colouredFlakesGm),
    rubberContaminationNo: num(data.rubberContaminationNo),
    ppGm: num(data.ppGm),
    sinkMaterialGm: num(data.sinkMaterialGm),
    dryDustPercent: num(data.dryDustPercent),
    colouredFlakesPercent: num(data.colouredFlakesPercent),
    acceptGm: num(data.acceptGm),
    remarks: data.remarks || "",
    decision,
    qcStatus: decision,
    status: decision,
    testedBy: data.testedBy || "",
    migrationStatus: data.migrationStatus || "",
  });

  const rmInwardId = sourceRef;

  if (rmInwardId && decision) {
    const rmRow = getRowById_("RM_Inward", "inwardId", rmInwardId);
    ensureHeaders_("RM_Inward", ["qcStatus", "status"]);
    const receivingStatus =
      decision === "APPROVED"
        ? "APPROVED"
        : decision === "REJECTED"
        ? "REJECTED"
        : "HOLD";

    updateById("RM_Inward", "inwardId", rmInwardId, {
      qcStatus: receivingStatus,
      status: receivingStatus,
    });

    if (decision === "APPROVED" && rmRow) {
      postApprovedRmInventory_(
        rmInwardId,
        {
          ...rmRow,
          createdBy: data.createdBy || "Quality",
        },
        normalizeDateOnly_(rmRow.date || data.date || todayYmd())
      );
    }
  }

  return result;
}

function addFgQuality(data = {}) {
  const sh = getSheet("FG_Quality");

  ensureHeaders_("FG_Quality", fgQualityHeaders_());

  const qualityId = data.qualityId || generateBatchId("FGQ");
  const date = normalizeDateOnly_(data.date || todayYmd());
  const sourceRef = data.sourceRef || data.extrusionBatchId || data.fgBatchCode || "";
  const qualityRef = data.qualityRef || data.fgBatchCode || sourceRef || qualityId;
  const decision = String(data.decision || data.qcStatus || data.status || "APPROVED").toUpperCase();

  appendObjectRow(sh, {
    qualityId,
    qualityRef,
    date,
    sourceType: data.sourceType || "FG_PRODUCTION",
    sourceRef,
    extrusionBatchId: sourceRef,
    fgBatchCode: qualityRef,
    legacyQualityRef: data.legacyQualityRef || "",
    grade: data.grade || "",
    machine: data.machine || "",
    shift: data.shift || "",
    quantity: num(data.quantity),
    moisturePercent: num(data.moisturePercent),
    mfi: num(data.mfi),
    izod: num(data.izod),
    ashPercent: num(data.ashPercent),
    colour: data.colour || "",
    blackDots: num(data.blackDots),
    appearance: data.appearance || "",
    bagWeight1Kg: num(data.bagWeight1Kg),
    bagWeight2Kg: num(data.bagWeight2Kg),
    bagWeight3Kg: num(data.bagWeight3Kg),
    bagWeight4Kg: num(data.bagWeight4Kg),
    avgBagWeightKg: num(data.avgBagWeightKg),
    remarks: data.remarks || "",
    decision,
    qcStatus: decision,
    status: decision,
    testedBy: data.testedBy || data.createdBy || "Quality",
    migrationStatus: data.migrationStatus || "",
    createdBy: data.createdBy || "System",
    createdAt: new Date(),
  });

  return output({ ok: true, qualityId });
}

function updateFgQuality(data = {}) {
  ensureHeaders_("FG_Quality", fgQualityHeaders_());
  const sourceRef = data.sourceRef || data.extrusionBatchId || data.fgBatchCode || "";
  const qualityRef = data.qualityRef || data.fgBatchCode || sourceRef || "";
  const decision = String(data.decision || data.qcStatus || data.status || "").toUpperCase();
  return updateById("FG_Quality", "qualityId", data.qualityId, {
    qualityRef,
    date: normalizeDateOnly_(data.date || todayYmd()),
    sourceType: data.sourceType || "FG_PRODUCTION",
    sourceRef,
    extrusionBatchId: sourceRef,
    fgBatchCode: qualityRef,
    legacyQualityRef: data.legacyQualityRef || "",
    grade: data.grade || "",
    machine: data.machine || "",
    shift: data.shift || "",
    quantity: num(data.quantity),
    moisturePercent: num(data.moisturePercent),
    mfi: num(data.mfi),
    izod: num(data.izod),
    ashPercent: num(data.ashPercent),
    colour: data.colour || "",
    blackDots: num(data.blackDots),
    appearance: data.appearance || "",
    bagWeight1Kg: num(data.bagWeight1Kg),
    bagWeight2Kg: num(data.bagWeight2Kg),
    bagWeight3Kg: num(data.bagWeight3Kg),
    bagWeight4Kg: num(data.bagWeight4Kg),
    avgBagWeightKg: num(data.avgBagWeightKg),
    remarks: data.remarks || "",
    decision,
    qcStatus: decision,
    status: decision,
    testedBy: data.testedBy || "",
    migrationStatus: data.migrationStatus || "",
  });
}

function qualityDateOnly_(value) {
  if (!value) return "";
  if (Object.prototype.toString.call(value) === "[object Date]" && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }

  const text = String(value || "").trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  if (/^\d{1,2}[/-]\d{1,2}[/-]\d{4}$/.test(text)) {
    const parts = text.split(/[/-]/).map((part) => part.trim());
    const first = Number(parts[0]);
    const second = Number(parts[1]);
    const year = Number(parts[2]);
    const day = first > 12 ? first : second;
    const month = first > 12 ? second : first;
    if (year && month && day) {
      return [
        String(year).padStart(4, "0"),
        String(month).padStart(2, "0"),
        String(day).padStart(2, "0"),
      ].join("-");
    }
  }

  return "";
}

function qualityDateCompact_(value) {
  return qualityDateOnly_(value).replace(/-/g, "");
}

function qualityTrailingSequence_(value, fallback) {
  const match = String(value || "").match(/(\d+)\s*$/);
  const parsed = match ? Number(match[1]) : 0;
  return String(parsed || fallback || 1).padStart(3, "0");
}

function qualityIsNewReceivingRef_(value) {
  return /^MR-\d{8}-[A-Z0-9]+-\d{3}$/i.test(String(value || "").trim());
}

function qualityIsNewFgRef_(value) {
  return /^[A-Z0-9]+-\d{8}-[A-Z0-9]+-\d{3}$/i.test(String(value || "").trim());
}

function qualityCleanGrade_(value) {
  const text = String(value || "").trim().toUpperCase();
  const gradeMatch = text.match(/\bE[1-5]\b/);
  if (gradeMatch) return gradeMatch[0];

  return cleanCodePart_(text, "FG");
}

function qualityCleanShift_(value) {
  const text = String(value || "").trim().toUpperCase();
  const match = text.match(/[A-Z0-9]/);
  return match ? match[0] : "A";
}

function qualityRowsWithIndex_(sheetName) {
  const sheet = getSheet(sheetName);
  const values = sheet.getDataRange().getValues();
  if (!values.length) return { sheet, headers: [], rows: [] };

  const headers = values[0].map((header) => String(header || "").trim());
  const rows = values.slice(1).map((row, index) => {
    const record = { __rowNumber: index + 2 };
    headers.forEach((header, colIndex) => {
      if (header) record[header] = row[colIndex];
    });
    return record;
  });

  return { sheet, headers, rows };
}

function qualityIndexRowsByRefs_(rows, fields) {
  const map = {};
  rows.forEach((row, index) => {
    fields.forEach((field) => {
      const value = String(row[field] || "").trim();
      if (value && !map[value]) {
        map[value] = { row, index };
      }
    });
  });
  return map;
}

function qualityRmReferenceFromRow_(oldRef, rmMatch) {
  const row = rmMatch && rmMatch.row ? rmMatch.row : {};
  const existing = String(row.inwardId || row.receivingRef || "").trim();
  if (qualityIsNewReceivingRef_(existing)) return existing;

  const date = qualityDateCompact_(row.date || row.invoiceDate);
  const supplier = cleanCodePart_(row.supplier || row.supplierName || "SUP", "SUP");
  if (!date || !supplier) return "";

  return "MR-" + date + "-" + supplier + "-" + qualityTrailingSequence_(oldRef, (rmMatch && rmMatch.index ? rmMatch.index : 0) + 1);
}

function qualityFgReferenceFromRow_(oldRef, fgMatch, qualityRow) {
  const row = fgMatch && fgMatch.row ? fgMatch.row : {};
  const existing = String(row.fgBatchCode || row.extrusionBatchId || row.batchId || "").trim();
  if (qualityIsNewFgRef_(existing)) return existing;

  const grade = qualityCleanGrade_(row.productionGrade || row.grade || row.material || row.outputMaterial || qualityRow.fgBatchCode || qualityRow.grade);
  const date = qualityDateCompact_(row.date || row.productionDate || qualityRow.date);
  const shift = qualityCleanShift_(row.shift || qualityRow.shift);
  if (!grade || !date || !shift) return "";

  return grade + "-" + date + "-" + shift + "-" + qualityTrailingSequence_(oldRef, (fgMatch && fgMatch.index ? fgMatch.index : 0) + 1);
}

function migrateQualityReferences(dryRun) {
  const isDryRun = dryRun === true || String(dryRun || "").toLowerCase() === "true";

  if (!isDryRun) {
    ensureHeaders_("RM_Quality", ["legacyQualityRef"]);
    ensureHeaders_("FG_Quality", ["legacyQualityRef"]);
  }

  const rmQualityData = qualityRowsWithIndex_("RM_Quality");
  const fgQualityData = qualityRowsWithIndex_("FG_Quality");
  const rmInwardRows = getRowsAsObjects("RM_Inward");
  const extrusionRows = getRowsAsObjects("Extrusion_Batches");
  const rmIndex = qualityIndexRowsByRefs_(rmInwardRows, [
    "inwardId",
    "receivingRef",
    "batchId",
    "legacyQualityRef",
    "legacySourceId",
  ]);
  const fgIndex = qualityIndexRowsByRefs_(extrusionRows, [
    "extrusionBatchId",
    "fgBatchCode",
    "batchId",
    "lotNo",
    "legacyQualityRef",
    "legacySourceId",
  ]);

  const summary = {
    ok: true,
    dryRun: isDryRun,
    migrationFunction: "migrateQualityReferences",
    oldRefsFound: 0,
    refsConvertible: 0,
    refsNeedingManualReview: 0,
    skippedAlreadyMigrated: 0,
    skippedAlreadyNew: 0,
    converted: [],
    manualReview: [],
  };

  const rmLegacyCol = rmQualityData.headers.indexOf("legacyQualityRef") + 1;
  const rmRefCol = rmQualityData.headers.indexOf("rmInwardId") + 1;
  const fgLegacyCol = fgQualityData.headers.indexOf("legacyQualityRef") + 1;
  const fgExtrusionCol = fgQualityData.headers.indexOf("extrusionBatchId") + 1;
  const fgBatchCol = fgQualityData.headers.indexOf("fgBatchCode") + 1;

  rmQualityData.rows.forEach((row) => {
    const oldRef = String(row.rmInwardId || row.inwardId || row.batchId || row.sourceRef || "").trim();
    if (!oldRef) return;
    if (row.legacyQualityRef) {
      summary.skippedAlreadyMigrated++;
      return;
    }
    if (qualityIsNewReceivingRef_(oldRef)) {
      summary.skippedAlreadyNew++;
      return;
    }

    summary.oldRefsFound++;
    const rmMatch = rmIndex[oldRef];
    const newRef = rmMatch ? qualityRmReferenceFromRow_(oldRef, rmMatch) : "";

    if (!newRef || !rmMatch) {
      summary.refsNeedingManualReview++;
      summary.manualReview.push({
        sheet: "RM_Quality",
        qualityId: row.qualityId || "",
        oldRef,
        reason: rmMatch ? "Missing linked receiving date or supplier" : "No matching RM_Inward row",
      });
      return;
    }

    summary.refsConvertible++;
    summary.converted.push({
      sheet: "RM_Quality",
      qualityId: row.qualityId || "",
      oldRef,
      newRef,
      linkedSheet: "RM_Inward",
    });

    if (!isDryRun) {
      rmQualityData.sheet.getRange(row.__rowNumber, rmLegacyCol).setValue(oldRef);
      rmQualityData.sheet.getRange(row.__rowNumber, rmRefCol).setValue(newRef);
    }
  });

  fgQualityData.rows.forEach((row) => {
    const oldRef = String(row.extrusionBatchId || row.fgBatchCode || row.batchId || row.sourceRef || "").trim();
    if (!oldRef) return;
    if (row.legacyQualityRef) {
      summary.skippedAlreadyMigrated++;
      return;
    }
    if (qualityIsNewFgRef_(oldRef)) {
      summary.skippedAlreadyNew++;
      return;
    }

    summary.oldRefsFound++;
    const fgMatch = fgIndex[oldRef];
    const newRef = fgMatch ? qualityFgReferenceFromRow_(oldRef, fgMatch, row) : "";

    if (!newRef || !fgMatch) {
      summary.refsNeedingManualReview++;
      summary.manualReview.push({
        sheet: "FG_Quality",
        qualityId: row.qualityId || "",
        oldRef,
        reason: fgMatch ? "Missing linked extrusion date, grade, or shift" : "No matching Extrusion_Batches row",
      });
      return;
    }

    summary.refsConvertible++;
    summary.converted.push({
      sheet: "FG_Quality",
      qualityId: row.qualityId || "",
      oldRef,
      newRef,
      linkedSheet: "Extrusion_Batches",
    });

    if (!isDryRun) {
      fgQualityData.sheet.getRange(row.__rowNumber, fgLegacyCol).setValue(oldRef);
      fgQualityData.sheet.getRange(row.__rowNumber, fgExtrusionCol).setValue(newRef);
      fgQualityData.sheet.getRange(row.__rowNumber, fgBatchCol).setValue(newRef);
    }
  });

  Logger.log(JSON.stringify(summary, null, 2));
  return summary;
}

function migrateQualityLegacyCleanup(dryRun) {
  const isDryRun = dryRun === true || String(dryRun || "").toLowerCase() === "true";
  const cutoff = "2026-06-01";

  ensureHeaders_("RM_Quality", rmQualityHeaders_());
  ensureHeaders_("FG_Quality", fgQualityHeaders_());

  const rmData = qualityRowsWithIndex_("RM_Quality");
  const fgData = qualityRowsWithIndex_("FG_Quality");
  const rmInwardRows = getRowsAsObjects("RM_Inward");
  const extrusionRows = getRowsAsObjects("Extrusion_Batches");
  const rmIndex = qualityIndexRowsByRefs_(rmInwardRows, [
    "inwardId",
    "receivingRef",
    "batchId",
    "legacyQualityRef",
    "legacySourceId",
  ]);
  const fgIndex = qualityIndexRowsByRefs_(extrusionRows, [
    "extrusionBatchId",
    "fgBatchCode",
    "batchId",
    "lotNo",
    "legacyQualityRef",
    "legacySourceId",
  ]);

  const result = {
    ok: true,
    dryRun: isDryRun,
    migrationFunction: "migrateQualityLegacyCleanup",
    cutoffDate: cutoff,
    scanned: {
      rmQuality: rmData.rows.length,
      fgQuality: fgData.rows.length,
    },
    oldRecordsFound: 0,
    convertible: 0,
    needsReview: 0,
    skippedCurrent: 0,
    skippedAlreadyMigrated: 0,
    legacyCompleted: 0,
    updates: [],
  };

  function col(headers, name) {
    return headers.indexOf(name) + 1;
  }

  function setCell(data, rowNumber, field, value) {
    const index = col(data.headers, field);
    if (index > 0) data.sheet.getRange(rowNumber, index).setValue(value);
  }

  function oldDate(row) {
    const date = qualityDateOnly_(row.date || row.createdAt);
    return date && date < cutoff;
  }

  rmData.rows.forEach((row, index) => {
    if (!oldDate(row)) {
      result.skippedCurrent++;
      return;
    }
    if (
      String(row.migrationStatus || "").toUpperCase() === "LEGACY_COMPLETED" &&
      String(row.qcStatus || "").toUpperCase() === "APPROVED" &&
      String(row.decision || "").toUpperCase() === "LEGACY_COMPLETED"
    ) {
      result.skippedAlreadyMigrated++;
      return;
    }

    result.oldRecordsFound++;
    const oldRef = String(row.rmInwardId || row.sourceRef || row.qualityRef || row.legacyQualityRef || row.qualityId || "").trim();
    const rmMatch = oldRef ? rmIndex[oldRef] : null;
    const newRef = rmMatch ? qualityRmReferenceFromRow_(oldRef, rmMatch) : "";
    const displayRef = row.qualityRef || oldRef || "RMQ-" + String(index + 1).padStart(3, "0");
    const migrationStatus = "LEGACY_COMPLETED";

    if (newRef) result.convertible++;
    result.legacyCompleted++;

    result.updates.push({
      sheet: "RM_Quality",
      rowNumber: row.__rowNumber,
      qualityId: row.qualityId || "",
      oldRef,
      qualityRef: displayRef,
      legacyQualityRef: row.legacyQualityRef || "",
      qcStatus: "APPROVED",
      decision: "LEGACY_COMPLETED",
      migrationStatus,
    });

    if (!isDryRun) {
      setCell(rmData, row.__rowNumber, "qcStatus", "APPROVED");
      setCell(rmData, row.__rowNumber, "decision", "LEGACY_COMPLETED");
      setCell(rmData, row.__rowNumber, "migrationStatus", migrationStatus);
      if (!String(row.testedBy || "").trim()) {
        setCell(rmData, row.__rowNumber, "testedBy", "Legacy Migration");
      }
    }
  });

  fgData.rows.forEach((row, index) => {
    if (!oldDate(row)) {
      result.skippedCurrent++;
      return;
    }
    if (
      String(row.migrationStatus || "").toUpperCase() === "LEGACY_COMPLETED" &&
      String(row.qcStatus || "").toUpperCase() === "APPROVED" &&
      String(row.decision || "").toUpperCase() === "LEGACY_COMPLETED"
    ) {
      result.skippedAlreadyMigrated++;
      return;
    }

    result.oldRecordsFound++;
    const oldRef = String(row.extrusionBatchId || row.fgBatchCode || row.sourceRef || row.qualityRef || row.legacyQualityRef || row.qualityId || "").trim();
    const fgMatch = oldRef ? fgIndex[oldRef] : null;
    const newRef = fgMatch ? qualityFgReferenceFromRow_(oldRef, fgMatch, row) : "";
    const displayRef = row.qualityRef || oldRef || "FGQ-" + String(index + 1).padStart(3, "0");
    const migrationStatus = "LEGACY_COMPLETED";

    if (newRef) result.convertible++;
    result.legacyCompleted++;

    result.updates.push({
      sheet: "FG_Quality",
      rowNumber: row.__rowNumber,
      qualityId: row.qualityId || "",
      oldRef,
      qualityRef: displayRef,
      legacyQualityRef: row.legacyQualityRef || "",
      qcStatus: "APPROVED",
      decision: "LEGACY_COMPLETED",
      migrationStatus,
    });

    if (!isDryRun) {
      setCell(fgData, row.__rowNumber, "qcStatus", "APPROVED");
      setCell(fgData, row.__rowNumber, "decision", "LEGACY_COMPLETED");
      setCell(fgData, row.__rowNumber, "migrationStatus", migrationStatus);
      if (!String(row.testedBy || "").trim()) {
        setCell(fgData, row.__rowNumber, "testedBy", "Legacy Migration");
      }
    }
  });

  Logger.log(JSON.stringify(result, null, 2));
  return result;
}

function syncOldQualityData() {
  const rmRows = getRowsAsObjects("RM_Inward").filter((r) => !isDeleted_(r));
  const fgRows = getRowsAsObjects("Extrusion_Batches").filter((r) => !isDeleted_(r));

  const rmQuality = getRowsAsObjects("RM_Quality").filter((r) => !isDeleted_(r));
  const fgQuality = getRowsAsObjects("FG_Quality").filter((r) => !isDeleted_(r));

  const existingRm = {};
  rmQuality.forEach((r) => {
    if (r.rmInwardId) existingRm[String(r.rmInwardId)] = true;
  });

  const existingFg = {};
  fgQuality.forEach((r) => {
    if (r.extrusionBatchId) existingFg[String(r.extrusionBatchId)] = true;
  });

  let rmCreated = 0;
  let fgCreated = 0;

  rmRows.forEach((r) => {
    const id = r.inwardId || r.batchId || "";
    if (!id || existingRm[id]) return;

    addRmQuality({
      date: r.date || todayYmd(),
      rmInwardId: id,
      formOfMaterial: r.material || "",
      conditionOfMaterial: "",
      sampleQtyGm: "",
      dryDustGm: "",
      colouredFlakesGm: "",
      rubberContaminationNo: "",
      ppGm: "",
      sinkMaterialGm: "",
      remarks: "Auto-created pending RM quality record from old RM inward data",
      status: "PENDING",
      createdBy: "Quality Sync",
    });

    rmCreated++;
  });

  fgRows.forEach((r) => {
    const id = r.extrusionBatchId || r.batchId || "";
    if (!id || existingFg[id]) return;

    addFgQuality({
      date: r.date || todayYmd(),
      extrusionBatchId: id,
      fgBatchCode: id,
      moisturePercent: "",
      mfi: "",
      colour: "",
      appearance: "",
      bagWeight1Kg: "",
      bagWeight2Kg: "",
      bagWeight3Kg: "",
      bagWeight4Kg: "",
      remarks: "Auto-created pending FG quality record from old extrusion data",
      status: "PENDING",
      createdBy: "Quality Sync",
    });

    fgCreated++;
  });

  return output({
    ok: true,
    rmCreated,
    fgCreated,
    message: "Old quality data sync completed",
  });
}

// MONTH AUDIT - SAFE ADD-ON
function createSheetIfMissing_(sheetName, headers) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName(sheetName);

  if (!sh) {
    sh = ss.insertSheet(sheetName);
    sh.appendRow(headers);
    sh.setFrozenRows(1);
    return sh;
  }

  if (sh.getLastRow() === 0) {
    sh.appendRow(headers);
    sh.setFrozenRows(1);
  }

  ensureHeaders_(sheetName, headers);
  return sh;
}
function ensureMonthAuditSheets_() {
  createSheetIfMissing_("Monthly_Closings", [
    "closingId",
    "periodMonth",
    "nextPeriodMonth",
    "itemType",
    "itemCode",
    "systemQty",
    "physicalQty",
    "varianceQty",
    "finalClosingQty",
    "value",
    "reason",
    "confirmed",
    "status",
    "closedBy",
    "closedAt",
  ]);

  createSheetIfMissing_("Opening_Balances", [
    "openingId",
    "periodMonth",
    "sourcePeriodMonth",
    "itemType",
    "itemCode",
    "openingQty",
    "value",
    "createdBy",
    "createdAt",
    "status",
  ]);

  createSheetIfMissing_("Physical_Count_Lines", [
    "countId",
    "periodMonth",
    "itemType",
    "itemCode",
    "systemQty",
    "physicalQty",
    "varianceQty",
    "reason",
    "confirmed",
    "countedBy",
    "createdAt",
    "status",
  ]);
    createSheetIfMissing_("Stock_Adjustments", [
    "adjustmentId",
    "periodMonth",
    "nextPeriodMonth",
    "itemType",
    "itemCode",
    "systemQty",
    "physicalQty",
    "adjustmentQty",
    "reason",
    "approvedBy",
    "approvedAt",
    "snapshotId",
    "status",
  ]);
}

function listOpeningBalances(data = {}) {
  ensureMonthAuditSheets_();

  const periodMonth = data.periodMonth || getPeriodMonth(todayYmd());

  const rows = getRowsAsObjects("Opening_Balances")
    .filter((r) => !isDeleted_(r))
    .filter((r) => String(r.periodMonth || "") === String(periodMonth));

  return output({ ok: true, rows });
}

function monthAuditSummary(data = {}) {
  ensureMonthAuditSheets_();

  const periodMonth = data.periodMonth || getPeriodMonth(todayYmd());

  const openings = getRowsAsObjects("Opening_Balances")
    .filter((r) => !isDeleted_(r))
    .filter((r) => String(r.periodMonth || "") === String(periodMonth));

  const rmRows = getRowsAsObjects("RM_Inward").filter((r) => !isDeleted_(r));
  const washRows = getRowsAsObjects("Wash_Batches").filter((r) => !isDeleted_(r));
  const extrusionRows = getRowsAsObjects("Extrusion_Batches").filter((r) => !isDeleted_(r));
  const dispatchRows = getRowsAsObjects("Dispatches").filter((r) => !isDeleted_(r));
  const storesInwardRows = getRowsAsObjects("Stores_Inward").filter((r) => !isDeleted_(r));
  const storesIssueRows = getRowsAsObjects("Stores_Issue").filter((r) => !isDeleted_(r));

  function inMonth(r) {
    return String(r.date || r.createdAt || "").slice(0, 7) === String(periodMonth);
  }

  function openingQty(itemType, itemCode) {
    return openings
      .filter((r) => String(r.itemType) === itemType && String(r.itemCode) === itemCode)
      .reduce((s, r) => s + num(r.openingQty), 0);
  }

  const rmOpening = openingQty("RM", "RM");
  const rmInward = rmRows.filter(inMonth).reduce((s, r) => s + num(r.netWeight), 0);
  const rmConsumed = washRows.filter(inMonth).reduce((s, r) => s + num(r.inputWeightKg), 0);
  const rmClosing = rmOpening + rmInward - rmConsumed;

  const fgMap = {};
  extrusionRows.filter(inMonth).forEach((r) => {
    const grade = r.productionGrade || r.grade || "NA";
    if (!fgMap[grade]) fgMap[grade] = { itemType: "FG", itemCode: grade, opening: openingQty("FG", grade), inward: 0, outward: 0 };
    fgMap[grade].inward += num(r.fgOutputKg);
  });

  dispatchRows.filter(inMonth).forEach((r) => {
    let lines = [];
    try {
      lines = JSON.parse(r.dispatchLines || "[]");
    } catch (err) {}

    if (!Array.isArray(lines) || lines.length === 0) {
      lines = [{ grade: r.grade || "NA", dispatchQtyKg: r.quantityKg }];
    }

    lines.forEach((line) => {
      const grade = line.grade || r.grade || "NA";
      if (!fgMap[grade]) fgMap[grade] = { itemType: "FG", itemCode: grade, opening: openingQty("FG", grade), inward: 0, outward: 0 };
      fgMap[grade].outward += num(line.dispatchQtyKg || r.quantityKg);
    });
  });

  ["E1", "E2", "E3", "E4", "E5"].forEach((grade) => {
    if (!fgMap[grade]) {
      fgMap[grade] = { itemType: "FG", itemCode: grade, opening: openingQty("FG", grade), inward: 0, outward: 0 };
    }
  });

  const storesMap = {};
  storesInwardRows.filter(inMonth).forEach((r) => {
    const item = r.itemName || "Unknown";
    if (!storesMap[item]) storesMap[item] = { itemType: "STORE", itemCode: item, opening: openingQty("STORE", item), inward: 0, outward: 0 };
    storesMap[item].inward += num(r.qty);
  });

  storesIssueRows.filter(inMonth).forEach((r) => {
    const item = r.itemName || "Unknown";
    if (!storesMap[item]) storesMap[item] = { itemType: "STORE", itemCode: item, opening: openingQty("STORE", item), inward: 0, outward: 0 };
    storesMap[item].outward += num(r.qty);
  });

  const wasteItems = [
    { itemType: "WASTE", itemCode: "Raffia", qty: washRows.filter(inMonth).reduce((s, r) => s + num(r.raffiaKg), 0) },
    { itemType: "WASTE", itemCode: "Wrappers", qty: washRows.filter(inMonth).reduce((s, r) => s + num(r.wrappersKg), 0) },
    { itemType: "WASTE", itemCode: "Sink Material", qty: washRows.filter(inMonth).reduce((s, r) => s + num(r.sinkMaterialKg), 0) },
    { itemType: "WASTE", itemCode: "Iron Scrap", qty: washRows.filter(inMonth).reduce((s, r) => s + num(r.ironScrapKg), 0) },
    { itemType: "WASTE", itemCode: "Sludge", qty: washRows.filter(inMonth).reduce((s, r) => s + num(r.sludgeKg), 0) },
    { itemType: "WASTE", itemCode: "Lumps", qty: extrusionRows.filter(inMonth).reduce((s, r) => s + num(r.lumpsKg), 0) },
    { itemType: "WASTE", itemCode: "Purging", qty: extrusionRows.filter(inMonth).reduce((s, r) => s + num(r.purgingKg), 0) },
    { itemType: "WASTE", itemCode: "Mesh Reject", qty: extrusionRows.filter(inMonth).reduce((s, r) => s + num(r.meshRejectKg), 0) },
  ].map((x) => ({
    itemType: x.itemType,
    itemCode: x.itemCode,
    opening: openingQty("WASTE", x.itemCode),
    inward: x.qty,
    outward: 0,
    systemQty: openingQty("WASTE", x.itemCode) + x.qty,
  }));

  const items = [
    {
      itemType: "RM",
      itemCode: "RM",
      opening: rmOpening,
      inward: rmInward,
      outward: rmConsumed,
      systemQty: rmClosing,
    },
    ...Object.values(fgMap).map((x) => ({
      ...x,
      systemQty: x.opening + x.inward - x.outward,
    })),
    ...Object.values(storesMap).map((x) => ({
      ...x,
      systemQty: x.opening + x.inward - x.outward,
    })),
    ...wasteItems,
  ];

  return output({
    ok: true,
    periodMonth,
    items,
  });
}

function closeMonthAudit(data = {}) {
  ensureMonthAuditSheets_();

  const periodMonth = data.periodMonth;
  const nextPeriodMonth = data.nextPeriodMonth;
  const closedBy = data.closedBy || "System";
  const items = JSON.parse(data.items || "[]");

  if (!periodMonth || !nextPeriodMonth) {
    return output({ ok: false, error: "Missing periodMonth or nextPeriodMonth" });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return output({ ok: false, error: "No closing items received" });
  }

   const closingSh = getSheet("Monthly_Closings");
  const openingSh = getSheet("Opening_Balances");
  const countSh = getSheet("Physical_Count_Lines");
  const adjustmentSh = getSheet("Stock_Adjustments");

  items.forEach((x) => {
    const systemQty = num(x.systemQty);
    const physicalQty = num(x.physicalQty);
    const varianceQty = physicalQty - systemQty;
    const finalClosingQty = physicalQty;
        if (varianceQty !== 0) {
      appendObjectRow(adjustmentSh, {
        adjustmentId: generateBatchId("ADJ"),
        periodMonth,
        nextPeriodMonth,
        itemType: x.itemType || "",
        itemCode: x.itemCode || "",
        systemQty,
        physicalQty,
        adjustmentQty: varianceQty,
        reason: x.reason || "",
        approvedBy: closedBy,
        approvedAt: new Date(),
        snapshotId: "SN-" + periodMonth,
        status: "ACTIVE",
      });
    }

    appendObjectRow(countSh, {
      countId: generateBatchId("PC"),
      periodMonth,
      itemType: x.itemType || "",
      itemCode: x.itemCode || "",
      systemQty,
      physicalQty,
      varianceQty,
      reason: x.reason || "",
      confirmed: x.confirmed ? "YES" : "NO",
      countedBy: closedBy,
      createdAt: new Date(),
      status: "ACTIVE",
    });

    appendObjectRow(closingSh, {
      closingId: generateBatchId("MCL"),
      periodMonth,
      nextPeriodMonth,
      itemType: x.itemType || "",
      itemCode: x.itemCode || "",
      systemQty,
      physicalQty,
      varianceQty,
      finalClosingQty,
      value: num(x.value),
      reason: x.reason || "",
      confirmed: x.confirmed ? "YES" : "NO",
      status: "LOCKED",
      closedBy,
      closedAt: new Date(),
    });

    appendObjectRow(openingSh, {
      openingId: generateBatchId("OPB"),
      periodMonth: nextPeriodMonth,
      sourcePeriodMonth: periodMonth,
      itemType: x.itemType || "",
      itemCode: x.itemCode || "",
      openingQty: finalClosingQty,
      value: num(x.value),
      createdBy: closedBy,
      createdAt: new Date(),
      status: "ACTIVE",
    });
  });

  return output({
    ok: true,
    message: "Month closed and next month opening balances generated",
    periodMonth,
    nextPeriodMonth,
    rowsCreated: items.length,
  });
}
// ALERTS

function addAlertSetting(data = {}) {
  const sh = getSheet("Alert_Settings");

  ensureHeaders_("Alert_Settings", [
    "alertId",
    "module",
    "item",
    "condition",
    "threshold",
    "severity",
    "notifyType",
    "emails",
    "enabled",
    "remarks",
    "createdAt",
  ]);

  const alertId = data.alertId || generateBatchId("ALT");

  appendObjectRow(sh, {
    alertId,
    module: data.module || "",
    item: data.item || "",
    condition: data.condition || "BELOW",
    threshold: num(data.threshold),
    severity: data.severity || "HIGH",
    notifyType: data.notifyType || "ALL",
    emails: data.emails || "",
    enabled: data.enabled || "TRUE",
    remarks: data.remarks || "",
    createdAt: new Date(),
  });

  return output({ ok: true, alertId });
}

function updateAlertSetting(data = {}) {
  return updateById("Alert_Settings", "alertId", data.alertId, {
    module: data.module || "",
    item: data.item || "",
    condition: data.condition || "",
    threshold: num(data.threshold),
    severity: data.severity || "",
    notifyType: data.notifyType || "",
    emails: data.emails || "",
    enabled: data.enabled || "",
    remarks: data.remarks || "",
  });
}

function runAlertEngine() {
  const settings = getRowsAsObjects("Alert_Settings").filter(
    (r) => String(r.enabled || "").toUpperCase() === "TRUE"
  );

  const inventory = calculateInventoryBackend({
    rmRows: getRowsAsObjects("RM_Inward"),
    washRows: getRowsAsObjects("Wash_Batches"),
    sortingRows: getRowsAsObjects("Sorting_Batches"),
    extrusionRows: getRowsAsObjects("Extrusion_Batches"),
    dispatchRows: getRowsAsObjects("Dispatches"),
    storesInwardRows: getRowsAsObjects("Stores_Inward"),
    storesIssueRows: getRowsAsObjects("Stores_Issue"),
  });

  const triggered = [];

  settings.forEach((rule) => {
    const module = String(rule.module || "");
    const threshold = num(rule.threshold);
    const condition = String(rule.condition || "BELOW").toUpperCase();

    let currentValue = 0;

    if (module === "RM") currentValue = inventory.rm.stock;
    if (module === "Wash") currentValue = inventory.wash.stock;
    if (module === "Sorting") currentValue = inventory.sorting.stock;
    if (module === "Extrusion") currentValue = inventory.fg.stock;
    if (module === "Dispatch") currentValue = inventory.fg.dispatched;
    if (module === "Stores") currentValue = inventory.stores.stock;
    if (module === "Inventory") currentValue = inventory.fg.stock;

    let fire = false;

    if (condition === "BELOW" && currentValue < threshold) fire = true;
    if (condition === "ABOVE" && currentValue > threshold) fire = true;
    if (condition === "EQUAL" && currentValue === threshold) fire = true;

    if (!fire) return;

    saveAlertLog({
      alertId: rule.alertId,
      module,
      item: rule.item,
      severity: rule.severity,
      currentValue,
      threshold,
      message: `${module} alert triggered for ${rule.item}. Current: ${currentValue}, Threshold: ${threshold}`,
      emails: rule.emails || "",
    });

    triggered.push({
      alertId: rule.alertId,
      module,
      currentValue,
    });
  });

  return output({ ok: true, triggered });
}

function saveAlertLog(data = {}) {
  const sh = getSheet("Alert_Log");

  ensureHeaders_("Alert_Log", [
    "logId",
    "alertId",
    "module",
    "item",
    "severity",
    "currentValue",
    "threshold",
    "message",
    "emails",
    "triggeredAt",
    "status",
  ]);

  appendObjectRow(sh, {
    logId: generateBatchId("ALOG"),
    alertId: data.alertId || "",
    module: data.module || "",
    item: data.item || "",
    severity: data.severity || "",
    currentValue: data.currentValue || 0,
    threshold: data.threshold || 0,
    message: data.message || "",
    emails: data.emails || "",
    triggeredAt: new Date(),
    status: "TRIGGERED",
  });
}

// INVENTORY SUMMARY

function calculateInventoryBackend({
  rmRows = [],
  washRows = [],
  sortingRows = [],
  extrusionRows = [],
  dispatchRows = [],
  storesInwardRows = [],
  storesIssueRows = [],
}) {
  rmRows = rmRows.filter((r) => !isDeleted_(r));
  washRows = washRows.filter((r) => !isDeleted_(r));
  sortingRows = sortingRows.filter((r) => !isDeleted_(r));
  extrusionRows = extrusionRows.filter((r) => !isDeleted_(r));
  dispatchRows = dispatchRows.filter((r) => !isDeleted_(r));
  storesInwardRows = storesInwardRows.filter((r) => !isDeleted_(r));
  storesIssueRows = storesIssueRows.filter((r) => !isDeleted_(r));

  const rmInward = rmRows.reduce((s, r) => s + num(r.netWeight), 0);
  const rmConsumed = washRows.reduce((s, r) => s + num(r.inputWeightKg), 0);

  const washProduced = washRows.reduce((s, r) => s + num(r.washedOutputKg), 0);
  const washConsumedBySorting = sortingRows.reduce((s, r) => s + num(r.inputWeightKg), 0);

  const sortingProduced = sortingRows.reduce(
    (s, r) =>
      s +
      (num(r.acceptedQtyKg) ||
        num(r.whiteSortedKg) +
          num(r.whiteGreyKg) +
          num(r.commodityKg) +
          num(r.allMixSortedKg)),
    0
  );

  const sortingConsumedByExtrusion = extrusionRows.reduce(
    (s, r) => s + num(r.totalInputKg || r.inputWeightKg),
    0
  );

  const fgProduced = extrusionRows.reduce((s, r) => s + num(r.fgOutputKg), 0);
  const fgDispatched = dispatchRows.reduce((s, r) => s + num(r.quantityKg), 0);

  const storesInward = storesInwardRows.reduce((s, r) => s + num(r.qty), 0);
  const storesIssued = storesIssueRows.reduce((s, r) => s + num(r.qty), 0);

  return {
    rm: {
      inward: rmInward,
      consumed: rmConsumed,
      stock: rmInward - rmConsumed,
    },
    wash: {
      produced: washProduced,
      consumed: washConsumedBySorting,
      stock: washProduced - washConsumedBySorting,
    },
    sorting: {
      produced: sortingProduced,
      consumed: sortingConsumedByExtrusion,
      stock: sortingProduced - sortingConsumedByExtrusion,
    },
    fg: {
      produced: fgProduced,
      dispatched: fgDispatched,
      stock: fgProduced - fgDispatched,
    },
    stores: {
      inward: storesInward,
      issued: storesIssued,
      stock: storesInward - storesIssued,
    },
  };
}

// SETUP

function setupRegenOSBackend() {
  const ss = SpreadsheetApp.openById(SHEET_ID);

  const sheets = {
    Inventory_Ledger: [
      "ledgerId",
      "date",
      "module",
      "movementType",
      "itemType",
      "materialId",
      "itemName",
      "sourceRef",
      "targetRef",
      "qtyIn",
      "qtyOut",
      "unit",
      "remarks",
      "status",
      "createdBy",
      "createdAt",
      "legacySourceSheet",
      "legacySourceId",
      "legacyMaterialName",
      "migrationId",
      "migratedAt",
    ],
    Material_Master: [
      "materialId",
      "materialCode",
      "materialName",
      "category",
      "unit",
      "status",
      "defaultQualityRequired",
      "defaultStorageLocation",
      "createdBy",
      "createdAt",
      "updatedAt",
    ],
    Production_Recipes: [
      "recipeId",
      "recipeCode",
      "recipeName",
      "outputMaterialId",
      "outputMaterialCode",
      "processType",
      "status",
      "remarks",
      "createdBy",
      "createdAt",
      "updatedAt",
    ],
    Recipe_Components: [
      "componentId",
      "recipeId",
      "inputMaterialId",
      "inputMaterialCode",
      "componentType",
      "standardPercent",
      "standardKg",
      "tolerancePercent",
      "status",
      "createdBy",
      "createdAt",
      "updatedAt",
    ],
    RM_Quality: rmQualityHeaders_(),
    FG_Quality: fgQualityHeaders_(),
    Factory_Expenses: [
      "expenseId",
      "date",
      "periodMonth",
      "category",
      "description",
      "amount",
      "paidBy",
      "remarks",
      "status",
      "createdBy",
      "createdAt",
    ],
    Month_Close: [
      "closeId",
      "periodMonth",
      "rmInwardKg",
      "rmValue",
      "washInputKg",
      "washedOutputKg",
      "sortingInputKg",
      "sortingOutputKg",
      "extrusionInputKg",
      "fgProducedKg",
      "dispatchKg",
      "turnover",
      "storesInwardValue",
      "storesIssueQty",
      "factoryExpenses",
      "avgRmPrice",
      "grossContribution",
      "manufacturingProfit",
      "remarks",
      "closedBy",
      "createdAt",
    ],
    Month_Locks: [
      "periodMonth",
      "status",
      "lockedBy",
      "lockedAt",
      "remarks",
    ],
    Alert_Settings: [
      "alertId",
      "module",
      "item",
      "condition",
      "threshold",
      "severity",
      "notifyType",
      "emails",
      "enabled",
      "remarks",
      "createdAt",
    ],
    Alert_Log: [
      "logId",
      "alertId",
      "module",
      "item",
      "severity",
      "currentValue",
      "threshold",
      "message",
      "emails",
      "triggeredAt",
      "status",
    ],
    Factory_Cost_Master: [
  "costId",
  "periodMonth",
  "costHead",
  "amount",
  "allocationType",
  "remarks",
  "status",
  "createdBy",
  "createdAt",
],
Production_Materials: [
  "materialId",
  "materialName",
  "materialType",
  "unit",
  "standardRate",
  "isActive",
  "remarks",
  "status",
  "createdBy",
  "createdAt",
],
Inventory_Adjustments: [
  "adjustmentId",
  "periodMonth",
  "date",
  "module",
  "itemType",
  "itemCode",
  "adjustmentType",
  "quantityKg",
  "value",
  "reason",
  "remarks",
  "sourceRef",
  "closeMonth",
  "material",
  "systemQty",
  "physicalQty",
  "differenceQty",
  "differenceValue",
  "status",
  "approvedBy",
  "approvedAt",
  "createdBy",
  "createdAt",
  "updatedAt",
],
  };

  Object.keys(sheets).forEach((name) => {
    let sh = ss.getSheetByName(name);

    if (!sh) {
      sh = ss.insertSheet(name);
    }

    if (sh.getLastRow() === 0) {
      sh.appendRow(sheets[name]);
    } else {
      ensureHeaders_(name, sheets[name]);
    }

    sh.setFrozenRows(1);
  });

  return "RegenOS backend setup completed";
}
function traceBatch(data = {}) {
  const q = String(data.query || data.batchId || data.id || "").trim();

  if (!q) {
    return output({ ok: false, error: "Enter batch ID to trace" });
  }

  const rmRows = getRowsAsObjects("RM_Inward").filter((r) => !isDeleted_(r));
  const rmQuality = getRowsAsObjects("RM_Quality").filter((r) => !isDeleted_(r));
  const washRows = getRowsAsObjects("Wash_Batches").filter((r) => !isDeleted_(r));
  const sortingRows = getRowsAsObjects("Sorting_Batches").filter((r) => !isDeleted_(r));
  const extrusionRows = getRowsAsObjects("Extrusion_Batches").filter((r) => !isDeleted_(r));
  const fgQuality = getRowsAsObjects("FG_Quality").filter((r) => !isDeleted_(r));
  const dispatchRows = getRowsAsObjects("Dispatches").filter((r) => !isDeleted_(r));

  const rm = rmRows.filter((r) => [r.inwardId, r.batchId].includes(q));
  const wash = washRows.filter((r) =>
    [r.washBatchId, r.batchId, r.sourceRMId, r.sourceRmInwardId].includes(q)
  );
  const sorting = sortingRows.filter((r) =>
    [r.sortingBatchId, r.batchId, r.sourceWashBatchId].includes(q)
  );
  const extrusion = extrusionRows.filter((r) =>
    [r.extrusionBatchId, r.batchId, r.sourceBatchId, r.sourceSortingBatchId, r.sourceWashBatchId].includes(q)
  );
  const dispatch = dispatchRows.filter((r) =>
    [r.dispatchId, r.sourceExtrusionBatchId, r.linkedFgBatchId, r.lotNo].includes(q)
  );

  const rmIds = rm.map((r) => r.inwardId || r.batchId);
  const washIds = wash.map((r) => r.washBatchId || r.batchId);
  const sortingIds = sorting.map((r) => r.sortingBatchId || r.batchId);
  const extrusionIds = extrusion.map((r) => r.extrusionBatchId || r.batchId);

  const linkedRmQuality = rmQuality.filter((r) =>
    r.rmInwardId === q || rmIds.includes(r.rmInwardId)
  );

  const linkedFgQuality = fgQuality.filter((r) =>
    r.extrusionBatchId === q ||
    r.fgBatchCode === q ||
    extrusionIds.includes(r.extrusionBatchId) ||
    extrusionIds.includes(r.fgBatchCode)
  );

  return output({
    ok: true,
    query: q,
    rm,
    rmQuality: linkedRmQuality,
    wash,
    sorting,
    extrusion,
    fgQuality: linkedFgQuality,
    dispatch,
  });
}
// =====================================================
// INVENTORY ADJUSTMENTS
// =====================================================

function ensureInventoryAdjustmentSheet_() {
  createSheetIfMissing_("Inventory_Adjustments", [
    "adjustmentId",
    "periodMonth",
    "date",
    "module",
    "itemType",
    "itemCode",
    "adjustmentType",
    "quantityKg",
    "value",
    "reason",
    "remarks",
    "sourceRef",
    "closeMonth",
    "material",
    "systemQty",
    "physicalQty",
    "differenceQty",
    "differenceValue",
    "status",
    "approvedBy",
    "approvedAt",
    "createdBy",
    "createdAt",
    "updatedAt",
  ]);
}

function addInventoryAdjustment(data = {}) {
  ensureInventoryAdjustmentSheet_();

  const periodMonth =
    data.periodMonth || getPeriodMonth(data.date || todayYmd());

  validateMonthLock(periodMonth);

  const sh = getSheet("Inventory_Adjustments");
  const adjustmentId =
    data.adjustmentId || generateBatchId("IA");

  appendObjectRow(sh, {
    adjustmentId,
    periodMonth,
    date: normalizeDateOnly_(data.date || todayYmd()),
    module: data.module || "",
    itemType: data.itemType || "",
    itemCode: data.itemCode || data.material || "",
    adjustmentType: data.adjustmentType || "",
    quantityKg: num(data.quantityKg || data.quantity),
    value: num(data.value),
    reason: data.reason || "",
    remarks: data.remarks || "",
    sourceRef: data.sourceRef || "",
    status: data.status || "DRAFT",
    approvedBy: "",
    approvedAt: "",
    createdBy: data.createdBy || "System",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return output({
    ok: true,
    adjustmentId,
    periodMonth,
    message: "Inventory adjustment saved",
  });
}

function listInventoryAdjustments(data = {}) {
  ensureInventoryAdjustmentSheet_();

  const periodMonth =
    data.periodMonth || "";

  let rows = getRowsAsObjects("Inventory_Adjustments")
    .filter((r) => !isDeleted_(r));

  if (periodMonth) {
    rows = rows.filter(
      (r) => String(r.periodMonth || "") === String(periodMonth)
    );
  }

  if (data.status) {
    rows = rows.filter(
      (r) =>
        String(r.status || "").toUpperCase() ===
        String(data.status || "").toUpperCase()
    );
  }

  if (data.module) {
    rows = rows.filter(
      (r) =>
        String(r.module || "").toUpperCase() ===
        String(data.module || "").toUpperCase()
    );
  }

  return output({
    ok: true,
    rows,
  });
}

function updateInventoryAdjustment(data = {}) {
  ensureInventoryAdjustmentSheet_();

  if (!data.adjustmentId) {
    return output({
      ok: false,
      error: "Missing adjustmentId",
    });
  }

  const rows = getRowsAsObjects("Inventory_Adjustments");
  const existing = rows.find(
    (r) => String(r.adjustmentId) === String(data.adjustmentId)
  );

  if (!existing) {
    return output({
      ok: false,
      error: "Adjustment not found",
    });
  }

  if (String(existing.status || "").toUpperCase() === "APPROVED") {
    return output({
      ok: false,
      error: "Approved adjustment cannot be edited",
    });
  }

  validateMonthLock(existing.periodMonth);

  return updateById(
    "Inventory_Adjustments",
    "adjustmentId",
    data.adjustmentId,
    {
      periodMonth: data.periodMonth || existing.periodMonth || "",
      date: normalizeDateOnly_(data.date || existing.date || todayYmd()),
      module: data.module || "",
      itemType: data.itemType || "",
      itemCode: data.itemCode || data.material || "",
      adjustmentType: data.adjustmentType || "",
      quantityKg: num(data.quantityKg || data.quantity),
      value: num(data.value),
      reason: data.reason || "",
      remarks: data.remarks || "",
      sourceRef: data.sourceRef || "",
      status: data.status || existing.status || "DRAFT",
      updatedAt: new Date(),
    }
  );
}

function approveInventoryAdjustment(data = {}) {
  ensureInventoryAdjustmentSheet_();

  if (!data.adjustmentId) {
    return output({
      ok: false,
      error: "Missing adjustmentId",
    });
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    return output({ ok: false, error: "Adjustment approval is already in progress" });
  }

  try {
    const rows = getRowsAsObjects("Inventory_Adjustments");
    const existing = rows.find(
      (r) => String(r.adjustmentId) === String(data.adjustmentId)
    );

    if (!existing) {
      return output({ ok: false, error: "Adjustment not found" });
    }

    const status = String(existing.status || "").toUpperCase();
    if (status === "APPROVED") {
      return output({
        ok: true,
        adjustmentId: data.adjustmentId,
        alreadyApproved: true,
        message: "Adjustment was already approved",
      });
    }

    if (status === "REJECTED") {
      return output({ ok: false, error: "Rejected adjustment cannot be approved" });
    }

    validateMonthLock(existing.periodMonth);

    updateById("Inventory_Adjustments", "adjustmentId", data.adjustmentId, {
      status: "APPROVED",
      approvedBy: data.approvedBy || data.createdBy || "System",
      approvedAt: new Date(),
      updatedAt: new Date(),
    });

    addInventoryLedger({
      date: existing.date || todayYmd(),
      module: "INVENTORY_ADJUSTMENT",
      movementType: num(existing.quantityKg) >= 0 ? "IN" : "OUT",
      itemType: existing.itemType || "",
      itemName: existing.itemCode || "",
      sourceRef: existing.sourceRef || "",
      targetRef: existing.adjustmentId || "",
      qtyIn: num(existing.quantityKg) > 0 ? num(existing.quantityKg) : 0,
      qtyOut: num(existing.quantityKg) < 0 ? Math.abs(num(existing.quantityKg)) : 0,
      unit: "Kg",
      remarks:
        "Approved adjustment: " +
        (existing.adjustmentType || "") +
        " | " +
        (existing.reason || ""),
      createdBy: data.approvedBy || data.createdBy || "System",
    });

    return output({
      ok: true,
      adjustmentId: data.adjustmentId,
      message: "Adjustment approved and posted to inventory ledger",
    });
  } finally {
    lock.releaseLock();
  }
}

function approveMonthCloseInventoryAdjustment(data = {}) {
  ensureInventoryAdjustmentSheet_();

  const periodMonth =
    data.periodMonth || data.closeMonth || getPeriodMonth(data.date || todayYmd());
  const differenceQty = num(data.differenceQty || data.quantityKg);
  const sourceRef =
    data.sourceRef ||
    "MONTH_CLOSE:" +
      periodMonth +
      ":" +
      String(data.itemType || "") +
      ":" +
      String(data.itemCode || data.material || "");

  if (!periodMonth) {
    return output({ ok: false, error: "Missing close month" });
  }

  if (!sourceRef) {
    return output({ ok: false, error: "Missing source reference" });
  }

  if (Math.abs(differenceQty) <= 0.01) {
    return output({ ok: true, skipped: true, message: "No difference to approve" });
  }

  try {
    validateInventoryLedgerMaterial_({
      itemType: data.itemType || "",
      itemName: data.itemCode || data.material || "",
      materialId: data.materialId || "",
      materialCode: data.materialCode || data.itemCode || data.material || "",
    });
  } catch (err) {
    return output({
      ok: false,
      error: err.message || "Month Close adjustment material is not valid for Inventory Ledger",
    });
  }

  validateMonthLock(periodMonth);

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    return output({ ok: false, error: "Month Close adjustment approval is already in progress" });
  }

  try {
    const rows = getRowsAsObjects("Inventory_Adjustments");
    const existing = rows.find(
      (row) =>
        String(row.sourceRef || "") === String(sourceRef) &&
        String(row.periodMonth || "") === String(periodMonth)
    );

    if (existing && String(existing.status || "").toUpperCase() === "APPROVED") {
      return output({
        ok: true,
        adjustmentId: existing.adjustmentId,
        alreadyApproved: true,
        message: "Month Close adjustment was already approved",
      });
    }

    const adjustmentId = existing?.adjustmentId || generateBatchId("IA");
    const payload = {
      adjustmentId,
      periodMonth,
      date: normalizeDateOnly_(data.date || todayYmd()),
      module: data.module || "MONTH_CLOSE",
      itemType: data.itemType || "",
      itemCode: data.itemCode || data.material || "",
      adjustmentType: "MONTH_CLOSE_PHYSICAL_VARIANCE",
      quantityKg: differenceQty,
      value: num(data.value || data.differenceValue),
      reason: data.reason || "Month Close physical stock variance",
      remarks: data.remarks || "",
      sourceRef,
      closeMonth: data.closeMonth || periodMonth,
      material: data.material || data.itemCode || "",
      systemQty: num(data.systemQty),
      physicalQty: num(data.physicalQty),
      differenceQty,
      differenceValue: num(data.value || data.differenceValue),
      status: "DRAFT",
      approvedBy: "",
      approvedAt: "",
      createdBy: data.createdBy || data.approvedBy || "Month Close",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (existing) {
      updateById("Inventory_Adjustments", "adjustmentId", adjustmentId, payload);
    } else {
      appendObjectRow(getSheet("Inventory_Adjustments"), payload);
    }
  } finally {
    lock.releaseLock();
  }

  return approveInventoryAdjustment({
    adjustmentId:
      getRowsAsObjects("Inventory_Adjustments").find(
        (row) =>
          String(row.sourceRef || "") === String(sourceRef) &&
          String(row.periodMonth || "") === String(periodMonth)
      )?.adjustmentId || "",
    approvedBy: data.approvedBy || data.createdBy || "Month Close",
  });
}

function rejectInventoryAdjustment(data = {}) {
  ensureInventoryAdjustmentSheet_();

  if (!data.adjustmentId) {
    return output({
      ok: false,
      error: "Missing adjustmentId",
    });
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    return output({ ok: false, error: "Adjustment update is already in progress" });
  }

  try {
    const rows = getRowsAsObjects("Inventory_Adjustments");
    const existing = rows.find(
      (r) => String(r.adjustmentId) === String(data.adjustmentId)
    );

    if (!existing) {
      return output({ ok: false, error: "Adjustment not found" });
    }

    const status = String(existing.status || "").toUpperCase();
    if (status === "APPROVED") {
      return output({ ok: false, error: "Approved adjustment cannot be rejected" });
    }
    if (status === "REJECTED") {
      return output({
        ok: true,
        adjustmentId: data.adjustmentId,
        alreadyRejected: true,
        message: "Adjustment was already rejected",
      });
    }

    validateMonthLock(existing.periodMonth);

    return updateById("Inventory_Adjustments", "adjustmentId", data.adjustmentId, {
      status: "REJECTED",
      remarks: data.remarks || "Rejected",
      approvedBy: data.rejectedBy || data.createdBy || "System",
      approvedAt: new Date(),
      updatedAt: new Date(),
    });
  } finally {
    lock.releaseLock();
  }
}

function inventoryAdjustmentsSummary(data = {}) {
  ensureInventoryAdjustmentSheet_();

  const periodMonth =
    data.periodMonth || getPeriodMonth(todayYmd());

  const rows = getRowsAsObjects("Inventory_Adjustments")
    .filter((r) => !isDeleted_(r))
    .filter((r) => String(r.periodMonth || "") === String(periodMonth));

  const approved = rows.filter(
    (r) => String(r.status || "").toUpperCase() === "APPROVED"
  );

  const pending = rows.filter((r) =>
    ["DRAFT", "SUBMITTED", "PENDING"].includes(
      String(r.status || "").toUpperCase()
    )
  );

  const byItem = {};

  approved.forEach((r) => {
    const key =
      String(r.itemType || "") + "|" + String(r.itemCode || "");

    if (!byItem[key]) {
      byItem[key] = {
        itemType: r.itemType || "",
        itemCode: r.itemCode || "",
        approvedQty: 0,
        approvedValue: 0,
      };
    }

    byItem[key].approvedQty += num(r.quantityKg);
    byItem[key].approvedValue += num(r.value);
  });

  return output({
    ok: true,
    periodMonth,
    totalAdjustments: rows.length,
    approvedCount: approved.length,
    pendingCount: pending.length,
    approvedQty: approved.reduce((s, r) => s + num(r.quantityKg), 0),
    approvedValue: approved.reduce((s, r) => s + num(r.value), 0),
    rows,
    byItem: Object.values(byItem),
  });
}
function ensurePhysicalCountsSheet_() {
  createSheetIfMissing_("Physical_Counts", [
    "countId","periodMonth","rmPhysicalKg","washPhysicalKg","sortingPhysicalKg",
    "fgPhysicalKg","storesPhysicalValue","productionSignoff","storesSignoff",
    "accountsSignoff","qcSignoff","ceoSignoff","remarks","materialPhysicalLinesJson","savedBy","savedAt","status"
  ]);
  ensureHeaders_("Physical_Counts", [
    "countId","periodMonth","rmPhysicalKg","washPhysicalKg","sortingPhysicalKg",
    "fgPhysicalKg","storesPhysicalValue","productionSignoff","storesSignoff",
    "accountsSignoff","qcSignoff","ceoSignoff","remarks","materialPhysicalLinesJson","savedBy","savedAt","status"
  ]);
}

function getPhysicalCount(data = {}) {
  ensurePhysicalCountsSheet_();
  const periodMonth = data.periodMonth || getPeriodMonth(todayYmd());

  const rows = getRowsAsObjects("Physical_Counts")
    .filter(r => !isDeleted_(r))
    .filter(r => String(r.periodMonth) === String(periodMonth));

  return output({ ok: true, row: rows[rows.length - 1] || null });
}

function savePhysicalCount(data = {}) {
  ensurePhysicalCountsSheet_();

  const periodMonth = data.periodMonth || getPeriodMonth(todayYmd());
  validateMonthLock(periodMonth);

  const sh = getSheet("Physical_Counts");

  appendObjectRow(sh, {
    countId: generateBatchId("PC"),
    periodMonth,
    rmPhysicalKg: optionalNumber_(data.rmPhysicalKg),
    washPhysicalKg: optionalNumber_(data.washPhysicalKg),
    sortingPhysicalKg: optionalNumber_(data.sortingPhysicalKg),
    fgPhysicalKg: optionalNumber_(data.fgPhysicalKg),
    storesPhysicalValue: optionalNumber_(data.storesPhysicalValue),
    productionSignoff: data.productionSignoff || "",
    storesSignoff: data.storesSignoff || "",
    accountsSignoff: data.accountsSignoff || "",
    qcSignoff: data.qcSignoff || "",
    ceoSignoff: data.ceoSignoff || "",
    remarks: data.remarks || "",
    materialPhysicalLinesJson: data.materialPhysicalLinesJson || data.materialPhysicalLines || "",
    savedBy: data.savedBy || data.ceoSignoff || "System",
    savedAt: new Date(),
    status: "ACTIVE",
  });

  return output({ ok: true, message: "Physical stock saved", periodMonth });
}

function optionalNumber_(value) {
  if (value === "" || value === null || value === undefined) return "";
  return num(value);
}
