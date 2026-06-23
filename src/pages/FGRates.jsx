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

export default function FGRates() {

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

    grade: "",

    ratePerKg: "",

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

      const res =
        await apiCall({

          fn:
            "fgRates.list",

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
            "fgRate.add",

          ...form,

        });

      if (res.ok) {

        setStatus(
          "FG Rate saved successfully"
        );

        setForm(
          blankForm
        );

        loadData();

      } else {

        setStatus(
          res.error ||
            "Error"
        );

      }

    } catch (err) {

      setStatus(
        err.message
      );

    }

  }

  const avgRate =
    rows.length > 0
      ? (
          rows.reduce(
            (
              sum,
              r
            ) =>
              sum +
              Number(
                r.ratePerKg ||
                  0
              ),
            0
          ) /
          rows.length
        ).toFixed(2)
      : 0;

  const highestRate =
    rows.length > 0
      ? Math.max(
          ...rows.map(
            (r) =>
              Number(
                r.ratePerKg ||
                  0
              )
          )
        )
      : 0;

  const gradeSummary =
    useMemo(() => {

      const map = {};

      rows.forEach((r) => {

        const grade =
          r.grade ||
          "Unknown";

        if (!map[grade]) {

          map[grade] = [];

        }

        map[grade].push(
          Number(
            r.ratePerKg ||
              0
          )
        );

      });

      return Object.entries(
        map
      ).map(
        ([grade, arr]) => ({

          grade,

          avg:
            (
              arr.reduce(
                (
                  a,
                  b
                ) =>
                  a + b,
                0
              ) /
              arr.length
            ).toFixed(2),

        })
      );

    }, [rows]);

  return (

    <div style={pageStyle}>

      {/* HEADER */}

      <div style={sectionCard}>

        <div style={sectionTitle}>

          FG Rate Management

        </div>

        <div
          style={{
            color:
              "#64748b",
            fontSize: 13,
          }}
        >

          Finished goods realization,
          pricing intelligence and
          commercial control system

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
          title="Rate Entries"
          value={rows.length}
        />

        <KPI
          title="Average Rate"
          value={`₹ ${avgRate}`}
        />

        <KPI
          title="Highest Rate"
          value={`₹ ${highestRate}`}
        />

        <KPI
          title="Grades"
          value={
            gradeSummary.length
          }
        />

      </div>

      {/* ENTRY */}

      <div style={sectionCard}>

        <div style={sectionTitle}>

          Rate Entry

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

          <Field label="Grade">

            <input
              name="grade"
              value={
                form.grade
              }
              onChange={
                onChange
              }
              placeholder="Production Grade"
              style={
                inputStyle
              }
            />

          </Field>

          <Field label="Rate / Kg">

            <input
              type="number"
              name="ratePerKg"
              value={
                form.ratePerKg
              }
              onChange={
                onChange
              }
              placeholder="₹ / Kg"
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

              Save FG Rate

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

      {/* RATE REGISTER */}

      <div style={sectionCard}>

        <div style={sectionTitle}>

          FG Rate Register

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
                  Grade
                </th>

                <th style={thStyle}>
                  Rate/Kg
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
                        {r.grade}
                      </b>

                    </td>

                    <td style={tdStyle}>

                      ₹{" "}
                      {r.ratePerKg}

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

      {/* GRADE ANALYTICS */}

      <div style={sectionCard}>

        <div style={sectionTitle}>

          Grade Rate Analytics

        </div>

        <div style={tableCard}>

          <table
            style={tableStyle}
          >

            <thead>

              <tr>

                <th style={thStyle}>
                  Grade
                </th>

                <th style={thStyle}>
                  Avg Rate
                </th>

              </tr>

            </thead>

            <tbody>

              {gradeSummary.map(
                (
                  x,
                  i
                ) => (

                  <tr key={i}>

                    <td style={tdStyle}>
                      {
                        x.grade
                      }
                    </td>

                    <td style={tdStyle}>

                      ₹ {x.avg}

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
            "#ecfeff",
          border:
            "1px solid #a5f3fc",
          padding: 16,
          borderRadius: 12,
          color:
            "#164e63",
        }}
      >

        <b>Commercial Purpose:</b>
        <br />
        This module enables tracking
        of market realization trends,
        customer pricing alignment,
        profitability benchmarking and
        commercial planning for
        recycled finished goods.

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