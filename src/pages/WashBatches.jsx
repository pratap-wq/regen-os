import { useEffect, useState } from "react";
import { apiCall } from "../api/api";

export default function WashBatches() {

  const [status, setStatus] = useState("");

  const [machines, setMachines] = useState([]);
  const [categories, setCategories] = useState([]);

  const [rows, setRows] = useState([]);

  const [editingId, setEditingId] = useState(null);

  const today =
    new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    batchId: "",
    date: today,
    shift: "A",
    machine: "",
    inputMaterial: "",
    inputWeight: "",
    outputWeight: "",
    sinkWeight: "",
    sludgeWeight: "",
    estimatedRecovery: "",
    operatorName: "",
    remarks: "",
    createdBy: "Pratap",
  });

  useEffect(() => {

    loadMasters();
    loadRows();

  }, []);

  async function loadMasters() {

    try {

      const [
        machinesRes,
        categoriesRes,
      ] = await Promise.all([

        apiCall({ fn: "machines.list" }),
        apiCall({ fn: "categories.list" }),

      ]);

      setMachines(machinesRes.rows || []);
      setCategories(categoriesRes.rows || []);

    } catch (err) {

      console.log(err);

    }

  }

  async function loadRows() {

    try {

      const res = await apiCall({
        fn: "wash.list",
      });

      setRows(res.rows || []);

    } catch (err) {

      console.log(err);

    }

  }

  function onChange(e) {

    const updated = {
      ...form,
      [e.target.name]: e.target.value,
    };

    const input =
      Number(updated.inputWeight || 0);

    const output =
      Number(updated.outputWeight || 0);

    updated.estimatedRecovery =
      input > 0
        ? ((output / input) * 100).toFixed(2)
        : "";

    setForm(updated);

  }

  function editRow(row) {

    setEditingId(row.batchId);

    setForm({
      batchId: row.batchId || "",
      date: row.date
        ? new Date(row.date)
            .toISOString()
            .split("T")[0]
        : today,
      shift: row.shift || "A",
      machine: row.machine || "",
      inputMaterial: row.inputMaterial || "",
      inputWeight: row.inputWeight || "",
      outputWeight: row.outputWeight || "",
      sinkWeight: row.sinkWeight || "",
      sludgeWeight: row.sludgeWeight || "",
      estimatedRecovery:
        row.estimatedRecovery || "",
      operatorName: row.operatorName || "",
      remarks: row.remarks || "",
      createdBy: row.createdBy || "Pratap",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  }

  async function submit(e) {

    e.preventDefault();

    try {

      let res;

      if (editingId) {

        res = await apiCall({
          fn: "wash.update",
          ...form,
        });

      } else {

        res = await apiCall({
          fn: "wash.add",
          ...form,
        });

      }

      if (res.ok) {

        setStatus(
          editingId
            ? "Wash batch updated"
            : "Wash batch saved"
        );

        setEditingId(null);

        loadRows();

        setForm({
          batchId: "",
          date: today,
          shift: "A",
          machine: "",
          inputMaterial: "",
          inputWeight: "",
          outputWeight: "",
          sinkWeight: "",
          sludgeWeight: "",
          estimatedRecovery: "",
          operatorName: "",
          remarks: "",
          createdBy: "Pratap",
        });

      }

    } catch (err) {

      setStatus(err.message);

    }

  }

  return (

    <div style={{ padding: 20 }}>

      <h1>Wash Batches</h1>

      <form
        onSubmit={submit}
        style={{
          display: "grid",
          gap: 12,
          maxWidth: 700,
          background: "white",
          padding: 20,
          borderRadius: 10,
          marginBottom: 30,
        }}
      >

        <input
          type="date"
          name="date"
          value={form.date}
          onChange={onChange}
        />

        <select
          name="shift"
          value={form.shift}
          onChange={onChange}
        >

          <option>A</option>
          <option>B</option>
          <option>C</option>

        </select>

        <select
          name="machine"
          value={form.machine}
          onChange={onChange}
        >

          <option value="">
            Select Machine
          </option>

          {machines.map((m, i) => (

            <option
              key={i}
              value={m.machineName}
            >
              {m.machineName}
            </option>

          ))}

        </select>

        <select
          name="inputMaterial"
          value={form.inputMaterial}
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

        <input
          type="number"
          name="inputWeight"
          value={form.inputWeight}
          onChange={onChange}
          placeholder="Input Weight Kg"
        />

        <input
          type="number"
          name="outputWeight"
          value={form.outputWeight}
          onChange={onChange}
          placeholder="Output Weight Kg"
        />

        <input
          type="number"
          name="sinkWeight"
          value={form.sinkWeight}
          onChange={onChange}
          placeholder="Sink Weight Kg"
        />

        <input
          type="number"
          name="sludgeWeight"
          value={form.sludgeWeight}
          onChange={onChange}
          placeholder="Sludge Weight Kg"
        />

        <input
          name="estimatedRecovery"
          value={form.estimatedRecovery}
          readOnly
          placeholder="Recovery %"
        />

        <input
          name="operatorName"
          value={form.operatorName}
          onChange={onChange}
          placeholder="Operator Name"
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
            background: editingId
              ? "#ea580c"
              : "#0f766e",
            color: "white",
            border: "none",
            padding: 14,
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >

          {editingId
            ? "Update Batch"
            : "Save Wash Batch"}

        </button>

      </form>

      {status && (

        <div
          style={{
            marginBottom: 20,
            fontWeight: 600,
          }}
        >
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
              <th style={th}>Machine</th>
              <th style={th}>Material</th>
              <th style={th}>Input</th>
              <th style={th}>Output</th>
              <th style={th}>Recovery</th>
              <th style={th}>Action</th>

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

                <td style={td}>
                  {r.date}
                </td>

                <td style={td}>
                  {r.machine}
                </td>

                <td style={td}>
                  {r.inputMaterial}
                </td>

                <td style={td}>
                  {r.inputWeight}
                </td>

                <td style={td}>
                  {r.outputWeight}
                </td>

                <td style={td}>
                  {r.estimatedRecovery}%
                </td>

                <td style={td}>

                  <button
                    onClick={() => editRow(r)}
                    style={{
                      background: "#2563eb",
                      color: "white",
                      border: "none",
                      padding: "8px 12px",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>

                </td>

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