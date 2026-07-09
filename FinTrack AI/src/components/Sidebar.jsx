import {
  FiBarChart2,
  FiCreditCard,
  FiGrid,
  FiPieChart,
  FiSettings,
  FiShield,
  FiTag,
  FiTrendingUp,
  FiX,
} from 'react-icons/fi';
import { motion } from 'framer-motion';

const navItems = [
  { name: 'Dashboard', icon: FiGrid },
  { name: 'Expenses', icon: FiCreditCard },
  { name: 'Categories', icon: FiTag },
  { name: 'Budgets', icon: FiTrendingUp },
  { name: 'Analytics', icon: FiPieChart },
  { name: 'Reports', icon: FiBarChart2 },
  { name: 'Settings', icon: FiSettings },
];

export default function Sidebar({ activeView, setActiveView, sidebarOpen, setSidebarOpen }) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-white/10 bg-ink/95 px-5 py-6 shadow-glass backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="mb-9 flex items-center justify-between">
        <button
          className="flex items-center gap-3 text-left"
          onClick={() => setActiveView('Dashboard')}
          type="button"
        >
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-mint to-sky-300 text-lg font-black text-ink shadow-lg shadow-emerald-900/30">
            F
          </span>
          <span>
            <span className="block text-lg font-bold tracking-wide text-frost">
              FinTrack AI
            </span>
            <span className="text-xs text-slate-400">Wealth command center</span>
          </span>
        </button>
        <button
          className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-slate-300 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          type="button"
          aria-label="Close navigation"
        >
          <FiX />
        </button>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.name;
          return (
            <button
              key={item.name}
              className={`group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                active
                  ? 'text-ink'
                  : 'text-slate-300 hover:bg-white/5 hover:text-frost'
              }`}
              onClick={() => {
                setActiveView(item.name);
                setSidebarOpen(false);
              }}
              type="button"
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-mint"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <Icon className="relative z-10 text-lg" />
              <span className="relative z-10">{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-8 rounded-2xl border border-mint/25 bg-mint/10 p-4">
        <div className="mb-3 flex items-center gap-2 text-mint">
          <FiShield />
          <p className="text-sm font-semibold text-frost">AI pulse</p>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Keep fixed costs below 45% and route surplus to goals weekly.
        </p>
        <button
          className="mt-4 w-full rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-frost transition hover:bg-white/15"
          onClick={() => setActiveView('Analytics')}
          type="button"
        >
          Open insights
        </button>
      </div>
    </aside>
  );
}
