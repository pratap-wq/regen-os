import { useEffect, useId, useMemo, useState } from "react";
import FactoryMasterModal from "./FactoryMasterModal";
import "./factoryDesignSystem.css";
import {
  listFactoryMaster,
  rememberMasterItem,
} from "../services/FactoryMasterService";

export default function FactoryDropdown({
  masterType,
  value,
  onChange,
  name,
  placeholder = "Select",
  required,
  style,
  filter,
  label,
  allowAddNew = false,
}) {
  const listId = useId();
  const [items, setItems] = useState([]);
  const [inputValue, setInputValue] = useState(value || "");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadItems();
  }, [masterType]);

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  async function loadItems() {
    setLoading(true);

    try {
      const rows = await listFactoryMaster(masterType);
      setItems(rows);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  const visibleItems = useMemo(() => {
    const term = inputValue.trim().toLowerCase();

    return items
      .filter((item) => (filter ? filter(item) : true))
      .filter((item) => String(item.status || "").toUpperCase() !== "DISABLED")
      .filter((item) => String(item.status || "").toUpperCase() !== "MERGED")
      .filter((item) => !term || itemLabel(item).toLowerCase().includes(term))
      .slice(0, 250);
  }, [items, inputValue, filter]);

  function emit(item) {
    const selectedValue = itemLabel(item);

    rememberMasterItem(masterType, item);
    setInputValue(selectedValue);

    if (typeof onChange === "function") {
      onChange({
        target: {
          name,
          value: selectedValue,
        },
        item,
      });
    }
  }

  function emitRaw(nextValue, item = null) {
    if (typeof onChange === "function") {
      onChange({
        target: {
          name,
          value: nextValue,
        },
        item,
      });
    }
  }

  function onInputChange(e) {
    const nextValue = e.target.value;
    setInputValue(nextValue);

    const exact = items.find((item) => itemLabel(item) === nextValue);

    if (exact) {
      emit(exact);
      return;
    }

    emitRaw(nextValue);
  }

  function onBlur() {
    const cleanValue = String(inputValue || "").trim().toLowerCase();
    const exact = items.find((item) => itemLabel(item).toLowerCase() === cleanValue);

    if (exact) emit(exact);
  }

  async function onSaved(item) {
    setModalOpen(false);
    await loadItems();

    if (item && String(item.status || "").toUpperCase() !== "DISABLED") {
      emit(item);
    }
  }

  return (
    <div style={wrap}>
      {label && <label style={labelStyle}>{label}</label>}

      <div style={row}>
        <input
          list={listId}
          name={name}
          value={inputValue}
          onChange={onInputChange}
          onBlur={onBlur}
          placeholder={loading ? "Loading..." : placeholder}
          required={required}
          style={{ ...baseInput, ...style, flex: 1 }}
        />

        <datalist id={listId}>
          {visibleItems.map((item) => (
            <option key={item.id || item.code || item.name} value={itemLabel(item)} />
          ))}
        </datalist>

        {allowAddNew && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            style={smallButton}
            title="Add new"
            aria-label={`Add new ${placeholder}`}
          >
            +
          </button>
        )}
      </div>

      {modalOpen && (
        <FactoryMasterModal
          masterType={masterType}
          title={`Add ${placeholder}`}
          item={null}
          items={items}
          onClose={() => setModalOpen(false)}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}

function itemLabel(item) {
  return String(
    item?.name ||
      item?.materialName ||
      item?.supplierName ||
      item?.customerName ||
      item?.machineName ||
      item?.recipeName ||
      item?.itemName ||
      item?.code ||
      item?.materialCode ||
      ""
  ).trim();
}

const wrap = { display: "flex", flexDirection: "column", gap: 6 };
const row = { display: "flex", gap: 8, alignItems: "center" };
const baseInput = {
  width: "100%",
  padding: "10px 11px",
  border: "1px solid #cbd5e1",
  borderRadius: 10,
  boxSizing: "border-box",
  minHeight: 40,
  outline: "none",
};
const smallButton = {
  border: "1px solid #cbd5e1",
  background: "#f8fafc",
  color: "#0f172a",
  borderRadius: 10,
  padding: "8px 12px",
  cursor: "pointer",
  fontWeight: 850,
  minWidth: 40,
  minHeight: 40,
  whiteSpace: "nowrap",
};
const labelStyle = { fontSize: 12, fontWeight: 700, color: "#334155" };
