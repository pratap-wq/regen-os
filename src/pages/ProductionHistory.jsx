import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";
import { formatDate } from "../utils/date";
import DataTable from "../components/DataTable";
import { listFactoryMaster } from "../services/FactoryMasterService";
import { normalizeInventoryMaterial } from "../services/inventoryEngine";

const SHIFT_OPTIONS = ["A", "B", "C"];
const STATUS_OPTIONS = [
  "ACTIVE",
  "READY_FOR_WASH",
  "WASH_COMPLETED",
  "READY_FOR_SORTING",
  "READY_FOR_EXTRUSION",
  "READY_FOR_DISPATCH",
  "COMPLETED",
  "HOLD",
];
const NEXT_PROCESS_OPTIONS = [
  "Wash",
  "Colour Sorting",
  "Extrusion",
  "Dispatch",
  "Finished Goods",
  "Hold",
];
const SOURCE_TYPE_OPTIONS = [
  "PRODUCTION_SHIFT",
  "WASH",
  "SORTING",
  "RECOVERY",
  "REWORK",
  "RM",
  "WIP",
  "ADDITIVE",
];
const PROCESS_OPTIONS = ["Grinder", "Wash", "Sorting", "Extrusion"];

export default function ProductionHistory() {
  const now = new Date();

  const [grinderRows, setGrinderRows] = useState([]);
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
  const [masterRows, setMasterRows] = useState({
    machines: [],
    materials: [],
    grades: [],
  });

  useEffect(() => {
    loadData();
    loadEditMasters();
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
      const [grinder, wash, sorting, extrusion] = await Promise.all([
        safeList("grinder.list"),
        safeList("wash.list"),
        safeList("sorting.list"),
        safeList("extrusion.list"),
      ]);

      setGrinderRows(
        grinder.filter((r) => String(r.status || "").toUpperCase() !== "DELETED")
      );

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

  async function loadEditMasters() {
    const [machines, materials, grades] = await Promise.all([
      safeMasterList("machine"),
      safeMasterList("material"),
      safeMasterList("productGrade"),
    ]);

    setMasterRows({ machines, materials, grades });
  }

  async function safeMasterList(masterType) {
    try {
      return await listFactoryMaster(masterType);
    } catch (err) {
      console.log(masterType, err);
      return [];
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

  function grinderOutput(row) {
    return n(row.regrindOutputKg);
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

    grinderRows.forEach((r) => {
      all.push({
        id: r.grinderBatchId || r.batchId || r.id || "",
        process: "Grinder",
        updateFn: "grinder.update",
        idKey: "grinderBatchId",
        date: r.date,
        shift: r.shift,
        material: r.inputMaterial,
        machine: r.machine,
        inputKg: n(r.inputWeightKg),
        outputKg: grinderOutput(r),
        recovery:
          n(r.inputWeightKg) > 0
            ? (grinderOutput(r) / n(r.inputWeightKg)) * 100
            : 0,
        operator: r.operatorName,
        supervisor: r.supervisorName,
        status: r.status,
        source: r,
      });
    });

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
  }, [grinderRows, washRows, sortingRows, extrusionRows, month, year]);

  const totalInput = rows.reduce((s, r) => s + n(r.inputKg), 0);
  const totalOutput = rows.reduce((s, r) => s + n(r.outputKg), 0);
  const avgRecovery = totalInput > 0 ? (totalOutput / totalInput) * 100 : 0;

  function getEditSections(row) {
    if (row.process === "Grinder") {
      return [
        {
          title: "Batch Details",
          fields: [
            ["__process", "Process", "processSelect"],
            ["date", "Date", "date"],
            ["shift", "Shift", "shiftSelect"],
            ["machine", "Machine", "machineSelect"],
            ["inputMaterial", "Input Material", "materialSelect"],
            ["inputWeightKg", "Input Kg", "number"],
            ["regrindOutputKg", "White Regrind (Unwashed) Kg", "number"],
          ],
        },
        {
          title: "Grinder Outputs",
          fields: [
            ["dustKg", "Dust Kg", "number"],
            ["metalRejectKg", "Metal Reject Kg", "number"],
            ["grinderVarianceKg", "Grinder Variance Kg", "number"],
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
            ["nextProcess", "Next Process", "nextProcessSelect"],
            ["status", "Status", "statusSelect"],
            ["remarks", "Remarks", "textarea"],
          ],
        },
      ];
    }

    if (row.process === "Wash") {
      return [
        {
          title: "Batch Details",
          fields: [
            ["__process", "Process", "processSelect"],
            ["date", "Date", "date"],
            ["shift", "Shift", "shiftSelect"],
            ["machine", "Machine", "machineSelect"],
            ["inputMaterial", "Input Material", "materialSelect"],
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
            ["sortingRequired", "Sorting Required", "yesNoSelect"],
            ["nextProcess", "Next Process", "nextProcessSelect"],
            ["status", "Status", "statusSelect"],
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
            ["__process", "Process", "processSelect"],
            ["date", "Date", "date"],
            ["shift", "Shift", "shiftSelect"],
            ["machine", "Machine", "machineSelect"],
            ["sourceWashBatchId", "Source Wash Batch", "readonly"],
            ["inputMaterial", "Input Material", "materialSelect"],
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
            ["nextProcess", "Next Process", "nextProcessSelect"],
            ["status", "Status", "statusSelect"],
            ["remarks", "Remarks", "textarea"],
          ],
        },
      ];
    }

    return [
      {
        title: "Batch Details",
        fields: [
          ["__process", "Process", "processSelect"],
          ["date", "Date", "date"],
          ["periodMonth", "Period Month", "month"],
          ["shift", "Shift", "shiftSelect"],
          ["machine", "Machine", "machineSelect"],
          ["sourceType", "Source Type", "sourceTypeSelect"],
          ["sourceSortingBatchId", "Source Sorting Batch", "readonly"],
          ["sourceWashBatchId", "Source Wash Batch", "readonly"],
          ["inputMaterial", "Input Material / Feed Summary", "materialSelect"],
          ["inputWeightKg", "Input Weight Kg", "number"],
          ["totalInputKg", "Total Input Kg", "number"],
          ["productionGrade", "Production Grade", "gradeSelect"],
        ],
      },
      {
        title: "Feed Composition",
        fields: [["feedComposition", "Feed Composition", "readonlyTextarea"]],
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
          ["nextProcess", "Next Process", "nextProcessSelect"],
          ["status", "Status", "statusSelect"],
          ["remarks", "Remarks", "textarea"],
        ],
      },
    ];
  }

  function prepareEditFields(row) {
    const source = { ...(row.source || {}) };
    source.__process = row.process;
    source.date = dateForInput(source.date || row.date);

    if (row.process === "Grinder") {
      source.grinderBatchId = source.grinderBatchId || row.id;
      source.inputMaterial = source.inputMaterial || row.material || "";
      source.inputWeightKg = source.inputWeightKg || row.inputKg || "";
      source.regrindOutputKg = source.regrindOutputKg || row.outputKg || "";
      source.operatorName = source.operatorName || row.operator || "";
      source.supervisorName = source.supervisorName || row.supervisor || "";
      source.nextProcess = source.nextProcess || "Wash";
      source.status = source.status || row.status || "";
    }

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
      const normalizedFields = normalizeEditFields(editing.fields);
      const validationError = validateEditFields(normalizedFields, editing.sections, editing.process);

      if (validationError) {
        alert(validationError);
        return;
      }

      const payload = {
        fn: editing.updateFn,
        ...normalizedFields,
        date: cleanDate,
        [editing.idKey]: editing.id,
      };
      delete payload.__process;

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

  function normalizeEditFields(fields = {}) {
    const next = { ...fields };

    [
      "shift",
      "machine",
      "inputMaterial",
      "sourceType",
      "productionGrade",
      "status",
      "nextProcess",
      "__process",
    ].forEach((key) => {
      if (next[key] !== undefined && next[key] !== null) {
        next[key] = normalizeControlledValue(key, next[key]);
      }
    });

    return next;
  }

  function validateEditFields(fields = {}, sections = [], process) {
    const controlledFields = new Set([
      "__process",
      "shift",
      "machine",
      "inputMaterial",
      "sourceType",
      "productionGrade",
      "status",
      "nextProcess",
    ]);

    for (const section of sections) {
      for (const [key, label, type] of section.fields) {
        if (!controlledFields.has(key)) continue;
        if (type === "readonly" || type === "readonlyTextarea") continue;

        const value = String(fields[key] || "").trim();
        if (!value) {
          return `${label} is required. Select a controlled value before saving.`;
        }

        const options = getSelectOptions(type, {
          value,
          process,
          masterRows,
        });

        if (options && !options.includes(value)) {
          return `${label} must be selected from the approved list.`;
        }
      }
    }

    return "";
  }

  return (
    <div style={page}>
      <div style={hero}>
        <div>
          <div style={eyebrow}>Operations Review</div>
          <h1 style={title}>Production History</h1>
          <div style={subtitle}>
            Complete history of Grinder, Wash, Sorting and Extrusion batches with full popup editing.
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
                      process={editing.process}
                      masterRows={masterRows}
                      dateForInput={dateForInput}
                      onChange={(value) => onEditChange(key, value)}
                    />
                  ))}
                </div>
              </div>
            ))}

            <details style={jsonBox}>
              <summary style={{ cursor: "pointer", fontWeight: 700 }}>
                Raw record preview
              </summary>

              <textarea
                readOnly
                value={JSON.stringify(editing.fields, null, 2)}
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

