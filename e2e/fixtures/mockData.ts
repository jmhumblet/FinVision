import { Transaction, Projection, TransactionType, Frequency, Category } from '../../types';

export const mockUser = {
  uid: 'test-user-id',
  displayName: 'Test User',
  email: 'test@example.com',
  isAnonymous: true,
};

export const mockCategories: Category[] = [
  { id: '1', name: 'Salary', color: '#10b981' },
  { id: '2', name: 'Rent/Mortgage', color: '#ef4444' },
  { id: '3', name: 'Groceries', color: '#f59e0b' },
  { id: '4', name: 'Utilities', color: '#3b82f6' },
  { id: '8', name: 'Other', color: '#94a3b8' },
];

export const mockTransactions: Transaction[] = [
  {
    id: 'tx-1',
    date: '2026-01-01',
    description: 'Initial Balance',
    amount: 1000,
    categoryId: '1',
    type: TransactionType.INCOME,
  },
  {
    id: 'tx-2',
    date: '2026-01-15',
    description: 'Grocery Run',
    amount: 150,
    categoryId: '3',
    type: TransactionType.EXPENSE,
  },
];

export const mockProjections: Projection[] = [
  {
    id: 'proj-1',
    name: 'Monthly Salary',
    amount: 3000,
    frequency: Frequency.MONTHLY,
    startDate: '2026-02-01',
    categoryId: '1',
    type: TransactionType.INCOME,
    isActive: true,
  },
  {
    id: 'proj-2',
    name: 'Rent',
    amount: 1200,
    frequency: Frequency.MONTHLY,
    startDate: '2026-02-01',
    categoryId: '2',
    type: TransactionType.EXPENSE,
    isActive: true,
  },
];

export const mockSettings = {
  initialBalance: 0,
  projectionDays: 180,
};
