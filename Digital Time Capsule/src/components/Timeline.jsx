import { format } from 'date-fns';
import { FiClock, FiEdit3 } from 'react-icons/fi';
import { categories } from '../constants/categories.js';
import { toDate } from '../utils/helpers.js';

export default function Timeline({ capsules, onEdit }) {
  const sorted = [...capsules].sort((a, b) => toDate(a.unlockAt).getTime() - toDate(b.unlockAt).getTime());

  return (
    <section className="vault-card p-5">
      <div className="mb-6 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-lg bg-vault-accent text-vault-ink">
          <FiClock aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold">Memory timeline</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Locked promises and unlocked memories, ordered by time.</p>
        </div>
      </div>

      <div className="relative space-y-5 pl-8 before:absolute before:bottom-0 before:left-3 before:top-0 before:w-px before:bg-slate-200 dark:before:bg-white/10">
        {sorted.map((capsule) => {
          const category = categories.find((item) => item.id === capsule.category) || categories[0];
          return (
            <article key={capsule.id} className="relative rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
              <span className="absolute -left-[34px] top-5 h-4 w-4 rounded-full ring-4 ring-white dark:ring-vault-panel" style={{ backgroundColor: category.color }} />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold" style={{ color: category.color }}>
                    {category.label} - {capsule.status}
                  </p>
                  <h3 className="mt-1 text-lg font-extrabold">{capsule.title}</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{format(toDate(capsule.unlockAt), 'EEEE, MMMM d, yyyy h:mm a')}</p>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{capsule.message}</p>
                </div>
                <button className="secondary-button" type="button" onClick={() => onEdit(capsule)}>
                  <FiEdit3 aria-hidden="true" />
                  Edit
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
