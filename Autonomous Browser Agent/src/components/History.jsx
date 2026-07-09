import { FiClock, FiRotateCcw } from 'react-icons/fi';

export default function History({ tasks = [], onLoad, onReplay }) {
  return (
    <section className="glass-panel rounded-lg p-4">
      <div className="mb-4 flex items-center gap-2">
        <FiClock className="text-pilot-green" />
        <h2 className="text-lg font-semibold text-pilot-text">History</h2>
      </div>
      <div className="max-h-80 space-y-3 overflow-auto pr-1">
        {tasks.length === 0 && <p className="text-sm text-pilot-muted">Completed tasks are saved here.</p>}
        {tasks.map((task) => (
          <button
            key={task.id}
            type="button"
            onClick={() => onLoad(task.id)}
            className="w-full rounded-lg border border-pilot-line bg-white/5 p-3 text-left transition hover:border-pilot-green"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-pilot-text">{task.command}</p>
                <p className="mt-1 text-xs text-pilot-muted">
                  {task.status} · {task.finishedAt ? new Date(task.finishedAt).toLocaleString() : 'running'}
                </p>
              </div>
              <span className="rounded-full border border-pilot-line px-2 py-1 text-xs text-pilot-muted">
                {task.progress}%
              </span>
            </div>
            <span
              role="button"
              tabIndex={0}
              onClick={(event) => {
                event.stopPropagation();
                onReplay(task.id);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.stopPropagation();
                  onReplay(task.id);
                }
              }}
              className="mt-3 inline-flex items-center gap-2 rounded-md border border-pilot-line px-2 py-1 text-xs text-pilot-mint"
            >
              <FiRotateCcw />
              Replay
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
