import { useEffect, useState } from "react";

import { apiCall } from "../api/api";

import { formatDate } from "../utils/date";

import {
  pageStyle,
  sectionCard,
  sectionTitle,
  formGrid,
  inputStyle,
  textareaStyle,
  readonlyStyle,
  primaryButton,
  tableCard,
  tableStyle,
  thStyle,
  tdStyle,
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
      const [inwardRows, consumableRows, storesMasterRows] = await Promise.all([
        safeList("storesInward.list"),
        safeList("consumables.list"),
        safeList("storesMaster.list"),
      ]);

      setRows(inwardRows);

      const mergedMap = {};

      [...consumableRows, ...storesMasterRows].forEach((x) => {
        const itemName = x.itemName || x.item || x.name || "";

        if (!itemName) return;

        if (String(x.status || "").toUpperCase() === "DELETED") return;
        if (String(x.isActive || "TRUE").toUpperCase() === "FALSE") return;

        mergedMap[itemName] = {
          ...x,
          itemName,
          category: x.category || "",
          unit: x.unit || "",
          standardRate: x.standardRate || x.rate || x.ratePerUnit || "",
          preferredSupplier:
            x.preferredSupplier || x.supplier || x.vendor || "",
        };
      });

      setItems(Object.values(mergedMap).sort((a, b) =>
        String(a.itemName).localeCompare(String(b.itemName))
      ));
    } catch (err) {
      console.log(err);
      setStatus(err.message);
    }
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
        updated.supplier =
          selected.preferredSupplier || updated.supplier || "";
      }
    }

    const qty = Number(updated.qty || 0);
    const rate = Number(updated.rate || 0);
    updated.totalAmount = qty * rate;

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

    if (!newItem.itemName) {
      alert("Item name is required");
      return;
    }

    if (!newItem.category) {
      alert("Category is required");
      return;
    }

    try {
      setSavingItem(true);

      const res = await apiCall({
        fn: "consumables.add",
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

    if (!form.date) {
      alert("Date is mandatory");
      return;
    }

    if (!form.itemName) {
      alert("Select item");
      return;
    }

    if (!form.qty) {
      alert("Enter quantity");
      return;
    }

    try {
      const res = await apiCall({
        fn: "storesInward.add",
        ...form,
      });

      if (res.ok) {
        setStatus("Stores inward saved successfully");
        setForm(blankForm);
        loadData();
      } else {
        setStatus(res.error || "Error");
      }
    } catch (err) {
      setStatus(err.message);
    }
  }

  const totalQty = rows.reduce((sum, r) => sum + Number(r.qty || 0), 0);

  const totalValue = rows.reduce(
    (sum, r) => sum + Number(r.totalAmount || 0),
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
          Consumables inward entry connected to Consumables Master
        </div>
      </div>

      <div style={kpiGrid}>
        <KPI title="Total Qty" value={totalQty} />
        <KPI title="Inventory Value" value={`₹ ${totalValue.toFixed(0)}`} />
        <KPI title="Average Rate" value={`₹ ${avgRate}`} />
        <KPI title="Suppliers" value={supplierCount} />
      </div>

      <div style={sectionCard}>
        <div style={sectionHeader}>
          <div>
            <div style={sectionTitle}>Inward Entry</div>
            <div style={{ color: "#64748b", fontSize: 13 }}>
              Select item from master or add a new consumable directly.
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

        <form onSubmit={submit} style={formGrid}>
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

          <div style={{ display: "flex", alignItems: "end" }}>
            <button type="submit" style={primaryButton}>
              Save Inward
            </button>
          </div>
        </form>

        {status && <div style={statusStyle}>{status}</div>}
      </div>

      <div style={sectionCard}>
        <div style={sectionTitle}>Recent Inward</div>

        <div style={tableCard}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Item</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Unit</th>
                <th style={thStyle}>Qty</th>
                <th style={thStyle}>Rate</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Supplier</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td style={tdStyle}>{formatDate(r.date)}</td>

                  <td style={tdStyle}>
                    <b>{r.itemName}</b>
                  </td>

                  <td style={tdStyle}>{r.category}</td>
                  <td style={tdStyle}>{r.unit}</td>
                  <td style={tdStyle}>{r.qty}</td>
                  <td style={tdStyle}>₹ {r.rate}</td>
                  <td style={tdStyle}>₹ {r.totalAmount}</td>
                  <td style={tdStyle}>{r.supplier}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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