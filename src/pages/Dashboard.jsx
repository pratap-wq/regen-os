import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";

export default function Dashboard() {
  const now = new Date();

  const [rmRows, setRmRows] = useState([]);
  const [washRows, setWashRows] = useState([]);
  const [extrusionRows, setExtrusionRows] = useState([]);
  const [dispatchRows, setDispatchRows] = useState([]);
  const [storesInwardRows, setStoresInwardRows] = useState([]);
  const [storesIssueRows, setStoresIssueRows] = useState([]);
  const [factoryExpenseRows, setFactoryExpenseRows] = useState([]);
  const [consumableRows, setConsumableRows] = useState([]);

  const [month, setMonth] = useState(
    String(now.getMonth() + 1).padStart(2, "0")
  );
  const [year, setYear] = useState(String(now.getFullYear()));
  const [monthlyTargetKg, setMonthlyTargetKg] = useState(500000);

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
    const [
      rm,
      wash,
      extrusion,
      dispatch,
      inward,
      issue,
      factoryExpenses,
      consumables,
    ] = await Promise.all([
      safeLoad("rm.list"),
      safeLoad("wash.list"),
      safeLoad("extrusion.list"),
      safeLoad("dispatch.list"),
      safeLoad("storesInward.list"),
      safeLoad("storesIssue.list"),
      safeLoad("factoryExpenses.list"),
      safeLoad("consumables.list"),
    ]);

    setRmRows(rm);
    setWashRows(wash);
    setExtrusionRows(extrusion);
    setDispatchRows(dispatch);
    setStoresInwardRows(inward);
    setStoresIssueRows(issue);
    setFactoryExpenseRows(factoryExpenses);
    setConsumableRows(consumables);
  }

  function inSelectedMonth(row) {
    const d = new Date(row.date || row.createdAt || "");
    if (isNaN(d.getTime())) return false;

    return (
      String(d.getFullYear()) === year &&
      String(d.getMonth() + 1).padStart(2, "0") === month
    );
  }

  function getItemRate(itemName) {
    const master = consumableRows.find(
      (x) => String(x.itemName) === String(itemName)
    );

    if (master && Number(master.standardRate || 0) > 0) {
      return Number(master.standardRate || 0);
    }

    const inwardForItem = storesInwardRows.filter(
      (x) =>
        String(x.itemName) === String(itemName) &&
        Number(x.rate || 0) > 0
    );

    const totalQty = inwardForItem.reduce(
      (s, r) => s + Number(r.qty || 0),
      0
    );

    const totalValue = inwardForItem.reduce(
      (s, r) =>
        s +
        Number(r.totalAmount || Number(r.qty || 0) * Number(r.rate || 0)),
      0
    );

    return totalQty > 0 ? totalValue / totalQty : 0;
  }

  const data = useMemo(() => {
    const m = Number(month);
    const y = Number(year);
    const daysInMonth = new Date(y, m, 0).getDate();
    const isCurrentMonth =
      y === now.getFullYear() && m === now.getMonth() + 1;
    const currentDay = isCurrentMonth ? now.getDate() : daysInMonth;

    const rm = rmRows.filter(inSelectedMonth);
    const wash = washRows.filter(inSelectedMonth);
    const extrusion = extrusionRows.filter(inSelectedMonth);
    const dispatch = dispatchRows.filter(inSelectedMonth);
    const storesInward = storesInwardRows.filter(inSelectedMonth);
    const storesIssue = storesIssueRows.filter(inSelectedMonth);
    const factoryExpenses = factoryExpenseRows.filter(inSelectedMonth);

    const rmPurchased = sum(rm, "netWeight");
    const rmValue = rm.reduce(
      (s, r) => s + Number(r.netWeight || 0) * Number(r.ratePerKg || 0),
      0
    );

    const washInput = sum(wash, "inputWeightKg");
    const washOutput = sum(wash, "washedOutputKg");

    const fgProduced = sum(extrusion, "fgOutputKg");
    const extrusionInput = sum(extrusion, "inputWeightKg");

    const dispatched = sum(dispatch, "quantityKg");
    const revenue = dispatch.reduce(
      (s, r) => s + Number(r.quantityKg || 0) * Number(r.ratePerKg || 0),
      0
    );

    const storesInwardValue = storesInward.reduce(
      (s, r) =>
        s +
        Number(r.totalAmount || Number(r.qty || 0) * Number(r.rate || 0)),
      0
    );

    const storesIssueQty = sum(storesIssue, "qty");

    const storesIssueValue = storesIssue.reduce((s, r) => {
      const rate =
        Number(r.issueRate || 0) ||
        Number(r.rate || 0) ||
        getItemRate(r.itemName);

      return s + Number(r.issueValue || Number(r.qty || 0) * rate);
    }, 0);

    const factoryExpenseValue = factoryExpenses.reduce(
      (s, r) =>
        s +
        Number(
          r.amount ||
            r.expenseAmount ||
            r.totalAmount ||
            r.value ||
            0
        ),
      0
    );

    const avgRmRate = rmPurchased > 0 ? rmValue / rmPurchased : 0;
    const avgSaleRate = dispatched > 0 ? revenue / dispatched : 0;

    const estimatedRmConsumedValue = washInput * avgRmRate;
    const grossContribution = revenue - estimatedRmConsumedValue;

    const storesCostPerKg =
      fgProduced > 0 ? storesIssueValue / fgProduced : 0;

    const factoryCostPerKg =
      fgProduced > 0 ? factoryExpenseValue / fgProduced : 0;

    const estimatedProfit =
      revenue -
      estimatedRmConsumedValue -
      storesIssueValue -
      factoryExpenseValue;

    const profitPerKg = fgProduced > 0 ? estimatedProfit / fgProduced : 0;

    const overallRecovery =
      washInput > 0 ? (fgProduced / washInput) * 100 : 0;

    const extrusionRecovery =
      extrusionInput > 0 ? (fgProduced / extrusionInput) * 100 : 0;

    const achievement =
      monthlyTargetKg > 0 ? (fgProduced / monthlyTargetKg) * 100 : 0;

    const phase2TargetKg = 900000;
    const phase2Achievement =
      phase2TargetKg > 0 ? (fgProduced / phase2TargetKg) * 100 : 0;

    const targetTillDate = (monthlyTargetKg / daysInMonth) * currentDay;
    const gap = fgProduced - targetTillDate;
    const balance = Math.max(monthlyTargetKg - fgProduced, 0);
    const remainingDays = Math.max(daysInMonth - currentDay, 1);
    const requiredRunRate = balance / remainingDays;
    const actualDailyAvg = currentDay > 0 ? fgProduced / currentDay : 0;

    const rmClosing = rmPurchased - washInput;
    const fgClosing = fgProduced - dispatched;

    const daily = [];
    let cumulativeActual = 0;

    for (let day = 1; day <= currentDay; day++) {
      const actualKg = extrusion
        .filter((r) => {
          const d = new Date(r.date || r.createdAt || "");
          return !isNaN(d.getTime()) && d.getDate() === day;
        })
        .reduce((s, r) => s + Number(r.fgOutputKg || 0), 0);

      cumulativeActual += actualKg;

      daily.push({
        day,
        target: (monthlyTargetKg / daysInMonth) * day,
        actual: cumulativeActual,
        actualKg,
        gap: cumulativeActual - (monthlyTargetKg / daysInMonth) * day,
      });
    }

    const supplierMap = {};

    rm.forEach((r) => {
      const supplier = r.supplier || "Unknown";

      if (!supplierMap[supplier]) {
        supplierMap[supplier] = {
          supplier,
          qty: 0,
          value: 0,
          moisture: 0,
          contamination: 0,
          count: 0,
        };
      }

      supplierMap[supplier].qty += Number(r.netWeight || 0);
      supplierMap[supplier].value +=
        Number(r.netWeight || 0) * Number(r.ratePerKg || 0);
      supplierMap[supplier].moisture += Number(r.moisture || 0);
      supplierMap[supplier].contamination += Number(r.contamination || 0);
      supplierMap[supplier].count += 1;
    });

    const suppliers = Object.values(supplierMap)
      .map((s) => ({
        ...s,
        avgRate: s.qty > 0 ? s.value / s.qty : 0,
        avgMoisture: s.count > 0 ? s.moisture / s.count : 0,
        avgContamination: s.count > 0 ? s.contamination / s.count : 0,
      }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    const consumableMap = {};

    storesIssue.forEach((r) => {
      const item = r.itemName || "Unknown";
      const rate =
        Number(r.issueRate || 0) ||
        Number(r.rate || 0) ||
        getItemRate(item);

      const value = Number(r.issueValue || Number(r.qty || 0) * rate);

      if (!consumableMap[item]) {
        consumableMap[item] = {
          itemName: item,
          category: r.category || "",
          qty: 0,
          value: 0,
        };
      }

      consumableMap[item].qty += Number(r.qty || 0);
      consumableMap[item].value += value;
    });

    const topConsumables = Object.values(consumableMap)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    return {
      rmPurchased,
      rmValue,
      washInput,
      washOutput,
      fgProduced,
      extrusionInput,
      dispatched,
      revenue,
      storesInwardValue,
      storesIssueQty,
      storesIssueValue,
      storesCostPerKg,
      factoryExpenseValue,
      factoryCostPerKg,
      avgRmRate,
      avgSaleRate,
      estimatedRmConsumedValue,
      grossContribution,
      estimatedProfit,
      profitPerKg,
      overallRecovery,
      extrusionRecovery,
      achievement,
      phase2Achievement,
      targetTillDate,
      gap,
      balance,
      requiredRunRate,
      actualDailyAvg,
      rmClosing,
      fgClosing,
      daily,
      suppliers,
      topConsumables,
      daysInMonth,
      currentDay,
    };
  }, [
    rmRows,
    washRows,
    extrusionRows,
    dispatchRows,
    storesInwardRows,
    storesIssueRows,
    factoryExpenseRows,
    consumableRows,
    month,
    year,
    monthlyTargetKg,
  ]);

  return (
    <div style={page}>
      <div style={hero}>
        <div>
          <div style={eyebrow}>Executive Dashboard</div>
          <h1 style={title}>Regenplastics Command Center</h1>
          <div style={subtitle}>
            Monthly production, revenue, recovery, stores cost and profitability intelligence.
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

          <input
            type="number"
            value={monthlyTargetKg}
            onChange={(e) => setMonthlyTargetKg(Number(e.target.value || 0))}
            style={targetInput}
            title="Monthly Target Kg"
          />
        </div>
      </div>

      <div style={kpiGrid}>
        <KPI title="Production MTD" value={`${ton(data.fgProduced)} T`} />
        <KPI title="Target" value={`${ton(monthlyTargetKg)} T`} />
        <KPI title="Achievement" value={`${data.achievement.toFixed(1)}%`} />
        <KPI title="900T Progress" value={`${data.phase2Achievement.toFixed(1)}%`} />
        <KPI title="Revenue" value={`₹ ${cr(data.revenue)} Cr`} color="#16a34a" />
        <KPI title="Gross Contribution" value={`₹ ${lakh(data.grossContribution)} L`} color="#2563eb" />
        <KPI title="Stores Cost" value={`₹ ${lakh(data.storesIssueValue)} L`} color="#dc2626" />
        <KPI title="Stores Cost/Kg" value={`₹ ${data.storesCostPerKg.toFixed(2)}`} color="#b45309" />
        <KPI title="Factory Expenses" value={`₹ ${lakh(data.factoryExpenseValue)} L`} color="#7c3aed" />
        <KPI title="Factory Cost/Kg" value={`₹ ${data.factoryCostPerKg.toFixed(2)}`} color="#7c3aed" />
        <KPI title="Estimated Profit" value={`₹ ${lakh(data.estimatedProfit)} L`} color={data.estimatedProfit >= 0 ? "#16a34a" : "#dc2626"} />
        <KPI title="Profit/Kg" value={`₹ ${data.profitPerKg.toFixed(2)}`} color={data.profitPerKg >= 0 ? "#16a34a" : "#dc2626"} />
      </div>

      <div style={twoCol}>
        <Panel title="Monthly Target Tracking">
          <Progress percent={data.achievement} />
          <Metric label="Achieved" value={`${ton(data.fgProduced)} T`} />
          <Metric label="Target Till Date" value={`${ton(data.targetTillDate)} T`} />
          <Metric
            label="Gap"
            value={`${ton(data.gap)} T`}
            color={data.gap >= 0 ? "#0f766e" : "#dc2626"}
          />
          <Metric label="Balance" value={`${ton(data.balance)} T`} />
          <Metric label="Required Run Rate" value={`${ton(data.requiredRunRate)} T/day`} />
          <Metric label="Actual Daily Average" value={`${ton(data.actualDailyAvg)} T/day`} />
        </Panel>

        <Panel title="Profitability Snapshot">
          <Metric label="Revenue" value={`₹ ${lakh(data.revenue)} L`} color="#16a34a" />
          <Metric label="Estimated RM Consumed" value={`₹ ${lakh(data.estimatedRmConsumedValue)} L`} />
          <Metric label="Stores Issue Value" value={`₹ ${lakh(data.storesIssueValue)} L`} color="#dc2626" />
          <Metric label="Factory Expenses" value={`₹ ${lakh(data.factoryExpenseValue)} L`} color="#7c3aed" />
          <Divider />
          <Metric
            label="Estimated Profit"
            value={`₹ ${lakh(data.estimatedProfit)} L`}
            color={data.estimatedProfit >= 0 ? "#0f766e" : "#dc2626"}
          />
          <Metric
            label="Profit / Kg"
            value={`₹ ${data.profitPerKg.toFixed(2)}`}
            color={data.profitPerKg >= 0 ? "#0f766e" : "#dc2626"}
          />
        </Panel>
      </div>

      <div style={twoCol}>
        <Panel title="Material Flow">
          <FlowRow label="RM Purchased" value={`${ton(data.rmPurchased)} T`} />
          <FlowRow label="RM Consumed" value={`${ton(data.washInput)} T`} />
          <FlowRow label="RM Closing" value={`${ton(data.rmClosing)} T`} />
          <Divider />
          <FlowRow label="FG Produced" value={`${ton(data.fgProduced)} T`} />
          <FlowRow label="Dispatched" value={`${ton(data.dispatched)} T`} />
          <FlowRow label="FG Closing" value={`${ton(data.fgClosing)} T`} />
        </Panel>

        <Panel title="Recovery & Cost Control">
          <Metric label="Wash-to-FG Recovery" value={`${data.overallRecovery.toFixed(1)}%`} color="#d97706" />
          <Metric label="Extrusion Recovery" value={`${data.extrusionRecovery.toFixed(1)}%`} color="#d97706" />
          <Metric label="Average RM Rate" value={`₹ ${data.avgRmRate.toFixed(2)}/kg`} />
          <Metric label="Average Sale Rate" value={`₹ ${data.avgSaleRate.toFixed(2)}/kg`} />
          <Metric label="Stores Cost / Kg" value={`₹ ${data.storesCostPerKg.toFixed(2)}`} color="#b45309" />
          <Metric label="Factory Cost / Kg" value={`₹ ${data.factoryCostPerKg.toFixed(2)}`} color="#7c3aed" />
        </Panel>
      </div>

      <Panel title="Daily Cumulative Target vs Actual">
        <div style={chartWrap}>
          {data.daily.map((d) => {
            const targetPercent =
              monthlyTargetKg > 0 ? (d.target / monthlyTargetKg) * 100 : 0;
            const actualPercent =
              monthlyTargetKg > 0 ? (d.actual / monthlyTargetKg) * 100 : 0;

            return (
              <div key={d.day} style={dayRow}>
                <div style={dayLabel}>D{d.day}</div>
                <div style={barTrack}>
                  <div style={{ ...targetBar, width: `${targetPercent}%` }} />
                  <div style={{ ...actualBar, width: `${actualPercent}%` }} />
                </div>
                <div style={dayValue}>{ton(d.actual)} T</div>
              </div>
            );
          })}
        </div>
      </Panel>

      <div style={twoCol}>
        <Panel title="Top Consumables This Month">
          {data.topConsumables.length === 0 ? (
            <div style={empty}>No stores issue data for selected month.</div>
          ) : (
            data.topConsumables.map((x, i) => (
              <div key={i} style={supplierRow}>
                <div>
                  <b>{x.itemName}</b>
                  <div style={muted}>
                    {x.category || "No category"} | Qty {Number(x.qty || 0).toFixed(2)}
                  </div>
                </div>
                <b>₹ {lakh(x.value)} L</b>
              </div>
            ))
          )}
        </Panel>

        <Panel title="Top Procurement Sources">
          {data.suppliers.length === 0 ? (
            <div style={empty}>No supplier data for selected month.</div>
          ) : (
            data.suppliers.map((s, i) => (
              <div key={i} style={supplierRow}>
                <div>
                  <b>{s.supplier}</b>
                  <div style={muted}>
                    Avg ₹{s.avgRate.toFixed(2)} | Moisture {s.avgMoisture.toFixed(1)}% | Contam {s.avgContamination.toFixed(1)}%
                  </div>
                </div>
                <b>{ton(s.qty)} T</b>
              </div>
            ))
          )}
        </Panel>
      </div>
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

function FlowRow({ label, value }) {
  return (
    <div style={flowRow}>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "#e5e7eb", margin: "10px 0" }} />;
}

function Progress({ percent }) {
  const safe = Math.max(0, Math.min(Number(percent || 0), 120));

  return (
    <div style={progressOuter}>
      <div style={{ ...progressInner, width: `${Math.min(safe, 100)}%` }} />
      <div style={progressText}>{Number(percent || 0).toFixed(1)}%</div>
    </div>
  );
}

const page = {
  width: "100%",
  paddingBottom: 30,
};

const hero = {
  background: "linear-gradient(135deg,#052e16,#0f766e 60%,#14b8a6)",
  color: "white",
  borderRadius: 20,
  padding: 26,
  display: "flex",
  justifyContent: "space-between",
  gap: 20,
  flexWrap: "wrap",
  marginBottom: 20,
  boxShadow: "0 12px 30px rgba(15,118,110,0.22)",
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
  alignItems: "start",
  flexWrap: "wrap",
};

const filter = {
  height: 42,
  borderRadius: 10,
  border: "none",
  padding: "0 12px",
  fontWeight: 800,
};

const targetInput = {
  height: 42,
  width: 150,
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
  letterSpacing: 0.5,
  marginBottom: 8,
};

const kpiValue = {
  fontSize: 27,
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

const flowRow = {
  display: "flex",
  justifyContent: "space-between",
  padding: "9px 0",
  fontSize: 15,
};

const progressOuter = {
  height: 34,
  background: "#e2e8f0",
  borderRadius: 999,
  overflow: "hidden",
  position: "relative",
  marginBottom: 16,
};

const progressInner = {
  height: "100%",
  background: "linear-gradient(90deg,#16a34a,#14b8a6)",
};

const progressText = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 900,
  color: "#0f172a",
};

const chartWrap = {
  display: "grid",
  gap: 9,
};

const dayRow = {
  display: "grid",
  gridTemplateColumns: "48px 1fr 80px",
  gap: 10,
  alignItems: "center",
};

const dayLabel = {
  fontSize: 12,
  fontWeight: 800,
  color: "#475569",
};

const barTrack = {
  height: 20,
  background: "#e2e8f0",
  borderRadius: 999,
  position: "relative",
  overflow: "hidden",
};

const targetBar = {
  height: "100%",
  background: "#cbd5e1",
  position: "absolute",
  left: 0,
  top: 0,
};

const actualBar = {
  height: "100%",
  background: "linear-gradient(90deg,#0f766e,#14b8a6)",
  position: "absolute",
  left: 0,
  top: 0,
};

const dayValue = {
  fontSize: 12,
  fontWeight: 900,
  color: "#0f766e",
  textAlign: "right",
};

const supplierRow = {
  display: "flex",
  justifyContent: "space-between",
  gap: 14,
  padding: "11px 0",
  borderBottom: "1px solid #f1f5f9",
};

const muted = {
  color: "#64748b",
  fontSize: 12,
  marginTop: 3,
};

const empty = {
  color: "#64748b",
};