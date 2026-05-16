import { useEffect, useState } from "react";
import { apiCall } from "../api/api";

export default function FactoryExpenses() {
  const currentDate = new Date();

  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("");

  const [form, setForm] = useState({
    month: currentDate.toLocaleString("default", { month: "short" }),
    year: String(currentDate.getFullYear()),
    category: "",
    itemName: "",
    amount: "",
    remarks: "",
    createdBy: "Pratap",
  });

  useEffect(() => {
    loadRows();
  }, []);

  async function loadRows() {
    try {
      const res = await apiCall({
        fn: "factoryExpenses.list",
      });

      setRows(res.rows || []);
    } catch (err) {
      console.log(err);
    }
  }

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
        fn: "factoryExpense.add",
        ...form,
      });

      if (res.ok) {
        setStatus("Factory expense saved");

        setForm({
          month: currentDate.toLocaleString("default", { month: "short" }),
          year: String(currentDate.getFullYear()),
          category: "",
          itemName: "",
          amount: "",
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

  const totalExpenses = rows.reduce((sum, r) => {
    return sum + Number(r.amount || 0);
  }, 0);

  return (
    <div style={{ padding: 20 }}>
      <h1>Factory Expenses</h1>

      <div style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Monthly Expense Entry</h2>

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
            <option>Electricity</option>
            <option>DG Diesel</option>
            <option>Consumables</option>
            <option>Masterbatch</option>
            <option>Virgin Resin</option>
            <option>Battery Regrind</option>
            <option>Additives</option>
            <option>Maintenance</option>
            <option>Labour</option>
            <option>Transport</option>
            <option>Rent</option>
            <option>Admin</option>
            <option>Water</option>
            <option>Other</option>
          </select>

          <input
            name="itemName"
            value={form.itemName}
            onChange={onChange}
            placeholder="Item Name / Description"
            style={inputStyle}
          />

          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={onChange}
            placeholder="Amount ₹"
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
            Save Expense
          </button>
        </form>
      </div>

      {status && <div style={statusStyle}>{status}</div>}

      <div style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Monthly Expense Summary</h2>

        <div style={summaryStyle}>
          Total Factory Expenses: <b>₹ {totalExpenses.toFixed(0)}</b>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr style={headerRowStyle}>
                <th style={th}>Month</th>
                <th style={th}>Year</th>
                <th style={th}>Category</th>
                <th style={th}>Item</th>
                <th style={th}>Amount</th>
                <th style={th}>Remarks</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={td}>{r.month}</td>
                  <td style={td}>{r.year}</td>
                  <td style={td}>{r.category}</td>
                  <td style={td}>{r.itemName}</td>
                  <td style={td}>₹ {Number(r.amount || 0).toFixed(0)}</td>
                  <td style={td}>{r.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={noteStyle}>
        <b>Purpose:</b> Capture power, maintenance, labour, transport, rent, consumables,
        masterbatch, virgin resin and other factory costs monthly. This keeps batch entries simple
        and makes dashboard profit/loss more realistic.
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