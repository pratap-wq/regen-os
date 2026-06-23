export const pageStyle = {
  padding: 16,
};

export const sectionCard = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 16,
  marginBottom: 16,
};

export const sectionTitle = {
  fontSize: 18,
  fontWeight: 700,
  marginBottom: 14,
  color: "#0f172a",
};

export const formGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(180px,1fr))",
  gap: 12,
};

export const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  height: 38,
  borderRadius: 6,
  border: "1px solid #cbd5e1",
  fontSize: 13,
  boxSizing: "border-box",
  background: "white",
};

export const textareaStyle = {
  ...inputStyle,
  height: 70,
  resize: "vertical",
  paddingTop: 10,
};

export const readonlyStyle = {
  ...inputStyle,
  background: "#f8fafc",
  color: "#475569",
  fontWeight: 600,
};

export const primaryButton = {
  background: "#005d34",
  color: "white",
  border: "none",
  borderRadius: 8,
  padding: "10px 16px",
  fontWeight: 600,
  cursor: "pointer",
  height: 40,
};

export const warningButton = {
  background: "#ea580c",
  color: "white",
  border: "none",
  borderRadius: 8,
  padding: "10px 16px",
  fontWeight: 600,
  cursor: "pointer",
  height: 40,
};

export const dangerButton = {
  background: "#dc2626",
  color: "white",
  border: "none",
  borderRadius: 8,
  padding: "8px 12px",
  fontWeight: 600,
  cursor: "pointer",
};

export const editButton = {
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 8,
  padding: "8px 12px",
  fontWeight: 600,
  cursor: "pointer",
};

export const tableCard = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  overflowX: "auto",
};

export const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

export const thStyle = {
  background: "#005d34",
  color: "white",
  padding: "10px 12px",
  textAlign: "left",
  fontSize: 12,
};

export const tdStyle = {
  padding: "10px 12px",
  borderBottom: "1px solid #e5e7eb",
  fontSize: 13,
};

export const badge = (color) => ({
  background: color,
  color: "white",
  borderRadius: 999,
  padding: "4px 10px",
  fontSize: 11,
  fontWeight: 700,
});