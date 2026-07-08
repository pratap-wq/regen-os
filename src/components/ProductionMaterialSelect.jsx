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
}) {
  const [items, setItems] = useState([]);
  const normalizedValue = normalizeProductionMaterialName(value);

  useEffect(() => {
    let active = true;
    listProductionMaterialMaster({ stage, direction }).then((rows) => {
      if (active) setItems(rows);
    });
    return () => {
      active = false;
    };
  }, [stage, direction]);

  const options = useMemo(() => {
    const values = [];
    const seen = new Set();

    items.forEach((item) => {
      const label = item.canonicalName || item.materialName || item.name || "";
      if (!label || seen.has(label)) return;
      seen.add(label);
      values.push(label);
    });

    return values;
  }, [items, normalizedValue]);

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
