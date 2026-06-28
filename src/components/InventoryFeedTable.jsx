export default function InventoryFeedTable({ rows, setRows }) {
  const sourceTypes = [
    "WHITE_FLAKES",
    "SORTED_FLAKES",
    "WASHED_FLAKES",
    "RECOVERY_MATERIAL",
    "REWORK_GRANULES",
    "LUMPS",
    "PURGING",
    "VIRGIN_PP",
    "BATTERY_REGRIND",
    "MASTERBATCH",
    "ANTIOXIDANT",
    "ADDITIVE_PACKAGE",
    "OTHER",
  ];

  function updateRow(index, key, value) {
    setRows(
      rows.map((row, i) =>
        i === index
          ? {
              ...row,
              [key]: value,
              materialType: key === "sourceType" ? value : row.materialType,
            }
          : row
      )
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
      <div style={miniTitle}>Extruder Feed Composition</div>

      <table style={table}>
        <thead>
          <tr style={head}>
            <th style={th}>Source / Material</th>
            <th style={th}>Material Type</th>
            <th style={th}>Qty Kg</th>
            <th style={th}>Remarks</th>
            <th style={th}>Action</th>
          </tr>
        </thead>

        <tbody>
          {(rows || []).map((r, i) => (
            <tr key={i}>
              <td style={td}>
                <select
                  value={r.sourceType || ""}
                  onChange={(e) => updateRow(i, "sourceType", e.target.value)}
                  style={input}
                >
                  <option value="">Select Source</option>
                  {sourceTypes.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </td>

              <td style={td}>
                <input
                  value={r.materialType || ""}
                  onChange={(e) =>
                    updateRow(i, "materialType", e.target.value)
                  }
                  style={input}
                />
              </td>

              <td style={td}>
                <input
                  type="number"
                  value={r.qtyKg || ""}
                  onChange={(e) => updateRow(i, "qtyKg", e.target.value)}
                  style={input}
                />
              </td>

              <td style={td}>
                <input
                  value={r.remarks || ""}
                  onChange={(e) => updateRow(i, "remarks", e.target.value)}
                  style={input}
                />
              </td>

              <td style={td}>
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  style={removeButton}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
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
  minWidth: 760,
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