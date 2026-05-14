const API_URL = import.meta.env.VITE_REGEN_OS_API_URL;

export async function apiCall(payload) {
  const params = new URLSearchParams();

  Object.entries(payload).forEach(([key, value]) => {
    params.append(key, value ?? "");
  });

  const url = `${API_URL}?${params.toString()}`;

  window.open(url, "_blank");

  return { ok: true };
}