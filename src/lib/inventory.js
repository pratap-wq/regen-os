export function toNum(value) {
  return Number(value || 0);
}

export function calculateInventory({
  rmRows = [],
  washRows = [],
  extrusionRows = [],
  dispatchRows = [],
  storesInwardRows = [],
  storesIssueRows = [],
}) {
  const rmInward = sum(rmRows, "netWeight");
  const rmConsumed = sum(washRows, "inputWeightKg");

  const washOutput = sum(washRows, "washedOutputKg");
  const washConsumed = sum(extrusionRows, "inputWeightKg");

  const fgProduced = sum(extrusionRows, "fgOutputKg");
  const fgDispatched = sum(dispatchRows, "quantityKg");

  const storesInward = sum(storesInwardRows, "qty");
  const storesIssued = sum(storesIssueRows, "qty");

  return {
    rm: {
      inward: rmInward,
      consumed: rmConsumed,
      stock: rmInward - rmConsumed,
    },

    wash: {
      produced: washOutput,
      consumed: washConsumed,
      stock: washOutput - washConsumed,
    },

    fg: {
      produced: fgProduced,
      dispatched: fgDispatched,
      stock: fgProduced - fgDispatched,
    },

    stores: {
      inward: storesInward,
      issued: storesIssued,
      stock: storesInward - storesIssued,
    },

    alerts: buildAlerts({
      rmStock: rmInward - rmConsumed,
      washStock: washOutput - washConsumed,
      fgStock: fgProduced - fgDispatched,
      storesStock: storesInward - storesIssued,
    }),
  };
}

export function buildLotInventory({
  extrusionRows = [],
  dispatchRows = [],
}) {
  const map = {};

  extrusionRows.forEach((r) => {
    const lotNo =
      r.extrusionBatchId ||
      r.batchId ||
      "UNKNOWN";

    if (!map[lotNo]) {
      map[lotNo] = {
        lotNo,
        grade: r.productionGrade || "",
        producedKg: 0,
        dispatchedKg: 0,
        balanceKg: 0,
      };
    }

    map[lotNo].producedKg += toNum(r.fgOutputKg);
  });

  dispatchRows.forEach((r) => {
    const lotNo =
      r.lotNo ||
      r.sourceExtrusionBatchId ||
      "UNKNOWN";

    if (!map[lotNo]) {
      map[lotNo] = {
        lotNo,
        grade: r.grade || "",
        producedKg: 0,
        dispatchedKg: 0,
        balanceKg: 0,
      };
    }

    map[lotNo].dispatchedKg += toNum(r.quantityKg);
  });

  Object.values(map).forEach((r) => {
    r.balanceKg =
      r.producedKg -
      r.dispatchedKg;
  });

  return Object.values(map);
}

export function buildStoresInventory({
  storesInwardRows = [],
  storesIssueRows = [],
}) {
  const map = {};

  storesInwardRows.forEach((r) => {
    const itemName =
      r.itemName || "UNKNOWN";

    if (!map[itemName]) {
      map[itemName] = {
        itemName,
        category: r.category || "",
        inwardQty: 0,
        issuedQty: 0,
        balanceQty: 0,
        minLevel: toNum(r.minLevel || 10),
        status: "OK",
      };
    }

    map[itemName].inwardQty += toNum(r.qty);
  });

  storesIssueRows.forEach((r) => {
    const itemName =
      r.itemName || "UNKNOWN";

    if (!map[itemName]) {
      map[itemName] = {
        itemName,
        category: r.category || "",
        inwardQty: 0,
        issuedQty: 0,
        balanceQty: 0,
        minLevel: 10,
        status: "OK",
      };
    }

    map[itemName].issuedQty += toNum(r.qty);
  });

  Object.values(map).forEach((r) => {
    r.balanceQty =
      r.inwardQty -
      r.issuedQty;

    if (r.balanceQty <= 0) {
      r.status = "OUT";
    } else if (r.balanceQty <= r.minLevel) {
      r.status = "LOW";
    } else {
      r.status = "OK";
    }
  });

  return Object.values(map);
}

function sum(rows, field) {
  return rows.reduce((total, r) => {
    return total + toNum(r[field]);
  }, 0);
}

function buildAlerts({
  rmStock,
  washStock,
  fgStock,
  storesStock,
}) {
  const alerts = [];

  if (rmStock < 0) {
    alerts.push("Negative RM stock");
  }

  if (washStock < 0) {
    alerts.push("Negative wash stock");
  }

  if (fgStock < 0) {
    alerts.push("Negative FG stock");
  }

  if (storesStock < 0) {
    alerts.push("Negative stores stock");
  }

  return alerts;
}