import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { FiCpu, FiDownload, FiMessageSquare, FiZap } from "react-icons/fi";
import { PROMPT_TEMPLATES } from "../constants/models.js";
import { useChatContext } from "../context/ChatContext.jsx";
import { conversationToMarkdown, conversationToText } from "../utils/markdown.js";
import { downloadFile } from "../utils/helpers.js";
import MessageBubble from "./MessageBubble.jsx";
import TypingIndicator from "./TypingIndicator.jsx";

export default function ChatWindow() {
  const {
    activeConversation,
    conversations,
    updateConversation,
    sendMessage,
    isStreaming,
    error,
    selectedModel,
    ollamaStatus,
    setSettingsOpen,
  } = useChatContext();
  const scrollerRef = useRef(null);
  const [editingMessage, setEditingMessage] = useState(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [activeConversation?.messages, isStreaming]);

  useEffect(() => {
    function onShortcut(event) {
      if ((event.ctrlKey || event.metaKey) && event.key === ",") {
        event.preventDefault();
        setSettingsOpen(true);
      }
    }
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, [setSettingsOpen]);

  const stats = useMemo(() => {
    const messages = activeConversation?.messages || [];
    return {
      chats: conversations.length,
      messages: messages.length,
      model: selectedModel || "No model",
    };
  }, [activeConversation?.messages, conversations.length, selectedModel]);

  function exportConversation(type) {
    if (!activeConversation) return;
    const name = activeConversation.title.replace(/[^\w-]+/g, "-").toLowerCase();
    if (type === "json") {
      downloadFile(`${name}.json`, JSON.stringify(activeConversation, null, 2), "application/json");
    }
    if (type === "md") {
      downloadFile(`${name}.md`, conversationToMarkdown(activeConversation), "text/markdown");
    }
    if (type === "txt") {
      downloadFile(`${name}.txt`, conversationToText(activeConversation), "text/plain");
    }
    if (type === "pdf") {
      import("html2pdf.js").then(({ default: html2pdf }) => {
        const element = document.createElement("div");
        element.innerHTML = `<h1>${activeConversation.title}</h1><pre>${escapeHtml(conversationToText(activeConversation))}</pre>`;
        html2pdf().from(element).save(`${name}.pdf`);
      });
    }
  }

  function clearChat() {
    if (!activeConversation || !confirm("Clear all messages in this chat?")) return;
    updateConversation(activeConversation.id, (conversation) => ({ ...conversation, messages: [] }));
  }

  function editUserMessage(nextText) {
    if (!editingMessage || !activeConversation) return;
    updateConversation(activeConversation.id, (conversation) => ({
      ...conversation,
      messages: conversation.messages.map((message) =>
        message.id === editingMessage.id ? { ...message, content: nextText } : message,
      ),
    }));
    setEditingMessage(null);
  }

  function regenerateFrom(messageId) {
    if (!activeConversation) return;
    const index = activeConversation.messages.findIndex((message) => message.id === messageId);
    const previous = [...activeConversation.messages.slice(0, index)].reverse().find((message) => message.role === "user");
    if (previous) sendMessage({ content: previous.content, attachments: previous.attachments || [], regenerate: true });
  }

  return (
    <section ref={scrollerRef} className="min-h-0 flex-1 overflow-y-auto px-3 py-5 md:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        {error ? (
          <div className="rounded-lg border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-600 dark:text-amber-300">
            {error}
          </div>
        ) : null}

        {!activeConversation?.messages.length ? (
          <LandingPanel stats={stats} status={ollamaStatus} sendMessage={sendMessage} />
        ) : (
          <>
            <div className="glass-card flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
                <span className="status-pill status-online">{stats.messages} messages</span>
                <span className={`status-pill ${ollamaStatus.ok ? "status-online" : "status-offline"}`}>
                  {ollamaStatus.ok ? "Ollama connected" : "Ollama offline"}
                </span>
                <span className="status-pill bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300">
                  {stats.model}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="secondary-button" onClick={() => exportConversation("md")}>Markdown</button>
                <button className="secondary-button" onClick={() => exportConversation("txt")}>TXT</button>
                <button className="secondary-button" onClick={() => exportConversation("json")}>JSON</button>
                <button className="secondary-button" onClick={() => exportConversation("pdf")}>PDF</button>
                <button className="danger-button" onClick={clearChat}>Clear</button>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {activeConversation.messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onEdit={setEditingMessage}
                  onRegenerate={regenerateFrom}
                />
              ))}
            </AnimatePresence>
            {isStreaming && <TypingIndicator />}
          </>
        )}
      </div>

      <AnimatePresence>
        {editingMessage && (
          <EditDialog
            message={editingMessage}
            onClose={() => setEditingMessage(null)}
            onSave={editUserMessage}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function LandingPanel({ stats, status, sendMessage }) {
  return (
    <div className="grid gap-5">
      <section className="relative overflow-hidden rounded-lg border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 dark:border-white/10 dark:bg-white/[0.06] dark:shadow-studio md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(34,197,94,0.18),transparent_32%),radial-gradient(circle_at_82%_12%,rgba(56,189,248,0.14),transparent_28%)]" />
        <div className="relative max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-500">Local-first AI workspace</p>
          <h2 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">Chat with private Ollama models.</h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300">
            A polished assistant for local LLM work: streaming responses, Markdown, code blocks, model switching,
            persistent chat history, exports, voice tools, and robust offline handling.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className={`status-pill ${status.ok ? "status-online" : "status-offline"}`}>
              {status.ok ? "Ollama connected" : "Start Ollama to chat"}
            </span>
            <span className="status-pill bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300">
              {stats.model}
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {PROMPT_TEMPLATES.map((template) => (
          <motion.button
            key={template.title}
            whileHover={{ y: -4 }}
            className="glass-card p-4 text-left"
            onClick={() => sendMessage({ content: template.prompt })}
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500">
              <FiZap />
            </div>
            <h3 className="font-bold">{template.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">{template.prompt}</p>
          </motion.button>
        ))}
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <InfoCard icon={<FiCpu />} title="Model aware" text="Detects installed Ollama models and keeps the active model visible." />
        <InfoCard icon={<FiMessageSquare />} title="Persistent history" text="Recent chats, pinned chats, favorites, tags, and search live in LocalStorage." />
        <InfoCard icon={<FiDownload />} title="Export ready" text="Save conversations as Markdown, TXT, JSON, or PDF for sharing and archiving." />
      </section>
    </div>
  );
}

function InfoCard({ icon, title, text }) {
  return (
    <article className="glass-card p-4">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500">
        {icon}
      </div>
      <h3 className="font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">{text}</p>
    </article>
  );
}

function EditDialog({ message, onClose, onSave }) {
  const [value, setValue] = useState(message.content);
  return (
    <motion.div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="glass-card w-full max-w-2xl p-4" initial={{ y: 20 }} animate={{ y: 0 }}>
        <h2 className="text-lg font-bold">Edit message</h2>
        <textarea className="input-field mt-3 min-h-40" value={value} onChange={(event) => setValue(event.target.value)} />
        <div className="mt-4 flex justify-end gap-2">
          <button className="secondary-button" onClick={onClose}>Cancel</button>
          <button className="primary-button" onClick={() => onSave(value)}>Save</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
