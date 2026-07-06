import { useState } from "react";
import "./factoryDesignSystem.css";

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
  borderRadius: 16,
  border: "1px solid #e2e8f0",
  marginBottom: 18,
  overflow: "hidden",
  boxShadow: "0 5px 18px rgba(15, 23, 42, 0.055)",
};

const headerStyle = {
  background: "#fbfefc",
  padding: "14px 16px",
  cursor: "pointer",
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
};

const titleStyle = {
  fontWeight: 850,
  color: "#005d34",
  fontSize: 16,
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
