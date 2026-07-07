import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";
import { formatDate } from "../utils/date";
import DataTable from "../components/DataTable";

const CUTOFF_DATE = "2026-06-01";

function todayYmd() {
  return new Date().toISOString().split("T")[0];
}

function dateInput(value) {
  if (!value) return "";
  const text = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  if (text.includes("T")) return text.split("T")[0];
  const d = new Date(value);
  return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
}

function isBeforeCutoff(row) {
  const date = dateInput(row.date || row.createdAt);
  return date && date < CUTOFF_DATE;
}

function isDeleted(row) {
  return String(row.status || "").toUpperCase() === "DELETED";
}

function isPendingStatus(row) {
  const status = String(row.qcStatus || row.status || "PENDING").toUpperCase();
  const migrationStatus = String(row.migrationStatus || "").toUpperCase();
  return !isDeleted(row) && !isBeforeCutoff(row) && migrationStatus !== "LEGACY_AUTO_COMPLETED" && !["APPROVED", "REJECTED", "HOLD", "COMPLETED"].includes(status);
}

function supplierCode(value) {
  return String(value || "SUP")
    .replace(/[^a-z0-9]/gi, "")
    .slice(0, 8)
    .toUpperCase() || "SUP";
}

function compactDate(value) {
  return String(dateInput(value) || todayYmd()).replace(/-/g, "");
}

function trailingSeq(value, fallback = 1) {
  const match = String(value || "").match(/(\d+)\s*$/);
  return String(Number(match?.[1] || fallback) || fallback).padStart(3, "0");
}

function gradeCode(value) {
  const text = String(value || "FG").toUpperCase();
  const match = text.match(/\bE[1-5]\b/);
  return match ? match[0] : text.replace(/[^A-Z0-9]/g, "").slice(0, 8) || "FG";
}

function shiftCode(value) {
  return String(value || "A").trim().toUpperCase().slice(0, 1) || "A";
}

function incomingRef(row) {
  const existing = String(row.qualityRef || row.rmInwardId || row.sourceRef || row.inwardId || row.batchId || "").trim();
  if (/^MR-\d{8}-[A-Z0-9]+-\d{3}$/i.test(existing)) return existing;
  return `MR-${compactDate(row.date)}-${supplierCode(row.supplier)}-${trailingSeq(existing)}`;
}

function fgRef(row) {
  const existing = String(row.qualityRef || row.fgBatchCode || row.extrusionBatchId || row.batchId || "").trim();
  if (/^[A-Z0-9]+-\d{8}-[A-Z0-9]+-\d{3}$/i.test(existing)) return existing;
  return `${gradeCode(row.productionGrade || row.grade || row.fgBatchCode)}-${compactDate(row.date)}-${shiftCode(row.shift)}-${trailingSeq(existing)}`;
}

function getSourceRef(row) {
  return row.sourceRef || row.rmInwardId || row.inwardId || row.extrusionBatchId || row.fgBatchCode || row.batchId || "";
}

function displayStatus(row) {
  return row.qcStatus || row.status || "PENDING";
}

function displayDecision(row) {
  return row.decision || row.status || "";
}

function incomingMaterial(row) {
  return row.materialSummary || row.material || row.formOfMaterial || "";
}

function fgGrade(row) {
  return row.grade || row.productionGrade || row.fgBatchCode || "";
}

function normalizeIncomingQuality(row) {
  return {
    ...row,
    sourceType: row.sourceType || "INCOMING_MATERIAL",
    qualityRef: row.qualityRef || incomingRef(row),
    sourceRef: getSourceRef(row),
    materialOrGrade: incomingMaterial(row),
    supplier: row.supplier || "",
    qcStatus: displayStatus(row),
    decision: displayDecision(row),
    dustPercent: row.dustPercent || row.moisturePercent || "",
  };
}

function normalizeFgQuality(row) {
  return {
    ...row,
    sourceType: row.sourceType || "FG_PRODUCTION",
    qualityRef: row.qualityRef || fgRef(row),
    sourceRef: getSourceRef(row),
    materialOrGrade: fgGrade(row),
    qcStatus: displayStatus(row),
    decision: displayDecision(row),
  };
}

