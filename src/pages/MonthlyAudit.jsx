import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";
import { calculateMonthClose } from "../services/monthCloseEngine";
import { getPhysicalCount, savePhysicalCount } from "../services/physicalCountService";

const MANUFACTURING_GROUPS = ["RM", "WIP", "FG", "REWORK", "WASTE", "ADDITIVE"];

export default function MonthlyAudit() {
  const now = new Date();
  const [month, setMonth] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  );
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
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
    adjustments: [],
    closeRows: [],
    materials: [],
  });
  const [materialGroupView, setMaterialGroupView] = useState(null);
  const [physical, setPhysical] = useState({
    storesPhysicalValue: "",
    productionSignoff: "",
    storesSignoff: "",
    accountsSignoff: "",
    qcSignoff: "",
    ceoSignoff: "Pratap",
    remarks: "",
  });
  const [physicalMaterialLines, setPhysicalMaterialLines] = useState({});
  const [adjustmentReasons, setAdjustmentReasons] = useState({});

  useEffect(() => {
    loadAll();
  }, [month]);

  async function safeLoad(fn, extra = {}) {
    try {
      const res = await apiCall({ fn, ...extra });
      return res?.rows || [];
    } catch (err) {
      console.log(fn, err);
      return [];
    }
  }

  async function safeCall(fn, extra = {}) {
    try {
      return await apiCall({ fn, ...extra });
    } catch (err) {
      console.log(fn, err);
      return null;
    }
  }

  async function loadAll() {
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
      adjustments,
      closeRows,
      materials,
      materialGroups,
      physicalCount,
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
      safeLoad("monthClose.list"),
      safeLoad("materialMaster.list"),
      safeCall("monthClose.materialGroups", { periodMonth: month }),
      safeCall("physicalCounts.get", { periodMonth: month }),
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
      adjustments,
      closeRows,
      materials,
    });
    setMaterialGroupView(materialGroups?.ok ? materialGroups : null);

    if (physicalCount?.ok && physicalCount.row) {
      setPhysical((prev) => ({
        ...prev,
        storesPhysicalValue: physicalCount.row.storesPhysicalValue ?? "",
        productionSignoff: physicalCount.row.productionSignoff ?? "",
        storesSignoff: physicalCount.row.storesSignoff ?? "",
        accountsSignoff: physicalCount.row.accountsSignoff ?? "",
        qcSignoff: physicalCount.row.qcSignoff ?? "",
        ceoSignoff: physicalCount.row.ceoSignoff || "Pratap",
        remarks: physicalCount.row.remarks ?? "",
      }));
      setPhysicalMaterialLines(parsePhysicalMaterialLines(physicalCount.row.materialPhysicalLinesJson));
    } else {
      setPhysicalMaterialLines({});
    }

    setLoading(false);
  }

  const close = useMemo(
    () =>
      calculateMonthClose({
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
      }),
    [rows, month]
  );

  const materialLines = useMemo(
    () => buildFactoryFlowStockRows({ close, rows, physicalMaterialLines, month }),
    [close, rows, physicalMaterialLines, month]
  );

  const monthClosed = useMemo(
    () =>
      rows.closeRows.some(
        (r) => String(r.periodMonth || "") === String(month) && String(r.status || "").toUpperCase() === "CLOSED"
      ),
    [rows.closeRows, month]
  );

  const readiness = useMemo(() => {
    const physicalPending = materialLines.filter((line) => !line.hasPhysical).length;
    const investigation = materialLines.filter((line) => line.statusType === "danger").length;
    const adjustmentPending = materialLines.filter((line) => line.statusType === "warning").length;
    const productionDone = close.production.washInputKg > 0 && close.production.fgProducedKg > 0;
    const dispatchDone = close.production.dispatchKg > 0;
    const expensesEntered = close.costs.factoryExpenseValue > 0 || close.costs.storesIssueValue > 0;
    const physicalDone = materialLines.length > 0 && physicalPending === 0;
    const differencesResolved = physicalDone && adjustmentPending === 0 && investigation === 0;
    const signoffsComplete = [
      physical.productionSignoff,
      physical.storesSignoff,
      physical.accountsSignoff,
      physical.ceoSignoff,
    ].every((value) => String(value || "").trim());

    return [
      {
        title: "Production Done?",
        ok: productionDone,
        next: productionDone ? "Production entries found" : "Enter wash/extrusion production",
      },
      {
        title: "Dispatch Done?",
        ok: dispatchDone,
        next: dispatchDone ? "Dispatch entries found" : "Enter dispatch first",
      },
      {
        title: "Expenses Entered?",
        ok: expensesEntered,
        next: expensesEntered ? "Costs found" : "Enter factory/stores costs",
      },
      {
        title: "Physical Stock Entered?",
        ok: physicalDone,
        next: physicalDone ? "Actual stock entered" : `${physicalPending || materialLines.length || 0} stock type(s) pending`,
      },
      {
        title: "Differences Resolved?",
        ok: differencesResolved,
        next:
          adjustmentPending > 0
            ? `${adjustmentPending} approval pending`
            : investigation > 0
            ? `${investigation} difference(s) to check`
            : "All differences resolved",
      },
      {
        title: "Sign-Off Done?",
        ok: signoffsComplete,
        next: monthClosed ? "Month closed" : signoffsComplete ? "Sign-off complete" : "Complete sign-off",
      },
    ];
  }, [close, materialLines, physical, monthClosed]);

  const readyToClose = !monthClosed && readiness.every((card) => card.ok);

  function onPhysicalChange(lineKey, value) {
    setPhysicalMaterialLines((prev) => ({ ...prev, [lineKey]: value }));
  }

  function onSignoffChange(e) {
    const { name, value } = e.target;
    setPhysical((prev) => ({ ...prev, [name]: value }));
  }

  function onReasonChange(lineKey, value) {
    setAdjustmentReasons((prev) => ({ ...prev, [lineKey]: value }));
  }

  async function savePhysicalSnapshot({ silent = false } = {}) {
    const physicalRows = materialLines.map((line) => ({
      key: line.key,
      materialId: line.materialId,
      materialCode: line.materialCode,
      materialName: line.materialName,
      category: line.group,
      openingKg: line.opening,
      flowInKg: line.flowIn,
      flowOutKg: line.flowOut,
      systemKg: line.systemClosing,
      physicalKg: physicalMaterialLines[line.key] === "" ? "" : num(physicalMaterialLines[line.key]),
    }));
    const totals = physicalRows.reduce(
      (acc, row) => {
        const qty = row.physicalKg === "" ? 0 : num(row.physicalKg);
        if (row.category === "RM") acc.rmPhysicalKg += qty;
        if (row.category === "WIP") acc.washPhysicalKg += qty;
        if (row.category === "FG") acc.fgPhysicalKg += qty;
        return acc;
      },
      { rmPhysicalKg: 0, washPhysicalKg: 0, sortingPhysicalKg: 0, fgPhysicalKg: 0 }
    );

    const res = await savePhysicalCount(month, {
      ...physical,
      ...totals,
      materialPhysicalLinesJson: JSON.stringify(physicalRows),
      savedBy: physical.ceoSignoff || physical.accountsSignoff || "Month Close",
    });
    if (!res?.ok) throw new Error(res?.error || "Failed to save physical stock.");
    if (!silent) setStatus("Physical stock saved.");
    return res;
  }

  async function approveAdjustment(line) {
    if (!line.hasPhysical) {
      setStatus("Enter physical closing stock first.");
      return;
    }
    if (Math.abs(line.remainingKg) <= 0.01) {
      setStatus("This material is already reconciled.");
      return;
    }
    const reason = String(adjustmentReasons[line.key] || "").trim();
    if (!reason) {
      setStatus("Enter a reason before approving the adjustment.");
      return;
    }
    if (!window.confirm(`Approve ${formatKg(line.remainingKg)} difference for ${line.materialName}?`)) return;

    await savePhysicalSnapshot({ silent: true });
    const res = await apiCall({
      fn: "inventoryAdjustments.approveMonthClose",
      periodMonth: month,
      closeMonth: month,
      date: `${month}-01`,
      module: "MONTH_CLOSE",
      itemType: line.group,
      materialId: line.materialId,
      materialCode: line.materialCode,
      itemCode: line.materialName,
      material: line.materialName,
      stage: line.group,
      systemQty: line.systemClosing,
      physicalQty: line.physicalKg,
      differenceQty: line.remainingKg,
      value: getDifferenceValue(line, close),
      reason,
      remarks: physical.remarks || "",
      sourceRef: `MONTH_CLOSE:${month}:${line.key}`,
      approvedBy: physical.accountsSignoff || physical.ceoSignoff || "Month Close",
    });
    if (!res?.ok) {
      setStatus(res?.error || "Difference approval failed.");
      return;
    }
    setStatus("Difference approved.");
    await loadAll();
  }

  async function saveSignoffs() {
    try {
      setStatus("Saving physical stock and sign-off...");
      await savePhysicalSnapshot();
      await loadAll();
    } catch (err) {
      setStatus(err.message || "Save failed.");
    }
  }

  async function closeMonth() {
    if (monthClosed) {
      setStatus("This month is already closed.");
      return;
    }
    if (!readyToClose) {
      setStatus("Month cannot be closed yet. Enter actual stock, clear differences, and complete sign-off.");
      return;
    }
    if (!window.confirm(`Close ${monthLabel(month)}?`)) return;
    await savePhysicalSnapshot({ silent: true });
    const res = await apiCall({
      fn: "monthClose.add",
      periodMonth: month,
      status: "Closed",
      rmSystemClosingKg: sumByGroup(materialLines, "RM", "systemClosing"),
      washSystemClosingKg: sumByGroup(materialLines, "WIP", "systemClosing"),
      sortingSystemClosingKg: 0,
      fgSystemClosingKg: sumByGroup(materialLines, "FG", "systemClosing"),
      rmPhysicalKg: sumByGroup(materialLines, "RM", "physicalKg"),
      washPhysicalKg: sumByGroup(materialLines, "WIP", "physicalKg"),
      sortingPhysicalKg: 0,
      fgPhysicalKg: sumByGroup(materialLines, "FG", "physicalKg"),
      storesPhysicalValue: physical.storesPhysicalValue,
      rmVarianceKg: sumByGroup(materialLines, "RM", "remainingKg"),
      washVarianceKg: sumByGroup(materialLines, "WIP", "remainingKg"),
      sortingVarianceKg: 0,
      fgVarianceKg: sumByGroup(materialLines, "FG", "remainingKg"),
      rmInwardKg: close.rm.purchasedKg,
      washInputKg: close.production.washInputKg,
      washedOutputKg: close.production.washedOutputKg,
      sortingInputKg: close.production.sortingInputKg,
      sortingAcceptedKg: close.production.sortingAcceptedKg,
      extrusionInputKg: close.production.extrusionInputKg,
      fgProducedKg: close.production.fgProducedKg,
      dispatchKg: close.production.dispatchKg,
      salesValue: close.profitability.salesValue,
      factoryExpenses: close.costs.factoryExpenseValue,
      storesIssueQty: close.costs.storesIssueValue,
      estimatedRmConsumedValue: close.costs.estimatedRmConsumedValue,
      manufacturingProfit: close.profitability.manufacturingProfit,
      exceptions: JSON.stringify(materialLines.map((line) => ({
        key: line.key,
        stockType: line.materialName,
        category: line.group,
        openingKg: line.opening,
        flowInKg: line.flowIn,
        flowOutKg: line.flowOut,
        systemKg: line.systemClosing,
        physicalKg: line.physicalKg,
        differenceKg: line.remainingKg,
        status: line.status,
      }))),
      productionSignoff: physical.productionSignoff,
      storesSignoff: physical.storesSignoff,
      accountsSignoff: physical.accountsSignoff,
      ceoSignoff: physical.ceoSignoff,
      remarks: physical.remarks,
    });
    setStatus(res?.ok ? "Month closed successfully." : res?.error || "Month close failed.");
    await loadAll();
  }

  return (
    <div style={page}>
      <div style={header}>
        <div>
          <div style={eyebrow}>Factory Month Close</div>
          <h1 style={title}>Month Close</h1>
          <div style={subtitle}>Check stock, money, differences, and sign-off in one place.</div>
        </div>
        <div style={headerActions}>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} style={input} />
          <button onClick={loadAll} style={secondaryButton}>{loading ? "Loading..." : "Refresh"}</button>
        </div>
      </div>

      <div style={monthBanner}>
        <b>{monthLabel(month)} Status:</b>{" "}
        {formatTon(close.production.fgProducedKg)} Produced | {formatTon(close.production.dispatchKg)} Dispatched | {materialLines.filter((x) => x.statusType === "danger" || x.statusType === "warning").length} Differences Pending | {readyToClose ? "Can Close" : "Action Required"}
      </div>

      <Section title="Can We Close This Month?">
        <div style={cardGrid}>
          {readiness.map((card) => (
            <div key={card.title} style={readinessCard(card.ok)}>
              <div style={cardLabel}>{card.title}</div>
              <div style={cardValue}>{card.ok ? "OK" : "Action Needed"}</div>
              <div style={cardNext}>{card.next}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Stock Check">
        <div style={summaryRow}>
          <StatusPill label="Reconciled" count={materialLines.filter((x) => x.statusType === "success").length} type="success" />
          <StatusPill label="Pending" count={materialLines.filter((x) => x.statusType === "pending" || x.statusType === "warning").length} type="warning" />
          <StatusPill label="Check Difference" count={materialLines.filter((x) => x.statusType === "danger").length} type="danger" />
        </div>
        {materialLines.length === 0 && (
          <div style={warningBox}>No active manufacturing materials found. Check material setup.</div>
        )}
        <div style={tableWrap}>
          <table style={table}>
            <thead>
              <tr>
                {[
                  "Stock Type",
                  "Opening",
                  "In",
                  "Out",
                  "System Stock",
                  "Actual Stock",
                  "Difference",
                  "Reason",
                  "Status",
                  "Action",
                ].map((h) => <th key={h} style={th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {materialLines.map((line) => (
                <tr key={line.key}>
                  <td style={td}><b>{line.materialName}</b></td>
                  <td style={td}>
                    {line.openingEditable ? (
                      <input
                        value={physicalMaterialLines[openingKey(line.key)] ?? ""}
                        onChange={(e) => onPhysicalChange(openingKey(line.key), e.target.value)}
                        onBlur={() => savePhysicalSnapshot({ silent: true }).catch((err) => setStatus(err.message))}
                        type="number"
                        placeholder="Opening"
                        style={qtyInput}
                      />
                    ) : formatKg(line.opening)}
                  </td>
                  <td style={td}>{formatKg(line.flowIn)}</td>
                  <td style={td}>{formatKg(line.flowOut)}</td>
                  <td style={td}>{formatKg(line.systemClosing)}</td>
                  <td style={td}>
                    <input
                      value={physicalMaterialLines[line.key] ?? ""}
                      onChange={(e) => onPhysicalChange(line.key, e.target.value)}
                      onBlur={() => savePhysicalSnapshot({ silent: true }).catch((err) => setStatus(err.message))}
                      type="number"
                      placeholder="Kg"
                      style={qtyInput}
                    />
                  </td>
                  <td style={td}>{line.hasPhysical ? formatKg(line.remainingKg) : "-"}</td>
                  <td style={td}>
                    {line.statusType === "danger" ? (
                      <input
                        value={adjustmentReasons[line.key] || ""}
                        onChange={(e) => onReasonChange(line.key, e.target.value)}
                        placeholder="Reason"
                        style={smallInput}
                      />
                    ) : "-"}
                  </td>
                  <td style={td}><span style={pill(line.statusType)}>{line.status}</span></td>
                  <td style={td}>
                    {line.statusType === "danger" ? (
                      <button onClick={() => approveAdjustment(line)} style={miniButton}>Approve Difference</button>
                    ) : line.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Stores Summary">
        <div style={summaryRow}>
          <StatusPill label="Store Items" count={materialGroupView?.storesSummary?.itemCount || 0} type="success" />
          <StatusPill label="Inward" count={formatQtyCount(materialGroupView?.storesSummary?.inwardQty)} type="success" />
          <StatusPill label="Issued" count={formatQtyCount(materialGroupView?.storesSummary?.issuedQty)} type="warning" />
          <StatusPill label="Closing" count={formatQtyCount(materialGroupView?.storesSummary?.closingQty)} type="success" />
        </div>
        <div style={muted}>Stores are summarized here so consumable items do not crowd the manufacturing stock table.</div>
      </Section>

      <div style={twoColumn}>
        <Section title="Production Summary">
          <ReconTable
            rows={[
              ["RM Received", close.rm.purchasedKg],
              ["RM Used", close.rm.consumedKg],
              ["FG Made", close.production.fgProducedKg],
              ["Dispatched", close.production.dispatchKg],
              ["Waste / Rework", close.materialFlow.wasteSaleKg + close.materialFlow.trueLossKg + close.materialFlow.recoveryReuseKg],
              ["Recovery %", close.production.overallRecovery, "percent"],
            ]}
          />
        </Section>

        <Section title="Money Summary">
          <ReconTable
            rows={[
              ["Sales", close.profitability.salesValue, "currency"],
              ["RM Cost", close.costs.estimatedRmConsumedValue, "currency"],
              ["Stores Cost", close.costs.storesIssueValue, "currency"],
              ["Factory Expenses", close.costs.factoryExpenseValue, "currency"],
              ["Factory Cost Master Allocation", close.costs.factoryCostAllocationValue, "currency"],
              [
                "Estimated Manufacturing Profit",
                close.costs.costDataComplete ? close.profitability.manufacturingProfit : "Cost data incomplete",
                close.costs.costDataComplete ? "currency" : "text",
              ],
            ]}
          />
        </Section>
      </div>

      <Section title="Sign Off">
        <div style={formGrid}>
          <InputBox label="Production" name="productionSignoff" value={physical.productionSignoff} onChange={onSignoffChange} />
          <InputBox label="Stores" name="storesSignoff" value={physical.storesSignoff} onChange={onSignoffChange} />
          <InputBox label="Accounts" name="accountsSignoff" value={physical.accountsSignoff} onChange={onSignoffChange} />
          <InputBox label="CEO" name="ceoSignoff" value={physical.ceoSignoff} onChange={onSignoffChange} />
        </div>
        <textarea name="remarks" value={physical.remarks} onChange={onSignoffChange} style={textarea} placeholder="Remarks" />
        <button onClick={saveSignoffs} style={secondaryButton}>Save Sign-Off</button>
      </Section>

      <div style={closePanel}>
        <div>
          <h2 style={{ margin: 0 }}>Close Month</h2>
          <div style={muted}>Close is allowed only after actual stock, differences, and sign-off are complete.</div>
        </div>
        <button onClick={closeMonth} style={readyToClose ? closeButton : disabledButton}>
          {monthClosed ? "Month Closed" : "Close Month"}
        </button>
      </div>

      {status && <div style={statusBox}>{status}</div>}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section style={panel}>
      <h2 style={panelTitle}>{title}</h2>
      {children}
    </section>
  );
}

function ReconTable({ rows }) {
  return (
    <div style={tableWrap}>
      <table style={table}>
        <tbody>
          {rows.map(([label, value, type]) => (
            <tr key={label}>
              <td style={td}><b>{label}</b></td>
              <td style={td}>{type === "currency" ? formatMoney(value) : type === "percent" ? formatPercent(value) : type === "text" ? value : formatKg(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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

function InputBox({ label, name, value, onChange }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input name={name} value={value} onChange={onChange} style={input} />
    </div>
  );
}

function parsePhysicalMaterialLines(value) {
  try {
    const rows = typeof value === "string" ? JSON.parse(value || "[]") : value || [];
    return rows.reduce((map, row) => {
      const key = row.key || `${row.category}|${row.materialId || row.materialCode || row.materialName}`;
      map[key] = row.physicalKg === null || row.physicalKg === undefined ? "" : row.physicalKg;
      if (row.openingKg !== null && row.openingKg !== undefined && row.openingKg !== "") {
        map[openingKey(key)] = row.openingKg;
      }
      return map;
    }, {});
  } catch {
    return {};
  }
}

function buildFactoryFlowStockRows({ close, rows, physicalMaterialLines, month }) {
  const previousClose = getPreviousClosedMonth(rows.closeRows, month);
  const wasteReworkGenerated = getWasteReworkGenerated(close);
  const storesPurchasedQty = sumAny(rowsInSelectedMonth(rows.storesInward, month), ["qty", "quantity", "quantityKg", "receivedQty", "inwardQty"]);
  const storesIssuedQty = sumAny(rowsInSelectedMonth(rows.storesIssue, month), ["qty", "quantity", "quantityKg", "issuedQty", "issueQty"]);

  return [
    createFlowStockLine({
      key: "FLOW|RM",
      materialName: "RM Stock",
      group: "RM",
      flowIn: close.rm.purchasedKg,
      flowOut: close.rm.consumedKg,
      previousClose,
      physicalMaterialLines,
      month,
      adjustments: rows.adjustments,
    }),
    createFlowStockLine({
      key: "FLOW|WIP",
      materialName: "WIP Stock",
      group: "WIP",
      flowIn: close.rm.consumedKg,
      flowOut: close.production.fgProducedKg + wasteReworkGenerated,
      previousClose,
      physicalMaterialLines,
      month,
      adjustments: rows.adjustments,
    }),
    createFlowStockLine({
      key: "FLOW|FG",
      materialName: "FG Stock",
      group: "FG",
      flowIn: close.production.fgProducedKg,
      flowOut: close.production.dispatchKg,
      previousClose,
      physicalMaterialLines,
      month,
      adjustments: rows.adjustments,
    }),
    createFlowStockLine({
      key: "FLOW|WASTE_REWORK",
      materialName: "Waste / Rework Stock",
      group: "WASTE",
      flowIn: wasteReworkGenerated,
      flowOut: 0,
      previousClose,
      physicalMaterialLines,
      month,
      adjustments: rows.adjustments,
    }),
    createFlowStockLine({
      key: "FLOW|STORES",
      materialName: "Stores Stock",
      group: "STORE",
      flowIn: storesPurchasedQty,
      flowOut: storesIssuedQty,
      previousClose,
      physicalMaterialLines,
      month,
      adjustments: rows.adjustments,
    }),
  ];
}

function createFlowStockLine({ key, materialName, group, flowIn, flowOut, previousClose, physicalMaterialLines, month, adjustments }) {
  const openingEditable = !previousClose;
  const opening = openingEditable
    ? num(physicalMaterialLines[openingKey(key)])
    : getPreviousClosingForFlow(previousClose, key, group);
  const related = (adjustments || []).filter((a) => {
    const sameMonth = String(a.periodMonth || a.closeMonth || "").slice(0, 7) === String(month);
    const sameSource = String(a.sourceRef || "") === `MONTH_CLOSE:${month}:${key}`;
    const sameItem =
      String(a.itemCode || a.material || a.materialName || "").toUpperCase() === String(materialName).toUpperCase() ||
      String(a.itemType || "").toUpperCase() === String(group).toUpperCase();
    return sameMonth && (sameSource || sameItem);
  });
  const approvedAdjustments = related
    .filter((a) => String(a.status || "").toUpperCase() === "APPROVED")
    .reduce((total, a) => total + num(a.quantityKg), 0);
  const pendingAdjustmentKg = related
    .filter((a) => ["DRAFT", "SUBMITTED", "PENDING"].includes(String(a.status || "").toUpperCase()))
    .reduce((total, a) => total + num(a.quantityKg), 0);
  const systemClosing = num(opening) + num(flowIn) - num(flowOut) + num(approvedAdjustments);
  const physicalValue = physicalMaterialLines[key] ?? "";
  const hasPhysical = physicalValue !== "";
  const physicalKg = hasPhysical ? num(physicalValue) : 0;
  const differenceKg = hasPhysical ? physicalKg - systemClosing : 0;

  let status = "Actual Stock Pending";
  let statusType = "pending";
  if (hasPhysical && Math.abs(differenceKg) <= 0.01) {
    status = "Reconciled";
    statusType = "success";
  } else if (hasPhysical && Math.abs(pendingAdjustmentKg) > 0.01) {
    status = "Approval Pending";
    statusType = "warning";
  } else if (hasPhysical) {
    status = "Check Difference";
    statusType = "danger";
  }

  return {
    key,
    materialId: key,
    materialCode: group,
    materialName,
    group,
    opening,
    openingEditable,
    flowIn: num(flowIn),
    flowOut: num(flowOut),
    inward: group === "RM" || group === "STORE" ? num(flowIn) : 0,
    produced: group === "WIP" || group === "FG" || group === "WASTE" ? num(flowIn) : 0,
    consumed: group === "RM" || group === "WIP" ? num(flowOut) : 0,
    dispatched: group === "FG" ? num(flowOut) : 0,
    issued: group === "STORE" ? num(flowOut) : 0,
    approvedAdjustments,
    systemClosing,
    physicalKg,
    physicalValue,
    hasPhysical,
    differenceKg,
    remainingKg: differenceKg,
    pendingAdjustmentKg,
    status,
    statusType,
  };
}

function openingKey(lineKey) {
  return `${lineKey}::opening`;
}

function getWasteReworkGenerated(close) {
  return num(close.materialFlow.wasteSaleKg) + num(close.materialFlow.trueLossKg) + num(close.materialFlow.recoveryReuseKg);
}

function getPreviousClosedMonth(closeRows = [], month) {
  return closeRows
    .filter((row) => String(row.status || "").toUpperCase() === "CLOSED")
    .filter((row) => String(row.periodMonth || "").slice(0, 7) < String(month))
    .sort((a, b) => String(a.periodMonth || "").localeCompare(String(b.periodMonth || "")))
    .pop() || null;
}

function getPreviousClosingForFlow(previousClose, key, group) {
  const fromException = parsePreviousCloseStockJson(previousClose).find((row) => row.key === key);
  if (fromException && fromException.physicalKg !== "" && fromException.physicalKg !== undefined) return num(fromException.physicalKg);
  if (group === "RM") return num(previousClose?.rmPhysicalKg);
  if (group === "WIP") return num(previousClose?.washPhysicalKg) + num(previousClose?.sortingPhysicalKg);
  if (group === "FG") return num(previousClose?.fgPhysicalKg);
  return 0;
}

function parsePreviousCloseStockJson(previousClose) {
  try {
    const rows = JSON.parse(previousClose?.exceptions || "[]");
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

function rowsInSelectedMonth(rows = [], month) {
  return rows.filter((row) => {
    if (String(row.status || "").toUpperCase() === "DELETED") return false;
    if (String(row.inwardStatus || "").toUpperCase() === "DELETED") return false;
    if (String(row.issueStatus || "").toUpperCase() === "DELETED") return false;
    const pm = String(row.periodMonth || "").trim();
    if (pm) return pm.slice(0, 7) === String(month);
    const value = row.date || row.invoiceDate || row.createdAt || row.timestamp || "";
    if (!value) return false;
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value).slice(0, 7) === String(month);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` === String(month);
  });
}

function buildMaterialGroupsFromMaster(rows = []) {
  const groups = { RM: [], WIP: [], FG: [], REWORK: [], WASTE: [], ADDITIVE: [] };
  rows.forEach((row) => {
    const status = String(row.status || "ACTIVE").toUpperCase();
    const category = normalizeMaterialCategory(row.category || row.materialType || row.materialCategory);
    if (status === "DELETED" || status === "INACTIVE" || !groups[category]) return;
    groups[category].push({
      materialId: row.materialId || "",
      materialCode: row.materialCode || "",
      materialName: row.materialName || row.name || "",
      category,
      opening: 0,
      inward: 0,
      consumed: 0,
      produced: 0,
      dispatched: 0,
      approvedAdjustments: 0,
      balance: 0,
    });
  });
  return groups;
}

function buildFallbackExceptionRows(summary = {}) {
  const rows = [];
  if (num(summary.rmReceivedKg) > 0) {
    rows.push({
      materialId: "FRONTEND-UNMAPPED-RM-IN",
      materialCode: "CHECK",
      materialName: "Unmapped RM Received",
      category: "RM",
      inward: summary.rmReceivedKg,
      balance: summary.rmReceivedKg,
      systemStock: summary.rmReceivedKg,
    });
  }
  if (num(summary.rmUsedKg) > 0) {
    rows.push({
      materialId: "FRONTEND-UNMAPPED-RM-USED",
      materialCode: "CHECK",
      materialName: "Unmapped RM Used",
      category: "RM",
      consumed: summary.rmUsedKg,
      balance: -num(summary.rmUsedKg),
      systemStock: -num(summary.rmUsedKg),
    });
  }
  if (num(summary.fgMadeKg) > 0) {
    rows.push({
      materialId: "FRONTEND-UNMAPPED-FG-MADE",
      materialCode: "CHECK",
      materialName: "Unmapped FG Made",
      category: "FG",
      produced: summary.fgMadeKg,
      balance: summary.fgMadeKg,
      systemStock: summary.fgMadeKg,
    });
  }
  if (num(summary.dispatchedKg) > 0) {
    rows.push({
      materialId: "FRONTEND-UNMAPPED-DISPATCH",
      materialCode: "CHECK",
      materialName: "Unmapped Dispatch",
      category: "FG",
      dispatched: summary.dispatchedKg,
      balance: -num(summary.dispatchedKg),
      systemStock: -num(summary.dispatchedKg),
    });
  }
  return rows.map((row) => ({
    opening: 0,
    inward: 0,
    consumed: 0,
    produced: 0,
    dispatched: 0,
    issued: 0,
    approvedAdjustments: 0,
    status: "CHECK_MAPPING",
    ...row,
  }));
}

function hasMaterialGroupRows(groups = {}) {
  return MANUFACTURING_GROUPS.some((category) => Array.isArray(groups[category]) && groups[category].length > 0);
}

function normalizeMaterialCategory(value) {
  const raw = String(value || "").trim().toUpperCase();
  if (["RAW MATERIAL", "RAW_MATERIAL", "RM MATERIAL", "RM MATERIALS"].includes(raw)) return "RM";
  if (["WORK IN PROCESS", "WORK_IN_PROCESS", "WIP MATERIAL", "WIP MATERIALS"].includes(raw)) return "WIP";
  if (["FINISHED GOODS", "FINISHED_GOODS", "FG MATERIAL", "FG MATERIALS"].includes(raw)) return "FG";
  if (["REWORK MATERIAL", "REWORK MATERIALS"].includes(raw)) return "REWORK";
  if (["WASTE MATERIAL", "WASTE MATERIALS"].includes(raw)) return "WASTE";
  if (["ADDITIVE MATERIAL", "ADDITIVE MATERIALS"].includes(raw)) return "ADDITIVE";
  if (["STORE", "STORES", "STORE ITEM"].includes(raw)) return "STORE";
  return raw;
}

function sum(rows, key) {
  return rows.reduce((total, row) => total + num(row[key]), 0);
}

function sumAny(rows, keys) {
  return rows.reduce((total, row) => {
    const key = keys.find((candidate) => row[candidate] !== undefined && row[candidate] !== null && row[candidate] !== "");
    return total + num(key ? row[key] : 0);
  }, 0);
}

function sumByGroup(lines, group, key) {
  return lines.filter((line) => line.group === group).reduce((total, line) => total + num(line[key]), 0);
}

function movementSummary(line) {
  return [
    `Open ${formatKg(line.opening)}`,
    `In ${formatKg(line.inward)}`,
    `Made ${formatKg(line.produced)}`,
    `Used ${formatKg(line.consumed)}`,
    `Dispatch ${formatKg(line.dispatched)}`,
    line.issued ? `Stores ${formatKg(line.issued)}` : "",
    `Adj ${formatKg(line.approvedAdjustments)}`,
  ].filter(Boolean).join(" | ");
}

function formatQtyCount(value) {
  return num(value).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function getDifferenceValue(line, close) {
  const rate = line.group === "RM" ? close.rm.avgRate : close.profitability.manufacturingCostPerKg || close.rm.avgRate;
  return Math.abs(num(line.remainingKg)) * num(rate);
}

function num(value) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
}

function formatKg(value) {
  return `${num(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}\u00a0kg`;
}

function formatTon(value) {
  return `${(num(value) / 1000).toLocaleString("en-IN", { maximumFractionDigits: 1 })} T`;
}

function formatCurrency(value) {
  return `₹${num(value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function formatMoney(value) {
  return `\u20B9${num(value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function formatPercent(value) {
  return `${num(value).toFixed(1)}%`;
}

function monthLabel(month) {
  const [year, mm] = String(month || "").split("-");
  if (!year || !mm) return month;
  return new Date(Number(year), Number(mm) - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

const page = { padding: 24, background: "#f8fafc", minHeight: "100vh", color: "#0f172a" };
const header = { display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", marginBottom: 20 };
const headerActions = { display: "flex", gap: 10, alignItems: "center" };
const eyebrow = { color: "#047857", fontWeight: 900, textTransform: "uppercase", fontSize: 12 };
const title = { margin: "4px 0", fontSize: 30, fontWeight: 900 };
const subtitle = { color: "#64748b", fontWeight: 700 };
const panel = { background: "white", border: "1px solid #e5e7eb", borderRadius: 16, padding: 18, marginBottom: 18, boxShadow: "0 10px 30px rgba(15,23,42,0.06)" };
const panelTitle = { margin: "0 0 14px", fontSize: 20, fontWeight: 900 };
const monthBanner = { background: "#0f766e", color: "white", borderRadius: 16, padding: 18, marginBottom: 18, fontSize: 18, boxShadow: "0 10px 30px rgba(15,118,110,0.2)" };
const twoColumn = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18 };
const cardGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 };
const readinessCard = (ok) => ({ background: ok ? "#ecfdf5" : "#fff7ed", border: `1px solid ${ok ? "#bbf7d0" : "#fed7aa"}`, borderRadius: 14, padding: 14 });
const cardLabel = { color: "#475569", fontWeight: 800, fontSize: 12 };
const cardValue = { fontSize: 20, fontWeight: 900, marginTop: 4 };
const cardNext = { color: "#64748b", fontSize: 12, marginTop: 4, fontWeight: 700 };
const tableWrap = { overflowX: "auto", border: "1px solid #e5e7eb", borderRadius: 12 };
const table = { width: "100%", borderCollapse: "collapse", fontSize: 13 };
const th = { textAlign: "left", padding: 10, background: "#f1f5f9", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap" };
const td = { padding: 10, borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap", verticalAlign: "top" };
const summaryRow = { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 };
const summaryPill = (type) => ({ display: "flex", gap: 10, alignItems: "center", background: type === "success" ? "#ecfdf5" : type === "danger" ? "#fef2f2" : "#fffbeb", border: "1px solid #e5e7eb", borderRadius: 999, padding: "8px 12px", fontWeight: 900 });
const pill = (type) => ({ display: "inline-block", borderRadius: 999, padding: "5px 9px", fontWeight: 900, background: type === "success" ? "#dcfce7" : type === "danger" ? "#fee2e2" : type === "warning" ? "#fef3c7" : "#e2e8f0", color: type === "success" ? "#166534" : type === "danger" ? "#991b1b" : type === "warning" ? "#92400e" : "#475569" });
const input = { border: "1px solid #cbd5e1", borderRadius: 10, padding: "10px 12px", fontWeight: 700 };
const qtyInput = { ...input, width: 110 };
const smallInput = { ...input, width: 180 };
const textarea = { ...input, width: "100%", minHeight: 90, marginTop: 14 };
const labelStyle = { display: "block", fontSize: 12, fontWeight: 900, color: "#475569", marginBottom: 6 };
const formGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 };
const secondaryButton = { background: "#0f172a", color: "white", border: "none", padding: "11px 16px", borderRadius: 10, cursor: "pointer", fontWeight: 900 };
const miniButton = { background: "#0f766e", color: "white", border: "none", borderRadius: 8, padding: "7px 10px", fontWeight: 900, cursor: "pointer", fontSize: 12 };
const closeButton = { background: "#0f766e", color: "white", border: "none", padding: "14px 22px", borderRadius: 12, cursor: "pointer", fontWeight: 900 };
const disabledButton = { ...closeButton, background: "#94a3b8", cursor: "not-allowed" };
const closePanel = { ...panel, display: "flex", justifyContent: "space-between", alignItems: "center" };
const muted = { color: "#64748b", marginTop: 6 };
const warningBox = { background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12, padding: 12, fontWeight: 800, marginBottom: 12 };
const statusBox = { position: "sticky", bottom: 16, background: "#0f172a", color: "white", padding: 14, borderRadius: 12, fontWeight: 900 };
