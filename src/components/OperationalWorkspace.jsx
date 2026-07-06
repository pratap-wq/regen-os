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
      <div style={header}>
        <div>
          <div style={eyebrowStyle}>{eyebrow}</div>
          <h1 style={titleStyle}>{title}</h1>
          {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
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
            placeholder="Search"
            style={searchInput}
          />

          <button type="button" onClick={onRefresh} style={refreshButton}>
            Refresh
          </button>
        </div>
      </div>

      {snapshots.length > 0 && (
        <div style={snapshotGrid}>
          {snapshots.map((item) => (
            <div key={item.label} style={snapshotCard}>
              <div style={snapshotLabel}>{item.label}</div>
              <div style={{ ...snapshotValue, color: item.color || "#0f766e" }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={card}>
        <h2 style={sectionTitle}>{entryTitle}</h2>
        {children}
      </div>

      <div style={historyCard}>
        <h2 style={sectionTitle}>{historyTitle}</h2>
        {history}
      </div>
    </div>
  );
}

const page = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  alignItems: "flex-start",
  flexWrap: "wrap",
};

const eyebrowStyle = {
  color: "#64748b",
  fontSize: 12,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: 0.6,
};

const titleStyle = {
  margin: "4px 0",
  color: "#0f172a",
  fontSize: 28,
  fontWeight: 900,
};

const subtitleStyle = {
  margin: "4px 0 0",
  color: "#64748b",
  fontSize: 14,
  maxWidth: 780,
};

const toolbar = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 10,
  flexWrap: "wrap",
};

const searchInput = {
  height: 40,
  border: "1px solid #cbd5e1",
  borderRadius: 9,
  padding: "0 10px",
  fontSize: 14,
  width: 220,
};

const refreshButton = {
  height: 40,
  border: "1px solid #cbd5e1",
  borderRadius: 9,
  background: "white",
  color: "#0f172a",
  padding: "0 14px",
  fontWeight: 800,
  cursor: "pointer",
};

const snapshotGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
  gap: 12,
};

const snapshotCard = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 16,
  boxShadow: "0 6px 18px rgba(15,23,42,0.04)",
};

const snapshotLabel = {
  color: "#64748b",
  fontSize: 12,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: 0.5,
};

const snapshotValue = {
  marginTop: 6,
  fontSize: 24,
  fontWeight: 900,
};

const card = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  boxShadow: "0 6px 18px rgba(15,23,42,0.04)",
};

const historyCard = {
  ...card,
  padding: 0,
  overflow: "hidden",
};

const sectionTitle = {
  margin: "0 0 14px",
  color: "#0f172a",
  fontSize: 18,
  fontWeight: 900,
};
