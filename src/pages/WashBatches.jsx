import { useEffect, useState } from "react";
import { apiCall } from "../api/api";
import DataTable from "../components/DataTable";
import FormSection from "../components/FormSection";

export default function WashBatches() {

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  const currentMonth =
    new Date()
      .toISOString()
      .slice(0, 7);

  const blankForm = {

    washBatchId: "",

    sourceRMId: "",

    supplier: "",

    availableRMQty: "",

    date: today,

    shift: "A",

    machine: "",

    entryMode: "DAILY",

    periodMonth:
      currentMonth,

    inputMaterial: "",

    inputWeightKg: "",

    washedOutputKg: "",

    raffiaKg: "",

    wrappersKg: "",

    microPlasticKg: "",

    sinkMaterialKg: "",

    ironScrapKg: "",

    otherColorKg: "",

    dustKg: "",

    sludgeKg: "",

    totalRecoverableKg: "",

    totalNonRecoverableKg: "",

    totalAccountedKg: "",

    varianceKg: "",

    variancePercent: "",

    estimatedRecoveryPercent:
      "",

    operatorName: "",

    sortingRequired:
      "YES",

    nextProcess:
      "Colour Sorting",

    status:
      "READY_FOR_SORTING",

    remarks: "",

    createdBy:
      "Pratap",

  };

  const [form, setForm] =
    useState(blankForm);

  const [rows, setRows] =
    useState([]);

  const [machines, setMachines] =
    useState([]);

  const [categories, setCategories] =
    useState([]);

  const [rmRows, setRmRows] =
    useState([]);

  const [editing, setEditing] =
    useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {

    loadMasters();

    loadRows();

  }, []);

  async function loadMasters() {

    try {

      const [
        machineRes,
        categoryRes,
        rmRes,
      ] = await Promise.all([

        apiCall({
          fn: "machines.list",
        }),

        apiCall({
          fn: "categories.list",
        }),

        apiCall({
          fn: "rm.list",
        }),

      ]);

      setMachines(
        machineRes.rows || []
      );

      setCategories(
        categoryRes.rows || []
      );

      setRmRows(
        rmRes.rows || []
      );

    } catch (err) {

      console.log(err);

    }

  }

  async function loadRows() {

    try {

      const res =
        await apiCall({
          fn: "wash.list",
        });

      setRows(
        res.rows || []
      );

    } catch (err) {

      console.log(err);

    }

  }

  function calculateRecovery(
    updated
  ) {

    const input =
      Number(
        updated.inputWeightKg || 0
      );

    const washed =
      Number(
        updated.washedOutputKg || 0
      );

    const raffia =
      Number(
        updated.raffiaKg || 0
      );

    const wrappers =
      Number(
        updated.wrappersKg || 0
      );

    const micro =
      Number(
        updated.microPlasticKg || 0
      );

    const sink =
      Number(
        updated.sinkMaterialKg || 0
      );

    const iron =
      Number(
        updated.ironScrapKg || 0
      );

    const otherColor =
      Number(
        updated.otherColorKg || 0
      );

    const dust =
      Number(
        updated.dustKg || 0
      );

    const sludge =
      Number(
        updated.sludgeKg || 0
      );

    // RECOVERABLE

    const recoverable =
      washed +
      sink +
      iron +
      otherColor;

    // NON RECOVERABLE

    const nonRecoverable =
      raffia +
      wrappers +
      micro +
      dust +
      sludge;

    // ACCOUNTED

    const totalAccounted =
      recoverable +
      nonRecoverable;

    // VARIANCE

    const variance =
      input -
      totalAccounted;

    // RECOVERY %

    const recoveryPercent =
      input > 0
        ? (
            (washed / input) *
            100
          ).toFixed(2)
        : 0;

    // VARIANCE %

    const variancePercent =
      input > 0
        ? (
            (variance / input) *
            100
          ).toFixed(2)
        : 0;

    updated.totalRecoverableKg =
      recoverable.toFixed(2);

    updated.totalNonRecoverableKg =
      nonRecoverable.toFixed(2);

    updated.totalAccountedKg =
      totalAccounted.toFixed(2);

    updated.varianceKg =
      variance.toFixed(2);

    updated.variancePercent =
      variancePercent;

    updated.estimatedRecoveryPercent =
      recoveryPercent;

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
      "sourceRMId"
    ) {

      const rm =
        rmRows.find(
          (x) =>
            x.inwardId ===
            e.target.value
        );

      if (rm) {

        updated.supplier =
          rm.supplier;

        updated.inputMaterial =
          rm.material;

        updated.availableRMQty =
          rm.netWeight;

      }

    }

    updated =
      calculateRecovery(
        updated
      );

    setForm(updated);

  }

  async function submit(e) {

    e.preventDefault();

    try {

      let res;

      if (editing) {

        res =
          await apiCall({

            fn:
              "wash.update",

            ...form,

          });

      } else {

        res =
          await apiCall({

            fn:
              "wash.add",

            ...form,

          });

      }

      if (res.ok) {

        setMessage(
          editing
            ? "Updated"
            : "Saved"
        );

        setForm(
          blankForm
        );

        setEditing(
          false
        );

        loadRows();

      }

    } catch (err) {

      setMessage(
        err.message
      );

    }

  }

  function editRow(row) {

    setEditing(true);

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

    const ok =
      window.confirm(
        "Delete batch?"
      );

    if (!ok) return;

    try {

      await apiCall({

        fn:
          "wash.update",

        washBatchId:
          row.washBatchId,

        status:
          "DELETED",

      });

      loadRows();

    } catch (err) {

      alert(
        err.message
      );

    }

  }

  return (

    <div style={{ padding: 20 }}>

      <h1>
        Washline Mass Balance
      </h1>

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
          title="Basic Information"
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
                Select Machine
              </option>

              {machines.map(
                (m, i) => (

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

          <Field label="Operator">

            <input
              name="operatorName"
              value={
                form.operatorName
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
          title="Material Input"
        >

          <Field label="Source Material">

            <select
              name="sourceRMId"
              value={
                form.sourceRMId
              }
              onChange={
                onChange
              }
              style={
                inputStyle
              }
            >

              <option value="">
                Select Material
              </option>

              {rmRows.map(
                (r, i) => (

                  <option
                    key={i}
                    value={
                      r.inwardId
                    }
                  >

                    {r.inwardId}
                    {" | "}
                    {r.material}
                    {" | "}
                    {r.netWeight}
                    Kg

                  </option>

                )
              )}

            </select>

          </Field>

          <Field label="Input Material">

            <select
              name="inputMaterial"
              value={
                form.inputMaterial
              }
              onChange={
                onChange
              }
              style={
                inputStyle
              }
            >

              <option value="">
                Select Material
              </option>

              {categories.map(
                (c, i) => (

                  <option
                    key={i}
                    value={
                      c.categoryName
                    }
                  >

                    {
                      c.categoryName
                    }

                  </option>

                )
              )}

            </select>

          </Field>

          <Field label="Input Weight Kg">

            <input
              type="number"
              name="inputWeightKg"
              value={
                form.inputWeightKg
              }
              onChange={
                onChange
              }
              style={
                inputStyle
              }
            />

          </Field>

          <Field label="Washed Output Kg">

            <input
              type="number"
              name="washedOutputKg"
              value={
                form.washedOutputKg
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
          title="Washline Wastage"
        >

          <Field label="Raffia Kg">

            <input
              type="number"
              name="raffiaKg"
              value={
                form.raffiaKg
              }
              onChange={
                onChange
              }
              style={
                inputStyle
              }
            />

          </Field>

          <Field label="Wrappers Kg">

            <input
              type="number"
              name="wrappersKg"
              value={
                form.wrappersKg
              }
              onChange={
                onChange
              }
              style={
                inputStyle
              }
            />

          </Field>

          <Field label="Micro Plastic Kg">

            <input
              type="number"
              name="microPlasticKg"
              value={
                form.microPlasticKg
              }
              onChange={
                onChange
              }
              style={
                inputStyle
              }
            />

          </Field>

          <Field label="Sink Material Kg">

            <input
              type="number"
              name="sinkMaterialKg"
              value={
                form.sinkMaterialKg
              }
              onChange={
                onChange
              }
              style={
                inputStyle
              }
            />

          </Field>

          <Field label="Iron Scrap Kg">

            <input
              type="number"
              name="ironScrapKg"
              value={
                form.ironScrapKg
              }
              onChange={
                onChange
              }
              style={
                inputStyle
              }
            />

          </Field>

          <Field label="Other Color Kg">

            <input
              type="number"
              name="otherColorKg"
              value={
                form.otherColorKg
              }
              onChange={
                onChange
              }
              style={
                inputStyle
              }
            />

          </Field>

          <Field label="Dust Kg">

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

          <Field label="Sludge Kg">

            <input
              type="number"
              name="sludgeKg"
              value={
                form.sludgeKg
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
                form.estimatedRecoveryPercent
              }
              style={
                readOnlyStyle
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
                readOnlyStyle
              }
            />

          </Field>

          <Field label="Non Recoverable Kg">

            <input
              readOnly
              value={
                form.totalNonRecoverableKg
              }
              style={
                readOnlyStyle
              }
            />

          </Field>

          <Field label="Total Accounted Kg">

            <input
              readOnly
              value={
                form.totalAccountedKg
              }
              style={
                readOnlyStyle
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
                ...readOnlyStyle,

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
                ...readOnlyStyle,

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

          <Field label="Sorting Required">

            <select
              name="sortingRequired"
              value={
                form.sortingRequired
              }
              onChange={
                onChange
              }
              style={
                inputStyle
              }
            >

              <option>YES</option>
              <option>NO</option>

            </select>

          </Field>

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

              <option>
                Colour Sorting
              </option>

              <option>
                Extrusion
              </option>

            </select>

          </Field>

          <Field label="Status">

            <select
              name="status"
              value={
                form.status
              }
              onChange={
                onChange
              }
              style={
                inputStyle
              }
            >

              <option>
                READY_FOR_SORTING
              </option>

              <option>
                READY_FOR_EXTRUSION
              </option>

              <option>
                COMPLETED
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
            style={buttonStyle}
          >

            {editing
              ? "Update Material"
              : "Save Material"}

          </button>

        </div>

      </form>

      <div
        style={{
          marginBottom: 20,
          color: "#0f766e",
          fontWeight: 600,
        }}
      >

        {message}

      </div>

      <DataTable
        title="Washline Mass Balance"
        rows={rows.filter(
          (r) =>
            r.status !==
            "DELETED"
        )}
        searchFields={[
          "washBatchId",
          "machine",
          "supplier",
          "inputMaterial",
        ]}
        columns={[
          {
            key: "date",
            label: "Date",
          },
          {
            key: "washBatchId",
            label: "Material Ref",
          },
          {
            key: "machine",
            label: "Machine",
          },
          {
            key: "inputMaterial",
            label: "Material",
          },
          {
            key: "inputWeightKg",
            label: "Input",
          },
          {
            key: "washedOutputKg",
            label: "Washed",
          },
          {
            key:
              "totalRecoverableKg",
            label:
              "Recoverable",
          },
          {
            key:
              "totalNonRecoverableKg",
            label:
              "Non Recoverable",
          },
          {
            key:
              "varianceKg",
            label:
              "Variance",
          },
          {
            key:
              "estimatedRecoveryPercent",
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
          fontWeight: 600,
          marginBottom: 5,
          fontSize: 13,
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

  padding: 10,

  borderRadius: 8,

  border:
    "1px solid #ccc",

  boxSizing:
    "border-box",

};

const readOnlyStyle = {

  ...inputStyle,

  background:
    "#f1f5f9",

  fontWeight: 700,

};

const textareaStyle = {

  ...inputStyle,

  height: 80,

};

const buttonStyle = {

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
