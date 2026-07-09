export const priorities = [
  { id: 'low', label: 'Low', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300' },
  { id: 'medium', label: 'Medium', color: 'bg-sky-500/15 text-sky-600 dark:text-sky-300' },
  { id: 'high', label: 'High', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-300' },
  { id: 'critical', label: 'Critical', color: 'bg-rose-500/15 text-rose-600 dark:text-rose-300' },
];

export const priorityById = Object.fromEntries(priorities.map((priority) => [priority.id, priority]));
