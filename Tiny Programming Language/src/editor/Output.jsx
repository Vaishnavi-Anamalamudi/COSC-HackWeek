const PANELS = [
  { id: 'output', label: 'Output' },
  { id: 'errors', label: 'Errors' },
  { id: 'tokens', label: 'Tokens' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'repl', label: 'REPL Log' },
  { id: 'ast', label: 'AST' }
];

function stringify(value) {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'string') return value;
  return JSON.stringify(value, null, 2);
}

function EmptyState({ children }) {
  return <div className="flex h-full items-center justify-center p-8 text-center text-sm text-slate-500">{children}</div>;
}

export default function Output({
  activePanel,
  onPanelChange,
  result,
  source,
  replLog,
  timelineCursor,
  onTimelineCursorChange
}) {
  const timeline = result.timeline || [];
  const selectedStep = timeline[timelineCursor] || null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-11 items-center justify-between border-b border-line px-3">
        <div className="flex overflow-x-auto">
          {PANELS.map((panel) => (
            <button
              className={`panel-tab ${activePanel === panel.id ? 'panel-tab-active' : ''}`}
              key={panel.id}
              type="button"
              onClick={() => onPanelChange(panel.id)}
            >
              {panel.label}
            </button>
          ))}
        </div>
        <span className="hidden shrink-0 text-xs text-slate-500 sm:block">{source.length} chars</span>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4">
        {activePanel === 'output' && (
          result.output?.length ? (
            <pre className="whitespace-pre-wrap font-mono text-sm leading-6 text-slate-100">
              {result.output.map(stringify).join('\n')}
            </pre>
          ) : (
            <EmptyState>Run the program to see printed output.</EmptyState>
          )
        )}

        {activePanel === 'errors' && (
          result.errors?.length ? (
            <div className="space-y-3">
              {result.errors.map((error, index) => (
                <div className="rounded border border-danger/40 bg-danger/10 p-3" key={`${error.message}-${index}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-danger">{error.kind || 'Error'}</p>
                    <p className="font-mono text-xs text-slate-400">
                      {error.line}:{error.column}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-slate-100">{error.message}</p>
                  {error.suggestion && <p className="mt-2 text-xs text-slate-400">{error.suggestion}</p>}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>No errors reported.</EmptyState>
          )
        )}

        {activePanel === 'tokens' && (
          result.tokens?.length ? (
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              {result.tokens.map((token, index) => (
                <div className="rounded border border-line bg-panelSoft p-2 font-mono text-xs" key={`${token.type}-${index}`}>
                  <div className="flex justify-between gap-2">
                    <span className="text-nova">{token.type}</span>
                    <span className="text-slate-500">
                      {token.line}:{token.column}
                    </span>
                  </div>
                  <div className="mt-1 truncate text-slate-200">{stringify(token.value)}</div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>Tokens appear after a successful lexing pass.</EmptyState>
          )
        )}

        {activePanel === 'timeline' && (
          timeline.length ? (
            <div className="space-y-4">
              <input
                className="w-full accent-nova"
                type="range"
                min="0"
                max={Math.max(0, timeline.length - 1)}
                value={Math.min(timelineCursor, Math.max(0, timeline.length - 1))}
                onChange={(event) => onTimelineCursorChange(Number(event.target.value))}
              />
              <div className="rounded border border-line bg-panelSoft p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-100">
                    Step {selectedStep?.step} - {selectedStep?.type}
                  </p>
                  <p className="font-mono text-xs text-slate-500">
                    {selectedStep?.line}:{selectedStep?.column}
                  </p>
                </div>
                {selectedStep?.breakpoint && <p className="mt-2 text-xs text-warning">Breakpoint reached.</p>}
                <pre className="mt-3 overflow-auto rounded bg-ink p-3 text-xs text-slate-300">
                  {JSON.stringify(selectedStep, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <EmptyState>Execution steps appear after running the program.</EmptyState>
          )
        )}

        {activePanel === 'repl' && (
          replLog.length ? (
            <div className="space-y-3">
              {replLog.map((entry) => (
                <div className="rounded border border-line bg-panelSoft p-3" key={entry.id}>
                  <pre className="whitespace-pre-wrap font-mono text-xs text-nova">{entry.source}</pre>
                  {entry.errors?.length > 0 ? (
                    <pre className="mt-2 whitespace-pre-wrap font-mono text-xs text-danger">
                      {entry.errors.map((error) => error.message).join('\n')}
                    </pre>
                  ) : (
                    <pre className="mt-2 whitespace-pre-wrap font-mono text-sm text-slate-100">
                      {entry.output.map(stringify).join('\n') || '(no output)'}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>Run snippets in the REPL to build a log.</EmptyState>
          )
        )}

        {activePanel === 'ast' && (
          result.ast ? (
            <pre className="overflow-auto rounded border border-line bg-panelSoft p-3 text-xs text-slate-300">
              {JSON.stringify(result.ast, null, 2)}
            </pre>
          ) : (
            <EmptyState>The AST appears after parsing a program.</EmptyState>
          )
        )}
      </div>
    </div>
  );
}
