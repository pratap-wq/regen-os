import { useEffect, useMemo, useRef, useState } from "react";
import { apiCall } from "../api/api";
import { formatDate } from "../utils/date";
import DataTable from "../components/DataTable";
import { listFactoryMaster } from "../services/FactoryMasterService";
import { normalizeInventoryMaterial } from "../services/inventoryEngine";
import {
  listProductionMaterialMaster,
  normalizeProductionMaterialName,
  productionMaterialAllowed,
} from "../services/productionMaterialMaster";
import { requireSuccessfulResponse, withRequestTimeout } from "../utils/requestSafety";

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
const HISTORY_TIMEOUT_MS = 20000;

export default function ProductionHistory() {
  const now = new Date();
  const [month, setMonth] = useState(
    String(now.getMonth() + 1).padStart(2, "0")
  );
  const [year, setYear] = useState(String(now.getFullYear()));
  const [dateFilterMode, setDateFilterMode] = useState("production");
  const [stage, setStage] = useState("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [history, setHistory] = useState(emptyProductionHistory());
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadingRecordId, setLoadingRecordId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [editMastersLoaded, setEditMastersLoaded] = useState(false);
  const [masterRows, setMasterRows] = useState({
    machines: [],
    productionMaterials: [],
    grades: [],
  });
  const requestIdRef = useRef(0);
  const editMastersPromiseRef = useRef(null);
  const writeLockRef = useRef(false);
  const periodMonth = `${year}-${month}`;

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearch(searchInput.trim());
      setPageNumber(1);
    }, 350);
    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    loadData();
  }, [periodMonth, stage, search, pageNumber, pageSize, dateFilterMode]);

  async function loadData() {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setLoadError("");
    try {
      const res = await productionHistoryCall({
        periodMonth,
        stage,
        search,
        page: pageNumber,
        pageSize,
        dateMode: dateFilterMode,
      });
      if (!res || res.ok === false) throw new Error(res?.error || "Failed loading production history");
      if (requestId !== requestIdRef.current) return null;
      setHistory(res);
      if (Number(res.pagination?.page || 1) !== pageNumber) {
        setPageNumber(Number(res.pagination?.page || 1));
      }
      return res;
    } catch (err) {
      console.log(err);
      if (requestId === requestIdRef.current) {
        setLoadError(err.message || "Failed loading production history");
      }
      return null;
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }

  async function loadEditMasters() {
    if (editMastersLoaded) return masterRows;
    if (editMastersPromiseRef.current) return editMastersPromiseRef.current;
    editMastersPromiseRef.current = Promise.all([
      safeMasterList("machine"),
      safeProductionMaterials(),
      safeMasterList("productGrade"),
    ]).then(([machines, productionMaterials, grades]) => {
      const next = { machines, productionMaterials, grades };
      setMasterRows(next);
      setEditMastersLoaded(true);
      return next;
    }).finally(() => {
      editMastersPromiseRef.current = null;
    });
    return editMastersPromiseRef.current;
  }

  async function safeMasterList(masterType) {
    try {
      return await listFactoryMaster(masterType);
    } catch (err) {
      console.log(masterType, err);
      return [];
    }
  }

  async function safeProductionMaterials() {
    try {
      return await listProductionMaterialMaster();
    } catch (err) {
      console.log("productionMaterialMaster", err);
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

  const rows = useMemo(() => {
    return (history.rows || []).map(productionHistoryDisplayRow);
  }, [history.rows]);

  const selectedTotals = productionHistorySelectedTotals(history.totals, stage);
  const totalInput = selectedTotals.inputKg;
  const totalOutput = selectedTotals.outputKg;
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

  async function loadHistorySource(row) {
    const res = await productionHistoryRecordCall({
      stage: row.stage,
      recordId: row.id,
    });
    if (!res || res.ok === false) throw new Error(res?.error || "Unable to load the production record");
    if (!res.record?.source) throw new Error(`Production record not found: ${row.id}`);
    return { source: res.record.source, elapsedMs: Number(res.elapsedMs || 0) };
  }

  async function editRow(row) {
    if (loadingRecordId || writeLockRef.current) return;
    const startedAt = Date.now();
    setLoadingRecordId(row.id);
    setStatus("Loading record...");
    try {
      const [recordResult] = await Promise.all([
        loadHistorySource(row),
        loadEditMasters(),
      ]);
      const detailedRow = { ...row, source: recordResult.source };
      setEditing({
        process: row.process,
        updateFn: row.updateFn,
        idKey: row.idKey,
        id: row.id,
        fields: prepareEditFields(detailedRow),
        sections: getEditSections(detailedRow),
      });
      const totalMs = Date.now() - startedAt;
      console.info("production.historyRecord", { stage: row.stage, recordId: row.id, backendMs: recordResult.elapsedMs, totalMs });
      setStatus(`Record loaded in ${totalMs} ms.`);
    } catch (err) {
      setStatus(err.message || "Unable to load edit details");
    } finally {
      setLoadingRecordId("");
    }
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
    if (!editing || writeLockRef.current) return;
    writeLockRef.current = true;
    const startedAt = Date.now();
    setSaving(true);
    setStatus("Saving changes...");

    try {
      const cleanDate = dateForInput(editing.fields.date);
      const normalizedFields = normalizeEditFields(editing.fields);
      const validationError = validateEditFields(normalizedFields, editing.sections, editing.process);

      if (validationError) {
        throw new Error(validationError);
      }

      const payload = {
        fn: editing.updateFn,
        ...normalizedFields,
        date: cleanDate,
        [editing.idKey]: editing.id,
      };
      delete payload.__process;

      const res = requireSuccessfulResponse(
        await withRequestTimeout(apiCall(payload), 30000),
        "recordId",
        `${editing.process} update`
      );
      if (res.ledgerPosted !== true) {
        throw new Error(res.failedStep ? `Ledger update failed at ${res.failedStep}.` : "Ledger update was not confirmed.");
      }

      const savedProcess = editing.process;
      const savedId = editing.id;
      setEditing(null);
      setStatus("Changes saved successfully. Refreshing history...");
      await loadData();
      const totalMs = Date.now() - startedAt;
      console.info(`${savedProcess.toLowerCase()}.update`, { recordId: savedId, backendMs: res.elapsedMs, timings: res.timings, totalMs });
      setStatus(`Changes saved successfully: ${savedProcess} ${savedId}. Backend ${Number(res.elapsedMs || 0)} ms; total ${totalMs} ms.`);
    } catch (err) {
      setStatus(err.message || "Update failed");
    } finally {
      writeLockRef.current = false;
      setSaving(false);
    }
  }

  async function deleteRow(row) {
    if (writeLockRef.current || deletingId) return;
    const ok = window.confirm(`Delete ${row.process} ${row.id}?`);
    if (!ok) return;

    writeLockRef.current = true;
    setDeletingId(row.id);
    const startedAt = Date.now();
    try {
      setStatus(`Deleting ${row.process} ${row.id}...`);
      const res = requireSuccessfulResponse(await withRequestTimeout(apiCall({
        fn: row.updateFn,
        [row.idKey]: row.id,
        status: "DELETED",
      }), 30000), "recordId", `${row.process} delete`);
      if (res.ledgerPosted !== true) throw new Error(res.failedStep ? `Delete failed at ${res.failedStep}.` : "Ledger void was not confirmed.");

      setStatus(`${row.process} ${row.id} deleted. Refreshing history...`);
      await loadData();
      const totalMs = Date.now() - startedAt;
      console.info(`${row.process.toLowerCase()}.delete`, { recordId: row.id, backendMs: res.elapsedMs, timings: res.timings, totalMs });
      setStatus(`${row.process} ${row.id} deleted successfully. Backend ${Number(res.elapsedMs || 0)} ms; total ${totalMs} ms.`);
    } catch (err) {
      setStatus(err.message || "Delete failed");
    } finally {
      writeLockRef.current = false;
      setDeletingId("");
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
          if (type === "materialSelect" || type === "gradeSelect") {
            return `${label} needs manual review. Select an approved production material before saving.`;
          }
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
          <select value={month} onChange={(e) => { setMonth(e.target.value); setPageNumber(1); }} style={filter}>
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

          <select value={year} onChange={(e) => { setYear(e.target.value); setPageNumber(1); }} style={filter}>
            <option>2025</option>
            <option>2026</option>
            <option>2027</option>
          </select>

          <select
            value={dateFilterMode}
            onChange={(e) => { setDateFilterMode(e.target.value); setPageNumber(1); }}
            style={filter}
            title="Choose whether the month filter uses production date or saved date"
          >
            <option value="production">Production Date</option>
            <option value="created">Created Date</option>
          </select>

          <select value={stage} onChange={(e) => { setStage(e.target.value); setPageNumber(1); }} style={filter}>
            <option value="ALL">All Stages</option>
            <option value="GRINDER">Grinder</option>
            <option value="WASH">Wash</option>
            <option value="SORTING">Sorting</option>
            <option value="EXTRUSION">Extrusion</option>
          </select>

          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search history..."
            style={filter}
          />

          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPageNumber(1); }} style={filter}>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>
        </div>
      </div>

      <div style={noteStyle}>
        History is filtered by {dateFilterMode === "created" ? "created date" : "production date"}. {" "}
        Grinder {n(history.stageCounts?.grinder)} | Wash {n(history.stageCounts?.wash)} | Sorting {n(history.stageCounts?.sorting)} | Extrusion {n(history.stageCounts?.extrusion)} | Backend {n(history.elapsedMs)} ms
      </div>

      <div style={kpiGrid}>
        <KPI title="Entries" value={n(history.pagination?.totalRows)} />
        <KPI title="Input" value={`${ton(totalInput)} T`} />
        <KPI title="Output" value={`${ton(totalOutput)} T`} />
        <KPI title="Average Recovery" value={`${avgRecovery.toFixed(1)}%`} />
      </div>

      {loading && <div style={noteStyle}>Loading production history...</div>}
      {loadError && <div style={errorStyle}>{loadError}</div>}
      {status && <div style={statusStyle}>{status}</div>}

      <DataTable
        title="Production Records"
        rows={rows}
        searchFields={[
          "id",
          "process",
          "shift",
          "inputMaterial",
          "outputMaterial",
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
          {
            key: "createdAt",
            label: "Saved At",
            render: (r) => (r.createdAt ? formatDate(dateForInput(r.createdAt)) : "-"),
            renderExport: (r) => dateForInput(r.createdAt),
          },
          { key: "process", label: "Process" },
          { key: "id", label: "Batch" },
          { key: "shift", label: "Shift" },
          { key: "inputMaterial", label: "Input Material" },
          { key: "outputMaterial", label: "Output Material" },
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
            key: "wasteKg",
            label: "Waste Kg",
            render: (r) => Number(r.wasteKg || 0).toFixed(0),
            renderExport: (r) => Number(r.wasteKg || 0).toFixed(0),
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
        hideFilters
      />

      <div style={paginationBar}>
        <button
          onClick={() => setPageNumber((value) => Math.max(1, value - 1))}
          disabled={loading || n(history.pagination?.page) <= 1}
          style={paginationButton}
        >
          Previous
        </button>
        <span>
          Page <b>{n(history.pagination?.page) || 1}</b> of <b>{n(history.pagination?.totalPages) || 1}</b> · {n(history.pagination?.totalRows)} records
        </span>
        <button
          onClick={() => setPageNumber((value) => Math.min(n(history.pagination?.totalPages) || 1, value + 1))}
          disabled={loading || n(history.pagination?.page) >= n(history.pagination?.totalPages)}
          style={paginationButton}
        >
          Next
        </button>
      </div>

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
              <button onClick={() => setEditing(null)} disabled={saving} style={saving ? disabledCancelButton : cancelButton}>
                Cancel
              </button>

              <button onClick={saveEdit} disabled={saving} style={saveButton}>
                {saving ? "Saving changes..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function emptyProductionHistory() {
  return {
    ok: true,
    periodMonth: "",
    elapsedMs: 0,
    totals: {},
    stageCounts: {},
    rows: [],
    pagination: { page: 1, pageSize: 50, totalRows: 0, totalPages: 1 },
  };
}

async function productionHistoryCall(payload) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("Production History timed out. Check the Apps Script deployment and try again."));
    }, HISTORY_TIMEOUT_MS);
  });
  return Promise.race([
    apiCall({ fn: "production.historySummary", ...payload }),
    timeout,
  ]).finally(() => clearTimeout(timeoutId));
}

