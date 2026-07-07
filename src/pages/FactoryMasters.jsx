import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import FactoryMasterModal from "../components/FactoryMasterModal";
import {
  disableFactoryMaster,
  listFactoryMaster,
} from "../services/FactoryMasterService";
import { auth } from "../firebase";

const MASTER_CONFIGS = [
  {
    key: "material",
    label: "Materials",
    sheet: "Material_Master",
    columns: ["code", "name", "category", "unit", "status"],
  },
  {
    key: "machine",
    label: "Machines",
    sheet: "Machine_Master",
    columns: ["code", "name", "processType", "machineType", "status"],
  },
  {
    key: "supplier",
    label: "Suppliers",
    sheet: "Suppliers",
    columns: ["name", "supplierType", "city", "qualityRating", "isActive", "status"],
  },
  {
    key: "customer",
    label: "Customers",
    sheet: "Customers",
    columns: ["code", "name", "customerUnit", "status"],
  },
  {
    key: "storeItem",
    label: "Store Items",
    sheet: "Stores_Master",
    columns: ["name", "category", "unit", "minLevel", "maxLevel", "reorderLevel", "status"],
  },
  {
    key: "expenseCategory",
    label: "Expense Categories",
    sheet: "Expense_Category_Master",
    columns: ["code", "name", "expenseType", "status"],
  },
  {
    key: "qualityTest",
    label: "Quality Tests",
    sheet: "Quality_Test_Master",
    columns: ["code", "name", "materialCategory", "unit", "specMin", "specMax", "status"],
  },
  {
    key: "recipe",
    label: "Production Recipes",
    sheet: "Production_Recipes",
    columns: ["code", "name", "processType", "outputMaterialCode", "status"],
  },
  {
    key: "productGrade",
    label: "Product Grades",
    sheet: "Production_Grades",
    columns: ["code", "name", "status"],
  },
  {
    key: "storageLocation",
    label: "Storage Locations",
    sheet: "Storage_Locations",
    columns: ["code", "name", "locationType", "status"],
  },
];

const configByKey = Object.fromEntries(MASTER_CONFIGS.map((config) => [config.key, config]));

