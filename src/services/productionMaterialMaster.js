import { apiCall } from "../api/api";

export function normalizeProductionMaterialName(value) {
  const clean = String(value || "").trim().replace(/\s+/g, " ");
  const key = materialCode(clean);
  return {
    WHITE_BUCKET: "White Buckets",
    MIXED_BUCKET: "White Buckets",
    MIXED_BUCKETS: "White Buckets",
  }[key] || clean;
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

export function productionMaterialAllowed(row, stage, direction) {
  const status = String(row.status || "ACTIVE").toUpperCase();
  if (status !== "ACTIVE") return false;

  const flag = dropdownFlagForContext(stage, direction);
  if (flag && !isYes(row[flag])) return false;

  const category = String(row.category || row.materialType || "").toUpperCase();
  if (String(stage || "").toUpperCase() === "DISPATCH" && category !== "FG") return false;

  return true;
}

export async function listProductionMaterialMaster({ stage = "", direction = "" } = {}) {
  const res = await apiCall({ fn: "materialMaster.list" });
  return (res.rows || [])
    .map(normalizeMaterialMasterRow)
    .filter((row) => !stage || !direction || productionMaterialAllowed(row, stage, direction))
    .sort((a, b) => Number(a.sortOrder || 9999) - Number(b.sortOrder || 9999));
}

function normalizeMaterialMasterRow(row) {
  return {
    ...row,
    id: row.materialId || row.materialCode || row.materialName || "",
    name: row.materialName || row.materialCode || "",
    materialName: row.materialName || row.materialCode || "",
    canonicalName: row.materialName || row.materialCode || "",
    category: row.category || row.materialType || "",
    active: row.status || "ACTIVE",
  };
}

function isYes(value) {
  return ["YES", "TRUE", "Y", "1", "ON"].includes(String(value || "").toUpperCase());
}

function materialCode(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}
