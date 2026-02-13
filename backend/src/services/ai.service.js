const DEFAULT_FALLBACK =
  "I don’t have enough information in the knowledge base to answer that. Try rephrasing your question or add a relevant knowledge item.";

const DEFAULT_MAX_SOURCES = 3;

function generateAIResponse(message, retrievedItems, options = {}) {
  const maxSources =
    typeof options.maxSources === "number"
      ? options.maxSources
      : DEFAULT_MAX_SOURCES;

  const fallbackText =
    typeof options.fallbackText === "string" && options.fallbackText.trim()
      ? options.fallbackText.trim()
      : DEFAULT_FALLBACK;

  const items = Array.isArray(retrievedItems) ? retrievedItems : [];

  // No matches → fallback
  if (items.length === 0) {
    return { answer: fallbackText, sources: [] };
  }

  const usedItems = items.slice(0, Math.max(0, maxSources));

  // H6: If exactly one match → return content only (more conversational)
  if (usedItems.length === 1) {
    const item = usedItems[0];

    const content =
      typeof item.content === "string" && item.content.trim()
        ? item.content.trim()
        : "(No content provided)";

    const sources = [
      {
        id: item.id,
        title: item.title,
        ...(item.source ? { source: item.source } : {}),
        ...(item.url ? { url: item.url } : {}),
      },
    ];

    return { answer: content, sources };
  }

  // Multiple matches → structured output
  const bullets = usedItems.map((item) => {
    const title =
      typeof item.title === "string" && item.title.trim()
        ? item.title.trim()
        : "Untitled";

    const content =
      typeof item.content === "string" && item.content.trim()
        ? item.content.trim()
        : "(No content provided)";

    return `- ${title}: ${content}`;
  });

  const answer = ["Based on the knowledge base:", ...bullets].join("\n");

  const sources = usedItems.map((item) => {
    const out = { id: item.id, title: item.title };
    if (item.source) out.source = item.source;
    if (item.url) out.url = item.url;
    return out;
  });

  return { answer, sources };
}

module.exports = {
  generateAIResponse,
  DEFAULT_FALLBACK,
  DEFAULT_MAX_SOURCES,
};
