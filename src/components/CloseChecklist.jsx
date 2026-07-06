export default function CloseChecklist({ close }) {
  if (!close) return null;

  const checks = [
    {
      title: "Material Reconciliation",
      ok: close.rm.purchasedKg >= close.rm.consumedKg,
    },
    {
      title: "Production Reconciliation",
      ok: close.production.fgProducedKg >= 0,
    },
    {
      title: "Inventory Reconciliation",
      ok:
        close.inventory.rmClosingKg >= 0 &&
        close.inventory.fgClosingKg >= 0,
    },
    {
      title: "Material Accountability",
      ok: close.materialFlow.accountabilityPercent >= 99.5,
    },
    {
      title: "Stores Cost Posted",
      ok: close.costs.storesIssueValue >= 0,
    },
    {
      title: "Factory Expenses Posted",
      ok: close.costs.factoryExpenseValue >= 0,
    },
    {
      title: "Fixed Costs Posted",
      ok: close.costs.fixedCostValue >= 0,
    },
    {
      title: "Profit Calculated",
      ok: close.profitability.salesValue > 0,
    },
  ];

  const completed = checks.filter((c) => c.ok).length;
  const ready = completed === checks.length;

  return (
    <div style={card}>
      <h2 style={title}>✅ Month Close Checklist</h2>

      <div style={progressBox}>
        <div style={progressText}>
          {completed} / {checks.length} Checks Completed
        </div>

        <div style={progressBar}>
          <div
            style={{
              ...progressFill,
              width: `${(completed / checks.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {checks.map((item) => (
        <div key={item.title} style={row}>
          <div style={left}>
            <span style={icon}>
              {item.ok ? "✅" : "⚠️"}
            </span>

            <span>{item.title}</span>
          </div>

          <div
            style={{
              ...status,
              color: item.ok ? "#16a34a" : "#dc2626",
            }}
          >
            {item.ok ? "Completed" : "Pending"}
          </div>
        </div>
      ))}

      <div
        style={{
          ...footer,
          background: ready ? "#dcfce7" : "#fee2e2",
        }}
      >
        <div>
          <b>
            {ready
              ? "✔ Month Ready To Close"
              : "⚠ Month Cannot Be Closed Yet"}
          </b>

          <div style={{ marginTop: 6 }}>
            {ready
              ? "All reconciliations are complete."
              : "Complete all pending checks before locking the month."}
          </div>
        </div>

        <button
          disabled={!ready}
          style={{
            ...button,
            opacity: ready ? 1 : 0.5,
            cursor: ready ? "pointer" : "not-allowed",
          }}
        >
          🔒 Close Control Room
        </button>
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

const progressBox = {
  marginBottom: 24,
};

const progressText = {
  marginBottom: 10,
  fontWeight: 700,
};

const progressBar = {
  height: 14,
  background: "#e2e8f0",
  borderRadius: 999,
  overflow: "hidden",
};

const progressFill = {
  height: "100%",
  background: "#16a34a",
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px 0",
  borderBottom: "1px solid #f1f5f9",
};

const left = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const icon = {
  fontSize: 20,
};

const status = {
  fontWeight: 700,
};

const footer = {
  marginTop: 24,
  borderRadius: 12,
  padding: 20,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
};

const button = {
  background: "#0f766e",
  color: "#fff",
  border: "none",
  padding: "12px 22px",
  borderRadius: 10,
  fontWeight: 800,
  fontSize: 15,
};
