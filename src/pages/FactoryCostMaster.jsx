import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";
import DataTable from "../components/DataTable";

export default function FactoryCostMaster() {
  const now = new Date();

  const blankForm = {
    costId: "",
    periodMonth: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
    costHead: "",
    amount: "",
    allocationType: "FIXED",
    remarks: "",
    status: "ACTIVE",
    createdBy: "Pratap",
  };

  const costHeads = [
    "Electricity",
    "Diesel",
    "Salaries",
    "Labour",
    "Rent",
    "Bank Interest",
    "Maintenance",
    "Packing",
    "Water",
    "Admin",
    "Insurance",
    "Food",
    "Transport",
    "Other",
  ];

  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editing, setEditing] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    loadRows();
  }, []);

  async function loadRows() {
    try {
      const res = await apiCall({ fn: "factoryCostMaster.list" });
      setRows(
        (res.rows || []).filter(
          (r) => String(r.status || "").toUpperCase() !== "DELETED"
        )
      );
    } catch (err) {
      setStatus(err.message);
    }
  }

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function onEditChange(e) {
    setEditing({ ...editing, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();

    if (!form.periodMonth) return alert("Month is required");
    if (!form.costHead) return alert("Cost head is required");
    if (!form.amount) return alert("Amount is required");

    try {
      const res = await apiCall({
        fn: "factoryCostMaster.add",
        ...form,
      });

      if (res.ok === false) {
        setStatus(res.error || "Save failed");
        return;
      }

      setStatus("Factory cost saved");
      setForm(blankForm);
      loadRows();
    } catch (err) {
      setStatus(err.message);
    }
  }

  async function saveEdit() {
    if (!editing?.costId) return alert("Missing cost ID");

    try {
      const res = await apiCall({
        fn: "factoryCostMaster.update",
        ...editing,
      });

      if (res.ok === false) {
        alert(res.error || "Update failed");
        return;
      }

      setStatus("Factory cost updated");
      setEditing(null);
      loadRows();
    } catch (err) {
      alert(err.message);
    }
  }

  async function deleteRow(row) {
    const ok = window.confirm(`Delete ${row.costHead}?`);
    if (!ok) return;

    try {
      const res = await apiCall({
        fn: "factoryCostMaster.update",
        ...row,
        status: "DELETED",
      });

      if (res.ok === false) {
        alert(res.error || "Delete failed");
        return;
      }

      setStatus("Factory cost deleted");
      loadRows();
    } catch (err) {
      alert(err.message);
    }
  }

  const summary = useMemo(() => {
    const map = {};

    rows.forEach((r) => {
      const month = r.periodMonth || "Unknown";
      if (!map[month]) map[month] = { periodMonth: month, amount: 0, count: 0 };

      map[month].amount += Number(r.amount || 0);
      map[month].count += 1;
    });

    return Object.values(map).sort((a, b) =>
      String(b.periodMonth).localeCompare(String(a.periodMonth))
    );
  }, [rows]);

  const totalAmount = rows.reduce((s, r) => s + Number(r.amount || 0), 0);

  return (
    <div style={page}>
      <div style={hero}>
        <div>
          <div style={eyebrow}>Cost Engine</div>
          <h1 style={title}>Factory Cost Master</h1>
          <div style={subtitle}>
            Monthly fixed and factory costs used for manufacturing cost/kg.
          </div>
        </div>
      </div>

      <div style={kpiGrid}>
        <KPI title="Total Cost Rows" value={rows.length} />
        <KPI title="Total Amount" value={`₹ ${totalAmount.toLocaleString()}`} />
        <KPI title="Months Configured" value={summary.length} />
      </div>

      <div style={card}>
        <h2 style={{ marginTop: 0 }}>Add Factory Cost</h2>

        <form onSubmit={submit} style={formGrid}>
          <Field label="Month">
            <input
              type="month"
              name="periodMonth"
              value={form.periodMonth}
              onChange={onChange}
              style={input}
            />
          </Field>

          <Field label="Cost Head">
            <select
              name="costHead"
              value={form.costHead}
              onChange={onChange}
              style={input}
            >
              <option value="">Select Cost Head</option>
              {costHeads.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>

          <Field label="Amount ₹">
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={onChange}
              style={input}
            />
          </Field>

          <Field label="Allocation Type">
            <select
              name="allocationType"
              value={form.allocationType}
              onChange={onChange}
              style={input}
            >
              <option>FIXED</option>
              <option>VARIABLE</option>
              <option>ONE_TIME</option>
            </select>
          </Field>

          <Field label="Remarks">
            <input
              name="remarks"
              value={form.remarks}
              onChange={onChange}
              style={input}
            />
          </Field>

          <div style={buttonWrap}>
            <button type="submit" style={saveButton}>Save Cost</button>
            <button type="button" onClick={() => setForm(blankForm)} style={clearButton}>
              Clear
            </button>
          </div>
        </form>

        {status && <div style={statusBox}>{status}</div>}
      </div>

      <DataTable
        title="Factory Cost Master"
        rows={rows}
        searchFields={["periodMonth", "costHead", "allocationType", "remarks"]}
        columns={[
          { key: "periodMonth", label: "Month" },
          { key: "costHead", label: "Cost Head" },
          {
            key: "amount",
            label: "Amount",
            render: (r) => `₹ ${Number(r.amount || 0).toLocaleString()}`,
            renderExport: (r) => Number(r.amount || 0),
          },
          { key: "allocationType", label: "Type" },
          { key: "remarks", label: "Remarks" },
        ]}
        onEdit={(r) => setEditing(r)}
        onDelete={deleteRow}
      />

      {editing && (
        <div style={modalOverlay}>
          <div style={modal}>
            <h2 style={{ marginTop: 0 }}>Edit Factory Cost</h2>

            <div style={formGrid}>
              <Field label="Month">
                <input
                  type="month"
                  name="periodMonth"
                  value={editing.periodMonth || ""}
                  onChange={onEditChange}
                  style={input}
                />
              </Field>

              <Field label="Cost Head">
                <select
                  name="costHead"
                  value={editing.costHead || ""}
                  onChange={onEditChange}
                  style={input}
                >
                  <option value="">Select Cost Head</option>
                  {costHeads.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>

              <Field label="Amount ₹">
                <input
                  type="number"
                  name="amount"
                  value={editing.amount || ""}
                  onChange={onEditChange}
                  style={input}
                />
              </Field>

              <Field label="Allocation Type">
                <select
                  name="allocationType"
                  value={editing.allocationType || "FIXED"}
                  onChange={onEditChange}
                  style={input}
                >
                  <option>FIXED</option>
                  <option>VARIABLE</option>
                  <option>ONE_TIME</option>
                </select>
              </Field>

              <Field label="Remarks">
                <input
                  name="remarks"
                  value={editing.remarks || ""}
                  onChange={onEditChange}
                  style={input}
                />
              </Field>
            </div>

            <div style={modalButtons}>
              <button onClick={() => setEditing(null)} style={clearButton}>Cancel</button>
              <button onClick={saveEdit} style={saveButton}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={label}>{label}</div>
      {children}
    </div>
  );
}

function KPI({ title, value }) {
  return (
    <div style={kpi}>
      <div style={kpiTitle}>{title}</div>
      <div style={kpiValue}>{value}</div>
    </div>
  );
}

const page = { paddingBottom: 30 };

const hero = {
  background: "linear-gradient(135deg,#312e81,#0f766e)",
  color: "white",
  borderRadius: 18,
  padding: 24,
  marginBottom: 18,
};

const eyebrow = {
  fontSize: 13,
  textTransform: "uppercase",
  letterSpacing: 1.2,
  opacity: 0.85,
  fontWeight: 800,
};

const title = {
  margin: "6px 0",
  fontSize: 32,
  fontWeight: 950,
};

const subtitle = { opacity: 0.9 };

const kpiGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))",
  gap: 14,
  marginBottom: 18,
};

const kpi = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 16,
};

const kpiTitle = {
  color: "#64748b",
  fontSize: 12,
  fontWeight: 800,
  textTransform: "uppercase",
};

const kpiValue = {
  fontSize: 24,
  fontWeight: 900,
  marginTop: 6,
  color: "#0f766e",
};

const card = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 20,
  marginBottom: 18,
};

const formGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: 14,
};

const label = {
  fontSize: 12,
  color: "#475569",
  fontWeight: 700,
  marginBottom: 5,
};

const input = {
  width: "100%",
  height: 40,
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  padding: "0 10px",
  boxSizing: "border-box",
};

const buttonWrap = {
  display: "flex",
  gap: 10,
  alignItems: "end",
};

const saveButton = {
  background: "#0f766e",
  color: "white",
  border: "none",
  borderRadius: 8,
  padding: "10px 16px",
  fontWeight: 800,
  cursor: "pointer",
};

const clearButton = {
  background: "#64748b",
  color: "white",
  border: "none",
  borderRadius: 8,
  padding: "10px 16px",
  fontWeight: 800,
  cursor: "pointer",
};

const statusBox = {
  marginTop: 14,
  color: "#166534",
  fontWeight: 700,
};

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const modal = {
  background: "white",
  padding: 24,
  borderRadius: 14,
  width: 850,
  maxWidth: "95vw",
};

const modalButtons = {
  marginTop: 18,
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
};