import { FiSearch } from 'react-icons/fi';

export default function SearchBar({ value, onChange }) {
  return (
    <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/[0.06]">
      <FiSearch className="shrink-0 text-slate-400" aria-hidden="true" />
      <span className="sr-only">Search tasks</span>
      <input
        className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search tasks, descriptions, assignees..."
      />
    </label>
  );
}
