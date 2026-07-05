import { NavLink } from "react-router-dom";
import { regenTheme } from "../theme/regenTheme";

export default function Sidebar() {
  const menu = [
    {
      section: "Dashboards",
      items: [
        { label: "CEO Dashboard", path: "/dashboard" },
        { label: "Factory Dashboard", path: "/production-control-center" },
        { label: "Procurement Dashboard", path: "/procurement-dashboard" },
        { label: "Inventory Dashboard", path: "/inventory-dashboard" },
        { label: "Stores Dashboard", path: "/stores-dashboard" },
        { label: "Live Stores", path: "/live-stores" },
      ],
    },
    {
      section: "Operations",
      items: [
        { label: "Production Entry", path: "/production" },
        { label: "Production History", path: "/production-history" },
        { label: "Traceability", path: "/traceability" },
        { label: "Quality", path: "/quality" },
        { label: "RM Inward", path: "/rm-inward" },
        { label: "Dispatch", path: "/dispatch" },
      ],
    },
    {
      section: "Stores",
      items: [
        { label: "Consumables", path: "/consumables" },
        { label: "Stores Inward", path: "/stores-inward" },
        { label: "Stores Issue", path: "/stores-issue" },
      ],
    },
    {
      section: "RM / Procurement",
      items: [
        { label: "Suppliers", path: "/suppliers" },
        { label: "RM List", path: "/rm-list" },
        { label: "Live Inventory", path: "/live-inventory" },
      ],
    },
   {
  section: "Management",
  items: [
    { label: "Monthly Close", path: "/monthly-close" },
    { label: "Inventory Adjustments", path: "/inventory-adjustments" },
    { label: "Factory Expenses", path: "/factory-expenses" },
    { label: "FG Rates", path: "/fg-rates" },
    { label: "Production Materials", path: "/production-materials" },
    { label: "Factory Cost Master", path: "/factory-cost-master" },
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
    <nav style={sidebar}>
      <div style={logoBlock}>
        <img src="/assets/regen-logo.png" alt="Regen" style={logo} />

        <div>
          <div style={brand}>Regen OS</div>
          <div style={tagline}>Manufacturing Intelligence</div>
        </div>
      </div>

      {menu.map((section) => (
        <div key={section.section} style={sectionBlock}>
          <div style={sectionTitle}>{section.section}</div>

          {section.items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                ...navItem,
                background: isActive ? "white" : "transparent",
                color: isActive ? regenTheme.colors.deepGreen : "white",
                fontWeight: isActive ? 900 : 650,
                boxShadow: isActive ? "0 8px 20px rgba(0,0,0,0.16)" : "none",
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      ))}

      <div style={footer}>
        RegenOS v1.0 RC1
        <br />
        Factory testing build
      </div>
    </nav>
  );
}

const sidebar = {
  height: "100vh",
  width: "100%",
  overflowY: "auto",
  background: `linear-gradient(180deg, ${regenTheme.colors.deepGreen}, #033f26)`,
  color: "white",
  padding: "18px 12px",
  boxSizing: "border-box",
  position: "relative",
  zIndex: 999,
  fontFamily: regenTheme.fonts.body,
};

const logoBlock = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 22,
  paddingBottom: 16,
  borderBottom: "1px solid rgba(255,255,255,0.16)",
};

const logo = {
  width: 46,
  height: 46,
  objectFit: "contain",
  background: "white",
  borderRadius: 14,
  padding: 4,
  boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
};

const brand = {
  fontSize: 21,
  fontWeight: 900,
  lineHeight: 1,
  fontFamily: regenTheme.fonts.heading,
};

const tagline = {
  fontSize: 11,
  opacity: 0.8,
  marginTop: 4,
  color: "#d9f99d",
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
  fontWeight: 900,
};

const navItem = {
  display: "block",
  textDecoration: "none",
  color: "white",
  padding: "10px 12px",
  borderRadius: 12,
  fontSize: 14,
  cursor: "pointer",
  pointerEvents: "auto",
  marginBottom: 4,
  transition: "background 120ms ease, color 120ms ease, transform 120ms ease",
};

const footer = {
  marginTop: 28,
  paddingTop: 16,
  borderTop: "1px solid rgba(255,255,255,0.14)",
  fontSize: 11,
  opacity: 0.7,
  lineHeight: 1.6,
};
