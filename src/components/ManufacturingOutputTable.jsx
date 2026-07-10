import ProductionMaterialSelect from "./ProductionMaterialSelect";

export default function ManufacturingOutputTable({
  rows,
  setRows,
  title = "Output Materials",
  materialPlaceholder = "Select Output Material",
  stage = "",
  materialOptions,
}) {
  function updateRow(index, key, value) {
    setRows(
      rows.map((row, i) => {
        if (i !== index) return row;
        return {
          ...row,
          [key]: value,
        };
      })
    );
  }

  function blankRow() {
    return {
      material: "",
      qtyKg: "",
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
            <th style={th}>Output Qty</th>
            <th style={th}>Delete Row</th>
          </tr>
        </thead>

        <tbody>
          {(rows || []).map((r, i) => (
            <tr key={i}>
              <td style={td}>
                <ProductionMaterialSelect
                  name="material"
                  value={r.material || ""}
                  onChange={(e) => updateRow(i, "material", e.target.value)}
                  placeholder={materialPlaceholder}
                  style={input}
                  stage={stage}
                  direction="OUTPUT"
                  items={materialOptions}
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
          ))}
        </tbody>
      </table>

      <button type="button" onClick={addRow} style={addButton}>
        + Add Output Material
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
  minWidth: 680,
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
