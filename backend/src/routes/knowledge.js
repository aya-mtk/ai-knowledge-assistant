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
    return res
      .status(500)
      .json({
        ok: false,
        error: { code: "INTERNAL_ERROR", message: "Unexpected error" },
      });

  if (!result.value) return notFound(res);

  return res.json({ ok: true });
});

module.exports = router;
