import { useEffect, useState } from "react";
import { apiCall } from "../api/api";
import FormSection from "../components/FormSection";

export default function Production() {
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

  const blankFeedRow = {
    sourceType: "SORTING",
    sourceBatchId: "",
    materialType: "SORTED_FLAKES",
    qtyKg: "",
    remarks: "",
  };

  const blank = {
    date: today,
    shift: "A",

    machineRunningHours: "",
    downtimeHours: "",
    downtimeReason: "",

    washOperatorName: "",
    washSupervisorName: "",
    sorterOperatorName: "",
    sorterSupervisorName: "",
    extruderOperatorName: "",
    extruderSupervisorName: "",

    machineWash: "",
    machineSorter: "",
    machineExtruder: "",

    washInputMaterial: "",
    washInputKg: "",
    washedOutputKg: "",
    dustKg: "",
    sinkMaterialKg: "",
    microPlasticKg: "",
    wrappersKg: "",
    sludgeKg: "",
    raffiaKg: "",

    sorterInputMaterial: "",
    sorterInputKg: "",
    whiteSortedKg: "",
    allMixSortedKg: "",
    commodityKg: "",
    whiteGreyKg: "",
    sorterRejectKg: "",

    fgOutputKg: "",
    lumpsKg: "",
    purgingKg: "",
    reworkGranulesKg: "",
    rejectKg: "",
    vacuumRejectKg: "",
    meshRejectKg: "",
    floorSpillageKg: "",
    productionGrade: "",

    visualCleanlinessRating: "5",
    moistureRating: "5",
    odourRating: "5",
    blackSpecsRating: "5",
    colorConsistencyRating: "5",
    qcRemarks: "",

    remarks: "",
  };

  const [form, setForm] = useState(blank);
  const [feedRows, setFeedRows] = useState([{ ...blankFeedRow }]);
  const [machines, setMachines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadMasters();
  }, []);

  async function loadMasters() {
    try {
      const [machineRes, catRes] = await Promise.all([
        apiCall({ fn: "machines.list" }),
        apiCall({ fn: "categories.list" }),
      ]);

      setMachines(machineRes.rows || []);
      setCategories(catRes.rows || []);
    } catch (err) {
      setMessage(err.message);
    }
  }

  function n(v) {
    return Number(v || 0);
  }

  function onChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function updateFeedRow(index, key, value) {
    setFeedRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [key]: value } : r))
    );
  }

  function addFeedRow() {
    setFeedRows((prev) => [
      ...prev,
      {
        sourceType: "RECOVERY",
        sourceBatchId: "",
        materialType: "REWORK_GRANULES",
        qtyKg: "",
        remarks: "",
      },
    ]);
  }

  function removeFeedRow(index) {
    setFeedRows((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.length > 0 ? updated : [{ ...blankFeedRow }];
    });
  }

  function cleanFeedRows() {
    return feedRows.filter((r) => r.materialType && n(r.qtyKg) > 0);
  }

  function feedTotalKg() {
    return cleanFeedRows().reduce((s, r) => s + n(r.qtyKg), 0);
  }

  function feedSummary() {
    return cleanFeedRows()
      .map((r) => {
        const ref = r.sourceBatchId ? ` (${r.sourceBatchId})` : "";
        return `${r.materialType}${ref}: ${r.qtyKg} Kg`;
      })
      .join(" + ");
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

  const washLoss =
    n(form.dustKg) +
    n(form.sinkMaterialKg) +
    n(form.microPlasticKg) +
    n(form.wrappersKg) +
    n(form.sludgeKg) +
    n(form.raffiaKg);

  const washRecovery =
    n(form.washInputKg) > 0
      ? ((n(form.washedOutputKg) / n(form.washInputKg)) * 100).toFixed(2)
      : "";

  const washVariance =
    n(form.washInputKg) - n(form.washedOutputKg) - washLoss;

  const sorterRecoverable =
    n(form.whiteSortedKg) +
    n(form.allMixSortedKg) +
    n(form.commodityKg) +
    n(form.whiteGreyKg);

  const sorterRecovery =
    n(form.sorterInputKg) > 0
      ? ((sorterRecoverable / n(form.sorterInputKg)) * 100).toFixed(2)
      : "";

  const sorterVariance =
    n(form.sorterInputKg) - sorterRecoverable - n(form.sorterRejectKg);

  const totalFeedKg = feedTotalKg();

  const extrusionRecoverable =
    n(form.fgOutputKg) +
    n(form.lumpsKg) +
    n(form.purgingKg) +
    n(form.reworkGranulesKg);

  const extrusionNonRecoverable =
    n(form.rejectKg) +
    n(form.vacuumRejectKg) +
    n(form.meshRejectKg) +
    n(form.floorSpillageKg);

  const extrusionTotalOutput = extrusionRecoverable + extrusionNonRecoverable;

  const extrusionVariance = totalFeedKg - extrusionTotalOutput;

  const extrusionRecovery =
    totalFeedKg > 0 ? ((n(form.fgOutputKg) / totalFeedKg) * 100).toFixed(2) : "";

  const recoveryFeedKg = cleanFeedRows()
    .filter((r) => isRecoveryMaterial(r.materialType))
    .reduce((s, r) => s + n(r.qtyKg), 0);

  const virginFeedKg = cleanFeedRows()
    .filter((r) => r.materialType === "VIRGIN_PP")
    .reduce((s, r) => s + n(r.qtyKg), 0);

  const batteryFeedKg = cleanFeedRows()
    .filter((r) => r.materialType === "BATTERY_REGRIND")
    .reduce((s, r) => s + n(r.qtyKg), 0);

  const additiveFeedKg = cleanFeedRows()
    .filter((r) => isAdditiveMaterial(r.materialType))
    .reduce((s, r) => s + n(r.qtyKg), 0);

  const recoveryMaterialPercent =
    totalFeedKg > 0 ? ((recoveryFeedKg / totalFeedKg) * 100).toFixed(2) : "";

  const virginRatioPercent =
    totalFeedKg > 0 ? ((virginFeedKg / totalFeedKg) * 100).toFixed(2) : "";

  const batteryRatioPercent =
    totalFeedKg > 0 ? ((batteryFeedKg / totalFeedKg) * 100).toFixed(2) : "";

  const additiveRatioPercent =
    totalFeedKg > 0 ? ((additiveFeedKg / totalFeedKg) * 100).toFixed(2) : "";

  const overallQualityRating = (
    (n(form.visualCleanlinessRating) +
      n(form.moistureRating) +
      n(form.odourRating) +
      n(form.blackSpecsRating) +
      n(form.colorConsistencyRating)) /
    5
  ).toFixed(2);

  function commonQualityPayload() {
    return {
      machineRunningHours: form.machineRunningHours,
      downtimeHours: form.downtimeHours,
      downtimeReason: form.downtimeReason,
      visualCleanlinessRating: form.visualCleanlinessRating,
      moistureRating: form.moistureRating,
      odourRating: form.odourRating,
      blackSpecsRating: form.blackSpecsRating,
      colorConsistencyRating: form.colorConsistencyRating,
      overallQualityRating,
      qcRemarks: form.qcRemarks,
    };
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      let washBatchId = "";
      let sortingBatchId = "";

      if (n(form.washInputKg) > 0) {
        const wash = await apiCall({
          fn: "wash.add",
          date: form.date,
          shift: form.shift,
          machine: form.machineWash,
          inputMaterial: form.washInputMaterial,
          inputWeightKg: form.washInputKg,
          washedOutputKg: form.washedOutputKg,
          dustKg: form.dustKg,
          sinkMaterialKg: form.sinkMaterialKg,
          microPlasticKg: form.microPlasticKg,
          wrappersKg: form.wrappersKg,
          sludgeKg: form.sludgeKg,
          raffiaKg: form.raffiaKg,
          estimatedRecoveryPercent: washRecovery,
          washVarianceKg: washVariance,
          sortingRequired: n(form.sorterInputKg) > 0 ? "YES" : "NO",
          nextProcess: n(form.sorterInputKg) > 0 ? "Colour Sorting" : "Extrusion",
          status:
            n(form.sorterInputKg) > 0
              ? "READY_FOR_SORTING"
              : "WASH_COMPLETED",
          operatorName: form.washOperatorName,
          supervisorName: form.washSupervisorName,
          remarks: form.remarks,
          createdBy: "Production Screen",
          ...commonQualityPayload(),
        });

        washBatchId = wash.washBatchId || "";
      }

      if (n(form.sorterInputKg) > 0) {
        const sorting = await apiCall({
          fn: "sorting.add",
          sourceWashBatchId: washBatchId,
          date: form.date,
          shift: form.shift,
          machine: form.machineSorter,
          inputMaterial: form.sorterInputMaterial || form.washInputMaterial,
          inputWeightKg: form.sorterInputKg,
          acceptedQtyKg: sorterRecoverable,
          whiteSortedKg: form.whiteSortedKg,
          allMixSortedKg: form.allMixSortedKg,
          commodityKg: form.commodityKg,
          whiteGreyKg: form.whiteGreyKg,
          rejectedQtyKg: form.sorterRejectKg,
          sorterVarianceKg: sorterVariance,
          recoveryPercent: sorterRecovery,
          status: "READY_FOR_EXTRUSION",
          nextProcess: "Extrusion",
          operatorName: form.sorterOperatorName,
          supervisorName: form.sorterSupervisorName,
          remarks: form.remarks,
          createdBy: "Production Screen",
          ...commonQualityPayload(),
        });

        sortingBatchId = sorting.sortingBatchId || "";
      }

      const finalFeedRows = cleanFeedRows();

      if (totalFeedKg > 0 || n(form.fgOutputKg) > 0) {
        if (finalFeedRows.length === 0) {
          setMessage("Add at least one extruder feed material.");
          return;
        }

        await apiCall({
          fn: "extrusion.add",
          date: form.date,
          shift: form.shift,
          periodMonth: currentMonth,
          machine: form.machineExtruder,
          sourceType: "PRODUCTION_SHIFT",
          sourceSortingBatchId: sortingBatchId,
          sourceWashBatchId: washBatchId,
          inputMaterial: feedSummary(),
          inputWeightKg: totalFeedKg,
          feedComposition: JSON.stringify(finalFeedRows),
          totalInputKg: totalFeedKg,
          fgOutputKg: form.fgOutputKg,
          lumpsKg: form.lumpsKg,
          purgingKg: form.purgingKg,
          reworkGranulesKg: form.reworkGranulesKg,
          rejectKg: form.rejectKg,
          vacuumRejectKg: form.vacuumRejectKg,
          meshRejectKg: form.meshRejectKg,
          floorSpillageKg: form.floorSpillageKg,
          totalRecoverableKg: extrusionRecoverable,
          totalNonRecoverableKg: extrusionNonRecoverable,
          totalOutputKg: extrusionTotalOutput,
          varianceKg: extrusionVariance,
          recoveryPercent: extrusionRecovery,
          recoveryMaterialPercent,
          virginRatioPercent,
          batteryRatioPercent,
          additiveRatioPercent,
          productionGrade: form.productionGrade,
          operatorName: form.extruderOperatorName,
          supervisorName: form.extruderSupervisorName,
          remarks: form.remarks,
          nextProcess: "Dispatch",
          status: "READY_FOR_DISPATCH",
          createdBy: "Production Screen",
          ...commonQualityPayload(),
        });
      }

      if (
        n(form.washInputKg) <= 0 &&
        n(form.sorterInputKg) <= 0 &&
        totalFeedKg <= 0 &&
        n(form.fgOutputKg) <= 0
      ) {
        setMessage("Enter wash, sorting or extrusion data before saving.");
        return;
      }

      setMessage("Shift production entry saved successfully.");
      setForm(blank);
      setFeedRows([{ ...blankFeedRow }]);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ color: "#0f766e", marginBottom: 8 }}>Production Entry</h1>

      <div style={infoBox}>
        One shift entry screen for Washline, Colour Sorter, Extrusion, QC and
        downtime. Use <b>+ Add Feed Material</b> when reuse, rework, virgin,
        battery or additives are added.
      </div>

      {message && <div style={messageBox}>{message}</div>}

      <form onSubmit={submit}>
        <FormSection title="Batch Information">
          <Field
            label="Date"
            name="date"
            value={form.date}
            onChange={onChange}
            type="date"
          />

          <SelectField
            label="Shift"
            name="shift"
            value={form.shift}
            onChange={onChange}
            options={["A", "B", "C"]}
          />
        </FormSection>

        <FormSection title="Washline">
          <Field label="Operator" name="washOperatorName" value={form.washOperatorName} onChange={onChange} />
          <Field label="Supervisor" name="washSupervisorName" value={form.washSupervisorName} onChange={onChange} />
          <SelectField label="Machine" name="machineWash" value={form.machineWash} onChange={onChange} options={machines.map((m) => m.machineName)} />
          <SelectField label="Material" name="washInputMaterial" value={form.washInputMaterial} onChange={onChange} options={categories.map((c) => c.categoryName)} />
          <Field label="Input Kg" name="washInputKg" value={form.washInputKg} onChange={onChange} />
          <Field label="Washed Output Kg" name="washedOutputKg" value={form.washedOutputKg} onChange={onChange} />
          <Field label="Dust Kg" name="dustKg" value={form.dustKg} onChange={onChange} />
          <Field label="Sink Material Kg" name="sinkMaterialKg" value={form.sinkMaterialKg} onChange={onChange} />
          <Field label="Micro Plastic Kg" name="microPlasticKg" value={form.microPlasticKg} onChange={onChange} />
          <Field label="Wrappers Kg" name="wrappersKg" value={form.wrappersKg} onChange={onChange} />
          <Field label="Sludge Kg" name="sludgeKg" value={form.sludgeKg} onChange={onChange} />
          <Field label="Raffia Kg" name="raffiaKg" value={form.raffiaKg} onChange={onChange} />
          <Field label="Wash Recovery %" value={washRecovery} readOnly />
          <Field label="Wash Variance Kg" value={washVariance.toFixed(2)} readOnly />
        </FormSection>

        <FormSection title="Colour Sorter">
          <Field label="Operator" name="sorterOperatorName" value={form.sorterOperatorName} onChange={onChange} />
          <Field label="Supervisor" name="sorterSupervisorName" value={form.sorterSupervisorName} onChange={onChange} />
          <SelectField label="Machine" name="machineSorter" value={form.machineSorter} onChange={onChange} options={machines.map((m) => m.machineName)} />
          <Field label="Sorter Input Material" name="sorterInputMaterial" value={form.sorterInputMaterial} onChange={onChange} />
          <Field label="Input Kg" name="sorterInputKg" value={form.sorterInputKg} onChange={onChange} />
          <Field label="White Kg" name="whiteSortedKg" value={form.whiteSortedKg} onChange={onChange} />
          <Field label="All Mix Kg" name="allMixSortedKg" value={form.allMixSortedKg} onChange={onChange} />
          <Field label="Commodity Kg" name="commodityKg" value={form.commodityKg} onChange={onChange} />
          <Field label="White Grey Kg" name="whiteGreyKg" value={form.whiteGreyKg} onChange={onChange} />
          <Field label="Reject Kg" name="sorterRejectKg" value={form.sorterRejectKg} onChange={onChange} />
          <Field label="Sorter Recovery %" value={sorterRecovery} readOnly />
          <Field label="Sorter Variance Kg" value={sorterVariance.toFixed(2)} readOnly />
        </FormSection>

        <FormSection title="Extrusion">
          <Field label="Operator" name="extruderOperatorName" value={form.extruderOperatorName} onChange={onChange} />
          <Field label="Supervisor" name="extruderSupervisorName" value={form.extruderSupervisorName} onChange={onChange} />
          <SelectField label="Machine" name="machineExtruder" value={form.machineExtruder} onChange={onChange} options={machines.map((m) => m.machineName)} />
          <Field label="Production Grade" name="productionGrade" value={form.productionGrade} onChange={onChange} />

          <div style={{ gridColumn: "1 / -1", overflowX: "auto" }}>
            <div style={miniTitle}>Extruder Feed Composition</div>

            <table style={feedTable}>
              <thead>
                <tr style={feedHeader}>
                  <th style={feedTh}>Source Type</th>
                  <th style={feedTh}>Batch / Reference</th>
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
                      <select value={r.sourceType} onChange={(e) => updateFeedRow(i, "sourceType", e.target.value)} style={selectStyle}>
                        <option value="SORTING">Sorting</option>
                        <option value="WASH">Wash</option>
                        <option value="RECOVERY">Recovery / Rework</option>
                        <option value="VIRGIN">Virgin</option>
                        <option value="ADDITIVE">Additive</option>
                        <option value="MANUAL">Manual</option>
                      </select>
                    </td>

                    <td style={feedTd}>
                      <input value={r.sourceBatchId} onChange={(e) => updateFeedRow(i, "sourceBatchId", e.target.value)} style={inputStyle} />
                    </td>

                    <td style={feedTd}>
                      <select value={r.materialType} onChange={(e) => updateFeedRow(i, "materialType", e.target.value)} style={selectStyle}>
                        {feedMaterials.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </td>

                    <td style={feedTd}>
                      <input type="number" value={r.qtyKg} onChange={(e) => updateFeedRow(i, "qtyKg", e.target.value)} style={inputStyle} />
                    </td>

                    <td style={feedTd}>
                      <input value={r.remarks} onChange={(e) => updateFeedRow(i, "remarks", e.target.value)} style={inputStyle} />
                    </td>

                    <td style={feedTd}>
                      <button type="button" onClick={() => removeFeedRow(i)} style={removeButton}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button type="button" onClick={addFeedRow} style={addButton}>
              + Add Feed Material
            </button>
          </div>

          <Field label="Total Feed Kg" value={totalFeedKg.toFixed(2)} readOnly />
          <Field label="Recovery / Rework %" value={recoveryMaterialPercent} readOnly />
          <Field label="Virgin %" value={virginRatioPercent} readOnly />
          <Field label="Battery %" value={batteryRatioPercent} readOnly />
          <Field label="Additive %" value={additiveRatioPercent} readOnly />
          <TextAreaField label="Feed Summary" value={feedSummary()} readOnly />

          <Field label="FG Output Kg" name="fgOutputKg" value={form.fgOutputKg} onChange={onChange} />
          <Field label="Lumps Kg" name="lumpsKg" value={form.lumpsKg} onChange={onChange} />
          <Field label="Purging Kg" name="purgingKg" value={form.purgingKg} onChange={onChange} />
          <Field label="Rework Granules Kg" name="reworkGranulesKg" value={form.reworkGranulesKg} onChange={onChange} />
          <Field label="Reject Kg" name="rejectKg" value={form.rejectKg} onChange={onChange} />
          <Field label="Vacuum Reject Kg" name="vacuumRejectKg" value={form.vacuumRejectKg} onChange={onChange} />
          <Field label="Mesh Reject Kg" name="meshRejectKg" value={form.meshRejectKg} onChange={onChange} />
          <Field label="Floor Spillage Kg" name="floorSpillageKg" value={form.floorSpillageKg} onChange={onChange} />
          <Field label="FG Recovery %" value={extrusionRecovery} readOnly />
          <Field label="Extrusion Variance Kg" value={extrusionVariance.toFixed(2)} readOnly />
        </FormSection>

        <FormSection title="QC Ratings">
          <SelectField label="Visual Cleanliness" name="visualCleanlinessRating" value={form.visualCleanlinessRating} onChange={onChange} options={["1", "2", "3", "4", "5"]} />
          <SelectField label="Moisture" name="moistureRating" value={form.moistureRating} onChange={onChange} options={["1", "2", "3", "4", "5"]} />
          <SelectField label="Odour" name="odourRating" value={form.odourRating} onChange={onChange} options={["1", "2", "3", "4", "5"]} />
          <SelectField label="Black Specs" name="blackSpecsRating" value={form.blackSpecsRating} onChange={onChange} options={["1", "2", "3", "4", "5"]} />
          <SelectField label="Color Consistency" name="colorConsistencyRating" value={form.colorConsistencyRating} onChange={onChange} options={["1", "2", "3", "4", "5"]} />
          <Field label="Overall Quality Rating" value={overallQualityRating} readOnly />
          <TextAreaField label="QC Remarks" name="qcRemarks" value={form.qcRemarks} onChange={onChange} />
        </FormSection>

        <FormSection title="Downtime & Remarks">
          <Field label="Machine Running Hours" name="machineRunningHours" value={form.machineRunningHours} onChange={onChange} />
          <Field label="Downtime Hours" name="downtimeHours" value={form.downtimeHours} onChange={onChange} />
          <TextAreaField label="Downtime Reason" name="downtimeReason" value={form.downtimeReason} onChange={onChange} />
          <TextAreaField label="Remarks" name="remarks" value={form.remarks} onChange={onChange} />
        </FormSection>

        <div style={{ marginTop: 25 }}>
          <button type="submit" disabled={saving} style={saveButton}>
            {saving ? "Saving..." : "Save Shift Production Entry"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field(props) {
  const { label, readOnly, ...inputProps } = props;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={labelStyle}>{label}</label>
      <input
        {...inputProps}
        readOnly={readOnly}
        style={{
          ...inputStyle,
          background: readOnly ? "#f8fafc" : "white",
          fontWeight: readOnly ? 700 : 400,
        }}
      />
    </div>
  );
}

function TextAreaField({ label, name, value, onChange, readOnly }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={labelStyle}>{label}</label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        style={{
          ...textareaStyle,
          background: readOnly ? "#f8fafc" : "white",
          fontWeight: readOnly ? 700 : 400,
        }}
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={labelStyle}>{label}</label>
      <select name={name} value={value} onChange={onChange} style={selectStyle}>
        <option value="">Select</option>
        {(options || []).map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

const labelStyle = {
  fontSize: 12,
  fontWeight: 700,
  color: "#334155",
};

const infoBox = {
  background: "#ecfeff",
  color: "#155e75",
  border: "1px solid #a5f3fc",
  padding: 12,
  borderRadius: 10,
  marginBottom: 16,
  fontSize: 13,
};

const messageBox = {
  padding: 12,
  marginBottom: 15,
  borderRadius: 8,
  background: "#ecfdf5",
  border: "1px solid #86efac",
  color: "#166534",
  fontWeight: 700,
};

const inputStyle = {
  width: "100%",
  padding: 8,
  border: "1px solid #d1d5db",
  borderRadius: 6,
  boxSizing: "border-box",
};

const selectStyle = {
  ...inputStyle,
};

const textareaStyle = {
  ...inputStyle,
  minHeight: 80,
};

const saveButton = {
  background: "#0f766e",
  color: "white",
  border: "none",
  padding: "12px 24px",
  borderRadius: 8,
  fontWeight: 700,
  cursor: "pointer",
};

const miniTitle = {
  fontWeight: 800,
  color: "#0f766e",
  marginBottom: 10,
};

const feedTable = {
  width: "100%",
  borderCollapse: "collapse",
  marginBottom: 10,
  minWidth: 1050,
};

const feedHeader = {
  background: "#0f766e",
  color: "white",
};

const feedTh = {
  padding: 10,
  textAlign: "left",
  fontSize: 12,
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