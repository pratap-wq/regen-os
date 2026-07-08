export const MARKET_ROLES = [
  "CEO",
  "Procurement Head",
  "Regional Manager",
  "Procurement Executive",
  "MRF Focal",
  "Finance",
  "HR/Admin",
  "Vendor",
];

export const ROLE_PERMISSIONS = {
  CEO: ["market:*"],
  "Procurement Head": [
    "procurement:control",
    "vendor:manage",
    "target:manage",
    "expense:view",
    "meeting:manage",
    "event:create",
  ],
  "Regional Manager": [
    "region:read",
    "team:manage",
    "vendor:region",
    "target:region",
    "expense:region",
    "event:create",
  ],
  "Procurement Executive": [
    "own:vendors",
    "own:targets",
    "own:visits",
    "own:expenses",
    "own:achievements",
    "event:create",
  ],
  "MRF Focal": ["mrf:assigned", "mrf:targets", "mrf:wastage", "mrf:actions"],
  Finance: ["expense:approve", "transport:view", "vendor-payment:view"],
  "HR/Admin": ["staff:manage", "star:manage", "announcement:manage", "attendance:view"],
  Vendor: ["own:profile", "own:training", "own:quality", "own:documents", "own:messages"],
};

export function canAccessMarketRecord(user, record) {
  if (!user || !record) return false;
  if (user.role === "CEO" || user.role === "Procurement Head") return true;
  if (user.role === "Regional Manager") {
    return record.assignedRegion === user.region || record.assignedRegion === "All Regions";
  }
  if (user.role === "Procurement Executive") return record.ownerUserId === user.id;
  if (user.role === "MRF Focal") {
    return record.assignedRole === "MRF Focal" || record.assignedRegion === user.region;
  }
  if (user.role === "Finance") {
    return ["Expense", "Transport", "Vendor Payment"].includes(record.assignedRole);
  }
  if (user.role === "HR/Admin") {
    return [
      "CEO",
      "Procurement Head",
      "Regional Manager",
      "Procurement Executive",
      "MRF Focal",
      "Finance",
      "HR/Admin",
    ].includes(record.assignedRole);
  }
  if (user.role === "Vendor") return record.ownerUserId === user.id;
  return false;
}

export function roleScope(role) {
  return {
    CEO: "All regions, teams, vendors, targets, achievements, expenses, dashboards, and alerts.",
    "Procurement Head": "Full procurement control except system administration settings.",
    "Regional Manager": "Assigned region and team only.",
    "Procurement Executive": "Own vendors, targets, visits, expenses, and achievements only.",
    "MRF Focal": "Assigned MRFs, wastage plans, targets, and action items.",
    Finance: "Expense claims, transport bills, and vendor payment views.",
    "HR/Admin": "Staff master, rewards, announcements, star program, and attendance.",
    Vendor: "Own profile, trainings, quality feedback, documents, and messages.",
  }[role];
}
