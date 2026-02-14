// backend/src/routes/knowledge.js
const express = require("express");
const router = express.Router();

const knowledge = require("../services/knowledge.service");

function notFound(res) {
  return res.status(404).json({
    ok: false,
    error: { code: "NOT_FOUND", message: "Knowledge item not found" },
  });
}

function validationError(res, error) {
  return res.status(400).json({
    ok: false,
    error: error?.code
      ? error
      : { code: "VALIDATION_ERROR", message: "Invalid request" },
  });
}

// GET /api/knowledge -> list
router.get("/", (req, res) => {
  const items = knowledge.list();
  return res.json({ ok: true, data: items });
});

// GET /api/knowledge/:id -> get one
router.get("/:id", (req, res) => {
  const item = knowledge.getById(req.params.id);
  if (!item) return notFound(res);
  return res.json({ ok: true, data: item });
});

// POST /api/knowledge/demo-pack
router.post("/demo-pack", (req, res) => {
  // Optional: prevent duplicates unless forced
  const force = String(req.query.force || "").toLowerCase() === "true";

  const existing = knowledge.list();
  if (!force && existing.length > 0) {
    return res.status(400).json({
      ok: false,
      error: {
        code: "ALREADY_POPULATED",
        message:
          "Knowledge base already has items. Use ?force=true to load demo pack anyway.",
      },
    });
  }

  const demoItems = [
    {
      title: "Greeting",
      content:
        "If a user says hi/hello/hey, greet them politely and ask what they want to learn from the knowledge base.",
      tags: ["hi", "hello", "hey", "greeting"],
    },
    {
      title: "Nodex Product Overview",
      content:
        "Nodex is a knowledge assistant that answers questions strictly from an admin-managed knowledge base. It returns grounded responses and a safe fallback when no matching knowledge exists.",
      tags: ["product", "overview", "nodex", "assistant"],
    },
    {
      title: "How Nodex Answers Questions",
      content:
        "Nodex uses retrieval-based Q&A. It finds relevant knowledge items by keyword matching (title/content/tags), then generates a deterministic response from the matched items. If nothing matches, it returns the fallback message.",
      tags: ["retrieval", "keyword", "matching", "how-it-works"],
    },
    {
      title: "Admin Console Purpose",
      content:
        "The Admin Console manages the knowledge base: create, edit, delete items. Updating knowledge changes what the assistant can answer.",
      tags: ["admin", "console", "knowledge", "management"],
    },
    {
      title: "System Health Indicators",
      content:
        "Health indicators simulate operational status: Knowledge Nodes (count), System Health (overall state), Embedding Index (placeholder for future semantic search).",
      tags: ["health", "status", "monitoring"],
    },
    {
      title: "Authentication Flow (Planned)",
      content:
        "Production design (future): token-based auth. Users log in, backend issues a token, protected endpoints validate token. Admin features would be restricted to authorized roles.",
      tags: ["auth", "security", "tokens", "planned"],
    },
    {
      title: "Onboarding Guidance",
      content:
        "To get the best answers, ask clear questions using keywords that appear in your knowledge items. If Nodex returns fallback, add or improve the relevant knowledge item in Admin.",
      tags: ["onboarding", "help", "tips"],
    },
    {
      title: "Roadmap",
      content:
        "Future improvements: semantic search with embeddings, vector database support, relevance ranking, analytics dashboard, and optional real LLM integration with safety controls.",
      tags: ["roadmap", "future", "embeddings", "vector-db"],
    },
    {
      title: "Password Reset",
      content:
        "To reset your password, click 'Forgot Password' and follow the email link to set a new password.",
      tags: ["password", "reset", "auth"],
    },
    {
      title: "Support Contact",
      content:
        "If you need help, contact support via your internal support channel or update the knowledge base with the missing information so Nodex can answer accurately.",
      tags: ["support", "help", "contact"],
    },
  ];

  // If force=true, clear first (best-effort)
  if (force && existing.length > 0) {
    for (const item of existing) {
      knowledge.remove(item.id);
    }
  }

  const inserted = [];
  for (const item of demoItems) {
    const result = knowledge.create(item);
    if (result.ok) inserted.push(result.value);
  }

  return res.status(201).json({
    ok: true,
    data: { insertedCount: inserted.length },
  });
});

// POST /api/knowledge -> create
router.post("/", (req, res) => {
  const result = knowledge.create(req.body);

  if (!result.ok) return validationError(res, result.error);

  return res.status(201).json({ ok: true, data: result.value });
});

// PUT /api/knowledge/:id -> update
router.put("/:id", (req, res) => {
  const result = knowledge.update(req.params.id, req.body);

  if (!result.ok) return validationError(res, result.error);

  // service returns value: null when not found
  if (!result.value) return notFound(res);

  return res.json({ ok: true, data: result.value });
});

// DELETE /api/knowledge/:id -> delete
router.delete("/:id", (req, res) => {
  const result = knowledge.remove(req.params.id);

  if (!result.ok)
    return res.status(500).json({
      ok: false,
      error: { code: "INTERNAL_ERROR", message: "Unexpected error" },
    });

  if (!result.value) return notFound(res);

  return res.json({ ok: true });
});

module.exports = router;
