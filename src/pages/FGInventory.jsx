import { useEffect, useState } from "react";
import { apiCall } from "../api/api";

export default function FGInventory() {

  const [rows, setRows] = useState([]);

  const [status, setStatus] = useState("");

  const [form, setForm] = useState({
    date: "",
    grade: "",
    color: "",
    lotNo: "",
    quantityKg: "",
    noOfBags: "",
    location: "",
    qcStatus: "",
    remarks: "",
    createdBy: "Pratap",
  });

  useEffect(() => {

    loadData();

  }, []);

  async function loadData() {

    const res = await apiCall({
      fn: "fg.list",
    });

    setRows(res.rows || []);

  }

  function onChange(e) {

    setForm((p) => ({
      ...p,
      [e.target.name]: e.target.value,
    }));

  }

  async function submit(e) {

    e.preventDefault();

    const res = await apiCall({
      fn: "fg.add",
      ...form,
    });

    if (res.ok) {

      setStatus("FG saved");

      loadData();

    }

  }

  const totalStock = rows.reduce((sum, r) => {
    return sum + Number(r.quantityKg || 0);
  }, 0);

  return (

    <div style={{ padding: 20 }}>

      <h1>FG Inventory</h1>

      <div
        style={{
          display: "flex",
          gap: 20,
          marginBottom: 20,
        }}
      >

        <Card
          title="Total FG Stock"
          value={`${totalStock.toFixed(2)} Kg`}
        />

        <Card
          title="Lots"
          value={rows.length}
        />

      </div>

      <form
        onSubmit={submit}
        style={{
          display: "grid",
          gap: 10,
          maxWidth: 700,
          background: "white",
          padding: 20,
          borderRadius: 10,
          marginBottom: 30,
        }}
      >

        <input type="date" name="date" value={form.date} onChange={onChange} />

        <select name="grade" value={form.grade} onChange={onChange}>
          <option value="">Select Grade</option>
          <option>E1</option>
          <option>E2</option>
          <option>E3</option>
          <option>E4</option>
        </select>

        <input
          name="color"
          value={form.color}
          onChange={onChange}
          placeholder="Color"
        />

        <input
          name="lotNo"
          value={form.lotNo}
          onChange={onChange}
          placeholder="Lot Number"
        />

        <input
          name="quantityKg"
          value={form.quantityKg}
          onChange={onChange}
          placeholder="Quantity Kg"
        />

        <input
          name="noOfBags"
          value={form.noOfBags}
          onChange={onChange}
          placeholder="No Of Bags"
        />

        <input
          name="location"
          value={form.location}
          onChange={onChange}
          placeholder="Location"
        />

        <select
          name="qcStatus"
          value={form.qcStatus}
          onChange={onChange}
        >
          <option value="">QC Status</option>
          <option>Approved</option>
          <option>Hold</option>
          <option>Rejected</option>
        </select>

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
            padding: 12,
            borderRadius: 8,
          }}
        >
          Save FG
        </button>

      </form>

      {status && (
        <div style={{ marginBottom: 20 }}>
          {status}
        </div>
      )}

      <div
        style={{
          background: "white",
          borderRadius: 10,
          padding: 20,
          overflowX: "auto",
        }}
      >

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >

          <thead>

            <tr
              style={{
                background: "#0f766e",
                color: "white",
              }}
            >

              <th style={th}>Date</th>
              <th style={th}>Grade</th>
              <th style={th}>Lot</th>
              <th style={th}>Qty</th>
              <th style={th}>QC</th>

            </tr>

          </thead>

          <tbody>

            {rows.map((r, i) => (

              <tr key={i} style={{ borderBottom: "1px solid #ddd" }}>

                <td style={td}>{r.date}</td>
                <td style={td}>{r.grade}</td>
                <td style={td}>{r.lotNo}</td>
                <td style={td}>{r.quantityKg}</td>
                <td style={td}>{r.qcStatus}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}

function Card({ title, value }) {

  return (

    <div
      style={{
        background: "white",
        padding: 20,
        borderRadius: 10,
        minWidth: 220,
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
      }}
    >

      <div style={{ color: "#666", marginBottom: 10 }}>
        {title}
      </div>

      <h2 style={{ margin: 0, color: "#0f766e" }}>
        {value}
      </h2>

    </div>

  );

}

const th = {
  padding: 12,
  textAlign: "left",
};

const td = {
  padding: 10,
};