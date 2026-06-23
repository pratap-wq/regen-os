import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";

export default function Consumables() {
  const blankForm = {
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
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadRows();
  }, []);

  async function loadRows() {
    try {
      const res = await apiCall({
        fn: "consumables.list",
      });

      setRows(res.rows || []);
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

  async function submit(e) {
    e.preventDefault();

    if (!form.itemName) {
      alert("Item name is required");
      return;
    }

    if (!form.category) {
      alert("Category is required");
      return;
    }

    try {
      setSaving(true);

      const res = await apiCall({
        fn: "consumables.add",
        ...form,
      });

      if (res.ok) {
        setStatus("Consumable item saved successfully");
        setForm(blankForm);
        loadRows();
      } else {
        setStatus(res.error || "Error saving consumable");
      }
    } catch (err) {
      setStatus(err.message);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(row) {
    setEditing({
      ...row,
    });
  }

  function onEditChange(e) {
    setEditing({
      ...editing,
      [e.target.name]: e.target.value,
    });
  }

  async function saveEdit() {
    try {
      setSaving(true);

      const res = await apiCall({
        fn: "consumables.update",
        ...editing,
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
    const ok = window.confirm(`Delete / deactivate ${row.itemName}?`);
    if (!ok) return;

    try {
      const res = await apiCall({
        fn: "consumables.update",
        ...row,
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

  const filteredRows = useMemo(() => {
    const q = search.toLowerCase();

    return rows
      .filter((r) => String(r.status || "").toUpperCase() !== "DELETED")
      .filter((r) => {
        if (!q) return true;

        return [
          r.itemName,
          r.category,
          r.unit,
          r.preferredSupplier,
          r.remarks,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);
      });
  }, [rows, search]);

  const activeItems = filteredRows.filter(
    (r) => String(r.isActive || "TRUE").toUpperCase() === "TRUE"
  ).length;

  const categoryCount = new Set(filteredRows.map((r) => r.category)).size;

  const lowMinConfigured = filteredRows.filter(
    (r) => Number(r.minLevel || 0) > 0
  ).length;

  return (
    <div style={page}>
      <div style={hero}>
        <div>
          <div style={eyebrow}>Stores Master</div>
          <h1 style={title}>Consumables Master</h1>
          <div style={subtitle}>
            Maintain consumable items, category, unit, min level and reorder level.
          </div>
        </div>
      </div>

      <div style={kpiGrid}>
        <KPI title="Total Items" value={filteredRows.length} />
        <KPI title="Active Items" value={activeItems} />
        <KPI title="Categories" value={categoryCount} />
        <KPI title="Min Level Set" value={lowMinConfigured} />
      </div>

      <div style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Add Consumable Item</h2>

        <form onSubmit={submit} style={formStyle}>
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

          <div style={{ display: "flex", alignItems: "end" }}>
            <button type="submit" disabled={saving} style={buttonStyle}>
              {saving ? "Saving..." : "Save Consumable"}
            </button>
          </div>
        </form>
      </div>

      {status && <div style={statusStyle}>{status}</div>}

      <div style={cardStyle}>
        <div style={tableTop}>
          <h2 style={{ margin: 0 }}>Consumables List</h2>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search consumables..."
            style={searchStyle}
          />
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr style={headerRowStyle}>
                <th style={th}>Item</th>
                <th style={th}>Category</th>
                <th style={th}>Unit</th>
                <th style={th}>Min Level</th>
                <th style={th}>Reorder Level</th>
                <th style={th}>Supplier</th>
                <th style={th}>Rate</th>
                <th style={th}>Active</th>
                <th style={th}>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.map((r, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={td}>
                    <b>{r.itemName}</b>
                  </td>
                  <td style={td}>{r.category}</td>
                  <td style={td}>{r.unit}</td>
                  <td style={td}>{r.minLevel}</td>
                  <td style={td}>{r.reorderLevel}</td>
                  <td style={td}>{r.preferredSupplier}</td>
                  <td style={td}>₹ {r.standardRate}</td>
                  <td style={td}>
                    <span
                      style={badge(
                        String(r.isActive || "TRUE").toUpperCase() === "TRUE"
                      )}
                    >
                      {String(r.isActive || "TRUE").toUpperCase() === "TRUE"
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>
                  <td style={td}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => startEdit(r)} style={editButton}>
                        Edit
                      </button>
                      <button onClick={() => deleteRow(r)} style={deleteButton}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan="9" style={emptyStyle}>
                    No consumables found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={noteStyle}>
        <b>Purpose:</b> This is now the Consumables Master. Monthly consumption
        should come from Stores Inward and Stores Issue, not manual monthly
        entries.
      </div>

      {editing && (
        <div style={modalOverlay}>
          <div style={modal}>
            <h2 style={{ marginTop: 0 }}>Edit Consumable</h2>

            <div style={formStyle}>
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

const badge = (active) => ({
  background: active ? "#dcfce7" : "#fee2e2",
  color: active ? "#166534" : "#991b1b",
  padding: "5px 10px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 800,
});

const page = {
  padding: 20,
};

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

const subtitle = {
  opacity: 0.9,
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

const textareaStyle = {
  width: "100%",
  padding: 10,
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  minHeight: 80,
  boxSizing: "border-box",
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

const statusStyle = {
  marginBottom: 20,
  background: "#ecfdf5",
  color: "#166534",
  border: "1px solid #bbf7d0",
  padding: 12,
  borderRadius: 10,
  fontWeight: 700,
};

const tableTop = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  marginBottom: 16,
  flexWrap: "wrap",
};

const searchStyle = {
  height: 40,
  padding: "0 12px",
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  minWidth: 240,
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 1000,
};

const headerRowStyle = {
  background: "#0f766e",
  color: "white",
};

const th = {
  padding: 12,
  textAlign: "left",
  whiteSpace: "nowrap",
};

const td = {
  padding: 10,
  whiteSpace: "nowrap",
};

const editButton = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "7px 11px",
  borderRadius: 7,
  cursor: "pointer",
  fontWeight: 700,
};

const deleteButton = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "7px 11px",
  borderRadius: 7,
  cursor: "pointer",
  fontWeight: 700,
};

const emptyStyle = {
  padding: 20,
  textAlign: "center",
  color: "#64748b",
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