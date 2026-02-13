import { useState } from "react";
import { postChat } from "../lib/api";

function SourcesList({ sources }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Sources</div>
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        {sources.map((s) => (
          <li key={s.id || s.title}>
            <strong>{s.title || "Untitled"}</strong>
            {s.id ? <span style={{ opacity: 0.7 }}> — {s.id}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const trimmed = message.trim();

    if (!trimmed) {
      setError("Please enter a message.");
      return;
    }

    try {
      setLoading(true);
      const result = await postChat(trimmed);
      setAnswer(result.answer || "");
      setSources(result.sources || []);
    } catch (err) {
      setAnswer("");
      setSources([]);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const hasResponse = Boolean(answer);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Chat</h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          placeholder="Ask a question..."
          value={message}
          disabled={loading}
          onChange={(e) => setMessage(e.target.value)}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #333",
            background: "#1a1a1a",
            color: "inherit",
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            background: loading ? "#444" : "#1f6feb",
            color: "white",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </form>

      {error && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: 8,
            background: "#2b1414",
            border: "1px solid #5a1a1a",
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && !hasResponse && (
        <div style={{ marginTop: 16, opacity: 0.7 }}>
          Ask a question to see an answer and sources.
        </div>
      )}

      {loading && <div style={{ marginTop: 16, opacity: 0.7 }}>Thinking…</div>}

      {answer && (
        <div
          style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 8,
            background: "#1a1a1a",
            border: "1px solid #333",
            whiteSpace: "pre-wrap",
          }}
        >
          {answer}
          <SourcesList sources={sources} />
        </div>
      )}
    </div>
  );
}
