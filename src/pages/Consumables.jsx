import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";
import DataTable from "../components/DataTable";

export default function Consumables() {
  const blankForm = {
    itemId: "",
    itemName: "",
    category: "",
    unit: "Kg",
    minLevel: "",
    reorderLevel: "",
    preferredSupplier: "",
    standardRate: "",
    isActive: "TRUE",
    remarks: "",
    createdBy: "Pratap",
  };

  const categories = [
    "PROCESS CHEMICALS",
    "EXTRUSION CONSUMABLES",
    "QUALITY ADDITIVES",
    "MAINTENANCE",
    "PACKING",
    "SAFETY & PPE",
    "TOOLS & SPARES",
    "HOUSEKEEPING",
    "ADMIN / GENERAL",
  ];

  const units = ["Kg", "Nos", "Ltr", "Bag", "Box", "Set", "Roll"];

  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editing, setEditing] = useState(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRows();
  }, []);

  async function safeList(fn) {
    try {
      const res = await apiCall({ fn });
      return res.rows || [];
    } catch (err) {
      console.log(fn, err);
      return [];
    }
  }

  async function loadRows() {
    try {
     const masterRows = await safeList("storesMaster.list");

      const map = {};

      function addItem(x) {
        const itemName = x.itemName || x.item || x.name || "";
        if (!itemName) return;
        if (String(x.status || "").toUpperCase() === "DELETED") return;

        map[itemName] = {
          itemId: x.itemId || x.id || map[itemName]?.itemId || "",
          itemName,
          category: x.category || map[itemName]?.category || "",
          unit: x.unit || map[itemName]?.unit || "Kg",
          minLevel: x.minLevel || map[itemName]?.minLevel || "",
          reorderLevel: x.reorderLevel || map[itemName]?.reorderLevel || "",
          preferredSupplier:
            x.preferredSupplier ||
            x.supplier ||
            x.vendor ||
            map[itemName]?.preferredSupplier ||
            "",
          standardRate:
            x.standardRate ||
            x.rate ||
            x.ratePerUnit ||
            map[itemName]?.standardRate ||
            "",
          isActive: x.isActive || map[itemName]?.isActive || "TRUE",
          remarks: x.remarks || map[itemName]?.remarks || "",
          createdBy: x.createdBy || map[itemName]?.createdBy || "System",
          status: x.status || map[itemName]?.status || "",
        };
      }

     masterRows.forEach(addItem);

      setRows(
        Object.values(map).sort((a, b) =>
          String(a.itemName).localeCompare(String(b.itemName))
        )
      );
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

  function clearMainForm() {
    setForm(blankForm);
    setStatus("Ready for new consumable entry");
  }

  async function submit(e) {
    e.preventDefault();

    if (!form.itemName) return alert("Item name is required");
    if (!form.category) return alert("Category is required");

    try {
      setSaving(true);

      const res = await apiCall({
        fn: "storesMaster.add",
        ...form,
      });

      if (res.ok === false) {
        setStatus(res.error || "Error saving consumable");
        return;
      }

      setStatus("Consumable item saved successfully");
      setForm(blankForm);
      loadRows();
    } catch (err) {
      setStatus(err.message);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(row) {
    if (!row.itemId) {
      alert(
        "This item came from Stores Inward/Issue and has no itemId in Stores Master. Create it in Consumables first or edit only Stores Master items."
      );
      return;
    }

    setEditing({
      ...row,
      isActive: row.isActive || "TRUE",
    });
  }

  function onEditChange(e) {
    setEditing({
      ...editing,
      [e.target.name]: e.target.value,
    });
  }

  async function saveEdit() {
    if (!editing?.itemName) return alert("Item name is required");
    if (!editing?.category) return alert("Category is required");
    if (!editing?.itemId) return alert("Missing itemId. Cannot update this item.");

    try {
      setSaving(true);

      const res = await apiCall({
        fn: "storesMaster.update",
        ...editing,
        itemId: editing.itemId,
      });

      if (res.ok === false) {
        alert(res.error || "Update failed");
        return;
      }

      setStatus("Consumable item updated");
      setEditing(null);
      loadRows();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteRow(row) {
    if (!row.itemId) {
      alert(
        "Cannot delete this item because itemId is missing. This row may have come from inward/issue history, not Stores Master."
      );
      return;
    }

    const ok = window.confirm(`Delete / deactivate ${row.itemName}?`);
    if (!ok) return;

    try {
      const res = await apiCall({
        fn: "storesMaster.update",
        ...row,
        itemId: row.itemId,
        isActive: "FALSE",
        status: "DELETED",
      });

      if (res.ok === false) {
        alert(res.error || "Delete failed");
        return;
      }

      setStatus("Consumable item deactivated");
      loadRows();
    } catch (err) {
      alert(err.message);
    }
  }

 const activeRows = useMemo(() => {
  return rows.filter(
    (r) =>
      String(r.status || "").toUpperCase() !== "DELETED" &&
      String(r.isActive || "TRUE").toUpperCase() !== "FALSE"
  );
}, [rows]);

  const activeItems = activeRows.filter(
    (r) => String(r.isActive || "TRUE").toUpperCase() === "TRUE"
  ).length;

  const categoryCount = new Set(activeRows.map((r) => r.category).filter(Boolean))
    .size;

  const minConfigured = activeRows.filter((r) => Number(r.minLevel || 0) > 0)
    .length;

  const reorderConfigured = activeRows.filter(
    (r) => Number(r.reorderLevel || 0) > 0
  ).length;

  return (
    <div style={page}>
      <div style={hero}>
        <div>
          <div style={eyebrow}>Stores Master</div>
          <h1 style={title}>Consumables Master</h1>
          <div style={subtitle}>
            Main form is for new consumables. Use table Edit for Stores Master
            corrections.
          </div>
        </div>
      </div>

      <div style={kpiGrid}>
        <KPI title="Total Items" value={activeRows.length} />
        <KPI title="Active Items" value={activeItems} />
        <KPI title="Categories" value={categoryCount} />
        <KPI title="Min Level Set" value={minConfigured} />
        <KPI title="Reorder Set" value={reorderConfigured} />
      </div>

      <div style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Add Consumable Item</h2>

        <form
          onSubmit={submit}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
              e.preventDefault();
            }
          }}
          style={formStyle}
        >
          <Field label="Item Name">
            <input
              name="itemName"
              value={form.itemName}
              onChange={onChange}
              placeholder="Example: Screen Mesh, TiO2, Gear Oil"
              style={inputStyle}
            />
          </Field>

          <Field label="Category">
            <select
              name="category"
              value={form.category}
              onChange={onChange}
              style={inputStyle}
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>

          <Field label="Unit">
            <select
              name="unit"
              value={form.unit}
              onChange={onChange}
              style={inputStyle}
            >
              {units.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </Field>

          <Field label="Min Level">
            <input
              type="number"
              name="minLevel"
              value={form.minLevel}
              onChange={onChange}
              placeholder="Minimum stock level"
              style={inputStyle}
            />
          </Field>

          <Field label="Reorder Level">
            <input
              type="number"
              name="reorderLevel"
              value={form.reorderLevel}
              onChange={onChange}
              placeholder="Reorder trigger level"
              style={inputStyle}
            />
          </Field>

          <Field label="Preferred Supplier">
            <input
              name="preferredSupplier"
              value={form.preferredSupplier}
              onChange={onChange}
              placeholder="Preferred supplier"
              style={inputStyle}
            />
          </Field>

          <Field label="Standard Rate">
            <input
              type="number"
              name="standardRate"
              value={form.standardRate}
              onChange={onChange}
              placeholder="Standard rate"
              style={inputStyle}
            />
          </Field>

          <Field label="Active">
            <select
              name="isActive"
              value={form.isActive}
              onChange={onChange}
              style={inputStyle}
            >
              <option value="TRUE">Active</option>
              <option value="FALSE">Inactive</option>
            </select>
          </Field>

          <Field label="Remarks">
            <textarea
              name="remarks"
              value={form.remarks}
              onChange={onChange}
              placeholder="Remarks"
              style={textareaStyle}
            />
          </Field>

          <div style={formActions}>
            <button type="submit" disabled={saving} style={buttonStyle}>
              {saving ? "Saving..." : "Save Consumable"}
            </button>

            <button type="button" onClick={clearMainForm} style={clearButton}>
              Clear / New Entry
            </button>
          </div>
        </form>
      </div>

      {status && <div style={statusStyle}>{status}</div>}

      <DataTable
        title="Consumables List"
        rows={activeRows}
        searchFields={[
          "itemName",
          "category",
          "unit",
          "preferredSupplier",
          "remarks",
          "isActive",
        ]}
        columns={[
          { key: "itemName", label: "Item" },
          { key: "category", label: "Category" },
          { key: "unit", label: "Unit" },
          { key: "minLevel", label: "Min Level" },
          { key: "reorderLevel", label: "Reorder Level" },
          { key: "preferredSupplier", label: "Supplier" },
          {
            key: "standardRate",
            label: "Rate",
            render: (r) => `₹ ${Number(r.standardRate || 0).toFixed(2)}`,
            renderExport: (r) => Number(r.standardRate || 0).toFixed(2),
          },
          {
            key: "isActive",
            label: "Active",
            render: (r) =>
              String(r.isActive || "TRUE").toUpperCase() === "TRUE"
                ? "Active"
                : "Inactive",
          },
          {
            key: "masterStatus",
            label: "Master Row",
            render: (r) => (r.itemId ? "Yes" : "No"),
            renderExport: (r) => (r.itemId ? "Yes" : "No"),
          },
          { key: "remarks", label: "Remarks" },
        ]}
        onEdit={startEdit}
        onDelete={deleteRow}
      />

      
      {editing && (
        <div style={modalOverlay}>
          <div style={modal}>
            <h2 style={{ marginTop: 0 }}>Edit Consumable</h2>

            <div style={formStyle}>
              <Field label="Item ID">
                <input value={editing.itemId || ""} readOnly style={readonlyStyle} />
              </Field>

              <Field label="Item Name">
                <input
                  name="itemName"
                  value={editing.itemName || ""}
                  onChange={onEditChange}
                  style={inputStyle}
                />
              </Field>

              <Field label="Category">
                <select
                  name="category"
                  value={editing.category || ""}
                  onChange={onEditChange}
                  style={inputStyle}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>

              <Field label="Unit">
                <select
                  name="unit"
                  value={editing.unit || "Kg"}
                  onChange={onEditChange}
                  style={inputStyle}
                >
                  {units.map((u) => (
                    <option key={u}>{u}</option>
                  ))}
                </select>
              </Field>

              <Field label="Min Level">
                <input
                  type="number"
                  name="minLevel"
                  value={editing.minLevel || ""}
                  onChange={onEditChange}
                  style={inputStyle}
                />
              </Field>

              <Field label="Reorder Level">
                <input
                  type="number"
                  name="reorderLevel"
                  value={editing.reorderLevel || ""}
                  onChange={onEditChange}
                  style={inputStyle}
                />
              </Field>

              <Field label="Preferred Supplier">
                <input
                  name="preferredSupplier"
                  value={editing.preferredSupplier || ""}
                  onChange={onEditChange}
                  style={inputStyle}
                />
              </Field>

              <Field label="Standard Rate">
                <input
                  type="number"
                  name="standardRate"
                  value={editing.standardRate || ""}
                  onChange={onEditChange}
                  style={inputStyle}
                />
              </Field>

              <Field label="Active">
                <select
                  name="isActive"
                  value={editing.isActive || "TRUE"}
                  onChange={onEditChange}
                  style={inputStyle}
                >
                  <option value="TRUE">Active</option>
                  <option value="FALSE">Inactive</option>
                </select>
              </Field>

              <Field label="Remarks">
                <textarea
                  name="remarks"
                  value={editing.remarks || ""}
                  onChange={onEditChange}
                  style={textareaStyle}
                />
              </Field>
            </div>

            <div style={modalButtons}>
              <button onClick={() => setEditing(null)} style={cancelButton}>
                Cancel
              </button>

              <button onClick={saveEdit} disabled={saving} style={saveButton}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
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

const page = { padding: 20 };

const hero = {
  background: "linear-gradient(135deg,#064e3b,#0f766e)",
  color: "white",
  borderRadius: 18,
  padding: 24,
  marginBottom: 20,
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

const subtitle = { opacity: 0.9 };

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

const cardStyle = {
  background: "white",
  padding: 20,
  borderRadius: 14,
  marginBottom: 25,
  border: "1px solid #e5e7eb",
  boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
};

const formStyle = {
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

const readonlyStyle = {
  ...inputStyle,
  background: "#f8fafc",
  fontWeight: 800,
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

const buttonStyle = {
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

const statusStyle = {
  marginBottom: 20,
  background: "#ecfdf5",
  color: "#166534",
  border: "1px solid #bbf7d0",
  padding: 12,
  borderRadius: 10,
  fontWeight: 700,
};

const noteStyle = {
  background: "#fff7ed",
  border: "1px solid #fed7aa",
  padding: 15,
  borderRadius: 10,
  marginTop: 20,
  color: "#7c2d12",
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
  width: 850,
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

const saveButton = {
  background: "#0f766e",
  color: "white",
  border: "none",
  padding: "10px 16px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
};