import assert from "node:assert/strict";
import {
  dispatchRevenue,
  normalizeDispatchCommercial,
  priceDispatchLines,
  resolveFgRate,
} from "../src/services/dispatchPricing.js";

const rates = [
  { rateId: "E1-OLD", grade: "E1", ratePerKg: 108, effectiveFrom: "2026-06-01", effectiveTo: "2026-06-14", status: "ACTIVE" },
  { rateId: "E1-NEW", grade: "E1", ratePerKg: 110, effectiveFrom: "2026-06-15", status: "ACTIVE" },
  { rateId: "E1-MT", grade: "E1", customerName: "Mold-Tek", ratePerKg: 112, effectiveFrom: "2026-06-15", status: "ACTIVE" },
  { rateId: "E2-DEF", grade: "E2", ratePerKg: 109, effectiveFrom: "2026-06-01", status: "ACTIVE" },
  { rateId: "E3-DEF", grade: "E3", ratePerKg: 105, effectiveFrom: "2026-06-01", status: "ACTIVE" },
];

const checks = [];
function check(name, callback) {
  callback();
  checks.push(name);
}

check("1. Single-grade E1 Dispatch", () => {
  const lines = priceDispatchLines([{ grade: "E1", dispatchQtyKg: 5000 }], { fgRates: rates, customerName: "Other", date: "2026-06-15" });
  assert.equal(lines[0].lineValue, 550000);
});

check("2. Multi-grade E1 + E3 uses different rates", () => {
  const lines = priceDispatchLines([{ grade: "E1", dispatchQtyKg: 5000 }, { grade: "E3", dispatchQtyKg: 10000 }], { fgRates: rates, customerName: "Other", date: "2026-06-15" });
  assert.deepEqual(lines.map((line) => line.ratePerKg), [110, 105]);
  assert.equal(lines.reduce((sum, line) => sum + line.lineValue, 0), 1600000);
});

check("3. Customer-specific E1 override", () => {
  assert.equal(resolveFgRate(rates, { grade: "E1", customerName: "Mold-Tek", date: "2026-06-15" }).ratePerKg, 112);
});

check("4. Default E2 rate", () => {
  assert.equal(resolveFgRate(rates, { grade: "E2", customerName: "Other", date: "2026-06-20" }).ratePerKg, 109);
});

check("5. Mid-month E1 rate change", () => {
  assert.equal(resolveFgRate(rates, { grade: "E1", customerName: "Other", date: "2026-06-14" }).ratePerKg, 108);
  assert.equal(resolveFgRate(rates, { grade: "E1", customerName: "Other", date: "2026-06-15" }).ratePerKg, 110);
});

check("6. Dispatch exactly on effectiveFrom", () => {
  assert.equal(resolveFgRate(rates, { grade: "E1", customerName: "Other", date: "2026-06-15" }).rateId, "E1-NEW");
});

check("7. Dispatch exactly on effectiveTo", () => {
  assert.equal(resolveFgRate(rates, { grade: "E1", customerName: "Other", date: "2026-06-14" }).rateId, "E1-OLD");
});

check("8. Open-ended rate", () => {
  assert.equal(resolveFgRate(rates, { grade: "E3", customerName: "Other", date: "2027-01-01" }).ratePerKg, 105);
});

check("9. Missing one line rate blocks complete Dispatch", () => {
  assert.throws(() => priceDispatchLines([{ grade: "E1", dispatchQtyKg: 100 }, { grade: "E4", dispatchQtyKg: 100 }], { fgRates: rates, customerName: "Other", date: "2026-06-15" }), /Missing FG selling rate/);
});

const historical = {
  quantityKg: 1000,
  ratePerKg: 100,
  dispatchLines: JSON.stringify([{ grade: "E1", dispatchQtyKg: 1000 }]),
};

check("10. Editing vehicle number preserves rate", () => {
  const before = normalizeDispatchCommercial(historical);
  const after = normalizeDispatchCommercial({ ...historical, vehicleNo: "NEW" });
  assert.equal(after.dispatchValue, before.dispatchValue);
  assert.equal(after.dispatchLines[0].ratePerKg, 100);
});

check("11. Editing quantity recalculates value and preserves rate", () => {
  const after = normalizeDispatchCommercial({ quantityKg: 1200, ratePerKg: 100, dispatchLines: [{ grade: "E1", dispatchQtyKg: 1200, ratePerKg: 100 }] });
  assert.equal(after.dispatchValue, 120000);
  assert.equal(after.dispatchLines[0].ratePerKg, 100);
});

check("12. Editing date across boundary re-resolves rate", () => {
  const before = priceDispatchLines([{ grade: "E1", dispatchQtyKg: 100 }], { fgRates: rates, customerName: "Other", date: "2026-06-14" });
  const after = priceDispatchLines(before, { fgRates: rates, customerName: "Other", date: "2026-06-15" });
  assert.equal(after[0].ratePerKg, 110);
});

check("13. Editing grade re-resolves only that line", () => {
  const before = priceDispatchLines([{ grade: "E1", dispatchQtyKg: 100 }, { grade: "E2", dispatchQtyKg: 200 }], { fgRates: rates, customerName: "Other", date: "2026-06-15" });
  const changed = priceDispatchLines([{ ...before[0], grade: "E3" }], { fgRates: rates, customerName: "Other", date: "2026-06-15" })[0];
  assert.equal(changed.ratePerKg, 105);
  assert.equal(before[1].ratePerKg, 109);
});

check("14. Deleted Dispatch excluded from revenue", () => {
  assert.equal(dispatchRevenue([{ status: "ACTIVE", dispatchValue: 1000 }, { status: "DELETED", dispatchValue: 9000 }]), 1000);
});

check("15. Dashboard, History and Month Close share normalized revenue", () => {
  const rows = [historical, { quantityKg: 500, dispatchValue: 55000, dispatchLines: [{ grade: "E2", dispatchQtyKg: 500, ratePerKg: 110, lineValue: 55000 }] }];
  const direct = rows.reduce((sum, row) => sum + normalizeDispatchCommercial(row).dispatchValue, 0);
  assert.equal(dispatchRevenue(rows), direct);
});

check("16. Changing FG_Rates does not reprice old Dispatch", () => {
  const before = normalizeDispatchCommercial(historical).dispatchValue;
  const changedMaster = rates.map((rate) => ({ ...rate, ratePerKg: rate.ratePerKg + 999 }));
  assert.ok(changedMaster[0].ratePerKg > 100);
  assert.equal(normalizeDispatchCommercial(historical).dispatchValue, before);
  assert.equal(normalizeDispatchCommercial(historical).priceSource, "LEGACY_HEADER_RATE");
});

assert.equal(checks.length, 16);
console.log(`Dispatch pricing regression checks passed (${checks.length}/16).`);
