const API_URL =
  import.meta.env
    .VITE_REGEN_OS_API_URL;

export async function apiCall(
  payload = {}
) {

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