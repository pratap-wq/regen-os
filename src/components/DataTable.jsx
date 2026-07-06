import { useMemo, useState } from "react";

export default function DataTable({
  title = "",
  rows = [],
  columns = [],
  searchFields = [],
  onEdit,
  onDelete,
}) {
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "asc",
  });
  const [columnFilters, setColumnFilters] = useState({});

  function getCellValue(row, col) {
    if (col.renderExport) return col.renderExport(row);
    return row[col.key];
  }

  function sortByColumn(key) {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }

      return {
        key,
        direction: "asc",
      };
    });
  }

  function updateColumnFilter(key, value) {
    setColumnFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  const filteredRows = useMemo(() => {
    let filtered = [...rows];

    if (search) {
      const q = search.toLowerCase();

      filtered = filtered.filter((r) => {
        const fields = searchFields.length
          ? searchFields
          : columns.map((c) => c.key);

        return fields.some((field) =>
          String(r[field] || "").toLowerCase().includes(q)
        );
      });
    }

    if (fromDate) {
      filtered = filtered.filter((r) => {
        if (!r.date) return true;
        return new Date(r.date) >= new Date(fromDate);
      });
    }

    if (toDate) {
      filtered = filtered.filter((r) => {
        if (!r.date) return true;
        return new Date(r.date) <= new Date(toDate);
      });
    }

    Object.entries(columnFilters).forEach(([key, value]) => {
      if (!value) return;

      filtered = filtered.filter((r) =>
        String(r[key] || "").toLowerCase().includes(value.toLowerCase())
      );
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const av = a[sortConfig.key];
        const bv = b[sortConfig.key];

        const an = Number(av);
        const bn = Number(bv);

        let result;

        if (!Number.isNaN(an) && !Number.isNaN(bn)) {
          result = an - bn;
        } else {
          result = String(av || "").localeCompare(String(bv || ""));
        }

        return sortConfig.direction === "asc" ? result : -result;
      });
    }

    return filtered;
  }, [rows, search, searchFields, fromDate, toDate, columnFilters, sortConfig, columns]);

  function exportCSV() {
    const headers = columns.map((c) => c.label);
    if (onEdit || onDelete) headers.push("Actions");

    const csvRows = [headers.join(",")];

    filteredRows.forEach((r) => {
      const values = columns.map((c) => {
        const value = getCellValue(r, c);

        return `"${String(value || "").replace(/"/g, '""')}"`;
      });

      if (onEdit || onDelete) values.push('""');

      csvRows.push(values.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", `${safeFileName(title || "export")}.csv`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  function printTable() {
    const html = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { margin-bottom: 8px; color: #0f766e; }
            .meta { color: #64748b; margin-bottom: 16px; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th { background: #0f766e; color: white; text-align: left; padding: 7px; }
            td { border-bottom: 1px solid #ddd; padding: 7px; }
          </style>
        </head>
        <body>
          <h2>${title}</h2>
          <div class="meta">Records: ${filteredRows.length}</div>
          <table>
            <thead>
              <tr>
                ${columns.map((c) => `<th>${c.label}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${filteredRows
                .map(
                  (r) => `
                    <tr>
                      ${columns
                        .map((c) => `<td>${String(getCellValue(r, c) || "")}</td>`)
                        .join("")}
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  function clearFilters() {
    setSearch("");
    setFromDate("");
    setToDate("");
    setColumnFilters({});
    setSortConfig({
      key: "",
      direction: "asc",
    });
  }

  return (
    <div style={cardStyle}>
      <div style={topBarStyle}>
        <div>
          <h2 style={{ margin: 0 }}>{title}</h2>

          <div style={recordCountStyle}>
            Showing <b>{filteredRows.length}</b> of <b>{rows.length}</b> records
          </div>
        </div>

        <div style={toolbarStyle}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search all..."
            style={searchStyle}
          />

          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={dateStyle}
          />

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={dateStyle}
          />

          <button onClick={clearFilters} style={secondaryButton}>
            Clear
          </button>

          <button onClick={exportCSV} style={exportStyle}>
            Export Excel
          </button>

          <button onClick={printTable} style={printStyle}>
            Print
          </button>
        </div>
      </div>

      <div style={tableWrapStyle}>
        <table style={tableStyle}>
          <thead>
            <tr style={headerRowStyle}>
              {columns.map((c) => (
                <th key={c.key} style={th}>
                  <button
                    type="button"
                    onClick={() => sortByColumn(c.key)}
                    style={sortButton}
                  >
                    {c.label}
                    {sortConfig.key === c.key
                      ? sortConfig.direction === "asc"
                        ? " ▲"
                        : " ▼"
                      : ""}
                  </button>
                </th>
              ))}

              {(onEdit || onDelete) && <th style={th}>Actions</th>}
            </tr>

            <tr style={filterRowStyle}>
              {columns.map((c) => (
                <th key={`filter-${c.key}`} style={filterCell}>
                  <input
                    value={columnFilters[c.key] || ""}
                    onChange={(e) => updateColumnFilter(c.key, e.target.value)}
                    placeholder="Filter"
                    style={columnFilterInput}
                  />
                </th>
              ))}

              {(onEdit || onDelete) && <th style={filterCell}></th>}
            </tr>
          </thead>

          <tbody>
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} style={emptyStyle}>
                  No records found
                </td>
              </tr>
            )}

            {filteredRows.map((r, i) => (
              <tr key={i} style={rowStyle}>
                {columns.map((c) => (
                  <td key={c.key} style={td}>
                    {c.render ? c.render(r) : r[c.key]}
                  </td>
                ))}

                {(onEdit || onDelete) && (
                  <td style={{ ...td, position: "sticky", right: 0, background: "white" }}>
                    <div style={actionWrap}>
                      {onEdit && (
                        <button onClick={() => onEdit(r)} style={editButtonStyle}>
                          ✏ Edit
                        </button>
                      )}

                      {onDelete && (
                        <button onClick={() => onDelete(r)} style={deleteButtonStyle}>
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={bottomBarStyle}>
        <div>
          Records: <b>{filteredRows.length}</b>
        </div>

        <div style={{ color: "#64748b" }}>
          Tip: Use column headers to sort and filter boxes to narrow results.
        </div>
      </div>
    </div>
  );
}

function safeFileName(name) {
  return String(name || "export")
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase();
}

const cardStyle = {
  background: "white",
  padding: 0,
  borderRadius: 14,
  boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #e5e7eb",
  overflow: "hidden",
};

const topBarStyle = {
  position: "sticky",
  top: 0,
  zIndex: 20,
  background: "white",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  padding: 16,
  gap: 16,
  flexWrap: "wrap",
  borderBottom: "1px solid #e5e7eb",
};

const toolbarStyle = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  alignItems: "center",
};

const searchStyle = {
  padding: 10,
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  width: 220,
  maxWidth: "100%",
};

const dateStyle = {
  padding: 10,
  borderRadius: 8,
  border: "1px solid #cbd5e1",
};

const secondaryButton = {
  background: "#64748b",
  color: "white",
  border: "none",
  padding: "10px 14px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
};

const exportStyle = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "10px 14px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
};

const printStyle = {
  background: "#0f766e",
  color: "white",
  border: "none",
  padding: "10px 14px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
};

const tableWrapStyle = {
  width: "100%",
  overflowX: "auto",
  overflowY: "auto",
  maxHeight: "68vh",
  background: "white",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 1000,
};

const headerRowStyle = {
  background: "#0f766e",
  color: "white",
};

const filterRowStyle = {
  background: "#f8fafc",
};

const th = {
  padding: 0,
  textAlign: "left",
  position: "sticky",
  top: 0,
  background: "#0f766e",
  zIndex: 10,
  whiteSpace: "nowrap",
};

const sortButton = {
  width: "100%",
  background: "transparent",
  color: "white",
  border: "none",
  padding: "11px 12px",
  textAlign: "left",
  cursor: "pointer",
  fontWeight: 800,
};

const filterCell = {
  padding: 6,
  position: "sticky",
  top: 40,
  background: "#f8fafc",
  zIndex: 9,
  borderBottom: "1px solid #e5e7eb",
};

const columnFilterInput = {
  width: "100%",
  minWidth: 90,
  padding: 7,
  borderRadius: 6,
  border: "1px solid #cbd5e1",
  boxSizing: "border-box",
  fontSize: 12,
};

const rowStyle = {
  borderBottom: "1px solid #e5e7eb",
};

const td = {
  padding: "10px 12px",
  whiteSpace: "nowrap",
  fontSize: 13,
  background: "white",
};

const actionWrap = {
  display: "flex",
  gap: 8,
  flexWrap: "nowrap",
};

const editButtonStyle = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "6px 10px",
  borderRadius: 6,
  cursor: "pointer",
  fontWeight: 700,
};

const deleteButtonStyle = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "6px 10px",
  borderRadius: 6,
  cursor: "pointer",
  fontWeight: 700,
};

const emptyStyle = {
  padding: 20,
  textAlign: "center",
  color: "#64748b",
};

const recordCountStyle = {
  marginTop: 5,
  color: "#64748b",
  fontSize: 13,
};

const bottomBarStyle = {
  position: "sticky",
  bottom: 0,
  background: "white",
  borderTop: "1px solid #e5e7eb",
  padding: "10px 16px",
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  fontSize: 13,
};