import { useEffect, useMemo, useRef, useState } from "react";

import { apiCall } from "../api/api";
import FactoryDropdown from "../components/FactoryDropdown";
import { createStableTransactionId, requireSuccessfulResponse, withRequestTimeout } from "../utils/requestSafety";

import {
  pageStyle,
  sectionCard,
  sectionTitle,
  formGrid,
  inputStyle,
  textareaStyle,
  primaryButton,
  tableCard,
  tableStyle,
  thStyle,
  tdStyle,
} from "../ui/styles";

const MONTHS = [
  { value: "01", label: "Jan" },
  { value: "02", label: "Feb" },
  { value: "03", label: "Mar" },
  { value: "04", label: "Apr" },
  { value: "05", label: "May" },
  { value: "06", label: "Jun" },
  { value: "07", label: "Jul" },
  { value: "08", label: "Aug" },
  { value: "09", label: "Sep" },
  { value: "10", label: "Oct" },
  { value: "11", label: "Nov" },
  { value: "12", label: "Dec" },
];

const PAYMENT_STATUSES = ["Unpaid", "Paid", "Pending", "Accrued"];

function todayYmd() {
  return new Date().toISOString().split("T")[0];
}

function selectedPeriod(year, month) {
  return `${year}-${month}`;
}

function periodFromDate(dateValue) {
  const text = String(dateValue || "").trim();
  if (/^\d{4}-\d{2}/.test(text)) return text.slice(0, 7);
  return "";
}

function rowPeriod(row) {
  const periodMonth = String(row.periodMonth || "").trim();
  if (/^\d{4}-\d{2}/.test(periodMonth)) return periodMonth.slice(0, 7);

  const month = String(row.month || "").trim();
  const year = String(row.year || "").trim();
  const monthNumber = MONTHS.find((m) => m.label.toLowerCase() === month.toLowerCase())?.value || month.padStart(2, "0");
  if (/^\d{4}$/.test(year) && /^\d{2}$/.test(monthNumber)) return `${year}-${monthNumber}`;

  return periodFromDate(row.date);
}

function dateForInput(value) {
  if (!value) return "";
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  return text.slice(0, 10);
}

function isActive(row) {
  const status = String(row.status || "ACTIVE").toUpperCase();
  const issueStatus = String(row.issueStatus || "").toUpperCase();
  return status !== "DELETED" && status !== "INACTIVE" && issueStatus !== "DELETED" && issueStatus !== "INACTIVE";
}

function money(value) {
  return `₹ ${Number(value || 0).toFixed(0)}`;
}

function normalizeRow(row) {
  return {
    ...row,
    description: row.description || row.itemName || "",
    paidBy: row.paidBy || "",
    status: row.status || "ACTIVE",
  };
}

function uniqueOptions(values, ...currentValues) {
  return [...new Set([...(values || []), ...currentValues].map((value) => String(value || "").trim()).filter(Boolean))].sort();
}

function storesIssueValue(row) {
  const qty = Number(row.qty || row.quantity || row.quantityKg || 0);
  const rate = Number(row.issueRate || row.rate || 0);
  return Number(row.issueValue || row.value || row.amount || qty * rate || 0);
}

