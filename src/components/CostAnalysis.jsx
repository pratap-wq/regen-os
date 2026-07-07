export default function CostAnalysis({ close }) {
  if (!close) return null;

  const c = close.costs;

  const lakh = (v) => (Number(v || 0) / 100000).toFixed(2);

  const rows = [
    {
      title: "Raw Material Consumed",
      value: c.estimatedRmConsumedValue,
      color: "#2563eb",
    },
    {
      title: "Stores Consumed",
      value: c.storesIssueValue,
      color: "#0f766e",
    },
    {
      title: "Factory Expenses",
      value: c.factoryExpenseValue,
      color: "#d97706",
    },
    {
      title: "Total Factory Overhead",
      value: c.conversionCost,
      color: "#dc2626",
    },
    {
      title: "Manufacturing Cost",
      value: c.totalManufacturingCost,
      color: "#0f172a",
    },
  ];

  return (
    <div style={card}>
      <h2 style={title}>💰 Manufacturing Cost Analysis</h2>

      <div style={grid}>
        {rows.map((r) => (
          <div key={r.title} style={box}>
            <div style={label}>{r.title}</div>

            <div
              style={{
                ...value,
                color: r.color,
              }}
            >
              ₹ {lakh(r.value)} L
            </div>
          </div>
        ))}
      </div>

      <h3 style={subTitle}>Cost Waterfall</h3>

      <table style={table}>
        <thead>
          <tr>
            <th style={th}>Cost Component</th>
            <th style={thRight}>Amount (Lakhs)</th>
            <th style={thRight}>% of Manufacturing Cost</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => (
            <tr key={r.title}>
              <td style={td}>{r.title}</td>

              <td style={tdRight}>
                ₹ {lakh(r.value)}
              </td>

              <td style={tdRight}>
                {c.totalManufacturingCost > 0
                  ? (
                      (r.value / c.totalManufacturingCost) *
                      100
                    ).toFixed(1)
                  : "0.0"}
                %
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={footer}>
        <div style={total}>
          Total Manufacturing Cost
        </div>

        <div style={totalValue}>
          ₹ {lakh(c.totalManufacturingCost)} L
        </div>
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

const subTitle = {
  marginTop: 30,
  marginBottom: 16,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: 16,
};

const box = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: 18,
};

const label = {
  color: "#64748b",
  fontSize: 13,
  marginBottom: 8,
};

const value = {
  fontSize: 28,
  fontWeight: 800,
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 10,
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

const footer = {
  marginTop: 24,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderTop: "2px solid #e2e8f0",
  paddingTop: 20,
};

const total = {
  fontSize: 18,
  fontWeight: 700,
};

const totalValue = {
  fontSize: 26,
  fontWeight: 900,
  color: "#0f172a",
};
