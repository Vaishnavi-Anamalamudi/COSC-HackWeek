import { useState } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { getCategoryMeta } from '../utils/helpers';

const swatches = ['#22C55E', '#38BDF8', '#F97316', '#A78BFA', '#FB7185', '#FACC15', '#14B8A6', '#94A3B8'];

export default function CategoryManager({ categories, addCategory, removeCategory, transactions }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(swatches[0]);

  function submit(event) {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;
    addCategory(cleanName, color);
    setName('');
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[380px_1fr]">
      <form
        onSubmit={submit}
        className="rounded-2xl border border-white/10 bg-panel/80 p-5 shadow-glass backdrop-blur-xl"
      >
        <h2 className="text-lg font-semibold text-frost">Create category</h2>
        <p className="mt-1 text-sm text-slate-400">Personalize budgets and expense filters.</p>
        <label className="mt-5 block space-y-2">
          <span className="text-sm text-slate-300">Name</span>
          <input
            className="field"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Pets, rent, side hustle..."
          />
        </label>
        <div className="mt-5">
          <span className="text-sm text-slate-300">Color</span>
          <div className="mt-3 flex flex-wrap gap-2">
            {swatches.map((swatch) => (
              <button
                key={swatch}
                className={`h-9 w-9 rounded-full border-2 ${color === swatch ? 'border-frost' : 'border-transparent'}`}
                style={{ backgroundColor: swatch }}
                onClick={() => setColor(swatch)}
                type="button"
                aria-label={`Use color ${swatch}`}
              />
            ))}
          </div>
        </div>
        <button className="btn-primary mt-6 w-full justify-center" type="submit">
          <FiPlus />
          Add category
        </button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => {
          const used = transactions.filter(
            (transaction) => transaction.category === category.name,
          ).length;
          const meta = getCategoryMeta(categories, category.name);
          const Icon = meta.icon;
          return (
            <article
              key={category.name}
              className="rounded-2xl border border-white/10 bg-panel/80 p-5 shadow-glass backdrop-blur-xl"
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className="grid h-12 w-12 place-items-center rounded-xl text-ink"
                  style={{ backgroundColor: category.color }}
                >
                  {Icon ? <Icon /> : category.name.slice(0, 1)}
                </span>
                <button
                  className="icon-btn text-rose-300"
                  onClick={() => removeCategory(category.name)}
                  type="button"
                  disabled={used > 0 || category.name === 'Income'}
                  aria-label="Delete category"
                  title={used > 0 ? 'Category is used by transactions' : 'Delete category'}
                >
                  <FiTrash2 />
                </button>
              </div>
              <h3 className="mt-4 text-base font-semibold text-frost">{category.name}</h3>
              <p className="mt-1 text-sm text-slate-400">{used} linked transactions</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
