import { useState } from 'react';

export default function Console({ onRun }) {
  const [snippet, setSnippet] = useState('print("hello from repl")');
  const [isRunning, setIsRunning] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const nextSnippet = snippet.trim();
    if (!nextSnippet) return;

    setIsRunning(true);
    try {
      await onRun(nextSnippet);
      setSnippet('');
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <form className="border-t border-line bg-ink/60 p-3" onSubmit={submit}>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="nova-repl">
        REPL
      </label>
      <div className="flex gap-2">
        <textarea
          id="nova-repl"
          className="min-h-16 flex-1 resize-none rounded border border-line bg-panelSoft p-3 font-mono text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-nova"
          placeholder="Type a NovaLang snippet"
          value={snippet}
          onChange={(event) => setSnippet(event.target.value)}
        />
        <button className="nova-button nova-button-primary self-stretch" type="submit" disabled={isRunning || !snippet.trim()}>
          Run
        </button>
      </div>
    </form>
  );
}
