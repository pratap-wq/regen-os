import { useEffect, useMemo, useRef, useState } from "react";
import { apiCall } from "../api/api";
import DataTable from "../components/DataTable";
import { requireSuccessfulResponse, withRequestTimeout } from "../utils/requestSafety";

const CATEGORIES = ["RM", "WIP", "FG", "REWORK", "WASTE", "ADDITIVE", "STORE"];
const STATUSES = ["ACTIVE", "INACTIVE"];

const blankForm = {
  materialId: "",
  materialCode: "",
  materialName: "",
  category: "RM",
  appearsInRMInward: "NO",
  appearsInRmInward: "NO",
  appearsInProduction: "NO",
  appearsInGrinderInput: "NO",
  appearsInGrinderOutput: "NO",
  appearsInWashInput: "NO",
  appearsInWashOutput: "NO",
  appearsInSorterInput: "NO",
  appearsInSorterOutput: "NO",
  appearsInExtrusionInput: "NO",
  appearsInExtrusionOutput: "NO",
  appearsInDispatch: "NO",
  appearsInMonthClose: "YES",
  appearsInInventoryAdjustments: "YES",
  status: "ACTIVE",
  remarks: "",
};

const DROPDOWN_FLAGS = [
  ["appearsInRMInward", "RM Inward"],
  ["appearsInGrinderInput", "Grinder Input"],
  ["appearsInGrinderOutput", "Grinder Output"],
  ["appearsInWashInput", "Wash Input"],
  ["appearsInWashOutput", "Wash Output"],
  ["appearsInSorterInput", "Sorter Input"],
  ["appearsInSorterOutput", "Sorter Output"],
  ["appearsInExtrusionInput", "Extrusion Input"],
  ["appearsInExtrusionOutput", "Extrusion Output"],
  ["appearsInDispatch", "Dispatch"],
  ["appearsInMonthClose", "Month Close"],
  ["appearsInInventoryAdjustments", "Inventory Adjustments"],
];

