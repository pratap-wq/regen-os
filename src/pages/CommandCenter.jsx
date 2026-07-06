import { Link } from "react-router-dom";
import LucideIcon from "../components/LucideIcon";
import { getMode, regenTheme } from "../theme/regenTheme";

const workflowStages = [
  { label: "Material Receiving", detail: "Receive, inspect, supplier trace", path: "/material-receiving", icon: "package" },
  { label: "Wash", detail: "Record input, output, loss", path: "/production", icon: "activity" },
  { label: "Color Sorter", detail: "Optional sorting flow", path: "/color-sorter-batches", icon: "sparkles" },
  { label: "Extrusion", detail: "Material output and wastage", path: "/extrusion-batches", icon: "factory" },
  { label: "Dispatch", detail: "Ship finished goods", path: "/dispatch", icon: "truck" },
  { label: "Month Close Control Room", detail: "Reconcile kg and rupees", path: "/monthly-close", icon: "lock" },
];

const commandCards = [
  {
    title: "Production Flow",
    subtitle: "One line view from material receiving to dispatch.",
    path: "/production-control-center",
    icon: "factory",
    accent: regenTheme.colors.green,
  },
  {
    title: "Stores Hub",
    subtitle: "Receive, issue and control consumables.",
    path: "/stores-dashboard",
    icon: "boxes",
    accent: regenTheme.colors.lime,
  },
  {
    title: "CEO Cockpit",
    subtitle: "Live production, inventory and profitability dashboards.",
    path: "/dashboard",
    icon: "chart",
    accent: "#38bdf8",
  },
  {
    title: "Exceptions",
    subtitle: "Alerts, risks and next actions needing attention.",
    path: "/alert-center",
    icon: "alert",
    accent: "#f97316",
  },
];

const focusTasks = [
  { title: "Record current shift production", path: "/production-control-center", icon: "gauge" },
  { title: "Issue stores item", path: "/stores-issue", icon: "boxes" },
  { title: "Check inventory position", path: "/live-inventory", icon: "package" },
  { title: "Review month close readiness", path: "/monthly-close", icon: "lock" },
];

export default function CommandCenter({ mode = "light", presentationMode = false }) {
  const m = getMode(mode);

  return (
    <div className="regen-animate-in presentation-scale" style={pageStyle(m)}>
      <section style={heroStyle(m)}>
        <div style={heroCopy}>
          <div style={eyebrow(m)}>
            <LucideIcon name="command" size={16} />
            Manufacturing Super App
          </div>

          <h1 style={heroTitle(m)}>
            Run the factory from one beautiful workflow.
          </h1>

          <p style={heroText(m)}>
            RegenOS guides production, stores, dispatch, costs and month close from the same command surface.
            Operators see the next task. Leaders see the factory pulse.
          </p>

          <div style={heroActions}>
            <Link to="/production-control-center" style={primaryAction}>
              Start Production Control
            </Link>

            <Link to="/dashboard" style={secondaryAction(m)}>
              Open CEO Cockpit
            </Link>
          </div>
        </div>

        <div className="regen-float" style={livePanel(m)}>
          <div style={panelTop}>
            <span style={liveDot}></span>
            Live Workflow
          </div>

          {workflowStages.slice(0, 5).map((stage, index) => (
            <Link key={stage.label} to={stage.path} style={stageRow(m, index)}>
              <span style={stageIcon(stage)}>
                <LucideIcon name={stage.icon} size={18} />
              </span>
              <span>
                <b>{stage.label}</b>
                <small>{stage.detail}</small>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section style={kpiGrid}>
        {commandCards.map((card, index) => (
          <Link
            key={card.title}
            to={card.path}
            className="regen-animate-in"
            style={{ ...commandCard(m, card), animationDelay: `${index * 70}ms` }}
          >
            <span style={commandIcon(card)}>
              <LucideIcon name={card.icon} size={22} />
            </span>
            <span style={cardText}>
              <strong>{card.title}</strong>
              <small>{card.subtitle}</small>
            </span>
          </Link>
        ))}
      </section>

      <section style={splitGrid}>
        <div style={glassCard(m)}>
          <div style={sectionHeader(m)}>
            <span>
              <LucideIcon name="activity" size={18} />
              30-second tasks
            </span>
            <small>Workflow-first</small>
          </div>

          {focusTasks.map((task) => (
            <Link key={task.title} to={task.path} style={taskRow(m)}>
              <span style={taskIcon(m)}>
                <LucideIcon name={task.icon} size={17} />
              </span>
              {task.title}
              <span style={arrow(m)}>→</span>
            </Link>
          ))}
        </div>

        <div style={glassCard(m)}>
          <div style={sectionHeader(m)}>
            <span>
              <LucideIcon name="sparkles" size={18} />
              Investor Presentation Mode
            </span>
            <small>{presentationMode ? "On" : "Ready"}</small>
          </div>

          <div style={presentationCard(m)}>
            <div style={bigMetric(m)}>RC1</div>
            <p>
              Premium view for walkthroughs: larger spacing, softer motion and boardroom-ready workflow storytelling.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

const pageStyle = (m) => ({
  color: m.text,
  display: "grid",
  gap: 18,
});

const heroStyle = (m) => ({
  display: "grid",
  gridTemplateColumns: "minmax(280px, 1.25fr) minmax(280px, 0.75fr)",
  gap: 18,
  alignItems: "stretch",
  padding: 24,
  borderRadius: 30,
  border: `1px solid ${m.border}`,
  background:
    `radial-gradient(circle at 15% 15%, ${m.glow}, transparent 32%), linear-gradient(135deg, ${m.surface}, ${m.shell})`,
  boxShadow: regenTheme.shadow.premium,
  backdropFilter: "blur(22px)",
});

const heroCopy = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  minHeight: 320,
};

const eyebrow = (m) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  alignSelf: "flex-start",
  padding: "8px 12px",
  borderRadius: 999,
  background: m.elevated,
  border: `1px solid ${m.border}`,
  color: regenTheme.colors.green,
  fontWeight: 900,
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 0.6,
});

const heroTitle = (m) => ({
  margin: "18px 0 12px",
  maxWidth: 820,
  color: m.text,
  fontFamily: regenTheme.fonts.heading,
  fontSize: "clamp(34px, 4.2vw, 64px)",
  lineHeight: 0.96,
  letterSpacing: "-0.06em",
});

const heroText = (m) => ({
  margin: 0,
  maxWidth: 680,
  color: m.subtleText,
  fontSize: 17,
  lineHeight: 1.65,
});

const heroActions = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  marginTop: 26,
};

const primaryAction = {
  textDecoration: "none",
  color: "white",
  background: `linear-gradient(135deg, ${regenTheme.colors.deepGreen}, ${regenTheme.colors.green})`,
  padding: "13px 18px",
  borderRadius: 14,
  fontWeight: 900,
  boxShadow: "0 16px 34px rgba(0, 93, 52, 0.24)",
};

const secondaryAction = (m) => ({
  textDecoration: "none",
  color: m.text,
  background: m.elevated,
  border: `1px solid ${m.border}`,
  padding: "13px 18px",
  borderRadius: 14,
  fontWeight: 900,
});

const livePanel = (m) => ({
  padding: 16,
  borderRadius: 24,
  border: `1px solid ${m.border}`,
  background: m.elevated,
  boxShadow: regenTheme.shadow.soft,
  alignSelf: "center",
});

const panelTop = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginBottom: 12,
  fontWeight: 950,
};

