// backend/src/services/knowledge.service.js

const store = []; // in-memory array

function makeId() {
  // Simple stable id. Good enough for demo.
  return `k_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function normalizeString(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function normalizeTags(tags) {
  if (tags === undefined) return [];
  if (!Array.isArray(tags)) return null;

  const cleaned = tags
    .filter((t) => typeof t === "string")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  // dedupe (case-sensitive)
  return Array.from(new Set(cleaned));
}

function makeValidationError(details) {
  return {
    code: "VALIDATION_ERROR",
    message: "Invalid knowledge data",
    details,
  };
}

function validateCreate(input) {
  const details = [];

  const title = normalizeString(input?.title);
  if (!title) details.push({ field: "title", message: "Title is required" });

  const content = normalizeString(input?.content);
  if (!content)
    details.push({ field: "content", message: "Content is required" });

  const tags = normalizeTags(input?.tags);
  if (tags === null)
    details.push({
      field: "tags",
      message: "Tags must be an array of strings",
    });

  if (details.length) return { ok: false, error: makeValidationError(details) };

  return { ok: true, value: { title, content, tags } };
}

function validateUpdate(input) {
  const details = [];

  const hasTitle = Object.prototype.hasOwnProperty.call(input || {}, "title");
  const hasContent = Object.prototype.hasOwnProperty.call(
    input || {},
    "content"
  );
  const hasTags = Object.prototype.hasOwnProperty.call(input || {}, "tags");

  if (!hasTitle && !hasContent && !hasTags) {
    return {
      ok: false,
      error: makeValidationError([
        {
          field: "body",
          message: "At least one of title, content, tags is required",
        },
      ]),
    };
  }

  let title;
  if (hasTitle) {
    title = normalizeString(input.title);
    if (!title)
      details.push({
        field: "title",
        message: "Title must be a non-empty string",
      });
  }

  let content;
  if (hasContent) {
    content = normalizeString(input.content);
    if (!content)
      details.push({
        field: "content",
        message: "Content must be a non-empty string",
      });
  }

  let tags;
  if (hasTags) {
    tags = normalizeTags(input.tags);
    if (tags === null)
      details.push({
        field: "tags",
        message: "Tags must be an array of strings",
      });
  }

  if (details.length) return { ok: false, error: makeValidationError(details) };

  return {
    ok: true,
    value: {
      ...(hasTitle ? { title } : {}),
      ...(hasContent ? { content } : {}),
      ...(hasTags ? { tags } : {}),
    },
  };
}

// Public API

function list() {
  // Return a copy to prevent accidental mutation from callers
  return store.map((x) => ({ ...x, tags: [...x.tags] }));
}

function getById(id) {
  const item = store.find((x) => x.id === id);
  if (!item) return null;
  return { ...item, tags: [...item.tags] };
}

function create(input) {
  const result = validateCreate(input);
  if (!result.ok) return result;

  const item = {
    id: makeId(),
    title: result.value.title,
    content: result.value.content,
    tags: result.value.tags,
  };

  store.unshift(item); // newest first (nice for admin list)
  return { ok: true, value: { ...item, tags: [...item.tags] } };
}

function update(id, input) {
  const index = store.findIndex((x) => x.id === id);
  if (index === -1) return { ok: true, value: null };

  const result = validateUpdate(input);
  if (!result.ok) return result;

  const current = store[index];
  const updated = {
    ...current,
    ...result.value,
  };

  store[index] = updated;
  return { ok: true, value: { ...updated, tags: [...updated.tags] } };
}

function remove(id) {
  const index = store.findIndex((x) => x.id === id);
  if (index === -1) return { ok: true, value: false };

  store.splice(index, 1);
  return { ok: true, value: true };
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,

  // exporting validators can help later in routes/tests, optional:
  // validateCreate,
  // validateUpdate,
};
