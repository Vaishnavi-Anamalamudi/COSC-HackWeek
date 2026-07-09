import { v4 as uuid } from "uuid";
import { nowIso } from "../utils/helpers.js";

const STORAGE_KEY = "ollama-studio-ai-state-v1";

export function createConversation(title = "New chat") {
  return {
    id: uuid(),
    title,
    messages: [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
    pinned: false,
    favorite: false,
    tags: [],
  };
}

export function defaultSettings() {
  return {
    theme: "dark",
    fontSize: 16,
    streamingSpeed: 18,
    temperature: 0.7,
    maxTokens: 2048,
    systemPrompt: "You are Ollama Studio AI, a concise and helpful local assistant.",
    voiceEnabled: true,
    ttsEnabled: false,
  };
}

export function loadChatState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored?.conversations?.length) {
      return {
        conversations: stored.conversations,
        activeId: stored.activeId || stored.conversations[0].id,
        settings: { ...defaultSettings(), ...stored.settings },
        selectedModel: stored.selectedModel || "",
      };
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }

  const welcome = createConversation("Welcome to Ollama Studio");
  return {
    conversations: [welcome],
    activeId: welcome.id,
    settings: defaultSettings(),
    selectedModel: "",
  };
}

export function saveChatState(state) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      conversations: state.conversations,
      activeId: state.activeId,
      settings: state.settings,
      selectedModel: state.selectedModel,
    }),
  );
}
