import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";
import {
  calculateInventory,
} from "../lib/inventory";

export default function AlertCenter() {

  const [alerts, setAlerts] =
    useState([]);

  const [settings, setSettings] =
    useState([]);

  const [rmRows, setRmRows] =
    useState([]);

  const [washRows, setWashRows] =
    useState([]);

  const [
    extrusionRows,
    setExtrusionRows,
  ] = useState([]);

  const [
    dispatchRows,
    setDispatchRows,
  ] = useState([]);

  const [
    storesInwardRows,
    setStoresInwardRows,
  ] = useState([]);

  const [
    storesIssueRows,
    setStoresIssueRows,
  ] = useState([]);

  useEffect(() => {

    loadData();

  }, []);

  async function safeLoad(
    fnName
  ) {

    try {

      const res =
        await apiCall({
          fn: fnName,
        });

      return res.rows || [];

    } catch (err) {

      console.log(
        fnName,
        err
      );

      return [];

    }

  }

  async function loadData() {

    const [

      settingsRes,
      rm,
      wash,
      extrusion,
      dispatch,
      inward,
      issue,

    ] = await Promise.all([

      safeLoad(
        "alerts.settings.list"
      ),

      safeLoad("rm.list"),

      safeLoad("wash.list"),

      safeLoad(
        "extrusion.list"
      ),

      safeLoad(
        "dispatch.list"
      ),

      safeLoad(
        "storesInward.list"
      ),

      safeLoad(
        "storesIssue.list"
      ),

    ]);

    setSettings(
      settingsRes
    );

    setRmRows(rm);

    setWashRows(wash);

    setExtrusionRows(
      extrusion
    );

    setDispatchRows(
      dispatch
    );

    setStoresInwardRows(
      inward
    );

    setStoresIssueRows(
      issue
    );

  }

  const inventory =
    useMemo(() => {

      return calculateInventory({

        rmRows,

        washRows,

        extrusionRows,

        dispatchRows,

        storesInwardRows,

        storesIssueRows,

      });

    }, [

      rmRows,
      washRows,
      extrusionRows,
      dispatchRows,
      storesInwardRows,
      storesIssueRows,

    ]);

  useEffect(() => {

    generateAlerts();

  }, [

    inventory,
    settings,

  ]);

  function generateAlerts() {

    const generated = [];

    settings.forEach((rule) => {

      if (
        String(
          rule.enabled
        ).toUpperCase() !==
        "TRUE"
      ) {

        return;

      }

      const module =
        rule.module;

      const threshold =
        Number(
          rule.threshold || 0
        );

      const condition =
        rule.condition;

      let currentValue = 0;

      if (
        module === "RM"
      ) {

        currentValue =
          inventory.rm.stock;

      }

      if (
        module ===
        "Wash"
      ) {

        currentValue =
          inventory.wash.stock;

      }

      if (
        module ===
        "Dispatch"
      ) {

        currentValue =
          inventory.fg.dispatched;

      }

      if (
        module ===
        "Extrusion"
      ) {

        currentValue =
          inventory.fg.stock;

      }

      if (
        module ===
        "Stores"
      ) {

        currentValue =
          inventory.stores.stock;

      }

      let triggered =
        false;

      if (
        condition ===
          "BELOW" &&
        currentValue <
          threshold
      ) {

        triggered =
          true;

      }

      if (
        condition ===
          "ABOVE" &&
        currentValue >
          threshold
      ) {

        triggered =
          true;

      }

      if (
        condition ===
          "EQUAL" &&
        currentValue ===
          threshold
      ) {

        triggered =
          true;

      }

      if (
        triggered
      ) {

        generated.push({

          alertId:
            rule.alertId,

          module:
            module,

          item:
            rule.item,

          severity:
            rule.severity,

          currentValue,

          threshold,

          notifyType:
            rule.notifyType,

          emails:
            rule.notifyType ===
            "ALL"
              ? "@regenplastic.com"
              : rule.emails,

          message:
            `${module} alert triggered for ${rule.item}`,

        });

      }

    });

    setAlerts(
      generated
    );

  }

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
          marginBottom: 18,
        }}
      >

        <div>

          <h2
            style={{
              margin: 0,
            }}
          >

            Alert Center

          </h2>

          <div
            style={{
              color:
                "#64748b",
              fontSize: 13,
              marginTop: 4,
            }}
          >

            Live operational alerts
            and escalation monitoring

          </div>

        </div>

        <div
          style={{
            fontSize: 13,
            color: "#64748b",
          }}
        >

          Active Alerts:
          {" "}
          {alerts.length}

        </div>

      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
          gap: 16,
          marginBottom: 20,
        }}
      >

        <Card
          title="Critical"
          value={
            alerts.filter(
              (a) =>
                a.severity ===
                "CRITICAL"
            ).length
          }
          color="#dc2626"
        />

        <Card
          title="High"
          value={
            alerts.filter(
              (a) =>
                a.severity ===
                "HIGH"
            ).length
          }
          color="#d97706"
        />

        <Card
          title="Medium"
          value={
            alerts.filter(
              (a) =>
                a.severity ===
                "MEDIUM"
            ).length
          }
          color="#2563eb"
        />

        <Card
          title="Low"
          value={
            alerts.filter(
              (a) =>
                a.severity ===
                "LOW"
            ).length
          }
          color="#16a34a"
        />

      </div>

      <div
        style={
          tableCardStyle
        }
      >

        <table
          style={tableStyle}
        >

          <thead>

            <tr
              style={
                headerRowStyle
              }
            >

              <th style={th}>
                Module
              </th>

              <th style={th}>
                Item
              </th>

              <th style={th}>
                Severity
              </th>

              <th style={th}>
                Current
              </th>

              <th style={th}>
                Threshold
              </th>

              <th style={th}>
                Notify
              </th>

              <th style={th}>
                Message
              </th>

            </tr>

          </thead>

          <tbody>

            {alerts.map(
              (a, i) => (

                <tr
                  key={i}
                  style={{
                    borderBottom:
                      "1px solid #e5e7eb",
                  }}
                >

                  <td style={td}>
                    {a.module}
                  </td>

                  <td style={td}>
                    {a.item}
                  </td>

                  <td style={td}>

                    <span
                      style={badge(
                        a.severity
                      )}
                    >

                      {
                        a.severity
                      }

                    </span>

                  </td>

                  <td style={td}>
                    {
                      a.currentValue
                    }
                  </td>

                  <td style={td}>
                    {
                      a.threshold
                    }
                  </td>

                  <td style={td}>
                    {
                      a.emails
                    }
                  </td>

                  <td style={td}>
                    {
                      a.message
                    }
                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>

    </div>

  );

}

function Card({
  title,
  value,
  color,
}) {

  return (

    <div
      style={{
        background:
          "white",
        border:
          "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 18,
      }}
    >

      <div
        style={{
          fontSize: 12,
          color:
            "#64748b",
          marginBottom: 8,
        }}
      >

        {title}

      </div>

      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          color,
        }}
      >

        {value}

      </div>

    </div>

  );

}

const badge = (
  severity
) => ({

  background:
    severity ===
    "CRITICAL"
      ? "#fee2e2"
      : severity ===
        "HIGH"
      ? "#fef3c7"
      : severity ===
        "MEDIUM"
      ? "#dbeafe"
      : "#dcfce7",

  color:
    severity ===
    "CRITICAL"
      ? "#991b1b"
      : severity ===
        "HIGH"
      ? "#92400e"
      : severity ===
        "MEDIUM"
      ? "#1e40af"
      : "#166534",

  padding:
    "4px 8px",

  borderRadius: 999,

  fontSize: 11,

  fontWeight: 700,

});

const tableCardStyle = {

  background:
    "white",

  padding: 18,

  borderRadius: 10,

  border:
    "1px solid #e5e7eb",

  overflowX:
    "auto",

};

const tableStyle = {

  width: "100%",

  borderCollapse:
    "collapse",

};

const headerRowStyle = {

  background:
    "#005d34",

  color: "white",

};

const th = {

  padding:
    "10px 12px",

  textAlign: "left",

  fontSize: 12,

};

const td = {

  padding:
    "10px 12px",

  fontSize: 13,

};