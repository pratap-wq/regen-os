import FactoryDropdown from "./FactoryDropdown";
import { buildAvailabilityMap, materialKey } from "../utils/materialInventory";

export default function ManufacturingInputTable({
  rows,
  setRows,
  inventoryLots = [],
  title = "Input Materials",
  materialPlaceholder = "Select Material",
  quantityLabel = "Consume Qty",
  filterCategories = ["RM", "WIP", "REWORK", "ADDITIVE"],
  showRemarks = true,
}) {
  const availability = buildAvailabilityMap(inventoryLots);

  function updateRow(index, key, value) {
    setRows(
      rows.map((row, i) => {
        if (i !== index) return row;

        const next = {
          ...row,
          [key]: value,
        };

        if (key === "sourceType") {
          next.materialType = value;
        }

        return next;
      })
    );
  }

  function blankRow() {
    return {
      sourceType: "",
      materialType: "",
      qtyKg: "",
      remarks: "",
    };
  }

  function addRow() {
    setRows([...rows, blankRow()]);
  }

  function removeRow(index) {
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated.length ? updated : [blankRow()]);
  }

  return (
    <div style={{ gridColumn: "1 / -1", overflowX: "auto" }}>
      <div style={miniTitle}>{title}</div>

      <table style={table}>
        <thead>
          <tr style={head}>
            <th style={th}>Material</th>
            <th style={th}>Available Qty</th>
            <th style={th}>{quantityLabel}</th>
            {showRemarks ? <th style={th}>Remarks</th> : null}
            <th style={th}>Delete Row</th>
          </tr>
        </thead>

        <tbody>
          {(rows || []).map((r, i) => {
            const material = r.materialType || r.sourceType || "";
            const availableQty = availability[materialKey(material)] || 0;

            return (
              <tr key={i}>
                <td style={td}>
                  <FactoryDropdown
                    masterType="material"
                    name="sourceType"
                    value={r.sourceType || ""}
                    onChange={(e) => updateRow(i, "sourceType", e.target.value)}
                    placeholder={materialPlaceholder}
                    style={input}
                    allowAddNew
                    approvalRequired
                    defaults={{ category: "RM", unit: "Kg" }}
                    filter={(item) =>
                      filterCategories.includes(
                        String(item.category || item.materialType || "").toUpperCase()
                      )
                    }
                  />
                </td>

                <td style={td}>
                  <input
                    readOnly
                    value={`${availableQty.toFixed(2)} Kg`}
                    style={readonlyInput}
                  />
                </td>

                <td style={td}>
                  <input
                    type="number"
                    min="0"
                    value={r.qtyKg || ""}
                    onChange={(e) => updateRow(i, "qtyKg", e.target.value)}
                    style={input}
                  />
                </td>

                {showRemarks ? (
                  <td style={td}>
                    <input
                      value={r.remarks || ""}
                      onChange={(e) => updateRow(i, "remarks", e.target.value)}
                      style={input}
                      placeholder="Optional"
                    />
                  </td>
                ) : null}

                <td style={td}>
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    style={removeButton}
                  >
                    Delete Row
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <button type="button" onClick={addRow} style={addButton}>
        + Add Feed Material
      </button>
    </div>
  );
}

const miniTitle = {
  fontWeight: 800,
  color: "#0f766e",
  marginBottom: 10,
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  marginBottom: 10,
  minWidth: 860,
};

const head = {
  background: "#0f766e",
  color: "white",
};

const th = {
  padding: 10,
  textAlign: "left",
  fontSize: 12,
};

const td = {
  padding: 8,
  borderBottom: "1px solid #e5e7eb",
};

const input = {
  width: "100%",
  padding: 8,
  border: "1px solid #d1d5db",
  borderRadius: 6,
  boxSizing: "border-box",
};

const readonlyInput = {
  ...input,
  background: "#f8fafc",
  fontWeight: 700,
};

const addButton = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "9px 14px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
};

const removeButton = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
};