const liveDot = {
  width: 10,
  height: 10,
  borderRadius: 999,
  background: regenTheme.colors.green,
  boxShadow: "0 0 0 6px rgba(0, 178, 107, 0.14)",
};

const stageRow = (m, index) => ({
  display: "flex",
  alignItems: "center",
  gap: 12,
  textDecoration: "none",
  color: m.text,
  padding: "12px 10px",
  borderRadius: 16,
  background: index === 0 ? `linear-gradient(135deg, ${m.shell}, transparent)` : "transparent",
});

const stageIcon = (stage) => ({
  width: 38,
  height: 38,
  borderRadius: 14,
  display: "grid",
  placeItems: "center",
  color: "white",
  background: stage.label === "Month Close Control Room" ? regenTheme.colors.black : regenTheme.colors.deepGreen,
});

const kpiGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 14,
};

const commandCard = (m, card) => ({
  display: "flex",
  gap: 14,
  alignItems: "center",
  padding: 18,
  borderRadius: 22,
  border: `1px solid ${m.border}`,
  background: m.surface,
  color: m.text,
  textDecoration: "none",
  boxShadow: regenTheme.shadow.soft,
  backdropFilter: "blur(18px)",
  borderTop: `3px solid ${card.accent}`,
});

const commandIcon = (card) => ({
  width: 48,
  height: 48,
  borderRadius: 18,
  display: "grid",
  placeItems: "center",
  color: "white",
  background: `linear-gradient(135deg, ${card.accent}, ${regenTheme.colors.deepGreen})`,
});

const cardText = {
  display: "grid",
  gap: 4,
};

const splitGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: 16,
};

const glassCard = (m) => ({
  padding: 18,
  borderRadius: 24,
  border: `1px solid ${m.border}`,
  background: m.surface,
  boxShadow: regenTheme.shadow.soft,
  backdropFilter: "blur(18px)",
});

const sectionHeader = (m) => ({
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 12,
  color: m.text,
  fontWeight: 950,
});

const taskRow = (m) => ({
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "12px 10px",
  color: m.text,
  textDecoration: "none",
  borderRadius: 16,
});

const taskIcon = (m) => ({
  width: 34,
  height: 34,
  borderRadius: 12,
  display: "grid",
  placeItems: "center",
  color: regenTheme.colors.green,
  background: m.elevated,
});

const arrow = (m) => ({
  marginLeft: "auto",
  color: m.subtleText,
});

const presentationCard = (m) => ({
  padding: 18,
  borderRadius: 20,
  background: `linear-gradient(135deg, ${m.elevated}, transparent)`,
  color: m.subtleText,
});

const bigMetric = (m) => ({
  color: m.text,
  fontSize: 54,
  fontWeight: 950,
  letterSpacing: "-0.08em",
});
