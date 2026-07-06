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
    if (p.fn === "productionMaterials.list") return listMaster("Production_Materials");
    if (p.fn === "productionMaterials.add") return addProductionMaterial(p);
    if (p.fn === "productionMaterials.update") return updateProductionMaterial(p);
    if (p.fn === "productionMaterials.seedDefaults") return seedProductionMaterials();
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
      "itemType","itemName",
      "sourceRef","targetRef",
      "qtyIn","qtyOut",
      "unit","remarks",
      "status",
      "createdBy",
      "createdAt"
  ]);

  appendObjectRow(sh,{

      ledgerId:data.ledgerId||generateBatchId("LED"),

      date:normalizeDateOnly_(data.date||todayYmd()),

      module:data.module||"",
      movementType:data.movementType||"",

      itemType:data.itemType||"",
      itemName:data.itemName||"",

      sourceRef:data.sourceRef||"",
      targetRef:data.targetRef||"",

      qtyIn:num(data.qtyIn),
      qtyOut:num(data.qtyOut),

      unit:data.unit||"Kg",

      remarks:data.remarks||"",

      status:data.status||"ACTIVE",

      createdBy:data.createdBy||"System",
      createdAt:new Date()

  });

}

function getInventoryLedgerBalance(){

    const rows=getRowsAsObjects("Inventory_Ledger")
        .filter(r=>!isDeleted_(r));

    const balance={};

    rows.forEach(r=>{

        const key=r.itemType+"|"+r.itemName;

        if(!balance[key]){

            balance[key]={
                itemType:r.itemType,
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
