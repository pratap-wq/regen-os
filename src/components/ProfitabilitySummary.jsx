export default function ProfitabilitySummary({ close }) {
  if (!close) return null;

  const p = close.profitability;
  const c = close.costs;

  const lakh = (v) => (Number(v || 0) / 100000).toFixed(2);

  const saleRate =
    close.production.dispatchKg > 0
      ? p.salesValue / close.production.dispatchKg
      : 0;

  const margin =
    p.salesValue > 0
      ? (p.manufacturingProfit / p.salesValue) * 100
      : 0;

  return (
    <div style={card}>
      <h2 style={title}>📈 Profitability Summary</h2>

      <div style={grid}>
        <KPI
          title="Sales Revenue"
          value={`₹ ${lakh(p.salesValue)} L`}
          color="#16a34a"
        />

        <KPI
          title="Gross Profit"
          value={`₹ ${lakh(p.grossProfit)} L`}
          color="#2563eb"
        />

        <KPI
          title="Manufacturing Profit"
          value={`₹ ${lakh(p.manufacturingProfit)} L`}
          color={
            p.manufacturingProfit >= 0
              ? "#16a34a"
              : "#dc2626"
          }
        />

        <KPI
          title="Profit / Kg"
          value={`₹ ${p.profitPerKg.toFixed(2)}`}
          color={
            p.profitPerKg >= 0
              ? "#16a34a"
              : "#dc2626"
          }
        />

        <KPI
          title="Manufacturing Cost / Kg"
          value={`₹ ${p.manufacturingCostPerKg.toFixed(2)}`}
          color="#dc2626"
        />

        <KPI
          title="Conversion Cost / Kg"
          value={`₹ ${p.conversionCostPerKg.toFixed(2)}`}
          color="#d97706"
        />

        <KPI
          title="Average Selling Price"
          value={`₹ ${saleRate.toFixed(2)}`}
          color="#7c3aed"
        />

        <KPI
          title="Net Margin"
          value={`${margin.toFixed(2)} %`}
          color={
            margin >= 10
              ? "#16a34a"
              : margin >= 5
              ? "#d97706"
              : "#dc2626"
          }
        />
      </div>

      <table style={table}>
        <thead>
          <tr>
            <th style={th}>Profit & Loss Summary</th>
            <th style={thRight}>Lakhs</th>
          </tr>
        </thead>

        <tbody>
          <Row title="Sales Revenue" value={p.salesValue} />
          <Row title="Material Consumed" value={-c.estimatedRmConsumedValue} />
          <Row title="Stores & Consumables" value={-c.storesIssueValue} />
          <Row title="Factory Expenses" value={-c.factoryExpenseValue} />
          <Row title="Fixed Costs" value={-c.fixedCostValue} />

          <tr style={profitRow}>
            <td style={td}>
              <b>Manufacturing Profit</b>
            </td>

            <td style={tdRight}>
              <b>
                ₹ {lakh(p.manufacturingProfit)}
              </b>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function KPI({ title, value, color }) {
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

function Row({ title, value }) {
  const lakh = (v) => (Number(v || 0) / 100000).toFixed(2);

  return (
    <tr>
      <td style={td}>{title}</td>

      <td
        style={{
          ...tdRight,
          color: value >= 0 ? "#16a34a" : "#dc2626",
        }}
      >
        ₹ {lakh(value)}
      </td>
    </tr>
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

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: 16,
  marginBottom: 30,
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
};

const valueStyle = {
  fontSize: 28,
  fontWeight: 800,
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
};

const th = {
  textAlign: "left",
  padding: 12,
  background: "#f8fafc",
  borderBottom: "2px solid #e2e8f0",
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

const profitRow = {
  background: "#ecfdf5",
};
