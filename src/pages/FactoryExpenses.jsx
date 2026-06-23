import { useEffect, useMemo, useState } from "react";

import { apiCall } from "../api/api";

import {
  pageStyle,
  sectionCard,
  sectionTitle,
  formGrid,
  inputStyle,
  textareaStyle,
  primaryButton,
  tableCard,
  tableStyle,
  thStyle,
  tdStyle,
} from "../ui/styles";

export default function FactoryExpenses() {

  const currentDate =
    new Date();

  const [rows, setRows] =
    useState([]);

  const [status, setStatus] =
    useState("");

  const blankForm = {

    month:
      currentDate.toLocaleString(
        "default",
        {
          month: "short",
        }
      ),

    year: String(
      currentDate.getFullYear()
    ),

    category: "",

    itemName: "",

    amount: "",

    remarks: "",

    createdBy:
      "Pratap",

  };

  const [form, setForm] =
    useState(blankForm);

  useEffect(() => {

    loadRows();

  }, []);

  async function loadRows() {

    try {

      const res =
        await apiCall({

          fn:
            "factoryExpenses.list",

        });

      setRows(
        res.rows || []
      );

    } catch (err) {

      console.log(err);

    }

  }

  function onChange(e) {

    setForm((p) => ({

      ...p,

      [e.target.name]:
        e.target.value,

    }));

  }

  async function submit(e) {

    e.preventDefault();

    try {

      const res =
        await apiCall({

          fn:
            "factoryExpense.add",

          ...form,

        });

      if (res.ok) {

        setStatus(
          "Factory expense saved successfully"
        );

        setForm(
          blankForm
        );

        loadRows();

      } else {

        setStatus(
          res.error ||
            "Error saving"
        );

      }

    } catch (err) {

      setStatus(
        err.message
      );

    }

  }

  const totalExpenses =
    rows.reduce(
      (sum, r) => {

        return (
          sum +
          Number(
            r.amount || 0
          )
        );

      },
      0
    );

  const avgExpense =
    rows.length > 0
      ? (
          totalExpenses /
          rows.length
        ).toFixed(0)
      : 0;

  const categorySummary =
    useMemo(() => {

      const map = {};

      rows.forEach((r) => {

        const cat =
          r.category ||
          "Other";

        if (!map[cat]) {

          map[cat] = 0;

        }

        map[cat] +=
          Number(
            r.amount || 0
          );

      });

      return Object.entries(
        map
      ).sort(
        (a, b) =>
          b[1] - a[1]
      );

    }, [rows]);

  return (

    <div style={pageStyle}>

      {/* HEADER */}

      <div style={sectionCard}>

        <div style={sectionTitle}>

          Factory Expense Control

        </div>

        <div
          style={{
            color:
              "#64748b",
            fontSize: 13,
          }}
        >

          Operational expense tracking,
          monthly cost governance and
          manufacturing overhead control

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
          title="Total Expenses"
          value={`₹ ${totalExpenses.toFixed(
            0
          )}`}
        />

        <KPI
          title="Expense Entries"
          value={rows.length}
        />

        <KPI
          title="Average Expense"
          value={`₹ ${avgExpense}`}
        />

        <KPI
          title="Expense Categories"
          value={
            categorySummary.length
          }
        />

      </div>

      {/* ENTRY */}

      <div style={sectionCard}>

        <div style={sectionTitle}>

          Expense Entry

        </div>

        <form
          onSubmit={submit}
          style={formGrid}
        >

          <Field label="Month">

            <select
              name="month"
              value={
                form.month
              }
              onChange={
                onChange
              }
              style={
                inputStyle
              }
            >

              <option>Jan</option>
              <option>Feb</option>
              <option>Mar</option>
              <option>Apr</option>
              <option>May</option>
              <option>Jun</option>
              <option>Jul</option>
              <option>Aug</option>
              <option>Sep</option>
              <option>Oct</option>
              <option>Nov</option>
              <option>Dec</option>

            </select>

          </Field>

          <Field label="Year">

            <select
              name="year"
              value={
                form.year
              }
              onChange={
                onChange
              }
              style={
                inputStyle
              }
            >

              <option>2025</option>
              <option>2026</option>
              <option>2027</option>

            </select>

          </Field>

          <Field label="Category">

            <select
              name="category"
              value={
                form.category
              }
              onChange={
                onChange
              }
              style={
                inputStyle
              }
            >

              <option value="">
                Select Category
              </option>

              <option>
                Electricity
              </option>

              <option>
                DG Diesel
              </option>

              <option>
                Consumables
              </option>

              <option>
                Masterbatch
              </option>

              <option>
                Virgin Resin
              </option>

              <option>
                Battery Regrind
              </option>

              <option>
                Additives
              </option>

              <option>
                Maintenance
              </option>

              <option>
                Labour
              </option>

              <option>
                Transport
              </option>

              <option>
                Rent
              </option>

              <option>
                Admin
              </option>

              <option>
                Water
              </option>

              <option>
                Other
              </option>

            </select>

          </Field>

          <Field label="Item / Description">

            <input
              name="itemName"
              value={
                form.itemName
              }
              onChange={
                onChange
              }
              placeholder="Description"
              style={
                inputStyle
              }
            />

          </Field>

          <Field label="Amount">

            <input
              type="number"
              name="amount"
              value={
                form.amount
              }
              onChange={
                onChange
              }
              placeholder="Amount ₹"
              style={
                inputStyle
              }
            />

          </Field>

          <Field label="Remarks">

            <textarea
              name="remarks"
              value={
                form.remarks
              }
              onChange={
                onChange
              }
              placeholder="Remarks"
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

              Save Expense

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

      {/* SUMMARY */}

      <div style={sectionCard}>

        <div style={sectionTitle}>

          Expense Register

        </div>

        <div style={tableCard}>

          <table
            style={tableStyle}
          >

            <thead>

              <tr>

                <th style={thStyle}>
                  Month
                </th>

                <th style={thStyle}>
                  Year
                </th>

                <th style={thStyle}>
                  Category
                </th>

                <th style={thStyle}>
                  Item
                </th>

                <th style={thStyle}>
                  Amount
                </th>

                <th style={thStyle}>
                  Remarks
                </th>

              </tr>

            </thead>

            <tbody>

              {rows.map(
                (r, i) => (

                  <tr key={i}>

                    <td style={tdStyle}>
                      {r.month}
                    </td>

                    <td style={tdStyle}>
                      {r.year}
                    </td>

                    <td style={tdStyle}>

                      <b>
                        {
                          r.category
                        }
                      </b>

                    </td>

                    <td style={tdStyle}>
                      {
                        r.itemName
                      }
                    </td>

                    <td style={tdStyle}>

                      ₹{" "}
                      {Number(
                        r.amount || 0
                      ).toFixed(
                        0
                      )}

                    </td>

                    <td style={tdStyle}>
                      {
                        r.remarks
                      }
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* CATEGORY ANALYTICS */}

      <div style={sectionCard}>

        <div style={sectionTitle}>

          Expense Analytics

        </div>

        <div style={tableCard}>

          <table
            style={tableStyle}
          >

            <thead>

              <tr>

                <th style={thStyle}>
                  Category
                </th>

                <th style={thStyle}>
                  Total Expense
                </th>

              </tr>

            </thead>

            <tbody>

              {categorySummary.map(
                (
                  [cat, value],
                  i
                ) => (

                  <tr key={i}>

                    <td style={tdStyle}>
                      {cat}
                    </td>

                    <td style={tdStyle}>

                      ₹{" "}
                      {value.toFixed(
                        0
                      )}

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* NOTE */}

      <div
        style={{
          background:
            "#fff7ed",
          border:
            "1px solid #fed7aa",
          padding: 16,
          borderRadius: 12,
          color:
            "#7c2d12",
        }}
      >

        <b>Operational Purpose:</b>
        <br />
        This module captures monthly
        manufacturing overheads and
        operational costs including:
        electricity, labour,
        consumables, additives,
        transport, maintenance,
        resin usage and utilities.
        This enables realistic
        profitability tracking in
        RegenOS dashboards.

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