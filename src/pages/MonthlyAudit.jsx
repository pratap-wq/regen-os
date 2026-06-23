import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";

export default function MonthlyAudit() {
  const now = new Date();

  const [month, setMonth] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  );

  const [rmRows, setRmRows] = useState([]);
  const [washRows, setWashRows] = useState([]);
  const [sortingRows, setSortingRows] = useState([]);
  const [extrusionRows, setExtrusionRows] = useState([]);
  const [dispatchRows, setDispatchRows] = useState([]);
  const [storesInwardRows, setStoresInwardRows] = useState([]);
  const [storesIssueRows, setStoresIssueRows] = useState([]);
  const [factoryExpensesRows, setFactoryExpensesRows] = useState([]);

  const [physical, setPhysical] = useState({
    rmPhysicalKg: "",
    washPhysicalKg: "",
    sortingPhysicalKg: "",
    fgPhysicalKg: "",
    storesPhysicalValue: "",
    remarks: "",
    closedBy: "Pratap",
  });

  const [status, setStatus] = useState("");

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
        storesInward,
        storesIssue,
        factoryExpenses,
      ] = await Promise.all([
        apiCall({ fn: "rm.list" }),
        apiCall({ fn: "wash.list" }),
        apiCall({ fn: "sorting.list" }),
        apiCall({ fn: "extrusion.list" }),
        apiCall({ fn: "dispatch.list" }),
        apiCall({ fn: "storesInward.list" }),
        apiCall({ fn: "storesIssue.list" }),
        apiCall({ fn: "factoryExpenses.list" }),
      ]);

      setRmRows(rm.rows || []);
      setWashRows(wash.rows || []);
      setSortingRows(sorting.rows || []);
      setExtrusionRows(extrusion.rows || []);
      setDispatchRows(dispatch.rows || []);
      setStoresInwardRows(storesInward.rows || []);
      setStoresIssueRows(storesIssue.rows || []);
      setFactoryExpensesRows(factoryExpenses.rows || []);
    } catch (err) {
      setStatus(err.message);
    }
  }

  function rowInMonth(row) {
    const value = row.date || row.createdAt || "";
    if (!value) return false;

    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value).startsWith(month);

    return (
      d.getFullYear() === Number(month.slice(0, 4)) &&
      d.getMonth() + 1 === Number(month.slice(5, 7))
    );
  }

  const filtered = useMemo(() => {
    return {
      rm: rmRows.filter(rowInMonth),
      wash: washRows.filter(rowInMonth),
      sorting: sortingRows.filter(rowInMonth),
      extrusion: extrusionRows.filter(rowInMonth),
      dispatch: dispatchRows.filter(rowInMonth),
      storesInward: storesInwardRows.filter(rowInMonth),
      storesIssue: storesIssueRows.filter(rowInMonth),
      factoryExpenses: factoryExpensesRows.filter(rowInMonth),
    };
  }, [
    month,
    rmRows,
    washRows,
    sortingRows,
    extrusionRows,
    dispatchRows,
    storesInwardRows,
    storesIssueRows,
    factoryExpensesRows,
  ]);

  const audit = useMemo(() => {
    const rmInwardKg = sum(filtered.rm, "netWeight");

    const rmValue = filtered.rm.reduce((s, r) => {
      return s + Number(r.netWeight || 0) * Number(r.ratePerKg || 0);
    }, 0);

    const washInputKg = sum(filtered.wash, "inputWeightKg");
    const washedOutputKg = sum(filtered.wash, "washedOutputKg");

    const raffiaKg = sum(filtered.wash, "raffiaKg");
    const wrappersKg = sum(filtered.wash, "wrappersKg");
    const microPlasticKg = sum(filtered.wash, "microPlasticKg");
    const sinkMaterialKg = sum(filtered.wash, "sinkMaterialKg");
    const ironScrapKg = sum(filtered.wash, "ironScrapKg");
    const otherColorKg = sum(filtered.wash, "otherColorKg");
    const washDustKg = sum(filtered.wash, "dustKg");
    const sludgeKg = sum(filtered.wash, "sludgeKg");

    const sortingInputKg = sum(filtered.sorting, "inputWeightKg");
    const whiteSortedKg = sum(filtered.sorting, "whiteSortedKg");
    const allMixSortedKg = sum(filtered.sorting, "allMixSortedKg");
    const commodityKg = sum(filtered.sorting, "commodityKg");
    const whiteGreyKg = sum(filtered.sorting, "whiteGreyKg");
    const acceptedQtyKg =
      sum(filtered.sorting, "acceptedQtyKg") ||
      whiteSortedKg + allMixSortedKg + commodityKg + whiteGreyKg;

    const sortingRejectKg =
      sum(filtered.sorting, "rejectedQtyKg") ||
      sum(filtered.sorting, "rejectedWeightKg");

    const rubberRejectKg = sum(filtered.sorting, "rubberRejectKg");
    const blackSpecsRejectKg = sum(filtered.sorting, "blackSpecsRejectKg");
    const sorterDustKg = sum(filtered.sorting, "dustKg");

    const extrusionInputKg = sum(filtered.extrusion, "inputWeightKg");
    const fgProducedKg =
      sum(filtered.extrusion, "fgOutputKg") ||
      sum(filtered.extrusion, "outputWeight");

    const lumpsKg = sum(filtered.extrusion, "lumpsKg");
    const reworkKg = sum(filtered.extrusion, "reworkGranulesKg");
    const purgingKg = sum(filtered.extrusion, "purgingKg");
    const meshRejectKg =
      sum(filtered.extrusion, "meshRejectKg") ||
      sum(filtered.extrusion, "meshRejectionKg");
    const vacuumRejectKg = sum(filtered.extrusion, "vacuumRejectKg");
    const extrusionDustKg = sum(filtered.extrusion, "dustKg");
    const floorSpillageKg = sum(filtered.extrusion, "floorSpillageKg");

    const dispatchKg = sum(filtered.dispatch, "quantityKg");

    const turnover = filtered.dispatch.reduce((s, r) => {
      return s + Number(r.quantityKg || 0) * Number(r.ratePerKg || 0);
    }, 0);

    const storesInwardValue = sum(filtered.storesInward, "totalAmount");
    const storesIssueQty = sum(filtered.storesIssue, "qty");
    const factoryExpenses = sum(filtered.factoryExpenses, "amount");

    const rmSystemClosingKg = rmInwardKg - washInputKg;
    const washSystemClosingKg = washedOutputKg - sortingInputKg;
    const sortingSystemClosingKg = acceptedQtyKg - extrusionInputKg;
    const fgSystemClosingKg = fgProducedKg - dispatchKg;

    const totalWashLossKg =
      raffiaKg +
      wrappersKg +
      microPlasticKg +
      sinkMaterialKg +
      ironScrapKg +
      otherColorKg +
      washDustKg +
      sludgeKg;

    const totalSortingLossKg =
      sortingRejectKg +
      rubberRejectKg +
      blackSpecsRejectKg +
      sorterDustKg;

    const totalExtrusionLossKg =
      lumpsKg +
      reworkKg +
      purgingKg +
      meshRejectKg +
      vacuumRejectKg +
      extrusionDustKg +
      floorSpillageKg;

    const washRecoveryPercent =
      washInputKg > 0 ? ((washedOutputKg / washInputKg) * 100).toFixed(2) : "0.00";

    const sortingRecoveryPercent =
      sortingInputKg > 0 ? ((acceptedQtyKg / sortingInputKg) * 100).toFixed(2) : "0.00";

    const extrusionRecoveryPercent =
      extrusionInputKg > 0 ? ((fgProducedKg / extrusionInputKg) * 100).toFixed(2) : "0.00";

    const overallRecoveryPercent =
      washInputKg > 0 ? ((fgProducedKg / washInputKg) * 100).toFixed(2) : "0.00";

    const totalProcessLossKg =
      totalWashLossKg + totalSortingLossKg + totalExtrusionLossKg;

    const totalProcessLossPercent =
      washInputKg > 0 ? ((totalProcessLossKg / washInputKg) * 100).toFixed(2) : "0.00";

    const avgRmPrice = rmInwardKg > 0 ? (rmValue / rmInwardKg).toFixed(2) : "0.00";
    const estimatedRmConsumedValue = washInputKg * Number(avgRmPrice || 0);
    const grossContribution = turnover - estimatedRmConsumedValue;
    const manufacturingProfit = grossContribution - factoryExpenses - storesInwardValue;

    const processingCostPerKg =
      fgProducedKg > 0
        ? ((factoryExpenses + storesInwardValue) / fgProducedKg).toFixed(2)
        : "0.00";

    const marginPerKg =
      dispatchKg > 0 ? (manufacturingProfit / dispatchKg).toFixed(2) : "0.00";

    const qualityRows = [
      ...filtered.wash,
      ...filtered.sorting,
      ...filtered.extrusion,
    ].filter((r) => Number(r.overallQualityRating || 0) > 0);

    const avgQuality =
      qualityRows.length > 0
        ? (
            qualityRows.reduce(
              (s, r) => s + Number(r.overallQualityRating || 0),
              0
            ) / qualityRows.length
          ).toFixed(2)
        : "0.00";

    const downtimeHours =
      sum(filtered.wash, "downtimeHours") +
      sum(filtered.sorting, "downtimeHours") +
      sum(filtered.extrusion, "downtimeHours");

    return {
      rmInwardKg,
      rmValue,

      washInputKg,
      washedOutputKg,
      raffiaKg,
      wrappersKg,
      microPlasticKg,
      sinkMaterialKg,
      ironScrapKg,
      otherColorKg,
      washDustKg,
      sludgeKg,
      totalWashLossKg,
      washRecoveryPercent,

      sortingInputKg,
      whiteSortedKg,
      allMixSortedKg,
      commodityKg,
      whiteGreyKg,
      acceptedQtyKg,
      sortingRejectKg,
      rubberRejectKg,
      blackSpecsRejectKg,
      sorterDustKg,
      totalSortingLossKg,
      sortingRecoveryPercent,

      extrusionInputKg,
      fgProducedKg,
      lumpsKg,
      reworkKg,
      purgingKg,
      meshRejectKg,
      vacuumRejectKg,
      extrusionDustKg,
      floorSpillageKg,
      totalExtrusionLossKg,
      extrusionRecoveryPercent,

      dispatchKg,
      turnover,

      rmSystemClosingKg,
      washSystemClosingKg,
      sortingSystemClosingKg,
      fgSystemClosingKg,

      overallRecoveryPercent,
      totalProcessLossKg,
      totalProcessLossPercent,

      storesInwardValue,
      storesIssueQty,
      factoryExpenses,
      avgRmPrice,
      estimatedRmConsumedValue,
      grossContribution,
      manufacturingProfit,
      processingCostPerKg,
      marginPerKg,

      avgQuality,
      downtimeHours,
    };
  }, [filtered]);

  const variances = {
    rmVarianceKg: Number(physical.rmPhysicalKg || 0) - audit.rmSystemClosingKg,
    washVarianceKg: Number(physical.washPhysicalKg || 0) - audit.washSystemClosingKg,
    sortingVarianceKg:
      Number(physical.sortingPhysicalKg || 0) - audit.sortingSystemClosingKg,
    fgVarianceKg: Number(physical.fgPhysicalKg || 0) - audit.fgSystemClosingKg,
  };

  function onPhysicalChange(e) {
    setPhysical((p) => ({
      ...p,
      [e.target.name]: e.target.value,
    }));
  }

  async function closeMonth() {
    const ok = window.confirm(
      `Freeze ${month}? This should be done only after physical stock verification.`
    );

    if (!ok) return;

    try {
      const res = await apiCall({
        fn: "monthClose.add",
        periodMonth: month,
        ...audit,
        ...physical,
        ...variances,
      });

      if (res.ok) {
        setStatus("Month closed and operational stock snapshot saved.");
      } else {
        setStatus(res.error || "Month close failed");
      }
    } catch (err) {
      setStatus(err.message);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <div style={topBar}>
        <div>
          <h1 style={{ margin: 0 }}>Month-End Operational Audit</h1>
          <div style={{ color: "#64748b", marginTop: 5 }}>
            Full material reconciliation: RM → Wash → Sorting → Extrusion → FG → Dispatch
          </div>
        </div>

        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          style={inputStyle}
        />
      </div>

      <Section title="1. Production Flow Summary">
        <Card title="RM Inward" value={`${audit.rmInwardKg.toFixed(0)} Kg`} />
        <Card title="Wash Input" value={`${audit.washInputKg.toFixed(0)} Kg`} />
        <Card title="Washed Output" value={`${audit.washedOutputKg.toFixed(0)} Kg`} />
        <Card title="Sorting Input" value={`${audit.sortingInputKg.toFixed(0)} Kg`} />
        <Card title="Sorting Accepted" value={`${audit.acceptedQtyKg.toFixed(0)} Kg`} />
        <Card title="Extrusion Input" value={`${audit.extrusionInputKg.toFixed(0)} Kg`} />
        <Card title="FG Produced" value={`${audit.fgProducedKg.toFixed(0)} Kg`} />
        <Card title="Dispatch" value={`${audit.dispatchKg.toFixed(0)} Kg`} />
      </Section>

      <Section title="2. Recovery Dashboard">
        <Card title="Wash Recovery" value={`${audit.washRecoveryPercent}%`} />
        <Card title="Sorting Recovery" value={`${audit.sortingRecoveryPercent}%`} />
        <Card title="Extrusion Recovery" value={`${audit.extrusionRecoveryPercent}%`} />
        <Card title="Overall Recovery" value={`${audit.overallRecoveryPercent}%`} />
        <Card title="Total Process Loss" value={`${audit.totalProcessLossKg.toFixed(0)} Kg`} />
        <Card title="Process Loss %" value={`${audit.totalProcessLossPercent}%`} />
      </Section>

      <Section title="3. System Closing Stock">
        <Card title="RM System Closing" value={`${audit.rmSystemClosingKg.toFixed(0)} Kg`} />
        <Card title="Washed Stock System" value={`${audit.washSystemClosingKg.toFixed(0)} Kg`} />
        <Card title="Sorting Stock System" value={`${audit.sortingSystemClosingKg.toFixed(0)} Kg`} />
        <Card title="FG Closing System" value={`${audit.fgSystemClosingKg.toFixed(0)} Kg`} />
      </Section>

      <Section title="4. Physical Stock Entry">
        <InputCard
          label="Physical RM Closing Kg"
          name="rmPhysicalKg"
          value={physical.rmPhysicalKg}
          onChange={onPhysicalChange}
        />
        <InputCard
          label="Physical Washed Stock Kg"
          name="washPhysicalKg"
          value={physical.washPhysicalKg}
          onChange={onPhysicalChange}
        />
        <InputCard
          label="Physical Sorting Stock Kg"
          name="sortingPhysicalKg"
          value={physical.sortingPhysicalKg}
          onChange={onPhysicalChange}
        />
        <InputCard
          label="Physical FG Closing Kg"
          name="fgPhysicalKg"
          value={physical.fgPhysicalKg}
          onChange={onPhysicalChange}
        />
        <InputCard
          label="Physical Stores Value ₹"
          name="storesPhysicalValue"
          value={physical.storesPhysicalValue}
          onChange={onPhysicalChange}
        />
      </Section>

      <Section title="5. Variance">
        <Card title="RM Variance" value={`${variances.rmVarianceKg.toFixed(0)} Kg`} />
        <Card title="Washed Stock Variance" value={`${variances.washVarianceKg.toFixed(0)} Kg`} />
        <Card title="Sorting Stock Variance" value={`${variances.sortingVarianceKg.toFixed(0)} Kg`} />
        <Card title="FG Variance" value={`${variances.fgVarianceKg.toFixed(0)} Kg`} />
      </Section>

      <Section title="6. Washline Wastage Detail">
        <Card title="Raffia" value={`${audit.raffiaKg.toFixed(0)} Kg`} />
        <Card title="Wrappers" value={`${audit.wrappersKg.toFixed(0)} Kg`} />
        <Card title="Micro Plastic" value={`${audit.microPlasticKg.toFixed(0)} Kg`} />
        <Card title="Sink Material" value={`${audit.sinkMaterialKg.toFixed(0)} Kg`} />
        <Card title="Iron Scrap" value={`${audit.ironScrapKg.toFixed(0)} Kg`} />
        <Card title="Other Color" value={`${audit.otherColorKg.toFixed(0)} Kg`} />
        <Card title="Wash Dust" value={`${audit.washDustKg.toFixed(0)} Kg`} />
        <Card title="Sludge" value={`${audit.sludgeKg.toFixed(0)} Kg`} />
        <Card title="Total Wash Loss" value={`${audit.totalWashLossKg.toFixed(0)} Kg`} />
      </Section>

      <Section title="7. Sorting Wastage Detail">
        <Card title="White Sorted" value={`${audit.whiteSortedKg.toFixed(0)} Kg`} />
        <Card title="All Mix" value={`${audit.allMixSortedKg.toFixed(0)} Kg`} />
        <Card title="Commodity" value={`${audit.commodityKg.toFixed(0)} Kg`} />
        <Card title="White & Grey" value={`${audit.whiteGreyKg.toFixed(0)} Kg`} />
        <Card title="Sorting Reject" value={`${audit.sortingRejectKg.toFixed(0)} Kg`} />
        <Card title="Rubber Reject" value={`${audit.rubberRejectKg.toFixed(0)} Kg`} />
        <Card title="Black Specs Reject" value={`${audit.blackSpecsRejectKg.toFixed(0)} Kg`} />
        <Card title="Sorter Dust" value={`${audit.sorterDustKg.toFixed(0)} Kg`} />
        <Card title="Total Sorting Loss" value={`${audit.totalSortingLossKg.toFixed(0)} Kg`} />
      </Section>

      <Section title="8. Extrusion Wastage Detail">
        <Card title="FG Produced" value={`${audit.fgProducedKg.toFixed(0)} Kg`} />
        <Card title="Lumps" value={`${audit.lumpsKg.toFixed(0)} Kg`} />
        <Card title="Rework" value={`${audit.reworkKg.toFixed(0)} Kg`} />
        <Card title="Purging" value={`${audit.purgingKg.toFixed(0)} Kg`} />
        <Card title="Mesh Reject" value={`${audit.meshRejectKg.toFixed(0)} Kg`} />
        <Card title="Vacuum Reject" value={`${audit.vacuumRejectKg.toFixed(0)} Kg`} />
        <Card title="Extrusion Dust" value={`${audit.extrusionDustKg.toFixed(0)} Kg`} />
        <Card title="Floor Spillage" value={`${audit.floorSpillageKg.toFixed(0)} Kg`} />
        <Card title="Total Extrusion Loss" value={`${audit.totalExtrusionLossKg.toFixed(0)} Kg`} />
      </Section>

      <Section title="9. Quality & Downtime">
        <Card title="Average Quality Score" value={`${audit.avgQuality} / 5`} />
        <Card title="Downtime Hours" value={`${audit.downtimeHours.toFixed(1)} Hrs`} />
      </Section>

      <Section title="10. Manufacturing Economics">
        <Card title="Turnover" value={`₹ ${audit.turnover.toFixed(0)}`} />
        <Card title="RM Value" value={`₹ ${audit.rmValue.toFixed(0)}`} />
        <Card title="Avg RM Price" value={`₹ ${audit.avgRmPrice}`} />
        <Card title="Estimated RM Consumed" value={`₹ ${audit.estimatedRmConsumedValue.toFixed(0)}`} />
        <Card title="Factory Expenses" value={`₹ ${audit.factoryExpenses.toFixed(0)}`} />
        <Card title="Stores Inward Value" value={`₹ ${audit.storesInwardValue.toFixed(0)}`} />
        <Card title="Gross Contribution" value={`₹ ${audit.grossContribution.toFixed(0)}`} />
        <Card title="Manufacturing Profit" value={`₹ ${audit.manufacturingProfit.toFixed(0)}`} />
        <Card title="Processing Cost/Kg" value={`₹ ${audit.processingCostPerKg}`} />
        <Card title="Margin/Kg" value={`₹ ${audit.marginPerKg}`} />
      </Section>

      <div style={remarksCard}>
        <label style={{ fontWeight: 700 }}>Remarks / Adjustment Reason</label>
        <textarea
          name="remarks"
          value={physical.remarks}
          onChange={onPhysicalChange}
          style={textareaStyle}
        />

        <label style={{ fontWeight: 700, marginTop: 10 }}>Closed By</label>
        <input
          name="closedBy"
          value={physical.closedBy}
          onChange={onPhysicalChange}
          style={inputStyle}
        />

        <button onClick={closeMonth} style={closeButton}>
          Freeze Month & Save Snapshot
        </button>
      </div>

      {status && <div style={statusStyle}>{status}</div>}
    </div>
  );
}