export default function FactoryExpenses() {
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1).padStart(2, "0"));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [storesIssueRows, setStoresIssueRows] = useState([]);
  const [status, setStatus] = useState("");
  const [editingExpenseId, setEditingExpenseId] = useState("");
  const [writeAction, setWriteAction] = useState("");
  const writeLockRef = useRef(false);

  const blankForm = {
    date: todayYmd(),
    periodMonth: selectedPeriod(year, month),
    category: "",
    description: "",
    amount: "",
    paidBy: "",
    status: "ACTIVE",
    remarks: "",
    createdBy: "Pratap",
  };

  const [form, setForm] = useState(blankForm);

  useEffect(() => {
    loadRows();
  }, []);

  useEffect(() => {
    if (!editingExpenseId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm((prev) => ({ ...prev, periodMonth: selectedPeriod(year, month) }));
    }
  }, [month, year, editingExpenseId]);

  async function loadRows() {
    try {
      const [expenseRes, storesIssueRes] = await Promise.all([
        apiCall({ fn: "factoryExpenses.list" }),
        apiCall({ fn: "storesIssue.list" }),
      ]);
      setRows((expenseRes.rows || []).map(normalizeRow));
      setStoresIssueRows(storesIssueRes.rows || []);
    } catch (err) {
      setStatus(err.message);
    }
  }

  function onChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function resetForm(message = "") {
    setEditingExpenseId("");
    setForm({
      ...blankForm,
      date: todayYmd(),
      periodMonth: selectedPeriod(year, month),
    });
    if (message) setStatus(message);
  }

  async function submit(e) {
    e.preventDefault();
    if (writeLockRef.current) return;

    if (!form.date) return alert("Date is mandatory");
    if (!form.periodMonth) return alert("Period Month is mandatory");
    if (!form.category) return alert("Category is mandatory");
    if (!form.description) return alert("Description is mandatory");
    if (Number(form.amount || 0) <= 0) return alert("Amount must be greater than zero");

    writeLockRef.current = true;
    setWriteAction(editingExpenseId ? "UPDATE" : "SAVE");
    setStatus(editingExpenseId ? "Updating factory expense..." : "Saving factory expense...");
    const expenseId = editingExpenseId || form.expenseId || createStableTransactionId("EXP", form.date, form.category);
    if (!editingExpenseId && !form.expenseId) setForm((current) => ({ ...current, expenseId }));
    try {
      const res = requireSuccessfulResponse(await withRequestTimeout(apiCall({
        fn: editingExpenseId ? "factoryExpenses.update" : "factoryExpenses.add",
        ...form,
        expenseId,
        itemName: form.description,
      })), editingExpenseId ? "" : "expenseId", editingExpenseId ? "Factory expense update" : "Factory expense save");

      resetForm(`${editingExpenseId ? "Factory expense updated" : "Factory expense saved"}: ${res.expenseId || res.id || expenseId}`);
      await loadRows();
    } catch (err) {
      setStatus(err.message);
    } finally {
      writeLockRef.current = false;
      setWriteAction("");
    }
  }

  function editExpense(row) {
    setEditingExpenseId(row.expenseId || "");
    setForm({
      ...blankForm,
      ...row,
      date: dateForInput(row.date) || todayYmd(),
      periodMonth: rowPeriod(row) || selectedPeriod(year, month),
      category: row.category || "",
      description: row.description || row.itemName || "",
      amount: row.amount || "",
      paidBy: row.paidBy || "",
      status: row.status || "ACTIVE",
      remarks: row.remarks || "",
      createdBy: row.createdBy || "Pratap",
    });
    setStatus(`Editing expense ${row.expenseId || ""}`);
  }

  async function deleteExpense(row) {
    const ok = window.confirm("Delete this factory expense? This will soft-delete the row and exclude it from totals.");
    if (!ok) return;

    if (writeLockRef.current) return;
    writeLockRef.current = true;
    setWriteAction(`DELETE:${row.expenseId}`);
    setStatus("Deleting factory expense...");
    try {
      requireSuccessfulResponse(await withRequestTimeout(apiCall({
        fn: "factoryExpenses.delete",
        expenseId: row.expenseId,
        deletedBy: "Pratap",
      })), "", "Factory expense delete");

      if (editingExpenseId === row.expenseId) resetForm();
      setStatus("Factory expense deleted");
      await loadRows();
    } catch (err) {
      setStatus(err.message);
    } finally {
      writeLockRef.current = false;
      setWriteAction("");
    }
  }

  const selectedMonth = selectedPeriod(year, month);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows
      .filter(isActive)
      .filter((row) => rowPeriod(row) === selectedMonth)
      .filter((row) => !categoryFilter || String(row.category || "") === categoryFilter)
      .filter((row) => {
        if (!q) return true;
        return [row.category, row.description, row.itemName, row.paidBy, row.status, row.remarks]
          .join(" ")
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) => String(dateForInput(b.date)).localeCompare(String(dateForInput(a.date))));
  }, [rows, selectedMonth, categoryFilter, search]);

  const monthlyRows = rows.filter(isActive).filter((row) => rowPeriod(row) === selectedMonth);
  const manualFactoryExpenses = monthlyRows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const autoStoresConsumed = storesIssueRows
    .filter(isActive)
    .filter((row) => rowPeriod(row) === selectedMonth)
    .reduce((sum, row) => sum + storesIssueValue(row), 0);
  const combinedFactoryOverhead = manualFactoryExpenses + autoStoresConsumed;
  const labourSalaries = monthlyRows
    .filter((row) => ["Labour", "Salaries", "Salary"].includes(String(row.category || "")))
    .reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const categoryOptions = useMemo(
    () => uniqueOptions(rows.map((row) => row.category), form.category, categoryFilter),
    [rows, form.category, categoryFilter]
  );

  return (
    <div style={pageStyle}>
      <div style={sectionCard}>
        <div style={headerRow}>
          <div>
            <div style={sectionTitle}>Factory Expenses</div>
            <div style={subtitle}>Monthly overhead entry and review. Totals use period month first, then date fallback.</div>
          </div>

          <div style={toolbar}>
            <select value={month} onChange={(e) => setMonth(e.target.value)} style={inputStyle}>
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            <select value={year} onChange={(e) => setYear(e.target.value)} style={inputStyle}>
              <option>2025</option>
              <option>2026</option>
              <option>2027</option>
            </select>

            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={inputStyle}>
              <option value="">All Categories</option>
              {categoryOptions.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              style={inputStyle}
            />

            <button type="button" onClick={loadRows} style={refreshButton}>
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div style={kpiGrid}>
        <KPI title="Manual Factory Expenses Total" value={money(manualFactoryExpenses)} />
        <KPI title="Auto Stores Consumed Total" value={money(autoStoresConsumed)} />
        <KPI title="Combined Factory Overhead Total" value={money(combinedFactoryOverhead)} />
        <KPI title="Labour + Salaries" value={money(labourSalaries)} />
      </div>

      <div style={readOnlyNote}>
        Stores consumed is read-only and comes from Stores Issue values for {selectedMonth}. It is not inserted into Factory Expenses as an editable row, so CEO Cockpit and Month Close can keep stores cost and manual factory expenses separate.
      </div>

      <div style={sectionCard}>
        <div style={sectionTitle}>{editingExpenseId ? "Edit Expense" : "Expense Entry"}</div>

        <form onSubmit={submit} style={formGrid}>
          <Field label="Date">
            <input name="date" type="date" value={form.date} onChange={onChange} style={inputStyle} required />
          </Field>

          <Field label="Period Month">
            <input name="periodMonth" type="month" value={form.periodMonth} onChange={onChange} style={inputStyle} required />
          </Field>

          <Field label="Category">
            <FactoryDropdown
              masterType="expenseCategory"
              name="category"
              value={form.category}
              onChange={onChange}
              placeholder="Select Category"
              style={inputStyle}
              allowAddNew
              required
            />
          </Field>

          <Field label="Description">
            <input
              name="description"
              value={form.description}
              onChange={onChange}
              placeholder="Expense description"
              style={inputStyle}
              required
            />
          </Field>

          <Field label="Amount">
            <input
              name="amount"
              type="number"
              value={form.amount}
              onChange={onChange}
              placeholder="Amount ₹"
              style={inputStyle}
              required
            />
          </Field>

          <Field label="Paid By">
            <input name="paidBy" value={form.paidBy} onChange={onChange} placeholder="Cash / Bank / Person" style={inputStyle} />
          </Field>

          <Field label="Status">
            <select name="status" value={form.status} onChange={onChange} style={inputStyle}>
              {PAYMENT_STATUSES.map((x) => (
                <option key={x}>{x}</option>
              ))}
              <option>ACTIVE</option>
            </select>
          </Field>

          <Field label="Remarks">
            <textarea name="remarks" value={form.remarks} onChange={onChange} placeholder="Remarks" style={textareaStyle} />
          </Field>

          <div style={buttonRow}>
            <button type="submit" disabled={Boolean(writeAction)} style={primaryButton}>
              {writeAction === "SAVE" ? "Saving..." : writeAction === "UPDATE" ? "Updating..." : editingExpenseId ? "Update Expense" : "Save Expense"}
            </button>
            {editingExpenseId && (
              <button type="button" disabled={Boolean(writeAction)} onClick={() => resetForm("Edit cancelled")} style={secondaryButton}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        {status && <div style={statusStyle}>{status}</div>}
      </div>

      <div style={sectionCard}>
        <div style={sectionTitle}>Expense History - {selectedMonth}</div>
        <div style={tableCard}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Period Month</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Description</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Paid By</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Remarks</th>
                <th style={thStyle}>Edit</th>
                <th style={thStyle}>Delete</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.expenseId || `${row.date}-${row.description}`}>
                  <td style={tdStyle}>{dateForInput(row.date)}</td>
                  <td style={tdStyle}>{rowPeriod(row)}</td>
                  <td style={tdStyle}><b>{row.category}</b></td>
                  <td style={tdStyle}>{row.description}</td>
                  <td style={tdStyle}>{money(row.amount)}</td>
                  <td style={tdStyle}>{row.paidBy}</td>
                  <td style={tdStyle}>{row.status || "ACTIVE"}</td>
                  <td style={tdStyle}>{row.remarks}</td>
                  <td style={tdStyle}>
                    <button type="button" onClick={() => editExpense(row)} style={editButton}>
                      Edit
                    </button>
                  </td>
                  <td style={tdStyle}>
                    <button type="button" disabled={Boolean(writeAction)} onClick={() => deleteExpense(row)} style={deleteButton}>
                      {writeAction === `DELETE:${row.expenseId}` ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr>
                  <td style={tdStyle} colSpan="10">
                    No active expenses found for selected filters.
                  </td>
                </tr>
              )}
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
      <div style={{ marginBottom: 4, fontWeight: 600, color: "#334155", fontSize: 12 }}>{label}</div>
      {children}
    </div>
  );
}

