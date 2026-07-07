import { useEffect, useState } from "react";
import { apiCall } from "../api/api";
import { formatDate } from "../utils/date";
import {
  getExtrusionStatus,
  getAlertSeverity,
  buildDispatchLot,
} from "../lib/workflow";

import DataTable from "../components/DataTable";
import FormSection from "../components/FormSection";

export default function ExtrusionBatches() {
  const today = new Date().toISOString().split("T")[0];
  const currentMonth = new Date().toISOString().slice(0, 7);

  const feedMaterials = [
    "SORTED_FLAKES",
    "WASHED_FLAKES",
    "WHITE_FLAKES",
    "MILKY_FLAKES",
    "COLOUR_FLAKES",
    "GREY_FLAKES",
    "ALL_MIX_FLAKES",
    "COMMODITY_FLAKES",

    "RECOVERY_LUMPS",
    "RECOVERY_GRANULES",
    "REWORK_LUMPS",
    "REWORK_GRANULES",
    "PURGING_REWORK",
    "COLOUR_REGRIND",
    "FLOTATION_TANK_REGRIND",
    "SINK_MATERIAL_REGRIND",
    "FLOAT_MATERIAL_REGRIND",
    "SORTER_REJECT_REGRIND",

    "BATTERY_REGRIND",
    "VIRGIN_PP",
    "MASTERBATCH",
    "ANTIOXIDANT",
    "ADDITIVE_PACKAGE",
    "OTHER",
  ];

  const blankFeed = [
    {
      sourceType: "SORTING",
      sourceBatchId: "",
      materialType: "SORTED_FLAKES",
      qtyKg: "",
      remarks: "",
    },
  ];

  const blankForm = {
    extrusionBatchId: "",
    date: today,
    shift: "A",
    machine: "",
    periodMonth: currentMonth,

    sourceType: "MIXED",
    sourceBatchId: "",
    sourceSortingBatchId: "",
    sourceWashBatchId: "",
    sourceSupplier: "",
    availableSourceQty: "",

    inputMaterial: "",
    inputWeightKg: "",
    feedComposition: JSON.stringify(blankFeed),

    fgOutputKg: "",
    lumpsKg: "",
    purgingKg: "",
    reworkGranulesKg: "",
    rejectKg: "",
    vacuumRejectKg: "",
    meshRejectKg: "",
    floorSpillageKg: "",

    totalInputKg: "",
    totalOutputKg: "",
    totalRecoverableKg: "",
    totalNonRecoverableKg: "",
    varianceKg: "",
    recoveryPercent: "",
    recoveryMaterialPercent: "",
    virginRatioPercent: "",
    batteryRatioPercent: "",
    additiveRatioPercent: "",
    recoverySeverity: "LOW",

    productionGrade: "",
    operatorName: "",
    supervisorName: "",
    remarks: "",
    nextProcess: "Dispatch",
    status: "READY_FOR_DISPATCH",
    lotNo: "",
  };

  const [status, setStatus] = useState("");
  const [rows, setRows] = useState([]);
  const [machines, setMachines] = useState([]);
  const [sortingBatches, setSortingBatches] = useState([]);
  const [directWashBatches, setDirectWashBatches] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [feedRows, setFeedRows] = useState(blankFeed);

  useEffect(() => {
    loadRows();
  }, []);

  async function safeLoad(fn) {
    try {
      const res = await apiCall({ fn });
      return res.rows || [];
    } catch (err) {
      console.log(fn, err);
      return [];
    }
  }

  async function loadRows() {
    try {
      const [extrusion, machinesList, sorting, wash] = await Promise.all([
        safeLoad("extrusion.list"),
        safeLoad("machines.list"),
        safeLoad("sorting.availableForExtrusion"),
        safeLoad("wash.availableForExtrusion"),
      ]);

      setRows(extrusion);
      setMachines(machinesList);
      setSortingBatches(sorting);
      setDirectWashBatches(wash);
    } catch (err) {
      console.log(err);
      setStatus(err.message);
    }
  }

  function getFeedTotal(feed = feedRows) {
    return feed.reduce((s, r) => s + Number(r.qtyKg || 0), 0);
  }

  function getFeedText(feed = feedRows) {
    return feed
      .filter((r) => r.materialType && Number(r.qtyKg || 0) > 0)
      .map((r) => {
        const batch = r.sourceBatchId ? ` (${r.sourceBatchId})` : "";
        return `${r.materialType}${batch}: ${r.qtyKg} Kg`;
      })
      .join(" + ");
  }

  function getFeedQtyByMaterial(material, feed = feedRows) {
    return feed
      .filter((r) => r.materialType === material)
      .reduce((s, r) => s + Number(r.qtyKg || 0), 0);
  }

  function isRecoveryMaterial(materialType = "") {
    return [
      "RECOVERY_LUMPS",
      "RECOVERY_GRANULES",
      "REWORK_LUMPS",
      "REWORK_GRANULES",
      "PURGING_REWORK",
      "COLOUR_REGRIND",
      "FLOTATION_TANK_REGRIND",
      "SINK_MATERIAL_REGRIND",
      "FLOAT_MATERIAL_REGRIND",
      "SORTER_REJECT_REGRIND",
    ].includes(materialType);
  }

  function isAdditiveMaterial(materialType = "") {
    return ["MASTERBATCH", "ANTIOXIDANT", "ADDITIVE_PACKAGE"].includes(
      materialType
    );
  }

  function getRecoveryFeedQty(feed = feedRows) {
    return feed
      .filter((r) => isRecoveryMaterial(r.materialType))
      .reduce((s, r) => s + Number(r.qtyKg || 0), 0);
  }

  function getAdditiveFeedQty(feed = feedRows) {
    return feed
      .filter((r) => isAdditiveMaterial(r.materialType))
      .reduce((s, r) => s + Number(r.qtyKg || 0), 0);
  }

  function autoCalculate(updated, feed = feedRows) {
    const totalInput = getFeedTotal(feed);

    const fg = Number(updated.fgOutputKg || 0);
    const lumps = Number(updated.lumpsKg || 0);
    const purging = Number(updated.purgingKg || 0);
    const rework = Number(updated.reworkGranulesKg || 0);

    const reject = Number(updated.rejectKg || 0);
    const vacuum = Number(updated.vacuumRejectKg || 0);
    const mesh = Number(updated.meshRejectKg || 0);
    const spillage = Number(updated.floorSpillageKg || 0);

    const recoverable = fg + lumps + purging + rework;
    const nonRecoverable = reject + vacuum + mesh + spillage;
    const totalOutput = recoverable + nonRecoverable;
    const variance = totalInput - totalOutput;

    const recovery = totalInput > 0 ? ((fg / totalInput) * 100).toFixed(2) : 0;

    const virginQty = getFeedQtyByMaterial("VIRGIN_PP", feed);
    const batteryQty = getFeedQtyByMaterial("BATTERY_REGRIND", feed);
    const recoveryQty = getRecoveryFeedQty(feed);
    const additiveQty = getAdditiveFeedQty(feed);

    updated.feedComposition = JSON.stringify(feed);
    updated.inputMaterial = getFeedText(feed);
    updated.inputWeightKg = totalInput.toFixed(2);
    updated.totalInputKg = totalInput.toFixed(2);
    updated.totalRecoverableKg = recoverable.toFixed(2);
    updated.totalNonRecoverableKg = nonRecoverable.toFixed(2);
    updated.totalOutputKg = totalOutput.toFixed(2);
    updated.varianceKg = variance.toFixed(2);
    updated.recoveryPercent = recovery;

    updated.recoveryMaterialPercent =
      totalInput > 0 ? ((recoveryQty / totalInput) * 100).toFixed(2) : 0;

    updated.virginRatioPercent =
      totalInput > 0 ? ((virginQty / totalInput) * 100).toFixed(2) : 0;

    updated.batteryRatioPercent =
      totalInput > 0 ? ((batteryQty / totalInput) * 100).toFixed(2) : 0;

    updated.additiveRatioPercent =
      totalInput > 0 ? ((additiveQty / totalInput) * 100).toFixed(2) : 0;

    updated.recoverySeverity = getAlertSeverity(recovery);

    const workflow = getExtrusionStatus(updated);
    updated.nextProcess = workflow.nextProcess;
    updated.status = workflow.status;

    const lot = buildDispatchLot({
      extrusionBatchId: updated.extrusionBatchId || "NEW",
      productionGrade: updated.productionGrade,
      fgOutputKg: updated.fgOutputKg,
    });

    updated.lotNo = lot.lotNo;

    return updated;
  }

  function onChange(e) {
    const updated = autoCalculate(
      {
        ...form,
        [e.target.name]: e.target.value,
      },
      feedRows
    );

    setForm(updated);
  }

  function updateFeedRow(index, key, value) {
    const updatedFeed = feedRows.map((r, i) =>
      i === index ? { ...r, [key]: value } : r
    );

    setFeedRows(updatedFeed);
    setForm(autoCalculate({ ...form }, updatedFeed));
  }

  function addFeedRow() {
    const updatedFeed = [
      ...feedRows,
      {
        sourceType: "RECOVERY",
        sourceBatchId: "",
        materialType: "REWORK_GRANULES",
        qtyKg: "",
        remarks: "",
      },
    ];

    setFeedRows(updatedFeed);
    setForm(autoCalculate({ ...form }, updatedFeed));
  }

  function removeFeedRow(index) {
    const updatedFeed = feedRows.filter((_, i) => i !== index);

    const finalFeed =
      updatedFeed.length > 0
        ? updatedFeed
        : [
            {
              sourceType: "SORTING",
              sourceBatchId: "",
              materialType: "SORTED_FLAKES",
              qtyKg: "",
              remarks: "",
            },
          ];

    setFeedRows(finalFeed);
    setForm(autoCalculate({ ...form }, finalFeed));
  }

  function loadSortingBatchToFeed(batchId) {
    const selected = sortingBatches.find(
      (x) => String(x.sortingBatchId) === String(batchId)
    );

    if (!selected) return;

    const qty = selected.acceptedQtyKg || "";

    const updatedFeed = [
      ...feedRows,
      {
        sourceType: "SORTING",
        sourceBatchId: selected.sortingBatchId,
        materialType: "SORTED_FLAKES",
        qtyKg: qty,
        remarks: "From sorting batch",
      },
    ];

    const updatedForm = {
      ...form,
      sourceSortingBatchId: selected.sortingBatchId,
      sourceWashBatchId: selected.sourceWashBatchId || form.sourceWashBatchId,
      sourceSupplier: selected.supplier || form.sourceSupplier,
      availableSourceQty: qty,
    };

    setFeedRows(updatedFeed);
    setForm(autoCalculate(updatedForm, updatedFeed));
  }

  function loadWashBatchToFeed(batchId) {
    const selected = directWashBatches.find(
      (x) => String(x.washBatchId) === String(batchId)
    );

    if (!selected) return;

    const qty = selected.washedOutputKg || "";

    const updatedFeed = [
      ...feedRows,
      {
        sourceType: "WASH",
        sourceBatchId: selected.washBatchId,
        materialType: "WASHED_FLAKES",
        qtyKg: qty,
        remarks: "Direct wash batch",
      },
    ];

    const updatedForm = {
      ...form,
      sourceWashBatchId: selected.washBatchId,
      sourceSupplier: selected.supplier || form.sourceSupplier,
      availableSourceQty: qty,
    };

    setFeedRows(updatedFeed);
    setForm(autoCalculate(updatedForm, updatedFeed));
  }

  function parseFeedComposition(row) {
    try {
      if (row.feedComposition) {
        const parsed = JSON.parse(row.feedComposition);

        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((x) => ({
            sourceType: x.sourceType || "",
            sourceBatchId: x.sourceBatchId || x.batchId || "",
            materialType: x.materialType || "",
            qtyKg: x.qtyKg || "",
            remarks: x.remarks || "",
          }));
        }
      }
    } catch (err) {
      console.log(err);
    }

    const legacy = [];

    if (row.inputMaterial && row.inputWeightKg) {
      legacy.push({
        sourceType: "LEGACY",
        sourceBatchId: row.sourceBatchId || "",
        materialType: row.inputMaterial,
        qtyKg: row.inputWeightKg,
        remarks: "Legacy imported feed",
      });
    }

    return legacy.length > 0 ? legacy : blankFeed;
  }

  function editRow(row) {
    const parsedFeed = parseFeedComposition(row);

    setEditingId(row.extrusionBatchId);
    setFeedRows(parsedFeed);

    const updated = autoCalculate(
      {
        ...blankForm,
        ...row,
        date: row.date ? new Date(row.date).toISOString().split("T")[0] : today,
      },
      parsedFeed
    );

    setForm(updated);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function deleteRow(row) {
    const confirmed = window.confirm("Delete extrusion batch?");
    if (!confirmed) return;

    try {
      await apiCall({
        fn: "extrusion.update",
        extrusionBatchId: row.extrusionBatchId,
        status: "DELETED",
      });

      loadRows();
    } catch (err) {
      alert(err.message);
    }
  }

  async function submit(e) {
    e.preventDefault();

    try {
      const cleanFeed = feedRows.filter(
        (r) => r.materialType && Number(r.qtyKg || 0) > 0
      );

      if (cleanFeed.length === 0) {
        alert("Add at least one feed material");
        return;
      }

      const finalForm = autoCalculate({ ...form }, cleanFeed);

      let res;

      if (editingId) {
        res = await apiCall({
          fn: "extrusion.update",
          ...finalForm,
        });
      } else {
        res = await apiCall({
          fn: "extrusion.add",
          ...finalForm,
        });
      }

      if (res.ok) {
        setStatus(editingId ? "Extrusion batch updated" : "Extrusion batch saved");
        setEditingId(null);
        setForm(blankForm);
        setFeedRows(blankFeed);
        loadRows();
      } else {
        setStatus(res.error || "Error saving batch");
      }
    } catch (err) {
      setStatus(err.message);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Extrusion Batch</h2>

        <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
          Single source of truth for extruder feed composition, recovery material and FG output.
        </div>
      </div>

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <FormSection title="Batch Header">
          <Field label="Date">
            <input type="date" name="date" value={form.date} onChange={onChange} style={inputStyle} />
          </Field>

          <Field label="Shift">
            <select name="shift" value={form.shift} onChange={onChange} style={inputStyle}>
              <option>A</option>
              <option>B</option>
              <option>C</option>
            </select>
          </Field>

          <Field label="Machine">
            <select name="machine" value={form.machine} onChange={onChange} style={inputStyle}>
              <option value="">Select Machine</option>
              {machines.map((m, i) => (
                <option key={i} value={m.machineName}>
                  {m.machineName}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Production Grade">
            <input name="productionGrade" value={form.productionGrade} onChange={onChange} style={inputStyle} />
          </Field>

          <Field label="Operator">
            <input name="operatorName" value={form.operatorName} onChange={onChange} style={inputStyle} />
          </Field>

          <Field label="Supervisor">
            <input name="supervisorName" value={form.supervisorName} onChange={onChange} style={inputStyle} />
          </Field>
        </FormSection>

        <FormSection title="Quick Add Source Batch">
          <Field label="Add Sorting Batch">
            <select onChange={(e) => e.target.value && loadSortingBatchToFeed(e.target.value)} style={inputStyle} value="">
              <option value="">Select Sorting Batch</option>
              {sortingBatches.map((s, i) => (
                <option key={i} value={s.sortingBatchId}>
                  {s.sortingBatchId} | {s.acceptedQtyKg} Kg
                </option>
              ))}
            </select>
          </Field>

          <Field label="Add Direct Wash Batch">
            <select onChange={(e) => e.target.value && loadWashBatchToFeed(e.target.value)} style={inputStyle} value="">
              <option value="">Select Wash Batch</option>
              {directWashBatches.map((w, i) => (
                <option key={i} value={w.washBatchId}>
                  {w.washBatchId} | {w.washedOutputKg} Kg
                </option>
              ))}
            </select>
          </Field>

          <Field label="Workflow Status">
            <input readOnly value={form.status} style={readonlyStyle} />
          </Field>

          <Field label="Lot No">
            <input readOnly value={form.lotNo} style={readonlyStyle} />
          </Field>
        </FormSection>

        <FormSection title="Extruder Feed Composition">
          <div style={{ gridColumn: "1 / -1" }}>
            <table style={feedTable}>
              <thead>
                <tr style={feedHeader}>
                  <th style={feedTh}>Source Type</th>
                  <th style={feedTh}>Source / Batch</th>
                  <th style={feedTh}>Material</th>
                  <th style={feedTh}>Qty Kg</th>
                  <th style={feedTh}>Remarks</th>
                  <th style={feedTh}>Action</th>
                </tr>
              </thead>

              <tbody>
                {feedRows.map((r, i) => (
                  <tr key={i}>
                    <td style={feedTd}>
                      <select
                        value={r.sourceType || ""}
                        onChange={(e) => updateFeedRow(i, "sourceType", e.target.value)}
                        style={inputStyle}
                      >
                        <option value="">Select</option>
                        <option value="SORTING">Sorting</option>
                        <option value="WASH">Wash</option>
                        <option value="RECOVERY">Recovery / Rework</option>
                        <option value="VIRGIN">Virgin</option>
                        <option value="ADDITIVE">Additive</option>
                        <option value="MANUAL">Manual</option>
                      </select>
                    </td>

                    <td style={feedTd}>
                      <input
                        value={r.sourceBatchId || ""}
                        onChange={(e) => updateFeedRow(i, "sourceBatchId", e.target.value)}
                        placeholder="Batch / Lot / Manual Ref"
                        style={inputStyle}
                      />
                    </td>

                    <td style={feedTd}>
                      <select
                        value={r.materialType || ""}
                        onChange={(e) => updateFeedRow(i, "materialType", e.target.value)}
                        style={inputStyle}
                      >
                        <option value="">Select Material</option>
                        {feedMaterials.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td style={feedTd}>
                      <input
                        type="number"
                        value={r.qtyKg || ""}
                        onChange={(e) => updateFeedRow(i, "qtyKg", e.target.value)}
                        style={inputStyle}
                      />
                    </td>

                    <td style={feedTd}>
                      <input
                        value={r.remarks || ""}
                        onChange={(e) => updateFeedRow(i, "remarks", e.target.value)}
                        style={inputStyle}
                      />
                    </td>

                    <td style={feedTd}>
                      <button type="button" onClick={() => removeFeedRow(i)} style={removeButton}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button type="button" onClick={addFeedRow} style={addButton}>
              + Add Feed / Recovery Material
            </button>
          </div>

          <Field label="Total Feed Kg">
            <input readOnly value={form.totalInputKg} style={readonlyStyle} />
          </Field>

          <Field label="Feed Summary">
            <textarea readOnly value={form.inputMaterial} style={textareaStyle} />
          </Field>

          <Field label="Recovery Feed %">
            <input readOnly value={form.recoveryMaterialPercent} style={readonlyStyle} />
          </Field>

          <Field label="Virgin %">
            <input readOnly value={form.virginRatioPercent} style={readonlyStyle} />
          </Field>

          <Field label="Battery %">
            <input readOnly value={form.batteryRatioPercent} style={readonlyStyle} />
          </Field>

          <Field label="Additive %">
            <input readOnly value={form.additiveRatioPercent} style={readonlyStyle} />
          </Field>
        </FormSection>

        <FormSection title="Output Matrix">
          <Field label="FG Output Kg">
            <input type="number" name="fgOutputKg" value={form.fgOutputKg} onChange={onChange} style={inputStyle} />
          </Field>

          <Field label="Lumps Kg">
            <input type="number" name="lumpsKg" value={form.lumpsKg} onChange={onChange} style={inputStyle} />
          </Field>

          <Field label="Purging Kg">
            <input type="number" name="purgingKg" value={form.purgingKg} onChange={onChange} style={inputStyle} />
          </Field>

          <Field label="Rework Granules Kg">
            <input type="number" name="reworkGranulesKg" value={form.reworkGranulesKg} onChange={onChange} style={inputStyle} />
          </Field>

          <Field label="Reject Kg">
            <input type="number" name="rejectKg" value={form.rejectKg} onChange={onChange} style={inputStyle} />
          </Field>

          <Field label="Vacuum Reject Kg">
            <input type="number" name="vacuumRejectKg" value={form.vacuumRejectKg} onChange={onChange} style={inputStyle} />
          </Field>

          <Field label="Mesh Reject Kg">
            <input type="number" name="meshRejectKg" value={form.meshRejectKg} onChange={onChange} style={inputStyle} />
          </Field>

          <Field label="Floor Spillage Kg">
            <input type="number" name="floorSpillageKg" value={form.floorSpillageKg} onChange={onChange} style={inputStyle} />
          </Field>
        </FormSection>

        <FormSection title="Mass Balance">
          <Field label="Total Input">
            <input readOnly value={form.totalInputKg} style={readonlyStyle} />
          </Field>

          <Field label="Total Output">
            <input readOnly value={form.totalOutputKg} style={readonlyStyle} />
          </Field>

          <Field label="Recoverable">
            <input readOnly value={form.totalRecoverableKg} style={readonlyStyle} />
          </Field>

          <Field label="Non Recoverable">
            <input readOnly value={form.totalNonRecoverableKg} style={readonlyStyle} />
          </Field>

          <Field label="Variance">
            <input
              readOnly
              value={form.varianceKg}
              style={{
                ...readonlyStyle,
                color: Math.abs(Number(form.varianceKg || 0)) > 10 ? "#dc2626" : "#16a34a",
              }}
            />
          </Field>

          <Field label="FG Recovery %">
            <input readOnly value={form.recoveryPercent} style={readonlyStyle} />
          </Field>
        </FormSection>

        <FormSection title="Remarks" defaultOpen={false}>
          <Field label="Remarks">
            <textarea name="remarks" value={form.remarks} onChange={onChange} style={textareaStyle} />
          </Field>
        </FormSection>

        <div style={stickyBar}>
          <button type="submit" style={saveButton(editingId)}>
            {editingId ? "Update Batch" : "Save Batch"}
          </button>
        </div>
      </form>

      <div style={statusText}>{status}</div>

      <DataTable
        title="Extrusion Batches"
        rows={rows.filter((r) => r.status !== "DELETED")}
        searchFields={[
          "extrusionBatchId",
          "machine",
          "inputMaterial",
          "productionGrade",
          "lotNo",
        ]}
        columns={[
          { key: "extrusionBatchId", label: "Batch" },
          {
            key: "date",
            label: "Date",
            render: (r) => formatDate(r.date),
          },
          { key: "productionGrade", label: "Grade" },
          { key: "totalInputKg", label: "Input" },
          { key: "fgOutputKg", label: "FG" },
          { key: "varianceKg", label: "Variance" },
          { key: "recoveryPercent", label: "FG Recovery %" },
          { key: "recoveryMaterialPercent", label: "Recovery Feed %" },
          {
            key: "recoverySeverity",
            label: "Severity",
            render: (r) => (
              <span style={badge(r.recoverySeverity || "LOW")}>
                {r.recoverySeverity || "LOW"}
              </span>
            ),
          },
        ]}
        onEdit={editRow}
        onDelete={deleteRow}
      />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={fieldLabel}>{label}</div>
      {children}
    </div>
  );
}

const badge = (severity) => ({
  background:
    severity === "CRITICAL"
      ? "#fee2e2"
      : severity === "HIGH"
      ? "#fef3c7"
      : severity === "MEDIUM"
      ? "#dbeafe"
      : "#dcfce7",
  color:
    severity === "CRITICAL"
      ? "#991b1b"
      : severity === "HIGH"
      ? "#92400e"
      : severity === "MEDIUM"
      ? "#1e40af"
      : "#166534",
  padding: "4px 8px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 700,
});

const fieldLabel = {
  marginBottom: 4,
  fontWeight: 600,
  color: "#334155",
  fontSize: 12,
};

const inputStyle = {
  width: "100%",
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ccc",
  boxSizing: "border-box",
};

const readonlyStyle = {
  ...inputStyle,
  background: "#f8fafc",
  fontWeight: 700,
};

const textareaStyle = {
  ...inputStyle,
  height: 80,
};

const feedTable = {
  width: "100%",
  borderCollapse: "collapse",
  marginBottom: 10,
  minWidth: 1100,
};

const feedHeader = {
  background: "#0f766e",
  color: "white",
};

const feedTh = {
  padding: 10,
  textAlign: "left",
};

const feedTd = {
  padding: 8,
  borderBottom: "1px solid #e5e7eb",
};

const addButton = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "9px 14px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
};

const removeButton = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
};

const saveButton = (editingId) => ({
  background: editingId ? "#ea580c" : "#0f766e",
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
});

const stickyBar = {
  position: "sticky",
  bottom: 0,
  background: "white",
  padding: 12,
  borderTop: "1px solid #ddd",
  display: "flex",
  justifyContent: "flex-end",
  zIndex: 10,
};

const statusText = {
  marginTop: 12,
  marginBottom: 16,
  color: "#0f766e",
  fontWeight: 600,
};