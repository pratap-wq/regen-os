import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../api/api";
import { formatDate } from "../utils/date";
import { validateDispatch } from "../lib/workflow";

import DataTable from "../components/DataTable";
import FormSection from "../components/FormSection";

export default function Dispatch() {

  const [rows, setRows] =
    useState([]);

  const [
    extrusionRows,
    setExtrusionRows,
  ] = useState([]);

  const [status, setStatus] =
    useState("");

  const [editingId, setEditingId] =
    useState(null);

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  const blankForm = {

    dispatchId: "",

    sourceExtrusionBatchId:
      "",

    sourceSupplier: "",

    availableFGQty: "",

    date: today,

    customerName: "",

    invoiceNo: "",

    vehicleNo: "",

    driverName: "",

    dispatchStatus:
      "DISPATCHED",

    grade: "",

    lotNo: "",

    quantityKg: "",

    noOfBags: "",

    ratePerKg: "",

    dispatchLocation: "",

    remarks: "",

  };

  const [form, setForm] =
    useState(blankForm);

  useEffect(() => {

    loadData();

  }, []);

  async function loadData() {

    try {

      const [
        dispatch,
        extrusion,
      ] = await Promise.all([

        apiCall({
          fn:
            "dispatch.list",
        }),

        apiCall({
          fn:
            "extrusion.list",
        }),

      ]);

      setRows(
        dispatch.rows || []
      );

      setExtrusionRows(
        extrusion.rows || []
      );

    } catch (err) {

      console.log(err);

    }

  }

  function getAvailableFG(
    batchId
  ) {

    const fg =
      extrusionRows.find(
        (x) =>
          String(
            x.extrusionBatchId
          ) ===
          String(batchId)
      );

    if (!fg)
      return 0;

    const totalDispatch =
      rows
        .filter(
          (r) =>
            String(
              r.sourceExtrusionBatchId
            ) ===
              String(batchId) &&
            r.dispatchStatus !==
              "DELETED"
        )
        .reduce(
          (sum, r) => {

            return (
              sum +
              Number(
                r.quantityKg || 0
              )
            );

          },
          0
        );

    return (
      Number(
        fg.fgOutputKg || 0
      ) - totalDispatch
    );

  }

  function onChange(e) {

    let updated = {

      ...form,

      [e.target.name]:
        e.target.value,

    };

    if (
      e.target.name ===
      "sourceExtrusionBatchId"
    ) {

      const selected =
        extrusionRows.find(
          (x) =>
            String(
              x.extrusionBatchId
            ) ===
            String(
              e.target.value
            )
        );

      if (selected) {

        updated.grade =
          selected.productionGrade || "";

        updated.lotNo =
          selected.lotNo ||
          selected.extrusionBatchId ||
          "";

        updated.availableFGQty =
          getAvailableFG(
            selected.extrusionBatchId
          );

        updated.quantityKg =
          updated.availableFGQty;

        updated.sourceSupplier =
          selected.sourceSupplier || "";

      }

    }

    setForm(updated);

  }

  async function submit(e) {

    e.preventDefault();

    try {

      const valid =
        validateDispatch({

          fgStock:
            form.availableFGQty,

          dispatchQty:
            form.quantityKg,

        });

      if (!valid) {

        setStatus(
          "Dispatch exceeds available FG stock"
        );

        return;

      }

      let res;

      if (editingId) {

        res =
          await apiCall({

            fn:
              "dispatch.update",

            ...form,

          });

      } else {

        res =
          await apiCall({

            fn:
              "dispatch.add",

            ...form,

          });

      }

      if (res.ok) {

        setStatus(
          editingId
            ? "Dispatch Updated"
            : "Dispatch Saved"
        );

        setEditingId(
          null
        );

        setForm(
          blankForm
        );

        loadData();

      }

    } catch (err) {

      setStatus(
        err.message
      );

    }

  }

  function editRow(row) {

    setEditingId(
      row.dispatchId
    );

    setForm({

      ...blankForm,

      ...row,

      date: row.date
        ? new Date(
            row.date
          )
            .toISOString()
            .split("T")[0]
        : today,

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
        "Delete dispatch?"
      );

    if (!confirmed)
      return;

    await apiCall({

      fn:
        "dispatch.update",

      dispatchId:
        row.dispatchId,

      dispatchStatus:
        "DELETED",

    });

    loadData();

  }

  const totalSales =
    rows.reduce(
      (sum, r) => {

        return (
          sum +
          (
            Number(
              r.quantityKg || 0
            ) *
            Number(
              r.ratePerKg || 0
            )
          )
        );

      },
      0
    );

  const totalDispatch =
    rows.reduce(
      (sum, r) => {

        return (
          sum +
          Number(
            r.quantityKg || 0
          )
        );

      },
      0
    );

  const avgRealization =
    totalDispatch > 0
      ? (
          totalSales /
          totalDispatch
        ).toFixed(2)
      : 0;

  const liveLots =
    extrusionRows
      .map((x) => {

        return {

          ...x,

          available:
            getAvailableFG(
              x.extrusionBatchId
            ),

        };

      })
      .filter(
        (x) =>
          x.available > 0
      );

  const customerSummary =
    useMemo(() => {

      const map = {};

      rows.forEach((r) => {

        const customer =
          r.customerName ||
          "Unknown";

        map[customer] =
          (
            map[customer] || 0
          ) +
          Number(
            r.quantityKg || 0
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

      <div style={headerCard}>

        <h1
          style={{
            margin: 0,
          }}
        >

          Dispatch Workflow

        </h1>

        <div style={subText}>

          Finished goods dispatch & customer traceability

        </div>

      </div>

      <div style={kpiGrid}>

        <KPI
          title="Dispatch Qty"
          value={`${totalDispatch.toFixed(
            0
          )} Kg`}
        />

        <KPI
          title="Sales"
          value={`₹ ${totalSales.toFixed(
            0
          )}`}
        />

        <KPI
          title="Avg Realization"
          value={`₹ ${avgRealization}`}
        />

        <KPI
          title="Live Lots"
          value={liveLots.length}
        />

      </div>

      <form
        onSubmit={submit}
        style={{
          display: "flex",
          flexDirection:
            "column",
          gap: 16,
        }}
      >

        <FormSection
          title="FG Source"
        >

          <Field label="FG Batch">

            <select
              name="sourceExtrusionBatchId"
              value={
                form.sourceExtrusionBatchId
              }
              onChange={
                onChange
              }
              style={
                inputStyle
              }
            >

              <option value="">
                Select
              </option>

              {liveLots.map(
                (
                  x,
                  i
                ) => (

                  <option
                    key={i}
                    value={
                      x.extrusionBatchId
                    }
                  >

                    {
                      x.extrusionBatchId
                    }
                    {" | "}
                    {
                      x.productionGrade
                    }
                    {" | "}
                    {
                      x.available
                    }
                    {" Kg"}

                  </option>

                )
              )}

            </select>

          </Field>

          <Field label="Grade">

            <input
              readOnly
              value={
                form.grade
              }
              style={
                readonlyStyle
              }
            />

          </Field>

          <Field label="Lot No">

            <input
              readOnly
              value={
                form.lotNo
              }
              style={
                readonlyStyle
              }
            />

          </Field>

          <Field label="Available FG">

            <input
              readOnly
              value={
                form.availableFGQty
              }
              style={
                readonlyStyle
              }
            />

          </Field>

        </FormSection>

        <FormSection
          title="Customer & Logistics"
        >

          <Field label="Date">

            <input
              type="date"
              name="date"
              value={
                form.date
              }
              onChange={
                onChange
              }
              style={
                inputStyle
              }
            />

          </Field>

          <Field label="Customer">

            <input
              name="customerName"
              value={
                form.customerName
              }
              onChange={
                onChange
              }
              style={
                inputStyle
              }
            />

          </Field>

          <Field label="Invoice">

            <input
              name="invoiceNo"
              value={
                form.invoiceNo
              }
              onChange={
                onChange
              }
              style={
                inputStyle
              }
            />

          </Field>

          <Field label="Vehicle">

            <input
              name="vehicleNo"
              value={
                form.vehicleNo
              }
              onChange={
                onChange
              }
              style={
                inputStyle
              }
            />

          </Field>

          <Field label="Driver">

            <input
              name="driverName"
              value={
                form.driverName
              }
              onChange={
                onChange
              }
              style={
                inputStyle
              }
            />

          </Field>

          <Field label="Location">

            <input
              name="dispatchLocation"
              value={
                form.dispatchLocation
              }
              onChange={
                onChange
              }
              style={
                inputStyle
              }
            />

          </Field>

        </FormSection>

        <FormSection
          title="Dispatch Quantity"
        >

          <Field label="Dispatch Qty Kg">

            <input
              name="quantityKg"
              value={
                form.quantityKg
              }
              onChange={
                onChange
              }
              style={
                inputStyle
              }
            />

          </Field>

          <Field label="No Of Bags">

            <input
              name="noOfBags"
              value={
                form.noOfBags
              }
              onChange={
                onChange
              }
              style={
                inputStyle
              }
            />

          </Field>

          <Field label="Rate">

            <input
              name="ratePerKg"
              value={
                form.ratePerKg
              }
              onChange={
                onChange
              }
              style={
                inputStyle
              }
            />

          </Field>

          <Field label="Status">

            <select
              name="dispatchStatus"
              value={
                form.dispatchStatus
              }
              onChange={
                onChange
              }
              style={
                inputStyle
              }
            >

              <option>
                DISPATCHED
              </option>

              <option>
                IN_TRANSIT
              </option>

              <option>
                DELIVERED
              </option>

            </select>

          </Field>

        </FormSection>

        <FormSection
          title="Remarks"
          defaultOpen={false}
        >

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

        </FormSection>

        <div style={stickyBar}>

          <button
            type="submit"
            style={
              editingId
                ? updateButton
                : saveButton
            }
          >

            {editingId
              ? "Update Dispatch"
              : "Save Dispatch"}

          </button>

        </div>

      </form>

      {status && (

        <div style={statusStyle}>

          {status}

        </div>

      )}

      <div style={sectionCard}>

        <div style={sectionTitle}>
          Top Customers
        </div>

        <div style={customerGrid}>

          {customerSummary.map(
            (c, i) => (

              <div
                key={i}
                style={
                  customerCard
                }
              >

                <div
                  style={{
                    fontWeight: 700,
                  }}
                >

                  {c[0]}

                </div>

                <div
                  style={{
                    marginTop: 6,
                    color:
                      "#0f766e",
                    fontWeight: 700,
                  }}
                >

                  {Number(
                    c[1]
                  ).toFixed(0)}
                  {" Kg"}

                </div>

              </div>

            )
          )}

        </div>

      </div>

      <DataTable
        title="Dispatch History"
        rows={rows.filter(
          (r) =>
            r.dispatchStatus !==
            "DELETED"
        )}
        searchFields={[
          "dispatchId",
          "customerName",
          "grade",
          "invoiceNo",
          "vehicleNo",
          "lotNo",
        ]}
        columns={[
          {
            key: "date",
            label: "Date",
            render: (r) =>
              formatDate(
                r.date
              ),
          },
          {
            key:
              "dispatchId",
            label: "Dispatch",
          },
          {
            key:
              "customerName",
            label: "Customer",
          },
          {
            key: "grade",
            label: "Grade",
          },
          {
            key:
              "quantityKg",
            label: "Qty Kg",
          },
          {
            key:
              "ratePerKg",
            label: "Rate",
          },
          {
            key:
              "dispatchStatus",
            label: "Status",
          },
        ]}
        onEdit={editRow}
        onDelete={deleteRow}
      />

    </div>

  );

}

function Field({
  label,
  children,
}) {

  return (

    <div>

      <div style={fieldLabel}>
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

    <div style={kpiCard}>

      <div style={kpiTitle}>
        {title}
      </div>

      <div style={kpiValue}>
        {value}
      </div>

    </div>

  );

}

const pageStyle = {
  padding: 20,
};

const headerCard = {
  background: "white",
  padding: 18,
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  marginBottom: 16,
};

const subText = {
  color: "#64748b",
  marginTop: 4,
  fontSize: 13,
};

const sectionCard = {
  background: "white",
  padding: 18,
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  marginBottom: 16,
};

const sectionTitle = {
  fontWeight: 700,
  marginBottom: 16,
  color: "#005d34",
};

const fieldLabel = {
  fontSize: 12,
  fontWeight: 600,
  marginBottom: 4,
  color: "#334155",
};

const kpiGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(180px,1fr))",
  gap: 14,
  marginBottom: 16,
};

const kpiCard = {
  background: "white",
  padding: 16,
  borderRadius: 12,
  border: "1px solid #e5e7eb",
};

const kpiTitle = {
  color: "#64748b",
  fontSize: 12,
  marginBottom: 8,
};

const kpiValue = {
  fontSize: 22,
  fontWeight: 700,
  color: "#005d34",
};

const customerGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(180px,1fr))",
  gap: 12,
};

const customerCard = {
  border:
    "1px solid #e5e7eb",
  borderRadius: 10,
  padding: 12,
  background:
    "#f8fafc",
};

const inputStyle = {
  width: "100%",
  padding: 10,
  borderRadius: 8,
  border:
    "1px solid #ccc",
  boxSizing:
    "border-box",
};

const readonlyStyle = {
  ...inputStyle,
  background:
    "#f8fafc",
  fontWeight: 700,
};

const textareaStyle = {
  ...inputStyle,
  height: 80,
};

const saveButton = {
  background:
    "#0f766e",
  color: "white",
  border: "none",
  padding:
    "12px 20px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
};

const updateButton = {
  ...saveButton,
  background:
    "#ea580c",
};

const stickyBar = {
  position: "sticky",
  bottom: 0,
  background:
    "white",
  padding: 12,
  borderTop:
    "1px solid #ddd",
  display: "flex",
  justifyContent:
    "flex-end",
  zIndex: 10,
};

const statusStyle = {
  marginTop: 12,
  marginBottom: 16,
  fontWeight: 600,
  color: "#0f766e",
};