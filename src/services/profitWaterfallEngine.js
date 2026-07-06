import { n, round2 } from "./costEngine";

export function calculateProfitWaterfall(cost) {
  const rmPurchase = n(cost.avgRmCostPerKg);
  const recoveryLoss = n(cost.effectiveRmCostPerKg) - n(cost.avgRmCostPerKg);
  const stores = n(cost.storesCostPerKg);
  const factory = n(cost.factoryCostPerKg);
  const manufacturing = n(cost.manufacturingCostPerKg);
  const selling = n(cost.avgSellingPricePerKg);
  const margin = n(cost.grossMarginPerKg);

  return [
    {
      label: "Material Landed Cost",
      type: "cost",
      value: round2(rmPurchase),
      note: "Material purchase + Regen-paid transport",
    },
    {
      label: "Recovery Loss",
      type: "cost",
      value: round2(recoveryLoss),
      note: "Cost added due to recovery loss",
    },
    {
      label: "Stores / Consumables",
      type: "cost",
      value: round2(stores),
      note: "Stores issue allocated per kg material",
    },
    {
      label: "Factory Expenses",
      type: "cost",
      value: round2(factory),
      note: "Factory expenses allocated per kg material",
    },
    {
      label: "Manufacturing Cost",
      type: "subtotal",
      value: round2(manufacturing),
      note: "Total estimated manufacturing cost/kg",
    },
    {
      label: "Selling Price",
      type: "revenue",
      value: round2(selling),
      note: "Average realized selling price/kg",
    },
    {
      label: "Gross Margin",
      type: "margin",
      value: round2(margin),
      note: "Selling price minus manufacturing cost/kg",
    },
  ];
}
