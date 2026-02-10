const express = require("express");
const router = express.Router();

const { generateAIResponse } = require("../services/ai.service");
const { retrieveKnowledgeMatches } = require("../services/retrieval.service"); // ✅ add

const MAX_MESSAGE_LENGTH = 1000;

router.post("/", (req, res) => {
  const body = req.body;

  if (!body || body.message === undefined) {
    return res
      .status(400)
      .json({ error: "Message is required and must be a non-empty string." });
  }

  if (typeof body.message !== "string") {
    return res.status(400).json({ error: "Message must be a string." });
  }

  const message = body.message.trim();

  if (!message) {
    return res
      .status(400)
      .json({ error: "Message is required and must be a non-empty string." });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return res
      .status(400)
      .json({ error: "Message must be 1000 characters or fewer." });
  }

  // H3: retrieve matches from the knowledge store (A2/A3)
  const retrievedItems = retrieveKnowledgeMatches(message);

  const result = generateAIResponse(message, retrievedItems);
  return res.status(200).json(result);
});

module.exports = router;