function KPI({ title, value }) {
  return (
    <div style={kpiCard}>
      <div style={{ color: "#64748b", fontSize: 12, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: "#005d34" }}>{value}</div>
    </div>
  );
}

const headerRow = { display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" };
const subtitle = { color: "#64748b", fontSize: 13 };
const toolbar = { display: "grid", gridTemplateColumns: "repeat(5,minmax(120px,1fr))", gap: 10, minWidth: "min(760px,100%)" };
const kpiGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14, marginBottom: 16 };
const kpiCard = { background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 };
const buttonRow = { display: "flex", alignItems: "end", gap: 10, flexWrap: "wrap" };
const refreshButton = { background: "#005d34", color: "white", border: "none", borderRadius: 8, padding: "9px 12px", fontWeight: 700, cursor: "pointer" };
const secondaryButton = { background: "#64748b", color: "white", border: "none", padding: "10px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 700 };
const editButton = { background: "#2563eb", color: "white", border: "none", padding: "7px 10px", borderRadius: 8, cursor: "pointer", fontWeight: 700 };
const deleteButton = { background: "#dc2626", color: "white", border: "none", padding: "7px 10px", borderRadius: 8, cursor: "pointer", fontWeight: 700 };
const statusStyle = { marginTop: 14, fontWeight: 600, color: "#0f766e" };
const readOnlyNote = { background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: 12, padding: 12, marginBottom: 16, color: "#334155", fontSize: 13, fontWeight: 700 };
