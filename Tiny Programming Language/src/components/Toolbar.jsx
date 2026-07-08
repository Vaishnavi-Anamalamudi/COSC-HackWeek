import { useMemo, useState } from 'react';

function parseBreakpoints(value) {
  return value
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isInteger(item) && item > 0);
}

export default function Toolbar({
  isRunning,
  runId,
  breakpoints,
  onBreakpointsChange,
  onRun,
  onClear,
  onSave,
  onOpen,
  onDownload
}) {
  const [breakpointText, setBreakpointText] = useState(() => breakpoints.join(', '));
  const runLabel = useMemo(() => (isRunning ? 'Running' : 'Run'), [isRunning]);

  function updateBreakpoints(value) {
    setBreakpointText(value);
    onBreakpointsChange(parseBreakpoints(value));
  }

  return (
    <header className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-line bg-panel px-4 py-2">
      <div>
        <h1 className="text-base font-semibold text-slate-100">NovaLang IDE</h1>
        <p className="text-xs text-slate-500">{runId ? `Run ${runId.slice(0, 8)}` : 'Ready'}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-xs text-slate-400">
          Breakpoints
          <input
            className="h-9 w-36 rounded border border-line bg-panelSoft px-2 font-mono text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-nova"
            placeholder="3, 12"
            value={breakpointText}
            onChange={(event) => updateBreakpoints(event.target.value)}
          />
        </label>

        <button className="nova-button nova-button-primary" type="button" disabled={isRunning} onClick={onRun}>
          {runLabel}
        </button>
        <button className="nova-button" type="button" onClick={onClear}>
          Clear
        </button>
        <button className="nova-button" type="button" onClick={onSave}>
          Save
        </button>
        <button className="nova-button" type="button" onClick={onOpen}>
          Open
        </button>
        <button className="nova-button" type="button" onClick={onDownload}>
          Download
        </button>
      </div>
    </header>
  );
}
