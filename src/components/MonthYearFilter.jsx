import { input, regenTheme } from "../theme/regenTheme";

const MONTHS = [
  ["01", "Jan"],
  ["02", "Feb"],
  ["03", "Mar"],
  ["04", "Apr"],
  ["05", "May"],
  ["06", "Jun"],
  ["07", "Jul"],
  ["08", "Aug"],
  ["09", "Sep"],
  ["10", "Oct"],
  ["11", "Nov"],
  ["12", "Dec"],
];

export default function MonthYearFilter({
  month,
  year,
  onMonthChange,
  onYearChange,
  years = defaultYears(),
  label = "Period",
}) {
  return (
    <div style={wrap}>
      <div style={labelStyle}>{label}</div>

      <select
        value={month}
        onChange={(e) => onMonthChange?.(e.target.value)}
        style={selectStyle}
        aria-label={`${label} month`}
      >
        {MONTHS.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>

      <select
        value={year}
        onChange={(e) => onYearChange?.(e.target.value)}
        style={selectStyle}
        aria-label={`${label} year`}
      >
        {years.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
    </div>
  );
}

export function defaultYears() {
  const current = new Date().getFullYear();
  return [current - 1, current, current + 1].map(String);
}

const wrap = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
  background: "white",
  border: `1px solid ${regenTheme.colors.line}`,
  borderRadius: regenTheme.radius.md,
  padding: 8,
  boxShadow: regenTheme.shadow.soft,
};

const labelStyle = {
  color: regenTheme.colors.deepGreen,
  fontSize: 12,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: 0.4,
  padding: "0 4px",
};

const selectStyle = {
  ...input,
  width: 104,
  height: 38,
  fontWeight: 800,
};
