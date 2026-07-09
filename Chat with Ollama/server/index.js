import cors from "cors";
import express from "express";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const PORT = Number(process.env.PORT || 3333);

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

app.get("/api/health", async (_req, res) => {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    res.json({ ok: response.ok, ollamaUrl: OLLAMA_BASE_URL });
  } catch (error) {
    res.status(503).json({
      ok: false,
      ollamaUrl: OLLAMA_BASE_URL,
      message: "Ollama is offline or unreachable.",
      detail: error.message,
    });
  }
});

app.get("/api/ollama/tags", async (_req, res) => {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(503).json({
      models: [],
      message: "Could not connect to Ollama. Start Ollama and pull a model first.",
      detail: error.message,
    });
  }
});

app.post("/api/ollama/chat", async (req, res) => {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...req.body, stream: true }),
    });

    if (!response.ok || !response.body) {
      const text = await response.text();
      res.status(response.status).json({ message: text || "Ollama chat request failed." });
      return;
    }

    res.setHeader("Content-Type", "application/x-ndjson");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const reader = response.body.getReader();
    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(Buffer.from(value));
      }
      res.end();
    };

    req.on("close", () => reader.cancel().catch(() => {}));
    await pump();
  } catch (error) {
    if (!res.headersSent) {
      res.status(503).json({
        message: "Ollama is offline or the selected model is unavailable.",
        detail: error.message,
      });
    } else {
      res.end();
    }
  }
});

app.post("/api/ollama/generate", async (req, res) => {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(503).json({ message: "Ollama generate request failed.", detail: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Ollama Studio proxy running on http://localhost:${PORT}`);
  console.log(`Proxying Ollama at ${OLLAMA_BASE_URL}`);
});
