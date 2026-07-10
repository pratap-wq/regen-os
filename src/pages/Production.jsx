import { useEffect, useMemo, useRef, useState } from "react";
import { apiCall } from "../api/api";
import FormSection from "../components/FormSection";
import ManufacturingInputTable from "../components/ManufacturingInputTable";
import ManufacturingOutputTable from "../components/ManufacturingOutputTable";
import FactoryDropdown from "../components/FactoryDropdown";
import { KpiCard, PageLayout } from "../components/factoryDesignSystem";
import { generateExtrusionBatchId } from "../utils/idGenerator";
import { buildAvailabilityMap, materialKey } from "../utils/materialInventory";
import { dropdownFlagForContext } from "../services/productionMaterialMaster";
import { createStableTransactionId, withRequestTimeout } from "../utils/requestSafety";

export default function Production() {
  const today = new Date().toISOString().split("T")[0];

  const blankFeedRow = {
    sourceType: "",
    materialType: "",
    qtyKg: "",
    remarks: "",
  };

  const blank = {
    date: today,
    shift: "A",

    machineRunningHours: "",
    downtimeHours: "",
    downtimeReason: "",

    washOperatorName: "",
    washSupervisorName: "",
    grinderOperatorName: "",
    grinderSupervisorName: "",
    sorterOperatorName: "",
    sorterSupervisorName: "",
    extruderOperatorName: "",
    extruderSupervisorName: "",

    machineGrinder: "",
    machineWash: "",
    machineSorter: "",
    machineExtruder: "",

    washedOutputKg: "",
    dustKg: "",
    sinkMaterialKg: "",
    microPlasticKg: "",
    wrappersKg: "",
    sludgeKg: "",
    raffiaKg: "",

    whiteSortedKg: "",
    allMixSortedKg: "",
    whiteGreyKg: "",
    sorterRejectKg: "",

    extrusionBatchId: "",
    fgOutputKg: "",
    lumpsKg: "",
    purgingKg: "",
    reworkGranulesKg: "",
    rejectKg: "",
    vacuumRejectKg: "",
    meshRejectKg: "",
    floorSpillageKg: "",
    productionGrade: "",

    
    remarks: "",
  };

  const [form, setForm] = useState(blank);
  const [grinderFeedRows, setGrinderFeedRows] = useState([{ ...blankFeedRow }]);
  const [washFeedRows, setWashFeedRows] = useState([{ ...blankFeedRow }]);
  const [sorterFeedRows, setSorterFeedRows] = useState([{ ...blankFeedRow }]);
  const [feedRows, setFeedRows] = useState([{ ...blankFeedRow }]);
  const [grinderOutputRows, setGrinderOutputRows] = useState([blankOutputRow()]);
  const [washOutputRows, setWashOutputRows] = useState([blankOutputRow()]);
  const [sorterOutputRows, setSorterOutputRows] = useState([blankOutputRow()]);
  const [extrusionOutputRows, setExtrusionOutputRows] = useState([blankOutputRow()]);

  const [extrusionRows, setExtrusionRows] = useState([]);
  const [materialRows, setMaterialRows] = useState([]);
  const [machineRows, setMachineRows] = useState([]);
  const [inventoryRows, setInventoryRows] = useState([]);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [saveStep, setSaveStep] = useState("");
  const saveLockRef = useRef(false);
  const transactionIdsRef = useRef({});

  useEffect(() => {
    loadMasters();
  }, []);

  async function loadMasters({ preserveOutputRows = false } = {}) {
    try {
      const res = await withRequestTimeout(apiCall({ fn: "production.entryBootstrap" }), 30000);
      if (!res || res.ok !== true) throw new Error(res?.error || "Production entry setup failed");
      const materialData = res.materials || [];
      setMachineRows(res.machines || []);
      setExtrusionRows(res.extrusionRefs || []);
      setInventoryRows(res.inventoryRows || []);
      setMaterialRows(materialData);
      if (!preserveOutputRows) {
        setGrinderOutputRows(defaultOutputRowsFor(materialData, "GRINDER"));
        setWashOutputRows(defaultOutputRowsFor(materialData, "WASH"));
        setSorterOutputRows(defaultOutputRowsFor(materialData, "SORTING"));
        setExtrusionOutputRows(defaultOutputRowsFor(materialData, "EXTRUSION"));
      }
    } catch (err) {
      setMessage(err.message);
    }
  }

  const inventoryLots = useMemo(() => {
    return inventoryRows.map((row) => ({
      lotId: row.materialCode || row.materialName,
      material: row.materialName,
      availableKg: Number(row.qtyKg || 0),
      sourceType: "INVENTORY_LEDGER",
    }));
  }, [inventoryRows]);

  const availableInventoryByMaterial = useMemo(() => {
    return buildAvailabilityMap(inventoryLots);
  }, [inventoryLots]);

  function n(v) {
    return Number(v || 0);
  }

  function availableKg(material) {
    return availableInventoryByMaterial[materialKey(material)] || 0;
  }

  function buildExtrusionBatchId(updatedForm = form) {
    if (!updatedForm.productionGrade) return "";

    return generateExtrusionBatchId(
      updatedForm.date,
      updatedForm.shift,
      updatedForm.productionGrade,
      extrusionRows
    );
  }

  function onChange(e) {
    const updated = {
      ...form,
      [e.target.name]: e.target.value,
    };

    if (
      e.target.name === "date" ||
      e.target.name === "shift" ||
      e.target.name === "productionGrade"
    ) {
      updated.extrusionBatchId = buildExtrusionBatchId(updated);
    }

    setForm(updated);
  }

  function resetForm() {
    const fresh = {
      ...blank,
      date: new Date().toISOString().split("T")[0],
      shift: "A",
    };

    fresh.extrusionBatchId = buildExtrusionBatchId(fresh);

    setForm(fresh);
    setGrinderFeedRows([{ ...blankFeedRow }]);
    setWashFeedRows([{ ...blankFeedRow }]);
    setSorterFeedRows([{ ...blankFeedRow }]);
    setFeedRows([{ ...blankFeedRow }]);
    setGrinderOutputRows(defaultOutputRowsFor(materialRows, "GRINDER"));
    setWashOutputRows(defaultOutputRowsFor(materialRows, "WASH"));
    setSorterOutputRows(defaultOutputRowsFor(materialRows, "SORTING"));
    setExtrusionOutputRows(defaultOutputRowsFor(materialRows, "EXTRUSION"));
  }

  function cleanRows(rows) {
    return rows.filter((r) => (r.materialType || r.sourceType) && n(r.qtyKg) > 0);
  }

  function cleanWashRows() {
    return cleanRows(washFeedRows);
  }

  function cleanGrinderRows() {
    return cleanRows(grinderFeedRows);
  }

  function cleanFeedRows() {
    return cleanRows(feedRows);
  }

  function cleanSorterRows() {
    return cleanRows(sorterFeedRows);
  }

  function rowsTotalKg(rows) {
    return cleanRows(rows).reduce((s, r) => s + n(r.qtyKg), 0);
  }

  function rowsSummary(rows) {
    return cleanRows(rows)
      .map((r) => {
        return `${r.materialType || r.sourceType}: ${r.qtyKg} Kg`;
      })
      .join(" + ");
  }

  function cleanOutputRows(rows) {
    return rows.filter((r) => r.material && n(r.qtyKg) > 0);
  }

  function outputTotalKg(rows) {
    return cleanOutputRows(rows).reduce((s, r) => s + n(r.qtyKg), 0);
  }

  function outputKgByName(rows, matchers) {
    return cleanOutputRows(rows)
      .filter((r) => {
        const material = String(r.material || "").toUpperCase();
        return matchers.some((matcher) => material.includes(matcher));
      })
      .reduce((s, r) => s + n(r.qtyKg), 0);
  }

  function firstFgOutputMaterial(rows) {
    const fgRow = cleanOutputRows(rows).find((r) =>
      /^E[1-5]$/i.test(String(r.material || "").trim())
    );
    return fgRow?.material || "";
  }

  function processSummary(inputKg, outputKg) {
    const varianceKg = inputKg - outputKg;
    return {
      totalInputKg: inputKg,
      totalOutputKg: outputKg,
      recoveryPercent: inputKg > 0 ? ((outputKg / inputKg) * 100).toFixed(2) : "",
      varianceKg,
      difference: varianceKg.toFixed(2),
    };
  }

  function feedTotalKg() {
    return rowsTotalKg(feedRows);
  }

  function feedSummary() {
    return rowsSummary(feedRows);
  }

  function washFeedTotalKg() {
    return rowsTotalKg(washFeedRows);
  }

  function washFeedSummary() {
    return rowsSummary(washFeedRows);
  }

  function grinderFeedTotalKg() {
    return rowsTotalKg(grinderFeedRows);
  }

  function grinderFeedSummary() {
    return rowsSummary(grinderFeedRows);
  }

  function sorterFeedTotalKg() {
    return rowsTotalKg(sorterFeedRows);
  }

  function sorterFeedSummary() {
    return rowsSummary(sorterFeedRows);
  }

  function validateMaterialRows(rows, processName) {
    const cleaned = cleanRows(rows);
    const seen = new Set();
    const availability = buildAvailabilityMap(inventoryLots);

    for (const row of cleaned) {
      const material = row.materialType || row.sourceType;
      const key = materialKey(material);
      const qty = n(row.qtyKg);
      const available = availability[key] || 0;

      if (seen.has(key)) {
        return `${processName}: ${material} is selected more than once. Combine it into one row.`;
      }

      if (qty > available) {
        return `${processName}: ${material} consume quantity exceeds available stock. Available: ${available.toFixed(2)} Kg.`;
      }

      seen.add(key);
    }

    return "";
  }

  function isRecoveryMaterial(materialType = "") {
    const m = String(materialType || "").toUpperCase();

    return (
      m.includes("RECOVERY") ||
      m.includes("REWORK") ||
      m.includes("REGRIND") ||
      m.includes("LUMPS") ||
      m.includes("PURGING")
    );
  }

  function isAdditiveMaterial(materialType = "") {
    const m = String(materialType || "").toUpperCase();

    return (
      m.includes("MASTERBATCH") ||
      m.includes("ANTIOXIDANT") ||
      m.includes("ADDITIVE")
    );
  }

  function isVirginMaterial(materialType = "") {
    return String(materialType || "").toUpperCase().includes("VIRGIN");
  }

  function isBatteryMaterial(materialType = "") {
    return String(materialType || "").toUpperCase().includes("BATTERY");
  }

  const washOutputKg = outputTotalKg(washOutputRows);
  const washSummary = processSummary(washFeedTotalKg(), washOutputKg);
  const washRecovery = washSummary.recoveryPercent;
  const washVariance = washSummary.varianceKg;

  const grinderOutputKg = outputTotalKg(grinderOutputRows);
  const grinderRegrindOutputKg = outputKgByName(grinderOutputRows, ["REGRIND"]);
  const grinderSummary = processSummary(grinderFeedTotalKg(), grinderOutputKg);
  const grinderRecovery = grinderSummary.recoveryPercent;
  const grinderVariance = grinderSummary.varianceKg;

  const sorterOutputKg = outputTotalKg(sorterOutputRows);
  const sorterSummary = processSummary(sorterFeedTotalKg(), sorterOutputKg);
  const sorterRecovery = sorterSummary.recoveryPercent;
  const sorterVariance = sorterSummary.varianceKg;

  const totalFeedKg = feedTotalKg();

  const extrusionRecoverable =
    outputKgByName(extrusionOutputRows, ["E1", "E2", "E3", "E4", "E5"]) +
    outputKgByName(extrusionOutputRows, ["LUMPS", "PURGING", "REWORK"]);

  const extrusionNonRecoverable =
    outputKgByName(extrusionOutputRows, ["WASTE", "REJECT", "DUST"]);

  const extrusionTotalOutput = outputTotalKg(extrusionOutputRows);
  const extrusionVariance = totalFeedKg - extrusionTotalOutput;

  const extrusionRecovery =
    totalFeedKg > 0
      ? ((extrusionTotalOutput / totalFeedKg) * 100).toFixed(2)
      : "";

  const recoveryFeedKg = cleanFeedRows()
    .filter((r) => isRecoveryMaterial(r.materialType))
    .reduce((s, r) => s + n(r.qtyKg), 0);

  const virginFeedKg = cleanFeedRows()
    .filter((r) => isVirginMaterial(r.materialType))
    .reduce((s, r) => s + n(r.qtyKg), 0);

  const batteryFeedKg = cleanFeedRows()
    .filter((r) => isBatteryMaterial(r.materialType))
    .reduce((s, r) => s + n(r.qtyKg), 0);

  const additiveFeedKg = cleanFeedRows()
    .filter((r) => isAdditiveMaterial(r.materialType))
    .reduce((s, r) => s + n(r.qtyKg), 0);

  const recoveryMaterialPercent =
    totalFeedKg > 0 ? ((recoveryFeedKg / totalFeedKg) * 100).toFixed(2) : "";

  const virginRatioPercent =
    totalFeedKg > 0 ? ((virginFeedKg / totalFeedKg) * 100).toFixed(2) : "";

  const batteryRatioPercent =
    totalFeedKg > 0 ? ((batteryFeedKg / totalFeedKg) * 100).toFixed(2) : "";

  const additiveRatioPercent =
    totalFeedKg > 0 ? ((additiveFeedKg / totalFeedKg) * 100).toFixed(2) : "";

  
 
  function productionPeriodMonth() {
    return String(form.date || today).slice(0, 7);
  }

  function assertStageSaved(res, label, idField) {
    if (!res || res.ok !== true) throw new Error(res?.error || `${label} save failed.`);
    if (!res[idField]) throw new Error(`${label} save failed: backend did not return ${idField}.`);
    if (res.ledgerPosted !== true || res.ledger?.warnings?.length) {
      const detail = res.ledger?.warnings?.join("; ") || res.failedStep || "ledger write was not confirmed";
      throw new Error(`${label} inventory posting failed: ${detail}`);
    }
    return res;
  }

  function failSave(message) {
    setMessage(message);
    setSaveStep("");
    setSaving(false);
    saveLockRef.current = false;
  }

  async function saveStage(payload, label, idField) {
    setSaveStep(`Saving ${label}...`);
    const res = await withRequestTimeout(apiCall(payload), 30000);
    return assertStageSaved(res, label, idField);
  }

  async function submit(e) {
    e.preventDefault();
    if (saveLockRef.current) return;

    saveLockRef.current = true;
    setSaving(true);
    setSaveStep("Validating production entry...");
    setMessage("Validating production entry...");

    try {
      let grinderBatchId = "";
      let washBatchId = "";
      let sortingBatchId = "";
      const finalGrinderRows = cleanGrinderRows();
      const grinderTotalKg = grinderFeedTotalKg();
      const finalGrinderOutputRows = cleanOutputRows(grinderOutputRows);
      const grinderRegrindMaterial = grinderOutputRows.find((row) =>
        String(row.material || "").toUpperCase().includes("REGRIND")
      )?.material || "regrind material";
      const finalWashRows = cleanWashRows();
      const washTotalKg = washFeedTotalKg();
      const finalWashOutputRows = cleanOutputRows(washOutputRows);
      const finalSorterRows = cleanSorterRows();
      const sorterTotalKg = sorterFeedTotalKg();
      const finalSorterOutputRows = cleanOutputRows(sorterOutputRows);
      const transactionIds = transactionIdsRef.current;

      if (grinderTotalKg > 0 || grinderOutputKg > 0) {
        if (finalGrinderRows.length === 0 || grinderTotalKg <= 0) {
          return failSave("Grinder: add at least one bucket input material with consume quantity.");
        }

        if (grinderRegrindOutputKg <= 0) {
          return failSave(`Grinder: add ${grinderRegrindMaterial} output quantity.`);
        }

        const grinderValidation = validateMaterialRows(grinderFeedRows, "Grinder");
        if (grinderValidation) {
          return failSave(grinderValidation);
        }

        const fgOutput = finalGrinderOutputRows.find((row) =>
          /^E[1-5]$/i.test(String(row.material || "").trim())
        );

        if (fgOutput) {
          return failSave("Grinder cannot create finished goods grades. Send output to Wash as White Regrind (Unwashed).");
        }

        const grinder = await saveStage({
          fn: "grinder.add",
          grinderBatchId: transactionIds.grinder || (transactionIds.grinder = createStableTransactionId("GB", form.date, form.shift)),
          date: form.date,
          shift: form.shift,
          periodMonth: productionPeriodMonth(),
          machine: form.machineGrinder,
          inputMaterial: grinderFeedSummary(),
          inputWeightKg: grinderTotalKg,
          feedComposition: JSON.stringify(finalGrinderRows),
          outputComposition: JSON.stringify(finalGrinderOutputRows),
          regrindOutputKg: grinderRegrindOutputKg,
          dustKg: outputKgByName(grinderOutputRows, ["DUST"]),
          metalRejectKg: outputKgByName(grinderOutputRows, ["METAL"]),
          grinderVarianceKg: grinderVariance,
          recoveryPercent: grinderRecovery,
          status: "READY_FOR_WASH",
          nextProcess: "Wash",
          operatorName: form.grinderOperatorName,
          supervisorName: form.grinderSupervisorName,
          machineRunningHours: form.machineRunningHours,
          downtimeHours: form.downtimeHours,
          downtimeReason: form.downtimeReason,
          remarks: form.remarks,
          createdBy: "Production Screen",
        }, "Grinder", "grinderBatchId");

        grinderBatchId = grinder.grinderBatchId || "";
      }

      if (washTotalKg > 0 || washOutputKg > 0) {
        if (finalWashRows.length === 0 || washTotalKg <= 0) {
          return failSave("Wash: add at least one input material with consume quantity.");
        }

        const washValidation = validateMaterialRows(washFeedRows, "Wash");
        if (washValidation) {
          return failSave(washValidation);
        }

        const wash = await saveStage({
          fn: "wash.add",
          washBatchId: transactionIds.wash || (transactionIds.wash = createStableTransactionId("WB", form.date, form.shift)),
          sourceGrinderBatchId: grinderBatchId,
          date: form.date,
          shift: form.shift,
          periodMonth: productionPeriodMonth(),
          machine: form.machineWash,
          inputMaterial: washFeedSummary(),
          inputWeightKg: washTotalKg,
          feedComposition: JSON.stringify(finalWashRows),
          outputComposition: JSON.stringify(finalWashOutputRows),
          washedOutputKg: outputKgByName(washOutputRows, ["WASHED"]),
          dustKg: outputKgByName(washOutputRows, ["DUST"]),
          sinkMaterialKg: outputKgByName(washOutputRows, ["SINK"]),
          microPlasticKg: outputKgByName(washOutputRows, ["MICRO"]),
          wrappersKg: outputKgByName(washOutputRows, ["WRAPPER"]),
          sludgeKg: 0,
          raffiaKg: 0,
          otherColorKg: outputKgByName(washOutputRows, ["OTHER COLOUR", "OTHER COLOR"]),
          estimatedRecoveryPercent: washRecovery,
          washVarianceKg: washVariance,
          sortingRequired: sorterTotalKg > 0 ? "YES" : "NO",
          nextProcess: sorterTotalKg > 0 ? "Colour Sorting" : "Extrusion",
          status:
            sorterTotalKg > 0
              ? "READY_FOR_SORTING"
              : "WASH_COMPLETED",
          operatorName: form.washOperatorName,
          supervisorName: form.washSupervisorName,
          remarks: form.remarks,
          createdBy: "Production Screen",
          
        }, "Wash", "washBatchId");

        washBatchId = wash.washBatchId || "";
      }

      if (sorterTotalKg > 0 || sorterOutputKg > 0) {
        if (finalSorterRows.length === 0 || sorterTotalKg <= 0) {
          return failSave("Colour Sorter: add at least one input material with consume quantity.");
        }

        const sortingValidation = validateMaterialRows(sorterFeedRows, "Colour Sorter");
        if (sortingValidation) {
          return failSave(sortingValidation);
        }

        const sorting = await saveStage({
          fn: "sorting.add",
          sortingBatchId: transactionIds.sorting || (transactionIds.sorting = createStableTransactionId("SB", form.date, form.shift)),
          sourceWashBatchId: washBatchId,
          date: form.date,
          shift: form.shift,
          periodMonth: productionPeriodMonth(),
          machine: form.machineSorter,
          inputMaterial: sorterFeedSummary(),
          inputWeightKg: sorterTotalKg,
          feedComposition: JSON.stringify(finalSorterRows),
          outputComposition: JSON.stringify(finalSorterOutputRows),
          acceptedQtyKg: sorterOutputKg - outputKgByName(sorterOutputRows, ["REJECT", "DUST"]),
          whiteSortedKg: outputKgByName(sorterOutputRows, ["WHITE SORTED"]),
          allMixSortedKg: outputKgByName(sorterOutputRows, ["MIXED SORTED"]),
          whiteGreyKg: 0,
          rejectedQtyKg: outputKgByName(sorterOutputRows, ["REJECT", "DUST"]),
          sorterVarianceKg: sorterVariance,
          recoveryPercent: sorterRecovery,
          status: "READY_FOR_EXTRUSION",
          nextProcess: "Extrusion",
          operatorName: form.sorterOperatorName,
          supervisorName: form.sorterSupervisorName,
          remarks: form.remarks,
          createdBy: "Production Screen",
          
        }, "Colour Sorter", "sortingBatchId");

        sortingBatchId = sorting.sortingBatchId || "";
      }

      const finalFeedRows = cleanFeedRows();
      const finalExtrusionOutputRows = cleanOutputRows(extrusionOutputRows);
      const extrusionFgOutputKg = outputKgByName(extrusionOutputRows, ["E1", "E2", "E3", "E4", "E5"]);
      const extrusionGrade = firstFgOutputMaterial(extrusionOutputRows) || "Mixed FG";

      if (totalFeedKg > 0 || extrusionTotalOutput > 0) {
        if (finalFeedRows.length === 0) {
          return failSave("Add at least one inventory lot in extruder feed.");
        }

        const extrusionValidation = validateMaterialRows(feedRows, "Extrusion");
        if (extrusionValidation) {
          return failSave(extrusionValidation);
        }

        if (!extrusionGrade) {
          return failSave("Add at least one extrusion output material.");
        }

        const finalExtrusionBatchId = generateExtrusionBatchId(
          form.date,
          form.shift,
          extrusionGrade,
          extrusionRows
        );
        transactionIds.extrusion = transactionIds.extrusion || finalExtrusionBatchId;

        if (!finalExtrusionBatchId) {
          return failSave("Production Batch ID could not be generated.");
        }

        await saveStage({
          fn: "extrusion.add",
          extrusionBatchId: transactionIds.extrusion,
          date: form.date,
          shift: form.shift,
          periodMonth: productionPeriodMonth(),
          machine: form.machineExtruder,
          sourceType: "PRODUCTION_SHIFT",
          sourceSortingBatchId: sortingBatchId,
          sourceWashBatchId: washBatchId,
          inputMaterial: feedSummary(),
          inputWeightKg: totalFeedKg,
          feedComposition: JSON.stringify(finalFeedRows),
          outputComposition: JSON.stringify(finalExtrusionOutputRows),
          totalInputKg: totalFeedKg,
          fgOutputKg: extrusionFgOutputKg,
          lumpsKg: outputKgByName(extrusionOutputRows, ["LUMPS"]),
          purgingKg: outputKgByName(extrusionOutputRows, ["PURGING"]),
          reworkGranulesKg: outputKgByName(extrusionOutputRows, ["REWORK"]),
          rejectKg: outputKgByName(extrusionOutputRows, ["WASTE", "REJECT"]),
          vacuumRejectKg: 0,
          meshRejectKg: 0,
          floorSpillageKg: 0,
          totalRecoverableKg: extrusionRecoverable,
          totalNonRecoverableKg: extrusionNonRecoverable,
          totalOutputKg: extrusionTotalOutput,
          varianceKg: extrusionVariance,
          recoveryPercent: extrusionRecovery,
          recoveryMaterialPercent,
          virginRatioPercent,
          batteryRatioPercent,
          additiveRatioPercent,
          productionGrade: extrusionGrade,
          operatorName: form.extruderOperatorName,
          supervisorName: form.extruderSupervisorName,
          remarks: form.remarks,
          nextProcess: "Dispatch",
          status: "READY_FOR_DISPATCH",
          createdBy: "Production Screen",
          
        }, "Extrusion", "extrusionBatchId");
      }

      if (
        washTotalKg <= 0 &&
        grinderTotalKg <= 0 &&
        sorterTotalKg <= 0 &&
        totalFeedKg <= 0 &&
        extrusionTotalOutput <= 0
      ) {
        return failSave("Enter grinder, wash, sorting or extrusion data before saving.");
      }

      setMessage("Shift production entry saved successfully.");
      resetForm();
      transactionIdsRef.current = {};
      setSaveStep("");
      loadMasters({ preserveOutputRows: true });
    } catch (err) {
      setMessage(err.message || "Production save failed");
    } finally {
      setSaving(false);
      setSaveStep("");
      saveLockRef.current = false;
    }
  }

  return (
    <PageLayout
      title="Production Entry"
      subtitle="One shift entry screen for Grinder, Washline, Colour Sorter and Extrusion. Raw Material and Finished Goods quality testing is performed separately in the Quality Workbench."
    >
      <div className="factory-kpi-grid">
        <KpiCard title="White Buckets" value={`${availableKg("White Buckets").toFixed(0)} Kg`} tone="neutral" />
        <KpiCard title="Unwashed Regrind" value={`${availableKg("White Regrind (Unwashed)").toFixed(0)} Kg`} tone="neutral" />
        <KpiCard title="Washed Regrind" value={`${availableKg("White Regrind (Washed)").toFixed(0)} Kg`} tone="neutral" />
        <KpiCard title="Sorted Regrind" value={`${availableKg("White Sorted Regrind").toFixed(0)} Kg`} tone="neutral" />
      </div>

      {message && <div style={messageBox}>{message}</div>}

      <form
        onSubmit={submit}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
            e.preventDefault();
          }
        }}
      >
        <FormSection title="Batch Information">
          <Field
            label="Date"
            name="date"
            value={form.date}
            onChange={onChange}
            type="date"
          />

          <SelectField
            label="Shift"
            name="shift"
            value={form.shift}
            onChange={onChange}
            options={["A", "B", "C"]}
          />
        </FormSection>

        <FormSection title="Grinder">
          <Field
            label="Operator"
            name="grinderOperatorName"
            value={form.grinderOperatorName}
            onChange={onChange}
          />

          <Field
            label="Supervisor"
            name="grinderSupervisorName"
            value={form.grinderSupervisorName}
            onChange={onChange}
          />

          <FactorySelectField
            label="Machine"
            masterType="machine"
            name="machineGrinder"
            value={form.machineGrinder}
            onChange={onChange}
            placeholder="Select Machine"
            defaults={{ processType: "GRINDER" }}
            providedItems={machineRows}
            filter={(item) => {
              const process = String(item.processType || item.machineType || "").toUpperCase();
              return !process || process.includes("GRIND");
            }}
          />

          <ManufacturingInputTable
            title="Grinder Input Materials"
            rows={grinderFeedRows}
            setRows={setGrinderFeedRows}
            inventoryLots={inventoryLots}
            materialPlaceholder="Select Bucket Material"
            quantityLabel="Consume Qty"
            stage="GRINDER"
            materialOptions={materialRows}
          />

          <ManufacturingOutputTable
            title="Grinder Output Materials"
            rows={grinderOutputRows}
            setRows={setGrinderOutputRows}
            materialPlaceholder="Select Output Material"
            stage="GRINDER"
            materialOptions={materialRows}
          />

          <ManufacturingSummary
            totalInputKg={grinderSummary.totalInputKg}
            totalOutputKg={grinderSummary.totalOutputKg}
            recoveryPercent={grinderSummary.recoveryPercent}
            varianceKg={grinderSummary.varianceKg}
            difference={grinderSummary.difference}
          />
        </FormSection>

        <FormSection title="Washline">
          <Field
            label="Operator"
            name="washOperatorName"
            value={form.washOperatorName}
            onChange={onChange}
          />

          <Field
            label="Supervisor"
            name="washSupervisorName"
            value={form.washSupervisorName}
            onChange={onChange}
          />

          <FactorySelectField
            label="Machine"
            masterType="machine"
            name="machineWash"
            value={form.machineWash}
            onChange={onChange}
            placeholder="Select Machine"
            defaults={{ processType: "WASH" }}
            providedItems={machineRows}
            filter={(item) => {
              const process = String(item.processType || item.machineType || "").toUpperCase();
              return !process || process.includes("WASH");
            }}
          />

          <ManufacturingInputTable
            title="Wash Input Materials"
            rows={washFeedRows}
            setRows={setWashFeedRows}
            inventoryLots={inventoryLots}
            materialPlaceholder="Select Input Material"
            quantityLabel="Consume Qty"
            stage="WASH"
            materialOptions={materialRows}
          />

          <ManufacturingOutputTable
            title="Wash Output Materials"
            rows={washOutputRows}
            setRows={setWashOutputRows}
            materialPlaceholder="Select Output Material"
            stage="WASH"
            materialOptions={materialRows}
          />

          <ManufacturingSummary
            totalInputKg={washSummary.totalInputKg}
            totalOutputKg={washSummary.totalOutputKg}
            recoveryPercent={washSummary.recoveryPercent}
            varianceKg={washSummary.varianceKg}
            difference={washSummary.difference}
          />
        </FormSection>

        <FormSection title="Colour Sorter">
          <Field label="Operator" name="sorterOperatorName" value={form.sorterOperatorName} onChange={onChange} />
          <Field label="Supervisor" name="sorterSupervisorName" value={form.sorterSupervisorName} onChange={onChange} />

          <FactorySelectField
            label="Machine"
            masterType="machine"
            name="machineSorter"
            value={form.machineSorter}
            onChange={onChange}
            placeholder="Select Machine"
            defaults={{ processType: "SORTING" }}
            providedItems={machineRows}
            filter={(item) => {
              const process = String(item.processType || item.machineType || "").toUpperCase();
              return !process || process.includes("SORT");
            }}
          />

          <ManufacturingInputTable
            title="Colour Sorter Input Materials"
            rows={sorterFeedRows}
            setRows={setSorterFeedRows}
            inventoryLots={inventoryLots}
            materialPlaceholder="Select Input Material"
            quantityLabel="Consume Qty"
            stage="SORTING"
            materialOptions={materialRows}
          />

          <ManufacturingOutputTable
            title="Colour Sorter Output Materials"
            rows={sorterOutputRows}
            setRows={setSorterOutputRows}
            materialPlaceholder="Select Output Material"
            stage="SORTING"
            materialOptions={materialRows}
          />

          <ManufacturingSummary
            totalInputKg={sorterSummary.totalInputKg}
            totalOutputKg={sorterSummary.totalOutputKg}
            recoveryPercent={sorterSummary.recoveryPercent}
            varianceKg={sorterSummary.varianceKg}
            difference={sorterSummary.difference}
          />
        </FormSection>

        <FormSection title="Extrusion">
          <Field label="Operator" name="extruderOperatorName" value={form.extruderOperatorName} onChange={onChange} />
          <Field label="Supervisor" name="extruderSupervisorName" value={form.extruderSupervisorName} onChange={onChange} />

          <FactorySelectField
            label="Machine"
            masterType="machine"
            name="machineExtruder"
            value={form.machineExtruder}
            onChange={onChange}
            placeholder="Select Machine"
            defaults={{ processType: "EXTRUSION" }}
            providedItems={machineRows}
            filter={(item) => {
              const process = String(item.processType || item.machineType || "").toUpperCase();
              return !process || process.includes("EXTRUSION") || process.includes("EXTRUDER");
            }}
          />

          <ManufacturingInputTable
            title="Extruder Feed Materials"
            rows={feedRows}
            setRows={setFeedRows}
            inventoryLots={inventoryLots}
            materialPlaceholder="Select Feed Material"
            quantityLabel="Consume Qty"
            stage="EXTRUSION"
            materialOptions={materialRows}
          />

          <Field label="Recovery / Rework %" value={recoveryMaterialPercent} readOnly />
          <Field label="Virgin %" value={virginRatioPercent} readOnly />
          <Field label="Battery %" value={batteryRatioPercent} readOnly />
          <Field label="Additive %" value={additiveRatioPercent} readOnly />

          <ManufacturingOutputTable
            title="Extrusion Output Materials"
            rows={extrusionOutputRows}
            setRows={setExtrusionOutputRows}
            materialPlaceholder="Select Output Material"
            stage="EXTRUSION"
            materialOptions={materialRows}
          />

          <ManufacturingSummary
            totalInputKg={totalFeedKg}
            totalOutputKg={extrusionTotalOutput}
            recoveryPercent={extrusionRecovery}
            varianceKg={extrusionVariance}
            difference={extrusionVariance.toFixed(2)}
          />
        </FormSection>



        <FormSection title="Downtime & Remarks">
          <Field
            label="Machine Running Hours"
            name="machineRunningHours"
            value={form.machineRunningHours}
            onChange={onChange}
          />

          <Field
            label="Downtime Hours"
            name="downtimeHours"
            value={form.downtimeHours}
            onChange={onChange}
          />

          <TextAreaField
            label="Downtime Reason"
            name="downtimeReason"
            value={form.downtimeReason}
            onChange={onChange}
          />

          <TextAreaField
            label="Remarks"
            name="remarks"
            value={form.remarks}
            onChange={onChange}
          />
        </FormSection>

        <div style={{ marginTop: 25 }}>
          <button type="submit" disabled={saving} style={saveButton}>
            {saving ? (saveStep || "Saving...") : "Save Shift Production Entry"}
          </button>
        </div>
      </form>
    </PageLayout>
  );
}

