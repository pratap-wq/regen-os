import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";

export default function InventoryDashboard() {
  const now = new Date();

  const [rmRows, setRmRows] = useState([]);
  const [washRows, setWashRows] = useState([]);
  const [sortingRows, setSortingRows] = useState([]);
  const [extrusionRows, setExtrusionRows] = useState([]);
  const [dispatchRows, setDispatchRows] = useState([]);
  const [storesInwardRows, setStoresInwardRows] = useState([]);
  const [storesIssueRows, setStoresIssueRows] = useState([]);

  const [month, setMonth] = useState(
    String(now.getMonth() + 1).padStart(2, "0")
  );
  const [year, setYear] = useState(String(now.getFullYear()));

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
    const [rm, wash, sorting, extrusion, dispatch, storesInward, storesIssue] =
      await Promise.all([
        safeLoad("rm.list"),
        safeLoad("wash.list"),
        safeLoad("sorting.list"),
        safeLoad("extrusion.list"),
        safeLoad("dispatch.list"),
        safeLoad("storesInward.list"),
        safeLoad("storesIssue.list"),
      ]);

    setRmRows(rm);
    setWashRows(wash);
    setSortingRows(sorting);
    setExtrusionRows(extrusion);
    setDispatchRows(dispatch);
    setStoresInwardRows(storesInward);
    setStoresIssueRows(storesIssue);
  }

  function inSelectedMonth(row) {
    const d = new Date(row.date || row.createdAt || "");
    if (isNaN(d.getTime())) return false;

    return (
      String(d.getFullYear()) === year &&
      String(d.getMonth() + 1).padStart(2, "0") === month
    );
  }

  const data = useMemo(() => {
    const rm = rmRows.filter(
      (r) => String(r.status || "").toUpperCase() !== "DELETED"
    );
    const wash = washRows.filter(inSelectedMonth);
    const sorting = sortingRows.filter(inSelectedMonth);
    const extrusion = extrusionRows.filter(inSelectedMonth);
    const dispatch = dispatchRows.filter(inSelectedMonth);
    const storesInward = storesInwardRows.filter(inSelectedMonth);
    const storesIssue = storesIssueRows.filter(inSelectedMonth);

    const rmPurchased = sum(rm.filter(inSelectedMonth), "netWeight");
    const rmConsumed = sum(wash, "inputWeightKg");

    const washedOutput = sum(wash, "washedOutputKg");
    const sortingInput = sum(sorting, "inputWeightKg");

    const sortingAccepted =
      sum(sorting, "acceptedQtyKg") ||
      sum(sorting, "whiteSortedKg") +
        sum(sorting, "allMixSortedKg") +
        sum(sorting, "commodityKg") +
        sum(sorting, "whiteGreyKg");

    const extrusionInput = sum(extrusion, "inputWeightKg");
    const fgProduced = sum(extrusion, "fgOutputKg");
    const fgDispatched = sum(dispatch, "quantityKg");

    const rmStock = rmPurchased - rmConsumed;
    const washedStock = washedOutput - sortingInput;
    const sortingStock = sortingAccepted - extrusionInput;
    const fgStock = fgProduced - fgDispatched;

    const rmValue = rm
      .filter(inSelectedMonth)
      .reduce(
        (s, r) => s + Number(r.netWeight || 0) * Number(r.ratePerKg || 0),
        0
      );

    const avgRmRate = rmPurchased > 0 ? rmValue / rmPurchased : 0;
    const fgEstimatedValue = fgStock * avgRmRate;

    const storeMap = {};

    storesInward.forEach((r) => {
      const item = r.itemName || "Unknown";

      if (!storeMap[item]) {
        storeMap[item] = {
          itemName: item,
          category: r.category || "",
          inwardQty: 0,
          issueQty: 0,
          balanceQty: 0,
          value: 0,
          minLevel: Number(r.minLevel || 10),
        };
      }

      storeMap[item].inwardQty += Number(r.qty || 0);
      storeMap[item].value += Number(r.totalAmount || 0);
    });

    storesIssue.forEach((r) => {
      const item = r.itemName || "Unknown";

      if (!storeMap[item]) {
        storeMap[item] = {
          itemName: item,
          category: r.category || "",
          inwardQty: 0,
          issueQty: 0,
          balanceQty: 0,
          value: 0,
          minLevel: 10,
        };
      }

      storeMap[item].issueQty += Number(r.qty || 0);
    });

    const stores = Object.values(storeMap).map((r) => {
      const balanceQty = r.inwardQty - r.issueQty;
      const avgRate = r.inwardQty > 0 ? r.value / r.inwardQty : 0;
      const balanceValue = balanceQty * avgRate;

      let status = "OK";
      if (balanceQty <= r.minLevel) status = "CRITICAL";
      else if (balanceQty <= r.minLevel * 1.5) status = "LOW";

      return {
        ...r,
        balanceQty,
        avgRate,
        balanceValue,
        status,
      };
    });

    const criticalItems = stores.filter((r) => r.status === "CRITICAL");
    const lowItems = stores.filter((r) => r.status === "LOW");
    const storesValue = stores.reduce(
      (s, r) => s + Number(r.balanceValue || 0),
      0
    );

    const totalInventoryValue =
      rmStock * avgRmRate + fgEstimatedValue + storesValue;

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
      rmValue,
      avgRmRate,
      fgEstimatedValue,
      stores,
      criticalItems,
      lowItems,
      storesValue,
      totalInventoryValue,
    };
  }, [
    rmRows,
    washRows,
    sortingRows,
    extrusionRows,
    dispatchRows,
    storesInwardRows,
    storesIssueRows,
    month,
    year,
  ]);

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

      <div style={kpiGrid}>
        <KPI title="RM Stock" value={`${ton(data.rmStock)} T`} />
        <KPI title="Washed Stock" value={`${ton(data.washedStock)} T`} />
        <KPI title="Sorting Stock" value={`${ton(data.sortingStock)} T`} />
        <KPI title="FG Stock" value={`${ton(data.fgStock)} T`} />
        <KPI title="Critical Stores" value={data.criticalItems.length} color="#dc2626" />
        <KPI title="Inventory Value" value={`₹ ${cr(data.totalInventoryValue)} Cr`} />
      </div>

      <div style={twoCol}>
        <Panel title="RM Flow">
          <Metric label="Purchased" value={`${ton(data.rmPurchased)} T`} />
          <Metric label="Consumed" value={`${ton(data.rmConsumed)} T`} />
          <Metric label="Closing RM" value={`${ton(data.rmStock)} T`} />
          <Metric label="Avg RM Rate" value={`₹ ${data.avgRmRate.toFixed(2)}/kg`} />
        </Panel>

        <Panel title="FG Flow">
          <Metric label="Produced" value={`${ton(data.fgProduced)} T`} />
          <Metric label="Dispatched" value={`${ton(data.fgDispatched)} T`} />
          <Metric label="Closing FG" value={`${ton(data.fgStock)} T`} />
          <Metric label="Estimated FG Value" value={`₹ ${lakh(data.fgEstimatedValue)} L`} />
        </Panel>
      </div>

      <div style={twoCol}>
        <Panel title="Stores Health">
          <Metric label="Stores Items" value={data.stores.length} />
          <Metric label="Low Stock Items" value={data.lowItems.length} color="#d97706" />
          <Metric label="Critical Items" value={data.criticalItems.length} color="#dc2626" />
          <Metric label="Stores Value" value={`₹ ${lakh(data.storesValue)} L`} />
        </Panel>

        <Panel title="Inventory Health">
          <Status label="RM Stock" ok={data.rmStock > 0} />
          <Status label="FG Stock" ok={data.fgStock >= 0} />
          <Status label="Stores" ok={data.criticalItems.length === 0} />
          <Status label="Working Capital Lock" ok={data.totalInventoryValue > 0} />
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

function sum(rows, key) {
  return rows.reduce((s, r) => s + Number(r[key] || 0), 0);
}

function ton(kg) {
  return (Number(kg || 0) / 1000).toFixed(1);
}

function cr(value) {
  return (Number(value || 0) / 10000000).toFixed(2);
}

function lakh(value) {
  return (Number(value || 0) / 100000).toFixed(1);
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