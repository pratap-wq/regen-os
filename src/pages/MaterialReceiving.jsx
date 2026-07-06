import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";

const today = new Date().toISOString().slice(0, 10);

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
  const [buckets, setBuckets] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [bucketRes, receiptRes] = await Promise.all([
      apiCall({ fn: "materialBuckets.list" }),
      apiCall({ fn: "materialReceiving.list" }),
    ]);

    setBuckets(bucketRes.rows || []);
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
          const bucket = buckets.find((b) => b.bucketName === value);
          next.bucketType = bucket?.bucketType || "";
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
    <div style={page}>
      <div style={hero}>
        <div>
          <div style={eyebrow}>Operator Workflow</div>
          <h1 style={title}>Material Receiving</h1>
          <div style={subtitle}>
            Receive one truck with multiple materials, create meaningful GRNs,
            and post each line into Material Bucket inventory.
          </div>
        </div>

        <div style={totalBox}>
          <span>Total Truck Weight</span>
          <b>{fmt(totalTruckWeightKg)} Kg</b>
        </div>
      </div>

      {message && <div style={messageBox}>{message}</div>}

      <form onSubmit={saveReceiving} style={card}>
        <h2 style={cardTitle}>Truck Details</h2>
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

          <Field label="Weighbridge Slip">
            <input
              value={form.weighbridgeSlipNo}
              onChange={(e) =>
                setForm({ ...form, weighbridgeSlipNo: e.target.value })
              }
              style={input}
              placeholder="Optional"
            />
          </Field>

          <Field label="Remarks">
            <input
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              style={input}
              placeholder="Optional"
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
              <option value="">Select Material Bucket</option>
              {buckets.map((bucket) => (
                <option
                  key={bucket.bucketId || bucket.bucketName}
                  value={bucket.bucketName}
                >
                  {bucket.bucketName} ({bucket.bucketType})
                </option>
              ))}
            </select>

            <input
              value={line.bucketType}
              readOnly
              style={readOnlyInput}
              placeholder="Bucket Type"
            />

            <input
              type="number"
              min="0"
              step="0.01"
              value={line.quantityKg}
              onChange={(e) => updateLine(index, "quantityKg", e.target.value)}
              style={input}
              placeholder="Kg"
            />

            <input
              type="number"
              min="0"
              step="0.01"
              value={line.ratePerKg}
              onChange={(e) => updateLine(index, "ratePerKg", e.target.value)}
              style={input}
              placeholder="Rate/Kg"
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
          {saving ? "Saving..." : "Save Receiving + Create GRNs"}
        </button>
      </form>

      <div style={card}>
        <h2 style={cardTitle}>Recent Receiving</h2>
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                {["Date", "Supplier", "Truck", "Weight", "Sample", "GRNs"].map(
                  (h) => (
                    <th key={h} style={th}>
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {receipts.slice(0, 10).map((receipt) => (
                <tr key={receipt.receivingId}>
                  <td style={td}>{receipt.date}</td>
                  <td style={td}>{receipt.supplier}</td>
                  <td style={td}>{receipt.vehicleNo}</td>
                  <td style={td}>{fmt(receipt.totalTruckWeightKg)} Kg</td>
                  <td style={td}>{receipt.qualitySampleRequired}</td>
                  <td style={td}>
                    {(receipt.lines || []).map((line) => line.grnId).join(", ")}
                  </td>
                </tr>
              ))}
              {receipts.length === 0 && (
                <tr>
                  <td style={td} colSpan={6}>
                    No material receiving entries yet.
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

const page = { display: "grid", gap: 18 };
const hero = {
  background: "linear-gradient(135deg,#052e16,#0f766e 60%,#14b8a6)",
  color: "white",
  borderRadius: 20,
  padding: 26,
  display: "flex",
  justifyContent: "space-between",
  gap: 18,
  flexWrap: "wrap",
  boxShadow: "0 12px 30px rgba(15,118,110,0.22)",
};
const eyebrow = { fontSize: 12, textTransform: "uppercase", fontWeight: 900 };
const title = { margin: "6px 0", fontSize: 34, fontWeight: 950 };
const subtitle = { opacity: 0.92, maxWidth: 780 };
const totalBox = {
  background: "rgba(255,255,255,0.14)",
  border: "1px solid rgba(255,255,255,0.24)",
  borderRadius: 16,
  padding: 16,
  minWidth: 210,
  display: "grid",
  gap: 6,
};
const card = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
};
const cardTitle = { marginTop: 0, color: "#0f172a", fontWeight: 900 };
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
const readOnlyInput = { ...input, background: "#f8fafc", color: "#64748b" };
const sectionHeader = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
  marginTop: 18,
};
const lineGrid = {
  display: "grid",
  gridTemplateColumns: "minmax(220px,1fr) 110px 110px 110px 150px 90px",
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
const tableWrap = { overflowX: "auto" };
const table = { width: "100%", borderCollapse: "collapse", fontSize: 13 };
const th = {
  textAlign: "left",
  padding: 10,
  background: "#f8fafc",
  borderBottom: "1px solid #e2e8f0",
  color: "#475569",
};
const td = { padding: 10, borderBottom: "1px solid #f1f5f9" };