function historySort(a, b) {
  const ap = isPendingStatus(a) ? 0 : 1;
  const bp = isPendingStatus(b) ? 0 : 1;
  if (ap !== bp) return ap - bp;
  return String(dateInput(b.date)).localeCompare(String(dateInput(a.date)));
}

export default function Quality() {
  const blankRm = {
    date: todayYmd(),
    rmInwardId: "",
    qualityRef: "",
    sourceType: "INCOMING_MATERIAL",
    sourceRef: "",
    rubberLevel: "",
    metalContaminationPercent: "",
    ppPercent: "",
    sinkMaterialPercent: "",
    dustPercent: "",
    moisturePercent: "",
    contaminationPercent: "",
    mfi: "",
    visualRating: "",
    remarks: "",
    decision: "APPROVED",
    qcStatus: "APPROVED",
    status: "APPROVED",
    testedBy: "Quality",
    createdBy: "Quality",
  };

  const blankFg = {
    date: todayYmd(),
    extrusionBatchId: "",
    fgBatchCode: "",
    qualityRef: "",
    sourceType: "FG_PRODUCTION",
    sourceRef: "",
    grade: "",
    machine: "",
    shift: "",
    quantity: "",
    moisturePercent: "",
    mfi: "",
    izod: "",
    ashPercent: "",
    colour: "",
    blackDots: "",
    appearance: "",
    remarks: "",
    decision: "APPROVED",
    qcStatus: "APPROVED",
    status: "APPROVED",
    testedBy: "Quality",
    createdBy: "Quality",
  };

  const [activeTab, setActiveTab] = useState("INCOMING");
  const [rmForm, setRmForm] = useState(blankRm);
  const [fgForm, setFgForm] = useState(blankFg);
  const [rmQualityRows, setRmQualityRows] = useState([]);
  const [fgQualityRows, setFgQualityRows] = useState([]);
  const [rmRows, setRmRows] = useState([]);
  const [extrusionRows, setExtrusionRows] = useState([]);
  const [status, setStatus] = useState("");
  const [filters, setFilters] = useState({
    sourceType: "",
    materialOrGrade: "",
    supplier: "",
    qcStatus: "",
    decision: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function safeList(fn) {
    try {
      const res = await apiCall({ fn });
      return res.rows || [];
    } catch (err) {
      console.log(fn, err);
      return [];
    }
  }

  async function loadData() {
    const [rmq, fgq, rm, extrusion] = await Promise.all([
      safeList("quality.rm.list"),
      safeList("quality.fg.list"),
      safeList("rm.list"),
      safeList("extrusion.list"),
    ]);

    setRmQualityRows(rmq.map(normalizeIncomingQuality));
    setFgQualityRows(fgq.map(normalizeFgQuality));
    setRmRows(rm);
    setExtrusionRows(extrusion);
  }

  const rmDoneMap = useMemo(() => {
    const map = {};
    rmQualityRows.forEach((r) => {
      if (!isDeleted(r) && r.sourceRef) map[String(r.sourceRef)] = true;
    });
    return map;
  }, [rmQualityRows]);

  const fgDoneMap = useMemo(() => {
    const map = {};
    fgQualityRows.forEach((r) => {
      if (!isDeleted(r) && r.sourceRef) map[String(r.sourceRef)] = true;
    });
    return map;
  }, [fgQualityRows]);

  const pendingRmRows = useMemo(() => {
    return rmRows
      .filter((r) => {
        const id = r.inwardId || r.batchId || "";
        return id && !isBeforeCutoff(r) && !rmDoneMap[String(id)];
      })
      .sort((a, b) => String(dateInput(b.date)).localeCompare(String(dateInput(a.date))));
  }, [rmRows, rmDoneMap]);

  const pendingFgRows = useMemo(() => {
    return extrusionRows
      .filter((r) => {
        const id = r.extrusionBatchId || r.batchId || "";
        return id && !isBeforeCutoff(r) && !fgDoneMap[String(id)];
      })
      .sort((a, b) => String(dateInput(b.date)).localeCompare(String(dateInput(a.date))));
  }, [extrusionRows, fgDoneMap]);

  const historyRows = useMemo(() => {
    const all = [...rmQualityRows, ...fgQualityRows].map((row) => ({
      ...row,
      materialOrGrade: row.materialOrGrade || "",
      supplier: row.supplier || "",
      qcStatus: displayStatus(row),
      decision: displayDecision(row),
    }));

    return all
      .filter((row) => {
        if (filters.sourceType && row.sourceType !== filters.sourceType) return false;
        if (filters.materialOrGrade && !String(row.materialOrGrade || "").toLowerCase().includes(filters.materialOrGrade.toLowerCase())) return false;
        if (filters.supplier && !String(row.supplier || "").toLowerCase().includes(filters.supplier.toLowerCase())) return false;
        if (filters.qcStatus && String(row.qcStatus || "").toUpperCase() !== filters.qcStatus) return false;
        if (filters.decision && String(row.decision || "").toUpperCase() !== filters.decision) return false;
        return true;
      })
      .sort(historySort);
  }, [rmQualityRows, fgQualityRows, filters]);

  function onRmChange(e) {
    const next = { ...rmForm, [e.target.name]: e.target.value };
    if (e.target.name === "decision") {
      next.qcStatus = e.target.value;
      next.status = e.target.value;
    }
    if (e.target.name === "dustPercent") {
      next.moisturePercent = e.target.value;
    }
    setRmForm(next);
  }

  function onFgChange(e) {
    const next = { ...fgForm, [e.target.name]: e.target.value };
    if (e.target.name === "decision") {
      next.qcStatus = e.target.value;
      next.status = e.target.value;
    }
    setFgForm(next);
  }

  function startRmTest(row) {
    const id = row.inwardId || row.batchId || "";
    const next = {
      ...blankRm,
      date: dateInput(row.date) || todayYmd(),
      rmInwardId: id,
      sourceRef: id,
      qualityRef: incomingRef(row),
      supplier: row.supplier || "",
      vehicle: row.vehicleNo || "",
      material: incomingMaterial(row),
      quantity: row.netWeight || row.quantityKg || "",
      remarks: `QC for ${id}`,
    };
    setRmForm(next);
    setActiveTab("INCOMING");
  }

  function startFgTest(row) {
    const id = row.extrusionBatchId || row.batchId || "";
    const next = {
      ...blankFg,
      date: dateInput(row.date) || todayYmd(),
      extrusionBatchId: id,
      fgBatchCode: id,
      sourceRef: id,
      qualityRef: fgRef(row),
      grade: row.productionGrade || "",
      machine: row.machine || "",
      shift: row.shift || "",
      quantity: row.fgOutputKg || "",
      remarks: `QC for ${id}`,
    };
    setFgForm(next);
    setActiveTab("FG");
  }

  async function saveRmQuality(e) {
    e.preventDefault();
    if (!rmForm.rmInwardId) return alert("Select receiving record");

    try {
      const res = await apiCall({
        fn: "quality.rm.add",
        ...rmForm,
        sourceRef: rmForm.sourceRef || rmForm.rmInwardId,
        qualityRef: rmForm.qualityRef || incomingRef(rmForm),
        moisturePercent: rmForm.dustPercent,
        status: rmForm.decision,
        qcStatus: rmForm.decision,
      });

      if (res.ok === false) {
        alert(res.error || "Incoming material QC save failed");
        return;
      }

      setStatus("Incoming material QC saved successfully");
      setRmForm(blankRm);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  }

  async function saveFgQuality(e) {
    e.preventDefault();
    if (!fgForm.extrusionBatchId) return alert("Select production record");

    try {
      const res = await apiCall({
        fn: "quality.fg.add",
        ...fgForm,
        sourceRef: fgForm.sourceRef || fgForm.extrusionBatchId,
        qualityRef: fgForm.qualityRef || fgRef(fgForm),
        status: fgForm.decision,
        qcStatus: fgForm.decision,
      });

      if (res.ok === false) {
        alert(res.error || "FG QC save failed");
        return;
      }

      setStatus("FG production QC saved successfully");
      setFgForm(blankFg);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  }

  async function deleteQuality(row) {
    const ok = window.confirm("Delete this quality record?");
    if (!ok) return;

    const fn = row.sourceType === "FG_PRODUCTION" ? "quality.fg.update" : "quality.rm.update";
    try {
      const res = await apiCall({ fn, ...row, status: "DELETED", qcStatus: "DELETED" });
      if (res.ok === false) {
        alert(res.error || "Delete failed");
        return;
      }
      setStatus("Quality record deleted");
      loadData();
    } catch (err) {
      alert(err.message);
    }
  }

  const pendingIncomingCount = pendingRmRows.length;
  const pendingFgCount = pendingFgRows.length;
  const completedCount = historyRows.filter((row) => ["APPROVED", "REJECTED", "HOLD", "COMPLETED"].includes(String(row.qcStatus || "").toUpperCase())).length;

  return (
    <div style={page}>
      <div style={hero}>
        <div>
          <div style={eyebrow}>Quality Control</div>
          <h1 style={title}>Quality</h1>
          <div style={subtitle}>Incoming Material QC, FG Production QC, and Quality History.</div>
        </div>

        <div style={tabs}>
          <button type="button" onClick={() => setActiveTab("INCOMING")} style={activeTab === "INCOMING" ? tabActive : tab}>
            Incoming Material QC
          </button>
          <button type="button" onClick={() => setActiveTab("FG")} style={activeTab === "FG" ? tabActive : tab}>
            FG Production QC
          </button>
          <button type="button" onClick={() => setActiveTab("HISTORY")} style={activeTab === "HISTORY" ? tabActive : tab}>
            Quality History
          </button>
        </div>
      </div>

      {status && <div style={statusBox}>{status}</div>}

      <div style={kpiGrid}>
        <KPI title="Incoming Pending" value={pendingIncomingCount} />
        <KPI title="FG Pending" value={pendingFgCount} />
        <KPI title="Completed / Hold" value={completedCount} />
        <KPI title="History Rows" value={historyRows.length} />
      </div>

      {activeTab === "INCOMING" && (
        <>
          <div style={card}>
            <h2 style={sectionTitle}>Incoming Material QC</h2>
            <div style={queue}>
              {pendingRmRows.length === 0 ? (
                <div style={empty}>No pending incoming material QC.</div>
              ) : (
                pendingRmRows.slice(0, 20).map((row) => (
                  <div key={row.inwardId || row.batchId} style={pendingRow}>
                    <div>
                      <b>{incomingRef(row)}</b>
                      <div style={muted}>
                        {formatDate(row.date)} | {row.supplier || "Supplier"} | {row.vehicleNo || "Vehicle"} | {incomingMaterial(row)} | {Number(row.netWeight || row.quantityKg || 0).toFixed(0)} kg
                      </div>
                    </div>
                    <button type="button" onClick={() => startRmTest(row)} style={testButton}>Test</button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={card}>
            <h2 style={sectionTitle}>Incoming Material Test</h2>
            <form onSubmit={saveRmQuality} style={grid}>
              <Field label="Quality Ref"><input value={rmForm.qualityRef} readOnly style={readonly} /></Field>
              <Field label="Source Ref / Receiving Ref">
                <select name="rmInwardId" value={rmForm.rmInwardId} onChange={(e) => startRmTest(rmRows.find((r) => String(r.inwardId || r.batchId) === e.target.value) || { inwardId: e.target.value, date: rmForm.date })} style={input} required>
                  <option value="">Select Receiving</option>
                  {rmRows.filter((r) => !isBeforeCutoff(r)).map((r) => (
                    <option key={r.inwardId || r.batchId} value={r.inwardId || r.batchId}>
                      {incomingRef(r)} - {r.supplier || ""} - {incomingMaterial(r)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Date"><input type="date" name="date" value={rmForm.date} onChange={onRmChange} style={input} /></Field>
              <Field label="Supplier"><input value={rmForm.supplier || ""} readOnly style={readonly} /></Field>
              <Field label="Vehicle"><input value={rmForm.vehicle || ""} readOnly style={readonly} /></Field>
              <Field label="Material"><input value={rmForm.material || ""} readOnly style={readonly} /></Field>
              <Field label="Quantity"><input value={rmForm.quantity || ""} readOnly style={readonly} /></Field>
              <Field label="Rubber Level">
                <select name="rubberLevel" value={rmForm.rubberLevel} onChange={onRmChange} style={input}>
                  <option value="">Select</option>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </Field>
              <Field label="Metal Contamination %"><input type="number" min="0" max="100" step="0.01" name="metalContaminationPercent" value={rmForm.metalContaminationPercent} onChange={onRmChange} style={input} /></Field>
              <Field label="PP %"><input type="number" min="0" max="100" step="0.01" name="ppPercent" value={rmForm.ppPercent} onChange={onRmChange} style={input} /></Field>
              <Field label="Sink Material %"><input type="number" min="0" max="100" step="0.01" name="sinkMaterialPercent" value={rmForm.sinkMaterialPercent} onChange={onRmChange} style={input} /></Field>
              <Field label="Dust %"><input type="number" min="0" max="100" step="0.01" name="dustPercent" value={rmForm.dustPercent} onChange={onRmChange} style={input} /></Field>
              <Field label="Contamination %"><input type="number" min="0" max="100" step="0.01" name="contaminationPercent" value={rmForm.contaminationPercent} onChange={onRmChange} style={input} /></Field>
              <Field label="MFI"><input type="number" step="0.01" name="mfi" value={rmForm.mfi} onChange={onRmChange} style={input} /></Field>
              <Field label="Visual Rating">
                <select name="visualRating" value={rmForm.visualRating} onChange={onRmChange} style={input}>
                  <option value="">Select</option>
                  <option>Good</option>
                  <option>Average</option>
                  <option>Poor</option>
                </select>
              </Field>
              <Field label="Decision">
                <select name="decision" value={rmForm.decision} onChange={onRmChange} style={input}>
                  <option value="APPROVED">Approve</option>
                  <option value="REJECTED">Reject</option>
                  <option value="HOLD">Hold</option>
                </select>
              </Field>
              <Field label="QC Status"><input value={rmForm.qcStatus} readOnly style={readonly} /></Field>
              <Field label="Tested By"><input name="testedBy" value={rmForm.testedBy} onChange={onRmChange} style={input} /></Field>
              <Field label="Remarks"><textarea name="remarks" value={rmForm.remarks} onChange={onRmChange} style={textarea} /></Field>
              <div style={actionRow}><button type="submit" style={saveButton}>Save Incoming QC</button></div>
            </form>
          </div>
        </>
      )}

      {activeTab === "FG" && (
        <>
          <div style={card}>
            <h2 style={sectionTitle}>FG Production QC</h2>
            <div style={queue}>
              {pendingFgRows.length === 0 ? (
                <div style={empty}>No pending FG production QC.</div>
              ) : (
                pendingFgRows.slice(0, 20).map((row) => (
                  <div key={row.extrusionBatchId || row.batchId} style={pendingRow}>
                    <div>
                      <b>{fgRef(row)}</b>
                      <div style={muted}>
                        {formatDate(row.date)} | {row.productionGrade || "Grade"} | {row.machine || "Machine"} | {row.shift || "Shift"} | {Number(row.fgOutputKg || 0).toFixed(0)} kg
                      </div>
                    </div>
                    <button type="button" onClick={() => startFgTest(row)} style={testButton}>Test</button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={card}>
            <h2 style={sectionTitle}>FG Production Test</h2>
            <form onSubmit={saveFgQuality} style={grid}>
              <Field label="Quality Ref"><input value={fgForm.qualityRef} readOnly style={readonly} /></Field>
              <Field label="Production Ref">
                <select name="extrusionBatchId" value={fgForm.extrusionBatchId} onChange={(e) => startFgTest(extrusionRows.find((r) => String(r.extrusionBatchId || r.batchId) === e.target.value) || { extrusionBatchId: e.target.value, date: fgForm.date })} style={input} required>
                  <option value="">Select Production</option>
                  {extrusionRows.filter((r) => !isBeforeCutoff(r)).map((r) => (
                    <option key={r.extrusionBatchId || r.batchId} value={r.extrusionBatchId || r.batchId}>
                      {fgRef(r)} - {r.productionGrade || ""} - {Number(r.fgOutputKg || 0).toFixed(0)} kg
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Date"><input type="date" name="date" value={fgForm.date} onChange={onFgChange} style={input} /></Field>
              <Field label="Grade"><input value={fgForm.grade} readOnly style={readonly} /></Field>
              <Field label="Machine"><input value={fgForm.machine} readOnly style={readonly} /></Field>
              <Field label="Shift"><input value={fgForm.shift} readOnly style={readonly} /></Field>
              <Field label="Quantity"><input value={fgForm.quantity} readOnly style={readonly} /></Field>
              <Field label="MFI"><input type="number" step="0.01" name="mfi" value={fgForm.mfi} onChange={onFgChange} style={input} /></Field>
              <Field label="Izod"><input type="number" step="0.01" name="izod" value={fgForm.izod} onChange={onFgChange} style={input} /></Field>
              <Field label="Ash %"><input type="number" step="0.01" name="ashPercent" value={fgForm.ashPercent} onChange={onFgChange} style={input} /></Field>
              <Field label="Moisture %"><input type="number" step="0.01" name="moisturePercent" value={fgForm.moisturePercent} onChange={onFgChange} style={input} /></Field>
              <Field label="Colour"><input name="colour" value={fgForm.colour} onChange={onFgChange} style={input} /></Field>
              <Field label="Black Dots"><input type="number" name="blackDots" value={fgForm.blackDots} onChange={onFgChange} style={input} /></Field>
              <Field label="Appearance"><textarea name="appearance" value={fgForm.appearance} onChange={onFgChange} style={textarea} /></Field>
              <Field label="Decision">
                <select name="decision" value={fgForm.decision} onChange={onFgChange} style={input}>
                  <option value="APPROVED">Approve</option>
                  <option value="REJECTED">Reject</option>
                  <option value="HOLD">Hold</option>
                </select>
              </Field>
              <Field label="QC Status"><input value={fgForm.qcStatus} readOnly style={readonly} /></Field>
              <Field label="Tested By"><input name="testedBy" value={fgForm.testedBy} onChange={onFgChange} style={input} /></Field>
              <Field label="Remarks"><textarea name="remarks" value={fgForm.remarks} onChange={onFgChange} style={textarea} /></Field>
              <div style={actionRow}><button type="submit" style={saveButton}>Save FG QC</button></div>
            </form>
          </div>
        </>
      )}

      {activeTab === "HISTORY" && (
        <>
          <div style={card}>
            <h2 style={sectionTitle}>Quality History Filters</h2>
            <div style={filterGrid}>
              <Field label="Source Type">
                <select value={filters.sourceType} onChange={(e) => setFilters({ ...filters, sourceType: e.target.value })} style={input}>
                  <option value="">All</option>
                  <option value="INCOMING_MATERIAL">Incoming Material</option>
                  <option value="FG_PRODUCTION">FG Production</option>
                </select>
              </Field>
              <Field label="Material / Grade"><input value={filters.materialOrGrade} onChange={(e) => setFilters({ ...filters, materialOrGrade: e.target.value })} style={input} /></Field>
              <Field label="Supplier"><input value={filters.supplier} onChange={(e) => setFilters({ ...filters, supplier: e.target.value })} style={input} /></Field>
              <Field label="QC Status">
                <select value={filters.qcStatus} onChange={(e) => setFilters({ ...filters, qcStatus: e.target.value })} style={input}>
                  <option value="">All</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="HOLD">Hold</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </Field>
              <Field label="Decision">
                <select value={filters.decision} onChange={(e) => setFilters({ ...filters, decision: e.target.value })} style={input}>
                  <option value="">All</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="HOLD">Hold</option>
                  <option value="LEGACY_COMPLETED">Legacy Completed</option>
                </select>
              </Field>
            </div>
          </div>

          <DataTable
            title="Quality History"
            rows={historyRows}
            searchFields={["qualityRef", "legacyQualityRef", "sourceType", "sourceRef", "materialOrGrade", "supplier", "qcStatus", "decision", "migrationStatus"]}
            columns={[
              { key: "date", label: "Date", render: (r) => formatDate(r.date), renderExport: (r) => dateInput(r.date) },
              { key: "sourceType", label: "Source Type" },
              { key: "qualityRef", label: "Quality Ref" },
              { key: "legacyQualityRef", label: "Legacy Ref" },
              { key: "sourceRef", label: "Source Ref" },
              { key: "materialOrGrade", label: "Material / Grade" },
              { key: "supplier", label: "Supplier" },
              { key: "qcStatus", label: "QC Status" },
              { key: "decision", label: "Decision" },
              { key: "migrationStatus", label: "Migration" },
              { key: "remarks", label: "Remarks" },
            ]}
            onDelete={deleteQuality}
          />
        </>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function KPI({ title, value }) {
  return (
    <div style={kpi}>
      <div style={kpiTitle}>{title}</div>
      <div style={kpiValue}>{value}</div>
    </div>
  );
}

const page = { width: "100%", paddingBottom: 30 };
const hero = { background: "linear-gradient(135deg,#064e3b,#0f766e)", color: "white", borderRadius: 18, padding: 24, marginBottom: 20, display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap" };
const eyebrow = { fontSize: 13, textTransform: "uppercase", letterSpacing: 1.2, opacity: 0.85, fontWeight: 800 };
const title = { margin: "6px 0", fontSize: 32, fontWeight: 950 };
const subtitle = { opacity: 0.9 };
const tabs = { display: "flex", gap: 10, flexWrap: "wrap" };
const tab = { background: "white", color: "#0f766e", border: "none", padding: "10px 14px", borderRadius: 8, fontWeight: 800, cursor: "pointer" };
const tabActive = { ...tab, background: "#facc15", color: "#111827" };
const statusBox = { background: "#ecfdf5", color: "#166534", border: "1px solid #bbf7d0", padding: 12, borderRadius: 10, marginBottom: 14, fontWeight: 700 };
const kpiGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 18 };
const kpi = { background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 16 };
const kpiTitle = { color: "#64748b", fontSize: 12, fontWeight: 800, textTransform: "uppercase" };
const kpiValue = { fontSize: 30, fontWeight: 950, color: "#0f766e", marginTop: 6 };
const card = { background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 18, marginBottom: 18 };
const sectionTitle = { marginTop: 0, color: "#0f766e" };
const queue = { display: "grid", gap: 4 };
const pendingRow = { display: "flex", justifyContent: "space-between", gap: 12, padding: "12px 0", borderBottom: "1px solid #f1f5f9", alignItems: "center" };
const muted = { color: "#64748b", fontSize: 12, marginTop: 3 };
const empty = { color: "#64748b", padding: 12 };
const testButton = { background: "#2563eb", color: "white", border: "none", padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 800 };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 };
const filterGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 };
const labelStyle = { display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 5 };
const input = { width: "100%", height: 40, padding: "0 10px", border: "1px solid #cbd5e1", borderRadius: 8, boxSizing: "border-box" };
const readonly = { ...input, background: "#f8fafc", fontWeight: 800 };
const textarea = { ...input, height: 82, padding: 10 };
const actionRow = { display: "flex", alignItems: "end" };
const saveButton = { background: "#0f766e", color: "white", border: "none", padding: "10px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 700 };
