import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";
import DataTable from "../components/DataTable";

export default function ProductionMaterials() {
  const blankForm = {
    materialName: "",
    category: "Flakes",
    stage: "Production",
    polymer: "PP",
    washingStatus: "",
    source: "Local",
    imported: "NO",
    battery: "NO",
    colourType: "",
    expectedRecoveryPercent: "",
    sortOrder: "",
    isActive: "TRUE",
    remarks: "",
    createdBy: "Pratap",
  };

  const defaultMaterials = [
    ["Flakes - Washed", "Flakes", "Washed", "Local", "NO", "NO"],
    ["Flakes - Unwashed", "Flakes", "Unwashed", "Local", "NO", "NO"],
    ["Flakes - Semi-washed", "Flakes", "Semi-washed", "Local", "NO", "NO"],
    ["Flakes - Washed (Imported)", "Flakes", "Washed", "Imported", "YES", "NO"],
    ["Flakes - Unwashed (Imported)", "Flakes", "Unwashed", "Imported", "YES", "NO"],
    ["Flakes - Semi-washed (Imported)", "Flakes", "Semi-washed", "Imported", "YES", "NO"],
    ["Battery Flakes - Washed", "Battery Flakes", "Washed", "Local", "NO", "YES"],
    ["Battery Flakes - Unwashed", "Battery Flakes", "Unwashed", "Local", "NO", "YES"],
    ["Battery Flakes - Semi-washed", "Battery Flakes", "Semi-washed", "Local", "NO", "YES"],
    ["Flakes - Dominant colour", "Flakes", "Dominant Colour", "Local", "NO", "NO"],
    ["Lumps - Regrind", "Lumps", "Regrind", "Local", "NO", "NO"],
    ["Buckets", "Buckets", "Unwashed", "Local", "NO", "NO"],
  ];

  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editing, setEditing] = useState(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRows();
  }, []);

  async function loadRows() {
    try {
      const res = await apiCall({ fn: "productionMaterials.list" });
      setRows((res.rows || []).filter((r) => String(r.status || "").toUpperCase() !== "DELETED"));
    } catch (err) {
      setStatus(err.message);
    }
  }

  function onChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function onEditChange(e) {
    setEditing({
      ...editing,
      [e.target.name]: e.target.value,
    });
  }

  function clearMainForm() {
    setForm(blankForm);
    setStatus("Ready for new production material");
  }

  async function submit(e) {
    e.preventDefault();

    if (!form.materialName) return alert("Material name is required");

    try {
      setSaving(true);

      const res = await apiCall({
        fn: "productionMaterials.add",
        ...form,
      });

      if (res.ok === false) {
        alert(res.error || "Save failed");
        return;
      }

      setStatus("Production material saved");
      setForm(blankForm);
      loadRows();
    } catch (err) {
      setStatus(err.message);
    } finally {
      setSaving(false);
    }
  }

  function editRow(row) {
    setEditing({ ...row });
  }

  async function saveEdit() {
    if (!editing?.materialName) return alert("Material name is required");

    try {
      setSaving(true);

      const res = await apiCall({
        fn: "productionMaterials.update",
        ...editing,
      });

      if (res.ok === false) {
        alert(res.error || "Update failed");
        return;
      }

      setStatus("Production material updated");
      setEditing(null);
      loadRows();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteRow(row) {
    const ok = window.confirm(`Delete / deactivate ${row.materialName}?`);
    if (!ok) return;

    try {
      const res = await apiCall({
        fn: "productionMaterials.update",
        ...row,
        isActive: "FALSE",
        status: "DELETED",
      });

      if (res.ok === false) {
        alert(res.error || "Delete failed");
        return;
      }

      setStatus("Production material deleted");
      loadRows();
    } catch (err) {
      alert(err.message);
    }
  }

  async function seedDefaultMaterials() {
    const ok = window.confirm("Add default production materials list?");
    if (!ok) return;

    try {
      setSaving(true);

      for (let i = 0; i < defaultMaterials.length; i += 1) {
        const [materialName, category, washingStatus, source, imported, battery] =
          defaultMaterials[i];

        await apiCall({
          fn: "productionMaterials.add",
          materialName,
          category,
          stage: "Production",
          polymer: "PP",
          washingStatus,
          source,
          imported,
          battery,
          colourType: materialName.includes("Dominant") ? "Dominant Colour" : "",
          expectedRecoveryPercent: "",
          sortOrder: i + 1,
          isActive: "TRUE",
          remarks: "Default master item",
          createdBy: "Pratap",
        });
      }

      setStatus("Default production materials added");
      loadRows();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  const activeRows = useMemo(() => {
    return rows.filter((r) => String(r.isActive || "TRUE").toUpperCase() === "TRUE");
  }, [rows]);

  return (
    <div style={page}>
      <div style={hero}>
        <div>
          <div style={eyebrow}>Masters</div>
          <h1 style={title}>Production Materials Master</h1>
          <div style={subtitle}>
            Controls material dropdowns for Production Entry, Wash, Sorting and Extrusion.
          </div>
        </div>

        <button type="button" onClick={seedDefaultMaterials} disabled={saving} style={seedButton}>
          + Load Default Materials
        </button>
      </div>

      <div style={kpiGrid}>
        <KPI title="Total Materials" value={rows.length} />
        <KPI title="Active Materials" value={activeRows.length} />
        <KPI title="Categories" value={new Set(rows.map((r) => r.category).filter(Boolean)).size} />
        <KPI title="Imported" value={rows.filter((r) => r.imported === "YES").length} />
      </div>

      <div style={card}>
        <h2 style={{ marginTop: 0 }}>Add Production Material</h2>

        <form
          onSubmit={submit}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
              e.preventDefault();
            }
          }}
          style={formGrid}
        >
          <MaterialFields data={form} onChange={onChange} />

          <div style={formActions}>
            <button type="submit" disabled={saving} style={saveButton}>
              {saving ? "Saving..." : "Save Material"}
            </button>

            <button type="button" onClick={clearMainForm} style={clearButton}>
              Clear / New Entry
            </button>
          </div>
        </form>
      </div>

      {status && <div style={statusBox}>{status}</div>}

      <DataTable
        title="Production Materials List"
        rows={rows}
        searchFields={[
          "materialName",
          "category",
          "stage",
          "polymer",
          "washingStatus",
          "source",
          "colourType",
          "remarks",
        ]}
        columns={[
          { key: "sortOrder", label: "Sort" },
          { key: "materialName", label: "Material Name" },
          { key: "category", label: "Category" },
          { key: "stage", label: "Stage" },
          { key: "polymer", label: "Polymer" },
          { key: "washingStatus", label: "Washing Status" },
          { key: "source", label: "Source" },
          { key: "imported", label: "Imported" },
          { key: "battery", label: "Battery" },
          { key: "colourType", label: "Colour Type" },
          { key: "expectedRecoveryPercent", label: "Expected Recovery %" },
          { key: "isActive", label: "Active" },
          { key: "remarks", label: "Remarks" },
        ]}
        onEdit={editRow}
        onDelete={deleteRow}
      />

      {editing && (
        <div style={modalOverlay}>
          <div style={modal}>
            <h2 style={{ marginTop: 0 }}>Edit Production Material</h2>

            <div style={formGrid}>
              <MaterialFields data={editing} onChange={onEditChange} />
            </div>

            <div style={modalButtons}>
              <button type="button" onClick={() => setEditing(null)} style={cancelButton}>
                Cancel
              </button>

              <button type="button" onClick={saveEdit} disabled={saving} style={modalSaveButton}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MaterialFields({ data, onChange }) {
  return (
    <>
      <Field label="Material Name">
        <input
          name="materialName"
          value={data.materialName || ""}
          onChange={onChange}
          style={inputStyle}
          placeholder="Flakes - Washed"
        />
      </Field>

      <Field label="Category">
        <select name="category" value={data.category || ""} onChange={onChange} style={inputStyle}>
          <option value="">Select</option>
          <option>Flakes</option>
          <option>Battery Flakes</option>
          <option>Lumps</option>
          <option>Regrind</option>
          <option>Buckets</option>
          <option>Virgin</option>
          <option>Additive</option>
          <option>Other</option>
        </select>
      </Field>

      <Field label="Stage">
        <select name="stage" value={data.stage || ""} onChange={onChange} style={inputStyle}>
          <option>Production</option>
          <option>Wash</option>
          <option>Sorting</option>
          <option>Extrusion</option>
          <option>All</option>
        </select>
      </Field>

      <Field label="Polymer">
        <select name="polymer" value={data.polymer || ""} onChange={onChange} style={inputStyle}>
          <option>PP</option>
          <option>PPCP</option>
          <option>HDPE</option>
          <option>LDPE</option>
          <option>OTHER</option>
        </select>
      </Field>

      <Field label="Washing Status">
        <select name="washingStatus" value={data.washingStatus || ""} onChange={onChange} style={inputStyle}>
          <option value="">Select</option>
          <option>Washed</option>
          <option>Unwashed</option>
          <option>Semi-washed</option>
          <option>Imported Washed</option>
          <option>Regrind</option>
          <option>NA</option>
        </select>
      </Field>

      <Field label="Source">
        <select name="source" value={data.source || ""} onChange={onChange} style={inputStyle}>
          <option>Local</option>
          <option>Imported</option>
          <option>Internal Recovery</option>
          <option>Supplier Direct</option>
          <option>Other</option>
        </select>
      </Field>

      <Field label="Imported">
        <select name="imported" value={data.imported || "NO"} onChange={onChange} style={inputStyle}>
          <option>NO</option>
          <option>YES</option>
        </select>
      </Field>

      <Field label="Battery">
        <select name="battery" value={data.battery || "NO"} onChange={onChange} style={inputStyle}>
          <option>NO</option>
          <option>YES</option>
        </select>
      </Field>

      <Field label="Colour Type">
        <input
          name="colourType"
          value={data.colourType || ""}
          onChange={onChange}
          style={inputStyle}
          placeholder="White / Dominant / Mixed"
        />
      </Field>

      <Field label="Expected Recovery %">
        <input
          type="number"
          name="expectedRecoveryPercent"
          value={data.expectedRecoveryPercent || ""}
          onChange={onChange}
          style={inputStyle}
        />
      </Field>

      <Field label="Sort Order">
        <input
          type="number"
          name="sortOrder"
          value={data.sortOrder || ""}
          onChange={onChange}
          style={inputStyle}
        />
      </Field>

      <Field label="Active">
        <select name="isActive" value={data.isActive || "TRUE"} onChange={onChange} style={inputStyle}>
          <option value="TRUE">TRUE</option>
          <option value="FALSE">FALSE</option>
        </select>
      </Field>

      <Field label="Remarks">
        <textarea
          name="remarks"
          value={data.remarks || ""}
          onChange={onChange}
          style={textareaStyle}
        />
      </Field>
    </>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={labelStyle}>{label}</div>
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

const page = {
  padding: 20,
};

const hero = {
  background: "linear-gradient(135deg,#064e3b,#0f766e)",
  color: "white",
  borderRadius: 18,
  padding: 24,
  marginBottom: 20,
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
};

const eyebrow = {
  fontSize: 13,
  textTransform: "uppercase",
  letterSpacing: 1.2,
  opacity: 0.85,
  fontWeight: 800,
};

const title = {
  margin: "6px 0",
  fontSize: 32,
  fontWeight: 950,
};

const subtitle = {
  opacity: 0.9,
};

const seedButton = {
  background: "white",
  color: "#0f766e",
  border: "none",
  padding: "11px 16px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 900,
  height: 42,
};

const kpiGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
  gap: 16,
  marginBottom: 20,
};

const kpiCard = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
};

const kpiTitle = {
  color: "#64748b",
  fontSize: 12,
  fontWeight: 800,
  textTransform: "uppercase",
  marginBottom: 8,
};

const kpiValue = {
  fontSize: 28,
  fontWeight: 950,
  color: "#0f766e",
};

const card = {
  background: "white",
  padding: 20,
  borderRadius: 14,
  marginBottom: 20,
  border: "1px solid #e5e7eb",
  boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
};

const formGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: 14,
};

const labelStyle = {
  fontSize: 12,
  fontWeight: 700,
  marginBottom: 5,
  color: "#334155",
};

const inputStyle = {
  width: "100%",
  height: 40,
  padding: "0 10px",
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  boxSizing: "border-box",
};

const textareaStyle = {
  width: "100%",
  padding: 10,
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  minHeight: 80,
  boxSizing: "border-box",
};

const formActions = {
  display: "flex",
  alignItems: "end",
  gap: 10,
  flexWrap: "wrap",
};

const saveButton = {
  background: "#0f766e",
  color: "white",
  border: "none",
  padding: "11px 16px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
};

const clearButton = {
  background: "#64748b",
  color: "white",
  border: "none",
  padding: "11px 16px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
};

const statusBox = {
  marginBottom: 20,
  background: "#ecfdf5",
  color: "#166534",
  border: "1px solid #bbf7d0",
  padding: 12,
  borderRadius: 10,
  fontWeight: 700,
};

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const modal = {
  background: "white",
  padding: 24,
  borderRadius: 14,
  width: 900,
  maxWidth: "95vw",
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
};

const modalButtons = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  marginTop: 22,
};

const cancelButton = {
  background: "#64748b",
  color: "white",
  border: "none",
  padding: "10px 16px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
};

const modalSaveButton = {
  background: "#0f766e",
  color: "white",
  border: "none",
  padding: "10px 16px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
};