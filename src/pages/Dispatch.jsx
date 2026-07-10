import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiCall } from "../api/api";
import { formatDate } from "../utils/date";

import DataTable from "../components/DataTable";
import FormSection from "../components/FormSection";
import FactoryDropdown from "../components/FactoryDropdown";
import ProductionMaterialSelect from "../components/ProductionMaterialSelect";
import { KpiCard, PageLayout } from "../components/factoryDesignSystem";
import { normalizeInventoryMaterial } from "../services/inventoryEngine";
import { materialKey } from "../utils/materialInventory";

const DISPATCH_API_DEBUG =
  import.meta.env.DEV ||
  String(import.meta.env.VITE_REGEN_DEBUG || "").toLowerCase() === "true";

const MONTH_OPTIONS = [
  ["01", "Jan"], ["02", "Feb"], ["03", "Mar"], ["04", "Apr"],
  ["05", "May"], ["06", "Jun"], ["07", "Jul"], ["08", "Aug"],
  ["09", "Sep"], ["10", "Oct"], ["11", "Nov"], ["12", "Dec"],
].map(([value, label]) => ({ value, label }));

function yearOptions() {
  const current = new Date().getFullYear();
  return Array.from({ length: 7 }, (_, index) => String(current - 3 + index));
}

function showingRange(pagination) {
  const total = Number(pagination?.totalRows || 0);
  if (!total) return "Showing 0 records.";
  const page = Number(pagination?.page || 1);
  const size = Number(pagination?.pageSize || 50);
  const start = (page - 1) * size + 1;
  const end = Math.min(page * size, total);
  return `Showing ${start}-${end} of ${total} records.`;
}

function buildCustomerUnitOptions(customerName, customerRows, customerUnitRows) {
  const selectedCustomer = String(customerName || "").trim().toUpperCase();
  const unitValues = customerUnitRows
    .filter((row) => !["DISABLED", "INACTIVE", "DELETED", "ARCHIVED", "MERGED"].includes(String(row.status || "ACTIVE").toUpperCase()))
    .filter((row) => !selectedCustomer || String(row.customerName || row.customer || "").trim().toUpperCase() === selectedCustomer)
    .map((row) => row.unitName || row.name || row.customerUnit || "");
  const legacyValues = customerRows
    .filter((row) => !selectedCustomer || String(row.customerName || row.name || "").trim().toUpperCase() === selectedCustomer)
    .map((row) => row.customerUnit || row.unit || "");
  return [...new Set([...unitValues, ...legacyValues].filter(Boolean))].sort();
}

async function timedDispatchApiCall(payload) {
  const startedAt = Date.now();
  const routeName = payload?.fn || "unknown";

  try {
    const response = await apiCall(payload);
    if (DISPATCH_API_DEBUG) {
      console.info("[Dispatch API response]", {
        route: routeName,
        elapsedMs: response?.elapsedMs ?? Date.now() - startedAt,
        responseKeys: response ? Object.keys(response) : [],
        rowCount: Array.isArray(response?.rows) ? response.rows.length : undefined,
        availability: response?.availability,
        error: response?.error || "",
      });
    }
    return response;
  } catch (error) {
    if (DISPATCH_API_DEBUG) {
      console.error("[Dispatch API error]", {
        route: routeName,
        elapsedMs: Date.now() - startedAt,
        error: error?.message || String(error),
      });
    }
    throw error;
  } finally {
    const elapsedMs = Date.now() - startedAt;
    if (DISPATCH_API_DEBUG) console.info(`[Dispatch API timing] ${routeName}: ${elapsedMs} ms`);
  }
}

