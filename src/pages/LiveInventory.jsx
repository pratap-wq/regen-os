import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";
import DataTable from "../components/DataTable";

const CATEGORY_LABELS = {
  RM: "Raw Material",
  WIP: "Work In Process",
  FG: "Finished Goods",
  ADDITIVE: "Production Additives",
  WASTE: "Waste / Rejects",
};

export default function LiveInventory() {
  const [rows, setRows] = useState([]);
  const [manualReviewRows, setManualReviewRows] = useState([]);
  const [summary, setSummary] = useState({});
  const [status, setStatus] = useState("Loading ledger balances...");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setStatus("Loading ledger balances...");
      const res = await apiCall({ fn: "inventoryLedger.liveBalance" });

      if (res.ok === false) {
        setStatus(res.error || "Failed loading ledger balances");
        return;
      }

      setRows(res.rows || []);
      setManualReviewRows(res.manualReviewRows || []);
      setSummary(res.summary || {});
      setStatus("");
    } catch (err) {
      console.log(err);
      setStatus(err.message || "Failed loading ledger balances");
    }
  }

  const visibleRows = useMemo(() => {
    return rows.filter((row) => Number(row.balanceKg || 0) !== 0);
  }, [rows]);

  const categoryTotals = useMemo(() => {
    return ["RM", "WIP", "FG", "ADDITIVE", "WASTE"].map((category) => ({
      category,
      label: CATEGORY_LABELS[category],
      balanceKg: Number(summary[category] || 0),
      activeMaterials: visibleRows.filter((row) => row.category === category).length,
    }));
  }, [summary, visibleRows]);

  const totalProductionKg = categoryTotals.reduce(
    (sum, row) => sum + Number(row.balanceKg || 0),
    0
  );

  return (
    <div style={page}>
      <div style={hero}>
        <div>
          <div style={eyebrow}>Inventory Intelligence</div>
          <h1 style={title}>Live Inventory Dashboard</h1>
          <div style={subtitle}>
            Inventory_Ledger balances grouped by canonical production materials.
          </div>
        </div>
        <button type="button" onClick={loadData} style={refreshButton}>
          Refresh
        </button>
      </div>

      {status && <div style={statusStyle}>{status}</div>}

      <div style={grid}>
        <Card title="RM Stock" value={`${Number(summary.RM || 0).toFixed(0)} Kg`} />
        <Card title="WIP Stock" value={`${Number(summary.WIP || 0).toFixed(0)} Kg`} />
        <Card title="FG Stock" value={`${Number(summary.FG || 0).toFixed(0)} Kg`} />
        <Card title="Additives" value={`${Number(summary.ADDITIVE || 0).toFixed(0)} Kg`} />
        <Card title="Waste / Rejects" value={`${Number(summary.WASTE || 0).toFixed(0)} Kg`} />
      </div>

      <div style={grid}>
        <Card title="Production Ledger Total" value={`${totalProductionKg.toFixed(0)} Kg`} />
        <Card title="Canonical Materials" value={visibleRows.length} />
        <Card title="Manual Review Items" value={manualReviewRows.length} tone={manualReviewRows.length ? "warning" : "neutral"} />
        <Card title="Ledger Rows Read" value={summary.ledgerRows || 0} />
      </div>

      <div style={flowCard}>
        <h3 style={{ marginTop: 0 }}>Category Balance</h3>
        <div style={flowGrid}>
          {categoryTotals.map((row) => (
            <FlowBox
              key={row.category}
              title={row.label}
              value={row.balanceKg}
              detail={`${row.activeMaterials} active materials`}
            />
          ))}
        </div>
      </div>

      <DataTable
        title="Canonical Production Material Balances"
        rows={rows}
        searchFields={["material", "category"]}
        columns={[
          { key: "material", label: "Material" },
          { key: "category", label: "Category" },
          {
            key: "qtyIn",
            label: "Qty In",
            render: (r) => Number(r.qtyIn || 0).toFixed(2),
            renderExport: (r) => Number(r.qtyIn || 0).toFixed(2),
          },
          {
            key: "qtyOut",
            label: "Qty Out",
            render: (r) => Number(r.qtyOut || 0).toFixed(2),
            renderExport: (r) => Number(r.qtyOut || 0).toFixed(2),
          },
          {
            key: "balanceKg",
            label: "Balance Kg",
            render: (r) => (
              <span style={Number(r.balanceKg || 0) < 0 ? negativeText : positiveText}>
                {Number(r.balanceKg || 0).toFixed(2)}
              </span>
            ),
            renderExport: (r) => Number(r.balanceKg || 0).toFixed(2),
          },
          { key: "movementCount", label: "Movements" },
        ]}
      />

      <div style={manualSection}>
        <h3 style={{ marginTop: 0 }}>Needs Manual Review</h3>
        <div style={manualNote}>
          Unknown or rogue ledger material names are not auto-merged. Review these before any
          historical data repair.
        </div>
        <DataTable
          title="Manual Review Ledger Names"
          rows={manualReviewRows}
          searchFields={["material", "sourceCategory"]}
          columns={[
            { key: "material", label: "Ledger Material" },
            { key: "sourceCategory", label: "Ledger Category" },
            {
              key: "qtyIn",
              label: "Qty In",
              render: (r) => Number(r.qtyIn || 0).toFixed(2),
              renderExport: (r) => Number(r.qtyIn || 0).toFixed(2),
            },
            {
              key: "qtyOut",
              label: "Qty Out",
              render: (r) => Number(r.qtyOut || 0).toFixed(2),
              renderExport: (r) => Number(r.qtyOut || 0).toFixed(2),
            },
            {
              key: "balanceKg",
              label: "Balance Kg",
              render: (r) => Number(r.balanceKg || 0).toFixed(2),
              renderExport: (r) => Number(r.balanceKg || 0).toFixed(2),
            },
            { key: "movementCount", label: "Movements" },
          ]}
        />
      </div>

      <div style={note}>
        Live Inventory now reads Inventory_Ledger as source of truth. Stores and general
        consumables are excluded; approved extrusion additives are shown separately.
      </div>
    </div>
  );
}

