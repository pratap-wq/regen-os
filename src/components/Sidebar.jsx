import { NavLink } from "react-router-dom";
import LucideIcon from "./LucideIcon";
import { getMode, regenTheme } from "../theme/regenTheme";

export default function Sidebar({ mode = "light" }) {
  const m = getMode(mode);
  const menu = [
    {
      section: "Command",
      icon: "command",
      items: [
        { label: "Command Center", path: "/command-center", icon: "sparkles" },
        { label: "CEO Cockpit", path: "/dashboard", icon: "chart" },
        { label: "Factory Pulse", path: "/production-control-center", icon: "gauge" },
      ],
    },
    {
      section: "Production Workflow",
      icon: "factory",
      items: [
        { label: "Live Flow", path: "/production", icon: "activity" },
        { label: "RM Inward", path: "/rm-inward", icon: "package" },
        { label: "Color Sorter", path: "/color-sorter-batches", icon: "sparkles" },
        { label: "Extrusion", path: "/extrusion-batches", icon: "factory" },
        { label: "Dispatch", path: "/dispatch", icon: "truck" },
      ],
    },
    {
      section: "Inventory & Stores",
      icon: "boxes",
      items: [
        { label: "Stores Hub", path: "/stores-dashboard", icon: "boxes" },
        { label: "Stores Inward", path: "/stores-inward", icon: "package" },
        { label: "Stores Issue", path: "/stores-issue", icon: "truck" },
        { label: "Live Inventory", path: "/live-inventory", icon: "activity" },
      ],
    },
    {
      section: "Control Rooms",
      icon: "lock",
      items: [
        { label: "Month Close", path: "/monthly-close", icon: "lock" },
        { label: "Adjustments", path: "/inventory-adjustments", icon: "alert" },
        { label: "Cost Control", path: "/factory-cost-master", icon: "chart" },
        { label: "Factory Expenses", path: "/factory-expenses", icon: "package" },
      ],
    },
    {
      section: "Masters & Admin",
      icon: "settings",
      items: [
        { label: "Suppliers", path: "/suppliers", icon: "boxes" },
        { label: "RM List", path: "/rm-list", icon: "package" },
        { label: "FG Rates", path: "/fg-rates", icon: "chart" },
        { label: "Materials", path: "/production-materials", icon: "factory" },
        { label: "Alerts", path: "/alert-center", icon: "alert" },
      ],
    },
  ];

  return (
    <nav style={sidebar(m)}>
      <div style={logoBlock}>
        <img src="/assets/regen-logo.png" alt="Regen" style={logo} />

        <div>
          <div style={brand(m)}>RegenOS</div>
          <div style={tagline}>Super App</div>
        </div>
      </div>

      {menu.map((section) => (
        <div key={section.section} style={sectionBlock}>
          <div style={sectionTitle(m)}>
            <LucideIcon name={section.icon} size={13} />
            {section.section}
          </div>

          {section.items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                ...navItem(m),
                background: isActive ? m.elevated : "transparent",
                color: isActive ? regenTheme.colors.green : m.text,
                fontWeight: isActive ? 900 : 650,
                boxShadow: isActive ? regenTheme.shadow.soft : "none",
              })}
            >
              <LucideIcon name={item.icon} size={16} />
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

const sidebar = (m) => ({
  height: "100vh",
  width: "100%",
  overflowY: "auto",
  background:
    `linear-gradient(180deg, ${m.shell}, ${m.surface}), radial-gradient(circle at top, ${m.glow}, transparent 32%)`,
  color: m.text,
  padding: "18px 12px",
  boxSizing: "border-box",
  position: "relative",
  zIndex: 999,
  fontFamily: regenTheme.fonts.body,
  borderRight: `1px solid ${m.border}`,
  backdropFilter: "blur(24px)",
});

const logoBlock = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 22,
  paddingBottom: 16,
  borderBottom: "1px solid rgba(0, 178, 107, 0.16)",
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

const brand = (m) => ({
  fontSize: 21,
  fontWeight: 900,
  lineHeight: 1,
  fontFamily: regenTheme.fonts.heading,
  color: m.text,
});

const tagline = {
  fontSize: 11,
  opacity: 0.8,
  marginTop: 4,
  color: "#d9f99d",
};

const sectionBlock = {
  marginBottom: 20,
};

const sectionTitle = (m) => ({
  display: "flex",
  alignItems: "center",
  gap: 7,
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: 1,
  color: m.subtleText,
  marginBottom: 8,
  paddingLeft: 10,
  fontWeight: 900,
});

const navItem = (m) => ({
  display: "flex",
  alignItems: "center",
  gap: 9,
  textDecoration: "none",
  color: m.text,
  padding: "10px 12px",
  borderRadius: 12,
  fontSize: 14,
  cursor: "pointer",
  pointerEvents: "auto",
  marginBottom: 4,
  transition: "background 120ms ease, color 120ms ease, transform 120ms ease",
});

const footer = {
  marginTop: 28,
  paddingTop: 16,
  borderTop: "1px solid rgba(255,255,255,0.14)",
  fontSize: 11,
  opacity: 0.7,
  lineHeight: 1.6,
};
