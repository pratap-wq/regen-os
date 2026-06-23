export function formatDate(dateValue) {

  if (!dateValue)
    return "";

  try {

    return String(dateValue)
      .split("T")[0];

  } catch {

    return "";

  }

}