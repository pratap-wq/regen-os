import { useMemo, useState } from "react";

import { MARKET_DEMO_USERS } from "@shared/auth/marketDemoUsers";
import { createProcurementIntentEvent } from "@shared/api/procurementEvents";
import { createAuditedRecord } from "@shared/types/marketRecords";
import {
  MARKET_ROLES,
  ROLE_PERMISSIONS,
  canAccessMarketRecord,
  roleScope,
} from "@shared/permissions/marketPermissions";

const navigation = [
  ["command", "Command Center"],
  ["team", "Team"],
  ["vendors", "Vendors"],
  ["targets", "Targets"],
  ["mrfs", "MRFs"],
  ["expenses", "Expenses"],
  ["whatsapp", "WhatsApp"],
  ["integration", "Integration"],
];

const dashboardByRole = {
  CEO: {
    title: "CEO Procurement Command",
    mission: "Every tonne has a story",
    copy:
      "All-region procurement excellence view across targets, achievement, gaps, vendor growth, MRF recovery, claims, and risk.",
    metrics: [
      ["Total Target", "18,500 t", "Monthly procurement target"],
      ["Achieved", "12,840 t", "Confirmed procurement achievement"],
      ["Gap", "5,660 t", "Tonnes still to secure"],
      ["Top Performer", "Janardhan", "West region, 1,240 t"],
      ["Active Vendors", "428", "34 new this month"],
      ["MRF Recovery", "73.4%", "2.1% month-to-date improvement"],
      ["Expense Claims Pending", "32", "Finance review queue"],
    ],
  },
  "Procurement Executive": {
    title: "Procurement Executive Mission",
    mission: "Today's mission",
    copy:
      "Personal procurement cockpit for targets, weekly plan, own vendors, follow-ups, ranking, and pending expenses.",
    metrics: [
      ["Today's Mission", "5 visits", "3 vendor calls, 2 quality closures"],
      ["Monthly Target", "1,650 t", "Personal procurement goal"],
      ["Weekly Plan", "420 t", "Current sprint commitment"],
      ["Own Vendors", "26", "Assigned active vendors"],
      ["Follow-ups", "14", "Due this week"],
      ["Leaderboard Position", "#3", "West region"],
      ["Pending Expenses", "Rs 18,400", "Claims awaiting approval"],
    ],
  },
  "Procurement Head": {
    title: "Procurement Head Control",
    mission: "Vendor Network Growth",
    copy:
      "Team targets, weekly plan, vendor development, delayed trucks, approvals, quality issues, MRF status, and meeting action items.",
    metrics: [
      ["Team Target", "18,500 t", "Monthly lock"],
      ["Weekly Plan", "4,320 t", "81% confidence"],
      ["Pending Vendors", "46", "Pipeline"],
      ["Delayed Trucks", "12", "Escalate today"],
      ["Approvals", "18", "Pending"],
      ["Quality Issues", "9", "Closure needed"],
    ],
  },
  "Regional Manager": {
    title: "Regional Mission Control",
    mission: "West Region Tonnes Sprint",
    copy:
      "Region-only view for executive target vs achievement, vendor visits, new vendor pipeline, MRF progress, transport cost, and quality feedback.",
    metrics: [
      ["Region Target", "4,800 t", "Assigned region"],
      ["Achieved", "3,310 t", "69% complete"],
      ["Vendor Visits", "124", "This month"],
      ["New Pipeline", "18", "Prospects"],
      ["MRF Progress", "76%", "Recovery mission"],
      ["Transport Cost", "Rs 4.6L", "Under review"],
    ],
  },
  "MRF Focal": {
    title: "MRF Excellence",
    mission: "Recovery Improvement Mission",
    copy:
      "Assigned MRFs, target vs actual, recovery, wastage, improvement plans, pending actions, photos, documents, and training status.",
    metrics: [
      ["Assigned MRFs", "4", "South cluster"],
      ["Target vs Actual", "82%", "Recovery target"],
      ["Recovery", "74.2%", "Up 1.8%"],
      ["Wastage", "8.6%", "Reduction active"],
      ["Actions", "11", "Pending"],
      ["Training", "68%", "Complete"],
    ],
  },
  Finance: {
    title: "Finance Approval Desk",
    mission: "Clean claims, clear accountability",
    copy:
      "Expense claims, transport bills, pending approvals, approved amount, paid amount, rejected claims, and future vendor payment views.",
    metrics: [
      ["Expense Claims", "84", "32 pending"],
      ["Transport Bills", "41", "11 exceptions"],
      ["Approved", "Rs 12.8L", "This month"],
      ["Paid", "Rs 8.3L", "Released"],
      ["Rejected", "7", "Policy mismatch"],
      ["Vendor Payments", "Future", "Placeholder"],
    ],
  },
  "HR/Admin": {
    title: "People & Recognition",
    mission: "Monthly Star Race",
    copy:
      "Staff master, monthly awards, leaderboard, attendance placeholder, announcements, and recognition governance.",
    metrics: [
      ["Staff", "126", "Active users"],
      ["Nominees", "12", "Star race"],
      ["Awards", "5", "This month"],
      ["Announcements", "3", "Active"],
      ["Attendance", "Future", "Placeholder"],
      ["Leaderboard", "Live", "Points"],
    ],
  },
  Vendor: {
    title: "Vendor Portal",
    mission: "Better quality, better growth",
    copy:
      "Limited access to own profile, trainings, quality feedback, documents, greetings, messages, and improvement suggestions.",
    metrics: [
      ["Profile", "Verified", "KYC current"],
      ["Feedback", "2", "Open notes"],
      ["Training", "3", "Modules"],
      ["Documents", "8", "Approved"],
      ["Messages", "5", "Unread"],
      ["Suggestions", "4", "Active"],
    ],
  },
};

