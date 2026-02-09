const express = require("express");
const cors = require("cors");

const chatRouter = require("./routes/chat");
const knowledgeRouter = require("./routes/knowledge");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/chat", chatRouter);
app.use("/api/knowledge", knowledgeRouter);

module.exports = app;
