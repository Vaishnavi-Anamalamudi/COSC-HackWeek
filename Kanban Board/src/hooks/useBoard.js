import { arrayMove } from '@dnd-kit/sortable';
import { useCallback, useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { createBoard, createColumn, createTask, isOverdue } from '../utils/helpers.js';
import { loadState, saveState, validateImport } from '../utils/storage.js';

const starterBoard = createBoard('TaskFlow Pro Launch');

const initialState = {
  boards: [starterBoard, createBoard('Website Redesign')],
  activeBoardId: starterBoard.id,
  settings: {
    theme: 'dark',
    density: 'comfortable',
    notifications: true,
  },
};

function stamp(board, text) {
  return {
    ...board,
    updatedAt: new Date().toISOString(),
    activity: [
      { id: uuid(), type: 'activity', text, createdAt: new Date().toISOString() },
      ...(board.activity || []),
    ].slice(0, 80),
  };
}

export function useBoard() {
  const [state, setState] = useState(() => loadState(initialState));

  const persist = useCallback((updater) => {
    setState((current) => {
      const next = typeof updater === 'function' ? updater(current) : updater;
      saveState(next);
      return next;
    });
  }, []);

  const activeBoard = useMemo(
    () => state.boards.find((board) => board.id === state.activeBoardId) || state.boards[0],
    [state.activeBoardId, state.boards],
  );

  const updateBoard = useCallback(
    (boardId, updater) => {
      persist((current) => ({
        ...current,
        boards: current.boards.map((board) => (board.id === boardId ? updater(board) : board)),
      }));
    },
    [persist],
  );

  const updateActiveBoard = useCallback(
    (updater) => {
      updateBoard(activeBoard.id, updater);
    },
    [activeBoard?.id, updateBoard],
  );

  const createNewBoard = useCallback(() => {
    const board = createBoard('Untitled Board');
    persist((current) => ({ ...current, boards: [board, ...current.boards], activeBoardId: board.id }));
  }, [persist]);

  const deleteBoard = useCallback(
    (boardId) => {
      persist((current) => {
        if (current.boards.length === 1) return current;
        const boards = current.boards.filter((board) => board.id !== boardId);
        return {
          ...current,
          boards,
          activeBoardId: current.activeBoardId === boardId ? boards[0].id : current.activeBoardId,
        };
      });
    },
    [persist],
  );

  const createColumnAction = useCallback(
    (title = 'New Column') => {
      updateActiveBoard((board) => stamp({ ...board, columns: [...board.columns, createColumn(title)] }, `Added column "${title}"`));
    },
    [updateActiveBoard],
  );

  const renameColumn = useCallback(
    (columnId, title) => {
      updateActiveBoard((board) => {
        const oldColumn = board.columns.find((column) => column.id === columnId);
        const tasks = { ...board.tasks };
        oldColumn?.taskIds.forEach((taskId) => {
          tasks[taskId] = { ...tasks[taskId], status: title, updatedAt: new Date().toISOString() };
        });
        return stamp(
          {
            ...board,
            tasks,
            columns: board.columns.map((column) => (column.id === columnId ? { ...column, title } : column)),
          },
          `Renamed column to "${title}"`,
        );
      });
    },
    [updateActiveBoard],
  );

  const deleteColumn = useCallback(
    (columnId) => {
      updateActiveBoard((board) => {
        if (board.columns.length <= 1) return board;
        const column = board.columns.find((item) => item.id === columnId);
        const [fallback] = board.columns.filter((item) => item.id !== columnId);
        const tasks = { ...board.tasks };
        column.taskIds.forEach((taskId) => {
          tasks[taskId] = { ...tasks[taskId], status: fallback.title, updatedAt: new Date().toISOString() };
        });
        return stamp(
          {
            ...board,
            tasks,
            columns: board.columns
              .filter((item) => item.id !== columnId)
              .map((item) => (item.id === fallback.id ? { ...item, taskIds: [...item.taskIds, ...column.taskIds] } : item)),
          },
          `Deleted column "${column.title}"`,
        );
      });
    },
    [updateActiveBoard],
  );

  const saveTask = useCallback(
    (task, columnId) => {
      updateActiveBoard((board) => {
        const targetColumn = board.columns.find((column) => column.id === columnId) || board.columns[0];
        const exists = Boolean(board.tasks[task.id]);
        const nextTask = {
          ...createTask(),
          ...task,
          id: task.id || uuid(),
          status: targetColumn.title,
          updatedAt: new Date().toISOString(),
        };
        const columns = board.columns.map((column) => {
          const withoutTask = column.taskIds.filter((taskId) => taskId !== nextTask.id);
          if (column.id === targetColumn.id) {
            return { ...column, taskIds: exists && column.taskIds.includes(nextTask.id) ? column.taskIds : [nextTask.id, ...withoutTask] };
          }
          return { ...column, taskIds: withoutTask };
        });
        return stamp(
          { ...board, tasks: { ...board.tasks, [nextTask.id]: nextTask }, columns },
          `${exists ? 'Updated' : 'Created'} task "${nextTask.title}"`,
        );
      });
    },
    [updateActiveBoard],
  );

  const deleteTask = useCallback(
    (taskId) => {
      updateActiveBoard((board) => {
        const tasks = { ...board.tasks };
        const title = tasks[taskId]?.title || 'Task';
        delete tasks[taskId];
        return stamp(
          {
            ...board,
            tasks,
            columns: board.columns.map((column) => ({
              ...column,
              taskIds: column.taskIds.filter((id) => id !== taskId),
            })),
          },
          `Deleted task "${title}"`,
        );
      });
    },
    [updateActiveBoard],
  );

  const duplicateTask = useCallback(
    (taskId) => {
      updateActiveBoard((board) => {
        const source = board.tasks[taskId];
        if (!source) return board;
        const copy = createTask({ ...source, id: uuid(), title: `${source.title} Copy`, archived: false });
        const columns = board.columns.map((column) =>
          column.taskIds.includes(taskId) ? { ...column, taskIds: [...column.taskIds, copy.id] } : column,
        );
        return stamp({ ...board, tasks: { ...board.tasks, [copy.id]: copy }, columns }, `Duplicated task "${source.title}"`);
      });
    },
    [updateActiveBoard],
  );

  const archiveTask = useCallback(
    (taskId, archived = true) => {
      updateActiveBoard((board) =>
        stamp(
          {
            ...board,
            tasks: {
              ...board.tasks,
              [taskId]: { ...board.tasks[taskId], archived, updatedAt: new Date().toISOString() },
            },
          },
          `${archived ? 'Archived' : 'Restored'} task "${board.tasks[taskId]?.title}"`,
        ),
      );
    },
    [updateActiveBoard],
  );

  const moveTask = useCallback(
    ({ taskId, fromColumnId, toColumnId, overTaskId }) => {
      updateActiveBoard((board) => {
        const toColumn = board.columns.find((column) => column.id === toColumnId);
        const columns = board.columns.map((column) => {
          let nextIds = column.taskIds.filter((id) => id !== taskId);
          if (column.id === toColumnId) {
            const overIndex = overTaskId ? nextIds.indexOf(overTaskId) : -1;
            nextIds = [...nextIds];
            nextIds.splice(overIndex >= 0 ? overIndex : nextIds.length, 0, taskId);
          }
          return { ...column, taskIds: nextIds };
        });
        return stamp(
          {
            ...board,
            columns,
            tasks: {
              ...board.tasks,
              [taskId]: { ...board.tasks[taskId], status: toColumn.title, updatedAt: new Date().toISOString() },
            },
          },
          `Moved "${board.tasks[taskId]?.title}" from ${fromColumnId === toColumnId ? 'within' : 'to'} ${toColumn.title}`,
        );
      });
    },
    [updateActiveBoard],
  );

  const reorderColumn = useCallback(
    (activeColumnId, overColumnId) => {
      updateActiveBoard((board) => {
        const oldIndex = board.columns.findIndex((column) => column.id === activeColumnId);
        const newIndex = board.columns.findIndex((column) => column.id === overColumnId);
        if (oldIndex < 0 || newIndex < 0) return board;
        return stamp({ ...board, columns: arrayMove(board.columns, oldIndex, newIndex) }, 'Reordered columns');
      });
    },
    [updateActiveBoard],
  );

  const addLabel = useCallback(
    (name, color = '#22C55E') => {
      updateActiveBoard((board) => ({
        ...board,
        labels: [...board.labels, { id: name.toLowerCase().replace(/\s+/g, '-'), name, color }],
      }));
    },
    [updateActiveBoard],
  );

  const importState = useCallback(
    (payload) => {
      if (!validateImport(payload)) throw new Error('Import file is not a TaskFlow Pro export.');
      persist(payload);
    },
    [persist],
  );

  const setSettings = useCallback(
    (settings) => {
      persist((current) => ({ ...current, settings: { ...current.settings, ...settings } }));
    },
    [persist],
  );

  const stats = useMemo(() => {
    const tasks = Object.values(activeBoard?.tasks || {});
    const visible = tasks.filter((task) => !task.archived);
    const completed = visible.filter((task) => task.status === 'Done');
    const overdue = visible.filter(isOverdue);
    const score = visible.length ? Math.round((completed.length / visible.length) * 100 - overdue.length * 4) : 100;
    return {
      total: visible.length,
      completed: completed.length,
      pending: visible.length - completed.length,
      overdue: overdue.length,
      archived: tasks.length - visible.length,
      productivity: Math.max(0, Math.min(100, score)),
    };
  }, [activeBoard]);

  return {
    state,
    activeBoard,
    stats,
    setActiveBoardId: (activeBoardId) => persist((current) => ({ ...current, activeBoardId })),
    setSettings,
    createNewBoard,
    deleteBoard,
    updateActiveBoard,
    createColumn: createColumnAction,
    renameColumn,
    deleteColumn,
    saveTask,
    deleteTask,
    duplicateTask,
    archiveTask,
    moveTask,
    reorderColumn,
    addLabel,
    importState,
  };
}
