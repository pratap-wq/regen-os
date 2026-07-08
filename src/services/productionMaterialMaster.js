import { apiCall } from "../api/api";

export const PRODUCTION_MATERIAL_ALIASES = {
  "UNWASHED WHITE FLAKES": "White Regrind (Unwashed)",
  "WHITE FLAKES (UNWASHED)": "White Regrind (Unwashed)",
  "GRINDER FLAKES": "White Regrind (Unwashed)",
  REGRINDS: "White Regrind (Unwashed)",
  "WASHED WHITE FLAKES": "White Regrind (Washed)",
  "WHITE WASHED FLAKES": "White Regrind (Washed)",
  "WASHED REGRIND": "White Regrind (Washed)",
  "WHITE SORTED FLAKES": "White Sorted Regrind",
};

export const FALLBACK_PRODUCTION_MATERIALS = [
  ["White Buckets", "White Buckets", "RM", "GRINDER", "INPUT", "White Buckets"],
  ["Mixed Buckets", "Mixed Buckets", "RM", "GRINDER", "INPUT", "Mixed Buckets"],
  ["White Regrind (Unwashed)", "White Regrind (Unwashed)", "WIP", "GRINDER,WASH", "OUTPUT,INPUT", "Unwashed White Flakes|White Flakes (Unwashed)|Grinder Flakes|Regrinds"],
  ["White Regrind (Washed)", "White Regrind (Washed)", "WIP", "WASH,SORTING,EXTRUSION", "OUTPUT,INPUT", "Washed White Flakes|White Washed Flakes|Washed Regrind"],
  ["White Sorted Regrind", "White Sorted Regrind", "WIP", "SORTING,EXTRUSION", "OUTPUT,INPUT", "White Sorted Flakes"],
  ["E1", "E1", "FG", "EXTRUSION,DISPATCH", "OUTPUT,INPUT", "E1"],
  ["E2", "E2", "FG", "EXTRUSION,DISPATCH", "OUTPUT,INPUT", "E2"],
  ["E3", "E3", "FG", "EXTRUSION,DISPATCH", "OUTPUT,INPUT", "E3"],
  ["E4", "E4", "FG", "EXTRUSION,DISPATCH", "OUTPUT,INPUT", "E4"],
  ["E5", "E5", "FG", "EXTRUSION,DISPATCH", "OUTPUT,INPUT", "E5"],
  ["Dust", "Dust", "WASTE", "GRINDER,WASH", "OUTPUT", "Dust"],
  ["Metal Reject", "Metal Reject", "WASTE", "GRINDER,WASH", "OUTPUT", "Metal Reject"],
  ["Rubber Reject", "Rubber Reject", "WASTE", "WASH", "OUTPUT", "Rubber Reject"],
  ["Colour Reject", "Colour Reject", "WASTE", "SORTING", "OUTPUT", "Colour Reject|Color Reject"],
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
  const stages = String(row.stageAllowed || "").toUpperCase().split(",").map((x) => x.trim());
  const directions = String(row.directionAllowed || "").toUpperCase().split(",").map((x) => x.trim());

  return stages.includes(expectedStage) && directions.includes(expectedDirection);
}

export async function listProductionMaterialMaster({ stage = "", direction = "" } = {}) {
  try {
    const res = await apiCall({
      fn: "productionMaterialMaster.list",
      stage,
      direction,
    });
    const rows = Array.isArray(res.rows) && res.rows.length ? res.rows : FALLBACK_PRODUCTION_MATERIALS;
    return rows.map(normalizeProductionMaterialRow);
  } catch (err) {
    console.log("productionMaterialMaster.list", err);
    return FALLBACK_PRODUCTION_MATERIALS.filter((row) =>
      !stage || !direction || productionMaterialAllowed(row, stage, direction)
    );
  }
}

function normalizeProductionMaterialRow(row) {
  return {
    ...row,
    id: row.materialId || row.materialCode || row.canonicalName || row.materialName || "",
    name: row.canonicalName || row.materialName || "",
    materialName: row.materialName || row.canonicalName || "",
    canonicalName: row.canonicalName || row.materialName || "",
    category: row.category || row.materialType || "",
    active: row.active || row.isActive || row.status || "TRUE",
  };
}
