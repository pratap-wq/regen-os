export default function InventoryReconciliation({ close }) {
  if (!close) return null;

  const ton = (kg) => (Number(kg || 0) / 1000).toFixed(2);

  const rows = [
    {
      label: "Raw Material Closing",
      value: close.inventory.rmClosingKg,
    },
    {
      label: "Wash WIP",
      value: close.inventory.washClosingKg,
    },
    {
      label: "Sorting WIP",
      value: close.inventory.sortingClosingKg,
    },
    {
      label: "Finished Goods Closing",
      value: close.inventory.fgClosingKg,
    },
  ];

  const totalClosing =
    Number(close.inventory.rmClosingKg || 0) +
    Number(close.inventory.washClosingKg || 0) +
    Number(close.inventory.sortingClosingKg || 0) +
    Number(close.inventory.fgClosingKg || 0);

  return (
    <div style={card}>
      <h2 style={title}>📦 Inventory Reconciliation</h2>

      <table style={table}>
        <thead>
          <tr>
            <th style={th}>Inventory Stage</th>
            <th style={thRight}>Closing Qty (T)</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <td style={td}>{r.label}</td>
              <td style={tdRight}>{ton(r.value)}</td>
            </tr>
          ))}

          <tr style={totalRow}>
            <td style={td}><b>Total Closing Inventory</b></td>
            <td style={tdRight}>
              <b>{ton(totalClosing)}</b>
            </td>
          </tr>
        </tbody>
      </table>

      <div style={status}>
        <span style={badge(totalClosing >= 0)}>
          {totalClosing >= 0 ? "✔ Inventory Balanced" : "⚠ Check Inventory"}
        </span>
      </div>
    </div>
  );
}

const card = {
  background: "#fff",
  borderRadius: 16,
  padding: 24,
  marginBottom: 20,
  border: "1px solid #e2e8f0",
};

const title = {
  marginTop: 0,
  marginBottom: 20,
  fontSize: 22,
  fontWeight: 800,
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
};

const th = {
  textAlign: "left",
  padding: 12,
  borderBottom: "2px solid #e2e8f0",
  background: "#f8fafc",
};

const thRight = {
  ...th,
  textAlign: "right",
};

const td = {
  padding: 12,
  borderBottom: "1px solid #f1f5f9",
};

const tdRight = {
  ...td,
  textAlign: "right",
  fontWeight: 700,
};

const totalRow = {
  background: "#f8fafc",
};

const status = {
  marginTop: 20,
};

const badge = (ok) => ({
  background: ok ? "#dcfce7" : "#fee2e2",
  color: ok ? "#166534" : "#991b1b",
  padding: "8px 14px",
  borderRadius: 20,
  fontWeight: 700,
  display: "inline-block",
});