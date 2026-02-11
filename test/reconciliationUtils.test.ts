import { describe, it, expect } from 'vitest';
import { getUnreconciledProjections, createReconciliationTransaction } from '../utils/financialUtils';
import { Projection, TransactionType, Frequency } from '../types';

describe('Reconciliation Utils', () => {
  const mockProjections: Projection[] = [
    {
      id: 'p1',
      name: 'Salary',
      amount: 3000,
      frequency: Frequency.MONTHLY,
      startDate: '2026-01-25',
      categoryId: '1',
      type: TransactionType.INCOME,
      isActive: true
    },
    {
      id: 'p2',
      name: 'Rent',
      amount: 1200,
      frequency: Frequency.MONTHLY,
      startDate: '2026-02-01',
      categoryId: '2',
      type: TransactionType.EXPENSE,
      isActive: true
    }
  ];

  it('gets unreconciled projections between two dates', () => {
    // Range from Jan 26 to Feb 5
    const results = getUnreconciledProjections('2026-01-26', '2026-02-05', mockProjections);
    
    // Should find:
    // Salary on Jan 25? NO, range starts Jan 26.
    // Wait, Frequency.MONTHLY on 25th.
    // Rent on Feb 1st. YES.
    
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Rent');
    expect(results[0].dateStr).toBe('2026-02-01');
  });

  it('includes projections on the boundary dates', () => {
    const results = getUnreconciledProjections('2026-01-25', '2026-01-25', mockProjections);
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Salary');
  });

  it('creates a reconciliation transaction with correct type', () => {
    const incomeAdj = createReconciliationTransaction(100, '2026-02-08');
    expect(incomeAdj.amount).toBe(100);
    expect(incomeAdj.type).toBe(TransactionType.INCOME);
    
    const expenseAdj = createReconciliationTransaction(-50, '2026-02-08');
    expect(expenseAdj.amount).toBe(50);
    expect(expenseAdj.type).toBe(TransactionType.EXPENSE);
  });
});
