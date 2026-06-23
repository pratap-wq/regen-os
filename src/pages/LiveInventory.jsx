import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";
import { formatDate } from "../utils/date";

export default function LiveInventory() {
  const [rmRows, setRmRows] = useState([]);
  const [washRows, setWashRows] = useState([]);
  const [sortingRows, setSortingRows] = useState([]);
  const [extrusionRows, setExtrusionRows] = useState([]);
  const [dispatchRows, setDispatchRows] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [
        rm,
        wash,
        sorting,
        extrusion,
        dispatch,
      ] = await Promise.all([
        apiCall({ fn: "rm.list" }),
        apiCall({ fn: "wash.list" }),
        apiCall({ fn: "sorting.list" }),
        apiCall({ fn: "extrusion.list" }),
        apiCall({ fn: "dispatch.list" }),
      ]);

      setRmRows(rm.rows || []);
      setWashRows(wash.rows || []);
      setSortingRows(sorting.rows || []);
      setExtrusionRows(extrusion.rows || []);
      setDispatchRows(dispatch.rows || []);
    } catch (err) {
      console.log(err);
    }
  }

  const metrics = useMemo(() => {
    const rmInward = rmRows.reduce(
      (s, r) => s + Number(r.netWeight || 0),
      0
    );

    const washInput = washRows.reduce(
      (s, r) => s + Number(r.inputWeightKg || 0),
      0
    );

    const washOutput = washRows.reduce(
      (s, r) => s + Number(r.washedOutputKg || 0),
      0
    );

    const sortingInput = sortingRows.reduce(
      (s, r) => s + Number(r.inputWeightKg || 0),
      0
    );

    const sortingAccepted = sortingRows.reduce(
      (s, r) =>
        s +
        Number(
          r.acceptedQtyKg ||
            (
              Number(r.whiteSortedKg || 0) +
              Number(r.allMixSortedKg || 0) +
              Number(r.commodityKg || 0) +
              Number(r.whiteGreyKg || 0)
            )
        ),
      0
    );

    const extrusionInput = extrusionRows.reduce(
      (s, r) => s + Number(r.inputWeightKg || 0),
      0
    );

    const fgProduced = extrusionRows.reduce(
      (s, r) => s + Number(r.fgOutputKg || 0),
      0
    );

    const dispatched = dispatchRows.reduce(
      (s, r) => s + Number(r.quantityKg || 0),
      0
    );

    const rmStock = rmInward - washInput;
    const washStock = washOutput - sortingInput;
    const sortingStock = sortingAccepted - extrusionInput;
    const fgStock = fgProduced - dispatched;

    const washRecovery =
      washInput > 0
        ? ((washOutput / washInput) * 100).toFixed(2)
        : "0.00";

    const sortingRecovery =
      sortingInput > 0
        ? ((sortingAccepted / sortingInput) * 100).toFixed(2)
        : "0.00";

    const extrusionRecovery =
      extrusionInput > 0
        ? ((fgProduced / extrusionInput) * 100).toFixed(2)
        : "0.00";

    const overallRecovery =
      washInput > 0
        ? ((fgProduced / washInput) * 100).toFixed(2)
        : "0.00";

    return {
      rmInward,
      washInput,
      washOutput,
      sortingInput,
      sortingAccepted,
      extrusionInput,
      fgProduced,
      dispatched,

      rmStock,
      washStock,
      sortingStock,
      fgStock,

      washRecovery,
      sortingRecovery,
      extrusionRecovery,
      overallRecovery,
    };
  }, [
    rmRows,
    washRows,
    sortingRows,
    extrusionRows,
    dispatchRows,
  ]);

  const movements = useMemo(() => {
    const list = [];

    rmRows.forEach((r) => {
      list.push({
        date: r.date,
        stage: "RM Inward",
        material: r.material,
        qty: r.netWeight,
        reference: r.inwardId,
      });
    });

    washRows.forEach((r) => {
      list.push({
        date: r.date,
        stage: "Wash Output",
        material: "Washed Material",
        qty: r.washedOutputKg,
        reference: r.washBatchId,
      });
    });

    sortingRows.forEach((r) => {
      list.push({
        date: r.date,
        stage: "Sorting Accepted",
        material: "Sorted Material",
        qty:
          r.acceptedQtyKg ||
          (
            Number(r.whiteSortedKg || 0) +
            Number(r.allMixSortedKg || 0) +
            Number(r.commodityKg || 0) +
            Number(r.whiteGreyKg || 0)
          ),
        reference: r.sortingBatchId,
      });
    });

    extrusionRows.forEach((r) => {
      list.push({
        date: r.date,
        stage: "FG Production",
        material: r.productionGrade,
        qty: r.fgOutputKg,
        reference: r.extrusionBatchId,
      });
    });

    dispatchRows.forEach((r) => {
      list.push({
        date: r.date,
        stage: "Dispatch",
        material: r.grade,
        qty: r.quantityKg,
        reference: r.dispatchId,
      });
    });

    return list.sort(
      (a, b) =>
        new Date(b.date) -
        new Date(a.date)
    );
  }, [
    rmRows,
    washRows,
    sortingRows,
    extrusionRows,
    dispatchRows,
  ]);

  return (
    <div style={{ width: "100%" }}>
      <h1 style={{ marginBottom: 20 }}>
        Live Inventory Dashboard
      </h1>

      <div style={grid}>
        <Card title="RM Stock" value={`${metrics.rmStock.toFixed(0)} Kg`} />
        <Card title="Wash Stock" value={`${metrics.washStock.toFixed(0)} Kg`} />
        <Card title="Sorting Stock" value={`${metrics.sortingStock.toFixed(0)} Kg`} />
        <Card title="FG Stock" value={`${metrics.fgStock.toFixed(0)} Kg`} />
      </div>

      <div style={grid}>
        <Card title="Wash Recovery" value={`${metrics.washRecovery}%`} />
        <Card title="Sorting Recovery" value={`${metrics.sortingRecovery}%`} />
        <Card title="Extrusion Recovery" value={`${metrics.extrusionRecovery}%`} />
        <Card title="Overall Recovery" value={`${metrics.overallRecovery}%`} />
      </div>

      <div style={flowCard}>
        <h3>Material Flow</h3>

        <div style={flowGrid}>
          <FlowBox title="RM Inward" value={metrics.rmInward} />
          <FlowBox title="Wash Output" value={metrics.washOutput} />
          <FlowBox title="Sorting Accepted" value={metrics.sortingAccepted} />
          <FlowBox title="FG Produced" value={metrics.fgProduced} />
          <FlowBox title="Dispatched" value={metrics.dispatched} />
        </div>
      </div>

      <div style={tableCard}>
        <h3>Inventory Movement Ledger</h3>

        <table style={table}>
          <thead>
            <tr style={headerRow}>
              <th style={th}>Date</th>
              <th style={th}>Stage</th>
              <th style={th}>Material</th>
              <th style={th}>Qty</th>
              <th style={th}>Reference</th>
            </tr>
          </thead>

          <tbody>
            {movements.map((m, i) => (
              <tr key={i}>
                <td style={td}>{formatDate(m.date)}</td>
                <td style={td}>{m.stage}</td>
                <td style={td}>{m.material}</td>
                <td style={td}>{m.qty}</td>
                <td style={td}>
                  <b>{m.reference}</b>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={card}>
      <div style={{ color: "#64748b" }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#0f766e" }}>
        {value}
      </div>
    </div>
  );
}

function FlowBox({ title, value }) {
  return (
    <div style={flowBox}>
      <div>{title}</div>
      <div style={{ fontWeight: 700 }}>
        {Number(value || 0).toFixed(0)} Kg
      </div>
    </div>
  );
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: 16,
  marginBottom: 20,
};

const card = {
  background: "white",
  padding: 20,
  borderRadius: 12,
  border: "1px solid #e5e7eb",
};

const flowCard = {
  background: "white",
  padding: 20,
  borderRadius: 12,
  marginBottom: 20,
  border: "1px solid #e5e7eb",
};

const flowGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
  gap: 12,
};

const flowBox = {
  padding: 15,
  background: "#f8fafc",
  borderRadius: 8,
  textAlign: "center",
};

const tableCard = {
  background: "white",
  padding: 20,
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  overflowX: "auto",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
};

const headerRow = {
  background: "#0f766e",
  color: "white",
};

const th = {
  padding: 12,
  textAlign: "left",
};

const td = {
  padding: 12,
  borderBottom: "1px solid #e5e7eb",
};