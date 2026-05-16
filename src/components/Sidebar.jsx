import { Link } from "react-router-dom";

export default function Sidebar() {
  const menu = [
    { label: "Dashboard", path: "/" },
    { label: "Live Inventory", path: "/live-inventory" },
    { label: "RM Inward", path: "/rm-inward" },
    { label: "RM List", path: "/rm-list" },
    { label: "Supplier Entry", path: "/supplier-entry" },
    { label: "Suppliers", path: "/suppliers" },
    { label: "Stores Inward", path: "/stores-inward" },
    { label: "Stores Issue", path: "/stores-issue" },
    { label: "Wash Batches", path: "/wash-batches" },
    { label: "Extrusion Batches", path: "/extrusion-batches" },
    { label: "Dispatch", path: "/dispatch" },
    { label: "FG Rates", path: "/fg-rates" },
    { label: "Consumables", path: "/consumables" },
    { label: "Factory Expenses", path: "/factory-expenses" },
    { label: "Monthly Audit", path: "/monthly-audit" },
  ];

  return (
    <div
      style={{
        width: 240,
        background: "#0f172a",
        color: "white",
        padding: 20,
        minHeight: "100vh",
      }}
    >
      <h2 style={{ marginBottom: 30 }}>
        Regen OS
      </h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {menu.map((m, i) => (
          <Link
            key={i}
            to={m.path}
            style={{
              color: "white",
              textDecoration: "none",
              padding: 12,
              borderRadius: 8,
              background: "#1e293b",
              fontWeight: 500,
            }}
          >
            {m.label}
          </Link>
        ))}
      </div>
    </div>
  );
}