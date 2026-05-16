import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";

export default function MonthlyAudit() {

  const [rmRows, setRmRows] = useState([]);
  const [washRows, setWashRows] = useState([]);
  const [extrusionRows, setExtrusionRows] = useState([]);
  const [dispatchRows, setDispatchRows] = useState([]);
  const [auditRows, setAuditRows] = useState([]);

  const currentDate = new Date();

  const [month, setMonth] = useState(
    currentDate.toLocaleString("default", {
      month: "short",
    })
  );

  const [year, setYear] = useState(
    String(currentDate.getFullYear())
  );

  const [physicalRM, setPhysicalRM] = useState("");
  const [physicalWash, setPhysicalWash] = useState("");
  const [physicalFG, setPhysicalFG] = useState("");

  const [remarks, setRemarks] = useState("");

  const [status, setStatus] = useState("");

  useEffect(() => {

    loadData();

  }, []);

  async function loadData() {

    try {

      const [
        rm,
        wash,
        extrusion,
        dispatch,
        audit,
      ] = await Promise.all([

        apiCall({ fn: "rm.list" }),
        apiCall({ fn: "wash.list" }),
        apiCall({ fn: "extrusion.list" }),
        apiCall({ fn: "dispatch.list" }),
        apiCall({ fn: "audit.list" }),

      ]);

      setRmRows(rm.rows || []);
      setWashRows(wash.rows || []);
      setExtrusionRows(extrusion.rows || []);
      setDispatchRows(dispatch.rows || []);
      setAuditRows(audit.rows || []);

    } catch (err) {

      console.log(err);

    }

  }

  // =====================================
  // FILTER
  // =====================================

  function isSelectedMonth(dateValue) {

    if (!dateValue) return false;

    const d = new Date(dateValue);

    const rowMonth =
      d.toLocaleString("default", {
        month: "short",
      });

    const rowYear =
      String(d.getFullYear());

    return (
      rowMonth === month &&
      rowYear === year
    );

  }

  const filteredRM = useMemo(() => {

    return rmRows.filter((r) =>
      isSelectedMonth(r.date)
    );

  }, [rmRows, month, year]);

  const filteredWash = useMemo(() => {

    return washRows.filter((r) =>
      isSelectedMonth(r.date)
    );

  }, [washRows, month, year]);

  const filteredExtrusion = useMemo(() => {

    return extrusionRows.filter((r) =>
      isSelectedMonth(r.date)
    );

  }, [extrusionRows, month, year]);

  const filteredDispatch = useMemo(() => {

    return dispatchRows.filter((r) =>
      isSelectedMonth(r.date)
    );

  }, [dispatchRows, month, year]);

  // =====================================
  // PREVIOUS MONTH CLOSING
  // =====================================

  const previousAudit =
    auditRows.find((r) => {

      const auditDate =
        new Date(`${r.month} 1, ${r.year}`);

      const selectedDate =
        new Date(`${month} 1, ${year}`);

      return auditDate < selectedDate;

    }) || {};

  // =====================================
  // RM
  // =====================================

  const rmOpening =
    Number(previousAudit.rmClosingPhysicalKg || 0);

  const rmInward =
    filteredRM.reduce((sum, r) => {

      return sum +
        Number(r.netWeight || 0);

    }, 0);

  const rmConsumed =
    filteredWash.reduce((sum, r) => {

      return sum +
        Number(r.inputWeight || 0);

    }, 0);

  const rmClosingSystem =
    rmOpening +
    rmInward -
    rmConsumed;

  const rmDifference =
    Number(physicalRM || 0) -
    rmClosingSystem;

  // =====================================
  // WASH
  // =====================================

  const washOpening =
    Number(previousAudit.washClosingPhysicalKg || 0);

  const washProduced =
    filteredWash.reduce((sum, r) => {

      return sum +
        Number(r.outputWeight || 0);

    }, 0);

  const washConsumed =
    filteredExtrusion.reduce((sum, r) => {

      return sum +
        Number(r.inputWeight || 0);

    }, 0);

  const washClosingSystem =
    washOpening +
    washProduced -
    washConsumed;

  const washDifference =
    Number(physicalWash || 0) -
    washClosingSystem;

  // =====================================
  // FG
  // =====================================

  const fgOpening =
    Number(previousAudit.fgClosingPhysicalKg || 0);

  const fgProduced =
    filteredExtrusion.reduce((sum, r) => {

      return sum +
        Number(r.outputWeight || 0);

    }, 0);

  const fgDispatched =
    filteredDispatch.reduce((sum, r) => {

      return sum +
        Number(r.quantityKg || 0);

    }, 0);

  const fgClosingSystem =
    fgOpening +
    fgProduced -
    fgDispatched;

  const fgDifference =
    Number(physicalFG || 0) -
    fgClosingSystem;

  // =====================================
  // FINANCIALS
  // =====================================

  const turnover =
    filteredDispatch.reduce((sum, r) => {

      return sum + (
        Number(r.quantityKg || 0) *
        Number(r.ratePerKg || 0)
      );

    }, 0);

  const rmValue =
    filteredRM.reduce((sum, r) => {

      return sum + (
        Number(r.netWeight || 0) *
        Number(r.ratePerKg || 0)
      );

    }, 0);

  const avgRmPrice =
    rmInward > 0
      ? (rmValue / rmInward).toFixed(2)
      : 0;

  const estimatedRMConsumedValue =
    fgProduced *
    Number(avgRmPrice || 0);

  const grossProfit =
    turnover -
    estimatedRMConsumedValue;

  const recovery =
    rmConsumed > 0
      ? (
          (fgProduced / rmConsumed) * 100
        ).toFixed(2)
      : 0;

  const totalPower =
    filteredExtrusion.reduce((sum, r) => {

      return sum +
        Number(r.powerUnits || 0);

    }, 0);

  const powerPerKg =
    fgProduced > 0
      ? (
          totalPower / fgProduced
        ).toFixed(2)
      : 0;

  // =====================================
  // SAVE
  // =====================================

  async function closeMonth() {

    try {

      const res = await apiCall({

        fn: "audit.add",

        month,
        year,

        rmOpeningKg: rmOpening,
        rmInwardKg: rmInward,
        rmConsumedKg: rmConsumed,
        rmClosingSystemKg: rmClosingSystem,
        rmClosingPhysicalKg: physicalRM,
        rmDifferenceKg: rmDifference,

        washOpeningKg: washOpening,
        washProducedKg: washProduced,
        washConsumedKg: washConsumed,
        washClosingSystemKg: washClosingSystem,
        washClosingPhysicalKg: physicalWash,
        washDifferenceKg: washDifference,

        fgOpeningKg: fgOpening,
        fgProducedKg: fgProduced,
        fgDispatchedKg: fgDispatched,
        fgClosingSystemKg: fgClosingSystem,
        fgClosingPhysicalKg: physicalFG,
        fgDifferenceKg: fgDifference,

        turnover,
        avgRmPrice,
        grossProfitEstimate: grossProfit,
        recoveryPercent: recovery,
        powerPerKg,

        remarks,
        closedBy: "Pratap",

      });

      if (res.ok) {

        setStatus("Month closed successfully");

        loadData();

      } else {

        setStatus("Error saving");

      }

    } catch (err) {

      setStatus(err.message);

    }

  }

  return (

    <div style={{ padding: 20 }}>

      <h1>Monthly Audit & Closing</h1>

      <div style={gridStyle}>

        <select
          value={month}
          onChange={(e) =>
            setMonth(e.target.value)
          }
          style={inputStyle}
        >

          <option>Jan</option>
          <option>Feb</option>
          <option>Mar</option>
          <option>Apr</option>
          <option>May</option>
          <option>Jun</option>
          <option>Jul</option>
          <option>Aug</option>
          <option>Sep</option>
          <option>Oct</option>
          <option>Nov</option>
          <option>Dec</option>

        </select>

        <select
          value={year}
          onChange={(e) =>
            setYear(e.target.value)
          }
          style={inputStyle}
        >

          <option>2025</option>
          <option>2026</option>
          <option>2027</option>

        </select>

      </div>

      {/* RM */}

      <SectionTitle title="RM Closing" />

      <AuditCard
        opening={rmOpening}
        inward={rmInward}
        consumed={rmConsumed}
        system={rmClosingSystem}
        physical={physicalRM}
        setPhysical={setPhysicalRM}
        difference={rmDifference}
      />

      {/* WASH */}

      <SectionTitle title="Wash Stock Closing" />

      <AuditCard
        opening={washOpening}
        inward={washProduced}
        consumed={washConsumed}
        system={washClosingSystem}
        physical={physicalWash}
        setPhysical={setPhysicalWash}
        difference={washDifference}
      />

      {/* FG */}

      <SectionTitle title="FG Closing" />

      <AuditCard
        opening={fgOpening}
        inward={fgProduced}
        consumed={fgDispatched}
        system={fgClosingSystem}
        physical={physicalFG}
        setPhysical={setPhysicalFG}
        difference={fgDifference}
      />

      {/* FINANCIAL */}

      <SectionTitle title="Operational Snapshot" />

      <div style={snapshotGrid}>

        <SnapshotCard
          title="Turnover"
          value={`₹ ${turnover.toFixed(0)}`}
        />

        <SnapshotCard
          title="Avg RM Price"
          value={`₹ ${avgRmPrice}`}
        />

        <SnapshotCard
          title="Gross Profit"
          value={`₹ ${grossProfit.toFixed(0)}`}
        />

        <SnapshotCard
          title="Recovery"
          value={`${recovery}%`}
        />

        <SnapshotCard
          title="Power/Kg"
          value={powerPerKg}
        />

      </div>

      <textarea
        placeholder="Remarks"
        value={remarks}
        onChange={(e) =>
          setRemarks(e.target.value)
        }
        style={{
          width: "100%",
          height: 100,
          marginTop: 20,
          padding: 12,
          borderRadius: 8,
          border: "1px solid #ccc",
        }}
      />

      <button
        onClick={closeMonth}
        style={{
          marginTop: 20,
          background: "#0f766e",
          color: "white",
          border: "none",
          padding: "14px 20px",
          borderRadius: 10,
          cursor: "pointer",
          fontWeight: 700,
        }}
      >
        Close Month
      </button>

      {status && (

        <div
          style={{
            marginTop: 20,
            color: "green",
            fontWeight: 600,
          }}
        >
          {status}
        </div>

      )}

    </div>

  );

}

