import { useEffect, useState } from "react";
import { apiCall } from "../api/api";
import { formatDate } from "../utils/date";

export default function RMInward() {
  const currentDate = new Date().toISOString().split("T")[0];

  const [status, setStatus] = useState("");
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [rows, setRows] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const blankForm = {
    inwardId: "",
    date: currentDate,
    supplier: "",
    location: "",
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
  };

  const [form, setForm] = useState(blankForm);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [categoriesRes, colorsRes, suppliersRes, rmRes] =
        await Promise.all([
          apiCall({ fn: "categories.list" }),
          apiCall({ fn: "colors.list" }),
          apiCall({ fn: "suppliers.list" }),
          apiCall({ fn: "rm.list" }),
        ]);

      setCategories(categoriesRes.rows || []);
      setColors(colorsRes.rows || []);
      setSuppliers(
        (suppliersRes.rows || []).filter(
          (s) => String(s.isActive || "TRUE").toUpperCase() !== "FALSE"
        )
      );
      setRows(
        (rmRes.rows || []).filter(
          (r) => String(r.status || "").toUpperCase() !== "DELETED"
        )
      );
    } catch (err) {
      console.log(err);
      setStatus(err.message);
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

  function editRow(row) {
    setEditingId(row.inwardId);

    setForm({
      inwardId: row.inwardId || "",
      date: formatDateForInput(row.date),
      supplier: row.supplier || "",
      location: row.location || "",
      vehicleNo: row.vehicleNo || "",
      material: row.material || "",
      color: row.color || "",
      grossWeight: row.grossWeight || "",
      tareWeight: row.tareWeight || "",
      netWeight: row.netWeight || "",
      moisture: row.moisture || "",
      contamination: row.contamination || "",
      estimatedRecovery: row.estimatedRecovery || "",
      ratePerKg: row.ratePerKg || "",
      remarks: row.remarks || "",
      createdBy: row.createdBy || "Pratap",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function deleteRow(row) {
    const confirmed = window.confirm("Delete RM inward?");
    if (!confirmed) return;

    try {
      await apiCall({
        fn: "rm.update",
        inwardId: row.inwardId,
        ...row,
        status: "DELETED",
      });

      loadData();
    } catch (err) {
      alert(err.message);
    }
  }

  async function submit(e) {
    e.preventDefault();

    if (!form.date) {
      alert("Date is mandatory");
      return;
    }

    if (!form.supplier) {
      alert("Supplier is mandatory");
      return;
    }

    if (!form.material) {
      alert("Material is mandatory");
      return;
    }

    try {
      let res;

      if (editingId) {
        res = await apiCall({
          fn: "rm.update",
          ...form,
        });
      } else {
        res = await apiCall({
          fn: "rm.add",
          ...form,
        });
      }

      if (res.ok) {
        setStatus(editingId ? "RM inward updated" : "RM inward saved");
        setEditingId(null);
        setForm(blankForm);
        loadData();
      } else {
        setStatus(res.error || "Error");
      }
    } catch (err) {
      setStatus(err.message);
    }
  }

  const totalRM = rows.reduce((sum, r) => {
    return sum + Number(r.netWeight || 0);
  }, 0);

  const totalRMValue = rows.reduce((sum, r) => {
    return sum + Number(r.netWeight || 0) * Number(r.ratePerKg || 0);
  }, 0);

  const avgRMPrice = totalRM > 0 ? (totalRMValue / totalRM).toFixed(2) : 0;

  const avgRecovery =
    rows.length > 0
      ? (
          rows.reduce((sum, r) => {
            return sum + Number(r.estimatedRecovery || 0);
          }, 0) / rows.length
        ).toFixed(2)
      : 0;

  const avgMoisture =
    rows.length > 0
      ? (
          rows.reduce((sum, r) => {
            return sum + Number(r.moisture || 0);
          }, 0) / rows.length
        ).toFixed(2)
      : 0;

  return (
    <div style={page}>
      <div style={header}>
        <div>
          <h1 style={title}>RM Inward</h1>
          <div style={subtitle}>Raw material GRN inward register</div>
        </div>
      </div>

      <div style={gridStyle}>
        <Card title="RM Qty" value={`${totalRM.toFixed(0)} Kg`} />
        <Card title="RM Value" value={`₹ ${totalRMValue.toFixed(0)}`} />
        <Card title="Avg RM Price" value={`₹ ${avgRMPrice}`} />
        <Card title="Avg Recovery" value={`${avgRecovery}%`} />
        <Card title="Avg Moisture" value={`${avgMoisture}%`} />
      </div>

      <form onSubmit={submit} style={formStyle}>
        <Field label="Date">
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={onChange}
            style={inputStyle}
            required
          />
        </Field>

        <Field label="Supplier">
          <select
            name="supplier"
            value={form.supplier}
            onChange={onChange}
            style={inputStyle}
            required
          >
            <option value="">Select Supplier</option>

            {suppliers.map((s, i) => {
              const supplierName = s.supplierName || s.name || "";
              return (
                <option key={i} value={supplierName}>
                  {supplierName}
                </option>
              );
            })}
          </select>
        </Field>

        <Field label="Location">
          <select
            name="location"
            value={form.location}
            onChange={onChange}
            style={inputStyle}
          >
            <option value="">Select Location</option>
            <option>Hyderabad Yard</option>
            <option>Vijayawada Yard</option>
            <option>Chennai Hub</option>
            <option>Bangalore Hub</option>
            <option>Imported</option>
            <option>Supplier Direct</option>
            <option>Factory Direct</option>
            <option>Other</option>
          </select>
        </Field>

        <Field label="Vehicle">
          <input
            name="vehicleNo"
            value={form.vehicleNo}
            onChange={onChange}
            style={inputStyle}
          />
        </Field>

        <Field label="Material">
          <select
            name="material"
            value={form.material}
            onChange={onChange}
            style={inputStyle}
            required
          >
            <option value="">Select Material</option>

            {categories.map((c, i) => (
              <option key={i} value={c.categoryName}>
                {c.categoryName}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Color">
          <select
            name="color"
            value={form.color}
            onChange={onChange}
            style={inputStyle}
          >
            <option value="">Select Color</option>

            {colors.map((c, i) => (
              <option key={i} value={c.colorName}>
                {c.colorName}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Gross Kg">
          <input
            type="number"
            name="grossWeight"
            value={form.grossWeight}
            onChange={onChange}
            style={inputStyle}
          />
        </Field>

        <Field label="Tare Kg">
          <input
            type="number"
            name="tareWeight"
            value={form.tareWeight}
            onChange={onChange}
            style={inputStyle}
          />
        </Field>

        <Field label="Net Kg">
          <input
            name="netWeight"
            value={form.netWeight}
            readOnly
            style={readonlyStyle}
          />
        </Field>

        <Field label="Moisture %">
          <input
            type="number"
            name="moisture"
            value={form.moisture}
            onChange={onChange}
            style={inputStyle}
          />
        </Field>

        <Field label="Contamination %">
          <input
            type="number"
            name="contamination"
            value={form.contamination}
            onChange={onChange}
            style={inputStyle}
          />
        </Field>

        <Field label="Recovery %">
          <input
            type="number"
            name="estimatedRecovery"
            value={form.estimatedRecovery}
            onChange={onChange}
            style={inputStyle}
          />
        </Field>

        <Field label="Rate/Kg">
          <input
            type="number"
            name="ratePerKg"
            value={form.ratePerKg}
            onChange={onChange}
            style={inputStyle}
          />
        </Field>

        <Field label="Remarks">
          <textarea
            name="remarks"
            value={form.remarks}
            onChange={onChange}
            style={textareaStyle}
          />
        </Field>

        <div style={buttonWrap}>
          <button type="submit" style={saveButton(editingId)}>
            {editingId ? "Update RM" : "Save RM"}
          </button>
        </div>
      </form>

      {status && <div style={statusStyle}>{status}</div>}

      <div style={tableCardStyle}>
        <div style={tableHeader}>
          <h3 style={{ margin: 0 }}>RM Inward Register</h3>
          <div style={{ color: "#64748b", fontSize: 13 }}>
            Total Entries: {rows.length}
          </div>
        </div>

        <table style={tableStyle}>
          <thead>
            <tr style={headerRowStyle}>
              <th style={th}>Inward ID</th>
              <th style={th}>Date</th>
              <th style={th}>Supplier</th>
              <th style={th}>Location</th>
              <th style={th}>Vehicle</th>
              <th style={th}>Material</th>
              <th style={th}>Color</th>
              <th style={th}>Net Kg</th>
              <th style={th}>Recovery</th>
              <th style={th}>Rate</th>
              <th style={th}>Value</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={rowStyle}>
                <td style={td}>
                  <b>{r.inwardId}</b>
                </td>
                <td style={td}>{formatDate(r.date)}</td>
                <td style={td}>{r.supplier}</td>
                <td style={td}>{r.location}</td>
                <td style={td}>{r.vehicleNo}</td>
                <td style={td}>{r.material}</td>
                <td style={td}>{r.color}</td>
                <td style={td}>{r.netWeight}</td>
                <td style={td}>{r.estimatedRecovery}%</td>
                <td style={td}>₹ {r.ratePerKg}</td>
                <td style={td}>
                  ₹{" "}
                  {(
                    Number(r.netWeight || 0) * Number(r.ratePerKg || 0)
                  ).toFixed(0)}
                </td>
                <td style={td}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => editRow(r)} style={editButton}>
                      Edit
                    </button>
                    <button onClick={() => deleteRow(r)} style={deleteButton}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={labelStyle}>{label}</div>
      {children}
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={cardStyle}>
      <div style={cardTitle}>{title}</div>
      <div style={cardValue}>{value}</div>
    </div>
  );
}

function formatDateForInput(value) {
  if (!value) return "";

  const d = new Date(value);

  if (isNaN(d.getTime())) return "";

  return d.toISOString().split("T")[0];
}

const page = {
  width: "100%",
  maxWidth: "100%",
  padding: 20,
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20,
};

const title = {
  margin: 0,
  color: "#0f766e",
  fontSize: 32,
  fontWeight: 800,
};

const subtitle = {
  color: "#64748b",
  fontSize: 14,
  marginTop: 5,
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: 16,
  marginBottom: 20,
};

const cardStyle = {
  background: "white",
  padding: 18,
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
};

const cardTitle = {
  color: "#64748b",
  marginBottom: 8,
  fontSize: 13,
};

const cardValue = {
  fontSize: 24,
  fontWeight: 800,
  color: "#0f766e",
};

const formStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
  gap: 14,
  background: "white",
  padding: 20,
  borderRadius: 12,
  marginBottom: 24,
  border: "1px solid #e5e7eb",
  boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
};

const labelStyle = {
  marginBottom: 6,
  fontWeight: 700,
  color: "#334155",
  fontSize: 12,
};

const inputStyle = {
  width: "100%",
  padding: "9px 11px",
  height: 40,
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  fontSize: 13,
  background: "white",
  color: "#111827",
  boxSizing: "border-box",
};

const readonlyStyle = {
  ...inputStyle,
  background: "#f3f4f6",
  fontWeight: 700,
};

const textareaStyle = {
  ...inputStyle,
  height: 80,
  resize: "vertical",
  paddingTop: 10,
};

const buttonWrap = {
  display: "flex",
  alignItems: "end",
};

const statusStyle = {
  marginBottom: 16,
  fontWeight: 700,
  color: "#0f766e",
};

const tableCardStyle = {
  background: "white",
  padding: 20,
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  overflowX: "auto",
  boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
};

const tableHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 14,
  gap: 10,
  flexWrap: "wrap",
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
  padding: "11px 12px",
  textAlign: "left",
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.4px",
  whiteSpace: "nowrap",
};

const td = {
  padding: "11px 12px",
  fontSize: 13,
  whiteSpace: "nowrap",
};

const rowStyle = {
  borderBottom: "1px solid #e5e7eb",
};

const saveButton = (editingId) => ({
  background: editingId ? "#ea580c" : "#0f766e",
  color: "white",
  border: "none",
  height: 40,
  minWidth: 130,
  padding: "0 18px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 13,
});

const editButton = {
  background: "#2563eb",
  color: "white",
  border: "none",
  height: 32,
  padding: "0 12px",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 700,
};

const deleteButton = {
  background: "#dc2626",
  color: "white",
  border: "none",
  height: 32,
  padding: "0 12px",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 700,
};