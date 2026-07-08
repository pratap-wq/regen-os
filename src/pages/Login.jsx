import { loginWithGoogle } from "../firebase";

const appCards = [
  {
    title: "RegenOS",
    subtitle: "Factory Operating System",
    href: "https://regen-os.web.app",
    tone: "factory",
  },
  {
    title: "RegenMarketOS",
    subtitle: "Procurement Excellence Platform",
    tagline: "Every tonne has a story",
    href: "https://regenmarketos.web.app/",
    tone: "market",
  },
];

export default function Login() {
  async function handleLogin() {
    try {
      await loginWithGoogle();
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div style={pageShell}>
      <div style={loginCard}>
        <h1 style={title}>Regen OS</h1>
        <p style={subtitle}>Internal ERP Access</p>

        <button onClick={handleLogin} style={loginButton}>
          Login with Google
        </button>

        <section style={appsSection} aria-label="Business Applications">
          <div style={sectionHeader}>
            <span style={sectionEyebrow}>Business Applications</span>
            <strong style={sectionTitle}>Regen ecosystem</strong>
          </div>

          <div style={appGrid}>
            {appCards.map((app) => (
              <a
                key={app.title}
                href={app.href}
                target="_blank"
                rel="noreferrer"
                style={{
                  ...appCard,
                  borderColor: app.tone === "market" ? "#c78116" : "#cbd5e1",
                }}
              >
                <span
                  style={{
                    ...appBadge,
                    background: app.tone === "market" ? "#fff1d8" : "#e0f2fe",
                    color: app.tone === "market" ? "#8a5a12" : "#075985",
                  }}
                >
                  {app.tone === "market" ? "Market" : "Factory"}
                </span>
                <strong style={appTitle}>{app.title}</strong>
                <span style={appSubtitle}>{app.subtitle}</span>
                {app.tagline ? <span style={appTagline}>{app.tagline}</span> : null}
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

const pageShell = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 24,
  background:
    "radial-gradient(circle at 20% 15%, rgba(15,118,110,0.12), transparent 30%), linear-gradient(135deg, #f8fafc, #eef7f2)",
};

const loginCard = {
  background: "white",
  padding: 40,
  borderRadius: 12,
  width: "min(720px, 100%)",
  textAlign: "center",
  boxShadow: "0 18px 60px rgba(15,23,42,0.10)",
  border: "1px solid #e5e7eb",
};

const title = {
  marginBottom: 10,
  color: "#0f766e",
};

const subtitle = {
  color: "#666",
  marginBottom: 30,
};

const loginButton = {
  background: "#0f766e",
  color: "white",
  border: "none",
  padding: "14px 20px",
  borderRadius: 8,
  cursor: "pointer",
  width: "min(350px, 100%)",
  fontSize: 16,
  fontWeight: 800,
};

const appsSection = {
  marginTop: 30,
  paddingTop: 26,
  borderTop: "1px solid #e5e7eb",
  textAlign: "left",
};

const sectionHeader = {
  marginBottom: 14,
};

const sectionEyebrow = {
  display: "block",
  marginBottom: 4,
  color: "#c78116",
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const sectionTitle = {
  color: "#0f172a",
  fontSize: 18,
};

const appGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
};

const appCard = {
  display: "grid",
  gap: 6,
  minHeight: 142,
  padding: 18,
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  color: "#0f172a",
  textDecoration: "none",
  background: "#ffffff",
};

const appBadge = {
  width: "fit-content",
  padding: "5px 8px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 900,
};

const appTitle = {
  fontSize: 20,
};

const appSubtitle = {
  color: "#475569",
  lineHeight: 1.4,
};

const appTagline = {
  color: "#8a5a12",
  fontSize: 13,
  fontWeight: 900,
};