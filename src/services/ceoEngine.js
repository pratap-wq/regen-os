import { calculateCostEngine, n, filterByMonth } from "./costEngine";

export function calculateCeoDashboard({
  rmRows = [],
  washRows = [],
  sortingRows = [],
  extrusionRows = [],
  dispatchRows = [],
  storesIssueRows = [],
  factoryExpenseRows = [],
  month,
  year,
  monthlyTargetKg = 500000,
  assumedSellingPrice = 112,
}) {
  const cost = calculateCostEngine({
    rmRows,
    washRows,
    sortingRows,
    extrusionRows,
    dispatchRows,
    storesIssueRows,
    factoryExpenseRows,
    month,
    year,
    assumedSellingPrice,
  });

  const extrusion = filterByMonth(extrusionRows, month, year);
  const dispatch = filterByMonth(dispatchRows, month, year);

  const fgProducedKg = cost.fgProducedKg;
  const dispatchKg = cost.dispatchKg;

  const achievementPercent =
    monthlyTargetKg > 0 ? (fgProducedKg / monthlyTargetKg) * 100 : 0;

  const fgStockKg = fgProducedKg - dispatchKg;

  const inventoryValue =
    fgStockKg * cost.manufacturingCostPerKg;

  const alerts = [];

  if (cost.overallRecoveryPercent > 0 && cost.overallRecoveryPercent < 88) {
    alerts.push({
      severity: "HIGH",
      message: "Overall recovery is below 88%. Check RM quality and process losses.",
    });
  }

  if (cost.grossMarginPerKg < 10) {
    alerts.push({
      severity: "HIGH",
      message: "Gross margin/kg is below ₹10. Cost control required.",
    });
  }

  if (achievementPercent < 85) {
    alerts.push({
      severity: "MEDIUM",
      message: "Production achievement is below 85% of monthly target.",
    });
  }

  const recommendations = [];

  if (cost.effectiveRmCostPerKg > cost.avgRmCostPerKg + 5) {
    recommendations.push(
      "Recovery loss is adding more than ₹5/kg. Prioritize better RM mix and reduce contamination."
    );
  }

  if (cost.storesCostPerKg > 4) {
    recommendations.push(
      "Stores/consumables cost is high. Review screen mesh, additives, packing and maintenance consumption."
    );
  }

  if (cost.factoryCostPerKg > 5) {
    recommendations.push(
      "Factory overhead per kg is high. Increase production volume or reduce fixed expenses."
    );
  }

  if (recommendations.length === 0) {
    recommendations.push("Cost structure is within expected range for selected month.");
  }

  const today = new Date().toISOString().slice(0, 10);

  const todayProductionKg = extrusion
    .filter((r) => String(r.date || "").slice(0, 10) === today)
    .reduce((s, r) => s + n(r.fgOutputKg), 0);

  const todayDispatchKg = dispatch
    .filter((r) => String(r.date || "").slice(0, 10) === today)
    .reduce((s, r) => s + n(r.quantityKg), 0);

  return {
    cost,

    todayProductionKg,
    todayDispatchKg,

    fgProducedKg,
    dispatchKg,
    fgStockKg,

    monthlyTargetKg,
    achievementPercent,

    inventoryValue,

    alerts,
    recommendations,

    headline: {
      rmCostPerKg: cost.avgRmCostPerKg,
      effectiveRmCostPerKg: cost.effectiveRmCostPerKg,
      manufacturingCostPerKg: cost.manufacturingCostPerKg,
      sellingPricePerKg: cost.avgSellingPricePerKg,
      grossMarginPerKg: cost.grossMarginPerKg,
      estimatedProfit: cost.estimatedProfit,
      recoveryPercent: cost.overallRecoveryPercent,
    },
  };
}