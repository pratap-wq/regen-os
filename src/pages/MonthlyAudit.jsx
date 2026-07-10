import { useEffect, useMemo, useRef, useState } from "react";
import { apiCall } from "../api/api";
import { calculateControlRoomDifferenceValue } from "../services/monthCloseEngine";
import { savePhysicalCount } from "../services/physicalCountService";
import { requireSuccessfulResponse, withRequestTimeout } from "../utils/requestSafety";

const MANUFACTURING_GROUPS = ["RM", "VIRGIN", "BATTERY", "WIP", "FG", "REWORK", "WASTE", "ADDITIVE"];
const FIRST_SYSTEM_CLOSE_MONTH = "2026-06";

export default function MonthlyAudit() {
  const now = new Date();
  const [month, setMonth] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  );
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [controlRoom, setControlRoom] = useState(() => emptyControlRoom(month));
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
  const [showDebug, setShowDebug] = useState(false);
  const [saving, setSaving] = useState(false);
  const [closing, setClosing] = useState(false);
  const [approvingKey, setApprovingKey] = useState("");
  const writeLockRef = useRef(false);

  useEffect(() => {
    loadAll();
  }, [month]);

  async function loadAll() {
    setLoading(true);
    setStatus("");
    try {
      const res = await monthCloseControlRoomCall(month);
      if (!res || res.ok === false) {
        const step = res?.failedStep ? ` (${res.failedStep})` : "";
        throw new Error((res?.error || "Month Close failed to load") + step);
      }

      setControlRoom(res);
      const nextPhysicalLines = {};
      const nextReasons = {};
      (res.stockRows || []).forEach((row) => {
        const config = controlRoomStockConfig(row.stockType);
        nextPhysicalLines[config.key] = row.actualKg === null || row.actualKg === undefined ? "" : row.actualKg;
        nextReasons[config.key] = row.reason || "";
      });
      setPhysicalMaterialLines(nextPhysicalLines);
      setAdjustmentReasons(nextReasons);
      setPhysical((prev) => ({
        ...prev,
        productionSignoff: res.signoffs?.production || "",
        storesSignoff: res.signoffs?.stores || "",
        accountsSignoff: res.signoffs?.accounts || "",
        ceoSignoff: res.signoffs?.ceo || "Pratap",
        remarks: res.signoffs?.remarks || "",
      }));
      return res;
    } catch (err) {
      console.log("monthClose.controlRoom", err);
      setStatus(err.message || "Month Close failed to load.");
      return null;
    } finally {
      setLoading(false);
    }
  }

  const productionSummary = controlRoom.productionSummary || {};
  const moneySummary = controlRoom.moneySummary || {};
  const closeStatus = controlRoom.closeStatus || {};
  const materialLines = useMemo(
    () => buildControlRoomStockLines(controlRoom, physicalMaterialLines),
    [controlRoom, physicalMaterialLines]
  );
  const openingDebug = {
    periodMonth: closeStatus.previousClosedMonth || "",
    isFirstSystemMonth: Boolean(closeStatus.firstSystemMonth),
    rule: closeStatus.firstSystemMonth
      ? "Opening is zero for first system month"
      : closeStatus.previousClosedMonth
      ? "Opening comes from previous approved system close"
      : "Immediate previous system close required",
  };
  const monthClosed = Boolean(closeStatus.isClosed);

  const readiness = useMemo(() => {
    const physicalPending = materialLines.filter((line) => !line.hasPhysical).length;
    const openingPending = materialLines.filter((line) => line.openingEditable && !line.hasOpening).length;
    const openingBlocked = materialLines.filter((line) => line.openingBlocked).length;
    const approvalPending = materialLines.filter((line) => line.statusType === "warning").length;
    const differenceLines = materialLines.filter((line) => line.statusType === "danger");
    const differenceReasonPending = differenceLines.filter((line) => !String(adjustmentReasons[line.key] || "").trim()).length;
    const productionDone = num(productionSummary.totalExtruderFeedKg) > 0 && num(productionSummary.fgProducedKg) > 0;
    const dispatchDone = num(productionSummary.dispatchedKg) > 0;
    const expensesEntered = num(moneySummary.factoryExpenses) > 0 || num(moneySummary.storesCost) > 0;
    const physicalDone = materialLines.length > 0 && physicalPending === 0;
    const openingOk = openingPending === 0 && openingBlocked === 0;
    const differencesResolvedOrExplained = physicalDone && approvalPending === 0 && differenceReasonPending === 0;
    const signoffsComplete = [
      physical.productionSignoff,
      physical.storesSignoff,
      physical.accountsSignoff,
      physical.ceoSignoff,
    ].every((value) => String(value || "").trim());

    return [
      {
        title: "Opening Stock Ready?",
        ok: openingOk,
        next: openingBlocked > 0
          ? "Close the immediate previous month first"
          : openingPending > 0
          ? `${openingPending} opening value(s) pending`
          : "Opening stock ready",
      },
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
        title: "Actual Stock Entered?",
        ok: physicalDone,
        next: physicalDone ? "Actual stock entered" : `${physicalPending || materialLines.length || 0} stock row(s) pending`,
      },
      {
        title: "Differences Resolved?",
        ok: differencesResolvedOrExplained,
        next:
          approvalPending > 0
            ? `${approvalPending} approval pending`
            : differenceReasonPending > 0
            ? `${differenceReasonPending} difference reason(s) pending`
            : differenceLines.length > 0
            ? "Differences have reasons"
            : "All differences resolved",
      },
      {
        title: "Production Sign-Off?",
        ok: Boolean(String(physical.productionSignoff || "").trim()),
        next: physical.productionSignoff ? "Production signed" : "Production sign-off pending",
      },
      {
        title: "Stores Sign-Off?",
        ok: Boolean(String(physical.storesSignoff || "").trim()),
        next: physical.storesSignoff ? "Stores signed" : "Stores sign-off pending",
      },
      {
        title: "Accounts Sign-Off?",
        ok: Boolean(String(physical.accountsSignoff || "").trim()),
        next: physical.accountsSignoff ? "Accounts signed" : "Accounts sign-off pending",
      },
      {
        title: "CEO Sign-Off?",
        ok: Boolean(String(physical.ceoSignoff || "").trim()),
        next: monthClosed ? "Month closed" : physical.ceoSignoff ? "CEO signed" : "CEO sign-off pending",
      },
      {
        title: "All Sign-Offs Done?",
        ok: signoffsComplete,
        next: monthClosed ? "Month closed" : signoffsComplete ? "Sign-off complete" : "Complete sign-off",
      },
    ];
  }, [productionSummary, moneySummary, materialLines, physical, monthClosed, adjustmentReasons]);

  const readyToClose = !monthClosed && Boolean(closeStatus.canClose);
  const busy = loading || saving || closing || Boolean(approvingKey);

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

    const res = requireSuccessfulResponse(await withRequestTimeout(savePhysicalCount(month, {
      ...physical,
      ...totals,
      materialPhysicalLinesJson: JSON.stringify(physicalRows),
      savedBy: physical.ceoSignoff || physical.accountsSignoff || "Month Close",
    })), "countId", "Physical stock save");
    if (!silent) setStatus("Physical stock saved.");
    return res;
  }

  async function approveAdjustment(line) {
    if (writeLockRef.current || approvingKey || saving || closing) return;
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

    writeLockRef.current = true;
    setApprovingKey(line.key);
    setStatus("Approving...");
    try {
      await savePhysicalSnapshot({ silent: true });
      requireSuccessfulResponse(await withRequestTimeout(apiCall({
        fn: "inventoryAdjustments.approveMonthClose",
        periodMonth: month,
        closeMonth: month,
        date: `${month}-01`,
        module: "MONTH_CLOSE",
        itemType: line.adjustmentItemType || line.group,
        materialId: line.materialId,
        materialCode: line.materialCode,
        itemCode: line.adjustmentItemName || line.materialName,
        material: line.adjustmentItemName || line.materialName,
        stage: line.group,
        systemQty: line.systemClosing,
        physicalQty: line.physicalKg,
        differenceQty: line.remainingKg,
        value: calculateControlRoomDifferenceValue(line, controlRoom),
        reason,
        remarks: physical.remarks || "",
        sourceRef: `MONTH_CLOSE:${month}:${line.key}`,
        approvedBy: physical.accountsSignoff || physical.ceoSignoff || "Month Close",
      })), "", "Difference approval");
      await loadAll();
      setStatus("Difference approved.");
    } catch (err) {
      setStatus(err.message || "Difference approval failed.");
    } finally {
      writeLockRef.current = false;
      setApprovingKey("");
    }
  }

  async function saveActualStock() {
    if (writeLockRef.current) return;
    writeLockRef.current = true;
    setSaving(true);
    setStatus("Saving...");
    try {
      await savePhysicalSnapshot({ silent: true });
      await loadAll();
      setStatus("Actual stock saved.");
    } catch (err) {
      setStatus(err.message || "Actual stock save failed.");
    } finally {
      writeLockRef.current = false;
      setSaving(false);
    }
  }
  async function saveSignoffs() {
    if (writeLockRef.current || saving || closing) return;
    writeLockRef.current = true;
    setSaving(true);
    try {
      setStatus("Saving physical stock and sign-off...");
      await savePhysicalSnapshot({ silent: true });
      await loadAll();
      setStatus("Sign-off saved.");
    } catch (err) {
      setStatus(err.message || "Save failed.");
    } finally {
      writeLockRef.current = false;
      setSaving(false);
    }
  }
  async function closeMonth() {
    if (writeLockRef.current || closing || saving) return;
    if (monthClosed) {
      setStatus("This month is already closed.");
      return;
    }
    if (!readyToClose) {
      setStatus("Month cannot be closed yet. Enter actual stock, add reasons for differences, and complete sign-off.");
      return;
    }
    if (!window.confirm(`Close ${monthLabel(month)}?`)) return;
    writeLockRef.current = true;
    setClosing(true);
    setStatus("Closing...");
    try {
      await savePhysicalSnapshot({ silent: true });
      const res = requireSuccessfulResponse(await withRequestTimeout(apiCall({
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
        rmInwardKg: productionSummary.recycledRmReceivedKg,
        washInputKg: productionSummary.rmUsedKg,
        washedOutputKg: 0,
        sortingInputKg: 0,
        sortingAcceptedKg: 0,
        extrusionInputKg: productionSummary.totalExtruderFeedKg,
        fgProducedKg: productionSummary.fgProducedKg,
        dispatchKg: productionSummary.dispatchedKg,
        salesValue: moneySummary.salesValue,
        factoryExpenses: moneySummary.factoryExpenses,
        storesIssueQty: moneySummary.storesCost,
        estimatedRmConsumedValue: moneySummary.rmCost,
        manufacturingProfit: moneySummary.estimatedManufacturingProfit,
        overallRecovery: productionSummary.recoveryPercent,
        exceptions: JSON.stringify(materialLines.map((line) => ({
          key: line.key,
          stockType: line.materialName,
          category: line.group,
          openingKg: line.opening,
          flowInKg: line.flowIn,
          flowOutKg: line.flowOut,
          systemKg: line.systemClosing,
          physicalKg: line.physicalKg,
          hasPhysical: line.hasPhysical,
          differenceKg: line.remainingKg,
          reason: adjustmentReasons[line.key] || "",
          status: line.status,
        }))),
        productionSignoff: physical.productionSignoff,
        storesSignoff: physical.storesSignoff,
        accountsSignoff: physical.accountsSignoff,
        ceoSignoff: physical.ceoSignoff,
        remarks: physical.remarks,
      })), "closeId", "Month close");
      await loadAll();
      setStatus(`Month closed successfully: ${res.closeId}`);
    } catch (err) {
      setStatus(err.message || "Month close failed.");
    } finally {
      writeLockRef.current = false;
      setClosing(false);
    }
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
          <button onClick={loadAll} disabled={busy} style={busy ? disabledSmallButton : secondaryButton}>{loading ? "Loading..." : "Refresh"}</button>
        </div>
      </div>

      <div style={monthBanner}>
        <b>{monthLabel(month)} Status:</b>{" "}
        {formatTon(productionSummary.fgProducedKg)} Produced | {formatTon(productionSummary.dispatchedKg)} Dispatched | {materialLines.filter((x) => x.statusType === "danger" || x.statusType === "warning").length} Differences Pending | {readyToClose ? "Can Close" : "Action Required"}
      </div>
      {openingDebug.isFirstSystemMonth && (
        <div style={muted}>First system month: opening stock is treated as zero. Closing stock will become next month's opening.</div>
      )}

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
                  "Received / Added",
                  "Used / Moved Out",
                  "System Closing",
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
                        onBlur={saveActualStock}
                        type="number"
                        placeholder="Opening"
                        style={qtyInput}
                      />
                    ) : (
                      <div>
                        <div>{formatKg(line.opening)}</div>
                        <div style={tinyMuted}>{line.openingSource}</div>
                      </div>
                    )}
                  </td>
                  <td style={td}>{formatKg(line.flowIn)}</td>
                  <td style={td} title={movementOutTitle(line)}>
                    <div>{formatKg(line.flowOut)}</div>
                    {line.flowOutNote && <div style={tinyMuted}>{line.flowOutNote}</div>}
                  </td>
                  <td style={td}>{formatKg(line.systemClosing)}</td>
                  <td style={td}>
                    <input
                      value={physicalMaterialLines[line.key] ?? ""}
                      onChange={(e) => onPhysicalChange(line.key, e.target.value)}
                      onBlur={saveActualStock}
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
                      <button onClick={() => approveAdjustment(line)} disabled={busy} style={busy ? disabledMiniButton : miniButton}>{approvingKey === line.key ? "Approving..." : "Approve Difference"}</button>
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
          <StatusPill label="Opening" count={formatQtyCount(controlRoom.storesSummary?.openingKg)} type="success" />
          <StatusPill label="Inward" count={formatQtyCount(controlRoom.storesSummary?.inwardKg)} type="success" />
          <StatusPill label="Issued" count={formatQtyCount(controlRoom.storesSummary?.issuedKg)} type="warning" />
          <StatusPill label="Closing" count={formatQtyCount(controlRoom.storesSummary?.closingKg)} type="success" />
        </div>
        <div style={muted}>Stores are summarized here so consumable items do not crowd the manufacturing stock table.</div>
      </Section>

      <div style={debugToggleRow}>
        <button onClick={() => setShowDebug((value) => !value)} style={debugButton}>
          {showDebug ? "Hide Debug" : "Show Debug"}
        </button>
      </div>
      {showDebug && (
        <>
          <Section title="Control Room Timing">
            <div style={muted}>Developer timing from the single Month Close backend request.</div>
            <ReconTable
              rows={[
                ["Previous close lookup", `${num(controlRoom.timings?.previousCloseLookup)} ms`, "text"],
                ["Ledger summary", `${num(controlRoom.timings?.ledgerSummary)} ms`, "text"],
                ["Production summary", `${num(controlRoom.timings?.productionSummary)} ms`, "text"],
                ["Cost summary", `${num(controlRoom.timings?.costSummary)} ms`, "text"],
                ["Physical count", `${num(controlRoom.timings?.physicalCount)} ms`, "text"],
                ["Adjustments", `${num(controlRoom.timings?.adjustments)} ms`, "text"],
                ["Total elapsed", `${num(controlRoom.elapsedMs)} ms`, "text"],
              ]}
            />
          </Section>
          <Section title="Close Checks">
            <div style={muted}>All checks come from monthClose.controlRoom.</div>
            {(closeStatus.blockers || []).length ? (
              <ul>{closeStatus.blockers.map((blocker) => <li key={blocker}>{blocker}</li>)}</ul>
            ) : (
              <div style={muted}>No backend blockers.</div>
            )}
          </Section>
        </>
      )}
      <div style={twoColumn}>
        <Section title="Production Summary">
          <ReconTable
            rows={[
              ["RM Received (Recycled RM)", productionSummary.recycledRmReceivedKg],
              ["Virgin Received", productionSummary.virginReceivedKg],
              ["Battery Received", productionSummary.batteryReceivedKg],
              ["Additives Received", productionSummary.additivesReceivedKg],
              ["Total Extruder Feed", productionSummary.totalExtruderFeedKg],
              ["RM Used", productionSummary.rmUsedKg],
              ["FG Produced", productionSummary.fgProducedKg],
              ["Dispatched", productionSummary.dispatchedKg],
              ["Waste / Rework", productionSummary.wasteReworkKg],
              ["Recovery %", productionSummary.recoveryPercent, "percent"],
            ]}
          />
        </Section>

        <Section title="Money Summary">
          <ReconTable
            rows={[
              ["Sales", moneySummary.salesValue, "currency"],
              ["RM Cost", moneySummary.rmCost, "currency"],
              ["Stores Cost", moneySummary.storesCost, "currency"],
              ["Factory Expenses", moneySummary.factoryExpenses, "currency"],
              [
                "Estimated Manufacturing Profit",
                moneySummary.costDataComplete ? moneySummary.estimatedManufacturingProfit : "Cost data incomplete",
                moneySummary.costDataComplete ? "currency" : "text",
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
        <button onClick={saveSignoffs} disabled={saving || closing} style={saving || closing ? disabledSmallButton : secondaryButton}>{saving ? "Saving..." : "Save Sign-Off"}</button>
      </Section>

      <div style={closePanel}>
        <div>
          <h2 style={{ margin: 0 }}>Close Month</h2>
          <div style={muted}>Close is allowed only after actual stock, differences, and sign-off are complete.</div>
        </div>
        <button onClick={closeMonth} disabled={!readyToClose || closing || saving} style={readyToClose && !closing && !saving ? closeButton : disabledButton}>
          {closing ? "Closing..." : monthClosed ? "Month Closed" : "Close Month"}
        </button>
      </div>

      {status && <div style={statusBox}>{status}</div>}
    </div>
  );
}

const CONTROL_ROOM_TIMEOUT_MS = 25000;

function emptyControlRoom(periodMonth = "") {
  return {
    ok: true,
    periodMonth,
    elapsedMs: 0,
    timings: {},
    closeStatus: {
      isClosed: false,
      canClose: false,
      blockers: [],
      previousClosedMonth: "",
      firstSystemMonth: periodMonth === FIRST_SYSTEM_CLOSE_MONTH,
    },
    productionSummary: {},
    stockRows: [],
    moneySummary: {},
    signoffs: {},
    adjustmentSummary: {},
    storesSummary: {},
  };
}

async function monthCloseControlRoomCall(periodMonth) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      const error = new Error("Month Close load timed out. Check Apps Script deployment and try again.");
      error.code = "MONTH_CLOSE_TIMEOUT";
      reject(error);
    }, CONTROL_ROOM_TIMEOUT_MS);
  });

  return Promise.race([
    apiCall({ fn: "monthClose.controlRoom", periodMonth }),
    timeout,
  ]).finally(() => clearTimeout(timeoutId));
}

