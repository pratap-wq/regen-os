export function materialKey(value) {
  return String(value || "").trim().toUpperCase();
}

export function buildAvailabilityMap(inventoryLots = []) {
  const map = {};

  inventoryLots.forEach((lot) => {
    const key = materialKey(lot.material);
    if (!key) return;
    map[key] = (map[key] || 0) + Number(lot.availableKg || 0);
  });

  return map;
}
