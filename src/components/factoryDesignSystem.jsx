import "./factoryDesignSystem.css";
import FactoryDropdown from "./FactoryDropdown";

export function PageLayout({ title, subtitle, actions, children, className = "" }) {
  return (
    <main className={`factory-page ${className}`.trim()}>
      {(title || subtitle || actions) && (
        <header className="factory-page__header">
          <div>
            {title && <h1 className="factory-page__title">{title}</h1>}
            {subtitle && <div className="factory-page__subtitle">{subtitle}</div>}
          </div>
          {actions && <div className="factory-page__actions">{actions}</div>}
        </header>
      )}
      {children}
    </main>
  );
}

export function SectionCard({ title, subtitle, actions, children, className = "" }) {
  return (
    <section className={`factory-section-card ${className}`.trim()}>
      {(title || subtitle || actions) && (
        <div className="factory-section-card__header">
          <div>
            {title && <h2 className="factory-section-card__title">{title}</h2>}
            {subtitle && <div className="factory-section-card__subtitle">{subtitle}</div>}
          </div>
          {actions && <div className="factory-page__actions">{actions}</div>}
        </div>
      )}
      <div className="factory-section-card__body">{children}</div>
    </section>
  );
}

export function KpiCard({ title, value, helper, tone = "positive" }) {
  return (
    <article className={`factory-kpi-card factory-kpi-card--${tone}`}>
      <div className="factory-kpi-card__title">{title}</div>
      <div className="factory-kpi-card__value">{value}</div>
      {helper && <div className="factory-kpi-card__helper">{helper}</div>}
    </article>
  );
}

export function Toolbar({ left, right, children }) {
  return (
    <div className="factory-toolbar">
      <div className="factory-toolbar__group">{left || children}</div>
      {right && <div className="factory-toolbar__group">{right}</div>}
    </div>
  );
}

export function FactoryButton({ variant = "primary", className = "", ...props }) {
  return (
    <button
      type={props.type || "button"}
      className={`factory-button factory-button--${variant} ${className}`.trim()}
      {...props}
    />
  );
}

export function FactoryInput({ label, as = "input", className = "", ...props }) {
  const Component = as;
  const inputClass =
    as === "textarea"
      ? "factory-textarea"
      : as === "select"
      ? "factory-select"
      : "factory-input";

  return (
    <label className={`factory-field ${className}`.trim()}>
      {label && <span className="factory-field__label">{label}</span>}
      <Component className={inputClass} {...props} />
    </label>
  );
}

export function FactoryTable({ columns = [], rows = [], emptyMessage = "No records found" }) {
  return (
    <div className="factory-table-wrap">
      <table className="factory-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key || column.label}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length || 1} className="factory-table__empty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr key={row.id || row.key || rowIndex}>
                {columns.map((column) => (
                  <td key={column.key || column.label}>
                    {column.render ? column.render(row, rowIndex) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function HistoryPanel({
  title = "History",
  subtitle,
  actions,
  columns = [],
  rows = [],
  emptyMessage,
}) {
  return (
    <SectionCard title={title} subtitle={subtitle} actions={actions}>
      <FactoryTable columns={columns} rows={rows} emptyMessage={emptyMessage} />
    </SectionCard>
  );
}

export function SummaryPanel({ items = [], children }) {
  return (
    <div className="factory-summary-panel">
      {items.map((item) => (
        <div key={item.label} className="factory-summary-panel__item">
          <div className="factory-summary-panel__label">{item.label}</div>
          <div className="factory-summary-panel__value">{item.value}</div>
          {item.helper && <div className="factory-kpi-card__helper">{item.helper}</div>}
        </div>
      ))}
      {children}
    </div>
  );
}

export function EditableGrid({
  columns = [],
  rows = [],
  onRowsChange,
  createRow,
  addLabel = "Add Row",
  deleteLabel = "Delete",
}) {
  function updateCell(rowIndex, key, value) {
    const next = rows.map((row, index) =>
      index === rowIndex ? { ...row, [key]: value } : row
    );
    onRowsChange?.(next);
  }

  function addRow() {
    onRowsChange?.([...(rows || []), createRow ? createRow() : {}]);
  }

  function deleteRow(rowIndex) {
    onRowsChange?.(rows.filter((_, index) => index !== rowIndex));
  }

  function focusCell(current, direction) {
    const cells = Array.from(
      current.currentTarget
        .closest(".factory-table-wrap")
        ?.querySelectorAll("[data-grid-cell]") || []
    );
    const index = cells.indexOf(current.target);
    const next = cells[index + direction];
    if (next) next.focus();
  }

  function onKeyDown(e) {
    if (e.key !== "Tab" && e.key !== "Enter") return;
    e.preventDefault();
    focusCell(e, e.shiftKey ? -1 : 1);
  }

  function onPaste(e, rowIndex, columnIndex) {
    const text = e.clipboardData?.getData("text/plain") || "";
    if (!text.includes("\t") && !text.includes("\n")) return;

    e.preventDefault();

    const matrix = text
      .trimEnd()
      .split(/\r?\n/)
      .map((line) => line.split("\t"));

    const next = [...rows];
    matrix.forEach((line, rOffset) => {
      const targetIndex = rowIndex + rOffset;
      if (!next[targetIndex]) next[targetIndex] = createRow ? createRow() : {};

      line.forEach((value, cOffset) => {
        const column = columns[columnIndex + cOffset];
        if (!column || column.readOnly) return;
        next[targetIndex] = {
          ...next[targetIndex],
          [column.key]: value,
        };
      });
    });

    onRowsChange?.(next);
  }

  function totalFor(column) {
    if (!column.total && column.type !== "number") return "";
    return rows
      .reduce((sum, row) => sum + Number(row[column.key] || 0), 0)
      .toFixed(column.decimals ?? 2);
  }

  return (
    <div>
      <div className="factory-editable-grid__actions">
        <FactoryButton variant="secondary" onClick={addRow}>
          + {addLabel}
        </FactoryButton>
      </div>
      <div className="factory-table-wrap">
        <table className="factory-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(rows || []).map((row, rowIndex) => (
              <tr key={row.id || rowIndex}>
                {columns.map((column, columnIndex) => (
                  <td key={column.key}>
                    {column.render ? (
                      column.render(row, rowIndex, updateCell)
                    ) : (
                      <input
                        data-grid-cell
                        className="factory-editable-grid__cell-input"
                        type={column.type || "text"}
                        value={row[column.key] || ""}
                        readOnly={column.readOnly}
                        onChange={(e) => updateCell(rowIndex, column.key, e.target.value)}
                        onKeyDown={onKeyDown}
                        onPaste={(e) => onPaste(e, rowIndex, columnIndex)}
                      />
                    )}
                  </td>
                ))}
                <td>
                  <FactoryButton variant="danger" onClick={() => deleteRow(rowIndex)}>
                    {deleteLabel}
                  </FactoryButton>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="factory-editable-grid__totals">
              {columns.map((column, index) => (
                <td key={column.key}>{index === 0 ? "Totals" : totalFor(column)}</td>
              ))}
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export { FactoryDropdown };
