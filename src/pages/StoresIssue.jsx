import { useEffect, useMemo, useState } from "react";

import { apiCall } from "../api/api";

import { formatDate } from "../utils/date";

import {
  pageStyle,
  sectionCard,
  sectionTitle,
  formGrid,
  inputStyle,
  textareaStyle,
  readonlyStyle,
  primaryButton,
  tableCard,
  tableStyle,
  thStyle,
  tdStyle,
} from "../ui/styles";

export default function StoresIssue() {

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  const [rows, setRows] =
    useState([]);

  const [items, setItems] =
    useState([]);

  const [status, setStatus] =
    useState("");

  const blankForm = {

    date: today,

    itemName: "",

    category: "",

    qty: "",

    department: "",

    purpose: "",

    remarks: "",

    createdBy:
      "Pratap",

  };

  const [form, setForm] =
    useState(blankForm);

  useEffect(() => {

    loadData();

  }, []);

  async function loadData() {

    try {

      const [
        issue,
        master,
      ] = await Promise.all([

        apiCall({
          fn:
            "storesIssue.list",
        }),

        apiCall({
          fn:
            "storesMaster.list",
        }),

      ]);

      setRows(
        issue.rows || []
      );

      setItems(
        master.rows || []
      );

    } catch (err) {

      console.log(err);

    }

  }

  function onChange(e) {

    const updated = {

      ...form,

      [e.target.name]:
        e.target.value,

    };

    if (
      e.target.name ===
      "itemName"
    ) {

      const selected =
        items.find(
          (x) =>
            x.itemName ===
            e.target.value
        );

      if (selected) {

        updated.category =
          selected.category;

      }

    }

    setForm(updated);

  }

  async function submit(e) {

    e.preventDefault();

    try {

      const res =
        await apiCall({

          fn:
            "storesIssue.add",

          ...form,

        });

      if (res.ok) {

        setStatus(
          "Stores issue saved successfully"
        );

        setForm(
          blankForm
        );

        loadData();

      } else {

        setStatus(
          res.error || "Error"
        );

      }

    } catch (err) {

      setStatus(
        err.message
      );

    }

  }

  const totalIssueQty =
    rows.reduce(
      (sum, r) => {

        return (
          sum +
          Number(
            r.qty || 0
          )
        );

      },
      0
    );

  const departmentSummary =
    useMemo(() => {

      const map = {};

      rows.forEach((r) => {

        const dept =
          r.department ||
          "Unknown";

        if (!map[dept]) {

          map[dept] = 0;

        }

        map[dept] +=
          Number(
            r.qty || 0
          );

      });

      return Object.entries(
        map
      );

    }, [rows]);

  const topConsumption =
    useMemo(() => {

      const map = {};

      rows.forEach((r) => {

        const item =
          r.itemName ||
          "Unknown";

        if (!map[item]) {

          map[item] = 0;

        }

        map[item] +=
          Number(
            r.qty || 0
          );

      });

      return Object.entries(
        map
      )
        .sort(
          (a, b) =>
            b[1] - a[1]
        )
        .slice(0, 5);

    }, [rows]);

  return (

    <div style={pageStyle}>

      {/* HEADER */}

      <div style={sectionCard}>

        <div style={sectionTitle}>

          Stores Consumption

        </div>

        <div
          style={{
            color:
              "#64748b",
            fontSize: 13,
          }}
        >

          Department-wise
          inventory consumption
          tracking

        </div>

      </div>

      {/* KPI */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
          gap: 14,
          marginBottom: 16,
        }}
      >

        <KPI
          title="Total Issues"
          value={
            rows.length
          }
        />

        <KPI
          title="Qty Consumed"
          value={totalIssueQty}
        />

        <KPI
          title="Departments"
          value={
            departmentSummary.length
          }
        />

        <KPI
          title="Top Consumptions"
          value={
            topConsumption.length
          }
        />

      </div>

      {/* ENTRY */}

      <div style={sectionCard}>

        <div style={sectionTitle}>

          Consumption Entry

        </div>

        <form
          onSubmit={submit}
          style={formGrid}
        >

          <Field label="Date">

            <input
              type="date"
              name="date"
              value={form.date}
              onChange={onChange}
              style={inputStyle}
            />

          </Field>

          <Field label="Item">

            <select
              name="itemName"
              value={
                form.itemName
              }
              onChange={onChange}
              style={inputStyle}
            >

              <option value="">
                Select Item
              </option>

              {items.map(
                (x, i) => (

                  <option
                    key={i}
                    value={
                      x.itemName
                    }
                  >

                    {x.itemName}

                  </option>

                )
              )}

            </select>

          </Field>

          <Field label="Category">

            <input
              value={
                form.category
              }
              readOnly
              style={
                readonlyStyle
              }
            />

          </Field>

          <Field label="Qty">

            <input
              type="number"
              name="qty"
              value={form.qty}
              onChange={onChange}
              style={inputStyle}
            />

          </Field>

          <Field label="Department">

            <select
              name="department"
              value={
                form.department
              }
              onChange={onChange}
              style={inputStyle}
            >

              <option value="">
                Select
              </option>

              <option>
                Extrusion
              </option>

              <option>
                Washline
              </option>

              <option>
                Maintenance
              </option>

              <option>
                Utilities
              </option>

              <option>
                Admin
              </option>

            </select>

          </Field>

          <Field label="Purpose">

            <input
              name="purpose"
              value={
                form.purpose
              }
              onChange={onChange}
              style={inputStyle}
            />

          </Field>

          <Field label="Remarks">

            <textarea
              name="remarks"
              value={
                form.remarks
              }
              onChange={onChange}
              style={
                textareaStyle
              }
            />

          </Field>

          <div
            style={{
              display: "flex",
              alignItems:
                "end",
            }}
          >

            <button
              type="submit"
              style={
                primaryButton
              }
            >

              Save Issue

            </button>

          </div>

        </form>

        {status && (

          <div
            style={{
              marginTop: 14,
              fontWeight: 600,
              color:
                "#0f766e",
            }}
          >

            {status}

          </div>

        )}

      </div>

      {/* HISTORY */}

      <div style={sectionCard}>

        <div style={sectionTitle}>

          Recent Consumptions

        </div>

        <div style={tableCard}>

          <table
            style={tableStyle}
          >

            <thead>

              <tr>

                <th style={thStyle}>
                  Date
                </th>

                <th style={thStyle}>
                  Item
                </th>

                <th style={thStyle}>
                  Category
                </th>

                <th style={thStyle}>
                  Qty
                </th>

                <th style={thStyle}>
                  Department
                </th>

                <th style={thStyle}>
                  Purpose
                </th>

              </tr>

            </thead>

            <tbody>

              {rows.map(
                (r, i) => (

                  <tr key={i}>

                    <td style={tdStyle}>
                      {formatDate(
                        r.date
                      )}
                    </td>

                    <td style={tdStyle}>

                      <b>
                        {
                          r.itemName
                        }
                      </b>

                    </td>

                    <td style={tdStyle}>
                      {
                        r.category
                      }
                    </td>

                    <td style={tdStyle}>
                      {r.qty}
                    </td>

                    <td style={tdStyle}>
                      {
                        r.department
                      }
                    </td>

                    <td style={tdStyle}>
                      {
                        r.purpose
                      }
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ANALYTICS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 1fr",
          gap: 16,
        }}
      >

        <div style={sectionCard}>

          <div style={sectionTitle}>

            Department Usage

          </div>

          <div style={tableCard}>

            <table
              style={tableStyle}
            >

              <thead>

                <tr>

                  <th style={thStyle}>
                    Department
                  </th>

                  <th style={thStyle}>
                    Qty
                  </th>

                </tr>

              </thead>

              <tbody>

                {departmentSummary.map(
                  (
                    [dept, qty],
                    i
                  ) => (

                    <tr key={i}>

                      <td style={tdStyle}>
                        {dept}
                      </td>

                      <td style={tdStyle}>
                        {qty}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

        <div style={sectionCard}>

          <div style={sectionTitle}>

            Top Consumptions

          </div>

          <div style={tableCard}>

            <table
              style={tableStyle}
            >

              <thead>

                <tr>

                  <th style={thStyle}>
                    Item
                  </th>

                  <th style={thStyle}>
                    Qty
                  </th>

                </tr>

              </thead>

              <tbody>

                {topConsumption.map(
                  (
                    [item, qty],
                    i
                  ) => (

                    <tr key={i}>

                      <td style={tdStyle}>
                        {item}
                      </td>

                      <td style={tdStyle}>
                        {qty}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>

  );

}

function Field({
  label,
  children,
}) {

  return (

    <div>

      <div
        style={{
          marginBottom: 4,
          fontWeight: 600,
          color: "#334155",
          fontSize: 12,
        }}
      >

        {label}

      </div>

      {children}

    </div>

  );

}

function KPI({
  title,
  value,
}) {

  return (

    <div
      style={{
        background:
          "white",
        border:
          "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 16,
      }}
    >

      <div
        style={{
          color:
            "#64748b",
          fontSize: 12,
          marginBottom: 8,
        }}
      >

        {title}

      </div>

      <div
        style={{
          fontSize: 24,
          fontWeight: 700,
          color:
            "#005d34",
        }}
      >

        {value}

      </div>

    </div>

  );

}