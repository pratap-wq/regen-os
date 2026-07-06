import { useState } from "react";
import { apiCall } from "../api/api";
import { formatDate } from "../utils/date";

export default function Traceability() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function searchTrace(e) {
    e.preventDefault();

    if (!query.trim()) {
      setStatus("Enter a batch ID, dispatch ID, or lot number.");
      return;
    }

    try {
      setLoading(true);
      setStatus("");

      const res = await apiCall({
        fn: "trace.batch",
        query: query.trim(),
      });

      if (res.ok === false) {
        setStatus(res.error || "Trace failed");
        return;
      }

      setData(res);
    } catch (err) {
      setStatus(err.message);
    } finally {
      setLoading(false);
    }
  }

  const totalFound =
    (data?.rm?.length || 0) +
    (data?.rmQuality?.length || 0) +
    (data?.wash?.length || 0) +
    (data?.sorting?.length || 0) +
    (data?.extrusion?.length || 0) +
    (data?.fgQuality?.length || 0) +
    (data?.dispatch?.length || 0);

  return (
    <div style={page}>
      <div style={hero}>
        <div>
          <div style={eyebrow}>Traceability</div>
          <h1 style={title}>Batch Journey</h1>
          <div style={subtitle}>
            Search any RM, Wash, Sorting, Extrusion, FG Quality or Dispatch reference.
          </div>
        </div>
      </div>

      <form onSubmit={searchTrace} style={searchBox}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter batch ID / lot no / dispatch ID"
          style={searchInput}
        />

        <button type="submit" style={searchButton} disabled={loading}>
          {loading ? "Searching..." : "Trace"}
        </button>
      </form>

      {status && <div style={statusBox}>{status}</div>}

      {data && (
        <>
          <div style={summary}>
            Search: <b>{data.query}</b> | Records found: <b>{totalFound}</b>
          </div>

          <div style={flow}>
            <TraceSection title="1. RM Inward" rows={data.rm} type="rm" />
            <TraceSection title="2. RM Quality" rows={data.rmQuality} type="rmq" />
            <TraceSection title="3. Wash" rows={data.wash} type="wash" />
            <TraceSection title="4. Sorting" rows={data.sorting} type="sorting" />
            <TraceSection title="5. Extrusion / FG Batch" rows={data.extrusion} type="extrusion" />
            <TraceSection title="6. FG Quality" rows={data.fgQuality} type="fgq" />
            <TraceSection title="7. Dispatch" rows={data.dispatch} type="dispatch" />
          </div>
        </>
      )}
    </div>
  );
}

function TraceSection({ title, rows = [], type }) {
  return (
    <div style={card}>
      <div style={cardTitle}>
        {title}
        <span style={badge}>{rows.length}</span>
      </div>

      {rows.length === 0 ? (
        <div style={empty}>No record found.</div>
      ) : (
        rows.map((r, i) => <TraceCard key={i} row={r} type={type} />)
      )}
    </div>
  );
}

function TraceCard({ row, type }) {
  const fields = getFields(row, type);

  return (
    <div style={record}>
      {fields.map(([label, value]) => (
        <div key={label} style={line}>
          <span style={labelStyle}>{label}</span>
          <b>{value || "-"}</b>
        </div>
      ))}
    </div>
  );
}

