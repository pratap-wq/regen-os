import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";

export default function Dashboard() {

  const [rmRows, setRmRows] = useState([]);
  const [washRows, setWashRows] = useState([]);
  const [extrusionRows, setExtrusionRows] = useState([]);
  const [dispatchRows, setDispatchRows] = useState([]);
  const [auditRows, setAuditRows] = useState([]);
  const [fgRates, setFgRates] = useState([]);
  const [consumables, setConsumables] = useState([]);
  const [factoryExpenses, setFactoryExpenses] = useState([]);

  const currentDate = new Date();

  const [month, setMonth] = useState("");
  const [year, setYear] = useState(
    String(currentDate.getFullYear())
  );

  useEffect(() => {

    loadData();

  }, []);

  async function loadData() {

    try {

      const [
        rm,
        wash,
        extrusion,
        dispatch,
        audit,
        rates,
        cons,
        expenses,
      ] = await Promise.all([

        apiCall({ fn: "rm.list" }),
        apiCall({ fn: "wash.list" }),
        apiCall({ fn: "extrusion.list" }),
        apiCall({ fn: "dispatch.list" }),
        apiCall({ fn: "audit.list" }),
        apiCall({ fn: "fgRates.list" }),
        apiCall({ fn: "consumables.list" }),
        apiCall({ fn: "factoryExpenses.list" }),

      ]);

      setRmRows(rm.rows || []);
      setWashRows(wash.rows || []);
      setExtrusionRows(extrusion.rows || []);
      setDispatchRows(dispatch.rows || []);
      setAuditRows(audit.rows || []);
      setFgRates(rates.rows || []);
      setConsumables(cons.rows || []);
      setFactoryExpenses(expenses.rows || []);

    } catch (err) {

      console.log(err);

    }

  }

  // =====================================
  // FILTER
  // =====================================

  function filterRows(rows) {

    return rows.filter((r) => {

      const rowYear =
        String(r.year || "");

      if (!month) {

        if (r.date) {

          return (
            String(
              new Date(r.date).getFullYear()
            ) === year
          );

        }

        return rowYear === year;

      }

      if (r.date) {

        const d = new Date(r.date);

        const rowMonth =
          String(d.getMonth() + 1)
            .padStart(2, "0");

        return (
          rowMonth === month &&
          String(d.getFullYear()) === year
        );

      }

      const monthName =
        currentDate.toLocaleString(
          "default",
          {
            month: "short",
          }
        );

      return (
        r.month === monthName &&
        rowYear === year
      );

    });

  }

  const filteredRM =
    useMemo(
      () => filterRows(rmRows),
      [rmRows, month, year]
    );

  const filteredWash =
    useMemo(
      () => filterRows(washRows),
      [washRows, month, year]
    );

  const filteredExtrusion =
    useMemo(
      () => filterRows(extrusionRows),
      [extrusionRows, month, year]
    );

  const filteredDispatch =
    useMemo(
      () => filterRows(dispatchRows),
      [dispatchRows, month, year]
    );

  const filteredConsumables =
    useMemo(
      () => filterRows(consumables),
      [consumables, month, year]
    );

  const filteredExpenses =
    useMemo(
      () => filterRows(factoryExpenses),
      [factoryExpenses, month, year]
    );

  // =====================================
  // AUDIT OPENING
  // =====================================

  const previousAudit =
    auditRows.find((r) => {

      const auditDate =
        new Date(`${r.month} 1, ${r.year}`);

      const selectedDate =
        new Date(`${month || "Dec"} 1, ${year}`);

      return auditDate < selectedDate;

    }) || {};

  // =====================================
  // RM
  // =====================================

  const rmOpening =
    Number(
      previousAudit.rmClosingPhysicalKg || 0
    );

  const totalRMInward =
    filteredRM.reduce((sum, r) => {

      return sum +
        Number(r.netWeight || 0);

    }, 0);

  const totalRMValue =
    filteredRM.reduce((sum, r) => {

      return sum + (
        Number(r.netWeight || 0) *
        Number(r.ratePerKg || 0)
      );

    }, 0);

  const avgRMPrice =
    totalRMInward > 0
      ? (
          totalRMValue /
          totalRMInward
        ).toFixed(2)
      : 0;

  // =====================================
  // WASH
  // =====================================

  const totalWashInput =
    filteredWash.reduce((sum, r) => {

      return sum +
        Number(r.inputWeight || 0);

    }, 0);

  const totalWashOutput =
    filteredWash.reduce((sum, r) => {

      return sum +
        Number(r.outputWeight || 0);

    }, 0);

  // =====================================
  // FG
  // =====================================

  const totalFGProduced =
    filteredExtrusion.reduce((sum, r) => {

      return sum +
        Number(r.outputWeight || 0);

    }, 0);

  const totalDispatchQty =
    filteredDispatch.reduce((sum, r) => {

      return sum +
        Number(r.quantityKg || 0);

    }, 0);

  // =====================================
  // LIVE STOCK
  // =====================================

  const liveRMStock =
    rmOpening +
    totalRMInward -
    totalWashInput;

  const liveWashStock =
    totalWashOutput -
    filteredExtrusion.reduce((sum, r) => {
      return sum + Number(r.inputWeight || 0);
    }, 0);

  const liveFGStock =
    totalFGProduced -
    totalDispatchQty;

  // =====================================
  // SALES
  // =====================================

  const totalSales =
    filteredDispatch.reduce((sum, r) => {

      return sum + (
        Number(r.quantityKg || 0) *
        Number(r.ratePerKg || 0)
      );

    }, 0);

  const avgRealization =
    totalDispatchQty > 0
      ? (
          totalSales /
          totalDispatchQty
        ).toFixed(2)
      : 0;

  // =====================================
  // CONSUMABLES
  // =====================================

  const totalConsumablesCost =
    filteredConsumables.reduce((sum, r) => {

      return sum +
        Number(r.consumedValue || 0);

    }, 0);

  // =====================================
  // FACTORY EXPENSES
  // =====================================

  const totalFactoryExpenses =
    filteredExpenses.reduce((sum, r) => {

      return sum +
        Number(r.amount || 0);

    }, 0);

  // =====================================
  // PROFITABILITY
  // =====================================

  const estimatedRMConsumedValue =
    totalFGProduced *
    Number(avgRMPrice || 0);

  const grossContribution =
    totalSales -
    estimatedRMConsumedValue;

  const manufacturingProfit =
    grossContribution -
    totalConsumablesCost -
    totalFactoryExpenses;

  const processingCostPerKg =
    totalFGProduced > 0
      ? (
          (
            totalConsumablesCost +
            totalFactoryExpenses
          ) / totalFGProduced
        ).toFixed(2)
      : 0;

  const manufacturingMarginPerKg =
    totalDispatchQty > 0
      ? (
          manufacturingProfit /
          totalDispatchQty
        ).toFixed(2)
      : 0;

  // =====================================
  // RECOVERY
  // =====================================

  const overallRecovery =
    totalRMInward > 0
      ? (
          (
            totalFGProduced /
            totalRMInward
          ) * 100
        ).toFixed(2)
      : 0;

  return (

    <div style={{ padding: 20 }}>

      <div style={topBarStyle}>

        <h1>Regen OS Dashboard</h1>

        <div style={{ display: "flex", gap: 10 }}>

          <select
            value={month}
            onChange={(e) =>
              setMonth(e.target.value)
            }
            style={filterStyle}
          >

            <option value="">
              Full Year
            </option>

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
            onChange={(e) =>
              setYear(e.target.value)
            }
            style={filterStyle}
          >

            <option>2025</option>
            <option>2026</option>
            <option>2027</option>

          </select>

        </div>

      </div>

      <h2>Operational</h2>

      <div style={gridStyle}>

        <Card
          title="RM Stock"
          value={`${liveRMStock.toFixed(0)} Kg`}
        />

        <Card
          title="Wash Stock"
          value={`${liveWashStock.toFixed(0)} Kg`}
        />

        <Card
          title="FG Stock"
          value={`${liveFGStock.toFixed(0)} Kg`}
        />

        <Card
          title="FG Produced"
          value={`${totalFGProduced.toFixed(0)} Kg`}
        />

        <Card
          title="Dispatch Qty"
          value={`${totalDispatchQty.toFixed(0)} Kg`}
        />

        <Card
          title="Recovery"
          value={`${overallRecovery}%`}
        />

      </div>

      <h2 style={{ marginTop: 30 }}>
        Manufacturing Economics
      </h2>

      <div style={gridStyle}>

        <Card
          title="Sales Turnover"
          value={`₹ ${totalSales.toFixed(0)}`}
        />

        <Card
          title="RM Purchase Value"
          value={`₹ ${totalRMValue.toFixed(0)}`}
        />

        <Card
          title="Consumables Cost"
          value={`₹ ${totalConsumablesCost.toFixed(0)}`}
        />

        <Card
          title="Factory Expenses"
          value={`₹ ${totalFactoryExpenses.toFixed(0)}`}
        />

        <Card
          title="Gross Contribution"
          value={`₹ ${grossContribution.toFixed(0)}`}
        />

        <Card
          title="Manufacturing Profit"
          value={`₹ ${manufacturingProfit.toFixed(0)}`}
        />

        <Card
          title="Processing Cost/Kg"
          value={`₹ ${processingCostPerKg}`}
        />

        <Card
          title="Margin/Kg"
          value={`₹ ${manufacturingMarginPerKg}`}
        />

        <Card
          title="Avg RM Price"
          value={`₹ ${avgRMPrice}`}
        />

        <Card
          title="Avg Realization"
          value={`₹ ${avgRealization}`}
        />

      </div>

      <div style={noteStyle}>

        <b>Architecture:</b>

        {" "}

        Operational KPIs are live.
        Profitability uses monthly
        expenses and consumables.

      </div>

    </div>

  );

}

function Card({ title, value }) {

  return (

    <div style={cardStyle}>

      <div
        style={{
          color: "#666",
          marginBottom: 10,
        }}
      >
        {title}
      </div>

      <h2
        style={{
          margin: 0,
          color: "#0f766e",
        }}
      >
        {value}
      </h2>

    </div>

  );

}

const topBarStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 20,
  flexWrap: "wrap",
  gap: 10,
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 20,
};

const cardStyle = {
  background: "white",
  padding: 20,
  borderRadius: 10,
  boxShadow:
    "0 2px 10px rgba(0,0,0,0.08)",
};

const filterStyle = {
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ccc",
  background: "white",
};

const noteStyle = {
  background: "#fff7ed",
  border: "1px solid #fed7aa",
  padding: 15,
  borderRadius: 10,
  marginTop: 30,
  color: "#7c2d12",
};