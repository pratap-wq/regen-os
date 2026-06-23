import { useEffect, useState } from "react";
import { apiCall } from "../api/api";
import FormSection from "../components/FormSection";

export default function Production() {
  const today = new Date().toISOString().split("T")[0];

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

    primaryMaterial: "",
    primaryMaterialKg: "",
    recoveryMaterial: "",
    recoveryMaterialKg: "",
    reworkMaterial: "",
    reworkMaterialKg: "",

    fgOutputKg: "",
    lumpsKg: "",
    reworkKg: "",
    meshRejectKg: "",
    compactorDustKg: "",
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

  const primaryMaterials = [
    "White Flakes",
    "Milky Flakes",
    "Colour Flakes",
    "Grey Flakes",
    "Commodity Flakes",
    "All Mix Flakes",
    "White Sorted Flakes",
    "Colour Sorted Flakes",
    "Imported Washed Flakes",
    "Imported Sorted Flakes",
  ];

  const recoveryMaterials = [
    "Flotation Tank Regrinds",
    "Sink Material Regrinds",
    "Float Material Regrinds",
    "Colour Sorter Reject Regrinds",
    "Commodity Regrinds",
    "Mixed Recovery Material",
  ];

  const reworkMaterials = [
    "Extruder Lumps",
    "Startup Purging",
    "Screen Change Rejects",
    "Rework White Granules",
    "Rework Milky Granules",
    "Rework Colour Granules",
    "Rework Grey Granules",
    "Mixed Reprocess Material",
  ];

  const [form, setForm] = useState(blank);
  const [machines, setMachines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadMasters();
  }, []);

  async function loadMasters() {
    const [machineRes, catRes] = await Promise.all([
      apiCall({ fn: "machines.list" }),
      apiCall({ fn: "categories.list" }),
    ]);

    setMachines(machineRes.rows || []);
    setCategories(catRes.rows || []);
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

  const washRecovery =
    n(form.washInputKg) > 0
      ? ((n(form.washedOutputKg) / n(form.washInputKg)) * 100).toFixed(2)
      : "";

  const washLoss =
    n(form.dustKg) +
    n(form.sinkMaterialKg) +
    n(form.microPlasticKg) +
    n(form.wrappersKg) +
    n(form.sludgeKg) +
    n(form.raffiaKg);

  const washVariance =
    n(form.washInputKg) -
    n(form.washedOutputKg) -
    washLoss;

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
    n(form.sorterInputKg) -
    sorterRecoverable -
    n(form.sorterRejectKg);

  const totalExtruderInputKg =
    n(form.primaryMaterialKg) +
    n(form.recoveryMaterialKg) +
    n(form.reworkMaterialKg);

  const extruderLoss =
    n(form.lumpsKg) +
    n(form.reworkKg) +
    n(form.meshRejectKg) +
    n(form.compactorDustKg) +
    n(form.floorSpillageKg);

  const extruderRecovery =
    totalExtruderInputKg > 0
      ? ((n(form.fgOutputKg) / totalExtruderInputKg) * 100).toFixed(2)
      : "";

  const extruderVariance =
    totalExtruderInputKg -
    n(form.fgOutputKg) -
    extruderLoss;

  const recoveryMaterialPercent =
    totalExtruderInputKg > 0
      ? (
          ((n(form.recoveryMaterialKg) + n(form.reworkMaterialKg)) /
            totalExtruderInputKg) *
          100
        ).toFixed(2)
      : "";

  const overallQualityRating = (
    (
      n(form.visualCleanlinessRating) +
      n(form.moistureRating) +
      n(form.odourRating) +
      n(form.blackSpecsRating) +
      n(form.colorConsistencyRating)
    ) / 5
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

  function extruderMaterialText() {
    const parts = [];

    if (form.primaryMaterial) {
      parts.push(`${form.primaryMaterial}: ${form.primaryMaterialKg || 0} Kg`);
    }

    if (form.recoveryMaterial) {
      parts.push(`${form.recoveryMaterial}: ${form.recoveryMaterialKg || 0} Kg`);
    }

    if (form.reworkMaterial) {
      parts.push(`${form.reworkMaterial}: ${form.reworkMaterialKg || 0} Kg`);
    }

    return parts.join(" + ");
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
          sortingRequired: n(form.sorterInputKg) > 0 ? "YES" : "NO",
          nextProcess: n(form.sorterInputKg) > 0 ? "Colour Sorting" : "Extrusion",
          status: n(form.sorterInputKg) > 0 ? "READY_FOR_SORTING" : "WASH_COMPLETED",
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

      if (totalExtruderInputKg > 0) {
        await apiCall({
          fn: "extrusion.add",
          sourceType: sortingBatchId ? "SORTING" : "DIRECT",
          sourceSortingBatchId: sortingBatchId,
          date: form.date,
          shift: form.shift,
          machine: form.machineExtruder,
          inputMaterial: extruderMaterialText(),
          inputWeightKg: totalExtruderInputKg,
          primaryMaterial: form.primaryMaterial,
          primaryMaterialKg: form.primaryMaterialKg,
          recoveryMaterial: form.recoveryMaterial,
          recoveryMaterialKg: form.recoveryMaterialKg,
          reworkMaterial: form.reworkMaterial,
          reworkMaterialKg: form.reworkMaterialKg,
          recoveryMaterialPercent,
          fgOutputKg: form.fgOutputKg,
          lumpsKg: form.lumpsKg,
          reworkGranulesKg: form.reworkKg,
          meshRejectKg: form.meshRejectKg,
          dustKg: form.compactorDustKg,
          floorSpillageKg: form.floorSpillageKg,
          productionGrade: form.productionGrade,
          recoveryPercent: extruderRecovery,
          status: "READY_FOR_DISPATCH",
          nextProcess: "Dispatch",
          operatorName: form.extruderOperatorName,
          supervisorName: form.extruderSupervisorName,
          remarks: form.remarks,
          createdBy: "Production Screen",
          ...commonQualityPayload(),
        });
      }

      setMessage("Production saved successfully.");
      setForm(blank);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ color: "#0f766e", marginBottom: 20 }}>
        Production Entry
      </h1>

      {message && (
        <div
          style={{
            padding: 12,
            marginBottom: 15,
            borderRadius: 8,
            background: "#ecfdf5",
            border: "1px solid #86efac",
          }}
        >
          {message}
        </div>
      )}

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
          <Field
            label="Operator"
            name="washOperatorName"
            value={form.washOperatorName}
            onChange={onChange}
          />

          <Field
            label="Supervisor"
            name="washSupervisorName"
            value={form.washSupervisorName}
            onChange={onChange}
          />

          <SelectField
            label="Machine"
            name="machineWash"
            value={form.machineWash}
            onChange={onChange}
            options={machines.map((m) => m.machineName)}
          />

          <SelectField
            label="Material"
            name="washInputMaterial"
            value={form.washInputMaterial}
            onChange={onChange}
            options={categories.map((c) => c.categoryName)}
          />

          <Field
            label="Input Kg"
            name="washInputKg"
            value={form.washInputKg}
            onChange={onChange}
          />

          <Field
            label="Output Kg"
            name="washedOutputKg"
            value={form.washedOutputKg}
            onChange={onChange}
          />

          <Field
            label="Dust Kg"
            name="dustKg"
            value={form.dustKg}
            onChange={onChange}
          />

          <Field
            label="Sink Kg"
            name="sinkMaterialKg"
            value={form.sinkMaterialKg}
            onChange={onChange}
          />

          <Field
            label="Recovery %"
            value={washRecovery}
            readOnly
          />
        </FormSection>

        <FormSection title="Colour Sorter">
          <Field
            label="Operator"
            name="sorterOperatorName"
            value={form.sorterOperatorName}
            onChange={onChange}
          />

          <Field
            label="Supervisor"
            name="sorterSupervisorName"
            value={form.sorterSupervisorName}
            onChange={onChange}
          />

          <SelectField
            label="Machine"
            name="machineSorter"
            value={form.machineSorter}
            onChange={onChange}
            options={machines.map((m) => m.machineName)}
          />

          <Field
            label="Input Kg"
            name="sorterInputKg"
            value={form.sorterInputKg}
            onChange={onChange}
          />

          <Field
            label="White Kg"
            name="whiteSortedKg"
            value={form.whiteSortedKg}
            onChange={onChange}
          />

          <Field
            label="All Mix Kg"
            name="allMixSortedKg"
            value={form.allMixSortedKg}
            onChange={onChange}
          />

          <Field
            label="Commodity Kg"
            name="commodityKg"
            value={form.commodityKg}
            onChange={onChange}
          />

          <Field
            label="White Grey Kg"
            name="whiteGreyKg"
            value={form.whiteGreyKg}
            onChange={onChange}
          />

          <Field
            label="Reject Kg"
            name="sorterRejectKg"
            value={form.sorterRejectKg}
            onChange={onChange}
          />

          <Field
            label="Recovery %"
            value={sorterRecovery}
            readOnly
          />
        </FormSection>

        <FormSection title="Extruder Feed Composition">
          <SelectField
            label="Primary Material"
            name="primaryMaterial"
            value={form.primaryMaterial}
            onChange={onChange}
            options={primaryMaterials}
          />

          <Field
            label="Primary Kg"
            name="primaryMaterialKg"
            value={form.primaryMaterialKg}
            onChange={onChange}
          />

          <SelectField
            label="Recovery Material"
            name="recoveryMaterial"
            value={form.recoveryMaterial}
            onChange={onChange}
            options={recoveryMaterials}
          />

          <Field
            label="Recovery Kg"
            name="recoveryMaterialKg"
            value={form.recoveryMaterialKg}
            onChange={onChange}
          />

          <SelectField
            label="Rework Material"
            name="reworkMaterial"
            value={form.reworkMaterial}
            onChange={onChange}
            options={reworkMaterials}
          />

          <Field
            label="Rework Kg"
            name="reworkMaterialKg"
            value={form.reworkMaterialKg}
            onChange={onChange}
          />
        </FormSection>

        <FormSection title="Extrusion">
          <Field
            label="Operator"
            name="extruderOperatorName"
            value={form.extruderOperatorName}
            onChange={onChange}
          />

          <Field
            label="Supervisor"
            name="extruderSupervisorName"
            value={form.extruderSupervisorName}
            onChange={onChange}
          />

          <SelectField
            label="Machine"
            name="machineExtruder"
            value={form.machineExtruder}
            onChange={onChange}
            options={machines.map((m) => m.machineName)}
          />

          <Field
            label="Total Feed Kg"
            value={totalExtruderInputKg}
            readOnly
          />

          <Field
            label="FG Output Kg"
            name="fgOutputKg"
            value={form.fgOutputKg}
            onChange={onChange}
          />

          <Field
            label="Lumps Kg"
            name="lumpsKg"
            value={form.lumpsKg}
            onChange={onChange}
          />

          <Field
            label="Rework Kg"
            name="reworkKg"
            value={form.reworkKg}
            onChange={onChange}
          />

          <Field
            label="Recovery %"
            value={extruderRecovery}
            readOnly
          />

          <Field
            label="Reuse %"
            value={recoveryMaterialPercent}
            readOnly
          />

          <Field
            label="Grade"
            name="productionGrade"
            value={form.productionGrade}
            onChange={onChange}
          />
        </FormSection>

        <div style={{ marginTop: 25 }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              background: "#0f766e",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: 8,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {saving ? "Saving..." : "Save Production Batch"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field(props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label>{props.label}</label>
      <input
        {...props}
        style={{
          padding: 8,
          border: "1px solid #d1d5db",
          borderRadius: 6,
        }}
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label>{label}</label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        style={{
          padding: 8,
          border: "1px solid #d1d5db",
          borderRadius: 6,
        }}
      >
        <option value="">Select</option>

        {(options || []).map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}