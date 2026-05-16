import { useState } from "react";
import { apiCall } from "../api/api";

export default function SupplierEntry() {

  const [status, setStatus] = useState("");

  const [form, setForm] = useState({
    supplierName: "",
    supplierType: "",
    city: "",
    state: "",
    contactPerson: "",
    phone: "",
    gstNo: "",
    materialType: "",
    qualityRating: "B",
    paymentTerms: "",
  });

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
        fn: "supplier.add",
        ...form,
      });

      if (res.ok) {

        setStatus("Supplier added successfully");

        setForm({
          supplierName: "",
          supplierType: "",
          city: "",
          state: "",
          contactPerson: "",
          phone: "",
          gstNo: "",
          materialType: "",
          qualityRating: "B",
          paymentTerms: "",
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

      <h1>Supplier Entry</h1>

      <div style={cardStyle}>

        <form
          onSubmit={submit}
          style={formStyle}
        >

          <input
            name="supplierName"
            value={form.supplierName}
            onChange={onChange}
            placeholder="Supplier Name"
            style={inputStyle}
          />

          <select
            name="supplierType"
            value={form.supplierType}
            onChange={onChange}
            style={inputStyle}
          >

            <option value="">
              Select Supplier Type
            </option>

            <option>Trader</option>
            <option>MRF</option>
            <option>Scrap Dealer</option>
            <option>Importer</option>
            <option>Factory Direct</option>
            <option>Recycler</option>

          </select>

          <input
            name="city"
            value={form.city}
            onChange={onChange}
            placeholder="City"
            style={inputStyle}
          />

          <input
            name="state"
            value={form.state}
            onChange={onChange}
            placeholder="State"
            style={inputStyle}
          />

          <input
            name="contactPerson"
            value={form.contactPerson}
            onChange={onChange}
            placeholder="Contact Person"
            style={inputStyle}
          />

          <input
            name="phone"
            value={form.phone}
            onChange={onChange}
            placeholder="Phone Number"
            style={inputStyle}
          />

          <input
            name="gstNo"
            value={form.gstNo}
            onChange={onChange}
            placeholder="GST Number"
            style={inputStyle}
          />

          <input
            name="materialType"
            value={form.materialType}
            onChange={onChange}
            placeholder="Material Type"
            style={inputStyle}
          />

          <select
            name="qualityRating"
            value={form.qualityRating}
            onChange={onChange}
            style={inputStyle}
          >

            <option>A</option>
            <option>B</option>
            <option>C</option>

          </select>

          <input
            name="paymentTerms"
            value={form.paymentTerms}
            onChange={onChange}
            placeholder="Payment Terms"
            style={inputStyle}
          />

          <button
            type="submit"
            style={buttonStyle}
          >
            Save Supplier
          </button>

        </form>

      </div>

      {status && (

        <div style={statusStyle}>
          {status}
        </div>

      )}

    </div>

  );

}

const cardStyle = {
  background: "white",
  padding: 20,
  borderRadius: 10,
  maxWidth: 700,
  boxShadow:
    "0 2px 10px rgba(0,0,0,0.08)",
};

const formStyle = {
  display: "grid",
  gap: 12,
};

const inputStyle = {
  padding: 12,
  borderRadius: 8,
  border: "1px solid #ccc",
};

const buttonStyle = {
  background: "#0f766e",
  color: "white",
  border: "none",
  padding: 14,
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
};

const statusStyle = {
  marginTop: 20,
  color: "green",
  fontWeight: 600,
};