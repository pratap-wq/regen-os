import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";
import DataTable from "../components/DataTable";

export default function LiveStoresInventory() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function safeLoad(fn) {
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
      const [inward, issue, consumables, storesMaster] = await Promise.all([
        safeLoad("storesInward.list"),
        safeLoad("storesIssue.list"),
        safeLoad("consumables.list"),
        safeLoad("storesMaster.list"),
      ]);

      const masterMap = {};

      [...storesMaster, ...consumables].forEach((x) => {
        const item = x.itemName || x.item || x.name || "";
        if (!item) return;

        masterMap[item] = {
          itemName: item,
          category: x.category || "",
          unit: x.unit || "",
          minLevel: Number(x.minLevel || 0),
          reorderLevel: Number(x.reorderLevel || 0),
          standardRate: Number(x.standardRate || x.rate || x.ratePerUnit || 0),
          preferredSupplier: x.preferredSupplier || x.supplier || x.vendor || "",
          location: x.location || x.rack || "",
          remarks: x.remarks || "",
          isActive: x.isActive || "TRUE",
          createdBy: x.createdBy || "System",
        };
      });

      const map = {};

      inward.forEach((r) => {
        const item = r.itemName || "Unknown";
        const master = masterMap[item] || {};
        const qty = Number(r.qty || 0);
        const rate = Number(r.rate || master.standardRate || 0);
        const value = Number(r.totalAmount || qty * rate);

        if (!map[item]) {
          map[item] = {
            itemName: item,
            category: r.category || master.category || "",
            unit: r.unit || master.unit || "",
            inwardQty: 0,
            issueQty: 0,
            inwardValue: 0,
            issueValue: 0,
            minLevel: Number(master.minLevel || 0),
            reorderLevel: Number(master.reorderLevel || 0),
            standardRate: Number(master.standardRate || 0),
            preferredSupplier: master.preferredSupplier || r.supplier || "",
            location: master.location || "",
            remarks: master.remarks || "",
            isActive: master.isActive || "TRUE",
            createdBy: master.createdBy || "System",
          };
        }

        map[item].inwardQty += qty;
        map[item].inwardValue += value;
      });

      issue.forEach((r) => {
        const item = r.itemName || "Unknown";
        const master = masterMap[item] || {};
        const qty = Number(r.qty || 0);
        const rate = Number(r.issueRate || master.standardRate || 0);
        const value = Number(r.issueValue || qty * rate);

        if (!map[item]) {
          map[item] = {
            itemName: item,
            category: r.category || master.category || "",
            unit: master.unit || "",
            inwardQty: 0,
            issueQty: 0,
            inwardValue: 0,
            issueValue: 0,
            minLevel: Number(master.minLevel || 0),
            reorderLevel: Number(master.reorderLevel || 0),
            standardRate: Number(master.standardRate || 0),
            preferredSupplier: master.preferredSupplier || "",
            location: master.location || "",
            remarks: master.remarks || "",
            isActive: master.isActive || "TRUE",
            createdBy: master.createdBy || "System",
          };
        }

        map[item].issueQty += qty;
        map[item].issueValue += value;
      });

      Object.keys(masterMap).forEach((item) => {
        const master = masterMap[item];

        if (!map[item]) {
          map[item] = {
            itemName: item,
            category: master.category || "",
            unit: master.unit || "",
            inwardQty: 0,
            issueQty: 0,
            inwardValue: 0,
            issueValue: 0,
            minLevel: Number(master.minLevel || 0),
            reorderLevel: Number(master.reorderLevel || 0),
            standardRate: Number(master.standardRate || 0),
            preferredSupplier: master.preferredSupplier || "",
            location: master.location || "",
            remarks: master.remarks || "",
            isActive: master.isActive || "TRUE",
            createdBy: master.createdBy || "System",
          };
        }
      });

      const finalRows = Object.values(map).map((r) => {
        const balanceQty = Number(r.inwardQty || 0) - Number(r.issueQty || 0);
        const balanceValue =
          Number(r.inwardValue || 0) - Number(r.issueValue || 0);

        const avgRate =
          Number(r.inwardQty || 0) > 0
            ? Number(r.inwardValue || 0) / Number(r.inwardQty || 0)
            : Number(r.standardRate || 0);

        const avgDailyConsumption = Number(r.issueQty || 0) / 30;

        const daysRemaining =
          avgDailyConsumption > 0
            ? Math.floor(balanceQty / avgDailyConsumption)
            : 999;

        const effectiveMin = Number(r.minLevel || 0);
        const effectiveReorder =
          Number(r.reorderLevel || 0) || effectiveMin * 1.5;

        let stockStatus = "OK";

        if (effectiveMin > 0 && balanceQty <= effectiveMin) {
          stockStatus = "CRITICAL";
        } else if (effectiveReorder > 0 && balanceQty <= effectiveReorder) {
          stockStatus = "LOW";
        }

        return {
          ...r,
          balanceQty,
          balanceValue,
          avgRate,
          avgDailyConsumption,
          daysRemaining,
          status: stockStatus,
        };
      });

      setRows(finalRows.sort((a, b) => b.balanceValue - a.balanceValue));
    } catch (err) {
      console.log(err);
      setStatus("Failed loading stores inventory");
    }
  }

  function startEdit(row) {
    setEditing({
      itemName: row.itemName || "",
      category: row.category || "",
      unit: row.unit || "Kg",
      minLevel: row.minLevel || "",
      reorderLevel: row.reorderLevel || "",
      standardRate: row.standardRate || row.avgRate || "",
      preferredSupplier: row.preferredSupplier || "",
      location: row.location || "",
      remarks: row.remarks || "",
      isActive: row.isActive || "TRUE",
      createdBy: row.createdBy || "Live Stores",
    });
  }

  function onEditChange(e) {
    setEditing({
      ...editing,
      [e.target.name]: e.target.value,
    });
  }

  async function saveEdit() {
    if (!editing?.itemName) {
      alert("Item name missing");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        fn: "consumables.update",
        itemName: editing.itemName,
        category: editing.category || "",
        unit: editing.unit || "Kg",
        minLevel: editing.minLevel || "",
        reorderLevel: editing.reorderLevel || "",
        standardRate: editing.standardRate || "",
        preferredSupplier: editing.preferredSupplier || "",
        location: editing.location || "",
        remarks: editing.remarks || "",
        isActive: editing.isActive || "TRUE",
        createdBy: editing.createdBy || "Live Stores",
      };

      let res = await apiCall(payload);

      if (res.ok === false) {
        res = await apiCall({
          fn: "consumables.add",
          ...payload,
        });
      }

      if (res.ok === false) {
        alert(res.error || "Save failed");
        return;
      }

      setStatus("Stores master updated successfully");
      setEditing(null);
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  const data = useMemo(() => {
    const totalItems = rows.length;
    const criticalItems = rows.filter((r) => r.status === "CRITICAL").length;
    const lowItems = rows.filter((r) => r.status === "LOW").length;

    const totalStockQty = rows.reduce(
      (sum, r) => sum + Number(r.balanceQty || 0),
      0
    );

    const totalStockValue = rows.reduce(
      (sum, r) => sum + Number(r.balanceValue || 0),
      0
    );

    const configuredItems = rows.filter(
      (r) => Number(r.minLevel || 0) > 0 || Number(r.reorderLevel || 0) > 0
    ).length;

    const lowStockList = rows
      .filter((r) => r.status !== "OK")
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
      .slice(0, 10);

    const topValueItems = [...rows]
      .sort((a, b) => b.balanceValue - a.balanceValue)
      .slice(0, 10);

    return {
      totalItems,
      criticalItems,
      lowItems,
      totalStockQty,
      totalStockValue,
      configuredItems,
      lowStockList,
      topValueItems,
    };
  }, [rows]);

  return (
    <div style={page}>
      <div style={hero}>
        <div>
          <div style={eyebrow}>Stores Intelligence</div>
          <h1 style={title}>Stores Control Tower</h1>
          <div style={subtitle}>
            Live stores inventory, min-level alerts, reorder controls, export and print.
          </div>
        </div>
      </div>

      <div style={gridStyle}>
        <Card title="Items" value={data.totalItems} />
        <Card title="Configured" value={data.configuredItems} />
        <Card title="Critical" value={data.criticalItems} color="#dc2626" />
        <Card title="Low Stock" value={data.lowItems} color="#d97706" />
        <Card title="Stock Qty" value={data.totalStockQty.toFixed(0)} />
        <Card title="Stock Value" value={`₹ ${lakh(data.totalStockValue)} L`} />
      </div>

      {status && <div style={statusStyle}>{status}</div>}

      <div style={twoCol}>
        <Panel title="Low / Critical Stock">
          <SimpleTable
            columns={["Item", "Balance", "Min", "Reorder", "Days", "Status"]}
            rows={data.lowStockList.map((r) => [
              r.itemName,
              `${num(r.balanceQty)} ${r.unit || ""}`,
              num(r.minLevel),
              num(r.reorderLevel),
              r.daysRemaining,
              r.status,
            ])}
          />
        </Panel>

        <Panel title="Top Stock Value Items">
          <SimpleTable
            columns={["Item", "Qty", "Rate", "Value"]}
            rows={data.topValueItems.map((r) => [
              r.itemName,
              `${num(r.balanceQty)} ${r.unit || ""}`,
              `₹ ${num(r.avgRate)}`,
              `₹ ${lakh(r.balanceValue)} L`,
            ])}
          />
        </Panel>
      </div>

      <DataTable
        title="Live Stores Inventory"
        rows={rows}
        searchFields={[
          "itemName",
          "category",
          "unit",
          "preferredSupplier",
          "status",
          "location",
          "remarks",
        ]}
        columns={[
          { key: "itemName", label: "Item" },
          { key: "category", label: "Category" },
          { key: "unit", label: "Unit" },
          {
            key: "inwardQty",
            label: "Inward",
            render: (r) => num(r.inwardQty),
            renderExport: (r) => num(r.inwardQty),
          },
          {
            key: "issueQty",
            label: "Used",
            render: (r) => num(r.issueQty),
            renderExport: (r) => num(r.issueQty),
          },
          {
            key: "balanceQty",
            label: "Balance",
            render: (r) => num(r.balanceQty),
            renderExport: (r) => num(r.balanceQty),
          },
          {
            key: "avgRate",
            label: "Avg Rate",
            render: (r) => `₹ ${num(r.avgRate)}`,
            renderExport: (r) => num(r.avgRate),
          },
          {
            key: "balanceValue",
            label: "Stock Value",
            render: (r) => `₹ ${lakh(r.balanceValue)} L`,
            renderExport: (r) => Number(r.balanceValue || 0).toFixed(2),
          },
          {
            key: "minLevel",
            label: "Min",
            render: (r) => num(r.minLevel),
            renderExport: (r) => num(r.minLevel),
          },
          {
            key: "reorderLevel",
            label: "Reorder",
            render: (r) => num(r.reorderLevel),
            renderExport: (r) => num(r.reorderLevel),
          },
          {
            key: "avgDailyConsumption",
            label: "Daily Avg",
            render: (r) => num(r.avgDailyConsumption),
            renderExport: (r) => num(r.avgDailyConsumption),
          },
          { key: "daysRemaining", label: "Days Left" },
          { key: "status", label: "Status" },
          { key: "preferredSupplier", label: "Supplier" },
          { key: "location", label: "Location" },
        ]}
        onEdit={startEdit}
      />

      {editing && (
        <div style={modalOverlay}>
          <div style={modal}>
            <h2 style={{ marginTop: 0 }}>Edit Stores Master</h2>

            <div style={formGrid}>
              <Field label="Item Name">
                <input readOnly value={editing.itemName} style={readonlyInput} />
              </Field>

              <Field label="Category">
                <input name="category" value={editing.category} onChange={onEditChange} style={inputStyle} />
              </Field>

              <Field label="Unit">
                <input name="unit" value={editing.unit} onChange={onEditChange} style={inputStyle} />
              </Field>

              <Field label="Min Level">
                <input type="number" name="minLevel" value={editing.minLevel} onChange={onEditChange} style={inputStyle} />
              </Field>

              <Field label="Reorder Level">
                <input type="number" name="reorderLevel" value={editing.reorderLevel} onChange={onEditChange} style={inputStyle} />
              </Field>

              <Field label="Standard Rate">
                <input type="number" name="standardRate" value={editing.standardRate} onChange={onEditChange} style={inputStyle} />
              </Field>

              <Field label="Preferred Supplier">
                <input name="preferredSupplier" value={editing.preferredSupplier} onChange={onEditChange} style={inputStyle} />
              </Field>

              <Field label="Location / Rack">
                <input name="location" value={editing.location} onChange={onEditChange} style={inputStyle} />
              </Field>

              <Field label="Active">
                <select name="isActive" value={editing.isActive} onChange={onEditChange} style={inputStyle}>
                  <option value="TRUE">TRUE</option>
                  <option value="FALSE">FALSE</option>
                </select>
              </Field>

              <Field label="Remarks">
                <textarea name="remarks" value={editing.remarks} onChange={onEditChange} style={textareaStyle} />
              </Field>
            </div>

            <div style={modalButtons}>
              <button type="button" onClick={() => setEditing(null)} style={cancelButton}>
                Cancel
              </button>

              <button type="button" onClick={saveEdit} disabled={saving} style={saveButton}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ title, value, color = "#0f766e" }) {
  return (
    <div style={cardStyle}>
      <div style={cardTitle}>{title}</div>
      <div style={{ ...cardValue, color }}>{value}</div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div style={tableCardStyle}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {children}
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

function SimpleTable({ columns, rows }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={tableStyle}>
        <thead>
          <tr style={headerRowStyle}>
            {columns.map((c) => (
              <th key={c} style={th}>
                {c}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={empty}>
                No data.
              </td>
            </tr>
          ) : (
            rows.map((r, i) => (
              <tr key={i} style={rowStyle}>
                {r.map((c, j) => (
                  <td key={j} style={td}>
                    {c}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function lakh(value) {
  return (Number(value || 0) / 100000).toFixed(2);
}

function num(value) {
  return Number(value || 0).toFixed(2);
}

const page = {
  width: "100%",
  paddingBottom: 30,
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

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
  gap: 16,
  marginBottom: 20,
};

const twoCol = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(360px,1fr))",
  gap: 18,
  marginBottom: 18,
};

const cardStyle = {
  background: "white",
  padding: 18,
  borderRadius: 14,
  border: "1px solid #e5e7eb",
  boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
};

const cardTitle = {
  color: "#64748b",
  marginBottom: 8,
  fontSize: 13,
  fontWeight: 700,
};

const cardValue = {
  fontSize: 26,
  fontWeight: 900,
};

const statusStyle = {
  marginBottom: 14,
  background: "#ecfdf5",
  color: "#166534",
  border: "1px solid #bbf7d0",
  padding: 12,
  borderRadius: 10,
  fontWeight: 700,
};

const tableCardStyle = {
  background: "white",
  padding: 18,
  borderRadius: 14,
  border: "1px solid #e5e7eb",
  overflowX: "auto",
  marginBottom: 20,
  boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 900,
};

const headerRowStyle = {
  background: "#005d34",
  color: "white",
};

const th = {
  padding: "11px 12px",
  textAlign: "left",
  fontSize: 12,
  whiteSpace: "nowrap",
};

const td = {
  padding: "11px 12px",
  fontSize: 13,
  whiteSpace: "nowrap",
};

const rowStyle = {
  borderBottom: "1px solid #e5e7eb",
};

const empty = {
  padding: 18,
  textAlign: "center",
  color: "#64748b",
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

const readonlyInput = {
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