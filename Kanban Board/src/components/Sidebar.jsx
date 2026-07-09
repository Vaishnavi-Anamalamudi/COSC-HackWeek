import { FiArchive, FiBarChart2, FiCalendar, FiColumns, FiPlus, FiSettings, FiTrash2 } from 'react-icons/fi';
import { classNames } from '../utils/helpers.js';

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: FiBarChart2 },
  { id: 'board', label: 'Boards', icon: FiColumns },
  { id: 'calendar', label: 'Calendar', icon: FiCalendar },
  { id: 'archive', label: 'Archive', icon: FiArchive },
  { id: 'settings', label: 'Settings', icon: FiSettings },
];

export default function Sidebar({
  activeView,
  onViewChange,
  boards,
  activeBoardId,
  onBoardChange,
  onCreateBoard,
  onDeleteBoard,
}) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-white/10 bg-flow-sidebar text-flow-text lg:flex">
      <div className="border-b border-white/10 p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-flow-accent text-lg font-black text-flow-ink">
            TF
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-black">TaskFlow Pro</p>
            <p className="text-xs text-slate-400">Kanban command center</p>
          </div>
        </div>
      </div>

      <nav className="grid gap-1 p-3">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={classNames(
                'flex items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-bold transition',
                activeView === item.id ? 'bg-flow-accent text-flow-ink' : 'text-slate-300 hover:bg-white/10 hover:text-white',
              )}
              onClick={() => onViewChange(item.id)}
            >
              <Icon aria-hidden="true" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto border-t border-white/10 p-3">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Workspaces</p>
          <button className="icon-button h-8 w-8 border-white/10 bg-white/[0.06]" onClick={onCreateBoard} aria-label="Create board">
            <FiPlus />
          </button>
        </div>
        <div className="grid gap-2">
          {boards.map((board) => (
            <button
              key={board.id}
              className={classNames(
                'group rounded-xl border p-3 text-left transition',
                board.id === activeBoardId
                  ? 'border-flow-accent bg-flow-accent/15'
                  : 'border-white/10 bg-white/[0.04] hover:border-flow-accent/60',
              )}
              onClick={() => onBoardChange(board.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black">{board.title}</p>
                  <p className="mt-1 text-xs text-slate-400">{board.columns.length} columns</p>
                </div>
                {boards.length > 1 && (
                  <span
                    role="button"
                    tabIndex={0}
                    className="grid h-8 w-8 place-items-center rounded-lg text-rose-300 opacity-0 transition hover:bg-rose-500/10 group-hover:opacity-100"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDeleteBoard(board.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') onDeleteBoard(board.id);
                    }}
                  >
                    <FiTrash2 />
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
