import { differenceInCalendarDays, format, isBefore, parseISO } from 'date-fns';
import { v4 as uuid } from 'uuid';
import { defaultLabels } from '../constants/labels.js';

export function classNames(...values) {
  return values.filter(Boolean).join(' ');
}

export function todayInputValue(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

export function formatDate(value) {
  if (!value) return 'No date';
  return format(parseISO(value), 'MMM d');
}

export function isOverdue(task) {
  return task.dueDate && task.status !== 'Done' && isBefore(parseISO(task.dueDate), new Date());
}

export function dueTone(task) {
  if (!task.dueDate) return 'text-slate-500 dark:text-slate-400';
  if (isOverdue(task)) return 'text-rose-500';
  const days = differenceInCalendarDays(parseISO(task.dueDate), new Date());
  if (days <= 2) return 'text-amber-500';
  return 'text-emerald-500';
}

export function taskProgress(task) {
  const checklist = task.checklist || [];
  if (!checklist.length) return 0;
  return Math.round((checklist.filter((item) => item.done).length / checklist.length) * 100);
}

export function downloadJson(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function createTask(overrides = {}) {
  return {
    id: uuid(),
    title: '',
    description: '',
    priority: 'medium',
    dueDate: todayInputValue(7),
    labels: [],
    assignee: '',
    estimatedTime: '2h',
    status: 'To Do',
    comments: [],
    checklist: [],
    attachments: [],
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function createColumn(title = 'New Column') {
  return {
    id: uuid(),
    title,
    taskIds: [],
  };
}

export function createBoard(title = 'Launch Plan') {
  const todo = createColumn('To Do');
  const progress = createColumn('In Progress');
  const review = createColumn('Review');
  const done = createColumn('Done');

  const tasks = [
    createTask({
      title: 'Draft project brief',
      description: 'Create a concise product brief with goals, scope, stakeholders, and launch criteria.',
      priority: 'high',
      dueDate: todayInputValue(1),
      labels: ['research', 'feature'],
      assignee: 'Ava',
      estimatedTime: '3h',
      status: todo.title,
      checklist: [
        { id: uuid(), text: 'Define success metric', done: true },
        { id: uuid(), text: 'List stakeholder risks', done: false },
      ],
    }),
    createTask({
      title: 'Build responsive board shell',
      description: 'Implement sidebar, navbar, dashboard cards, and mobile-friendly Kanban lanes.',
      priority: 'critical',
      dueDate: todayInputValue(3),
      labels: ['frontend', 'design'],
      assignee: 'Mia',
      estimatedTime: '6h',
      status: progress.title,
    }),
    createTask({
      title: 'QA drag and drop flows',
      description: 'Validate moving cards between columns, reordering cards, and keyboard accessible interactions.',
      priority: 'medium',
      dueDate: todayInputValue(5),
      labels: ['testing', 'bug'],
      assignee: 'Noah',
      estimatedTime: '4h',
      status: review.title,
    }),
    createTask({
      title: 'Create onboarding checklist',
      description: 'Add starter tasks, labels, and templates for new teams.',
      priority: 'low',
      dueDate: todayInputValue(-1),
      labels: ['feature'],
      assignee: 'Ivy',
      estimatedTime: '1h',
      status: done.title,
    }),
  ];

  todo.taskIds = [tasks[0].id];
  progress.taskIds = [tasks[1].id];
  review.taskIds = [tasks[2].id];
  done.taskIds = [tasks[3].id];

  return {
    id: uuid(),
    title,
    description: 'A high-signal Kanban workspace for product teams.',
    theme: 'aurora',
    columns: [todo, progress, review, done],
    tasks: Object.fromEntries(tasks.map((task) => [task.id, task])),
    labels: defaultLabels,
    activity: [
      {
        id: uuid(),
        type: 'created',
        text: `Created board "${title}"`,
        createdAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
