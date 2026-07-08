function valuesFromMemory(memory) {
  if (!memory) return {};
  return memory.values || {};
}

export default function InspectorPanel({ result, cursor }) {
  const timeline = result.timeline || [];
  const current = timeline[cursor] || null;
  const memory = current?.memory || valuesFromMemory(result.memory);

  return (
    <aside className="pointer-events-none fixed bottom-4 right-4 hidden w-72 2xl:block">
      <div className="pointer-events-auto rounded border border-line bg-panel/95 p-4 shadow-glow backdrop-blur">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-100">Inspector</h2>
          <span className={`rounded px-2 py-1 text-xs ${result.ok ? 'bg-nova/10 text-nova' : 'bg-danger/10 text-danger'}`}>
            {result.ok ? 'OK' : 'Issues'}
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current step</p>
            <p className="mt-1 text-sm text-slate-200">{current ? `${current.step}: ${current.type}` : 'No execution yet'}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Memory</p>
            <pre className="mt-2 max-h-56 overflow-auto rounded bg-ink p-3 text-xs text-slate-300">
              {JSON.stringify(memory, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </aside>
  );
}
