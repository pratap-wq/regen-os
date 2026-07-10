// RegenOS Cost Engine
// Single source of truth for ₹/kg calculations

import { dispatchRevenue } from "./dispatchPricing";

export function n(value) {
  const x = Number(value || 0);
  return Number.isFinite(x) ? x : 0;
}

export function round2(value) {
  return Math.round(n(value) * 100) / 100;
}

export function kgToTon(kg) {
  return n(kg) / 1000;
}

export function safeDiv(a, b) {
  return n(b) > 0 ? n(a) / n(b) : 0;
}

export function filterActive(rows = []) {
  return rows.filter((r) => {
    const status = String(r.status || "").toUpperCase();
    const inwardStatus = String(r.inwardStatus || "").toUpperCase();
    const issueStatus = String(r.issueStatus || "").toUpperCase();
    const dispatchStatus = String(r.dispatchStatus || "").toUpperCase();

    return (
      status !== "DELETED" &&
      inwardStatus !== "DELETED" &&
      issueStatus !== "DELETED" &&
      dispatchStatus !== "DELETED"
    );
  });
}

export function dateOnly(value) {
  if (!value) return "";

  const text = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
    return text.slice(0, 10);
  }

  return text.slice(0, 10);
}

export function periodMonthOnly(value) {
  if (!value) return "";

  if (typeof value === "number" && Number.isFinite(value)) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const d = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);

    if (!Number.isNaN(d.getTime())) {
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    }
  }

  const text = String(value).trim();

  if (/^\d{4}-\d{2}/.test(text)) {
    return text.slice(0, 7);
  }

  if (/^\d{2}\/\d{2}\/\d{4}/.test(text)) {
    const [, mm, yyyy] = text.slice(0, 10).split("/");
    return `${yyyy}-${mm}`;
  }

  if (/^\d{2}-\d{2}-\d{4}/.test(text)) {
    const [, mm, yyyy] = text.slice(0, 10).split("-");
    return `${yyyy}-${mm}`;
  }

  const d = new Date(text);
  if (!Number.isNaN(d.getTime())) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }

  return "";
}

export function costAmount(row = {}) {
  return n(
    row.amount ||
      row.costAmount ||
      row.monthlyAmount ||
      row.value ||
      row.totalAmount
  );
}

export function filterByMonth(rows = [], month, year) {
  return filterActive(rows).filter((r) => {
    const pm = periodMonthOnly(r.periodMonth || "");
    if (pm) return pm === `${year}-${month}`;

    const d = dateOnly(r.date || r.createdAt || "");
    if (!d) return false;

    const [y, m] = d.split("-");
    return String(y) === String(year) && String(m) === String(month);
  });
}

