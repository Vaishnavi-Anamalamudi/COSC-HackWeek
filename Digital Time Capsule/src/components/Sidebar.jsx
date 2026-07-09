import { FiCalendar, FiGrid, FiHeart, FiPlusCircle, FiSettings, FiStar, FiUser } from 'react-icons/fi';
import { LuHistory } from 'react-icons/lu';
import { useAuth } from '../contexts/AuthContext.jsx';
import { classNames } from '../utils/helpers.js';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: FiGrid },
  { id: 'capsules', label: 'My Capsules', icon: FiStar },
  { id: 'create', label: 'Create Capsule', icon: FiPlusCircle },
  { id: 'calendar', label: 'Calendar', icon: FiCalendar },
  { id: 'timeline', label: 'Timeline', icon: LuHistory },
  { id: 'favorites', label: 'Favorites', icon: FiHeart },
  { id: 'settings', label: 'Settings', icon: FiSettings },
];

export default function Sidebar({ activeView, setActiveView }) {
  const { user, guest, logout } = useAuth();
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200 bg-white/90 px-4 py-5 backdrop-blur-xl dark:border-white/10 dark:bg-vault-panel/90 lg:block">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-vault-accent text-xl font-black text-vault-ink">C</div>
          <div>
            <p className="text-lg font-extrabold">ChronoVault AI</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Secure time capsules</p>
          </div>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                className={classNames(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold transition',
                  active
                    ? 'bg-vault-accent text-vault-ink shadow-glow'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/[0.06]',
                )}
                type="button"
                onClick={() => setActiveView(item.id)}
              >
                <Icon aria-hidden="true" className="text-lg" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="absolute bottom-5 left-4 right-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
          <div className="mb-3 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-200">
              <FiUser aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user?.email || (guest ? 'Guest Archivist' : 'Vault User')}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{guest ? 'Local demo mode' : 'Cloud synced'}</p>
            </div>
          </div>
          <button className="secondary-button w-full" type="button" onClick={logout}>
            Sign out
          </button>
        </div>
      </aside>
      <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-slate-200 bg-white/95 p-2 backdrop-blur dark:border-white/10 dark:bg-vault-panel/95 lg:hidden">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={classNames('grid place-items-center rounded-lg py-2 text-xs', activeView === item.id ? 'bg-vault-accent text-vault-ink' : 'text-slate-500 dark:text-slate-300')}
              type="button"
              onClick={() => setActiveView(item.id)}
            >
              <Icon aria-hidden="true" className="text-lg" />
              <span className="sr-only">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
