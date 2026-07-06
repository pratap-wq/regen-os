import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";
import { formatDate } from "../utils/date";
import DataTable from "../components/DataTable";

export default function RMInward() {
  const currentDate = new Date().toISOString().split("T")[0];
  const now = new Date();

  const [month, setMonth] = useState(
    String(now.getMonth() + 1).padStart(2, "0")
  );
  const [year, setYear] = useState(String(now.getFullYear()));

  const blankForm = {
    inwardId: "",
    date: currentDate,
    supplier: "",
    location: "",
    vehicleNo: "",
    material: "",
    color: "",
    procurementQtyKg: "",
    supplierInvoiceQtyKg: "",
    grossWeight: "",
    tareWeight: "",
    netWeight: "",
    transportPaidBy: "SUPPLIER",
    transportCost: "",
    transportRemarks: "",
    weightDifferenceKg: "",
    weightDifferencePercent: "",
    differenceType: "MATCH",
    deductionRequired: "NO",
    financeRemarks: "",
    debitNoteStatus: "NOT_REQUIRED",
    moisture: "",
    contamination: "",
    estimatedRecovery: "",
    ratePerKg: "",
    remarks: "",
    createdBy: "Pratap",
  };

  const [status, setStatus] = useState("");
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editingRow, setEditingRow] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

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
      setStatus(err.message);
    }
  }

  function dateForInput(value) {
    if (!value) return "";
    const text = String(value).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
    return text.slice(0, 10);
  }

  function monthMatch(value) {
    const clean = dateForInput(value);
    if (!clean) return false;
    const [y, m] = clean.split("-");
    return String(y) === year && String(m) === month;
  }

  function n(value) {
    return Number(value || 0);
  }

  function calculate(updated) {
    const gross = Number(updated.grossWeight || 0);
    const tare = Number(updated.tareWeight || 0);
    const net = gross - tare;

    updated.netWeight = net > 0 ? net.toFixed(2) : "";

    const referenceQty =
      Number(updated.supplierInvoiceQtyKg || 0) ||
      Number(updated.procurementQtyKg || 0);

    const diff = Number(updated.netWeight || 0) - referenceQty;

    updated.weightDifferenceKg = referenceQty > 0 ? diff.toFixed(2) : "";
    updated.weightDifferencePercent =
      referenceQty > 0 ? ((diff / referenceQty) * 100).toFixed(2) : "";

    if (referenceQty <= 0 || Math.abs(diff) < 0.01) {
      updated.differenceType = "MATCH";
      updated.deductionRequired = "NO";
      updated.debitNoteStatus = "NOT_REQUIRED";
    } else if (diff < 0) {
      updated.differenceType = "SHORTAGE";
      updated.deductionRequired = "YES";
      updated.debitNoteStatus =
        updated.debitNoteStatus === "NOT_REQUIRED"
          ? "PENDING"
          : updated.debitNoteStatus || "PENDING";
    } else {
      updated.differenceType = "EXCESS";
      updated.deductionRequired = "NO";
      updated.debitNoteStatus = "NOT_REQUIRED";
    }

    return updated;
  }

  function onChange(e) {
    setForm(calculate({ ...form, [e.target.name]: e.target.value }));
  }

  function onEditChange(e) {
    setEditingRow(
      calculate({
        ...editingRow,
        [e.target.name]: e.target.value,
      })
    );
  }

  function clearMainForm() {
    setForm(blankForm);
    setStatus("Ready for new RM inward entry");
  }

  function editRow(row) {
    setEditingRow(
      calculate({
        ...blankForm,
        ...row,
        inwardId: row.inwardId || "",
        date: dateForInput(row.date) || currentDate,
        createdBy: row.createdBy || "Pratap",
      })
    );
  }

  async function deleteRow(row) {
    const confirmed = window.confirm("Delete RM inward?");
    if (!confirmed) return;

    try {
      await apiCall({
        fn: "rm.update",
        ...row,
        inwardId: row.inwardId,
        status: "DELETED",
      });

      setStatus("RM inward deleted");
      loadData();
    } catch (err) {
      alert(err.message);
    }
  }

  async function submit(e) {
    e.preventDefault();

    if (!form.date) return alert("Date is mandatory");
    if (!form.supplier) return alert("Supplier is mandatory");
    if (!form.material) return alert("Material is mandatory");

    try {
      const payload = calculate({ ...form });

      const res = await apiCall({
        fn: "rm.add",
        ...payload,
      });

      if (res.ok) {
        setStatus("RM inward saved");
        setForm(blankForm);
        loadData();
      } else {
        setStatus(res.error || "Error saving RM inward");
      }
    } catch (err) {
      setStatus(err.message);
    }
  }

  async function saveEdit() {
    if (!editingRow) return;
    if (!editingRow.date) return alert("Date is mandatory");
    if (!editingRow.supplier) return alert("Supplier is mandatory");
    if (!editingRow.material) return alert("Material is mandatory");

    try {
      setSavingEdit(true);

      const payload = calculate({ ...editingRow });

      const res = await apiCall({
        fn: "rm.update",
        ...payload,
        date: dateForInput(payload.date),
        inwardId: editingRow.inwardId,
      });

      if (res.ok === false) {
        alert(res.error || "Update failed");
        return;
      }

      setStatus("RM inward updated");
      setEditingRow(null);
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingEdit(false);
    }
  }

  const filteredRows = useMemo(() => {
    return rows
      .filter((r) => monthMatch(r.date))
      .sort((a, b) =>
        String(dateForInput(b.date || "")).localeCompare(
          String(dateForInput(a.date || ""))
        )
      );
  }, [rows, month, year]);

  const totalRM = filteredRows.reduce((sum, r) => sum + n(r.netWeight), 0);

  const totalRMValue = filteredRows.reduce(
    (sum, r) => sum + n(r.netWeight) * n(r.ratePerKg),
    0
  );

  const shortageKg = filteredRows
    .filter((r) => String(r.differenceType || "").toUpperCase() === "SHORTAGE")
    .reduce((s, r) => s + Math.abs(n(r.weightDifferenceKg)), 0);

  const excessKg = filteredRows
    .filter((r) => String(r.differenceType || "").toUpperCase() === "EXCESS")
    .reduce((s, r) => s + n(r.weightDifferenceKg), 0);

  const pendingDeductions = filteredRows.filter(
    (r) =>
      String(r.deductionRequired || "").toUpperCase() === "YES" &&
      String(r.debitNoteStatus || "").toUpperCase() !== "CLOSED"
  ).length;

  const avgRMPrice = totalRM > 0 ? (totalRMValue / totalRM).toFixed(2) : 0;

  const materialVolumes = useMemo(() => {
    const map = {};

    filteredRows.forEach((r) => {
      const material = r.material || "Unknown";
      if (!map[material]) {
        map[material] = {
          material,
          qtyKg: 0,
          value: 0,
          entries: 0,
        };
      }

      map[material].qtyKg += n(r.netWeight);
      map[material].value += n(r.netWeight) * n(r.ratePerKg);
      map[material].entries += 1;
    });

    return Object.values(map)
      .map((r) => ({
        ...r,
        avgRate: r.qtyKg > 0 ? r.value / r.qtyKg : 0,
        sharePercent: totalRM > 0 ? (r.qtyKg / totalRM) * 100 : 0,
      }))
      .sort((a, b) => b.qtyKg - a.qtyKg);
  }, [filteredRows, totalRM]);
  return (
    <div style={page}>
      <div style={header}>
        <div>
          <h1 style={title}>RM Inward</h1>
          <div style={subtitle}>
            Main form is for new GRN only. Use table Edit for corrections.
          </div>
        </div>

        <div style={filters}>
          <select value={month} onChange={(e) => setMonth(e.target.value)} style={filter}>
            <option value="01">Jan</option>
            <option value="02">Feb</option>
            <option value="03">Mar</option>
            <option value="04">Apr</option>
            <option value="05">May</option>
            <option value="06">Jun</option>
            <option value="07">Jul</option>
            <option value="08">Aug</option>
            <option value="09">Sep</option>
            <option value="10">Oct</option>
            <option value="11">Nov</option>
            <option value="12">Dec</option>
          </select>

          <select value={year} onChange={(e) => setYear(e.target.value)} style={filter}>
            <option>2025</option>
            <option>2026</option>
            <option>2027</option>
          </select>
        </div>
      </div>

      <div style={gridStyle}>
        <Card title="RM Qty" value={`${totalRM.toFixed(0)} Kg`} />
        <Card title="RM Value" value={`₹ ${totalRMValue.toFixed(0)}`} />
        <Card title="Avg RM Price" value={`₹ ${avgRMPrice}`} />
        <Card title="Shortage" value={`${shortageKg.toFixed(0)} Kg`} />
        <Card title="Excess" value={`${excessKg.toFixed(0)} Kg`} />
        <Card title="Pending Deductions" value={pendingDeductions} />
      </div>

      <div style={materialBox}>
        <div style={materialHeader}>
          <div>
            <h2 style={sectionHeading}>Material Volume Summary</h2>
            <div style={muted}>Sorted by highest inward volume for selected month.</div>
          </div>
        </div>

        {materialVolumes.length === 0 ? (
          <div style={empty}>No material inward records for selected month.</div>
        ) : (
          <div style={materialGrid}>
            {materialVolumes.map((m) => (
              <div key={m.material} style={materialCard}>
                <div style={materialName}>{m.material}</div>
                <div style={materialQty}>{m.qtyKg.toFixed(0)} Kg</div>
                <div style={materialMeta}>
                  {(m.qtyKg / 1000).toFixed(1)} T | {m.sharePercent.toFixed(1)}% of RM
                </div>
                <div style={materialMeta}>
                  ₹ {m.value.toFixed(0)} | Avg ₹ {m.avgRate.toFixed(2)}/kg | {m.entries} entries
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <form
        onSubmit={submit}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
            e.preventDefault();
          }
        }}
        style={formStyle}
      >
        <SectionTitle text="Basic Details" />

        <Field label="Date">
          <input name="date" type="date" value={form.date} onChange={onChange} style={inputStyle} required />
        </Field>

        <Field label="Supplier">
          <select name="supplier" value={form.supplier} onChange={onChange} style={inputStyle} required>
            <option value="">Select Supplier</option>
            {suppliers.map((s, i) => {
              const supplierName = s.supplierName || s.name || "";
              return <option key={i} value={supplierName}>{supplierName}</option>;
            })}
          </select>
        </Field>

        <Field label="Location">
          <select name="location" value={form.location} onChange={onChange} style={inputStyle}>
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
          <input name="vehicleNo" value={form.vehicleNo} onChange={onChange} style={inputStyle} />
        </Field>

        <Field label="Material">
          <select name="material" value={form.material} onChange={onChange} style={inputStyle} required>
            <option value="">Select Material</option>
            {categories.map((c, i) => (
              <option key={i} value={c.categoryName}>{c.categoryName}</option>
            ))}
          </select>
        </Field>

        <Field label="Color">
          <select name="color" value={form.color} onChange={onChange} style={inputStyle}>
            <option value="">Select Color</option>
            {colors.map((c, i) => (
              <option key={i} value={c.colorName}>{c.colorName}</option>
            ))}
          </select>
        </Field>

        <SectionTitle text="Procurement & Factory Weight" />

        <Field label="PO / Procurement Qty Kg">
          <input type="number" name="procurementQtyKg" value={form.procurementQtyKg} onChange={onChange} style={inputStyle} />
        </Field>

        <Field label="Supplier Invoice Qty Kg">
          <input type="number" name="supplierInvoiceQtyKg" value={form.supplierInvoiceQtyKg} onChange={onChange} style={inputStyle} />
        </Field>

        <Field label="Factory Gross Kg">
          <input type="number" name="grossWeight" value={form.grossWeight} onChange={onChange} style={inputStyle} />
        </Field>

        <Field label="Factory Tare Kg">
          <input type="number" name="tareWeight" value={form.tareWeight} onChange={onChange} style={inputStyle} />
        </Field>

        <Field label="Factory Net Kg">
          <input name="netWeight" value={form.netWeight} readOnly style={readonlyStyle} />
        </Field>
        <Field label="Transport Paid By">
          <select
            name="transportPaidBy"
            value={form.transportPaidBy}
            onChange={onChange}
            style={inputStyle}
          >
            <option value="SUPPLIER">Supplier</option>
            <option value="REGEN">Regen</option>
          </select>
        </Field>

        <Field label="Transport Cost ₹">
          <input
            type="number"
            name="transportCost"
            value={form.transportCost}
            onChange={onChange}
            style={inputStyle}
          />
        </Field>

        <Field label="Transport Remarks">
          <input
            name="transportRemarks"
            value={form.transportRemarks}
            onChange={onChange}
            style={inputStyle}
          />
        </Field>

        <Field label="Difference Kg">
          <input value={form.weightDifferenceKg} readOnly style={differenceStyle(form.differenceType)} />
        </Field>

        <Field label="Difference %">
          <input value={form.weightDifferencePercent} readOnly style={differenceStyle(form.differenceType)} />
        </Field>

        <Field label="Difference Type">
          <input value={form.differenceType} readOnly style={differenceStyle(form.differenceType)} />
        </Field>

        <SectionTitle text="Quality & Commercials" />

        <Field label="Moisture %">
          <input type="number" name="moisture" value={form.moisture} onChange={onChange} style={inputStyle} />
        </Field>

        <Field label="Contamination %">
          <input type="number" name="contamination" value={form.contamination} onChange={onChange} style={inputStyle} />
        </Field>

        <Field label="Recovery %">
          <input type="number" name="estimatedRecovery" value={form.estimatedRecovery} onChange={onChange} style={inputStyle} />
        </Field>

        <Field label="Rate/Kg">
          <input type="number" name="ratePerKg" value={form.ratePerKg} onChange={onChange} style={inputStyle} />
        </Field>

        <SectionTitle text="Finance Deduction Control" />

        <Field label="Deduction Required">
          <select name="deductionRequired" value={form.deductionRequired} onChange={onChange} style={inputStyle}>
            <option>NO</option>
            <option>YES</option>
          </select>
        </Field>

        <Field label="Debit Note Status">
          <select name="debitNoteStatus" value={form.debitNoteStatus} onChange={onChange} style={inputStyle}>
            <option>NOT_REQUIRED</option>
            <option>PENDING</option>
            <option>RAISED</option>
            <option>CLOSED</option>
          </select>
        </Field>

        <Field label="Finance Remarks">
          <textarea name="financeRemarks" value={form.financeRemarks} onChange={onChange} style={textareaStyle} />
        </Field>

        <Field label="Operations Remarks">
          <textarea name="remarks" value={form.remarks} onChange={onChange} style={textareaStyle} />
        </Field>

        <div style={buttonWrap}>
          <button type="submit" style={saveButton}>Save RM Entry</button>
          <button type="button" onClick={clearMainForm} style={clearButton}>Clear / New Entry</button>
        </div>
      </form>

      {status && <div style={statusStyle}>{status}</div>}

      <DataTable
        title={`RM Inward Register - ${month}/${year}`}
        rows={filteredRows}
        searchFields={[
          "inwardId",
          "supplier",
          "vehicleNo",
          "material",
          "color",
          "differenceType",
          "debitNoteStatus",
        ]}
        columns={[
          { key: "inwardId", label: "Inward ID" },
          { key: "date", label: "Date", render: (r) => formatDate(r.date), renderExport: (r) => dateForInput(r.date) },
          { key: "supplier", label: "Supplier" },
          { key: "vehicleNo", label: "Vehicle" },
          { key: "material", label: "Material" },
          { key: "color", label: "Color" },
          { key: "supplierInvoiceQtyKg", label: "Invoice Kg" },
          { key: "netWeight", label: "Factory Net Kg" },
          { key: "transportPaidBy", label: "Transport Paid By" },
          {
            key: "transportCost",
            label: "Transport Cost",
            render: (r) => `₹ ${Number(r.transportCost || 0).toFixed(0)}`,
            renderExport: (r) => Number(r.transportCost || 0).toFixed(0),
          },
          { key: "weightDifferenceKg", label: "Diff Kg" },
          { key: "differenceType", label: "Type" },
          { key: "deductionRequired", label: "Deduction" },
          { key: "debitNoteStatus", label: "Debit Note" },
          { key: "ratePerKg", label: "Rate" },
          {
            key: "value",
            label: "Value",
            render: (r) => `₹ ${(n(r.netWeight) * n(r.ratePerKg)).toFixed(0)}`,
            renderExport: (r) => (n(r.netWeight) * n(r.ratePerKg)).toFixed(0),
          },
        ]}
        onEdit={editRow}
        onDelete={deleteRow}
      />
      {editingRow && (
        <div style={modalOverlay}>
          <div style={modal}>
            <h2 style={{ marginTop: 0 }}>Edit RM Inward</h2>

            <div style={formStyle}>
              <SectionTitle text="Basic Details" />

              <Field label="Inward ID">
                <input value={editingRow.inwardId || ""} readOnly style={readonlyStyle} />
              </Field>

              <Field label="Date">
                <input name="date" type="date" value={editingRow.date || ""} onChange={onEditChange} style={inputStyle} required />
              </Field>

              <Field label="Supplier">
                <select name="supplier" value={editingRow.supplier || ""} onChange={onEditChange} style={inputStyle} required>
                  <option value="">Select Supplier</option>
                  {suppliers.map((s, i) => {
                    const supplierName = s.supplierName || s.name || "";
                    return <option key={i} value={supplierName}>{supplierName}</option>;
                  })}
                </select>
              </Field>

              <Field label="Location">
                <select name="location" value={editingRow.location || ""} onChange={onEditChange} style={inputStyle}>
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
                <input name="vehicleNo" value={editingRow.vehicleNo || ""} onChange={onEditChange} style={inputStyle} />
              </Field>

              <Field label="Material">
                <select name="material" value={editingRow.material || ""} onChange={onEditChange} style={inputStyle} required>
                  <option value="">Select Material</option>
                  {categories.map((c, i) => (
                    <option key={i} value={c.categoryName}>{c.categoryName}</option>
                  ))}
                </select>
              </Field>

              <Field label="Color">
                <select name="color" value={editingRow.color || ""} onChange={onEditChange} style={inputStyle}>
                  <option value="">Select Color</option>
                  {colors.map((c, i) => (
                    <option key={i} value={c.colorName}>{c.colorName}</option>
                  ))}
                </select>
              </Field>

              <SectionTitle text="Procurement & Factory Weight" />

              <Field label="PO / Procurement Qty Kg">
                <input type="number" name="procurementQtyKg" value={editingRow.procurementQtyKg || ""} onChange={onEditChange} style={inputStyle} />
              </Field>

              <Field label="Supplier Invoice Qty Kg">
                <input type="number" name="supplierInvoiceQtyKg" value={editingRow.supplierInvoiceQtyKg || ""} onChange={onEditChange} style={inputStyle} />
              </Field>

              <Field label="Factory Gross Kg">
                <input type="number" name="grossWeight" value={editingRow.grossWeight || ""} onChange={onEditChange} style={inputStyle} />
              </Field>

              <Field label="Factory Tare Kg">
                <input type="number" name="tareWeight" value={editingRow.tareWeight || ""} onChange={onEditChange} style={inputStyle} />
              </Field>

              <Field label="Factory Net Kg">
                <input value={editingRow.netWeight || ""} readOnly style={readonlyStyle} />
              </Field>
              <Field label="Transport Paid By">
                <select
                  name="transportPaidBy"
                  value={editingRow.transportPaidBy || "SUPPLIER"}
                  onChange={onEditChange}
                  style={inputStyle}
                >
                  <option value="SUPPLIER">Supplier</option>
                  <option value="REGEN">Regen</option>
                </select>
              </Field>

              <Field label="Transport Cost ₹">
                <input
                  type="number"
                  name="transportCost"
                  value={editingRow.transportCost || ""}
                  onChange={onEditChange}
                  style={inputStyle}
                />
              </Field>

              <Field label="Transport Remarks">
                <input
                  name="transportRemarks"
                  value={editingRow.transportRemarks || ""}
                  onChange={onEditChange}
                  style={inputStyle}
                />
              </Field>

              <Field label="Difference Kg">
                <input value={editingRow.weightDifferenceKg || ""} readOnly style={differenceStyle(editingRow.differenceType)} />
              </Field>

              <Field label="Difference %">
                <input value={editingRow.weightDifferencePercent || ""} readOnly style={differenceStyle(editingRow.differenceType)} />
              </Field>

              <Field label="Difference Type">
                <input value={editingRow.differenceType || ""} readOnly style={differenceStyle(editingRow.differenceType)} />
              </Field>

              <SectionTitle text="Quality & Commercials" />

              <Field label="Moisture %">
                <input type="number" name="moisture" value={editingRow.moisture || ""} onChange={onEditChange} style={inputStyle} />
              </Field>

              <Field label="Contamination %">
                <input type="number" name="contamination" value={editingRow.contamination || ""} onChange={onEditChange} style={inputStyle} />
              </Field>

              <Field label="Recovery %">
                <input type="number" name="estimatedRecovery" value={editingRow.estimatedRecovery || ""} onChange={onEditChange} style={inputStyle} />
              </Field>

              <Field label="Rate/Kg">
                <input type="number" name="ratePerKg" value={editingRow.ratePerKg || ""} onChange={onEditChange} style={inputStyle} />
              </Field>

              <SectionTitle text="Finance Deduction Control" />

              <Field label="Deduction Required">
                <select name="deductionRequired" value={editingRow.deductionRequired || "NO"} onChange={onEditChange} style={inputStyle}>
                  <option>NO</option>
                  <option>YES</option>
                </select>
              </Field>

              <Field label="Debit Note Status">
                <select name="debitNoteStatus" value={editingRow.debitNoteStatus || "NOT_REQUIRED"} onChange={onEditChange} style={inputStyle}>
                  <option>NOT_REQUIRED</option>
                  <option>PENDING</option>
                  <option>RAISED</option>
                  <option>CLOSED</option>
                </select>
              </Field>

              <Field label="Finance Remarks">
                <textarea name="financeRemarks" value={editingRow.financeRemarks || ""} onChange={onEditChange} style={textareaStyle} />
              </Field>

              <Field label="Operations Remarks">
                <textarea name="remarks" value={editingRow.remarks || ""} onChange={onEditChange} style={textareaStyle} />
              </Field>
            </div>

            <div style={modalButtons}>
              <button type="button" onClick={() => setEditingRow(null)} style={cancelButton}>
                Cancel
              </button>

              <button type="button" onClick={saveEdit} disabled={savingEdit} style={modalSaveButton}>
                {savingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function Card({ title, value }) {
  return (
    <div style={card}>
      <div style={cardTitle}>{title}</div>
      <div style={cardValue}>{value}</div>
    </div>
  );
}

function SectionTitle({ text }) {
  return (
    <div
      style={{
        gridColumn: "1 / -1",
        marginTop: 8,
        marginBottom: 4,
        fontWeight: 800,
        color: "#0f766e",
        fontSize: 16,
      }}
    >
      {text}
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

function differenceStyle(type) {
  if (type === "SHORTAGE") {
    return {
      ...readonlyStyle,
      background: "#fee2e2",
      color: "#991b1b",
      fontWeight: 700,
    };
  }

  if (type === "EXCESS") {
    return {
      ...readonlyStyle,
      background: "#dcfce7",
      color: "#166534",
      fontWeight: 700,
    };
  }

  return readonlyStyle;
}

const page = {
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
};

const subtitle = {
  color: "#64748b",
  marginTop: 4,
};

const filters = {
  display: "flex",
  gap: 10,
};

const filter = {
  padding: 10,
  borderRadius: 8,
  border: "1px solid #cbd5e1",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
  gap: 14,
  marginBottom: 20,
};

const card = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 16,
};

const cardTitle = {
  fontSize: 13,
  color: "#64748b",
};

const cardValue = {
  fontSize: 24,
  fontWeight: 800,
  marginTop: 6,
  color: "#0f766e",
};

const materialBox = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 18,
  marginBottom: 20,
};

const materialHeader = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 12,
};

const sectionHeading = {
  margin: 0,
  color: "#0f766e",
};

const muted = {
  color: "#64748b",
  fontSize: 13,
};

const materialGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
  gap: 14,
};

const materialCard = {
  border: "1px solid #dbeafe",
  background: "#f8fafc",
  borderRadius: 10,
  padding: 14,
};

const materialName = {
  fontWeight: 800,
  color: "#0f766e",
};

const materialQty = {
  fontSize: 22,
  fontWeight: 800,
  marginTop: 8,
};

const materialMeta = {
  color: "#64748b",
  fontSize: 13,
  marginTop: 6,
};

const empty = {
  color: "#64748b",
  padding: 20,
};

const formStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: 14,
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 20,
  marginBottom: 20,
};

const labelStyle = {
  fontSize: 12,
  color: "#475569",
  marginBottom: 6,
  fontWeight: 700,
};

const inputStyle = {
  width: "100%",
  padding: 10,
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  boxSizing: "border-box",
};

const readonlyStyle = {
  ...inputStyle,
  background: "#f8fafc",
};

const textareaStyle = {
  ...inputStyle,
  minHeight: 70,
  resize: "vertical",
};

const buttonWrap = {
  gridColumn: "1 / -1",
  display: "flex",
  gap: 10,
  marginTop: 10,
};

const saveButton = {
  background: "#0f766e",
  color: "white",
  border: "none",
  padding: "12px 22px",
  borderRadius: 8,
  fontWeight: 700,
  cursor: "pointer",
};

const clearButton = {
  background: "#64748b",
  color: "white",
  border: "none",
  padding: "12px 22px",
  borderRadius: 8,
  fontWeight: 700,
  cursor: "pointer",
};

const statusStyle = {
  marginBottom: 20,
  color: "#166534",
  fontWeight: 700,
};

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const modal = {
  background: "white",
  width: "95%",
  maxWidth: 1200,
  maxHeight: "90vh",
  overflow: "auto",
  borderRadius: 12,
  padding: 24,
};

const modalButtons = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  marginTop: 20,
};

const cancelButton = {
  background: "#64748b",
  color: "white",
  border: "none",
  padding: "10px 18px",
  borderRadius: 8,
  cursor: "pointer",
};

const modalSaveButton = {
  background: "#16a34a",
  color: "white",
  border: "none",
  padding: "10px 18px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
};