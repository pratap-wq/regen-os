import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";
import { formatDate } from "../utils/date";

export default function FGInventory() {

  const [
    extrusionRows,
    setExtrusionRows,
  ] = useState([]);

  const [
    dispatchRows,
    setDispatchRows,
  ] = useState([]);

  const [status, setStatus] =
    useState("");

  useEffect(() => {

    loadData();

  }, []);

  async function loadData() {

    try {

      const [
        extrusion,
        dispatch,
      ] = await Promise.all([

        apiCall({
          fn:
            "extrusion.list",
        }),

        apiCall({
          fn:
            "dispatch.list",
        }),

      ]);

      setExtrusionRows(
        extrusion.rows || []
      );

      setDispatchRows(
        dispatch.rows || []
      );

    } catch (err) {

      console.log(err);

      setStatus(
        "Failed loading FG inventory"
      );

    }

  }

  const inventory =
    useMemo(() => {

      const map = {};

      extrusionRows.forEach(
        (r) => {

          const lot =
            r.extrusionBatchId ||
            "UNKNOWN";

          if (!map[lot]) {

            map[lot] = {

              lotNo: lot,

              date:
                r.date,

              grade:
                r.productionGrade ||
                "NA",

              producedKg:
                0,

              dispatchedKg:
                0,

              balanceKg:
                0,

              machine:
                r.machine,

              qcStatus:
                "Approved",

            };

          }

          map[lot]
            .producedKg +=
            Number(
              r.fgOutputKg ||
                0
            );

        }
      );

      dispatchRows.forEach(
        (d) => {

          const lot =
            d.lotNo ||
            d.sourceExtrusionBatchId;

          if (
            map[lot]
          ) {

            map[
              lot
            ].dispatchedKg +=
              Number(
                d.quantityKg ||
                  0
              );

          }

        }
      );

      Object.values(map).forEach(
        (x) => {

          x.balanceKg =
            x.producedKg -
            x.dispatchedKg;

        }
      );

      return Object.values(
        map
      );

    }, [
      extrusionRows,
      dispatchRows,
    ]);

  const totalFGProduced =
    inventory.reduce(
      (sum, r) => {

        return (
          sum +
          Number(
            r.producedKg || 0
          )
        );

      },
      0
    );

  const totalDispatch =
    inventory.reduce(
      (sum, r) => {

        return (
          sum +
          Number(
            r.dispatchedKg || 0
          )
        );

      },
      0
    );

  const liveFGStock =
    inventory.reduce(
      (sum, r) => {

        return (
          sum +
          Number(
            r.balanceKg || 0
          )
        );

      },
      0
    );

  const gradeSummary =
    useMemo(() => {

      const map = {};

      inventory.forEach(
        (r) => {

          const grade =
            r.grade ||
            "NA";

          if (
            !map[grade]
          ) {

            map[
              grade
            ] = {

              produced:
                0,

              dispatched:
                0,

              balance: 0,

            };

          }

          map[
            grade
          ].produced +=
            Number(
              r.producedKg || 0
            );

          map[
            grade
          ].dispatched +=
            Number(
              r.dispatchedKg || 0
            );

          map[
            grade
          ].balance +=
            Number(
              r.balanceKg || 0
            );

        }
      );

      return Object.entries(
        map
      );

    }, [inventory]);

  return (

    <div
      style={{
        padding: 16,
      }}
    >

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems:
            "center",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >

        <div>

          <h1
            style={{
              marginBottom: 6,
            }}
          >
            FG Inventory
          </h1>

          <div
            style={{
              color:
                "#64748b",
              fontSize: 13,
            }}
          >
            Auto generated from
            extrusion and dispatch
          </div>

        </div>

      </div>

      <div
        style={gridStyle}
      >

        <Card
          title="FG Produced"
          value={`${totalFGProduced.toFixed(
            0
          )} Kg`}
        />

        <Card
          title="FG Dispatched"
          value={`${totalDispatch.toFixed(
            0
          )} Kg`}
        />

        <Card
          title="Live FG Stock"
          value={`${liveFGStock.toFixed(
            0
          )} Kg`}
        />

        <Card
          title="Lots"
          value={
            inventory.length
          }
        />

      </div>

      {status && (

        <div
          style={{
            marginTop: 12,
            color:
              "#dc2626",
            fontWeight: 600,
          }}
        >

          {status}

        </div>

      )}

      <div
        style={{
          marginTop: 24,
        }}
      >

        <div
          style={
            tableBox
          }
        >

          <h3>
            Lot-wise FG Inventory
          </h3>

          <table
            style={{
              width: "100%",
              borderCollapse:
                "collapse",
            }}
          >

            <thead>

              <tr
                style={{
                  background:
                    "#0f766e",
                  color:
                    "white",
                }}
              >

                <th style={th}>
                  Lot No
                </th>

                <th style={th}>
                  Date
                </th>

                <th style={th}>
                  Grade
                </th>

                <th style={th}>
                  Machine
                </th>

                <th style={th}>
                  Produced
                </th>

                <th style={th}>
                  Dispatched
                </th>

                <th style={th}>
                  Balance
                </th>

                <th style={th}>
                  QC
                </th>

              </tr>

            </thead>

            <tbody>

              {inventory.map(
                (r, i) => (

                  <tr
                    key={i}
                    style={{
                      borderBottom:
                        "1px solid #ddd",
                    }}
                  >

                    <td style={td}>
                      <b>
                        {
                          r.lotNo
                        }
                      </b>
                    </td>

                    <td style={td}>
                      {formatDate(
                        r.date
                      )}
                    </td>

                    <td style={td}>
                      {r.grade}
                    </td>

                    <td style={td}>
                      {
                        r.machine
                      }
                    </td>

                    <td style={td}>
                      {
                        r.producedKg
                      }
                    </td>

                    <td style={td}>
                      {
                        r.dispatchedKg
                      }
                    </td>

                    <td style={td}>

                      <b
                        style={{
                          color:
                            r.balanceKg >
                            0
                              ? "#15803d"
                              : "#dc2626",
                        }}
                      >

                        {
                          r.balanceKg
                        }

                      </b>

                    </td>

                    <td style={td}>

                      <span
                        style={
                          statusBadge
                        }
                      >

                        {
                          r.qcStatus
                        }

                      </span>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>

      <div
        style={{
          marginTop: 24,
        }}
      >

        <div
          style={
            tableBox
          }
        >

          <h3>
            Grade-wise Summary
          </h3>

          <table
            style={{
              width: "100%",
              borderCollapse:
                "collapse",
            }}
          >

            <thead>

              <tr
                style={{
                  background:
                    "#0f766e",
                  color:
                    "white",
                }}
              >

                <th style={th}>
                  Grade
                </th>

                <th style={th}>
                  Produced
                </th>

                <th style={th}>
                  Dispatched
                </th>

                <th style={th}>
                  Balance
                </th>

              </tr>

            </thead>

            <tbody>

              {gradeSummary.map(
                (
                  [grade, data],
                  i
                ) => (

                  <tr
                    key={i}
                    style={{
                      borderBottom:
                        "1px solid #ddd",
                    }}
                  >

                    <td style={td}>
                      <b>
                        {grade}
                      </b>
                    </td>

                    <td style={td}>
                      {
                        data.produced
                      }
                    </td>

                    <td style={td}>
                      {
                        data.dispatched
                      }
                    </td>

                    <td style={td}>

                      <b
                        style={{
                          color:
                            "#15803d",
                        }}
                      >

                        {
                          data.balance
                        }

                      </b>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );

}

function Card({
  title,
  value,
}) {

  return (

    <div
      style={cardStyle}
    >

      <div
        style={{
          color: "#64748b",
          marginBottom: 8,
          fontSize: 13,
        }}
      >

        {title}

      </div>

      <div
        style={{
          fontSize: 24,
          fontWeight: 700,
          color:
            "#0f766e",
        }}
      >

        {value}

      </div>

    </div>

  );

}

const gridStyle = {

  display: "grid",

  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",

  gap: 16,

};

const cardStyle = {

  background:
    "white",

  padding: 18,

  borderRadius: 10,

  border:
    "1px solid #e5e7eb",

};

const tableBox = {

  background:
    "white",

  borderRadius: 10,

  border:
    "1px solid #e5e7eb",

  padding: 18,

  overflowX:
    "auto",

};

const statusBadge = {

  background:
    "#dcfce7",

  color:
    "#166534",

  padding:
    "4px 8px",

  borderRadius: 999,

  fontSize: 11,

  fontWeight: 700,

};

const th = {

  padding:
    "10px 12px",

  textAlign: "left",

  fontSize: 12,

  textTransform:
    "uppercase",

  letterSpacing:
    "0.4px",

};

const td = {

  padding:
    "10px 12px",

  fontSize: 13,

};