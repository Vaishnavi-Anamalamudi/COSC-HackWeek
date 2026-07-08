import { FiCheck, FiClock, FiLoader, FiX } from 'react-icons/fi';

const iconByStatus = {
  completed: <FiCheck />,
  running: <FiLoader className="animate-spin" />,
  failed: <FiX />,
  pending: <FiClock />
};

export default function Timeline({ steps = [] }) {
  return (
    <section className="glass-panel rounded-lg p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-pilot-text">Task Timeline</h2>
        <span className="rounded-full border border-pilot-line px-3 py-1 text-xs text-pilot-muted">
          {steps.filter((step) => step.status === 'completed').length}/{steps.length} done
        </span>
      </div>

      <div className="space-y-3">
        {steps.length === 0 && (
          <p className="rounded-lg border border-dashed border-pilot-line p-4 text-sm text-pilot-muted">
            A plan appears here when the agent starts.
          </p>
        )}
        {steps.map((step, index) => (
          <div key={`${step.label}-${index}`} className="flex gap-3">
            <span
              className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md border ${
                step.status === 'completed'
                  ? 'border-pilot-green bg-pilot-green text-black'
                  : step.status === 'failed'
                    ? 'border-red-300/40 bg-red-500/14 text-red-200'
                    : step.status === 'running'
                      ? 'border-pilot-green bg-pilot-green/12 text-pilot-green'
                      : 'border-pilot-line bg-white/5 text-pilot-muted'
              }`}
            >
              {iconByStatus[step.status] || iconByStatus.pending}
            </span>
            <div className="min-w-0 flex-1 border-b border-pilot-line pb-3">
              <p className="text-sm font-medium text-pilot-text">{step.label}</p>
              <p className="mt-1 text-xs text-pilot-muted">{step.detail || 'Waiting'}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
