import { apiCall } from "../api/api";

const STORAGE_PREFIX = "regenos.factoryMaster";

function storageKey(masterType, suffix) {
  return `${STORAGE_PREFIX}.${masterType}.${suffix}`;
}

function readList(masterType, suffix) {
  try {
    const raw = localStorage.getItem(storageKey(masterType, suffix));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeList(masterType, suffix, values) {
  try {
    localStorage.setItem(storageKey(masterType, suffix), JSON.stringify(values));
  } catch {}
}

export function getRecentMasterItems(masterType) {
  return readList(masterType, "recent");
}

export function getFavoriteMasterItems(masterType) {
  return readList(masterType, "favorites");
}

export function rememberMasterItem(masterType, item) {
  if (!item?.id && !item?.name) return;
  const recent = readList(masterType, "recent").filter(
    (x) => String(x.id || x.name) !== String(item.id || item.name)
  );
  writeList(masterType, "recent", [item, ...recent].slice(0, 8));
}

export function toggleFavoriteMasterItem(masterType, item) {
  if (!item?.id && !item?.name) return [];
  const favorites = readList(masterType, "favorites");
  const exists = favorites.some(
    (x) => String(x.id || x.name) === String(item.id || item.name)
  );
  const next = exists
    ? favorites.filter((x) => String(x.id || x.name) !== String(item.id || item.name))
    : [item, ...favorites].slice(0, 20);
  writeList(masterType, "favorites", next);
  return next;
}

export async function listFactoryMaster(masterType, search = "") {
  const type = String(masterType || "").toLowerCase();
  const res = await apiCall({
    fn: "factoryMaster.list",
    masterType,
    search,
    includeDisabled: "TRUE",
  });
  let rows = normalizeMasterRows(masterType, res.rows || []);

  if (type === "material" && materialMasterNeedsFallback(rows)) {
    rows = mergeMasterRows(rows, await listMaterialFallbackRows());
  }

  return rows;
}

export async function addFactoryMaster(masterType, payload) {
  const res = await apiCall({
    fn: "factoryMaster.add",
    masterType,
    ...payload,
  });
  return res.row || null;
}

export async function updateFactoryMaster(masterType, payload) {
  return apiCall({
    fn: "factoryMaster.update",
    masterType,
    ...payload,
  });
}

export async function disableFactoryMaster(masterType, item) {
  return apiCall({
    fn: "factoryMaster.disable",
    masterType,
    id: item.id,
  });
}

export async function mergeFactoryMaster(masterType, fromItem, intoItem) {
  return apiCall({
    fn: "factoryMaster.merge",
    masterType,
    fromId: fromItem.id,
    intoId: intoItem.id,
  });
}

function normalizeMasterRows(masterType, rows = []) {
  const type = String(masterType || "").toLowerCase();

  return rows.map((row) => {
    if (type === "material") {
      return {
        ...row,
        id: row.id || row.materialId || row.materialCode || row.name || row.materialName || "",
        code: row.code || row.materialCode || "",
        name: row.name || row.materialName || row.materialCode || "",
        category: row.category || row.materialType || "",
        materialType: row.materialType || row.category || "",
      };
    }

    if (type === "storeitem") {
      return {
        ...row,
        id: row.id || row.itemId || row.itemName || "",
        code: row.code || row.itemCode || "",
        name: row.name || row.itemName || row.itemCode || "",
      };
    }

    if (type === "qualitytest") {
      return {
        ...row,
        id: row.id || row.testId || row.testCode || row.testName || "",
        code: row.code || row.testCode || "",
        name: row.name || row.testName || row.testCode || "",
      };
    }

    if (type === "expensecategory") {
      return {
        ...row,
        id: row.id || row.categoryId || row.categoryCode || row.categoryName || "",
        code: row.code || row.categoryCode || "",
        name: row.name || row.categoryName || row.categoryCode || "",
      };
    }

    if (type === "productgrade") {
      return {
        ...row,
        id: row.id || row.gradeId || row.gradeCode || row.gradeName || "",
        code: row.code || row.gradeCode || "",
        name: row.name || row.gradeName || row.gradeCode || "",
      };
    }

    if (type === "storagelocation") {
      return {
        ...row,
        id: row.id || row.locationId || row.locationCode || row.locationName || "",
        code: row.code || row.locationCode || "",
        name: row.name || row.locationName || row.locationCode || "",
      };
    }

    return {
      ...row,
      id: row.id || row.supplierId || row.customerId || row.machineId || row.recipeId || row.itemId || row.testId || row.categoryId || "",
      code: row.code || row.supplierCode || row.customerCode || row.machineCode || row.recipeCode || row.itemCode || row.testCode || row.categoryCode || "",
      name: row.name || row.supplierName || row.customerName || row.machineName || row.recipeName || row.itemName || row.testName || row.categoryName || "",
    };
  });
}

function materialMasterNeedsFallback(rows = []) {
  if (!rows.length) return true;

  const categories = new Set(
    rows.map((row) => String(row.category || row.materialType || "").toUpperCase())
  );

  const hasInputMaterial = ["RM", "WIP", "REWORK", "ADDITIVE"].some((x) =>
    categories.has(x)
  );
  const hasOutputMaterial = ["FG", "WIP", "WASTE", "REWORK"].some((x) =>
    categories.has(x)
  );

  return !hasInputMaterial || !hasOutputMaterial;
}

async function listMaterialFallbackRows() {
  const results = await Promise.allSettled([
    apiCall({ fn: "productionMaterials.list" }),
    apiCall({ fn: "categories.list" }),
    apiCall({ fn: "inventoryLedger.balance" }),
  ]);

  const [productionMaterials, categories, ledgerBalances] = results.map((result) =>
    result.status === "fulfilled"
      ? result.value?.rows || result.value?.balances || []
      : []
  );

  return [
    ...productionMaterials.map((row) =>
      fallbackMaterialRow(row.materialName || row.name, row.category || row.materialType || row.stage)
    ),
    ...categories.map((row) =>
      fallbackMaterialRow(row.categoryName || row.name, row.category || "RM")
    ),
    ...ledgerBalances.map((row) =>
      fallbackMaterialRow(row.itemName || row.materialName, row.itemType || row.category)
    ),
  ].filter((row) => row.name);
}

function fallbackMaterialRow(name, categoryHint = "") {
  const cleanName = String(name || "").trim();
  if (!cleanName) return { name: "" };

  const category = inferMaterialCategory(cleanName, categoryHint);

  return {
    id: cleanName,
    code: materialCode(cleanName),
    name: cleanName,
    materialName: cleanName,
    materialCode: materialCode(cleanName),
    category,
    materialType: category,
    unit: "Kg",
    status: "ACTIVE",
    source: "Fallback",
  };
}

function inferMaterialCategory(name, hint = "") {
  const text = `${hint} ${name}`.toUpperCase();

  if (/\b(E[1-5])\b/.test(text) || text.includes("FINISHED")) return "FG";
  if (text.includes("WASTE") || text.includes("REJECT") || text.includes("DUST") || text.includes("SINK")) return "WASTE";
  if (text.includes("WHITE REGRIND (UNWASHED)") || (text.includes("REGRIND") && text.includes("UNWASHED"))) return "WIP";
  if (text.includes("REWORK") || text.includes("LUMP") || text.includes("PURGING")) return "REWORK";
  if (text.includes("ADDITIVE") || text.includes("MASTERBATCH") || text.includes("ANTIOXIDANT") || text.includes("VIRGIN")) return "ADDITIVE";
  if (text.includes("WASHED") || text.includes("SORTED") || text.includes("WIP") || text.includes("COMMODITY")) return "WIP";
  if (text.includes("STORE")) return "STORE";

  return "RM";
}

function mergeMasterRows(primaryRows = [], fallbackRows = []) {
  const map = new Map();

  [...primaryRows, ...fallbackRows].forEach((row) => {
    const key = String(row.name || row.materialName || row.code || "").trim().toUpperCase();
    if (!key || map.has(key)) return;
    map.set(key, row);
  });

  return Array.from(map.values()).sort((a, b) =>
    String(a.name || "").localeCompare(String(b.name || ""), undefined, {
      numeric: true,
    })
  );
}

function materialCode(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}
