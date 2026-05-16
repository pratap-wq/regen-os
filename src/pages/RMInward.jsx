import { useEffect, useState } from "react";
import { apiCall } from "../api/api";

export default function RMInward() {

  const [status, setStatus] = useState("");

  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);

  const [form, setForm] = useState({
    date: "",
    supplier: "",
    vehicleNo: "",
    material: "",
    color: "",
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

  useEffect(() => {

    loadMasters();

  }, []);

  async function loadMasters() {

    try {

      const [
        categoriesRes,
        colorsRes,
      ] = await Promise.all([

        apiCall({ fn: "categories.list" }),
        apiCall({ fn: "colors.list" }),

      ]);

      setCategories(categoriesRes.rows || []);
      setColors(colorsRes.rows || []);

    } catch (err) {

      console.log(err);

    }

  }

  function onChange(e) {

    const updated = {
      ...form,
      [e.target.name]: e.target.value,
    };

    const gross = Number(updated.grossWeight || 0);

    const tare = Number(updated.tareWeight || 0);

    updated.netWeight = gross - tare;

    setForm(updated);

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
          color: "",
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
          gap: 12,
          maxWidth: 700,
          background: "white",
          padding: 20,
          borderRadius: 10,
        }}
      >

        <input
          name="date"
          type="date"
          value={form.date}
          onChange={onChange}
        />

        <input
          name="supplier"
          value={form.supplier}
          onChange={onChange}
          placeholder="Supplier"
        />

        <input
          name="vehicleNo"
          value={form.vehicleNo}
          onChange={onChange}
          placeholder="Vehicle Number"
        />

        <select
          name="material"
          value={form.material}
          onChange={onChange}
        >

          <option value="">
            Select Material
          </option>

          {categories.map((c, i) => (

            <option
              key={i}
              value={c.categoryName}
            >
              {c.categoryName}
            </option>

          ))}

        </select>

        <select
          name="color"
          value={form.color}
          onChange={onChange}
        >

          <option value="">
            Select Color
          </option>

          {colors.map((c, i) => (

            <option
              key={i}
              value={c.colorName}
            >
              {c.colorName}
            </option>

          ))}

        </select>

        <input
          name="grossWeight"
          value={form.grossWeight}
          onChange={onChange}
          placeholder="Gross Weight"
        />

        <input
          name="tareWeight"
          value={form.tareWeight}
          onChange={onChange}
          placeholder="Tare Weight"
        />

        <input
          name="netWeight"
          value={form.netWeight}
          readOnly
          placeholder="Net Weight"
        />

        <input
          name="moisture"
          value={form.moisture}
          onChange={onChange}
          placeholder="Moisture %"
        />

        <input
          name="contamination"
          value={form.contamination}
          onChange={onChange}
          placeholder="Contamination %"
        />

        <input
          name="estimatedRecovery"
          value={form.estimatedRecovery}
          onChange={onChange}
          placeholder="Estimated Recovery %"
        />

        <input
          name="ratePerKg"
          value={form.ratePerKg}
          onChange={onChange}
          placeholder="Rate Per Kg"
        />

        <textarea
          name="remarks"
          value={form.remarks}
          onChange={onChange}
          placeholder="Remarks"
        />

        <button
          type="submit"
          style={{
            background: "#0f766e",
            color: "white",
            border: "none",
            padding: 14,
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Save RM Inward
        </button>

      </form>

      {status && (

        <div
          style={{
            marginTop: 20,
          }}
        >
          {status}
        </div>

      )}

    </div>

  );

}