// =====================================
// COMPONENTS
// =====================================

function SectionTitle({ title }) {

  return (

    <h2
      style={{
        marginTop: 30,
      }}
    >
      {title}
    </h2>

  );

}

function AuditCard({
  opening,
  inward,
  consumed,
  system,
  physical,
  setPhysical,
  difference,
}) {

  return (

    <div style={auditCard}>

      <div>Opening: {opening.toFixed(0)} Kg</div>

      <div>Inward/Produced: {inward.toFixed(0)} Kg</div>

      <div>Consumed/Dispatched: {consumed.toFixed(0)} Kg</div>

      <div>
        System Closing:
        {" "}
        <b>{system.toFixed(0)} Kg</b>
      </div>

      <input
        value={physical}
        onChange={(e) =>
          setPhysical(e.target.value)
        }
        placeholder="Physical Closing Kg"
        style={inputStyle}
      />

      <div
        style={{
          color:
            Number(difference) === 0
              ? "green"
              : "red",
          fontWeight: 700,
        }}
      >
        Difference:
        {" "}
        {Number(difference).toFixed(0)} Kg
      </div>

    </div>

  );

}

function SnapshotCard({ title, value }) {

  return (

    <div style={snapshotCard}>

      <div
        style={{
          color: "#666",
        }}
      >
        {title}
      </div>

      <h2
        style={{
          margin: 0,
          color: "#0f766e",
        }}
      >
        {value}
      </h2>

    </div>

  );

}

// =====================================
// STYLES
// =====================================

const gridStyle = {
  display: "flex",
  gap: 10,
  marginTop: 20,
};

const inputStyle = {
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ccc",
};

const auditCard = {
  background: "white",
  padding: 20,
  borderRadius: 10,
  display: "grid",
  gap: 10,
  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
};

const snapshotGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 20,
};

const snapshotCard = {
  background: "white",
  padding: 20,
  borderRadius: 10,
  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
};