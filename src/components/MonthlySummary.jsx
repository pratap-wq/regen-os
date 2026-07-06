export default function MonthlySummary({ close }) {
  if (!close) return null;

  const ton = (kg) => (Number(kg || 0) / 1000).toFixed(1);
  const lakh = (v) => (Number(v || 0) / 100000).toFixed(1);
  const pct = (v) => Number(v || 0).toFixed(1);

  return (
    <div style={card}>
      <h2 style={title}>📅 Monthly Summary</h2>

      <div style={grid}>
        <SummaryBox
          title="Material Received"
          value={`${ton(close.rm.purchasedKg)} T`}
          color="#2563eb"
        />

        <SummaryBox
          title="Material Produced"
          value={`${ton(close.production.fgProducedKg)} T`}
          color="#16a34a"
        />

        <SummaryBox
          title="Dispatch"
          value={`${ton(close.production.dispatchKg)} T`}
          color="#0f766e"
        />

        <SummaryBox
          title="Overall Recovery"
          value={`${pct(close.production.overallRecovery)} %`}
          color="#d97706"
        />

        <SummaryBox
          title="Sales"
          value={`₹ ${lakh(close.profitability.salesValue)} L`}
          color="#7c3aed"
        />

        <SummaryBox
          title="Manufacturing Profit"
          value={`₹ ${lakh(close.profitability.manufacturingProfit)} L`}
          color={
            close.profitability.manufacturingProfit >= 0
              ? "#16a34a"
              : "#dc2626"
          }
        />

        <SummaryBox
          title="Profit / Kg"
          value={`₹ ${close.profitability.profitPerKg.toFixed(2)}`}
          color={
            close.profitability.profitPerKg >= 0
              ? "#16a34a"
              : "#dc2626"
          }
        />

        <SummaryBox
          title="Manufacturing Cost / Kg"
          value={`₹ ${close.profitability.manufacturingCostPerKg.toFixed(2)}`}
          color="#dc2626"
        />
      </div>
    </div>
  );
}

function SummaryBox({ title, value, color }) {
  return (
    <div style={box}>
      <div style={label}>{title}</div>

      <div
        style={{
          ...valueStyle,
          color,
        }}
      >
        {value}
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
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

const title = {
  marginTop: 0,
  marginBottom: 20,
  color: "#0f172a",
  fontSize: 22,
  fontWeight: 800,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: 16,
};

const box = {
  background: "#f8fafc",
  borderRadius: 12,
  padding: 18,
  border: "1px solid #e2e8f0",
};

const label = {
  fontSize: 13,
  color: "#64748b",
  marginBottom: 8,
  fontWeight: 700,
};

const valueStyle = {
  fontSize: 28,
  fontWeight: 800,
};
