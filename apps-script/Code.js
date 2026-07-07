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
    if (p.fn === "factoryExpense.add") return addFactoryExpense(p);
    if (p.fn === "factoryExpense.list") return listMaster("Factory_Expenses");
    if (p.fn === "factoryExpense.update") return updateFactoryExpense(p);
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
    if (p.fn === "inventoryLedger.audit") return auditInventoryLedger(p);
    if (p.fn === "inventoryLedger.rebuild") return rebuildInventoryLedger(p);
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

// ============================================================
// DATABASE MIGRATION ENGINE
// Safe, idempotent Google Sheets schema validation and repair.
// Never deletes data, never renames operational sheets.
// ============================================================

const REGEN_DB_SCHEMA_VERSION = "2026.07.06-v1";

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
  RM_Inward: [
    "inwardId",
    "date",
    "supplier",
    "vehicleNo",
    "material",
    "grossWeight",
    "tareWeight",
    "netWeight",
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
    "date",
    "rmInwardId",
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
    "status",
    "createdBy",
    "createdAt",
  ],
  FG_Quality: [
    "qualityId",
    "date",
    "extrusionBatchId",
    "fgBatchCode",
    "moisturePercent",
    "mfi",
    "colour",
    "appearance",
    "bagWeight1Kg",
    "bagWeight2Kg",
    "bagWeight3Kg",
    "bagWeight4Kg",
    "avgBagWeightKg",
    "remarks",
    "status",
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
    ["White Buckets", "RM", "Kg"],
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
    ["Wash_Batches", "washedOutputKg", "Washed Material", "WIP"],
    ["Wash_Batches", "sinkMaterialKg", "Sink Material", "WASTE"],
    ["Wash_Batches", "dustKg", "Dust", "WASTE"],
    ["Wash_Batches", "sludgeKg", "Sludge", "WASTE"],
    ["Wash_Batches", "raffiaKg", "Raffia Reject", "WASTE"],
    ["Wash_Batches", "wrappersKg", "Wrappers", "WASTE"],
    ["Sorting_Batches", "acceptedQtyKg", "Sorted Material", "WIP"],
    ["Sorting_Batches", "rejectedQtyKg", "Sorting Reject", "WASTE"],
    ["Extrusion_Batches", "lumpsKg", "Lumps", "REWORK"],
    ["Extrusion_Batches", "purgingKg", "Purging", "REWORK"],
    ["Extrusion_Batches", "reworkGranulesKg", "Rework Granules", "REWORK"],
    ["Extrusion_Batches", "rejectKg", "Extrusion Reject", "WASTE"],
    ["Extrusion_Batches", "vacuumRejectKg", "Vacuum Reject", "WASTE"],
    ["Extrusion_Batches", "meshRejectKg", "Mesh Reject", "WASTE"],
    ["Extrusion_Batches", "floorSpillageKg", "Floor Spillage", "WASTE"],
    ["Extrusion_Batches", "virginMaterialKg", "Virgin PP", "ADDITIVE"],
    ["Extrusion_Batches", "masterBatchKg", "Masterbatch", "ADDITIVE"],
    ["Extrusion_Batches", "antiOxidantKg", "Antioxidant", "ADDITIVE"],
    ["Extrusion_Batches", "batteryFlakesKg", "Battery Flakes", "RM"],
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

  const defaults = [
    ["WHITE_FLAKES", "White Flakes", "RM"],
    ["WHITE_BUCKETS", "White Buckets", "RM"],
    ["MIXED_BUCKETS", "Mixed Buckets", "RM"],
    ["BATTERY_SCRAP", "Battery Scrap", "RM"],
    ["BATTERY_REGRIND", "Battery Regrind", "RM"],
    ["JARS", "Jars", "RM"],
    ["LIDS", "Lids", "RM"],
    ["PP_MIXED", "PP Mixed", "RM"],
    ["WASHED_WHITE_FLAKES", "Washed White Flakes", "WIP"],
    ["WASHED_MIXED", "Washed Mixed", "WIP"],
    ["WHITE_SORTED", "White Sorted", "WIP"],
    ["COMMODITY", "Commodity", "WIP"],
    ["MIXED_SORTED", "Mixed Sorted", "WIP"],
    ["REWORK_MATERIAL", "Rework Material", "REWORK"],
    ["E1", "E1", "FG"],
    ["E2", "E2", "FG"],
    ["E3", "E3", "FG"],
    ["E4", "E4", "FG"],
    ["E5", "E5", "FG"],
    ["VIRGIN_PP", "Virgin PP", "ADDITIVE"],
    ["MASTERBATCH", "Masterbatch", "ADDITIVE"],
    ["ANTIOXIDANT", "Antioxidant", "ADDITIVE"],
    ["SINK_MATERIAL", "Sink Material", "WASTE"],
    ["COLOR_REJECT", "Color Reject", "WASTE"],
    ["DUST", "Dust", "WASTE"],
    ["METAL_REJECT", "Metal Reject", "WASTE"],
    ["EXTRUSION_WASTE", "Extrusion Waste", "WASTE"],
    ["LUMPS", "Lumps", "REWORK"],
    ["PURGING", "Purging", "REWORK"],
  ];

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

function getMaterialMasterRows_() {
  try {
    return getRowsAsObjects("Material_Master").filter((row) => !isDeleted_(row));
  } catch (err) {
    return [];
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
    ["White Buckets", "RM", "PP", "RECEIVING", "WASH"],
    ["Mixed Buckets", "RM", "PP", "RECEIVING", "WASH"],
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
    const inputMaterial = materialName_(row.inputMaterial, "Mixed Material");
    const washedMaterial = inputMaterial.toUpperCase().indexOf("WHITE") !== -1 ? "Washed White Flakes" : "Washed Mixed";
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
      inputs: [{ material: "Washed Mixed", quantityKg: num(row.inputWeightKg) }],
      outputs: [
        { material: "White Sorted", quantityKg: num(row.acceptedQtyKg), outputType: "GOOD" },
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
        { material: materialName_(row.inputMaterial, "White Sorted"), quantityKg: baseInputKg },
        { material: "Virgin Material", quantityKg: num(row.virginMaterialKg) },
        { material: "Masterbatch", quantityKg: num(row.masterBatchKg) },
        { material: "Battery Scrap", quantityKg: num(row.batteryFlakesKg) },
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

function addRM(data = {}) {
  const sh = getSheet("RM_Inward");

  ensureHeaders_("RM_Inward", [
    "inwardId",
    "date",
    "supplier",
    "vehicleNo",
    "material",
    "color",
    "grossWeight",
    "tareWeight",
    "netWeight",
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
  ]);

  const inwardId = data.inwardId || data.batchId || generateBatchId("RMIN");
  const date = normalizeDateOnly_(data.date || todayYmd());
  validateOperationalWrite_({ ...data, date });

  appendObjectRow(sh, {
    inwardId,
    date,
    supplier: data.supplier || "",
    vehicleNo: data.vehicleNo || "",
    material: data.material || "",
    color: data.color || "",
    grossWeight: num(data.grossWeight),
    tareWeight: num(data.tareWeight),
    netWeight: num(data.netWeight),

    transportPaidBy: data.transportPaidBy || "SUPPLIER",
    transportCost: num(data.transportCost),
    transportRemarks: data.transportRemarks || "",

    moisture: data.moisture || "",
    contamination: data.contamination || "",
    estimatedRecovery: data.estimatedRecovery || "",
    ratePerKg: num(data.ratePerKg),
    remarks: data.remarks || "",
    status: data.status || "ACTIVE",
    createdBy: data.createdBy || "System",
    createdAt: new Date(),
  });

  addInventoryLedger({
    date,
    module: "RM_INWARD",
    movementType: "IN",
    itemType: "RM",
    itemName: data.material || "",
    sourceRef: data.supplier || "",
    targetRef: inwardId,
    qtyIn: num(data.netWeight),
    qtyOut: 0,
    unit: "Kg",
    remarks:
      data.transportPaidBy === "REGEN"
        ? `${data.remarks || ""} | Transport by Regen ₹${num(data.transportCost)}`
        : data.remarks || "",
    createdBy: data.createdBy || "System",
  });

  return output({ ok: true, inwardId });
}

function updateRM(data = {}) {
  const idValue = data.inwardId || data.batchId;
  validateOperationalWrite_(
    data,
    getRowById_("RM_Inward", "inwardId", idValue)
  );

  ensureHeaders_("RM_Inward", [
    "status",
    "transportPaidBy",
    "transportCost",
    "transportRemarks",
  ]);

  return updateById("RM_Inward", "inwardId", idValue, {
    date: normalizeDateOnly_(data.date || todayYmd()),
    supplier: data.supplier || "",
    vehicleNo: data.vehicleNo || "",
    material: data.material || "",
    color: data.color || "",
    grossWeight: num(data.grossWeight),
    tareWeight: num(data.tareWeight),
    netWeight: num(data.netWeight),

    transportPaidBy: data.transportPaidBy || "SUPPLIER",
    transportCost: num(data.transportCost),
    transportRemarks: data.transportRemarks || "",

    moisture: data.moisture || "",
    contamination: data.contamination || "",
    estimatedRecovery: data.estimatedRecovery || "",
    ratePerKg: num(data.ratePerKg),
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
  validateOperationalWrite_(
    { ...data, date },
    getRowById_("Factory_Expenses", "expenseId", data.expenseId)
  );

  return updateById("Factory_Expenses", "expenseId", data.expenseId, {
    date,
    periodMonth: data.periodMonth || getPeriodMonth(date),
    category: data.category || "",
    description: data.description || "",
    amount: num(data.amount),
    paidBy: data.paidBy || "",
    remarks: data.remarks || "",
    status: data.status || "",
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

function addWashBatch(data = {}) {

  validateOperationalWrite_(data);

  const sh = getSheet("Wash_Batches");

  ensureHeaders_("Wash_Batches",[
    "washBatchId","batchId","sourceRMId","sourceRmInwardId","supplier",
    "availableRMQty","date","shift","machine","entryMode","periodMonth",
    "inputMaterial","inputWeightKg","washedOutputKg",
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
    supplier:data.supplier||"",
    availableRMQty:num(data.availableRMQty),

    date:normalizeDateOnly_(data.date||todayYmd()),
    shift:data.shift||"",
    machine:data.machine||"",
    entryMode:data.entryMode||"DAILY",
    periodMonth:data.periodMonth||getPeriodMonth(data.date),

    inputMaterial:data.inputMaterial||"",
    inputWeightKg,
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

  return output({
    ok:true,
    washBatchId
  });

}



function updateWashBatch(data = {}) {
  const idValue = data.washBatchId || data.batchId;
  validateOperationalWrite_(
    data,
    getRowById_("Wash_Batches", "washBatchId", idValue)
  );

  return updateById(
    "Wash_Batches",
    "washBatchId",
    idValue,
    {

      sourceRMId:data.sourceRMId||"",
      sourceRmInwardId:data.sourceRmInwardId||"",
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

    const sh=getSheet("Sorting_Batches");

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

    return output({
        ok:true,
        sortingBatchId
    });

}



function updateSortingBatch(data={}){
    validateOperationalWrite_(
        data,
        getRowById_("Sorting_Batches", "sortingBatchId", data.sortingBatchId)
    );

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

  addInventoryLedger({
    date,
    module: "EXTRUSION",
    movementType: "OUT",
    itemType: sourceType,
    itemName: data.inputMaterial || "",
    sourceRef: sourceBatchId,
    targetRef: extrusionBatchId,
    qtyIn: 0,
    qtyOut: totalInputKg,
    unit: "Kg",
    remarks: "Extrusion input",
    createdBy: data.createdBy || "System",
  });

  addInventoryLedger({
    date,
    module: "EXTRUSION",
    movementType: "IN",
    itemType: "FG",
    itemName: data.productionGrade || "",
    sourceRef: extrusionBatchId,
    targetRef: extrusionBatchId,
    qtyIn: fgOutputKg,
    qtyOut: 0,
    unit: "Kg",
    remarks: "Finished Goods generated",
    createdBy: data.createdBy || "System",
  });

  if (lumpsKg > 0) {
    addInventoryLedger({
      date,
      module: "EXTRUSION",
      movementType: "IN",
      itemType: "LUMPS",
      itemName: "Lumps",
      sourceRef: extrusionBatchId,
      targetRef: extrusionBatchId,
      qtyIn: lumpsKg,
      qtyOut: 0,
      unit: "Kg",
      remarks: "Recoverable lumps",
      createdBy: data.createdBy || "System",
    });
  }

  if (purgingKg > 0) {
    addInventoryLedger({
      date,
      module: "EXTRUSION",
      movementType: "IN",
      itemType: "PURGING",
      itemName: "Purging",
      sourceRef: extrusionBatchId,
      targetRef: extrusionBatchId,
      qtyIn: purgingKg,
      qtyOut: 0,
      unit: "Kg",
      remarks: "Recoverable purging",
      createdBy: data.createdBy || "System",
    });
  }

  if (reworkGranulesKg > 0) {
    addInventoryLedger({
      date,
      module: "EXTRUSION",
      movementType: "IN",
      itemType: "REWORK",
      itemName: "Rework Granules",
      sourceRef: extrusionBatchId,
      targetRef: extrusionBatchId,
      qtyIn: reworkGranulesKg,
      qtyOut: 0,
      unit: "Kg",
      remarks: "Rework granules generated",
      createdBy: data.createdBy || "System",
    });
  }

  return output({
    ok: true,
    extrusionBatchId,
    batchId: extrusionBatchId,
    sourceType,
    sourceBatchId,
  });
}

function updateExtrusionBatch(data = {}) {
  const date = normalizeDateOnly_(data.date || todayYmd());
  const idValue = data.extrusionBatchId || data.batchId;
  validateOperationalWrite_(
    { ...data, date },
    getRowById_("Extrusion_Batches", "extrusionBatchId", idValue)
  );

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
        return JSON.stringify(parsed.map((x) => ({
          sourceExtrusionBatchId: x.sourceExtrusionBatchId || "",
          lotNo: x.lotNo || x.sourceExtrusionBatchId || "",
          grade: x.grade || "",
          productionDate: normalizeDateOnly_(x.productionDate || data.productionDate || data.date || todayYmd()),
          productionShift: x.productionShift || data.productionShift || "",
          availableKg: num(x.availableKg),
          dispatchQtyKg: num(x.dispatchQtyKg),
          remarks: x.remarks || "",
        })));
      }
    } catch (err) {}
  }

  const sourceId = data.sourceExtrusionBatchId || data.linkedFgBatchId || "";

  return JSON.stringify([
    {
      sourceExtrusionBatchId: sourceId,
      lotNo: data.lotNo || sourceId,
      grade: data.grade || "",
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
    .filter((line) => line.sourceExtrusionBatchId && num(line.dispatchQtyKg) > 0);

  const requestedByBatch = {};

  lines.forEach((line) => {
    const batchId = String(line.sourceExtrusionBatchId || "");
    requestedByBatch[batchId] =
      (requestedByBatch[batchId] || 0) + num(line.dispatchQtyKg);
  });

  Object.keys(requestedByBatch).forEach((batchId) => {
    const available =
      fgProducedForBatch_(batchId) -
      fgDispatchedForBatch_(batchId, data.dispatchId);

    if (requestedByBatch[batchId] > available + 0.01) {
      throw new Error(
        "Dispatch exceeds available FG stock for " +
          batchId +
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
  const sourceId = data.sourceExtrusionBatchId || data.linkedFgBatchId || "";
  const dispatchLines = normalizeDispatchLines_(data);
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
    grade: data.grade || "",
    lotNo: data.lotNo || sourceId,
    quantityKg: num(data.quantityKg),
    noOfBags: num(data.noOfBags),
    ratePerKg: num(data.ratePerKg),
    dispatchLocation: data.dispatchLocation || "",
    remarks: data.remarks || "",
    dispatchStatus: data.dispatchStatus || "DISPATCHED",
    status: data.status || "ACTIVE",
    linkedFgBatchId: sourceId,
    transporterName: data.transporterName || "",
    ewayBillNo: data.ewayBillNo || "",
    dispatchLines,
    productionDate: normalizeDateOnly_(data.productionDate || date),
    productionShift: data.productionShift || "",
    createdBy: data.createdBy || "System",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  addInventoryLedger({
    date,
    module: "DISPATCH",
    movementType: "OUT",
    itemType: "FG",
    itemName: data.grade || "",
    sourceRef: sourceId,
    targetRef: dispatchId,
    qtyIn: 0,
    qtyOut: num(data.quantityKg),
    unit: "Kg",
    remarks: data.remarks || "FG dispatched",
    createdBy: data.createdBy || "System",
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
    grade: data.grade || "",
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
    dispatchLines: normalizeDispatchLines_(data),
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

function buildInventoryLedgerRowsFromSources_() {
  const ctx = {
    rows: [],
    sourceCounts: {},
    warnings: [],
    rebuildAt: new Date(),
  };

  rebuildFromRmInward_(ctx);
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
    migrationId: "LEDGER_REBUILD_FROM_SOURCE",
    migratedAt: ctx.rebuildAt,
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
    const sourceId = String(row.inwardId || row.batchId || "RM-" + (index + 1));
    const material = materialName_(row.material || row.color, "Mixed Material");
    const quantityKg = num(row.netWeight || row.quantityKg || row.grossWeight);

    pushRebuiltLedgerRow_(ctx, "RM_Inward", sourceId, {
      date: row.date,
      module: "RM_INWARD",
      movementType: "IN",
      itemType: materialCategory_(material),
      itemName: material,
      sourceRef: row.supplier || sourceId,
      targetRef: sourceId,
      qtyIn: quantityKg,
      qtyOut: 0,
      unit: "Kg",
      remarks: "Ledger rebuilt from RM_Inward",
      createdBy: row.createdBy || "Ledger Rebuild",
    });
  });
}

function rebuildFromWashBatches_(ctx) {
  const rows = getRowsAsObjects("Wash_Batches").filter((row) => !isDeleted_(row));
  rows.forEach((row, index) => {
    const sourceId = String(row.washBatchId || row.batchId || "WASH-" + (index + 1));
    const inputMaterial = materialName_(row.inputMaterial, "Mixed Material");
    const washedMaterial = inputMaterial.toUpperCase().indexOf("WHITE") !== -1 ? "Washed White Flakes" : "Washed Mixed";

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
    const inputMaterial = materialName_(row.inputMaterial, "Washed Mixed");

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
      { itemName: "White Sorted", qty: num(row.whiteSortedKg || row.acceptedQtyKg), itemType: "WIP", remarks: "Sorting white sorted output" },
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
    const inputMaterial = materialName_(row.inputMaterial, "White Sorted");
    const grade = normalizeFgMaterialName_(row.productionGrade || row.grade || "E1");

    [
      { itemName: inputMaterial, qty: num(row.inputWeightKg || row.totalInputKg), itemType: materialCategory_(inputMaterial), remarks: "Extrusion base input" },
      { itemName: "Virgin Material", qty: num(row.virginMaterialKg), itemType: "RM", remarks: "Extrusion virgin input" },
      { itemName: "Masterbatch", qty: num(row.masterBatchKg), itemType: "RM", remarks: "Extrusion masterbatch input" },
      { itemName: "Battery Scrap", qty: num(row.batteryFlakesKg), itemType: "RM", remarks: "Extrusion battery input" },
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

function addRmQuality(data = {}) {
  const sh = getSheet("RM_Quality");

  ensureHeaders_("RM_Quality", [
    "qualityId",
    "date",
    "rmInwardId",
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
    "status",
    "createdBy",
    "createdAt",
  ]);

  const qualityId = data.qualityId || generateBatchId("RMQ");
  const date = normalizeDateOnly_(data.date || todayYmd());

  const sample = num(data.sampleQtyGm);
  const dryDust = num(data.dryDustGm);
  const coloured = num(data.colouredFlakesGm);
  const pp = num(data.ppGm);
  const sink = num(data.sinkMaterialGm);

  const percent = (v) => (sample > 0 ? round2((num(v) / sample) * 100) : 0);

  appendObjectRow(sh, {
    qualityId,
    date,
    rmInwardId: data.rmInwardId || data.inwardId || "",
    formOfMaterial: data.formOfMaterial || "",
    conditionOfMaterial: data.conditionOfMaterial || "",
    sampleQtyGm: sample,
    dryDustGm: dryDust,
    colouredFlakesGm: coloured,
    rubberContaminationNo: num(data.rubberContaminationNo),
    ppGm: pp,
    sinkMaterialGm: sink,
    dryDustPercent: percent(dryDust),
    colouredFlakesPercent: percent(coloured),
    ppPercent: percent(pp),
    sinkMaterialPercent: percent(sink),
    acceptGm: sample - dryDust - coloured - pp - sink,
    remarks: data.remarks || "",
    status: data.status || "ACTIVE",
    createdBy: data.createdBy || "System",
    createdAt: new Date(),
  });

  return output({ ok: true, qualityId });
}

function updateRmQuality(data = {}) {
  const sample = num(data.sampleQtyGm);
  const dryDust = num(data.dryDustGm);
  const coloured = num(data.colouredFlakesGm);
  const pp = num(data.ppGm);
  const sink = num(data.sinkMaterialGm);

  const percent = (v) => (sample > 0 ? round2((num(v) / sample) * 100) : 0);

  return updateById("RM_Quality", "qualityId", data.qualityId, {
    date: normalizeDateOnly_(data.date || todayYmd()),
    rmInwardId: data.rmInwardId || data.inwardId || "",
    formOfMaterial: data.formOfMaterial || "",
    conditionOfMaterial: data.conditionOfMaterial || "",
    sampleQtyGm: sample,
    dryDustGm: dryDust,
    colouredFlakesGm: coloured,
    rubberContaminationNo: num(data.rubberContaminationNo),
    ppGm: pp,
    sinkMaterialGm: sink,
    dryDustPercent: percent(dryDust),
    colouredFlakesPercent: percent(coloured),
    ppPercent: percent(pp),
    sinkMaterialPercent: percent(sink),
    acceptGm: sample - dryDust - coloured - pp - sink,
    remarks: data.remarks || "",
    status: data.status || "",
  });
}

function addFgQuality(data = {}) {
  const sh = getSheet("FG_Quality");

  ensureHeaders_("FG_Quality", [
    "qualityId",
    "date",
    "extrusionBatchId",
    "fgBatchCode",
    "moisturePercent",
    "mfi",
    "colour",
    "appearance",
    "bagWeight1Kg",
    "bagWeight2Kg",
    "bagWeight3Kg",
    "bagWeight4Kg",
    "avgBagWeightKg",
    "remarks",
    "status",
    "createdBy",
    "createdAt",
  ]);

  const qualityId = data.qualityId || generateBatchId("FGQ");
  const date = normalizeDateOnly_(data.date || todayYmd());

  const b1 = num(data.bagWeight1Kg);
  const b2 = num(data.bagWeight2Kg);
  const b3 = num(data.bagWeight3Kg);
  const b4 = num(data.bagWeight4Kg);
  const bagCount = [b1, b2, b3, b4].filter((x) => x > 0).length;
  const avgBagWeightKg = bagCount > 0 ? round2((b1 + b2 + b3 + b4) / bagCount) : 0;

  appendObjectRow(sh, {
    qualityId,
    date,
    extrusionBatchId: data.extrusionBatchId || data.fgBatchCode || "",
    fgBatchCode: data.fgBatchCode || data.extrusionBatchId || "",
    moisturePercent: num(data.moisturePercent),
    mfi: num(data.mfi),
    colour: data.colour || "",
    appearance: data.appearance || "",
    bagWeight1Kg: b1,
    bagWeight2Kg: b2,
    bagWeight3Kg: b3,
    bagWeight4Kg: b4,
    avgBagWeightKg,
    remarks: data.remarks || "",
    status: data.status || "ACTIVE",
    createdBy: data.createdBy || "System",
    createdAt: new Date(),
  });

  return output({ ok: true, qualityId });
}

function updateFgQuality(data = {}) {
  const b1 = num(data.bagWeight1Kg);
  const b2 = num(data.bagWeight2Kg);
  const b3 = num(data.bagWeight3Kg);
  const b4 = num(data.bagWeight4Kg);
  const bagCount = [b1, b2, b3, b4].filter((x) => x > 0).length;
  const avgBagWeightKg = bagCount > 0 ? round2((b1 + b2 + b3 + b4) / bagCount) : 0;

  return updateById("FG_Quality", "qualityId", data.qualityId, {
    date: normalizeDateOnly_(data.date || todayYmd()),
    extrusionBatchId: data.extrusionBatchId || data.fgBatchCode || "",
    fgBatchCode: data.fgBatchCode || data.extrusionBatchId || "",
    moisturePercent: num(data.moisturePercent),
    mfi: num(data.mfi),
    colour: data.colour || "",
    appearance: data.appearance || "",
    bagWeight1Kg: b1,
    bagWeight2Kg: b2,
    bagWeight3Kg: b3,
    bagWeight4Kg: b4,
    avgBagWeightKg,
    remarks: data.remarks || "",
    status: data.status || "",
  });
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
    RM_Quality: [
      "qualityId",
      "date",
      "rmInwardId",
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
      "status",
      "createdBy",
      "createdAt",
    ],
    FG_Quality: [
      "qualityId",
      "date",
      "extrusionBatchId",
      "fgBatchCode",
      "moisturePercent",
      "mfi",
      "colour",
      "appearance",
      "bagWeight1Kg",
      "bagWeight2Kg",
      "bagWeight3Kg",
      "bagWeight4Kg",
      "avgBagWeightKg",
      "remarks",
      "status",
      "createdBy",
      "createdAt",
    ],
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
    "accountsSignoff","qcSignoff","ceoSignoff","remarks","savedBy","savedAt","status"
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
