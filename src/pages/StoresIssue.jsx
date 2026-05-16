import { useEffect, useState } from "react";
import { apiCall } from "../api/api";

export default function StoresIssue() {

  const [rows, setRows] = useState([]);
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");

  const [form, setForm] = useState({
    date: "",
    itemName: "",
    category: "",
    qty: "",
    department: "",
    purpose: "",
    remarks: "",
    createdBy: "Pratap",
  });

  useEffect(() => {

    loadData();

  }, []);

  async function loadData() {

    const [
      issue,
      master,
    ] = await Promise.all([

      apiCall({
        fn: "storesIssue.list",
      }),

      apiCall({
        fn: "storesMaster.list",
      }),

    ]);

    setRows(issue.rows || []);
    setItems(master.rows || []);

  }

  function onChange(e) {

    const updated = {
      ...form,
      [e.target.name]: e.target.value,
    };

    if (e.target.name === "itemName") {

      const selected =
        items.find(
          (x) =>
            x.itemName ===
            e.target.value
        );

      if (selected) {

        updated.category =
          selected.category;

      }

    }

    setForm(updated);

  }

  async function submit(e) {

    e.preventDefault();

    try {

      const res = await apiCall({
        fn: "storesIssue.add",
        ...form,
      });

      if (res.ok) {

        setStatus(
          "Stores issue saved"
        );

        setForm({
          date: "",
          itemName: "",
          category: "",
          qty: "",
          department: "",
          purpose: "",
          remarks: "",
          createdBy: "Pratap",
        });

        loadData();

      } else {

        setStatus(
          res.error || "Error"
        );

      }

    } catch (err) {

      setStatus(err.message);

    }

  }

  return (

    <div style={{ padding: 20 }}>

      <h1>Stores Issue</h1>

      <div style={cardStyle}>

        <form
          onSubmit={submit}
          style={formStyle}
        >

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={onChange}
            style={inputStyle}
          />

          <select
            name="itemName"
            value={form.itemName}
            onChange={onChange}
            style={inputStyle}
          >

            <option value="">
              Select Item
            </option>

            {items.map((x, i) => (

              <option
                key={i}
                value={x.itemName}
              >
                {x.itemName}
              </option>

            ))}

          </select>

          <input
            name="category"
            value={form.category}
            readOnly
            placeholder="Category"
            style={inputStyle}
          />

          <input
            type="number"
            name="qty"
            value={form.qty}
            onChange={onChange}
            placeholder="Issue Quantity"
            style={inputStyle}
          />

          <select
            name="department"
            value={form.department}
            onChange={onChange}
            style={inputStyle}
          >

            <option value="">
              Select Department
            </option>

            <option>Extrusion</option>
            <option>Washline</option>
            <option>Maintenance</option>
            <option>Utilities</option>
            <option>Admin</option>

          </select>

          <input
            name="purpose"
            value={form.purpose}
            onChange={onChange}
            placeholder="Purpose"
            style={inputStyle}
          />

          <textarea
            name="remarks"
            value={form.remarks}
            onChange={onChange}
            placeholder="Remarks"
            style={textareaStyle}
          />

          <button
            type="submit"
            style={buttonStyle}
          >
            Save Stores Issue
          </button>

        </form>

      </div>

      {status && (

        <div style={statusStyle}>
          {status}
        </div>

      )}

      <div style={tableCardStyle}>

        <h2>Recent Stores Issues</h2>

        <div
          style={{
            overflowX: "auto",
          }}
        >

          <table style={tableStyle}>

            <thead>

              <tr style={headerRowStyle}>

                <th style={th}>Date</th>
                <th style={th}>Item</th>
                <th style={th}>Category</th>
                <th style={th}>Qty</th>
                <th style={th}>Department</th>
                <th style={th}>Purpose</th>

              </tr>

            </thead>

            <tbody>

              {rows.map((r, i) => (

                <tr
                  key={i}
                  style={{
                    borderBottom:
                      "1px solid #ddd",
                  }}
                >

                  <td style={td}>
                    {r.date}
                  </td>

                  <td style={td}>
                    {r.itemName}
                  </td>

                  <td style={td}>
                    {r.category}
                  </td>

                  <td style={td}>
                    {r.qty}
                  </td>

                  <td style={td}>
                    {r.department}
                  </td>

                  <td style={td}>
                    {r.purpose}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );

}

const cardStyle = {
  background: "white",
  padding: 20,
  borderRadius: 10,
  marginBottom: 25,
  boxShadow:
    "0 2px 10px rgba(0,0,0,0.08)",
};

const tableCardStyle = {
  background: "white",
  padding: 20,
  borderRadius: 10,
  boxShadow:
    "0 2px 10px rgba(0,0,0,0.08)",
};

const formStyle = {
  display: "grid",
  gap: 12,
  maxWidth: 700,
};

const inputStyle = {
  padding: 12,
  borderRadius: 8,
  border: "1px solid #ccc",
};

const textareaStyle = {
  padding: 12,
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