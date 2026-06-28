import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";
import { formatDate } from "../utils/date";
import DataTable from "../components/DataTable";

import {
  pageStyle,
  sectionCard,
  sectionTitle,
  formGrid,
  inputStyle,
  textareaStyle,
  readonlyStyle,
  primaryButton,
} from "../ui/styles";

export default function StoresIssue() {
  const today = new Date().toISOString().split("T")[0];

  const departments = [
    "Extrusion",
    "Washline",
    "Washingline",
    "Maintenance",
    "Utilities",
    "Admin",
    "Quality",
    "Packing",
    "Stores",
  ];

  const blankForm = {
    date: today,
    itemName: "",
    category: "",
    qty: "",
    issueRate: "",
    issueValue: "",
    department: "",
    purpose: "",
    remarks: "",
    createdBy: "Pratap",
  };

  const [rows, setRows] = useState([]);
  const [items, setItems] = useState([]);
  const [stockMap, setStockMap] = useState({});
  const [status, setStatus] = useState("");
  const [form, setForm] = useState(blankForm);
  const [editingRow, setEditingRow] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [backfilling, setBackfilling] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function safeList(fn) {
    try {
      const res = await apiCall({ fn });
      return res.rows || [];
    } catch (err) {
      console.log(fn, err);
      return [];
    }
  }

  async function loadData() {
    try {
      const [issueRows, masterRows, consumableRows, inwardRows] =
        await Promise.all([
          safeList("storesIssue.list"),
          safeList("storesMaster.list"),
          safeList("consumables.list"),
          safeList("storesInward.list"),
        ]);

      const cleanIssueRows = issueRows.filter(
        (r) => String(r.status || "").toUpperCase() !== "DELETED"
      );

      const inwardClean = inwardRows.filter(
        (r) => String(r.status || "").toUpperCase() !== "DELETED"
      );

      const stock = {};

      inwardClean.forEach((r) => {
        const item = r.itemName || "";
        if (!item) return;

        const qty = Number(r.qty || 0);
        const rate = Number(r.rate || 0);
        const amount = Number(r.totalAmount || qty * rate);

        if (!stock[item]) {
          stock[item] = {
            inwardQty: 0,
            inwardValue: 0,
            issueQty: 0,
            issueValue: 0,
            avgRate: 0,
          };
        }

        stock[item].inwardQty += qty;
        stock[item].inwardValue += amount;
      });

      cleanIssueRows.forEach((r) => {
        const item = r.itemName || "";
        if (!item) return;

        const qty = Number(r.qty || 0);
        const rate = Number(r.issueRate || 0);
        const value = Number(r.issueValue || qty * rate);

        if (!stock[item]) {
          stock[item] = {
            inwardQty: 0,
            inwardValue: 0,
            issueQty: 0,
            issueValue: 0,
            avgRate: 0,
          };
        }

        stock[item].issueQty += qty;
        stock[item].issueValue += value;
      });

      Object.keys(stock).forEach((item) => {
        stock[item].avgRate =
          Number(stock[item].inwardQty || 0) > 0
            ? Number(stock[item].inwardValue || 0) /
              Number(stock[item].inwardQty || 0)
            : 0;
      });

      setStockMap(stock);

      const mergedMap = {};

      function addMasterItem(x) {
        const itemName = x.itemName || x.item || x.name || "";
        if (!itemName) return;
        if (String(x.status || "").toUpperCase() === "DELETED") return;
        if (String(x.isActive || "TRUE").toUpperCase() === "FALSE") return;

        const inwardRate = stock[itemName]?.avgRate || 0;

        mergedMap[itemName] = {
          ...mergedMap[itemName],
          ...x,
          itemName,
          category: x.category || mergedMap[itemName]?.category || "",
          unit: x.unit || mergedMap[itemName]?.unit || "",
          standardRate:
            inwardRate ||
            x.standardRate ||
            x.rate ||
            x.ratePerUnit ||
            mergedMap[itemName]?.standardRate ||
            "",
        };
      }

      masterRows.forEach(addMasterItem);
      consumableRows.forEach(addMasterItem);
      inwardClean.forEach(addMasterItem);

      setItems(
        Object.values(mergedMap).sort((a, b) =>
          String(a.itemName).localeCompare(String(b.itemName))
        )
      );

      const enrichedRows = cleanIssueRows.map((r) => {
        const currentRate = Number(r.issueRate || 0);
        const autoRate = Number(stock[r.itemName]?.avgRate || 0);
        const finalRate = currentRate || autoRate || 0;
        const qty = Number(r.qty || 0);

        return {
          ...r,
          issueRate: currentRate ? r.issueRate : finalRate ? finalRate.toFixed(2) : r.issueRate,
          issueValue: Number(r.issueValue || 0)
            ? r.issueValue
            : finalRate
            ? (qty * finalRate).toFixed(2)
            : r.issueValue,
          rateSource:
            currentRate > 0
              ? "Saved"
              : autoRate > 0
              ? "Auto from Inward Avg"
              : "Missing",
        };
      });

      setRows(enrichedRows);
    } catch (err) {
      setStatus(err.message);
    }
  }

  function calcValue(qty, rate) {
    return Number(qty || 0) * Number(rate || 0);
  }

  function getItemRate(itemName) {
    const inwardAvgRate = Number(stockMap[itemName]?.avgRate || 0);
    if (inwardAvgRate > 0) return inwardAvgRate;

    const item = items.find((x) => x.itemName === itemName);

    return Number(item?.standardRate || item?.rate || item?.ratePerUnit || 0);
  }

  function calculateIssueValue(updated) {
    updated.issueValue = calcValue(updated.qty, updated.issueRate).toFixed(2);
    return updated;
  }

  function onChange(e) {
    let updated = {
      ...form,
      [e.target.name]: e.target.value,
    };

    if (e.target.name === "itemName") {
      const selected = items.find((x) => x.itemName === e.target.value);

      if (selected) {
        const autoRate = getItemRate(selected.itemName);

        updated.category = selected.category || "";
        updated.issueRate = autoRate ? autoRate.toFixed(2) : "";
      }
    }

    setForm(calculateIssueValue(updated));
  }

  function clearMainForm() {
    setForm(blankForm);
    setStatus("Ready for new stores issue entry");
  }

  async function submit(e) {
    e.preventDefault();

    if (!form.date) return alert("Date is mandatory");
    if (!form.itemName) return alert("Select item");
    if (!form.qty) return alert("Enter quantity");
    if (!form.department) return alert("Select department");

    try {
      const finalForm = calculateIssueValue({ ...form });

      const res = await apiCall({
        fn: "storesIssue.add",
        ...finalForm,
      });

      if (res.ok) {
        setStatus("Stores issue saved successfully");
        setForm(blankForm);
        loadData();
      } else {
        setStatus(res.error || "Error");
      }
    } catch (err) {
      setStatus(err.message);
    }
  }

  function editRow(row) {
    const autoRate = getItemRate(row.itemName);
    const finalRate = Number(row.issueRate || 0) || Number(autoRate || 0);

    setEditingRow({
      ...row,
      date: formatDateForInput(row.date) || today,
      issueRate: finalRate ? finalRate.toFixed(2) : "",
      issueValue:
        row.issueValue ||
        (finalRate ? calcValue(row.qty, finalRate).toFixed(2) : ""),
    });
  }

  function onEditChange(e) {
    let updated = {
      ...editingRow,
      [e.target.name]: e.target.value,
    };

    if (e.target.name === "itemName") {
      const selected = items.find((x) => x.itemName === e.target.value);

      if (selected) {
        const autoRate = getItemRate(selected.itemName);

        updated.category = selected.category || updated.category || "";
        updated.issueRate = autoRate
          ? autoRate.toFixed(2)
          : updated.issueRate || "";
      }
    }

    updated = calculateIssueValue(updated);
    setEditingRow(updated);
  }

  async function saveEdit() {
    if (!editingRow) return;
    if (!editingRow.itemName) return alert("Item is required");
    if (!editingRow.qty) return alert("Qty is required");
    if (!editingRow.department) return alert("Department is required");

    try {
      setSavingEdit(true);

      const finalRate =
        Number(editingRow.issueRate || 0) || getItemRate(editingRow.itemName);

      const finalValue = calcValue(editingRow.qty, finalRate);

      const res = await apiCall({
        fn: "storesIssue.update",
        ...editingRow,
        issueRate: finalRate ? Number(finalRate).toFixed(2) : "",
        issueValue: finalValue.toFixed(2),
      });

      if (res.ok === false) {
        alert(res.error || "Update failed");
        return;
      }

      setStatus("Stores issue updated");
      setEditingRow(null);
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingEdit(false);
    }
  }

  async function deleteRow(row) {
    const ok = window.confirm(`Delete issue entry for ${row.itemName}?`);
    if (!ok) return;

    try {
      const res = await apiCall({
        fn: "storesIssue.update",
        ...row,
        status: "DELETED",
      });

      if (res.ok === false) {
        alert(res.error || "Delete failed");
        return;
      }

      setStatus("Stores issue deleted");
      loadData();
    } catch (err) {
      alert(err.message);
    }
  }

  async function backfillOldIssueRates() {
    const ok = window.confirm(
      "This will update old Stores Issue entries with missing / zero rates using Stores Inward average rate. Continue?"
    );

    if (!ok) return;

    try {
      setBackfilling(true);
      setStatus("Backfilling old issue rates...");

      let updatedCount = 0;
      let skippedCount = 0;

      for (const row of rows) {
        const currentRate = Number(row.issueRate || 0);

        if (currentRate > 0) {
          skippedCount += 1;
          continue;
        }

        const autoRate = getItemRate(row.itemName);

        if (!autoRate || Number(autoRate) <= 0) {
          skippedCount += 1;
          continue;
        }

        const qty = Number(row.qty || 0);
        const issueValue = qty * Number(autoRate || 0);

        const res = await apiCall({
          fn: "storesIssue.update",
          ...row,
          issueRate: Number(autoRate).toFixed(2),
          issueValue: issueValue.toFixed(2),
          rateSource: "Backfilled from Stores Inward Avg",
          remarks:
            row.remarks ||
            "Rate auto-filled from Stores Inward average rate",
        });

        if (res.ok !== false) {
          updatedCount += 1;
        }
      }

      setStatus(
        `Backfill completed. Updated ${updatedCount} rows. Skipped ${skippedCount} rows.`
      );

      loadData();
    } catch (err) {
      alert(err.message);
      setStatus("Backfill failed");
    } finally {
      setBackfilling(false);
    }
  }

  const totalIssueQty = rows.reduce((sum, r) => sum + Number(r.qty || 0), 0);

  const totalIssueValue = rows.reduce(
    (sum, r) =>
      sum +
      Number(
        r.issueValue ||
          Number(r.qty || 0) *
            (Number(r.issueRate || 0) || getItemRate(r.itemName))
      ),
    0
  );

  const missingRateRows = rows.filter(
    (r) => Number(r.issueRate || 0) <= 0 && getItemRate(r.itemName) > 0
  ).length;

  const departmentSummary = useMemo(() => {
    const map = {};

    rows.forEach((r) => {
      const dept = r.department || "Unknown";
      const rate = Number(r.issueRate || 0) || getItemRate(r.itemName);
      const value = Number(r.issueValue || Number(r.qty || 0) * rate);

      if (!map[dept]) {
        map[dept] = { qty: 0, value: 0 };
      }

      map[dept].qty += Number(r.qty || 0);
      map[dept].value += value;
    });

    return Object.entries(map);
  }, [rows, stockMap, items]);

  const topConsumption = useMemo(() => {
    const map = {};

    rows.forEach((r) => {
      const item = r.itemName || "Unknown";
      const rate = Number(r.issueRate || 0) || getItemRate(item);
      const value = Number(r.issueValue || Number(r.qty || 0) * rate);

      if (!map[item]) {
        map[item] = { qty: 0, value: 0 };
      }

      map[item].qty += Number(r.qty || 0);
      map[item].value += value;
    });

    return Object.entries(map)
      .sort((a, b) => b[1].value - a[1].value)
      .slice(0, 5);
  }, [rows, stockMap, items]);

  return (
    <div style={pageStyle}>
      <div style={sectionCard}>
        <div style={sectionTitle}>Stores Consumption</div>

        <div style={{ color: "#64748b", fontSize: 13 }}>
          Issue rate auto-picks from Stores Inward average rate. Use backfill
          once to update old issue rows where rate is missing.
        </div>
      </div>

      <div style={kpiGrid}>
        <KPI title="Total Issues" value={rows.length} />
        <KPI title="Qty Consumed" value={totalIssueQty.toFixed(2)} />
        <KPI
          title="Issue Value"
          value={`₹ ${Number(totalIssueValue || 0).toLocaleString()}`}
        />
        <KPI title="Departments" value={departmentSummary.length} />
        <KPI title="Can Backfill" value={missingRateRows} />
      </div>

      <div style={actionBar}>
        <button
          type="button"
          onClick={backfillOldIssueRates}
          disabled={backfilling}
          style={backfillButton}
        >
          {backfilling ? "Backfilling..." : "Backfill Old Issue Rates"}
        </button>

        <button type="button" onClick={loadData} style={refreshButton}>
          Refresh
        </button>
      </div>

      <div style={sectionCard}>
        <div style={sectionTitle}>New Consumption Entry</div>

        <form
          onSubmit={submit}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
              e.preventDefault();
            }
          }}
          style={formGrid}
        >
          <Field label="Date">
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={onChange}
              style={inputStyle}
            />
          </Field>

          <Field label="Item">
            <select
              name="itemName"
              value={form.itemName}
              onChange={onChange}
              style={inputStyle}
            >
              <option value="">Select Item</option>
              {items.map((x, i) => (
                <option key={i} value={x.itemName}>
                  {x.itemName}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Category">
            <input value={form.category} readOnly style={readonlyStyle} />
          </Field>

          <Field label="Qty">
            <input
              type="number"
              name="qty"
              value={form.qty}
              onChange={onChange}
              style={inputStyle}
            />
          </Field>

          <Field label="Issue Rate">
            <input
              type="number"
              name="issueRate"
              value={form.issueRate}
              onChange={onChange}
              style={inputStyle}
            />
          </Field>

          <Field label="Issue Value">
            <input value={form.issueValue} readOnly style={readonlyStyle} />
          </Field>

          <Field label="Department">
            <select
              name="department"
              value={form.department}
              onChange={onChange}
              style={inputStyle}
            >
              <option value="">Select</option>
              {departments.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </Field>

          <Field label="Purpose">
            <input
              name="purpose"
              value={form.purpose}
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

          <div style={formActions}>
            <button type="submit" style={primaryButton}>
              Save Issue
            </button>

            <button type="button" style={clearButton} onClick={clearMainForm}>
              Clear / New Entry
            </button>
          </div>
        </form>

        {status && <div style={statusStyle}>{status}</div>}
      </div>

      <DataTable
        title="Stores Issue Ledger"
        rows={rows}
        searchFields={[
          "itemName",
          "category",
          "department",
          "purpose",
          "remarks",
          "rateSource",
        ]}
        columns={[
          {
            key: "date",
            label: "Date",
            render: (r) => formatDate(r.date),
            renderExport: (r) => formatDate(r.date),
          },
          { key: "itemName", label: "Item" },
          { key: "category", label: "Category" },
          {
            key: "qty",
            label: "Qty",
            render: (r) => Number(r.qty || 0).toFixed(2),
            renderExport: (r) => Number(r.qty || 0).toFixed(2),
          },
          {
            key: "issueRate",
            label: "Rate",
            render: (r) => {
              const rate =
                Number(r.issueRate || 0) || Number(getItemRate(r.itemName) || 0);

              return `₹ ${rate.toFixed(2)}`;
            },
            renderExport: (r) => {
              const rate =
                Number(r.issueRate || 0) || Number(getItemRate(r.itemName) || 0);

              return rate.toFixed(2);
            },
          },
          {
            key: "issueValue",
            label: "Value",
            render: (r) => {
              const rate =
                Number(r.issueRate || 0) || Number(getItemRate(r.itemName) || 0);

              return `₹ ${Number(
                r.issueValue || Number(r.qty || 0) * rate
              ).toLocaleString()}`;
            },
            renderExport: (r) => {
              const rate =
                Number(r.issueRate || 0) || Number(getItemRate(r.itemName) || 0);

              return Number(r.issueValue || Number(r.qty || 0) * rate).toFixed(
                2
              );
            },
          },
          { key: "rateSource", label: "Rate Source" },
          { key: "department", label: "Department" },
          { key: "purpose", label: "Purpose" },
          { key: "remarks", label: "Remarks" },
        ]}
        onEdit={editRow}
        onDelete={deleteRow}
      />

      <div style={summaryGrid}>
        <SummaryTable
          title="Department Usage"
          columns={["Department", "Qty", "Value"]}
          rows={departmentSummary.map(([dept, data]) => [
            dept,
            data.qty.toFixed(2),
            `₹ ${Number(data.value || 0).toLocaleString()}`,
          ])}
        />

        <SummaryTable
          title="Top Consumptions"
          columns={["Item", "Qty", "Value"]}
          rows={topConsumption.map(([item, data]) => [
            item,
            data.qty.toFixed(2),
            `₹ ${Number(data.value || 0).toLocaleString()}`,
          ])}
        />
      </div>

      {editingRow && (
        <div style={modalOverlay}>
          <div style={modal}>
            <h2 style={{ marginTop: 0 }}>Edit Stores Issue</h2>

            <div style={formGrid}>
              <Field label="Date">
                <input
                  type="date"
                  name="date"
                  value={editingRow.date || ""}
                  onChange={onEditChange}
                  style={inputStyle}
                />
              </Field>

              <Field label="Item">
                <select
                  name="itemName"
                  value={editingRow.itemName || ""}
                  onChange={onEditChange}
                  style={inputStyle}
                >
                  <option value="">Select Item</option>
                  {items.map((x, i) => (
                    <option key={i} value={x.itemName}>
                      {x.itemName}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Category">
                <input
                  name="category"
                  value={editingRow.category || ""}
                  onChange={onEditChange}
                  style={inputStyle}
                />
              </Field>

              <Field label="Qty">
                <input
                  type="number"
                  name="qty"
                  value={editingRow.qty || ""}
                  onChange={onEditChange}
                  style={inputStyle}
                />
              </Field>

              <Field label="Issue Rate">
                <input
                  type="number"
                  name="issueRate"
                  value={editingRow.issueRate || ""}
                  onChange={onEditChange}
                  style={inputStyle}
                />
              </Field>

              <Field label="Issue Value">
                <input
                  value={editingRow.issueValue || ""}
                  readOnly
                  style={readonlyStyle}
                />
              </Field>

              <Field label="Department">
                <select
                  name="department"
                  value={editingRow.department || ""}
                  onChange={onEditChange}
                  style={inputStyle}
                >
                  <option value="">Select</option>
                  {departments.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </Field>

              <Field label="Purpose">
                <input
                  name="purpose"
                  value={editingRow.purpose || ""}
                  onChange={onEditChange}
                  style={inputStyle}
                />
              </Field>

              <Field label="Remarks">
                <textarea
                  name="remarks"
                  value={editingRow.remarks || ""}
                  onChange={onEditChange}
                  style={textareaStyle}
                />
              </Field>
            </div>

            <div style={modalButtons}>
              <button
                type="button"
                onClick={() => setEditingRow(null)}
                style={cancelButton}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveEdit}
                disabled={savingEdit}
                style={saveButton}
              >
                {savingEdit ? "Saving..." : "Save Changes"}
              </button>
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
      <div style={fieldLabel}>{label}</div>
      {children}
    </div>
  );
}

function KPI({ title, value }) {
  return (
    <div style={kpiCard}>
      <div style={kpiTitle}>{title}</div>
      <div style={kpiValue}>{value}</div>
    </div>
  );
}

function SummaryTable({ title, columns, rows }) {
  return (
    <div style={sectionCard}>
      <div style={sectionTitle}>{title}</div>

      <div style={{ overflowX: "auto" }}>
        <table style={simpleTable}>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c} style={simpleTh}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (
                  <td key={j} style={simpleTd}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} style={simpleTd}>
                  No data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatDateForInput(value) {
  if (!value) return "";

  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  if (text.includes("T")) {
    return text.split("T")[0];
  }

  const d = new Date(value);

  if (isNaN(d.getTime())) {
    return text.slice(0, 10);
  }

  return d.toISOString().split("T")[0];
}

const kpiGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
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

const actionBar = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  marginBottom: 16,
};

const backfillButton = {
  background: "#d97706",
  color: "white",
  border: "none",
  padding: "10px 14px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
};

const refreshButton = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "10px 14px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
};

const statusStyle = {
  marginTop: 14,
  fontWeight: 600,
  color: "#0f766e",
};

const fieldLabel = {
  marginBottom: 4,
  fontWeight: 600,
  color: "#334155",
  fontSize: 12,
};

const formActions = {
  display: "flex",
  alignItems: "end",
  gap: 10,
  flexWrap: "wrap",
};

const clearButton = {
  background: "#64748b",
  color: "white",
  border: "none",
  padding: "10px 14px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
};

const summaryGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(360px,1fr))",
  gap: 16,
  marginTop: 16,
};

const simpleTable = {
  width: "100%",
  borderCollapse: "collapse",
};

const simpleTh = {
  background: "#0f766e",
  color: "white",
  padding: 10,
  textAlign: "left",
};

const simpleTd = {
  padding: 10,
  borderBottom: "1px solid #e5e7eb",
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
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
};

const modalButtons = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  alignItems: "end",
  marginTop: 18,
};

const cancelButton = {
  background: "#64748b",
  color: "white",
  border: "none",
  padding: "10px 16px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
};

const saveButton = {
  background: "#0f766e",
  color: "white",
  border: "none",
  padding: "10px 16px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
};