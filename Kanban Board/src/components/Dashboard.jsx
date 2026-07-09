import { formatDistanceToNow } from 'date-fns';
import { FiArchive, FiCheckCircle, FiClock, FiTarget, FiTrendingUp } from 'react-icons/fi';
import { isOverdue, taskProgress } from '../utils/helpers.js';

function Stat({ icon: Icon, label, value, tone = 'text-flow-accent' }) {
  return (
    <div className="flow-card p-4">
      <div className={`mb-4 grid h-11 w-11 place-items-center rounded-xl bg-current/10 ${tone}`}>
        <Icon aria-hidden="true" />
      </div>
      <p className="text-3xl font-black">{value}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

export default function Dashboard({ board, stats, onCreateTask, activeView, onRestoreTask }) {
  const tasks = Object.values(board.tasks);
  const visibleTasks = tasks.filter((task) => !task.archived);
  const archivedTasks = tasks.filter((task) => task.archived);
  const upcoming = visibleTasks
    .filter((task) => task.dueDate && task.status !== 'Done')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  if (activeView === 'archive') {
    return (
      <section className="flow-card p-5">
        <h2 className="text-2xl font-black">Archived tasks</h2>
        <div className="mt-4 grid gap-3">
          {archivedTasks.map((task) => (
            <div key={task.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 dark:border-white/10">
              <div>
                <p className="font-bold">{task.title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{task.status}</p>
              </div>
              <button className="secondary-button" onClick={() => onRestoreTask(task.id)}>
                Restore
              </button>
            </div>
          ))}
          {!archivedTasks.length && <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500 dark:border-white/10">No archived tasks yet.</p>}
        </div>
      </section>
    );
  }

  if (activeView === 'calendar') {
    return (
      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="flow-card p-5">
          <h2 className="text-2xl font-black">Calendar view</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {upcoming.map((task) => (
              <article key={task.id} className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-flow-accent">{task.dueDate}</p>
                <h3 className="mt-2 font-black">{task.title}</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{task.assignee || 'Unassigned'}</p>
              </article>
            ))}
          </div>
        </div>
        <ActivityPanel board={board} />
      </section>
    );
  }

  if (activeView === 'settings') {
    return (
      <section className="flow-card p-6">
        <h2 className="text-2xl font-black">Board settings</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Info title="Local-first persistence" text="Every board, task, setting, label, and activity item is saved automatically in LocalStorage." />
          <Info title="Keyboard shortcuts" text="Press N for a quick task, / to focus search, and Escape to close dialogs." />
          <Info title="Hackathon-ready UX" text="The app includes analytics, drag-and-drop, animations, responsive layouts, import/export, and polished empty states." />
          <Info title="Production deployment" text="Build static assets with Vite and deploy the dist folder to Netlify, Vercel, GitHub Pages, or any static host." />
        </div>
      </section>
    );
  }

  return (
    <div className="grid gap-5">
      <section className="overflow-hidden rounded-xl border border-white/10 board-aurora p-6 text-white shadow-panel">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-flow-accent">TaskFlow Pro</p>
          <h2 className="mt-3 text-4xl font-black tracking-normal md:text-6xl">Plan, ship, and refine work visually.</h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
            A local-first Kanban workspace with fast drag-and-drop, task analytics, multiple boards, filters,
            activity history, and the workflow polish teams expect from modern project tools.
          </p>
          <button className="primary-button mt-6" onClick={onCreateTask}>
            Create your next task
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Stat icon={FiTarget} label="Total tasks" value={stats.total} />
        <Stat icon={FiCheckCircle} label="Completed" value={stats.completed} tone="text-flow-sky" />
        <Stat icon={FiClock} label="Pending" value={stats.pending} tone="text-flow-gold" />
        <Stat icon={FiArchive} label="Overdue" value={stats.overdue} tone="text-flow-rose" />
        <Stat icon={FiTrendingUp} label="Productivity" value={`${stats.productivity}%`} tone="text-flow-violet" />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="flow-card p-5">
          <h2 className="text-xl font-black">Focus queue</h2>
          <div className="mt-4 grid gap-3">
            {upcoming.map((task) => (
              <div key={task.id} className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{task.title}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Due {task.dueDate} {isOverdue(task) ? '· overdue' : ''}
                    </p>
                  </div>
                  <span className="soft-badge bg-flow-accent/15 text-flow-accent">{taskProgress(task)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <ActivityPanel board={board} />
      </section>
    </div>
  );
}

function ActivityPanel({ board }) {
  return (
    <aside className="flow-card p-5">
      <h2 className="text-xl font-black">Recent activity</h2>
      <div className="mt-4 grid gap-3">
        {(board.activity || []).slice(0, 8).map((item) => (
          <div key={item.id} className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
            <p className="text-sm font-semibold">{item.text}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
            </p>
          </div>
        ))}
      </div>
    </aside>
  );
}

function Info({ title, text }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
      <p className="font-black">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{text}</p>
    </div>
  );
}
