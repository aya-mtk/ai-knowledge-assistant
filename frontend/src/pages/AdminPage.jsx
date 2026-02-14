import { useEffect, useMemo, useState } from "react";
import {
  listKnowledge,
  createKnowledge,
  updateKnowledge,
  deleteKnowledge,
  loadDemoPack,
} from "../lib/knowledgeApi";

import backgroundAdmin from "../assets/backgroundAdmin.png"; // stars background
import fullBackground from "../assets/fullBackground.png"; // cube empty-state bg
import adminCore from "../assets/adminCore3.png"; // header core icon

function parseTags(tagsText) {
  return tagsText
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function includesQuery(item, q) {
  if (!q) return true;
  const s = q.toLowerCase();
  return (
    (item.title || "").toLowerCase().includes(s) ||
    (item.content || "").toLowerCase().includes(s) ||
    (Array.isArray(item.tags)
      ? item.tags.join(" ").toLowerCase()
      : ""
    ).includes(s)
  );
}

export default function AdminPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [loadingDemo, setLoadingDemo] = useState(false);

  // create form
  const [title, setTitle] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [content, setContent] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  // list/search
  const [query, setQuery] = useState("");

  // edit state
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

  async function handleLoadDemo(force = false) {
    setPageError("");
    try {
      setLoadingDemo(true);
      await loadDemoPack({ force });
      await refresh(); // refresh list after insert
    } catch (err) {
      setPageError(err.message || "Failed to load demo knowledge.");
    } finally {
      setLoadingDemo(false);
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
    if (msg) return setFormError(msg);

    const payload = {
      title: title.trim(),
      content: content.trim(),
      tags: parseTags(tagsText),
    };

    try {
      setCreating(true);
      const created = await createKnowledge(payload);
      setItems((prev) => [created, ...prev]);
      setQuery(""); // ✅ add this
      setTitle("");
      setTagsText("");
      setContent("");
    } catch (err) {
      setFormError(err.message || "Failed to create item.");
    } finally {
      setCreating(false);
    }
  }

  async function handleSave(id, next) {
    try {
      setSavingId(id);
      const updated = await updateKnowledge(id, next);
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

  const filtered = useMemo(
    () => items.filter((x) => includesQuery(x, query)),
    [items, query]
  );

  return (
    <div
      className="admin-page"
      style={{
        "--admin-bg": `url(${backgroundAdmin})`,
        "--cube-bg": `url(${fullBackground})`,
      }}
    >
      <div className="admin-shell">
        {/* hero */}
        <div className="admin-hero">
          <div className="admin-core-wrapper">
            <img src={adminCore} className="admin-core-img" alt="AI core" />
          </div>

          <div>
            <h1 className="admin-title">Admin Console</h1>
            <p className="admin-subtitle">
              Manage your knowledge intelligence engine
            </p>
          </div>
        </div>

        {/* status bar */}
        <div className="status-bar">
          <div className="status-card">
            <div className="status-label">Knowledge Nodes</div>
            <div className="status-value">{items.length}</div>
          </div>

          <div className="status-card">
            <div className="status-label">Status</div>
            <div style={{ marginTop: 10 }}>
              <span className="status-pill">
                <span className="dot-green" /> Active
              </span>
            </div>
          </div>

          <div className="status-card">
            <div className="status-label">Embedding Index</div>
            <div className="status-value">—</div>
          </div>

          <div className="status-card">
            <div className="status-label">System Health</div>
            <div className="status-value" style={{ color: "#a7f3d0" }}>
              Optimal
            </div>
          </div>
        </div>

        <div
          style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}
        >
          <button
            type="button"
            className="btn-glow"
            disabled={loadingDemo}
            onClick={() => handleLoadDemo(false)}
          >
            {loadingDemo ? "Loading Demo Pack…" : "Load Demo Knowledge Pack"}
          </button>

          <button
            type="button"
            className="btn-ghost"
            disabled={loadingDemo}
            onClick={() => handleLoadDemo(true)}
          >
            Reset + Reload Demo Pack
          </button>
        </div>

        {/* Add item panel */}
        <div className="admin-panel">
          <h2 className="panel-title">Add Knowledge Item</h2>

          <form onSubmit={handleCreate}>
            <div className="grid-2">
              <div>
                <div className="field-label">Title</div>
                <input
                  className="input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Password Reset Guide"
                  disabled={creating}
                />
              </div>

              <div>
                <div className="field-label">Tags</div>
                <input
                  className="input"
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                  placeholder="e.g. password, auth, security"
                  disabled={creating}
                />
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div className="field-label">Content</div>
              <textarea
                className="textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter knowledge content..."
                disabled={creating}
              />
            </div>

            {formError ? <div className="input-error">{formError}</div> : null}
            {pageError ? <div className="error-box">{pageError}</div> : null}

            <div className="admin-actions">
              <button className="btn-glow" type="submit" disabled={creating}>
                <span style={{ marginRight: 10, opacity: 0.95 }}>⚡</span>
                {creating ? "Adding…" : "Add Item"}
              </button>
            </div>
          </form>
        </div>

        {/* Items panel */}
        <div className="admin-panel">
          <div className="list-header">
            <h2 className="panel-title" style={{ margin: 0 }}>
              Knowledge Items
            </h2>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button
                type="button"
                className="btn-ghost"
                onClick={refresh}
                disabled={loading}
              >
                {loading ? "Refreshing…" : "Refresh"}
              </button>

              <input
                className="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search items..."
              />
            </div>
          </div>

          {loading ? <div style={{ opacity: 0.75 }}>Loading…</div> : null}

          {/* Show empty state only if there are no items at all */}
          {!loading && items.length === 0 ? (
            <div className="empty-state-bg">
              <div className="empty-content">
                <div className="empty-center">
                  <div className="empty-h1">No Knowledge Items Yet</div>
                  <div className="empty-p">
                    Add your first knowledge item to power the AI assistant.
                  </div>

                  <button
                    type="button"
                    className="btn-cta"
                    onClick={() => {
                      const el = document.querySelector(
                        'input[placeholder="e.g. Password Reset Guide"]'
                      );
                      if (el) el.focus();
                    }}
                  >
                    <span className="btn-cta-plus">+</span>
                    Add Your First Item
                  </button>

                  <div className="example-row">
                    <span className="example-label">Example:</span>
                    <div className="example-chips">
                      {[
                        "Authentication",
                        "API Docs",
                        "Troubleshooting",
                        "Onboarding",
                      ].map((t) => (
                        <button
                          key={t}
                          type="button"
                          className="example-chip"
                          onClick={() => setTitle(t)} // ✅ optional improvement
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* If items exist but search filtered to none */}
          {!loading && items.length > 0 && filtered.length === 0 ? (
            <div style={{ opacity: 0.8, padding: "12px 4px" }}>
              No results match your search.
            </div>
          ) : null}

          <div className="items">
            {filtered.map((item) => {
              const isEditing = editingId === item.id;
              const isSaving = savingId === item.id;
              const isDeleting = deletingId === item.id;

              return (
                <div key={item.id} className="item-card">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div className="item-title">
                        {item.title || "Untitled"}
                      </div>
                      <div className="item-meta item-id">ID: {item.id}</div>
                      {Array.isArray(item.tags) && item.tags.length ? (
                        <div className="item-meta">
                          Tags: {item.tags.join(", ")}
                        </div>
                      ) : null}
                    </div>

                    <div className="item-actions">
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={() => setEditingId(isEditing ? null : item.id)}
                        disabled={isDeleting}
                      >
                        {isEditing ? "Close" : "Edit"}
                      </button>

                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => handleDelete(item.id)}
                        disabled={isDeleting || isSaving}
                      >
                        {isDeleting ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </div>

                  {isEditing ? (
                    <EditBlock
                      item={item}
                      saving={isSaving}
                      onSave={(next) => handleSave(item.id, next)}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <div
                      style={{
                        marginTop: 10,
                        whiteSpace: "pre-wrap",
                        opacity: 0.95,
                      }}
                    >
                      {item.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function EditBlock({ item, saving, onSave, onCancel }) {
  const [title, setTitle] = useState(item.title || "");
  const [tagsText, setTagsText] = useState(
    Array.isArray(item.tags) ? item.tags.join(", ") : ""
  );
  const [content, setContent] = useState(item.content || "");
  const [err, setErr] = useState("");

  function validate() {
    if (!title.trim()) return "Title is required.";
    if (!content.trim()) return "Content is required.";
    return "";
  }

  async function save() {
    setErr("");
    const msg = validate();
    if (msg) return setErr(msg);

    await onSave({
      title: title.trim(),
      content: content.trim(),
      tags: tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
  }

  return (
    <div style={{ marginTop: 12 }}>
      <div className="grid-2">
        <div>
          <div className="field-label">Title</div>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={saving}
          />
        </div>
        <div>
          <div className="field-label">Tags</div>
          <input
            className="input"
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            disabled={saving}
          />
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div className="field-label">Content</div>
        <textarea
          className="textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={saving}
        />
      </div>

      {err ? <div className="input-error">{err}</div> : null}

      <div className="admin-actions">
        <button
          type="button"
          className="btn-ghost"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn-glow"
          onClick={save}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
