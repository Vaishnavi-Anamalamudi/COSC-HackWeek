import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

export async function checkOllamaHealth() {
  const response = await api.get("/health");
  return response.data;
}

export async function fetchModels() {
  const response = await api.get("/ollama/tags");
  return response.data.models || [];
}

export async function streamChat({ model, messages, options, onToken, signal }) {
  const response = await fetch("/api/ollama/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, options }),
    signal,
  });

  if (!response.ok || !response.body) {
    let message = "Ollama request failed.";
    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      message = await response.text();
    }
    throw new Error(message);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let metadata = {};

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.trim()) continue;
      const parsed = JSON.parse(line);
      if (parsed.message?.content) onToken(parsed.message.content);
      if (parsed.done) metadata = parsed;
    }
  }

  return metadata;
}
