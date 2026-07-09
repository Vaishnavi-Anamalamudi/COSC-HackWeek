import { FiRefreshCw } from "react-icons/fi";
import { useChatContext } from "../context/ChatContext.jsx";

export default function ModelSelector() {
  const { models, selectedModel, setSelectedModel, refreshModels, ollamaStatus } = useChatContext();

  return (
    <div className="hidden items-center gap-2 md:flex">
      <label className="sr-only" htmlFor="model-selector">Model</label>
      <select
        id="model-selector"
        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none transition focus:border-emerald-400 dark:border-white/10 dark:bg-white/5"
        value={selectedModel}
        onChange={(event) => setSelectedModel(event.target.value)}
        title={ollamaStatus.message}
      >
        {models.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>
      <button className="icon-button" onClick={refreshModels} aria-label="Refresh models">
        <FiRefreshCw />
      </button>
    </div>
  );
}
