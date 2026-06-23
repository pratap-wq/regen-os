import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const menu = [
    {
      section: "Command Center",
      items: [
        { label: "CEO Dashboard", path: "/dashboard" },
        { label: "Factory Dashboard", path: "/production-control-center" },
        { label: "Procurement Dashboard", path: "/procurement-dashboard" },
        { label: "Inventory Dashboard", path: "/inventory-dashboard" },
      ],
    },

    {
      section: "Operations",
      items: [
        { label: "Production Entry", path: "/production" },
        { label: "Production History", path: "/production-history" },
        { label: "RM Inward", path: "/rm-inward" },
        { label: "Dispatch", path: "/dispatch" },
      ],
    },

    {
      section: "Inventory",
      items: [
        { label: "Live Inventory", path: "/live-inventory" },
        { label: "Live Stores", path: "/live-stores" },
      ],
    },

    {
      section: "Procurement",
      items: [
        { label: "Suppliers", path: "/suppliers" },
        { label: "RM List", path: "/rm-list" },
      ],
    },

    {
      section: "Stores",
      items: [
        { label: "Consumables", path: "/consumables" },
        { label: "Stores Inward", path: "/stores-inward" },
        { label: "Stores Issue", path: "/stores-issue" },
        { label: "Stores Costing", path: "/stores-costing" },
      ],
    },

    {
      section: "Management",
      items: [
        { label: "Monthly Audit", path: "/monthly-audit" },
        { label: "Factory Expenses", path: "/factory-expenses" },
        { label: "FG Rates", path: "/fg-rates" },
      ],
    },

    {
      section: "Administration",
      items: [
        { label: "Alert Center", path: "/alert-center" },
        { label: "Alert Settings", path: "/alert-settings" },
      ],
    },
  ];

  return (
    <div style={sidebar}>
      <div style={logoBlock}>
        <img src="/assets/regen-logo.png" alt="Regen" style={logo} />

        <div>
          <div style={brand}>Regen OS</div>
          <div style={tagline}>Manufacturing Intelligence</div>
        </div>
      </div>

      {menu.map((section, sectionIndex) => (
        <div key={sectionIndex} style={sectionBlock}>
          <div style={sectionTitle}>{section.section}</div>

          <div style={itemsBlock}>
            {section.items.map((item, itemIndex) => (
              <NavLink
                key={itemIndex}
                to={item.path}
                style={({ isActive }) => ({
                  ...navItem,
                  background: isActive
                    ? "rgba(255,255,255,0.18)"
                    : "transparent",
                  fontWeight: isActive ? 800 : 600,
                })}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      ))}

      <div style={footer}>
        RegenOS v3.1
        <br />
        Recycling Operations Platform
      </div>
    </div>
  );
}

const sidebar = {
  height: "100vh",
  width: "100%",
  overflowY: "auto",
  background: "#005d34",
  color: "white",
  padding: "16px 12px",
  boxSizing: "border-box",
};

const logoBlock = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 22,
  paddingBottom: 16,
  borderBottom: "1px solid rgba(255,255,255,0.14)",
};

const logo = {
  width: 46,
  height: 46,
  objectFit: "contain",
  background: "white",
  borderRadius: 10,
  padding: 4,
};

const brand = {
  fontSize: 21,
  fontWeight: 900,
  lineHeight: 1,
};

const tagline = {
  fontSize: 11,
  opacity: 0.8,
  marginTop: 4,
};

const sectionBlock = {
  marginBottom: 20,
};

const sectionTitle = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: 1,
  opacity: 0.65,
  marginBottom: 8,
  paddingLeft: 10,
};

const itemsBlock = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const navItem = {
  textDecoration: "none",
  color: "white",
  padding: "11px 12px",
  borderRadius: 9,
  fontSize: 14,
  transition: "0.2s",
};

const footer = {
  marginTop: 28,
  paddingTop: 16,
  borderTop: "1px solid rgba(255,255,255,0.14)",
  fontSize: 11,
  opacity: 0.7,
  lineHeight: 1.6,
};