function controlRoomStockConfig(stockType) {
  const configs = {
    "RM Stock": {
      key: "FLOW|RM",
      group: "RM",
      materialId: "FLOW|RM",
      materialCode: "RM",
      adjustmentItemName: "RM Stock",
      adjustmentItemType: "RM",
    },
    "Virgin Polymer Stock": {
      key: "FLOW|VIRGIN_POLYMER",
      group: "VIRGIN",
      materialId: "FLOW|VIRGIN_POLYMER",
      materialCode: "VIRGIN",
      adjustmentItemName: "Virgin PPCP",
      adjustmentItemType: "ADDITIVE",
    },
    "Battery Material Stock": {
      key: "FLOW|BATTERY_MATERIAL",
      group: "BATTERY",
      materialId: "FLOW|BATTERY_MATERIAL",
      materialCode: "BATTERY",
      adjustmentItemName: "Battery PPCP",
      adjustmentItemType: "RM",
    },
    "WIP Stock": {
      key: "FLOW|WIP",
      group: "WIP",
      materialId: "FLOW|WIP",
      materialCode: "WIP",
      adjustmentItemName: "WIP Stock",
      adjustmentItemType: "WIP",
    },
    "FG Stock": {
      key: "FLOW|FG",
      group: "FG",
      materialId: "FLOW|FG",
      materialCode: "FG",
      adjustmentItemName: "FG Stock",
      adjustmentItemType: "FG",
    },
    "Waste / Rework Stock": {
      key: "FLOW|WASTE_REWORK",
      group: "WASTE",
      materialId: "FLOW|WASTE_REWORK",
      materialCode: "WASTE",
      adjustmentItemName: "Waste / Rework Stock",
      adjustmentItemType: "WASTE",
    },
    "Stores Stock": {
      key: "FLOW|STORES",
      group: "STORE",
      materialId: "FLOW|STORES",
      materialCode: "STORE",
      adjustmentItemName: "Stores Stock",
      adjustmentItemType: "STORE",
    },
  };

  return configs[stockType] || {
    key: `FLOW|${String(stockType || "UNKNOWN").toUpperCase().replace(/[^A-Z0-9]+/g, "_")}`,
    group: "UNKNOWN",
    materialId: "",
    materialCode: "",
    adjustmentItemName: stockType || "Stock",
    adjustmentItemType: "",
  };
}

