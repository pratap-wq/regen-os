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

  function n(v) {
    return Number(v || 0);
  }

  function dateForInput(value) {
    if (!value) return "";
    const text = String(value).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
    return text.slice(0, 10);
  }

  function inSelectedMonth(r) {
    const clean = dateForInput(r.date);
    if (!clean) return false;
    const [y, m] = clean.split("-");
    return String(y) === year && String(m) === month;
  }

  const data = useMemo(() => {
    const filtered = rows.filter(inSelectedMonth);

    const supplierMap = {};
    const materialMap = {};

    filtered.forEach((r) => {
      const supplier = r.supplier || "Unknown";
      const material = r.material || "Unknown";
      const qty = n(r.netWeight);
      const rate = n(r.ratePerKg);
      const value = qty * rate;
      const recovery = n(r.estimatedRecovery);
      const moisture = n(r.moisture);
      const contamination = n(r.contamination);

      if (!supplierMap[supplier]) {
        supplierMap[supplier] = {
          supplier,
          qty: 0,
          value: 0,
          moisture: 0,
          contamination: 0,
          recovery: 0,
          count: 0,
        };
      }

      supplierMap[supplier].qty += qty;
      supplierMap[supplier].value += value;
      supplierMap[supplier].moisture += moisture;
      supplierMap[supplier].contamination += contamination;
      supplierMap[supplier].recovery += recovery;
      supplierMap[supplier].count += 1;

      if (!materialMap[material]) {
        materialMap[material] = {
          material,
          qty: 0,
          value: 0,
          count: 0,
        };
      }

      materialMap[material].qty += qty;
      materialMap[material].value += value;
      materialMap[material].count += 1;
    });

    const suppliers = Object.values(supplierMap)
      .map((s) => {
        const avgRate = s.qty > 0 ? s.value / s.qty : 0;
        const avgMoisture = s.count > 0 ? s.moisture / s.count : 0;
        const avgContamination = s.count > 0 ? s.contamination / s.count : 0;
        const avgRecovery = s.count > 0 ? s.recovery / s.count : 0;
        const effectiveCost =
          avgRecovery > 0 ? avgRate / (avgRecovery / 100) : avgRate;

        return {
          ...s,
          avgRate,
          avgMoisture,
          avgContamination,
          avgRecovery,
          effectiveCost,
          grade: gradeSupplier(avgRecovery, avgContamination, effectiveCost),
        };
      })
      .sort((a, b) => a.effectiveCost - b.effectiveCost);

    const materials = Object.values(materialMap)
      .map((m) => ({
        ...m,
        avgRate: m.qty > 0 ? m.value / m.qty : 0,
      }))
      .sort((a, b) => b.qty - a.qty);

    const totalQty = filtered.reduce((s, r) => s + n(r.netWeight), 0);
    const totalValue = filtered.reduce((s, r) => s + n(r.netWeight) * n(r.ratePerKg), 0);
    const avgRate = totalQty > 0 ? totalValue / totalQty : 0;

    const avgRecovery =
      suppliers.length > 0
        ? suppliers.reduce((s, r) => s + r.avgRecovery * r.qty, 0) / totalQty
        : 0;

    const weightedEffectiveCost =
      suppliers.length > 0
        ? suppliers.reduce((s, r) => s + r.effectiveCost * r.qty, 0) / totalQty
        : 0;

    const bestSupplier = suppliers[0];

    return {
      filtered,
      suppliers,
      materials,
      totalQty,
      totalValue,
      avgRate,
      avgRecovery,
      weightedEffectiveCost,
      bestSupplier,
    };
  }, [rows, month, year]);

  return (
    <div style={page}>
      <div style={hero}>
        <div>
          <div style={eyebrow}>Procurement Intelligence</div>
          <h1 style={title}>Supplier Cost & Recovery Dashboard</h1>
          <div style={subtitle}>
            Supplier ranking by volume, average rate, recovery and effective cost/kg.
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
        <KPI title="Avg Buy Rate" value={`₹ ${data.avgRate.toFixed(2)}/kg`} />
        <KPI title="Avg Recovery" value={`${data.avgRecovery.toFixed(1)}%`} />
        <KPI title="Effective Cost/kg" value={`₹ ${data.weightedEffectiveCost.toFixed(2)}`} color="#b45309" />
        <KPI title="Best Supplier" value={data.bestSupplier?.supplier || "-"} color="#2563eb" />
      </div>
      <div style={twoCol}>
        <Panel title="Material Volume Mix">
          {data.materials.length === 0 ? (
            <div style={empty}>No material data for selected month.</div>
          ) : (
            data.materials.map((m, i) => (
              <div key={i} style={rowLine}>
                <div>
                  <b>{m.material}</b>
                  <div style={muted}>{m.count} entries</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <b>{ton(m.qty)} T</b>
                  <div style={muted}>₹ {m.avgRate.toFixed(2)}/kg</div>
                </div>
              </div>
            ))
          )}
        </Panel>

        <Panel title="Procurement Recommendation">
          <Metric label="Best Effective Supplier" value={data.bestSupplier?.supplier || "-"} />
          <Metric label="Best Avg Rate" value={`₹ ${data.bestSupplier?.avgRate?.toFixed(2) || "0.00"}/kg`} />
          <Metric label="Best Recovery" value={`${data.bestSupplier?.avgRecovery?.toFixed(1) || "0.0"}%`} />
          <Metric label="Best Effective Cost" value={`₹ ${data.bestSupplier?.effectiveCost?.toFixed(2) || "0.00"}/kg`} color="#0f766e" />
          <div style={note}>
            Effective cost = purchase rate adjusted by estimated recovery. Lower effective cost is better.
          </div>
        </Panel>
      </div>

      <div style={panel}>
        <h3 style={panelTitle}>Supplier Effective Cost Ranking</h3>

        <div style={{ overflowX: "auto" }}>
          <table style={table}>
            <thead>
              <tr style={thead}>
                <th style={th}>Supplier</th>
                <th style={th}>Volume</th>
                <th style={th}>Avg Rate</th>
                <th style={th}>Recovery</th>
                <th style={th}>Effective Cost/kg</th>
                <th style={th}>Moisture</th>
                <th style={th}>Contamination</th>
                <th style={th}>Grade</th>
              </tr>
            </thead>

            <tbody>
              {data.suppliers.map((s, i) => (
                <tr key={i} style={tr}>
                  <td style={td}><b>{s.supplier}</b></td>
                  <td style={td}>{ton(s.qty)} T</td>
                  <td style={td}>₹ {s.avgRate.toFixed(2)}</td>
                  <td style={td}>{s.avgRecovery.toFixed(1)}%</td>
                  <td style={td}><b>₹ {s.effectiveCost.toFixed(2)}</b></td>
                  <td style={td}>{s.avgMoisture.toFixed(1)}%</td>
                  <td style={td}>{s.avgContamination.toFixed(1)}%</td>
                  <td style={td}><span style={badge(s.grade)}>{s.grade}</span></td>
                </tr>
              ))}

              {data.suppliers.length === 0 && (
                <tr>
                  <td colSpan="8" style={empty}>No RM inward data for selected month.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function gradeSupplier(recovery, contamination, effectiveCost) {
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

const twoCol = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))",
  gap: 18,
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
const kpiValue = { fontSize: 28, fontWeight: 950 };

const panel = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
};

const panelTitle = { marginTop: 0, marginBottom: 14, fontSize: 18, color: "#0f172a", fontWeight: 900 };

const metric = {
  display: "flex",
  justifyContent: "space-between",
  gap: 14,
  padding: "10px 0",
  borderBottom: "1px solid #f1f5f9",
};

const rowLine = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  padding: "11px 0",
  borderBottom: "1px solid #f1f5f9",
};

const muted = {
  color: "#64748b",
  fontSize: 12,
  marginTop: 3,
};

const note = {
  marginTop: 14,
  background: "#f8fafc",
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  padding: 12,
  color: "#475569",
  fontSize: 13,
};

const table = { width: "100%", borderCollapse: "collapse", minWidth: 950 };
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