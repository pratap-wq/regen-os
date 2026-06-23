import { useState } from "react";

export default function FormSection({
  title,
  children,
  defaultOpen = true,
}) {

  const [open, setOpen] =
    useState(defaultOpen);

  return (

    <div style={cardStyle}>

      <div
        style={headerStyle}
        onClick={() =>
          setOpen(!open)
        }
      >

        <div style={titleStyle}>
          {title}
        </div>

        <div style={iconStyle}>
          {open ? "−" : "+"}
        </div>

      </div>

      {open && (

        <div style={bodyStyle}>
          {children}
        </div>

      )}

    </div>

  );

}

const cardStyle = {
  background: "white",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  marginBottom: 16,
  overflow: "hidden",
};

const headerStyle = {
  background: "#ecfdf5",
  padding: "14px 16px",
  cursor: "pointer",
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
};

const titleStyle = {
  fontWeight: 700,
  color: "#065f46",
  fontSize: 15,
};

const iconStyle = {
  fontSize: 20,
  fontWeight: 700,
  color: "#065f46",
};

const bodyStyle = {
  padding: 16,
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",
  gap: 14,
};