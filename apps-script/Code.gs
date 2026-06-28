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

    // FG Rates
    if (p.fn === "fgRates.add") return addFgRate(p);
    if (p.fn === "fgRates.list") return listMaster("FG_Rates");
    if (p.fn === "fgRates.update") return updateFgRate(p);

    // Factory Expenses
    if (p.fn === "factoryExpenses.add") return addFactoryExpense(p);
    if (p.fn === "factoryExpenses.list") return listMaster("Factory_Expenses");
    if (p.fn === "factoryExpenses.update") return updateFactoryExpense(p);

    // Month Close
    if (p.fn === "monthClose.add") return addMonthClose(p);
    if (p.fn === "monthClose.list") return listMaster("Month_Close");

    // Stores
    if (p.fn === "storesMaster.add") return addStoresMaster(p);
    if (p.fn === "storesMaster.list") return listMaster("Stores_Master");
    if (p.fn === "storesMaster.update") return updateStoresMaster(p);

    if (p.fn === "storesInward.add") return addStoresInward(p);
    if (p.fn === "storesInward.list") return listMaster("Stores_Inward");
    if (p.fn === "storesInward.update") return updateStoresInward(p);

    if (p.fn === "storesIssue.add") return addStoresIssue(p);
    if (p.fn === "storesIssue.list") return listMaster("Stores_Issue");
    if (p.fn === "storesIssue.update") return updateStoresIssue(p);

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
  ]);

  const inwardId = data.inwardId || data.batchId || generateBatchId("RMIN");
  const date = normalizeDateOnly_(data.date || todayYmd());

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
    remarks: data.remarks || "",
    createdBy: data.createdBy || "System",
  });

  return output({ ok: true, inwardId });
}

function updateRM(data = {}) {
  ensureHeaders_("RM_Inward", ["status"]);

  return updateById("RM_Inward", "inwardId", data.inwardId || data.batchId, {
    date: normalizeDateOnly_(data.date || todayYmd()),
    supplier: data.supplier || "",
    vehicleNo: data.vehicleNo || "",
    material: data.material || "",
    color: data.color || "",
    grossWeight: num(data.grossWeight),
    tareWeight: num(data.tareWeight),
    netWeight: num(data.netWeight),
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

  appendObjectRow(sh, {
    expenseId,
    date,
    periodMonth: data.periodMonth || getPeriodMonth(date),
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

function updateFactoryExpense(data = {}) {
  const date = normalizeDateOnly_(data.date || todayYmd());

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
// =====================================================
// WASH BATCHES
// =====================================================

function addWashBatch(data = {}) {

  validateMonthLock(data.periodMonth);

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

  return updateById(
    "Wash_Batches",
    "washBatchId",
    data.washBatchId || data.batchId,
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

    validateMonthLock(data.periodMonth);

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
  validateMonthLock(data.periodMonth);

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

  return updateById(
    "Extrusion_Batches",
    "extrusionBatchId",
    data.extrusionBatchId || data.batchId,
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

function addDispatch(data = {}) {
  const sh = getSheet("Dispatches");

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
    "createdAt"
  ]);

  const dispatchId = data.dispatchId || generateBatchId("DIS");
  const date = normalizeDateOnly_(data.date || todayYmd());
  const sourceId = data.sourceExtrusionBatchId || data.linkedFgBatchId || "";

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
    dispatchLines: data.dispatchLines || "",
    productionDate: normalizeDateOnly_(data.productionDate || ""),
    productionShift: data.productionShift || "",
    createdBy: data.createdBy || "System",
    createdAt: new Date(),
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
  const date = normalizeDateOnly_(data.date || todayYmd());

  return updateById("Dispatches", "dispatchId", data.dispatchId, {
    sourceExtrusionBatchId: data.sourceExtrusionBatchId || data.linkedFgBatchId || "",
    sourceSupplier: data.sourceSupplier || "",
    availableFGQty: num(data.availableFGQty),
    date,
    customerName: data.customerName || "",
    customerUnit: data.customerUnit || "",
    invoiceNo: data.invoiceNo || "",
    vehicleNo: data.vehicleNo || "",
    driverName: data.driverName || "",
    grade: data.grade || "",
    lotNo: data.lotNo || "",
    quantityKg: num(data.quantityKg),
    noOfBags: num(data.noOfBags),
    ratePerKg: num(data.ratePerKg),
    dispatchLocation: data.dispatchLocation || "",
    remarks: data.remarks || "",
    dispatchStatus: data.dispatchStatus || data.status || "",
    status: data.status || "",
    linkedFgBatchId: data.linkedFgBatchId || data.sourceExtrusionBatchId || "",
    transporterName: data.transporterName || "",
    ewayBillNo: data.ewayBillNo || "",
    dispatchLines: data.dispatchLines || "",
    productionDate: normalizeDateOnly_(data.productionDate || ""),
    productionShift: data.productionShift || "",
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

  return updateById(
      "Stores_Inward",
      "inwardId",
      data.inwardId||data.storesInwardId,
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

  ensureHeaders_("Stores_Issue",[
      "issueId","date","department",
      "itemName","category","unit",
      "qty","remarks","status",
      "issueStatus","issuedTo",
      "createdBy","createdAt"
  ]);

  const issueId=data.issueId||generateBatchId("ISS");

  appendObjectRow(sh,{

      issueId,

      date:normalizeDateOnly_(data.date||todayYmd()),

      department:data.department||"",
      itemName:data.itemName||"",
      category:data.category||"",
      unit:data.unit||"",

      qty:num(data.qty),

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
      qtyOut:num(data.qty),

      unit:data.unit||"Nos",

      remarks:data.remarks||"",
      createdBy:data.createdBy||"System"

  });

  return output({
      ok:true,
      issueId
  });

}

function updateStoresIssue(data={}){

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

          qty:num(data.qty),

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

// MONTH CLOSE

function addMonthClose(data = {}) {
  const sh = getSheet("Month_Close");

  ensureHeaders_("Month_Close", [
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
  ]);

  const closeId = generateBatchId("MCLOSE");

  appendObjectRow(sh, {
    closeId,
    periodMonth: data.periodMonth || "",
    rmInwardKg: num(data.rmInwardKg),
    rmValue: num(data.rmValue),
    washInputKg: num(data.washInputKg),
    washedOutputKg: num(data.washedOutputKg),
    sortingInputKg: num(data.sortingInputKg),
    sortingOutputKg: num(data.sortingOutputKg),
    extrusionInputKg: num(data.extrusionInputKg),
    fgProducedKg: num(data.fgProducedKg),
    dispatchKg: num(data.dispatchKg),
    turnover: num(data.turnover),
    storesInwardValue: num(data.storesInwardValue),
    storesIssueQty: num(data.storesIssueQty),
    factoryExpenses: num(data.factoryExpenses),
    avgRmPrice: num(data.avgRmPrice),
    grossContribution: num(data.grossContribution),
    manufacturingProfit: num(data.manufacturingProfit),
    remarks: data.remarks || "",
    closedBy: data.closedBy || "System",
    createdAt: new Date(),
  });

  try {
    const lockSh = getSheet("Month_Locks");

    ensureHeaders_("Month_Locks", [
      "periodMonth",
      "status",
      "lockedBy",
      "lockedAt",
      "remarks",
    ]);

    appendObjectRow(lockSh, {
      periodMonth: data.periodMonth || "",
      status: "LOCKED",
      lockedBy: data.closedBy || "System",
      lockedAt: new Date(),
      remarks: "Operational month freeze",
    });
  } catch (err) {}

  return output({ ok: true, closeId });
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