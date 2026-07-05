import { apiCall } from "../api/api";

export async function getPhysicalCount(periodMonth) {
  return apiCall({
    fn: "physicalCounts.get",
    periodMonth,
  });
}

export async function savePhysicalCount(periodMonth, payload = {}) {
  return apiCall({
    fn: "physicalCounts.save",
    periodMonth,
    ...payload,
  });
}
