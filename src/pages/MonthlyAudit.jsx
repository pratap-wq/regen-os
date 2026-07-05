import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiCall } from "../api/api";
import MonthlySummary from "../components/MonthlySummary";
import InventoryReconciliation from "../components/InventoryReconciliation";
import MaterialFlowSummary from "../components/MaterialFlowSummary";
import WasteAnalysis from "../components/WasteAnalysis";
import CostAnalysis from "../components/CostAnalysis";
import ProfitabilitySummary from "../components/ProfitabilitySummary";
import CloseChecklist from "../components/CloseChecklist";
import { calculateMonthClose } from "../services/monthCloseEngine";
import { getPhysicalCount, savePhysicalCount } from "../services/physicalCountService";

export default function MonthlyAudit() {
  const navigate = useNavigate();
  const now = new Date();

  const [month, setMonth] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  );

  const [rows, setRows] = useState({
    rm: [],
    wash: [],
    sorting: [],
    extrusion: [],
    dispatch: [],
    storesInward: [],
    storesIssue: [],
    factoryExpenses: [],
    factoryCostMaster: [],
    storesMaster: [],
  });

  const [adjustments, setAdjustments] = useState([]);

  const [physical, setPhysical] = useState({
    rmPhysicalKg: "",
    washPhysicalKg: "",
    sortingPhysicalKg: "",
    fgPhysicalKg: "",
    storesPhysicalValue: "",
    productionSignoff: "",
    storesSignoff: "",
    accountsSignoff: "",
    qcSignoff: "",
    ceoSignoff: "Pratap",
    remarks: "",
  });

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
    loadPhysicalCount();
  }, [month]);

  async function safeLoad(fn, extra = {}) {
    try {
      const res = await apiCall({ fn, ...extra });
      return res.rows || [];
    } catch (err) {
      console.log(fn, err);
      return [];
    }
  }

  async function loadPhysicalCount() {
    try {
      const res = await getPhysicalCount(month);

      if (res?.ok && res.row) {
        setPhysical((prev) => ({
          ...prev,
          rmPhysicalKg: res.row.rmPhysicalKg ?? "",
          washPhysicalKg: res.row.washPhysicalKg ?? "",
          sortingPhysicalKg: res.row.sortingPhysicalKg ?? "",
          fgPhysicalKg: res.row.fgPhysicalKg ?? "",
          storesPhysicalValue: res.row.storesPhysicalValue ?? "",
          productionSignoff: res.row.productionSignoff ?? "",
          storesSignoff: res.row.storesSignoff ?? "",
          accountsSignoff: res.row.accountsSignoff ?? "",
          qcSignoff: res.row.qcSignoff ?? "",
          ceoSignoff: res.row.ceoSignoff || "Pratap",
          remarks: res.row.remarks ?? "",
        }));
      }
    } catch (err) {
      console.log("physicalCounts.get", err);
    }
  }

  async function savePhysicalStock() {
    try {
      setStatus("Saving physical stock count...");

      const res = await savePhysicalCount(month, {
        ...physical,
        savedBy: physical.ceoSignoff || "System",
      });

      if (!res?.ok) {
        setStatus(res?.error || "Failed to save physical stock.");
        return;
      }

      setStatus("Physical stock saved successfully.");
      await loadPhysicalCount();
      await loadData();
    } catch (err) {
      setStatus(err.message || "Failed to save physical stock.");
    }
  }

  async function loadData() {
    setLoading(true);
    setStatus("");

    const [
      rm,
      wash,
      sorting,
      extrusion,
      dispatch,
      storesInward,
      storesIssue,
      factoryExpenses,
      factoryCostMaster,
      storesMaster,
      adjustmentRows,
    ] = await Promise.all([
      safeLoad("rm.list"),
      safeLoad("wash.list"),
      safeLoad("sorting.list"),
      safeLoad("extrusion.list"),
      safeLoad("dispatch.list"),
      safeLoad("storesInward.list"),
      safeLoad("storesIssue.list"),
      safeLoad("factoryExpenses.list"),
      safeLoad("factoryCostMaster.list"),
      safeLoad("storesMaster.list"),
      safeLoad("inventoryAdjustments.list", { periodMonth: month }),
    ]);

    setRows({
      rm,
      wash,
      sorting,
      extrusion,
      dispatch,
      storesInward,
      storesIssue,
      factoryExpenses,
      factoryCostMaster,
      storesMaster,
    });

    setAdjustments(adjustmentRows);
    setLoading(false);
  }

  const close = useMemo(() => {
    return calculateMonthClose({
      rmRows: rows.rm,
      washRows: rows.wash,
      sortingRows: rows.sorting,
      extrusionRows: rows.extrusion,
      dispatchRows: rows.dispatch,
      storesIssueRows: rows.storesIssue,
      factoryExpenseRows: rows.factoryExpenses,
      factoryCostMasterRows: rows.factoryCostMaster,
      storesMasterRows: rows.storesMaster,
      periodMonth: month,
    });
  }, [rows, month]);

  const materialLines = useMemo(() => {
    const baseLines = [
      {
        key: "RM|RM",
        stage: "RM",
        module: "RM",
        itemType: "RM",
        itemCode: "RM",
        systemKg: close.inventory.rmClosingKg,
        physicalKg: physical.rmPhysicalKg,
      },
      {
        key: "WASHED|Washed Flakes",
        stage: "Wash WIP",
        module: "Wash",
        itemType: "WASHED",
        itemCode: "Washed Flakes",
        systemKg: close.inventory.washClosingKg,
        physicalKg: physical.washPhysicalKg,
      },
      {
        key: "SORTED|Sorted Material",
        stage: "Sorting WIP",
        module: "Color Sorter",
        itemType: "SORTED",
        itemCode: "Sorted Material",
        systemKg: close.inventory.sortingClosingKg,
        physicalKg: physical.sortingPhysicalKg,
      },
      {
        key: "FG|E1",
        stage: "Finished Goods",
        module: "FG",
        itemType: "FG",
        itemCode: "E1",
        systemKg: close.inventory.fgClosingKg,
        physicalKg: physical.fgPhysicalKg,
      },
    ];

    return baseLines.map((line) => {
      const related = adjustments.filter(
        (a) =>
          String(a.periodMonth || "") === String(month) &&
          String(a.itemType || "").toUpperCase() ===
            String(line.itemType || "").toUpperCase()
      );

      const approvedAdjustmentKg = related
        .filter((a) => String(a.status || "").toUpperCase() === "APPROVED")
        .reduce((s, a) => s + num(a.quantityKg), 0);

      const pendingAdjustmentKg = related
        .filter((a) =>
          ["DRAFT", "SUBMITTED", "PENDING"].includes(
            String(a.status || "").toUpperCase()
          )
        )
        .reduce((s, a) => s + num(a.quantityKg), 0);

      const hasPhysical = String(line.physicalKg || "") !== "";
      const physicalKg = num(line.physicalKg);
      const varianceKg = hasPhysical ? physicalKg - num(line.systemKg) : 0;
      const remainingKg = varianceKg + approvedAdjustmentKg;

      let statusText = "Physical Pending";
      let statusType = "pending";

      if (hasPhysical) {
        if (Math.abs(remainingKg) <= 0.01) {
          statusText = "Reconciled";
          statusType = "success";
        } else if (Math.abs(pendingAdjustmentKg) > 0.01) {
          statusText = "Adjustment Pending";
          statusType = "warning";
        } else {
          statusText = "Investigation Required";
          statusType = "danger";
        }
      }

      return {
        ...line,
        related,
        hasPhysical,
        physicalKg,
        varianceKg,
        approvedAdjustmentKg,
        pendingAdjustmentKg,
        remainingKg,
        statusText,
        statusType,
      };
    });
  }, [close, physical, adjustments, month]);

  const materialReady = materialLines.every(
    (x) => x.statusType === "success"
  );

  const exceptions = useMemo(() => {
    const list = [];

    if (close.rm.purchasedKg <= 0) {
      list.push({ type: "danger", text: "No RM inward entries found." });
    }

    if (close.production.fgProducedKg <= 0) {
      list.push({ type: "danger", text: "No FG production found." });
    }

    if (close.production.dispatchKg <= 0) {
      list.push({ type: "warning", text: "No dispatch records found." });
    }

    if (
      close.production.overallRecovery > 0 &&
      close.production.overallRecovery < 85
    ) {
      list.push({
        type: "danger",
        text: `Overall recovery is low at ${formatPercent(
          close.production.overallRecovery
        )}.`,
      });
    }

    materialLines.forEach((line) => {
      if (line.statusType === "danger") {
        list.push({
          type: "warning",
          text: `${line.stage} variance is ${formatKg(
            line.remainingKg
          )}. Create an inventory adjustment.`,
        });
      }

      if (line.statusType === "warning") {
        list.push({
          type: "warning",
          text: `${line.stage} has pending adjustment approval.`,
        });
      }
    });

    if (close.profitability.manufacturingProfit < 0) {
      list.push({
        type: "danger",
        text: "Manufacturing profit is negative.",
      });
    }

    if (list.length === 0) {
      list.push({
        type: "success",
        text: "No major exceptions detected. Month appears ready for close.",
      });
    }

    return list;
  }, [close, materialLines]);

  const hasPhysicalStock = materialLines.every((x) => x.hasPhysical);

  const readyToClose =
    exceptions.filter((e) => e.type === "danger").length === 0 &&
    hasPhysicalStock &&
    materialReady &&
    physical.ceoSignoff.trim();

  function onPhysicalChange(e) {
    const { name, value } = e.target;
    setPhysical((p) => ({ ...p, [name]: value }));
  }

  function goToAdjustment(line) {
    navigate("/inventory-adjustments", {
      state: {
        periodMonth: month,
        module: line.module,
        itemType: line.itemType,
        itemCode: line.itemCode,
        quantityKg: line.remainingKg * -1,
        adjustmentType: "Physical Count",
        reason: "Physical stock mismatch",
        sourceRef: `Monthly Close ${month}`,
      },
    });
  }

  async function closeMonth() {
    if (!readyToClose) {
      setStatus(
        "Cannot close month. Complete physical stock, reconcile material accountability, clear critical exceptions and sign off."
      );
      return;
    }

    const ok = window.confirm(`Close ${month}? This will save the snapshot.`);
    if (!ok) return;

    try {
      setStatus("Saving month close snapshot...");

      const payload = {
        fn: "monthClose.add",
        periodMonth: month,
        status: "Closed",

        rmInwardKg: close.rm.purchasedKg,
        rmValue: close.rm.value,
        avgRmPrice: close.rm.avgRate,

        washInputKg: close.production.washInputKg,
        washedOutputKg: close.production.washedOutputKg,
        sortingInputKg: close.production.sortingInputKg,
        sortingAcceptedKg: close.production.sortingAcceptedKg,
        extrusionInputKg: close.production.extrusionInputKg,
        fgProducedKg: close.production.fgProducedKg,
        dispatchKg: close.production.dispatchKg,

        productionTon: close.production.fgProducedKg / 1000,
        dispatchTon: close.production.dispatchKg / 1000,
        salesValue: close.profitability.salesValue,
        salesPerKg:
          close.production.dispatchKg > 0
            ? close.profitability.salesValue / close.production.dispatchKg
            : 0,

        washRecovery: close.production.washRecovery,
        sortingRecovery: close.production.sortingRecovery,
        extrusionRecovery: close.production.extrusionRecovery,
        overallRecovery: close.production.overallRecovery,

        rmSystemClosingKg: close.inventory.rmClosingKg,
        washSystemClosingKg: close.inventory.washClosingKg,
        sortingSystemClosingKg: close.inventory.sortingClosingKg,
        fgSystemClosingKg: close.inventory.fgClosingKg,

        rmPhysicalKg: physical.rmPhysicalKg,
        washPhysicalKg: physical.washPhysicalKg,
        sortingPhysicalKg: physical.sortingPhysicalKg,
        fgPhysicalKg: physical.fgPhysicalKg,
        storesPhysicalValue: physical.storesPhysicalValue,

        rmVarianceKg: getLineVariance(materialLines, "RM"),
        washVarianceKg: getLineVariance(materialLines, "Wash WIP"),
        sortingVarianceKg: getLineVariance(materialLines, "Sorting WIP"),
        fgVarianceKg: getLineVariance(materialLines, "Finished Goods"),

        factoryExpenses: close.costs.factoryExpenseValue,
        storesIssueQty: close.costs.storesIssueValue,
        estimatedRmConsumedValue: close.costs.estimatedRmConsumedValue,
        conversionCost: close.costs.conversionCost,
        grossProfit: close.profitability.grossProfit,
        manufacturingProfit: close.profitability.manufacturingProfit,
        profitPerKg: close.profitability.profitPerKg,
        processingCostPerKg: close.profitability.conversionCostPerKg,

        productionSignoff: physical.productionSignoff,
        storesSignoff: physical.storesSignoff,
        accountsSignoff: physical.accountsSignoff,
        qcSignoff: physical.qcSignoff,
        ceoSignoff: physical.ceoSignoff,
        remarks: physical.remarks,
        exceptions: JSON.stringify(exceptions),
      };

      const res = await apiCall(payload);

      if (res.ok) {
        setStatus("Month close snapshot saved successfully.");
      } else {
        setStatus(res.error || "Month close failed.");
      }
    } catch (err) {
      setStatus(err.message || "Month close failed.");
    }
  }

  return (
    <div style={page}>
      <div style={header}>
        <div>
          <div style={eyebrow}>RegenOS Month-End Control</div>
          <h1 style={title}>Monthly Close</h1>
          <div style={subtitle}>
            Review, reconcile, approve and close the month with full kg and rupee accountability.
          </div>
        </div>

        <div style={headerActions}>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            style={input}
          />
          <button onClick={loadData} style={secondaryButton}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      <div style={statusBanner(readyToClose)}>
        <div>
          <div style={{ fontSize: 13, opacity: 0.8 }}>Close Status</div>
          <div style={{ fontSize: 26, fontWeight: 900 }}>
            {readyToClose ? "READY TO CLOSE" : "REVIEW REQUIRED"}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 13, opacity: 0.8 }}>Selected Month</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>
            {monthLabel(month)}
          </div>
        </div>
      </div>

      <MonthCloseWorkflow
        materialLines={materialLines}
        hasPhysicalStock={hasPhysicalStock}
        materialReady={materialReady}
        exceptions={exceptions}
        physical={physical}
        readyToClose={readyToClose}
        goToAdjustment={goToAdjustment}
        navigate={navigate}
      />

      <MonthlySummary close={close} />

      <Panel title="Material Accountability">
        <div style={accountabilityTop}>
          <StatusPill label="Reconciled" count={materialLines.filter((x) => x.statusType === "success").length} type="success" />
          <StatusPill label="Pending" count={materialLines.filter((x) => x.statusType === "warning" || x.statusType === "pending").length} type="warning" />
          <StatusPill label="Investigation" count={materialLines.filter((x) => x.statusType === "danger").length} type="danger" />
        </div>

        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                {[
                  "Stage",
                  "System Kg",
                  "Physical Kg",
                  "Variance",
                  "Approved Adj.",
                  "Pending Adj.",
                  "Remaining",
                  "Status",
                  "Action",
                ].map((h) => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {materialLines.map((line) => (
                <tr key={line.key}>
                  <td style={td}><b>{line.stage}</b></td>
                  <td style={td}>{formatKg(line.systemKg)}</td>
                  <td style={td}>{line.hasPhysical ? formatKg(line.physicalKg) : "Enter below"}</td>
                  <td style={td}>{line.hasPhysical ? formatKg(line.varianceKg) : "-"}</td>
                  <td style={td}>{formatKg(line.approvedAdjustmentKg)}</td>
                  <td style={td}>{formatKg(line.pendingAdjustmentKg)}</td>
                  <td style={td}><b>{line.hasPhysical ? formatKg(line.remainingKg) : "-"}</b></td>
                  <td style={td}>
                    <span style={pill(line.statusType)}>{line.statusText}</span>
                  </td>
                  <td style={td}>
                    {line.statusType === "danger" ? (
                      <button style={miniButton} onClick={() => goToAdjustment(line)}>
                        Create Adjustment
                      </button>
                    ) : line.statusType === "warning" ? (
                      <button style={miniDarkButton} onClick={() => navigate("/inventory-adjustments")}>
                        View / Approve
                      </button>
                    ) : line.statusType === "pending" ? (
                      <span style={{ color: "#64748b" }}>Enter physical stock</span>
                    ) : (
                      <span style={{ color: "#15803d", fontWeight: 800 }}>OK</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={hintBox}>
          Monthly Close only reviews differences. Corrections must be entered through Inventory Adjustments, then approved and posted to the inventory ledger. Physical count corrections are saved as new audit snapshots.
        </div>
      </Panel>

      <InventoryReconciliation close={close} />
      <MaterialFlowSummary data={materialFlowData(close)} />
      <WasteAnalysis close={close} />
      <CostAnalysis close={close} />
      <ProfitabilitySummary close={close} />
      <CloseChecklist close={close} />

      <Panel title="Exceptions">
        <div style={{ display: "grid", gap: 10 }}>
          {exceptions.map((item, index) => (
            <div key={index} style={exceptionStyle(item.type)}>
              {item.type === "success" ? "✅" : item.type === "danger" ? "🚨" : "⚠️"}{" "}
              {item.text}
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Physical Stock & Sign-Off">
        <div style={approvalGrid}>
          <InputBox label="Physical RM Kg" name="rmPhysicalKg" value={physical.rmPhysicalKg} onChange={onPhysicalChange} type="number" />
          <InputBox label="Physical Wash WIP Kg" name="washPhysicalKg" value={physical.washPhysicalKg} onChange={onPhysicalChange} type="number" />
          <InputBox label="Physical Sorting WIP Kg" name="sortingPhysicalKg" value={physical.sortingPhysicalKg} onChange={onPhysicalChange} type="number" />
          <InputBox label="Physical FG Kg" name="fgPhysicalKg" value={physical.fgPhysicalKg} onChange={onPhysicalChange} type="number" />
          <InputBox label="Production Manager" name="productionSignoff" value={physical.productionSignoff} onChange={onPhysicalChange} />
          <InputBox label="Stores" name="storesSignoff" value={physical.storesSignoff} onChange={onPhysicalChange} />
          <InputBox label="Accounts" name="accountsSignoff" value={physical.accountsSignoff} onChange={onPhysicalChange} />
          <InputBox label="QC" name="qcSignoff" value={physical.qcSignoff} onChange={onPhysicalChange} />
          <InputBox label="CEO Approval" name="ceoSignoff" value={physical.ceoSignoff} onChange={onPhysicalChange} />
        </div>

        <div style={{ marginTop: 16 }}>
          <label style={label}>CEO / Management Remarks</label>
          <textarea
            name="remarks"
            value={physical.remarks}
            onChange={onPhysicalChange}
            style={textarea}
            placeholder="Enter closing remarks, adjustment reasons, or action items."
          />
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={savePhysicalStock} style={closeButton}>
            SAVE / UPDATE PHYSICAL STOCK
          </button>

          <button onClick={loadPhysicalCount} style={secondaryButton}>
            RELOAD SAVED COUNT
          </button>
        </div>
      </Panel>

      <div style={closePanel}>
        <div>
          <h2 style={{ margin: 0 }}>Close Month Snapshot</h2>
          <div style={{ color: "#64748b", marginTop: 6 }}>
            Close is allowed only after material accountability is reconciled.
          </div>
        </div>

        <button
          onClick={closeMonth}
          style={readyToClose ? closeButton : disabledCloseButton}
        >
          CLOSE MONTH
        </button>
      </div>

      {status && <div style={statusStyle}>{status}</div>}
    </div>
  );
}


function MonthCloseWorkflow({
  materialLines,
  hasPhysicalStock,
  materialReady,
  exceptions,
  physical,
  readyToClose,
  goToAdjustment,
  navigate,
}) {
  const pendingAdjustments = materialLines.filter((x) => x.statusType === "warning").length;
  const needsAction = materialLines.filter((x) => x.statusType === "danger").length;
  const physicalPending = materialLines.filter((x) => !x.hasPhysical).length;
  const criticalExceptions = exceptions.filter((x) => x.type === "danger").length;

  const approvalsDone =
    String(physical.productionSignoff || "").trim() &&
    String(physical.storesSignoff || "").trim() &&
    String(physical.accountsSignoff || "").trim() &&
    String(physical.qcSignoff || "").trim() &&
    String(physical.ceoSignoff || "").trim();

  const steps = [
    {
      label: "Physical Stock",
      status: hasPhysicalStock ? "Complete" : "Pending",
      type: hasPhysicalStock ? "success" : "warning",
      action: hasPhysicalStock ? "None" : "Enter and save physical stock below",
    },
    {
      label: "Material Reconciliation",
      status: materialReady ? "Reconciled" : needsAction > 0 ? "Difference Found" : "Pending Approval",
      type: materialReady ? "success" : needsAction > 0 ? "danger" : "warning",
      action: materialReady ? "None" : needsAction > 0 ? "Create adjustment" : "Approve pending adjustment",
    },
    {
      label: "Critical Exceptions",
      status: criticalExceptions === 0 ? "Clear" : "Blocked",
      type: criticalExceptions === 0 ? "success" : "danger",
      action: criticalExceptions === 0 ? "None" : "Resolve exception before close",
    },
    {
      label: "Approvals",
      status: approvalsDone ? "Complete" : "Pending",
      type: approvalsDone ? "success" : "warning",
      action: approvalsDone ? "None" : "Complete sign-offs",
    },
    {
      label: "Month Close",
      status: readyToClose ? "Ready" : "Not Ready",
      type: readyToClose ? "success" : "pending",
      action: readyToClose ? "Close Month" : "Finish pending steps",
    },
  ];

  const completed = steps.filter((x) => x.type === "success").length;
  const progress = Math.round((completed / steps.length) * 100);

  return (
    <Panel title="Month Close Workflow">
      <div style={workflowHeader}>
        <div>
          <div style={workflowLabel}>Progress</div>
          <div style={workflowPercent}>{progress}%</div>
        </div>
        <div style={progressTrack}>
          <div style={{ ...progressFill, width: `${progress}%` }} />
        </div>
      </div>

      <div style={workflowGrid}>
        {steps.map((step) => (
          <div key={step.label} style={workflowStep(step.type)}>
            <div style={workflowStepTitle}>{step.label}</div>
            <div style={workflowStepStatus}>{step.status}</div>
            <div style={workflowStepAction}>{step.action}</div>
          </div>
        ))}
      </div>

      <div style={nextActionBox}>
        <b>Next Action: </b>
        {physicalPending > 0
          ? "Enter physical stock and click SAVE / UPDATE PHYSICAL STOCK."
          : needsAction > 0
          ? "Create inventory adjustment for the difference rows below."
          : pendingAdjustments > 0
          ? "Approve pending inventory adjustments."
          : !approvalsDone
          ? "Complete Production, Stores, Accounts, QC and CEO sign-offs."
          : readyToClose
          ? "Ready to close the month."
          : "Review remaining exceptions."}
      </div>

      {needsAction > 0 && (
        <div style={actionList}>
          {materialLines
            .filter((line) => line.statusType === "danger")
            .map((line) => (
              <div key={line.key} style={actionRow}>
                <div>
                  <b>{line.stage}</b>
                  <div style={actionSub}>
                    Remaining difference: {formatKg(line.remainingKg)}
                  </div>
                </div>
                <button style={miniButton} onClick={() => goToAdjustment(line)}>
                  Create Adjustment
                </button>
              </div>
            ))}
        </div>
      )}

      {pendingAdjustments > 0 && (
        <div style={actionRow}>
          <div>
            <b>Adjustment approval pending</b>
            <div style={actionSub}>Approve or reject pending adjustment entries.</div>
          </div>
          <button style={miniDarkButton} onClick={() => navigate("/inventory-adjustments")}>
            View / Approve
          </button>
        </div>
      )}
    </Panel>
  );
}


function getLineVariance(lines, stage) {
  const line = lines.find((x) => x.stage === stage);
  return line ? line.remainingKg : 0;
}

function materialFlowData(close) {
  return {
    ...close.materialFlow,
    washInputKg: close.materialFlow.rmInputKg,
    fgProducedKg: close.materialFlow.fgKg,
    salesValue: close.profitability.salesValue,
    avgRmPrice: close.rm.avgRate,
  };
}

function InputBox({ label, name, value, onChange, type = "text" }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input name={name} value={value} onChange={onChange} type={type} style={input} />
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <section style={panel}>
      <h2 style={panelTitle}>{title}</h2>
      {children}
    </section>
  );
}

function StatusPill({ label, count, type }) {
  return (
    <div style={summaryPill(type)}>
      <span>{label}</span>
      <b>{count}</b>
    </div>
  );
}

function num(value) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
}

function formatKg(value) {
  return `${num(value).toLocaleString("en-IN", { maximumFractionDigits: 0 })} Kg`;
}

function formatPercent(value) {
  return `${num(value).toFixed(2)}%`;
}

function monthLabel(value) {
  if (!value) return "";
  const [year, month] = value.split("-");
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

const page = { padding: 22, background: "#f8fafc", minHeight: "100vh" };
const header = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, flexWrap: "wrap", marginBottom: 18 };
const eyebrow = { color: "#0f766e", fontSize: 13, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0.8 };
const title = { margin: "4px 0 0", fontSize: 34, color: "#0f172a" };
const subtitle = { color: "#64748b", marginTop: 6, maxWidth: 760 };
const headerActions = { display: "flex", gap: 10, alignItems: "center" };

const statusBanner = (ready) => ({
  background: ready ? "linear-gradient(135deg, #0f766e, #14b8a6)" : "linear-gradient(135deg, #92400e, #f59e0b)",
  color: "white",
  padding: 22,
  borderRadius: 18,
  display: "flex",
  justifyContent: "space-between",
  gap: 20,
  alignItems: "center",
  marginBottom: 18,
  boxShadow: "0 10px 25px rgba(15, 23, 42, 0.14)",
});

const panel = { background: "white", padding: 18, borderRadius: 16, boxShadow: "0 2px 12px rgba(15, 23, 42, 0.08)", border: "1px solid #e2e8f0", marginBottom: 18 };
const panelTitle = { margin: "0 0 14px", color: "#0f172a" };
const input = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1", boxSizing: "border-box", background: "white" };
const textarea = { ...input, minHeight: 95, resize: "vertical" };
const label = { display: "block", fontWeight: 800, marginBottom: 8, color: "#334155" };
const labelStyle = { ...label, fontSize: 13 };
const approvalGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14 };

const closePanel = { background: "white", padding: 20, borderRadius: 18, boxShadow: "0 2px 12px rgba(15, 23, 42, 0.08)", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", gap: 20, alignItems: "center", flexWrap: "wrap" };
const closeButton = { background: "#0f766e", color: "white", border: "none", padding: "15px 24px", borderRadius: 12, cursor: "pointer", fontWeight: 900, fontSize: 15 };
const disabledCloseButton = { ...closeButton, background: "#94a3b8", cursor: "not-allowed" };
const secondaryButton = { background: "#0f172a", color: "white", border: "none", padding: "11px 16px", borderRadius: 10, cursor: "pointer", fontWeight: 800 };
const statusStyle = { marginTop: 16, padding: 14, borderRadius: 12, background: "#ecfdf5", color: "#065f46", fontWeight: 800 };

const exceptionStyle = (type) => ({
  padding: 13,
  borderRadius: 12,
  fontWeight: 700,
  color: type === "success" ? "#065f46" : type === "danger" ? "#991b1b" : "#92400e",
  background: type === "success" ? "#ecfdf5" : type === "danger" ? "#fef2f2" : "#fffbeb",
  border: type === "success" ? "1px solid #a7f3d0" : type === "danger" ? "1px solid #fecaca" : "1px solid #fde68a",
});

const accountabilityTop = { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 };
const summaryPill = (type) => ({
  display: "flex",
  gap: 10,
  alignItems: "center",
  background: type === "success" ? "#ecfdf5" : type === "danger" ? "#fef2f2" : "#fffbeb",
  color: type === "success" ? "#065f46" : type === "danger" ? "#991b1b" : "#92400e",
  border: type === "success" ? "1px solid #a7f3d0" : type === "danger" ? "1px solid #fecaca" : "1px solid #fde68a",
  borderRadius: 999,
  padding: "8px 12px",
  fontWeight: 900,
});

const tableWrap = { overflowX: "auto", border: "1px solid #e5e7eb", borderRadius: 12 };
const table = { width: "100%", borderCollapse: "collapse", fontSize: 13 };
const th = { background: "#f8fafc", color: "#334155", textAlign: "left", padding: "10px 12px", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap" };
const td = { padding: "10px 12px", borderBottom: "1px solid #e5e7eb", color: "#334155", verticalAlign: "middle", whiteSpace: "nowrap" };

const pill = (type) => ({
  display: "inline-block",
  padding: "6px 9px",
  borderRadius: 999,
  fontWeight: 900,
  fontSize: 12,
  color: type === "success" ? "#065f46" : type === "danger" ? "#991b1b" : "#92400e",
  background: type === "success" ? "#ecfdf5" : type === "danger" ? "#fef2f2" : "#fffbeb",
});

const miniButton = { background: "#0f766e", color: "white", border: "none", borderRadius: 8, padding: "7px 10px", fontWeight: 900, cursor: "pointer", fontSize: 12 };
const miniDarkButton = { ...miniButton, background: "#0f172a" };
const hintBox = { marginTop: 12, padding: 12, borderRadius: 12, background: "#f8fafc", border: "1px dashed #cbd5e1", color: "#475569", fontWeight: 700 };


const workflowHeader = {
  display: "grid",
  gridTemplateColumns: "160px 1fr",
  gap: 16,
  alignItems: "center",
  marginBottom: 16,
};

const workflowLabel = {
  color: "#64748b",
  fontSize: 12,
  fontWeight: 900,
  textTransform: "uppercase",
};

const workflowPercent = {
  color: "#0f172a",
  fontSize: 30,
  fontWeight: 900,
  marginTop: 2,
};

const progressTrack = {
  height: 14,
  background: "#e2e8f0",
  borderRadius: 999,
  overflow: "hidden",
};

const progressFill = {
  height: "100%",
  background: "linear-gradient(135deg, #0f766e, #14b8a6)",
  borderRadius: 999,
};

const workflowGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 12,
  marginBottom: 14,
};

const workflowStep = (type) => ({
  border:
    type === "success"
      ? "1px solid #a7f3d0"
      : type === "danger"
      ? "1px solid #fecaca"
      : type === "warning"
      ? "1px solid #fde68a"
      : "1px solid #cbd5e1",
  background:
    type === "success"
      ? "#ecfdf5"
      : type === "danger"
      ? "#fef2f2"
      : type === "warning"
      ? "#fffbeb"
      : "#f8fafc",
  borderRadius: 14,
  padding: 14,
});

const workflowStepTitle = {
  color: "#334155",
  fontSize: 13,
  fontWeight: 900,
};

const workflowStepStatus = {
  color: "#0f172a",
  fontSize: 18,
  fontWeight: 900,
  marginTop: 6,
};

const workflowStepAction = {
  color: "#64748b",
  fontSize: 12,
  fontWeight: 700,
  marginTop: 6,
};

const nextActionBox = {
  background: "#f8fafc",
  border: "1px dashed #cbd5e1",
  borderRadius: 12,
  padding: 12,
  color: "#334155",
  marginBottom: 12,
};

const actionList = {
  display: "grid",
  gap: 10,
};

const actionRow = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
  padding: 12,
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  background: "white",
  marginTop: 10,
};

const actionSub = {
  color: "#64748b",
  fontSize: 12,
  fontWeight: 700,
  marginTop: 3,
};
