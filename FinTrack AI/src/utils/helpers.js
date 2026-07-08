import {
  differenceInCalendarDays,
  eachMonthOfInterval,
  endOfMonth,
  format,
  getDaysInMonth,
  isSameMonth,
  parseISO,
  startOfMonth,
  subMonths,
} from 'date-fns';

export function formatCurrency(amount, currency) {
  const value = Number(amount || 0);
  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
    maximumFractionDigits: 0,
  }).format(value);
}

export function getCategoryMeta(categories, categoryName) {
  return (
    categories.find((category) => category.name === categoryName) ||
    categories.find((category) => category.name === 'Others') ||
    categories[0]
  );
}

export function currentMonthTransactions(transactions) {
  return transactions.filter((transaction) =>
    isSameMonth(parseISO(transaction.date), new Date()),
  );
}

export function transactionsForMonth(transactions, monthKey) {
  return transactions.filter(
    (transaction) => format(parseISO(transaction.date), 'yyyy-MM') === monthKey,
  );
}

export function availableMonthOptions(transactions) {
  const recentMonths = eachMonthOfInterval({
    start: startOfMonth(subMonths(new Date(), 11)),
    end: endOfMonth(new Date()),
  });
  const keys = new Set(recentMonths.map((month) => format(month, 'yyyy-MM')));

  transactions.forEach((transaction) => {
    keys.add(format(parseISO(transaction.date), 'yyyy-MM'));
  });

  return [...keys]
    .sort()
    .reverse()
    .map((key) => ({
      key,
      label: format(parseISO(`${key}-01`), 'MMMM yyyy'),
    }));
}

export function previousMonthKey(monthKey) {
  return format(subMonths(parseISO(`${monthKey}-01`), 1), 'yyyy-MM');
}

export function summarizeTransactions(transactions) {
  return transactions.reduce(
    (summary, transaction) => {
      const amount = Number(transaction.amount);
      if (transaction.type === 'income') {
        summary.income += amount;
      } else {
        summary.expenses += amount;
      }
      summary.balance = summary.income - summary.expenses;
      return summary;
    },
    { income: 0, expenses: 0, balance: 0 },
  );
}

export function categoryTotals(transactions) {
  const totals = {};
  transactions
    .filter((transaction) => transaction.type === 'expense')
    .forEach((transaction) => {
      totals[transaction.category] =
        (totals[transaction.category] || 0) + Number(transaction.amount);
    });

  return Object.entries(totals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function budgetUsageForTransactions(categoryBudgets, transactions) {
  const totals = categoryTotals(transactions);
  return categoryBudgets.map((budget) => {
    const spent = totals.find((item) => item.name === budget.category)?.value || 0;
    const limit = Number(budget.limit || 0);
    return {
      ...budget,
      spent,
      remaining: Math.max(limit - spent, 0),
      percent: limit > 0 ? Math.min(Math.round((spent / limit) * 100), 999) : 0,
      exceeded: spent > limit && limit > 0,
    };
  });
}

export function monthlyTrend(transactions) {
  const months = eachMonthOfInterval({
    start: startOfMonth(subMonths(new Date(), 5)),
    end: endOfMonth(new Date()),
  });

  return months.map((month) => {
    const scoped = transactions.filter((transaction) =>
      isSameMonth(parseISO(transaction.date), month),
    );
    const summary = summarizeTransactions(scoped);
    return {
      name: format(month, 'MMM'),
      income: summary.income,
      expenses: summary.expenses,
      savings: Math.max(summary.income - summary.expenses, 0),
    };
  });
}

export function budgetUsage(categoryBudgets, transactions) {
  return budgetUsageForTransactions(
    categoryBudgets,
    currentMonthTransactions(transactions),
  );
}

export function budgetPace(transactions, monthlyBudget, monthKey) {
  const monthStart = parseISO(`${monthKey}-01`);
  const today = new Date();
  const isCurrentMonth = isSameMonth(monthStart, today);
  const daysInMonth = getDaysInMonth(monthStart);
  const daysElapsed = isCurrentMonth
    ? Math.max(differenceInCalendarDays(today, monthStart) + 1, 1)
    : daysInMonth;
  const summary = summarizeTransactions(transactions);
  const dailyAverage = summary.expenses / daysElapsed;
  const projectedExpenses = dailyAverage * daysInMonth;
  const budget = Number(monthlyBudget || 0);

  return {
    daysElapsed,
    daysInMonth,
    dailyAverage,
    projectedExpenses,
    projectedRemaining: Math.max(budget - projectedExpenses, 0),
    budgetPercent: budget > 0 ? Math.round((summary.expenses / budget) * 100) : 0,
    projectedPercent: budget > 0 ? Math.round((projectedExpenses / budget) * 100) : 0,
    projectedOverBudget: budget > 0 && projectedExpenses > budget,
  };
}

export function recurringExpenseTotal(transactions) {
  return transactions
    .filter((transaction) => transaction.type === 'expense' && transaction.recurring)
    .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);
}

export function toCsv(transactions) {
  const headers = ['Date', 'Type', 'Title', 'Category', 'Account', 'Amount', 'Note'];
  const rows = transactions.map((transaction) =>
    [
      transaction.date,
      transaction.type,
      transaction.title,
      transaction.category,
      transaction.account,
      transaction.amount,
      transaction.note || '',
    ]
      .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
      .join(','),
  );
  return [headers.join(','), ...rows].join('\n');
}

export function downloadCsv(transactions) {
  const blob = new Blob([toCsv(transactions)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `fintrack-ai-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function downloadPdf(elementId) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const canvas = await html2canvas(element, {
    backgroundColor: '#0B1120',
    scale: 2,
  });
  const imageData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const width = pdf.internal.pageSize.getWidth();
  const height = (canvas.height * width) / canvas.width;
  pdf.addImage(imageData, 'PNG', 0, 0, width, Math.min(height, 287));
  pdf.save(`fintrack-ai-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

export function createSharePayload(transaction) {
  return btoa(
    JSON.stringify({
      app: 'FinTrack AI',
      title: transaction.title,
      amount: transaction.amount,
      category: transaction.category,
      date: transaction.date,
    }),
  );
}
