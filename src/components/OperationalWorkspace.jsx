import { button, card, input, regenTheme } from "../theme/regenTheme";
import MonthYearFilter from "./MonthYearFilter";

export default function OperationalWorkspace({
  eyebrow = "Workspace",
  title,
  subtitle,
  month,
  year,
  search = "",
  onMonthChange,
  onYearChange,
  onSearchChange,
  onRefresh,
  snapshots = [],
  entryTitle = "Entry",
  children,
  historyTitle = "History",
  history,
}) {
  return (
    <div style={page}>
      <section style={hero}>
        <div>
          <div style={eyebrowStyle}>{eyebrow}</div>
          <h1 style={titleStyle}>{title}</h1>
          {subtitle && <div style={subtitleStyle}>{subtitle}</div>}
        </div>

        <div style={toolbar}>
          <MonthYearFilter
            month={month}
            year={year}
            onMonthChange={onMonthChange}
            onYearChange={onYearChange}
          />

          <input
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search or scan..."
            style={searchInput}
          />

          <button type="button" onClick={onRefresh} style={refreshButton}>
            Refresh
          </button>
        </div>
      </section>

      {snapshots.length > 0 && (
        <section style={snapshotGrid}>
          {snapshots.map((item) => (
            <div key={item.label} style={snapshotCard}>
              <div style={snapshotLabel}>{item.label}</div>
              <div style={{ ...snapshotValue, color: item.color || regenTheme.colors.deepGreen }}>
                {item.value}
              </div>
            </div>
          ))}
        </section>
      )}

      <section style={entryCard}>
        <h2 style={sectionTitle}>{entryTitle}</h2>
        {children}
      </section>

      <section style={historyCard}>
        <h2 style={sectionTitle}>{historyTitle}</h2>
        {history}
      </section>
    </div>
  );
}

const page = { display: "grid", gap: 18 };

const hero = {
  ...card,
  padding: 18,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 14,
  flexWrap: "wrap",
  background:
    "linear-gradient(135deg, rgba(0,93,52,0.96), rgba(0,178,107,0.9))",
  color: "white",
};

const eyebrowStyle = {
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: 1,
  textTransform: "uppercase",
  opacity: 0.86,
};

const titleStyle = {
  margin: "4px 0",
  fontSize: 32,
  fontWeight: 950,
  fontFamily: regenTheme.fonts.heading,
};

const subtitleStyle = {
  maxWidth: 760,
  opacity: 0.92,
};

const toolbar = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 10,
  flexWrap: "wrap",
};

const searchInput = {
  ...input,
  width: 220,
  height: 40,
};

const refreshButton = {
  ...button.secondary,
  background: "white",
  borderColor: "rgba(255,255,255,0.6)",
};

const snapshotGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
  gap: 12,
};

const snapshotCard = {
  ...card,
  padding: 16,
};

const snapshotLabel = {
  color: regenTheme.colors.slate,
  fontSize: 12,
  fontWeight: 850,
  textTransform: "uppercase",
  letterSpacing: 0.5,
};

const snapshotValue = {
  marginTop: 6,
  fontSize: 24,
  fontWeight: 950,
};

const entryCard = {
  ...card,
  padding: 18,
};

const historyCard = {
  ...card,
  padding: 0,
  overflow: "hidden",
};

const sectionTitle = {
  margin: "0 0 14px",
  color: regenTheme.colors.ink,
  fontWeight: 950,
};
