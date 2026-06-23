import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";

export default function Suppliers() {
  const blankForm = {
    supplierId: "",
    supplierName: "",
    supplierType: "",
    city: "",
    state: "",
    address: "",
    contactPerson: "",
    phone: "",
    email: "",
    gstNo: "",
    panNo: "",
    msmeNo: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
    ifscCode: "",
    materialType: "",
    qualityRating: "",
    recoveryPercent: "",
    contaminationRisk: "",
    paymentTerms: "",
    creditDays: "",
    isPreferred: "NO",
    isActive: "TRUE",
    remarks: "",
  };

  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadRows();
  }, []);

  async function loadRows() {
    try {
      const res = await apiCall({
        fn: "suppliers.list",
      });

      setRows(res.rows || []);
    } catch (err) {
      console.log(err);
      setStatus(err.message);
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
        fn: editing ? "supplier.update" : "supplier.add",
        ...form,
      });

      if (res.ok) {
        setStatus(editing ? "Supplier updated" : "Supplier added");
        setForm(blankForm);
        setEditing(false);
        loadRows();
      } else {
        setStatus(res.error || "Save failed");
      }
    } catch (err) {
      setStatus(err.message);
    }
  }

  function editRow(row) {
    setEditing(true);
    setForm({
      ...blankForm,
      ...row,
      supplierId: row.supplierId || "",
      supplierName: row.supplierName || row.name || "",
      panNo: row.panNo || row.pan || "",
      accountNumber: row.accountNumber || row.bankAccountNo || "",
      ifscCode: row.ifscCode || row.ifsc || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function deleteRow(row) {
    const ok = window.confirm("Mark this supplier as inactive?");
    if (!ok) return;

    try {
      const res = await apiCall({
        fn: "supplier.update",
        ...row,
        supplierId: row.supplierId,
        isActive: "FALSE",
      });

      if (res.ok) {
        setStatus("Supplier marked inactive");
        loadRows();
      } else {
        setStatus(res.error || "Delete failed");
      }
    } catch (err) {
      setStatus(err.message);
    }
  }

  function cancelEdit() {
    setEditing(false);
    setForm(blankForm);
  }

  const filteredRows = useMemo(() => {
    const q = search.toLowerCase();

    return rows.filter((r) => {
      if (String(r.isActive).toUpperCase() === "FALSE") return false;

      if (!q) return true;

      return [
        r.supplierName,
        r.name,
        r.supplierType,
        r.city,
        r.state,
        r.phone,
        r.gstNo,
        r.panNo,
        r.materialType,
        r.bankName,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [rows, search]);

  const activeSuppliers = rows.filter(
    (x) => String(x.isActive).toUpperCase() !== "FALSE"
  );

  const inactiveSuppliers = rows.filter(
    (x) => String(x.isActive).toUpperCase() === "FALSE"
  );

  const supplierTypes = useMemo(() => {
    const map = {};

    rows.forEach((r) => {
      const type = r.supplierType || "Unknown";
      map[type] = (map[type] || 0) + 1;
    });

    return Object.entries(map);
  }, [rows]);

  return (
    <div style={pageStyle}>
      <div style={headerCard}>
        <div>
          <h1 style={{ margin: 0 }}>Supplier Master</h1>
          <div style={subText}>
            Supplier onboarding, compliance, banking and material intelligence
          </div>
        </div>
      </div>

      <div style={kpiGrid}>
        <KPI title="Total Suppliers" value={rows.length} />
        <KPI title="Active" value={activeSuppliers.length} />
        <KPI title="Inactive" value={inactiveSuppliers.length} />
        <KPI title="Supplier Types" value={supplierTypes.length} />
      </div>

      <form onSubmit={submit} style={formCard}>
        <h2 style={sectionHeading}>{editing ? "Edit Supplier" : "Add Supplier"}</h2>

        <SectionTitle title="Basic Information" />

        <Field label="Supplier Name">
          <input name="supplierName" value={form.supplierName} onChange={onChange} style={inputStyle} />
        </Field>

        <Field label="Supplier Type">
          <select name="supplierType" value={form.supplierType} onChange={onChange} style={inputStyle}>
            <option value="">Select Type</option>
            <option>RM Supplier</option>
            <option>Stores Supplier</option>
            <option>Transporter</option>
            <option>Service Vendor</option>
            <option>Maintenance Vendor</option>
            <option>Other</option>
          </select>
        </Field>

        <Field label="Material Type">
          <input name="materialType" value={form.materialType} onChange={onChange} style={inputStyle} />
        </Field>

        <Field label="Contact Person">
          <input name="contactPerson" value={form.contactPerson} onChange={onChange} style={inputStyle} />
        </Field>

        <Field label="Phone">
          <input name="phone" value={form.phone} onChange={onChange} style={inputStyle} />
        </Field>

        <Field label="Email">
          <input name="email" value={form.email} onChange={onChange} style={inputStyle} />
        </Field>

        <SectionTitle title="Location" />

        <Field label="City">
          <input name="city" value={form.city} onChange={onChange} style={inputStyle} />
        </Field>

        <Field label="State">
          <input name="state" value={form.state} onChange={onChange} style={inputStyle} />
        </Field>

        <Field label="Address">
          <textarea name="address" value={form.address} onChange={onChange} style={textareaStyle} />
        </Field>

        <SectionTitle title="Compliance" />

        <Field label="GST No">
          <input name="gstNo" value={form.gstNo} onChange={onChange} style={inputStyle} />
        </Field>

        <Field label="PAN No">
          <input name="panNo" value={form.panNo} onChange={onChange} style={inputStyle} />
        </Field>

        <Field label="MSME No">
          <input name="msmeNo" value={form.msmeNo} onChange={onChange} style={inputStyle} />
        </Field>

        <SectionTitle title="Bank Details" />

        <Field label="Bank Name">
          <input name="bankName" value={form.bankName} onChange={onChange} style={inputStyle} />
        </Field>

        <Field label="Account Name">
          <input name="accountName" value={form.accountName} onChange={onChange} style={inputStyle} />
        </Field>

        <Field label="Account Number">
          <input name="accountNumber" value={form.accountNumber} onChange={onChange} style={inputStyle} />
        </Field>

        <Field label="IFSC Code">
          <input name="ifscCode" value={form.ifscCode} onChange={onChange} style={inputStyle} />
        </Field>

        <SectionTitle title="Operational Quality" />

        <Field label="Quality Rating">
          <select name="qualityRating" value={form.qualityRating} onChange={onChange} style={inputStyle}>
            <option value="">Select Rating</option>
            <option>A</option>
            <option>B</option>
            <option>C</option>
            <option>Watchlist</option>
          </select>
        </Field>

        <Field label="Expected Recovery %">
          <input name="recoveryPercent" value={form.recoveryPercent} onChange={onChange} style={inputStyle} />
        </Field>

        <Field label="Contamination Risk">
          <select name="contaminationRisk" value={form.contaminationRisk} onChange={onChange} style={inputStyle}>
            <option value="">Select Risk</option>
            <option>LOW</option>
            <option>MEDIUM</option>
            <option>HIGH</option>
            <option>CRITICAL</option>
          </select>
        </Field>

        <Field label="Preferred Supplier">
          <select name="isPreferred" value={form.isPreferred} onChange={onChange} style={inputStyle}>
            <option>NO</option>
            <option>YES</option>
          </select>
        </Field>

        <SectionTitle title="Payment Terms" />

        <Field label="Payment Terms">
          <input name="paymentTerms" value={form.paymentTerms} onChange={onChange} style={inputStyle} />
        </Field>

        <Field label="Credit Days">
          <input name="creditDays" value={form.creditDays} onChange={onChange} style={inputStyle} />
        </Field>

        <Field label="Status">
          <select name="isActive" value={form.isActive} onChange={onChange} style={inputStyle}>
            <option value="TRUE">ACTIVE</option>
            <option value="FALSE">INACTIVE</option>
          </select>
        </Field>

        <Field label="Remarks">
          <textarea name="remarks" value={form.remarks} onChange={onChange} style={textareaStyle} />
        </Field>

        <div style={buttonRow}>
          {editing && (
            <button type="button" onClick={cancelEdit} style={cancelButton}>
              Cancel
            </button>
          )}

          <button type="submit" style={saveButton}>
            {editing ? "Update Supplier" : "Save Supplier"}
          </button>
        </div>
      </form>

      {status && <div style={statusStyle}>{status}</div>}

      <div style={tableCard}>
        <div style={tableHeader}>
          <h2 style={{ margin: 0 }}>Supplier Directory</h2>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search suppliers..."
            style={searchStyle}
          />
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={th}>Supplier</th>
                <th style={th}>Type</th>
                <th style={th}>City</th>
                <th style={th}>Phone</th>
                <th style={th}>GST</th>
                <th style={th}>PAN</th>
                <th style={th}>Bank</th>
                <th style={th}>Material</th>
                <th style={th}>Rating</th>
                <th style={th}>Status</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.map((r, i) => {
                const active = String(r.isActive).toUpperCase() !== "FALSE";

                return (
                  <tr key={i}>
                    <td style={td}>
                      <b>{r.supplierName || r.name}</b>
                    </td>
                    <td style={td}>{r.supplierType}</td>
                    <td style={td}>{r.city}</td>
                    <td style={td}>{r.phone}</td>
                    <td style={td}>{r.gstNo}</td>
                    <td style={td}>{r.panNo}</td>
                    <td style={td}>{r.bankName}</td>
                    <td style={td}>{r.materialType}</td>
                    <td style={td}>{r.qualityRating}</td>
                    <td style={td}>
                      <span style={active ? activeBadge : inactiveBadge}>
                        {active ? "ACTIVE" : "INACTIVE"}
                      </span>
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
                );
              })}
            </tbody>
          </table>
        </div>
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

function SectionTitle({ title }) {
  return <div style={sectionTitle}>{title}</div>;
}

function KPI({ title, value }) {
  return (
    <div style={kpiCard}>
      <div style={kpiTitle}>{title}</div>
      <div style={kpiValue}>{value}</div>
    </div>
  );
}

const pageStyle = {
  padding: 20,
};

const headerCard = {
  background: "white",
  padding: 18,
  borderRadius: 12,
  marginBottom: 16,
  border: "1px solid #e5e7eb",
};

const subText = {
  color: "#64748b",
  fontSize: 13,
  marginTop: 5,
};

const kpiGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
  gap: 14,
  marginBottom: 16,
};

const kpiCard = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 16,
};

const kpiTitle = {
  color: "#64748b",
  fontSize: 12,
  marginBottom: 8,
};

const kpiValue = {
  fontSize: 24,
  fontWeight: 700,
  color: "#005d34",
};

const formCard = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: 14,
  background: "white",
  padding: 20,
  borderRadius: 12,
  marginBottom: 18,
  border: "1px solid #e5e7eb",
};

const sectionHeading = {
  gridColumn: "1 / -1",
  margin: 0,
  color: "#005d34",
};

const sectionTitle = {
  gridColumn: "1 / -1",
  marginTop: 10,
  padding: "8px 10px",
  background: "#ecfdf5",
  color: "#005d34",
  fontWeight: 700,
  borderRadius: 8,
};

const labelStyle = {
  fontSize: 12,
  fontWeight: 700,
  marginBottom: 5,
  color: "#334155",
};

const inputStyle = {
  width: "100%",
  height: 40,
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  boxSizing: "border-box",
};

const textareaStyle = {
  ...inputStyle,
  height: 80,
  resize: "vertical",
};

const buttonRow = {
  gridColumn: "1 / -1",
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  flexWrap: "wrap",
};

const saveButton = {
  background: "#0f766e",
  color: "white",
  border: "none",
  padding: "12px 18px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
};

const cancelButton = {
  background: "#64748b",
  color: "white",
  border: "none",
  padding: "12px 18px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
};

const statusStyle = {
  color: "#0f766e",
  fontWeight: 700,
  marginBottom: 16,
};

const tableCard = {
  background: "white",
  padding: 18,
  borderRadius: 12,
  border: "1px solid #e5e7eb",
};

const tableHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  marginBottom: 15,
  flexWrap: "wrap",
};

const searchStyle = {
  padding: 10,
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  minWidth: 240,
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const th = {
  background: "#005d34",
  color: "white",
  padding: "10px 12px",
  textAlign: "left",
  fontSize: 12,
};

const td = {
  padding: "10px 12px",
  borderBottom: "1px solid #e5e7eb",
  fontSize: 13,
};

const activeBadge = {
  background: "#16a34a",
  color: "white",
  padding: "4px 10px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 700,
};

const inactiveBadge = {
  background: "#dc2626",
  color: "white",
  padding: "4px 10px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 700,
};

const editButton = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "6px 10px",
  borderRadius: 6,
  cursor: "pointer",
};

const deleteButton = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "6px 10px",
  borderRadius: 6,
  cursor: "pointer",
};