import { useEffect, useMemo, useState } from "react";
import FactoryMasterModal from "./FactoryMasterModal";
import "./factoryDesignSystem.css";
import {
  getFavoriteMasterItems,
  getRecentMasterItems,
  listFactoryMaster,
  rememberMasterItem,
  toggleFavoriteMasterItem,
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
}) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [modalItem, setModalItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [favorites, setFavorites] = useState(() => getFavoriteMasterItems(masterType));
  const [recent, setRecent] = useState(() => getRecentMasterItems(masterType));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadItems();
  }, [masterType]);

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
    const term = search.trim().toLowerCase();
    return items
      .filter((item) => (filter ? filter(item) : true))
      .filter((item) => String(item.status || "").toUpperCase() !== "DISABLED")
      .filter((item) => String(item.status || "").toUpperCase() !== "MERGED")
      .filter((item) => !term || JSON.stringify(item).toLowerCase().includes(term));
  }, [items, search, filter]);

  const selected = items.find((item) => item.name === value || item.id === value);

  function emit(item) {
    const selectedValue = item?.name || "";
    rememberMasterItem(masterType, item);
    setRecent(getRecentMasterItems(masterType));

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

  function onSelect(e) {
    const item = items.find((x) => String(x.id) === String(e.target.value));
    if (item) emit(item);
  }

  async function onSaved(item) {
    setModalOpen(false);
    setModalItem(null);
    await loadItems();
    if (item && String(item.status || "").toUpperCase() !== "DISABLED") {
      emit(item);
    }
  }

  function favoriteSelected() {
    if (!selected) return;
    setFavorites(toggleFavoriteMasterItem(masterType, selected));
  }

  return (
    <div style={wrap}>
      {label && <label style={labelStyle}>{label}</label>}

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={`Search ${placeholder.toLowerCase()}...`}
        style={{ ...baseInput, ...style }}
      />

      <div style={row}>
        <select
          name={name}
          value={selected?.id || ""}
          onChange={onSelect}
          required={required}
          style={{ ...baseInput, ...style, flex: 1 }}
        >
          <option value="">{loading ? "Loading..." : placeholder}</option>
          {favorites.length > 0 && <option disabled>★ Favorites</option>}
          {favorites
            .filter((item) => visibleItems.some((x) => String(x.id) === String(item.id)))
            .map((item) => (
              <option key={`fav-${item.id || item.name}`} value={item.id}>
                ★ {item.name}
              </option>
            ))}
          {recent.length > 0 && <option disabled>Recently Used</option>}
          {recent
            .filter((item) => visibleItems.some((x) => String(x.id) === String(item.id)))
            .map((item) => (
              <option key={`recent-${item.id || item.name}`} value={item.id}>
                {item.name}
              </option>
            ))}
          <option disabled>All</option>
          {visibleItems.map((item) => (
            <option key={item.id || item.name} value={item.id}>
              {item.name}
              {String(item.status || "").toUpperCase() === "PENDING_APPROVAL"
                ? " (Pending Approval)"
                : ""}
            </option>
          ))}
        </select>

        <button type="button" onClick={favoriteSelected} disabled={!selected} style={smallButton}>
          ★
        </button>
        <button
          type="button"
          onClick={() => {
            setModalItem(selected || null);
            setModalOpen(true);
          }}
          style={smallButton}
        >
          {selected ? "Edit" : "+ Add New"}
        </button>
      </div>

      <div style={meta}>
        Search • Favorites • Recently Used • Add New • Edit • Disable • Merge • Audit
      </div>

      {modalOpen && (
        <FactoryMasterModal
          masterType={masterType}
          title={`${selected ? "Edit" : "Add"} ${placeholder}`}
          item={modalItem}
          items={items}
          onClose={() => {
            setModalOpen(false);
            setModalItem(null);
          }}
          onSaved={onSaved}
        />
      )}
    </div>
  );
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
  padding: "10px 12px",
  cursor: "pointer",
  fontWeight: 850,
  whiteSpace: "nowrap",
};
const meta = { fontSize: 11, color: "#64748b" };
const labelStyle = { fontSize: 12, fontWeight: 700, color: "#334155" };