function buildControlRoomStockLines(controlRoom, physicalMaterialLines) {
  const firstSystemMonth = Boolean(controlRoom.closeStatus?.firstSystemMonth);
  const previousClosedMonth = controlRoom.closeStatus?.previousClosedMonth || "";
  const openingBlocked = !firstSystemMonth && !previousClosedMonth;

  return (controlRoom.stockRows || []).map((row) => {
    const config = controlRoomStockConfig(row.stockType);
    const localPhysical = physicalMaterialLines[config.key];
    const hasPhysical = localPhysical !== "" && localPhysical !== null && localPhysical !== undefined;
    const physicalKg = hasPhysical ? num(localPhysical) : 0;
    const differenceKg = hasPhysical
      ? physicalKg - num(row.systemClosingKg)
      : num(row.differenceKg);
    let status = row.status || "Actual Stock Pending";

    if (hasPhysical) {
      status = Math.abs(differenceKg) <= 0.01 ? "Reconciled" : "Check Difference";
    }
    if (row.status === "Approval Pending" && hasPhysical && Math.abs(differenceKg) > 0.01) {
      status = "Approval Pending";
    }

    const statusType =
      status === "Reconciled"
        ? "success"
        : status === "Approval Pending"
        ? "warning"
        : status === "Check Difference" || status === "Previous Close Pending"
        ? "danger"
        : "pending";

    return {
      ...config,
      materialName: row.stockType,
      opening: num(row.openingKg),
      openingEditable: false,
      openingBlocked,
      hasOpening: true,
      openingSource: firstSystemMonth
        ? "First system month"
        : previousClosedMonth
        ? `Previous approved close: ${previousClosedMonth}`
        : "Previous close required",
      flowIn: num(row.inKg),
      flowOut: num(row.outKg),
      flowOutNote: "",
      flowOutBreakdown: [],
      inward: config.group === "RM" || config.group === "STORE" ? num(row.inKg) : 0,
      produced: ["WIP", "FG", "WASTE"].includes(config.group) ? num(row.inKg) : 0,
      consumed: ["RM", "WIP"].includes(config.group) ? num(row.outKg) : 0,
      dispatched: config.group === "FG" ? num(row.outKg) : 0,
      issued: config.group === "STORE" ? num(row.outKg) : 0,
      approvedAdjustments: 0,
      systemClosing: num(row.systemClosingKg),
      physicalKg,
      physicalValue: hasPhysical ? localPhysical : "",
      hasPhysical,
      differenceKg,
      remainingKg: differenceKg,
      pendingAdjustmentKg: status === "Approval Pending" ? differenceKg : 0,
      status,
      statusType,
    };
  });
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
  const openingContext = getOpeningContext(rows.closeRows, month);
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
      openingContext,
      physicalMaterialLines,
      month,
      adjustments: rows.adjustments,
    }),
    createFlowStockLine({
      key: "FLOW|VIRGIN_POLYMER",
      materialName: "Virgin Polymer Stock",
      group: "VIRGIN",
      flowIn: close.production.virginReceivedKg,
      flowOut: close.production.virginAddedKg,
      adjustmentItemName: "Virgin PPCP",
      adjustmentItemType: "ADDITIVE",
      openingContext,
      physicalMaterialLines,
      month,
      adjustments: rows.adjustments,
    }),
    createFlowStockLine({
      key: "FLOW|BATTERY_MATERIAL",
      materialName: "Battery Material Stock",
      group: "BATTERY",
      flowIn: close.production.batteryReceivedKg,
      flowOut: close.production.batteryMaterialKg,
      adjustmentItemName: "Battery PPCP",
      adjustmentItemType: "RM",
      openingContext,
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
      flowOutNote: "FG Produced + Waste/Rework Generated",
      flowOutBreakdown: [
        ["FG Produced", close.production.fgProducedKg],
        ["Waste/Rework Generated", wasteReworkGenerated],
      ],
      openingContext,
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
      openingContext,
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
      flowOutNote: "Disposed/reused not recorded separately",
      openingContext,
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
      openingContext,
      physicalMaterialLines,
      month,
      adjustments: rows.adjustments,
    }),
  ];
}

