async function parseJsonSafe(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

function extractErrorMessage(payload, fallback) {
  // expected: { ok:false, error:{ code, message, details? } }
  if (payload?.error?.message) return payload.error.message;
  if (payload?.error?.code) return `${payload.error.code}: ${fallback}`;
  return fallback;
}

export async function listKnowledge() {
  const res = await fetch("/api/knowledge");
  const data = await parseJsonSafe(res);

  if (!res.ok || !data?.ok) {
    throw new Error(
      extractErrorMessage(data, "Failed to load knowledge items.")
    );
  }

  return Array.isArray(data.data) ? data.data : [];
}

export async function createKnowledge(payload) {
  const res = await fetch("/api/knowledge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseJsonSafe(res);

  if (!res.ok || !data?.ok) {
    throw new Error(
      extractErrorMessage(data, "Failed to create knowledge item.")
    );
  }

  return data.data; // created item
}

export async function updateKnowledge(id, payload) {
  const res = await fetch(`/api/knowledge/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseJsonSafe(res);

  if (!res.ok || !data?.ok) {
    throw new Error(
      extractErrorMessage(data, "Failed to update knowledge item.")
    );
  }

  return data.data; // updated item
}

export async function deleteKnowledge(id) {
  const res = await fetch(`/api/knowledge/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  const data = await parseJsonSafe(res);

  if (!res.ok || !data?.ok) {
    throw new Error(
      extractErrorMessage(data, "Failed to delete knowledge item.")
    );
  }

  return true;
}
