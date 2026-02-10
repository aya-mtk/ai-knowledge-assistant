// backend/src/services/retrieval.service.js

const knowledgeService = require("./knowledge.service");

const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "to",
  "of",
  "in",
  "on",
  "for",
  "with",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "it",
  "this",
  "that",
  "as",
  "at",
  "by",
  "from",
]);

const MAX_MATCHES = 3;

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokenizeMessage(message) {
  const normalized = normalizeText(message);
  if (!normalized) return [];

  const raw = normalized.split(" ").filter(Boolean);

  const seen = new Set();
  const keywords = [];

  for (const token of raw) {
    if (token.length < 2) continue;
    if (STOPWORDS.has(token)) continue;
    if (seen.has(token)) continue;
    seen.add(token);
    keywords.push(token);
  }

  return keywords;
}

function countHits(keywords, text) {
  if (!text) return 0;
  let hits = 0;
  for (const kw of keywords) {
    if (text.includes(kw)) hits += 1; // substring match, explainable
  }
  return hits;
}

function retrieveKnowledgeMatches(message) {
  const keywords = tokenizeMessage(message);
  if (keywords.length === 0) return [];

  const items = knowledgeService.list();

  const scored = items
    .map((item) => {
      const titleText = normalizeText(item.title);
      const contentText = normalizeText(item.content);
      const tagsText = Array.isArray(item.tags)
        ? normalizeText(item.tags.join(" "))
        : "";

      const titleHits = countHits(keywords, titleText);
      const tagHits = countHits(keywords, tagsText);
      const contentHits = countHits(keywords, contentText);

      const score = titleHits * 3 + tagHits * 2 + contentHits * 1;
      return { item, score };
    })
    .filter((x) => x.score > 0);

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;

    const at = normalizeText(a.item.title);
    const bt = normalizeText(b.item.title);
    if (at < bt) return -1;
    if (at > bt) return 1;

    const aid = String(a.item.id || "");
    const bid = String(b.item.id || "");
    return aid.localeCompare(bid);
  });

  return scored.slice(0, MAX_MATCHES).map((x) => x.item);
}

module.exports = { retrieveKnowledgeMatches };