const staffRecords = MARKET_DEMO_USERS.map((user) =>
  createAuditedRecord({
    id: `staff-${user.id}`,
    createdBy: "market-hr",
    ownerUserId: user.id,
    assignedRegion: user.region,
    assignedRole: user.role,
    visibility: user.role === "Vendor" ? "external-self" : "internal-team",
    approvalStatus: "approved",
    extra: {
      name: user.name,
      email: user.email,
      role: user.role,
      region: user.region,
      team: user.team,
      status: user.role === "Vendor" ? "External portal" : "Active",
    },
  })
);

const regionRecords = [
  ["North", "Antony", "3,900 t", "14", "6"],
  ["South", "Bhanu", "4,120 t", "18", "4"],
  ["East", "Umesh", "2,850 t", "11", "5"],
  ["West", "Janardhan", "4,800 t", "22", "7"],
  ["Central", "Yadagiri", "2,830 t", "10", "3"],
].map(([region, lead, target, executives, mrfCount]) =>
  createAuditedRecord({
    id: `region-${region.toLowerCase()}`,
    createdBy: "market-head",
    ownerUserId: "market-head",
    assignedRegion: region,
    assignedRole: "Regional Manager",
    visibility: "regional",
    approvalStatus: "approved",
    extra: { region, lead, target, executives, mrfCount },
  })
);

const commandCards = [
  ["Total Target", "18,500 t", "Monthly procurement command target"],
  ["Achieved", "12,840 t", "Progress against plan"],
  ["Weekly Plan", "4,320 t", "Team commitment"],
  ["Delayed Trucks", "12", "Escalations queued"],
  ["Pending Approvals", "18", "Vendor and claims"],
  ["Quality Issues", "9", "Feedback closure required"],
  ["MRF Action Items", "11", "Recovery improvement"],
  ["Meeting Actions", "23", "Owners assigned"],
];

