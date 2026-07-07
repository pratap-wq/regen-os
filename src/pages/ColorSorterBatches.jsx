import { useEffect, useState } from "react";
import { apiCall } from "../api/api";
import DataTable from "../components/DataTable";
import FormSection from "../components/FormSection";

export default function ColorSorterBatches() {

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  const [status, setStatus] =
    useState("");

  const [rows, setRows] =
    useState([]);

  const [machines, setMachines] =
    useState([]);

  const [washBatches, setWashBatches] =
    useState([]);

  const [editingId, setEditingId] =
    useState(null);

  const blankForm = {

    sortingBatchId: "",

    sourceWashBatchId: "",

    sourceSupplier: "",

    availableWashQty: "",

    date: today,

    shift: "A",

    machine: "",

    inputMaterial: "",

    inputWeightKg: "",

    // OUTPUTS

    acceptedQtyKg: "",

    whiteSortedKg: "",

    allMixSortedKg: "",

    commodityKg: "",

    whiteGreyKg: "",

    rejectedQtyKg: "",

    rubberRejectKg: "",

    blackSpecsRejectKg: "",

    raffiaRejectKg: "",

    wrappersRejectKg: "",

    dustKg: "",

    // AUTO CALCULATED

    totalRecoverableKg: "",

    totalRejectKg: "",

    totalAccountedKg: "",

    varianceKg: "",

    variancePercent: "",

    recoveryPercent: "",

    nextProcess:
      "Extrusion",

    status:
      "READY_FOR_EXTRUSION",

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

        sorterRes,
        machineRes,
        washRes,

      ] = await Promise.all([

        apiCall({
          fn:
            "sorting.list",
        }),

        apiCall({
          fn:
            "machines.list",
        }),

        apiCall({
          fn:
            "wash.availableForSorting",
        }),

      ]);

      setRows(
        sorterRes.rows || []
      );

      setMachines(
        machineRes.rows || []
      );

      setWashBatches(
        washRes.rows || []
      );

    } catch (err) {

      console.log(err);

    }

  }

  function calculateMassBalance(
    updated
  ) {

    const input =
      Number(
        updated.inputWeightKg || 0
      );

    // RECOVERABLE

    const accepted =
      Number(
        updated.acceptedQtyKg || 0
      );

    const white =
      Number(
        updated.whiteSortedKg || 0
      );

    const allMix =
      Number(
        updated.allMixSortedKg || 0
      );

    const commodity =
      Number(
        updated.commodityKg || 0
      );

    const whiteGrey =
      Number(
        updated.whiteGreyKg || 0
      );

    // REJECTS

    const rejected =
      Number(
        updated.rejectedQtyKg || 0
      );

    const rubber =
      Number(
        updated.rubberRejectKg || 0
      );

    const black =
      Number(
        updated.blackSpecsRejectKg || 0
      );

    const raffia =
      Number(
        updated.raffiaRejectKg || 0
      );

    const wrappers =
      Number(
        updated.wrappersRejectKg || 0
      );

    const dust =
      Number(
        updated.dustKg || 0
      );

    const totalRecoverable =
      accepted +
      white +
      allMix +
      commodity +
      whiteGrey;

    const totalReject =
      rejected +
      rubber +
      black +
      raffia +
      wrappers +
      dust;

    const totalAccounted =
      totalRecoverable +
      totalReject;

    const variance =
      input -
      totalAccounted;

    const recovery =
      input > 0
        ? (
            (totalRecoverable /
              input) *
            100
          ).toFixed(2)
        : 0;

    const variancePercent =
      input > 0
        ? (
            (variance /
              input) *
            100
          ).toFixed(2)
        : 0;

    updated.totalRecoverableKg =
      totalRecoverable.toFixed(2);

    updated.totalRejectKg =
      totalReject.toFixed(2);

    updated.totalAccountedKg =
      totalAccounted.toFixed(2);

    updated.varianceKg =
      variance.toFixed(2);

    updated.variancePercent =
      variancePercent;

    updated.recoveryPercent =
      recovery;

    return updated;

  }

  function onChange(e) {

    let updated = {

      ...form,

      [e.target.name]:
        e.target.value,

    };

    if (
      e.target.name ===
      "sourceWashBatchId"
    ) {

      const selected =
        washBatches.find(
          (w) =>
            String(
              w.washBatchId
            ) ===
            String(
              e.target.value
            )
        );

      if (selected) {

        updated.inputMaterial =
          selected.inputMaterial || "";

        updated.inputWeightKg =
          selected.washedOutputKg || "";

        updated.availableWashQty =
          selected.washedOutputKg || "";

        updated.sourceSupplier =
          selected.supplier || "";

      }

    }

    updated =
      calculateMassBalance(
        updated
      );

    setForm(updated);

  }

  function editRow(row) {

    setEditingId(
      row.sortingBatchId
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

  async function submit(e) {

    e.preventDefault();

    try {

      let res;

      if (editingId) {

        res =
          await apiCall({

            fn:
              "sorting.update",

            ...form,

          });

      } else {

        res =
          await apiCall({

            fn:
              "sorting.add",

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

        loadData();

      }

    } catch (err) {

      setStatus(
        err.message
      );

    }

  }

  async function deleteRow(
    row
  ) {

    const confirmed =
      window.confirm(
        "Delete sorting batch?"
      );

    if (!confirmed)
      return;

    await apiCall({

      fn:
        "sorting.update",

      sortingBatchId:
        row.sortingBatchId,

      status:
        "DELETED",

    });

    loadData();

  }

  return (

    <div
      style={{
        padding: 16,
      }}
    >

      <div
        style={{
          marginBottom: 16,
        }}
      >

        <h2
          style={{
            margin: 0,
          }}
        >

          Color Sorting Mass Balance

        </h2>

        <div
          style={{
            fontSize: 13,
            color: "#64748b",
            marginTop: 4,
          }}
        >

          Sorting yield & recovery intelligence

        </div>

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
          title="Source Information"
        >

          <Field label="Wash Batch">

            <select
              name="sourceWashBatchId"
              value={
                form.sourceWashBatchId
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

              {washBatches.map(
                (w, i) => (

                  <option
                    key={i}
                    value={
                      w.washBatchId
                    }
                  >

                    {
                      w.washBatchId
                    }
                    {" | "}
                    {
                      w.washedOutputKg
                    }
                    {" Kg"}

                  </option>

                )
              )}

            </select>

          </Field>

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

          <Field label="Shift">

            <select
              name="shift"
              value={
                form.shift
              }
              onChange={
                onChange
              }
              style={
                inputStyle
              }
            >

              <option>A</option>
              <option>B</option>
              <option>C</option>

            </select>

          </Field>

          <Field label="Machine">

            <select
              name="machine"
              value={
                form.machine
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

              {machines
                .filter(
                  (m) =>
                    String(
                      m.isActive ||
                        "TRUE"
                    ).toUpperCase() ===
                    "TRUE"
                )
                .map(
                  (
                    m,
                    i
                  ) => (

                    <option
                      key={i}
                      value={
                        m.machineName
                      }
                    >

                      {
                        m.machineName
                      }

                    </option>

                  )
                )}

            </select>

          </Field>

          <Field label="Material">

            <input
              readOnly
              value={
                form.inputMaterial
              }
              style={
                readonlyStyle
              }
            />

          </Field>

          <Field label="Input Kg">

            <input
              readOnly
              value={
                form.inputWeightKg
              }
              style={
                readonlyStyle
              }
            />

          </Field>

        </FormSection>

        <FormSection
          title="Recoverable Outputs"
        >

          <Field label="Accepted">

            <input
              type="number"
              name="acceptedQtyKg"
              value={
                form.acceptedQtyKg
              }
              onChange={
                onChange
              }
              style={
                inputStyle
              }
            />

          </Field>

          <Field label="White Sorted">

            <input
              type="number"
              name="whiteSortedKg"
              value={
                form.whiteSortedKg
              }
              onChange={
                onChange
              }
              style={
                inputStyle
              }
            />

          </Field>

          <Field label="All Mix">

            <input
              type="number"
              name="allMixSortedKg"
              value={
                form.allMixSortedKg
              }
              onChange={
                onChange
              }
              style={
                inputStyle
              }
            />

          </Field>

          <Field label="Commodity">

            <input
              type="number"
              name="commodityKg"
              value={
                form.commodityKg
              }
              onChange={
                onChange
              }
              style={
                inputStyle
              }
            />

          </Field>

          <Field label="White & Grey">

            <input
              type="number"
              name="whiteGreyKg"
              value={
                form.whiteGreyKg
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
          title="Reject Outputs"
        >

          <Field label="Rejected">

            <input
              type="number"
              name="rejectedQtyKg"
              value={
                form.rejectedQtyKg
              }
              onChange={
                onChange
              }
              style={
                inputStyle
              }
            />

          </Field>

          <Field label="Rubber Reject">

            <input
              type="number"
              name="rubberRejectKg"
              value={
                form.rubberRejectKg
              }
              onChange={
                onChange
              }
              style={
                inputStyle
              }
            />

          </Field>

          <Field label="Black Specs">

            <input
              type="number"
              name="blackSpecsRejectKg"
              value={
                form.blackSpecsRejectKg
              }
              onChange={
                onChange
              }
              style={
                inputStyle
              }
            />

          </Field>

          <Field label="Raffia Reject">

            <input
              type="number"
              name="raffiaRejectKg"
              value={
                form.raffiaRejectKg
              }
              onChange={
                onChange
              }
              style={
                inputStyle
              }
            />

          </Field>

          <Field label="Wrappers Reject">

            <input
              type="number"
              name="wrappersRejectKg"
              value={
                form.wrappersRejectKg
              }
              onChange={
                onChange
              }
              style={
                inputStyle
              }
            />

          </Field>

          <Field label="Dust">

            <input
              type="number"
              name="dustKg"
              value={
                form.dustKg
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
          title="Mass Balance Engine"
        >

          <Field label="Recovery %">

            <input
              readOnly
              value={
                form.recoveryPercent
              }
              style={
                readonlyStyle
              }
            />

          </Field>

          <Field label="Recoverable Kg">

            <input
              readOnly
              value={
                form.totalRecoverableKg
              }
              style={
                readonlyStyle
              }
            />

          </Field>

          <Field label="Reject Kg">

            <input
              readOnly
              value={
                form.totalRejectKg
              }
              style={
                readonlyStyle
              }
            />

          </Field>

          <Field label="Total Accounted">

            <input
              readOnly
              value={
                form.totalAccountedKg
              }
              style={
                readonlyStyle
              }
            />

          </Field>

          <Field label="Variance Kg">

            <input
              readOnly
              value={
                form.varianceKg
              }
              style={{
                ...readonlyStyle,

                color:
                  Number(
                    form.varianceKg || 0
                  ) > 10
                    ? "#dc2626"
                    : "#16a34a",

              }}
            />

          </Field>

          <Field label="Variance %">

            <input
              readOnly
              value={
                form.variancePercent
              }
              style={{
                ...readonlyStyle,

                color:
                  Number(
                    form.variancePercent || 0
                  ) > 3
                    ? "#dc2626"
                    : "#16a34a",

              }}
            />

          </Field>

        </FormSection>

        <FormSection
          title="Workflow"
        >

          <Field label="Next Process">

            <select
              name="nextProcess"
              value={
                form.nextProcess
              }
              onChange={
                onChange
              }
              style={
                inputStyle
              }
            >

              <option value="Extrusion">
                Extrusion
              </option>

              <option value="Hold">
                Hold
              </option>

              <option value="Resort">
                Resort
              </option>

            </select>

          </Field>

          <Field label="Status">

            <input
              readOnly
              value={
                form.status
              }
              style={
                readonlyStyle
              }
            />

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
            style={saveButton(
              editingId
            )}
          >

            {editingId
              ? "Update Batch"
              : "Save Batch"}

          </button>

        </div>

      </form>

      {status && (

        <div
          style={{
            marginBottom: 12,
            color:
              "#0f766e",
            fontWeight: 600,
            fontSize: 13,
          }}
        >

          {status}

        </div>

      )}

      <DataTable
        title="Sorting Mass Balance"
        rows={rows.filter(
          (r) =>
            r.status !==
            "DELETED"
        )}
        searchFields={[
          "sortingBatchId",
          "machine",
          "inputMaterial",
          "sourceWashBatchId",
        ]}
        columns={[
          {
            key:
              "sortingBatchId",
            label: "Batch",
          },
          {
            key:
              "sourceWashBatchId",
            label: "Wash Batch",
          },
          {
            key:
              "machine",
            label: "Machine",
          },
          {
            key:
              "inputWeightKg",
            label: "Input",
          },
          {
            key:
              "totalRecoverableKg",
            label:
              "Recoverable",
          },
          {
            key:
              "totalRejectKg",
            label:
              "Reject",
          },
          {
            key:
              "varianceKg",
            label:
              "Variance",
          },
          {
            key:
              "recoveryPercent",
            label:
              "Recovery %",
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

const inputStyle = {

  width: "100%",

  padding:
    "10px",

  borderRadius: 8,

  border:
    "1px solid #cbd5e1",

  fontSize: 13,

  boxSizing:
    "border-box",

};

const readonlyStyle = {

  ...inputStyle,

  background:
    "#f1f5f9",

  fontWeight: 700,

};

const textareaStyle = {

  ...inputStyle,

  height: 80,

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

const saveButton = (
  editingId
) => ({

  background:
    editingId
      ? "#ea580c"
      : "#0f766e",

  color: "white",

  border: "none",

  padding:
    "12px 20px",

  borderRadius: 8,

  cursor: "pointer",

  fontWeight: 600,

});