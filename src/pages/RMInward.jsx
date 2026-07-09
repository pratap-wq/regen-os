import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";
import { formatDate } from "../utils/date";
import DataTable from "../components/DataTable";
import FactoryDropdown from "../components/FactoryDropdown";
import ProductionMaterialSelect from "../components/ProductionMaterialSelect";
import { normalizeProductionMaterialName } from "../services/productionMaterialMaster";
import { KpiCard, PageLayout } from "../components/factoryDesignSystem";

const blankLine = {
  material: "",
  quantityKg: "",
  remarks: "",
  rate: "",
  amount: "",
};

export default function RMInward() {
  const today = new Date().toISOString().split("T")[0];
  const now = new Date();

  const [month, setMonth] = useState(String(now.getMonth() + 1).padStart(2, "0"));
  const [year, setYear] = useState(String(now.getFullYear()));

  const blankForm = {
    inwardId: "",
    date: today,
    supplier: "",
    vehicleNo: "",
    poNumber: "",
    supplierGrnNumber: "",
    supplierInvoiceNumber: "",
    invoiceDate: "",
    taxableValue: "",
    gstPercent: "",
    gstAmount: "",
    invoiceTotal: "",
    grandTotal: "",
    freight: "",
    otherCharges: "",
    roundOff: "",
    paymentStatus: "Unpaid",
    advancePaid: "",
    outstandingAmount: "",
    commercialRemarks: "",
    qcStatus: "PENDING",
    remarks: "",
    createdBy: "Accounts / Procurement",
  };

  const [form, setForm] = useState(blankForm);
  const [materialLines, setMaterialLines] = useState([{ ...blankLine }]);
  const [rows, setRows] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [status, setStatus] = useState("");
  const [editingRow, setEditingRow] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [supplierRes, rmRes] = await Promise.all([
        apiCall({ fn: "suppliers.list" }),
        apiCall({ fn: "rm.list" }),
      ]);

      setSuppliers(
        (supplierRes.rows || []).filter(
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

  function n(value) {
    return Number(value || 0);
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

  function supplierCode(value) {
    return String(value || "SUP")
      .replace(/[^a-z0-9]/gi, "")
      .slice(0, 8)
      .toUpperCase() || "SUP";
  }

  function previewReceivingRef() {
    const compactDate = String(form.date || today).replace(/-/g, "");
    return form.inwardId || `MR-${compactDate}-${supplierCode(form.supplier)}-AUTO`;
  }

  function cleanLines(lines = materialLines) {
    return lines
      .map((line) => ({
        material: normalizeProductionMaterialName(line.material),
        quantityKg: n(line.quantityKg),
        remarks: line.remarks || "",
        rate: n(line.rate),
        amount: n(line.quantityKg) * n(line.rate),
      }))
      .filter((line) => line.material && line.quantityKg > 0);
  }

  function totalQuantity(lines = materialLines) {
    return cleanLines(lines).reduce((sum, line) => sum + n(line.quantityKg), 0);
  }

  function totalLineAmount(lines = materialLines) {
    return cleanLines(lines).reduce((sum, line) => sum + n(line.amount), 0);
  }

  function materialSummary(lines = materialLines) {
    return cleanLines(lines)
      .map((line) => `${line.material}: ${line.quantityKg} Kg`)
      .join(" + ");
  }

  function displayMaterialSummary(row) {
    const lines = cleanLines(parseMaterialLines(
      row.materialLines,
      row.material,
      row.netWeight || row.quantityKg,
      row.ratePerKg
    ));
    return materialSummary(lines) || row.materialSummary || row.material || "";
  }

  function inferRmMaterial(quantityKg) {
    return n(quantityKg) < 5000 ? "White Buckets" : "White Regrind (Unwashed)";
  }

  function parseMaterialLines(value, fallbackMaterial, fallbackQty, fallbackRate = 0) {
    let parsed = [];

    if (Array.isArray(value)) {
      parsed = value;
    } else if (typeof value === "string" && value.trim()) {
      try {
        const rows = JSON.parse(value);
        parsed = Array.isArray(rows) ? rows : [];
      } catch (err) {
        parsed = String(value)
          .split("+")
          .map((part) => {
            const match = part.trim().match(/^(.+?):\s*([\d,.]+)/);
            if (!match) return null;
            return {
              material: match[1].trim(),
              quantityKg: n(match[2].replace(/,/g, "")),
            };
          })
          .filter(Boolean);
      }
    }

    if (!parsed.length && n(fallbackQty) > 0) {
      parsed = [
        {
          material: fallbackMaterial || inferRmMaterial(fallbackQty),
          quantityKg: n(fallbackQty),
          rate: n(fallbackRate),
          remarks: "",
        },
      ];
    }

    return parsed.map((line) => {
      const qty = n(line.quantityKg || line.qtyKg || line.quantity || line.netWeight);
      const rate = n(line.rate || line.ratePerKg || fallbackRate);
      const rawMaterial = line.material || line.materialName || fallbackMaterial || "";
      const material = rawMaterial
        ? normalizeProductionMaterialName(rawMaterial)
        : qty > 0
          ? inferRmMaterial(qty)
          : "";
      return {
        material,
        quantityKg: qty,
        remarks: line.remarks || "",
        rate,
        amount: n(line.amount) || qty * rate,
      };
    });
  }

  function calculateCommercialTotals(sourceForm = form, lines = materialLines) {
    const taxable = totalLineAmount(lines);
    const gstPercent = n(sourceForm.gstPercent);
    const gstAmount = taxable > 0 && gstPercent > 0 ? (taxable * gstPercent) / 100 : 0;
    const grandTotal =
      taxable +
      gstAmount +
      n(sourceForm.freight) +
      n(sourceForm.otherCharges) +
      n(sourceForm.roundOff);
    const outstandingAmount = Math.max(grandTotal - n(sourceForm.advancePaid), 0);

    return {
      totalQuantity: totalQuantity(lines),
      taxableValue: taxable,
      gstAmount,
      grandTotal,
      outstandingAmount,
    };
  }

  function calculateEdit(updated) {
    const taxable = n(updated.taxableValue);
    const gstPercent = n(updated.gstPercent);
    const gstAmount = taxable > 0 && gstPercent > 0 ? (taxable * gstPercent) / 100 : n(updated.gstAmount);
    const grandTotal = taxable + gstAmount + n(updated.freight) + n(updated.otherCharges) + n(updated.roundOff);
    const outstandingAmount = Math.max(grandTotal - n(updated.advancePaid), 0);

    return {
      ...updated,
      gstAmount: gstAmount > 0 ? gstAmount.toFixed(2) : "",
      invoiceTotal: grandTotal > 0 ? grandTotal.toFixed(2) : "",
      grandTotal: grandTotal > 0 ? grandTotal.toFixed(2) : "",
      outstandingAmount: outstandingAmount > 0 ? outstandingAmount.toFixed(2) : "",
    };
  }

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function updateLine(index, key, value) {
    const cleanValue = value && value.target ? value.target.value : value;
    setMaterialLines((lines) =>
      lines.map((line, i) => {
        if (i !== index) return line;
        const next = { ...line, [key]: cleanValue };
        if (key === "quantityKg" || key === "rate") {
          const amount = n(key === "quantityKg" ? cleanValue : next.quantityKg) * n(key === "rate" ? cleanValue : next.rate);
          next.amount = amount > 0 ? amount.toFixed(2) : "";
        }
        return next;
      })
    );
  }

  function addLine() {
    setMaterialLines((lines) => [...lines, { ...blankLine }]);
  }

  function removeLine(index) {
    setMaterialLines((lines) => {
      const updated = lines.filter((_, i) => i !== index);
      return updated.length ? updated : [{ ...blankLine }];
    });
  }

  function clearForm() {
    setForm(blankForm);
    setMaterialLines([{ ...blankLine }]);
    setStatus("Ready for new receiving entry");
  }

  async function submit(e) {
    e.preventDefault();

    const lines = cleanLines();
    const commercialTotals = calculateCommercialTotals(form, materialLines);
    if (!form.date) return alert("Date is mandatory");
    if (!form.supplier) return alert("Supplier is mandatory");
    if (!form.vehicleNo) return alert("Vehicle Number is mandatory");
    if (lines.length === 0) return alert("Add at least one material line");

    try {
      const res = await apiCall({
        fn: "rm.add",
        ...form,
        material: lines[0].material,
        netWeight: commercialTotals.totalQuantity,
        quantityKg: commercialTotals.totalQuantity,
        materialLines: JSON.stringify(lines),
        taxableValue: commercialTotals.taxableValue,
        gstAmount: commercialTotals.gstAmount,
        invoiceTotal: commercialTotals.grandTotal,
        grandTotal: commercialTotals.grandTotal,
        outstandingAmount: commercialTotals.outstandingAmount,
        status: "QC_PENDING",
        qcStatus: "PENDING",
      });

      if (res.ok === false) {
        setStatus(res.error || "Error saving RM inward");
        return;
      }

      setStatus(`Material receiving saved: ${res.inwardId || "QC Pending"}`);
      clearForm();
      loadData();
    } catch (err) {
      setStatus(err.message);
    }
  }

  function editRow(row) {
    const lines = parseMaterialLines(
      row.materialLines,
      row.material,
      row.netWeight || row.quantityKg,
      row.ratePerKg
    );
    setEditingRow({
      ...blankForm,
      ...row,
      date: dateForInput(row.date) || today,
      invoiceDate: dateForInput(row.invoiceDate),
      otherCharges: row.otherCharges || row.transportCharges || "",
      grandTotal: row.grandTotal || row.invoiceTotal || "",
      material: lines[0]?.material || row.material || "",
      materialLines: JSON.stringify(lines.length ? lines : [{ ...blankLine }]),
      materialSummary: materialSummary(lines),
    });
  }

  function editMaterialLines() {
    if (!editingRow) return [];
    return parseMaterialLines(
      editingRow.materialLines,
      editingRow.material,
      editingRow.netWeight || editingRow.quantityKg,
      editingRow.ratePerKg
    );
  }

  function updateEditLine(index, key, value) {
    const cleanValue = value && value.target ? value.target.value : value;
    const updatedLines = editMaterialLines().map((line, i) => {
      if (i !== index) return line;
      const next = { ...line, [key]: cleanValue };
      if (key === "quantityKg" || key === "rate") {
        const amount = n(key === "quantityKg" ? cleanValue : next.quantityKg) * n(key === "rate" ? cleanValue : next.rate);
        next.amount = amount > 0 ? amount.toFixed(2) : "";
      }
      return next;
    });
    const clean = cleanLines(updatedLines);
    const totalQty = totalQuantity(updatedLines);
    setEditingRow(calculateEdit({
      ...editingRow,
      material: clean[0]?.material || "",
      materialLines: JSON.stringify(updatedLines),
      materialSummary: materialSummary(updatedLines),
      quantityKg: totalQty,
      netWeight: totalQty,
      taxableValue: totalLineAmount(updatedLines),
      ratePerKg: totalQty > 0 ? totalLineAmount(updatedLines) / totalQty : editingRow.ratePerKg,
    }));
  }

  function addEditLine() {
    const updatedLines = [...editMaterialLines(), { ...blankLine }];
    setEditingRow({
      ...editingRow,
      materialLines: JSON.stringify(updatedLines),
    });
  }

  function removeEditLine(index) {
    const updatedLines = editMaterialLines().filter((_, i) => i !== index);
    const nextLines = updatedLines.length ? updatedLines : [{ ...blankLine }];
    const totalQty = totalQuantity(nextLines);
    setEditingRow(calculateEdit({
      ...editingRow,
      material: cleanLines(nextLines)[0]?.material || "",
      materialLines: JSON.stringify(nextLines),
      materialSummary: materialSummary(nextLines),
      quantityKg: totalQty,
      netWeight: totalQty,
      taxableValue: totalLineAmount(nextLines),
    }));
  }

  async function deleteRow(row) {
    const confirmed = window.confirm("Delete receiving record?");
    if (!confirmed) return;

    try {
      await apiCall({
        fn: "rm.update",
        ...row,
        inwardId: row.inwardId,
        status: "DELETED",
      });
      setStatus("Receiving record deleted");
      loadData();
    } catch (err) {
      alert(err.message);
    }
  }

  async function saveEdit() {
    if (!editingRow) return;
    const lines = cleanLines(editMaterialLines());
    if (lines.length === 0) return alert("Add at least one material line");
    try {
      const res = await apiCall({
        fn: "rm.update",
        ...editingRow,
        date: dateForInput(editingRow.date),
        invoiceDate: dateForInput(editingRow.invoiceDate),
        inwardId: editingRow.inwardId,
        material: lines[0].material,
        materialLines: JSON.stringify(lines),
        materialSummary: materialSummary(lines),
        quantityKg: totalQuantity(lines),
        netWeight: totalQuantity(lines),
      });

      if (res.ok === false) {
        alert(res.error || "Update failed");
        return;
      }

      setEditingRow(null);
      setStatus("Receiving record updated");
      loadData();
    } catch (err) {
      alert(err.message);
    }
  }

  const filteredRows = useMemo(() => {
    return rows
      .filter((r) => monthMatch(r.date))
      .sort((a, b) => String(dateForInput(b.date)).localeCompare(String(dateForInput(a.date))));
  }, [rows, month, year]);

  const totalQty = filteredRows.reduce((sum, row) => sum + n(row.netWeight || row.quantityKg), 0);
  const qcPending = filteredRows.filter((row) => String(row.qcStatus || "PENDING").toUpperCase() === "PENDING").length;
  const qcApproved = filteredRows.filter((row) => String(row.qcStatus || "").toUpperCase() === "APPROVED").length;
  const invoiceValue = filteredRows.reduce((sum, row) => sum + n(row.invoiceTotal), 0);
  const commercialTotals = calculateCommercialTotals(form, materialLines);

  return (
    <PageLayout
      title="RM Inward"
      subtitle="Accounts / Procurement receiving and commercial entry. Quality testing is performed only in Quality."
      actions={
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
      }
    >
      <div className="factory-kpi-grid">
        <KpiCard title="Received Qty" value={`${totalQty.toFixed(0)} Kg`} />
        <KpiCard title="QC Pending" value={qcPending} tone={qcPending > 0 ? "warning" : "neutral"} />
        <KpiCard title="QC Approved" value={qcApproved} tone="positive" />
        <KpiCard title="Invoice Total" value={`₹ ${invoiceValue.toFixed(0)}`} />
      </div>

      {status && <div style={statusStyle}>{status}</div>}

      <form
        onSubmit={submit}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") e.preventDefault();
        }}
        style={formStyle}
      >
        <SectionTitle text="Receiving Information" />

        <Field label="Receiving Ref">
          <input value={previewReceivingRef()} readOnly style={readonlyStyle} />
        </Field>

        <Field label="Date">
          <input name="date" type="date" value={form.date} onChange={onChange} style={inputStyle} required />
        </Field>

        <Field label="Supplier">
          <FactoryDropdown
            masterType="supplier"
            name="supplier"
            value={form.supplier}
            onChange={onChange}
            placeholder="Select Supplier"
            style={inputStyle}
            required
            allowAddNew
            defaults={{ supplierType: "RAW_MATERIAL" }}
          />
        </Field>

        <Field label="Vehicle Number">
          <input name="vehicleNo" value={form.vehicleNo} onChange={onChange} style={inputStyle} required />
        </Field>

        <Field label="PO Number">
          <input name="poNumber" value={form.poNumber} onChange={onChange} style={inputStyle} />
        </Field>

        <Field label="Supplier GRN Number">
          <input name="supplierGrnNumber" value={form.supplierGrnNumber} onChange={onChange} style={inputStyle} />
        </Field>

        <Field label="Supplier Invoice Number">
          <input name="supplierInvoiceNumber" value={form.supplierInvoiceNumber} onChange={onChange} style={inputStyle} />
        </Field>

        <Field label="Invoice Date">
          <input name="invoiceDate" type="date" value={form.invoiceDate} onChange={onChange} style={inputStyle} />
        </Field>

        <Field label="QC Status">
          <input value="PENDING" readOnly style={readonlyStyle} />
        </Field>

        <SectionTitle text="Material Lines" />
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr style={head}>
                <th style={th}>Material</th>
                <th style={th}>Quantity (Kg)</th>
                <th style={th}>Rate/Kg</th>
                <th style={th}>Amount</th>
                <th style={th}>Remarks</th>
                <th style={th}>Delete</th>
              </tr>
            </thead>
            <tbody>
              {materialLines.map((line, index) => (
                <tr key={index}>
                  <td style={td}>
                    <ProductionMaterialSelect
                      stage="RM_INWARD"
                      direction="INPUT"
                      value={line.material}
                      onChange={(e) => updateLine(index, "material", e)}
                      placeholder="Select RM material"
                      style={inputStyle}
                    />
                  </td>
                  <td style={td}>
                    <input
                      type="number"
                      value={line.quantityKg}
                      onChange={(e) => updateLine(index, "quantityKg", e.target.value)}
                      style={inputStyle}
                    />
                  </td>
                  <td style={td}>
                    <input
                      type="number"
                      value={line.rate}
                      onChange={(e) => updateLine(index, "rate", e.target.value)}
                      style={inputStyle}
                    />
                  </td>
                  <td style={td}>
                    <input
                      readOnly
                      value={(n(line.quantityKg) * n(line.rate) || 0).toFixed(2)}
                      style={readonlyStyle}
                    />
                  </td>
                  <td style={td}>
                    <input
                      value={line.remarks}
                      onChange={(e) => updateLine(index, "remarks", e.target.value)}
                      style={inputStyle}
                    />
                  </td>
                  <td style={td}>
                    <button type="button" onClick={() => removeLine(index)} style={deleteButton}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" onClick={addLine} style={addButton}>+ Add Material</button>
          <div style={lineTotal}>
            Total Quantity: {commercialTotals.totalQuantity.toFixed(2)} Kg · Taxable Value: ₹ {commercialTotals.taxableValue.toFixed(2)}
          </div>
        </div>

        <SectionTitle text="Commercial Information" />

        <Field label="Total Quantity">
          <input readOnly value={`${commercialTotals.totalQuantity.toFixed(2)} Kg`} style={readonlyStyle} />
        </Field>

        <Field label="Taxable Value">
          <input readOnly value={commercialTotals.taxableValue.toFixed(2)} style={readonlyStyle} />
        </Field>

        <Field label="GST %">
          <input type="number" name="gstPercent" value={form.gstPercent} onChange={onChange} style={inputStyle} />
        </Field>

        <Field label="GST Amount">
          <input readOnly value={commercialTotals.gstAmount.toFixed(2)} style={readonlyStyle} />
        </Field>

        <Field label="Freight">
          <input type="number" name="freight" value={form.freight} onChange={onChange} style={inputStyle} />
        </Field>

        <Field label="Other Charges">
          <input type="number" name="otherCharges" value={form.otherCharges} onChange={onChange} style={inputStyle} />
        </Field>

        <Field label="Round Off">
          <input type="number" name="roundOff" value={form.roundOff} onChange={onChange} style={inputStyle} />
        </Field>

        <Field label="Grand Total">
          <input readOnly value={commercialTotals.grandTotal.toFixed(2)} style={readonlyStyle} />
        </Field>

        <SectionTitle text="Payment" />

        <Field label="Payment Status">
          <select name="paymentStatus" value={form.paymentStatus} onChange={onChange} style={inputStyle}>
            <option>Unpaid</option>
            <option>Advance Paid</option>
            <option>Partially Paid</option>
            <option>Fully Paid</option>
          </select>
        </Field>

        <Field label="Advance Paid">
          <input type="number" name="advancePaid" value={form.advancePaid} onChange={onChange} style={inputStyle} />
        </Field>

        <Field label="Outstanding Amount">
          <input readOnly value={commercialTotals.outstandingAmount.toFixed(2)} style={readonlyStyle} />
        </Field>

        <Field label="Commercial Remarks">
          <textarea name="commercialRemarks" value={form.commercialRemarks} onChange={onChange} style={textareaStyle} />
        </Field>

        <Field label="Receiving Remarks">
          <textarea name="remarks" value={form.remarks} onChange={onChange} style={textareaStyle} />
        </Field>

        <div style={buttonWrap}>
          <button type="submit" style={saveButton}>Save Material Receiving</button>
          <button type="button" onClick={clearForm} style={clearButton}>Clear / New Entry</button>
        </div>
      </form>

      <DataTable
        title={`RM Inward History - ${month}/${year}`}
        rows={filteredRows}
        searchFields={[
          "inwardId",
          "supplier",
          "vehicleNo",
          "poNumber",
          "supplierGrnNumber",
          "supplierInvoiceNumber",
          "material",
          "paymentStatus",
          "qcStatus",
        ]}
        columns={[
          { key: "inwardId", label: "Receiving Ref" },
          { key: "date", label: "Date", render: (r) => formatDate(r.date), renderExport: (r) => dateForInput(r.date) },
          { key: "supplier", label: "Supplier" },
          { key: "vehicleNo", label: "Vehicle" },
          { key: "poNumber", label: "PO" },
          { key: "supplierGrnNumber", label: "Supplier GRN" },
          { key: "supplierInvoiceNumber", label: "Invoice" },
          {
            key: "material",
            label: "Materials",
            render: (r) => displayMaterialSummary(r),
            renderExport: (r) => displayMaterialSummary(r),
            searchValue: (r) => displayMaterialSummary(r),
          },
          { key: "netWeight", label: "Quantity Kg" },
          { key: "taxableValue", label: "Taxable", render: (r) => `₹ ${n(r.taxableValue).toFixed(0)}` },
          { key: "invoiceTotal", label: "Invoice Total", render: (r) => `₹ ${n(r.invoiceTotal).toFixed(0)}` },
          { key: "paymentStatus", label: "Payment", render: (r) => r.paymentStatus || "Unpaid" },
          { key: "outstandingAmount", label: "Outstanding", render: (r) => `₹ ${n(r.outstandingAmount).toFixed(0)}` },
          { key: "qcStatus", label: "QC Status", render: (r) => r.qcStatus || "PENDING" },
        ]}
        onEdit={editRow}
        onDelete={deleteRow}
      />

      {editingRow && (
        <div style={modalOverlay}>
          <div style={modal}>
            <h2 style={{ marginTop: 0 }}>Edit Receiving Record</h2>
            <div style={formStyle}>
              {[
                ["Receiving Ref", "inwardId", "text", true],
                ["Date", "date", "date"],
                ["Supplier", "supplier"],
                ["Vehicle Number", "vehicleNo"],
                ["PO Number", "poNumber"],
                ["Supplier GRN Number", "supplierGrnNumber"],
                ["Supplier Invoice Number", "supplierInvoiceNumber"],
                ["Invoice Date", "invoiceDate", "date"],
                ["Taxable Value", "taxableValue", "number"],
                ["GST %", "gstPercent", "number"],
                ["GST Amount", "gstAmount", "number"],
                ["Freight", "freight", "number"],
                ["Other Charges", "otherCharges", "number"],
                ["Round Off", "roundOff", "number"],
                ["Grand Total", "grandTotal", "number"],
                ["Advance Paid", "advancePaid", "number"],
                ["Outstanding Amount", "outstandingAmount", "number"],
              ].map(([label, key, type = "text", readOnly = false]) => (
                <Field key={key} label={label}>
                  <input
                    name={key}
                    type={type}
                    value={editingRow[key] || ""}
                    readOnly={readOnly}
                    onChange={(e) => setEditingRow(calculateEdit({ ...editingRow, [key]: e.target.value }))}
                    style={readOnly ? readonlyStyle : inputStyle}
                  />
                </Field>
              ))}

              <SectionTitle text="Material Lines" />
              <div style={tableWrap}>
                <table style={table}>
                  <thead>
                    <tr style={head}>
                      <th style={th}>Material</th>
                      <th style={th}>Quantity (Kg)</th>
                      <th style={th}>Rate/Kg</th>
                      <th style={th}>Amount</th>
                      <th style={th}>Remarks</th>
                      <th style={th}>Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editMaterialLines().map((line, index) => (
                      <tr key={index}>
                        <td style={td}>
                          <ProductionMaterialSelect
                            stage="RM_INWARD"
                            direction="INPUT"
                            value={line.material}
                            onChange={(e) => updateEditLine(index, "material", e)}
                            placeholder="Select RM material"
                            style={inputStyle}
                          />
                        </td>
                        <td style={td}>
                          <input
                            type="number"
                            value={line.quantityKg}
                            onChange={(e) => updateEditLine(index, "quantityKg", e.target.value)}
                            style={inputStyle}
                          />
                        </td>
                        <td style={td}>
                          <input
                            type="number"
                            value={line.rate}
                            onChange={(e) => updateEditLine(index, "rate", e.target.value)}
                            style={inputStyle}
                          />
                        </td>
                        <td style={td}>
                          <input
                            readOnly
                            value={(n(line.quantityKg) * n(line.rate) || 0).toFixed(2)}
                            style={readonlyStyle}
                          />
                        </td>
                        <td style={td}>
                          <input
                            value={line.remarks}
                            onChange={(e) => updateEditLine(index, "remarks", e.target.value)}
                            style={inputStyle}
                          />
                        </td>
                        <td style={td}>
                          <button type="button" onClick={() => removeEditLine(index)} style={deleteButton}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button type="button" onClick={addEditLine} style={addButton}>+ Add Material</button>
                <div style={lineTotal}>
                  Total Quantity: {totalQuantity(editMaterialLines()).toFixed(2)} Kg | Taxable Value: Rs. {totalLineAmount(editMaterialLines()).toFixed(2)}
                </div>
              </div>

              <Field label="Payment Status">
                <select
                  name="paymentStatus"
                  value={editingRow.paymentStatus || "Unpaid"}
                  onChange={(e) => setEditingRow({ ...editingRow, paymentStatus: e.target.value })}
                  style={inputStyle}
                >
                  <option>Unpaid</option>
                  <option>Advance Paid</option>
                  <option>Partially Paid</option>
                  <option>Fully Paid</option>
                </select>
              </Field>

              <Field label="QC Status">
                <input value={editingRow.qcStatus || "PENDING"} readOnly style={readonlyStyle} />
              </Field>

              <Field label="Commercial Remarks">
                <textarea
                  name="commercialRemarks"
                  value={editingRow.commercialRemarks || ""}
                  onChange={(e) => setEditingRow({ ...editingRow, commercialRemarks: e.target.value })}
                  style={textareaStyle}
                />
              </Field>

              <Field label="Receiving Remarks">
                <textarea
                  name="remarks"
                  value={editingRow.remarks || ""}
                  onChange={(e) => setEditingRow({ ...editingRow, remarks: e.target.value })}
                  style={textareaStyle}
                />
              </Field>
            </div>

            <div style={modalButtons}>
              <button type="button" onClick={() => setEditingRow(null)} style={cancelButton}>Cancel</button>
              <button type="button" onClick={saveEdit} style={modalSaveButton}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

function SectionTitle({ text }) {
  return <div style={sectionTitle}>{text}</div>;
}

function Field({ label, children }) {
  return (
    <div>
      <div style={labelStyle}>{label}</div>
      {children}
    </div>
  );
}

const filters = { display: "flex", gap: 10, flexWrap: "wrap" };
const filter = { padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 8 };
const formStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16, background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: 18, marginBottom: 20 };
const sectionTitle = { gridColumn: "1 / -1", marginTop: 8, marginBottom: 4, fontWeight: 800, color: "#0f766e", fontSize: 16 };
const labelStyle = { fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 5 };
const inputStyle = { width: "100%", height: 40, padding: "0 10px", border: "1px solid #cbd5e1", borderRadius: 8, boxSizing: "border-box" };
const readonlyStyle = { ...inputStyle, background: "#f8fafc", fontWeight: 800 };
const textareaStyle = { ...inputStyle, height: 82, padding: 10 };
const statusStyle = { background: "#ecfdf5", color: "#166534", border: "1px solid #bbf7d0", padding: 12, borderRadius: 10, marginBottom: 14, fontWeight: 700 };
const tableWrap = { gridColumn: "1 / -1", overflowX: "auto" };
const table = { width: "100%", borderCollapse: "collapse", minWidth: 760, marginBottom: 10 };
const head = { background: "#0f766e", color: "white" };
const th = { textAlign: "left", padding: 10, fontSize: 12 };
const td = { padding: 8, borderBottom: "1px solid #e5e7eb" };
const addButton = { background: "#2563eb", color: "white", border: "none", padding: "9px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 800 };
const deleteButton = { background: "#dc2626", color: "white", border: "none", padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 800 };
const lineTotal = { marginTop: 8, fontWeight: 800, color: "#0f766e" };
const buttonWrap = { gridColumn: "1 / -1", display: "flex", gap: 10, flexWrap: "wrap" };
const saveButton = { background: "#0f766e", color: "white", border: "none", padding: "12px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 800 };
const clearButton = { background: "#64748b", color: "white", border: "none", padding: "12px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 800 };
const modalOverlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 };
const modal = { background: "white", width: "min(980px,92vw)", maxHeight: "90vh", overflow: "auto", borderRadius: 14, padding: 22 };
const modalButtons = { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 };
const cancelButton = { background: "#64748b", color: "white", border: "none", padding: "10px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 800 };
const modalSaveButton = { ...saveButton, padding: "10px 16px" };
