import { useState } from "react";

import { apiCall } from "../api/api";

import {
  pageStyle,
  sectionCard,
  sectionTitle,
  formGrid,
  inputStyle,
  textareaStyle,
  primaryButton,
  readonlyStyle,
} from "../ui/styles";

export default function SupplierEntry() {

  const blankForm = {

    supplierName: "",

    supplierType: "",

    city: "",

    state: "",

    contactPerson: "",

    phone: "",

    gstNo: "",

    materialType: "",

    qualityRating: "B",

    paymentTerms: "",

    isActive: "TRUE",

  };

  const [status, setStatus] =
    useState("");

  const [form, setForm] =
    useState(blankForm);

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
            "supplier.add",

          ...form,

        });

      if (res.ok) {

        setStatus(
          "Supplier created successfully"
        );

        setForm(
          blankForm
        );

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

  return (

    <div style={pageStyle}>

      {/* HEADER */}

      <div style={sectionCard}>

        <div style={sectionTitle}>

          Supplier Onboarding

        </div>

        <div
          style={{
            color:
              "#64748b",
            fontSize: 13,
          }}
        >

          Vendor and raw material
          supplier registration
          workflow

        </div>

      </div>

      {/* FORM */}

      <div style={sectionCard}>

        <div style={sectionTitle}>

          Supplier Details

        </div>

        <form
          onSubmit={submit}
          style={formGrid}
        >

          <Field label="Supplier Name">

            <input
              name="supplierName"
              value={
                form.supplierName
              }
              onChange={
                onChange
              }
              placeholder="Supplier Name"
              style={
                inputStyle
              }
            />

          </Field>

          <Field label="Supplier Type">

            <select
              name="supplierType"
              value={
                form.supplierType
              }
              onChange={
                onChange
              }
              style={
                inputStyle
              }
            >

              <option value="">
                Select Supplier Type
              </option>

              <option>
                Trader
              </option>

              <option>
                MRF
              </option>

              <option>
                Scrap Dealer
              </option>

              <option>
                Importer
              </option>

              <option>
                Factory Direct
              </option>

              <option>
                Recycler
              </option>

            </select>

          </Field>

          <Field label="City">

            <input
              name="city"
              value={
                form.city
              }
              onChange={
                onChange
              }
              placeholder="City"
              style={
                inputStyle
              }
            />

          </Field>

          <Field label="State">

            <input
              name="state"
              value={
                form.state
              }
              onChange={
                onChange
              }
              placeholder="State"
              style={
                inputStyle
              }
            />

          </Field>

          <Field label="Contact Person">

            <input
              name="contactPerson"
              value={
                form.contactPerson
              }
              onChange={
                onChange
              }
              placeholder="Contact Person"
              style={
                inputStyle
              }
            />

          </Field>

          <Field label="Phone">

            <input
              name="phone"
              value={
                form.phone
              }
              onChange={
                onChange
              }
              placeholder="Phone Number"
              style={
                inputStyle
              }
            />

          </Field>

          <Field label="GST Number">

            <input
              name="gstNo"
              value={
                form.gstNo
              }
              onChange={
                onChange
              }
              placeholder="GST Number"
              style={
                inputStyle
              }
            />

          </Field>

          <Field label="Material Type">

            <input
              name="materialType"
              value={
                form.materialType
              }
              onChange={
                onChange
              }
              placeholder="Material Type"
              style={
                inputStyle
              }
            />

          </Field>

          <Field label="Quality Rating">

            <select
              name="qualityRating"
              value={
                form.qualityRating
              }
              onChange={
                onChange
              }
              style={
                inputStyle
              }
            >

              <option>
                A
              </option>

              <option>
                B
              </option>

              <option>
                C
              </option>

            </select>

          </Field>

          <Field label="Payment Terms">

            <textarea
              name="paymentTerms"
              value={
                form.paymentTerms
              }
              onChange={
                onChange
              }
              placeholder="Payment Terms"
              style={
                textareaStyle
              }
            />

          </Field>

          <Field label="Status">

            <select
              name="isActive"
              value={
                form.isActive
              }
              onChange={
                onChange
              }
              style={
                inputStyle
              }
            >

              <option value="TRUE">
                ACTIVE
              </option>

              <option value="FALSE">
                INACTIVE
              </option>

            </select>

          </Field>

          <Field label="Approval Status">

            <input
              value="Approved"
              readOnly
              style={
                readonlyStyle
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

              Save Supplier

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

      {/* GUIDELINES */}

      <div style={sectionCard}>

        <div style={sectionTitle}>

          Procurement Guidelines

        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(240px,1fr))",
            gap: 14,
          }}
        >

          <InfoCard
            title="Preferred Vendors"
            text="Focus on consistent material quality and reliable supply chain."
          />

          <InfoCard
            title="Quality Rating"
            text="A-grade suppliers should be prioritised for critical production."
          />

          <InfoCard
            title="Documentation"
            text="Ensure GST, invoice and supplier details are verified before onboarding."
          />

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

function InfoCard({
  title,
  text,
}) {

  return (

    <div
      style={{
        background:
          "#f8fafc",
        borderRadius: 10,
        padding: 16,
      }}
    >

      <div
        style={{
          fontWeight: 700,
          marginBottom: 8,
          color:
            "#005d34",
        }}
      >

        {title}

      </div>

      <div
        style={{
          color:
            "#475569",
          fontSize: 13,
          lineHeight: 1.6,
        }}
      >

        {text}

      </div>

    </div>

  );

}