function getFields(r, type) {
  if (type === "rm") {
    return [
      ["RM Batch", r.inwardId || r.batchId],
      ["Date", formatDate(r.date)],
      ["Supplier", r.supplier],
      ["Material", r.material],
      ["Net Kg", Number(r.netWeight || 0).toFixed(0)],
      ["Rate", r.ratePerKg],
      ["Status", r.status],
    ];
  }

  if (type === "rmq") {
    return [
      ["Quality ID", r.qualityId],
      ["RM Batch", r.rmInwardId],
      ["Date", formatDate(r.date)],
      ["Form", r.formOfMaterial],
      ["Condition", r.conditionOfMaterial],
      ["Dust %", r.dryDustPercent],
      ["PP %", r.ppPercent],
      ["Sink %", r.sinkMaterialPercent],
      ["Status", r.status],
    ];
  }

  if (type === "wash") {
    return [
      ["Wash Batch", r.washBatchId || r.batchId],
      ["Source RM", r.sourceRMId || r.sourceRmInwardId],
      ["Date", formatDate(r.date)],
      ["Material", r.inputMaterial],
      ["Input Kg", Number(r.inputWeightKg || 0).toFixed(0)],
      ["Output Kg", Number(r.washedOutputKg || 0).toFixed(0)],
      ["Status", r.status],
    ];
  }

  if (type === "sorting") {
    return [
      ["Sorting Batch", r.sortingBatchId || r.batchId],
      ["Source Wash", r.sourceWashBatchId],
      ["Date", formatDate(r.date)],
      ["Input Kg", Number(r.inputWeightKg || 0).toFixed(0)],
      ["Accepted Kg", Number(r.acceptedQtyKg || 0).toFixed(0)],
      ["Status", r.status],
    ];
  }

  if (type === "extrusion") {
    return [
      ["Extrusion Batch", r.extrusionBatchId || r.batchId],
      ["Source Batch", r.sourceBatchId],
      ["Source Sorting", r.sourceSortingBatchId],
      ["Source Wash", r.sourceWashBatchId],
      ["Date", formatDate(r.date)],
      ["Grade", r.productionGrade],
      ["Input Kg", Number(r.totalInputKg || r.inputWeightKg || 0).toFixed(0)],
      ["FG Kg", Number(r.fgOutputKg || 0).toFixed(0)],
      ["Lumps Kg", Number(r.lumpsKg || 0).toFixed(0)],
      ["Status", r.status],
    ];
  }

  if (type === "fgq") {
    return [
      ["Quality ID", r.qualityId],
      ["FG Batch", r.extrusionBatchId || r.fgBatchCode],
      ["Date", formatDate(r.date)],
      ["Moisture %", r.moisturePercent],
      ["MFI", r.mfi],
      ["Colour", r.colour],
      ["Avg Bag Kg", r.avgBagWeightKg],
      ["Status", r.status],
    ];
  }

  return [
    ["Dispatch ID", r.dispatchId],
    ["FG Batch", r.sourceExtrusionBatchId || r.linkedFgBatchId],
    ["Date", formatDate(r.date)],
    ["Customer", r.customerName],
    ["Unit", r.customerUnit],
    ["Grade", r.grade],
    ["Qty Kg", Number(r.quantityKg || 0).toFixed(0)],
    ["Invoice", r.invoiceNo],
    ["Status", r.dispatchStatus || r.status],
  ];
}

const page = { width: "100%", paddingBottom: 30 };

const hero = {
  background: "linear-gradient(135deg,#064e3b,#0f766e)",
  color: "white",
  borderRadius: 18,
  padding: 24,
  marginBottom: 18,
};

const eyebrow = {
  fontSize: 13,
  textTransform: "uppercase",
  letterSpacing: 1.2,
  opacity: 0.85,
  fontWeight: 800,
};

const title = {
  margin: "6px 0",
  fontSize: 32,
  fontWeight: 950,
};

const subtitle = { opacity: 0.9 };

const searchBox = {
  display: "flex",
  gap: 10,
  marginBottom: 14,
};

const searchInput = {
  flex: 1,
  height: 44,
  border: "1px solid #cbd5e1",
  borderRadius: 10,
  padding: "0 12px",
  fontSize: 15,
};

const searchButton = {
  background: "#0f766e",
  color: "white",
  border: "none",
  borderRadius: 10,
  padding: "0 22px",
  fontWeight: 800,
  cursor: "pointer",
};

const statusBox = {
  background: "#fef2f2",
  color: "#991b1b",
  border: "1px solid #fecaca",
  padding: 12,
  borderRadius: 10,
  marginBottom: 14,
  fontWeight: 700,
};

const summary = {
  background: "#ecfdf5",
  color: "#166534",
  border: "1px solid #bbf7d0",
  padding: 12,
  borderRadius: 10,
  marginBottom: 14,
};

const flow = {
  display: "grid",
  gap: 14,
};

const card = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 16,
};

const cardTitle = {
  fontSize: 18,
  fontWeight: 900,
  color: "#0f766e",
  marginBottom: 12,
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const badge = {
  background: "#ccfbf1",
  color: "#0f766e",
  borderRadius: 999,
  padding: "3px 9px",
  fontSize: 12,
};

const empty = {
  color: "#64748b",
  fontSize: 13,
};

const record = {
  borderTop: "1px solid #f1f5f9",
  paddingTop: 10,
  marginTop: 10,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: 10,
};

const line = {
  display: "flex",
  flexDirection: "column",
  gap: 3,
};

const labelStyle = {
  color: "#64748b",
  fontSize: 12,
  fontWeight: 700,
};