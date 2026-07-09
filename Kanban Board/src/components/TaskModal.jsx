import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { FiCheck, FiPaperclip, FiPlus, FiSave, FiTrash2, FiX } from 'react-icons/fi';
import { priorities } from '../constants/priorities.js';
import { createTask } from '../utils/helpers.js';

export default function TaskModal({ task, board, columnId, onSave, onClose, onArchive, onAddLabel }) {
  const initialColumnId = useMemo(() => {
    if (columnId) return columnId;
    return board.columns.find((column) => column.title === task?.status)?.id || board.columns[0].id;
  }, [board.columns, columnId, task?.status]);

  const [form, setForm] = useState(() => createTask({ ...task }));
  const [targetColumnId, setTargetColumnId] = useState(initialColumnId);
  const [newChecklist, setNewChecklist] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newLabel, setNewLabel] = useState('');

  function patch(value) {
    setForm((current) => ({ ...current, ...value }));
  }

  function submit(event) {
    event.preventDefault();
    onSave(
      {
        ...form,
        title: form.title.trim() || 'Untitled task',
        description: form.description.trim(),
      },
      targetColumnId,
    );
  }

  function toggleLabel(labelId) {
    patch({
      labels: form.labels.includes(labelId)
        ? form.labels.filter((item) => item !== labelId)
        : [...form.labels, labelId],
    });
  }

  function addChecklistItem() {
    if (!newChecklist.trim()) return;
    patch({ checklist: [...form.checklist, { id: crypto.randomUUID(), text: newChecklist.trim(), done: false }] });
    setNewChecklist('');
  }

  function addComment() {
    if (!newComment.trim()) return;
    patch({
      comments: [
        ...form.comments,
        { id: crypto.randomUUID(), text: newComment.trim(), author: form.assignee || 'You', createdAt: new Date().toISOString() },
      ],
    });
    setNewComment('');
  }

  function addAttachment(files) {
    const next = Array.from(files || []).map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type || 'file',
    }));
    patch({ attachments: [...form.attachments, ...next] });
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.form
          className="flow-card my-6 grid w-full max-w-5xl gap-0 overflow-hidden lg:grid-cols-[1fr_340px]"
          initial={{ y: 24, scale: 0.98 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: 24, scale: 0.98 }}
          onSubmit={submit}
          onClick={(event) => event.stopPropagation()}
        >
          <section className="p-5 sm:p-6">
            <header className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-flow-accent">Task details</p>
                <h2 className="mt-1 text-2xl font-black">{task?.id ? 'Edit task' : 'Create task'}</h2>
              </div>
              <button className="icon-button" type="button" onClick={onClose} aria-label="Close modal">
                <FiX />
              </button>
            </header>

            <div className="grid gap-4">
              <label>
                <span className="mb-1 block text-sm font-bold">Title</span>
                <input className="field" value={form.title} onChange={(event) => patch({ title: event.target.value })} autoFocus required />
              </label>
              <label>
                <span className="mb-1 block text-sm font-bold">Description</span>
                <textarea className="field min-h-36 resize-y" value={form.description} onChange={(event) => patch({ description: event.target.value })} placeholder="Supports Markdown-style notes, links, code snippets, and acceptance criteria." />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label>
                  <span className="mb-1 block text-sm font-bold">Priority</span>
                  <select className="field" value={form.priority} onChange={(event) => patch({ priority: event.target.value })}>
                    {priorities.map((priority) => (
                      <option key={priority.id} value={priority.id}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="mb-1 block text-sm font-bold">Status</span>
                  <select className="field" value={targetColumnId} onChange={(event) => setTargetColumnId(event.target.value)}>
                    {board.columns.map((column) => (
                      <option key={column.id} value={column.id}>
                        {column.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="mb-1 block text-sm font-bold">Due date</span>
                  <input className="field" type="date" value={form.dueDate || ''} onChange={(event) => patch({ dueDate: event.target.value })} />
                </label>
                <label>
                  <span className="mb-1 block text-sm font-bold">Estimated time</span>
                  <input className="field" value={form.estimatedTime} onChange={(event) => patch({ estimatedTime: event.target.value })} placeholder="2h" />
                </label>
                <label>
                  <span className="mb-1 block text-sm font-bold">Assignee</span>
                  <input className="field" value={form.assignee} onChange={(event) => patch({ assignee: event.target.value })} placeholder="Owner" />
                </label>
                <label>
                  <span className="mb-1 block text-sm font-bold">Custom label</span>
                  <input className="field" value={newLabel} onChange={(event) => setNewLabel(event.target.value)} placeholder="Add in board settings soon" />
                </label>
              </div>

              <section>
                <p className="mb-2 text-sm font-bold">Labels</p>
                <div className="flex flex-wrap gap-2">
                  {board.labels.map((label) => (
                    <button
                      key={label.id}
                      type="button"
                      className="rounded-full px-3 py-1.5 text-xs font-black text-white ring-offset-2 transition hover:scale-105"
                      style={{ backgroundColor: label.color, outline: form.labels.includes(label.id) ? '2px solid currentColor' : '0' }}
                      onClick={() => toggleLabel(label.id)}
                    >
                      {label.name}
                    </button>
                  ))}
                  {newLabel.trim() && (
                    <button
                      type="button"
                      className="secondary-button py-1.5"
                      onClick={() => {
                        const id = newLabel.toLowerCase().replace(/\s+/g, '-');
                        onAddLabel(newLabel.trim(), '#22C55E');
                        patch({ labels: [...new Set([...form.labels, id])] });
                        setNewLabel('');
                      }}
                    >
                      <FiPlus /> Use custom label
                    </button>
                  )}
                </div>
              </section>
            </div>
          </section>

          <aside className="grid content-start gap-5 border-t border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.04] lg:border-l lg:border-t-0">
            <Panel title="Checklist">
              <div className="grid gap-2">
                {form.checklist.map((item) => (
                  <label key={item.id} className="flex items-start gap-2 rounded-xl border border-slate-200 p-2 dark:border-white/10">
                    <input
                      type="checkbox"
                      className="mt-1 accent-flow-accent"
                      checked={item.done}
                      onChange={(event) =>
                        patch({
                          checklist: form.checklist.map((next) => (next.id === item.id ? { ...next, done: event.target.checked } : next)),
                        })
                      }
                    />
                    <span className="min-w-0 flex-1 text-sm">{item.text}</span>
                    <button type="button" onClick={() => patch({ checklist: form.checklist.filter((next) => next.id !== item.id) })}>
                      <FiTrash2 className="text-rose-500" />
                    </button>
                  </label>
                ))}
                <div className="flex gap-2">
                  <input className="field" value={newChecklist} onChange={(event) => setNewChecklist(event.target.value)} placeholder="Checklist item" />
                  <button className="icon-button" type="button" onClick={addChecklistItem} aria-label="Add checklist item">
                    <FiPlus />
                  </button>
                </div>
              </div>
            </Panel>

            <Panel title="Comments">
              <div className="grid gap-2">
                {form.comments.map((comment) => (
                  <div key={comment.id} className="rounded-xl border border-slate-200 p-2 dark:border-white/10">
                    <p className="text-xs font-bold text-flow-accent">{comment.author}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{comment.text}</p>
                  </div>
                ))}
                <textarea className="field min-h-20" value={newComment} onChange={(event) => setNewComment(event.target.value)} placeholder="Add a comment" />
                <button className="secondary-button" type="button" onClick={addComment}>
                  <FiPlus /> Add comment
                </button>
              </div>
            </Panel>

            <Panel title="Attachments">
              <label className="secondary-button w-full">
                <FiPaperclip /> Attach files
                <input className="hidden" type="file" multiple onChange={(event) => addAttachment(event.target.files)} />
              </label>
              <div className="mt-2 grid gap-2">
                {form.attachments.map((file) => (
                  <div key={file.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 p-2 text-sm dark:border-white/10">
                    <span className="truncate">{file.name}</span>
                    <button type="button" onClick={() => patch({ attachments: form.attachments.filter((item) => item.id !== file.id) })}>
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            </Panel>

            <div className="flex flex-wrap justify-between gap-2">
              {task?.id && (
                <button className="danger-button" type="button" onClick={() => onArchive(task.id)}>
                  <FiTrash2 /> Archive
                </button>
              )}
              <button className="primary-button ml-auto" type="submit">
                <FiSave /> Save task
              </button>
            </div>
          </aside>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  );
}

function Panel({ title, children }) {
  return (
    <section>
      <h3 className="mb-2 text-sm font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{title}</h3>
      {children}
    </section>
  );
}
