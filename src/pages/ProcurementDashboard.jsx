import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";

export default function ProcurementDashboard() {
  const now = new Date();

  const [rows, setRows] = useState([]);
  const [month, setMonth] = useState(String(now.getMonth() + 1).padStart(2, "0"));
  const [year, setYear] = useState(String(now.getFullYear()));

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const res = await apiCall({ fn: "rm.list" });
    setRows((res.rows || []).filter((r) => String(r.status || "").toUpperCase() !== "DELETED"));
  }

  const data = useMemo(() => {
    const filtered = rows.filter((r) => {
      const d = new Date(r.date || "");
      return (
        !isNaN(d.getTime()) &&
        String(d.getFullYear()) === year &&
        String(d.getMonth() + 1).padStart(2, "0") === month
      );
    });

    const map = {};

    filtered.forEach((r) => {
      const supplier = r.supplier || "Unknown";

      if (!map[supplier]) {
        map[supplier] = {
          supplier,
          qty: 0,
          value: 0,
          moisture: 0,
          contamination: 0,
          recovery: 0,
          count: 0,
        };
      }

      const qty = Number(r.netWeight || 0);
      const rate = Number(r.ratePerKg || 0);

      map[supplier].qty += qty;
      map[supplier].value += qty * rate;
      map[supplier].moisture += Number(r.moisture || 0);
      map[supplier].contamination += Number(r.contamination || 0);
      map[supplier].recovery += Number(r.estimatedRecovery || 0);
      map[supplier].count += 1;
    });

    const suppliers = Object.values(map)
      .map((s) => ({
        ...s,
        avgRate: s.qty > 0 ? s.value / s.qty : 0,
        avgMoisture: s.count > 0 ? s.moisture / s.count : 0,
        avgContamination: s.count > 0 ? s.contamination / s.count : 0,
        avgRecovery: s.count > 0 ? s.recovery / s.count : 0,
        grade: gradeSupplier(
          s.count > 0 ? s.recovery / s.count : 0,
          s.count > 0 ? s.contamination / s.count : 0
        ),
      }))
      .sort((a, b) => b.qty - a.qty);

    return {
      filtered,
      suppliers,
      totalQty: suppliers.reduce((s, r) => s + r.qty, 0),
      totalValue: suppliers.reduce((s, r) => s + r.value, 0),
    };
  }, [rows, month, year]);

  return (
    <div style={page}>
      <div style={hero}>
        <div>
          <div style={eyebrow}>Procurement Intelligence</div>
          <h1 style={title}>Supplier Quality Dashboard</h1>
          <div style={subtitle}>
            Volume, cost, moisture, contamination and estimated recovery from RM inward data.
          </div>
        </div>

        <div style={filters}>
          <select value={month} onChange={(e) => setMonth(e.target.value)} style={filter}>
            <option value="01">Jan</option><option value="02">Feb</option><option value="03">Mar</option>
            <option value="04">Apr</option><option value="05">May</option><option value="06">Jun</option>
            <option value="07">Jul</option><option value="08">Aug</option><option value="09">Sep</option>
            <option value="10">Oct</option><option value="11">Nov</option><option value="12">Dec</option>
          </select>

          <select value={year} onChange={(e) => setYear(e.target.value)} style={filter}>
            <option>2025</option>
            <option>2026</option>
            <option>2027</option>
          </select>
        </div>
      </div>

      <div style={kpiGrid}>
        <KPI title="RM Purchased" value={`${ton(data.totalQty)} T`} />
        <KPI title="RM Value" value={`₹ ${cr(data.totalValue)} Cr`} />
        <KPI title="Suppliers" value={data.suppliers.length} />
        <KPI
          title="Average RM Rate"
          value={`₹ ${data.totalQty > 0 ? (data.totalValue / data.totalQty).toFixed(2) : "0.00"}/kg`}
        />
      </div>

      <div style={panel}>
        <h3 style={panelTitle}>Supplier Ranking</h3>

        <div style={{ overflowX: "auto" }}>
          <table style={table}>
            <thead>
              <tr style={thead}>
                <th style={th}>Supplier</th>
                <th style={th}>Volume</th>
                <th style={th}>Avg Rate</th>
                <th style={th}>Moisture</th>
                <th style={th}>Contamination</th>
                <th style={th}>Estimated Recovery</th>
                <th style={th}>Grade</th>
              </tr>
            </thead>

            <tbody>
              {data.suppliers.map((s, i) => (
                <tr key={i} style={tr}>
                  <td style={td}><b>{s.supplier}</b></td>
                  <td style={td}>{ton(s.qty)} T</td>
                  <td style={td}>₹ {s.avgRate.toFixed(2)}</td>
                  <td style={td}>{s.avgMoisture.toFixed(1)}%</td>
                  <td style={td}>{s.avgContamination.toFixed(1)}%</td>
                  <td style={td}>{s.avgRecovery.toFixed(1)}%</td>
                  <td style={td}><span style={badge(s.grade)}>{s.grade}</span></td>
                </tr>
              ))}

              {data.suppliers.length === 0 && (
                <tr>
                  <td colSpan="7" style={empty}>No RM inward data for selected month.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function gradeSupplier(recovery, contamination) {
  if (recovery >= 90 && contamination <= 3) return "Very Good";
  if (recovery >= 85 && contamination <= 6) return "Good";
  if (recovery >= 78 && contamination <= 10) return "Average";
  return "Bad";
}

function ton(kg) {
  return (Number(kg || 0) / 1000).toFixed(1);
}

function cr(value) {
  return (Number(value || 0) / 10000000).toFixed(2);
}

function KPI({ title, value }) {
  return (
    <div style={kpi}>
      <div style={kpiTitle}>{title}</div>
      <div style={kpiValue}>{value}</div>
    </div>
  );
}

const page = { width: "100%", paddingBottom: 30 };

const hero = {
  background: "linear-gradient(135deg,#1e3a8a,#0f766e)",
  color: "white",
  borderRadius: 20,
  padding: 26,
  display: "flex",
  justifyContent: "space-between",
  gap: 20,
  flexWrap: "wrap",
  marginBottom: 20,
};

const eyebrow = { fontSize: 13, textTransform: "uppercase", letterSpacing: 1.2, opacity: 0.85, fontWeight: 800 };
const title = { margin: "6px 0", fontSize: 34, fontWeight: 950 };
const subtitle = { opacity: 0.9, maxWidth: 720 };
const filters = { display: "flex", gap: 10, flexWrap: "wrap" };
const filter = { height: 42, borderRadius: 10, border: "none", padding: "0 12px", fontWeight: 800 };

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

const kpiTitle = { color: "#64748b", fontSize: 12, fontWeight: 800, textTransform: "uppercase", marginBottom: 8 };
const kpiValue = { fontSize: 28, fontWeight: 950, color: "#0f766e" };

const panel = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
};

const panelTitle = { marginTop: 0, marginBottom: 14, fontSize: 18, color: "#0f172a", fontWeight: 900 };

const table = { width: "100%", borderCollapse: "collapse", minWidth: 850 };
const thead = { background: "#0f766e", color: "white" };
const th = { padding: 12, textAlign: "left", fontSize: 12 };
const tr = { borderBottom: "1px solid #e5e7eb" };
const td = { padding: 12, fontSize: 13 };
const empty = { padding: 20, textAlign: "center", color: "#64748b" };

const badge = (grade) => ({
  background:
    grade === "Very Good" ? "#dcfce7" :
    grade === "Good" ? "#dbeafe" :
    grade === "Average" ? "#fef3c7" :
    "#fee2e2",
  color:
    grade === "Very Good" ? "#166534" :
    grade === "Good" ? "#1e40af" :
    grade === "Average" ? "#92400e" :
    "#991b1b",
  padding: "5px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 800,
});