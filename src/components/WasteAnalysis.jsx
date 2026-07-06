export default function WasteAnalysis({ close }) {
  if (!close) return null;

  const flow = close.materialFlow;

  const ton = (kg) => (Number(kg || 0) / 1000).toFixed(2);

  const rows = [
    { name: "Raffia / Labels", value: flow.raffiaKg },
    { name: "Wrappers", value: flow.wrappersKg },
    { name: "Sink Waste", value: flow.sinkMaterialKg },
    { name: "Iron Scrap", value: flow.ironScrapKg },
    { name: "Other Colour Reject", value: flow.otherColorKg },
    { name: "Sorting Reject", value: flow.sortingRejectKg },
    { name: "Rubber Reject", value: flow.rubberRejectKg },
    { name: "Mesh Reject", value: flow.meshRejectKg },
    { name: "Lumps", value: flow.lumpsKg },
    { name: "Purging", value: flow.purgingKg },
    { name: "Rework Granules", value: flow.reworkKg },
    { name: "Micro Plastic", value: flow.microPlasticKg },
    { name: "Wash Dust", value: flow.washDustKg },
    { name: "Sorting Dust", value: flow.sorterDustKg },
    { name: "Extrusion Dust", value: flow.extrusionDustKg },
    { name: "Sludge", value: flow.sludgeKg },
    { name: "Vacuum Reject", value: flow.vacuumRejectKg },
    { name: "Floor Spillage", value: flow.floorSpillageKg },
  ];

  return (
    <div style={card}>
      <h2 style={title}>♻ Material Accountability & Waste Analysis</h2>

      <div style={summaryGrid}>
        <Summary
          title="Material Input"
          value={ton(flow.rmInputKg)}
          unit="T"
          color="#2563eb"
        />

        <Summary
          title="Dispatch Material"
          value={ton(flow.fgKg)}
          unit="T"
          color="#16a34a"
        />

        <Summary
          title="Recovery / Reuse"
          value={ton(flow.recoveryReuseKg)}
          unit="T"
          color="#0f766e"
        />

        <Summary
          title="Waste Sale"
          value={ton(flow.wasteSaleKg)}
          unit="T"
          color="#d97706"
        />

        <Summary
          title="True Process Loss"
          value={ton(flow.trueLossKg)}
          unit="T"
          color="#dc2626"
        />

        <Summary
          title="Material Difference"
          value={ton(flow.materialDifferenceKg)}
          unit="T"
          color={
            Math.abs(flow.materialDifferenceKg) < 50
              ? "#16a34a"
              : "#dc2626"
          }
        />
      </div>

      <table style={table}>
        <thead>
          <tr>
            <th style={th}>Waste Category</th>
            <th style={thRight}>Tonnes</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => (
            <tr key={r.name}>
              <td style={td}>{r.name}</td>
              <td style={tdRight}>{ton(r.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={footer}>
        <div style={accountability}>
          Material Accountability :
          <b style={{ marginLeft: 10 }}>
            {flow.accountabilityPercent.toFixed(2)} %
          </b>
        </div>

        <div
          style={{
            ...badge,
            background:
              flow.accountabilityPercent >= 99.5
                ? "#dcfce7"
                : "#fee2e2",
            color:
              flow.accountabilityPercent >= 99.5
                ? "#166534"
                : "#991b1b",
          }}
        >
          {flow.accountabilityPercent >= 99.5
            ? "✔ Balanced"
            : "⚠ Investigation Required"}
        </div>
      </div>
    </div>
  );
}

function Summary({ title, value, unit, color }) {
  return (
    <div style={summary}>
      <div style={summaryTitle}>{title}</div>
      <div style={{ ...summaryValue, color }}>
        {value} {unit}
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

const summaryGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
  gap: 16,
  marginBottom: 24,
};

const summary = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: 16,
};

const summaryTitle = {
  fontSize: 13,
  color: "#64748b",
  marginBottom: 8,
};

const summaryValue = {
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
  padding: 10,
  borderBottom: "1px solid #f1f5f9",
};

const tdRight = {
  ...td,
  textAlign: "right",
  fontWeight: 700,
};

const footer = {
  marginTop: 20,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
};

const accountability = {
  fontSize: 18,
};

const badge = {
  padding: "10px 18px",
  borderRadius: 20,
  fontWeight: 700,
};
