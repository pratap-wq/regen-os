import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";

export default function LiveInventory() {
  const [rmRows, setRmRows] = useState([]);
  const [washRows, setWashRows] = useState([]);
  const [extrusionRows, setExtrusionRows] = useState([]);
  const [dispatchRows, setDispatchRows] = useState([]);

  const currentDate = new Date();
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(String(currentDate.getFullYear()));

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [rm, wash, extrusion, dispatch] = await Promise.all([
        apiCall({ fn: "rm.list" }),
        apiCall({ fn: "wash.list" }),
        apiCall({ fn: "extrusion.list" }),
        apiCall({ fn: "dispatch.list" }),
      ]);

      setRmRows(rm.rows || []);
      setWashRows(wash.rows || []);
      setExtrusionRows(extrusion.rows || []);
      setDispatchRows(dispatch.rows || []);
    } catch (err) {
      console.log(err);
    }
  }

  function inSelectedPeriod(dateValue) {
    if (!dateValue) return false;

    const d = new Date(dateValue);
    const rowMonth = String(d.getMonth() + 1).padStart(2, "0");
    const rowYear = String(d.getFullYear());

    if (!month) return rowYear === year;

    return rowMonth === month && rowYear === year;
  }

  const movements = useMemo(() => {
    const list = [];

    rmRows.forEach((r) => {
      if (!inSelectedPeriod(r.date)) return;

      list.push({
        date: r.date,
        stage: "RM Inward",
        material: r.material || "RM",
        grade: "",
        inwardKg: Number(r.netWeight || 0),
        outwardKg: 0,
        reference: r.inwardId || "",
        remarks: r.supplier || "",
      });
    });

    washRows.forEach((r) => {
      if (!inSelectedPeriod(r.date)) return;

      list.push({
        date: r.date,
        stage: "RM to Wash",
        material: r.inputMaterial || "RM",
        grade: "",
        inwardKg: 0,
        outwardKg: Number(r.inputWeight || 0),
        reference: r.batchId || "",
        remarks: "Wash input",
      });

      list.push({
        date: r.date,
        stage: "Washed Output",
        material: "Washed Material",
        grade: "",
        inwardKg: Number(r.outputWeight || 0),
        outwardKg: 0,
        reference: r.batchId || "",
        remarks: "Wash output",
      });
    });

    extrusionRows.forEach((r) => {
      if (!inSelectedPeriod(r.date)) return;

      list.push({
        date: r.date,
        stage: "Wash to Extrusion",
        material: r.inputMaterial || "Washed Material",
        grade: "",
        inwardKg: 0,
        outwardKg: Number(r.inputWeight || 0),
        reference: r.batchId || "",
        remarks: "Extrusion input",
      });

      list.push({
        date: r.date,
        stage: "FG Produced",
        material: "Finished Goods",
        grade: r.productionGrade || "",
        inwardKg: Number(r.outputWeight || 0),
        outwardKg: 0,
        reference: r.batchId || "",
        remarks: "Extrusion output",
      });
    });

    dispatchRows.forEach((r) => {
      if (!inSelectedPeriod(r.date)) return;

      list.push({
        date: r.date,
        stage: "Dispatch",
        material: "Finished Goods",
        grade: r.grade || "",
        inwardKg: 0,
        outwardKg: Number(r.quantityKg || 0),
        reference: r.dispatchId || "",
        remarks: r.customerName || "",
      });
    });

    return list.sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });
  }, [rmRows, washRows, extrusionRows, dispatchRows, month, year]);

  const rmInward = movements
    .filter((m) => m.stage === "RM Inward")
    .reduce((sum, m) => sum + m.inwardKg, 0);

  const rmConsumed = movements
    .filter((m) => m.stage === "RM to Wash")
    .reduce((sum, m) => sum + m.outwardKg, 0);

  const washProduced = movements
    .filter((m) => m.stage === "Washed Output")
    .reduce((sum, m) => sum + m.inwardKg, 0);

  const washConsumed = movements
    .filter((m) => m.stage === "Wash to Extrusion")
    .reduce((sum, m) => sum + m.outwardKg, 0);

  const fgProduced = movements
    .filter((m) => m.stage === "FG Produced")
    .reduce((sum, m) => sum + m.inwardKg, 0);

  const fgDispatched = movements
    .filter((m) => m.stage === "Dispatch")
    .reduce((sum, m) => sum + m.outwardKg, 0);

  const rmStock = rmInward - rmConsumed;
  const washStock = washProduced - washConsumed;
  const fgStock = fgProduced - fgDispatched;

  return (
    <div style={{ padding: 20 }}>
      <div style={topBarStyle}>
        <h1>Inventory Movement Ledger</h1>

        <div style={{ display: "flex", gap: 10 }}>
          <select value={month} onChange={(e) => setMonth(e.target.value)} style={filterStyle}>
            <option value="">Full Year</option>
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

          <select value={year} onChange={(e) => setYear(e.target.value)} style={filterStyle}>
            <option>2025</option>
            <option>2026</option>
            <option>2027</option>
          </select>
        </div>
      </div>

      <div style={gridStyle}>
        <Card title="RM Stock" value={`${rmStock.toFixed(0)} Kg`} />
        <Card title="Washed Stock" value={`${washStock.toFixed(0)} Kg`} />
        <Card title="FG Stock" value={`${fgStock.toFixed(0)} Kg`} />
        <Card title="Total Movements" value={movements.length} />
      </div>

      <div style={tableCardStyle}>
        <h2>Movement Ledger</h2>

        <table style={tableStyle}>
          <thead>
            <tr style={headerRowStyle}>
              <th style={th}>Date</th>
              <th style={th}>Stage</th>
              <th style={th}>Material</th>
              <th style={th}>Grade</th>
              <th style={th}>In Kg</th>
              <th style={th}>Out Kg</th>
              <th style={th}>Reference</th>
              <th style={th}>Remarks</th>
            </tr>
          </thead>

          <tbody>
            {movements.map((m, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={td}>{formatDate(m.date)}</td>
                <td style={td}>{m.stage}</td>
                <td style={td}>{m.material}</td>
                <td style={td}>{m.grade}</td>
                <td style={td}>{m.inwardKg ? m.inwardKg.toFixed(0) : ""}</td>
                <td style={td}>{m.outwardKg ? m.outwardKg.toFixed(0) : ""}</td>
                <td style={td}>{m.reference}</td>
                <td style={td}>{m.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={noteStyle}>
        <b>Purpose:</b> This ledger explains why stock changed. It links RM inward, wash consumption,
        wash output, extrusion consumption, FG production and dispatch in one operational trail.
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={cardStyle}>
      <div style={{ color: "#666", marginBottom: 10 }}>{title}</div>
      <h2 style={{ margin: 0, color: "#0f766e" }}>{value}</h2>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "";

  const d = new Date(value);

  if (isNaN(d.getTime())) return value;

  return d.toLocaleDateString("en-IN");
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
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 20,
};

const cardStyle = {
  background: "white",
  padding: 20,
  borderRadius: 10,
  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
};

const tableCardStyle = {
  background: "white",
  marginTop: 30,
  padding: 20,
  borderRadius: 10,
  overflowX: "auto",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 20,
};

const headerRowStyle = {
  background: "#0f766e",
  color: "white",
};

const th = {
  padding: 12,
  textAlign: "left",
};

const td = {
  padding: 10,
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
  marginTop: 20,
  color: "#7c2d12",
};