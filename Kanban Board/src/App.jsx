import { AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { FiMenu, FiPlus } from 'react-icons/fi';
import Board from './components/Board.jsx';
import Dashboard from './components/Dashboard.jsx';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import TaskModal from './components/TaskModal.jsx';
import { useBoard } from './hooks/useBoard.js';
import { createTask, downloadJson } from './utils/helpers.js';

const blankFilters = { priority: 'all', status: 'all', label: 'all', due: 'all' };

export default function App() {
  const boardApi = useBoard();
  const {
    state,
    activeBoard,
    stats,
    setActiveBoardId,
    setSettings,
    createNewBoard,
    deleteBoard,
    updateActiveBoard,
    createColumn,
    renameColumn,
    deleteColumn,
    saveTask,
    deleteTask,
    duplicateTask,
    archiveTask,
    moveTask,
    reorderColumn,
    importState,
  } = boardApi;
  const [activeView, setActiveView] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(blankFilters);
  const [modal, setModal] = useState(null);
  const [mobileNav, setMobileNav] = useState(false);
  const importRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.settings.theme === 'dark');
  }, [state.settings.theme]);

  useEffect(() => {
    function shortcuts(event) {
      if (event.target.matches('input, textarea, select')) return;
      if (event.key.toLowerCase() === 'n') openNewTask();
      if (event.key === '/') {
        event.preventDefault();
        document.querySelector('input[placeholder^="Search"]')?.focus();
      }
      if (event.key === 'Escape') {
        setModal(null);
        setMobileNav(false);
      }
    }
    window.addEventListener('keydown', shortcuts);
    return () => window.removeEventListener('keydown', shortcuts);
  });

  function openNewTask(columnId = activeBoard.columns[0].id) {
    const column = activeBoard.columns.find((item) => item.id === columnId) || activeBoard.columns[0];
    setModal({ task: createTask({ title: '', status: column.title }), columnId });
  }

  function openExistingTask(task) {
    const column = activeBoard.columns.find((item) => item.title === task.status) || activeBoard.columns[0];
    setModal({ task, columnId: column.id });
  }

  function handleSaveTask(task, columnId) {
    saveTask(task, columnId);
    setModal(null);
    setActiveView('board');
  }

  function handleDeleteTask(taskId) {
    if (confirm('Delete this task permanently?')) deleteTask(taskId);
  }

  function handleDeleteColumn(columnId) {
    if (confirm('Delete this column? Tasks will move to the next available column.')) deleteColumn(columnId);
  }

  function handleDeleteBoard(boardId) {
    if (confirm('Delete this board and all tasks on it?')) deleteBoard(boardId);
  }

  function handleImportFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importState(JSON.parse(reader.result));
      } catch (error) {
        alert(error.message);
      }
    };
    reader.readAsText(file);
  }

  function BoardControls() {
    return (
      <section className="flow-panel grid gap-3 p-4 lg:grid-cols-[1fr_220px_160px]">
        <label>
          <span className="mb-1 block text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Board name</span>
          <input
            className="field"
            value={activeBoard.title}
            onChange={(event) => updateActiveBoard((board) => ({ ...board, title: event.target.value, updatedAt: new Date().toISOString() }))}
          />
        </label>
        <label>
          <span className="mb-1 block text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Background</span>
          <select
            className="field"
            value={activeBoard.theme}
            onChange={(event) => updateActiveBoard((board) => ({ ...board, theme: event.target.value }))}
          >
            <option value="aurora">Aurora</option>
            <option value="slate">Slate</option>
            <option value="forest">Forest</option>
          </select>
        </label>
        <button className="primary-button self-end" onClick={() => createColumn('New Column')}>
          <FiPlus /> Column
        </button>
      </section>
    );
  }

  const boardClass = `board-${activeBoard.theme || 'aurora'}`;

  return (
    <div className={state.settings.theme === 'dark' ? 'dark' : ''}>
      <div className={`min-h-screen text-slate-950 dark:text-flow-text ${state.settings.theme === 'dark' ? boardClass : 'bg-slate-50'}`}>
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
          boards={state.boards}
          activeBoardId={state.activeBoardId}
          onBoardChange={(id) => {
            setActiveBoardId(id);
            setActiveView('board');
          }}
          onCreateBoard={createNewBoard}
          onDeleteBoard={handleDeleteBoard}
        />

        <div className="min-h-screen lg:pl-72">
          <Navbar
            title={activeBoard.title}
            search={search}
            onSearch={setSearch}
            onCreateTask={() => openNewTask()}
            theme={state.settings.theme}
            onThemeToggle={() => setSettings({ theme: state.settings.theme === 'dark' ? 'light' : 'dark' })}
            onExport={() => downloadJson('taskflow-pro-export.json', state)}
            onImportClick={() => importRef.current?.click()}
          />
          <input ref={importRef} className="hidden" type="file" accept="application/json,.json" onChange={(event) => handleImportFile(event.target.files?.[0])} />

          <main className="mx-auto grid w-full max-w-[1800px] gap-4 px-4 pb-12 pt-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 lg:hidden">
              <button className="icon-button" onClick={() => setMobileNav((value) => !value)} aria-label="Toggle navigation">
                <FiMenu />
              </button>
              <button className="secondary-button" onClick={createNewBoard}>
                New board
              </button>
              <button className="primary-button" onClick={() => openNewTask()}>
                Quick Add
              </button>
            </div>

            {mobileNav && (
              <section className="flow-panel grid gap-2 p-3 lg:hidden">
                {['dashboard', 'board', 'calendar', 'archive', 'settings'].map((view) => (
                  <button
                    key={view}
                    className="secondary-button justify-start capitalize"
                    onClick={() => {
                      setActiveView(view);
                      setMobileNav(false);
                    }}
                  >
                    {view}
                  </button>
                ))}
                <select className="field" value={state.activeBoardId} onChange={(event) => setActiveBoardId(event.target.value)}>
                  {state.boards.map((board) => (
                    <option key={board.id} value={board.id}>
                      {board.title}
                    </option>
                  ))}
                </select>
              </section>
            )}

            <BoardControls />

            {activeView === 'board' ? (
              <Board
                board={activeBoard}
                search={search}
                filters={filters}
                onFiltersChange={setFilters}
                onCreateColumn={createColumn}
                onRenameColumn={renameColumn}
                onDeleteColumn={handleDeleteColumn}
                onAddTask={openNewTask}
                onEditTask={openExistingTask}
                onDeleteTask={handleDeleteTask}
                onDuplicateTask={duplicateTask}
                onMoveTask={moveTask}
                onReorderColumn={reorderColumn}
              />
            ) : (
              <Dashboard
                board={activeBoard}
                stats={stats}
                activeView={activeView}
                onCreateTask={() => openNewTask()}
                onRestoreTask={(taskId) => archiveTask(taskId, false)}
              />
            )}
          </main>
        </div>

        <AnimatePresence>
          {modal && (
            <TaskModal
              task={modal.task}
              board={activeBoard}
              columnId={modal.columnId}
              onSave={handleSaveTask}
              onClose={() => setModal(null)}
              onAddLabel={boardApi.addLabel}
              onArchive={(taskId) => {
                archiveTask(taskId, true);
                setModal(null);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
