import { useEffect, useState } from "react";
import { apiCall } from "../api/api";

export default function FGRates() {

  const [rows, setRows] = useState([]);

  const [form, setForm] = useState({
    month: "May",
    year: "2026",
    grade: "",
    ratePerKg: "",
    remarks: "",
    createdBy: "Pratap",
  });

  const [status, setStatus] = useState("");

  useEffect(() => {

    loadData();

  }, []);

  async function loadData() {

    try {

      const res = await apiCall({
        fn: "fgRates.list",
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
        fn: "fgRate.add",
        ...form,
      });

      if (res.ok) {

        setStatus("FG Rate saved");

        setForm({
          month: "May",
          year: "2026",
          grade: "",
          ratePerKg: "",
          remarks: "",
          createdBy: "Pratap",
        });

        loadData();

      } else {

        setStatus(res.error || "Error");

      }

    } catch (err) {

      setStatus(err.message);

    }

  }

  return (

    <div style={{ padding: 20 }}>

      <h1>FG Rates</h1>

      <form
        onSubmit={submit}
        style={{
          display: "grid",
          gap: 10,
          maxWidth: 500,
          marginBottom: 30,
        }}
      >

        <select
          name="month"
          value={form.month}
          onChange={onChange}
        >

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

        <select
          name="year"
          value={form.year}
          onChange={onChange}
        >

          <option>2025</option>
          <option>2026</option>
          <option>2027</option>

        </select>

        <input
          name="grade"
          value={form.grade}
          onChange={onChange}
          placeholder="Grade"
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
            padding: 12,
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Save FG Rate
        </button>

      </form>

      {status && (
        <div
          style={{
            marginBottom: 20,
            color: "green",
          }}
        >
          {status}
        </div>
      )}

      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 10,
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

              <th style={th}>Month</th>
              <th style={th}>Year</th>
              <th style={th}>Grade</th>
              <th style={th}>Rate/Kg</th>
              <th style={th}>Remarks</th>

            </tr>

          </thead>

          <tbody>

            {rows.map((r, i) => (

              <tr
                key={i}
                style={{
                  borderBottom: "1px solid #ddd",
                }}
              >

                <td style={td}>{r.month}</td>
                <td style={td}>{r.year}</td>
                <td style={td}>{r.grade}</td>
                <td style={td}>₹ {r.ratePerKg}</td>
                <td style={td}>{r.remarks}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

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