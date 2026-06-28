import { useEffect, useState } from "react";
import { apiCall } from "../api/api";
import { formatDate } from "../utils/date";
import DataTable from "../components/DataTable";

import {
  pageStyle,
  sectionCard,
  sectionTitle,
  formGrid,
  inputStyle,
  textareaStyle,
  readonlyStyle,
  primaryButton,
} from "../ui/styles";

export default function StoresInward() {
  const today = new Date().toISOString().split("T")[0];

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

  const blankForm = {
    date: today,
    itemName: "",
    category: "",
    unit: "",
    qty: "",
    rate: "",
    totalAmount: "",
    supplier: "",
    invoiceNo: "",
    remarks: "",
    createdBy: "Pratap",
  };

  const blankNewItem = {
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

  const [rows, setRows] = useState([]);
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState(blankForm);

  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState(blankNewItem);
  const [savingItem, setSavingItem] = useState(false);

  const [editingRow, setEditingRow] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    loadData();
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

  async function loadData() {
    try {
      const [inwardRows, storesMasterRows] = await Promise.all([
        safeList("storesInward.list"),
        safeList("storesMaster.list"),
      ]);

      setRows(
        inwardRows.filter(
          (r) =>
            String(r.status || "").toUpperCase() !== "DELETED" &&
            String(r.inwardStatus || "").toUpperCase() !== "DELETED"
        )
      );

      const mergedMap = {};

      storesMasterRows.forEach((x) => {
        const itemName = x.itemName || x.item || x.name || "";

        if (!itemName) return;
        if (String(x.status || "").toUpperCase() === "DELETED") return;
        if (String(x.isActive || "TRUE").toUpperCase() === "FALSE") return;

        mergedMap[itemName] = {
          itemId: x.itemId || x.id || "",
          itemName,
          category: x.category || "",
          unit: x.unit || "",
          standardRate: x.standardRate || x.rate || x.ratePerUnit || "",
          preferredSupplier: x.preferredSupplier || x.supplier || x.vendor || "",
        };
      });

      setItems(
        Object.values(mergedMap).sort((a, b) =>
          String(a.itemName).localeCompare(String(b.itemName))
        )
      );
    } catch (err) {
      console.log(err);
      setStatus(err.message);
    }
  }

  function calcAmount(qty, rate) {
    return Number(qty || 0) * Number(rate || 0);
  }

  function getStoresInwardId(row) {
    return (
      row.storesInwardId ||
      row.inwardId ||
      row.id ||
      row.entryId ||
      row.uuid ||
      ""
    );
  }

  function onChange(e) {
    const updated = {
      ...form,
      [e.target.name]: e.target.value,
    };

    if (e.target.name === "itemName") {
      const selected = items.find((x) => x.itemName === e.target.value);

      if (selected) {
        updated.category = selected.category || "";
        updated.unit = selected.unit || "";
        updated.rate = selected.standardRate || updated.rate || "";
        updated.supplier = selected.preferredSupplier || updated.supplier || "";
      }
    }

    updated.totalAmount = calcAmount(updated.qty, updated.rate);
    setForm(updated);
  }

  function onNewItemChange(e) {
    setNewItem({
      ...newItem,
      [e.target.name]: e.target.value,
    });
  }

  async function saveNewConsumable(e) {
    e.preventDefault();

    if (!newItem.itemName) return alert("Item name is required");
    if (!newItem.category) return alert("Category is required");

    try {
      setSavingItem(true);

      const res = await apiCall({
        fn: "storesMaster.add",
        ...newItem,
      });

      if (res.ok === false) {
        alert(res.error || "Could not save consumable");
        return;
      }

      setStatus("New consumable item added");

      setForm({
        ...form,
        itemName: newItem.itemName,
        category: newItem.category,
        unit: newItem.unit,
        rate: newItem.standardRate || form.rate,
        supplier: newItem.preferredSupplier || form.supplier,
      });

      setNewItem(blankNewItem);
      setShowAddItem(false);
      await loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingItem(false);
    }
  }

  async function submit(e) {
    e.preventDefault();

    if (!form.date) return alert("Date is mandatory");
    if (!form.itemName) return alert("Select item");
    if (!form.qty) return alert("Enter quantity");

    try {
      const res = await apiCall({
        fn: "storesInward.add",
        ...form,
        totalAmount: calcAmount(form.qty, form.rate),
      });

      if (res.ok === false) {
        setStatus(res.error || "Error saving stores inward");
        return;
      }

      setStatus("Stores inward saved successfully");
      setForm(blankForm);
      loadData();
    } catch (err) {
      setStatus(err.message);
    }
  }

  function clearMainForm() {
    setForm(blankForm);
    setStatus("Ready for new inward entry");
  }

  function editRow(row) {
    setEditingRow({
      ...row,
      date: formatDateForInput(row.date) || today,
      totalAmount: row.totalAmount || calcAmount(row.qty, row.rate),
    });
  }

  function onEditChange(e) {
    const updated = {
      ...editingRow,
      [e.target.name]: e.target.value,
    };

    if (e.target.name === "itemName") {
      const selected = items.find((x) => x.itemName === e.target.value);

      if (selected) {
        updated.category = selected.category || updated.category || "";
        updated.unit = selected.unit || updated.unit || "";
        updated.rate = selected.standardRate || updated.rate || "";
        updated.supplier = selected.preferredSupplier || updated.supplier || "";
      }
    }

    updated.totalAmount = calcAmount(updated.qty, updated.rate);
    setEditingRow(updated);
  }

  async function saveEdit() {
    if (!editingRow) return;
    if (!editingRow.itemName) return alert("Item name is required");
    if (!editingRow.qty) return alert("Qty is required");

    const idValue = getStoresInwardId(editingRow);

    if (!idValue) {
      alert(
        "Missing Stores Inward ID. Cannot update this old row. Please check Apps Script column name."
      );
      return;
    }

    try {
      setSavingEdit(true);

      const res = await apiCall({
        fn: "storesInward.update",
        ...editingRow,
        storesInwardId: idValue,
        inwardId: idValue,
        totalAmount: calcAmount(editingRow.qty, editingRow.rate),
      });

      if (res.ok === false) {
        alert(res.error || "Update failed");
        return;
      }

      setStatus("Stores inward updated");
      setEditingRow(null);
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingEdit(false);
    }
  }

  async function deleteRow(row) {
    const idValue = getStoresInwardId(row);

    if (!idValue) {
      alert(
        "Missing Stores Inward ID. Cannot delete this row. Backend needs storesInwardId/inwardId."
      );
      return;
    }

    const ok = window.confirm(`Delete inward entry for ${row.itemName}?`);
    if (!ok) return;

    try {
      const res = await apiCall({
        fn: "storesInward.update",
        ...row,
        storesInwardId: idValue,
        inwardId: idValue,
        status: "DELETED",
        inwardStatus: "DELETED",
      });

      if (res.ok === false) {
        alert(res.error || "Delete failed");
        return;
      }

      setStatus("Stores inward deleted");
      loadData();
    } catch (err) {
      alert(err.message);
    }
  }

  const totalQty = rows.reduce((sum, r) => sum + Number(r.qty || 0), 0);

  const totalValue = rows.reduce(
    (sum, r) =>
      sum + Number(r.totalAmount || Number(r.qty || 0) * Number(r.rate || 0)),
    0
  );

  const avgRate = totalQty > 0 ? (totalValue / totalQty).toFixed(2) : 0;

  const supplierCount = [
    ...new Set(rows.map((r) => r.supplier).filter(Boolean)),
  ].length;

  return (
    <div style={pageStyle}>
      <div style={sectionCard}>
        <div style={sectionTitle}>Stores Inward</div>

        <div style={{ color: "#64748b", fontSize: 13 }}>
          Consumables inward entry connected to Stores Master.
        </div>
      </div>

      <div style={kpiGrid}>
        <KPI title="Total Qty" value={totalQty.toFixed(2)} />
        <KPI title="Inventory Value" value={`₹ ${totalValue.toFixed(0)}`} />
        <KPI title="Average Rate" value={`₹ ${avgRate}`} />
        <KPI title="Suppliers" value={supplierCount} />
      </div>

      <div style={sectionCard}>
        <div style={sectionHeader}>
          <div>
            <div style={sectionTitle}>New Inward Entry</div>
            <div style={{ color: "#64748b", fontSize: 13 }}>
              Main form is only for new entries. Use table Edit for corrections.
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddItem(true)}
            style={secondaryButton}
          >
            + Add New Consumable
          </button>
        </div>

        <form
          onSubmit={submit}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
              e.preventDefault();
            }
          }}
          style={formGrid}
        >
          <Field label="Date">
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={onChange}
              style={inputStyle}
              required
            />
          </Field>

          <Field label="Item">
            <select
              name="itemName"
              value={form.itemName}
              onChange={onChange}
              style={inputStyle}
              required
            >
              <option value="">
                {items.length === 0
                  ? "No items found - add consumable"
                  : "Select Item"}
              </option>

              {items.map((x, i) => (
                <option key={i} value={x.itemName}>
                  {x.itemName}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Category">
            <input value={form.category} readOnly style={readonlyStyle} />
          </Field>

          <Field label="Unit">
            <input value={form.unit} readOnly style={readonlyStyle} />
          </Field>

          <Field label="Qty">
            <input
              type="number"
              name="qty"
              value={form.qty}
              onChange={onChange}
              style={inputStyle}
              required
            />
          </Field>

          <Field label="Rate">
            <input
              type="number"
              name="rate"
              value={form.rate}
              onChange={onChange}
              style={inputStyle}
            />
          </Field>

          <Field label="Amount">
            <input value={form.totalAmount} readOnly style={readonlyStyle} />
          </Field>

          <Field label="Supplier">
            <input
              name="supplier"
              value={form.supplier}
              onChange={onChange}
              style={inputStyle}
            />
          </Field>

          <Field label="Invoice">
            <input
              name="invoiceNo"
              value={form.invoiceNo}
              onChange={onChange}
              style={inputStyle}
            />
          </Field>

          <Field label="Remarks">
            <textarea
              name="remarks"
              value={form.remarks}
              onChange={onChange}
              style={textareaStyle}
            />
          </Field>

          <div style={formActions}>
            <button type="submit" style={primaryButton}>
              Save Inward
            </button>

            <button type="button" style={clearButton} onClick={clearMainForm}>
              Clear / New Entry
            </button>
          </div>
        </form>

        {status && <div style={statusStyle}>{status}</div>}
      </div>

      <DataTable
        title="Stores Inward Ledger"
        rows={rows}
        searchFields={[
          "itemName",
          "category",
          "unit",
          "supplier",
          "invoiceNo",
          "remarks",
        ]}
        columns={[
          {
            key: "date",
            label: "Date",
            render: (r) => formatDate(r.date),
            renderExport: (r) => formatDate(r.date),
          },
          { key: "itemName", label: "Item" },
          { key: "category", label: "Category" },
          { key: "unit", label: "Unit" },
          {
            key: "qty",
            label: "Qty",
            render: (r) => Number(r.qty || 0).toFixed(2),
            renderExport: (r) => Number(r.qty || 0).toFixed(2),
          },
          {
            key: "rate",
            label: "Rate",
            render: (r) => `₹ ${Number(r.rate || 0).toFixed(2)}`,
            renderExport: (r) => Number(r.rate || 0).toFixed(2),
          },
          {
            key: "totalAmount",
            label: "Amount",
            render: (r) =>
              `₹ ${Number(
                r.totalAmount || Number(r.qty || 0) * Number(r.rate || 0)
              ).toFixed(0)}`,
            renderExport: (r) =>
              Number(
                r.totalAmount || Number(r.qty || 0) * Number(r.rate || 0)
              ).toFixed(0),
          },
          { key: "supplier", label: "Supplier" },
          { key: "invoiceNo", label: "Invoice" },
          { key: "remarks", label: "Remarks" },
        ]}
        onEdit={editRow}
        onDelete={deleteRow}
      />

      {showAddItem && (
        <div style={modalOverlay}>
          <div style={modal}>
            <h2 style={{ marginTop: 0 }}>Add New Consumable</h2>

            <form onSubmit={saveNewConsumable} style={formGrid}>
              <Field label="Item Name">
                <input
                  name="itemName"
                  value={newItem.itemName}
                  onChange={onNewItemChange}
                  style={inputStyle}
                  required
                />
              </Field>

              <Field label="Category">
                <select
                  name="category"
                  value={newItem.category}
                  onChange={onNewItemChange}
                  style={inputStyle}
                  required
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
                  value={newItem.unit}
                  onChange={onNewItemChange}
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
                  value={newItem.minLevel}
                  onChange={onNewItemChange}
                  style={inputStyle}
                />
              </Field>

              <Field label="Reorder Level">
                <input
                  type="number"
                  name="reorderLevel"
                  value={newItem.reorderLevel}
                  onChange={onNewItemChange}
                  style={inputStyle}
                />
              </Field>

              <Field label="Preferred Supplier">
                <input
                  name="preferredSupplier"
                  value={newItem.preferredSupplier}
                  onChange={onNewItemChange}
                  style={inputStyle}
                />
              </Field>

              <Field label="Standard Rate">
                <input
                  type="number"
                  name="standardRate"
                  value={newItem.standardRate}
                  onChange={onNewItemChange}
                  style={inputStyle}
                />
              </Field>

              <Field label="Remarks">
                <textarea
                  name="remarks"
                  value={newItem.remarks}
                  onChange={onNewItemChange}
                  style={textareaStyle}
                />
              </Field>

              <div style={modalButtons}>
                <button
                  type="button"
                  onClick={() => setShowAddItem(false)}
                  style={cancelButton}
                >
                  Cancel
                </button>

                <button type="submit" disabled={savingItem} style={saveButton}>
                  {savingItem ? "Saving..." : "Save Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingRow && (
        <div style={modalOverlay}>
          <div style={modal}>
            <h2 style={{ marginTop: 0 }}>Edit Stores Inward</h2>

            <div style={formGrid}>
              <Field label="Date">
                <input
                  type="date"
                  name="date"
                  value={editingRow.date || ""}
                  onChange={onEditChange}
                  style={inputStyle}
                />
              </Field>

              <Field label="Item">
                <select
                  name="itemName"
                  value={editingRow.itemName || ""}
                  onChange={onEditChange}
                  style={inputStyle}
                >
                  <option value="">Select Item</option>
                  {items.map((x, i) => (
                    <option key={i} value={x.itemName}>
                      {x.itemName}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Category">
                <input
                  name="category"
                  value={editingRow.category || ""}
                  onChange={onEditChange}
                  style={inputStyle}
                />
              </Field>

              <Field label="Unit">
                <input
                  name="unit"
                  value={editingRow.unit || ""}
                  onChange={onEditChange}
                  style={inputStyle}
                />
              </Field>

              <Field label="Qty">
                <input
                  type="number"
                  name="qty"
                  value={editingRow.qty || ""}
                  onChange={onEditChange}
                  style={inputStyle}
                />
              </Field>

              <Field label="Rate">
                <input
                  type="number"
                  name="rate"
                  value={editingRow.rate || ""}
                  onChange={onEditChange}
                  style={inputStyle}
                />
              </Field>

              <Field label="Amount">
                <input
                  value={editingRow.totalAmount || ""}
                  readOnly
                  style={readonlyStyle}
                />
              </Field>

              <Field label="Supplier">
                <input
                  name="supplier"
                  value={editingRow.supplier || ""}
                  onChange={onEditChange}
                  style={inputStyle}
                />
              </Field>

              <Field label="Invoice">
                <input
                  name="invoiceNo"
                  value={editingRow.invoiceNo || ""}
                  onChange={onEditChange}
                  style={inputStyle}
                />
              </Field>

              <Field label="Remarks">
                <textarea
                  name="remarks"
                  value={editingRow.remarks || ""}
                  onChange={onEditChange}
                  style={textareaStyle}
                />
              </Field>
            </div>

            <div style={modalButtons}>
              <button
                type="button"
                onClick={() => setEditingRow(null)}
                style={cancelButton}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveEdit}
                disabled={savingEdit}
                style={saveButton}
              >
                {savingEdit ? "Saving..." : "Save Changes"}
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

function formatDateForInput(value) {
  if (!value) return "";

  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  if (text.includes("T")) return text.split("T")[0];

  const d = new Date(value);
  if (isNaN(d.getTime())) return "";

  return d.toISOString().split("T")[0];
}

const kpiGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: 14,
  marginBottom: 16,
};

const kpiCard = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 16,
};

const kpiTitle = {
  color: "#64748b",
  fontSize: 12,
  marginBottom: 8,
};

const kpiValue = {
  fontSize: 24,
  fontWeight: 700,
  color: "#005d34",
};

const sectionHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  marginBottom: 16,
  flexWrap: "wrap",
};

const secondaryButton = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "10px 14px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
};

const statusStyle = {
  marginTop: 14,
  fontWeight: 600,
  color: "#0f766e",
};

const fieldLabel = {
  marginBottom: 4,
  fontWeight: 600,
  color: "#334155",
  fontSize: 12,
};

const formActions = {
  display: "flex",
  alignItems: "end",
  gap: 10,
  flexWrap: "wrap",
};

const clearButton = {
  background: "#64748b",
  color: "white",
  border: "none",
  padding: "10px 14px",
  borderRadius: 8,
  cursor: "pointer",
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
  alignItems: "end",
  marginTop: 18,
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