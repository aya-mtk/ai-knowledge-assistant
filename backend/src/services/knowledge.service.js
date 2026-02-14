// backend/src/services/knowledge.service.js
const fs = require("fs");
const path = require("path");

// Store file location: backend/data/knowledge.json
const DATA_DIR = path.join(__dirname, "..", "..", "data");
const DATA_FILE = path.join(DATA_DIR, "knowledge.json");

// In-memory store (loaded from file at startup)
let store = loadStore();

/**
 * Load store from disk. If file doesn't exist, return empty array.
 */
function loadStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

    if (!fs.existsSync(DATA_FILE)) {
      // First run: create an empty file for clarity
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), "utf-8");
      return [];
    }

    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to load knowledge store:", err);
    return [];
  }
}

/**
 * Save store to disk (atomic write).
 */
function saveStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

    const tmpFile = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(store, null, 2), "utf-8");
    fs.renameSync(tmpFile, DATA_FILE);
  } catch (err) {
    console.error("Failed to save knowledge store:", err);
  }
}

function makeId() {
  return `k_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  return tags
    .map((t) => (typeof t === "string" ? t.trim() : ""))
    .filter(Boolean);
}

function validateItemPayload(payload, { allowPartial = false } = {}) {
  if (!payload || typeof payload !== "object") {
    return {
      ok: false,
      error: { code: "VALIDATION_ERROR", message: "Body must be an object." },
    };
  }

  const title = normalizeString(payload.title);
  const content = normalizeString(payload.content);
  const tags = normalizeTags(payload.tags);

  if (!allowPartial) {
    if (!title) {
      return {
        ok: false,
        error: { code: "VALIDATION_ERROR", message: "Title is required." },
      };
    }
    if (!content) {
      return {
        ok: false,
        error: { code: "VALIDATION_ERROR", message: "Content is required." },
      };
    }
  } else {
    // partial update: if provided, must be valid
    if ("title" in payload && !title) {
      return {
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Title must be non-empty.",
        },
      };
    }
    if ("content" in payload && !content) {
      return {
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Content must be non-empty.",
        },
      };
    }
  }

  const url = normalizeString(payload.url);
  if (
    "url" in payload &&
    payload.url != null &&
    typeof payload.url !== "string"
  ) {
    return {
      ok: false,
      error: { code: "VALIDATION_ERROR", message: "URL must be a string." },
    };
  }

  return {
    ok: true,
    value: { title, content, tags, ...(url ? { url } : {}) },
  };
}

/**
 * Public API (same shape you already use)
 */
function list() {
  return store.slice();
}

function getById(id) {
  const needle = normalizeString(id);
  if (!needle) return null;
  return store.find((x) => x.id === needle) || null;
}

function create(payload) {
  const v = validateItemPayload(payload);
  if (!v.ok) return v;

  const item = {
    id: makeId(),
    title: v.value.title,
    content: v.value.content,
    tags: v.value.tags,
    ...(v.value.url ? { url: v.value.url } : {}),
  };

  store.unshift(item);
  saveStore();
  return { ok: true, value: item };
}

function update(id, payload) {
  const needle = normalizeString(id);
  if (!needle) {
    return {
      ok: false,
      error: { code: "VALIDATION_ERROR", message: "ID is required." },
    };
  }

  const existingIndex = store.findIndex((x) => x.id === needle);
  if (existingIndex === -1) {
    // service contract in your routes: value null => not found
    return { ok: true, value: null };
  }

  const v = validateItemPayload(payload, { allowPartial: true });
  if (!v.ok) return v;

  const existing = store[existingIndex];

  const updated = {
    ...existing,
    ...(payload.title !== undefined ? { title: v.value.title } : {}),
    ...(payload.content !== undefined ? { content: v.value.content } : {}),
    ...(payload.tags !== undefined ? { tags: v.value.tags } : {}),
    ...(payload.url !== undefined ? { url: v.value.url || "" } : {}),
  };

  // If url becomes empty string, remove it for cleanliness
  if (updated.url === "") delete updated.url;

  store[existingIndex] = updated;
  saveStore();
  return { ok: true, value: updated };
}

function remove(id) {
  const needle = normalizeString(id);
  if (!needle) {
    return {
      ok: false,
      error: { code: "VALIDATION_ERROR", message: "ID is required." },
    };
  }

  const existingIndex = store.findIndex((x) => x.id === needle);
  if (existingIndex === -1) {
    return { ok: true, value: null };
  }

  const deleted = store[existingIndex];
  store.splice(existingIndex, 1);
  saveStore();

  return { ok: true, value: deleted };
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};
