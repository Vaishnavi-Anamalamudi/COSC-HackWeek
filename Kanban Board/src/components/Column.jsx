import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { FiMoreHorizontal, FiPlus, FiTrash2 } from 'react-icons/fi';
import { classNames } from '../utils/helpers.js';
import TaskCard from './TaskCard.jsx';

export default function Column({
  column,
  tasks,
  labels,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onDuplicateTask,
  onRenameColumn,
  onDeleteColumn,
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(column.title);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: { type: 'column', columnId: column.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function commitTitle() {
    const nextTitle = title.trim() || column.title;
    setTitle(nextTitle);
    onRenameColumn(column.id, nextTitle);
    setEditing(false);
  }

  return (
    <section
      ref={setNodeRef}
      style={style}
      className={classNames(
        'flex max-h-[calc(100vh-220px)] w-[320px] shrink-0 flex-col rounded-xl border border-slate-200 bg-slate-100/90 p-3 shadow-lg shadow-slate-200/40 dark:border-white/10 dark:bg-white/[0.05] dark:shadow-none',
        isDragging && 'opacity-70',
      )}
    >
      <header className="mb-3 flex items-center gap-2" {...attributes} {...listeners}>
        {editing ? (
          <input
            className="field h-10 flex-1"
            value={title}
            autoFocus
            onChange={(event) => setTitle(event.target.value)}
            onBlur={commitTitle}
            onKeyDown={(event) => {
              if (event.key === 'Enter') commitTitle();
              if (event.key === 'Escape') setEditing(false);
            }}
          />
        ) : (
          <button className="min-w-0 flex-1 text-left" onDoubleClick={() => setEditing(true)} type="button">
            <h2 className="truncate text-sm font-black">{column.title}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{tasks.length} tasks</p>
          </button>
        )}
        <button className="icon-button h-8 w-8" type="button" onClick={() => onAddTask(column.id)} aria-label="Add task">
          <FiPlus />
        </button>
        <button className="icon-button h-8 w-8" type="button" onClick={() => setEditing(true)} aria-label="Rename column">
          <FiMoreHorizontal />
        </button>
        <button className="icon-button h-8 w-8 text-rose-500" type="button" onClick={() => onDeleteColumn(column.id)} aria-label="Delete column">
          <FiTrash2 />
        </button>
      </header>

      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div className="min-h-32 flex-1 space-y-3 overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                labels={labels}
                columnId={column.id}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onDuplicate={onDuplicateTask}
              />
            ))}
          </AnimatePresence>
          {!tasks.length && (
            <button
              className="grid min-h-28 w-full place-items-center rounded-xl border border-dashed border-slate-300 text-sm font-semibold text-slate-500 transition hover:border-flow-accent hover:text-flow-accent dark:border-white/10"
              type="button"
              onClick={() => onAddTask(column.id)}
            >
              Add a task
            </button>
          )}
        </div>
      </SortableContext>
    </section>
  );
}
