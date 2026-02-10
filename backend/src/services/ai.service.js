export const DEFAULT_FALLBACK =
  "I don’t have enough information in the knowledge base to answer that. Try rephrasing your question or add a relevant knowledge item.";

export const DEFAULT_MAX_SOURCES = 3;

export function generateAIResponse(message, retrievedItems, options = {}) {
  const maxSources =
    typeof options.maxSources === "number"
      ? options.maxSources
      : DEFAULT_MAX_SOURCES;
  const fallbackText =
    typeof options.fallbackText === "string" && options.fallbackText.trim()
      ? options.fallbackText.trim()
      : DEFAULT_FALLBACK;

  const items = Array.isArray(retrievedItems) ? retrievedItems : [];

  if (items.length === 0) {
    return { answer: fallbackText, sources: [] };
  }

  const usedItems = items.slice(0, Math.max(0, maxSources));

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
    const sourceObj = {
      id: item.id,
      title: item.title,
    };

    if (item.source) sourceObj.source = item.source;
    if (item.url) sourceObj.url = item.url;

    return sourceObj;
  });

  return { answer, sources };
}
