export default function MaterialFlowSummary({ data = {} }) {
  const rmInputKg = num(data.washInputKg || data.rmInwardKg);
  const fgKg = num(data.fgProducedKg);

  const recoveryKg =
    num(data.lumpsKg) +
    num(data.reworkKg) +
    num(data.reworkGranulesKg) +
    num(data.purgingKg);

  const wasteSaleKg =
    num(data.raffiaKg) +
    num(data.wrappersKg) +
    num(data.sinkMaterialKg) +
    num(data.ironScrapKg) +
    num(data.otherColorKg) +
    num(data.rubberRejectKg) +
    num(data.sortingRejectKg);

  const trueLossKg =
    num(data.microPlasticKg) +
    num(data.washDustKg) +
    num(data.sorterDustKg) +
    num(data.extrusionDustKg) +
    num(data.sludgeKg) +
    num(data.meshRejectKg) +
    num(data.vacuumRejectKg) +
    num(data.floorSpillageKg);

  const accountedKg = fgKg + recoveryKg + wasteSaleKg + trueLossKg;
  const differenceKg = rmInputKg - accountedKg;
  const accountabilityPercent = rmInputKg > 0 ? (accountedKg / rmInputKg) * 100 : 0;

  const avgRmPrice = num(data.avgRmPrice);
  const salesValue = num(data.salesValue || data.turnover);

  const recoveryValue = recoveryKg * avgRmPrice;
  const wasteSaleValue = wasteSaleKg * 5;
  const trueLossValue = trueLossKg * avgRmPrice;

  const balanced = Math.abs(differenceKg) <= 500;

  const rows = [
    {
      label: "Dispatch Material",
      qty: fgKg,
      percent: pct(fgKg, rmInputKg),
      value: salesValue,
      type: "fg",
    },
    {
      label: "Recovery / Reuse",
      qty: recoveryKg,
      percent: pct(recoveryKg, rmInputKg),
      value: recoveryValue,
      type: "recovery",
    },
    {
      label: "Waste Sale",
      qty: wasteSaleKg,
      percent: pct(wasteSaleKg, rmInputKg),
      value: wasteSaleValue,
      type: "sale",
    },
    {
      label: "True Manufacturing Loss",
      qty: trueLossKg,
      percent: pct(trueLossKg, rmInputKg),
      value: trueLossValue,
      type: "loss",
    },
  ];

  const detailRows = [
    ["Lumps", data.lumpsKg, "Recovery / Reuse", "Extrusion"],
    ["Rework Granules", data.reworkKg || data.reworkGranulesKg, "Recovery / Reuse", "Extrusion"],
    ["Purging", data.purgingKg, "Recovery / Reuse", "Extrusion"],

    ["Raffia", data.raffiaKg, "Waste Sale", "Wash"],
    ["Wrappers", data.wrappersKg, "Waste Sale", "Wash"],
    ["Sink Material", data.sinkMaterialKg, "Waste Sale", "Wash"],
    ["Iron Scrap", data.ironScrapKg, "Waste Sale", "Wash"],
    ["Other Colour", data.otherColorKg, "Waste Sale", "Wash"],
    ["Rubber Reject", data.rubberRejectKg, "Waste Sale", "Sorting"],
    ["Sorting Reject", data.sortingRejectKg, "Waste Sale", "Sorting"],

    ["Micro Plastic", data.microPlasticKg, "True Loss", "Wash"],
    ["Wash Dust", data.washDustKg, "True Loss", "Wash"],
    ["Sorter Dust", data.sorterDustKg, "True Loss", "Sorting"],
    ["Extrusion Dust", data.extrusionDustKg, "True Loss", "Extrusion"],
    ["Sludge", data.sludgeKg, "True Loss", "Wash"],
    ["Mesh Reject", data.meshRejectKg, "True Loss", "Extrusion"],
    ["Vacuum Reject", data.vacuumRejectKg, "True Loss", "Extrusion"],
    ["Floor Spillage", data.floorSpillageKg, "True Loss", "Extrusion"],
  ].filter((r) => num(r[1]) > 0);

  const departmentRows = [
    {
      department: "Wash",
      qty:
        num(data.raffiaKg) +
        num(data.wrappersKg) +
        num(data.sinkMaterialKg) +
        num(data.ironScrapKg) +
        num(data.otherColorKg) +
        num(data.microPlasticKg) +
        num(data.washDustKg) +
        num(data.sludgeKg),
    },
    {
      department: "Sorting",
      qty:
        num(data.sortingRejectKg) +
        num(data.rubberRejectKg) +
        num(data.sorterDustKg),
    },
    {
      department: "Extrusion",
      qty:
        recoveryKg +
        num(data.meshRejectKg) +
        num(data.vacuumRejectKg) +
        num(data.extrusionDustKg) +
        num(data.floorSpillageKg),
    },
  ];

  return (
    <section style={panel}>
      <div style={header}>
        <div>
          <div style={eyebrow}>Recycling Material Accountability</div>
          <h2 style={title}>Material Flow Summary</h2>
          <div style={subtitle}>
            Separates real production loss from reusable recovery and saleable waste.
          </div>
        </div>

        <div style={badge(balanced)}>
          {balanced ? "✅ Material Balanced" : "⚠️ Difference Found"}
        </div>
      </div>

      <div style={flowBox}>
        <div style={inputNode}>
          <div style={nodeLabel}>Material Input</div>
          <div style={nodeValue}>{formatTon(rmInputKg)}</div>
        </div>

        <div style={flowGrid}>
          {rows.map((row) => (
            <div key={row.label} style={flowCard(row.type)}>
              <div style={cardLabel}>{row.label}</div>
              <div style={cardValue}>{formatTon(row.qty)}</div>
              <div style={cardSub}>{row.percent.toFixed(2)}% of input</div>
              <div style={cardSub}>{formatCurrency(row.value)}</div>
            </div>
          ))}
        </div>

        <div style={accountBox}>
          <div>
            <div style={smallMuted}>Total Accounted</div>
            <strong>{formatTon(accountedKg)}</strong>
          </div>
          <div>
            <div style={smallMuted}>Input</div>
            <strong>{formatTon(rmInputKg)}</strong>
          </div>
          <div>
            <div style={smallMuted}>Difference</div>
            <strong>{formatKg(differenceKg)}</strong>
          </div>
          <div>
            <div style={smallMuted}>Accountability</div>
            <strong>{accountabilityPercent.toFixed(2)}%</strong>
          </div>
        </div>
      </div>

      <div style={twoCol}>
        <div>
          <h3 style={sectionTitle}>Material Classification</h3>
          <table style={table}>
            <thead>
              <tr>
                <Th>Material</Th>
                <Th>Category</Th>
                <Th>Department</Th>
                <Th align="right">Qty</Th>
              </tr>
            </thead>
            <tbody>
              {detailRows.length === 0 ? (
                <tr>
                  <Td colSpan={4}>No process-loss material recorded for this month.</Td>
                </tr>
              ) : (
                detailRows.map((r) => (
                  <tr key={`${r[0]}-${r[3]}`}>
                    <Td>{r[0]}</Td>
                    <Td>{r[2]}</Td>
                    <Td>{r[3]}</Td>
                    <Td align="right">{formatKg(r[1])}</Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div>
          <h3 style={sectionTitle}>Department Material Impact</h3>
          <table style={table}>
            <thead>
              <tr>
                <Th>Department</Th>
                <Th align="right">Qty</Th>
                <Th align="right">% of Input</Th>
              </tr>
            </thead>
            <tbody>
              {departmentRows.map((r) => (
                <tr key={r.department}>
                  <Td>{r.department}</Td>
                  <Td align="right">{formatKg(r.qty)}</Td>
                  <Td align="right">{pct(r.qty, rmInputKg).toFixed(2)}%</Td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={note}>
            True Loss is the number to reduce. Recovery/reuse and waste sale should
            be managed separately, not treated as full production loss.
          </div>
        </div>
      </div>
    </section>
  );
}

function Th({ children, align = "left" }) {
  return <th style={{ ...th, textAlign: align }}>{children}</th>;
}

function Td({ children, align = "left", colSpan }) {
  return (
    <td colSpan={colSpan} style={{ ...td, textAlign: align }}>
      {children}
    </td>
  );
}

function num(value) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
}

function pct(value, base) {
  if (!base) return 0;
  return (num(value) / num(base)) * 100;
}

function formatKg(value) {
  return `${num(value).toLocaleString("en-IN", { maximumFractionDigits: 0 })} Kg`;
}

function formatTon(valueKg) {
  return `${(num(valueKg) / 1000).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })} T`;
}

function formatCurrency(value) {
  const n = num(value);

  if (Math.abs(n) >= 10000000) {
    return `₹${(n / 10000000).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })} Cr`;
  }

  if (Math.abs(n) >= 100000) {
    return `₹${(n / 100000).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })} L`;
  }

  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

const panel = {
  background: "white",
  padding: 18,
  borderRadius: 16,
  boxShadow: "0 2px 12px rgba(15, 23, 42, 0.08)",
  border: "1px solid #e2e8f0",
  marginBottom: 18,
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  alignItems: "flex-start",
  flexWrap: "wrap",
  marginBottom: 16,
};

const eyebrow = {
  color: "#0f766e",
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: 0.8,
  textTransform: "uppercase",
};

const title = {
  margin: "4px 0 0",
  color: "#0f172a",
};

const subtitle = {
  color: "#64748b",
  marginTop: 5,
};

const badge = (ok) => ({
  padding: "9px 13px",
  borderRadius: 999,
  fontWeight: 900,
  color: ok ? "#065f46" : "#92400e",
  background: ok ? "#d1fae5" : "#fef3c7",
  border: ok ? "1px solid #a7f3d0" : "1px solid #fde68a",
});

const flowBox = {
  background: "#f8fafc",
  borderRadius: 16,
  padding: 16,
  border: "1px solid #e2e8f0",
};

const inputNode = {
  maxWidth: 260,
  margin: "0 auto 16px",
  textAlign: "center",
  background: "#0f766e",
  color: "white",
  borderRadius: 18,
  padding: 18,
  boxShadow: "0 8px 20px rgba(15, 118, 110, 0.24)",
};

const nodeLabel = {
  fontSize: 13,
  opacity: 0.85,
  fontWeight: 800,
};

const nodeValue = {
  fontSize: 30,
  fontWeight: 950,
  marginTop: 5,
};

const flowGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 14,
};

const flowCard = (type) => ({
  background:
    type === "fg"
      ? "#ecfdf5"
      : type === "recovery"
      ? "#eff6ff"
      : type === "sale"
      ? "#fffbeb"
      : "#fef2f2",
  border:
    type === "fg"
      ? "1px solid #a7f3d0"
      : type === "recovery"
      ? "1px solid #bfdbfe"
      : type === "sale"
      ? "1px solid #fde68a"
      : "1px solid #fecaca",
  borderRadius: 16,
  padding: 16,
  textAlign: "center",
});

const cardLabel = {
  color: "#334155",
  fontWeight: 900,
  fontSize: 14,
};

const cardValue = {
  fontSize: 26,
  fontWeight: 950,
  color: "#0f172a",
  marginTop: 8,
};

const cardSub = {
  color: "#64748b",
  fontSize: 13,
  marginTop: 4,
};

const accountBox = {
  marginTop: 16,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 12,
  background: "white",
  borderRadius: 14,
  padding: 14,
  border: "1px solid #e2e8f0",
};

const smallMuted = {
  color: "#64748b",
  fontSize: 12,
  marginBottom: 4,
};

const twoCol = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))",
  gap: 18,
  marginTop: 18,
};

const sectionTitle = {
  margin: "0 0 10px",
  color: "#0f172a",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 14,
};

const th = {
  background: "#f1f5f9",
  padding: 11,
  borderBottom: "1px solid #e2e8f0",
  color: "#334155",
  fontSize: 13,
};

const td = {
  padding: 11,
  borderBottom: "1px solid #e2e8f0",
  color: "#334155",
};

const note = {
  marginTop: 14,
  padding: 13,
  borderRadius: 12,
  background: "#f8fafc",
  color: "#475569",
  border: "1px solid #e2e8f0",
  lineHeight: 1.5,
};
