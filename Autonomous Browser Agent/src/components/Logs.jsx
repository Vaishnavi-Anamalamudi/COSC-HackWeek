import { FiActivity } from 'react-icons/fi';

export default function Logs({ logs = [] }) {
  return (
    <section className="glass-panel rounded-lg p-4">
      <div className="mb-4 flex items-center gap-2">
        <FiActivity className="text-pilot-green" />
        <h2 className="text-lg font-semibold text-pilot-text">Agent Logs</h2>
      </div>
      <div className="h-64 overflow-auto rounded-lg border border-pilot-line bg-black/28 p-3 font-mono text-xs">
        {logs.length === 0 && <p className="text-pilot-muted">No logs yet.</p>}
        {logs.map((log) => (
          <div key={log.id} className="mb-2 grid grid-cols-[82px_1fr] gap-3">
            <span className="text-pilot-muted">{new Date(log.time).toLocaleTimeString()}</span>
            <span
              className={
                log.level === 'error'
                  ? 'text-red-200'
                  : log.level === 'warn'
                    ? 'text-amber-200'
                    : 'text-pilot-mint'
              }
            >
              {log.message}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