function createFlowStockLine({ key, materialName, group, flowIn, flowOut, flowOutNote, flowOutBreakdown = [], adjustmentItemName, adjustmentItemType, openingContext, physicalMaterialLines, month, adjustments }) {
  const previousClose = openingContext?.previousClose || null;
  const openingEditable = false;
  const openingBlocked = openingContext?.mode === "PREVIOUS_CLOSE_REQUIRED";
  const openingValue = physicalMaterialLines[openingKey(key)];
  const hasOpening = !openingEditable || (openingValue !== "" && openingValue !== undefined && openingValue !== null);
  const opening = openingEditable
    ? num(openingValue)
    : openingContext?.mode === "FIRST_SYSTEM_MONTH"
    ? 0
    : previousClose
    ? getPreviousClosingForFlow(previousClose, key, group)
    : 0;
  const related = (adjustments || []).filter((a) => {
    const sameMonth = String(a.periodMonth || a.closeMonth || "").slice(0, 7) === String(month);
    const sameSource = String(a.sourceRef || "") === `MONTH_CLOSE:${month}:${key}`;
    const sameItem =
      String(a.itemCode || a.material || a.materialName || "").toUpperCase() === String(adjustmentItemName || materialName).toUpperCase() ||
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
  if (openingBlocked) {
    status = "Previous Close Pending";
    statusType = "danger";
  } else if (openingEditable && !hasOpening) {
    status = "Opening Pending";
    statusType = "pending";
  } else if (hasPhysical && Math.abs(differenceKg) <= 0.01) {
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
    adjustmentItemName: adjustmentItemName || materialName,
    adjustmentItemType: adjustmentItemType || group,
    group,
    opening,
    openingEditable,
    openingBlocked,
    hasOpening,
    openingSource:
      openingContext?.mode === "FIRST_SYSTEM_MONTH"
        ? "First system month"
        : openingContext?.mode === "PREVIOUS_CLOSE_REQUIRED"
        ? "Previous close required"
        : previousClose
        ? `Previous approved close: ${previousClose.periodMonth}`
        : "First system month",
    flowIn: num(flowIn),
    flowOut: num(flowOut),
    flowOutNote,
    flowOutBreakdown,
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

function getOpeningContext(closeRows = [], month) {
  const selectedMonth = String(month || "").slice(0, 7);
  const closedRows = closeRows
    .filter((row) => String(row.status || "").toUpperCase() === "CLOSED")
    .filter((row) => String(row.periodMonth || "").slice(0, 7) >= FIRST_SYSTEM_CLOSE_MONTH)
    .filter((row) => String(row.periodMonth || "").slice(0, 7) < selectedMonth);
  const previousMonth = getPreviousMonth(month);
  const previousClose = closedRows.find((row) => String(row.periodMonth || "").slice(0, 7) === previousMonth) || null;
  if (previousClose) return { mode: "PREVIOUS_CLOSE", previousClose };
  if (closedRows.length === 0) return { mode: "FIRST_SYSTEM_MONTH", previousClose: null };
  return { mode: "PREVIOUS_CLOSE_REQUIRED", previousClose: null };
}

function getOpeningDebug(closeRows = [], month) {
  const context = getOpeningContext(closeRows, month);
  const previousClose = context.previousClose || null;
  return {
    periodMonth: previousClose?.periodMonth || "",
    isFirstSystemMonth: context.mode === "FIRST_SYSTEM_MONTH",
    rule:
      context.mode === "FIRST_SYSTEM_MONTH"
        ? "Opening is zero for first system month"
        : context.mode === "PREVIOUS_CLOSE"
        ? "Opening comes from previous approved system close"
        : "Immediate previous system close required",
  };
}

function getPreviousMonth(month) {
  const [year, mm] = String(month || "").split("-").map(Number);
  if (!year || !mm) return "";
  const date = new Date(year, mm - 2, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
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

function movementOutTitle(line) {
  if (!line?.flowOutBreakdown?.length) return line?.flowOutNote || "";
  return line.flowOutBreakdown
    .map(([label, value]) => `${label}: ${formatKg(value)}`)
    .join(" + ");
}

function formatQtyCount(value) {
  return num(value).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function formatMaterialBreakdown(items = {}) {
  const rows = Object.entries(items)
    .filter(([, qty]) => Math.abs(num(qty)) > 0.01)
    .sort(([a], [b]) => a.localeCompare(b));
  if (!rows.length) return "-";
  return rows.map(([name, qty]) => `${name}: ${formatKg(qty)}`).join(" | ");
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
const disabledSmallButton = { ...secondaryButton, background: "#94a3b8", cursor: "not-allowed" };
const disabledMiniButton = { ...miniButton, background: "#94a3b8", cursor: "not-allowed" };
const debugToggleRow = { display: "flex", justifyContent: "flex-end", margin: "-8px 0 18px" };
const debugButton = { background: "#e2e8f0", color: "#334155", border: "1px solid #cbd5e1", borderRadius: 999, padding: "7px 12px", fontWeight: 900, cursor: "pointer", fontSize: 12 };
const tinyMuted = { color: "#64748b", fontSize: 11, marginTop: 3 };
const closePanel = { ...panel, display: "flex", justifyContent: "space-between", alignItems: "center" };
const muted = { color: "#64748b", marginTop: 6 };
const warningBox = { background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12, padding: 12, fontWeight: 800, marginBottom: 12 };
const statusBox = { position: "sticky", bottom: 16, background: "#0f172a", color: "white", padding: 14, borderRadius: 12, fontWeight: 900 };
