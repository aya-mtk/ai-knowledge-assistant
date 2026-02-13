import { useMemo, useState } from "react";
import { postChat } from "../lib/api";

// Keep this exactly aligned with backend DEFAULT_FALLBACK (ai.service.js)
const NO_MATCH_FALLBACK =
  "I don’t have enough information in the knowledge base to answer that. Try rephrasing your question or add a relevant knowledge item.";

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

function Callout({ kind = "info", title, children }) {
  const styles = useMemo(() => {
    if (kind === "error") {
      return {
        background: "#2b1414",
        border: "1px solid #5a1a1a",
        titleColor: "#ffb4b4",
      };
    }
    // info
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

export default function ChatPage() {
  const [message, setMessage] = useState("");

  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);

  const [loading, setLoading] = useState(false);

  // Separate messages so UX is clear
  const [inputError, setInputError] = useState("");
  const [apiError, setApiError] = useState("");

  const isNoMatch =
    answer === NO_MATCH_FALLBACK &&
    Array.isArray(sources) &&
    sources.length === 0;

  async function handleSubmit(e) {
    e.preventDefault();

    setInputError("");
    setApiError("");

    const trimmed = message.trim();

    if (!trimmed) {
      setInputError("Please enter a question.");
      return;
    }

    try {
      setLoading(true);

      const result = await postChat(trimmed);

      setAnswer(result.answer);
      setSources(result.sources);

      // Optional: keep the input text so user can tweak; or clear it:
      // setMessage("");
    } catch (err) {
      setAnswer("");
      setSources([]);
      setApiError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const showEmptyState = !loading && !apiError && !answer;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Chat</h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          placeholder="Ask a question..."
          value={message}
          disabled={loading}
          onChange={(e) => {
            setMessage(e.target.value);

            // Clear prior results as soon as user starts a new question
            if (answer) setAnswer("");
            if (sources.length) setSources([]);
            if (apiError) setApiError("");
            if (inputError) setInputError("");
          }}
          onKeyDown={() => {
            // Clear “empty input” warning as soon as user starts typing again
            if (inputError) setInputError("");
          }}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 8,
            border: inputError ? "1px solid #a33" : "1px solid #333",
            background: "#1a1a1a",
            color: "inherit",
            outline: "none",
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
          {loading ? "Sending…" : "Send"}
        </button>
      </form>

      {inputError ? (
        <div style={{ marginTop: 8, color: "#ff9b9b" }}>{inputError}</div>
      ) : null}

      {loading ? (
        <div style={{ marginTop: 12, opacity: 0.75 }}>Thinking…</div>
      ) : null}

      {apiError ? (
        <Callout kind="error" title="Something went wrong">
          {apiError}
        </Callout>
      ) : null}

      {showEmptyState ? (
        <div style={{ marginTop: 16, opacity: 0.7 }}>
          Ask a question to see an answer and sources.
        </div>
      ) : null}

      {answer ? (
        <>
          {isNoMatch ? (
            <Callout kind="info" title="No matching knowledge found">
              Try different keywords, or add a relevant knowledge item in Admin.
            </Callout>
          ) : null}

          <div
            style={{
              marginTop: 16,
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
        </>
      ) : null}
    </div>
  );
}
