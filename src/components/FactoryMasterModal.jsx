import { useEffect, useMemo, useState } from "react";
import {
  addFactoryMaster,
  disableFactoryMaster,
  mergeFactoryMaster,
  updateFactoryMaster,
} from "../services/FactoryMasterService";

const typeDefaults = {
  material: { category: "RM", unit: "Kg" },
  supplier: { supplierType: "RAW_MATERIAL" },
  customer: {},
  machine: {},
  recipe: { processType: "EXTRUSION" },
  storeItem: { unit: "Nos" },
  qualityTest: { unit: "", testType: "" },
  expenseCategory: {},
};

const emptyDefaults = {};

export default function FactoryMasterModal({
  masterType,
  title,
  item,
  items = [],
  defaults = emptyDefaults,
  defaultStatus = "ACTIVE",
  createdBy = "System",
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState({});
  const [mode, setMode] = useState(item ? "edit" : "add");
  const [mergeIntoId, setMergeIntoId] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setForm({
      ...(typeDefaults[masterType] || {}),
      ...(defaults || {}),
      ...(item || {}),
      name: item?.name || "",
      status: item?.status || defaultStatus,
    });
    setMode(item ? "edit" : "add");
    setMergeIntoId("");
    setMessage("");
  }, [item, masterType, defaults, defaultStatus]);

  const mergeTargets = useMemo(
    () => items.filter((x) => x.id && x.id !== item?.id),
    [items, item]
  );

  function onChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function save() {
    if (!form.name) {
      setMessage("Name is required.");
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      let saved = null;
      if (mode === "edit" && item?.id) {
        await updateFactoryMaster(masterType, {
          ...form,
          id: item.id,
          status: form.status || "ACTIVE",
        });
        saved = { ...item, ...form, name: form.name };
      } else {
        saved = await addFactoryMaster(masterType, {
          ...form,
          status: form.status || defaultStatus,
          createdBy,
          updatedBy: createdBy,
        });
      }
      onSaved?.(saved || { ...form, name: form.name });
    } catch (err) {
      setMessage(err.message || "Failed to save master item.");
    } finally {
      setSaving(false);
    }
  }

  async function disable() {
    if (!item?.id) return;
    setSaving(true);
    setMessage("");
    try {
      await disableFactoryMaster(masterType, item);
      onSaved?.({ ...item, status: "DISABLED" });
    } catch (err) {
      setMessage(err.message || "Failed to disable item.");
    } finally {
      setSaving(false);
    }
  }

  async function merge() {
    if (!item?.id || !mergeIntoId) {
      setMessage("Select an item to merge into.");
      return;
    }
    const target = mergeTargets.find((x) => String(x.id) === String(mergeIntoId));
    if (!target) return;
    setSaving(true);
    setMessage("");
    try {
      await mergeFactoryMaster(masterType, item, target);
      onSaved?.({ ...item, status: "MERGED", mergedIntoId: target.id });
    } catch (err) {
      setMessage(err.message || "Failed to merge duplicate.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={header}>
          <div>
            <h3 style={{ margin: 0 }}>{title || "Factory Master"}</h3>
            <div style={subtle}>Add, edit, disable or merge without leaving this transaction.</div>
          </div>
          <button type="button" onClick={onClose} style={ghostButton}>×</button>
        </div>

        <div style={grid}>
          <label style={field}>
            <span style={label}>Name</span>
            <input name="name" value={form.name || ""} onChange={onChange} style={input} />
          </label>

          <label style={field}>
            <span style={label}>Status</span>
            <select name="status" value={form.status || "PENDING_APPROVAL"} onChange={onChange} style={input}>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="ACTIVE">Active</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </label>

          {masterType === "material" && (
            <>
              <label style={field}>
                <span style={label}>Category</span>
                <select name="category" value={form.category || "RM"} onChange={onChange} style={input}>
                  <option>RM</option>
                  <option>WIP</option>
                  <option>FG</option>
                  <option>REWORK</option>
                  <option>WASTE</option>
                  <option>STORE</option>
                  <option>ADDITIVE</option>
                </select>
              </label>
              <label style={field}>
                <span style={label}>Unit</span>
                <input name="unit" value={form.unit || "Kg"} onChange={onChange} style={input} />
              </label>
            </>
          )}

          {masterType === "machine" && (
            <>
              <label style={field}>
                <span style={label}>Process Type</span>
                <select name="processType" value={form.processType || ""} onChange={onChange} style={input}>
                  <option value="">Select</option>
                  <option>WASH</option>
                  <option>SORTING</option>
                  <option>EXTRUSION</option>
                </select>
              </label>
              <label style={field}>
                <span style={label}>Machine Type</span>
                <input name="machineType" value={form.machineType || ""} onChange={onChange} style={input} />
              </label>
            </>
          )}

          {masterType === "recipe" && (
            <label style={field}>
              <span style={label}>Process Type</span>
              <select name="processType" value={form.processType || "EXTRUSION"} onChange={onChange} style={input}>
                <option>WASH</option>
                <option>SORTING</option>
                <option>EXTRUSION</option>
              </select>
            </label>
          )}

          {masterType === "supplier" && (
            <label style={field}>
              <span style={label}>Supplier Type</span>
              <input name="supplierType" value={form.supplierType || ""} onChange={onChange} style={input} />
            </label>
          )}

          {masterType === "customer" && (
            <>
              <label style={field}>
                <span style={label}>Customer Code</span>
                <input name="customerCode" value={form.customerCode || ""} onChange={onChange} style={input} />
              </label>
              <label style={field}>
                <span style={label}>Customer Unit</span>
                <input name="customerUnit" value={form.customerUnit || ""} onChange={onChange} style={input} />
              </label>
            </>
          )}

          {masterType === "storeItem" && (
            <>
              <label style={field}>
                <span style={label}>Category</span>
                <input name="category" value={form.category || ""} onChange={onChange} style={input} />
              </label>
              <label style={field}>
                <span style={label}>Unit</span>
                <input name="unit" value={form.unit || "Nos"} onChange={onChange} style={input} />
              </label>
              <label style={field}>
                <span style={label}>Reorder Level</span>
                <input name="reorderLevel" value={form.reorderLevel || ""} onChange={onChange} style={input} />
              </label>
            </>
          )}

          {masterType === "qualityTest" && (
            <>
              <label style={field}>
                <span style={label}>Test Type</span>
                <input name="testType" value={form.testType || ""} onChange={onChange} style={input} />
              </label>
              <label style={field}>
                <span style={label}>Unit</span>
                <input name="unit" value={form.unit || ""} onChange={onChange} style={input} />
              </label>
            </>
          )}

          {masterType === "expenseCategory" && (
            <label style={field}>
              <span style={label}>Category Code</span>
              <input name="categoryCode" value={form.categoryCode || ""} onChange={onChange} style={input} />
            </label>
          )}
        </div>

        {item && (
          <div style={auditBox}>
            <b>Audit Trail</b>
            <div>Created By: {item.createdBy || "-"}</div>
            <div>Created Date: {String(item.createdAt || "-")}</div>
            <div>Updated By: {item.updatedBy || "-"}</div>
            <div>Updated Date: {String(item.updatedAt || "-")}</div>
            <div>Status: {item.status || "-"}</div>
          </div>
        )}

        {item?.id && (
          <div style={mergeBox}>
            <b>Merge Duplicate</b>
            <select value={mergeIntoId} onChange={(e) => setMergeIntoId(e.target.value)} style={input}>
              <option value="">Select correct master item</option>
              {mergeTargets.map((x) => (
                <option key={x.id} value={x.id}>{x.name}</option>
              ))}
            </select>
            <button type="button" disabled={!mergeIntoId || saving} onClick={merge} style={warnButton}>
              Merge Duplicate
            </button>
          </div>
        )}

        {message && <div style={messageStyle}>{message}</div>}

        <div style={actions}>
          {item?.id && (
            <button type="button" onClick={disable} disabled={saving} style={dangerButton}>
              Disable
            </button>
          )}
          <button type="button" onClick={onClose} style={secondaryButton}>Cancel</button>
          <button type="button" onClick={save} disabled={saving} style={primaryButton}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,23,42,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  padding: 16,
};

const modal = {
  width: "min(620px, 100%)",
  background: "white",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 24px 80px rgba(15,23,42,0.25)",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 16,
};

const subtle = { color: "#64748b", fontSize: 13, marginTop: 4 };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 };
const field = { display: "flex", flexDirection: "column", gap: 5 };
const label = { fontSize: 12, fontWeight: 800, color: "#334155" };
const input = { width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 10, boxSizing: "border-box" };
const auditBox = { marginTop: 14, padding: 12, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, fontSize: 12, color: "#334155", lineHeight: 1.7 };
const mergeBox = { marginTop: 14, display: "grid", gap: 8, padding: 12, background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12 };
const actions = { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18, flexWrap: "wrap" };
const primaryButton = { background: "#15803d", color: "white", border: 0, borderRadius: 10, padding: "10px 16px", fontWeight: 800, cursor: "pointer" };
const secondaryButton = { background: "#f1f5f9", color: "#0f172a", border: 0, borderRadius: 10, padding: "10px 16px", fontWeight: 800, cursor: "pointer" };
const dangerButton = { background: "#fee2e2", color: "#991b1b", border: 0, borderRadius: 10, padding: "10px 16px", fontWeight: 800, cursor: "pointer" };
const warnButton = { background: "#f97316", color: "white", border: 0, borderRadius: 10, padding: "9px 12px", fontWeight: 800, cursor: "pointer" };
const ghostButton = { background: "transparent", border: 0, fontSize: 24, cursor: "pointer", color: "#64748b" };
const messageStyle = { marginTop: 12, color: "#b91c1c", fontWeight: 700 };