function EditField({
  label,
  value,
  type = "text",
  onChange,
  dateForInput,
  process,
  masterRows,
}) {
  const safe = type === "date" ? dateForInput(value) : value || "";
  const selectOptions = getSelectOptions(type, {
    value: safe,
    process,
    masterRows,
  });

  if (selectOptions) {
    return (
      <div>
        <label style={labelStyle}>{label}</label>
        <select
          value={safe}
          onChange={(e) => onChange(e.target.value)}
          style={inputStyle}
        >
          <option value="">Select {label}</option>
          {selectOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (type === "readonly" || type === "readonlyTextarea") {
    const Control = type === "readonlyTextarea" ? "textarea" : "input";
    return (
      <div>
        <label style={labelStyle}>{label}</label>
        <Control
          readOnly
          value={safe}
          style={type === "readonlyTextarea" ? readonlyTextareaStyle : readonlyInputStyle}
        />
      </div>
    );
  }

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

function getSelectOptions(type, context) {
  if (type === "processSelect") return withCurrent(PROCESS_OPTIONS, context.value);
  if (type === "shiftSelect") return withCurrent(SHIFT_OPTIONS, context.value);
  if (type === "statusSelect") return withCurrent(STATUS_OPTIONS, context.value);
  if (type === "nextProcessSelect") return withCurrent(NEXT_PROCESS_OPTIONS, context.value);
  if (type === "sourceTypeSelect") return withCurrent(SOURCE_TYPE_OPTIONS, context.value);
  if (type === "yesNoSelect") return withCurrent(["YES", "NO"], context.value);

  if (type === "machineSelect") {
    return withCurrent(
      (context.masterRows?.machines || [])
        .filter((item) => machineMatchesProcess(item, context.process))
        .map(itemLabel)
        .filter(Boolean),
      context.value
    );
  }

  if (type === "materialSelect") {
    return withCurrent(
      (context.masterRows?.materials || []).map(itemLabel).filter(Boolean),
      context.value
    );
  }

  if (type === "gradeSelect") {
    const gradeOptions = [
      ...(context.masterRows?.grades || []).map(itemLabel),
      ...(context.masterRows?.materials || [])
        .filter((item) => String(item.category || item.materialType || "").toUpperCase() === "FG")
        .map(itemLabel),
      "E1",
      "E2",
      "E3",
      "E4",
      "E5",
    ].filter(Boolean);

    return withCurrent(gradeOptions, context.value);
  }

  return null;
}

function withCurrent(options, current) {
  const values = [];
  const seen = new Set();

  [current, ...options].forEach((value) => {
    const clean = String(value || "").trim();
    if (!clean || seen.has(clean)) return;
    seen.add(clean);
    values.push(clean);
  });

  return values;
}

function machineMatchesProcess(item, process) {
  const rowProcess = String(item.processType || item.machineType || "").toUpperCase();
  if (!rowProcess) return true;

  const current = String(process || "").toUpperCase();
  if (current === "GRINDER") return rowProcess.includes("GRIND");
  if (current === "WASH") return rowProcess.includes("WASH");
  if (current === "SORTING") return rowProcess.includes("SORT");
  if (current === "EXTRUSION") {
    return rowProcess.includes("EXTRUSION") || rowProcess.includes("EXTRUDER");
  }

  return true;
}

function itemLabel(item) {
  return String(
    item?.name ||
      item?.materialName ||
      item?.machineName ||
      item?.gradeName ||
      item?.itemName ||
      item?.code ||
      item?.materialCode ||
      item?.gradeCode ||
      ""
  ).trim();
}

function normalizeControlledValue(key, value) {
  const clean = String(value || "").trim();
  if (!clean) return "";
  if (key === "shift") return clean.toUpperCase();
  if (key === "__process") {
    return PROCESS_OPTIONS.find((option) => option.toUpperCase() === clean.toUpperCase()) || clean;
  }
  if (key === "status" || key === "sourceType") {
    return clean.toUpperCase().replace(/\s+/g, "_");
  }
  if (key === "productionGrade") {
    return normalizeInventoryMaterial(clean).toUpperCase();
  }
  return clean.replace(/\s+/g, " ");
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

const readonlyInputStyle = {
  ...inputStyle,
  background: "#f8fafc",
  color: "#475569",
};

const readonlyTextareaStyle = {
  ...textareaStyle,
  background: "#f8fafc",
  color: "#475569",
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
