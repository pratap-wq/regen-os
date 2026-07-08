import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";

const STATUS_COLORS = {
  green: "#15803d",
  yellow: "#b45309",
  red: "#b91c1c",
};

const STATUS_BG = {
  green: "#dcfce7",
  yellow: "#fef3c7",
  red: "#fee2e2",
};

export default function SystemHealth() {
  const [health, setHealth] = useState(null);
  const [status, setStatus] = useState("Loading connectivity health...");

  useEffect(() => {
    loadHealth();
  }, []);

  async function loadHealth() {
    try {
      setStatus("Loading connectivity health...");
      const res = await apiCall({ fn: "systemHealth.connectivity" });
      if (res.ok === false) {
        setStatus(res.error || "Failed loading health check");
        return;
      }
      setHealth(res);
      setStatus("");
    } catch (err) {
      console.log(err);
      setStatus(err.message || "Failed loading health check");
    }
  }

  const checks = health?.checks || [];
  const sortedChecks = useMemo(() => {
    const order = { red: 0, yellow: 1, green: 2 };
    return checks.slice().sort((a, b) => {
      return (order[a.status] ?? 9) - (order[b.status] ?? 9) || String(a.title).localeCompare(String(b.title));
    });
  }, [checks]);

  return (
    <div style={page}>
      <div style={hero}>
        <div>
          <div style={eyebrow}>System Health</div>
          <h1 style={title}>Connectivity Health Check</h1>
          <div style={subtitle}>
            Read-only review of material masters, ledger, production, stores, dispatch and Month Close readiness.
          </div>
        </div>
        <button type="button" onClick={loadHealth} style={refreshButton}>
          Refresh
        </button>
      </div>

      {status && <div style={statusStyle}>{status}</div>}

      {health && (
        <>
          <div style={summaryGrid}>
            <SummaryCard title="Overall" value={health.overallStatus?.toUpperCase()} status={health.overallStatus} />
            <SummaryCard title="Red Checks" value={health.summary?.red || 0} status="red" />
            <SummaryCard title="Yellow Checks" value={health.summary?.yellow || 0} status="yellow" />
            <SummaryCard title="Green Checks" value={health.summary?.green || 0} status="green" />
          </div>

          <div style={note}>
            Mode: {health.mode || "READ_ONLY"} | Generated: {health.generatedAt || ""}
          </div>

          <div style={checkGrid}>
            {sortedChecks.map((check) => (
              <HealthCard key={check.key} check={check} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({ title, value, status }) {
  const color = STATUS_COLORS[status] || "#334155";
  const bg = STATUS_BG[status] || "#f1f5f9";
  return (
    <div style={{ ...summaryCard, borderColor: color, background: bg }}>
      <div style={cardLabel}>{title}</div>
      <div style={{ ...summaryValue, color }}>{value}</div>
    </div>
  );
}

function HealthCard({ check }) {
  const color = STATUS_COLORS[check.status] || "#334155";
  const bg = STATUS_BG[check.status] || "#f1f5f9";
  return (
    <section style={checkCard}>
      <div style={checkHeader}>
        <div>
          <div style={moduleLabel}>{check.module}</div>
          <h2 style={checkTitle}>{check.title}</h2>
        </div>
        <span style={{ ...statusPill, background: bg, color }}>
          {String(check.status || "unknown").toUpperCase()}
        </span>
      </div>

      <div style={metaRow}>
        <span>Affected rows</span>
        <b>{Number(check.rowCount || 0)}</b>
      </div>

      <div style={actionBox}>{check.recommendedAction}</div>

      {!!check.sampleRows?.length && (
        <div style={sampleWrap}>
          <div style={sampleTitle}>Sample rows</div>
          {check.sampleRows.slice(0, 5).map((row, index) => (
            <pre key={index} style={sample}>
              {JSON.stringify(row, null, 2)}
            </pre>
          ))}
        </div>
      )}
    </section>
  );
}

const page = {
  width: "100%",
  paddingBottom: 30,
};

const hero = {
  background: "linear-gradient(135deg,#064e3b,#0f766e)",
  color: "white",
  borderRadius: 8,
  padding: 24,
  marginBottom: 18,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
};

const eyebrow = {
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 1,
  opacity: 0.85,
  fontWeight: 800,
};

const title = {
  margin: "5px 0",
  fontSize: 28,
};

const subtitle = {
  maxWidth: 760,
  color: "rgba(255,255,255,0.82)",
  lineHeight: 1.5,
};

const refreshButton = {
  background: "white",
  color: "#0f766e",
  border: "none",
  borderRadius: 8,
  padding: "11px 16px",
  fontWeight: 800,
  cursor: "pointer",
};

const statusStyle = {
  padding: 14,
  background: "#fff7ed",
  border: "1px solid #fed7aa",
  color: "#9a3412",
  borderRadius: 8,
  marginBottom: 16,
};

const summaryGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
  gap: 12,
  marginBottom: 14,
};

const summaryCard = {
  border: "1px solid",
  borderRadius: 8,
  padding: 16,
};

const cardLabel = {
  fontSize: 12,
  color: "#475569",
  fontWeight: 800,
  textTransform: "uppercase",
};

const summaryValue = {
  fontSize: 24,
  fontWeight: 900,
  marginTop: 8,
};

const note = {
  color: "#64748b",
  fontSize: 13,
  marginBottom: 14,
};

const checkGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
  gap: 14,
};

const checkCard = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  padding: 16,
  boxShadow: "0 8px 20px rgba(15,23,42,0.04)",
};

const checkHeader = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 12,
};

const moduleLabel = {
  color: "#64748b",
  fontSize: 12,
  fontWeight: 800,
  textTransform: "uppercase",
};

const checkTitle = {
  margin: "4px 0 0",
  fontSize: 17,
  color: "#0f172a",
};

const statusPill = {
  borderRadius: 999,
  padding: "5px 9px",
  fontSize: 11,
  fontWeight: 900,
};

const metaRow = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  padding: "12px 0",
  marginTop: 8,
  borderBottom: "1px solid #e2e8f0",
  color: "#475569",
};

const actionBox = {
  marginTop: 12,
  padding: 12,
  borderRadius: 8,
  background: "#f8fafc",
  color: "#334155",
  lineHeight: 1.45,
};

const sampleWrap = {
  marginTop: 12,
};

const sampleTitle = {
  fontSize: 12,
  color: "#64748b",
  fontWeight: 800,
  marginBottom: 8,
};

const sample = {
  background: "#0f172a",
  color: "#e2e8f0",
  borderRadius: 8,
  padding: 10,
  overflowX: "auto",
  fontSize: 11,
  lineHeight: 1.45,
};
