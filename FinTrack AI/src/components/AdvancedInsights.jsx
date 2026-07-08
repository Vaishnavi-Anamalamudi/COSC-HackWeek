import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  FiAlertTriangle,
  FiCalendar,
  FiRepeat,
  FiTarget,
  FiTrendingDown,
  FiTrendingUp,
} from 'react-icons/fi';
import {
  availableMonthOptions,
  budgetPace,
  budgetUsageForTransactions,
  categoryTotals,
  formatCurrency,
  previousMonthKey,
  recurringExpenseTotal,
  summarizeTransactions,
  transactionsForMonth,
} from '../utils/helpers';

function percentDelta(current, previous) {
  if (!previous && current) return 100;
  if (!previous) return 0;
  return Math.round(((current - previous) / previous) * 100);
}

function MetricCard({ label, value, helper, icon: Icon, tone = 'text-mint' }) {
  return (
    <article className="premium-panel rounded-2xl border border-white/10 p-5 shadow-glass">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-2 break-words text-2xl font-bold text-frost">{value}</p>
        </div>
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10 ${tone}`}>
          <Icon />
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-400">{helper}</p>
    </article>
  );
}

export default function AdvancedInsights({
  transactions,
  categories,
  budgetState,
  currency,
}) {
  const [monthKey, setMonthKey] = useState(() => format(new Date(), 'yyyy-MM'));

  const monthOptions = useMemo(
    () => availableMonthOptions(transactions),
    [transactions],
  );
  const scopedTransactions = useMemo(
    () => transactionsForMonth(transactions, monthKey),
    [transactions, monthKey],
  );
  const priorTransactions = useMemo(
    () => transactionsForMonth(transactions, previousMonthKey(monthKey)),
    [transactions, monthKey],
  );

  const summary = summarizeTransactions(scopedTransactions);
  const priorSummary = summarizeTransactions(priorTransactions);
  const expenseDelta = percentDelta(summary.expenses, priorSummary.expenses);
  const incomeDelta = percentDelta(summary.income, priorSummary.income);
  const pace = budgetPace(scopedTransactions, budgetState.monthlyBudget, monthKey);
  const recurringTotal = recurringExpenseTotal(scopedTransactions);
  const savingsRate = summary.income
    ? Math.round(((summary.income - summary.expenses) / summary.income) * 100)
    : 0;
  const categoryData = categoryTotals(scopedTransactions);
  const topCategory = categoryData[0];
  const utilization = budgetUsageForTransactions(
    budgetState.categoryBudgets,
    scopedTransactions,
  )
    .filter((item) => item.limit > 0)
    .sort((a, b) => b.percent - a.percent);
  const riskyBudgets = utilization.filter((item) => item.exceeded);

  const selectedLabel =
    monthOptions.find((item) => item.key === monthKey)?.label || monthKey;
  const recurringShare = summary.expenses
    ? Math.round((recurringTotal / summary.expenses) * 100)
    : 0;

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-panel/80 p-5 shadow-glass backdrop-blur-xl">
        <div className="mr-auto">
          <h2 className="text-lg font-semibold text-frost">Advanced insights</h2>
          <p className="text-sm text-slate-400">
            Month-by-month pacing, budget risk, and recurring spend signals.
          </p>
        </div>
        <label className="flex min-w-64 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
          <FiCalendar className="text-mint" />
          <select
            className="w-full bg-transparent text-frost outline-none"
            value={monthKey}
            onChange={(event) => setMonthKey(event.target.value)}
          >
            {monthOptions.map((month) => (
              <option key={month.key} value={month.key}>
                {month.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label={`${selectedLabel} expenses`}
          value={formatCurrency(summary.expenses, currency)}
          helper={`${Math.abs(expenseDelta)}% ${expenseDelta >= 0 ? 'higher' : 'lower'} than the previous month`}
          icon={expenseDelta >= 0 ? FiTrendingUp : FiTrendingDown}
          tone={expenseDelta >= 0 ? 'text-rose-300' : 'text-mint'}
        />
        <MetricCard
          label="Income movement"
          value={formatCurrency(summary.income, currency)}
          helper={`${Math.abs(incomeDelta)}% ${incomeDelta >= 0 ? 'higher' : 'lower'} than the previous month`}
          icon={FiTrendingUp}
          tone="text-sky-300"
        />
        <MetricCard
          label="Projected spend"
          value={formatCurrency(pace.projectedExpenses, currency)}
          helper={`${pace.projectedPercent}% of monthly budget at the current daily pace`}
          icon={FiTarget}
          tone={pace.projectedOverBudget ? 'text-rose-300' : 'text-mint'}
        />
        <MetricCard
          label="Recurring expenses"
          value={formatCurrency(recurringTotal, currency)}
          helper={`${recurringShare}% of this month's expenses are recurring`}
          icon={FiRepeat}
          tone="text-amber-300"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_.85fr]">
        <article className="premium-panel rounded-2xl border border-white/10 p-5 shadow-glass">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-frost">Category concentration</h3>
              <p className="text-sm text-slate-400">Top spending categories for {selectedLabel}</p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
              Savings rate {savingsRate}%
            </span>
          </div>

          <div className="space-y-4">
            {categoryData.slice(0, 6).map((item) => {
              const category = categories.find((entry) => entry.name === item.name);
              const percent = summary.expenses
                ? Math.round((item.value / summary.expenses) * 100)
                : 0;

              return (
                <div key={item.name}>
                  <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                    <span className="flex items-center gap-2 font-medium text-frost">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: category?.color || '#94A3B8' }}
                      />
                      {item.name}
                    </span>
                    <span className="text-slate-300">
                      {formatCurrency(item.value, currency)} ({percent}%)
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-sky-300"
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {categoryData.length === 0 && (
              <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
                No expenses recorded for this month yet.
              </p>
            )}
          </div>
        </article>

        <article className="premium-panel rounded-2xl border border-white/10 p-5 shadow-glass">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-rose-400/15 text-rose-300">
              <FiAlertTriangle />
            </span>
            <div>
              <h3 className="text-base font-semibold text-frost">Budget risk radar</h3>
              <p className="text-sm text-slate-400">
                {riskyBudgets.length} category limits exceeded
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {utilization.slice(0, 5).map((item) => (
              <div key={item.id}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-frost">{item.category}</span>
                  <span className={item.exceeded ? 'text-rose-300' : 'text-slate-400'}>
                    {item.percent}%
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full ${item.exceeded ? 'bg-rose-400' : 'bg-mint'}`}
                    style={{ width: `${Math.min(item.percent, 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {formatCurrency(item.spent, currency)} spent of {formatCurrency(item.limit, currency)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
            {pace.projectedOverBudget
              ? `At the current pace, this month may exceed budget by ${formatCurrency(pace.projectedExpenses - budgetState.monthlyBudget, currency)}.`
              : `At the current pace, this month is projected to keep ${formatCurrency(pace.projectedRemaining, currency)} inside budget.`}
            {topCategory
              ? ` Largest category is ${topCategory.name} at ${formatCurrency(topCategory.value, currency)}.`
              : ''}
          </div>
        </article>
      </div>
    </section>
  );
}
