import { FiBell, FiPlus, FiSearch, FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext.jsx';

export default function Navbar({ title, search, onSearch, onCreate }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/90 backdrop-blur-xl dark:border-white/10 dark:bg-vault-ink/90">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-vault-accent">Digital Time Capsule</p>
          <h1 className="mt-1 text-2xl font-extrabold">{title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative min-w-0 flex-1 sm:w-80 sm:flex-none">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input className="field pl-10" placeholder="Search capsules" value={search} onChange={(event) => onSearch(event.target.value)} />
          </label>
          <button className="icon-button" type="button" aria-label="Notifications" title="Notifications">
            <FiBell aria-hidden="true" />
          </button>
          <button className="icon-button" type="button" aria-label="Toggle theme" title="Toggle theme" onClick={toggleTheme}>
            {theme === 'dark' ? <FiSun aria-hidden="true" /> : <FiMoon aria-hidden="true" />}
          </button>
          <button className="primary-button" type="button" onClick={onCreate}>
            <FiPlus aria-hidden="true" />
            New
          </button>
        </div>
      </div>
    </header>
  );
}
