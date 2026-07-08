import { Suspense, lazy } from 'react';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import {
  FiAlertTriangle,
  FiArrowUpRight,
  FiCalendar,
  FiCpu,
  FiCreditCard,
  FiLock,
  FiShield,
  FiStar,
  FiZap,
} from 'react-icons/fi';
import SummaryCards from './SummaryCards';
import {
  budgetUsage,
  categoryTotals,
  currentMonthTransactions,
  formatCurrency,
  summarizeTransactions,
} from '../utils/helpers';

const Charts = lazy(() => import('./Charts'));

function ChartFallback() {
  return (
    <section className="grid gap-5 xl:grid-cols-2">
      {[1, 2].map((item) => (
        <article
          key={item}
          className="premium-panel h-80 animate-pulse rounded-2xl border border-white/10 p-5 shadow-glass"
        />
      ))}
    </section>
  );
}

export default function Dashboard({
  transactions,
  categories,
  budgetState,
  currency,
  setActiveView,
}) {
  const monthly = currentMonthTransactions(transactions);
  const summary = summarizeTransactions(monthly);
  const usage = budgetUsage(budgetState.categoryBudgets, transactions);
  const topCategory = categoryTotals(monthly)[0];
  const alerts = usage.filter((item) => item.exceeded);
  const calendarItems = monthly.slice(0, 6);
  const healthScore = Math.max(
    40,
    Math.min(96, Math.round(((summary.income - summary.expenses) / Math.max(summary.income, 1)) * 100 + 70)),
  );
  const monthlySavings = Math.max(summary.income - summary.expenses, 0);
  const budgetLeft = Math.max(Number(budgetState.monthlyBudget || 0) - summary.expenses, 0);

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="premium-hero relative overflow-hidden rounded-[2rem] border border-white/10 p-5 shadow-glass backdrop-blur-2xl sm:p-8 lg:p-10"
      >
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(34,197,94,.18),transparent_38%),linear-gradient(220deg,rgba(56,189,248,.18),transparent_42%),linear-gradient(0deg,rgba(250,204,21,.08),transparent_34%)]" />
        <div className="relative grid gap-8 xl:grid-cols-[1.05fr_.95fr] xl:items-center">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-mint/30 bg-mint/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-mint">
              <FiStar />
              Personal finance OS
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.04] tracking-tight text-frost sm:text-5xl lg:text-[3.45rem]">
              Track money like a private wealth dashboard.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              FinTrack AI brings expenses, budgets, savings goals, reports, and spending intelligence into one premium command center.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button className="btn-primary" onClick={() => setActiveView('Expenses')} type="button">
                Add transaction
                <FiArrowUpRight />
              </button>
              <button className="btn-secondary" onClick={() => setActiveView('Reports')} type="button">
                View reports
              </button>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ['Monthly savings', formatCurrency(monthlySavings, currency)],
                ['Budget left', formatCurrency(budgetLeft, currency)],
                ['Health score', `${healthScore}/100`],
              ].map(([label, value]) => (
                <div key={label} className="hero-stat rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-400">{label}</p>
                  <p className="mt-2 break-words text-xl font-bold text-frost">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid min-w-0 gap-4 lg:grid-cols-[1.15fr_.85fr] xl:grid-cols-1">
            <div className="hero-card w-full rounded-[2rem] border border-white/15 bg-ink/70 p-5 shadow-[0_30px_100px_rgba(0,0,0,.42)] backdrop-blur-2xl">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Net worth</p>
                  <p className="mt-2 break-words text-3xl font-black text-frost">
                    {formatCurrency(summary.income + monthlySavings, currency)}
                  </p>
                </div>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-mint text-ink">
                  <FiCreditCard />
                </span>
              </div>
              <div className="mt-7 h-32 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex h-full items-end gap-3">
                  {[42, 68, 48, 86, 62, 96, 74].map((height, index) => (
                    <span
                      key={height + index}
                      className="flex-1 rounded-t-xl bg-gradient-to-t from-mint to-sky-300"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Income</p>
                  <p className="mt-2 text-lg font-bold text-mint">
                    {formatCurrency(summary.income, currency)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Expenses</p>
                  <p className="mt-2 text-lg font-bold text-rose-300">
                    {formatCurrency(summary.expenses, currency)}
                  </p>
                </div>
              </div>
            </div>

            <div className="hero-card w-full rounded-[1.75rem] border border-white/15 bg-white/10 p-4 shadow-[0_28px_80px_rgba(0,0,0,.35)] backdrop-blur-2xl">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-300 text-ink">
                  <FiShield />
                </span>
                <div>
                  <p className="font-semibold text-frost">Smart guardrails</p>
                  <p className="text-sm text-slate-400">{alerts.length || 'No'} budget alerts active</p>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {usage.slice(0, 3).map((item) => (
                  <div key={item.id}>
                    <div className="mb-1 flex justify-between text-xs text-slate-400">
                      <span>{item.category}</span>
                      <span>{item.percent}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full ${item.exceeded ? 'bg-rose-400' : 'bg-mint'}`}
                        style={{ width: `${Math.min(item.percent, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          [FiLock, 'Private by design', 'Data stays in your browser with localStorage persistence.'],
          [FiZap, 'Instant exports', 'Download clean CSV and PDF reports for monthly reviews.'],
          [FiCpu, 'AI-style insights', 'Spending suggestions, alerts, and health scoring built in.'],
        ].map(([Icon, title, copy]) => (
          <article key={title} className="premium-panel premium-hover flex items-start gap-4 rounded-2xl border border-white/10 p-5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-mint/15 text-mint">
              <Icon />
            </span>
            <div>
              <h2 className="font-semibold text-frost">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-400">{copy}</p>
            </div>
          </article>
        ))}
      </section>

      <SummaryCards
        transactions={transactions}
        monthlyBudget={budgetState.monthlyBudget}
        currency={currency}
      />

      <section className="grid gap-5 xl:grid-cols-[1.6fr_.9fr]">
        <motion.article
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-panel premium-hover rounded-2xl border border-white/10 p-5 shadow-glass backdrop-blur-xl"
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-frost">Cashflow command</h2>
              <p className="text-sm text-slate-400">Monthly trend, income, expenses, and savings</p>
            </div>
            <button className="btn-secondary" onClick={() => setActiveView('Analytics')} type="button">
              Analytics
            </button>
          </div>
          <Suspense fallback={<ChartFallback />}>
            <Charts transactions={transactions} categories={categories} currency={currency} />
          </Suspense>
        </motion.article>

        <div className="space-y-5">
          <article className="premium-panel premium-hover rounded-2xl border border-white/10 p-5 shadow-glass backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-mint/15 text-mint">
                <FiCpu />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-frost">AI spending suggestions</h2>
                <p className="text-sm text-slate-400">Personalized from this month</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
                Your financial health score is <span className="font-semibold text-mint">{healthScore}</span>. Keep non-recurring expenses below {formatCurrency(Math.max(summary.income * 0.18, 0), currency)} this month.
              </p>
              {topCategory && (
                <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
                  Top spending is {topCategory.name} at {formatCurrency(topCategory.value, currency)}. Review subscriptions or weekly caps here.
                </p>
              )}
            </div>
          </article>

          <article className="premium-panel premium-hover rounded-2xl border border-white/10 p-5 shadow-glass backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-400/15 text-amber-300">
                <FiAlertTriangle />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-frost">Budget alerts</h2>
                <p className="text-sm text-slate-400">{alerts.length} active alerts</p>
              </div>
            </div>
            <div className="space-y-3">
              {(alerts.length ? alerts : usage.slice(0, 3)).map((item) => (
                <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-frost">{item.category}</span>
                    <span className={item.exceeded ? 'text-rose-300' : 'text-slate-400'}>{item.percent}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full ${item.exceeded ? 'bg-rose-400' : 'bg-mint'}`}
                      style={{ width: `${Math.min(item.percent, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className="premium-panel premium-hover rounded-2xl border border-white/10 p-5 shadow-glass backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-frost">Recent transactions</h2>
            <button className="btn-secondary" onClick={() => setActiveView('Expenses')} type="button">
              View all
            </button>
          </div>
          <div className="space-y-3">
            {transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-frost">{transaction.title}</p>
                  <p className="text-sm text-slate-400">{transaction.category}</p>
                </div>
                <p className={`shrink-0 text-right ${transaction.type === 'income' ? 'text-mint' : 'text-rose-300'}`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, currency)}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="premium-panel premium-hover rounded-2xl border border-white/10 p-5 shadow-glass backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-sky-400/15 text-sky-300">
              <FiCalendar />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-frost">Expense calendar</h2>
              <p className="text-sm text-slate-400">Recent monthly activity</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {calendarItems.map((transaction) => (
              <div key={transaction.id} className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-center text-xs font-semibold text-frost">
                  {format(parseISO(transaction.date), 'dd MMM')}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-frost">{transaction.title}</p>
                  <p className="text-xs text-slate-400">{transaction.category}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <div className="rounded-2xl border border-mint/25 bg-mint/10 p-5 text-sm text-slate-200">
        <FiZap className="mb-2 text-mint" />
        Recurring expenses are detected in the transaction table and included in current-month analytics.
      </div>

      <section className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 text-center backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-mint">Premium finance workspace</p>
        <h2 className="mt-3 text-2xl font-bold text-frost">Built for daily money clarity.</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-400">
          Use the sidebar to move from capture to budgets, analytics, exports, and settings without leaving the experience.
        </p>
      </section>
    </div>
  );
}
