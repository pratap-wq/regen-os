import { useEffect, useMemo, useState } from "react";
import {
  addInventoryAdjustment,
  approveInventoryAdjustment,
  getInventoryAdjustmentSummary,
  listAdjustmentMasters,
  listInventoryAdjustments,
  rejectInventoryAdjustment,
} from "../services/inventoryAdjustmentService";

const MODULES = ["RM", "Wash", "Color Sorter", "Extrusion", "FG", "Dispatch", "Stores", "Waste"];
const ITEM_TYPES = ["RM", "WASHED", "SORTED", "FG", "STORE", "WASTE", "REWORK"];

const ADJUSTMENT_TYPES = [
  "Shortage",
  "Excess",
  "Physical Count",
  "Production Correction",
  "Dispatch Correction",
  "Material Correction",
  "Waste Correction",
  "Reclassification",
  "Opening Balance Correction",
  "Closing Balance Correction",
];

const REASONS = [
  "Physical stock mismatch",
  "Entry correction",
  "Weighment difference",
  "Production loss correction",
  "Dispatch correction",
  "Waste correction",
  "Grade reclassification",
  "Opening balance correction",
  "Closing balance correction",
  "Other",
];

const FALLBACK_ITEMS = {
  RM: ["RM"],
  WASHED: ["Washed Flakes"],
  SORTED: ["Sorted White", "Sorted Commodity", "All Mix Sorted"],
  FG: ["E1", "E2", "E3", "E4", "E5"],
  STORE: ["Consumables", "Spares", "Packing Material"],
  WASTE: ["Raffia", "Wrappers", "Sink Material", "Iron Scrap", "Sludge", "Lumps", "Purging", "Mesh Reject"],
  REWORK: ["Lumps", "Purging", "Rework Granules"],
};

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function num(value) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
}

