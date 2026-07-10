const API_URL = String(
  import.meta.env.VITE_REGEN_API_URL || ""
).trim();

export async function apiCall(
  payload = {},
  options = {}
) {

  if (!API_URL) {
    throw new Error(
      "Missing VITE_REGEN_API_URL. Configure the Apps Script /exec URL before deployment."
    );
  }

  const res = await fetch(API_URL, {
    method: "POST",
    signal: options.signal,
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload),
  });

  const contentType = String(res.headers.get("content-type") || "").toLowerCase();
  const text = await res.text();
  const trimmed = text.trim();

  if (!res.ok || trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) {
    throw new Error("Backend returned HTML/404. Check Apps Script deployment URL.");
  }

  if (!contentType.includes("json") && trimmed.startsWith("<")) {
    throw new Error("Backend returned HTML/404. Check Apps Script deployment URL.");
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`Backend returned non-JSON response. Check Apps Script deployment URL. ${err.message}`, { cause: err });
  }

}
