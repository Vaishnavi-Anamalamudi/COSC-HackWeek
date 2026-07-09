import { motion } from 'framer-motion';
import {
  FiActivity,
  FiArrowDownCircle,
  FiArrowUpCircle,
  FiPieChart,
  FiTrendingUp,
} from 'react-icons/fi';
import { currentMonthTransactions, formatCurrency, summarizeTransactions } from '../utils/helpers';

const cardMeta = [
  { label: 'Total balance', key: 'balance', icon: FiActivity, tone: 'from-emerald-400/25' },
  { label: 'Monthly expenses', key: 'monthlyExpenses', icon: FiArrowDownCircle, tone: 'from-rose-400/25' },
  { label: 'Monthly income', key: 'monthlyIncome', icon: FiArrowUpCircle, tone: 'from-sky-400/25' },
  { label: 'Remaining budget', key: 'remainingBudget', icon: FiPieChart, tone: 'from-amber-400/25' },
  { label: 'Savings', key: 'savings', icon: FiTrendingUp, tone: 'from-lime-400/25' },
];

export default function SummaryCards({ transactions, monthlyBudget, currency }) {
  const allTime = summarizeTransactions(transactions);
  const monthly = summarizeTransactions(currentMonthTransactions(transactions));
  const data = {
    balance: allTime.balance,
    monthlyExpenses: monthly.expenses,
    monthlyIncome: monthly.income,
    remainingBudget: Math.max(Number(monthlyBudget || 0) - monthly.expenses, 0),
    savings: Math.max(monthly.income - monthly.expenses, 0),
  };

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cardMeta.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.article
            key={card.key}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="premium-panel relative min-h-[158px] overflow-hidden rounded-2xl border border-white/10 p-5 shadow-glass backdrop-blur-xl transition hover:-translate-y-1 hover:border-mint/40"
          >
            <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${card.tone} to-transparent`} />
            <div className="relative flex items-start justify-between">
              <span className="text-sm leading-5 text-slate-400">{card.label}</span>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-mint">
                <Icon />
              </span>
            </div>
            <p className="relative mt-5 break-words text-xl font-bold text-frost 2xl:text-2xl">
              {formatCurrency(data[card.key], currency)}
            </p>
          </motion.article>
        );
      })}
    </section>
  );
}
