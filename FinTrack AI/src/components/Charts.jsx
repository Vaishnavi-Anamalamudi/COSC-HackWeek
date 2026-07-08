import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  categoryTotals,
  currentMonthTransactions,
  formatCurrency,
  getCategoryMeta,
  monthlyTrend,
} from '../utils/helpers';

function ChartCard({ title, children }) {
  return (
    <article className="premium-panel rounded-2xl border border-white/10 p-5 shadow-glass backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-frost">{title}</h2>
      </div>
      <div className="h-72">{children}</div>
    </article>
  );
}

export default function Charts({ transactions, categories, currency }) {
  const categoryData = categoryTotals(currentMonthTransactions(transactions));
  const trendData = monthlyTrend(transactions);

  return (
    <section className="grid gap-5 xl:grid-cols-2">
      <ChartCard title="Category distribution">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              innerRadius={64}
              outerRadius={96}
              paddingAngle={4}
              dataKey="value"
              nameKey="name"
            >
              {categoryData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={getCategoryMeta(categories, entry.name).color}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatCurrency(value, currency)}
              contentStyle={{ background: '#0B1120', border: '1px solid rgba(255,255,255,.12)', borderRadius: 12 }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Income vs expense">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.18)" />
            <XAxis dataKey="name" stroke="#94A3B8" />
            <YAxis stroke="#94A3B8" tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
            <Tooltip
              formatter={(value) => formatCurrency(value, currency)}
              contentStyle={{ background: '#0B1120', border: '1px solid rgba(255,255,255,.12)', borderRadius: 12 }}
            />
            <Legend />
            <Bar dataKey="income" fill="#22C55E" radius={[8, 8, 0, 0]} />
            <Bar dataKey="expenses" fill="#FB7185" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Monthly trend">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.18)" />
            <XAxis dataKey="name" stroke="#94A3B8" />
            <YAxis stroke="#94A3B8" tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
            <Tooltip
              formatter={(value) => formatCurrency(value, currency)}
              contentStyle={{ background: '#0B1120', border: '1px solid rgba(255,255,255,.12)', borderRadius: 12 }}
            />
            <Line type="monotone" dataKey="expenses" stroke="#38BDF8" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="savings" stroke="#22C55E" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Savings area">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.18)" />
            <XAxis dataKey="name" stroke="#94A3B8" />
            <YAxis stroke="#94A3B8" tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
            <Tooltip
              formatter={(value) => formatCurrency(value, currency)}
              contentStyle={{ background: '#0B1120', border: '1px solid rgba(255,255,255,.12)', borderRadius: 12 }}
            />
            <Area type="monotone" dataKey="savings" stroke="#22C55E" fill="url(#savingsGradient)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </section>
  );
}