const executiveTargets = {
  Janardhan: { monthly: "1,800 t", weekly: "460 t", vendors: "31", followUps: "16", rank: "#1", expenses: "Rs 21,600", mission: "6 visits" },
  Bhanu: { monthly: "1,640 t", weekly: "410 t", vendors: "28", followUps: "13", rank: "#2", expenses: "Rs 14,200", mission: "5 visits" },
  Antony: { monthly: "1,520 t", weekly: "380 t", vendors: "24", followUps: "11", rank: "#3", expenses: "Rs 18,900", mission: "4 visits" },
  Umesh: { monthly: "1,450 t", weekly: "360 t", vendors: "22", followUps: "10", rank: "#4", expenses: "Rs 12,750", mission: "4 visits" },
};

const leaderboard = [
  "#1 Janardhan - 1,240 t",
  "#2 Bhanu - 1,110 t",
  "#3 Antony - 1,030 t",
  "#4 Umesh - 960 t",
];

function readSession() {
  try {
    return JSON.parse(localStorage.getItem("regenmarketos-demo-session"));
  } catch {
    return null;
  }
}

export default function App() {
  const [user, setUser] = useState(readSession());
  const [route, setRoute] = useState("command");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [intentEvent, setIntentEvent] = useState(null);

  const visibleStaff = useMemo(
    () => staffRecords.filter((record) => canAccessMarketRecord(user, record)),
    [user]
  );

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  function logout() {
    localStorage.removeItem("regenmarketos-demo-session");
    setUser(null);
    setRoute("command");
    setSelectedRecord(null);
    setIntentEvent(null);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <img src="/regen-logo.png" alt="Regen" />
          <div>
            <strong>RegenMarketOS</strong>
            <span>Procurement Excellence Platform</span>
          </div>
        </div>
        <nav aria-label="RegenMarketOS navigation">
          {navigation.map(([key, label]) => (
            <button
              className={route === key ? "active" : ""}
              key={key}
              onClick={() => {
                setRoute(key);
                setSelectedRecord(null);
              }}
            >
              <span />
              {label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">{user.role}</p>
            <h1>{pageTitle(route)}</h1>
          </div>
          <div className="user-card">
            <div className="avatar">{initials(user.name)}</div>
            <div>
              <strong>{user.name}</strong>
              <span>{user.region}</span>
            </div>
            <button className="ghost" onClick={logout}>Logout</button>
          </div>
        </header>
        <BoundaryBanner />
        {route === "command" && <CommandCenter user={user} />}
        {route === "team" && (
          <Team records={visibleStaff} selectedRecord={selectedRecord} setSelectedRecord={setSelectedRecord} user={user} />
        )}
        {route === "vendors" && <Placeholder route={route} />}
        {route === "targets" && <Placeholder route={route} />}
        {route === "mrfs" && <MrfView user={user} />}
        {route === "expenses" && <Placeholder route={route} />}
        {route === "whatsapp" && <Placeholder route={route} />}
        {route === "integration" && (
          <IntegrationEvents user={user} intentEvent={intentEvent} onCreate={() => setIntentEvent(createProcurementIntentEvent(user))} />
        )}
      </main>
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [selectedId, setSelectedId] = useState(MARKET_DEMO_USERS[0].id);
  const selectedUser = MARKET_DEMO_USERS.find((candidate) => candidate.id === selectedId);

  function submit(event) {
    event.preventDefault();
    localStorage.setItem("regenmarketos-demo-session", JSON.stringify(selectedUser));
    onLogin(selectedUser);
  }

  return (
    <section className="login-screen">
      <div className="login-copy-panel">
        <img src="/regen-logo.png" alt="Regen" />
        <p className="eyebrow">Procurement Excellence Platform</p>
        <h1>RegenMarketOS</h1>
        <p className="login-motto">Every tonne has a story</p>
        <p>
          A premium, role-based procurement command center for targets, vendor growth, accountability, MRF excellence, claims, WhatsApp workflows, and RegenOS-ready procurement intent.
        </p>
        <div className="signal-grid">
          <span>Command Center</span>
          <span>Vendor Network Growth</span>
          <span>Monthly Star Race</span>
          <span>MRF Recovery Mission</span>
        </div>
      </div>
      <form className="login-card" onSubmit={submit}>
        <p className="eyebrow">Role demo selector</p>
        <h2>Choose mission view</h2>
        <p className="demo-note">Demo mode for RegenMarketOS team review.</p>
        <label>
          Demo role
          <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
            {MARKET_DEMO_USERS.map((user) => (
              <option key={user.id} value={user.id}>{user.role} - {user.name}</option>
            ))}
          </select>
        </label>
        <button className="primary">Enter RegenMarketOS</button>
        <p className="fine-print">All data is local demo data. Production access must be enforced by backend role, region, owner, permission, approval, and audit policy.</p>
      </form>
    </section>
  );
}

function BoundaryBanner() {
  return (
    <section className="boundary-banner">
      <strong>RegenMarketOS creates procurement intent.</strong>
      <span>RegenOS confirms physical stock.</span>
    </section>
  );
}

function CommandCenter({ user }) {
  const config = dashboardByRole[user.role];
  const metrics = getDashboardMetrics(user, config.metrics);
  return (
    <>
      <section className="hero-panel">
        <div>
          <p className="eyebrow">{config.title}</p>
          <h2>{`Good Morning ${user.name}`}</h2>
          <p><strong>{config.mission}</strong> - {config.copy}</p>
        </div>
      </section>
      <section className="metric-grid featured-grid">
        {metrics.map(([label, value, note]) => <MetricCard key={label} label={label} value={value} note={note} />)}
      </section>
      <section className="metric-grid command-strip">
        {commandCards.map(([label, value, note]) => <MetricCard key={label} label={label} value={value} note={note} />)}
      </section>
      <section className="two-grid">
        <Panel title="Monthly Star Race">
          {leaderboard.map((item) => <Row key={item} left={item} right="Achievement" />)}
        </Panel>
        <Panel title="Risk Alerts">
          <div className="tags">
            <span className="red">Quality feedback overdue</span>
            <span className="amber">Delayed trucks</span>
            <span>MRF recovery dip</span>
            <span>Expense exception</span>
          </div>
        </Panel>
      </section>
    </>
  );
}

function getDashboardMetrics(user, fallbackMetrics) {
  if (user.role !== "Procurement Executive") return fallbackMetrics;
  const target = executiveTargets[user.name] || executiveTargets.Janardhan;
  return [
    ["Today's Mission", target.mission, "Vendor visits and quality follow-ups"],
    ["Monthly Target", target.monthly, "Personal procurement target"],
    ["Weekly Plan", target.weekly, "Current week commitment"],
    ["Own Vendors", target.vendors, "Assigned active vendors"],
    ["Follow-ups", target.followUps, "Due this week"],
    ["Leaderboard Position", target.rank, "Team procurement race"],
    ["Pending Expenses", target.expenses, "Claims awaiting approval"],
  ];
}

function Team({ records, selectedRecord, setSelectedRecord, user }) {
  return (
    <>
      <p className="lead">Team combines staff master, role permissions, and region assignment demo data. Records stay local and are filtered by the active role policy.</p>
      <section className="two-grid team-grid">
        <Panel title="Staff Master">
          <div className="table-wrap compact-table">
            <table>
              <thead><tr><th>Name</th><th>Role</th><th>Region</th><th>Action</th></tr></thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td>{record.name}</td>
                    <td>{record.role}</td>
                    <td>{record.region}</td>
                    <td><button className="soft" onClick={() => setSelectedRecord(record)}>Inspect</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel title="Region / Team Assignment">
          {regionRecords.filter((record) => canAccessMarketRecord(user, record)).map((record) => (
            <MetricLine key={record.id} label={`${record.region} - ${record.lead}`} value={record.target} />
          ))}
        </Panel>
      </section>
      <section className="two-grid">
        <Panel title="Role & Permission Matrix">
          <div className="permission-list">
            {MARKET_ROLES.map((role) => (
              <div key={role}>
                <strong>{role}</strong>
                <p>{roleScope(role)}</p>
                <div className="tags">{ROLE_PERMISSIONS[role].map((permission) => <span key={permission}>{permission}</span>)}</div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Selected Record Metadata">
          <CodeBlock record={selectedRecord || records[0]} />
        </Panel>
      </section>
    </>
  );
}

function MrfView({ user }) {
  const visibleRegions = regionRecords.filter((record) => canAccessMarketRecord(user, record));
  return (
    <>
      <p className="lead">MRF recovery and wastage-reduction planning remains demo/local. No stock is confirmed from this view.</p>
      <section className="card-grid">
        {visibleRegions.map((record) => (
          <Panel key={record.id} title={`${record.region} MRFs`}>
            <MetricLine label="Regional Lead" value={record.lead} />
            <MetricLine label="MRFs" value={record.mrfCount} />
            <MetricLine label="Recovery" value={record.region === "West" ? "76%" : "73%"} />
            <MetricLine label="Pending Actions" value={record.region === "South" ? "11" : "6"} />
          </Panel>
        ))}
      </section>
    </>
  );
}

function IntegrationEvents({ user, intentEvent, onCreate }) {
  const fallback = createAuditedRecord({
    id: "intent-demo",
    createdBy: user.id,
    ownerUserId: user.id,
    assignedRegion: user.region,
    assignedRole: user.role,
    visibility: "integration-event",
    approvalStatus: "draft",
    extra: { inventoryMutation: false },
  });

  return (
    <section className="two-grid">
      <Panel title="RegenOS Integration Events">
        <p className="lead compact">Create procurement intent only. Physical stock confirmation stays in RegenOS after RM Inward, weighbridge, and quality check.</p>
        <button className="primary" onClick={onCreate}>Create demo procurement intent</button>
      </Panel>
      <Panel title="Event Contract">
        <CodeBlock record={intentEvent || fallback} />
      </Panel>
    </section>
  );
}

function Placeholder({ route }) {
  const labels = {
    vendors: ["Vendors", "Vendor 360 placeholder for profile, quality feedback, documents, training, greetings, and development status."],
    targets: ["Targets", "Target Engine placeholder for monthly, weekly, yearly, region, team, and personal planning."],
    expenses: ["Expenses", "Expense Claims placeholder for staff claims, transport bills, approvals, paid amounts, and rejection reasons."],
    whatsapp: ["WhatsApp", "WhatsApp Hub placeholder for vendor reminders, greetings, training links, and quality nudges."],
  };
  const [title, copy] = labels[route];
  return (
    <Panel title={title}>
      <p className="lead compact">{copy}</p>
      <div className="tags"><span>Demo/local data</span><span>Role guarded</span><span>No inventory posting</span></div>
    </Panel>
  );
}

function MetricCard({ label, value, note }) {
  return (
    <article className="metric-card">
      <h3>{label}</h3>
      <strong>{value}</strong>
      <p>{note}</p>
    </article>
  );
}

function Panel({ title, children }) {
  return <article className="panel"><h3>{title}</h3>{children}</article>;
}

function Row({ left, right }) {
  return <div className="row"><strong>{left}</strong><span>{right}</span></div>;
}

function MetricLine({ label, value }) {
  return <div className="metric-line"><span>{label}</span><strong>{value}</strong></div>;
}

function CodeBlock({ record }) {
  if (!record) return null;
  return <pre className="code-block">{JSON.stringify(record, null, 2)}</pre>;
}

function pageTitle(route) {
  return navigation.find(([key]) => key === route)?.[1] || "Command Center";
}

function initials(name) {
  return name.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}