function sum(rows, key) {
  return rows.reduce((s, r) => s + Number(r[key] || 0), 0);
}

function Section({ title, children }) {
  return (
    <div style={{ marginTop: 25 }}>
      <h2>{title}</h2>
      <div style={grid}>{children}</div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={card}>
      <div style={{ color: "#64748b", marginBottom: 8 }}>{title}</div>
      <h2 style={{ margin: 0, color: "#0f766e" }}>{value}</h2>
    </div>
  );
}

function InputCard({ label, name, value, onChange }) {
  return (
    <div style={card}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>{label}</div>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        style={inputStyle}
      />
    </div>
  );
}

const topBar = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  flexWrap: "wrap",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 16,
};

const card = {
  background: "white",
  padding: 18,
  borderRadius: 12,
  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
};

const inputStyle = {
  padding: 10,
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  width: "100%",
  boxSizing: "border-box",
};

const textareaStyle = {
  ...inputStyle,
  height: 90,
  marginTop: 8,
};

const remarksCard = {
  background: "white",
  padding: 20,
  borderRadius: 12,
  marginTop: 30,
  display: "grid",
  gap: 10,
};

const closeButton = {
  background: "#0f766e",
  color: "white",
  border: "none",
  padding: "14px 18px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
  marginTop: 10,
};

const statusStyle = {
  marginTop: 20,
  color: "#0f766e",
  fontWeight: 700,
};