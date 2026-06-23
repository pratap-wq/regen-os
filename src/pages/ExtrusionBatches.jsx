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
    "WHITE_FLAKES",
    "COLOUR_FLAKES",
    "MILKY_FLAKES",
    "GREY_FLAKES",
    "ALL_MIX_FLAKES",
    "COMMODITY_FLAKES",
    "WASHED_FLAKES",
    "SORTED_FLAKES",
    "REWORK_LUMPS",
    "REWORK_GRANULES",
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
  ];

  const blankFeed = [{ materialType: "WHITE_FLAKES", qtyKg: "" }];

  const blankForm = {
    extrusionBatchId: "",
    sourceType: "SORTING",
    sourceBatchId: "",
    sourceSortingBatchId: "",
    sourceWashBatchId: "",
    sourceSupplier: "",
    availableSourceQty: "",
    date: today,
    shift: "A",
    machine: "",
    periodMonth: currentMonth,
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

  async function loadRows() {
    try {
      const [extrusionRes, machinesRes, sortingRes, washRes] =
        await Promise.all([
          apiCall({ fn: "extrusion.list" }),
          apiCall({ fn: "machines.list" }),
          apiCall({ fn: "sorting.availableForExtrusion" }),
          apiCall({ fn: "wash.availableForExtrusion" }),
        ]);

      setRows(extrusionRes.rows || []);
      setMachines(machinesRes.rows || []);
      setSortingBatches(sortingRes.rows || []);
      setDirectWashBatches(washRes.rows || []);
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
      .map((r) => `${r.materialType}: ${r.qtyKg} Kg`)
      .join(" + ");
  }

  function getFeedQty(material, feed = feedRows) {
    return feed
      .filter((r) => r.materialType === material)
      .reduce((s, r) => s + Number(r.qtyKg || 0), 0);
  }

  function getRecoveryFeedQty(feed = feedRows) {
    return feed
      .filter((r) =>
        [
          "REWORK_LUMPS",
          "REWORK_GRANULES",
          "COLOUR_REGRIND",
          "FLOTATION_TANK_REGRIND",
          "SINK_MATERIAL_REGRIND",
          "FLOAT_MATERIAL_REGRIND",
          "SORTER_REJECT_REGRIND",
        ].includes(r.materialType)
      )
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

    const virginQty = getFeedQty("VIRGIN_PP", feed);
    const batteryQty = getFeedQty("BATTERY_REGRIND", feed);
    const recoveryQty = getRecoveryFeedQty(feed);

    const virginRatio =
      totalInput > 0 ? ((virginQty / totalInput) * 100).toFixed(2) : 0;

    const batteryRatio =
      totalInput > 0 ? ((batteryQty / totalInput) * 100).toFixed(2) : 0;

    const recoveryMaterialPercent =
      totalInput > 0 ? ((recoveryQty / totalInput) * 100).toFixed(2) : 0;

    updated.feedComposition = JSON.stringify(feed);
    updated.inputMaterial = getFeedText(feed);
    updated.inputWeightKg = totalInput.toFixed(2);
    updated.totalInputKg = totalInput.toFixed(2);
    updated.totalRecoverableKg = recoverable.toFixed(2);
    updated.totalNonRecoverableKg = nonRecoverable.toFixed(2);
    updated.totalOutputKg = totalOutput.toFixed(2);
    updated.varianceKg = variance.toFixed(2);
    updated.recoveryPercent = recovery;
    updated.recoveryMaterialPercent = recoveryMaterialPercent;
    updated.virginRatioPercent = virginRatio;
    updated.batteryRatioPercent = batteryRatio;
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
    let updated = {
      ...form,
      [e.target.name]: e.target.value,
    };

    if (e.target.name === "sourceType") {
      updated.sourceBatchId = "";
      updated.sourceSortingBatchId = "";
      updated.sourceWashBatchId = "";
      updated.inputMaterial = "";
      updated.inputWeightKg = "";
      updated.sourceSupplier = "";
      updated.availableSourceQty = "";

      const resetFeed = [{ materialType: "WHITE_FLAKES", qtyKg: "" }];
      setFeedRows(resetFeed);
      updated = autoCalculate(updated, resetFeed);
      setForm(updated);
      return;
    }

    if (e.target.name === "sourceBatchId") {
      if (updated.sourceType === "SORTING") {
        const selected = sortingBatches.find(
          (s) => String(s.sortingBatchId) === String(e.target.value)
        );

        if (selected) {
          const qty = selected.acceptedQtyKg || "";

          updated.sourceSortingBatchId = selected.sortingBatchId;
          updated.sourceWashBatchId = selected.sourceWashBatchId || "";
          updated.sourceSupplier = selected.supplier || "";
          updated.availableSourceQty = qty;
          updated.remarks = "Auto linked from sorting batch";

          const newFeed = [{ materialType: "SORTED_FLAKES", qtyKg: qty }];
          setFeedRows(newFeed);
          updated = autoCalculate(updated, newFeed);
          setForm(updated);
          return;
        }
      } else {
        const selected = directWashBatches.find(
          (w) => String(w.washBatchId) === String(e.target.value)
        );

        if (selected) {
          const qty = selected.washedOutputKg || "";

          updated.sourceWashBatchId = selected.washBatchId;
          updated.sourceSupplier = selected.supplier || "";
          updated.availableSourceQty = qty;
          updated.remarks = "Auto linked from wash batch";

          const newFeed = [{ materialType: "WASHED_FLAKES", qtyKg: qty }];
          setFeedRows(newFeed);
          updated = autoCalculate(updated, newFeed);
          setForm(updated);
          return;
        }
      }
    }

    updated = autoCalculate(updated, feedRows);
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
    const updatedFeed = [...feedRows, { materialType: "", qtyKg: "" }];
    setFeedRows(updatedFeed);
    setForm(autoCalculate({ ...form }, updatedFeed));
  }

  function removeFeedRow(index) {
    const updatedFeed = feedRows.filter((_, i) => i !== index);

    const finalFeed =
      updatedFeed.length > 0
        ? updatedFeed
        : [{ materialType: "WHITE_FLAKES", qtyKg: "" }];

    setFeedRows(finalFeed);
    setForm(autoCalculate({ ...form }, finalFeed));
  }

  function parseFeedComposition(row) {
    try {
      if (row.feedComposition) {
        const parsed = JSON.parse(row.feedComposition);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (err) {
      console.log(err);
    }

    const legacy = [];

    if (row.washedFlakesKg) {
      legacy.push({ materialType: "WASHED_FLAKES", qtyKg: row.washedFlakesKg });
    }

    if (row.whiteFlakesKg) {
      legacy.push({ materialType: "WHITE_FLAKES", qtyKg: row.whiteFlakesKg });
    }

    if (row.allMixKg) {
      legacy.push({ materialType: "ALL_MIX_FLAKES", qtyKg: row.allMixKg });
    }

    if (row.commodityKg) {
      legacy.push({ materialType: "COMMODITY_FLAKES", qtyKg: row.commodityKg });
    }

    if (row.batteryFlakesKg) {
      legacy.push({ materialType: "BATTERY_REGRIND", qtyKg: row.batteryFlakesKg });
    }

    if (row.virginMaterialKg) {
      legacy.push({ materialType: "VIRGIN_PP", qtyKg: row.virginMaterialKg });
    }

    if (row.masterbatchKg) {
      legacy.push({ materialType: "MASTERBATCH", qtyKg: row.masterbatchKg });
    }

    if (row.antioxidantKg) {
      legacy.push({ materialType: "ANTIOXIDANT", qtyKg: row.antioxidantKg });
    }

    if (row.reworkInputKg) {
      legacy.push({ materialType: "REWORK_GRANULES", qtyKg: row.reworkInputKg });
    }

    if (row.lumpsInputKg) {
      legacy.push({ materialType: "REWORK_LUMPS", qtyKg: row.lumpsInputKg });
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
      const finalForm = autoCalculate({ ...form }, feedRows);

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
        setStatus(editingId ? "Updated" : "Saved");
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
        <h2 style={{ margin: 0 }}>Extrusion Mass Balance</h2>

        <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
          Production intelligence, feed composition and recovery engine
        </div>
      </div>

      <form
        onSubmit={submit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <FormSection title="Source & Workflow">
          <Field label="Source Type">
            <select
              name="sourceType"
              value={form.sourceType}
              onChange={onChange}
              style={inputStyle}
            >
              <option value="SORTING">Sorting</option>
              <option value="WASH">Direct Wash</option>
            </select>
          </Field>

          <Field label="Source Batch">
            <select
              name="sourceBatchId"
              value={form.sourceBatchId}
              onChange={onChange}
              style={inputStyle}
            >
              <option value="">Select</option>

              {form.sourceType === "SORTING"
                ? sortingBatches.map((s, i) => (
                    <option key={i} value={s.sortingBatchId}>
                      {s.sortingBatchId} | {s.acceptedQtyKg} Kg
                    </option>
                  ))
                : directWashBatches.map((w, i) => (
                    <option key={i} value={w.washBatchId}>
                      {w.washBatchId} | {w.washedOutputKg} Kg
                    </option>
                  ))}
            </select>
          </Field>

          <Field label="Date">
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={onChange}
              style={inputStyle}
            />
          </Field>

          <Field label="Shift">
            <select
              name="shift"
              value={form.shift}
              onChange={onChange}
              style={inputStyle}
            >
              <option>A</option>
              <option>B</option>
              <option>C</option>
            </select>
          </Field>

          <Field label="Machine">
            <select
              name="machine"
              value={form.machine}
              onChange={onChange}
              style={inputStyle}
            >
              <option value="">Select Machine</option>
              {machines.map((m, i) => (
                <option key={i} value={m.machineName}>
                  {m.machineName}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Supplier">
            <input readOnly value={form.sourceSupplier} style={readonlyStyle} />
          </Field>

          <Field label="Workflow Status">
            <input readOnly value={form.status} style={readonlyStyle} />
          </Field>
        </FormSection>

        <FormSection title="Feed Composition">
          <div style={{ gridColumn: "1 / -1" }}>
            <table style={feedTable}>
              <thead>
                <tr style={feedHeader}>
                  <th style={feedTh}>Material</th>
                  <th style={feedTh}>Qty Kg</th>
                  <th style={feedTh}>Action</th>
                </tr>
              </thead>

              <tbody>
                {feedRows.map((r, i) => (
                  <tr key={i}>
                    <td style={feedTd}>
                      <select
                        value={r.materialType}
                        onChange={(e) =>
                          updateFeedRow(i, "materialType", e.target.value)
                        }
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
                        value={r.qtyKg}
                        onChange={(e) =>
                          updateFeedRow(i, "qtyKg", e.target.value)
                        }
                        style={inputStyle}
                      />
                    </td>

                    <td style={feedTd}>
                      <button
                        type="button"
                        onClick={() => removeFeedRow(i)}
                        style={removeButton}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button type="button" onClick={addFeedRow} style={addButton}>
              + Add Material
            </button>
          </div>

          <Field label="Total Feed Kg">
            <input readOnly value={form.totalInputKg} style={readonlyStyle} />
          </Field>

          <Field label="Feed Summary">
            <textarea readOnly value={form.inputMaterial} style={textareaStyle} />
          </Field>
        </FormSection>

        <FormSection title="Output Matrix">
          <Field label="FG Output">
            <input
              type="number"
              name="fgOutputKg"
              value={form.fgOutputKg}
              onChange={onChange}
              style={inputStyle}
            />
          </Field>

          <Field label="Lumps">
            <input
              type="number"
              name="lumpsKg"
              value={form.lumpsKg}
              onChange={onChange}
              style={inputStyle}
            />
          </Field>

          <Field label="Purging">
            <input
              type="number"
              name="purgingKg"
              value={form.purgingKg}
              onChange={onChange}
              style={inputStyle}
            />
          </Field>

          <Field label="Rework">
            <input
              type="number"
              name="reworkGranulesKg"
              value={form.reworkGranulesKg}
              onChange={onChange}
              style={inputStyle}
            />
          </Field>

          <Field label="Reject">
            <input
              type="number"
              name="rejectKg"
              value={form.rejectKg}
              onChange={onChange}
              style={inputStyle}
            />
          </Field>

          <Field label="Vacuum Reject">
            <input
              type="number"
              name="vacuumRejectKg"
              value={form.vacuumRejectKg}
              onChange={onChange}
              style={inputStyle}
            />
          </Field>

          <Field label="Mesh Reject">
            <input
              type="number"
              name="meshRejectKg"
              value={form.meshRejectKg}
              onChange={onChange}
              style={inputStyle}
            />
          </Field>

          <Field label="Floor Spillage">
            <input
              type="number"
              name="floorSpillageKg"
              value={form.floorSpillageKg}
              onChange={onChange}
              style={inputStyle}
            />
          </Field>
        </FormSection>

        <FormSection title="Mass Balance Engine">
          <Field label="Total Input">
            <input readOnly value={form.totalInputKg} style={readonlyStyle} />
          </Field>

          <Field label="Total Output">
            <input readOnly value={form.totalOutputKg} style={readonlyStyle} />
          </Field>

          <Field label="Recoverable">
            <input
              readOnly
              value={form.totalRecoverableKg}
              style={readonlyStyle}
            />
          </Field>

          <Field label="Non Recoverable">
            <input
              readOnly
              value={form.totalNonRecoverableKg}
              style={readonlyStyle}
            />
          </Field>

          <Field label="Variance">
            <input
              readOnly
              value={form.varianceKg}
              style={{
                ...readonlyStyle,
                color: Number(form.varianceKg || 0) > 10 ? "#dc2626" : "#16a34a",
              }}
            />
          </Field>

          <Field label="Recovery %">
            <input
              readOnly
              value={form.recoveryPercent}
              style={readonlyStyle}
            />
          </Field>

          <Field label="Recovery Material %">
            <input
              readOnly
              value={form.recoveryMaterialPercent}
              style={readonlyStyle}
            />
          </Field>

          <Field label="Virgin Ratio %">
            <input
              readOnly
              value={form.virginRatioPercent}
              style={readonlyStyle}
            />
          </Field>

          <Field label="Battery Ratio %">
            <input
              readOnly
              value={form.batteryRatioPercent}
              style={readonlyStyle}
            />
          </Field>
        </FormSection>

        <FormSection title="FG & Traceability">
          <Field label="Production Grade">
            <input
              name="productionGrade"
              value={form.productionGrade}
              onChange={onChange}
              style={inputStyle}
            />
          </Field>

          <Field label="Lot No">
            <input readOnly value={form.lotNo} style={readonlyStyle} />
          </Field>

          <Field label="Operator">
            <input
              name="operatorName"
              value={form.operatorName}
              onChange={onChange}
              style={inputStyle}
            />
          </Field>

          <Field label="Supervisor">
            <input
              name="supervisorName"
              value={form.supervisorName}
              onChange={onChange}
              style={inputStyle}
            />
          </Field>
        </FormSection>

        <FormSection title="Remarks" defaultOpen={false}>
          <Field label="Remarks">
            <textarea
              name="remarks"
              value={form.remarks}
              onChange={onChange}
              style={textareaStyle}
            />
          </Field>
        </FormSection>

        <div style={stickyBar}>
          <button type="submit" style={saveButton(editingId)}>
            {editingId ? "Update Batch" : "Save Batch"}
          </button>
        </div>
      </form>

      <div
        style={{
          marginTop: 12,
          marginBottom: 16,
          color: "#0f766e",
          fontWeight: 600,
        }}
      >
        {status}
      </div>

      <DataTable
        title="Extrusion Mass Balance"
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
          { key: "recoveryPercent", label: "Recovery %" },
          { key: "recoveryMaterialPercent", label: "Recovery Feed %" },
          {
            key: "recoverySeverity",
            label: "Severity",
            render: (r) => (
              <span style={badge(r.recoverySeverity || "LOW")}>
                {r.recoverySeverity}
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
      <div
        style={{
          marginBottom: 4,
          fontWeight: 600,
          color: "#334155",
          fontSize: 12,
        }}
      >
        {label}
      </div>

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