import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";

const today = new Date().toISOString().slice(0, 10);

const blankRun = {
  date: today,
  shift: "DAY",
  processType: "WASH",
  machine: "",
  operator: "",
  remarks: "",
};

const blankBucket = {
  bucketName: "",
  bucketType: "RM",
  materialFamily: "",
  processStage: "",
  defaultNextProcess: "",
};

export default function MaterialTransformation() {
  const [form, setForm] = useState(blankRun);
  const [inputs, setInputs] = useState([{ inputBucket: "", quantityKg: "" }]);
  const [outputs, setOutputs] = useState([
    { outputBucket: "", quantityKg: "", outputType: "GOOD" },
  ]);
  const [buckets, setBuckets] = useState([]);
  const [runs, setRuns] = useState([]);
  const [bucketForm, setBucketForm] = useState(blankBucket);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [bucketRes, runRes] = await Promise.all([
      apiCall({ fn: "materialBuckets.list" }),
      apiCall({ fn: "transformationRuns.list" }),
    ]);

    setBuckets(bucketRes.rows || []);
    setRuns(runRes.rows || []);
  }

  const summary = useMemo(() => {
    const totalInputKg = inputs.reduce(
      (s, row) => s + Number(row.quantityKg || 0),
      0
    );
    const totalOutputKg = outputs.reduce(
      (s, row) => s + Number(row.quantityKg || 0),
      0
    );
    const goodOutputKg = outputs
      .filter((row) => row.outputType === "GOOD" || row.outputType === "REWORK")
      .reduce((s, row) => s + Number(row.quantityKg || 0), 0);
    const lossOutputKg = outputs
      .filter((row) => row.outputType === "WASTE" || row.outputType === "LOSS")
      .reduce((s, row) => s + Number(row.quantityKg || 0), 0);
    const varianceKg = totalInputKg - totalOutputKg;
    const recoveryPercent =
      totalInputKg > 0 ? (goodOutputKg / totalInputKg) * 100 : 0;
    const lossPercent =
      totalInputKg > 0
        ? ((lossOutputKg + Math.max(varianceKg, 0)) / totalInputKg) * 100
        : 0;

    return {
      totalInputKg,
      totalOutputKg,
      varianceKg,
      recoveryPercent,
      lossPercent,
    };
  }, [inputs, outputs]);

  function updateInput(index, field, value) {
    setInputs((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  function updateOutput(index, field, value) {
    setOutputs((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  async function saveBucket(e) {
    e.preventDefault();
    setMessage("");

    const res = await apiCall({
      fn: "materialBuckets.add",
      ...bucketForm,
    });

    if (!res.ok) {
      setMessage(res.error || "Could not save material bucket");
      return;
    }

    setBucketForm(blankBucket);
    setMessage("Material bucket saved");
    loadData();
  }

  async function saveRun(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const cleanInputs = inputs
        .map((row) => ({
          inputBucket: row.inputBucket,
          quantityKg: Number(row.quantityKg || 0),
        }))
        .filter((row) => row.inputBucket || row.quantityKg > 0);
      const cleanOutputs = outputs
        .map((row) => ({
          outputBucket: row.outputBucket,
          quantityKg: Number(row.quantityKg || 0),
          outputType: row.outputType,
        }))
        .filter((row) => row.outputBucket || row.quantityKg > 0);

      const res = await apiCall({
        fn: "transformationRuns.add",
        ...form,
        inputs: cleanInputs,
        outputs: cleanOutputs,
      });

      if (!res.ok) {
        setMessage(res.error || "Could not save transformation");
        return;
      }

      setMessage(
        `Transformation saved: ${res.runId} | Recovery ${Number(
          res.recoveryPercent || 0
        ).toFixed(2)}%`
      );
      setForm({ ...blankRun, date: form.date });
      setInputs([{ inputBucket: "", quantityKg: "" }]);
      setOutputs([{ outputBucket: "", quantityKg: "", outputType: "GOOD" }]);
      loadData();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={page}>
      <div style={hero}>
        <div>
          <div style={eyebrow}>Phase 1 Foundation</div>
          <h1 style={title}>Material Transformation</h1>
          <div style={subtitle}>
            Consume Material Buckets, create output buckets, and post inventory
            movements without replacing legacy production screens.
          </div>
        </div>
      </div>

      {message && <div style={messageBox}>{message}</div>}

      <div style={twoCol}>
        <form onSubmit={saveRun} style={card}>
          <h2 style={cardTitle}>New Transformation Run</h2>

          <div style={grid}>
            <Field label="Date">
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                style={input}
              />
            </Field>

            <Field label="Shift">
              <select
                value={form.shift}
                onChange={(e) => setForm({ ...form, shift: e.target.value })}
                style={input}
              >
                <option value="DAY">Day</option>
                <option value="NIGHT">Night</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </Field>

            <Field label="Process Type">
              <select
                value={form.processType}
                onChange={(e) =>
                  setForm({ ...form, processType: e.target.value })
                }
                style={input}
              >
                <option value="WASH">Wash</option>
                <option value="SORTING">Sorting</option>
                <option value="EXTRUSION">Extrusion</option>
                <option value="REWORK">Rework</option>
              </select>
            </Field>

            <Field label="Machine">
              <input
                value={form.machine}
                onChange={(e) => setForm({ ...form, machine: e.target.value })}
                style={input}
                placeholder="Line / machine"
              />
            </Field>

            <Field label="Operator">
              <input
                value={form.operator}
                onChange={(e) => setForm({ ...form, operator: e.target.value })}
                style={input}
                placeholder="Operator name"
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

          <BucketRows
            title="Inputs"
            rows={inputs}
            buckets={buckets}
            bucketField="inputBucket"
            onChange={updateInput}
            onAdd={() =>
              setInputs([...inputs, { inputBucket: "", quantityKg: "" }])
            }
            onRemove={(index) =>
              setInputs(inputs.filter((_, i) => i !== index))
            }
          />

          <BucketRows
            title="Outputs"
            rows={outputs}
            buckets={buckets}
            bucketField="outputBucket"
            includeOutputType
            onChange={updateOutput}
            onAdd={() =>
              setOutputs([
                ...outputs,
                { outputBucket: "", quantityKg: "", outputType: "GOOD" },
              ])
            }
            onRemove={(index) =>
              setOutputs(outputs.filter((_, i) => i !== index))
            }
          />

          <div style={summaryGrid}>
            <Metric label="Total Input" value={`${fmt(summary.totalInputKg)} Kg`} />
            <Metric label="Total Output" value={`${fmt(summary.totalOutputKg)} Kg`} />
            <Metric
              label="Variance"
              value={`${fmt(summary.varianceKg)} Kg`}
              color={Math.abs(summary.varianceKg) <= 0.01 ? "#16a34a" : "#dc2626"}
            />
            <Metric
              label="Recovery"
              value={`${fmt(summary.recoveryPercent)}%`}
              color="#0f766e"
            />
            <Metric
              label="Loss"
              value={`${fmt(summary.lossPercent)}%`}
              color="#b45309"
            />
          </div>

          <button disabled={saving} style={primaryButton}>
            {saving ? "Saving..." : "Save Transformation"}
          </button>
        </form>

        <form onSubmit={saveBucket} style={card}>
          <h2 style={cardTitle}>Quick Add Material Bucket</h2>
          <div style={grid}>
            <Field label="Bucket Name">
              <input
                value={bucketForm.bucketName}
                onChange={(e) =>
                  setBucketForm({ ...bucketForm, bucketName: e.target.value })
                }
                style={input}
                placeholder="White Flakes"
              />
            </Field>

            <Field label="Bucket Type">
              <select
                value={bucketForm.bucketType}
                onChange={(e) =>
                  setBucketForm({ ...bucketForm, bucketType: e.target.value })
                }
                style={input}
              >
                <option value="RM">RM</option>
                <option value="WIP">WIP</option>
                <option value="FG">FG</option>
                <option value="WASTE">Waste</option>
                <option value="STORES">Stores</option>
              </select>
            </Field>

            <Field label="Material Family">
              <input
                value={bucketForm.materialFamily}
                onChange={(e) =>
                  setBucketForm({
                    ...bucketForm,
                    materialFamily: e.target.value,
                  })
                }
                style={input}
                placeholder="PP / HDPE / PET"
              />
            </Field>

            <Field label="Process Stage">
              <input
                value={bucketForm.processStage}
                onChange={(e) =>
                  setBucketForm({ ...bucketForm, processStage: e.target.value })
                }
                style={input}
                placeholder="Receiving / Wash / FG"
              />
            </Field>

            <Field label="Default Next Process">
              <input
                value={bucketForm.defaultNextProcess}
                onChange={(e) =>
                  setBucketForm({
                    ...bucketForm,
                    defaultNextProcess: e.target.value,
                  })
                }
                style={input}
                placeholder="WASH / SORTING / EXTRUSION"
              />
            </Field>
          </div>

          <button style={secondaryButton}>Add Bucket</button>

          <h3 style={smallTitle}>Active Buckets</h3>
          <div style={bucketList}>
            {buckets.length === 0 ? (
              <div style={empty}>No material buckets yet.</div>
            ) : (
              buckets.slice(0, 12).map((bucket) => (
                <div key={bucket.bucketId || bucket.bucketName} style={bucketPill}>
                  <b>{bucket.bucketName}</b>
                  <span>{bucket.bucketType}</span>
                </div>
              ))
            )}
          </div>
        </form>
      </div>

      <div style={card}>
        <h2 style={cardTitle}>Recent Transformation Runs</h2>
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                {[
                  "Run",
                  "Date",
                  "Process",
                  "Shift",
                  "Input Kg",
                  "Output Kg",
                  "Variance",
                  "Recovery",
                ].map((h) => (
                  <th key={h} style={th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {runs.slice(0, 10).map((run) => (
                <tr key={run.runId}>
                  <td style={td}>{run.runId}</td>
                  <td style={td}>{run.date}</td>
                  <td style={td}>{run.processType}</td>
                  <td style={td}>{run.shift}</td>
                  <td style={td}>{fmt(run.totalInputKg)}</td>
                  <td style={td}>{fmt(run.totalOutputKg)}</td>
                  <td style={td}>{fmt(run.varianceKg)}</td>
                  <td style={td}>{fmt(run.recoveryPercent)}%</td>
                </tr>
              ))}
              {runs.length === 0 && (
                <tr>
                  <td style={td} colSpan={8}>
                    No transformation runs yet.
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

function BucketRows({
  title,
  rows,
  buckets,
  bucketField,
  includeOutputType = false,
  onChange,
  onAdd,
  onRemove,
}) {
  return (
    <div style={section}>
      <div style={sectionHeader}>
        <h3 style={smallTitle}>{title}</h3>
        <button type="button" onClick={onAdd} style={miniButton}>
          + Add {title === "Inputs" ? "Input" : "Output"} Bucket
        </button>
      </div>

      {rows.map((row, index) => (
        <div key={index} style={rowGrid}>
          <select
            value={row[bucketField]}
            onChange={(e) => onChange(index, bucketField, e.target.value)}
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
            type="number"
            min="0"
            step="0.01"
            value={row.quantityKg}
            onChange={(e) => onChange(index, "quantityKg", e.target.value)}
            style={input}
            placeholder="Kg"
          />

          {includeOutputType && (
            <select
              value={row.outputType}
              onChange={(e) => onChange(index, "outputType", e.target.value)}
              style={input}
            >
              <option value="GOOD">Good</option>
              <option value="WASTE">Waste</option>
              <option value="REWORK">Rework</option>
              <option value="LOSS">Loss</option>
            </select>
          )}

          <button
            type="button"
            onClick={() => onRemove(index)}
            style={dangerButton}
            disabled={rows.length === 1}
          >
            Remove
          </button>
        </div>
      ))}
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

function Metric({ label, value, color = "#0f172a" }) {
  return (
    <div style={metric}>
      <span>{label}</span>
      <b style={{ color }}>{value}</b>
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
  boxShadow: "0 12px 30px rgba(15,118,110,0.22)",
};

const eyebrow = {
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 1,
  opacity: 0.9,
  fontWeight: 900,
};

const title = { margin: "6px 0", fontSize: 34, fontWeight: 950 };
const subtitle = { opacity: 0.92, maxWidth: 760 };

const twoCol = {
  display: "grid",
  gridTemplateColumns: "minmax(0,2fr) minmax(320px,1fr)",
  gap: 18,
  alignItems: "start",
};

const card = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
};

const cardTitle = {
  marginTop: 0,
  color: "#0f172a",
  fontSize: 20,
  fontWeight: 900,
};

const smallTitle = {
  margin: "12px 0",
  color: "#0f172a",
  fontSize: 15,
  fontWeight: 900,
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

const section = { marginTop: 18 };
const sectionHeader = {
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  alignItems: "center",
};

const rowGrid = {
  display: "grid",
  gridTemplateColumns: "minmax(220px,1fr) 130px 130px 90px",
  gap: 10,
  marginBottom: 10,
};

const summaryGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
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

const secondaryButton = {
  ...primaryButton,
  background: "#005d34",
  marginTop: 14,
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

const bucketList = { display: "grid", gap: 8, marginTop: 10 };
const bucketPill = {
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 999,
  padding: "8px 12px",
  fontSize: 13,
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
const empty = { color: "#64748b", padding: 10 };
