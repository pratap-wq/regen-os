import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";

export default function ProductionHistory() {
  const now = new Date();

  const [washRows, setWashRows] = useState([]);
  const [sortingRows, setSortingRows] = useState([]);
  const [extrusionRows, setExtrusionRows] = useState([]);

  const [month, setMonth] = useState(String(now.getMonth() + 1).padStart(2, "0"));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [wash, sorting, extrusion] = await Promise.all([
        apiCall({ fn: "wash.list" }),
        apiCall({ fn: "sorting.list" }),
        apiCall({ fn: "extrusion.list" }),
      ]);

      setWashRows((wash.rows || []).filter((r) => String(r.status || "").toUpperCase() !== "DELETED"));
      setSortingRows((sorting.rows || []).filter((r) => String(r.status || "").toUpperCase() !== "DELETED"));
      setExtrusionRows((extrusion.rows || []).filter((r) => String(r.status || "").toUpperCase() !== "DELETED"));
    } catch (err) {
      console.log(err);
      setStatus("Failed loading production history");
    }
  }

  const rows = useMemo(() => {
    const all = [];

    washRows.forEach((r) => {
      all.push({
        id: r.washBatchId,
        process: "Wash",
        updateFn: "wash.update",
        idKey: "washBatchId",
        date: r.date,
        shift: r.shift,
        material: r.inputMaterial,
        machine: r.machine,
        inputKg: Number(r.inputWeightKg || 0),
        outputKg: Number(r.washedOutputKg || 0),
        recovery:
          Number(r.inputWeightKg || 0) > 0
            ? (Number(r.washedOutputKg || 0) / Number(r.inputWeightKg || 0)) * 100
            : 0,
        operator: r.operatorName,
        supervisor: r.supervisorName,
        status: r.status,
        source: r,
      });
    });

    sortingRows.forEach((r) => {
      const output =
        Number(r.acceptedQtyKg || 0) ||
        Number(r.whiteSortedKg || 0) +
          Number(r.allMixSortedKg || 0) +
          Number(r.commodityKg || 0) +
          Number(r.whiteGreyKg || 0);

      all.push({
        id: r.sortingBatchId,
        process: "Sorting",
        updateFn: "sorting.update",
        idKey: "sortingBatchId",
        date: r.date,
        shift: r.shift,
        material: r.inputMaterial,
        machine: r.machine,
        inputKg: Number(r.inputWeightKg || 0),
        outputKg: output,
        recovery:
          Number(r.inputWeightKg || 0) > 0
            ? (output / Number(r.inputWeightKg || 0)) * 100
            : 0,
        operator: r.operatorName,
        supervisor: r.supervisorName,
        status: r.status,
        source: r,
      });
    });

    extrusionRows.forEach((r) => {
      all.push({
        id: r.extrusionBatchId,
        process: "Extrusion",
        updateFn: "extrusion.update",
        idKey: "extrusionBatchId",
        date: r.date,
        shift: r.shift,
        material: r.inputMaterial || r.productionGrade,
        machine: r.machine,
        inputKg: Number(r.inputWeightKg || 0),
        outputKg: Number(r.fgOutputKg || 0),
        recovery:
          Number(r.inputWeightKg || 0) > 0
            ? (Number(r.fgOutputKg || 0) / Number(r.inputWeightKg || 0)) * 100
            : 0,
        operator: r.operatorName,
        supervisor: r.supervisorName,
        status: r.status,
        source: r,
      });
    });

    return all
      .filter((r) => {
        const d = new Date(r.date || "");
        if (isNaN(d.getTime())) return false;

        return (
          String(d.getFullYear()) === year &&
          String(d.getMonth() + 1).padStart(2, "0") === month
        );
      })
      .filter((r) => {
        const q = search.toLowerCase();
        if (!q) return true;

        return [
          r.id,
          r.process,
          r.shift,
          r.material,
          r.machine,
          r.operator,
          r.supervisor,
          r.status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [washRows, sortingRows, extrusionRows, month, year, search]);

  const totalInput = rows.reduce((s, r) => s + Number(r.inputKg || 0), 0);
  const totalOutput = rows.reduce((s, r) => s + Number(r.outputKg || 0), 0);
  const avgRecovery = totalInput > 0 ? (totalOutput / totalInput) * 100 : 0;

  function editRow(row) {
    const s = row.source || {};

    setEditing({
      process: row.process,
      updateFn: row.updateFn,
      idKey: row.idKey,
      id: row.id,

      date: s.date || "",
      shift: s.shift || "",
      machine: s.machine || "",
      inputMaterial: s.inputMaterial || "",
      inputWeightKg: s.inputWeightKg || "",
      outputWeightKg:
        row.process === "Wash"
          ? s.washedOutputKg || ""
          : row.process === "Sorting"
          ? s.acceptedQtyKg || ""
          : s.fgOutputKg || "",
      operatorName: s.operatorName || "",
      supervisorName: s.supervisorName || "",
      status: s.status || "",
      remarks: s.remarks || "",

      source: s,
    });
  }

  function onEditChange(e) {
    setEditing({
      ...editing,
      [e.target.name]: e.target.value,
    });
  }

  async function saveEdit() {
    if (!editing) return;

    try {
      setSaving(true);

      const payload = {
        ...editing.source,
        fn: editing.updateFn,
        [editing.idKey]: editing.id,
        date: editing.date,
        shift: editing.shift,
        machine: editing.machine,
        inputMaterial: editing.inputMaterial,
        inputWeightKg: editing.inputWeightKg,
        operatorName: editing.operatorName,
        supervisorName: editing.supervisorName,
        status: editing.status,
        remarks: editing.remarks,
      };

      if (editing.process === "Wash") {
        payload.washedOutputKg = editing.outputWeightKg;
      }

      if (editing.process === "Sorting") {
        payload.acceptedQtyKg = editing.outputWeightKg;
      }

      if (editing.process === "Extrusion") {
        payload.fgOutputKg = editing.outputWeightKg;
      }

      const res = await apiCall(payload);

      if (res.ok === false) {
        alert(res.error || "Update failed");
        return;
      }

      setEditing(null);
      setStatus(`${editing.process} ${editing.id} updated successfully`);
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteRow(row) {
    const ok = window.confirm(`Delete ${row.process} ${row.id}?`);
    if (!ok) return;

    try {
      const res = await apiCall({
        ...row.source,
        fn: row.updateFn,
        [row.idKey]: row.id,
        status: "DELETED",
      });

      if (res.ok === false) {
        alert(res.error || "Delete failed");
        return;
      }

      setStatus(`${row.process} ${row.id} deleted`);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div style={page}>
      <div style={hero}>
        <div>
          <div style={eyebrow}>Operations Review</div>
          <h1 style={title}>Production History</h1>
          <div style={subtitle}>
            Combined Wash, Sorting and Extrusion production history with real edit and delete.
          </div>
        </div>

        <div style={filters}>
          <select value={month} onChange={(e) => setMonth(e.target.value)} style={filter}>
            <option value="01">Jan</option><option value="02">Feb</option><option value="03">Mar</option>
            <option value="04">Apr</option><option value="05">May</option><option value="06">Jun</option>
            <option value="07">Jul</option><option value="08">Aug</option><option value="09">Sep</option>
            <option value="10">Oct</option><option value="11">Nov</option><option value="12">Dec</option>
          </select>

          <select value={year} onChange={(e) => setYear(e.target.value)} style={filter}>
            <option>2025</option>
            <option>2026</option>
            <option>2027</option>
          </select>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            style={searchBox}
          />
        </div>
      </div>

      <div style={kpiGrid}>
        <KPI title="Entries" value={rows.length} />
        <KPI title="Input" value={`${ton(totalInput)} T`} />
        <KPI title="Output" value={`${ton(totalOutput)} T`} />
        <KPI title="Avg Recovery" value={`${avgRecovery.toFixed(1)}%`} />
      </div>

      {status && <div style={statusStyle}>{status}</div>}

      <div style={panel}>
        <h3 style={panelTitle}>Production Records</h3>

        <div style={{ overflowX: "auto" }}>
          <table style={table}>
            <thead>
              <tr style={thead}>
                <th style={th}>Date</th>
                <th style={th}>Process</th>
                <th style={th}>Batch</th>
                <th style={th}>Shift</th>
                <th style={th}>Material</th>
                <th style={th}>Machine</th>
                <th style={th}>Input</th>
                <th style={th}>Output</th>
                <th style={th}>Recovery</th>
                <th style={th}>Operator</th>
                <th style={th}>Supervisor</th>
                <th style={th}>Status</th>
                <th style={th}>Action</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r, i) => (
                <tr key={i} style={tr}>
                  <td style={td}>{formatDate(r.date)}</td>
                  <td style={td}><b>{r.process}</b></td>
                  <td style={td}>{r.id}</td>
                  <td style={td}>{r.shift}</td>
                  <td style={td}>{r.material}</td>
                  <td style={td}>{r.machine}</td>
                  <td style={td}>{Number(r.inputKg || 0).toFixed(0)}</td>
                  <td style={td}>{Number(r.outputKg || 0).toFixed(0)}</td>
                  <td style={td}>{Number(r.recovery || 0).toFixed(1)}%</td>
                  <td style={td}>{r.operator}</td>
                  <td style={td}>{r.supervisor}</td>
                  <td style={td}>
                    <span style={badge(r.status)}>{r.status || "OPEN"}</span>
                  </td>
                  <td style={td}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => editRow(r)} style={editButton}>Edit</button>
                      <button onClick={() => deleteRow(r)} style={deleteButton}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan="13" style={empty}>No production records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div style={modalOverlay}>
          <div style={modal}>
            <h2 style={{ marginTop: 0 }}>
              Edit {editing.process} - {editing.id}
            </h2>

            <div style={formGrid}>
              <EditField label="Date" name="date" value={editing.date} onChange={onEditChange} type="date" />
              <EditField label="Shift" name="shift" value={editing.shift} onChange={onEditChange} />
              <EditField label="Machine" name="machine" value={editing.machine} onChange={onEditChange} />
              <EditField label="Material" name="inputMaterial" value={editing.inputMaterial} onChange={onEditChange} />
              <EditField label="Input Kg" name="inputWeightKg" value={editing.inputWeightKg} onChange={onEditChange} />
              <EditField label="Output Kg" name="outputWeightKg" value={editing.outputWeightKg} onChange={onEditChange} />
              <EditField label="Operator" name="operatorName" value={editing.operatorName} onChange={onEditChange} />
              <EditField label="Supervisor" name="supervisorName" value={editing.supervisorName} onChange={onEditChange} />
              <EditField label="Status" name="status" value={editing.status} onChange={onEditChange} />
              <EditField label="Remarks" name="remarks" value={editing.remarks} onChange={onEditChange} />
            </div>

            <div style={modalButtons}>
              <button onClick={() => setEditing(null)} style={cancelButton}>
                Cancel
              </button>

              <button onClick={saveEdit} disabled={saving} style={saveButton}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EditField({ label, name, value, onChange, type = "text" }) {
  return (
    <div>
      <label style={editLabel}>{label}</label>
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        style={editInput}
      />
    </div>
  );
}

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN");
}

function ton(kg) {
  return (Number(kg || 0) / 1000).toFixed(1);
}

function KPI({ title, value }) {
  return (
    <div style={kpi}>
      <div style={kpiTitle}>{title}</div>
      <div style={kpiValue}>{value}</div>
    </div>
  );
}

const badge = (status) => ({
  background: String(status || "").includes("READY") ? "#dcfce7" : "#e0f2fe",
  color: String(status || "").includes("READY") ? "#166534" : "#075985",
  padding: "5px 10px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 800,
});

const page = { width: "100%", paddingBottom: 30 };

const hero = {
  background: "linear-gradient(135deg,#064e3b,#0f766e)",
  color: "white",
  borderRadius: 18,
  padding: 24,
  marginBottom: 20,
  display: "flex",
  justifyContent: "space-between",
  gap: 20,
  flexWrap: "wrap",
};

const eyebrow = {
  fontSize: 13,
  textTransform: "uppercase",
  letterSpacing: 1.2,
  opacity: 0.85,
  fontWeight: 800,
};

const title = { margin: "6px 0", fontSize: 32, fontWeight: 950 };
const subtitle = { opacity: 0.9 };

const filters = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

const filter = {
  height: 42,
  borderRadius: 10,
  border: "none",
  padding: "0 12px",
  fontWeight: 800,
};

const searchBox = {
  height: 42,
  borderRadius: 10,
  border: "none",
  padding: "0 12px",
  minWidth: 220,
};

const kpiGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
  gap: 16,
  marginBottom: 18,
};

const kpi = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 18,
  boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
};

const kpiTitle = {
  color: "#64748b",
  fontSize: 12,
  fontWeight: 800,
  textTransform: "uppercase",
  marginBottom: 8,
};

const kpiValue = {
  fontSize: 28,
  fontWeight: 950,
  color: "#0f766e",
};

const panel = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
};

const panelTitle = {
  marginTop: 0,
  marginBottom: 14,
  fontSize: 18,
  color: "#0f172a",
  fontWeight: 900,
};

const table = { width: "100%", borderCollapse: "collapse", minWidth: 1200 };
const thead = { background: "#005d34", color: "white" };
const th = { padding: 12, textAlign: "left", fontSize: 12, whiteSpace: "nowrap" };
const tr = { borderBottom: "1px solid #e5e7eb" };
const td = { padding: 12, fontSize: 13, whiteSpace: "nowrap" };

const editButton = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "7px 11px",
  borderRadius: 7,
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 12,
};

const deleteButton = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "7px 11px",
  borderRadius: 7,
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 12,
};

const empty = {
  padding: 20,
  textAlign: "center",
  color: "#64748b",
};

const statusStyle = {
  marginBottom: 14,
  background: "#ecfdf5",
  color: "#166534",
  border: "1px solid #bbf7d0",
  padding: 12,
  borderRadius: 10,
  fontWeight: 700,
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

const formGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: 14,
};

const editLabel = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  color: "#334155",
  marginBottom: 5,
};

const editInput = {
  width: "100%",
  height: 40,
  padding: "0 10px",
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  boxSizing: "border-box",
};

const modalButtons = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  marginTop: 22,
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