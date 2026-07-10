import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";

export default function InventoryDashboard() {
  const now = new Date();

  const [inventoryRows, setInventoryRows] = useState([]);
  const [loadError, setLoadError] = useState("");

  const [month, setMonth] = useState(
    String(now.getMonth() + 1).padStart(2, "0")
  );
  const [year, setYear] = useState(String(now.getFullYear()));

  async function loadData() {
    try {
      setLoadError("");
      const res = await apiCall({ fn: "inventory.liveSummary", periodMonth: `${year}-${month}`, includeStores: true });
      if (!res || res.ok !== true) throw new Error(res?.error || "Inventory could not be loaded");
      setInventoryRows(res.rows || []);
    } catch (err) {
      setLoadError(err.message || "Inventory could not be loaded");
      setInventoryRows([]);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  // Loading is intentionally keyed only by the selected accounting period.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const data = useMemo(() => {
    const sumCategory = (category, field) => inventoryRows.filter((row) => row.category === category).reduce((total, row) => total + Number(row[field] || 0), 0);
    const byCode = Object.fromEntries(inventoryRows.map((row) => [row.materialCode, row]));
    const rmPurchased = sumCategory("RM", "periodInKg");
    const rmConsumed = sumCategory("RM", "periodOutKg");
    const rmStock = sumCategory("RM", "qtyKg");
    const washed = byCode.WHITE_REGRIND_WASHED || {};
    const sorted = byCode.WHITE_SORTED_REGRIND || {};
    const washedOutput = Number(washed.periodInKg || 0);
    const washedStock = Number(washed.qtyKg || 0);
    const sortingAccepted = Number(sorted.periodInKg || 0);
    const sortingStock = Number(sorted.qtyKg || 0);
    const fgProduced = sumCategory("FG", "periodInKg");
    const fgDispatched = sumCategory("FG", "periodOutKg");
    const fgStock = sumCategory("FG", "qtyKg");
    const stores = inventoryRows.filter((row) => row.category === "STORE").map((row) => ({
      itemName: row.materialName,
      category: row.category,
      inwardQty: Number(row.periodInKg || 0),
      issueQty: Number(row.periodOutKg || 0),
      balanceQty: Number(row.qtyKg || 0),
      minLevel: 0,
      status: Number(row.qtyKg || 0) < 0 ? "CRITICAL" : "OK",
    }));

    const criticalItems = stores.filter((r) => r.status === "CRITICAL");
    const lowItems = stores.filter((r) => r.status === "LOW");
    const storesValue = stores.reduce((s, r) => s + Number(r.balanceQty || 0), 0);

    return {
      rmPurchased,
      rmConsumed,
      rmStock,
      washedOutput,
      washedStock,
      sortingAccepted,
      sortingStock,
      fgProduced,
      fgDispatched,
      fgStock,
      avgRmRate: 0,
      fgEstimatedValue: 0,
      stores,
      criticalItems,
      lowItems,
      storesValue,
      totalInventoryValue: inventoryRows.length,
    };
  }, [inventoryRows]);

  return (
    <div style={page}>
      <div style={hero}>
        <div>
          <div style={eyebrow}>Inventory Intelligence</div>
          <h1 style={title}>Inventory Dashboard</h1>
          <div style={subtitle}>
            RM, washed stock, sorting stock, finished goods and stores control.
          </div>
        </div>

        <div style={filters}>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            style={filter}
          >
            <option value="01">Jan</option>
            <option value="02">Feb</option>
            <option value="03">Mar</option>
            <option value="04">Apr</option>
            <option value="05">May</option>
            <option value="06">Jun</option>
            <option value="07">Jul</option>
            <option value="08">Aug</option>
            <option value="09">Sep</option>
            <option value="10">Oct</option>
            <option value="11">Nov</option>
            <option value="12">Dec</option>
          </select>

          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            style={filter}
          >
            <option>2025</option>
            <option>2026</option>
            <option>2027</option>
          </select>
        </div>
      </div>

      {loadError && <div style={{ color: "#991b1b", marginBottom: 16 }}>{loadError}</div>}

      <div style={kpiGrid}>
        <KPI title="RM Stock" value={`${ton(data.rmStock)} T`} />
        <KPI title="Washed Stock" value={`${ton(data.washedStock)} T`} />
        <KPI title="Sorting Stock" value={`${ton(data.sortingStock)} T`} />
        <KPI title="FG Stock" value={`${ton(data.fgStock)} T`} />
        <KPI title="Critical Stores" value={data.criticalItems.length} color="#dc2626" />
        <KPI title="Materials Tracked" value={data.totalInventoryValue} />
      </div>

      <div style={twoCol}>
        <Panel title="RM Flow">
          <Metric label="Ledger IN" value={`${ton(data.rmPurchased)} T`} />
          <Metric label="Ledger OUT" value={`${ton(data.rmConsumed)} T`} />
          <Metric label="Closing RM" value={`${ton(data.rmStock)} T`} />
          <Metric label="Source" value="Inventory Ledger" />
        </Panel>

        <Panel title="FG Flow">
          <Metric label="Ledger IN" value={`${ton(data.fgProduced)} T`} />
          <Metric label="Ledger OUT" value={`${ton(data.fgDispatched)} T`} />
          <Metric label="Closing FG" value={`${ton(data.fgStock)} T`} />
          <Metric label="Source" value="Inventory Ledger" />
        </Panel>
      </div>

      <div style={twoCol}>
        <Panel title="Stores Health">
          <Metric label="Stores Items" value={data.stores.length} />
          <Metric label="Low Stock Items" value={data.lowItems.length} color="#d97706" />
          <Metric label="Critical Items" value={data.criticalItems.length} color="#dc2626" />
          <Metric label="Stores Closing Qty" value={data.storesValue.toFixed(2)} />
        </Panel>

        <Panel title="Inventory Health">
          <Status label="RM Stock" ok={data.rmStock > 0} />
          <Status label="FG Stock" ok={data.fgStock >= 0} />
          <Status label="Stores" ok={data.criticalItems.length === 0} />
          <Status label="Ledger Materials" ok={data.totalInventoryValue > 0} />
        </Panel>
      </div>

      <Panel title="Critical / Low Stores Items">
        <div style={{ overflowX: "auto" }}>
          <table style={table}>
            <thead>
              <tr style={thead}>
                <th style={th}>Item</th>
                <th style={th}>Category</th>
                <th style={th}>Inward</th>
                <th style={th}>Issued</th>
                <th style={th}>Balance</th>
                <th style={th}>Min Level</th>
                <th style={th}>Status</th>
              </tr>
            </thead>

            <tbody>
              {[...data.criticalItems, ...data.lowItems].map((r, i) => (
                <tr key={i} style={tr}>
                  <td style={td}><b>{r.itemName}</b></td>
                  <td style={td}>{r.category}</td>
                  <td style={td}>{r.inwardQty}</td>
                  <td style={td}>{r.issueQty}</td>
                  <td style={td}><b>{r.balanceQty}</b></td>
                  <td style={td}>{r.minLevel}</td>
                  <td style={td}><span style={badge(r.status)}>{r.status}</span></td>
                </tr>
              ))}

              {[...data.criticalItems, ...data.lowItems].length === 0 && (
                <tr>
                  <td colSpan="7" style={empty}>No low or critical stores items for selected month.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function ton(kg) {
  return (Number(kg || 0) / 1000).toFixed(1);
}

function KPI({ title, value, color = "#0f766e" }) {
  return (
    <div style={kpi}>
      <div style={kpiTitle}>{title}</div>
      <div style={{ ...kpiValue, color }}>{value}</div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div style={panel}>
      <h3 style={panelTitle}>{title}</h3>
      {children}
    </div>
  );
}

function Metric({ label, value, color = "#0f172a" }) {
  return (
    <div style={metric}>
      <span>{label}</span>
      <b style={{ color }}>{value}</b>
    </div>
  );
}

function Status({ label, ok }) {
  return (
    <div style={metric}>
      <span>{label}</span>
      <span style={badge(ok ? "OK" : "CRITICAL")}>{ok ? "OK" : "Watch"}</span>
    </div>
  );
}

const badge = (status) => ({
  background:
    status === "CRITICAL" ? "#fee2e2" :
    status === "LOW" ? "#fef3c7" :
    "#dcfce7",
  color:
    status === "CRITICAL" ? "#991b1b" :
    status === "LOW" ? "#92400e" :
    "#166534",
  padding: "5px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 800,
});

const page = {
  width: "100%",
  paddingBottom: 30,
};

const hero = {
  background: "linear-gradient(135deg,#0f172a,#0f766e)",
  color: "white",
  borderRadius: 20,
  padding: 26,
  display: "flex",
  justifyContent: "space-between",
  gap: 20,
  flexWrap: "wrap",
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
  fontSize: 34,
  fontWeight: 950,
};

const subtitle = {
  opacity: 0.9,
  maxWidth: 720,
};

const filters = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

const filter = {
  height: 42,
  borderRadius: 10,
  border: "none",
  padding: "0 12px",
  fontWeight: 800,
};

const kpiGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
  gap: 16,
  marginBottom: 18,
};

const kpi = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
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
};

const twoCol = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))",
  gap: 18,
  marginBottom: 18,
};

const panel = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 20,
  marginBottom: 18,
  boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
};

const panelTitle = {
  marginTop: 0,
  marginBottom: 14,
  fontSize: 18,
  color: "#0f172a",
  fontWeight: 900,
};

const metric = {
  display: "flex",
  justifyContent: "space-between",
  gap: 14,
  padding: "10px 0",
  borderBottom: "1px solid #f1f5f9",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 780,
};

const thead = {
  background: "#0f766e",
  color: "white",
};

const th = {
  padding: 12,
  textAlign: "left",
  fontSize: 12,
};

const tr = {
  borderBottom: "1px solid #e5e7eb",
};

const td = {
  padding: 12,
  fontSize: 13,
};

const empty = {
  padding: 20,
  textAlign: "center",
  color: "#64748b",
};
