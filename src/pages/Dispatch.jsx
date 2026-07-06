import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";
import { formatDate } from "../utils/date";

import DataTable from "../components/DataTable";
import FormSection from "../components/FormSection";

export default function Dispatch() {
  const today = new Date().toISOString().split("T")[0];

  const blankLine = {
    sourceExtrusionBatchId: "",
    lotNo: "",
    grade: "",
    productionDate: "",
    productionShift: "",
    availableKg: "",
    dispatchQtyKg: "",
    remarks: "",
  };

  const blankForm = {
    dispatchId: "",
    date: today,

    productionDate: "",
    productionShift: "",

    customerName: "Mold-Tek",
    customerUnit: "",
    invoiceNo: "",
    vehicleNo: "",
    driverName: "",
    dispatchStatus: "DISPATCHED",
    ratePerKg: "",
    noOfBags: "",
    dispatchLocation: "",
    remarks: "",

    dispatchLines: JSON.stringify([blankLine]),
    quantityKg: "",
    grade: "",
    lotNo: "",
    sourceExtrusionBatchId: "",
  };

  const [rows, setRows] = useState([]);
  const [extrusionRows, setExtrusionRows] = useState([]);
  const [status, setStatus] = useState("");
  const [editingRow, setEditingRow] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [dispatchLines, setDispatchLines] = useState([{ ...blankLine }]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [dispatch, extrusion] = await Promise.all([
        apiCall({ fn: "dispatch.list" }),
        apiCall({ fn: "extrusion.list" }),
      ]);

      setRows(dispatch.rows || []);
      setExtrusionRows(extrusion.rows || []);
    } catch (err) {
      console.log(err);
      setStatus(err.message);
    }
  }

  function dateForInput(value) {
    if (!value) return "";

    const text = String(value);

    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
    if (text.includes("T")) return text.split("T")[0];

    const d = new Date(value);
    if (isNaN(d.getTime())) return text.slice(0, 10);

    return d.toISOString().split("T")[0];
  }

  function makeDispatchId(productionDate, shift) {
    const baseDate = productionDate || today;
    const datePart = String(baseDate).replaceAll("-", "");
    const shiftPart = String(shift || "NA").toUpperCase();

    return `DISP-${datePart}-${shiftPart}`;
  }

  function parseLines(row) {
    try {
      if (row.dispatchLines) {
        const parsed = JSON.parse(row.dispatchLines);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (err) {
      console.log(err);
    }

    if (row.sourceExtrusionBatchId) {
      return [
        {
          sourceExtrusionBatchId: row.sourceExtrusionBatchId || "",
          lotNo: row.lotNo || row.sourceExtrusionBatchId || "",
          grade: row.grade || "",
          productionDate: row.productionDate || row.date || "",
          productionShift: row.productionShift || "",
          availableKg: row.availableFGQty || "",
          dispatchQtyKg: row.quantityKg || "",
          remarks: "",
        },
      ];
    }

    return [{ ...blankLine }];
  }

  function getDispatchedQtyForBatch(batchId, currentDispatchId = "") {
    let total = 0;

    rows
      .filter(
        (r) =>
          String(r.dispatchStatus || "").toUpperCase() !== "DELETED" &&
          String(r.status || "").toUpperCase() !== "DELETED"
      )
      .filter(
        (r) => String(r.dispatchId || "") !== String(currentDispatchId || "")
      )
      .forEach((r) => {
        const lines = parseLines(r);

        lines.forEach((line) => {
          if (
            String(line.sourceExtrusionBatchId || "") === String(batchId || "")
          ) {
            total += Number(line.dispatchQtyKg || 0);
          }
        });
      });

    return total;
  }

  function getAvailableFG(batchId, currentDispatchId = editingRow?.dispatchId || "") {
    const fg = extrusionRows.find(
      (x) => String(x.extrusionBatchId) === String(batchId)
    );

    if (!fg) return 0;

    const produced = Number(fg.fgOutputKg || 0);
    const dispatched = getDispatchedQtyForBatch(batchId, currentDispatchId);

    return Math.max(produced - dispatched, 0);
  }

  function extrusionDate(row) {
    return dateForInput(row.date || row.productionDate || row.createdAt || "");
  }

  function extrusionShift(row) {
    return String(row.shift || row.productionShift || "").toUpperCase();
  }

  const allLiveLots = useMemo(() => {
    return extrusionRows
      .map((x) => ({
        ...x,
        productionDate: extrusionDate(x),
        productionShift: extrusionShift(x),
        available: getAvailableFG(x.extrusionBatchId),
      }))
      .filter((x) => Number(x.available || 0) > 0)
      .sort((a, b) =>
        String(a.extrusionBatchId || "").localeCompare(
          String(b.extrusionBatchId || "")
        )
      );
  }, [extrusionRows, rows, editingRow]);

  const filteredLiveLots = useMemo(() => {
    return allLiveLots
      .filter((x) => {
        if (!form.productionDate) return true;
        return String(x.productionDate || "") === String(form.productionDate);
      })
      .filter((x) => {
        if (!form.productionShift) return true;
        return (
          String(x.productionShift || "").toUpperCase() ===
          String(form.productionShift || "").toUpperCase()
        );
      });
  }, [allLiveLots, form.productionDate, form.productionShift]);

  function getLineTotal(lines = dispatchLines) {
    return lines.reduce((s, r) => s + Number(r.dispatchQtyKg || 0), 0);
  }

  function getGradeSummary(lines = dispatchLines) {
    const map = {};

    lines.forEach((line) => {
      const grade = line.grade || "NA";
      map[grade] = (map[grade] || 0) + Number(line.dispatchQtyKg || 0);
    });

    return Object.entries(map)
      .map(([grade, qty]) => `${grade}: ${qty} Kg`)
      .join(" | ");
  }

  function getLotSummary(lines = dispatchLines) {
    return lines
      .filter((x) => x.sourceExtrusionBatchId)
      .map(
        (x) =>
          `${x.lotNo || x.sourceExtrusionBatchId}: ${x.dispatchQtyKg || 0} Kg`
      )
      .join(" + ");
  }

  function autoCalculate(updated, lines = dispatchLines) {
    const totalQty = getLineTotal(lines);

    const cleanLines = lines.map((x) => ({
      ...x,
      availableKg: Number(x.availableKg || 0),
      dispatchQtyKg: Number(x.dispatchQtyKg || 0),
    }));

    updated.dispatchId =
      updated.dispatchId ||
      makeDispatchId(updated.productionDate, updated.productionShift);

    updated.quantityKg = totalQty.toFixed(2);
    updated.dispatchLines = JSON.stringify(cleanLines);
    updated.grade = getGradeSummary(cleanLines);
    updated.lotNo = getLotSummary(cleanLines);
    updated.sourceExtrusionBatchId = cleanLines
      .map((x) => x.sourceExtrusionBatchId)
      .filter(Boolean)
      .join(",");

    return updated;
  }

  function onChange(e) {
    let updated = {
      ...form,
      [e.target.name]: e.target.value,
    };

    if (
      e.target.name === "productionDate" ||
      e.target.name === "productionShift"
    ) {
      updated.dispatchId = makeDispatchId(
        e.target.name === "productionDate" ? e.target.value : form.productionDate,
        e.target.name === "productionShift" ? e.target.value : form.productionShift
      );

      setDispatchLines([{ ...blankLine }]);
      updated = autoCalculate(updated, [{ ...blankLine }]);
      setForm(updated);
      return;
    }

    updated = autoCalculate(updated, dispatchLines);
    setForm(updated);
  }
  function updateLine(index, key, value) {
    let updatedLines = dispatchLines.map((line, i) =>
      i === index ? { ...line, [key]: value } : line
    );

    if (key === "sourceExtrusionBatchId") {
      const selected = allLiveLots.find(
        (x) => String(x.extrusionBatchId) === String(value)
      );

      if (selected) {
        updatedLines = updatedLines.map((line, i) => {
          if (i !== index) return line;

          const available = getAvailableFG(selected.extrusionBatchId);

          return {
            ...line,
            sourceExtrusionBatchId: selected.extrusionBatchId,
            lotNo: selected.lotNo || selected.extrusionBatchId,
            grade: selected.productionGrade || "",
            productionDate: extrusionDate(selected),
            productionShift: extrusionShift(selected),
            availableKg: available,
            dispatchQtyKg: "",
          };
        });
      }
    }

    setDispatchLines(updatedLines);
    setForm(autoCalculate({ ...form }, updatedLines));
  }

  function addLine() {
    const updatedLines = [...dispatchLines, { ...blankLine }];
    setDispatchLines(updatedLines);
    setForm(autoCalculate({ ...form }, updatedLines));
  }

  function removeLine(index) {
    const updatedLines = dispatchLines.filter((_, i) => i !== index);
    const finalLines =
      updatedLines.length > 0 ? updatedLines : [{ ...blankLine }];

    setDispatchLines(finalLines);
    setForm(autoCalculate({ ...form }, finalLines));
  }

  function fillFullAvailable(index) {
    const updatedLines = dispatchLines.map((line, i) =>
      i === index
        ? {
            ...line,
            dispatchQtyKg: line.availableKg || "",
          }
        : line
    );

    setDispatchLines(updatedLines);
    setForm(autoCalculate({ ...form }, updatedLines));
  }

  async function submit(e) {
    e.preventDefault();

    try {
      const cleanLines = dispatchLines.filter(
        (x) => x.sourceExtrusionBatchId && Number(x.dispatchQtyKg || 0) > 0
      );

      if (cleanLines.length === 0) {
        setStatus("Add at least one FG lot with dispatch quantity.");
        return;
      }

      for (const line of cleanLines) {
        if (Number(line.dispatchQtyKg || 0) > Number(line.availableKg || 0)) {
          setStatus(
            `Dispatch exceeds available stock for ${
              line.lotNo || line.sourceExtrusionBatchId
            }`
          );
          return;
        }
      }

      const finalForm = autoCalculate(
        {
          ...form,
          dispatchId:
            form.dispatchId ||
            makeDispatchId(form.productionDate, form.productionShift),
        },
        cleanLines
      );

      let res;

      if (editingRow?.dispatchId) {
        res = await apiCall({
          fn: "dispatch.update",
          ...finalForm,
          dispatchId: editingRow.dispatchId,
        });
      } else {
        res = await apiCall({
          fn: "dispatch.add",
          ...finalForm,
        });
      }

      if (res.ok === false) {
        setStatus(res.error || "Error saving dispatch");
        return;
      }

      setStatus(editingRow?.dispatchId ? "Dispatch updated" : "Dispatch saved");
      setEditingRow(null);
      setForm(blankForm);
      setDispatchLines([{ ...blankLine }]);
      loadData();
    } catch (err) {
      setStatus(err.message);
    }
  }

  function editRow(row) {
    const parsed = parseLines(row);

    const productionDate =
      dateForInput(row.productionDate) || dateForInput(row.date) || "";

    const productionShift = row.productionShift || "";

    const normalizedLines = parsed.map((line) => ({
      ...line,
      productionDate: dateForInput(line.productionDate) || productionDate || "",
      productionShift: line.productionShift || productionShift || "",
    }));

    setEditingRow(row);
    setDispatchLines(normalizedLines);

    const updated = autoCalculate(
      {
        ...blankForm,
        ...row,
        date: dateForInput(row.date) || today,
        productionDate,
        productionShift,
        dispatchId:
          row.dispatchId || makeDispatchId(productionDate, productionShift),
      },
      normalizedLines
    );

    setForm(updated);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function deleteRow(row) {
    const confirmed = window.confirm("Delete dispatch?");
    if (!confirmed) return;

    try {
      const res = await apiCall({
        fn: "dispatch.update",
        ...row,
        dispatchId: row.dispatchId,
        dispatchStatus: "DELETED",
        status: "DELETED",
      });

      if (res.ok === false) {
        setStatus(res.error || "Delete failed");
        return;
      }

      setStatus("Dispatch deleted");
      loadData();
    } catch (err) {
      setStatus(err.message);
    }
  }

  function clearForm() {
    setEditingRow(null);
    setForm(blankForm);
    setDispatchLines([{ ...blankLine }]);
    setStatus("Ready for new dispatch");
  }

  const activeRows = rows.filter(
    (r) =>
      String(r.dispatchStatus || "").toUpperCase() !== "DELETED" &&
      String(r.status || "").toUpperCase() !== "DELETED"
  );

  const totalDispatch = activeRows.reduce(
    (sum, r) => sum + Number(r.quantityKg || 0),
    0
  );

  const totalSales = activeRows.reduce(
    (sum, r) =>
      sum + Number(r.quantityKg || 0) * Number(r.ratePerKg || 0),
    0
  );

  const avgRealization =
    totalDispatch > 0 ? (totalSales / totalDispatch).toFixed(2) : "0.00";

  const currentDispatchQty = getLineTotal(dispatchLines);
  const currentSalesValue = currentDispatchQty * Number(form.ratePerKg || 0);

  const truckTargetKg = 25000;

  const truckFillPercent =
    truckTargetKg > 0
      ? ((currentDispatchQty / truckTargetKg) * 100).toFixed(1)
      : 0;

  const customerSummary = useMemo(() => {
    const map = {};

    activeRows.forEach((r) => {
      const customer = r.customerName || "Unknown";

      if (!map[customer]) {
        map[customer] = {
          customer,
          qty: 0,
          value: 0,
        };
      }

      map[customer].qty += Number(r.quantityKg || 0);
      map[customer].value +=
        Number(r.quantityKg || 0) * Number(r.ratePerKg || 0);
    });

    return Object.values(map)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [activeRows]);

  return (
    <div style={pageStyle}>
      <div style={headerCard}>
        <h1 style={{ margin: 0 }}>Dispatch Workflow</h1>

        <div style={subText}>
          Multi-lot truck dispatch from FG stock. FG lots show by default and
          can be filtered by production date and shift.
        </div>
      </div>

      <div style={kpiGrid}>
        <KPI title="Dispatch Qty" value={`${totalDispatch.toFixed(0)} Kg`} />
        <KPI title="Sales" value={`₹ ${totalSales.toFixed(0)}`} />
        <KPI title="Avg Realization" value={`₹ ${avgRealization}`} />
        <KPI title="Live Lots" value={allLiveLots.length} />
        <KPI title="Filtered Lots" value={filteredLiveLots.length} />
      </div>

      {status && <div style={statusStyle}>{status}</div>}

      <form
        onSubmit={submit}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
            e.preventDefault();
          }
        }}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <FormSection title={editingRow ? "Edit Dispatch" : "New Dispatch"}>
          <Field label="Production Date Filter">
            <input
              type="date"
              name="productionDate"
              value={form.productionDate}
              onChange={onChange}
              style={inputStyle}
            />
          </Field>

          <Field label="Production Shift Filter">
            <select
              name="productionShift"
              value={form.productionShift}
              onChange={onChange}
              style={inputStyle}
            >
              <option value="">All Shifts</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </Field>

          <Field label="Dispatch Code">
            <input
              readOnly
              value={
                form.dispatchId ||
                makeDispatchId(form.productionDate, form.productionShift)
              }
              style={readonlyStyle}
            />
          </Field>

          <Field label="Available FG Lots">
            <input
              readOnly
              value={`${filteredLiveLots.length} lots available`}
              style={readonlyStyle}
            />
          </Field>
        </FormSection>
        <FormSection title="Customer & Logistics">
          <Field label="Dispatch Entry Date">
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={onChange}
              style={inputStyle}
            />
          </Field>

          <Field label="Customer">
            <input
              name="customerName"
              value={form.customerName}
              onChange={onChange}
              style={inputStyle}
            />
          </Field>

          <Field label="Customer Unit / Destination">
            <select
              name="customerUnit"
              value={form.customerUnit}
              onChange={onChange}
              style={inputStyle}
            >
              <option value="">Select Unit</option>
              <option>Mold-Tek Unit 1</option>
              <option>Mold-Tek Unit 2</option>
              <option>Mold-Tek Unit 3</option>
              <option>Mold-Tek Unit 4</option>
              <option>Mold-Tek Unit 5</option>
              <option>Other</option>
            </select>
          </Field>

          <Field label="Invoice">
            <input
              name="invoiceNo"
              value={form.invoiceNo}
              onChange={onChange}
              style={inputStyle}
            />
          </Field>

          <Field label="Vehicle">
            <input
              name="vehicleNo"
              value={form.vehicleNo}
              onChange={onChange}
              style={inputStyle}
            />
          </Field>

          <Field label="Driver">
            <input
              name="driverName"
              value={form.driverName}
              onChange={onChange}
              style={inputStyle}
            />
          </Field>

          <Field label="Dispatch Location">
            <input
              name="dispatchLocation"
              value={form.dispatchLocation}
              onChange={onChange}
              placeholder="Example: Mold-Tek Unit 5"
              style={inputStyle}
            />
          </Field>

          <Field label="Status">
            <select
              name="dispatchStatus"
              value={form.dispatchStatus}
              onChange={onChange}
              style={inputStyle}
            >
              <option>DISPATCHED</option>
              <option>IN_TRANSIT</option>
              <option>DELIVERED</option>
            </select>
          </Field>
        </FormSection>

        <FormSection title="Truck Loading Summary">
          <Field label="Total Dispatch Qty Kg">
            <input readOnly value={form.quantityKg} style={readonlyStyle} />
          </Field>

          <Field label="Truck Fill % vs 25T">
            <input readOnly value={`${truckFillPercent}%`} style={readonlyStyle} />
          </Field>

          <Field label="Rate / Kg">
            <input
              name="ratePerKg"
              value={form.ratePerKg}
              onChange={onChange}
              style={inputStyle}
            />
          </Field>

          <Field label="Sales Value">
            <input
              readOnly
              value={`₹ ${currentSalesValue.toFixed(0)}`}
              style={readonlyStyle}
            />
          </Field>

          <Field label="No Of Bags">
            <input
              name="noOfBags"
              value={form.noOfBags}
              onChange={onChange}
              style={inputStyle}
            />
          </Field>

          <Field label="Lot Summary">
            <textarea readOnly value={form.lotNo} style={textareaStyle} />
          </Field>
        </FormSection>

        <FormSection title="FG Lots / Grade Loading">
          <div style={{ gridColumn: "1 / -1", overflowX: "auto" }}>
            <table style={lineTable}>
              <thead>
                <tr style={lineHeader}>
                  <th style={lineTh}>FG Lot / Extrusion Batch</th>
                  <th style={lineTh}>Production Date</th>
                  <th style={lineTh}>Shift</th>
                  <th style={lineTh}>Grade</th>
                  <th style={lineTh}>Available Kg</th>
                  <th style={lineTh}>Dispatch Kg</th>
                  <th style={lineTh}>Remarks</th>
                  <th style={lineTh}>Action</th>
                </tr>
              </thead>

              <tbody>
                {dispatchLines.map((line, index) => (
                  <tr key={index}>
                    <td style={lineTd}>
                      <select
                        value={line.sourceExtrusionBatchId || ""}
                        onChange={(e) =>
                          updateLine(index, "sourceExtrusionBatchId", e.target.value)
                        }
                        style={inputStyle}
                      >
                        <option value="">Select FG Lot</option>

                        {filteredLiveLots.map((x, i) => (
                          <option key={i} value={x.extrusionBatchId}>
                            {x.lotNo || x.extrusionBatchId} |{" "}
                            {x.productionDate || "No Date"} |{" "}
                            {x.productionShift || "No Shift"} |{" "}
                            {x.productionGrade || "NA"} | {x.available} Kg
                          </option>
                        ))}
                      </select>
                    </td>

                    <td style={lineTd}>
                      <input
                        readOnly
                        value={line.productionDate || ""}
                        style={readonlyStyle}
                      />
                    </td>

                    <td style={lineTd}>
                      <input
                        readOnly
                        value={line.productionShift || ""}
                        style={readonlyStyle}
                      />
                    </td>

                    <td style={lineTd}>
                      <input readOnly value={line.grade || ""} style={readonlyStyle} />
                    </td>

                    <td style={lineTd}>
                      <input
                        readOnly
                        value={line.availableKg || ""}
                        style={readonlyStyle}
                      />
                    </td>

                    <td style={lineTd}>
                      <input
                        type="number"
                        value={line.dispatchQtyKg || ""}
                        onChange={(e) =>
                          updateLine(index, "dispatchQtyKg", e.target.value)
                        }
                        style={inputStyle}
                      />
                    </td>

                    <td style={lineTd}>
                      <input
                        value={line.remarks || ""}
                        onChange={(e) => updateLine(index, "remarks", e.target.value)}
                        placeholder="Example: E1 5T / Unit 1"
                        style={inputStyle}
                      />
                    </td>

                    <td style={lineTd}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => fillFullAvailable(index)}
                          style={miniButton}
                        >
                          Full
                        </button>

                        <button
                          type="button"
                          onClick={() => removeLine(index)}
                          style={removeButton}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button type="button" onClick={addLine} style={addButton}>
              + Add FG Lot
            </button>
          </div>
        </FormSection>

        <FormSection title="Remarks" defaultOpen={false}>
          <Field label="Remarks">
            <textarea
              name="remarks"
              value={form.remarks}
              onChange={onChange}
              style={textareaStyle}
            />
          </Field>
        </FormSection>

        <div style={stickyBar}>
          <button type="button" onClick={clearForm} style={clearButton}>
            Clear / New Dispatch
          </button>

          <button type="submit" style={editingRow ? updateButton : saveButton}>
            {editingRow ? "Update Dispatch" : "Save Dispatch"}
          </button>
        </div>
      </form>

      <div style={sectionCard}>
        <div style={sectionTitle}>Top Customers</div>

        <div style={customerGrid}>
          {customerSummary.map((c, i) => (
            <div key={i} style={customerCard}>
              <div style={{ fontWeight: 700 }}>{c.customer}</div>

              <div
                style={{
                  marginTop: 6,
                  color: "#0f766e",
                  fontWeight: 700,
                }}
              >
                {Number(c.qty).toFixed(0)} Kg
              </div>

              <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>
                ₹ {Number(c.value).toFixed(0)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <DataTable
        title="Dispatch History"
        rows={activeRows}
        searchFields={[
          "dispatchId",
          "customerName",
          "customerUnit",
          "grade",
          "invoiceNo",
          "vehicleNo",
          "lotNo",
          "productionDate",
          "productionShift",
        ]}
        columns={[
          {
            key: "date",
            label: "Entry Date",
            render: (r) => formatDate(r.date),
            renderExport: (r) => formatDate(r.date),
          },
          {
            key: "productionDate",
            label: "Production Date",
            render: (r) => formatDate(r.productionDate || r.date),
            renderExport: (r) => formatDate(r.productionDate || r.date),
          },
          { key: "productionShift", label: "Shift" },
          { key: "dispatchId", label: "Dispatch" },
          { key: "customerName", label: "Customer" },
          { key: "customerUnit", label: "Unit" },
          { key: "grade", label: "Grade Mix" },
          { key: "lotNo", label: "Lots" },
          { key: "quantityKg", label: "Qty Kg" },
          { key: "ratePerKg", label: "Rate" },
          { key: "dispatchStatus", label: "Status" },
        ]}
        onEdit={editRow}
        onDelete={deleteRow}
      />
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

const pageStyle = { padding: 20 };

const headerCard = {
  background: "white",
  padding: 18,
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  marginBottom: 16,
};

const subText = {
  color: "#64748b",
  marginTop: 4,
  fontSize: 13,
};

const sectionCard = {
  background: "white",
  padding: 18,
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  marginBottom: 16,
};

const sectionTitle = {
  fontWeight: 700,
  marginBottom: 16,
  color: "#005d34",
};

const fieldLabel = {
  fontSize: 12,
  fontWeight: 600,
  marginBottom: 4,
  color: "#334155",
};

const kpiGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
  gap: 14,
  marginBottom: 16,
};

const kpiCard = {
  background: "white",
  padding: 16,
  borderRadius: 12,
  border: "1px solid #e5e7eb",
};

const kpiTitle = {
  color: "#64748b",
  fontSize: 12,
  marginBottom: 8,
};

const kpiValue = {
  fontSize: 22,
  fontWeight: 700,
  color: "#005d34",
};

const customerGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
  gap: 12,
};

const customerCard = {
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  padding: 12,
  background: "#f8fafc",
};

const inputStyle = {
  width: "100%",
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ccc",
  boxSizing: "border-box",
};

const readonlyStyle = {
  ...inputStyle,
  background: "#f8fafc",
  fontWeight: 700,
};

const textareaStyle = {
  ...inputStyle,
  height: 80,
};

const lineTable = {
  width: "100%",
  borderCollapse: "collapse",
  marginBottom: 10,
  minWidth: 1250,
};

const lineHeader = {
  background: "#0f766e",
  color: "white",
};

const lineTh = {
  padding: 10,
  textAlign: "left",
};

const lineTd = {
  padding: 8,
  borderBottom: "1px solid #e5e7eb",
};

const addButton = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "9px 14px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
};

const miniButton = {
  background: "#0f766e",
  color: "white",
  border: "none",
  padding: "8px 10px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
};

const removeButton = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "8px 10px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
};

const saveButton = {
  background: "#0f766e",
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
};

const updateButton = {
  ...saveButton,
  background: "#ea580c",
};

const clearButton = {
  background: "#64748b",
  color: "white",
  border: "none",
  padding: "12px 20px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
};

const stickyBar = {
  position: "sticky",
  bottom: 0,
  background: "white",
  padding: 12,
  borderTop: "1px solid #ddd",
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  zIndex: 10,
};

const statusStyle = {
  marginTop: 12,
  marginBottom: 16,
  fontWeight: 600,
  color: "#0f766e",
};