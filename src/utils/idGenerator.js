export function cleanDate(dateValue) {
  if (!dateValue) return new Date().toISOString().split("T")[0];

  const text = String(dateValue);

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  if (text.includes("T")) return text.split("T")[0];

  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return new Date().toISOString().split("T")[0];

  return d.toISOString().split("T")[0];
}

export function dateCompact(dateValue) {
  return cleanDate(dateValue).replaceAll("-", "");
}

export function normalizeShift(shift) {
  return String(shift || "NA").trim().toUpperCase();
}

export function normalizeGrade(grade) {
  return String(grade || "FG").trim().toUpperCase();
}

export function getSequence(existingRows = [], idField, prefix) {
  const matching = existingRows
    .map((r) => String(r[idField] || ""))
    .filter((id) => id.startsWith(prefix));

  let max = 0;

  matching.forEach((id) => {
    const last = id.split("-").pop();
    const num = Number(last || 0);
    if (num > max) max = num;
  });

  return String(max + 1).padStart(3, "0");
}

export function generateRMInwardId(dateValue, existingRows = []) {
  const prefix = `RMI-${dateCompact(dateValue)}`;
  return `${prefix}-${getSequence(existingRows, "inwardId", prefix)}`;
}

export function generateWashBatchId(dateValue, shift, existingRows = []) {
  const prefix = `WB-${dateCompact(dateValue)}-${normalizeShift(shift)}`;
  return `${prefix}-${getSequence(existingRows, "washBatchId", prefix)}`;
}

export function generateSortingBatchId(dateValue, shift, existingRows = []) {
  const prefix = `SB-${dateCompact(dateValue)}-${normalizeShift(shift)}`;
  return `${prefix}-${getSequence(existingRows, "sortingBatchId", prefix)}`;
}

export function generateExtrusionBatchId(dateValue, shift, grade, existingRows = []) {
  const prefix = `${normalizeGrade(grade)}-${dateCompact(dateValue)}-${normalizeShift(shift)}`;
  return `${prefix}-${getSequence(existingRows, "extrusionBatchId", prefix)}`;
}

export function generateDispatchId(dateValue, existingRows = []) {
  const prefix = `DIS-${dateCompact(dateValue)}`;
  return `${prefix}-${getSequence(existingRows, "dispatchId", prefix)}`;
}

export function generateStoresInwardId(dateValue, existingRows = []) {
  const prefix = `SI-${dateCompact(dateValue)}`;
  return `${prefix}-${getSequence(existingRows, "storesInwardId", prefix)}`;
}

export function generateStoresIssueId(dateValue, existingRows = []) {
  const prefix = `SO-${dateCompact(dateValue)}`;
  return `${prefix}-${getSequence(existingRows, "storesIssueId", prefix)}`;
}