export function calculateCostEngine({
  rmRows = [],
  washRows = [],
  sortingRows = [],
  extrusionRows = [],
  dispatchRows = [],
  storesIssueRows = [],
  factoryExpenseRows = [],
  month,
  year,
  assumedSellingPrice = 0,
}) {
  const periodMonth = `${year}-${month}`;

  const rm = filterByMonth(rmRows, month, year);
  const wash = filterByMonth(washRows, month, year);
  const sorting = filterByMonth(sortingRows, month, year);
  const extrusion = filterByMonth(extrusionRows, month, year);
  const dispatch = filterByMonth(dispatchRows, month, year);
  const storesIssue = filterByMonth(storesIssueRows, month, year);
  const factoryExpenses = filterByMonth(factoryExpenseRows, month, year);

  const rmPurchasedKg = rm.reduce((s, r) => s + n(r.netWeight), 0);

  const rmBasicPurchaseValue = rm.reduce(
    (s, r) => s + n(r.netWeight) * n(r.ratePerKg),
    0
  );

  const rmTransportValue = rm.reduce((s, r) => {
    const paidBy = String(r.transportPaidBy || "SUPPLIER").toUpperCase();
    return paidBy === "REGEN" ? s + n(r.transportCost) : s;
  }, 0);

  const rmPurchaseValue = rmBasicPurchaseValue + rmTransportValue;
  const avgRmCostPerKg = safeDiv(rmPurchaseValue, rmPurchasedKg);

  const washInputKg = wash.reduce((s, r) => s + n(r.inputWeightKg), 0);
  const washOutputKg = wash.reduce((s, r) => s + n(r.washedOutputKg), 0);
  const washRecoveryPercent = safeDiv(washOutputKg, washInputKg) * 100;

  const sortingInputKg = sorting.reduce((s, r) => s + n(r.inputWeightKg), 0);

  const sortingOutputKg = sorting.reduce(
    (s, r) =>
      s +
      (n(r.acceptedQtyKg) ||
        n(r.whiteSortedKg) +
          n(r.whiteGreyKg) +
          n(r.allMixSortedKg)),
    0
  );

  const sortingRecoveryPercent = safeDiv(sortingOutputKg, sortingInputKg) * 100;

  const extrusionInputKg = extrusion.reduce(
    (s, r) => s + n(r.totalInputKg || r.inputWeightKg),
    0
  );

  const fgProducedKg = extrusion.reduce((s, r) => s + n(r.fgOutputKg), 0);
  const extrusionRecoveryPercent = safeDiv(fgProducedKg, extrusionInputKg) * 100;
  const overallRecoveryPercent = safeDiv(fgProducedKg, washInputKg) * 100;

  const effectiveRmCostPerKg =
    overallRecoveryPercent > 0
      ? avgRmCostPerKg / (overallRecoveryPercent / 100)
      : avgRmCostPerKg;

  const storesIssueValue = storesIssue.reduce((s, r) => {
    const qty = n(r.qty);
    const rate = n(r.issueRate || r.rate);
    const value = n(r.issueValue || qty * rate);
    return s + value;
  }, 0);

  const factoryExpenseValue = factoryExpenses.reduce(
    (s, r) => s + costAmount(r),
    0
  );

  const storesCostPerKg = safeDiv(storesIssueValue, fgProducedKg);
  const factoryCostPerKg = safeDiv(factoryExpenseValue, fgProducedKg);

  const manufacturingCostPerKg =
    effectiveRmCostPerKg + storesCostPerKg + factoryCostPerKg;

  const dispatchKg = dispatch.reduce((s, r) => s + n(r.quantityKg), 0);

  const revenue = dispatchRevenue(dispatch);

  const avgSellingPricePerKg =
    dispatchKg > 0 ? safeDiv(revenue, dispatchKg) : n(assumedSellingPrice);

  const grossMarginPerKg = avgSellingPricePerKg - manufacturingCostPerKg;
  const estimatedProfit = grossMarginPerKg * fgProducedKg;

  return {
    periodMonth,

    rmPurchasedKg,
    rmBasicPurchaseValue,
    rmTransportValue,
    rmPurchaseValue,
    avgRmCostPerKg,

    washInputKg,
    washOutputKg,
    washRecoveryPercent,

    sortingInputKg,
    sortingOutputKg,
    sortingRecoveryPercent,

    extrusionInputKg,
    fgProducedKg,
    extrusionRecoveryPercent,
    overallRecoveryPercent,

    effectiveRmCostPerKg,

    storesIssueValue,
    storesCostPerKg,

    factoryExpenseValue,
    factoryCostPerKg,

    manufacturingCostPerKg,

    dispatchKg,
    revenue,
    avgSellingPricePerKg,
    grossMarginPerKg,
    estimatedProfit,

    waterfall: [
      { label: "Material Landed Cost", value: avgRmCostPerKg },
      { label: "Recovery Loss", value: effectiveRmCostPerKg - avgRmCostPerKg },
      { label: "Stores / Consumables", value: storesCostPerKg },
      { label: "Factory Expenses", value: factoryCostPerKg },
      { label: "Manufacturing Cost", value: manufacturingCostPerKg },
      { label: "Selling Price", value: avgSellingPricePerKg },
      { label: "Gross Margin", value: grossMarginPerKg },
    ],
  };
}
