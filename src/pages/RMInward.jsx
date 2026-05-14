import { useState } from "react";
import { apiCall } from "../api/api";

export default function RMInward() {
  const [form, setForm] = useState({
    date: "",
    supplier: "",
    vehicleNo: "",
    material: "",
    grossWeight: "",
    tareWeight: "",
    netWeight: "",
    moisture: "",
    contamination: "",
    estimatedRecovery: "",
    ratePerKg: "",
    remarks: "",
    createdBy: "Pratap",
  });

  const [status, setStatus] = useState("");

  function onChange(e) {
    setForm((p) => ({
      ...p,
      [e.target.name]: e.target.value,
    }));
  }

  async function submit(e) {
    e.preventDefault();

    try {
      const res = await apiCall({
        fn: "rm.add",
        ...form,
      });

      if (res.ok) {
        setStatus("RM inward saved successfully");

        setForm({
          date: "",
          supplier: "",
          vehicleNo: "",
          material: "",
          grossWeight: "",
          tareWeight: "",
          netWeight: "",
          moisture: "",
          contamination: "",
          estimatedRecovery: "",
          ratePerKg: "",
          remarks: "",
          createdBy: "Pratap",
        });
      } else {
        setStatus(res.error || "Error");
      }
    } catch (err) {
      setStatus(err.message);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>RM Inward</h1>

      <form
        onSubmit={submit}
        style={{
          display: "grid",
          gap: 10,
          maxWidth: 600,
        }}
      >
        <input name="date" type="date" value={form.date} onChange={onChange} placeholder="Date" />
        <input name="supplier" value={form.supplier} onChange={onChange} placeholder="Supplier" />
        <input name="vehicleNo" value={form.vehicleNo} onChange={onChange} placeholder="Vehicle No" />
        <input name="material" value={form.material} onChange={onChange} placeholder="Material" />
        <input name="grossWeight" value={form.grossWeight} onChange={onChange} placeholder="Gross Weight" />
        <input name="tareWeight" value={form.tareWeight} onChange={onChange} placeholder="Tare Weight" />
        <input name="netWeight" value={form.netWeight} onChange={onChange} placeholder="Net Weight" />
        <input name="moisture" value={form.moisture} onChange={onChange} placeholder="Moisture %" />
        <input name="contamination" value={form.contamination} onChange={onChange} placeholder="Contamination %" />
        <input name="estimatedRecovery" value={form.estimatedRecovery} onChange={onChange} placeholder="Estimated Recovery %" />
        <input name="ratePerKg" value={form.ratePerKg} onChange={onChange} placeholder="Rate Per Kg" />

        <textarea
          name="remarks"
          value={form.remarks}
          onChange={onChange}
          placeholder="Remarks"
        />

        <button type="submit">
          Save RM Inward
        </button>
      </form>

      {status && (
        <p style={{ marginTop: 20 }}>
          {status}
        </p>
      )}
    </div>
  );
}