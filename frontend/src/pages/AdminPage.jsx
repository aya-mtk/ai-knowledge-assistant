import { useEffect, useMemo, useState } from "react";
import {
  listKnowledge,
  createKnowledge,
  updateKnowledge,
  deleteKnowledge,
} from "../lib/knowledgeApi";

function parseTags(tagsText) {
  // "a, b, c" -> ["a","b","c"]
  return tagsText
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function Callout({ kind = "info", title, children }) {
  const styles = useMemo(() => {
    if (kind === "error") {
      return {
        background: "#2b1414",
        border: "1px solid #5a1a1a",
        titleColor: "#ffb4b4",
      };
    }
    return {
      background: "#141b2b",
      border: "1px solid #1a2a5a",
      titleColor: "#b9d2ff",
    };
  }, [kind]);

  return (
    <div
      style={{
        marginTop: 16,
        padding: 12,
        borderRadius: 8,
        background: styles.background,
        border: styles.border,
      }}
    >
      <div
        style={{ fontWeight: 700, marginBottom: 6, color: styles.titleColor }}
      >
        {title}
      </div>
      <div style={{ opacity: 0.95 }}>{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "block" }}>
      <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>{label}</div>
      {children}
    </label>
  );
}

function ItemEditor({ item, onSave, onCancel, saving }) {
  const [title, setTitle] = useState(item.title || "");
  const [content, setContent] = useState(item.content || "");
  const [tagsText, setTagsText] = useState(
    Array.isArray(item.tags) ? item.tags.join(", ") : ""
  );
  const [localError, setLocalError] = useState("");

  function validate() {
    const t = title.trim();
    const c = content.trim();
    if (!t) return "Title is required.";
    if (!c) return "Content is required.";
    return "";
  }

  async function handleSave() {
    setLocalError("");
    const msg = validate();
    if (msg) {
      setLocalError(msg);
      return;
    }

    const payload = {
      title: title.trim(),
      content: content.trim(),
      tags: parseTags(tagsText),
    };

    await onSave(payload);
  }

  return (
    <div
      style={{
        padding: 12,
        borderRadius: 8,
        border: "1px solid #333",
        background: "#171717",
      }}
    >
      <div style={{ display: "grid", gap: 10 }}>
        <Field label="Title">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={saving}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #333",
              background: "#1a1a1a",
              color: "inherit",
            }}
          />
        </Field>

        <Field label="Content">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={saving}
            rows={4}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #333",
              background: "#1a1a1a",
              color: "inherit",
              resize: "vertical",
            }}
          />
        </Field>

        <Field label="Tags (comma-separated)">
          <input
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            disabled={saving}
            placeholder="password, auth"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #333",
              background: "#1a1a1a",
              color: "inherit",
            }}
          />
        </Field>

        {localError ? (
          <div style={{ color: "#ff9b9b" }}>{localError}</div>
        ) : null}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #333",
              background: "#222",
              color: "white",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              border: "none",
              background: saving ? "#444" : "#1f6feb",
              color: "white",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  // Create form
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [formError, setFormError] = useState("");
  const [creating, setCreating] = useState(false);

  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  async function refresh() {
    setPageError("");
    setLoading(true);
    try {
      const data = await listKnowledge();
      setItems(data);
    } catch (err) {
      setPageError(err.message || "Failed to load knowledge items.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  function validateCreate() {
    if (!title.trim()) return "Title is required.";
    if (!content.trim()) return "Content is required.";
    return "";
  }

  async function handleCreate(e) {
    e.preventDefault();
    setFormError("");

    const msg = validateCreate();
    if (msg) {
      setFormError(msg);
      return;
    }

    const payload = {
      title: title.trim(),
      content: content.trim(),
      tags: parseTags(tagsText),
    };

    try {
      setCreating(true);
      const created = await createKnowledge(payload);
      // update list immediately
      setItems((prev) => [created, ...prev]);
      // reset form
      setTitle("");
      setContent("");
      setTagsText("");
    } catch (err) {
      setFormError(err.message || "Failed to create item.");
    } finally {
      setCreating(false);
    }
  }

  async function handleSaveEdit(id, payload) {
    try {
      setSavingId(id);
      const updated = await updateKnowledge(id, payload);
      setItems((prev) => prev.map((x) => (x.id === id ? updated : x)));
      setEditingId(null);
    } catch (err) {
      setPageError(err.message || "Failed to update item.");
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(id) {
    const ok = window.confirm(
      "Delete this knowledge item? This cannot be undone."
    );
    if (!ok) return;

    try {
      setDeletingId(id);
      await deleteKnowledge(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      if (editingId === id) setEditingId(null);
    } catch (err) {
      setPageError(err.message || "Failed to delete item.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Admin</h1>
      <div style={{ opacity: 0.8 }}>
        Manage knowledge items used by the chat assistant.
      </div>

      {pageError ? (
        <Callout kind="error" title="Error">
          {pageError}
        </Callout>
      ) : null}

      {/* Create */}
      <div
        style={{
          marginTop: 16,
          padding: 16,
          borderRadius: 8,
          border: "1px solid #333",
          background: "#121212",
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 10 }}>
          Add knowledge item
        </div>

        <form onSubmit={handleCreate} style={{ display: "grid", gap: 10 }}>
          <Field label="Title">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={creating}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border:
                  formError && !title.trim()
                    ? "1px solid #a33"
                    : "1px solid #333",
                background: "#1a1a1a",
                color: "inherit",
              }}
            />
          </Field>

          <Field label="Content">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={creating}
              rows={4}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border:
                  formError && !content.trim()
                    ? "1px solid #a33"
                    : "1px solid #333",
                background: "#1a1a1a",
                color: "inherit",
                resize: "vertical",
              }}
            />
          </Field>

          <Field label="Tags (comma-separated)">
            <input
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              disabled={creating}
              placeholder="password, auth"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #333",
                background: "#1a1a1a",
                color: "inherit",
              }}
            />
          </Field>

          {formError ? (
            <div style={{ color: "#ff9b9b" }}>{formError}</div>
          ) : null}

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              disabled={creating}
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                border: "none",
                background: creating ? "#444" : "#1f6feb",
                color: "white",
                cursor: creating ? "not-allowed" : "pointer",
              }}
            >
              {creating ? "Adding…" : "Add item"}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div style={{ marginTop: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h2 style={{ margin: 0 }}>Knowledge items</h2>
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #333",
              background: "#222",
              color: "white",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {loading ? (
          <div style={{ marginTop: 12, opacity: 0.75 }}>Loading…</div>
        ) : null}

        {!loading && items.length === 0 ? (
          <div style={{ marginTop: 12, opacity: 0.75 }}>
            No knowledge items yet. Add one above to enable grounded chat
            answers.
          </div>
        ) : null}

        <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
          {items.map((item) => {
            const isEditing = editingId === item.id;
            const isSaving = savingId === item.id;
            const isDeleting = deletingId === item.id;

            return (
              <div
                key={item.id}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  border: "1px solid #333",
                  background: "#121212",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700 }}>
                      {item.title || "Untitled"}
                    </div>
                    <div style={{ opacity: 0.7, fontSize: 12 }}>{item.id}</div>
                    {Array.isArray(item.tags) && item.tags.length ? (
                      <div
                        style={{ marginTop: 6, opacity: 0.85, fontSize: 13 }}
                      >
                        Tags: {item.tags.join(", ")}
                      </div>
                    ) : null}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "flex-start",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setEditingId(isEditing ? null : item.id)}
                      disabled={isDeleting || loading}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: "1px solid #333",
                        background: "#222",
                        color: "white",
                        cursor: isDeleting ? "not-allowed" : "pointer",
                      }}
                    >
                      {isEditing ? "Close" : "Edit"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      disabled={isDeleting || isSaving || loading}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: "1px solid #5a1a1a",
                        background: isDeleting ? "#3a1a1a" : "#2b1414",
                        color: "white",
                        cursor: isDeleting ? "not-allowed" : "pointer",
                      }}
                    >
                      {isDeleting ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 10,
                    whiteSpace: "pre-wrap",
                    opacity: 0.95,
                  }}
                >
                  {item.content}
                </div>

                {isEditing ? (
                  <div style={{ marginTop: 12 }}>
                    <ItemEditor
                      item={item}
                      saving={isSaving}
                      onCancel={() => setEditingId(null)}
                      onSave={(payload) => handleSaveEdit(item.id, payload)}
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
