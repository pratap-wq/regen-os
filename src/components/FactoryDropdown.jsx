import { useEffect, useId, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  providedItems,
}) {
  const listId = useId();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [inputValue, setInputValue] = useState(value || "");

  useEffect(() => {
    if (Array.isArray(providedItems)) return undefined;
    let active = true;
    listFactoryMaster(masterType)
      .then((rows) => { if (active) setItems(rows); })
      .catch((err) => console.log(err));
    return () => { active = false; };
  }, [masterType, providedItems]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInputValue(value || "");
  }, [value]);

  const sourceItems = Array.isArray(providedItems) ? providedItems : items;

  const visibleItems = useMemo(() => {
    const term = inputValue.trim().toLowerCase();

    return sourceItems
      .filter((item) => (filter ? filter(item) : true))
      .filter((item) => String(item.status || "").toUpperCase() !== "DISABLED")
      .filter((item) => String(item.status || "").toUpperCase() !== "INACTIVE")
      .filter((item) => String(item.status || "").toUpperCase() !== "MERGED")
      .filter((item) => String(item.status || "").toUpperCase() !== "ARCHIVED")
      .filter((item) => !term || itemLabel(item).toLowerCase().includes(term))
      .slice(0, 250);
  }, [sourceItems, inputValue, filter]);

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

    const exact = sourceItems.find((item) => itemLabel(item) === nextValue);

    if (exact) {
      emit(exact);
      return;
    }

    emitRaw(nextValue);
  }

  function onBlur() {
    const cleanValue = String(inputValue || "").trim().toLowerCase();
    const exact = sourceItems.find((item) => itemLabel(item).toLowerCase() === cleanValue);

    if (exact) emit(exact);
  }

  function openMasterManager() {
    const params = new URLSearchParams({
      master: masterType || "",
      new: "1",
    });

    navigate(`/factory-masters?${params.toString()}`);
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
          placeholder={placeholder}
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
            onClick={openMasterManager}
            style={smallButton}
            title="Add new"
            aria-label={`Add new ${placeholder}`}
          >
            +
          </button>
        )}
      </div>
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
