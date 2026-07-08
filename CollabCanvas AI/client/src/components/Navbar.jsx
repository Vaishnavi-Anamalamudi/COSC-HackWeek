import { FiDownload, FiLink, FiMaximize, FiMinus, FiMoon, FiRotateCcw, FiRotateCw, FiSun, FiUsers, FiZoomIn, FiZoomOut } from 'react-icons/fi';

export default function Navbar({
  roomId,
  connected,
  participants,
  darkMode,
  setDarkMode,
  onInvite,
  onExport,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onResetView,
  onFullscreen,
  canUndo,
  canRedo
}) {
  return (
    <header className="glass-panel relative z-50 flex h-16 items-center justify-between gap-4 border-x-0 border-t-0 px-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-lg font-black text-ink">C</div>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-bold text-white sm:text-base">CollabCanvas AI</h1>
          <p className="truncate text-xs text-slate-400">Room {roomId}</p>
        </div>
      </div>

      <div className="hidden items-center gap-1 md:flex">
        <button className="icon-button" type="button" title="Undo" aria-label="Undo" disabled={!canUndo} onClick={onUndo}>
          <FiRotateCcw />
        </button>
        <button className="icon-button" type="button" title="Redo" aria-label="Redo" disabled={!canRedo} onClick={onRedo}>
          <FiRotateCw />
        </button>
        <span className="mx-1 h-7 w-px bg-slate-700" />
        <button className="icon-button" type="button" title="Zoom out" aria-label="Zoom out" onClick={onZoomOut}>
          <FiZoomOut />
        </button>
        <button className="icon-button" type="button" title="Reset view" aria-label="Reset view" onClick={onResetView}>
          <FiMinus />
        </button>
        <button className="icon-button" type="button" title="Zoom in" aria-label="Zoom in" onClick={onZoomIn}>
          <FiZoomIn />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-full border border-slate-700 px-3 py-2 text-xs text-slate-300 sm:flex">
          <FiUsers className="text-accent" />
          {participants.length}
          <span className={connected ? 'text-accent' : 'text-rose-400'}>{connected ? 'Live' : 'Offline'}</span>
        </div>
        <button className="icon-button" type="button" title="Copy invite link" aria-label="Copy invite link" onClick={onInvite}>
          <FiLink />
        </button>
        <button className="icon-button" type="button" title="Export" aria-label="Export" onClick={onExport}>
          <FiDownload />
        </button>
        <button className="icon-button" type="button" title="Fullscreen" aria-label="Fullscreen" onClick={onFullscreen}>
          <FiMaximize />
        </button>
        <button className="icon-button" type="button" title="Toggle theme" aria-label="Toggle theme" onClick={() => setDarkMode((value) => !value)}>
          {darkMode ? <FiSun /> : <FiMoon />}
        </button>
      </div>
    </header>
  );
}
