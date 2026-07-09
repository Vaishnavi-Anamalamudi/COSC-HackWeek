export default function Sidebar({ examples, onSelect, stats }) {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-line bg-panel px-4 py-5 lg:block">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-nova">Tiny Programming Language</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-50">NovaLang</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">A browser IDE for exploring the lexer, parser, interpreter, and runtime state.</p>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-2">
        <div className="rounded border border-line bg-panelSoft p-2">
          <p className="text-lg font-semibold text-slate-100">{stats.tokens}</p>
          <p className="text-xs text-slate-500">Tokens</p>
        </div>
        <div className="rounded border border-line bg-panelSoft p-2">
          <p className="text-lg font-semibold text-slate-100">{stats.steps}</p>
          <p className="text-xs text-slate-500">Steps</p>
        </div>
        <div className="rounded border border-line bg-panelSoft p-2">
          <p className="text-lg font-semibold text-slate-100">{stats.errors}</p>
          <p className="text-xs text-slate-500">Errors</p>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-300">Examples</h3>
        <div className="space-y-2">
          {examples.map((example) => (
            <button
              className="w-full rounded border border-line bg-panelSoft p-3 text-left transition hover:border-nova/70 hover:bg-ink"
              key={example.id}
              type="button"
              onClick={() => onSelect(example)}
            >
              <span className="block text-sm font-semibold text-slate-100">{example.name}</span>
              <span className="mt-1 block text-xs text-slate-500">{example.description}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
