import { apiCall } from "../api/api";

export const PRODUCTION_MATERIAL_ALIASES = {
  "WHITE PPCP BUCKETS": "White Buckets",
  "WHITE BUCKET": "White Buckets",
  "WHITE BUCKETS": "White Buckets",
  "MIXED BUCKET": "White Buckets",
  "MIXED BUCKETS": "White Buckets",
  "MIXED PPCP BUCKETS": "White Buckets",
  "MIXED_PPCP_BUCKETS": "White Buckets",
  "MIXED_BUCKETS": "White Buckets",
  "FLAKES": "White Regrind (Unwashed)",
  "FLAKES UNWASHED": "White Regrind (Unwashed)",
  "FLAKES - UNWASHED": "White Regrind (Unwashed)",
  "FLAKES SEMI WASHED": "White Regrind (Washed)",
  "FLAKES - SEMI WASHED": "White Regrind (Washed)",
  "FLAKES SEMI-WASHED": "White Regrind (Washed)",
  "FLAKES - SEMI-WASHED": "White Regrind (Washed)",
  "FLAKES DOMINANT COLOUR": "Colour Reject",
  "FLAKES - DOMINANT COLOUR": "Colour Reject",
  "FLAKES DOMINANT COLOR": "Colour Reject",
  "FLAKES - DOMINANT COLOR": "Colour Reject",
  "MIXED REGRIND": "White Regrind (Unwashed)",
  "UNWASHED WHITE FLAKES": "White Regrind (Unwashed)",
  "WHITE FLAKES (UNWASHED)": "White Regrind (Unwashed)",
  "GRINDER FLAKES": "White Regrind (Unwashed)",
  "UNWASHED REGRIND": "White Regrind (Unwashed)",
  "WHITE REGRIND": "White Regrind (Unwashed)",
  "WHITE REGRIND UNWASHED": "White Regrind (Unwashed)",
  REGRINDS: "White Regrind (Unwashed)",
  "WASHED WHITE FLAKES": "White Regrind (Washed)",
  "WHITE WASHED FLAKES": "White Regrind (Washed)",
  "WASHED REGRIND": "White Regrind (Washed)",
  "WHITE REGRIND WASHED": "White Regrind (Washed)",
  "WHITE SORTED FLAKES": "White Sorted Regrind",
  "WHITE SORTED": "White Sorted Regrind",
  "SORTED WHITE": "White Sorted Regrind",
  "SORTED MATERIAL": "White Sorted Regrind",
  "WRAPPERS": "Wrappers",
  "MICRO PLASTIC": "Micro Plastic",
  "PURGING": "Purging Waste",
};

