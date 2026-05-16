import { useEffect, useState } from "react";
import { apiCall } from "../api/api";

export default function Suppliers() {

  const [rows, setRows] = useState([]);

  useEffect(() => {

    loadRows();

  }, []);

  async function loadRows() {

    try {

      const res = await apiCall({
        fn: "suppliers.list",
      });

      setRows(res.rows || []);

    } catch (err) {

      console.log(err);

    }

  }

  return (

    <div style={{ padding: 20 }}>

      <h1>Suppliers</h1>

      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 10,
          overflowX: "auto",
        }}
      >

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >

          <thead>

            <tr
              style={{
                background: "#0f766e",
                color: "white",
              }}
            >

              <th style={th}>Supplier</th>
              <th style={th}>Type</th>
              <th style={th}>City</th>
              <th style={th}>Phone</th>
              <th style={th}>Material</th>

            </tr>

          </thead>

          <tbody>

            {rows.map((r, i) => (

              <tr
                key={i}
                style={{
                  borderBottom: "1px solid #ddd",
                }}
              >

                <td style={td}>{r.supplierName}</td>
                <td style={td}>{r.supplierType}</td>
                <td style={td}>{r.city}</td>
                <td style={td}>{r.phone}</td>
                <td style={td}>{r.materialType}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}

const th = {
  padding: 12,
  textAlign: "left",
};

const td = {
  padding: 10,
};