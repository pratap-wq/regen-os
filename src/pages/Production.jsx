import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";
import FormSection from "../components/FormSection";
import InventoryFeedTable from "../components/InventoryFeedTable";
import FactoryDropdown from "../components/FactoryDropdown";
import { KpiCard, PageLayout } from "../components/factoryDesignSystem";
import { generateExtrusionBatchId } from "../utils/idGenerator";
import { buildInventoryLots } from "../utils/inventoryLots";
import { buildAvailabilityMap, materialKey } from "../utils/materialInventory";

export default function Production() {
  const today = new Date().toISOString().split("T")[0];
  const currentMonth = new Date().toISOString().slice(0, 7);

  const blankFeedRow = {
    sourceType: "",
    materialType: "",
    qtyKg: "",
  };

  const blank = {
    date: today,
    shift: "A",

    machineRunningHours: "",
    downtimeHours: "",
    downtimeReason: "",

    washOperatorName: "",
    washSupervisorName: "",
    sorterOperatorName: "",
    sorterSupervisorName: "",
    extruderOperatorName: "",
    extruderSupervisorName: "",

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
    commodityKg: "",
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
  const [washFeedRows, setWashFeedRows] = useState([{ ...blankFeedRow }]);
  const [sorterFeedRows, setSorterFeedRows] = useState([{ ...blankFeedRow }]);
  const [feedRows, setFeedRows] = useState([{ ...blankFeedRow }]);

  const [rmRows, setRmRows] = useState([]);
  const [washRows, setWashRows] = useState([]);
  const [sortingRows, setSortingRows] = useState([]);
  const [extrusionRows, setExtrusionRows] = useState([]);
  const [dispatchRows, setDispatchRows] = useState([]);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadMasters();
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

  async function loadMasters() {
    try {
      const [
        rmData,
        washData,
        sortingData,
        extrusionData,
        dispatchData,
      ] = await Promise.all([
        safeList("rm.list"),
        safeList("wash.list"),
        safeList("sorting.list"),
        safeList("extrusion.list"),
        safeList("dispatch.list"),
      ]);

      setRmRows(rmData);
      setWashRows(washData);
      setSortingRows(sortingData);
      setExtrusionRows(extrusionData);
      setDispatchRows(dispatchData);
    } catch (err) {
      setMessage(err.message);
    }
  }

  const inventoryLots = useMemo(() => {
    return buildInventoryLots({
      rmRows,
      washRows,
      sortingRows,
      extrusionRows,
      dispatchRows,
    });
  }, [rmRows, washRows, sortingRows, extrusionRows, dispatchRows]);

  function n(v) {
    return Number(v || 0);
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
    setWashFeedRows([{ ...blankFeedRow }]);
    setSorterFeedRows([{ ...blankFeedRow }]);
    setFeedRows([{ ...blankFeedRow }]);
  }

  function cleanRows(rows) {
    return rows.filter((r) => (r.materialType || r.sourceType) && n(r.qtyKg) > 0);
  }

  function cleanWashRows() {
    return cleanRows(washFeedRows);
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

  const washLoss =
    n(form.dustKg) +
    n(form.sinkMaterialKg) +
    n(form.microPlasticKg) +
    n(form.wrappersKg) +
    n(form.sludgeKg) +
    n(form.raffiaKg);

  const washRecovery =
    washFeedTotalKg() > 0
      ? ((n(form.washedOutputKg) / washFeedTotalKg()) * 100).toFixed(2)
      : "";

  const washVariance =
    washFeedTotalKg() - n(form.washedOutputKg) - washLoss;

  const sorterRecoverable =
    n(form.whiteSortedKg) +
    n(form.allMixSortedKg) +
    n(form.commodityKg) +
    n(form.whiteGreyKg);

  const sorterRecovery =
    sorterFeedTotalKg() > 0
      ? ((sorterRecoverable / sorterFeedTotalKg()) * 100).toFixed(2)
      : "";

  const sorterVariance =
    sorterFeedTotalKg() - sorterRecoverable - n(form.sorterRejectKg);

  const totalFeedKg = feedTotalKg();

  const extrusionRecoverable =
    n(form.fgOutputKg) +
    n(form.lumpsKg) +
    n(form.purgingKg) +
    n(form.reworkGranulesKg);

  const extrusionNonRecoverable =
    n(form.rejectKg) +
    n(form.vacuumRejectKg) +
    n(form.meshRejectKg) +
    n(form.floorSpillageKg);

  const extrusionTotalOutput = extrusionRecoverable + extrusionNonRecoverable;
  const extrusionVariance = totalFeedKg - extrusionTotalOutput;

  const extrusionRecovery =
    totalFeedKg > 0
      ? ((n(form.fgOutputKg) / totalFeedKg) * 100).toFixed(2)
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

  
 
  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      let washBatchId = "";
      let sortingBatchId = "";
      const finalWashRows = cleanWashRows();
      const washTotalKg = washFeedTotalKg();
      const finalSorterRows = cleanSorterRows();
      const sorterTotalKg = sorterFeedTotalKg();

      if (washTotalKg > 0 || n(form.washedOutputKg) > 0 || washLoss > 0) {
        if (finalWashRows.length === 0 || washTotalKg <= 0) {
          setMessage("Wash: add at least one input material with consume quantity.");
          setSaving(false);
          return;
        }

        const washValidation = validateMaterialRows(washFeedRows, "Wash");
        if (washValidation) {
          setMessage(washValidation);
          setSaving(false);
          return;
        }

        const wash = await apiCall({
          fn: "wash.add",
          date: form.date,
          shift: form.shift,
          machine: form.machineWash,
          inputMaterial: washFeedSummary(),
          inputWeightKg: washTotalKg,
          feedComposition: JSON.stringify(finalWashRows),
          washedOutputKg: form.washedOutputKg,
          dustKg: form.dustKg,
          sinkMaterialKg: form.sinkMaterialKg,
          microPlasticKg: form.microPlasticKg,
          wrappersKg: form.wrappersKg,
          sludgeKg: form.sludgeKg,
          raffiaKg: form.raffiaKg,
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
          
        });

        washBatchId = wash.washBatchId || "";
      }

      if (sorterTotalKg > 0 || sorterRecoverable > 0 || n(form.sorterRejectKg) > 0) {
        if (finalSorterRows.length === 0 || sorterTotalKg <= 0) {
          setMessage("Colour Sorter: add at least one input material with consume quantity.");
          setSaving(false);
          return;
        }

        const sortingValidation = validateMaterialRows(sorterFeedRows, "Colour Sorter");
        if (sortingValidation) {
          setMessage(sortingValidation);
          setSaving(false);
          return;
        }

        const sorting = await apiCall({
          fn: "sorting.add",
          sourceWashBatchId: washBatchId,
          date: form.date,
          shift: form.shift,
          machine: form.machineSorter,
          inputMaterial: sorterFeedSummary(),
          inputWeightKg: sorterTotalKg,
          feedComposition: JSON.stringify(finalSorterRows),
          acceptedQtyKg: sorterRecoverable,
          whiteSortedKg: form.whiteSortedKg,
          allMixSortedKg: form.allMixSortedKg,
          commodityKg: form.commodityKg,
          whiteGreyKg: form.whiteGreyKg,
          rejectedQtyKg: form.sorterRejectKg,
          sorterVarianceKg: sorterVariance,
          recoveryPercent: sorterRecovery,
          status: "READY_FOR_EXTRUSION",
          nextProcess: "Extrusion",
          operatorName: form.sorterOperatorName,
          supervisorName: form.sorterSupervisorName,
          remarks: form.remarks,
          createdBy: "Production Screen",
          
        });

        sortingBatchId = sorting.sortingBatchId || "";
      }

      const finalFeedRows = cleanFeedRows();

      if (totalFeedKg > 0 || n(form.fgOutputKg) > 0) {
        if (finalFeedRows.length === 0) {
          setMessage("Add at least one inventory lot in extruder feed.");
          setSaving(false);
          return;
        }

        const extrusionValidation = validateMaterialRows(feedRows, "Extrusion");
        if (extrusionValidation) {
          setMessage(extrusionValidation);
          setSaving(false);
          return;
        }

        if (!form.productionGrade) {
          setMessage("Select Production Grade before saving extrusion.");
          setSaving(false);
          return;
        }

        const finalExtrusionBatchId =
          form.extrusionBatchId || buildExtrusionBatchId(form);

        if (!finalExtrusionBatchId) {
          setMessage("Production Batch ID could not be generated.");
          setSaving(false);
          return;
        }

        await apiCall({
          fn: "extrusion.add",
          extrusionBatchId: finalExtrusionBatchId,
          date: form.date,
          shift: form.shift,
          periodMonth: currentMonth,
          machine: form.machineExtruder,
          sourceType: "PRODUCTION_SHIFT",
          sourceSortingBatchId: sortingBatchId,
          sourceWashBatchId: washBatchId,
          inputMaterial: feedSummary(),
          inputWeightKg: totalFeedKg,
          feedComposition: JSON.stringify(finalFeedRows),
          totalInputKg: totalFeedKg,
          fgOutputKg: form.fgOutputKg,
          lumpsKg: form.lumpsKg,
          purgingKg: form.purgingKg,
          reworkGranulesKg: form.reworkGranulesKg,
          rejectKg: form.rejectKg,
          vacuumRejectKg: form.vacuumRejectKg,
          meshRejectKg: form.meshRejectKg,
          floorSpillageKg: form.floorSpillageKg,
          totalRecoverableKg: extrusionRecoverable,
          totalNonRecoverableKg: extrusionNonRecoverable,
          totalOutputKg: extrusionTotalOutput,
          varianceKg: extrusionVariance,
          recoveryPercent: extrusionRecovery,
          recoveryMaterialPercent,
          virginRatioPercent,
          batteryRatioPercent,
          additiveRatioPercent,
          productionGrade: form.productionGrade,
          operatorName: form.extruderOperatorName,
          supervisorName: form.extruderSupervisorName,
          remarks: form.remarks,
          nextProcess: "Dispatch",
          status: "READY_FOR_DISPATCH",
          createdBy: "Production Screen",
          
        });
      }

      if (
        washTotalKg <= 0 &&
        sorterTotalKg <= 0 &&
        totalFeedKg <= 0 &&
        n(form.fgOutputKg) <= 0
      ) {
        setMessage("Enter wash, sorting or extrusion data before saving.");
        setSaving(false);
        return;
      }

      setMessage("Shift production entry saved successfully.");
      await loadMasters();
      resetForm();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageLayout
      title="Production Entry"
      subtitle="One shift entry screen for Washline, Colour Sorter and Extrusion. Raw Material and Finished Goods quality testing is performed separately in the Quality Workbench."
    >
      <div className="factory-kpi-grid">
        <KpiCard title="Wash Recovery" value={washRecovery ? `${washRecovery}%` : "—"} tone={washRecovery ? "positive" : "neutral"} />
        <KpiCard title="Sorting Recovery" value={sorterRecovery ? `${sorterRecovery}%` : "—"} tone={sorterRecovery ? "positive" : "neutral"} />
        <KpiCard title="Extrusion Recovery" value={extrusionRecovery ? `${extrusionRecovery}%` : "—"} tone={extrusionRecovery ? "positive" : "neutral"} />
        <KpiCard title="Total Feed" value={`${totalFeedKg.toFixed(0)} Kg`} tone="neutral" />
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
            filter={(item) => {
              const process = String(item.processType || item.machineType || "").toUpperCase();
              return !process || process.includes("WASH");
            }}
          />

          <InventoryFeedTable
            title="Wash Input Materials"
            rows={washFeedRows}
            setRows={setWashFeedRows}
            inventoryLots={inventoryLots}
            materialPlaceholder="Select Input Material"
            quantityLabel="Consume Qty"
            filterCategories={["RM", "WIP", "REWORK", "ADDITIVE"]}
          />

          <Field label="Total Wash Input Kg" value={washFeedTotalKg().toFixed(2)} readOnly />
          <Field label="Washed Output Kg" name="washedOutputKg" value={form.washedOutputKg} onChange={onChange} />
          <Field label="Dust Kg" name="dustKg" value={form.dustKg} onChange={onChange} />
          <Field label="Sink Material Kg" name="sinkMaterialKg" value={form.sinkMaterialKg} onChange={onChange} />
          <Field label="Micro Plastic Kg" name="microPlasticKg" value={form.microPlasticKg} onChange={onChange} />
          <Field label="Wrappers Kg" name="wrappersKg" value={form.wrappersKg} onChange={onChange} />
          <Field label="Sludge Kg" name="sludgeKg" value={form.sludgeKg} onChange={onChange} />
          <Field label="Raffia Kg" name="raffiaKg" value={form.raffiaKg} onChange={onChange} />
          <Field label="Wash Recovery %" value={washRecovery} readOnly />
          <Field label="Wash Variance Kg" value={washVariance.toFixed(2)} readOnly />
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
            filter={(item) => {
              const process = String(item.processType || item.machineType || "").toUpperCase();
              return !process || process.includes("SORT");
            }}
          />

          <InventoryFeedTable
            title="Colour Sorter Input Materials"
            rows={sorterFeedRows}
            setRows={setSorterFeedRows}
            inventoryLots={inventoryLots}
            materialPlaceholder="Select Input Material"
            quantityLabel="Consume Qty"
            filterCategories={["RM", "WIP", "REWORK", "ADDITIVE"]}
          />

          <Field label="Total Sorter Input Kg" value={sorterFeedTotalKg().toFixed(2)} readOnly />
          <Field label="White Kg" name="whiteSortedKg" value={form.whiteSortedKg} onChange={onChange} />
          <Field label="All Mix Kg" name="allMixSortedKg" value={form.allMixSortedKg} onChange={onChange} />
          <Field label="Commodity Kg" name="commodityKg" value={form.commodityKg} onChange={onChange} />
          <Field label="White Grey Kg" name="whiteGreyKg" value={form.whiteGreyKg} onChange={onChange} />
          <Field label="Reject Kg" name="sorterRejectKg" value={form.sorterRejectKg} onChange={onChange} />
          <Field label="Sorter Recovery %" value={sorterRecovery} readOnly />
          <Field label="Sorter Variance Kg" value={sorterVariance.toFixed(2)} readOnly />
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
            filter={(item) => {
              const process = String(item.processType || item.machineType || "").toUpperCase();
              return !process || process.includes("EXTRUSION") || process.includes("EXTRUDER");
            }}
          />

          <FactorySelectField
            label="Production Grade"
            masterType="material"
            name="productionGrade"
            value={form.productionGrade}
            onChange={onChange}
            placeholder="Select Grade"
            approvalRequired
            defaults={{ category: "FG", unit: "Kg" }}
            filter={(item) =>
              ["FG", "WIP", "WASTE", "REWORK"].includes(
                String(item.category || item.materialType || "").toUpperCase()
              )
            }
          />

          <Field
            label="Production Batch ID"
            value={form.extrusionBatchId}
            readOnly
          />

          <InventoryFeedTable
            title="Extruder Feed Materials"
            rows={feedRows}
            setRows={setFeedRows}
            inventoryLots={inventoryLots}
            materialPlaceholder="Select Feed Material"
            quantityLabel="Consume Qty"
            filterCategories={["RM", "WIP", "REWORK", "ADDITIVE"]}
          />

          <Field label="Total Feed Kg" value={totalFeedKg.toFixed(2)} readOnly />
          <Field label="Recovery / Rework %" value={recoveryMaterialPercent} readOnly />
          <Field label="Virgin %" value={virginRatioPercent} readOnly />
          <Field label="Battery %" value={batteryRatioPercent} readOnly />
          <Field label="Additive %" value={additiveRatioPercent} readOnly />
          <TextAreaField label="Feed Summary" value={feedSummary()} readOnly />

          <Field label="FG Output Kg" name="fgOutputKg" value={form.fgOutputKg} onChange={onChange} />
          <Field label="Lumps Kg" name="lumpsKg" value={form.lumpsKg} onChange={onChange} />
          <Field label="Purging Kg" name="purgingKg" value={form.purgingKg} onChange={onChange} />
          <Field label="Rework Granules Kg" name="reworkGranulesKg" value={form.reworkGranulesKg} onChange={onChange} />
          <Field label="Reject Kg" name="rejectKg" value={form.rejectKg} onChange={onChange} />
          <Field label="Vacuum Reject Kg" name="vacuumRejectKg" value={form.vacuumRejectKg} onChange={onChange} />
          <Field label="Mesh Reject Kg" name="meshRejectKg" value={form.meshRejectKg} onChange={onChange} />
          <Field label="Floor Spillage Kg" name="floorSpillageKg" value={form.floorSpillageKg} onChange={onChange} />
          <Field label="FG Recovery %" value={extrusionRecovery} readOnly />
          <Field label="Extrusion Variance Kg" value={extrusionVariance.toFixed(2)} readOnly />
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
            {saving ? "Saving..." : "Save Shift Production Entry"}
          </button>
        </div>
      </form>
    </PageLayout>
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