export default function MaterialMasterAdmin() {
  const [rows, setRows] = useState([]);
  const [draftRows, setDraftRows] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState("dropdown");
  const [materialSearch, setMaterialSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("NON_STORE");
  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const saveLockRef = useRef(false);

  useEffect(() => {
    loadRows();
  }, []);

  async function loadRows() {
    try {
      const res = await apiCall({ fn: "materialMaster.list" });
      const nextRows = res.rows || [];
      setRows(nextRows);
      setDraftRows(nextRows.map(normalizeDropdownFlags));
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
      if (name === "appearsInRMInward") {
        next.appearsInRmInward = value;
      }
      return next;
    });
  }

  async function submit(e) {
    e.preventDefault();
    if (saveLockRef.current) return;
    saveLockRef.current = true;
    setSaving(true);
    setStatus("Saving material...");
    if (!form.materialName.trim()) return finishSave("Material name is required");
    if (!form.materialCode.trim()) return finishSave("Material code is required");

    try {
      const res = requireSuccessfulResponse(await withRequestTimeout(apiCall({
        fn: form.materialId ? "materialMaster.update" : "materialMaster.add",
        ...form,
        materialCode: normalizeMaterialCode(form.materialCode),
        appearsInRmInward: form.appearsInRMInward,
        createdBy: "Admin",
        updatedBy: "Admin",
      })), "", "Material save");
      const savedId = res.materialId || res.id || form.materialId;
      if (!savedId) throw new Error("Material save failed: backend did not return materialId.");

      setStatus(res.alreadyExists ? `Material already exists: ${savedId}` : `Material saved successfully: ${savedId}`);
      await loadRows();
      setForm(blankForm);
    } catch (err) {
      setStatus(err.message);
    } finally {
      finishSave();
    }
  }

  function editMaterial(row) {
    setForm({
      ...blankForm,
      ...row,
      appearsInRMInward: row.appearsInRMInward || row.appearsInRmInward || "NO",
      appearsInRmInward: row.appearsInRMInward || row.appearsInRmInward || "NO",
    });
    setView("basic");
    setStatus(`Editing ${row.materialName || row.materialCode}`);
  }

  async function updateStatus(row, nextStatus) {
    const materialName = row.materialName || row.name || row.materialCode;
    const ok = window.confirm(`${nextStatus === "ACTIVE" ? "Activate" : "Mark inactive"} ${materialName}?`);
    if (!ok) return;

    if (saveLockRef.current) return;
    saveLockRef.current = true;
    setSaving(true);
    setStatus("Saving...");
    try {
      requireSuccessfulResponse(await withRequestTimeout(apiCall({
        fn: "materialMaster.updateStatus",
        materialId: row.materialId,
        materialCode: row.materialCode,
        status: nextStatus,
        remarks: `${nextStatus} from Material Master Admin`,
        updatedBy: "Admin",
      })), "", "Material status update");

      setStatus(`Material marked ${nextStatus}.`);
      await loadRows();
    } catch (err) {
      setStatus(err.message);
    } finally {
      finishSave();
    }
  }

  const activeRows = useMemo(
    () => rows.filter((row) => String(row.status || "ACTIVE").toUpperCase() === "ACTIVE"),
    [rows]
  );

  const activeDraftRows = useMemo(
    () => draftRows.filter((row) => String(row.status || "ACTIVE").toUpperCase() === "ACTIVE"),
    [draftRows]
  );

  const selectedMaterial = useMemo(
    () => activeDraftRows.find((row) => materialIdentity(row) === selectedMaterialId) || null,
    [activeDraftRows, selectedMaterialId]
  );

  const availableMaterials = useMemo(() => {
    const term = materialSearch.trim().toLowerCase();
    return activeDraftRows
      .filter((row) => {
        const category = String(row.category || "").toUpperCase();
        if (categoryFilter === "NON_STORE" && category === "STORE") return false;
        if (categoryFilter !== "NON_STORE" && categoryFilter !== "ALL" && category !== categoryFilter) return false;
        if (!term) return true;
        return [
          row.materialCode,
          row.materialName,
          row.category,
          row.remarks,
        ].some((value) => String(value || "").toLowerCase().includes(term));
      })
      .sort((a, b) => String(a.materialName || "").localeCompare(String(b.materialName || "")));
  }, [activeDraftRows, materialSearch, categoryFilter]);

  function addSelectedToDropdown(flagKey) {
    if (!selectedMaterial) {
      setStatus("Select a material from the left first.");
      return;
    }

    setDraftRows((currentRows) =>
      currentRows.map((row) => {
        if (materialIdentity(row) !== materialIdentity(selectedMaterial)) return row;
        const next = { ...row, [flagKey]: "YES" };
        if (flagKey === "appearsInRMInward") next.appearsInRmInward = "YES";
        return next;
      })
    );
  }

  function removeFromDropdown(row, flagKey) {
    setDraftRows((currentRows) =>
      currentRows.map((item) => {
        if (materialIdentity(item) !== materialIdentity(row)) return item;
        const next = { ...item, [flagKey]: "NO" };
        if (flagKey === "appearsInRMInward") next.appearsInRmInward = "NO";
        return next;
      })
    );
  }

  async function saveDropdownChanges() {
    if (saveLockRef.current) return;
    const originalById = new Map(rows.map((row) => [materialIdentity(row), normalizeDropdownFlags(row)]));
    const changedRows = draftRows.filter((row) => {
      const original = originalById.get(materialIdentity(row));
      if (!original) return false;
      return DROPDOWN_FLAGS.some(([key]) => yesNoValue(row, key) !== yesNoValue(original, key));
    });

    if (!changedRows.length) {
      setStatus("No dropdown changes to save.");
      return;
    }

    try {
      saveLockRef.current = true;
      setSaving(true);
      setStatus("Saving dropdown changes...");
      for (const row of changedRows) {
        const payload = {
          ...row,
          materialCode: normalizeMaterialCode(row.materialCode || row.materialName),
          appearsInRmInward: yesNoValue(row, "appearsInRMInward"),
          updatedBy: "Admin",
        };
        requireSuccessfulResponse(await withRequestTimeout(apiCall({
          fn: "materialMaster.update",
          ...payload,
        })), "", `Save ${row.materialName || row.materialCode}`);
      }

      setStatus(`Dropdown control saved for ${changedRows.length} material(s).`);
      await loadRows();
    } catch (err) {
      setStatus(err.message);
    } finally {
      finishSave();
    }
  }

  function finishSave(message = "") {
    if (message) setStatus(message);
    saveLockRef.current = false;
    setSaving(false);
  }

  function resetDropdownChanges() {
    setDraftRows(rows.map(normalizeDropdownFlags));
    setStatus("Dropdown changes reset.");
  }

  return (
    <div style={page}>
      <div style={hero}>
        <div>
          <div style={eyebrow}>Masters</div>
          <h1 style={title}>Material Master Admin</h1>
          <div style={subtitle}>
            Add or activate controlled dropdown materials across RM Inward, Production, Dispatch, Month Close, and Inventory Adjustments.
          </div>
        </div>
      </div>

      {status && <div style={statusBox}>{status}</div>}

      <div style={kpiGrid}>
        <KPI title="Total Materials" value={rows.length} />
        <KPI title="Active" value={activeRows.length} />
        <KPI title="Categories" value={new Set(rows.map((row) => row.category).filter(Boolean)).size} />
      </div>

      <div style={tabRow}>
        <button type="button" onClick={() => setView("dropdown")} style={view === "dropdown" ? activeTab : tabButton}>
          Dropdown Control
        </button>
        <button type="button" onClick={() => setView("basic")} style={view === "basic" ? activeTab : tabButton}>
          Basic Master Add / Edit
        </button>
      </div>

      {view === "dropdown" ? (
        <div style={dropdownControl}>
          <div style={availablePanel}>
            <div style={panelTitle}>Available Materials</div>
            <input
              value={materialSearch}
              onChange={(e) => setMaterialSearch(e.target.value)}
              style={input}
              placeholder="Search code, name, category"
            />
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={input}>
              <option value="NON_STORE">All except STORE</option>
              <option value="ALL">All categories</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <div style={materialList}>
              {availableMaterials.map((row) => {
                const id = materialIdentity(row);
                const selected = id === selectedMaterialId;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedMaterialId(id)}
                    style={selected ? selectedMaterialButton : materialButton}
                  >
                    <span style={materialNameText}>{row.materialName || row.materialCode}</span>
                    <span style={materialMeta}>{row.materialCode} · {row.category || "NA"}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={usagePanel}>
            <div style={usageHeader}>
              <div>
                <div style={panelTitle}>Dropdown Usage</div>
                <div style={helperText}>
                  Selected: {selectedMaterial ? `${selectedMaterial.materialName} (${selectedMaterial.category})` : "Choose a material from the left"}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={resetDropdownChanges} disabled={saving} style={smallButton}>Reset</button>
                <button type="button" onClick={saveDropdownChanges} disabled={saving} style={saving ? disabledButton : primaryButton}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>

            <div style={usageGrid}>
              {DROPDOWN_FLAGS.map(([flagKey, label]) => (
                <DropdownUsageBox
                  key={flagKey}
                  label={label}
                  flagKey={flagKey}
                  rows={activeDraftRows.filter((row) => yesNoValue(row, flagKey) === "YES")}
                  onAdd={() => addSelectedToDropdown(flagKey)}
                  onRemove={removeFromDropdown}
                  disabled={!selectedMaterial || saving}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} onKeyDown={(e) => { if (e.key === "Enter" && saving) { e.preventDefault(); e.stopPropagation(); } }} style={formGrid}>
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
          {DROPDOWN_FLAGS.map(([key, label]) => (
            <Field key={key} label={label}>
              <YesNo name={key} value={form[key]} onChange={onChange} />
            </Field>
          ))}
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
              {saving ? "Saving..." : form.materialId ? "Update Material" : "Add Material"}
            </button>
            {form.materialId && (
              <button type="button" disabled={saving} style={smallButton} onClick={() => setForm(blankForm)}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      )}

      <DataTable
        title="Material Master"
        rows={rows}
        searchFields={["materialCode", "materialName", "category", "status", "remarks"]}
        columns={[
          { key: "materialCode", label: "Code" },
          { key: "materialName", label: "Name" },
          { key: "category", label: "Category" },
          { key: "appearsInRMInward", label: "RM Inward", render: yesNoLabel("appearsInRMInward", "appearsInRmInward"), renderExport: yesNoLabel("appearsInRMInward", "appearsInRmInward"), searchValue: yesNoLabel("appearsInRMInward", "appearsInRmInward") },
          { key: "appearsInGrinderInput", label: "Grinder In", render: yesNoLabel("appearsInGrinderInput"), renderExport: yesNoLabel("appearsInGrinderInput"), searchValue: yesNoLabel("appearsInGrinderInput") },
          { key: "appearsInWashInput", label: "Wash In", render: yesNoLabel("appearsInWashInput"), renderExport: yesNoLabel("appearsInWashInput"), searchValue: yesNoLabel("appearsInWashInput") },
          { key: "appearsInExtrusionInput", label: "Extrusion In", render: yesNoLabel("appearsInExtrusionInput"), renderExport: yesNoLabel("appearsInExtrusionInput"), searchValue: yesNoLabel("appearsInExtrusionInput") },
          { key: "appearsInExtrusionOutput", label: "Extrusion Out", render: yesNoLabel("appearsInExtrusionOutput"), renderExport: yesNoLabel("appearsInExtrusionOutput"), searchValue: yesNoLabel("appearsInExtrusionOutput") },
          { key: "appearsInDispatch", label: "Dispatch", render: yesNoLabel("appearsInDispatch"), renderExport: yesNoLabel("appearsInDispatch"), searchValue: yesNoLabel("appearsInDispatch") },
          { key: "appearsInInventoryAdjustments", label: "Inv Adj", render: yesNoLabel("appearsInInventoryAdjustments"), renderExport: yesNoLabel("appearsInInventoryAdjustments"), searchValue: yesNoLabel("appearsInInventoryAdjustments") },
          { key: "status", label: "Status", render: (row) => row.status || "ACTIVE" },
          {
            key: "actions",
            label: "Action",
            render: (row) => {
              const active = String(row.status || "ACTIVE").toUpperCase() === "ACTIVE";
              return (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => editMaterial(row)}
                    disabled={saving}
                    style={smallButton}
                  >
                    Edit Flags
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStatus(row, active ? "INACTIVE" : "ACTIVE")}
                    disabled={saving}
                    style={smallButton}
                  >
                    {active ? "Mark Inactive" : "Activate"}
                  </button>
                </div>
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

function yesNoLabel(key, fallbackKey = "") {
  return (row) => String(row[key] || (fallbackKey ? row[fallbackKey] : "") || "NO").toUpperCase() === "YES" ? "YES" : "NO";
}

function yesNoValue(row, key) {
  if (key === "appearsInRMInward") {
    return String(row.appearsInRMInward || row.appearsInRmInward || "NO").toUpperCase() === "YES" ? "YES" : "NO";
  }
  return String(row[key] || "NO").toUpperCase() === "YES" ? "YES" : "NO";
}

function normalizeDropdownFlags(row) {
  const next = { ...row };
  DROPDOWN_FLAGS.forEach(([key]) => {
    next[key] = yesNoValue(row, key);
  });
  next.appearsInRmInward = next.appearsInRMInward;
  return next;
}

function materialIdentity(row) {
  return String(row.materialId || row.materialCode || row.materialName || "").trim();
}

function DropdownUsageBox({ label, flagKey, rows, onAdd, onRemove, disabled }) {
  return (
    <div style={usageBox}>
      <div style={usageBoxHeader}>
        <span>{label}</span>
        <button type="button" onClick={onAdd} disabled={disabled} style={disabled ? disabledMiniButton : miniButton}>
          Add
        </button>
      </div>
      <div style={usageList}>
        {rows.length === 0 ? (
          <div style={emptyText}>No materials selected</div>
        ) : (
          rows.map((row) => (
            <span key={`${flagKey}-${materialIdentity(row)}`} style={pill}>
              {row.materialName || row.materialCode}
              <button
                type="button"
                aria-label={`Remove ${row.materialName || row.materialCode} from ${label}`}
                onClick={() => onRemove(row, flagKey)}
                style={removePillButton}
              >
                ×
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  );
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
const tabRow = { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 };
const tabButton = { background: "white", border: "1px solid #cbd5e1", color: "#0f172a", borderRadius: 999, padding: "9px 14px", fontWeight: 900, cursor: "pointer" };
const activeTab = { ...tabButton, background: "#0f766e", borderColor: "#0f766e", color: "white" };
const dropdownControl = { display: "grid", gridTemplateColumns: "minmax(260px, 340px) 1fr", gap: 14, alignItems: "start", marginBottom: 16 };
const availablePanel = { background: "white", border: "1px solid #e2e8f0", borderRadius: 8, padding: 14, display: "flex", flexDirection: "column", gap: 10, minHeight: 520 };
const usagePanel = { background: "white", border: "1px solid #e2e8f0", borderRadius: 8, padding: 14 };
const panelTitle = { fontSize: 15, fontWeight: 900, color: "#0f172a" };
const helperText = { marginTop: 4, color: "#64748b", fontSize: 12, fontWeight: 700 };
const materialList = { display: "flex", flexDirection: "column", gap: 6, maxHeight: 390, overflow: "auto", paddingRight: 2 };
const materialButton = { textAlign: "left", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 10, cursor: "pointer", display: "flex", flexDirection: "column", gap: 3 };
const selectedMaterialButton = { ...materialButton, background: "#ecfdf5", borderColor: "#0f766e" };
const materialNameText = { fontWeight: 900, color: "#0f172a" };
const materialMeta = { fontSize: 12, color: "#64748b", fontWeight: 800 };
const usageHeader = { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start", marginBottom: 12, flexWrap: "wrap" };
const usageGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 };
const usageBox = { border: "1px solid #e2e8f0", borderRadius: 8, padding: 10, background: "#f8fafc", minHeight: 118 };
const usageBoxHeader = { display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", color: "#0f172a", fontWeight: 900, marginBottom: 8 };
const usageList = { display: "flex", gap: 6, flexWrap: "wrap" };
const miniButton = { background: "#0f766e", border: "none", color: "white", borderRadius: 7, padding: "5px 8px", fontSize: 12, fontWeight: 900, cursor: "pointer" };
const disabledMiniButton = { ...miniButton, opacity: 0.45, cursor: "not-allowed" };
const pill = { display: "inline-flex", alignItems: "center", gap: 6, background: "white", border: "1px solid #cbd5e1", borderRadius: 999, padding: "5px 8px", fontSize: 12, color: "#0f172a", fontWeight: 800 };
const removePillButton = { border: "none", background: "#fee2e2", color: "#991b1b", borderRadius: "50%", width: 18, height: 18, lineHeight: "18px", padding: 0, cursor: "pointer", fontWeight: 900 };
const emptyText = { color: "#94a3b8", fontSize: 12, fontWeight: 800, padding: "8px 0" };