export const FALLBACK_PRODUCTION_MATERIALS = [
  ["White Buckets", "White Buckets", "RM", "RM_INWARD,GRINDER,WASH", "INPUT", "White PPCP Buckets|White Bucket|Mixed Bucket|Mixed Buckets|Mixed PPCP Buckets|MIXED_PPCP_BUCKETS|MIXED_BUCKETS"],
  ["White Regrind (Unwashed)", "White Regrind (Unwashed)", "WIP", "RM_INWARD,GRINDER,WASH", "OUTPUT,INPUT", "Unwashed White Flakes|White Flakes (Unwashed)|Grinder Flakes|Unwashed Regrind|White Regrind|White Regrind Unwashed|Regrinds"],
  ["White Regrind (Washed)", "White Regrind (Washed)", "WIP", "RM_INWARD,WASH,SORTING,EXTRUSION", "OUTPUT,INPUT", "Washed White Flakes|White Washed Flakes|Washed Regrind|White Regrind Washed"],
  ["White Sorted Regrind", "White Sorted Regrind", "WIP", "SORTING,EXTRUSION", "OUTPUT,INPUT", "White Sorted Flakes|White Sorted|Sorted White|Sorted Material"],
  ["Virgin PPCP", "Virgin PPCP", "ADDITIVE", "RM_INWARD,EXTRUSION", "INPUT", "Virgin PP|Virgin Material|Virgin"],
  ["Battery PPCP", "Battery PPCP", "RM_CONSUMABLE", "RM_INWARD,EXTRUSION", "INPUT", "Battery Scrap|Battery Flakes|Battery Regrind"],
  ["Masterbatch", "Masterbatch", "ADDITIVE", "RM_INWARD,EXTRUSION", "INPUT", "Master Batch|Colour Masterbatch|Color Masterbatch"],
  ["Antioxidant", "Antioxidant", "ADDITIVE", "EXTRUSION", "INPUT", "Antioxidant|Anti Oxidant"],
  ["E1", "E1", "FG", "EXTRUSION,DISPATCH", "OUTPUT,INPUT", "E1"],
  ["E2", "E2", "FG", "EXTRUSION,DISPATCH", "OUTPUT,INPUT", "E2"],
  ["E3", "E3", "FG", "EXTRUSION,DISPATCH", "OUTPUT,INPUT", "E3"],
  ["E4", "E4", "FG", "EXTRUSION,DISPATCH", "OUTPUT,INPUT", "E4"],
  ["E5", "E5", "FG", "EXTRUSION,DISPATCH", "OUTPUT,INPUT", "E5"],
  ["Dust", "Dust", "WASTE", "GRINDER,WASH", "OUTPUT", "Dust"],
  ["Metal Reject", "Metal Reject", "WASTE", "GRINDER,WASH", "OUTPUT", "Metal Reject"],
  ["Rubber Reject", "Rubber Reject", "WASTE", "WASH", "OUTPUT", "Rubber Reject"],
  ["Sink Material", "Sink Material", "WASTE", "WASH", "OUTPUT", "Sink Material"],
  ["Wrappers", "Wrappers", "WASTE", "WASH", "OUTPUT", "Wrappers"],
  ["Micro Plastic", "Micro Plastic", "WASTE", "WASH", "OUTPUT", "Micro Plastic"],
  ["Sludge", "Sludge", "WASTE", "WASH", "OUTPUT", "Sludge"],
  ["Colour Reject", "Colour Reject", "WASTE", "SORTING", "OUTPUT", "Colour Reject|Color Reject"],
  ["Lumps", "Lumps", "WASTE", "EXTRUSION", "OUTPUT", "Lumps"],
  ["Purging Waste", "Purging Waste", "WASTE", "EXTRUSION", "OUTPUT", "Purging"],
  ["Extrusion Waste", "Extrusion Waste", "WASTE", "EXTRUSION", "OUTPUT", "Extrusion Waste"],
].map(([materialName, canonicalName, category, stageAllowed, directionAllowed, aliases], index) => ({
  materialId: `PMM-${index + 1}`,
  materialName,
  canonicalName,
  category,
  stageAllowed,
  directionAllowed,
  active: "TRUE",
  aliases,
  sortOrder: index + 1,
}));

export function normalizeProductionMaterialName(value) {
  const clean = String(value || "").trim().replace(/\s+/g, " ");
  if (!clean) return "";
  const key = clean.toUpperCase();
  return PRODUCTION_MATERIAL_ALIASES[key] || clean;
}

export function productionMaterialAllowed(row, stage, direction) {
  const active = String(row.active || row.isActive || row.status || "TRUE").toUpperCase();
  if (active === "FALSE" || active === "INACTIVE" || active === "DELETED" || active === "DISABLED") return false;

  const expectedStage = String(stage || "").toUpperCase();
  const expectedDirection = String(direction || "").toUpperCase();
  const contextFlag = dropdownFlagForContext(expectedStage, expectedDirection);

  if (expectedStage === "DISPATCH") {
    return isYes(row.appearsInDispatch) && String(row.category || row.materialType || "").toUpperCase() === "FG";
  }

  if (contextFlag) {
    if (isYes(row[contextFlag])) return true;
    if (hasSpecificDropdownFlags(row)) return false;
  }

  const stages = String(row.stageAllowed || "").toUpperCase().split(",").map((x) => x.trim());
  const directions = String(row.directionAllowed || "").toUpperCase().split(",").map((x) => x.trim());

  if (stages.includes(expectedStage) && directions.includes(expectedDirection)) return true;
  if (stages.some(Boolean) || directions.some(Boolean)) return false;
  return materialEligibleForContext(row, expectedStage, expectedDirection);
}

export function dropdownFlagForContext(stage, direction) {
  const s = String(stage || "").toUpperCase();
  const d = String(direction || "").toUpperCase();
  if (s === "RM_INWARD") return "appearsInRMInward";
  if (s === "GRINDER") return d === "OUTPUT" ? "appearsInGrinderOutput" : "appearsInGrinderInput";
  if (s === "WASH") return d === "OUTPUT" ? "appearsInWashOutput" : "appearsInWashInput";
  if (["SORTING", "SORTER", "COLOR_SORTER", "COLOUR_SORTER"].includes(s)) return d === "OUTPUT" ? "appearsInSorterOutput" : "appearsInSorterInput";
  if (s === "EXTRUSION") return d === "OUTPUT" ? "appearsInExtrusionOutput" : "appearsInExtrusionInput";
  if (s === "DISPATCH") return "appearsInDispatch";
  if (s === "MONTH_CLOSE") return "appearsInMonthClose";
  if (s === "INVENTORY_ADJUSTMENTS" || s === "INVENTORY_ADJUSTMENT") return "appearsInInventoryAdjustments";
  return "";
}

