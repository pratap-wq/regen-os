export function createAuditedRecord({
  id,
  createdBy,
  ownerUserId,
  assignedRegion,
  assignedRole,
  visibility = "role-scoped",
  approvalStatus = "draft",
  extra = {},
}) {
  const timestamp = "2026-07-08T09:00:00+05:30";

  return {
    id,
    createdBy,
    createdAt: timestamp,
    updatedBy: createdBy,
    updatedAt: timestamp,
    ownerUserId,
    assignedRegion,
    assignedRole,
    visibility,
    approvalStatus,
    auditLog: [
      {
        at: timestamp,
        by: createdBy,
        action: "created",
      },
    ],
    ...extra,
  };
}
