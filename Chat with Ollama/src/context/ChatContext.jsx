import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useChatCore } from "../hooks/useChat.js";
import { useOllama } from "../hooks/useOllama.js";
import { saveChatState } from "../services/chatStorage.js";

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const chat = useChatCore();
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const ollama = useOllama(chat.selectedModel, chat.setSelectedModel);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", chat.settings.theme === "dark");
    document.documentElement.style.fontSize = `${chat.settings.fontSize}px`;
  }, [chat.settings.fontSize, chat.settings.theme]);

  useEffect(() => {
    saveChatState(chat);
  }, [chat]);

  const value = useMemo(
    () => ({
      ...chat,
      models: ollama.models,
      ollamaStatus: ollama.status,
      refreshModels: ollama.refreshModels,
      searchQuery,
      setSearchQuery,
      sidebarOpen,
      setSidebarOpen,
      settingsOpen,
      setSettingsOpen,
      toggleTheme: () =>
        chat.setSettings((current) => ({ ...current, theme: current.theme === "dark" ? "light" : "dark" })),
    }),
    [chat, ollama.models, ollama.refreshModels, ollama.status, searchQuery, settingsOpen, sidebarOpen],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChatContext must be used within ChatProvider");
  return context;
}
