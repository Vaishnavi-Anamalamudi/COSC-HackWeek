import { useRef, useState } from "react";
import { FiMic, FiPaperclip, FiSend, FiSquare, FiX } from "react-icons/fi";
import { useChatContext } from "../context/ChatContext.jsx";
import { countTokens } from "../utils/helpers.js";

const TEXT_TYPES = [
  "text/plain",
  "text/markdown",
  "application/json",
  "application/javascript",
  "text/javascript",
  "text/css",
  "text/html",
];

export default function ChatInput() {
  const { sendMessage, isStreaming, stopStreaming, settings } = useChatContext();
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [listening, setListening] = useState(false);
  const fileRef = useRef(null);
  const recognitionRef = useRef(null);

  async function handleFiles(files) {
    const next = [];
    for (const file of files) {
      const base = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type || inferType(file.name),
      };
      if (TEXT_TYPES.includes(file.type) || /\.(md|txt|js|jsx|ts|tsx|css|html|json|py|java|c|cpp|go|rs)$/i.test(file.name)) {
        base.text = await file.text();
      }
      next.push(base);
    }
    setAttachments((current) => [...current, ...next]);
  }

  function submit(event) {
    event.preventDefault();
    sendMessage({ content: value, attachments });
    setValue("");
    setAttachments([]);
  }

  function toggleVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");
      setValue((current) => `${current}${current ? " " : ""}${transcript}`.trim());
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  return (
    <footer className="border-t border-slate-200/70 bg-white/85 px-3 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-studio-bg/85 md:px-6">
      <form className="mx-auto max-w-6xl" onSubmit={submit}>
        {attachments.length ? (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((file) => (
              <span key={file.id} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs dark:border-white/10 dark:bg-white/5">
                {file.name} · {Math.ceil(file.size / 1024)} KB
                <button type="button" onClick={() => setAttachments((current) => current.filter((item) => item.id !== file.id))}>
                  <FiX />
                </button>
              </span>
            ))}
          </div>
        ) : null}

        <div className="glass-card flex items-end gap-2 p-2">
          <input
            ref={fileRef}
            className="hidden"
            type="file"
            multiple
            accept=".txt,.pdf,.md,.markdown,.js,.jsx,.ts,.tsx,.css,.html,.json,.py,.java,.c,.cpp,.go,.rs"
            onChange={(event) => handleFiles(event.target.files || [])}
          />
          <button className="icon-button" type="button" onClick={() => fileRef.current?.click()} aria-label="Attach files">
            <FiPaperclip />
          </button>
          <textarea
            className="max-h-44 min-h-12 flex-1 resize-none bg-transparent px-2 py-3 text-sm outline-none placeholder:text-slate-400"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Message Ollama Studio AI..."
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
          />
          {settings.voiceEnabled && (
            <button className={`icon-button ${listening ? "text-emerald-500" : ""}`} type="button" onClick={toggleVoice} aria-label="Voice input">
              <FiMic />
            </button>
          )}
          {isStreaming ? (
            <button className="danger-button px-3" type="button" onClick={stopStreaming}>
              <FiSquare /> Stop
            </button>
          ) : (
            <button className="primary-button px-3" type="submit" disabled={!value.trim() && !attachments.length}>
              <FiSend /> Send
            </button>
          )}
        </div>
        <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Enter to send · Shift+Enter for newline · Ctrl+, for settings</span>
          <span>{countTokens(value)} estimated tokens</span>
        </div>
      </form>
    </footer>
  );
}

function inferType(name) {
  if (/\.pdf$/i.test(name)) return "application/pdf";
  if (/\.md$/i.test(name)) return "text/markdown";
  return "file";
}
