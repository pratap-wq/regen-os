import {
  useMemo,
  useState,
} from "react";

export default function DataTable({
  title = "",
  rows = [],
  columns = [],
  searchFields = [],
  onEdit,
  onDelete,
}) {

  const [search, setSearch] =
    useState("");

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

  const filteredRows =
    useMemo(() => {

      let filtered = [...rows];

      // SEARCH

      if (search) {

        filtered = filtered.filter(
          (r) => {

            return searchFields.some(
              (field) => {

                const value =
                  r[field];

                return String(
                  value || ""
                )
                  .toLowerCase()
                  .includes(
                    search.toLowerCase()
                  );

              }
            );

          }
        );

      }

      // DATE FILTER

      if (fromDate) {

        filtered =
          filtered.filter((r) => {

            if (!r.date)
              return true;

            return (
              new Date(r.date) >=
              new Date(fromDate)
            );

          });

      }

      if (toDate) {

        filtered =
          filtered.filter((r) => {

            if (!r.date)
              return true;

            return (
              new Date(r.date) <=
              new Date(toDate)
            );

          });

      }

      return filtered;

    }, [
      rows,
      search,
      searchFields,
      fromDate,
      toDate,
    ]);

  function exportCSV() {

    const headers =
      columns.map(
        (c) => c.label
      );

    const csvRows = [
      headers.join(","),
    ];

    filteredRows.forEach((r) => {

      const values =
        columns.map((c) => {

          const value =
            c.renderExport
              ? c.renderExport(r)
              : r[c.key];

          return `"${String(
            value || ""
          ).replace(/"/g, '""')}"`;

        });

      csvRows.push(
        values.join(",")
      );

    });

    const blob =
      new Blob(
        [csvRows.join("\n")],
        {
          type:
            "text/csv;charset=utf-8;",
        }
      );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.setAttribute(
      "download",
      `${title}.csv`
    );

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

  }

  return (

    <div style={cardStyle}>

      <div style={topBarStyle}>

        <div>

          <h2
            style={{
              margin: 0,
            }}
          >
            {title}
          </h2>

          <div style={recordCountStyle}>
            Total Records:
            {" "}
            <b>
              {filteredRows.length}
            </b>
          </div>

        </div>

        <div style={toolbarStyle}>

          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search..."
            style={searchStyle}
          />

          <input
            type="date"
            value={fromDate}
            onChange={(e) =>
              setFromDate(
                e.target.value
              )
            }
            style={dateStyle}
          />

          <input
            type="date"
            value={toDate}
            onChange={(e) =>
              setToDate(
                e.target.value
              )
            }
            style={dateStyle}
          />

          <button
            onClick={exportCSV}
            style={exportStyle}
          >
            Export CSV
          </button>

        </div>

      </div>

      <div
        style={{
          overflowX: "auto",
          width: "100%",
        }}
      >

        <table style={tableStyle}>

          <thead>

            <tr style={headerRowStyle}>

              {columns.map((c) => (

                <th
                  key={c.key}
                  style={th}
                >
                  {c.label}
                </th>

              ))}

              {(onEdit ||
                onDelete) && (
                <th style={th}>
                  Actions
                </th>
              )}

            </tr>

          </thead>

          <tbody>

            {filteredRows.length === 0 && (

              <tr>

                <td
                  colSpan={
                    columns.length + 1
                  }
                  style={emptyStyle}
                >
                  No records found
                </td>

              </tr>

            )}

            {filteredRows.map(
              (r, i) => (

                <tr
                  key={i}
                  style={rowStyle}
                >

                  {columns.map(
                    (c) => (

                      <td
                        key={c.key}
                        style={td}
                      >

                        {c.render
                          ? c.render(r)
                          : r[c.key]}

                      </td>

                    )
                  )}

                  {(onEdit ||
                    onDelete) && (

                    <td style={td}>

                      <div
                        style={{
                          display:
                            "flex",
                          gap: 8,
                          flexWrap:
                            "wrap",
                        }}
                      >

                        {onEdit && (

                          <button
                            onClick={() =>
                              onEdit(r)
                            }
                            style={
                              editButtonStyle
                            }
                          >
                            Edit
                          </button>

                        )}

                        {onDelete && (

                          <button
                            onClick={() =>
                              onDelete(r)
                            }
                            style={
                              deleteButtonStyle
                            }
                          >
                            Delete
                          </button>

                        )}

                      </div>

                    </td>

                  )}

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>

    </div>

  );

}

const cardStyle = {
  background: "white",
  padding: 20,
  borderRadius: 10,
  boxShadow:
    "0 2px 10px rgba(0,0,0,0.08)",
  width: "100%",
  boxSizing:
    "border-box",
};

const topBarStyle = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "flex-start",
  marginBottom: 20,
  gap: 20,
  flexWrap: "wrap",
};

const toolbarStyle = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  width: "100%",
};

const searchStyle = {
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ccc",
  width: 220,
  maxWidth: "100%",
};

const dateStyle = {
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ccc",
};

const exportStyle = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "10px 14px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 700,
};

const headerRowStyle = {
  background: "#0f766e",
  color: "white",
};

const rowStyle = {
  borderBottom:
    "1px solid #ddd",
};

const th = {
  padding: 12,
  textAlign: "left",
  position: "sticky",
  top: 0,
  background: "#0f766e",
  zIndex: 1,
  whiteSpace: "nowrap",
};

const td = {
  padding: 10,
  whiteSpace: "nowrap",
};

const editButtonStyle = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "6px 10px",
  borderRadius: 6,
  cursor: "pointer",
};

const deleteButtonStyle = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "6px 10px",
  borderRadius: 6,
  cursor: "pointer",
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