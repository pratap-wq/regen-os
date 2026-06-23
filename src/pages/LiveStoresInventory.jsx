import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";

export default function LiveStoresInventory() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("");

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

      [...consumables, ...storesMaster].forEach((x) => {
        const item = x.itemName || x.item || x.name || "";
        if (!item) return;

        masterMap[item] = {
          category: x.category || "",
          unit: x.unit || "",
          minLevel: Number(x.minLevel || 0),
          reorderLevel: Number(x.reorderLevel || 0),
          standardRate: Number(x.standardRate || x.rate || x.ratePerUnit || 0),
          supplier: x.preferredSupplier || x.supplier || x.vendor || "",
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
            balanceQty: 0,
            balanceValue: 0,
            avgRate: 0,
            minLevel: Number(master.minLevel || 0),
            reorderLevel: Number(master.reorderLevel || 0),
            supplier: master.supplier || r.supplier || "",
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
            balanceQty: 0,
            balanceValue: 0,
            avgRate: Number(master.standardRate || 0),
            minLevel: Number(master.minLevel || 0),
            reorderLevel: Number(master.reorderLevel || 0),
            supplier: master.supplier || "",
          };
        }

        map[item].issueQty += qty;
        map[item].issueValue += value;
      });

      const finalRows = Object.values(map).map((r) => {
        const balanceQty = r.inwardQty - r.issueQty;
        const balanceValue = r.inwardValue - r.issueValue;
        const avgRate =
          r.inwardQty > 0 ? r.inwardValue / r.inwardQty : r.avgRate || 0;

        const avgDailyConsumption = r.issueQty / 30;
        const daysRemaining =
          avgDailyConsumption > 0
            ? Math.floor(balanceQty / avgDailyConsumption)
            : 999;

        const effectiveMin = r.minLevel || 0;
        const effectiveReorder = r.reorderLevel || effectiveMin * 1.5;

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

    const topValueItems = [...rows]
      .sort((a, b) => b.balanceValue - a.balanceValue)
      .slice(0, 10);

    const topConsumption = [...rows]
      .sort((a, b) => b.issueValue - a.issueValue)
      .slice(0, 10);

    const lowStockList = rows
      .filter((r) => r.status !== "OK")
      .sort((a, b) => a.daysRemaining - b.daysRemaining);

    return {
      totalItems,
      criticalItems,
      lowItems,
      totalStockQty,
      totalStockValue,
      topValueItems,
      topConsumption,
      lowStockList,
    };
  }, [rows]);

  return (
    <div style={page}>
      <div style={hero}>
        <div>
          <div style={eyebrow}>Stores Intelligence</div>
          <h1 style={title}>Stores Control Tower</h1>
          <div style={subtitle}>
            Live stores inventory, stock value, min-level alerts and consumption intelligence.
          </div>
        </div>
      </div>

      <div style={gridStyle}>
        <Card title="Items" value={data.totalItems} />
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

      <Panel title="Live Stores Inventory">
        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr style={headerRowStyle}>
                <th style={th}>Item</th>
                <th style={th}>Category</th>
                <th style={th}>Unit</th>
                <th style={th}>Inward</th>
                <th style={th}>Used</th>
                <th style={th}>Balance</th>
                <th style={th}>Avg Rate</th>
                <th style={th}>Stock Value</th>
                <th style={th}>Min</th>
                <th style={th}>Reorder</th>
                <th style={th}>Daily Avg</th>
                <th style={th}>Days Left</th>
                <th style={th}>Status</th>
                <th style={th}>Supplier</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r, i) => (
                <tr key={i} style={rowStyle}>
                  <td style={td}>
                    <b>{r.itemName}</b>
                  </td>
                  <td style={td}>{r.category}</td>
                  <td style={td}>{r.unit}</td>
                  <td style={td}>{num(r.inwardQty)}</td>
                  <td style={td}>{num(r.issueQty)}</td>
                  <td style={td}>
                    <b>{num(r.balanceQty)}</b>
                  </td>
                  <td style={td}>₹ {num(r.avgRate)}</td>
                  <td style={td}>₹ {lakh(r.balanceValue)} L</td>
                  <td style={td}>{num(r.minLevel)}</td>
                  <td style={td}>{num(r.reorderLevel)}</td>
                  <td style={td}>{num(r.avgDailyConsumption)}</td>
                  <td style={td}>{r.daysRemaining}</td>
                  <td style={td}>
                    <span style={badge(r.status)}>{r.status}</span>
                  </td>
                  <td style={td}>{r.supplier}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Top Consumption by Value">
        <SimpleTable
          columns={["Item", "Used Qty", "Used Value"]}
          rows={data.topConsumption.map((r) => [
            r.itemName,
            `${num(r.issueQty)} ${r.unit || ""}`,
            `₹ ${lakh(r.issueValue)} L`,
          ])}
        />
      </Panel>
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

const empty = {
  padding: 18,
  textAlign: "center",
  color: "#64748b",
};