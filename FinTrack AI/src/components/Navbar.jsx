import {
  FiBell,
  FiMenu,
  FiMoon,
  FiShield,
  FiSearch,
  FiSun,
  FiUser,
} from 'react-icons/fi';

export default function Navbar({
  activeView,
  search,
  setSearch,
  theme,
  setTheme,
  setSidebarOpen,
  alerts,
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/75 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <button
          className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 text-slate-200 lg:hidden"
          onClick={() => setSidebarOpen(true)}
          type="button"
          aria-label="Open navigation"
        >
          <FiMenu />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-[0.24em] text-mint">Premium dashboard</p>
          <h1 className="truncate text-xl font-semibold text-frost sm:text-2xl">
            {activeView}
          </h1>
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 xl:flex">
          <FiShield className="text-mint" />
          Local-first privacy
        </div>

        <label className="hidden h-11 min-w-80 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 text-slate-300 md:flex">
          <FiSearch />
          <input
            className="w-full bg-transparent text-sm text-frost outline-none placeholder:text-slate-500"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search transactions, notes, accounts"
          />
        </label>

        <button
          className="relative grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-200"
          type="button"
          aria-label="Notifications"
          title={alerts.length ? alerts.join('\n') : 'No new alerts'}
        >
          <FiBell />
          {alerts.length > 0 && (
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-400 ring-2 ring-ink" />
          )}
        </button>
        <button
          className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-200"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          type="button"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <FiSun /> : <FiMoon />}
        </button>
        <button
          className="hidden h-11 items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 pr-4 text-slate-200 sm:flex"
          type="button"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full bg-mint/20 text-mint">
            <FiUser />
          </span>
          <span className="text-sm font-medium">Vaish</span>
        </button>
      </div>
      <label className="mt-4 flex h-11 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 text-slate-300 md:hidden">
        <FiSearch />
        <input
          className="w-full bg-transparent text-sm text-frost outline-none placeholder:text-slate-500"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Quick search"
        />
      </label>
    </header>
  );
}
