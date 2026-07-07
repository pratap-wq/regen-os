export function calculateMonthClose({
  rmRows = [],
  washRows = [],
  sortingRows = [],
  extrusionRows = [],
  dispatchRows = [],
  storesIssueRows = [],
  factoryExpenseRows = [],
  factoryCostMasterRows = [],
  storesMasterRows = [],
  periodMonth = "",
}) {
  const rowsInMonth = (rows) =>
    rows.filter((r) => {
      if (String(r.status || "").toUpperCase() === "DELETED") return false;
      if (String(r.inwardStatus || "").toUpperCase() === "DELETED") return false;
      if (String(r.issueStatus || "").toUpperCase() === "DELETED") return false;
      if (String(r.dispatchStatus || "").toUpperCase() === "DELETED") return false;

      const pm = String(r.periodMonth || "").trim();
      if (pm) return pm.slice(0, 7) === periodMonth;

      const value = r.date || r.createdAt || r.timestamp || "";
      if (!value) return false;

      const d = new Date(value);
      if (isNaN(d.getTime())) return String(value).slice(0, 7) === periodMonth;

      return (
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` ===
        periodMonth
      );
    });

  const rm = rowsInMonth(rmRows);
  const wash = rowsInMonth(washRows);
  const sorting = rowsInMonth(sortingRows);
  const extrusion = rowsInMonth(extrusionRows);
  const dispatch = rowsInMonth(dispatchRows);
  const storesIssue = rowsInMonth(storesIssueRows);
  const factoryExpenses = rowsInMonth(factoryExpenseRows);
  const factoryCostMaster = rowsInMonth(factoryCostMasterRows);

  const rmPurchasedKg = sum(rm, "netWeight");
  const rmValue = rm.reduce(
    (s, r) => s + num(r.netWeight) * num(r.ratePerKg),
    0
  );

  const washInputKg = sum(wash, "inputWeightKg");
  const washedOutputKg = sum(wash, "washedOutputKg");

  const sortingInputKg = sum(sorting, "inputWeightKg");
  const sortingAcceptedKg = sorting.reduce(
    (s, r) =>
      s +
      (num(r.acceptedQtyKg) ||
        num(r.whiteSortedKg) +
          num(r.allMixSortedKg) +
          num(r.commodityKg) +
          num(r.whiteGreyKg)),
    0
  );

  const extrusionInputKg = extrusion.reduce(
    (s, r) => s + num(r.inputWeightKg || r.totalInputKg),
    0
  );

  const fgProducedKg = sum(extrusion, "fgOutputKg");
  const dispatchKg = sum(dispatch, "quantityKg");

  const salesValue = dispatch.reduce(
    (s, r) => s + num(r.quantityKg) * num(r.ratePerKg),
    0
  );

  const avgRmPrice = rmPurchasedKg > 0 ? rmValue / rmPurchasedKg : 0;
  const estimatedRmConsumedValue = washInputKg * avgRmPrice;

  const storesIssueValue = storesIssue.reduce((s, r) => {
    const rate =
      num(r.issueRate) ||
      num(r.rate) ||
      getStoreRate(r.itemName, storesMasterRows);

    return s + num(r.issueValue || num(r.qty) * rate);
  }, 0);

  const factoryExpenseValue = factoryExpenses.reduce(
    (s, r) => s + num(r.amount || r.expenseAmount || r.totalAmount || r.value),
    0
  );

  const factoryCostAllocationValue = factoryCostMaster.reduce(
    (s, r) => s + num(r.amount || r.monthlyAmount || r.costAmount || r.value),
    0
  );

  const conversionCost =
    storesIssueValue + factoryExpenseValue + factoryCostAllocationValue;

  const totalManufacturingCost =
    estimatedRmConsumedValue + conversionCost;

  const grossProfit = salesValue - estimatedRmConsumedValue;
  const manufacturingProfit = salesValue - totalManufacturingCost;

  const rmClosingKg = rmPurchasedKg - washInputKg;
  const washClosingKg = washedOutputKg - sortingInputKg;
  const sortingClosingKg = sortingAcceptedKg - extrusionInputKg;
  const fgClosingKg = fgProducedKg - dispatchKg;

  const waste = {
    raffiaKg: sum(wash, "raffiaKg"),
    wrappersKg: sum(wash, "wrappersKg"),
    microPlasticKg: sum(wash, "microPlasticKg"),
    sinkMaterialKg: sum(wash, "sinkMaterialKg"),
    ironScrapKg: sum(wash, "ironScrapKg"),
    otherColorKg: sum(wash, "otherColorKg"),
    washDustKg: sum(wash, "dustKg"),
    sludgeKg: sum(wash, "sludgeKg"),

    sortingRejectKg:
      sum(sorting, "rejectedQtyKg") || sum(sorting, "rejectedWeightKg"),
    rubberRejectKg: sum(sorting, "rubberRejectKg"),
    sorterDustKg: sum(sorting, "dustKg"),

    lumpsKg: sum(extrusion, "lumpsKg"),
    reworkKg: sum(extrusion, "reworkGranulesKg"),
    purgingKg: sum(extrusion, "purgingKg"),
    meshRejectKg: sum(extrusion, "meshRejectKg") || sum(extrusion, "meshRejectionKg"),
    vacuumRejectKg: sum(extrusion, "vacuumRejectKg"),
    extrusionDustKg: sum(extrusion, "dustKg"),
    floorSpillageKg: sum(extrusion, "floorSpillageKg"),
  };

  const recoveryReuseKg =
    waste.lumpsKg + waste.reworkKg + waste.purgingKg;

  const wasteSaleKg =
    waste.raffiaKg +
    waste.wrappersKg +
    waste.sinkMaterialKg +
    waste.ironScrapKg +
    waste.otherColorKg +
    waste.sortingRejectKg +
    waste.rubberRejectKg;

  const trueLossKg =
    waste.microPlasticKg +
    waste.washDustKg +
    waste.sludgeKg +
    waste.sorterDustKg +
    waste.meshRejectKg +
    waste.vacuumRejectKg +
    waste.extrusionDustKg +
    waste.floorSpillageKg;

  const accountedKg =
    fgProducedKg + recoveryReuseKg + wasteSaleKg + trueLossKg;

  const materialDifferenceKg = washInputKg - accountedKg;

  return {
    periodMonth,

    rm: {
      purchasedKg: rmPurchasedKg,
      value: rmValue,
      avgRate: avgRmPrice,
      consumedKg: washInputKg,
      closingKg: rmClosingKg,
    },

    production: {
      washInputKg,
      washedOutputKg,
      sortingInputKg,
      sortingAcceptedKg,
      extrusionInputKg,
      fgProducedKg,
      dispatchKg,
      washRecovery: pct(washedOutputKg, washInputKg),
      sortingRecovery: pct(sortingAcceptedKg, sortingInputKg),
      extrusionRecovery: pct(fgProducedKg, extrusionInputKg),
      overallRecovery: pct(fgProducedKg, washInputKg),
    },

    inventory: {
      rmClosingKg,
      washClosingKg,
      sortingClosingKg,
      fgClosingKg,
    },

    materialFlow: {
      rmInputKg: washInputKg,
      fgKg: fgProducedKg,
      recoveryReuseKg,
      wasteSaleKg,
      trueLossKg,
      accountedKg,
      materialDifferenceKg,
      accountabilityPercent: pct(accountedKg, washInputKg),
      ...waste,
    },

    costs: {
      estimatedRmConsumedValue,
      storesIssueValue,
      factoryExpenseValue,
      factoryCostAllocationValue,
      conversionCost,
      totalManufacturingCost,
      costDataComplete:
        salesValue > 0 &&
        estimatedRmConsumedValue > 0 &&
        storesIssueValue > 0 &&
        factoryExpenseValue > 0 &&
        factoryCostAllocationValue > 0,
    },

    profitability: {
      salesValue,
      grossProfit,
      manufacturingProfit,
      profitPerKg: fgProducedKg > 0 ? manufacturingProfit / fgProducedKg : 0,
      manufacturingCostPerKg:
        fgProducedKg > 0 ? totalManufacturingCost / fgProducedKg : 0,
      conversionCostPerKg:
        fgProducedKg > 0 ? conversionCost / fgProducedKg : 0,
    },
  };
}

function getStoreRate(itemName, storesMasterRows) {
  const master = storesMasterRows.find(
    (x) => String(x.itemName) === String(itemName)
  );

  return num(master?.standardRate);
}

function sum(rows, key) {
  return rows.reduce((s, r) => s + num(r[key]), 0);
}

function num(value) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
}

function pct(value, base) {
  if (!base) return 0;
  return (num(value) / num(base)) * 100;
}
