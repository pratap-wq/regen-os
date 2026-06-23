import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";

export default function SupplierScorecard() {
  const now = new Date();

  const [rows, setRows] = useState([]);
  const [month, setMonth] = useState(
    String(now.getMonth() + 1).padStart(2, "0")
  );
  const [year, setYear] = useState(String(now.getFullYear()));

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const res = await apiCall({ fn: "rm.list" });
    setRows(
      (res.rows || []).filter(
        (r) => String(r.status || "").toUpperCase() !== "DELETED"
      )
    );
  }

  const suppliers = useMemo(() => {
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
          recovery: 0,
          moisture: 0,
          contamination: 0,
          mfi: 0,
          count: 0,
        };
      }

      const qty = Number(r.netWeight || 0);
      const rate = Number(r.ratePerKg || 0);

      map[supplier].qty += qty;
      map[supplier].value += qty * rate;
      map[supplier].recovery += Number(r.estimatedRecovery || 0);
      map[supplier].moisture += Number(r.moisture || 0);
      map[supplier].contamination += Number(r.contamination || 0);
      map[supplier].mfi += Number(r.mfi || 0);
      map[supplier].count += 1;
    });

    return Object.values(map)
      .map((s) => {
        const avgRate = s.qty > 0 ? s.value / s.qty : 0;
        const avgRecovery = s.count > 0 ? s.recovery / s.count : 0;
        const effectiveCost =
          avgRecovery > 0 ? avgRate / (avgRecovery / 100) : 0;

        return {
          ...s,
          avgRate,
          avgRecovery,
          avgMoisture: s.count > 0 ? s.moisture / s.count : 0,
          avgContamination: s.count > 0 ? s.contamination / s.count : 0,
          avgMfi: s.count > 0 ? s.mfi / s.count : 0,
          effectiveCost,
          grade: gradeSupplier(avgRecovery, s.count > 0 ? s.contamination / s.count : 0),
        };
      })
      .sort((a, b) => a.effectiveCost - b.effectiveCost);
  }, [rows, month, year]);

  return (
    <div style={page}>
      <div style={hero}>
        <div>
          <div style={eyebrow}>Supplier Intelligence</div>
          <h1 style={title}>Supplier Quality Scorecard</h1>
          <div style={subtitle}>
            Compare suppliers by quality, recovery and true effective material cost.
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
        <KPI title="Suppliers" value={suppliers.length} />
        <KPI title="Total Qty" value={`${ton(sum(suppliers, "qty"))} T`} />
        <KPI title="Best Effective Cost" value={`₹ ${bestCost(suppliers)}/kg`} />
        <KPI title="A Grade Suppliers" value={suppliers.filter((s) => s.grade === "A").length} />
      </div>

      <div style={panel}>
        <h3 style={panelTitle}>Supplier Ranking</h3>

        <div style={{ overflowX: "auto" }}>
          <table style={table}>
            <thead>
              <tr style={thead}>
                <th style={th}>Rank</th>
                <th style={th}>Supplier</th>
                <th style={th}>Qty</th>
                <th style={th}>Avg Rate</th>
                <th style={th}>Est. Recovery</th>
                <th style={th}>Effective Cost</th>
                <th style={th}>Moisture</th>
                <th style={th}>Contamination</th>
                <th style={th}>MFI</th>
                <th style={th}>Grade</th>
              </tr>
            </thead>

            <tbody>
              {suppliers.map((s, i) => (
                <tr key={s.supplier} style={tr}>
                  <td style={td}>{i + 1}</td>
                  <td style={td}><b>{s.supplier}</b></td>
                  <td style={td}>{ton(s.qty)} T</td>
                  <td style={td}>₹ {s.avgRate.toFixed(2)}</td>
                  <td style={td}>{s.avgRecovery.toFixed(1)}%</td>
                  <td style={td}><b>₹ {s.effectiveCost.toFixed(2)}</b></td>
                  <td style={td}>{s.avgMoisture.toFixed(1)}%</td>
                  <td style={td}>{s.avgContamination.toFixed(1)}%</td>
                  <td style={td}>{s.avgMfi.toFixed(1)}</td>
                  <td style={td}><span style={badge(s.grade)}>{s.grade}</span></td>
                </tr>
              ))}

              {suppliers.length === 0 && (
                <tr>
                  <td colSpan="10" style={empty}>
                    No RM inward data for selected month.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={note}>
        <b>Decision logic:</b> Effective cost = purchase rate ÷ estimated recovery.
        A cheaper supplier can become expensive if recovery is low or contamination is high.
      </div>
    </div>
  );
}

function gradeSupplier(recovery, contamination) {
  if (recovery >= 90 && contamination <= 3) return "A";
  if (recovery >= 85 && contamination <= 6) return "B";
  if (recovery >= 78 && contamination <= 10) return "C";
  return "D";
}

function sum(rows, key) {
  return rows.reduce((s, r) => s + Number(r[key] || 0), 0);
}

function ton(kg) {
  return (Number(kg || 0) / 1000).toFixed(1);
}

function bestCost(rows) {
  if (!rows.length) return "0.00";
  return Math.min(...rows.map((r) => Number(r.effectiveCost || 0))).toFixed(2);
}

function KPI({ title, value }) {
  return (
    <div style={kpi}>
      <div style={kpiTitle}>{title}</div>
      <div style={kpiValue}>{value}</div>
    </div>
  );
}

const badge = (grade) => ({
  background:
    grade === "A" ? "#dcfce7" :
    grade === "B" ? "#dbeafe" :
    grade === "C" ? "#fef3c7" :
    "#fee2e2",
  color:
    grade === "A" ? "#166534" :
    grade === "B" ? "#1e40af" :
    grade === "C" ? "#92400e" :
    "#991b1b",
  padding: "5px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 900,
});

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

const eyebrow = {
  fontSize: 13,
  textTransform: "uppercase",
  letterSpacing: 1.2,
  opacity: 0.85,
  fontWeight: 800,
};

const title = { margin: "6px 0", fontSize: 34, fontWeight: 950 };
const subtitle = { opacity: 0.9, maxWidth: 760 };
const filters = { display: "flex", gap: 10, flexWrap: "wrap" };

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
  color: "#0f766e",
};

const panel = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
};

const panelTitle = {
  marginTop: 0,
  marginBottom: 14,
  fontSize: 18,
  color: "#0f172a",
  fontWeight: 900,
};

const table = { width: "100%", borderCollapse: "collapse", minWidth: 1000 };
const thead = { background: "#0f766e", color: "white" };
const th = { padding: 12, textAlign: "left", fontSize: 12, whiteSpace: "nowrap" };
const tr = { borderBottom: "1px solid #e5e7eb" };
const td = { padding: 12, fontSize: 13, whiteSpace: "nowrap" };
const empty = { padding: 20, textAlign: "center", color: "#64748b" };

const note = {
  background: "#ecfeff",
  border: "1px solid #a5f3fc",
  padding: 15,
  borderRadius: 10,
  marginTop: 20,
  color: "#155e75",
};