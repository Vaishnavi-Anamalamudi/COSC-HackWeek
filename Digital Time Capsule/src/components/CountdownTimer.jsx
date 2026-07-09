import { motion } from 'framer-motion';
import { useCountdown } from '../hooks/useCountdown.js';

const units = ['years', 'months', 'days', 'hours', 'minutes', 'seconds'];

export default function CountdownTimer({ target, compact = false }) {
  const countdown = useCountdown(target);
  const circumference = 2 * Math.PI * 44;
  const dayMs = 1000 * 60 * 60 * 24;
  const progress = countdown.unlocked ? 100 : Math.max(3, 100 - (countdown.total / (dayMs * 365)) * 100);
  const dash = circumference - (progress / 100) * circumference;

  if (compact) {
    return (
      <div className="grid grid-cols-4 gap-1 text-center text-xs">
        {['days', 'hours', 'minutes', 'seconds'].map((unit) => (
          <div key={unit} className="rounded-lg bg-slate-100 p-2 dark:bg-white/[0.06]">
            <p className="font-bold text-slate-950 dark:text-white">{countdown[unit]}</p>
            <p className="capitalize text-slate-500 dark:text-slate-400">{unit[0]}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid items-center gap-5 sm:grid-cols-[128px_1fr]">
      <div className="relative h-32 w-32">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-200 dark:text-white/10" />
          <motion.circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className="text-vault-accent"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: dash }}
            transition={{ duration: 0.7 }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <p className="text-2xl font-extrabold">{countdown.unlocked ? 'Open' : countdown.days}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{countdown.unlocked ? 'now' : 'days'}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {units.map((unit) => (
          <div key={unit} className="rounded-lg border border-slate-200 bg-white p-3 text-center dark:border-white/10 dark:bg-white/[0.05]">
            <p className="text-xl font-extrabold">{countdown[unit]}</p>
            <p className="mt-1 text-xs capitalize text-slate-500 dark:text-slate-400">{unit}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
