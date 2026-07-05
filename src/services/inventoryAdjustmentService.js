import { apiCall } from "../api/api";

export async function listInventoryAdjustments(filters = {}) {
  return apiCall({ fn: "inventoryAdjustments.list", ...filters });
}

export async function addInventoryAdjustment(payload = {}) {
  return apiCall({ fn: "inventoryAdjustments.add", ...payload });
}

export async function approveInventoryAdjustment(adjustmentId, approvedBy = "System") {
  return apiCall({ fn: "inventoryAdjustments.approve", adjustmentId, approvedBy });
}

export async function rejectInventoryAdjustment(adjustmentId, rejectedBy = "System", remarks = "") {
  return apiCall({ fn: "inventoryAdjustments.reject", adjustmentId, rejectedBy, remarks });
}

export async function getInventoryAdjustmentSummary(periodMonth) {
  return apiCall({ fn: "inventoryAdjustments.summary", periodMonth });
}

export async function listAdjustmentMasters() {
  const [gradesRes, materialsRes] = await Promise.all([
    apiCall({ fn: "grades.list" }),
    apiCall({ fn: "productionMaterials.list" }),
  ]);

  return {
    grades: gradesRes?.rows || [],
    materials: materialsRes?.rows || [],
  };
}