function Card({ title, value, tone = "neutral" }) {
  const valueStyle = tone === "warning" ? { ...cardValue, color: "#b45309" } : cardValue;
  return (
    <div style={card}>
      <div style={cardTitle}>{title}</div>
      <div style={valueStyle}>{value}</div>
    </div>
  );
}

function FlowBox({ title, value, detail }) {
  return (
    <div style={flowBox}>
      <div style={{ color: "#64748b", fontSize: 13 }}>{title}</div>
      <div style={{ fontWeight: 800, color: "#0f766e", marginTop: 6 }}>
        {Number(value || 0).toFixed(0)} Kg
      </div>
      <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>{detail}</div>
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
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
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

const refreshButton = {
  background: "white",
  color: "#0f766e",
  border: "none",
  borderRadius: 8,
  padding: "10px 14px",
  fontWeight: 800,
  cursor: "pointer",
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

const statusStyle = {
  marginBottom: 16,
  background: "#eff6ff",
  color: "#1d4ed8",
  border: "1px solid #bfdbfe",
  borderRadius: 10,
  padding: 12,
  fontSize: 13,
  fontWeight: 700,
};

const manualSection = {
  marginTop: 20,
};

const manualNote = {
  background: "#fff7ed",
  color: "#9a3412",
  border: "1px solid #fed7aa",
  borderRadius: 10,
  padding: 12,
  marginBottom: 12,
  fontSize: 13,
  fontWeight: 700,
};

const note = {
  marginTop: 16,
  background: "#ecfdf5",
  color: "#166534",
  border: "1px solid #bbf7d0",
  borderRadius: 10,
  padding: 12,
  fontSize: 13,
  fontWeight: 700,
};

const positiveText = {
  color: "#0f766e",
  fontWeight: 800,
};

const negativeText = {
  color: "#dc2626",
  fontWeight: 900,
};
