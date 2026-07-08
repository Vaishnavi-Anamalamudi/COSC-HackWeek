import { useEffect, useMemo, useState } from 'react';
import { FiDownload, FiFileText } from 'react-icons/fi';
import AdvancedInsights from './components/AdvancedInsights';
import BudgetManager from './components/BudgetManager';
import CategoryManager from './components/CategoryManager';
import Charts from './components/Charts';
import Dashboard from './components/Dashboard';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import Navbar from './components/Navbar';
import Settings from './components/Settings';
import Sidebar from './components/Sidebar';
import SummaryCards from './components/SummaryCards';
import { CURRENCIES, DEFAULT_CATEGORIES } from './constants/categories';
import { useBudget } from './hooks/useBudget';
import { useExpenses } from './hooks/useExpenses';
import {
  budgetUsage,
  categoryTotals,
  currentMonthTransactions,
  downloadCsv,
  downloadPdf,
  formatCurrency,
  summarizeTransactions,
} from './utils/helpers';
import { readStorage, writeStorage } from './utils/storage';

export default function App() {
  const {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    importSharedTransaction,
  } = useExpenses();
  const {
    budgetState,
    setMonthlyBudget,
    upsertCategoryBudget,
    addCategory,
    removeCategory,
    setCurrencyCode,
    addAccount,
    upsertSavingsGoal,
  } = useBudget();

  const [activeView, setActiveView] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [theme, setTheme] = useState(() => readStorage('fintrack-ai-theme', 'dark'));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    writeStorage('fintrack-ai-theme', theme);
  }, [theme]);

  const categories = useMemo(
    () =>
      budgetState.categories.map((category) => {
        const defaultMeta = DEFAULT_CATEGORIES.find((item) => item.name === category.name);
        return { ...category, icon: defaultMeta?.icon };
      }),
    [budgetState.categories],
  );

  const currency = useMemo(
    () =>
      CURRENCIES.find((item) => item.code === budgetState.currencyCode) ||
      CURRENCIES[0],
    [budgetState.currencyCode],
  );

  const alerts = useMemo(
    () =>
      budgetUsage(budgetState.categoryBudgets, transactions)
        .filter((item) => item.exceeded)
        .map((item) => `${item.category} budget exceeded`),
    [budgetState.categoryBudgets, transactions],
  );

  function handleTransactionSubmit(transaction) {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, transaction);
      setEditingTransaction(null);
      return;
    }
    addTransaction(transaction);
  }

  const commonProps = {
    transactions,
    categories,
    currency,
    budgetState,
    search,
  };

  function AnalyticsView() {
    const monthly = summarizeTransactions(currentMonthTransactions(transactions));
    const allTime = summarizeTransactions(transactions);
    const topCategories = categoryTotals(currentMonthTransactions(transactions)).slice(0, 5);

    return (
      <div className="space-y-5">
        <SummaryCards
          transactions={transactions}
          monthlyBudget={budgetState.monthlyBudget}
          currency={currency}
        />
        <Charts transactions={transactions} categories={categories} currency={currency} />
        <AdvancedInsights
          transactions={transactions}
          categories={categories}
          budgetState={budgetState}
          currency={currency}
        />
        <section className="grid gap-5 lg:grid-cols-3">
          {[
            ['Monthly summary', monthly.income, monthly.expenses],
            ['Weekly summary', monthly.income / 4, monthly.expenses / 4],
            ['Yearly summary', allTime.income, allTime.expenses],
          ].map(([label, income, expenses]) => (
            <article key={label} className="rounded-2xl border border-white/10 bg-panel/80 p-5 shadow-glass">
              <h2 className="text-base font-semibold text-frost">{label}</h2>
              <div className="mt-4 space-y-3 text-sm">
                <p className="flex justify-between text-slate-300">
                  <span>Income</span>
                  <span className="text-mint">{formatCurrency(income, currency)}</span>
                </p>
                <p className="flex justify-between text-slate-300">
                  <span>Expense</span>
                  <span className="text-rose-300">{formatCurrency(expenses, currency)}</span>
                </p>
                <p className="flex justify-between text-slate-300">
                  <span>Net</span>
                  <span>{formatCurrency(income - expenses, currency)}</span>
                </p>
              </div>
            </article>
          ))}
        </section>
        <article className="rounded-2xl border border-white/10 bg-panel/80 p-5 shadow-glass">
          <h2 className="text-lg font-semibold text-frost">Top spending categories</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {topCategories.map((item) => (
              <div key={item.name} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">{item.name}</p>
                <p className="mt-2 text-lg font-semibold text-frost">
                  {formatCurrency(item.value, currency)}
                </p>
              </div>
            ))}
          </div>
        </article>
      </div>
    );
  }

  function ReportsView() {
    return (
      <div className="space-y-5">
        <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-panel/80 p-5 shadow-glass">
          <div className="mr-auto">
            <h2 className="text-lg font-semibold text-frost">Reports</h2>
            <p className="text-sm text-slate-400">Export filtered finance data for review.</p>
          </div>
          <button className="btn-secondary" onClick={() => downloadCsv(transactions)} type="button">
            <FiDownload />
            Download CSV
          </button>
          <button className="btn-primary" onClick={() => downloadPdf('finance-report')} type="button">
            <FiFileText />
            Download PDF
          </button>
        </section>
        <div id="finance-report" className="space-y-5">
          <SummaryCards
            transactions={transactions}
            monthlyBudget={budgetState.monthlyBudget}
            currency={currency}
          />
          <Charts transactions={transactions} categories={categories} currency={currency} />
          <ExpenseList
            {...commonProps}
            onEdit={setEditingTransaction}
            onDelete={deleteTransaction}
            exportable={false}
          />
        </div>
      </div>
    );
  }

  function renderView() {
    if (activeView === 'Dashboard') {
      return (
        <Dashboard
          {...commonProps}
          setActiveView={setActiveView}
        />
      );
    }

    if (activeView === 'Expenses') {
      return (
        <section className="grid gap-5 xl:grid-cols-[420px_1fr]">
          <ExpenseForm
            key={editingTransaction?.id || 'new-transaction'}
            categories={categories}
            accounts={budgetState.accounts}
            onSubmit={handleTransactionSubmit}
            editingTransaction={editingTransaction}
            onCancelEdit={() => setEditingTransaction(null)}
          />
          <ExpenseList
            {...commonProps}
            onEdit={setEditingTransaction}
            onDelete={deleteTransaction}
          />
        </section>
      );
    }

    if (activeView === 'Categories') {
      return (
        <CategoryManager
          categories={categories}
          addCategory={addCategory}
          removeCategory={removeCategory}
          transactions={transactions}
        />
      );
    }

    if (activeView === 'Budgets') {
      return (
        <BudgetManager
          {...commonProps}
          setMonthlyBudget={setMonthlyBudget}
          upsertCategoryBudget={upsertCategoryBudget}
          upsertSavingsGoal={upsertSavingsGoal}
        />
      );
    }

    if (activeView === 'Analytics') return <AnalyticsView />;
    if (activeView === 'Reports') return <ReportsView />;

    return (
      <Settings
        budgetState={budgetState}
        setCurrencyCode={setCurrencyCode}
        addAccount={addAccount}
        transactions={transactions}
        importSharedTransaction={importSharedTransaction}
      />
    );
  }

  const pageBackground =
    theme === 'dark'
      ? 'linear-gradient(145deg, rgba(34,197,94,0.12) 0%, transparent 28%), linear-gradient(135deg, #0B1120 0%, #101827 48%, #09111E 100%)'
      : 'linear-gradient(145deg, rgba(34,197,94,0.14) 0%, transparent 30%), linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 52%, #F1F5F9 100%)';

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-ink text-frost' : 'light-mode bg-slate-100 text-slate-950'}`}>
      <div className="fixed inset-0 -z-10" style={{ background: pageBackground }} />
      <div className="flex min-h-screen">
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        {sidebarOpen && (
          <button
            className="fixed inset-0 z-30 bg-black/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            type="button"
            aria-label="Close sidebar overlay"
          />
        )}
        <main className="min-w-0 flex-1">
          <Navbar
            activeView={activeView}
            search={search}
            setSearch={setSearch}
            theme={theme}
            setTheme={setTheme}
            setSidebarOpen={setSidebarOpen}
            alerts={alerts}
          />
          <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}
