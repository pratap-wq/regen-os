import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";
import { formatDate } from "../utils/date";
import DataTable from "../components/DataTable";

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
      const [rm, wash, sorting, extrusion, dispatch] = await Promise.all([
        apiCall({ fn: "rm.list" }),
        apiCall({ fn: "wash.list" }),
        apiCall({ fn: "sorting.list" }),
        apiCall({ fn: "extrusion.list" }),
        apiCall({ fn: "dispatch.list" }),
      ]);

      setRmRows((rm.rows || []).filter((r) => String(r.status || "").toUpperCase() !== "DELETED"));
      setWashRows((wash.rows || []).filter((r) => String(r.status || "").toUpperCase() !== "DELETED"));
      setSortingRows((sorting.rows || []).filter((r) => String(r.status || "").toUpperCase() !== "DELETED"));
      setExtrusionRows((extrusion.rows || []).filter((r) => String(r.status || "").toUpperCase() !== "DELETED"));
      setDispatchRows((dispatch.rows || []).filter((r) => String(r.dispatchStatus || "").toUpperCase() !== "DELETED"));
    } catch (err) {
      console.log(err);
    }
  }

  function parseDispatchLines(row) {
    try {
      if (row.dispatchLines) {
        const parsed = JSON.parse(row.dispatchLines);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err) {
      console.log(err);
    }

    if (row.sourceExtrusionBatchId) {
      return [
        {
          sourceExtrusionBatchId: row.sourceExtrusionBatchId,
          dispatchQtyKg: row.quantityKg || 0,
          grade: row.grade || "",
        },
      ];
    }

    return [];
  }

  const metrics = useMemo(() => {
    const rmInward = rmRows.reduce((s, r) => s + Number(r.netWeight || 0), 0);

    const washInput = washRows.reduce((s, r) => s + Number(r.inputWeightKg || 0), 0);

    const washOutput = washRows.reduce((s, r) => s + Number(r.washedOutputKg || 0), 0);

    const sortingInput = sortingRows.reduce((s, r) => s + Number(r.inputWeightKg || 0), 0);

    const sortingAccepted = sortingRows.reduce(
      (s, r) =>
        s +
        Number(
          r.acceptedQtyKg ||
            Number(r.whiteSortedKg || 0) +
              Number(r.allMixSortedKg || 0) +
              Number(r.commodityKg || 0) +
              Number(r.whiteGreyKg || 0)
        ),
      0
    );

    const extrusionInput = extrusionRows.reduce(
      (s, r) => s + Number(r.inputWeightKg || r.totalInputKg || 0),
      0
    );

    const fgProduced = extrusionRows.reduce((s, r) => s + Number(r.fgOutputKg || 0), 0);

    const dispatched = dispatchRows.reduce((s, r) => {
      const lines = parseDispatchLines(r);
      if (lines.length > 0) {
        return s + lines.reduce((ls, line) => ls + Number(line.dispatchQtyKg || 0), 0);
      }
      return s + Number(r.quantityKg || 0);
    }, 0);

    const rmStock = rmInward - washInput;
    const washStock = washOutput - sortingInput;
    const sortingStock = sortingAccepted - extrusionInput;
    const fgStock = fgProduced - dispatched;

    const washRecovery = washInput > 0 ? ((washOutput / washInput) * 100).toFixed(2) : "0.00";
    const sortingRecovery = sortingInput > 0 ? ((sortingAccepted / sortingInput) * 100).toFixed(2) : "0.00";
    const extrusionRecovery = extrusionInput > 0 ? ((fgProduced / extrusionInput) * 100).toFixed(2) : "0.00";
    const overallRecovery = washInput > 0 ? ((fgProduced / washInput) * 100).toFixed(2) : "0.00";

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
  }, [rmRows, washRows, sortingRows, extrusionRows, dispatchRows]);

  const movements = useMemo(() => {
    const list = [];

    rmRows.forEach((r) => {
      list.push({
        date: r.date,
        stage: "RM Inward",
        material: r.material,
        qty: Number(r.netWeight || 0),
        reference: r.inwardId,
        source: "RM",
        status: r.status || "",
      });
    });

    washRows.forEach((r) => {
      list.push({
        date: r.date,
        stage: "Wash Output",
        material: r.inputMaterial || "Washed Material",
        qty: Number(r.washedOutputKg || 0),
        reference: r.washBatchId,
        source: "Wash",
        status: r.status || "",
      });
    });

    sortingRows.forEach((r) => {
      list.push({
        date: r.date,
        stage: "Sorting Accepted",
        material: r.inputMaterial || "Sorted Material",
        qty: Number(
          r.acceptedQtyKg ||
            Number(r.whiteSortedKg || 0) +
              Number(r.allMixSortedKg || 0) +
              Number(r.commodityKg || 0) +
              Number(r.whiteGreyKg || 0)
        ),
        reference: r.sortingBatchId,
        source: "Sorting",
        status: r.status || "",
      });
    });

    extrusionRows.forEach((r) => {
      list.push({
        date: r.date,
        stage: "FG Production",
        material: r.productionGrade || r.inputMaterial,
        qty: Number(r.fgOutputKg || 0),
        reference: r.extrusionBatchId,
        source: "Extrusion",
        status: r.status || "",
      });
    });

    dispatchRows.forEach((r) => {
      const lines = parseDispatchLines(r);

      if (lines.length > 0) {
        lines.forEach((line) => {
          list.push({
            date: r.date,
            stage: "Dispatch",
            material: line.grade || r.grade,
            qty: Number(line.dispatchQtyKg || 0),
            reference: `${r.dispatchId || ""} / ${line.sourceExtrusionBatchId || ""}`,
            source: "Dispatch",
            status: r.dispatchStatus || "",
          });
        });
      } else {
        list.push({
          date: r.date,
          stage: "Dispatch",
          material: r.grade,
          qty: Number(r.quantityKg || 0),
          reference: r.dispatchId,
          source: "Dispatch",
          status: r.dispatchStatus || "",
        });
      }
    });

    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [rmRows, washRows, sortingRows, extrusionRows, dispatchRows]);

  return (
    <div style={page}>
      <div style={hero}>
        <div>
          <div style={eyebrow}>Inventory Intelligence</div>
          <h1 style={title}>Live Inventory Dashboard</h1>
          <div style={subtitle}>
            RM, wash, sorting, FG and dispatch movement ledger.
          </div>
        </div>
      </div>

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
        <h3 style={{ marginTop: 0 }}>Material Flow</h3>

        <div style={flowGrid}>
          <FlowBox title="RM Inward" value={metrics.rmInward} />
          <FlowBox title="Wash Output" value={metrics.washOutput} />
          <FlowBox title="Sorting Accepted" value={metrics.sortingAccepted} />
          <FlowBox title="FG Produced" value={metrics.fgProduced} />
          <FlowBox title="Dispatched" value={metrics.dispatched} />
        </div>
      </div>

      <DataTable
        title="Inventory Movement Ledger"
        rows={movements}
        searchFields={["stage", "material", "reference", "source", "status"]}
        columns={[
          {
            key: "date",
            label: "Date",
            render: (r) => formatDate(r.date),
            renderExport: (r) => formatDate(r.date),
          },
          { key: "stage", label: "Stage" },
          { key: "source", label: "Source" },
          { key: "material", label: "Material" },
          {
            key: "qty",
            label: "Qty Kg",
            render: (r) => Number(r.qty || 0).toFixed(2),
            renderExport: (r) => Number(r.qty || 0).toFixed(2),
          },
          { key: "reference", label: "Reference" },
          { key: "status", label: "Status" },
        ]}
      />

      <div style={note}>
        Inventory ledger is calculated from source transactions. Edit should be done in RM Inward,
        Production History, Dispatch, or Stores screens so audit trail remains clean.
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={card}>
      <div style={cardTitle}>{title}</div>
      <div style={cardValue}>{value}</div>
    </div>
  );
}

function FlowBox({ title, value }) {
  return (
    <div style={flowBox}>
      <div style={{ color: "#64748b", fontSize: 13 }}>{title}</div>
      <div style={{ fontWeight: 800, color: "#0f766e", marginTop: 6 }}>
        {Number(value || 0).toFixed(0)} Kg
      </div>
    </div>
  );
}

const page = {
  width: "100%",
  paddingBottom: 30,
};

const hero = {
  background: "linear-gradient(135deg,#064e3b,#0f766e)",
  color: "white",
  borderRadius: 18,
  padding: 24,
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
  fontSize: 32,
  fontWeight: 950,
};

const subtitle = {
  opacity: 0.9,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: 16,
  marginBottom: 20,
};

const card = {
  background: "white",
  padding: 20,
  borderRadius: 14,
  border: "1px solid #e5e7eb",
  boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
};

const cardTitle = {
  color: "#64748b",
  marginBottom: 8,
  fontSize: 13,
  fontWeight: 700,
};

const cardValue = {
  fontSize: 28,
  fontWeight: 900,
  color: "#0f766e",
};

const flowCard = {
  background: "white",
  padding: 20,
  borderRadius: 14,
  marginBottom: 20,
  border: "1px solid #e5e7eb",
  boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
};

const flowGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
  gap: 12,
};

const flowBox = {
  padding: 15,
  background: "#f8fafc",
  borderRadius: 10,
  textAlign: "center",
  border: "1px solid #e5e7eb",
};

const note = {
  marginTop: 16,
  background: "#fff7ed",
  color: "#7c2d12",
  border: "1px solid #fed7aa",
  borderRadius: 10,
  padding: 12,
  fontSize: 13,
  fontWeight: 700,
};