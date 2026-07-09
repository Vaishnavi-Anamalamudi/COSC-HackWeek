import { motion } from "framer-motion";
import {
  FiCpu,
  FiMic,
  FiMoon,
  FiRefreshCw,
  FiRotateCcw,
  FiSliders,
  FiSun,
  FiVolume2,
  FiX,
} from "react-icons/fi";
import { useChatContext } from "../context/ChatContext.jsx";
import { defaultSettings } from "../services/chatStorage.js";

export default function Settings() {
  const {
    settings,
    setSettings,
    setSettingsOpen,
    models,
    selectedModel,
    setSelectedModel,
    refreshModels,
    ollamaStatus,
  } = useChatContext();

  function updateSetting(key, value) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function resetSettings() {
    setSettings((current) => ({ ...defaultSettings(), theme: current.theme }));
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setSettingsOpen(false)}
    >
      <motion.section
        className="flex h-full w-full max-w-xl flex-col bg-white text-slate-950 shadow-2xl dark:bg-studio-bg dark:text-studio-text"
        initial={{ x: 48, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 48, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500">
              <FiSliders />
            </div>
            <div>
              <h2 className="text-lg font-black">Settings</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{ollamaStatus.message}</p>
            </div>
          </div>
          <button className="icon-button" onClick={() => setSettingsOpen(false)} aria-label="Close settings">
            <FiX />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <div className="grid gap-5">
            <section className="grid gap-3">
              <SectionTitle icon={<FiCpu />} title="Model" />
              <div className="flex gap-2">
                <select
                  className="input-field"
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
            </section>

            <section className="grid gap-3">
              <SectionTitle icon={settings.theme === "dark" ? <FiMoon /> : <FiSun />} title="Appearance" />
              <div className="grid grid-cols-2 gap-2">
                <button
                  className={`secondary-button ${settings.theme === "dark" ? "border-emerald-400 text-emerald-500" : ""}`}
                  onClick={() => updateSetting("theme", "dark")}
                >
                  <FiMoon /> Dark
                </button>
                <button
                  className={`secondary-button ${settings.theme === "light" ? "border-emerald-400 text-emerald-500" : ""}`}
                  onClick={() => updateSetting("theme", "light")}
                >
                  <FiSun /> Light
                </button>
              </div>
              <LabeledRange
                label="Font size"
                value={settings.fontSize}
                min="14"
                max="20"
                step="1"
                suffix="px"
                onChange={(value) => updateSetting("fontSize", Number(value))}
              />
            </section>

            <section className="grid gap-3">
              <SectionTitle icon={<FiSliders />} title="Generation" />
              <LabeledRange
                label="Temperature"
                value={settings.temperature}
                min="0"
                max="2"
                step="0.1"
                onChange={(value) => updateSetting("temperature", Number(value))}
              />
              <LabeledRange
                label="Max tokens"
                value={settings.maxTokens}
                min="256"
                max="8192"
                step="256"
                onChange={(value) => updateSetting("maxTokens", Number(value))}
              />
              <LabeledRange
                label="Streaming speed"
                value={settings.streamingSpeed}
                min="5"
                max="40"
                step="1"
                suffix="ms"
                onChange={(value) => updateSetting("streamingSpeed", Number(value))}
              />
            </section>

            <section className="grid gap-3">
              <SectionTitle icon={<FiMic />} title="Voice" />
              <ToggleRow
                icon={<FiMic />}
                label="Voice input"
                checked={settings.voiceEnabled}
                onChange={(checked) => updateSetting("voiceEnabled", checked)}
              />
              <ToggleRow
                icon={<FiVolume2 />}
                label="Read responses aloud"
                checked={settings.ttsEnabled}
                onChange={(checked) => updateSetting("ttsEnabled", checked)}
              />
            </section>

            <section className="grid gap-3">
              <SectionTitle icon={<FiSliders />} title="System Prompt" />
              <textarea
                className="input-field min-h-32 resize-y"
                value={settings.systemPrompt}
                onChange={(event) => updateSetting("systemPrompt", event.target.value)}
              />
            </section>
          </div>
        </div>

        <footer className="flex flex-wrap justify-between gap-2 border-t border-slate-200 px-5 py-4 dark:border-white/10">
          <button className="secondary-button" onClick={resetSettings}>
            <FiRotateCcw /> Reset
          </button>
          <button className="primary-button" onClick={() => setSettingsOpen(false)}>
            Done
          </button>
        </footer>
      </motion.section>
    </motion.div>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
      <span className="text-emerald-500">{icon}</span>
      <span>{title}</span>
    </div>
  );
}

function LabeledRange({ label, value, min, max, step, suffix = "", onChange }) {
  return (
    <label className="grid gap-2 rounded-lg border border-slate-200 bg-slate-100 p-3 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold">{label}</span>
        <span className="text-slate-500 dark:text-slate-400">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="accent-emerald-500"
      />
    </label>
  );
}

function ToggleRow({ icon, label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-100 p-3 dark:border-white/10 dark:bg-white/5">
      <span className="flex items-center gap-2 text-sm font-semibold">
        <span className="text-emerald-500">{icon}</span>
        {label}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 accent-emerald-500"
      />
    </label>
  );
}
