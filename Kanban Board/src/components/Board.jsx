import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { FiPlus } from 'react-icons/fi';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import Column from './Column.jsx';
import Filters from './Filters.jsx';
import { isOverdue } from '../utils/helpers.js';

export default function Board({
  board,
  search,
  filters,
  onFiltersChange,
  onCreateColumn,
  onRenameColumn,
  onDeleteColumn,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onDuplicateTask,
  onMoveTask,
  onReorderColumn,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const filteredTasks = filterTasks(board, search, filters);

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type === 'column' && overData?.type === 'column') {
      onReorderColumn(active.id, over.id);
      return;
    }

    if (activeData?.type !== 'task') return;
    const fromColumnId = activeData.columnId;
    const toColumnId = overData?.type === 'task' ? overData.columnId : overData?.columnId || over.id;
    if (!toColumnId) return;
    onMoveTask({
      taskId: activeData.taskId,
      fromColumnId,
      toColumnId,
      overTaskId: overData?.type === 'task' ? overData.taskId : null,
    });
  }

  return (
    <div className="grid gap-4">
      <section className="flow-panel p-3">
        <Filters filters={filters} onChange={onFiltersChange} board={board} />
      </section>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <SortableContext items={board.columns.map((column) => column.id)} strategy={horizontalListSortingStrategy}>
          <div className="flex min-h-[calc(100vh-230px)] gap-4 overflow-x-auto pb-4">
            {board.columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                labels={board.labels}
                tasks={column.taskIds.map((taskId) => board.tasks[taskId]).filter((task) => filteredTasks.has(task?.id))}
                onAddTask={onAddTask}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
                onDuplicateTask={onDuplicateTask}
                onRenameColumn={onRenameColumn}
                onDeleteColumn={onDeleteColumn}
              />
            ))}
            <button
              className="grid h-40 w-[280px] shrink-0 place-items-center rounded-xl border border-dashed border-slate-300 bg-white/70 text-sm font-black text-slate-500 transition hover:border-flow-accent hover:text-flow-accent dark:border-white/10 dark:bg-white/[0.04]"
              type="button"
              onClick={() => onCreateColumn('New Column')}
            >
              <span className="inline-flex items-center gap-2">
                <FiPlus /> Add column
              </span>
            </button>
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function filterTasks(board, search, filters) {
  const query = search.trim().toLowerCase();
  const now = new Date();
  return new Set(
    Object.values(board.tasks)
      .filter((task) => !task.archived)
      .filter((task) => {
        const text = `${task.title} ${task.description} ${task.assignee}`.toLowerCase();
        const textMatch = !query || text.includes(query);
        const priorityMatch = filters.priority === 'all' || task.priority === filters.priority;
        const statusMatch = filters.status === 'all' || task.status === filters.status;
        const labelMatch = filters.label === 'all' || task.labels.includes(filters.label);
        let dueMatch = true;
        if (filters.due === 'overdue') dueMatch = isOverdue(task);
        if (filters.due === 'none') dueMatch = !task.dueDate;
        if (filters.due === 'today') dueMatch = task.dueDate && differenceInCalendarDays(parseISO(task.dueDate), now) === 0;
        if (filters.due === 'week') dueMatch = task.dueDate && differenceInCalendarDays(parseISO(task.dueDate), now) <= 7;
        return textMatch && priorityMatch && statusMatch && labelMatch && dueMatch;
      })
      .map((task) => task.id),
  );
}
