import { useEffect, useState } from "react";
import { apiCall } from "../api/api";

export default function Consumables() {
  const currentDate = new Date();

  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("");

  const [form, setForm] = useState({
    month: currentDate.toLocaleString("default", { month: "short" }),
    year: String(currentDate.getFullYear()),
    category: "",
    itemName: "",
    openingQty: "",
    purchasedQty: "",
    closingQty: "",
    consumedQty: "",
    unit: "Kg",
    ratePerUnit: "",
    consumedValue: "",
    remarks: "",
    createdBy: "Pratap",
  });

  useEffect(() => {
    loadRows();
  }, []);

  async function loadRows() {
    const res = await apiCall({
      fn: "consumables.list",
    });

    setRows(res.rows || []);
  }

  function onChange(e) {
    const updated = {
      ...form,
      [e.target.name]: e.target.value,
    };

    const opening = Number(updated.openingQty || 0);
    const purchased = Number(updated.purchasedQty || 0);
    const closing = Number(updated.closingQty || 0);
    const rate = Number(updated.ratePerUnit || 0);

    const consumed = opening + purchased - closing;

    updated.consumedQty = consumed;
    updated.consumedValue = consumed * rate;

    setForm(updated);
  }

  async function submit(e) {
    e.preventDefault();

    try {
      const res = await apiCall({
        fn: "consumables.add",
        ...form,
      });

      if (res.ok) {
        setStatus("Consumables entry saved");

        setForm({
          month: currentDate.toLocaleString("default", { month: "short" }),
          year: String(currentDate.getFullYear()),
          category: "",
          itemName: "",
          openingQty: "",
          purchasedQty: "",
          closingQty: "",
          consumedQty: "",
          unit: "Kg",
          ratePerUnit: "",
          consumedValue: "",
          remarks: "",
          createdBy: "Pratap",
        });

        loadRows();
      } else {
        setStatus(res.error || "Error saving");
      }
    } catch (err) {
      setStatus(err.message);
    }
  }

  const totalConsumedValue = rows.reduce((sum, r) => {
    return sum + Number(r.consumedValue || 0);
  }, 0);

  return (
    <div style={{ padding: 20 }}>
      <h1>Consumables & Additives</h1>

      <div style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Monthly Consumption Entry</h2>

        <form onSubmit={submit} style={formStyle}>
          <select name="month" value={form.month} onChange={onChange} style={inputStyle}>
            <option>Jan</option>
            <option>Feb</option>
            <option>Mar</option>
            <option>Apr</option>
            <option>May</option>
            <option>Jun</option>
            <option>Jul</option>
            <option>Aug</option>
            <option>Sep</option>
            <option>Oct</option>
            <option>Nov</option>
            <option>Dec</option>
          </select>

          <select name="year" value={form.year} onChange={onChange} style={inputStyle}>
            <option>2025</option>
            <option>2026</option>
            <option>2027</option>
          </select>

          <select name="category" value={form.category} onChange={onChange} style={inputStyle}>
            <option value="">Select Category</option>
            <option>Virgin Resin</option>
            <option>Battery Regrind</option>
            <option>Masterbatch</option>
            <option>Additives</option>
            <option>Chemicals</option>
            <option>Consumables</option>
          </select>

          <input
            name="itemName"
            value={form.itemName}
            onChange={onChange}
            placeholder="Item Name"
            style={inputStyle}
          />

          <input
            type="number"
            name="openingQty"
            value={form.openingQty}
            onChange={onChange}
            placeholder="Opening Qty"
            style={inputStyle}
          />

          <input
            type="number"
            name="purchasedQty"
            value={form.purchasedQty}
            onChange={onChange}
            placeholder="Purchased Qty"
            style={inputStyle}
          />

          <input
            type="number"
            name="closingQty"
            value={form.closingQty}
            onChange={onChange}
            placeholder="Closing Qty"
            style={inputStyle}
          />

          <input
            name="consumedQty"
            value={form.consumedQty}
            readOnly
            placeholder="Consumed Qty"
            style={inputStyle}
          />

          <select name="unit" value={form.unit} onChange={onChange} style={inputStyle}>
            <option>Kg</option>
            <option>Nos</option>
            <option>Ltr</option>
            <option>Bag</option>
          </select>

          <input
            type="number"
            name="ratePerUnit"
            value={form.ratePerUnit}
            onChange={onChange}
            placeholder="Rate Per Unit"
            style={inputStyle}
          />

          <input
            name="consumedValue"
            value={form.consumedValue}
            readOnly
            placeholder="Consumed Value"
            style={inputStyle}
          />

          <textarea
            name="remarks"
            value={form.remarks}
            onChange={onChange}
            placeholder="Remarks"
            style={textareaStyle}
          />

          <button type="submit" style={buttonStyle}>
            Save Consumption
          </button>
        </form>
      </div>

      {status && <div style={statusStyle}>{status}</div>}

      <div style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Monthly Consumption Summary</h2>

        <div style={summaryStyle}>
          Total Consumed Value: <b>₹ {totalConsumedValue.toFixed(0)}</b>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr style={headerRowStyle}>
                <th style={th}>Month</th>
                <th style={th}>Year</th>
                <th style={th}>Category</th>
                <th style={th}>Item</th>
                <th style={th}>Opening</th>
                <th style={th}>Purchased</th>
                <th style={th}>Closing</th>
                <th style={th}>Consumed</th>
                <th style={th}>Rate</th>
                <th style={th}>Value</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={td}>{r.month}</td>
                  <td style={td}>{r.year}</td>
                  <td style={td}>{r.category}</td>
                  <td style={td}>{r.itemName}</td>
                  <td style={td}>{r.openingQty}</td>
                  <td style={td}>{r.purchasedQty}</td>
                  <td style={td}>{r.closingQty}</td>
                  <td style={td}>{r.consumedQty}</td>
                  <td style={td}>₹ {r.ratePerUnit}</td>
                  <td style={td}>₹ {Number(r.consumedValue || 0).toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={noteStyle}>
        <b>Purpose:</b> This is month-end consumption costing. It avoids batch-wise complexity
        while still giving real P&L inputs for virgin, battery regrind, masterbatch, additives,
        chemicals and consumables.
      </div>
    </div>
  );
}

const cardStyle = {
  background: "white",
  padding: 20,
  borderRadius: 10,
  marginBottom: 25,
  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
};

const formStyle = {
  display: "grid",
  gap: 10,
  maxWidth: 700,
};

const inputStyle = {
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ccc",
};

const textareaStyle = {
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ccc",
  minHeight: 80,
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
  marginBottom: 20,
  color: "green",
  fontWeight: 600,
};

const summaryStyle = {
  background: "#ecfdf5",
  padding: 15,
  borderRadius: 8,
  marginBottom: 20,
  color: "#065f46",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const headerRowStyle = {
  background: "#0f766e",
  color: "white",
};

const th = {
  padding: 12,
  textAlign: "left",
};

const td = {
  padding: 10,
};

const noteStyle = {
  background: "#fff7ed",
  border: "1px solid #fed7aa",
  padding: 15,
  borderRadius: 10,
  marginTop: 20,
  color: "#7c2d12",
};