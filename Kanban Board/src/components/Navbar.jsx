import { FiBell, FiDownload, FiMoon, FiPlus, FiSun, FiUpload, FiUser } from 'react-icons/fi';
import SearchBar from './SearchBar.jsx';

export default function Navbar({
  title,
  search,
  onSearch,
  onCreateTask,
  theme,
  onThemeToggle,
  onExport,
  onImportClick,
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-flow-ink/80 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-flow-accent">Project board</p>
          <h1 className="truncate text-xl font-black md:text-2xl">{title}</h1>
        </div>
        <div className="order-3 w-full md:order-none md:w-[380px]">
          <SearchBar value={search} onChange={onSearch} />
        </div>
        <button className="icon-button" onClick={onImportClick} aria-label="Import board">
          <FiUpload />
        </button>
        <button className="icon-button" onClick={onExport} aria-label="Export board as JSON">
          <FiDownload />
        </button>
        <button className="icon-button" onClick={onThemeToggle} aria-label="Toggle theme">
          {theme === 'dark' ? <FiSun /> : <FiMoon />}
        </button>
        <button className="icon-button" aria-label="Notifications">
          <FiBell />
        </button>
        <button className="primary-button" onClick={onCreateTask}>
          <FiPlus /> Quick Add
        </button>
        <button className="hidden h-10 w-10 place-items-center rounded-full bg-flow-accent text-flow-ink shadow-glow md:grid" aria-label="Profile">
          <FiUser />
        </button>
      </div>
    </header>
  );
}
