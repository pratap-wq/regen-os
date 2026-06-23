export default function EditModal({
  title = "Edit",
  fields = [],
  values = {},
  onChange,
  onSave,
  onCancel,
  saving = false,
}) {
  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2 style={titleStyle}>
          {title}
        </h2>

        <div style={formStyle}>
          {fields.map((f) => {
            return (
              <div key={f.key}>
                <label style={labelStyle}>
                  {f.label}
                </label>

                {f.type === "textarea" ? (
                  <textarea
                    name={f.key}
                    value={values[f.key] || ""}
                    onChange={onChange}
                    style={textareaStyle}
                  />
                ) : f.type === "select" ? (
                  <select
                    name={f.key}
                    value={values[f.key] || ""}
                    onChange={onChange}
                    style={inputStyle}
                  >
                    <option value="">
                      Select {f.label}
                    </option>

                    {(f.options || []).map(
                      (option, i) => (
                        <option
                          key={i}
                          value={option}
                        >
                          {option}
                        </option>
                      )
                    )}
                  </select>
                ) : (
                  <input
                    name={f.key}
                    value={values[f.key] || ""}
                    onChange={onChange}
                    style={inputStyle}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div style={buttonRowStyle}>
          <button
            onClick={onCancel}
            style={cancelStyle}
          >
            Cancel
          </button>

          <button
            onClick={onSave}
            disabled={saving}
            style={saveStyle}
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background:
    "rgba(0,0,0,0.45)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const modalStyle = {
  background: "white",
  padding: 24,
  borderRadius: 12,
  width: 800,
  maxWidth: "95vw",
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow:
    "0 10px 30px rgba(0,0,0,0.15)",
};

const titleStyle = {
  marginTop: 0,
  marginBottom: 20,
  color: "#0f766e",
};

const formStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(250px,1fr))",
  gap: 14,
};

const labelStyle = {
  display: "block",
  marginBottom: 6,
  fontSize: 12,
  fontWeight: 700,
  color: "#334155",
};

const inputStyle = {
  width: "100%",
  height: 40,
  padding: "0 12px",
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  boxSizing: "border-box",
};

const textareaStyle = {
  width: "100%",
  minHeight: 100,
  padding: 12,
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  boxSizing: "border-box",
};

const buttonRowStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  marginTop: 24,
};

const cancelStyle = {
  background: "#64748b",
  color: "white",
  border: "none",
  padding: "10px 18px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
};

const saveStyle = {
  background: "#0f766e",
  color: "white",
  border: "none",
  padding: "10px 18px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 600,
};