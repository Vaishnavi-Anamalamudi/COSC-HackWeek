import { motion } from 'framer-motion';
import { FiExternalLink, FiGlobe, FiMonitor } from 'react-icons/fi';

export default function BrowserView({ task }) {
  const screenshot = task.screenshot?.dataUrl || task.screenshot?.url;

  return (
    <motion.section
      className="glass-panel grid-lines min-h-[440px] rounded-lg p-4"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
    >
      <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-pilot-line bg-white/5 text-pilot-green">
            <FiMonitor />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-pilot-text">Live Browser View</h2>
            <p className="truncate text-sm text-pilot-muted">{task.currentAction}</p>
          </div>
        </div>
        <div className="flex min-w-0 items-center gap-2 rounded-md border border-pilot-line bg-black/20 px-3 py-2 text-sm text-pilot-muted">
          <FiGlobe className="shrink-0 text-pilot-mint" />
          <span className="truncate">{task.currentUrl || 'about:blank'}</span>
          {task.currentUrl?.startsWith('http') && (
            <a href={task.currentUrl} target="_blank" rel="noreferrer" title="Open current URL" className="text-pilot-green">
              <FiExternalLink />
            </a>
          )}
        </div>
      </div>

      <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/8">
        <motion.div
          className="h-full rounded-full bg-pilot-green"
          animate={{ width: `${task.progress || 0}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <div className="relative flex aspect-video min-h-64 items-center justify-center overflow-hidden rounded-lg border border-pilot-line bg-[#020805]">
        {screenshot ? (
          <img
            src={screenshot}
            alt="Current browser screenshot"
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="text-center">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-lg border border-pilot-line bg-white/5 text-2xl text-pilot-green">
              <FiMonitor />
            </div>
            <p className="font-medium text-pilot-text">Browser stream ready</p>
            <p className="mt-1 text-sm text-pilot-muted">Run a task to see Chromium snapshots here.</p>
          </div>
        )}
      </div>
    </motion.section>
  );
}
