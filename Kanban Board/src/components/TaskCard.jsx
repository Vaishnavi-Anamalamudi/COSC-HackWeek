import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { FiCalendar, FiCheckSquare, FiCopy, FiEdit3, FiMessageSquare, FiPaperclip, FiTrash2 } from 'react-icons/fi';
import { priorityById } from '../constants/priorities.js';
import { classNames, dueTone, formatDate, taskProgress } from '../utils/helpers.js';

export default function TaskCard({ task, labels, columnId, onEdit, onDelete, onDuplicate }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', taskId: task.id, columnId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const progress = taskProgress(task);

  return (
    <motion.article
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className={classNames(
        'group rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition dark:border-white/10 dark:bg-flow-ink/80',
        isDragging && 'rotate-1 opacity-70 shadow-panel',
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 flex-1 text-sm font-black leading-5">{task.title}</h3>
        <span className={classNames('soft-badge shrink-0', priorityById[task.priority]?.color)}>
          {priorityById[task.priority]?.label}
        </span>
      </div>

      {task.description && <p className="line-clamp-3 mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{task.description}</p>}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {(task.labels || []).map((labelId) => {
          const label = labels.find((item) => item.id === labelId);
          if (!label) return null;
          return (
            <span key={label.id} className="soft-badge text-white" style={{ backgroundColor: label.color }}>
              {label.name}
            </span>
          );
        })}
      </div>

      {task.checklist?.length ? (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
            <div className="h-full rounded-full bg-flow-accent" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        <span className={classNames('inline-flex items-center gap-1', dueTone(task))}>
          <FiCalendar /> {formatDate(task.dueDate)}
        </span>
        {task.assignee && <span>{task.assignee}</span>}
        {task.estimatedTime && <span>{task.estimatedTime}</span>}
        {task.comments?.length ? (
          <span className="inline-flex items-center gap-1">
            <FiMessageSquare /> {task.comments.length}
          </span>
        ) : null}
        {task.checklist?.length ? (
          <span className="inline-flex items-center gap-1">
            <FiCheckSquare /> {task.checklist.filter((item) => item.done).length}/{task.checklist.length}
          </span>
        ) : null}
        {task.attachments?.length ? (
          <span className="inline-flex items-center gap-1">
            <FiPaperclip /> {task.attachments.length}
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex justify-end gap-1 opacity-100 md:opacity-0 md:transition md:group-hover:opacity-100">
        <button className="icon-button h-8 w-8" type="button" onClick={() => onEdit(task)} aria-label="Edit task">
          <FiEdit3 />
        </button>
        <button className="icon-button h-8 w-8" type="button" onClick={() => onDuplicate(task.id)} aria-label="Duplicate task">
          <FiCopy />
        </button>
        <button className="icon-button h-8 w-8 text-rose-500" type="button" onClick={() => onDelete(task.id)} aria-label="Delete task">
          <FiTrash2 />
        </button>
      </div>
    </motion.article>
  );
}
