import { useState } from 'react';
import { FiPlus, FiSave, FiTarget, FiTrendingUp } from 'react-icons/fi';
import { budgetUsage, formatCurrency } from '../utils/helpers';

export default function BudgetManager({
  budgetState,
  categories,
  transactions,
  currency,
  setMonthlyBudget,
  upsertCategoryBudget,
  upsertSavingsGoal,
}) {
  const [category, setCategory] = useState(categories[0]?.name || 'Food');
  const [limit, setLimit] = useState('');
  const [goal, setGoal] = useState({ name: '', target: '', saved: '' });
  const usage = budgetUsage(budgetState.categoryBudgets, transactions);

  function saveCategoryBudget(event) {
    event.preventDefault();
    if (!category || Number(limit) <= 0) return;
    upsertCategoryBudget(category, limit);
    setLimit('');
  }

  function saveGoal(event) {
    event.preventDefault();
    if (!goal.name || Number(goal.target) <= 0) return;
    upsertSavingsGoal({
      name: goal.name,
      target: Number(goal.target),
      saved: Number(goal.saved || 0),
    });
    setGoal({ name: '', target: '', saved: '' });
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[380px_1fr]">
      <div className="space-y-5">
        <article className="rounded-2xl border border-white/10 bg-panel/80 p-5 shadow-glass backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-frost">Monthly budget</h2>
          <label className="mt-5 block space-y-2">
            <span className="text-sm text-slate-300">Limit</span>
            <input
              className="field"
              type="number"
              value={budgetState.monthlyBudget}
              onChange={(event) => setMonthlyBudget(event.target.value)}
            />
          </label>
        </article>

        <form
          onSubmit={saveCategoryBudget}
          className="rounded-2xl border border-white/10 bg-panel/80 p-5 shadow-glass backdrop-blur-xl"
        >
          <h2 className="text-lg font-semibold text-frost">Category budget</h2>
          <div className="mt-5 grid gap-4">
            <select className="field" value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories
                .filter((item) => item.name !== 'Income')
                .map((item) => (
                  <option key={item.name}>{item.name}</option>
                ))}
            </select>
            <input
              className="field"
              type="number"
              value={limit}
              onChange={(event) => setLimit(event.target.value)}
              placeholder="Budget limit"
            />
          </div>
          <button className="btn-primary mt-5 w-full justify-center" type="submit">
            <FiSave />
            Save budget
          </button>
        </form>

        <form
          onSubmit={saveGoal}
          className="rounded-2xl border border-white/10 bg-panel/80 p-5 shadow-glass backdrop-blur-xl"
        >
          <h2 className="text-lg font-semibold text-frost">Savings goal</h2>
          <div className="mt-5 grid gap-4">
            <input
              className="field"
              value={goal.name}
              onChange={(event) => setGoal((current) => ({ ...current, name: event.target.value }))}
              placeholder="Goal name"
            />
            <input
              className="field"
              type="number"
              value={goal.target}
              onChange={(event) => setGoal((current) => ({ ...current, target: event.target.value }))}
              placeholder="Target"
            />
            <input
              className="field"
              type="number"
              value={goal.saved}
              onChange={(event) => setGoal((current) => ({ ...current, saved: event.target.value }))}
              placeholder="Saved"
            />
          </div>
          <button className="btn-primary mt-5 w-full justify-center" type="submit">
            <FiPlus />
            Add goal
          </button>
        </form>
      </div>

      <div className="space-y-5">
        <article className="rounded-2xl border border-white/10 bg-panel/80 p-5 shadow-glass backdrop-blur-xl">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-mint/15 text-mint">
              <FiTrendingUp />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-frost">Budget utilization</h2>
              <p className="text-sm text-slate-400">Category-wise spending limits</p>
            </div>
          </div>
          <div className="space-y-4">
            {usage.map((item) => (
              <div key={item.id}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-frost">{item.category}</span>
                  <span className={item.exceeded ? 'text-rose-300' : 'text-slate-400'}>
                    {formatCurrency(item.spent, currency)} / {formatCurrency(item.limit, currency)}
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full ${item.exceeded ? 'bg-rose-400' : 'bg-mint'}`}
                    style={{ width: `${Math.min(item.percent, 100)}%` }}
                  />
                </div>
                {item.exceeded && (
                  <p className="mt-1 text-xs text-rose-300">Budget exceeded by {formatCurrency(item.spent - item.limit, currency)}</p>
                )}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-panel/80 p-5 shadow-glass backdrop-blur-xl">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-sky-400/15 text-sky-300">
              <FiTarget />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-frost">Savings goals</h2>
              <p className="text-sm text-slate-400">Track future plans and emergency funds</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {budgetState.savingsGoals.map((item) => {
              const percent = Math.min(Math.round((item.saved / item.target) * 100), 100);
              return (
                <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-semibold text-frost">{item.name}</h3>
                    <span className="text-sm text-mint">{percent}%</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">
                    {formatCurrency(item.saved, currency)} of {formatCurrency(item.target, currency)}
                  </p>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-sky-300" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </div>
    </section>
  );
}
