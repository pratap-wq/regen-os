export function n(value) {
  return Number(value || 0);
}

export function buildInventoryLots({
  rmRows = [],
  washRows = [],
  sortingRows = [],
  extrusionRows = [],
  dispatchRows = [],
}) {
  const lots = [];

  rmRows.forEach((r) => {
    const qty = n(r.netWeight || r.quantityKg);
    if (qty > 0) {
      lots.push({
        lotId: r.inwardId || r.id || "",
        sourceType: "RM",
        material: r.material || r.category || "RM Material",
        availableKg: qty,
        date: r.date || "",
        label: `${r.inwardId || "RM"} | ${r.material || ""} | ${qty} Kg`,
      });
    }
  });

  washRows.forEach((r) => {
    const qty = n(r.washedOutputKg);
    if (qty > 0) {
      lots.push({
        lotId: r.washBatchId || r.id || "",
        sourceType: "WASH",
        material: r.inputMaterial || "Washed Material",
        availableKg: qty,
        date: r.date || "",
        label: `${r.washBatchId || "WB"} | ${r.inputMaterial || ""} | ${qty} Kg`,
      });
    }
  });

  sortingRows.forEach((r) => {
    const qty =
      n(r.acceptedQtyKg) ||
      n(r.whiteSortedKg) +
        n(r.allMixSortedKg) +
        n(r.commodityKg) +
        n(r.whiteGreyKg);

    if (qty > 0) {
      lots.push({
        lotId: r.sortingBatchId || r.id || "",
        sourceType: "SORTING",
        material: r.inputMaterial || "Sorted Material",
        availableKg: qty,
        date: r.date || "",
        label: `${r.sortingBatchId || "SB"} | ${r.inputMaterial || ""} | ${qty} Kg`,
      });
    }
  });

  extrusionRows.forEach((r) => {
    const recoveryQty =
      n(r.lumpsKg) + n(r.purgingKg) + n(r.reworkGranulesKg);

    if (recoveryQty > 0) {
      lots.push({
        lotId: `${r.extrusionBatchId || r.id || "EB"}-RECOVERY`,
        sourceType: "RECOVERY",
        material: "Recovery / Rework",
        availableKg: recoveryQty,
        date: r.date || "",
        label: `${r.extrusionBatchId || "EB"} | Recovery | ${recoveryQty} Kg`,
      });
    }
  });

  return lots.filter((x) => x.lotId);
}