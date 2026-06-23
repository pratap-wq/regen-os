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

    machineWash: "",
    machineSorter: "",

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

    visualCleanlinessRating: "5",
    moistureRating: "5",
    odourRating: "5",
    blackSpecsRating: "5",
    colorConsistencyRating: "5",
    qcRemarks: "",

    remarks: "",
  };

  const [form, setForm] = useState(blank);
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
        await apiCall({
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
      }

      if (n(form.washInputKg) <= 0 && n(form.sorterInputKg) <= 0) {
        setMessage("Enter wash or sorting data before saving.");
        return;
      }

      setMessage(
        "Production saved. Enter extruder feed, additional material, recovery/rework and FG output in Extrusion Batches."
      );

      setForm(blank);
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
        This screen records only <b>Washline</b>, <b>Colour Sorting</b>, QC and
        downtime. Extruder feed composition, additional material, recovery,
        rework, additives and FG output must be entered in{" "}
        <b>Extrusion Batches</b>.
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
            label="Washed Output Kg"
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
            label="Sink Material Kg"
            name="sinkMaterialKg"
            value={form.sinkMaterialKg}
            onChange={onChange}
          />

          <Field
            label="Micro Plastic Kg"
            name="microPlasticKg"
            value={form.microPlasticKg}
            onChange={onChange}
          />

          <Field
            label="Wrappers Kg"
            name="wrappersKg"
            value={form.wrappersKg}
            onChange={onChange}
          />

          <Field
            label="Sludge Kg"
            name="sludgeKg"
            value={form.sludgeKg}
            onChange={onChange}
          />

          <Field
            label="Raffia Kg"
            name="raffiaKg"
            value={form.raffiaKg}
            onChange={onChange}
          />

          <Field label="Wash Recovery %" value={washRecovery} readOnly />

          <Field
            label="Wash Variance Kg"
            value={washVariance.toFixed(2)}
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
            label="Sorter Input Material"
            name="sorterInputMaterial"
            value={form.sorterInputMaterial}
            onChange={onChange}
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

          <Field label="Sorter Recovery %" value={sorterRecovery} readOnly />

          <Field
            label="Sorter Variance Kg"
            value={sorterVariance.toFixed(2)}
            readOnly
          />
        </FormSection>

        <FormSection title="QC Ratings">
          <SelectField
            label="Visual Cleanliness"
            name="visualCleanlinessRating"
            value={form.visualCleanlinessRating}
            onChange={onChange}
            options={["1", "2", "3", "4", "5"]}
          />

          <SelectField
            label="Moisture"
            name="moistureRating"
            value={form.moistureRating}
            onChange={onChange}
            options={["1", "2", "3", "4", "5"]}
          />

          <SelectField
            label="Odour"
            name="odourRating"
            value={form.odourRating}
            onChange={onChange}
            options={["1", "2", "3", "4", "5"]}
          />

          <SelectField
            label="Black Specs"
            name="blackSpecsRating"
            value={form.blackSpecsRating}
            onChange={onChange}
            options={["1", "2", "3", "4", "5"]}
          />

          <SelectField
            label="Color Consistency"
            name="colorConsistencyRating"
            value={form.colorConsistencyRating}
            onChange={onChange}
            options={["1", "2", "3", "4", "5"]}
          />

          <Field
            label="Overall Quality Rating"
            value={overallQualityRating}
            readOnly
          />

          <TextAreaField
            label="QC Remarks"
            name="qcRemarks"
            value={form.qcRemarks}
            onChange={onChange}
          />
        </FormSection>

        <FormSection title="Downtime & Remarks">
          <Field
            label="Machine Running Hours"
            name="machineRunningHours"
            value={form.machineRunningHours}
            onChange={onChange}
          />

          <Field
            label="Downtime Hours"
            name="downtimeHours"
            value={form.downtimeHours}
            onChange={onChange}
          />

          <TextAreaField
            label="Downtime Reason"
            name="downtimeReason"
            value={form.downtimeReason}
            onChange={onChange}
          />

          <TextAreaField
            label="Remarks"
            name="remarks"
            value={form.remarks}
            onChange={onChange}
          />
        </FormSection>

        <div style={{ marginTop: 25 }}>
          <button type="submit" disabled={saving} style={saveButton}>
            {saving ? "Saving..." : "Save Production Entry"}
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
          padding: 8,
          border: "1px solid #d1d5db",
          borderRadius: 6,
          background: readOnly ? "#f8fafc" : "white",
          fontWeight: readOnly ? 700 : 400,
        }}
      />
    </div>
  );
}

function TextAreaField({ label, name, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={labelStyle}>{label}</label>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        style={textareaStyle}
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
          <option key={o} value={o}>
            {o}
          </option>
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

const saveButton = {
  background: "#0f766e",
  color: "white",
  border: "none",
  padding: "12px 24px",
  borderRadius: 8,
  fontWeight: 700,
  cursor: "pointer",
};

const selectStyle = {
  padding: 8,
  border: "1px solid #d1d5db",
  borderRadius: 6,
};

const textareaStyle = {
  padding: 8,
  border: "1px solid #d1d5db",
  borderRadius: 6,
  minHeight: 80,
};