function fmt(value) {
  return num(value).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function areaLabel(value) {
  const labels = { RM: "Material", FG: "Dispatch Material" };
  return labels[value] || value;
}

function materialTypeLabel(value) {
  const labels = {
    RM: "Material",
    WASHED: "Washed Material",
    SORTED: "Sorted Material",
    FG: "Dispatch Material",
    STORE: "Stores Item",
    WASTE: "Waste Material",
    REWORK: "Rework Material",
  };
  return labels[value] || value;
}

function materialLabel(value) {
  return value === "RM" ? "Material" : value;
}

export default function InventoryAdjustments() {
  const [periodMonth, setPeriodMonth] = useState(getCurrentMonth());
  const [moduleFilter, setModuleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [masters, setMasters] = useState({ grades: [], materials: [] });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    periodMonth: getCurrentMonth(),
    date: getToday(),
    module: "FG",
    itemType: "FG",
    itemCode: "E1",
    adjustmentType: "Physical Count",
    quantityKg: "",
    value: "",
    reason: "Physical stock mismatch",
    remarks: "",
    sourceRef: "",
    createdBy: "System",
  });

  const itemOptions = useMemo(() => {
    if (form.itemType === "FG") {
      const grades = masters.grades
        .map((x) => x.grade || x.name || x.gradeName || x.materialName)
        .filter(Boolean);

      return grades.length ? grades : FALLBACK_ITEMS.FG;
    }

    const materialOptions = masters.materials
      .filter((x) => {
        const type = String(x.materialType || "").toUpperCase();
        if (form.itemType === "RM") return type === "RM";
        if (form.itemType === "WASHED") return type === "WASHED";
        if (form.itemType === "SORTED") return type === "SORTED";
        if (form.itemType === "REWORK") return type === "REWORK";
        if (form.itemType === "WASTE") return type === "WASTE";
        return true;
      })
      .map((x) => x.materialName || x.itemName || x.name)
      .filter(Boolean);

    return materialOptions.length ? materialOptions : FALLBACK_ITEMS[form.itemType] || [];
  }, [form.itemType, masters]);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, r) => {
        acc.qty += num(r.quantityKg);
        acc.value += num(r.value);
        if (String(r.status || "").toUpperCase() === "APPROVED") {
          acc.approvedQty += num(r.quantityKg);
          acc.approvedValue += num(r.value);
        }
        return acc;
      },
      { qty: 0, value: 0, approvedQty: 0, approvedValue: 0 }
    );
  }, [rows]);

  async function loadMasters() {
    const res = await listAdjustmentMasters();
    setMasters(res);
  }

  async function loadData() {
    setMessage("Loading...");
    const filters = { periodMonth };
    if (moduleFilter) filters.module = moduleFilter;
    if (statusFilter) filters.status = statusFilter;

    const [listRes, summaryRes] = await Promise.all([
      listInventoryAdjustments(filters),
      getInventoryAdjustmentSummary(periodMonth),
    ]);

    if (!listRes?.ok) {
      setMessage(listRes?.error || "Failed to load variance resolutions");
      return;
    }

    setRows(listRes.rows || []);
    setSummary(summaryRes?.ok ? summaryRes : null);
    setMessage("");
  }

  useEffect(() => {
    loadMasters();
  }, []);

  useEffect(() => {
    loadData();
  }, [periodMonth, moduleFilter, statusFilter]);

  useEffect(() => {
    if (!itemOptions.includes(form.itemCode)) {
      setForm((prev) => ({ ...prev, itemCode: itemOptions[0] || "" }));
    }
  }, [itemOptions]);

  function updateForm(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetForm() {
    setForm({
      periodMonth,
      date: getToday(),
      module: "FG",
      itemType: "FG",
      itemCode: "E1",
      adjustmentType: "Physical Count",
      quantityKg: "",
      value: "",
      reason: "Physical stock mismatch",
      remarks: "",
      sourceRef: "",
      createdBy: "System",
    });
  }

  async function saveAdjustment(nextStatus) {
    if (!form.itemCode) return setMessage("Select material");
    if (num(form.quantityKg) === 0) return setMessage("Quantity cannot be zero");

    setSaving(true);
    setMessage("Saving...");

    const res = await addInventoryAdjustment({ ...form, status: nextStatus });

    setSaving(false);

    if (!res?.ok) {
      setMessage(res?.error || "Failed to save variance resolution");
      return;
    }

    resetForm();
    setMessage("Variance resolution saved");
    loadData();
  }

  async function handleApprove(id) {
    const res = await approveInventoryAdjustment(id, "System");
    if (!res?.ok) return setMessage(res?.error || "Approval failed");
    setMessage("Variance resolution approved");
    loadData();
  }

  async function handleReject(id) {
    const res = await rejectInventoryAdjustment(id, "System", "Rejected from Resolve Variance");
    if (!res?.ok) return setMessage(res?.error || "Reject failed");
    setMessage("Variance resolution rejected");
    loadData();
  }

  return (
    <div style={page}>
      <div style={header}>
        <div>
          <h1 style={title}>Resolve Variance</h1>
          <p style={subtitle}>
            Controlled corrections for differences found during month-end review.
          </p>
        </div>
      </div>

      <div style={card}>
        <div style={grid4}>
          <Field label="Period Month">
            <input style={input} type="month" value={periodMonth} onChange={(e) => {
              setPeriodMonth(e.target.value);
              updateForm("periodMonth", e.target.value);
            }} />
          </Field>

          <Field label="Module">
            <select style={input} value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)}>
              <option value="">All Modules</option>
              {MODULES.map((x) => <option key={x} value={x}>{areaLabel(x)}</option>)}
            </select>
          </Field>

          <Field label="Status">
            <select style={input} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </Field>

          <Field label="Action">
            <button style={primaryBtn} onClick={loadData}>Refresh</button>
          </Field>
        </div>
      </div>

      <div style={grid4}>
        <Metric label="Total Resolutions" value={rows.length} />
        <Metric label="Net Qty" value={`${fmt(totals.qty)} Kg`} />
        <Metric label="Approved Qty" value={`${fmt(totals.approvedQty)} Kg`} />
        <Metric label="Approved Value" value={`₹${fmt(totals.approvedValue)}`} />
      </div>

      <div style={card}>
        <h2 style={sectionTitle}>Add Variance Resolution</h2>

        <div style={grid4}>
          <Field label="Period Month">
            <input style={input} type="month" value={form.periodMonth} onChange={(e) => updateForm("periodMonth", e.target.value)} />
          </Field>

          <Field label="Date">
            <input style={input} type="date" value={form.date} onChange={(e) => updateForm("date", e.target.value)} />
          </Field>

          <Field label="Module">
            <select style={input} value={form.module} onChange={(e) => updateForm("module", e.target.value)}>
              {MODULES.map((x) => <option key={x} value={x}>{areaLabel(x)}</option>)}
            </select>
          </Field>

          <Field label="Material Type">
            <select style={input} value={form.itemType} onChange={(e) => updateForm("itemType", e.target.value)}>
              {ITEM_TYPES.map((x) => <option key={x} value={x}>{materialTypeLabel(x)}</option>)}
            </select>
          </Field>

          <Field label="Material">
            <select style={input} value={form.itemCode} onChange={(e) => updateForm("itemCode", e.target.value)}>
              {itemOptions.map((x) => <option key={x} value={x}>{materialLabel(x)}</option>)}
            </select>
          </Field>

          <Field label="Resolution Type">
            <select style={input} value={form.adjustmentType} onChange={(e) => updateForm("adjustmentType", e.target.value)}>
              {ADJUSTMENT_TYPES.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </Field>

          <Field label="Quantity Kg (+ / -)">
            <input style={input} type="number" value={form.quantityKg} onChange={(e) => updateForm("quantityKg", e.target.value)} />
          </Field>

          <Field label="Value ₹">
            <input style={input} type="number" value={form.value} onChange={(e) => updateForm("value", e.target.value)} />
          </Field>

          <Field label="Reason">
            <select style={input} value={form.reason} onChange={(e) => updateForm("reason", e.target.value)}>
              {REASONS.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </Field>

          <Field label="Source Reference">
            <input style={input} value={form.sourceRef} onChange={(e) => updateForm("sourceRef", e.target.value)} />
          </Field>

          <div style={{ gridColumn: "span 2" }}>
            <Field label="Remarks">
              <input style={input} value={form.remarks} onChange={(e) => updateForm("remarks", e.target.value)} />
            </Field>
          </div>
        </div>

        <div style={buttonRow}>
          <button style={primaryBtn} disabled={saving} onClick={() => saveAdjustment("DRAFT")}>Save Draft</button>
          <button style={greenBtn} disabled={saving} onClick={() => saveAdjustment("SUBMITTED")}>Submit for Approval</button>
          <button style={secondaryBtn} onClick={resetForm}>Clear</button>
        </div>
      </div>

      <div style={card}>
        <h2 style={sectionTitle}>Resolution Register</h2>
        {message && <div style={statusBox}>{message}</div>}

        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                {["ID", "Date", "Month", "Area", "Material", "Type", "Qty Kg", "Value", "Reason", "Status", "Approved By", "Actions"].map((h) => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td style={td} colSpan="12">No variance resolutions found.</td></tr>
              ) : rows.map((r) => {
                const s = String(r.status || "").toUpperCase();
                const canAct = ["DRAFT", "SUBMITTED", "PENDING"].includes(s);

                return (
                  <tr key={r.adjustmentId}>
                    <td style={td}>{r.adjustmentId}</td>
                    <td style={td}>{r.date}</td>
                    <td style={td}>{r.periodMonth}</td>
                    <td style={td}>{areaLabel(r.module)}</td>
                    <td style={td}>{materialTypeLabel(r.itemType)} / {materialLabel(r.itemCode)}</td>
                    <td style={td}>{r.adjustmentType}</td>
                    <td style={td}>{fmt(r.quantityKg)}</td>
                    <td style={td}>₹{fmt(r.value)}</td>
                    <td style={td}>{r.reason}</td>
                    <td style={td}><b>{r.status}</b></td>
                    <td style={td}>{r.approvedBy || "-"}</td>
                    <td style={td}>
                      {canAct ? (
                        <div style={smallBtnRow}>
                          <button style={miniGreenBtn} onClick={() => handleApprove(r.adjustmentId)}>Approve</button>
                          <button style={miniRedBtn} onClick={() => handleReject(r.adjustmentId)}>Reject</button>
                        </div>
                      ) : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {summary && (
          <div style={summaryText}>
            Pending: <b>{summary.pendingCount || 0}</b> | Approved: <b>{summary.approvedCount || 0}</b>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={field}>
      <span style={labelStyle}>{label}</span>
      {children}
    </label>
  );
}

function Metric({ label, value }) {
  return (
    <div style={metricCard}>
      <div style={metricLabel}>{label}</div>
      <div style={metricValue}>{value}</div>
    </div>
  );
}

const page = { display: "flex", flexDirection: "column", gap: 16 };
const header = { display: "flex", justifyContent: "space-between", alignItems: "center" };
const title = { margin: 0, fontSize: 28, color: "#0f172a", fontWeight: 900 };
const subtitle = { margin: "6px 0 0", color: "#64748b", fontSize: 14 };
const card = { background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 18, boxShadow: "0 8px 22px rgba(15,23,42,0.04)" };
const grid4 = { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14 };
const field = { display: "flex", flexDirection: "column", gap: 6 };
const labelStyle = { fontSize: 12, color: "#475569", fontWeight: 800 };
const input = { height: 40, border: "1px solid #cbd5e1", borderRadius: 9, padding: "0 10px", fontSize: 14, background: "white", boxSizing: "border-box", width: "100%" };
const sectionTitle = { margin: "0 0 14px", fontSize: 18, color: "#0f172a", fontWeight: 900 };
const buttonRow = { display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" };
const primaryBtn = { background: "#0f766e", color: "white", border: "none", borderRadius: 9, padding: "10px 14px", fontWeight: 800, cursor: "pointer" };
const greenBtn = { ...primaryBtn, background: "#15803d" };
const secondaryBtn = { ...primaryBtn, background: "#64748b" };
const metricCard = { ...card, padding: 16 };
const metricLabel = { color: "#64748b", fontSize: 12, fontWeight: 800 };
const metricValue = { marginTop: 8, color: "#0f172a", fontSize: 22, fontWeight: 900 };
const statusBox = { background: "#ecfdf5", border: "1px solid #bbf7d0", color: "#166534", padding: 10, borderRadius: 10, marginBottom: 12, fontWeight: 700 };
const tableWrap = { overflowX: "auto", border: "1px solid #e5e7eb", borderRadius: 12 };
const table = { width: "100%", borderCollapse: "collapse", fontSize: 13 };
const th = { background: "#f8fafc", color: "#334155", textAlign: "left", padding: "10px 12px", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap" };
const td = { padding: "10px 12px", borderBottom: "1px solid #e5e7eb", color: "#334155", verticalAlign: "top", whiteSpace: "nowrap" };
const smallBtnRow = { display: "flex", gap: 6 };
const miniGreenBtn = { background: "#15803d", color: "white", border: "none", borderRadius: 7, padding: "6px 8px", fontWeight: 800, cursor: "pointer", fontSize: 12 };
const miniRedBtn = { ...miniGreenBtn, background: "#dc2626" };
const summaryText = { marginTop: 12, color: "#475569", fontSize: 13 };
