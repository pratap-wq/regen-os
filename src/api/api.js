const API_URL = String(
  import.meta.env.VITE_REGEN_API_URL ||
  import.meta.env.VITE_API_URL ||
  ""
).trim();

export async function apiCall(
  payload = {}
) {

  if (!API_URL) {
    throw new Error(
      "Missing VITE_REGEN_API_URL. Configure the Apps Script /exec URL before deployment."
    );
  }

  const fn = payload.fn || "";

  const isRead =
    fn.includes(".list");

  let res;

  if (isRead) {

    const params =
      new URLSearchParams();

    Object.entries(payload)
      .forEach(([k, v]) => {

        params.append(
          k,
          v ?? ""
        );

      });

    const url =
      `${API_URL}?${params.toString()}`;

    res = await fetch(url);

  } else {

    res = await fetch(API_URL, {

      method: "POST",

      headers: {
        "Content-Type":
          "text/plain;charset=utf-8",
      },

      body:
        JSON.stringify(payload),

    });

  }

  return await res.json();

}
