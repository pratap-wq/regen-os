export function n(value) {
  return Number(value || 0);
}

export function buildInventoryLots({
  rmRows = [],
  grinderRows = [],
  washRows = [],
  sortingRows = [],
  extrusionRows = [],
  dispatchRows = [],
}) {
  const lots = [];
  const GRINDER_OUTPUT_MATERIAL = "White Regrind (Unwashed)";

  function parseMaterialLines(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value !== "string") return [];
    try {
      const rows = JSON.parse(value);
      return Array.isArray(rows) ? rows : [];
    } catch {
      return [];
    }
  }

  rmRows.forEach((r) => {
    const qcStatus = String(r.qcStatus || "").toUpperCase();
    const status = String(r.status || "").toUpperCase();
    const isLegacyWithoutQc = !qcStatus && status !== "QC_PENDING";
    const isApproved = qcStatus === "APPROVED" || isLegacyWithoutQc;

    if (!isApproved || status === "REJECTED" || status === "HOLD") return;

    const materialLines = parseMaterialLines(r.materialLines)
      .map((line) => ({
        material: line.material || line.materialName || "",
        quantityKg: n(line.quantityKg || line.qtyKg || line.quantity),
      }))
      .filter((line) => line.material && line.quantityKg > 0);

    if (materialLines.length) {
      materialLines.forEach((line, index) => {
        lots.push({
          lotId: `${r.inwardId || r.id || "MR"}-${index + 1}`,
          sourceType: "RM",
          material: line.material,
          availableKg: line.quantityKg,
          date: r.date || "",
          label: `${r.inwardId || "MR"} | ${line.material} | ${line.quantityKg} Kg`,
        });
      });
      return;
    }

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

  grinderRows.forEach((r) => {
    const outputLines = parseMaterialLines(r.outputComposition)
      .map((line) => ({
        material: line.material || line.materialName || "",
        quantityKg: n(line.quantityKg || line.qtyKg || line.quantity),
      }))
      .filter((line) => line.material && line.quantityKg > 0);

    const regrindLines = outputLines.filter((line) =>
      String(line.material || "").toUpperCase().includes("REGRIND")
    );

    const qty =
      regrindLines.reduce((s, line) => s + line.quantityKg, 0) ||
      n(r.regrindOutputKg);

    if (qty > 0) {
      lots.push({
        lotId: r.grinderBatchId || r.batchId || r.id || "",
        sourceType: "GRINDER",
        material: GRINDER_OUTPUT_MATERIAL,
        availableKg: qty,
        date: r.date || "",
        label: `${r.grinderBatchId || "GB"} | ${GRINDER_OUTPUT_MATERIAL} | ${qty} Kg`,
      });
    }
  });

  washRows.forEach((r) => {
    const outputLines = parseMaterialLines(r.outputComposition)
      .map((line) => ({
        material: line.material || line.materialName || "",
        quantityKg: n(line.quantityKg || line.qtyKg || line.quantity),
      }))
      .filter((line) => line.material && line.quantityKg > 0);

    if (outputLines.length) {
      outputLines.forEach((line, index) => {
        lots.push({
          lotId: `${r.washBatchId || r.id || "WB"}-${index + 1}`,
          sourceType: "WASH",
          material: line.material,
          availableKg: line.quantityKg,
          date: r.date || "",
          label: `${r.washBatchId || "WB"} | ${line.material} | ${line.quantityKg} Kg`,
        });
      });
      return;
    }

    const qty = n(r.washedOutputKg);
    if (qty > 0) {
      lots.push({
        lotId: r.washBatchId || r.id || "",
        sourceType: "WASH",
        material: "White Regrind (Washed)",
        availableKg: qty,
        date: r.date || "",
        label: `${r.washBatchId || "WB"} | White Regrind (Washed) | ${qty} Kg`,
      });
    }
  });

  sortingRows.forEach((r) => {
    const outputLines = parseMaterialLines(r.outputComposition)
      .map((line) => ({
        material: line.material || line.materialName || "",
        quantityKg: n(line.quantityKg || line.qtyKg || line.quantity),
      }))
      .filter((line) => line.material && line.quantityKg > 0);

    if (outputLines.length) {
      outputLines.forEach((line, index) => {
        lots.push({
          lotId: `${r.sortingBatchId || r.id || "SB"}-${index + 1}`,
          sourceType: "SORTING",
          material: line.material,
          availableKg: line.quantityKg,
          date: r.date || "",
          label: `${r.sortingBatchId || "SB"} | ${line.material} | ${line.quantityKg} Kg`,
        });
      });
      return;
    }

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
        material: "White Sorted Regrind",
        availableKg: qty,
        date: r.date || "",
        label: `${r.sortingBatchId || "SB"} | White Sorted Regrind | ${qty} Kg`,
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