function isYes(value) {
  return ["YES", "TRUE", "Y", "1", "ON"].includes(String(value || "").toUpperCase());
}

function hasSpecificDropdownFlags(row) {
  return [
    "appearsInRMInward",
    "appearsInRmInward",
    "appearsInGrinderInput",
    "appearsInGrinderOutput",
    "appearsInWashInput",
    "appearsInWashOutput",
    "appearsInSorterInput",
    "appearsInSorterOutput",
    "appearsInExtrusionInput",
    "appearsInExtrusionOutput",
    "appearsInDispatch",
    "appearsInMonthClose",
    "appearsInInventoryAdjustments",
  ].some((key) => row[key] !== undefined && row[key] !== "");
}

function materialEligibleForContext(row, stage, direction) {
  const category = String(row.category || row.materialType || "").toUpperCase();
  const productionInputStages = ["GRINDER", "WASH", "SORTING", "EXTRUSION"];

  if (direction !== "INPUT") return false;
  if (stage === "DISPATCH") return category === "FG";
  if (stage === "MONTH_CLOSE") return category !== "STORE";
  if (stage === "INVENTORY_ADJUSTMENTS" || stage === "INVENTORY_ADJUSTMENT") return true;
  if (stage === "RM_INWARD") return category === "RM" || category === "WIP";
  if (productionInputStages.includes(stage)) {
    return ["RM", "WIP", "REWORK", "ADDITIVE"].includes(category);
  }
  return false;
}

export async function listProductionMaterialMaster({ stage = "", direction = "" } = {}) {
  try {
    const res = await apiCall({
      fn: "productionMaterialMaster.list",
      stage,
      direction,
    });
    const rows = mergeProductionMaterialRows(res.rows || FALLBACK_PRODUCTION_MATERIALS);
    return rows
      .map(normalizeProductionMaterialRow)
      .filter((row) => !stage || !direction || productionMaterialAllowed(row, stage, direction));
  } catch (err) {
    console.log("productionMaterialMaster.list", err);
    return FALLBACK_PRODUCTION_MATERIALS.filter((row) =>
      !stage || !direction || productionMaterialAllowed(row, stage, direction)
    );
  }
}

function mergeProductionMaterialRows(rows = []) {
  const byName = new Map();

  FALLBACK_PRODUCTION_MATERIALS.forEach((row) => {
    byName.set(materialKey(row.canonicalName || row.materialName), { ...row });
  });

  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const originalCanonical = row.canonicalName || row.materialName;
    const canonicalName = normalizeProductionMaterialName(originalCanonical);
    const key = materialKey(canonicalName);
    if (!key) return;
    const fallback = byName.get(key) || {};
    const isAliasRow = materialKey(originalCanonical) !== key;
    byName.set(key, {
      ...fallback,
      ...row,
      materialName: canonicalName,
      canonicalName,
      active: isAliasRow ? fallback.active : row.active,
      status: isAliasRow ? fallback.status : row.status,
      stageAllowed: mergeCsv(row.stageAllowed, fallback.stageAllowed),
      directionAllowed: mergeCsv(row.directionAllowed, fallback.directionAllowed),
      aliases: row.aliases || fallback.aliases || "",
    });
  });

  return [...byName.values()].sort((a, b) => Number(a.sortOrder || 999) - Number(b.sortOrder || 999));
}

function materialKey(value) {
  return String(value || "").trim().toUpperCase();
}

function mergeCsv(primary, fallback) {
  const seen = new Set();
  return `${primary || ""},${fallback || ""}`
    .split(",")
    .map((value) => value.trim())
    .filter((value) => {
      if (!value || seen.has(value.toUpperCase())) return false;
      seen.add(value.toUpperCase());
      return true;
    })
    .join(",");
}

function normalizeProductionMaterialRow(row) {
  const canonicalName = row.canonicalName || row.materialName || "";
  return enforceRequiredMaterialFlags({
    ...defaultDropdownFlags(canonicalName || row.materialCode, row.category || row.materialType),
    ...row,
    id: row.materialId || row.materialCode || row.canonicalName || row.materialName || "",
    name: row.canonicalName || row.materialName || "",
    materialName: row.materialName || row.canonicalName || "",
    canonicalName,
    category: row.category || row.materialType || "",
    active: row.active || row.isActive || row.status || "TRUE",
  });
}

