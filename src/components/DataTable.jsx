import { useMemo, useState } from "react";

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

  const filteredRows =
    useMemo(() => {

      if (!search) return rows;

      return rows.filter((r) => {

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

      });

    }, [
      rows,
      search,
      searchFields,
    ]);

  return (

    <div style={cardStyle}>

      <div style={topBarStyle}>

        <h2>{title}</h2>

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search..."
          style={searchStyle}
        />

      </div>

      <div
        style={{
          overflowX: "auto",
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
                        {r[c.key]}
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

      <div style={countStyle}>

        Total Records:
        {" "}
        <b>
          {filteredRows.length}
        </b>

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
};

const topBarStyle = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
  marginBottom: 20,
};

const searchStyle = {
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ccc",
  width: 250,
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
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
};

const td = {
  padding: 10,
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

const countStyle = {
  marginTop: 15,
  fontSize: 14,
};