import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";

export default function ProductionControlCenter() {
  const [washRows, setWashRows] = useState([]);
  const [sortingRows, setSortingRows] = useState([]);
  const [extrusionRows, setExtrusionRows] = useState([]);
  const [dispatchRows, setDispatchRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [monthlyTargetKg, setMonthlyTargetKg] = useState(500000);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [wash, sorting, extrusion, dispatch] = await Promise.all([
        apiCall({ fn: "wash.list" }),
        apiCall({ fn: "sorting.list" }),
        apiCall({ fn: "extrusion.list" }),
        apiCall({ fn: "dispatch.list" }),
      ]);

      setWashRows(wash.rows || []);
      setSortingRows(sorting.rows || []);
      setExtrusionRows(extrusion.rows || []);
      setDispatchRows(dispatch.rows || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  const dashboard = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const todayDate = now.getDate();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    function inCurrentMonth(row) {
      const d = new Date(row.date || row.createdAt || "");
      return (
        !isNaN(d.getTime()) &&
        d.getFullYear() === year &&
        d.getMonth() === month
      );
    }

    function isToday(row) {
      const d = new Date(row.date || row.createdAt || "");
      return (
        !isNaN(d.getTime()) &&
        d.getFullYear() === year &&
        d.getMonth() === month &&
        d.getDate() === todayDate
      );
    }

    const monthWash = washRows.filter(inCurrentMonth);
    const monthSorting = sortingRows.filter(inCurrentMonth);
    const monthExtrusion = extrusionRows.filter(inCurrentMonth);
    const monthDispatch = dispatchRows.filter(inCurrentMonth);

    const todayExtrusion = extrusionRows.filter(isToday);
    const todayDispatch = dispatchRows.filter(isToday);

    const washInput = sum(monthWash, "inputWeightKg");
    const washOutput = sum(monthWash, "washedOutputKg");

    const sortingInput = sum(monthSorting, "inputWeightKg");
    const sortingAccepted =
      sum(monthSorting, "acceptedQtyKg") ||
      sum(monthSorting, "whiteSortedKg") +
        sum(monthSorting, "allMixSortedKg") +
        sum(monthSorting, "commodityKg") +
        sum(monthSorting, "whiteGreyKg");

    const extrusionInput = sum(monthExtrusion, "inputWeightKg");
    const fgProduced = sum(monthExtrusion, "fgOutputKg");
    const dispatched = sum(monthDispatch, "quantityKg");

    const todayFg = sum(todayExtrusion, "fgOutputKg");
    const todayDispatchKg = sum(todayDispatch, "quantityKg");

    const targetPerDay = monthlyTargetKg / daysInMonth;
    const targetTillToday = targetPerDay * todayDate;
    const balanceKg = monthlyTargetKg - fgProduced;
    const remainingDays = Math.max(daysInMonth - todayDate, 1);
    const requiredRunRate = balanceKg > 0 ? balanceKg / remainingDays : 0;
    const actualDailyAvg = todayDate > 0 ? fgProduced / todayDate : 0;
    const achievement = monthlyTargetKg > 0 ? (fgProduced / monthlyTargetKg) * 100 : 0;
    const gap = fgProduced - targetTillToday;

    const washRecovery = washInput > 0 ? (washOutput / washInput) * 100 : 0;
    const sortingRecovery =
      sortingInput > 0 ? (sortingAccepted / sortingInput) * 100 : 0;
    const extrusionRecovery =
      extrusionInput > 0 ? (fgProduced / extrusionInput) * 100 : 0;
    const overallRecovery = washInput > 0 ? (fgProduced / washInput) * 100 : 0;

    const daily = [];

    for (let day = 1; day <= todayDate; day++) {
      const dayFg = monthExtrusion
        .filter((r) => new Date(r.date || r.createdAt || "").getDate() === day)
        .reduce((s, r) => s + Number(r.fgOutputKg || 0), 0);

      const cumulativeActual =
        daily.reduce((s, r) => s + r.actualKg, 0) + dayFg;

      const cumulativeTarget = targetPerDay * day;

      daily.push({
        day,
        actualKg: dayFg,
        cumulativeActual,
        cumulativeTarget,
        gap: cumulativeActual - cumulativeTarget,
      });
    }

    return {
      fgProduced,
      dispatched,
      todayFg,
      todayDispatchKg,
      targetPerDay,
      targetTillToday,
      balanceKg,
      requiredRunRate,
      actualDailyAvg,
      achievement,
      gap,
      washRecovery,
      sortingRecovery,
      extrusionRecovery,
      overallRecovery,
      daily,
    };
  }, [washRows, sortingRows, extrusionRows, dispatchRows, monthlyTargetKg]);

  if (loading) {
    return <div style={{ padding: 20 }}>Loading Factory Command Center...</div>;
  }

  return (
    <div style={page}>
      <div style={hero}>
        <div>
          <h1 style={heroTitle}>Factory Command Center</h1>
          <div style={heroSub}>
            Monthly target vs achieved, daily production discipline and recovery control.
          </div>
        </div>

        <div style={targetBox}>
          <div style={label}>Monthly Target KG</div>
          <input
            type="number"
            value={monthlyTargetKg}
            onChange={(e) => setMonthlyTargetKg(Number(e.target.value || 0))}
            style={targetInput}
          />
        </div>
      </div>

      <div style={kpiGrid}>
        <KPI title="MTD Production" value={`${kgToT(dashboard.fgProduced)} T`} />
        <KPI title="Monthly Target" value={`${kgToT(monthlyTargetKg)} T`} />
        <KPI title="Achievement" value={`${dashboard.achievement.toFixed(1)}%`} />
        <KPI
          title="Gap vs Target"
          value={`${kgToT(dashboard.gap)} T`}
          color={dashboard.gap >= 0 ? "#0f766e" : "#dc2626"}
        />
        <KPI title="Balance To Target" value={`${kgToT(dashboard.balanceKg)} T`} />
        <KPI title="Required Daily Run Rate" value={`${kgToT(dashboard.requiredRunRate)} T/day`} />
        <KPI title="Actual Daily Avg" value={`${kgToT(dashboard.actualDailyAvg)} T/day`} />
        <KPI title="Today FG" value={`${kgToT(dashboard.todayFg)} T`} />
      </div>

      <div style={twoCol}>
        <Card title="Recovery Dashboard">
          <Metric label="Wash Recovery" value={`${dashboard.washRecovery.toFixed(2)}%`} />
          <Metric label="Sorting Recovery" value={`${dashboard.sortingRecovery.toFixed(2)}%`} />
          <Metric label="Extrusion Recovery" value={`${dashboard.extrusionRecovery.toFixed(2)}%`} />
          <Metric label="Overall Recovery" value={`${dashboard.overallRecovery.toFixed(2)}%`} />
        </Card>

        <Card title="Live Factory Status">
          <Status label="Production" ok={dashboard.gap >= -dashboard.targetPerDay} />
          <Status label="Target Tracking" ok={dashboard.achievement >= 90} />
          <Status label="Dispatch Today" ok={dashboard.todayDispatchKg > 0} />
          <Status label="Recovery" ok={dashboard.overallRecovery >= 85} />
        </Card>
      </div>

      <Card title="Daily Target vs Achieved">
        <div style={{ overflowX: "auto" }}>
          <table style={table}>
            <thead>
              <tr style={thead}>
                <th style={th}>Day</th>
                <th style={th}>Daily FG</th>
                <th style={th}>Cumulative Target</th>
                <th style={th}>Cumulative Actual</th>
                <th style={th}>Gap</th>
                <th style={th}>Status</th>
              </tr>
            </thead>

            <tbody>
              {dashboard.daily.map((r) => (
                <tr key={r.day} style={tr}>
                  <td style={td}>{r.day}</td>
                  <td style={td}>{kgToT(r.actualKg)} T</td>
                  <td style={td}>{kgToT(r.cumulativeTarget)} T</td>
                  <td style={td}>{kgToT(r.cumulativeActual)} T</td>
                  <td
                    style={{
                      ...td,
                      color: r.gap >= 0 ? "#0f766e" : "#dc2626",
                      fontWeight: 800,
                    }}
                  >
                    {kgToT(r.gap)} T
                  </td>
                  <td style={td}>
                    <span style={badge(r.gap >= 0)}>
                      {r.gap >= 0 ? "Ahead" : "Behind"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function sum(rows, key) {
  return rows.reduce((s, r) => s + Number(r[key] || 0), 0);
}

function kgToT(value) {
  return (Number(value || 0) / 1000).toFixed(1);
}

function KPI({ title, value, color = "#0f766e" }) {
  return (
    <div style={kpi}>
      <div style={kpiTitle}>{title}</div>
      <div style={{ ...kpiValue, color }}>{value}</div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div style={card}>
      <h3 style={cardTitle}>{title}</h3>
      {children}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div style={metric}>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

function Status({ label, ok }) {
  return (
    <div style={metric}>
      <span>{label}</span>
      <span style={badge(ok)}>{ok ? "Green" : "Watch"}</span>
    </div>
  );
}

const badge = (ok) => ({
  background: ok ? "#dcfce7" : "#fee2e2",
  color: ok ? "#166534" : "#991b1b",
  padding: "5px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 800,
});

const page = {
  width: "100%",
};

const hero = {
  background: "linear-gradient(135deg,#064e3b,#0f766e)",
  color: "white",
  padding: 24,
  borderRadius: 16,
  marginBottom: 20,
  display: "flex",
  justifyContent: "space-between",
  gap: 20,
  flexWrap: "wrap",
};

const heroTitle = {
  margin: 0,
  fontSize: 32,
  fontWeight: 900,
};

const heroSub = {
  marginTop: 8,
  opacity: 0.88,
};

const targetBox = {
  minWidth: 220,
};

const label = {
  fontSize: 12,
  opacity: 0.9,
  marginBottom: 6,
};

const targetInput = {
  width: "100%",
  height: 42,
  borderRadius: 10,
  border: "none",
  padding: "0 12px",
  fontWeight: 800,
};

const kpiGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))",
  gap: 16,
  marginBottom: 20,
};

const kpi = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  boxShadow: "0 1px 5px rgba(15,23,42,0.06)",
};

const kpiTitle = {
  color: "#64748b",
  fontSize: 12,
  marginBottom: 8,
  fontWeight: 700,
};

const kpiValue = {
  fontSize: 26,
  fontWeight: 900,
};

const twoCol = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
  gap: 16,
  marginBottom: 20,
};

const card = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 20,
  boxShadow: "0 1px 5px rgba(15,23,42,0.06)",
  marginBottom: 20,
};

const cardTitle = {
  marginTop: 0,
  color: "#0f172a",
};

const metric = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  padding: "10px 0",
  borderBottom: "1px solid #f1f5f9",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 750,
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