function defaultDropdownFlags(value, category = "") {
  const code = materialCode(normalizeProductionMaterialName(value));
  const flags = {
    appearsInRMInward: "NO",
    appearsInRmInward: "NO",
    appearsInProduction: "NO",
    appearsInGrinderInput: "NO",
    appearsInGrinderOutput: "NO",
    appearsInWashInput: "NO",
    appearsInWashOutput: "NO",
    appearsInSorterInput: "NO",
    appearsInSorterOutput: "NO",
    appearsInExtrusionInput: "NO",
    appearsInExtrusionOutput: "NO",
    appearsInDispatch: "NO",
    appearsInMonthClose: String(category).toUpperCase() === "STORE" ? "NO" : "YES",
    appearsInInventoryAdjustments: "YES",
  };

  const mark = (key) => { flags[key] = "YES"; };
  if (["WHITE_FLAKES", "WHITE_BUCKETS", "BATTERY_SCRAP", "BATTERY_REGRIND", "JARS", "LIDS", "PP_MIXED", "WHITE_REGRIND_UNWASHED", "VIRGIN_PP", "VIRGIN_PPCP", "BATTERY_PPCP", "MASTERBATCH"].includes(code)) {
    mark("appearsInRMInward");
    mark("appearsInRmInward");
  }
  if (["WHITE_BUCKETS"].includes(code)) mark("appearsInGrinderInput");
  if (["WHITE_REGRIND_UNWASHED", "DUST", "METAL_REJECT"].includes(code)) mark("appearsInGrinderOutput");
  if (["WHITE_REGRIND_UNWASHED", "WHITE_BUCKETS"].includes(code)) mark("appearsInWashInput");
  if (["WHITE_REGRIND_WASHED", "WASHED_WHITE_FLAKES", "WASHED_MIXED", "SINK_MATERIAL", "DUST", "SLUDGE", "WRAPPERS", "MICRO_PLASTIC", "WRAPPER_REJECT"].includes(code)) mark("appearsInWashOutput");
  if (["WHITE_REGRIND_WASHED", "WASHED_WHITE_FLAKES", "WASHED_MIXED"].includes(code)) mark("appearsInSorterInput");
  if (["WHITE_SORTED", "WHITE_SORTED_REGRIND", "COMMODITY", "MIXED_SORTED", "COLOUR_REJECT", "COLOR_REJECT", "DUST"].includes(code)) mark("appearsInSorterOutput");
  if (["WHITE_REGRIND_WASHED", "WHITE_SORTED", "WHITE_SORTED_REGRIND", "REWORK_MATERIAL", "VIRGIN_PP", "VIRGIN_PPCP", "BATTERY_PPCP", "MASTERBATCH", "ANTIOXIDANT"].includes(code)) mark("appearsInExtrusionInput");
  if (["E1", "E2", "E3", "E4", "E5", "LUMPS", "PURGING_WASTE", "EXTRUSION_WASTE"].includes(code)) mark("appearsInExtrusionOutput");
  if (["E1", "E2", "E3", "E4", "E5"].includes(code)) mark("appearsInDispatch");

  flags.appearsInProduction = [
    flags.appearsInGrinderInput,
    flags.appearsInGrinderOutput,
    flags.appearsInWashInput,
    flags.appearsInWashOutput,
    flags.appearsInSorterInput,
    flags.appearsInSorterOutput,
    flags.appearsInExtrusionInput,
    flags.appearsInExtrusionOutput,
  ].includes("YES") ? "YES" : "NO";

  return flags;
}

function enforceRequiredMaterialFlags(row) {
  const code = materialCode(row.materialCode || row.canonicalName || row.materialName);
  if (code !== "WHITE_REGRIND_UNWASHED") return row;
  return {
    ...row,
    materialCode: "WHITE_REGRIND_UNWASHED",
    materialName: row.materialName || "White Regrind (Unwashed)",
    canonicalName: row.canonicalName || "White Regrind (Unwashed)",
    category: "WIP",
    status: "ACTIVE",
    active: "TRUE",
    appearsInRMInward: "YES",
    appearsInRmInward: "YES",
    appearsInGrinderOutput: "YES",
    appearsInWashInput: "YES",
    appearsInProduction: "YES",
  };
}
