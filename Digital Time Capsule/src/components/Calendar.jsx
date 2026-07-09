import { endOfMonth, format, getDay, isSameDay, startOfMonth } from 'date-fns';
import { FiCalendar } from 'react-icons/fi';
import { categories } from '../constants/categories.js';
import { classNames, toDate } from '../utils/helpers.js';

export default function Calendar({ capsules, onEdit }) {
  const today = new Date();
  const start = startOfMonth(today);
  const end = endOfMonth(today);
  const padding = getDay(start);
  const days = Array.from({ length: padding + end.getDate() }, (_, index) => {
    if (index < padding) return null;
    return new Date(today.getFullYear(), today.getMonth(), index - padding + 1);
  });

  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-lg p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-vault-accent text-vault-ink">
            <FiCalendar aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold">{format(today, 'MMMM yyyy')}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Unlock dates and memory milestones in one monthly view.</p>
          </div>
        </div>
      </section>

      <section className="vault-card overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-200 text-center text-xs font-bold uppercase text-slate-500 dark:border-white/10 dark:text-slate-400">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-3">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dayCapsules = day ? capsules.filter((capsule) => isSameDay(toDate(capsule.unlockAt), day)) : [];
            return (
              <div key={day?.toISOString() || `empty-${index}`} className="min-h-28 border-b border-r border-slate-200 p-2 dark:border-white/10">
                {day && (
                  <>
                    <p className={classNames('mb-2 grid h-7 w-7 place-items-center rounded-lg text-sm font-bold', isSameDay(day, today) && 'bg-vault-accent text-vault-ink')}>{format(day, 'd')}</p>
                    <div className="space-y-1">
                      {dayCapsules.slice(0, 3).map((capsule) => {
                        const category = categories.find((item) => item.id === capsule.category) || categories[0];
                        return (
                          <button
                            key={capsule.id}
                            type="button"
                            className="block w-full truncate rounded-lg px-2 py-1 text-left text-xs font-semibold"
                            style={{ backgroundColor: `${category.color}22`, color: category.color }}
                            onClick={() => onEdit(capsule)}
                          >
                            {capsule.title}
                          </button>
                        );
                      })}
                      {dayCapsules.length > 3 && <p className="text-xs text-slate-500">+{dayCapsules.length - 3} more</p>}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
