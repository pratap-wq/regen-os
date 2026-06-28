import { n, safeDiv, filterByMonth } from "./costEngine";

export function calculateInventoryEngine({
  rmRows = [],
  washRows = [],
  sortingRows = [],
  extrusionRows = [],
  dispatchRows = [],
  storesInwardRows = [],
  storesIssueRows = [],
  month,
  year,
}) {
  const rm = filterByMonth(rmRows, month, year);
  const wash = filterByMonth(washRows, month, year);
  const sorting = filterByMonth(sortingRows, month, year);
  const extrusion = filterByMonth(extrusionRows, month, year);
  const dispatch = filterByMonth(dispatchRows, month, year);
  const storesInward = filterByMonth(storesInwardRows, month, year);
  const storesIssue = filterByMonth(storesIssueRows, month, year);

  const rmPurchasedKg = rm.reduce((s, r) => s + n(r.netWeight), 0);
  const rmValue = rm.reduce((s, r) => s + n(r.netWeight) * n(r.ratePerKg), 0);
  const avgRmRate = safeDiv(rmValue, rmPurchasedKg);

  const rmConsumedKg = wash.reduce((s, r) => s + n(r.inputWeightKg), 0);
  const rmStockKg = rmPurchasedKg - rmConsumedKg;

  const washOutputKg = wash.reduce((s, r) => s + n(r.washedOutputKg), 0);
  const sortingInputKg = sorting.reduce((s, r) => s + n(r.inputWeightKg), 0);
  const washStockKg = washOutputKg - sortingInputKg;

  const sortingOutputKg = sorting.reduce(
    (s, r) =>
      s +
      (n(r.acceptedQtyKg) ||
        n(r.whiteSortedKg) +
          n(r.whiteGreyKg) +
          n(r.commodityKg) +
          n(r.allMixSortedKg)),
    0
  );

  const extrusionInputKg = extrusion.reduce(
    (s, r) => s + n(r.totalInputKg || r.inputWeightKg),
    0
  );

  const sortedStockKg = sortingOutputKg - extrusionInputKg;

  const fgProducedKg = extrusion.reduce((s, r) => s + n(r.fgOutputKg), 0);
  const fgDispatchedKg = dispatch.reduce((s, r) => s + n(r.quantityKg), 0);
  const fgStockKg = fgProducedKg - fgDispatchedKg;

  const lumpsKg = extrusion.reduce((s, r) => s + n(r.lumpsKg), 0);
  const purgingKg = extrusion.reduce((s, r) => s + n(r.purgingKg), 0);
  const reworkKg = extrusion.reduce((s, r) => s + n(r.reworkGranulesKg), 0);
  const recoverableKg = lumpsKg + purgingKg + reworkKg;

  const storeMap = {};

  storesInward.forEach((r) => {
    const item = r.itemName || "Unknown";
    const qty = n(r.qty);
    const value = n(r.totalAmount || qty * n(r.rate));

    if (!storeMap[item]) {
      storeMap[item] = {
        itemName: item,
        category: r.category || "",
        inwardQty: 0,
        inwardValue: 0,
        issuedQty: 0,
        issuedValue: 0,
      };
    }

    storeMap[item].inwardQty += qty;
    storeMap[item].inwardValue += value;
  });

  storesIssue.forEach((r) => {
    const item = r.itemName || "Unknown";
    const qty = n(r.qty);
    const value = n(r.issueValue || qty * n(r.issueRate || r.rate));

    if (!storeMap[item]) {
      storeMap[item] = {
        itemName: item,
        category: r.category || "",
        inwardQty: 0,
        inwardValue: 0,
        issuedQty: 0,
        issuedValue: 0,
      };
    }

    storeMap[item].issuedQty += qty;
    storeMap[item].issuedValue += value;
  });

  const stores = Object.values(storeMap).map((x) => {
    const avgRate = safeDiv(x.inwardValue, x.inwardQty);
    const stockQty = x.inwardQty - x.issuedQty;
    const stockValue = stockQty * avgRate;

    return {
      ...x,
      avgRate,
      stockQty,
      stockValue,
    };
  });

  const storesValue = stores.reduce((s, r) => s + n(r.stockValue), 0);

  return {
    rm: {
      purchasedKg: rmPurchasedKg,
      consumedKg: rmConsumedKg,
      stockKg: rmStockKg,
      avgRate,
      value: rmStockKg * avgRmRate,
    },
    wash: {
      producedKg: washOutputKg,
      consumedKg: sortingInputKg,
      stockKg: washStockKg,
      avgRate: avgRmRate,
      value: washStockKg * avgRmRate,
    },
    sorting: {
      producedKg: sortingOutputKg,
      consumedKg: extrusionInputKg,
      stockKg: sortedStockKg,
      avgRate: avgRmRate,
      value: sortedStockKg * avgRmRate,
    },
    fg: {
      producedKg: fgProducedKg,
      dispatchedKg: fgDispatchedKg,
      stockKg: fgStockKg,
      avgRate: avgRmRate,
      value: fgStockKg * avgRmRate,
    },
    recoverable: {
      lumpsKg,
      purgingKg,
      reworkKg,
      totalKg: recoverableKg,
    },
    stores: {
      rows: stores,
      value: storesValue,
    },
    totalInventoryValue:
      rmStockKg * avgRmRate +
      washStockKg * avgRmRate +
      sortedStockKg * avgRmRate +
      fgStockKg * avgRmRate +
      storesValue,
  };
}