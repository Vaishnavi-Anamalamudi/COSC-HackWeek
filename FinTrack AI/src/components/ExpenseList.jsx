import { useMemo, useState } from 'react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiCopy,
  FiDownload,
  FiEdit3,
  FiFilter,
  FiSearch,
  FiTrash2,
} from 'react-icons/fi';
import { format, parseISO } from 'date-fns';
import {
  createSharePayload,
  downloadCsv,
  formatCurrency,
  getCategoryMeta,
} from '../utils/helpers';

const pageSize = 8;

export default function ExpenseList({
  transactions,
  categories,
  currency,
  search,
  onEdit,
  onDelete,
  exportable = true,
}) {
  const [filters, setFilters] = useState({
    query: '',
    category: 'All',
    type: 'All',
    min: '',
    max: '',
    sort: 'newest',
  });
  const [page, setPage] = useState(1);

  const mergedSearch = `${search} ${filters.query}`.trim().toLowerCase();

  const filtered = useMemo(() => {
    const list = transactions.filter((transaction) => {
      const haystack = [
        transaction.title,
        transaction.category,
        transaction.account,
        transaction.note,
        transaction.type,
      ]
        .join(' ')
        .toLowerCase();
      const amount = Number(transaction.amount);

      return (
        (!mergedSearch || haystack.includes(mergedSearch)) &&
        (filters.category === 'All' || transaction.category === filters.category) &&
        (filters.type === 'All' || transaction.type === filters.type) &&
        (!filters.min || amount >= Number(filters.min)) &&
        (!filters.max || amount <= Number(filters.max))
      );
    });

    return list.sort((a, b) => {
      if (filters.sort === 'oldest') return new Date(a.date) - new Date(b.date);
      if (filters.sort === 'amount-high') return b.amount - a.amount;
      if (filters.sort === 'amount-low') return a.amount - b.amount;
      return new Date(b.date) - new Date(a.date);
    });
  }, [transactions, mergedSearch, filters]);

  const totalPages = Math.max(Math.ceil(filtered.length / pageSize), 1);
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  function updateFilter(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
    setPage(1);
  }

  async function copyShare(transaction) {
    await navigator.clipboard.writeText(createSharePayload(transaction));
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-panel/80 p-5 shadow-glass backdrop-blur-xl">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div>
          <h2 className="text-lg font-semibold text-frost">Transaction history</h2>
          <p className="text-sm text-slate-400">{filtered.length} filtered records</p>
        </div>
        {exportable && (
          <button className="btn-secondary ml-auto" onClick={() => downloadCsv(filtered)} type="button">
            <FiDownload />
            CSV
          </button>
        )}
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-6">
        <label className="field flex items-center gap-2 md:col-span-2">
          <FiSearch className="text-slate-400" />
          <input
            className="w-full bg-transparent outline-none"
            value={filters.query}
            onChange={(event) => updateFilter('query', event.target.value)}
            placeholder="Quick search"
          />
        </label>
        <label className="field flex items-center gap-2">
          <FiFilter className="text-slate-400" />
          <select
            className="w-full bg-transparent outline-none"
            value={filters.category}
            onChange={(event) => updateFilter('category', event.target.value)}
          >
            <option>All</option>
            {categories.map((category) => (
              <option key={category.name}>{category.name}</option>
            ))}
          </select>
        </label>
        <select
          className="field"
          value={filters.type}
          onChange={(event) => updateFilter('type', event.target.value)}
        >
          <option>All</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <input
          className="field"
          type="number"
          value={filters.min}
          onChange={(event) => updateFilter('min', event.target.value)}
          placeholder="Min"
        />
        <select
          className="field"
          value={filters.sort}
          onChange={(event) => updateFilter('sort', event.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="amount-high">Amount high</option>
          <option value="amount-low">Amount low</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10">
        <div className="hidden grid-cols-[1.4fr_1fr_1fr_1fr_auto] gap-4 bg-white/5 px-4 py-3 text-xs uppercase tracking-wide text-slate-400 md:grid">
          <span>Transaction</span>
          <span>Category</span>
          <span>Date</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Actions</span>
        </div>
        <div className="divide-y divide-white/10">
          {visible.map((transaction) => {
            const meta = getCategoryMeta(categories, transaction.category);
            const Icon = meta.icon;
            return (
              <article
                key={transaction.id}
                className="grid gap-4 px-4 py-4 text-sm md:grid-cols-[1.4fr_1fr_1fr_1fr_auto] md:items-center"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-ink"
                    style={{ backgroundColor: meta.color }}
                  >
                    {Icon ? <Icon /> : transaction.category.slice(0, 1)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-frost">{transaction.title}</p>
                    <p className="truncate text-xs text-slate-400">
                      {transaction.account || 'No account'} {transaction.recurring ? '| Recurring' : ''}
                    </p>
                  </div>
                </div>
                <span className="text-slate-300">{transaction.category}</span>
                <span className="text-slate-400">{format(parseISO(transaction.date), 'dd MMM yyyy')}</span>
                <span
                  className={`font-semibold md:text-right ${
                    transaction.type === 'income' ? 'text-mint' : 'text-rose-300'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount, currency)}
                </span>
                <div className="flex justify-end gap-2">
                  <button
                    className="icon-btn"
                    onClick={() => copyShare(transaction)}
                    type="button"
                    aria-label="Copy QR share payload"
                    title="Copy QR share payload"
                  >
                    <FiCopy />
                  </button>
                  <button className="icon-btn" onClick={() => onEdit(transaction)} type="button" aria-label="Edit">
                    <FiEdit3 />
                  </button>
                  <button className="icon-btn text-rose-300" onClick={() => onDelete(transaction.id)} type="button" aria-label="Delete">
                    <FiTrash2 />
                  </button>
                </div>
              </article>
            );
          })}
          {visible.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-slate-400">
              No transactions match the current filters.
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <button
          className="btn-secondary"
          disabled={page === 1}
          onClick={() => setPage((current) => Math.max(current - 1, 1))}
          type="button"
        >
          <FiChevronLeft />
          Prev
        </button>
        <span className="text-sm text-slate-400">
          Page {page} of {totalPages}
        </span>
        <button
          className="btn-secondary"
          disabled={page === totalPages}
          onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
          type="button"
        >
          Next
          <FiChevronRight />
        </button>
      </div>
    </section>
  );
}
