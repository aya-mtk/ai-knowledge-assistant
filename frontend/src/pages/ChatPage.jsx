import { useState } from "react";
import { postChat } from "../lib/api";

function AICorePulse({ active }) {
  return (
    <div className={`ai-core ${active ? "ai-core--active" : ""}`}>
      <div className="ai-core__inner" />
    </div>
  );
}

function NeuralBackground() {
  return (
    <svg
      className="neural-bg"
      viewBox="0 0 1200 800"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3B82F6" stopOpacity="0.55" />
          <stop offset="1" stopColor="#8B5CF6" stopOpacity="0.25" />
        </linearGradient>
        <filter id="blur">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>

      <g stroke="url(#g)" strokeWidth="1" filter="url(#blur)">
        <path d="M120 240 L320 140 L520 260 L760 120 L1020 240" />
        <path d="M200 520 L420 420 L640 560 L860 430 L1100 520" />
        <path d="M140 360 L360 300 L580 420 L820 300 L1040 380" />
      </g>

      <g fill="#3B82F6">
        {[
          [120, 240],
          [320, 140],
          [520, 260],
          [760, 120],
          [1020, 240],
          [200, 520],
          [420, 420],
          [640, 560],
          [860, 430],
          [1100, 520],
          [140, 360],
          [360, 300],
          [580, 420],
          [820, 300],
          [1040, 380],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3.6" opacity="0.75" />
        ))}
      </g>
    </svg>
  );
}

function SourcesList({ sources }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="sources">
      <div className="sources-title">Sources</div>
      <ul className="sources-list">
        {sources.map((s) => (
          <li key={s.id || s.title}>
            {s.url ? (
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {s.title || "Untitled"}
              </a>
            ) : (
              <span>{s.title || "Untitled"}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [lastUserMessage, setLastUserMessage] = useState("");

  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);

  const [loading, setLoading] = useState(false);
  const [inputError, setInputError] = useState("");
  const [apiError, setApiError] = useState("");

  async function handleSend(e) {
    e.preventDefault();
    setInputError("");
    setApiError("");

    const trimmed = message.trim();
    if (!trimmed) {
      setInputError("Please enter a question.");
      return;
    }

    // Clear previous response when sending a new one (feels cleaner)
    setLastUserMessage(trimmed);
    setMessage("");
    setAnswer("");
    setSources([]);

    try {
      setLoading(true);
      const res = await postChat(trimmed);
      setAnswer(res.answer);
      setSources(res.sources || []);
    } catch (err) {
      setApiError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function applyPrompt(text) {
    setMessage(text);
    setInputError("");
    setApiError("");
  }

  return (
    <div className="chat-page">
      <NeuralBackground />

      <div className="chat-shell">
        <div className="chat-header">
          <AICorePulse active={loading} />
          <div>
            <h1 className="chat-title">Nodex</h1>
            <p className="chat-subtitle">
              AI-powered knowledge assistant for your documentation.
            </p>
          </div>
        </div>

        <div className="glass-panel">
          <div className="messages-area">
            {!lastUserMessage && !answer && !loading && !apiError ? (
              <div className="empty-state">
                <div className="empty-title">Ask your knowledge base</div>
                <div className="empty-subtitle">Try one of these:</div>

                <div className="chips">
                  <button
                    type="button"
                    className="chip"
                    onClick={() => applyPrompt("How do I reset my password?")}
                  >
                    How do I reset my password?
                  </button>
                  <button
                    type="button"
                    className="chip"
                    onClick={() => applyPrompt("Explain authentication flow")}
                  >
                    Explain authentication flow
                  </button>
                  <button
                    type="button"
                    className="chip"
                    onClick={() =>
                      applyPrompt("Where is onboarding documented?")
                    }
                  >
                    Where is onboarding documented?
                  </button>
                </div>
              </div>
            ) : null}

            {apiError ? <div className="error-box">{apiError}</div> : null}

            {lastUserMessage ? (
              <div className="bubble bubble-user">
                <div className="bubble-label">You</div>
                <div>{lastUserMessage}</div>
              </div>
            ) : null}

            {loading ? (
              <div className="bubble bubble-ai">
                <div className="bubble-label">Nodex</div>
                <div className="typing">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
              </div>
            ) : null}

            {answer && !loading ? (
              <div className="bubble bubble-ai">
                <div className="bubble-label">Nodex</div>
                <div className="answer-text">{answer}</div>
              </div>
            ) : null}
          </div>

          <form className="composer" onSubmit={handleSend}>
            <input
              className="composer-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask a question…"
              disabled={loading}
            />
            <button className="composer-send" type="submit" disabled={loading}>
              {loading ? "Sending…" : "Send"}
            </button>
          </form>

          {inputError ? <div className="input-error">{inputError}</div> : null}
        </div>
      </div>
    </div>
  );
}
