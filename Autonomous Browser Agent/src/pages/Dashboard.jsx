import { motion } from 'framer-motion';
import {
  FiActivity,
  FiBarChart2,
  FiClock,
  FiFileText,
  FiPlusCircle,
  FiSettings
} from 'react-icons/fi';
import BrowserView from '../components/BrowserView.jsx';
import History from '../components/History.jsx';
import Logs from '../components/Logs.jsx';
import ResultPanel from '../components/ResultPanel.jsx';
import Settings from '../components/Settings.jsx';
import TaskInput from '../components/TaskInput.jsx';
import Timeline from '../components/Timeline.jsx';
import { SIDEBAR_ITEMS } from '../constants/commands.js';
import { useAgent } from '../hooks/useAgent.js';

const iconMap = {
  Dashboard: FiBarChart2,
  'New Task': FiPlusCircle,
  History: FiClock,
  Reports: FiFileText,
  Settings: FiSettings
};

export default function Dashboard() {
  const {
    activeTask,
    history,
    connection,
    startTask,
    stopTask,
    loadTask,
    replayTask
  } = useAgent();

  const busy = ['queued', 'planning', 'running'].includes(activeTask.status);

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-pilot-line bg-black/30 p-4 backdrop-blur-xl lg:block">
        <div className="mb-8 rounded-lg border border-pilot-line bg-white/5 p-4">
          <p className="text-2xl font-bold text-pilot-text">WebPilot AI</p>
          <p className="mt-1 text-sm text-pilot-muted">Autonomous Browser Agent</p>
        </div>
        <nav className="space-y-2">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = iconMap[item] || FiActivity;
            return (
              <a
                key={item}
                href={`#${item.toLowerCase().replaceAll(' ', '-')}`}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-pilot-muted transition hover:bg-white/6 hover:text-pilot-text"
              >
                <Icon className="text-pilot-green" />
                {item}
              </a>
            );
          })}
        </nav>
      </aside>

      <main className="mx-auto max-w-[1600px] px-4 py-4 lg:ml-64 lg:px-6">
        <header className="mb-5 flex flex-col gap-3 rounded-lg border border-pilot-line bg-black/20 p-4 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <motion.h1
              className="text-3xl font-bold text-pilot-text md:text-4xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              WebPilot AI
            </motion.h1>
            <p className="mt-1 text-sm text-pilot-muted">
              Plan, browse, extract, recover, and export from one autonomous cockpit.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full border border-pilot-line px-3 py-2 text-pilot-muted">
              Status: <span className="text-pilot-green">{activeTask.status}</span>
            </span>
            <span className="rounded-full border border-pilot-line px-3 py-2 text-pilot-muted">
              WS: <span className="text-pilot-green">{connection}</span>
            </span>
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-[1.45fr_0.75fr]">
          <div className="space-y-5">
            <section id="new-task">
              <TaskInput onSubmit={startTask} onStop={stopTask} busy={busy} />
            </section>
            <section id="dashboard">
              <BrowserView task={activeTask} />
            </section>
            <section id="reports">
              <ResultPanel task={activeTask} />
            </section>
          </div>

          <div className="space-y-5">
            <Timeline steps={activeTask.plan} />
            <Logs logs={activeTask.logs} />
            <section id="history">
              <History tasks={history} onLoad={loadTask} onReplay={replayTask} />
            </section>
            <section id="settings">
              <Settings connection={connection} />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