function ManufacturingSummary({
  totalInputKg,
  totalOutputKg,
  recoveryPercent,
  varianceKg,
  difference,
}) {
  return (
    <div style={summaryGrid}>
      <Field label="Total Input" value={`${Number(totalInputKg || 0).toFixed(2)} Kg`} readOnly />
      <Field label="Total Output" value={`${Number(totalOutputKg || 0).toFixed(2)} Kg`} readOnly />
      <Field label="Recovery %" value={recoveryPercent || ""} readOnly />
      <Field label="Variance Kg" value={Number(varianceKg || 0).toFixed(2)} readOnly />
      <Field label="Difference" value={`${difference || "0.00"} Kg`} readOnly />
    </div>
  );
}

function Field(props) {
  const { label, readOnly, ...inputProps } = props;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={labelStyle}>{label}</label>

      <input
        {...inputProps}
        readOnly={readOnly}
        style={{
          ...inputStyle,
          background: readOnly ? "#f8fafc" : "white",
          fontWeight: readOnly ? 700 : 400,
        }}
      />
    </div>
  );
}

function TextAreaField({ label, name, value, onChange, readOnly }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={labelStyle}>{label}</label>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        style={{
          ...textareaStyle,
          background: readOnly ? "#f8fafc" : "white",
          fontWeight: readOnly ? 700 : 400,
        }}
      />
    </div>
  );
}

