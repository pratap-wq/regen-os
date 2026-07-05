import { button, card, input, regenTheme } from "../theme/regenTheme";

export const pageStyle = {
  padding: 18,
  background: regenTheme.colors.page,
  fontFamily: regenTheme.fonts.body,
};

export const sectionCard = {
  ...card,
  padding: 18,
  marginBottom: 18,
};

export const sectionTitle = {
  fontSize: 19,
  fontWeight: 900,
  marginBottom: 14,
  color: regenTheme.colors.deepGreen,
  fontFamily: regenTheme.fonts.heading,
};

export const formGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))",
  gap: 14,
};

export const inputStyle = input;

export const textareaStyle = {
  ...input,
  height: 76,
  resize: "vertical",
  paddingTop: 10,
};

export const readonlyStyle = {
  ...input,
  background: regenTheme.colors.muted,
  color: regenTheme.colors.ink,
  fontWeight: 800,
};

export const primaryButton = button.primary;

export const warningButton = {
  ...button.primary,
  background: regenTheme.colors.warning,
  boxShadow: "none",
};

export const dangerButton = button.danger;

export const editButton = {
  ...button.secondary,
  background: "#ecfdf5",
};

export const tableCard = {
  ...card,
  overflowX: "auto",
};

export const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

export const thStyle = {
  background: regenTheme.colors.deepGreen,
  color: "white",
  padding: "11px 12px",
  textAlign: "left",
  fontSize: 12,
  letterSpacing: 0.2,
};

export const tdStyle = {
  padding: "10px 12px",
  borderBottom: `1px solid ${regenTheme.colors.line}`,
  fontSize: 13,
  color: regenTheme.colors.ink,
};

export const badge = (color) => ({
  background: color,
  color: "white",
  borderRadius: 999,
  padding: "4px 10px",
  fontSize: 11,
  fontWeight: 800,
});
