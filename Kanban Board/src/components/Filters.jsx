import { priorities } from '../constants/priorities.js';

export default function Filters({ filters, onChange, board }) {
  return (
    <div className="grid gap-2 md:grid-cols-4">
      <select className="field" value={filters.priority} onChange={(event) => onChange({ ...filters, priority: event.target.value })}>
        <option value="all">All priorities</option>
        {priorities.map((priority) => (
          <option key={priority.id} value={priority.id}>
            {priority.label}
          </option>
        ))}
      </select>
      <select className="field" value={filters.status} onChange={(event) => onChange({ ...filters, status: event.target.value })}>
        <option value="all">All statuses</option>
        {board.columns.map((column) => (
          <option key={column.id} value={column.title}>
            {column.title}
          </option>
        ))}
      </select>
      <select className="field" value={filters.label} onChange={(event) => onChange({ ...filters, label: event.target.value })}>
        <option value="all">All labels</option>
        {board.labels.map((label) => (
          <option key={label.id} value={label.id}>
            {label.name}
          </option>
        ))}
      </select>
      <select className="field" value={filters.due} onChange={(event) => onChange({ ...filters, due: event.target.value })}>
        <option value="all">Any due date</option>
        <option value="today">Due today</option>
        <option value="week">Due this week</option>
        <option value="overdue">Overdue</option>
        <option value="none">No due date</option>
      </select>
    </div>
  );
}
