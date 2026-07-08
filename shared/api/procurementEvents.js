import { createAuditedRecord } from "@shared/types/marketRecords";

export function createProcurementIntentEvent(user, payload = {}) {
  return createAuditedRecord({
    id: `intent-${Date.now()}`,
    createdBy: user.id,
    ownerUserId: user.id,
    assignedRegion: user.region,
    assignedRole: user.role,
    visibility: "integration-event",
    approvalStatus: "pending-regen-os-confirmation",
    extra: {
      eventType: "PROCUREMENT_INTENT_CREATED",
      sourceSystem: "RegenMarketOS",
      targetSystem: "RegenOS",
      vendorId: payload.vendorId || "demo-vendor",
      plannedTonnes: payload.plannedTonnes || 24,
      materialFamily: payload.materialFamily || "Post-consumer plastic scrap",
      boundaryRule:
        "RegenMarketOS creates procurement intent only. RegenOS confirms physical stock after RM inward, weighbridge, and quality check.",
      inventoryMutation: false,
    },
  });
}
