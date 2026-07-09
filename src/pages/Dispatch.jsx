import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";
import { formatDate } from "../utils/date";

import DataTable from "../components/DataTable";
import FormSection from "../components/FormSection";
import FactoryDropdown from "../components/FactoryDropdown";
import ProductionMaterialSelect from "../components/ProductionMaterialSelect";
import { KpiCard, PageLayout } from "../components/factoryDesignSystem";
import {
  materialInventoryFromLedgerBalances,
  normalizeInventoryMaterial,
} from "../services/inventoryEngine";
import { materialKey } from "../utils/materialInventory";

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
  const [extrusionRows, setExtrusionRows] = useState([]);
  const [ledgerBalanceRows, setLedgerBalanceRows] = useState([]);
  const [customerRows, setCustomerRows] = useState([]);
  const [customerUnitRows, setCustomerUnitRows] = useState([]);
  const [fgRateRows, setFgRateRows] = useState([]);
  const [materialRows, setMaterialRows] = useState([]);
  const [status, setStatus] = useState("");
  const [editingRow, setEditingRow] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [dispatchLines, setDispatchLines] = useState([{ ...blankLine }]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [dispatch, extrusion, ledgerBalance, customers, customerUnits, fgRates, materials] = await Promise.all([
        apiCall({ fn: "dispatch.list" }),
        apiCall({ fn: "extrusion.list" }),
        apiCall({ fn: "inventoryLedger.balance" }),
        apiCall({ fn: "factoryMaster.list", masterType: "customer" }),
        apiCall({ fn: "factoryMaster.list", masterType: "customerUnit" }),
        apiCall({ fn: "fgRates.list" }),
        apiCall({ fn: "materialMaster.list" }),
      ]);

      setRows(dispatch.rows || []);
      setExtrusionRows(extrusion.rows || []);
      setLedgerBalanceRows(ledgerBalance.rows || []);
      setCustomerRows(customers.rows || []);
      setCustomerUnitRows(customerUnits.rows || []);
      setFgRateRows(fgRates.rows || []);
      setMaterialRows(materials.rows || []);
    } catch (err) {
      console.log(err);
      setStatus(err.message);
    }
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

  function makeDispatchId(productionDate, shift) {
    const baseDate = productionDate || today;
    const datePart = String(baseDate).replaceAll("-", "");
    const shiftPart = String(shift || "NA").toUpperCase();

    return `DISP-${datePart}-${shiftPart}`;
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

  function getDispatchedQtyForBatch(batchId, currentDispatchId = "") {
    let total = 0;

    rows
      .filter(
        (r) =>
          String(r.dispatchStatus || "").toUpperCase() !== "DELETED" &&
          String(r.status || "").toUpperCase() !== "DELETED"
      )
      .filter(
        (r) => String(r.dispatchId || "") !== String(currentDispatchId || "")
      )
      .forEach((r) => {
        const lines = parseLines(r);

        lines.forEach((line) => {
          if (
            String(line.sourceExtrusionBatchId || "") === String(batchId || "")
          ) {
            total += Number(line.dispatchQtyKg || 0);
          }
        });
      });

    return total;
  }

  function getAvailableFG(batchId, currentDispatchId = editingRow?.dispatchId || "") {
    const fg = extrusionRows.find(
      (x) => String(x.extrusionBatchId) === String(batchId)
    );

    if (!fg) return 0;

    const produced = Number(fg.fgOutputKg || 0);
    const dispatched = getDispatchedQtyForBatch(batchId, currentDispatchId);

    return Math.max(produced - dispatched, 0);
  }

  function extrusionDate(row) {
    return dateForInput(row.date || row.productionDate || row.createdAt || "");
  }

  function extrusionShift(row) {
    return String(row.shift || row.productionShift || "").toUpperCase();
  }

  const allLiveLots = useMemo(() => {
    return extrusionRows
      .map((x) => ({
        ...x,
        productionDate: extrusionDate(x),
        productionShift: extrusionShift(x),
        available: getAvailableFG(x.extrusionBatchId),
      }))
      .filter((x) => Number(x.available || 0) > 0)
      .sort((a, b) =>
        String(a.extrusionBatchId || "").localeCompare(
          String(b.extrusionBatchId || "")
        )
      );
  }, [extrusionRows, rows, editingRow]);

  const materialInventory = useMemo(() => {
    const ledgerFg = materialInventoryFromLedgerBalances(ledgerBalanceRows, {
      itemType: "FG",
    });

    if (ledgerFg.length > 0) {
      return ledgerFg;
    }

    const map = {};

    allLiveLots.forEach((lot) => {
      const material = normalizeFgGrade(lot.productionGrade || lot.grade);
      if (!material) return;

      if (!map[material]) {
        map[material] = {
          material,
          availableKg: 0,
          lots: 0,
          source: "Legacy extrusion lots",
        };
      }

      map[material].availableKg += Number(lot.available || 0);
      map[material].lots += 1;
    });

    return Object.values(map).sort((a, b) =>
      String(a.material).localeCompare(String(b.material), undefined, {
        numeric: true,
      })
    );
  }, [ledgerBalanceRows, allLiveLots]);

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
    return fgGrades.map((grade) => {
      const row = materialInventory.find((x) => normalizeFgGrade(x.material) === grade);
      return {
        grade,
        availableKg: Number(row?.availableKg || 0),
        source: row?.source || "Inventory Ledger",
        selected: normalizeFgGrade(form.material || form.grade || "") === grade,
      };
    });
  }, [materialInventory, form.material, form.grade]);

  const totalFgAvailableKg = fgStockRows.reduce((sum, row) => sum + Number(row.availableKg || 0), 0);

  function getLineTotal(lines = dispatchLines) {
    return lines.reduce((s, r) => s + Number(r.dispatchQtyKg || 0), 0);
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

  function autoCalculate(updated, lines = dispatchLines) {
    const totalQty = getLineTotal(lines);

    const cleanLines = lines.map((x) => ({
      ...x,
      grade: normalizeFgGrade(x.grade || x.material || updated.material || updated.grade),
      material: normalizeFgGrade(x.material || x.grade || updated.material || updated.grade),
      itemType: "FG",
      availableKg: Number(x.availableKg || 0),
      dispatchQtyKg: Number(x.dispatchQtyKg || 0),
    }));

    updated.dispatchId =
      updated.dispatchId ||
      makeDispatchId(updated.productionDate, updated.productionShift);

    updated.quantityKg = totalQty.toFixed(2);
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

  function rateForGrade(material) {
    const grade = normalizeFgGrade(material);
    const rateRow = lookupFgRate(grade, form.customerName, form.date);
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
      updated.dispatchLines = JSON.stringify([]);
    } else {
      updated = autoCalculate(updated, dispatchLines);
    }

    if (["material", "customerName", "date"].includes(e.target.name)) {
      updated = applyAutoRate(updated);
    }

    setForm(updated);
  }

  const customerUnitOptions = useMemo(() => {
    const selectedCustomer = String(form.customerName || "").trim().toUpperCase();
    const unitValues = customerUnitRows
      .filter((row) => !["DISABLED", "INACTIVE", "DELETED", "ARCHIVED", "MERGED"].includes(String(row.status || "ACTIVE").toUpperCase()))
      .filter((row) => !selectedCustomer || String(row.customerName || row.customer || "").trim().toUpperCase() === selectedCustomer)
      .map((row) => row.unitName || row.name || row.customerUnit || "");
    const legacyValues = customerRows
      .filter((row) => !selectedCustomer || String(row.customerName || row.name || "").trim().toUpperCase() === selectedCustomer)
      .map((row) => row.customerUnit || row.unit || "");
    const values = [...unitValues, ...legacyValues]
      .filter(Boolean);
    return [...new Set(values)].sort();
  }, [customerRows, customerUnitRows, form.customerName]);

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
        dispatchQtyKg: Number(quantityKg || 0),
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

    try {
      if (!form.material) {
        setStatus("Select material.");
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
          dispatchId:
            form.dispatchId ||
            makeDispatchId(form.date, form.productionShift),
        },
        cleanLines
      );

      let res;

      if (editingRow?.dispatchId) {
        res = await apiCall({
          fn: "dispatch.update",
          ...finalForm,
          dispatchId: editingRow.dispatchId,
        });
      } else {
        res = await apiCall({
          fn: "dispatch.add",
          ...finalForm,
        });
      }

      if (res.ok === false) {
        setStatus(res.error || "Error saving dispatch");
        return;
      }

      setStatus(editingRow?.dispatchId ? "Dispatch updated" : "Dispatch saved");
      setEditingRow(null);
      setForm(blankForm);
      setDispatchLines([{ ...blankLine }]);
      loadData();
    } catch (err) {
      setStatus(err.message);
    }
  }

  function editRow(row) {
    const parsed = parseLines(row);

    const productionDate =
      dateForInput(row.productionDate) || dateForInput(row.date) || "";

    const productionShift = row.productionShift || "";

    const normalizedLines = parsed.map((line) => ({
      ...line,
      productionDate: dateForInput(line.productionDate) || productionDate || "",
      productionShift: line.productionShift || productionShift || "",
    }));
    const material = normalizeFgGrade(row.material || row.grade || normalizedLines[0]?.grade || "");

    setEditingRow(row);
    setDispatchLines(normalizedLines);

    const updated = autoCalculate(
      {
        ...blankForm,
        ...row,
        date: dateForInput(row.date) || today,
        material,
        grade: material,
        productionDate,
        productionShift,
        dispatchId:
          row.dispatchId || makeDispatchId(productionDate, productionShift),
      },
      normalizedLines
    );

    setForm(updated);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function deleteRow(row) {
    const confirmed = window.confirm("Delete dispatch?");
    if (!confirmed) return;

    try {
      const res = await apiCall({
        fn: "dispatch.update",
        ...row,
        dispatchId: row.dispatchId,
        dispatchStatus: "DELETED",
        status: "DELETED",
      });

      if (res.ok === false) {
        setStatus(res.error || "Delete failed");
        return;
      }

      setStatus("Dispatch deleted");
      loadData();
    } catch (err) {
      setStatus(err.message);
    }
  }

  function clearForm() {
    setEditingRow(null);
    setForm(blankForm);
    setDispatchLines([{ ...blankLine }]);
    setStatus("Ready for new dispatch");
  }

  const activeRows = rows.filter(
    (r) =>
      String(r.dispatchStatus || "").toUpperCase() !== "DELETED" &&
      String(r.status || "").toUpperCase() !== "DELETED"
  );

  const totalDispatch = activeRows.reduce(
    (sum, r) => sum + Number(r.quantityKg || 0),
    0
  );

  const totalSales = activeRows.reduce(
    (sum, r) =>
      sum + Number(r.dispatchValue || Number(r.quantityKg || 0) * Number(r.ratePerKg || 0)),
    0
  );

  const avgRealization =
    totalDispatch > 0 ? (totalSales / totalDispatch).toFixed(2) : "0.00";

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

  const customerSummary = useMemo(() => {
    const map = {};

    activeRows.forEach((r) => {
      const customer = r.customerName || "Unknown";

      if (!map[customer]) {
        map[customer] = {
          customer,
          qty: 0,
          value: 0,
        };
      }

      map[customer].qty += Number(r.quantityKg || 0);
      map[customer].value +=
        Number(r.dispatchValue || Number(r.quantityKg || 0) * Number(r.ratePerKg || 0));
    });

    return Object.values(map)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [activeRows]);

  return (
    <PageLayout
      title="Dispatch Workflow"
      subtitle="Dispatch consumes material inventory. Operators select material and quantity; traceability is allocated internally."
    >

      <div className="factory-kpi-grid">
        <KpiCard title="Dispatch Qty" value={`${totalDispatch.toFixed(0)} Kg`} />
        <KPI title="Sales" value={`₹ ${totalSales.toFixed(0)}`} />
        <KPI title="Avg Realization" value={`₹ ${avgRealization}`} />
        <KpiCard title="FG Available" value={`${totalFgAvailableKg.toFixed(0)} Kg`} tone="neutral" />
        <KpiCard
          title="Selected Available"
          value={`${Number(selectedInventory?.availableKg || 0).toFixed(0)} Kg`}
          tone={selectedInventory ? "positive" : "neutral"}
        />
      </div>

      <div style={stockNote}>
        Available stock as of today
        {selectedInventory?.source ? ` | Source: ${selectedInventory.source}` : ""}
      </div>

      <div style={sectionCard}>
        <div style={sectionTitle}>FG Inventory by Grade</div>
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
        <FormSection title={editingRow ? "Edit Dispatch" : "New Dispatch"}>
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
            />
          </Field>

          <Field label="Available Quantity">
            <input
              readOnly
              value={`${Number(selectedInventory?.availableKg || 0).toFixed(2)} Kg`}
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
              value={form.dispatchId || makeDispatchId(form.date, "")}
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
              value={`${availableStockKg.toFixed(2)} Kg`}
              style={readonlyStyle}
            />
          </Field>

          <Field label="Dispatch Quantity">
            <input readOnly value={operatorDispatchQty.toFixed(2)} style={readonlyStyle} />
          </Field>

          <Field label="Total Value">
            <input
              readOnly
              value={`â‚¹ ${currentSalesValue.toFixed(0)}`}
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
              value={`₹ ${currentSalesValue.toFixed(0)}`}
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
          <button type="button" onClick={clearForm} style={clearButton}>
            Clear / New Dispatch
          </button>

          <button type="submit" style={editingRow ? updateButton : saveButton}>
            {editingRow ? "Update Dispatch" : "Save Dispatch"}
          </button>
        </div>
      </form>

      <div style={sectionCard}>
        <div style={sectionTitle}>Top Customers</div>

        <div style={customerGrid}>
          {customerSummary.map((c, i) => (
            <div key={i} style={customerCard}>
              <div style={{ fontWeight: 700 }}>{c.customer}</div>

              <div
                style={{
                  marginTop: 6,
                  color: "#0f766e",
                  fontWeight: 700,
                }}
              >
                {Number(c.qty).toFixed(0)} Kg
              </div>

              <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>
                ₹ {Number(c.value).toFixed(0)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <DataTable
        title="Dispatch History"
        rows={activeRows}
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
        onEdit={editRow}
        onDelete={deleteRow}
      />
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

function KPI({ title, value }) {
  return (
    <div style={kpiCard}>
      <div style={kpiTitle}>{title}</div>
      <div style={kpiValue}>{value}</div>
    </div>
  );
}

function normalizeFgGrade(value) {
  return materialKey(normalizeInventoryMaterial(value));
}

const pageStyle = { padding: 20 };

const headerCard = {
  background: "white",
  padding: 18,
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  marginBottom: 16,
};

const subText = {
  color: "#64748b",
  marginTop: 4,
  fontSize: 13,
};

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

const kpiGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
  gap: 14,
  marginBottom: 16,
};

const kpiCard = {
  background: "white",
  padding: 16,
  borderRadius: 12,
  border: "1px solid #e5e7eb",
};

const kpiTitle = {
  color: "#64748b",
  fontSize: 12,
  marginBottom: 8,
};

const kpiValue = {
  fontSize: 22,
  fontWeight: 700,
  color: "#005d34",
};

const customerGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
  gap: 12,
};

const customerCard = {
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  padding: 12,
  background: "#f8fafc",
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

const updateButton = {
  ...saveButton,
  background: "#ea580c",
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

const statusStyle = {
  marginTop: 12,
  marginBottom: 16,
  fontWeight: 600,
  color: "#0f766e",
};