function blankOutputRow() {
  return { material: "", qtyKg: "" };
}

function defaultOutputRowsFor(materialRows, stage) {
  const flag = dropdownFlagForContext(stage, "OUTPUT");
  const rows = (materialRows || [])
    .filter((row) => String(row.status || "ACTIVE").toUpperCase() === "ACTIVE")
    .filter((row) => !flag || isYes(row[flag]))
    .sort((a, b) => Number(a.sortOrder || 9999) - Number(b.sortOrder || 9999))
    .map((row) => ({
      material: row.materialName || row.name || row.materialCode || "",
      qtyKg: "",
    }))
    .filter((row) => row.material);

  return rows.length ? rows : [blankOutputRow()];
}

function isYes(value) {
  return ["YES", "TRUE", "Y", "1", "ON"].includes(String(value || "").toUpperCase());
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={labelStyle}>{label}</label>

      <select name={name} value={value} onChange={onChange} style={selectStyle}>
        <option value="">Select</option>

        {(options || []).map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function FactorySelectField({
  label,
  masterType,
  name,
  value,
  onChange,
  placeholder,
  filter,
  approvalRequired = false,
  defaults,
  providedItems,
}) {
  return (
    <FactoryDropdown
      label={label}
      masterType={masterType}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder || "Select"}
      style={selectStyle}
      filter={filter}
      allowAddNew
      approvalRequired={approvalRequired}
      defaults={defaults}
      providedItems={providedItems}
    />
  );
}

const labelStyle = {
  fontSize: 12,
  fontWeight: 700,
  color: "#334155",
};

const messageBox = {
  padding: 12,
  marginBottom: 15,
  borderRadius: 8,
  background: "#ecfdf5",
  border: "1px solid #86efac",
  color: "#166534",
  fontWeight: 700,
};

const summaryGrid = {
  gridColumn: "1 / -1",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 12,
  padding: 12,
  border: "1px solid #dbeafe",
  borderRadius: 10,
  background: "#f8fafc",
};

const inputStyle = {
  width: "100%",
  padding: 8,
  border: "1px solid #d1d5db",
  borderRadius: 6,
  boxSizing: "border-box",
};

const selectStyle = {
  ...inputStyle,
};

const textareaStyle = {
  ...inputStyle,
  minHeight: 80,
};

const saveButton = {
  background: "#0f766e",
  color: "white",
  border: "none",
  padding: "12px 24px",
  borderRadius: 8,
  fontWeight: 700,
  cursor: "pointer",
};
