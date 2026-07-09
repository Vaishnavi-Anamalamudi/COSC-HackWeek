import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { FiCheck, FiCopy } from "react-icons/fi";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import { useChatContext } from "../context/ChatContext.jsx";

export default function MarkdownRenderer({ content }) {
  const { settings } = useChatContext();
  const dark = settings.theme === "dark";

  return (
    <div className="prose-studio text-sm leading-7 text-slate-800 dark:text-slate-100">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const code = String(children).replace(/\n$/, "");
            if (inline) {
              return (
                <code className="rounded bg-slate-200 px-1.5 py-0.5 text-[0.86em] dark:bg-slate-900" {...props}>
                  {children}
                </code>
              );
            }

            return <CodeBlock code={code} language={match?.[1] || "text"} dark={dark} />;
          },
          a({ children, href }) {
            return (
              <a className="text-emerald-500 underline-offset-4 hover:underline" href={href} target="_blank" rel="noreferrer">
                {children}
              </a>
            );
          },
          table({ children }) {
            return <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-white/10"><table className="w-full text-left">{children}</table></div>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function CodeBlock({ code, language, dark }) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="my-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-950 dark:border-white/10">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-xs text-slate-300">
        <span className="font-semibold uppercase tracking-wide">{language}</span>
        <button className="inline-flex items-center gap-1 rounded px-2 py-1 hover:bg-white/10" onClick={copyCode}>
          {copied ? <FiCheck /> : <FiCopy />} {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={dark ? oneDark : oneLight}
        customStyle={{ margin: 0, borderRadius: 0, background: dark ? "#020617" : "#f8fafc" }}
        wrapLongLines
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
