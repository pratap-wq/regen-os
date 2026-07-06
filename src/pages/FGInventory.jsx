import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";
import { formatDate } from "../utils/date";

export default function FGInventory() {
  const [extrusionRows, setExtrusionRows] = useState([]);
  const [dispatchRows, setDispatchRows] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [extrusion, dispatch] = await Promise.all([
        apiCall({ fn: "extrusion.list" }),
        apiCall({ fn: "dispatch.list" }),
      ]);

      setExtrusionRows(extrusion.rows || []);
      setDispatchRows(dispatch.rows || []);
    } catch (err) {
      console.log(err);
      setStatus("Failed loading FG inventory");
    }
  }

  function parseDispatchLines(row) {
    try {
      if (row.dispatchLines) {
        const parsed = JSON.parse(row.dispatchLines);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err) {
      console.log(err);
    }

    if (row.sourceExtrusionBatchId) {
      return [
        {
          sourceExtrusionBatchId: row.sourceExtrusionBatchId,
          dispatchQtyKg: row.quantityKg || 0,
          lotNo: row.lotNo || row.sourceExtrusionBatchId,
          grade: row.grade || "",
        },
      ];
    }

    return [];
  }

  const inventory = useMemo(() => {
    const map = {};

    extrusionRows
      .filter((r) => r.status !== "DELETED")
      .forEach((r) => {
        const batchId = r.extrusionBatchId || r.lotNo || "UNKNOWN";
        const displayLot = r.lotNo || r.extrusionBatchId || "UNKNOWN";

        if (!map[batchId]) {
          map[batchId] = {
            batchId,
            lotNo: displayLot,
            date: r.date,
            grade: r.productionGrade || "NA",
            producedKg: 0,
            dispatchedKg: 0,
            balanceKg: 0,
            machine: r.machine,
            operatorName: r.operatorName || "",
            supervisorName: r.supervisorName || "",
            recoveryPercent: r.recoveryPercent || "",
            qcStatus: r.qcStatus || "Approved",
          };
        }

        map[batchId].producedKg += Number(r.fgOutputKg || 0);
      });

    dispatchRows
      .filter((d) => d.dispatchStatus !== "DELETED")
      .forEach((d) => {
        const lines = parseDispatchLines(d);

        lines.forEach((line) => {
          const batchId = line.sourceExtrusionBatchId;

          if (batchId && map[batchId]) {
            map[batchId].dispatchedKg += Number(line.dispatchQtyKg || 0);
          }
        });
      });

    Object.values(map).forEach((x) => {
      x.balanceKg = Number(x.producedKg || 0) - Number(x.dispatchedKg || 0);
    });

    return Object.values(map).sort((a, b) => b.balanceKg - a.balanceKg);
  }, [extrusionRows, dispatchRows]);

  const liveInventory = inventory.filter((x) => Number(x.balanceKg || 0) > 0);

  const totalFGProduced = inventory.reduce(
    (sum, r) => sum + Number(r.producedKg || 0),
    0
  );

  const totalDispatch = inventory.reduce(
    (sum, r) => sum + Number(r.dispatchedKg || 0),
    0
  );

  const liveFGStock = inventory.reduce(
    (sum, r) => sum + Number(r.balanceKg || 0),
    0
  );

  const gradeSummary = useMemo(() => {
    const map = {};

    inventory.forEach((r) => {
      const grade = r.grade || "NA";

      if (!map[grade]) {
        map[grade] = {
          produced: 0,
          dispatched: 0,
          balance: 0,
          lots: 0,
        };
      }

      map[grade].produced += Number(r.producedKg || 0);
      map[grade].dispatched += Number(r.dispatchedKg || 0);
      map[grade].balance += Number(r.balanceKg || 0);

      if (Number(r.balanceKg || 0) > 0) {
        map[grade].lots += 1;
      }
    });

    return Object.entries(map).sort((a, b) => b[1].balance - a[1].balance);
  }, [inventory]);

  return (
    <div style={{ padding: 16 }}>
      <div style={header}>
        <div>
          <h1 style={{ marginBottom: 6 }}>FG Inventory</h1>

          <div style={subText}>
            Auto generated from extrusion and multi-lot dispatch lines.
          </div>
        </div>
      </div>

      <div style={gridStyle}>
        <Card title="FG Produced" value={`${totalFGProduced.toFixed(0)} Kg`} />
        <Card title="FG Dispatched" value={`${totalDispatch.toFixed(0)} Kg`} />
        <Card title="Live FG Stock" value={`${liveFGStock.toFixed(0)} Kg`} />
        <Card title="Live Lots" value={liveInventory.length} />
      </div>

      {status && <div style={errorStyle}>{status}</div>}

      <div style={{ marginTop: 24 }}>
        <div style={tableBox}>
          <h3>Live Lot-wise FG Inventory</h3>

          <table style={tableStyle}>
            <thead>
              <tr style={headRow}>
                <th style={th}>Lot No</th>
                <th style={th}>Extrusion Batch</th>
                <th style={th}>Date</th>
                <th style={th}>Grade</th>
                <th style={th}>Machine</th>
                <th style={th}>Produced</th>
                <th style={th}>Dispatched</th>
                <th style={th}>Balance</th>
                <th style={th}>Recovery %</th>
                <th style={th}>QC</th>
              </tr>
            </thead>

            <tbody>
              {liveInventory.map((r, i) => (
                <tr key={i} style={rowStyle}>
                  <td style={td}>
                    <b>{r.lotNo}</b>
                  </td>
                  <td style={td}>{r.batchId}</td>
                  <td style={td}>{formatDate(r.date)}</td>
                  <td style={td}>{r.grade}</td>
                  <td style={td}>{r.machine}</td>
                  <td style={td}>{Number(r.producedKg || 0).toFixed(0)}</td>
                  <td style={td}>{Number(r.dispatchedKg || 0).toFixed(0)}</td>
                  <td style={td}>
                    <b
                      style={{
                        color: r.balanceKg > 0 ? "#15803d" : "#dc2626",
                      }}
                    >
                      {Number(r.balanceKg || 0).toFixed(0)}
                    </b>
                  </td>
                  <td style={td}>{r.recoveryPercent}</td>
                  <td style={td}>
                    <span style={statusBadge}>{r.qcStatus}</span>
                  </td>
                </tr>
              ))}

              {liveInventory.length === 0 && (
                <tr>
                  <td colSpan="10" style={emptyStyle}>
                    No live FG stock available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <div style={tableBox}>
          <h3>Grade-wise Summary</h3>

          <table style={tableStyle}>
            <thead>
              <tr style={headRow}>
                <th style={th}>Grade</th>
                <th style={th}>Produced</th>
                <th style={th}>Dispatched</th>
                <th style={th}>Balance</th>
                <th style={th}>Live Lots</th>
              </tr>
            </thead>

            <tbody>
              {gradeSummary.map(([grade, data], i) => (
                <tr key={i} style={rowStyle}>
                  <td style={td}>
                    <b>{grade}</b>
                  </td>
                  <td style={td}>{Number(data.produced || 0).toFixed(0)}</td>
                  <td style={td}>{Number(data.dispatched || 0).toFixed(0)}</td>
                  <td style={td}>
                    <b style={{ color: "#15803d" }}>
                      {Number(data.balance || 0).toFixed(0)}
                    </b>
                  </td>
                  <td style={td}>{data.lots}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <div style={tableBox}>
          <h3>All Lots History</h3>

          <table style={tableStyle}>
            <thead>
              <tr style={headRow}>
                <th style={th}>Lot No</th>
                <th style={th}>Batch</th>
                <th style={th}>Grade</th>
                <th style={th}>Produced</th>
                <th style={th}>Dispatched</th>
                <th style={th}>Balance</th>
              </tr>
            </thead>

            <tbody>
              {inventory.map((r, i) => (
                <tr key={i} style={rowStyle}>
                  <td style={td}>
                    <b>{r.lotNo}</b>
                  </td>
                  <td style={td}>{r.batchId}</td>
                  <td style={td}>{r.grade}</td>
                  <td style={td}>{Number(r.producedKg || 0).toFixed(0)}</td>
                  <td style={td}>{Number(r.dispatchedKg || 0).toFixed(0)}</td>
                  <td style={td}>
                    <b style={{ color: r.balanceKg > 0 ? "#15803d" : "#64748b" }}>
                      {Number(r.balanceKg || 0).toFixed(0)}
                    </b>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={cardStyle}>
      <div style={cardTitle}>{title}</div>

      <div style={cardValue}>{value}</div>
    </div>
  );
}

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20,
  flexWrap: "wrap",
  gap: 12,
};

const subText = {
  color: "#64748b",
  fontSize: 13,
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: 16,
};

const cardStyle = {
  background: "white",
  padding: 18,
  borderRadius: 10,
  border: "1px solid #e5e7eb",
};

const cardTitle = {
  color: "#64748b",
  marginBottom: 8,
  fontSize: 13,
};

const cardValue = {
  fontSize: 24,
  fontWeight: 700,
  color: "#0f766e",
};

const tableBox = {
  background: "white",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  padding: 18,
  overflowX: "auto",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 900,
};

const headRow = {
  background: "#0f766e",
  color: "white",
};

const rowStyle = {
  borderBottom: "1px solid #ddd",
};

const statusBadge = {
  background: "#dcfce7",
  color: "#166534",
  padding: "4px 8px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 700,
};

const th = {
  padding: "10px 12px",
  textAlign: "left",
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.4px",
  whiteSpace: "nowrap",
};

const td = {
  padding: "10px 12px",
  fontSize: 13,
  whiteSpace: "nowrap",
};

const errorStyle = {
  marginTop: 12,
  color: "#dc2626",
  fontWeight: 600,
};

const emptyStyle = {
  padding: 20,
  textAlign: "center",
  color: "#64748b",
};