import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";
import { formatDate } from "../utils/date";
import DataTable from "../components/DataTable";

export default function Quality() {
  const today = new Date().toISOString().split("T")[0];

  const blankRm = {
    date: today,
    rmInwardId: "",
    formOfMaterial: "",
    conditionOfMaterial: "",
    sampleQtyGm: "",
    dryDustGm: "",
    colouredFlakesGm: "",
    rubberContaminationNo: "",
    ppGm: "",
    sinkMaterialGm: "",
    remarks: "",
    status: "QC_COMPLETED",
    createdBy: "Quality",
  };

  const blankFg = {
    date: today,
    extrusionBatchId: "",
    fgBatchCode: "",
    moisturePercent: "",
    mfi: "",
    colour: "",
    appearance: "",
    bagWeight1Kg: "",
    bagWeight2Kg: "",
    bagWeight3Kg: "",
    bagWeight4Kg: "",
    remarks: "",
    status: "QC_COMPLETED",
    createdBy: "Quality",
  };

  const [activeTab, setActiveTab] = useState("WORKBENCH");
  const [rmForm, setRmForm] = useState(blankRm);
  const [fgForm, setFgForm] = useState(blankFg);

  const [rmQualityRows, setRmQualityRows] = useState([]);
  const [fgQualityRows, setFgQualityRows] = useState([]);
  const [rmRows, setRmRows] = useState([]);
  const [extrusionRows, setExtrusionRows] = useState([]);

  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState(null);

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

    setRmQualityRows(rmq);
    setFgQualityRows(fgq);
    setRmRows(rm);
    setExtrusionRows(extrusion);
  }

  function n(v) {
    return Number(v || 0);
  }

  function percent(value, total) {
    return n(total) > 0 ? ((n(value) / n(total)) * 100).toFixed(2) : "0.00";
  }

  function dateInput(value) {
    if (!value) return "";
    const text = String(value);
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
    if (text.includes("T")) return text.split("T")[0];
    const d = new Date(value);
    return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
  }

  const rmDoneMap = useMemo(() => {
    const map = {};
    rmQualityRows.forEach((r) => {
      if (String(r.status || "").toUpperCase() !== "DELETED" && r.rmInwardId) {
        map[String(r.rmInwardId)] = true;
      }
    });
    return map;
  }, [rmQualityRows]);

  const fgDoneMap = useMemo(() => {
    const map = {};
    fgQualityRows.forEach((r) => {
      if (
        String(r.status || "").toUpperCase() !== "DELETED" &&
        (r.extrusionBatchId || r.fgBatchCode)
      ) {
        map[String(r.extrusionBatchId || r.fgBatchCode)] = true;
      }
    });
    return map;
  }, [fgQualityRows]);

  const pendingRmRows = useMemo(() => {
    return rmRows.filter((r) => {
      const id = r.inwardId || r.batchId || "";
      return id && !rmDoneMap[String(id)];
    });
  }, [rmRows, rmDoneMap]);

  const pendingFgRows = useMemo(() => {
    return extrusionRows.filter((r) => {
      const id = r.extrusionBatchId || r.batchId || "";
      return id && !fgDoneMap[String(id)];
    });
  }, [extrusionRows, fgDoneMap]);

  const rmCalculated = useMemo(() => {
    const sample = n(rmForm.sampleQtyGm);
    const dryDust = n(rmForm.dryDustGm);
    const coloured = n(rmForm.colouredFlakesGm);
    const pp = n(rmForm.ppGm);
    const sink = n(rmForm.sinkMaterialGm);

    return {
      dryDustPercent: percent(dryDust, sample),
      colouredFlakesPercent: percent(coloured, sample),
      ppPercent: percent(pp, sample),
      sinkMaterialPercent: percent(sink, sample),
      acceptGm: sample - dryDust - coloured - pp - sink,
    };
  }, [rmForm]);

  const fgCalculated = useMemo(() => {
    const weights = [
      n(fgForm.bagWeight1Kg),
      n(fgForm.bagWeight2Kg),
      n(fgForm.bagWeight3Kg),
      n(fgForm.bagWeight4Kg),
    ].filter((x) => x > 0);

    const avg =
      weights.length > 0
        ? weights.reduce((s, x) => s + x, 0) / weights.length
        : 0;

    return {
      avgBagWeightKg: avg.toFixed(2),
    };
  }, [fgForm]);
  function onRmChange(e) {
    setRmForm({
      ...rmForm,
      [e.target.name]: e.target.value,
    });
  }

  function onFgChange(e) {
    const updated = {
      ...fgForm,
      [e.target.name]: e.target.value,
    };

    if (e.target.name === "extrusionBatchId") {
      updated.fgBatchCode = e.target.value;
    }

    setFgForm(updated);
  }

  function startRmTest(row) {
    const id = row.inwardId || row.batchId || "";

    setActiveTab("RM");
    setRmForm({
      ...blankRm,
      date: dateInput(row.date) || today,
      rmInwardId: id,
      formOfMaterial: inferRmForm(row.material),
      conditionOfMaterial: "",
      remarks: `QC for ${id}`,
    });
  }

  function startFgTest(row) {
    const id = row.extrusionBatchId || row.batchId || "";

    setActiveTab("FG");
    setFgForm({
      ...blankFg,
      date: dateInput(row.date) || today,
      extrusionBatchId: id,
      fgBatchCode: id,
      remarks: `QC for ${id}`,
    });
  }

  function inferRmForm(material) {
    const text = String(material || "").toLowerCase();
    if (text.includes("flake")) return "Flakes";
    if (text.includes("bucket")) return "Buckets";
    return "";
  }

  async function saveRmQuality(e) {
    e.preventDefault();

    if (!rmForm.rmInwardId) return alert("Select RM inward batch");
    if (!rmForm.sampleQtyGm) return alert("Enter sample quantity");

    try {
      const res = await apiCall({
        fn: "quality.rm.add",
        ...rmForm,
      });

      if (res.ok === false) {
        alert(res.error || "RM quality save failed");
        return;
      }

      setStatus("RM quality saved successfully");
      setRmForm(blankRm);
      setActiveTab("WORKBENCH");
      loadData();
    } catch (err) {
      alert(err.message);
    }
  }

  async function saveFgQuality(e) {
    e.preventDefault();

    if (!fgForm.extrusionBatchId) return alert("Select FG / extrusion batch");

    try {
      const res = await apiCall({
        fn: "quality.fg.add",
        ...fgForm,
      });

      if (res.ok === false) {
        alert(res.error || "FG quality save failed");
        return;
      }

      setStatus("FG quality saved successfully");
      setFgForm(blankFg);
      setActiveTab("WORKBENCH");
      loadData();
    } catch (err) {
      alert(err.message);
    }
  }

  function editRm(row) {
    setEditing({
      type: "RM",
      fields: {
        ...row,
        date: dateInput(row.date),
      },
    });
  }

  function editFg(row) {
    setEditing({
      type: "FG",
      fields: {
        ...row,
        date: dateInput(row.date),
      },
    });
  }

  function onEditChange(e) {
    setEditing({
      ...editing,
      fields: {
        ...editing.fields,
        [e.target.name]: e.target.value,
      },
    });
  }

  async function saveEdit() {
    if (!editing) return;

    const fn = editing.type === "RM" ? "quality.rm.update" : "quality.fg.update";

    try {
      const res = await apiCall({
        fn,
        ...editing.fields,
      });

      if (res.ok === false) {
        alert(res.error || "Update failed");
        return;
      }

      setStatus(`${editing.type} quality updated`);
      setEditing(null);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  }

  async function deleteQuality(row, type) {
    const ok = window.confirm(`Delete ${type} quality record?`);
    if (!ok) return;

    const fn = type === "RM" ? "quality.rm.update" : "quality.fg.update";

    try {
      const res = await apiCall({
        fn,
        ...row,
        status: "DELETED",
      });

      if (res.ok === false) {
        alert(res.error || "Delete failed");
        return;
      }

      setStatus(`${type} quality deleted`);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  }

  async function syncOldData() {
    const ok = window.confirm("Sync old RM/FG data into Quality records?");
    if (!ok) return;

    try {
      const res = await apiCall({ fn: "quality.syncOldData" });

      if (res.ok === false) {
        alert(res.error || "Sync failed");
        return;
      }

      setStatus(
        `Sync completed. RM created: ${res.rmCreated || 0}, FG created: ${
          res.fgCreated || 0
        }`
      );
      loadData();
    } catch (err) {
      alert(err.message);
    }
  }
  return (
    <div style={page}>
      <div style={hero}>
        <div>
          <div style={eyebrow}>Quality Control</div>
          <h1 style={title}>QC Workbench</h1>
          <div style={subtitle}>
            Pending QC, RM quality, FG quality and historical test records.
          </div>
        </div>

        <div style={tabs}>
          <button
            type="button"
            onClick={() => setActiveTab("WORKBENCH")}
            style={activeTab === "WORKBENCH" ? tabActive : tab}
          >
            Workbench
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("RM")}
            style={activeTab === "RM" ? tabActive : tab}
          >
            RM Quality
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("FG")}
            style={activeTab === "FG" ? tabActive : tab}
          >
            FG Quality
          </button>
        </div>
      </div>

      {status && <div style={statusBox}>{status}</div>}

      {activeTab === "WORKBENCH" && (
        <>
          <div style={kpiGrid}>
            <KPI title="Pending RM QC" value={pendingRmRows.length} />
            <KPI title="Pending FG QC" value={pendingFgRows.length} />
            <KPI title="RM QC Done" value={rmQualityRows.length} />
            <KPI title="FG QC Done" value={fgQualityRows.length} />
          </div>

          <div style={syncBox}>
            <div>
              <b>Old Data Sync</b>
              <div style={muted}>
                Creates pending quality records for old RM inward and FG batches.
              </div>
            </div>

            <button type="button" onClick={syncOldData} style={syncButton}>
              Sync Old Quality Data
            </button>
          </div>

          <div style={twoCol}>
            <div style={card}>
              <h2 style={sectionTitle}>Pending RM Quality</h2>

              {pendingRmRows.length === 0 ? (
                <div style={empty}>No pending RM quality.</div>
              ) : (
                pendingRmRows.slice(0, 20).map((r) => (
                  <div key={r.inwardId || r.batchId} style={pendingRow}>
                    <div>
                      <b>{r.inwardId || r.batchId}</b>
                      <div style={muted}>
                        {formatDate(r.date)} | {r.supplier || "Supplier"} |{" "}
                        {r.material || "Material"} |{" "}
                        {Number(r.netWeight || 0).toFixed(0)} kg
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => startRmTest(r)}
                      style={testButton}
                    >
                      Test
                    </button>
                  </div>
                ))
              )}
            </div>

            <div style={card}>
              <h2 style={sectionTitle}>Pending FG Quality</h2>

              {pendingFgRows.length === 0 ? (
                <div style={empty}>No pending FG quality.</div>
              ) : (
                pendingFgRows.slice(0, 20).map((r) => (
                  <div key={r.extrusionBatchId || r.batchId} style={pendingRow}>
                    <div>
                      <b>{r.extrusionBatchId || r.batchId}</b>
                      <div style={muted}>
                        {formatDate(r.date)} | {r.productionGrade || "Grade"} |{" "}
                        {Number(r.fgOutputKg || 0).toFixed(0)} kg
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => startFgTest(r)}
                      style={testButton}
                    >
                      Test
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={twoCol}>
            <DataTable
              title="Recent RM Quality"
              rows={rmQualityRows.slice(0, 10)}
              searchFields={[
                "qualityId",
                "rmInwardId",
                "formOfMaterial",
                "conditionOfMaterial",
                "remarks",
              ]}
              columns={[
                { key: "date", label: "Date", render: (r) => formatDate(r.date) },
                { key: "rmInwardId", label: "RM Batch" },
                { key: "dryDustPercent", label: "Dust %" },
                { key: "ppPercent", label: "PP %" },
                { key: "sinkMaterialPercent", label: "Sink %" },
                { key: "acceptGm", label: "Accept gm" },
                { key: "status", label: "Status" },
              ]}
              onEdit={editRm}
              onDelete={(row) => deleteQuality(row, "RM")}
            />

            <DataTable
              title="Recent FG Quality"
              rows={fgQualityRows.slice(0, 10)}
              searchFields={[
                "qualityId",
                "extrusionBatchId",
                "fgBatchCode",
                "colour",
                "appearance",
                "remarks",
              ]}
              columns={[
                { key: "date", label: "Date", render: (r) => formatDate(r.date) },
                { key: "extrusionBatchId", label: "FG Batch" },
                { key: "moisturePercent", label: "Moisture %" },
                { key: "mfi", label: "MFI" },
                { key: "colour", label: "Colour" },
                { key: "avgBagWeightKg", label: "Avg Bag Kg" },
                { key: "status", label: "Status" },
              ]}
              onEdit={editFg}
              onDelete={(row) => deleteQuality(row, "FG")}
            />
          </div>
        </>
      )}

      {activeTab === "RM" && (
        <>
          <div style={card}>
            <h2 style={sectionTitle}>Raw Material Quality</h2>

            <form onSubmit={saveRmQuality} style={grid}>
              <Field label="Date">
                <input
                  type="date"
                  name="date"
                  value={rmForm.date}
                  onChange={onRmChange}
                  style={input}
                />
              </Field>

              <Field label="RM Inward Batch">
                <select
                  name="rmInwardId"
                  value={rmForm.rmInwardId}
                  onChange={onRmChange}
                  style={input}
                  required
                >
                  <option value="">Select RM Batch</option>
                  {rmRows.map((r) => (
                    <option key={r.inwardId || r.batchId} value={r.inwardId || r.batchId}>
                      {r.inwardId || r.batchId} - {r.supplier || ""} -{" "}
                      {r.material || ""}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Form of Material">
                <select
                  name="formOfMaterial"
                  value={rmForm.formOfMaterial}
                  onChange={onRmChange}
                  style={input}
                >
                  <option value="">Select</option>
                  <option>Flakes</option>
                  <option>Buckets</option>
                </select>
              </Field>

              <Field label="Condition of Material">
                <select
                  name="conditionOfMaterial"
                  value={rmForm.conditionOfMaterial}
                  onChange={onRmChange}
                  style={input}
                >
                  <option value="">Select</option>
                  <option>Unwashed</option>
                  <option>Washed</option>
                  <option>Semi-Washed</option>
                </select>
              </Field>
              <Field label="Sample Quantity gm">
                <input type="number" name="sampleQtyGm" value={rmForm.sampleQtyGm} onChange={onRmChange} style={input} />
              </Field>

              <Field label="Dry Dust gm">
                <input type="number" name="dryDustGm" value={rmForm.dryDustGm} onChange={onRmChange} style={input} />
              </Field>

              <Field label="Coloured Flakes gm">
                <input type="number" name="colouredFlakesGm" value={rmForm.colouredFlakesGm} onChange={onRmChange} style={input} />
              </Field>

              <Field label="Rubber Contamination No.">
                <input type="number" name="rubberContaminationNo" value={rmForm.rubberContaminationNo} onChange={onRmChange} style={input} />
              </Field>

              <Field label="PP gm">
                <input type="number" name="ppGm" value={rmForm.ppGm} onChange={onRmChange} style={input} />
              </Field>

              <Field label="Sink Material gm">
                <input type="number" name="sinkMaterialGm" value={rmForm.sinkMaterialGm} onChange={onRmChange} style={input} />
              </Field>

              <Field label="Dry Dust %">
                <input readOnly value={rmCalculated.dryDustPercent} style={readonly} />
              </Field>

              <Field label="Coloured Flakes %">
                <input readOnly value={rmCalculated.colouredFlakesPercent} style={readonly} />
              </Field>

              <Field label="PP %">
                <input readOnly value={rmCalculated.ppPercent} style={readonly} />
              </Field>

              <Field label="Sink Material %">
                <input readOnly value={rmCalculated.sinkMaterialPercent} style={readonly} />
              </Field>

              <Field label="Accept gm">
                <input readOnly value={rmCalculated.acceptGm} style={readonly} />
              </Field>

              <Field label="Remarks">
                <textarea name="remarks" value={rmForm.remarks} onChange={onRmChange} style={textarea} />
              </Field>

              <div style={actionRow}>
                <button type="submit" style={saveButton}>Save RM Quality</button>
              </div>
            </form>
          </div>

          <DataTable
            title="RM Quality History"
            rows={rmQualityRows}
            searchFields={["qualityId", "rmInwardId", "formOfMaterial", "conditionOfMaterial", "remarks"]}
            columns={[
              { key: "date", label: "Date", render: (r) => formatDate(r.date) },
              { key: "rmInwardId", label: "RM Batch" },
              { key: "formOfMaterial", label: "Form" },
              { key: "conditionOfMaterial", label: "Condition" },
              { key: "sampleQtyGm", label: "Sample gm" },
              { key: "dryDustPercent", label: "Dust %" },
              { key: "colouredFlakesPercent", label: "Colour %" },
              { key: "ppPercent", label: "PP %" },
              { key: "sinkMaterialPercent", label: "Sink %" },
              { key: "acceptGm", label: "Accept gm" },
              { key: "status", label: "Status" },
            ]}
            onEdit={editRm}
            onDelete={(row) => deleteQuality(row, "RM")}
          />
        </>
      )}

      {activeTab === "FG" && (
        <>
          <div style={card}>
            <h2 style={sectionTitle}>FG Quality</h2>

            <form onSubmit={saveFgQuality} style={grid}>
              <Field label="Date">
                <input type="date" name="date" value={fgForm.date} onChange={onFgChange} style={input} />
              </Field>

              <Field label="FG / Extrusion Batch">
                <select name="extrusionBatchId" value={fgForm.extrusionBatchId} onChange={onFgChange} style={input} required>
                  <option value="">Select FG Batch</option>
                  {extrusionRows.map((r) => (
                    <option key={r.extrusionBatchId || r.batchId} value={r.extrusionBatchId || r.batchId}>
                      {r.extrusionBatchId || r.batchId} - {r.productionGrade || ""} - {Number(r.fgOutputKg || 0).toFixed(0)} kg
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Moisture %">
                <input type="number" name="moisturePercent" value={fgForm.moisturePercent} onChange={onFgChange} style={input} />
              </Field>

              <Field label="MFI g/10Min @ 2.16kg">
                <input type="number" name="mfi" value={fgForm.mfi} onChange={onFgChange} style={input} />
              </Field>

              <Field label="Colour">
                <select name="colour" value={fgForm.colour} onChange={onFgChange} style={input}>
                  <option value="">Select</option>
                  <option>Dull White</option>
                  <option>White</option>
                  <option>Bluish White</option>
                  <option>Metalic Green</option>
                </select>
              </Field>

              <Field label="Appearance">
                <textarea name="appearance" value={fgForm.appearance} onChange={onFgChange} style={textarea} />
              </Field>

              <Field label="25kg Bag Weight 1">
                <input type="number" name="bagWeight1Kg" value={fgForm.bagWeight1Kg} onChange={onFgChange} style={input} />
              </Field>

              <Field label="25kg Bag Weight 2">
                <input type="number" name="bagWeight2Kg" value={fgForm.bagWeight2Kg} onChange={onFgChange} style={input} />
              </Field>

              <Field label="25kg Bag Weight 3">
                <input type="number" name="bagWeight3Kg" value={fgForm.bagWeight3Kg} onChange={onFgChange} style={input} />
              </Field>

              <Field label="25kg Bag Weight 4">
                <input type="number" name="bagWeight4Kg" value={fgForm.bagWeight4Kg} onChange={onFgChange} style={input} />
              </Field>

              <Field label="Average Bag Weight">
                <input readOnly value={fgCalculated.avgBagWeightKg} style={readonly} />
              </Field>

              <Field label="Remarks">
                <textarea name="remarks" value={fgForm.remarks} onChange={onFgChange} style={textarea} />
              </Field>

              <div style={actionRow}>
                <button type="submit" style={saveButton}>Save FG Quality</button>
              </div>
            </form>
          </div>

          <DataTable
            title="FG Quality History"
            rows={fgQualityRows}
            searchFields={["qualityId", "extrusionBatchId", "fgBatchCode", "colour", "appearance", "remarks"]}
            columns={[
              { key: "date", label: "Date", render: (r) => formatDate(r.date) },
              { key: "extrusionBatchId", label: "FG Batch" },
              { key: "moisturePercent", label: "Moisture %" },
              { key: "mfi", label: "MFI" },
              { key: "colour", label: "Colour" },
              { key: "appearance", label: "Appearance" },
              { key: "avgBagWeightKg", label: "Avg Bag Kg" },
              { key: "status", label: "Status" },
            ]}
            onEdit={editFg}
            onDelete={(row) => deleteQuality(row, "FG")}
          />
        </>
      )}

      {editing && (
        <div style={modalOverlay}>
          <div style={modal}>
            <h2>Edit {editing.type} Quality</h2>

            {Object.keys(editing.fields).map((key) => (
              <Field key={key} label={key}>
                <input
                  name={key}
                  value={editing.fields[key] || ""}
                  onChange={onEditChange}
                  style={input}
                />
              </Field>
            ))}

            <div style={modalButtons}>
              <button onClick={() => setEditing(null)} style={cancelButton}>Cancel</button>
              <button onClick={saveEdit} style={saveButton}>Save Changes</button>
            </div>
          </div>
        </div>
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
const syncBox = { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 14, padding: 14, marginBottom: 18, display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" };
const syncButton = { background: "#d97706", color: "white", border: "none", padding: "10px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 800 };
const twoCol = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", gap: 18, marginBottom: 18 };
const card = { background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 18, marginBottom: 18 };
const sectionTitle = { marginTop: 0, color: "#0f766e" };
const pendingRow = { display: "flex", justifyContent: "space-between", gap: 12, padding: "12px 0", borderBottom: "1px solid #f1f5f9", alignItems: "center" };
const muted = { color: "#64748b", fontSize: 12, marginTop: 3 };
const empty = { color: "#64748b", padding: 12 };
const testButton = { background: "#2563eb", color: "white", border: "none", padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 800 };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 };
const labelStyle = { display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 5 };
const input = { width: "100%", height: 40, padding: "0 10px", border: "1px solid #cbd5e1", borderRadius: 8, boxSizing: "border-box" };
const readonly = { ...input, background: "#f8fafc", fontWeight: 800 };
const textarea = { ...input, height: 82, padding: 10 };
const actionRow = { display: "flex", alignItems: "end" };
const saveButton = { background: "#0f766e", color: "white", border: "none", padding: "10px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 700 };
const cancelButton = { background: "#64748b", color: "white", border: "none", padding: "10px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 700 };
const modalOverlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 };
const modal = { background: "white", padding: 24, borderRadius: 14, width: 850, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto" };
const modalButtons = { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 };