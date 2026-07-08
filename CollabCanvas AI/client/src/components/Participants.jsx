import { motion } from 'framer-motion';

export default function Participants({ participants, activity }) {
  return (
    <section className="space-y-4">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Participants</h2>
          <span className="rounded-full bg-accent/15 px-2 py-1 text-xs font-semibold text-accent">{participants.length}</span>
        </div>
        <div className="space-y-2">
          {participants.map((user) => (
            <motion.div className="flex items-center gap-3 rounded-xl border border-slate-700/70 bg-slate-900/60 p-3" key={user.id} layout>
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: user.color }} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-100">{user.name}</p>
                <p className="text-xs text-slate-500">Connected</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-white">Activity</h2>
        <div className="max-h-40 space-y-2 overflow-auto pr-1">
          {activity.length === 0 ? (
            <p className="text-sm text-slate-500">Room activity will appear here.</p>
          ) : (
            activity.map((entry) => (
              <div className="rounded-xl bg-slate-900/50 p-2 text-xs text-slate-400" key={entry.id}>
                <span className="text-slate-200">{entry.name}</span> {entry.action}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
