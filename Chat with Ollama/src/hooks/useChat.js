import { useCallback, useMemo, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { createConversation, loadChatState } from "../services/chatStorage.js";
import { streamChat } from "../services/ollamaApi.js";
import { nowIso, titleFromText } from "../utils/helpers.js";

export function useChatCore() {
  const initialState = useMemo(() => loadChatState(), []);
  const [conversations, setConversations] = useState(initialState.conversations);
  const [activeId, setActiveId] = useState(initialState.activeId);
  const [settings, setSettings] = useState(initialState.settings);
  const [selectedModel, setSelectedModel] = useState(initialState.selectedModel);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef(null);

  const activeConversation = conversations.find((conversation) => conversation.id === activeId) || conversations[0];

  const updateConversation = useCallback((id, updater) => {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === id ? { ...updater(conversation), updatedAt: nowIso() } : conversation,
      ),
    );
  }, []);

  const newChat = useCallback(() => {
    const conversation = createConversation();
    setConversations((current) => [conversation, ...current]);
    setActiveId(conversation.id);
  }, []);

  const sendMessage = useCallback(
    async ({ content, attachments = [], regenerate = false }) => {
      if (!content.trim() && !attachments.length) return;
      if (!selectedModel) {
        setError("Select or install an Ollama model first.");
        return;
      }

      const conversation = activeConversation || createConversation();
      let targetId = conversation.id;
      if (!activeConversation) {
        setConversations((current) => [conversation, ...current]);
        setActiveId(conversation.id);
      }

      const userMessage = {
        id: uuid(),
        role: "user",
        content,
        attachments,
        createdAt: nowIso(),
      };
      const assistantMessage = {
        id: uuid(),
        role: "assistant",
        content: "",
        createdAt: nowIso(),
        model: selectedModel,
        responseTimeMs: 0,
      };

      let requestMessages;
      if (regenerate) {
        requestMessages = conversation.messages.filter((message) => message.role !== "assistant");
      } else {
        requestMessages = [...conversation.messages, userMessage];
      }

      setError("");
      setIsStreaming(true);
      abortRef.current = new AbortController();
      const startedAt = performance.now();

      updateConversation(targetId, (current) => {
        const title = current.messages.length ? current.title : titleFromText(content);
        const baseMessages = regenerate
          ? current.messages.filter((message) => message.role !== "assistant")
          : [...current.messages, userMessage];
        return { ...current, title, messages: [...baseMessages, assistantMessage] };
      });

      const apiMessages = [
        { role: "system", content: settings.systemPrompt },
        ...requestMessages.map((message) => ({
          role: message.role,
          content: `${message.content}${formatAttachments(message.attachments)}`,
        })),
      ];

      try {
        await streamChat({
          model: selectedModel,
          messages: apiMessages,
          options: {
            temperature: Number(settings.temperature),
            num_predict: Number(settings.maxTokens),
          },
          signal: abortRef.current.signal,
          onToken: (token) => {
            updateConversation(targetId, (current) => ({
              ...current,
              messages: current.messages.map((message) =>
                message.id === assistantMessage.id
                  ? { ...message, content: message.content + token, responseTimeMs: performance.now() - startedAt }
                  : message,
              ),
            }));
          },
        });
      } catch (streamError) {
        if (streamError.name !== "AbortError") {
          setError(streamError.message || "The Ollama request failed.");
          updateConversation(targetId, (current) => ({
            ...current,
            messages: current.messages.map((message) =>
              message.id === assistantMessage.id
                ? {
                    ...message,
                    content:
                      message.content ||
                      "I could not reach Ollama. Make sure `ollama serve` is running and the selected model is installed.",
                  }
                : message,
            ),
          }));
        }
      } finally {
        setIsStreaming(false);
      }
    },
    [activeConversation, selectedModel, settings.maxTokens, settings.systemPrompt, settings.temperature, updateConversation],
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return {
    conversations,
    setConversations,
    activeId,
    setActiveId,
    activeConversation,
    settings,
    setSettings,
    selectedModel,
    setSelectedModel,
    isStreaming,
    error,
    setError,
    updateConversation,
    newChat,
    sendMessage,
    stopStreaming,
  };
}

function formatAttachments(attachments = []) {
  if (!attachments.length) return "";
  return `\n\nAttached files:\n${attachments
    .map((file) => `- ${file.name} (${file.type || "unknown"}, ${file.size} bytes)\n${file.text ? file.text.slice(0, 6000) : ""}`)
    .join("\n")}`;
}
