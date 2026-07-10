export const REQUEST_TIMEOUT_MESSAGE =
  "Request timed out. Check whether the record was saved before retrying.";

export function withRequestTimeout(request, timeoutMs = 30000, message = REQUEST_TIMEOUT_MESSAGE) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
  });
  return Promise.race([Promise.resolve(request), timeout]).finally(() => clearTimeout(timeoutId));
}

export function createStableTransactionId(prefix, dateValue = "", seed = "") {
  const date = String(dateValue || new Date().toISOString().slice(0, 10)).replace(/[^0-9]/g, "").slice(0, 8);
  const cleanSeed = String(seed || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, 8);
  const token = `${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`.slice(-9);
  return [prefix, date || "DATE", cleanSeed, token].filter(Boolean).join("-");
}

export function requireSuccessfulResponse(response, requiredId = "", action = "Request") {
  if (!response || response.ok !== true) {
    throw new Error(response?.error || `${action} failed.`);
  }
  if (requiredId && !response[requiredId]) {
    throw new Error(`${action} failed: backend did not return ${requiredId}.`);
  }
  return response;
}
