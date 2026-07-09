import { useCallback, useEffect, useState } from "react";
import { FALLBACK_MODELS } from "../constants/models.js";
import { checkOllamaHealth, fetchModels } from "../services/ollamaApi.js";
import { safeModelName } from "../utils/helpers.js";

export function useOllama(selectedModel, setSelectedModel) {
  const [models, setModels] = useState([]);
  const [status, setStatus] = useState({ ok: false, message: "Checking Ollama..." });

  const refreshModels = useCallback(async () => {
    try {
      const [health, installed] = await Promise.all([checkOllamaHealth(), fetchModels()]);
      const names = installed.map(safeModelName).filter(Boolean);
      setModels(names.length ? names : FALLBACK_MODELS);
      setStatus({ ok: Boolean(health.ok), message: health.ok ? "Ollama connected" : "Ollama offline" });
      if (!selectedModel && names[0]) setSelectedModel(names[0]);
    } catch (error) {
      setModels(FALLBACK_MODELS);
      setStatus({ ok: false, message: error.message || "Ollama offline" });
      if (!selectedModel) setSelectedModel(FALLBACK_MODELS[0]);
    }
  }, [selectedModel, setSelectedModel]);

  useEffect(() => {
    refreshModels();
    const timer = window.setInterval(refreshModels, 30000);
    return () => window.clearInterval(timer);
  }, [refreshModels]);

  return { models, status, refreshModels };
}