function withTimeout(promise, ms, message) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export default function Dispatch() {
  const today = new Date().toISOString().split("T")[0];

  const blankLine = {
    sourceExtrusionBatchId: "",
    lotNo: "",
    grade: "",
    material: "",
    itemType: "FG",
    productionDate: "",
    productionShift: "",
    availableKg: "",
    dispatchQtyKg: "",
    remarks: "",
  };

  const blankForm = {
    dispatchId: "",
    date: today,

    productionDate: "",
    productionShift: "",

    customerName: "",
    customerUnit: "",
    invoiceNo: "",
    vehicleNo: "",
    driverName: "",
    dispatchStatus: "DISPATCHED",
    ratePerKg: "",
    rateSource: "",
    noOfBags: "",
    truckCapacityKg: "",
    dispatchLocation: "",
    remarks: "",

    dispatchLines: JSON.stringify([blankLine]),
    quantityKg: "",
    material: "",
    grade: "",
    lotNo: "",
    sourceExtrusionBatchId: "",
  };

  const [rows, setRows] = useState([]);
  const [fgAvailability, setFgAvailability] = useState(null);
  const [fgAvailabilityLoading, setFgAvailabilityLoading] = useState(true);
  const [fgAvailabilityError, setFgAvailabilityError] = useState("");
  const [customerRows, setCustomerRows] = useState([]);
  const [customerUnitRows, setCustomerUnitRows] = useState([]);
  const [fgRateRows, setFgRateRows] = useState([]);
  const [materialRows, setMaterialRows] = useState([]);
  const [status, setStatus] = useState("");
  const [saveDebug, setSaveDebug] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(blankForm);
  const [dispatchLines, setDispatchLines] = useState([{ ...blankLine }]);
  const [month, setMonth] = useState(today.slice(5, 7));
  const [year, setYear] = useState(today.slice(0, 4));
  const [customerFilter, setCustomerFilter] = useState("");
  const [unitFilter, setUnitFilter] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [historyTotals, setHistoryTotals] = useState({ dispatchedKg: 0, dispatchValue: 0, dispatchCount: 0 });
  const [historyPagination, setHistoryPagination] = useState({ page: 1, pageSize: 50, totalRows: 0, totalPages: 1 });
  const [editRecord, setEditRecord] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteSaving, setDeleteSaving] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const writeLockRef = useRef(false);
  const historyRequestRef = useRef(0);

  const loadReferenceData = useCallback(async () => {
    const results = await Promise.allSettled([
        timedDispatchApiCall({ fn: "factoryMaster.list", masterType: "customer" }),
        timedDispatchApiCall({ fn: "factoryMaster.list", masterType: "customerUnit" }),
        timedDispatchApiCall({ fn: "fgRates.list" }),
        timedDispatchApiCall({ fn: "materialMaster.list" }),
    ]);
    const [customers, customerUnits, fgRates, materials] = results;
    if (customers.status === "fulfilled" && customers.value?.ok !== false) setCustomerRows(customers.value?.rows || []);
    if (customerUnits.status === "fulfilled" && customerUnits.value?.ok !== false) setCustomerUnitRows(customerUnits.value?.rows || []);
    if (fgRates.status === "fulfilled" && fgRates.value?.ok !== false) setFgRateRows(fgRates.value?.rows || []);
    if (materials.status === "fulfilled" && materials.value?.ok !== false) setMaterialRows(materials.value?.rows || []);

    const failed = results.filter((result) => result.status === "rejected" || result.value?.ok === false);
    if (failed.length) setStatus("Some Dispatch master data could not be loaded. Retry the page before saving.");
    return failed.length === 0;
  }, []);

  const loadFgAvailability = useCallback(async () => {
    setFgAvailabilityLoading(true);
    setFgAvailabilityError("");
    try {
      const res = await withTimeout(
        timedDispatchApiCall({ fn: "dispatch.fgAvailability" }),
        30000,
        "FG availability request timed out."
      );
      if (!res || res.ok !== true) throw new Error(res?.error || "Failed loading FG availability.");
      if (!res.availability || typeof res.availability !== "object") {
        throw new Error("Backend response is missing the FG availability contract.");
      }
      setFgAvailability({
        E1: Number(res.availability.E1 || 0),
        E2: Number(res.availability.E2 || 0),
        E3: Number(res.availability.E3 || 0),
        E4: Number(res.availability.E4 || 0),
        E5: Number(res.availability.E5 || 0),
      });
      return true;
    } catch (err) {
      setFgAvailability(null);
      setFgAvailabilityError(`Could not load FG availability: ${err.message}`);
      return false;
    } finally {
      setFgAvailabilityLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadReferenceData();
      loadFgAvailability();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadFgAvailability, loadReferenceData]);

  const loadHistory = useCallback(async () => {
    const requestId = ++historyRequestRef.current;
    setHistoryLoading(true);
    setHistoryError("");
    try {
      const res = await withTimeout(
        timedDispatchApiCall({
          fn: "dispatch.historySummary",
          periodMonth: `${year}-${month}`,
          customer: customerFilter,
          customerUnit: unitFilter,
          grade: gradeFilter,
          search: debouncedSearch,
          page,
          pageSize: 50,
          showDeleted: "NO",
        }),
        30000,
        "Dispatch history request timed out."
      );
      if (requestId !== historyRequestRef.current) return false;
      if (!res || res.ok !== true) throw new Error(res?.error || "Dispatch history failed to load.");
      if (!Array.isArray(res.rows) || !res.totals || !res.pagination || !res.gradeTotals) {
        throw new Error("Backend response is missing the Dispatch history contract.");
      }
      setRows(res.rows);
      setHistoryTotals(res.totals || { dispatchedKg: 0, dispatchValue: 0, dispatchCount: 0 });
      setHistoryPagination(res.pagination || { page: 1, pageSize: 50, totalRows: 0, totalPages: 1 });
      return true;
    } catch (err) {
      if (requestId !== historyRequestRef.current) return false;
      setRows([]);
      setHistoryError(err.message);
      return false;
    } finally {
      if (requestId === historyRequestRef.current) setHistoryLoading(false);
    }
  }, [customerFilter, debouncedSearch, gradeFilter, month, page, unitFilter, year]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => loadHistory(), 0);
    return () => clearTimeout(timer);
  }, [loadHistory]);

  async function refreshDispatchData() {
    const results = await Promise.allSettled([loadHistory(), loadFgAvailability()]);
    return results.every((result) => result.status === "fulfilled" && result.value !== false);
  }

  function dateForInput(value) {
    if (!value) return "";

    const text = String(value);

    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
    if (text.includes("T")) return text.split("T")[0];

    const d = new Date(value);
    if (isNaN(d.getTime())) return text.slice(0, 10);

    return d.toISOString().split("T")[0];
  }

  function parseLines(row) {
    try {
      if (row.dispatchLines) {
        const parsed = JSON.parse(row.dispatchLines);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (err) {
      console.log(err);
    }

    if (row.sourceExtrusionBatchId || row.grade) {
      const grade = normalizeFgGrade(row.grade || row.material || "");
      return [
        {
          sourceExtrusionBatchId: row.sourceExtrusionBatchId || "",
          lotNo: row.lotNo || row.sourceExtrusionBatchId || "",
          grade,
          material: grade,
          itemType: "FG",
          productionDate: row.productionDate || row.date || "",
          productionShift: row.productionShift || "",
          availableKg: row.availableFGQty || "",
          dispatchQtyKg: row.quantityKg || "",
          remarks: "",
        },
      ];
    }

    return [{ ...blankLine }];
  }

  const materialInventory = useMemo(() => {
    if (!fgAvailability) return [];
    return ["E1", "E2", "E3", "E4", "E5"].map((grade) => ({
      material: grade,
      availableKg: Number(fgAvailability[grade] || 0),
      source: "Inventory_Ledger",
    }));
  }, [fgAvailability]);

  const fgGrades = useMemo(() => {
    return materialRows
      .filter((row) => {
        const status = String(row.status || "ACTIVE").toUpperCase();
        const category = String(row.category || row.materialType || "").toUpperCase();
        const appearsInDispatch = ["YES", "TRUE", "Y", "1"].includes(
          String(row.appearsInDispatch || "").toUpperCase()
        );
        return status === "ACTIVE" && category === "FG" && appearsInDispatch;
      })
      .map((row) => normalizeFgGrade(row.materialName || row.materialCode || ""))
      .filter(Boolean)
      .filter((grade, index, list) => list.indexOf(grade) === index)
      .sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
  }, [materialRows]);

  const selectedInventory = materialInventory.find(
    (x) => normalizeFgGrade(x.material) === normalizeFgGrade(form.material || form.grade || "")
  );

  const fgStockRows = useMemo(() => {
    if (!fgAvailability) return [];
    return ["E1", "E2", "E3", "E4", "E5"].map((grade) => {
      return {
        grade,
        availableKg: Number(fgAvailability[grade] || 0),
        source: "Inventory_Ledger",
        selected: normalizeFgGrade(form.material || form.grade || "") === grade,
      };
    });
  }, [fgAvailability, form.material, form.grade]);

  function getLineTotal(lines = dispatchLines) {
    return lines.reduce((s, r) => s + Number(r.dispatchQtyKg || 0), 0);
  }

  function formatRs(value) {
    return `Rs. ${Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`;
  }

  function getGradeSummary(lines = dispatchLines) {
    const map = {};

    lines.forEach((line) => {
      const grade = normalizeFgGrade(line.grade || line.material || "") || "NA";
      map[grade] = (map[grade] || 0) + Number(line.dispatchQtyKg || 0);
    });

    return Object.entries(map)
      .map(([grade, qty]) => `${grade}: ${qty} Kg`)
      .join(" | ");
  }

  function getLotSummary(lines = dispatchLines) {
    return lines
      .filter((x) => x.sourceExtrusionBatchId)
      .map(
        (x) =>
          `${x.lotNo || x.sourceExtrusionBatchId}: ${x.dispatchQtyKg || 0} Kg`
      )
      .join(" + ");
  }

  function autoCalculate(updated, lines = dispatchLines, options = {}) {
    const totalQty = getLineTotal(lines);
    const quantityKg = totalQty > 0 ? totalQty : Number(updated.quantityKg || 0);

    const cleanLines = lines.map((x) => ({
      ...x,
      grade: normalizeFgGrade(x.grade || x.material || updated.material || updated.grade),
      material: normalizeFgGrade(x.material || x.grade || updated.material || updated.grade),
      itemType: "FG",
      availableKg: Number(x.availableKg || 0),
      dispatchQtyKg: options.preserveQuantityText
        ? String(x.dispatchQtyKg ?? updated.quantityKg ?? "")
        : Number(x.dispatchQtyKg || 0) || (lines.length === 1 ? quantityKg : 0),
    }));

    updated.dispatchId = updated.dispatchId || "";
    updated.quantityKg = options.preserveQuantityText
      ? String(updated.quantityKg ?? "")
      : quantityKg > 0 ? quantityKg.toFixed(2) : "";
    updated.dispatchLines = JSON.stringify(cleanLines);
    updated.material = normalizeFgGrade(updated.material || updated.grade);
    updated.grade = updated.material || getGradeSummary(cleanLines);
    updated.lotNo = getLotSummary(cleanLines);
    updated.sourceExtrusionBatchId = "";

    return updated;
  }

  function lookupFgRate(material, customerName, dateValue) {
    const gradeKey = normalizeFgGrade(material);
    const customerKey = String(customerName || "").trim().toUpperCase();
    const targetTime = new Date(dateValue || today).getTime();

    const matches = fgRateRows
      .filter((row) => String(row.status || "ACTIVE").toUpperCase() !== "DELETED")
      .filter((row) => normalizeFgGrade(row.grade) === gradeKey)
      .filter((row) => {
        const rowCustomer = String(row.customerName || "").trim().toUpperCase();
        return !rowCustomer || !customerKey || rowCustomer === customerKey;
      })
      .map((row) => {
        const rowTime = fgRateEffectiveTime(row);
        return {
          row,
          rowTime: Number.isNaN(rowTime) ? 0 : rowTime,
          customerExact: String(row.customerName || "").trim().toUpperCase() === customerKey,
        };
      })
      .filter((item) => !targetTime || item.rowTime <= targetTime || item.rowTime === 0)
      .sort((a, b) => {
        if (a.customerExact !== b.customerExact) return a.customerExact ? -1 : 1;
        return b.rowTime - a.rowTime;
      });

    return matches[0]?.row || null;
  }

  function fgRateEffectiveTime(row) {
    const rowDate = dateForInput(row.date);
    if (rowDate) {
      const time = new Date(rowDate).getTime();
      if (!Number.isNaN(time)) return time;
    }

    const year = Number(row.year || 0);
    const month = monthNumber(row.month);
    if (year && month) return new Date(year, month - 1, 1).getTime();
    return 0;
  }

  function monthNumber(value) {
    const text = String(value || "").trim();
    const numeric = Number(text);
    if (numeric >= 1 && numeric <= 12) return numeric;
    const index = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"].indexOf(
      text.slice(0, 3).toUpperCase()
    );
    return index >= 0 ? index + 1 : 0;
  }

  function rateForGrade(material, sourceForm = form) {
    const grade = normalizeFgGrade(material);
    const rateRow = lookupFgRate(grade, sourceForm.customerName, sourceForm.date);
    return Number(rateRow?.ratePerKg || 0);
  }

  function applyAutoRate(updated) {
    if (!updated.material) return updated;
    const rateRow = lookupFgRate(updated.material, updated.customerName, updated.date);
    if (!rateRow) {
      return {
        ...updated,
        ratePerKg: "",
        rateSource: "",
      };
    }
    return {
      ...updated,
      ratePerKg: rateRow.ratePerKg || "",
      rateSource: rateRow.customerName ? "FG Rates customer match" : "FG Rates grade default",
    };
  }

  function onChange(e) {
    let updated = {
      ...form,
      [e.target.name]: e.target.value,
    };

    if (e.target.name === "customerName" && e.item?.customerUnit) {
      updated.customerUnit = e.item.customerUnit;
    }

    if (e.target.name === "material") {
      updated.material = normalizeFgGrade(e.target.value);
      updated.grade = updated.material;
      updated.lotNo = "";
      updated.sourceExtrusionBatchId = "";
      updated.ratePerKg = "";
      updated.rateSource = "";
      setDispatchLines([{ ...blankLine, grade: updated.material, material: updated.material }]);
    }

    if (["customerName", "date"].includes(e.target.name) && String(updated.rateSource || "").startsWith("FG Rates")) {
      updated.ratePerKg = "";
      updated.rateSource = "";
    }

    if (e.target.name === "quantityKg") {
      const nextMaterial = normalizeFgGrade(updated.material || updated.grade);
      const nextLines = nextMaterial
        ? buildGradeDispatchLines(nextMaterial, e.target.value)
        : [{ ...blankLine, dispatchQtyKg: e.target.value }];
      setDispatchLines(nextLines);
      updated = autoCalculate(updated, nextLines, { preserveQuantityText: true });
    } else {
      updated = autoCalculate(updated, dispatchLines);
    }

    if (["material", "customerName", "date"].includes(e.target.name)) {
      updated = applyAutoRate(updated);
    }

    setForm(updated);
  }

  const customerUnitOptions = useMemo(() => {
    return buildCustomerUnitOptions(form.customerName, customerRows, customerUnitRows);
  }, [customerRows, customerUnitRows, form.customerName]);
  const historyUnitOptions = useMemo(() => {
    return buildCustomerUnitOptions(customerFilter, customerRows, customerUnitRows);
  }, [customerRows, customerUnitRows, customerFilter]);
  const editUnitOptions = useMemo(() => {
    return buildCustomerUnitOptions(editForm?.customerName || "", customerRows, customerUnitRows);
  }, [customerRows, customerUnitRows, editForm?.customerName]);

  function buildGradeDispatchLines(material, quantityKg) {
    const grade = normalizeFgGrade(material);
    return [
      {
        ...blankLine,
        grade,
        material: grade,
        itemType: "FG",
        lotNo: grade,
        availableKg: Number(selectedInventory?.availableKg || 0),
        dispatchQtyKg: String(quantityKg ?? ""),
        remarks: "Dispatched from FG grade inventory",
      },
    ];
  }

  function requestedQtyByGrade(lines) {
    const map = {};
    (lines || []).forEach((line) => {
      const grade = normalizeFgGrade(line.grade || line.material || form.material || "");
      if (!grade) return;
      map[grade] = (map[grade] || 0) + Number(line.dispatchQtyKg || 0);
    });
    return map;
  }

  function availableKgForGrade(grade) {
    const row = fgStockRows.find((item) => item.grade === normalizeFgGrade(grade));
    return Number(row?.availableKg || 0);
  }

  function validateLinesAgainstStock(lines) {
    const byGrade = requestedQtyByGrade(lines);
    for (const [grade, qty] of Object.entries(byGrade)) {
      const available = availableKgForGrade(grade);
      if (qty > available) {
        return `Dispatch quantity exceeds available ${grade} stock. Available: ${available.toFixed(2)} Kg`;
      }
    }
    return "";
  }
  async function submit(e) {
    e.preventDefault();
    if (writeLockRef.current) return;

    writeLockRef.current = true;
    setSaving(true);
    setStatus("Saving dispatch...");
    setSaveDebug(null);
    try {
      if (!form.material) {
        setStatus("Select material.");
        return;
      }

      if (fgAvailabilityLoading || fgAvailabilityError || !fgAvailability) {
        setStatus("FG availability is not ready. Retry stock loading before saving dispatch.");
        return;
      }

      if (Number(form.quantityKg || 0) <= 0) {
        setStatus("Enter dispatch quantity.");
        return;
      }

      const material = normalizeFgGrade(form.material);
      const cleanLines = buildGradeDispatchLines(material, form.quantityKg);
      const stockError = validateLinesAgainstStock(cleanLines);
      if (stockError) {
        setStatus(stockError);
        return;
      }
      const rate = rateForGrade(material);
      if (rate <= 0) {
        setStatus(`Missing FG Rates selling rate for ${material}. Add the rate before saving dispatch.`);
        return;
      }

      const finalForm = autoCalculate(
        {
          ...form,
          material,
          grade: material,
          sourceExtrusionBatchId: "",
          linkedFgBatchId: "",
          dispatchId: form.dispatchId || "",
        },
        cleanLines
      );

      const debugSummary = {
        dispatchId: finalForm.dispatchId || "Auto-generated on save",
        grade: material,
        quantityKg: Number(finalForm.quantityKg || 0),
        ratePerKg: rate,
        value: Number(finalForm.quantityKg || 0) * rate,
        customer: finalForm.customerName || "",
        unit: finalForm.customerUnit || "",
      };
      setSaveDebug(debugSummary);

      const saveRequest = apiCall({
        fn: "dispatch.add",
        ...finalForm,
      });

      const res = await withTimeout(
        saveRequest,
        30000,
        "Dispatch save timed out. Please check if record was saved before retrying."
      );

      const responseError = validateDispatchSaveResponse(res);
      if (responseError) {
        setStatus(responseError);
        return;
      }

      const savedDispatchId = res.dispatchId || finalForm.dispatchId;
      setStatus(res.message || `Dispatch saved successfully: ${savedDispatchId}`);
      setForm(blankForm);
      setDispatchLines([{ ...blankLine }]);
      setStatus(res.message || `Dispatch saved successfully: ${savedDispatchId}`);
      refreshDispatchData().then((reloaded) => {
        if (!reloaded) {
          setStatus(`Dispatch saved successfully: ${savedDispatchId}, but refresh failed. Please reopen Dispatch before entering another dispatch.`);
        }
      });
    } catch (err) {
      console.log("dispatch save failed", err);
      setStatus(err.message || "Dispatch save failed.");
    } finally {
      setSaving(false);
      writeLockRef.current = false;
    }
  }

  function validateDispatchSaveResponse(res) {
    if (!res) return "Dispatch save failed: backend returned no response.";
    if (res.ok === false) return res.error || res.message || "Dispatch save failed.";
    if (!res.dispatchId) return "Dispatch save failed: backend did not return dispatchId.";
    if (res.ledgerError) return `Dispatch ledger error: ${res.ledgerError}`;
    if (res.ledgerWarning) return `Dispatch ledger warning: ${res.ledgerWarning}`;
    if (Array.isArray(res.ledgerWarnings) && res.ledgerWarnings.length) {
      return `Dispatch ledger warning: ${res.ledgerWarnings.join(", ")}`;
    }
    if (res.ledgerPosted !== true) {
      return "Dispatch save failed: inventory ledger posting was not confirmed.";
    }
    return "";
  }

  async function editRow(row) {
    if (writeLockRef.current) return;
    setEditRecord({ dispatchId: row.dispatchId });
    setEditForm(null);
    setEditError("");
    setEditLoading(true);
    try {
      const res = await withTimeout(
        apiCall({ fn: "dispatch.get", dispatchId: row.dispatchId }),
        30000,
        "Request timed out. Check the backend deployment and try again."
      );
      if (!res || res.ok !== true || !res.row) throw new Error(res?.error || "Dispatch record could not be loaded.");
      const record = res.row;
      const parsed = parseLines(record);
      const productionDate = dateForInput(record.productionDate) || dateForInput(record.date) || "";
      const productionShift = record.productionShift || "";
      const material = normalizeFgGrade(record.material || record.grade || parsed[0]?.grade || "");
      const normalizedLines = parsed.map((line) => ({
        ...line,
        grade: normalizeFgGrade(line.grade || line.material || material),
        material: normalizeFgGrade(line.material || line.grade || material),
        productionDate: dateForInput(line.productionDate) || productionDate,
        productionShift: line.productionShift || productionShift,
      }));
      let updated = autoCalculate({
        ...blankForm,
        ...record,
        date: dateForInput(record.date) || today,
        material,
        grade: material,
        productionDate,
        productionShift,
        dispatchId: record.dispatchId,
      }, normalizedLines, { preserveQuantityText: true });
      updated = applyAutoRate(updated);
      setEditRecord(record);
      setEditForm(updated);
    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditLoading(false);
    }
  }

  function onEditChange(e) {
    if (!editForm) return;
    let updated = { ...editForm, [e.target.name]: e.target.value };
    if (e.target.name === "customerName") updated.customerUnit = "";
    if (e.target.name === "material") {
      updated.material = normalizeFgGrade(e.target.value);
      updated.grade = updated.material;
    }
    const material = normalizeFgGrade(updated.material || updated.grade);
    const lines = [{
      ...blankLine,
      grade: material,
      material,
      itemType: "FG",
      lotNo: material,
      dispatchQtyKg: String(updated.quantityKg ?? ""),
      remarks: "Dispatched from FG grade inventory",
    }];
    updated = autoCalculate(updated, lines, { preserveQuantityText: true });
    if (["material", "customerName", "date"].includes(e.target.name)) updated = applyAutoRate(updated);
    setEditForm(updated);
  }

  async function saveDispatchEdit() {
    if (!editForm || writeLockRef.current) return;
    const material = normalizeFgGrade(editForm.material || editForm.grade);
    const quantityKg = Number(editForm.quantityKg || 0);
    if (!material) return setEditError("Select FG grade.");
    if (quantityKg <= 0) return setEditError("Enter dispatch quantity.");
    const rate = rateForGrade(material, editForm);
    if (rate <= 0) return setEditError(`Missing FG Rates selling rate for ${material}.`);

    const lines = [{
      ...blankLine,
      grade: material,
      material,
      itemType: "FG",
      lotNo: material,
      dispatchQtyKg: String(editForm.quantityKg),
      remarks: "Dispatched from FG grade inventory",
    }];
    const finalForm = autoCalculate({ ...editForm, material, grade: material }, lines);
    writeLockRef.current = true;
    setEditSaving(true);
    setEditError("");
    try {
      const res = await withTimeout(
        apiCall({ fn: "dispatch.update", ...finalForm, dispatchId: editForm.dispatchId }),
        30000,
        "Request timed out. Check whether the dispatch was updated before retrying."
      );
      const responseError = validateDispatchSaveResponse(res);
      if (responseError) throw new Error(responseError);
      setStatus(res.message || `Dispatch updated successfully: ${res.dispatchId}`);
      await refreshDispatchData();
      setEditRecord(null);
      setEditForm(null);
    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditSaving(false);
      writeLockRef.current = false;
    }
  }

  function requestDelete(row) {
    if (writeLockRef.current) return;
    setDeleteTarget(row);
    setDeleteError("");
  }

  async function confirmDelete() {
    if (!deleteTarget || writeLockRef.current) return;
    writeLockRef.current = true;
    setDeleteSaving(true);
    setDeleteError("");
    try {
      const res = await withTimeout(
        apiCall({
          fn: "dispatch.update",
          dispatchId: deleteTarget.dispatchId,
          dispatchStatus: "DELETED",
          status: "DELETED",
        }),
        30000,
        "Request timed out. Check whether the dispatch was deleted before retrying."
      );
      if (!res || res.ok !== true) throw new Error(res?.error || "Dispatch delete failed.");
      if (!res.dispatchId || res.ledgerVoided !== true) throw new Error("Dispatch delete did not confirm ledger restoration.");
      setStatus(res.message || `Dispatch deleted: ${res.dispatchId}`);
      await refreshDispatchData();
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleteSaving(false);
      writeLockRef.current = false;
    }
  }

  function clearForm() {
    setForm(blankForm);
    setDispatchLines([{ ...blankLine }]);
    setSaveDebug(null);
    setStatus("Ready for new dispatch");
  }

  const currentDispatchQty = getLineTotal(dispatchLines);
  const operatorDispatchQty = Number(form.quantityKg || 0) || currentDispatchQty;
  const currentSalesValue = operatorDispatchQty * rateForGrade(form.material);
  const availableStockKg = Number(selectedInventory?.availableKg || 0);
  const remainingAfterDispatchKg = Math.max(
    availableStockKg - operatorDispatchQty,
    0
  );
  const truckCapacityKg = Number(form.truckCapacityKg || 0);
  const truckFillPercent =
    truckCapacityKg > 0
      ? ((operatorDispatchQty / truckCapacityKg) * 100).toFixed(1)
      : "";

  return (
    <PageLayout
      title="Dispatch"
      subtitle="Dispatch consumes material inventory. Operators select material and quantity; traceability is allocated internally."
    >

      <div style={sectionCard}>
        <div style={sectionTitle}>Filters</div>
        <div style={historyFilters}>
          <Field label="Month">
            <select value={month} onChange={(e) => { setMonth(e.target.value); setPage(1); }} style={inputStyle}>
              {MONTH_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </Field>
          <Field label="Year">
            <select value={year} onChange={(e) => { setYear(e.target.value); setPage(1); }} style={inputStyle}>
              {yearOptions().map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </Field>
          <Field label="Customer">
            <select value={customerFilter} onChange={(e) => { setCustomerFilter(e.target.value); setUnitFilter(""); setPage(1); }} style={inputStyle}>
              <option value="">All Customers</option>
              {customerRows.map((item) => {
                const name = item.customerName || item.name || "";
                return name ? <option key={item.customerId || name} value={name}>{name}</option> : null;
              })}
            </select>
          </Field>
          <Field label="Customer Unit">
            <select value={unitFilter} onChange={(e) => { setUnitFilter(e.target.value); setPage(1); }} style={inputStyle}>
              <option value="">All Units</option>
              {historyUnitOptions.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
            </select>
          </Field>
          <Field label="FG Grade">
            <select value={gradeFilter} onChange={(e) => { setGradeFilter(e.target.value); setPage(1); }} style={inputStyle}>
              <option value="">All Grades</option>
              {fgGrades.map((grade) => <option key={grade} value={grade}>{grade}</option>)}
            </select>
          </Field>
          <Field label="Search">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Dispatch, invoice, vehicle..." style={inputStyle} />
          </Field>
        </div>
      </div>

      <div style={sectionCard}>
        <div style={sectionTitle}>Available FG Stock</div>
        {fgAvailabilityLoading && <div style={loadingPanel}>Loading stock...</div>}
        {!fgAvailabilityLoading && fgAvailabilityError && (
          <div style={errorStyle}>
            <div>{fgAvailabilityError}</div>
            <button type="button" onClick={loadFgAvailability} style={secondaryButton}>Retry</button>
          </div>
        )}
        {!fgAvailabilityLoading && !fgAvailabilityError && (
          <div style={fgStockGrid}>
            {fgStockRows.map((row) => (
              <button
                key={row.grade}
                type="button"
                onClick={() => onChange({ target: { name: "material", value: row.grade } })}
                style={{
                  ...fgStockCard,
                  borderColor: row.selected ? "#0f766e" : "#e5e7eb",
                  background: row.selected ? "#ecfdf5" : "white",
                }}
              >
                <div style={fgGradeTitle}>{row.grade} Available</div>
                <div style={fgGradeQty}>{row.availableKg.toFixed(2)} kg</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {!fgAvailabilityLoading && !fgAvailabilityError && (
        <div style={stockNote}>Available stock as of today | Source: Inventory_Ledger</div>
      )}

      <div style={sectionCard}>
        <div style={sectionTitle}>Selected Month Summary - {month}/{year}</div>
        <div className="factory-kpi-grid">
          <KpiCard title="Total Dispatched" value={historyLoading ? "Loading..." : historyError ? "Unavailable" : `${Number(historyTotals.dispatchedKg || 0).toFixed(0)} Kg`} />
          <KpiCard title="Total Dispatch Value" value={historyLoading ? "Loading..." : historyError ? "Unavailable" : formatRs(historyTotals.dispatchValue)} tone="neutral" />
        </div>
      </div>

      {status && <div style={statusStyle}>{status}</div>}

      <form
        onSubmit={submit}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
            e.preventDefault();
          }
        }}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <FormSection title="New Dispatch">
          <Field label="Dispatch Entry Date">
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={onChange}
              style={inputStyle}
            />
          </Field>

          <Field label="Material">
            <ProductionMaterialSelect
              name="material"
              value={form.material}
              onChange={onChange}
              placeholder="Select Material"
              style={inputStyle}
              required
              stage="DISPATCH"
              direction="INPUT"
              items={materialRows}
            />
          </Field>

          <Field label="Available Quantity">
            <input
              readOnly
              value={fgAvailabilityLoading ? "Loading..." : fgAvailabilityError ? "Unavailable" : `${Number(selectedInventory?.availableKg || 0).toFixed(2)} Kg`}
              style={readonlyStyle}
            />
            <div style={hintText}>Available stock as of today</div>
          </Field>

          <Field label="Dispatch Quantity">
            <input
              type="number"
              name="quantityKg"
              value={form.quantityKg}
              onChange={onChange}
              max={selectedInventory?.availableKg || ""}
              style={inputStyle}
              required
            />
          </Field>

          <Field label="Dispatch Code">
            <input
              readOnly
              value={form.dispatchId || "Auto-generated on save"}
              style={readonlyStyle}
            />
          </Field>
        </FormSection>
        <FormSection title="Customer & Logistics">
          <Field label="Customer">
            <FactoryDropdown
              masterType="customer"
              name="customerName"
              value={form.customerName}
              onChange={onChange}
              placeholder="Select Customer"
              style={inputStyle}
              allowAddNew
              providedItems={customerRows}
            />
          </Field>

          <Field label="Customer Unit / Destination">
            <select
              name="customerUnit"
              value={form.customerUnit}
              onChange={onChange}
              style={inputStyle}
            >
              <option value="">Select Unit</option>
              {customerUnitOptions.map((unit) => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                window.location.href = "/factory-masters?master=customerUnit";
              }}
              style={smallLinkButton}
            >
              Manage Units
            </button>
          </Field>

          <Field label="Invoice">
            <input
              name="invoiceNo"
              value={form.invoiceNo}
              onChange={onChange}
              style={inputStyle}
            />
          </Field>

          <Field label="Vehicle">
            <input
              name="vehicleNo"
              value={form.vehicleNo}
              onChange={onChange}
              style={inputStyle}
            />
          </Field>

          <Field label="Driver">
            <input
              name="driverName"
              value={form.driverName}
              onChange={onChange}
              style={inputStyle}
            />
          </Field>

          <Field label="Dispatch Location">
            <input
              name="dispatchLocation"
              value={form.dispatchLocation}
              onChange={onChange}
              placeholder="Dispatch location"
              style={inputStyle}
            />
          </Field>

          <Field label="Status">
            <select
              name="dispatchStatus"
              value={form.dispatchStatus}
              onChange={onChange}
              style={inputStyle}
            >
              <option>DISPATCHED</option>
              <option>IN_TRANSIT</option>
              <option>DELIVERED</option>
            </select>
          </Field>
        </FormSection>

        <FormSection title="Dispatch Summary">
          <Field label="Available Stock">
            <input
              readOnly
              value={fgAvailabilityLoading ? "Loading..." : fgAvailabilityError ? "Unavailable" : `${availableStockKg.toFixed(2)} Kg`}
              style={readonlyStyle}
            />
          </Field>

          <Field label="Dispatch Quantity">
            <input readOnly value={operatorDispatchQty.toFixed(2)} style={readonlyStyle} />
          </Field>

          <Field label="Total Value">
            <input
              readOnly
              value={formatRs(currentSalesValue)}
              style={readonlyStyle}
            />
          </Field>

          <Field label="Customer">
            <input readOnly value={form.customerName || ""} style={readonlyStyle} />
          </Field>

          <Field label="Unit">
            <input readOnly value={form.customerUnit || ""} style={readonlyStyle} />
          </Field>

          <Field label="Remaining After Dispatch">
            <input
              readOnly
              value={`${remainingAfterDispatchKg.toFixed(2)} Kg`}
              style={readonlyStyle}
            />
          </Field>

          <Field label="Truck Capacity Kg (optional)">
            <input
              type="number"
              name="truckCapacityKg"
              value={form.truckCapacityKg}
              onChange={onChange}
              placeholder="Enter only if known"
              style={inputStyle}
            />
          </Field>

          {truckCapacityKg > 0 && (
            <Field label="Truck Fill %">
              <input readOnly value={`${truckFillPercent}%`} style={readonlyStyle} />
            </Field>
          )}

          <Field label="Rate / Kg">
            <input
              name="ratePerKg"
              value={form.ratePerKg}
              readOnly
              style={readonlyStyle}
            />
            <div style={hintText}>
              {form.rateSource || "Loaded from FG Rates. Add rate before dispatch if blank."}
            </div>
          </Field>

          <Field label="Sales Value">
            <input
              readOnly
              value={formatRs(currentSalesValue)}
              style={readonlyStyle}
            />
          </Field>

          <Field label="No Of Bags">
            <input
              name="noOfBags"
              value={form.noOfBags}
              onChange={onChange}
              style={inputStyle}
            />
          </Field>

          <Field label="Internal Allocation">
            <textarea
              readOnly
              value={
                form.material
                  ? "Dispatch will consume normalized FG grade inventory from the ledger."
                  : "Select FG grade to allocate inventory."
              }
              style={textareaStyle}
            />
          </Field>
        </FormSection>

        <FormSection title="Remarks" defaultOpen={false}>
          <Field label="Remarks">
            <textarea
              name="remarks"
              value={form.remarks}
              onChange={onChange}
              style={textareaStyle}
            />
          </Field>
        </FormSection>

        <div style={stickyBar}>
          <button type="button" onClick={clearForm} disabled={saving} style={saving ? disabledButton : clearButton}>
            Clear / New Dispatch
          </button>

          <button type="submit" disabled={saving} style={saving ? disabledButton : saveButton}>
            {saving ? "Saving dispatch..." : "Save Dispatch"}
          </button>
        </div>

        <div style={saveDebugBox}>
          <b>Save Check</b>
          <div>Grade: {saveDebug?.grade || normalizeFgGrade(form.material || form.grade) || "-"}</div>
          <div>Quantity: {Number(saveDebug?.quantityKg ?? operatorDispatchQty ?? 0).toFixed(2)} Kg</div>
          <div>Rate: Rs. {Number(saveDebug?.ratePerKg ?? rateForGrade(form.material) ?? 0).toLocaleString("en-IN")}</div>
          <div>Value: {formatRs(saveDebug?.value ?? currentSalesValue)}</div>
          {saveDebug?.dispatchId && <div>Dispatch ID: {saveDebug.dispatchId}</div>}
        </div>
      </form>

      {historyLoading && <div style={loadingPanel}>Loading dispatch history...</div>}
      {!historyLoading && historyError && (
        <div style={errorStyle}>
          <div>{historyError}</div>
          <button type="button" onClick={loadHistory} style={secondaryButton}>Retry</button>
        </div>
      )}
      {!historyLoading && !historyError && rows.length === 0 && (
        <div style={emptyPanel}>No dispatch records found for the selected period.</div>
      )}

      <DataTable
        title="Dispatch History"
        rows={rows}
        searchFields={[
          "dispatchId",
          "customerName",
          "customerUnit",
          "grade",
          "invoiceNo",
          "vehicleNo",
        ]}
        columns={[
          {
            key: "date",
            label: "Entry Date",
            render: (r) => formatDate(r.date),
            renderExport: (r) => formatDate(r.date),
          },
          { key: "dispatchId", label: "Dispatch" },
          { key: "customerName", label: "Customer" },
          { key: "customerUnit", label: "Unit" },
          { key: "grade", label: "Material" },
          { key: "quantityKg", label: "Qty Kg" },
          { key: "ratePerKg", label: "Rate" },
          { key: "dispatchValue", label: "Value" },
          { key: "dispatchStatus", label: "Status" },
        ]}
        hideFilters
        onEdit={editRow}
        onDelete={requestDelete}
      />
      <div style={paginationBar}>
        <span>{showingRange(historyPagination)}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" disabled={historyLoading || page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} style={secondaryButton}>Previous</button>
          <button type="button" disabled={historyLoading || page >= Number(historyPagination.totalPages || 1)} onClick={() => setPage((value) => value + 1)} style={secondaryButton}>Next</button>
        </div>
      </div>

      {editRecord && (
        <div style={modalOverlay}>
          <div style={modalCard}>
            <h2 style={{ marginTop: 0 }}>Edit Dispatch</h2>
            {editLoading && <div style={statusStyle}>Loading dispatch...</div>}
            {editError && <div style={errorStyle}>{editError}</div>}
            {editForm && !editLoading && (
              <div style={modalGrid}>
                <Field label="Dispatch Date"><input type="date" name="date" value={editForm.date || ""} onChange={onEditChange} style={inputStyle} /></Field>
                <Field label="Customer">
                  <select name="customerName" value={editForm.customerName || ""} onChange={onEditChange} style={inputStyle}>
                    <option value="">Select Customer</option>
                    {customerRows.map((item) => {
                      const name = item.customerName || item.name || "";
                      return name ? <option key={item.customerId || name} value={name}>{name}</option> : null;
                    })}
                  </select>
                </Field>
                <Field label="Customer Unit">
                  <select name="customerUnit" value={editForm.customerUnit || ""} onChange={onEditChange} style={inputStyle}>
                    <option value="">Select Unit</option>
                    {editUnitOptions.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                  </select>
                </Field>
                <Field label="Vehicle No"><input name="vehicleNo" value={editForm.vehicleNo || ""} onChange={onEditChange} style={inputStyle} /></Field>
                <Field label="FG Grade">
                  <select name="material" value={editForm.material || ""} onChange={onEditChange} style={inputStyle}>
                    <option value="">Select Grade</option>
                    {fgGrades.map((grade) => <option key={grade} value={grade}>{grade}</option>)}
                  </select>
                </Field>
                <Field label="Quantity Kg"><input type="number" min="0" name="quantityKg" value={editForm.quantityKg || ""} onChange={onEditChange} style={inputStyle} /></Field>
                <Field label="Rate / Kg"><input readOnly value={editForm.ratePerKg || ""} style={readonlyStyle} /></Field>
                <Field label="Value"><input readOnly value={formatRs(Number(editForm.quantityKg || 0) * Number(editForm.ratePerKg || 0))} style={readonlyStyle} /></Field>
                <Field label="Status">
                  <select name="dispatchStatus" value={editForm.dispatchStatus || "DISPATCHED"} onChange={onEditChange} style={inputStyle}>
                    <option>DISPATCHED</option><option>IN_TRANSIT</option><option>DELIVERED</option>
                  </select>
                </Field>
                <Field label="Remarks"><textarea name="remarks" value={editForm.remarks || ""} onChange={onEditChange} style={textareaStyle} /></Field>
              </div>
            )}
            <div style={modalActions}>
              <button type="button" disabled={editSaving} onClick={() => { setEditRecord(null); setEditForm(null); }} style={secondaryButton}>Cancel</button>
              <button type="button" disabled={editLoading || editSaving || !editForm} onClick={saveDispatchEdit} style={saveButton}>{editSaving ? "Saving changes..." : "Save Changes"}</button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div style={modalOverlay}>
          <div style={confirmCard}>
            <h2 style={{ marginTop: 0 }}>Delete Dispatch</h2>
            <p>Delete this dispatch? FG inventory will be restored by voiding its ledger movement.</p>
            <div><b>{deleteTarget.dispatchId}</b></div>
            {deleteError && <div style={errorStyle}>{deleteError}</div>}
            <div style={modalActions}>
              <button type="button" disabled={deleteSaving} onClick={() => setDeleteTarget(null)} style={secondaryButton}>Cancel</button>
              <button type="button" disabled={deleteSaving} onClick={confirmDelete} style={deleteButton}>{deleteSaving ? "Deleting..." : "Delete Dispatch"}</button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={fieldLabel}>{label}</div>
      {children}
    </div>
  );
}

function normalizeFgGrade(value) {
  return materialKey(normalizeInventoryMaterial(value));
}

const stockNote = {
  background: "#ecfdf5",
  border: "1px solid #bbf7d0",
  color: "#166534",
  borderRadius: 10,
  padding: "10px 12px",
  marginBottom: 16,
  fontWeight: 700,
  fontSize: 13,
};

const sectionCard = {
  background: "white",
  padding: 18,
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  marginBottom: 16,
};

const sectionTitle = {
  fontWeight: 700,
  marginBottom: 16,
  color: "#005d34",
};

const fieldLabel = {
  fontSize: 12,
  fontWeight: 600,
  marginBottom: 4,
  color: "#334155",
};

const hintText = {
  marginTop: 4,
  color: "#64748b",
  fontSize: 12,
};

const fgStockGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
  gap: 12,
};

const fgStockCard = {
  textAlign: "left",
  border: "2px solid #e5e7eb",
  borderRadius: 12,
  padding: 14,
  cursor: "pointer",
};

const fgGradeTitle = {
  color: "#64748b",
  fontSize: 12,
  fontWeight: 700,
};

const fgGradeQty = {
  marginTop: 8,
  color: "#005d34",
  fontSize: 20,
  fontWeight: 850,
};

const inputStyle = {
  width: "100%",
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ccc",
  boxSizing: "border-box",
};

const readonlyStyle = {
  ...inputStyle,
  background: "#f8fafc",
  fontWeight: 700,
};

const textareaStyle = {
  ...inputStyle,
  height: 80,
};

const saveButton = {
  background: "#0f766e",
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
};

const disabledButton = {
  ...saveButton,
  background: "#94a3b8",
  cursor: "not-allowed",
};

const clearButton = {
  background: "#64748b",
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
};

const smallLinkButton = {
  marginTop: 6,
  background: "transparent",
  color: "#0f766e",
  border: "none",
  padding: 0,
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 12,
};

const stickyBar = {
  position: "sticky",
  bottom: 0,
  background: "white",
  padding: 12,
  borderTop: "1px solid #ddd",
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  zIndex: 10,
};

const saveDebugBox = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 10,
  padding: 12,
  color: "#334155",
  fontSize: 13,
  lineHeight: 1.7,
};

const statusStyle = {
  marginTop: 12,
  marginBottom: 16,
  fontWeight: 600,
  color: "#0f766e",
};

const historyFilters = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
  gap: 12,
};

const paginationBar = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  margin: "12px 0 20px",
  fontSize: 13,
  fontWeight: 700,
};

const secondaryButton = {
  background: "#f8fafc",
  color: "#334155",
  border: "1px solid #cbd5e1",
  padding: "9px 14px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
};

const deleteButton = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "10px 16px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
};

const modalOverlay = {
  position: "fixed",
  inset: 0,
  zIndex: 10000,
  background: "rgba(15,23,42,0.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
};

const modalCard = {
  width: "min(900px,96vw)",
  maxHeight: "90vh",
  overflowY: "auto",
  background: "white",
  borderRadius: 14,
  padding: 22,
};

const confirmCard = { ...modalCard, width: "min(520px,96vw)" };
const modalGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 };
const modalActions = { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 };
const errorStyle = { ...statusStyle, color: "#991b1b", background: "#fef2f2", border: "1px solid #fecaca", padding: 10, borderRadius: 8 };
const loadingPanel = { padding: 16, color: "#475569", background: "#f8fafc", borderRadius: 10, fontWeight: 700 };
const emptyPanel = { padding: 16, color: "#64748b", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10 };
