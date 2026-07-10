import { useEffect, useMemo, useState } from "react";
import {
  listProductionMaterialMaster,
  normalizeProductionMaterialName,
} from "../services/productionMaterialMaster";

export default function ProductionMaterialSelect({
  name,
  value,
  onChange,
  stage,
  direction,
  placeholder = "Select Material",
  style,
  required,
  items: providedItems,
}) {
  const [items, setItems] = useState([]);
  const normalizedValue = normalizeProductionMaterialName(value);

  useEffect(() => {
    if (Array.isArray(providedItems)) return undefined;
    let active = true;
    listProductionMaterialMaster({ stage, direction }).then((rows) => {
      if (active) setItems(rows);
    });
    return () => {
      active = false;
    };
  }, [stage, direction, providedItems]);

  const sourceItems = Array.isArray(providedItems) ? providedItems : items;

  const options = useMemo(() => {
    const values = [];
    const seen = new Set();

    sourceItems.filter((item) => productionMaterialAllowedForSelect(item, stage, direction)).forEach((item) => {
      const label = item.canonicalName || item.materialName || item.name || "";
      if (!label || seen.has(label)) return;
      seen.add(label);
      values.push(label);
    });

    return values;
  }, [sourceItems, stage, direction]);

  function emit(nextValue) {
    if (typeof onChange === "function") {
      onChange({
        target: {
          name,
          value: normalizeProductionMaterialName(nextValue),
        },
      });
    }
  }

  return (
    <select
      name={name}
      value={normalizedValue}
      onChange={(e) => emit(e.target.value)}
      required={required}
      style={style}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function productionMaterialAllowedForSelect(item, stage, direction) {
  const status = String(item.status || "ACTIVE").toUpperCase();
  if (status !== "ACTIVE") return false;
  const s = String(stage || "").toUpperCase();
  const d = String(direction || "").toUpperCase();
  const flags = {
    RM_INWARD: "appearsInRMInward",
    GRINDER_INPUT: "appearsInGrinderInput",
    GRINDER_OUTPUT: "appearsInGrinderOutput",
    WASH_INPUT: "appearsInWashInput",
    WASH_OUTPUT: "appearsInWashOutput",
    SORTING_INPUT: "appearsInSorterInput",
    SORTING_OUTPUT: "appearsInSorterOutput",
    EXTRUSION_INPUT: "appearsInExtrusionInput",
    EXTRUSION_OUTPUT: "appearsInExtrusionOutput",
  };
  const key = s === "RM_INWARD" ? "RM_INWARD" : `${s}_${d}`;
  const flag = flags[key];
  return !flag || ["YES", "TRUE", "Y", "1", "ON"].includes(String(item[flag] || "").toUpperCase());
}
