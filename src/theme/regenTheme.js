export const regenTheme = {
  colors: {
    lime: "#a6ce39",
    green: "#00b26b",
    deepGreen: "#005d34",
    black: "#231f20",
    ink: "#123026",
    slate: "#64748b",
    muted: "#f4f8f1",
    page: "#f7faf5",
    card: "#ffffff",
    line: "#dbe7d4",
    danger: "#dc2626",
    warning: "#d97706",
    info: "#2563eb",
    success: "#15803d",
  },
  modes: {
    light: {
      page: "#f7faf5",
      shell: "rgba(255, 255, 255, 0.78)",
      surface: "rgba(255, 255, 255, 0.9)",
      elevated: "#ffffff",
      text: "#123026",
      subtleText: "#64748b",
      border: "rgba(0, 93, 52, 0.14)",
      glow: "rgba(0, 178, 107, 0.24)",
    },
    dark: {
      page: "#06140f",
      shell: "rgba(10, 31, 23, 0.76)",
      surface: "rgba(12, 39, 29, 0.82)",
      elevated: "#0f2a20",
      text: "#eefbf3",
      subtleText: "#a7c7b6",
      border: "rgba(166, 206, 57, 0.2)",
      glow: "rgba(166, 206, 57, 0.18)",
    },
  },
  fonts: {
    body:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Arial, sans-serif",
    heading:
      "Montserrat, Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Arial, sans-serif",
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 18,
    pill: 999,
  },
  shadow: {
    card: "0 10px 28px rgba(0, 93, 52, 0.08)",
    soft: "0 6px 18px rgba(15, 35, 30, 0.06)",
    premium: "0 24px 80px rgba(0, 93, 52, 0.16)",
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 22,
    xl: 30,
  },
};

export function getMode(mode = "light") {
  return regenTheme.modes[mode] || regenTheme.modes.light;
}

export const card = {
  background: regenTheme.colors.card,
  border: `1px solid ${regenTheme.colors.line}`,
  borderRadius: regenTheme.radius.lg,
  boxShadow: regenTheme.shadow.card,
};

export const input = {
  width: "100%",
  height: 42,
  padding: "0 12px",
  borderRadius: regenTheme.radius.sm,
  border: `1px solid ${regenTheme.colors.line}`,
  fontSize: 14,
  boxSizing: "border-box",
  background: "white",
  color: regenTheme.colors.black,
  fontFamily: regenTheme.fonts.body,
};

export const button = {
  primary: {
    background: `linear-gradient(135deg, ${regenTheme.colors.deepGreen}, ${regenTheme.colors.green})`,
    color: "white",
    border: "none",
    borderRadius: regenTheme.radius.sm,
    padding: "11px 16px",
    fontWeight: 850,
    cursor: "pointer",
    minHeight: 42,
    boxShadow: "0 8px 18px rgba(0, 93, 52, 0.2)",
    fontFamily: regenTheme.fonts.body,
  },
  secondary: {
    background: "#ecfdf5",
    color: regenTheme.colors.deepGreen,
    border: `1px solid ${regenTheme.colors.green}`,
    borderRadius: regenTheme.radius.sm,
    padding: "10px 14px",
    fontWeight: 800,
    cursor: "pointer",
    minHeight: 40,
    fontFamily: regenTheme.fonts.body,
  },
  danger: {
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    borderRadius: regenTheme.radius.sm,
    padding: "8px 12px",
    fontWeight: 800,
    cursor: "pointer",
    fontFamily: regenTheme.fonts.body,
  },
};

export const statusPill = (tone = "success") => {
  const tones = {
    success: ["#dcfce7", "#166534"],
    warning: ["#fef3c7", "#92400e"],
    danger: ["#fee2e2", "#991b1b"],
    info: ["#dbeafe", "#1d4ed8"],
    neutral: ["#f1f5f9", "#475569"],
  };
  const [background, color] = tones[tone] || tones.neutral;

  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background,
    color,
    borderRadius: regenTheme.radius.pill,
    padding: "5px 10px",
    fontSize: 12,
    fontWeight: 850,
    whiteSpace: "nowrap",
  };
};
