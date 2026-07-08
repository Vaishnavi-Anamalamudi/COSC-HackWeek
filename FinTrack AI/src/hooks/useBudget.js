import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { readStorage, writeStorage } from '../utils/storage';
import { DEFAULT_CATEGORIES } from '../constants/categories';

const STORAGE_KEY = 'fintrack-ai-budget';

const defaultBudgetState = {
  monthlyBudget: 90000,
  categoryBudgets: [
    { id: uuid(), category: 'Food', limit: 16000 },
    { id: uuid(), category: 'Shopping', limit: 12000 },
    { id: uuid(), category: 'Transport', limit: 8000 },
    { id: uuid(), category: 'Bills', limit: 14000 },
    { id: uuid(), category: 'Health', limit: 7000 },
    { id: uuid(), category: 'Entertainment', limit: 10000 },
    { id: uuid(), category: 'Travel', limit: 18000 },
    { id: uuid(), category: 'Investment', limit: 30000 },
  ],
  savingsGoals: [
    { id: uuid(), name: 'Emergency fund', target: 300000, saved: 185000 },
    { id: uuid(), name: 'Japan trip', target: 220000, saved: 92000 },
  ],
  categories: DEFAULT_CATEGORIES.map(({ name, color }) => ({ name, color })),
  accounts: ['HDFC Wealth', 'Axis Reserve', 'UPI Wallet', 'ICICI Invest'],
  currencyCode: 'INR',
};

export function useBudget() {
  const [budgetState, setBudgetState] = useState(() =>
    readStorage(STORAGE_KEY, defaultBudgetState),
  );

  useEffect(() => {
    writeStorage(STORAGE_KEY, budgetState);
  }, [budgetState]);

  function setMonthlyBudget(monthlyBudget) {
    setBudgetState((current) => ({
      ...current,
      monthlyBudget: Number(monthlyBudget),
    }));
  }

  function upsertCategoryBudget(category, limit) {
    setBudgetState((current) => {
      const exists = current.categoryBudgets.some(
        (budget) => budget.category === category,
      );
      const categoryBudgets = exists
        ? current.categoryBudgets.map((budget) =>
            budget.category === category
              ? { ...budget, limit: Number(limit) }
              : budget,
          )
        : [
            ...current.categoryBudgets,
            { id: uuid(), category, limit: Number(limit) },
          ];

      return { ...current, categoryBudgets };
    });
  }

  function addCategory(name, color) {
    setBudgetState((current) => {
      if (current.categories.some((category) => category.name === name)) {
        return current;
      }
      return {
        ...current,
        categories: [...current.categories, { name, color }],
      };
    });
  }

  function removeCategory(name) {
    setBudgetState((current) => ({
      ...current,
      categories: current.categories.filter((category) => category.name !== name),
      categoryBudgets: current.categoryBudgets.filter(
        (budget) => budget.category !== name,
      ),
    }));
  }

  function setCurrencyCode(currencyCode) {
    setBudgetState((current) => ({ ...current, currencyCode }));
  }

  function addAccount(account) {
    setBudgetState((current) => {
      if (!account || current.accounts.includes(account)) return current;
      return { ...current, accounts: [...current.accounts, account] };
    });
  }

  function upsertSavingsGoal(goal) {
    setBudgetState((current) => {
      const goals = current.savingsGoals.some((item) => item.id === goal.id)
        ? current.savingsGoals.map((item) => (item.id === goal.id ? goal : item))
        : [...current.savingsGoals, { id: uuid(), ...goal }];
      return { ...current, savingsGoals: goals };
    });
  }

  return {
    budgetState,
    setMonthlyBudget,
    upsertCategoryBudget,
    addCategory,
    removeCategory,
    setCurrencyCode,
    addAccount,
    upsertSavingsGoal,
  };
}
