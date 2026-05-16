import { useEffect, useState } from "react";
import { apiCall } from "../api/api";

export default function RMList() {

  const [rows, setRows] = useState([]);

  useEffect(() => {

    loadRows();

  }, []);

  async function loadRows() {

    try {

      const res = await apiCall({
        fn: "rm.list",
      });

      setRows(res.rows || []);

    } catch (err) {

      console.log(err);

    }

  }

  return (

    <div style={{ padding: 20 }}>

      <h1>RM Inward List</h1>

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

              <th style={th}>Date</th>
              <th style={th}>Supplier</th>
              <th style={th}>Material</th>
              <th style={th}>Net Weight</th>
              <th style={th}>Rate</th>

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

                <td style={td}>{r.date}</td>
                <td style={td}>{r.supplier}</td>
                <td style={td}>{r.material}</td>
                <td style={td}>{r.netWeight}</td>
                <td style={td}>{r.ratePerKg}</td>

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