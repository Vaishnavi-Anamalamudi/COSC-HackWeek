import { useEffect, useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { subDays } from 'date-fns';
import { readStorage, writeStorage } from '../utils/storage';

const STORAGE_KEY = 'fintrack-ai-transactions';

const seedTransactions = [
  {
    id: uuid(),
    type: 'income',
    title: 'Product salary',
    amount: 145000,
    category: 'Income',
    account: 'HDFC Wealth',
    date: subDays(new Date(), 2).toISOString().slice(0, 10),
    note: 'Monthly salary credited',
    recurring: true,
  },
  {
    id: uuid(),
    type: 'expense',
    title: 'Grocery and essentials',
    amount: 6200,
    category: 'Food',
    account: 'HDFC Wealth',
    date: subDays(new Date(), 1).toISOString().slice(0, 10),
    note: 'Weekly home supplies',
    recurring: false,
  },
  {
    id: uuid(),
    type: 'expense',
    title: 'Metro card top-up',
    amount: 1800,
    category: 'Transport',
    account: 'UPI Wallet',
    date: subDays(new Date(), 4).toISOString().slice(0, 10),
    note: 'Commute pass',
    recurring: true,
  },
  {
    id: uuid(),
    type: 'expense',
    title: 'Index fund SIP',
    amount: 25000,
    category: 'Investment',
    account: 'ICICI Invest',
    date: subDays(new Date(), 6).toISOString().slice(0, 10),
    note: 'Monthly wealth plan',
    recurring: true,
  },
  {
    id: uuid(),
    type: 'expense',
    title: 'Electricity bill',
    amount: 3200,
    category: 'Bills',
    account: 'HDFC Wealth',
    date: subDays(new Date(), 9).toISOString().slice(0, 10),
    note: 'Auto-pay utility',
    recurring: true,
  },
  {
    id: uuid(),
    type: 'income',
    title: 'Freelance dashboard audit',
    amount: 28000,
    category: 'Income',
    account: 'Axis Reserve',
    date: subDays(new Date(), 12).toISOString().slice(0, 10),
    note: 'Consulting payout',
    recurring: false,
  },
  {
    id: uuid(),
    type: 'expense',
    title: 'Weekend dinner',
    amount: 4200,
    category: 'Entertainment',
    account: 'UPI Wallet',
    date: subDays(new Date(), 15).toISOString().slice(0, 10),
    note: 'Friends night out',
    recurring: false,
  },
  {
    id: uuid(),
    type: 'expense',
    title: 'Design course',
    amount: 7800,
    category: 'Education',
    account: 'Axis Reserve',
    date: subDays(new Date(), 23).toISOString().slice(0, 10),
    note: 'Skill upgrade',
    recurring: false,
  },
];

export function useExpenses() {
  const [transactions, setTransactions] = useState(() =>
    readStorage(STORAGE_KEY, seedTransactions),
  );

  useEffect(() => {
    writeStorage(STORAGE_KEY, transactions);
  }, [transactions]);

  const sortedTransactions = useMemo(
    () =>
      [...transactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [transactions],
  );

  function addTransaction(transaction) {
    setTransactions((current) => [
      {
        id: uuid(),
        receipt: '',
        note: '',
        recurring: false,
        ...transaction,
        amount: Number(transaction.amount),
      },
      ...current,
    ]);
  }

  function updateTransaction(id, patch) {
    setTransactions((current) =>
      current.map((transaction) =>
        transaction.id === id
          ? { ...transaction, ...patch, amount: Number(patch.amount) }
          : transaction,
      ),
    );
  }

  function deleteTransaction(id) {
    setTransactions((current) =>
      current.filter((transaction) => transaction.id !== id),
    );
  }

  function importSharedTransaction(encodedPayload) {
    const decoded = JSON.parse(atob(encodedPayload));
    addTransaction({
      type: 'expense',
      title: decoded.title,
      amount: decoded.amount,
      category: decoded.category,
      account: 'Imported',
      date: decoded.date,
      note: 'Imported from QR/share payload',
    });
  }

  return {
    transactions: sortedTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    importSharedTransaction,
  };
}
