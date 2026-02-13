export async function postChat(message) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  const text = await res.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // Non-JSON response from server
    data = null;
  }

  if (!res.ok) {
    const msg =
      (data && data.error) ||
      `Request failed (${res.status}). Please try again.`;
    throw new Error(msg);
  }

  if (
    !data ||
    typeof data.answer !== "string" ||
    !Array.isArray(data.sources)
  ) {
    throw new Error("Invalid server response. Please try again.");
  }

  return data; // { answer, sources }
}
