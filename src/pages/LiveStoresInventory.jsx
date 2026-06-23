import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";

export default function LiveStoresInventory() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [newMinLevel, setNewMinLevel] = useState("");
  const [localMinLevels, setLocalMinLevels] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [inwardRes, issueRes] = await Promise.all([
        apiCall({ fn: "storesInward.list" }),
        apiCall({ fn: "storesIssue.list" }),
      ]);

      const inward = inwardRes.rows || [];
      const issue = issueRes.rows || [];
      const map = {};

      inward.forEach((r) => {
        const item = r.itemName || "Unknown";

        if (!map[item]) {
          map[item] = {
            itemName: item,
            category: r.category || "",
            inwardQty: 0,
            issueQty: 0,
            balanceQty: 0,
            minLevel: Number(r.minLevel || localMinLevels[item] || 10),
            avgConsumption: 0,
            daysRemaining: 0,
            status: "OK",
            vendor: r.vendor || r.supplier || "",
          };
        }

        map[item].inwardQty += Number(r.qty || 0);
      });

      issue.forEach((r) => {
        const item = r.itemName || "Unknown";

        if (!map[item]) {
          map[item] = {
            itemName: item,
            category: r.category || "",
            inwardQty: 0,
            issueQty: 0,
            balanceQty: 0,
            minLevel: Number(localMinLevels[item] || 10),
            avgConsumption: 0,
            daysRemaining: 0,
            status: "OK",
            vendor: "",
          };
        }

        map[item].issueQty += Number(r.qty || 0);
      });

      const finalRows = Object.values(map).map((r) => {
        const effectiveMinLevel = Number(
          localMinLevels[r.itemName] || r.minLevel || 10
        );

        const balanceQty = Number(r.inwardQty || 0) - Number(r.issueQty || 0);
        const avgConsumption = Number(r.issueQty || 0) / 30;

        const daysRemaining =
          avgConsumption > 0
            ? Math.floor(balanceQty / avgConsumption)
            : 999;

        let rowStatus = "OK";

        if (balanceQty <= effectiveMinLevel) {
          rowStatus = "CRITICAL";
        } else if (balanceQty <= effectiveMinLevel * 1.5) {
          rowStatus = "LOW";
        }

        return {
          ...r,
          minLevel: effectiveMinLevel,
          balanceQty,
          avgConsumption: avgConsumption.toFixed(2),
          daysRemaining,
          status: rowStatus,
        };
      });

      setRows(finalRows);
    } catch (err) {
      console.log(err);
      setStatus("Failed loading stores inventory");
    }
  }

  function openMinLevelEdit(row) {
    setEditingItem(row.itemName);
    setNewMinLevel(row.minLevel);
  }

  function saveMinLevel() {
    if (!editingItem) return;

    const value = Number(newMinLevel || 0);

    if (value < 0) {
      alert("Min level cannot be negative");
      return;
    }

    const updatedMinLevels = {
      ...localMinLevels,
      [editingItem]: value,
    };

    setLocalMinLevels(updatedMinLevels);

    const updatedRows = rows.map((r) => {
      if (r.itemName !== editingItem) return r;

      let rowStatus = "OK";

      if (r.balanceQty <= value) {
        rowStatus = "CRITICAL";
      } else if (r.balanceQty <= value * 1.5) {
        rowStatus = "LOW";
      }

      return {
        ...r,
        minLevel: value,
        status: rowStatus,
      };
    });

    setRows(updatedRows);
    setEditingItem(null);
    setNewMinLevel("");
    setStatus(
      "Min level updated on screen. Next phase: save this permanently to Consumables Master."
    );
  }

  const totalItems = rows.length;

  const criticalItems = rows.filter((r) => r.status === "CRITICAL").length;

  const lowItems = rows.filter((r) => r.status === "LOW").length;

  const totalStock = rows.reduce((sum, r) => {
    return sum + Number(r.balanceQty || 0);
  }, 0);

  const topConsumption = useMemo(() => {
    return [...rows].sort((a, b) => b.issueQty - a.issueQty).slice(0, 5);
  }, [rows]);

  return (
    <div style={page}>
      <div style={hero}>
        <div>
          <div style={eyebrow}>Stores Intelligence</div>
          <h1 style={title}>Stores Control Tower</h1>
          <div style={subtitle}>
            Live stores inventory, min-level control, stock alerts and consumption intelligence.
          </div>
        </div>
      </div>

      <div style={gridStyle}>
        <Card title="Items" value={totalItems} />
        <Card title="Critical" value={criticalItems} color="#dc2626" />
        <Card title="Low Stock" value={lowItems} color="#d97706" />
        <Card title="Live Stock" value={totalStock.toFixed(0)} />
      </div>

      {status && <div style={statusStyle}>{status}</div>}

      <div style={tableCardStyle}>
        <div style={tableHeader}>
          <h3 style={{ margin: 0 }}>Live Stores Inventory</h3>
          <div style={{ fontSize: 13, color: "#64748b" }}>
            Edit min levels directly from this list.
          </div>
        </div>

        <table style={tableStyle}>
          <thead>
            <tr style={headerRowStyle}>
              <th style={th}>Item</th>
              <th style={th}>Category</th>
              <th style={th}>Inward</th>
              <th style={th}>Used</th>
              <th style={th}>Balance</th>
              <th style={th}>Min Level</th>
              <th style={th}>Daily Avg</th>
              <th style={th}>Days Left</th>
              <th style={th}>Status</th>
              <th style={th}>Action</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={rowStyle}>
                <td style={td}>
                  <b>{r.itemName}</b>
                </td>

                <td style={td}>{r.category}</td>
                <td style={td}>{r.inwardQty}</td>
                <td style={td}>{r.issueQty}</td>

                <td style={td}>
                  <b>{r.balanceQty}</b>
                </td>

                <td style={td}>
                  <b>{r.minLevel}</b>
                </td>

                <td style={td}>{r.avgConsumption}</td>
                <td style={td}>{r.daysRemaining}</td>

                <td style={td}>
                  <span style={badge(r.status)}>{r.status}</span>
                </td>

                <td style={td}>
                  <button onClick={() => openMinLevelEdit(r)} style={editButton}>
                    ✏ Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={tableCardStyle}>
        <h3>Top Consumptions</h3>

        <table style={tableStyle}>
          <thead>
            <tr style={headerRowStyle}>
              <th style={th}>Item</th>
              <th style={th}>Used Qty</th>
            </tr>
          </thead>

          <tbody>
            {topConsumption.map((r, i) => (
              <tr key={i} style={rowStyle}>
                <td style={td}>{r.itemName}</td>
                <td style={td}>{r.issueQty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={noteStyle}>
        <b>Next Phase:</b> Min level should be saved permanently in Consumables
        Master. For now this edit updates the current screen view and alert
        calculation.
      </div>

      {editingItem && (
        <div style={modalOverlay}>
          <div style={modal}>
            <h3 style={{ marginTop: 0 }}>Edit Minimum Level</h3>

            <div style={{ marginBottom: 12 }}>
              Item: <b>{editingItem}</b>
            </div>

            <label style={labelStyle}>Minimum Level</label>

            <input
              type="number"
              value={newMinLevel}
              onChange={(e) => setNewMinLevel(e.target.value)}
              style={modalInput}
            />

            <div style={modalButtons}>
              <button onClick={() => setEditingItem(null)} style={cancelButton}>
                Cancel
              </button>

              <button onClick={saveMinLevel} style={saveButton}>
                Save
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

const badge = (status) => ({
  background:
    status === "CRITICAL"
      ? "#fee2e2"
      : status === "LOW"
      ? "#fef3c7"
      : "#dcfce7",

  color:
    status === "CRITICAL"
      ? "#991b1b"
      : status === "LOW"
      ? "#92400e"
      : "#166534",

  padding: "5px 10px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 800,
});

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
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: 16,
  marginBottom: 20,
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

const tableHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
  marginBottom: 14,
  flexWrap: "wrap",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 950,
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

const editButton = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "7px 11px",
  borderRadius: 7,
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 12,
};

const noteStyle = {
  background: "#ecfeff",
  border: "1px solid #a5f3fc",
  padding: 15,
  borderRadius: 10,
  marginTop: 20,
  color: "#155e75",
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
  width: 360,
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
};

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  marginBottom: 6,
  color: "#334155",
};

const modalInput = {
  width: "100%",
  height: 42,
  padding: "0 12px",
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  boxSizing: "border-box",
};

const modalButtons = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  marginTop: 18,
};

const cancelButton = {
  background: "#64748b",
  color: "white",
  border: "none",
  padding: "9px 14px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
};

const saveButton = {
  background: "#0f766e",
  color: "white",
  border: "none",
  padding: "9px 14px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
};