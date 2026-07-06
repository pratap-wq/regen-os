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
  const res = await apiCall({
    fn: "factoryMaster.list",
    masterType,
    search,
    includeDisabled: "TRUE",
  });
  const rows = normalizeMasterRows(masterType, res.rows || []);

  if (String(masterType || "").toLowerCase() === "material" && rows.length === 0) {
    return listLegacyMaterialFallback(search);
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

    return {
      ...row,
      id: row.id || row.supplierId || row.customerId || row.machineId || row.recipeId || row.itemId || row.testId || row.categoryId || "",
      code: row.code || row.supplierCode || row.customerCode || row.machineCode || row.recipeCode || row.itemCode || row.testCode || row.categoryCode || "",
      name: row.name || row.supplierName || row.customerName || row.machineName || row.recipeName || row.itemName || row.testName || row.categoryName || "",
    };
  });
}

async function listLegacyMaterialFallback(search = "") {
  const [categories, productionMaterials, rmRows, ledgerBalances] = await Promise.all([
    safeRows("categories.list"),
    safeRows("productionMaterials.list"),
    safeRows("rm.list"),
    safeRows("inventoryLedger.balance"),
  ]);

  const map = new Map();

  categories.forEach((row) => {
    addLegacyMaterial(map, {
      name: row.categoryName,
      category: "RM",
      source: "Material_Categories",
      sourceId: row.categoryId,
      status: row.isActive === false ? "DISABLED" : "ACTIVE",
    });
  });

  productionMaterials.forEach((row) => {
    addLegacyMaterial(map, {
      name: row.materialName,
      category: row.category || row.materialType || inferMaterialCategory(row.materialName),
      source: "Production_Materials",
      sourceId: row.materialId,
      status: row.status || (row.isActive === false ? "DISABLED" : "ACTIVE"),
    });
  });

  rmRows.forEach((row) => {
    addLegacyMaterial(map, {
      name: row.material,
      category: "RM",
      source: "RM_Inward",
      sourceId: row.inwardId,
      status: row.status || "ACTIVE",
    });
  });

  ledgerBalances.forEach((row) => {
    addLegacyMaterial(map, {
      name: row.itemName || row.materialName,
      category: row.itemType || inferMaterialCategory(row.itemName || row.materialName),
      source: "Inventory_Ledger",
      sourceId: row.materialId || row.itemName,
      status: "ACTIVE",
    });
  });

  const term = String(search || "").trim().toLowerCase();

  return Array.from(map.values())
    .filter((row) => !term || JSON.stringify(row).toLowerCase().includes(term))
    .sort((a, b) =>
      String(a.name || "").localeCompare(String(b.name || ""), undefined, {
        numeric: true,
      })
    );
}

async function safeRows(fn) {
  try {
    const res = await apiCall({ fn });
    return Array.isArray(res.rows) ? res.rows : [];
  } catch (err) {
    console.log(`Legacy material fallback failed for ${fn}`, err);
    return [];
  }
}

function addLegacyMaterial(map, item) {
  const name = String(item.name || "").trim();
  if (!name) return;

  const code = materialCode(name);
  const key = code || name.toUpperCase();
  const category = normalizeLegacyCategory(item.category || inferMaterialCategory(name));
  const existing = map.get(key);

  if (existing) {
    existing.sources = Array.from(new Set([...(existing.sources || []), item.source].filter(Boolean)));
    if (!existing.category || existing.category === "RM") existing.category = category;
    return;
  }

  map.set(key, {
    id: `LEGACY-${code}`,
    materialId: `LEGACY-${code}`,
    materialCode: code,
    code,
    name,
    materialName: name,
    category,
    materialType: category,
    unit: "Kg",
    status: normalizeStatus(item.status),
    source: item.source,
    sources: [item.source].filter(Boolean),
    sourceId: item.sourceId || "",
    isLegacyFallback: true,
  });
}

function materialCode(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);
}

function normalizeStatus(value) {
  const status = String(value || "ACTIVE").toUpperCase();
  if (["DELETED", "DISABLED", "INACTIVE", "MERGED"].includes(status)) return status;
  return "ACTIVE";
}

function normalizeLegacyCategory(value) {
  const category = String(value || "").trim().toUpperCase();
  if (category === "STORES") return "STORE";
  if (["RM", "WIP", "FG", "REWORK", "WASTE", "STORE", "ADDITIVE"].includes(category)) {
    return category;
  }
  return "RM";
}

function inferMaterialCategory(value) {
  const text = String(value || "").toUpperCase();

  if (/^E\d+$/.test(text.trim())) return "FG";
  if (text.includes("MASTERBATCH") || text.includes("VIRGIN") || text.includes("ANTIOXIDANT") || text.includes("ADDITIVE")) return "ADDITIVE";
  if (text.includes("REWORK") || text.includes("LUMP") || text.includes("PURGING")) return "REWORK";
  if (text.includes("WASTE") || text.includes("REJECT") || text.includes("DUST") || text.includes("SINK")) return "WASTE";
  if (text.includes("WASHED") || text.includes("SORTED") || text.includes("COMMODITY")) return "WIP";

  return "RM";
}
