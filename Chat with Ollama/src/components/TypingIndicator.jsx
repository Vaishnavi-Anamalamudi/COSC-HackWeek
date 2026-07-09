export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
      <span className="h-2 w-2 rounded-full bg-emerald-500 typing-dot" />
      <span className="h-2 w-2 rounded-full bg-emerald-500 typing-dot" />
      <span className="h-2 w-2 rounded-full bg-emerald-500 typing-dot" />
      <span>Thinking</span>
    </div>
  );
}
