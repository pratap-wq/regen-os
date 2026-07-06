import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";
import DataTable from "../components/DataTable";
import OperationalWorkspace from "../components/OperationalWorkspace";

const today = new Date().toISOString().slice(0, 10);
const now = new Date();

const blankForm = {
  date: today,
  supplier: "",
  vehicleNo: "",
  weighbridgeSlipNo: "",
  remarks: "",
};

const blankLine = {
  materialBucket: "",
  bucketType: "",
  quantityKg: "",
  ratePerKg: "",
  qualitySampleRequired: "NO",
};

export default function MaterialReceiving() {
  const [form, setForm] = useState(blankForm);
  const [lines, setLines] = useState([{ ...blankLine }]);
  const [materials, setMaterials] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [month, setMonth] = useState(String(now.getMonth() + 1).padStart(2, "0"));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [materialRes, receiptRes] = await Promise.all([
      apiCall({ fn: "materialBuckets.list" }),
      apiCall({ fn: "materialReceiving.list" }),
    ]);

    setMaterials(materialRes.rows || []);
    setReceipts(receiptRes.rows || []);
  }

  const totalTruckWeightKg = useMemo(
    () => lines.reduce((s, line) => s + Number(line.quantityKg || 0), 0),
    [lines]
  );

  function updateLine(index, field, value) {
    setLines((rows) =>
      rows.map((row, i) => {
        if (i !== index) return row;
        const next = { ...row, [field]: value };

        if (field === "materialBucket") {
          const material = materials.find((b) => b.bucketName === value);
          next.bucketType = material?.bucketType || "";
        }

        return next;
      })
    );
  }

  async function saveReceiving(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const materials = lines
        .map((line) => ({
          materialBucket: line.materialBucket,
          bucketType: line.bucketType,
          quantityKg: Number(line.quantityKg || 0),
          ratePerKg: Number(line.ratePerKg || 0),
          qualitySampleRequired: line.qualitySampleRequired,
        }))
        .filter((line) => line.materialBucket || line.quantityKg > 0);

      const res = await apiCall({
        fn: "materialReceiving.add",
        ...form,
        materials,
      });

      if (!res.ok) {
        setMessage(res.error || "Could not save material receiving");
        return;
      }

      setMessage(
        `Material received. ${res.grns?.length || 0} GRNs created. Total ${fmt(
          res.totalTruckWeightKg
        )} Kg.`
      );
      setForm({ ...blankForm, date: form.date });
      setLines([{ ...blankLine }]);
      loadData();
    } finally {
      setSaving(false);
    }
  }

  return (
    <OperationalWorkspace
      eyebrow="Operator Workflow"
      title="Material Receiving"
      subtitle="Select supplier, truck, materials and weight. RegenOS creates GRNs and posts Material Inventory automatically."
      month={month}
      year={year}
      search={search}
      onMonthChange={setMonth}
      onYearChange={setYear}
      onSearchChange={setSearch}
      onRefresh={loadData}
      snapshots={[
        { label: "Truck Weight", value: `${fmt(totalTruckWeightKg)} Kg` },
        { label: "Material Lines", value: lines.length },
        {
          label: "Quality Samples",
          value: lines.filter((line) => line.qualitySampleRequired === "YES").length,
        },
        { label: "Recent Receipts", value: receipts.length },
      ]}
      entryTitle="Receive Truck"
      historyTitle="Receiving History"
      history={
        <DataTable
          title="Receiving History"
          rows={receipts}
          searchFields={["supplier", "vehicleNo", "receivingId"]}
          columns={[
            { key: "date", label: "Date" },
            { key: "supplier", label: "Supplier" },
            { key: "vehicleNo", label: "Truck" },
            { key: "totalTruckWeightKg", label: "Weight Kg" },
            { key: "qualitySampleRequired", label: "Status" },
            {
              key: "material",
              label: "Material",
              render: (r) => (r.lines || []).map((line) => line.materialBucket).join(", "),
              renderExport: (r) => (r.lines || []).map((line) => line.materialBucket).join(", "),
            },
            {
              key: "grn",
              label: "GRNs",
              render: (r) => (r.lines || []).map((line) => line.grnId).join(", "),
              renderExport: (r) => (r.lines || []).map((line) => line.grnId).join(", "),
            },
          ]}
        />
      }
    >
      {message && <div style={messageBox}>{message}</div>}

      <form onSubmit={saveReceiving} style={card}>
        <div style={grid}>
          <Field label="Date">
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              style={input}
            />
          </Field>

          <Field label="Supplier">
            <input
              value={form.supplier}
              onChange={(e) => setForm({ ...form, supplier: e.target.value })}
              style={input}
              placeholder="Supplier name"
            />
          </Field>

          <Field label="Vehicle No">
            <input
              value={form.vehicleNo}
              onChange={(e) => setForm({ ...form, vehicleNo: e.target.value })}
              style={input}
              placeholder="RJ14 XX 1234"
            />
          </Field>

        </div>

        <div style={sectionHeader}>
          <h2 style={cardTitle}>Material Lines</h2>
          <button
            type="button"
            onClick={() => setLines([...lines, { ...blankLine }])}
            style={miniButton}
          >
            + Add Material
          </button>
        </div>

        {lines.map((line, index) => (
          <div key={index} style={lineGrid}>
            <select
              value={line.materialBucket}
              onChange={(e) => updateLine(index, "materialBucket", e.target.value)}
              style={input}
            >
              <option value="">Select Material</option>
              {materials.map((bucket) => (
                <option
                  key={bucket.bucketId || bucket.bucketName}
                  value={bucket.bucketName}
                >
                  {bucket.bucketName} ({bucket.bucketType})
                </option>
              ))}
            </select>

            <input
              type="number"
              min="0"
              step="0.01"
              value={line.quantityKg}
              onChange={(e) => updateLine(index, "quantityKg", e.target.value)}
              style={input}
              placeholder="Kg"
            />

            <select
              value={line.qualitySampleRequired}
              onChange={(e) =>
                updateLine(index, "qualitySampleRequired", e.target.value)
              }
              style={input}
            >
              <option value="NO">No Sample</option>
              <option value="YES">Sample Required</option>
            </select>

            <button
              type="button"
              onClick={() => setLines(lines.filter((_, i) => i !== index))}
              style={dangerButton}
              disabled={lines.length === 1}
            >
              Remove
            </button>
          </div>
        ))}

        <div style={summary}>
          <Metric label="Material Lines" value={lines.length} />
          <Metric label="Total Truck Weight" value={`${fmt(totalTruckWeightKg)} Kg`} />
          <Metric
            label="Quality Samples"
            value={lines.filter((line) => line.qualitySampleRequired === "YES").length}
          />
        </div>

        <button disabled={saving} style={primaryButton}>
          {saving ? "Saving..." : "Save Receiving"}
        </button>
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

function Metric({ label, value }) {
  return (
    <div style={metric}>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

function fmt(value) {
  return Number(value || 0).toFixed(2);
}

const card = {
  display: "grid",
  gap: 16,
};
const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
  gap: 12,
};
const field = {
  display: "grid",
  gap: 6,
  color: "#334155",
  fontSize: 12,
  fontWeight: 800,
};
const input = {
  height: 40,
  border: "1px solid #cbd5e1",
  borderRadius: 10,
  padding: "0 10px",
  fontSize: 14,
};
const sectionHeader = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
  marginTop: 18,
};
const lineGrid = {
  display: "grid",
  gridTemplateColumns: "minmax(260px,1fr) 140px 150px 90px",
  gap: 10,
  marginBottom: 10,
};
const summary = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
  gap: 10,
  margin: "18px 0",
};
const metric = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: 12,
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
};
const primaryButton = {
  border: "none",
  borderRadius: 12,
  background: "#00b26b",
  color: "white",
  padding: "12px 18px",
  fontWeight: 900,
  cursor: "pointer",
};
const miniButton = {
  border: "1px solid #86efac",
  borderRadius: 10,
  background: "#f0fdf4",
  color: "#166534",
  padding: "8px 10px",
  fontWeight: 900,
  cursor: "pointer",
};
const dangerButton = {
  border: "1px solid #fecaca",
  borderRadius: 10,
  background: "#fff1f2",
  color: "#b91c1c",
  fontWeight: 900,
  cursor: "pointer",
};
const messageBox = {
  background: "#ecfdf5",
  border: "1px solid #86efac",
  color: "#166534",
  borderRadius: 12,
  padding: 12,
  fontWeight: 800,
};
