import { motion } from "framer-motion";
import { useState } from "react";
import { FiCheck, FiCopy, FiEdit3, FiRefreshCw, FiRotateCcw, FiVolume2 } from "react-icons/fi";
import { useChatContext } from "../context/ChatContext.jsx";
import { countTokens } from "../utils/helpers.js";
import MarkdownRenderer from "./MarkdownRenderer.jsx";

export default function MessageBubble({ message, onEdit, onRegenerate }) {
  const { settings } = useChatContext();
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  async function copyMessage() {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  function speak() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(message.content));
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && <Avatar label="AI" />}
      <div className={`max-w-[min(860px,92%)] ${isUser ? "items-end" : "items-start"} flex flex-col gap-2`}>
        <div
          className={`rounded-lg border px-4 py-3 shadow-sm ${
            isUser
              ? "border-emerald-500/30 bg-emerald-500 text-slate-950"
              : "border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.06]"
          }`}
        >
          {message.attachments?.length ? (
            <div className="mb-3 grid gap-2">
              {message.attachments.map((file) => (
                <div key={file.id} className="rounded-lg bg-slate-950/10 px-3 py-2 text-xs dark:bg-white/10">
                  <strong>{file.name}</strong> · {Math.ceil(file.size / 1024)} KB · {file.type || "file"}
                </div>
              ))}
            </div>
          ) : null}
          {isUser ? (
            <p className="whitespace-pre-wrap text-sm leading-7">{message.content}</p>
          ) : (
            <MarkdownRenderer content={message.content || "_Waiting for response..._"} />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 opacity-100 transition md:opacity-0 md:group-hover:opacity-100 dark:text-slate-400">
          <span>{countTokens(message.content)} tokens</span>
          {message.responseTimeMs ? <span>{(message.responseTimeMs / 1000).toFixed(1)}s</span> : null}
          {message.model ? <span>{message.model}</span> : null}
          <button className="inline-flex items-center gap-1 hover:text-emerald-500" onClick={copyMessage}>
            {copied ? <FiCheck /> : <FiCopy />} {copied ? "Copied" : "Copy"}
          </button>
          {isUser ? (
            <button className="inline-flex items-center gap-1 hover:text-emerald-500" onClick={() => onEdit(message)}>
              <FiEdit3 /> Edit
            </button>
          ) : (
            <>
              <button
                className="inline-flex items-center gap-1 hover:text-emerald-500"
                onClick={() => onRegenerate(message.id)}
              >
                <FiRefreshCw /> Regenerate
              </button>
              <button
                className="inline-flex items-center gap-1 hover:text-emerald-500"
                onClick={() => onRegenerate(message.id)}
              >
                <FiRotateCcw /> Retry
              </button>
              {settings.ttsEnabled && (
                <button className="inline-flex items-center gap-1 hover:text-emerald-500" onClick={speak}>
                  <FiVolume2 /> Speak
                </button>
              )}
            </>
          )}
        </div>
      </div>
      {isUser && <Avatar label="You" />}
    </motion.article>
  );
}

function Avatar({ label }) {
  return (
    <div className="mt-1 hidden h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-900 text-xs font-black text-emerald-400 dark:bg-emerald-500 dark:text-slate-950 md:grid">
      {label}
    </div>
  );
}