async function productionHistoryRecordCall(payload) {
  return withRequestTimeout(
    apiCall({ fn: "production.historyRecord", ...payload }),
    30000,
    "Loading record timed out. Check the Apps Script deployment and try again."
  );
}

function productionHistoryDisplayRow(row = {}) {
  const process = {
    GRINDER: "Grinder",
    WASH: "Wash",
    SORTING: "Sorting",
    EXTRUSION: "Extrusion",
  }[String(row.stage || "").toUpperCase()] || row.stage || "";
  const route = {
    Grinder: ["grinder.update", "grinderBatchId"],
    Wash: ["wash.update", "washBatchId"],
    Sorting: ["sorting.update", "sortingBatchId"],
    Extrusion: ["extrusion.update", "extrusionBatchId"],
  }[process] || ["", ""];

  return {
    ...row,
    stage: String(row.stage || "").toUpperCase(),
    id: row.recordId || "",
    process,
    updateFn: route[0],
    idKey: route[1],
    material: row.inputMaterial || "",
    recovery: Number(row.recoveryPercent || 0),
    operator: row.operatorName || "",
    supervisor: row.supervisorName || "",
  };
}

function productionHistorySelectedTotals(totals = {}, stage = "ALL") {
  const byStage = {
    GRINDER: {
      inputKg: Number(totals.grinderInputKg || 0),
      outputKg: Number(totals.grinderOutputKg || 0),
    },
    WASH: {
      inputKg: Number(totals.washInputKg || 0),
      outputKg: Number(totals.washOutputKg || 0),
    },
    SORTING: {
      inputKg: Number(totals.sortingInputKg || 0),
      outputKg: Number(totals.sortingOutputKg || 0),
    },
    EXTRUSION: {
      inputKg: Number(totals.extrusionInputKg || 0),
      outputKg: Number(totals.fgProducedKg || 0),
    },
  };
  if (byStage[stage]) return byStage[stage];
  return Object.values(byStage).reduce(
    (sum, values) => ({
      inputKg: sum.inputKg + values.inputKg,
      outputKg: sum.outputKg + values.outputKg,
    }),
    { inputKg: 0, outputKg: 0 }
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
    return (context.masterRows?.productionMaterials || [])
      .filter((item) => productionMaterialAllowed(item, context.process, "INPUT"))
      .map(itemLabel)
      .filter(Boolean);
  }

  if (type === "gradeSelect") {
    return (context.masterRows?.productionMaterials || [])
      .filter((item) => productionMaterialAllowed(item, "EXTRUSION", "OUTPUT"))
      .map(itemLabel)
      .filter(Boolean);
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
      item?.canonicalName ||
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
  if (key === "inputMaterial") {
    return normalizeProductionMaterialName(clean);
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

const noteStyle = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  color: "#475569",
  borderRadius: 10,
  padding: "10px 12px",
  marginBottom: 16,
  fontSize: 13,
  fontWeight: 700,
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

const errorStyle = {
  ...statusStyle,
  background: "#fef2f2",
  color: "#991b1b",
  border: "1px solid #fecaca",
};

const paginationBar = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 14,
  marginTop: 14,
  flexWrap: "wrap",
  color: "#475569",
};

const paginationButton = {
  border: "1px solid #cbd5e1",
  background: "white",
  color: "#0f766e",
  borderRadius: 8,
  padding: "8px 14px",
  fontWeight: 800,
  cursor: "pointer",
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

const disabledCancelButton = {
  ...cancelButton,
  opacity: 0.65,
  cursor: "not-allowed",
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
