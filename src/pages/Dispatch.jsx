import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";
import DataTable from "../components/DataTable";
import OperationalWorkspace from "../components/OperationalWorkspace";

const today = new Date().toISOString().slice(0, 10);
const now = new Date();
const fgMaterials = ["E1", "E2", "E3", "E4", "E5"];

const blankForm = {
  dispatchId: "",
  date: today,
  customerName: "Mold-Tek",
  vehicleNo: "",
  grade: "E1",
  quantityKg: "",
  dispatchStatus: "DISPATCHED",
  customerUnit: "",
  invoiceNo: "",
  ratePerKg: "",
  noOfBags: "",
  driverName: "",
  dispatchLocation: "",
  remarks: "",
  sourceExtrusionBatchId: "",
  lotNo: "",
  dispatchLines: "[]",
};

export default function Dispatch() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editingRow, setEditingRow] = useState(null);
  const [status, setStatus] = useState("");
  const [month, setMonth] = useState(String(now.getMonth() + 1).padStart(2, "0"));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await apiCall({ fn: "dispatch.list" });
      setRows(res.rows || []);
    } catch (err) {
      setStatus(err.message);
    }
  }

  function onChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  const activeRows = useMemo(
    () =>
      rows.filter(
        (r) =>
          String(r.dispatchStatus || "").toUpperCase() !== "DELETED" &&
          String(r.status || "").toUpperCase() !== "DELETED"
      ),
    [rows]
  );

  const totals = useMemo(() => {
    const dispatchKg = activeRows.reduce((s, row) => s + Number(row.quantityKg || 0), 0);
    const salesValue = activeRows.reduce(
      (s, row) => s + Number(row.quantityKg || 0) * Number(row.ratePerKg || 0),
      0
    );
    const customers = new Set(activeRows.map((row) => row.customerName).filter(Boolean));

    return {
      dispatchKg,
      salesValue,
      customers: customers.size,
      entries: activeRows.length,
    };
  }, [activeRows]);

  async function submit(e) {
    e.preventDefault();
    setStatus("");

    if (!form.grade) {
      setStatus("Select material.");
      return;
    }

    if (Number(form.quantityKg || 0) <= 0) {
      setStatus("Enter dispatch quantity.");
      return;
    }

    if (!form.customerName || !form.vehicleNo) {
      setStatus("Customer and vehicle are required.");
      return;
    }

    const payload = {
      ...form,
      lotNo: "",
      sourceExtrusionBatchId: "",
      linkedFgBatchId: "",
      dispatchLines: JSON.stringify([
        {
          sourceExtrusionBatchId: "",
          lotNo: "",
          grade: form.grade,
          productionDate: form.date,
          productionShift: "",
          availableKg: 0,
          dispatchQtyKg: Number(form.quantityKg || 0),
          remarks: "Material Inventory dispatch",
        },
      ]),
    };

    const res = await apiCall({
      fn: editingRow?.dispatchId ? "dispatch.update" : "dispatch.add",
      ...payload,
      dispatchId: editingRow?.dispatchId || form.dispatchId,
    });

    if (res.ok === false) {
      setStatus(res.error || "Dispatch save failed");
      return;
    }

    setStatus(editingRow ? "Dispatch updated" : "Dispatch saved");
    setEditingRow(null);
    setForm(blankForm);
    loadData();
  }

  function editRow(row) {
    setEditingRow(row);
    setForm({
      ...blankForm,
      ...row,
      date: normalizeDate(row.date) || today,
      grade: normalizeGrade(row.grade),
      quantityKg: row.quantityKg || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteRow(row) {
    if (!window.confirm("Soft delete dispatch?")) return;

    const res = await apiCall({
      fn: "dispatch.update",
      ...row,
      dispatchId: row.dispatchId,
      status: "DELETED",
      dispatchStatus: "DELETED",
    });

    if (res.ok === false) {
      setStatus(res.error || "Delete failed");
      return;
    }

    setStatus("Dispatch soft deleted");
    loadData();
  }

  function clearForm() {
    setEditingRow(null);
    setForm(blankForm);
    setStatus("Ready for new dispatch");
  }

  return (
    <OperationalWorkspace
      eyebrow="Operator Workflow"
      title="Dispatch"
      subtitle="Dispatch consumes Material Inventory. Choose material, quantity, customer and vehicle."
      month={month}
      year={year}
      search={search}
      onMonthChange={setMonth}
      onYearChange={setYear}
      onSearchChange={setSearch}
      onRefresh={loadData}
      snapshots={[
        { label: "Dispatch Kg", value: `${fmt(totals.dispatchKg)} Kg` },
        { label: "Sales", value: `₹ ${fmt0(totals.salesValue)}` },
        { label: "Customers", value: totals.customers },
        { label: "Entries", value: totals.entries },
      ]}
      entryTitle={editingRow ? "Edit Dispatch" : "New Dispatch"}
      historyTitle="Dispatch History"
      history={
        <DataTable
          title="Dispatch History"
          rows={activeRows}
          searchFields={["dispatchId", "customerName", "vehicleNo", "grade", "dispatchStatus"]}
          columns={[
            { key: "date", label: "Date" },
            { key: "dispatchId", label: "Dispatch" },
            { key: "customerName", label: "Customer" },
            { key: "vehicleNo", label: "Vehicle" },
            { key: "grade", label: "Material" },
            { key: "quantityKg", label: "Qty Kg" },
            { key: "ratePerKg", label: "Rate" },
            { key: "dispatchStatus", label: "Status" },
          ]}
          onEdit={editRow}
          onDelete={deleteRow}
        />
      }
    >
      {status && <div style={statusStyle}>{status}</div>}

      <form onSubmit={submit} style={formGrid}>
        <Field label="Date">
          <input type="date" name="date" value={form.date} onChange={onChange} style={inputStyle} />
        </Field>

        <Field label="Material">
          <select name="grade" value={form.grade} onChange={onChange} style={inputStyle}>
            {fgMaterials.map((material) => (
              <option key={material} value={material}>
                {material}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Quantity Kg">
          <input
            type="number"
            min="0"
            step="0.01"
            name="quantityKg"
            value={form.quantityKg}
            onChange={onChange}
            style={inputStyle}
            placeholder="25000"
          />
        </Field>

        <Field label="Customer">
          <input name="customerName" value={form.customerName} onChange={onChange} style={inputStyle} />
        </Field>

        <Field label="Vehicle">
          <input name="vehicleNo" value={form.vehicleNo} onChange={onChange} style={inputStyle} />
        </Field>

        <Field label="Rate / Kg">
          <input name="ratePerKg" value={form.ratePerKg} onChange={onChange} style={inputStyle} />
        </Field>

        <Field label="Invoice">
          <input name="invoiceNo" value={form.invoiceNo} onChange={onChange} style={inputStyle} />
        </Field>

        <Field label="Status">
          <select name="dispatchStatus" value={form.dispatchStatus} onChange={onChange} style={inputStyle}>
            <option>DISPATCHED</option>
            <option>IN_TRANSIT</option>
            <option>DELIVERED</option>
          </select>
        </Field>

        <div style={actions}>
          <button type="button" onClick={clearForm} style={secondaryButton}>
            Clear
          </button>
          <button type="submit" style={primaryButton}>
            {editingRow ? "Update Dispatch" : "Save Dispatch"}
          </button>
        </div>
      </form>
    </OperationalWorkspace>
  );
}

function Field({ label, children }) {
  return (
    <label style={field}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function normalizeDate(value) {
  if (!value) return "";
  const text = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  return text.slice(0, 10);
}

function normalizeGrade(value) {
  const match = String(value || "").toUpperCase().match(/\bE[1-5]\b/);
  return match ? match[0] : "E1";
}

function fmt(value) {
  return Number(value || 0).toFixed(2);
}

function fmt0(value) {
  return Number(value || 0).toFixed(0);
}

const formGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
};

const field = {
  display: "grid",
  gap: 6,
  color: "#334155",
  fontSize: 12,
  fontWeight: 850,
};

const inputStyle = {
  width: "100%",
  height: 42,
  padding: "0 12px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  boxSizing: "border-box",
};

const actions = {
  gridColumn: "1 / -1",
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
};

const primaryButton = {
  border: "none",
  borderRadius: 10,
  background: "#00b26b",
  color: "white",
  padding: "12px 18px",
  fontWeight: 900,
  cursor: "pointer",
};

const secondaryButton = {
  ...primaryButton,
  background: "#64748b",
};

const statusStyle = {
  background: "#ecfdf5",
  border: "1px solid #86efac",
  color: "#166534",
  borderRadius: 12,
  padding: 12,
  fontWeight: 850,
  marginBottom: 14,
};
