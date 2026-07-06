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
  return res.rows || [];
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
