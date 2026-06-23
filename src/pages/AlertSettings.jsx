import { useEffect, useState } from "react";
import { apiCall } from "../api/api";

export default function AlertSettings() {

  const [rows, setRows] =
    useState([]);

  const [status, setStatus] =
    useState("");

  const [editingId, setEditingId] =
    useState(null);

  const blankForm = {

    alertId: "",

    module: "Stores",

    item: "",

    condition: "BELOW",

    threshold: "",

    severity: "HIGH",

    notifyType: "ALL",

    emails: "",

    enabled: "TRUE",

    remarks: "",

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
            "alerts.settings.list",
        });

      setRows(
        res.rows || []
      );

    } catch (err) {

      console.log(err);

    }

  }

  function onChange(e) {

    setForm({

      ...form,

      [e.target.name]:
        e.target.value,

    });

  }

  function editRow(row) {

    setEditingId(
      row.alertId
    );

    setForm({

      ...blankForm,

      ...row,

    });

    window.scrollTo({

      top: 0,

      behavior:
        "smooth",

    });

  }

  async function deleteRow(
    row
  ) {

    const confirmed =
      window.confirm(
        "Delete alert rule?"
      );

    if (!confirmed)
      return;

    try {

      await apiCall({

        fn:
          "alerts.settings.update",

        alertId:
          row.alertId,

        enabled:
          "FALSE",

      });

      loadRows();

    } catch (err) {

      alert(
        err.message
      );

    }

  }

  async function submit(e) {

    e.preventDefault();

    try {

      setStatus(
        "Saving..."
      );

      let res;

      if (editingId) {

        res =
          await apiCall({

            fn:
              "alerts.settings.update",

            ...form,

          });

      } else {

        res =
          await apiCall({

            fn:
              "alerts.settings.add",

            ...form,

          });

      }

      if (res.ok) {

        setStatus(

          editingId
            ? "Updated"
            : "Saved"

        );

        setEditingId(
          null
        );

        setForm(
          blankForm
        );

        loadRows();

      }

    } catch (err) {

      console.log(err);

      setStatus(
        err.message ||
          "Save failed"
      );

    }

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

            Alert Settings

          </h2>

          <div
            style={{
              color:
                "#64748b",
              fontSize: 13,
              marginTop: 4,
            }}
          >

            Thresholds,
            escalation and
            notification governance

          </div>

        </div>

        <div
          style={{
            fontSize: 13,
            color: "#64748b",
          }}
        >

          Rules:
          {" "}
          {rows.length}

        </div>

      </div>

      <form
        onSubmit={submit}
        style={
          formStyle
        }
      >

        <Field label="Module">

          <select
            name="module"
            value={
              form.module
            }
            onChange={
              onChange
            }
            style={
              inputStyle
            }
          >

            <option>
              Stores
            </option>

            <option>
              RM
            </option>

            <option>
              Wash
            </option>

            <option>
              Extrusion
            </option>

            <option>
              Dispatch
            </option>

            <option>
              Recovery
            </option>

            <option>
              Inventory
            </option>

          </select>

        </Field>

        <Field label="Item">

          <input
            name="item"
            value={
              form.item
            }
            onChange={
              onChange
            }
            style={
              inputStyle
            }
          />

        </Field>

        <Field label="Condition">

          <select
            name="condition"
            value={
              form.condition
            }
            onChange={
              onChange
            }
            style={
              inputStyle
            }
          >

            <option>
              BELOW
            </option>

            <option>
              ABOVE
            </option>

            <option>
              EQUAL
            </option>

          </select>

        </Field>

        <Field label="Threshold">

          <input
            type="number"
            name="threshold"
            value={
              form.threshold
            }
            onChange={
              onChange
            }
            style={
              inputStyle
            }
          />

        </Field>

        <Field label="Severity">

          <select
            name="severity"
            value={
              form.severity
            }
            onChange={
              onChange
            }
            style={
              inputStyle
            }
          >

            <option>
              LOW
            </option>

            <option>
              MEDIUM
            </option>

            <option>
              HIGH
            </option>

            <option>
              CRITICAL
            </option>

          </select>

        </Field>

        <Field label="Notify Type">

          <select
            name="notifyType"
            value={
              form.notifyType
            }
            onChange={
              onChange
            }
            style={
              inputStyle
            }
          >

            <option>
              ALL
            </option>

            <option>
              SPECIFIC
            </option>

          </select>

        </Field>

        <Field label="Emails">

          <textarea
            name="emails"
            value={
              form.emails
            }
            onChange={
              onChange
            }
            placeholder="purchase@regenplastic.com, stores@regenplastic.com"
            style={
              textareaStyle
            }
          />

        </Field>

        <Field label="Enabled">

          <select
            name="enabled"
            value={
              form.enabled
            }
            onChange={
              onChange
            }
            style={
              inputStyle
            }
          >

            <option>
              TRUE
            </option>

            <option>
              FALSE
            </option>

          </select>

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
            style={saveButton(
              editingId
            )}
          >

            {editingId
              ? "Update"
              : "Save"}

          </button>

        </div>

      </form>

      {status && (

        <div
          style={{
            marginBottom: 16,
            color:
              "#0f766e",
            fontWeight: 600,
          }}
        >

          {status}

        </div>

      )}

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
                Condition
              </th>

              <th style={th}>
                Threshold
              </th>

              <th style={th}>
                Severity
              </th>

              <th style={th}>
                Notify
              </th>

              <th style={th}>
                Enabled
              </th>

              <th style={th}>
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {rows.map(
              (r, i) => (

                <tr
                  key={i}
                  style={{
                    borderBottom:
                      "1px solid #e5e7eb",
                  }}
                >

                  <td style={td}>
                    {r.module}
                  </td>

                  <td style={td}>
                    {r.item}
                  </td>

                  <td style={td}>
                    {r.condition}
                  </td>

                  <td style={td}>
                    {r.threshold}
                  </td>

                  <td style={td}>

                    <span
                      style={badge(
                        r.severity
                      )}
                    >

                      {
                        r.severity
                      }

                    </span>

                  </td>

                  <td style={td}>
                    {
                      r.notifyType
                    }
                  </td>

                  <td style={td}>
                    {
                      r.enabled
                    }
                  </td>

                  <td style={td}>

                    <div
                      style={{
                        display:
                          "flex",
                        gap: 8,
                      }}
                    >

                      <button
                        onClick={() =>
                          editRow(
                            r
                          )
                        }
                        type="button"
                        style={
                          editButtonStyle
                        }
                      >

                        Edit

                      </button>

                      <button
                        onClick={() =>
                          deleteRow(
                            r
                          )
                        }
                        type="button"
                        style={
                          deleteButtonStyle
                        }
                      >

                        Disable

                      </button>

                    </div>

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

const formStyle = {

  display: "grid",

  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",

  gap: 12,

  background:
    "white",

  padding: 18,

  borderRadius: 10,

  marginBottom: 20,

  border:
    "1px solid #e5e7eb",

};

const inputStyle = {

  width: "100%",

  padding:
    "8px 10px",

  height: 38,

  borderRadius: 6,

  border:
    "1px solid #cbd5e1",

  fontSize: 13,

  background:
    "white",

  color: "#111827",

  boxSizing:
    "border-box",

};

const textareaStyle = {

  ...inputStyle,

  height: 70,

  resize: "vertical",

  paddingTop: 10,

};

const saveButton = (
  editingId
) => ({

  background:
    editingId
      ? "#ea580c"
      : "#0f766e",

  color: "white",

  border: "none",

  height: 40,

  padding:
    "0 18px",

  borderRadius: 6,

  cursor: "pointer",

  fontWeight: 600,

  fontSize: 13,

});

const editButtonStyle = {

  background:
    "#2563eb",

  color: "white",

  border: "none",

  padding:
    "6px 10px",

  borderRadius: 6,

  cursor: "pointer",

  fontSize: 12,

};

const deleteButtonStyle = {

  background:
    "#dc2626",

  color: "white",

  border: "none",

  padding:
    "6px 10px",

  borderRadius: 6,

  cursor: "pointer",

  fontSize: 12,

};

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