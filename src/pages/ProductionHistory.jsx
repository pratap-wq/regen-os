import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";
import { formatDate } from "../utils/date";
import DataTable from "../components/DataTable";

export default function ProductionHistory() {
  const now = new Date();

  const [washRows, setWashRows] = useState([]);
  const [sortingRows, setSortingRows] = useState([]);
  const [extrusionRows, setExtrusionRows] = useState([]);

  const [month, setMonth] = useState(
    String(now.getMonth() + 1).padStart(2, "0")
  );
  const [year, setYear] = useState(String(now.getFullYear()));
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

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
      const [wash, sorting, extrusion] = await Promise.all([
        safeList("wash.list"),
        safeList("sorting.list"),
        safeList("extrusion.list"),
      ]);

      setWashRows(
        wash.filter((r) => String(r.status || "").toUpperCase() !== "DELETED")
      );

      setSortingRows(
        sorting.filter((r) => String(r.status || "").toUpperCase() !== "DELETED")
      );

      setExtrusionRows(
        extrusion.filter(
          (r) => String(r.status || "").toUpperCase() !== "DELETED"
        )
      );
    } catch (err) {
      console.log(err);
      setStatus("Failed loading production history");
    }
  }

  function dateForInput(value) {
    if (!value) return "";

    const text = String(value).trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
      return text.slice(0, 10);
    }

    return text.slice(0, 10);
  }

  function n(value) {
    return Number(value || 0);
  }

  function ton(kg) {
    return (Number(kg || 0) / 1000).toFixed(1);
  }

  function monthMatch(value) {
    const clean = dateForInput(value);
    if (!clean) return false;

    const [y, m] = clean.split("-");
    return String(y) === year && String(m) === month;
  }

  function washOutput(row) {
    return n(row.washedOutputKg);
  }

  function sortingOutput(row) {
    return (
      n(row.acceptedQtyKg) ||
      n(row.whiteSortedKg) +
        n(row.allMixSortedKg) +
        n(row.commodityKg) +
        n(row.whiteGreyKg)
    );
  }

  function extrusionInput(row) {
    return n(row.inputWeightKg || row.totalInputKg);
  }

  function extrusionOutput(row) {
    return n(row.fgOutputKg);
  }

  const rows = useMemo(() => {
    const all = [];

    washRows.forEach((r) => {
      all.push({
        id: r.washBatchId || r.id || "",
        process: "Wash",
        updateFn: "wash.update",
        idKey: "washBatchId",
        date: r.date,
        shift: r.shift,
        material: r.inputMaterial,
        machine: r.machine,
        inputKg: n(r.inputWeightKg),
        outputKg: washOutput(r),
        recovery:
          n(r.inputWeightKg) > 0
            ? (washOutput(r) / n(r.inputWeightKg)) * 100
            : 0,
        operator: r.operatorName,
        supervisor: r.supervisorName,
        status: r.status,
        source: r,
      });
    });

    sortingRows.forEach((r) => {
      const output = sortingOutput(r);

      all.push({
        id: r.sortingBatchId || r.id || "",
        process: "Sorting",
        updateFn: "sorting.update",
        idKey: "sortingBatchId",
        date: r.date,
        shift: r.shift,
        material: r.inputMaterial,
        machine: r.machine,
        inputKg: n(r.inputWeightKg),
        outputKg: output,
        recovery: n(r.inputWeightKg) > 0 ? (output / n(r.inputWeightKg)) * 100 : 0,
        operator: r.operatorName,
        supervisor: r.supervisorName,
        status: r.status,
        source: r,
      });
    });

    extrusionRows.forEach((r) => {
      const input = extrusionInput(r);
      const output = extrusionOutput(r);

      all.push({
        id: r.extrusionBatchId || r.id || "",
        process: "Extrusion",
        updateFn: "extrusion.update",
        idKey: "extrusionBatchId",
        date: r.date,
        shift: r.shift,
        material: r.inputMaterial || r.productionGrade,
        machine: r.machine,
        inputKg: input,
        outputKg: output,
        recovery: input > 0 ? (output / input) * 100 : 0,
        operator: r.operatorName,
        supervisor: r.supervisorName,
        status: r.status,
        source: r,
      });
    });

    return all
      .filter((r) => monthMatch(r.date))
      .sort((a, b) =>
        String(dateForInput(b.date || "")).localeCompare(
          String(dateForInput(a.date || ""))
        )
      );
  }, [washRows, sortingRows, extrusionRows, month, year]);

  const totalInput = rows.reduce((s, r) => s + n(r.inputKg), 0);
  const totalOutput = rows.reduce((s, r) => s + n(r.outputKg), 0);
  const avgRecovery = totalInput > 0 ? (totalOutput / totalInput) * 100 : 0;

  function getEditSections(row) {
    if (row.process === "Wash") {
      return [
        {
          title: "Batch Details",
          fields: [
            ["date", "Date", "date"],
            ["shift", "Shift", "text"],
            ["machine", "Machine", "text"],
            ["inputMaterial", "Input Material", "text"],
            ["inputWeightKg", "Input Kg", "number"],
            ["washedOutputKg", "Washed Output Kg", "number"],
          ],
        },
        {
          title: "Wash Losses",
          fields: [
            ["dustKg", "Dust Kg", "number"],
            ["sinkMaterialKg", "Sink Material Kg", "number"],
            ["microPlasticKg", "Micro Plastic Kg", "number"],
            ["wrappersKg", "Wrappers Kg", "number"],
            ["sludgeKg", "Sludge Kg", "number"],
            ["raffiaKg", "Raffia Kg", "number"],
            ["washVarianceKg", "Wash Variance Kg", "number"],
            ["estimatedRecoveryPercent", "Recovery %", "number"],
          ],
        },
        {
          title: "Downtime",
          fields: [
            ["machineRunningHours", "Machine Running Hours", "number"],
            ["downtimeHours", "Downtime Hours", "number"],
            ["downtimeReason", "Downtime Reason", "textarea"],
          ],
        },
        {
          title: "People / Status",
          fields: [
            ["operatorName", "Operator", "text"],
            ["supervisorName", "Supervisor", "text"],
            ["sortingRequired", "Sorting Required", "text"],
            ["nextProcess", "Next Process", "text"],
            ["status", "Status", "text"],
            ["remarks", "Remarks", "textarea"],
          ],
        },
      ];
    }

    if (row.process === "Sorting") {
      return [
        {
          title: "Batch Details",
          fields: [
            ["date", "Date", "date"],
            ["shift", "Shift", "text"],
            ["machine", "Machine", "text"],
            ["sourceWashBatchId", "Source Wash Batch", "text"],
            ["inputMaterial", "Input Material", "text"],
            ["inputWeightKg", "Input Kg", "number"],
          ],
        },
        {
          title: "Sorter Outputs",
          fields: [
            ["acceptedQtyKg", "Accepted Qty Kg", "number"],
            ["whiteSortedKg", "White Kg", "number"],
            ["allMixSortedKg", "All Mix Kg", "number"],
            ["commodityKg", "Commodity Kg", "number"],
            ["whiteGreyKg", "White Grey Kg", "number"],
            ["rejectedQtyKg", "Reject Kg", "number"],
            ["sorterVarianceKg", "Sorter Variance Kg", "number"],
            ["recoveryPercent", "Recovery %", "number"],
          ],
        },
        {
          title: "Downtime",
          fields: [
            ["machineRunningHours", "Machine Running Hours", "number"],
            ["downtimeHours", "Downtime Hours", "number"],
            ["downtimeReason", "Downtime Reason", "textarea"],
          ],
        },
        {
          title: "People / Status",
          fields: [
            ["operatorName", "Operator", "text"],
            ["supervisorName", "Supervisor", "text"],
            ["nextProcess", "Next Process", "text"],
            ["status", "Status", "text"],
            ["remarks", "Remarks", "textarea"],
          ],
        },
      ];
    }

    return [
      {
        title: "Batch Details",
        fields: [
          ["date", "Date", "date"],
          ["periodMonth", "Period Month", "text"],
          ["shift", "Shift", "text"],
          ["machine", "Machine", "text"],
          ["sourceType", "Source Type", "text"],
          ["sourceSortingBatchId", "Source Sorting Batch", "text"],
          ["sourceWashBatchId", "Source Wash Batch", "text"],
          ["inputMaterial", "Input Material / Feed Summary", "textarea"],
          ["inputWeightKg", "Input Weight Kg", "number"],
          ["totalInputKg", "Total Input Kg", "number"],
          ["productionGrade", "Production Grade", "text"],
        ],
      },
      {
        title: "Feed Composition",
        fields: [["feedComposition", "Feed Composition", "textarea"]],
      },
      {
        title: "Extrusion Outputs",
        fields: [
          ["fgOutputKg", "FG Output Kg", "number"],
          ["lumpsKg", "Lumps Kg", "number"],
          ["purgingKg", "Purging Kg", "number"],
          ["reworkGranulesKg", "Rework Granules Kg", "number"],
          ["rejectKg", "Reject Kg", "number"],
          ["vacuumRejectKg", "Vacuum Reject Kg", "number"],
          ["meshRejectKg", "Mesh Reject Kg", "number"],
          ["floorSpillageKg", "Floor Spillage Kg", "number"],
          ["totalRecoverableKg", "Total Recoverable Kg", "number"],
          ["totalNonRecoverableKg", "Total Non-Recoverable Kg", "number"],
          ["totalOutputKg", "Total Output Kg", "number"],
          ["varianceKg", "Variance Kg", "number"],
          ["recoveryPercent", "Recovery %", "number"],
        ],
      },
      {
        title: "Ratios",
        fields: [
          ["recoveryMaterialPercent", "Recovery Material %", "number"],
          ["virginRatioPercent", "Virgin %", "number"],
          ["batteryRatioPercent", "Battery %", "number"],
          ["additiveRatioPercent", "Additive %", "number"],
        ],
      },
      {
        title: "Downtime",
        fields: [
          ["machineRunningHours", "Machine Running Hours", "number"],
          ["downtimeHours", "Downtime Hours", "number"],
          ["downtimeReason", "Downtime Reason", "textarea"],
        ],
      },
      {
        title: "People / Status",
        fields: [
          ["operatorName", "Operator", "text"],
          ["supervisorName", "Supervisor", "text"],
          ["nextProcess", "Next Process", "text"],
          ["status", "Status", "text"],
          ["remarks", "Remarks", "textarea"],
        ],
      },
    ];
  }

  function prepareEditFields(row) {
    const source = { ...(row.source || {}) };
    source.date = dateForInput(source.date || row.date);

    if (row.process === "Wash") {
      source.washBatchId = source.washBatchId || row.id;
      source.inputMaterial = source.inputMaterial || row.material || "";
      source.inputWeightKg = source.inputWeightKg || row.inputKg || "";
      source.washedOutputKg = source.washedOutputKg || row.outputKg || "";
      source.operatorName = source.operatorName || row.operator || "";
      source.supervisorName = source.supervisorName || row.supervisor || "";
      source.status = source.status || row.status || "";
    }

    if (row.process === "Sorting") {
      source.sortingBatchId = source.sortingBatchId || row.id;
      source.inputMaterial = source.inputMaterial || row.material || "";
      source.inputWeightKg = source.inputWeightKg || row.inputKg || "";
      source.acceptedQtyKg = source.acceptedQtyKg || row.outputKg || "";
      source.operatorName = source.operatorName || row.operator || "";
      source.supervisorName = source.supervisorName || row.supervisor || "";
      source.status = source.status || row.status || "";
    }

    if (row.process === "Extrusion") {
      source.extrusionBatchId = source.extrusionBatchId || row.id;
      source.inputMaterial = source.inputMaterial || row.material || "";
      source.inputWeightKg = source.inputWeightKg || row.inputKg || "";
      source.totalInputKg = source.totalInputKg || row.inputKg || "";
      source.fgOutputKg = source.fgOutputKg || row.outputKg || "";
      source.operatorName = source.operatorName || row.operator || "";
      source.supervisorName = source.supervisorName || row.supervisor || "";
      source.status = source.status || row.status || "";
    }

    return source;
  }

  function editRow(row) {
    setEditing({
      process: row.process,
      updateFn: row.updateFn,
      idKey: row.idKey,
      id: row.id,
      fields: prepareEditFields(row),
      sections: getEditSections(row),
    });
  }

  function onEditChange(key, value) {
    setEditing((prev) => ({
      ...prev,
      fields: {
        ...prev.fields,
        [key]: value,
      },
    }));
  }

  async function saveEdit() {
    if (!editing) return;

    try {
      setSaving(true);

      const cleanDate = dateForInput(editing.fields.date);

      const payload = {
        fn: editing.updateFn,
        ...editing.fields,
        date: cleanDate,
        [editing.idKey]: editing.id,
      };

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
            Complete history of Wash, Sorting and Extrusion batches with full popup editing.
          </div>
        </div>

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
      </div>

      <div style={kpiGrid}>
        <KPI title="Entries" value={rows.length} />
        <KPI title="Input" value={`${ton(totalInput)} T`} />
        <KPI title="Output" value={`${ton(totalOutput)} T`} />
        <KPI title="Average Recovery" value={`${avgRecovery.toFixed(1)}%`} />
      </div>

      {status && <div style={statusStyle}>{status}</div>}

      <DataTable
        title="Production Records"
        rows={rows}
        searchFields={[
          "id",
          "process",
          "shift",
          "material",
          "machine",
          "operator",
          "supervisor",
          "status",
        ]}
        columns={[
          {
            key: "date",
            label: "Date",
            render: (r) => formatDate(dateForInput(r.date)),
            renderExport: (r) => dateForInput(r.date),
          },
          { key: "process", label: "Process" },
          { key: "id", label: "Batch" },
          { key: "shift", label: "Shift" },
          { key: "material", label: "Material" },
          { key: "machine", label: "Machine" },
          {
            key: "inputKg",
            label: "Input Kg",
            render: (r) => Number(r.inputKg || 0).toFixed(0),
            renderExport: (r) => Number(r.inputKg || 0).toFixed(0),
          },
          {
            key: "outputKg",
            label: "Output Kg",
            render: (r) => Number(r.outputKg || 0).toFixed(0),
            renderExport: (r) => Number(r.outputKg || 0).toFixed(0),
          },
          {
            key: "recovery",
            label: "Recovery %",
            render: (r) => `${Number(r.recovery || 0).toFixed(1)}%`,
            renderExport: (r) => Number(r.recovery || 0).toFixed(1),
          },
          { key: "operator", label: "Operator" },
          { key: "supervisor", label: "Supervisor" },
          { key: "status", label: "Status" },
        ]}
        onEdit={editRow}
        onDelete={deleteRow}
      />

      {editing && (
        <div style={modalOverlay}>
          <div style={modal}>
            <h2 style={{ marginTop: 0 }}>
              Edit {editing.process} - {editing.id}
            </h2>

            <div style={modalInfo}>
              Dates are saved exactly as YYYY-MM-DD without timezone conversion.
            </div>

            {editing.sections.map((section) => (
              <div key={section.title} style={sectionBlock}>
                <div style={sectionHeading}>{section.title}</div>

                <div style={formGrid}>
                  {section.fields.map(([key, label, type]) => (
                    <EditField
                      key={key}
                      label={label}
                      type={type}
                      value={editing.fields[key]}
                      dateForInput={dateForInput}
                      onChange={(value) => onEditChange(key, value)}
                    />
                  ))}
                </div>
              </div>
            ))}

            <details style={jsonBox}>
              <summary style={{ cursor: "pointer", fontWeight: 700 }}>
                Advanced JSON
              </summary>

              <textarea
                value={JSON.stringify(editing.fields, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setEditing((prev) => ({
                      ...prev,
                      fields: parsed,
                    }));
                  } catch {}
                }}
                style={jsonArea}
              />
            </details>

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

function EditField({ label, value, type = "text", onChange, dateForInput }) {
  const safe = type === "date" ? dateForInput(value) : value || "";

  if (type === "textarea") {
    return (
      <div>
        <label style={labelStyle}>{label}</label>
        <textarea
          value={safe}
          onChange={(e) => onChange(e.target.value)}
          style={textareaStyle}
        />
      </div>
    );
  }

  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={safe}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      />
    </div>
  );
}

function KPI({ title, value }) {
  return (
    <div style={kpi}>
      <div style={kpiTitle}>{title}</div>
      <div style={kpiValue}>{value}</div>
    </div>
  );
}

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

const title = {
  margin: "6px 0",
  fontSize: 32,
  fontWeight: 950,
};

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
  width: 1100,
  maxWidth: "96vw",
  maxHeight: "92vh",
  overflowY: "auto",
};

const modalInfo = {
  background: "#fff7ed",
  border: "1px solid #fed7aa",
  padding: 10,
  borderRadius: 10,
  color: "#7c2d12",
  marginBottom: 16,
  fontSize: 13,
  fontWeight: 700,
};

const sectionBlock = {
  marginBottom: 18,
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 14,
};

const sectionHeading = {
  fontWeight: 900,
  color: "#0f766e",
  marginBottom: 12,
};

const formGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: 14,
};

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  color: "#334155",
  marginBottom: 5,
};

const inputStyle = {
  width: "100%",
  height: 40,
  padding: "0 10px",
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  boxSizing: "border-box",
};

const textareaStyle = {
  width: "100%",
  minHeight: 90,
  padding: 10,
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  boxSizing: "border-box",
};

const jsonBox = {
  marginTop: 12,
  marginBottom: 12,
};

const jsonArea = {
  width: "100%",
  minHeight: 260,
  marginTop: 10,
  fontFamily: "monospace",
  fontSize: 12,
  padding: 10,
  borderRadius: 8,
  border: "1px solid #cbd5e1",
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