export default function FactoryMasters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedKey = configByKey[searchParams.get("master")]
    ? searchParams.get("master")
    : "material";
  const selectedConfig = configByKey[selectedKey];

  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadRows();
  }, [selectedKey]);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setAdding(true);
      setSearchParams({ master: selectedKey }, { replace: true });
    }
  }, [searchParams, selectedKey, setSearchParams]);

  async function loadRows() {
    setLoading(true);
    setStatus("");

    try {
      const data = await listFactoryMaster(selectedKey);
      setRows(data);
    } catch (err) {
      setStatus(err.message || "Failed to load master.");
    } finally {
      setLoading(false);
    }
  }

  function changeMaster(e) {
    setSearchParams({ master: e.target.value });
    setSearch("");
    setEditing(null);
    setAdding(false);
  }

  async function disableRow(row) {
    const ok = window.confirm(`Disable ${row.name || row.code || "this item"}?`);
    if (!ok) return;

    try {
      await disableFactoryMaster(selectedKey, row);
      setStatus("Master item disabled.");
      loadRows();
    } catch (err) {
      setStatus(err.message || "Failed to disable item.");
    }
  }

  function onSaved() {
    setEditing(null);
    setAdding(false);
    setStatus("Master item saved.");
    loadRows();
  }

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;

    return rows.filter((row) =>
      JSON.stringify(row).toLowerCase().includes(term)
    );
  }, [rows, search]);

  return (
    <div style={page}>
      <div style={hero}>
        <div>
          <div style={eyebrow}>Masters</div>
          <h1 style={title}>Factory Masters</h1>
          <div style={subtitle}>
            One place to maintain factory dropdown values without creating separate master pages.
          </div>
        </div>

        <button type="button" onClick={() => setAdding(true)} style={primaryButton}>
          + Add New
        </button>
      </div>

      <div style={toolbar}>
        <label style={field}>
          <span style={label}>Master</span>
          <select value={selectedKey} onChange={changeMaster} style={input}>
            {MASTER_CONFIGS.map((config) => (
              <option key={config.key} value={config.key}>
                {config.label}
              </option>
            ))}
          </select>
        </label>

        <label style={field}>
          <span style={label}>Search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${selectedConfig.label}`}
            style={input}
          />
        </label>

        <button type="button" onClick={loadRows} style={secondaryButton}>
          Refresh
        </button>
      </div>

      <div style={summary}>
        <Card title="Selected Master" value={selectedConfig.label} />
        <Card title="Rows" value={rows.length} />
        <Card title="Visible" value={filteredRows.length} />
        <Card title="Saved In" value={selectedConfig.sheet} />
      </div>

      {status && <div style={statusBox}>{status}</div>}

      <div style={tableCard}>
        <div style={tableHeader}>
          <div>
            <h2 style={{ margin: 0 }}>{selectedConfig.label}</h2>
            <div style={muted}>Source: {selectedConfig.sheet}</div>
          </div>
          {loading && <div style={muted}>Loading...</div>}
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={table}>
            <thead>
              <tr>
                {selectedConfig.columns.map((column) => (
                  <th key={column} style={th}>{columnLabel(column)}</th>
                ))}
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, index) => (
                <tr key={row.id || row.code || row.name || index}>
                  {selectedConfig.columns.map((column) => (
                    <td key={column} style={td}>{String(row[column] ?? "")}</td>
                  ))}
                  <td style={td}>
                    <button type="button" onClick={() => setEditing(row)} style={linkButton}>
                      Edit
                    </button>
                    <button type="button" onClick={() => disableRow(row)} style={dangerLink}>
                      Disable
                    </button>
                  </td>
                </tr>
              ))}
              {!filteredRows.length && (
                <tr>
                  <td style={td} colSpan={selectedConfig.columns.length + 1}>
                    No rows found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(adding || editing) && (
        <FactoryMasterModal
          masterType={selectedKey}
          title={`${editing ? "Edit" : "Add"} ${selectedConfig.label}`}
          item={editing}
          items={rows}
          defaultStatus="ACTIVE"
          createdBy={auth.currentUser?.email || "System"}
          onClose={() => {
            setAdding(false);
            setEditing(null);
          }}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}

function columnLabel(value) {
  return String(value || "")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase());
}

function Card({ title, value }) {
  return (
    <div style={card}>
      <div style={cardTitle}>{title}</div>
      <div style={cardValue}>{value}</div>
    </div>
  );
}

const page = { padding: 20 };
const hero = {
  background: "white",
  borderRadius: 14,
  padding: 20,
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  alignItems: "center",
  boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
};
const eyebrow = { fontSize: 12, fontWeight: 900, color: "#0f766e", textTransform: "uppercase" };
const title = { margin: "4px 0", color: "#0f172a" };
const subtitle = { color: "#64748b", maxWidth: 720 };
const toolbar = {
  display: "grid",
  gridTemplateColumns: "minmax(220px, 320px) minmax(220px, 1fr) auto",
  gap: 12,
  alignItems: "end",
  background: "white",
  padding: 16,
  borderRadius: 14,
  marginTop: 16,
  boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
};
const field = { display: "flex", flexDirection: "column", gap: 5 };
const label = { fontSize: 12, fontWeight: 800, color: "#334155" };
const input = { padding: 10, border: "1px solid #cbd5e1", borderRadius: 10, minHeight: 40 };
const primaryButton = { background: "#0f766e", color: "white", border: 0, borderRadius: 10, padding: "11px 16px", fontWeight: 850, cursor: "pointer" };
const secondaryButton = { background: "#f1f5f9", color: "#0f172a", border: 0, borderRadius: 10, padding: "11px 16px", fontWeight: 850, cursor: "pointer" };
const summary = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginTop: 16 };
const card = { background: "white", borderRadius: 14, padding: 16, boxShadow: "0 10px 30px rgba(15,23,42,0.05)" };
const cardTitle = { fontSize: 12, color: "#64748b", fontWeight: 800 };
const cardValue = { marginTop: 6, fontSize: 20, fontWeight: 900, color: "#0f766e" };
const statusBox = { marginTop: 14, padding: 12, background: "#ecfdf5", borderRadius: 10, color: "#065f46", fontWeight: 800 };
const tableCard = { background: "white", borderRadius: 14, marginTop: 16, padding: 16, boxShadow: "0 10px 30px rgba(15,23,42,0.05)" };
const tableHeader = { display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 12 };
const muted = { color: "#64748b", fontSize: 13, marginTop: 4 };
const table = { width: "100%", borderCollapse: "collapse", minWidth: 780 };
const th = { textAlign: "left", background: "#f8fafc", color: "#334155", padding: 10, fontSize: 12, borderBottom: "1px solid #e2e8f0" };
const td = { padding: 10, borderBottom: "1px solid #e2e8f0", fontSize: 13 };
const linkButton = { background: "transparent", border: 0, color: "#0f766e", fontWeight: 850, cursor: "pointer", marginRight: 10 };
const dangerLink = { background: "transparent", border: 0, color: "#b91c1c", fontWeight: 850, cursor: "pointer" };
