import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";
import DataTable from "../components/DataTable";

const CATEGORIES = ["RM", "WIP", "FG", "REWORK", "WASTE", "ADDITIVE", "STORE"];
const STATUSES = ["ACTIVE", "INACTIVE"];

const blankForm = {
  materialCode: "",
  materialName: "",
  category: "RM",
  appearsInRmInward: "NO",
  appearsInProduction: "NO",
  appearsInDispatch: "NO",
  status: "ACTIVE",
  remarks: "",
};

export default function MaterialMasterAdmin() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRows();
  }, []);

  async function loadRows() {
    try {
      const res = await apiCall({ fn: "materialMaster.list" });
      setRows(res.rows || []);
    } catch (err) {
      setStatus(err.message);
    }
  }

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "materialName" && !prev.materialCode) {
        next.materialCode = normalizeMaterialCode(value);
      }
      if (name === "materialCode") {
        next.materialCode = normalizeMaterialCode(value);
      }
      return next;
    });
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.materialName.trim()) return alert("Material name is required");
    if (!form.materialCode.trim()) return alert("Material code is required");

    try {
      setSaving(true);
      const res = await apiCall({
        fn: "materialMaster.add",
        ...form,
        materialCode: normalizeMaterialCode(form.materialCode),
        createdBy: "Admin",
      });

      if (res.ok === false) {
        alert(res.error || "Save failed");
        return;
      }

      setStatus(res.alreadyExists ? "Material already exists. No duplicate was created." : "Material saved.");
      setForm(blankForm);
      await loadRows();
    } catch (err) {
      setStatus(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(row, nextStatus) {
    const materialName = row.materialName || row.name || row.materialCode;
    const ok = window.confirm(`${nextStatus === "ACTIVE" ? "Activate" : "Mark inactive"} ${materialName}?`);
    if (!ok) return;

    try {
      setSaving(true);
      const res = await apiCall({
        fn: "materialMaster.updateStatus",
        materialId: row.materialId,
        materialCode: row.materialCode,
        status: nextStatus,
        remarks: `${nextStatus} from Material Master Admin`,
        updatedBy: "Admin",
      });

      if (res.ok === false) {
        alert(res.error || "Status update failed");
        return;
      }

      setStatus(`Material marked ${nextStatus}.`);
      await loadRows();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  const activeRows = useMemo(
    () => rows.filter((row) => String(row.status || "ACTIVE").toUpperCase() === "ACTIVE"),
    [rows]
  );

  return (
    <div style={page}>
      <div style={hero}>
        <div>
          <div style={eyebrow}>Masters</div>
          <h1 style={title}>Material Master Admin</h1>
          <div style={subtitle}>
            Add or activate controlled dropdown materials for RM Inward, Production, and Dispatch.
          </div>
        </div>
      </div>

      {status && <div style={statusBox}>{status}</div>}

      <div style={kpiGrid}>
        <KPI title="Total Materials" value={rows.length} />
        <KPI title="Active" value={activeRows.length} />
        <KPI title="Categories" value={new Set(rows.map((row) => row.category).filter(Boolean)).size} />
      </div>

      <form onSubmit={submit} style={formGrid}>
        <Field label="Material Code">
          <input name="materialCode" value={form.materialCode} onChange={onChange} style={input} placeholder="WHITE_BUCKETS" />
        </Field>
        <Field label="Material Name">
          <input name="materialName" value={form.materialName} onChange={onChange} style={input} placeholder="White Buckets" />
        </Field>
        <Field label="Category">
          <select name="category" value={form.category} onChange={onChange} style={input}>
            {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
          </select>
        </Field>
        <Field label="RM Inward Dropdown">
          <YesNo name="appearsInRmInward" value={form.appearsInRmInward} onChange={onChange} />
        </Field>
        <Field label="Production Dropdowns">
          <YesNo name="appearsInProduction" value={form.appearsInProduction} onChange={onChange} />
        </Field>
        <Field label="Dispatch Dropdown">
          <YesNo name="appearsInDispatch" value={form.appearsInDispatch} onChange={onChange} />
        </Field>
        <Field label="Status">
          <select name="status" value={form.status} onChange={onChange} style={input}>
            {STATUSES.map((status) => <option key={status}>{status}</option>)}
          </select>
        </Field>
        <Field label="Remarks">
          <input name="remarks" value={form.remarks} onChange={onChange} style={input} placeholder="Why this material is needed" />
        </Field>
        <div style={buttonCell}>
          <button type="submit" disabled={saving} style={saving ? disabledButton : primaryButton}>
            {saving ? "Saving..." : "Add Material"}
          </button>
        </div>
      </form>

      <DataTable
        title="Material Master"
        rows={rows}
        searchFields={["materialCode", "materialName", "category", "status", "remarks"]}
        columns={[
          { key: "materialCode", label: "Code" },
          { key: "materialName", label: "Name" },
          { key: "category", label: "Category" },
          { key: "appearsInRmInward", label: "RM Inward", render: yesNoLabel("appearsInRmInward"), renderExport: yesNoLabel("appearsInRmInward"), searchValue: yesNoLabel("appearsInRmInward") },
          { key: "appearsInProduction", label: "Production", render: yesNoLabel("appearsInProduction"), renderExport: yesNoLabel("appearsInProduction"), searchValue: yesNoLabel("appearsInProduction") },
          { key: "appearsInDispatch", label: "Dispatch", render: yesNoLabel("appearsInDispatch"), renderExport: yesNoLabel("appearsInDispatch"), searchValue: yesNoLabel("appearsInDispatch") },
          { key: "status", label: "Status", render: (row) => row.status || "ACTIVE" },
          {
            key: "actions",
            label: "Action",
            render: (row) => {
              const active = String(row.status || "ACTIVE").toUpperCase() === "ACTIVE";
              return (
                <button
                  type="button"
                  onClick={() => updateStatus(row, active ? "INACTIVE" : "ACTIVE")}
                  disabled={saving}
                  style={smallButton}
                >
                  {active ? "Mark Inactive" : "Activate"}
                </button>
              );
            },
            renderExport: () => "",
            searchValue: () => "",
          },
        ]}
      />
    </div>
  );
}

function YesNo({ name, value, onChange }) {
  return (
    <select name={name} value={value} onChange={onChange} style={input}>
      <option>NO</option>
      <option>YES</option>
    </select>
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

function KPI({ title, value }) {
  return (
    <div style={kpi}>
      <div style={kpiLabel}>{title}</div>
      <div style={kpiValue}>{value}</div>
    </div>
  );
}

function normalizeMaterialCode(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function yesNoLabel(key) {
  return (row) => String(row[key] || "NO").toUpperCase() === "YES" ? "YES" : "NO";
}

const page = { paddingBottom: 30 };
const hero = { background: "#0f766e", color: "white", borderRadius: 8, padding: 22, marginBottom: 16 };
const eyebrow = { fontSize: 12, textTransform: "uppercase", fontWeight: 900, opacity: 0.85 };
const title = { margin: "5px 0", fontSize: 28 };
const subtitle = { color: "rgba(255,255,255,0.84)", lineHeight: 1.5 };
const statusBox = { background: "#ecfdf5", border: "1px solid #bbf7d0", color: "#166534", borderRadius: 8, padding: 12, marginBottom: 14, fontWeight: 800 };
const kpiGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 14 };
const kpi = { background: "white", border: "1px solid #e2e8f0", borderRadius: 8, padding: 14 };
const kpiLabel = { color: "#64748b", fontSize: 12, fontWeight: 900, textTransform: "uppercase" };
const kpiValue = { color: "#0f172a", fontSize: 24, fontWeight: 900, marginTop: 6 };
const formGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, background: "white", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, marginBottom: 16 };
const field = { display: "flex", flexDirection: "column", gap: 6 };
const labelStyle = { fontSize: 12, color: "#475569", fontWeight: 900 };
const input = { padding: 10, border: "1px solid #cbd5e1", borderRadius: 8, font: "inherit" };
const buttonCell = { display: "flex", alignItems: "end" };
const primaryButton = { width: "100%", background: "#0f766e", color: "white", border: "none", borderRadius: 8, padding: "11px 14px", fontWeight: 900, cursor: "pointer" };
const disabledButton = { ...primaryButton, opacity: 0.6, cursor: "not-allowed" };
const smallButton = { background: "#f8fafc", border: "1px solid #cbd5e1", color: "#0f172a", borderRadius: 8, padding: "7px 10px", fontWeight: 800, cursor: "pointer" };
