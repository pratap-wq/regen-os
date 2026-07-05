import { button, input, regenTheme } from "../theme/regenTheme";

export default function DateQuickFilters({
  fromDate = "",
  toDate = "",
  onChange,
}) {
  function setRange(nextFrom, nextTo) {
    onChange?.({
      fromDate: nextFrom,
      toDate: nextTo,
    });
  }

  function today() {
    const value = formatLocalDate(new Date());
    setRange(value, value);
  }

  function thisMonth() {
    const now = new Date();
    const start = formatLocalDate(new Date(now.getFullYear(), now.getMonth(), 1));
    const end = formatLocalDate(new Date(now.getFullYear(), now.getMonth() + 1, 0));
    setRange(start, end);
  }

  return (
    <div style={wrap}>
      <button type="button" onClick={today} style={quickButton}>
        Today
      </button>

      <button type="button" onClick={thisMonth} style={quickButton}>
        This Month
      </button>

      <input
        type="date"
        value={fromDate}
        onChange={(e) => setRange(e.target.value, toDate)}
        style={dateInput}
        title="From date"
      />

      <input
        type="date"
        value={toDate}
        onChange={(e) => setRange(fromDate, e.target.value)}
        style={dateInput}
        title="To date"
      />
    </div>
  );
}

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const wrap = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  alignItems: "center",
};

const quickButton = {
  ...button.secondary,
  minHeight: 38,
  padding: "8px 12px",
  background: "#f7fee7",
  borderColor: regenTheme.colors.lime,
};

const dateInput = {
  ...input,
  width: 150,
  height: 38,
};
