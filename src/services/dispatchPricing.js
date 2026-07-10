function n(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function gradeKey(value) {
  const match = String(value || "").trim().toUpperCase().match(/\bE[1-5]\b/);
  return match ? match[0] : "";
}

function dateKey(value) {
  if (!value) return "";
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function rateStart(row) {
  const explicit = dateKey(row.effectiveFrom || row.date);
  if (explicit) return explicit;
  const year = Number(row.year || 0);
  const month = Number(row.month || 0) || ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"].indexOf(String(row.month || "").slice(0, 3).toUpperCase()) + 1;
  return year && month > 0 ? `${year}-${String(month).padStart(2, "0")}-01` : "";
}

function rateEnd(row) {
  if (row.effectiveTo) return dateKey(row.effectiveTo);
  if (row.effectiveFrom || row.date) return "";
  const start = rateStart(row);
  if (!start) return "";
  const [year, month] = start.split("-").map(Number);
  return new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
}

function activeRate(row) {
  const status = String(row.status || "ACTIVE").toUpperCase();
  const isActive = String(row.isActive === undefined ? "TRUE" : row.isActive).toUpperCase();
  return !["DELETED", "INACTIVE", "DISABLED", "ARCHIVED", "REJECTED"].includes(status) && isActive !== "FALSE";
}

export function resolveFgRate(fgRates, { grade, customerName, date }) {
  const targetGrade = gradeKey(grade);
  const customer = String(customerName || "").trim().toUpperCase();
  const targetDate = dateKey(date);
  const matches = (fgRates || [])
    .filter(activeRate)
    .filter((row) => gradeKey(row.grade) === targetGrade)
    .map((row) => {
      const rowCustomer = String(row.customerName || "").trim().toUpperCase();
      return {
        row,
        start: rateStart(row),
        end: rateEnd(row),
        customerExact: Boolean(customer && rowCustomer === customer),
        isDefault: !rowCustomer,
      };
    })
    .filter((item) => item.customerExact || item.isDefault)
    .filter((item) => !targetDate || (!item.start || item.start <= targetDate) && (!item.end || item.end >= targetDate))
    .sort((a, b) => Number(b.customerExact) - Number(a.customerExact) || String(b.start).localeCompare(String(a.start)));

  const match = matches[0];
  if (!match || n(match.row.ratePerKg) <= 0) return null;
  return {
    rateId: match.row.rateId || "",
    ratePerKg: n(match.row.ratePerKg),
    rateSource: match.customerExact ? "FG_RATES_CUSTOMER" : "FG_RATES_DEFAULT",
    rateEffectiveFrom: match.start,
    rateEffectiveTo: match.end,
  };
}

export function parseDispatchLines(value) {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function priceDispatchLines(lines, context) {
  return (lines || []).map((line) => {
    const grade = gradeKey(line.grade || line.material);
    const dispatchQtyKg = n(line.dispatchQtyKg || line.quantityKg);
    const resolved = resolveFgRate(context.fgRates, { grade, customerName: context.customerName, date: context.date });
    if (!grade || dispatchQtyKg <= 0) throw new Error("Every Dispatch line requires an FG grade and quantity.");
    if (!resolved) throw new Error(`Missing FG selling rate for ${grade}.`);
    return {
      ...line,
      grade,
      material: grade,
      dispatchQtyKg,
      ...resolved,
      lineValue: dispatchQtyKg * resolved.ratePerKg,
    };
  });
}

export function normalizeDispatchCommercial(row = {}) {
  let lines = parseDispatchLines(row.dispatchLines);
  if (!lines.length && (row.grade || row.material || row.quantityKg)) {
    lines = [{ grade: row.grade || row.material, dispatchQtyKg: row.quantityKg }];
  }
  let legacyHeaderRate = false;
  const normalizedLines = lines.map((line) => {
    const dispatchQtyKg = n(line.dispatchQtyKg || line.quantityKg);
    let ratePerKg = n(line.ratePerKg);
    if (ratePerKg <= 0 && n(row.ratePerKg) > 0) {
      ratePerKg = n(row.ratePerKg);
      legacyHeaderRate = true;
    }
    const lineValue = n(line.lineValue) || dispatchQtyKg * ratePerKg;
    return {
      ...line,
      grade: gradeKey(line.grade || line.material || row.grade),
      dispatchQtyKg,
      ratePerKg,
      rateId: line.rateId || row.resolvedRateId || "",
      rateSource: line.rateSource || row.rateSource || (legacyHeaderRate ? "LEGACY_HEADER_RATE" : ""),
      rateEffectiveFrom: line.rateEffectiveFrom || row.rateEffectiveFrom || "",
      rateEffectiveTo: line.rateEffectiveTo || row.rateEffectiveTo || "",
      lineValue,
    };
  });
  const quantityKg = n(row.quantityKg) || normalizedLines.reduce((sum, line) => sum + line.dispatchQtyKg, 0);
  const normalizedLineValue = normalizedLines.reduce((sum, line) => sum + line.lineValue, 0);
  const dispatchValue = n(row.dispatchValue) || normalizedLineValue;
  return {
    ...row,
    quantityKg,
    dispatchValue,
    weightedAvgRatePerKg: n(row.weightedAvgRatePerKg) || (quantityKg > 0 ? dispatchValue / quantityKg : 0),
    priceSource: row.priceSource || (legacyHeaderRate ? "LEGACY_HEADER_RATE" : "SAVED_LINE_PRICE"),
    dispatchLines: normalizedLines,
  };
}

export function dispatchRevenue(rows = []) {
  return rows
    .filter((row) => !["DELETED", "VOID", "VOIDED"].includes(String(row.status || row.dispatchStatus || "").toUpperCase()))
    .reduce((sum, row) => sum + normalizeDispatchCommercial(row).dispatchValue, 0);
}
