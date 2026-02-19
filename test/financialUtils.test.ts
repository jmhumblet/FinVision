import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatCurrency, formatDate, generateTimeline, getMonthKey, calculateMonthlySummary } from '../utils/financialUtils';
import { Transaction, Projection, TransactionType, Frequency, AdjustmentType, Scenario } from '../types';

describe('financialUtils', () => {
  describe('getMonthKey', () => {
    it('should return YYYY-MM for a given date', () => {
      expect(getMonthKey(new Date('2026-02-07'))).toBe('2026-02');
      expect(getMonthKey(new Date('2026-12-25'))).toBe('2026-12');
    });

    it('should default to today', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-05-10T00:00:00Z'));
      expect(getMonthKey()).toBe('2026-05');
      vi.useRealTimers();
    });
  });

  describe('calculateMonthlySummary', () => {
    const projections: Projection[] = [
      {
        id: 'p1',
        name: 'Salary',
        amount: 3000,
        frequency: Frequency.MONTHLY,
        startDate: '2026-02-25',
        categoryId: 'salary',
        type: TransactionType.INCOME,
        isActive: true
      },
      {
        id: 'p2',
        name: 'Rent',
        amount: 1000,
        frequency: Frequency.MONTHLY,
        startDate: '2026-02-01',
        categoryId: 'rent',
        type: TransactionType.EXPENSE,
        isActive: true
      },
      {
        id: 'p3',
        name: 'Internet',
        amount: 50,
        frequency: Frequency.MONTHLY,
        startDate: '2026-02-15',
        categoryId: 'util',
        type: TransactionType.EXPENSE,
        isActive: true
      }
    ];

    it('should calculate summary correctly with no cleared transactions', () => {
      const summary = calculateMonthlySummary('2026-02', 1000, [], projections);
      
      // Total Income: 3000 (Salary)
      // Total Expenses: 1000 (Rent) + 50 (Internet) = 1050
      // Remaining Spendable: 1000 (balance) + 3000 - 1050 = 2950
      expect(summary.totalProjectedIncome).toBe(3000);
      expect(summary.totalProjectedExpenses).toBe(1050);
      expect(summary.remainingSpendable).toBe(2950);
      expect(summary.spentPercentage).toBe(0);
    });

    it('should handle cleared transactions', () => {
      // Clear Rent (occurred on 2026-02-01)
      const cleared = ['p2_2026-02-01'];
      const summary = calculateMonthlySummary('2026-02', 0, cleared, projections);
      
      // Total Income: 3000
      // Total Expenses: 1050
      // Remaining Income: 3000
      // Remaining Expenses: 50 (Rent is cleared)
      // Remaining Spendable: 0 (balance) + 3000 - 50 = 2950
      expect(summary.remainingSpendable).toBe(2950);
      // Spent %: (1050 - 50) / 1050 * 100 = 1000 / 1050 * 100 approx 95.2%
      expect(summary.spentPercentage).toBeCloseTo(95.23, 1);
    });
  });

  describe('formatCurrency', () => {
    it('should format numbers as EUR currency', () => {
      // Use regex because of non-breaking spaces or different space characters in different environments
      expect(formatCurrency(1000)).toMatch(/€1,000/);
      expect(formatCurrency(0)).toMatch(/€0/);
      expect(formatCurrency(-500)).toMatch(/-€500/);
    });

    it('should handle large numbers', () => {
      expect(formatCurrency(1000000)).toMatch(/€1,000,000/);
    });
  });

  describe('formatDate', () => {
    it('should format ISO date strings correctly', () => {
      expect(formatDate('2026-02-07')).toBe('7 Feb 2026');
      expect(formatDate('2026-12-25')).toBe('25 Dec 2026');
    });
  });

  describe('generateTimeline', () => {
    beforeEach(() => {
      // Mock "today" to 2026-02-07
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-02-07T00:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should handle empty transactions and projections', () => {
      const startingBalance = 1000;
      const timeline = generateTimeline(startingBalance, [], [], 30);
      
      // Starts 30 days before today
      expect(timeline[0].date).toBe('2026-01-08');
      expect(timeline[timeline.length - 1].date).toBe('2026-03-09');
      
      // Every point should have the starting balance since there are no changes
      timeline.forEach(point => {
        if (point.historicalBalance !== null) {
          expect(point.historicalBalance).toBe(startingBalance);
        }
        if (point.projectedBalance !== null) {
          expect(point.projectedBalance).toBe(startingBalance);
        }
      });
    });

    it('should apply historical transactions correctly', () => {
      const startingBalance = 1000;
      const transactions: Transaction[] = [
        {
          id: '1',
          date: '2026-01-15',
          description: 'Salary',
          amount: 2000,
          categoryId: '1',
          type: TransactionType.INCOME
        },
        {
          id: '2',
          date: '2026-02-01',
          description: 'Rent',
          amount: 800,
          categoryId: '2',
          type: TransactionType.EXPENSE
        }
      ];
      
      const timeline = generateTimeline(startingBalance, transactions, [], 30);
      
      // Before 2026-01-15
      const beforeSalary = timeline.find(p => p.date === '2026-01-14');
      expect(beforeSalary?.historicalBalance).toBe(1000);
      
      // On 2026-01-15
      const onSalary = timeline.find(p => p.date === '2026-01-15');
      expect(onSalary?.historicalBalance).toBe(3000);
      
      // After Rent
      const afterRent = timeline.find(p => p.date === '2026-02-02');
      expect(afterRent?.projectedBalance).toBe(2200);
      expect(afterRent?.historicalBalance).toBe(null);
    });

    it('should apply base projections correctly', () => {
      const startingBalance = 1000;
      const projections: Projection[] = [
        {
          id: 'p1',
          name: 'Weekly Allowance',
          amount: 100,
          frequency: Frequency.WEEKLY,
          startDate: '2026-02-10', // A Tuesday
          categoryId: '3',
          type: TransactionType.INCOME,
          isActive: true
        },
        {
          id: 'p2',
          name: 'Monthly Subscription',
          amount: 50,
          frequency: Frequency.MONTHLY,
          startDate: '2026-02-15',
          categoryId: '4',
          type: TransactionType.EXPENSE,
          isActive: true
        }
      ];
      
      // No transactions, so last transaction date is "today" (2026-02-07)
      const timeline = generateTimeline(startingBalance, [], projections, 60);
      
      // 2026-02-07 is the last "historical" day (or today)
      const todayPoint = timeline.find(p => p.date === '2026-02-07');
      expect(todayPoint?.projectedBalance).toBe(1000);
      
      // First Weekly Allowance on 2026-02-10 (Tuesday)
      const firstWeekly = timeline.find(p => p.date === '2026-02-10');
      expect(firstWeekly?.projectedBalance).toBe(1100);
      
      // Second Weekly Allowance on 2026-02-17 (Tuesday)
      const secondWeekly = timeline.find(p => p.date === '2026-02-17');
      // 1100 + 100 (weekly) - 50 (monthly subscription on 15th) = 1150
      expect(secondWeekly?.projectedBalance).toBe(1150);
      
      const on15th = timeline.find(p => p.date === '2026-02-15');
      expect(on15th?.projectedBalance).toBe(1050);
    });

    it('should apply scenario adjustments correctly', () => {
      const startingBalance = 1000;
      const projections: Projection[] = [
        {
          id: 'p1',
          name: 'Salary',
          amount: 3000,
          frequency: Frequency.MONTHLY,
          startDate: '2026-02-25',
          categoryId: 'salary',
          type: TransactionType.INCOME,
          isActive: true
        }
      ];
      
      const scenario: Scenario = {
        id: 's1',
        name: 'Better Job',
        color: 'blue',
        isActive: true,
        adjustments: [
          {
            id: 'a1',
            projectionId: 'p1',
            type: AdjustmentType.SET_AMOUNT,
            value: 4000,
            startDate: '2026-03-01'
          }
        ]
      };
      
      const timeline = generateTimeline(startingBalance, [], projections, 60, [scenario]);
      
      // Feb 25: Both should have 1000 + 3000 = 4000
      const feb25 = timeline.find(p => p.date === '2026-02-25');
      expect(feb25?.projectedBalance).toBe(4000);
      expect(feb25?.scenario_s1).toBe(4000);
      
      // March 25: 
      // Base: 4000 + 3000 = 7000
      // Scenario: 4000 + 4000 = 8000
      const march25 = timeline.find(p => p.date === '2026-03-25');
      expect(march25?.projectedBalance).toBe(7000);
      expect(march25?.scenario_s1).toBe(8000);
    });

    it('should handle PERCENT_INC and PERCENT_DEC adjustments', () => {
      const startingBalance = 1000;
      const projections: Projection[] = [
        {
          id: 'p1',
          name: 'Rent',
          amount: 1000,
          frequency: Frequency.MONTHLY,
          startDate: '2026-02-10',
          categoryId: 'rent',
          type: TransactionType.EXPENSE,
          isActive: true
        }
      ];
      
      const scenario: Scenario = {
        id: 's1',
        name: 'Rent Increase',
        color: 'red',
        isActive: true,
        adjustments: [
          {
            id: 'a1',
            projectionId: 'p1',
            type: AdjustmentType.PERCENTAGE_INCREASE,
            value: 10, // 10% increase
            startDate: '2026-03-01'
          }
        ]
      };
      
      const timeline = generateTimeline(startingBalance, [], projections, 60, [scenario]);
      
      // Feb 10: Both 1000 - 1000 = 0
      const feb10 = timeline.find(p => p.date === '2026-02-10');
      expect(feb10?.projectedBalance).toBe(0);
      expect(feb10?.scenario_s1).toBe(0);
      
      // March 10:
      // Base: 0 - 1000 = -1000
      // Scenario: 0 - (1000 * 1.1) = -1100
      const march10 = timeline.find(p => p.date === '2026-03-10');
      expect(march10?.projectedBalance).toBe(-1000);
      expect(march10?.scenario_s1).toBe(-1100);
    });

    it('should handle ADD_AMOUNT adjustments', () => {
        const startingBalance = 1000;
        const projections: Projection[] = [
          {
            id: 'p1',
            name: 'Bonus',
            amount: 500,
            frequency: Frequency.ONCE,
            startDate: '2026-03-15',
            categoryId: 'bonus',
            type: TransactionType.INCOME,
            isActive: true
          }
        ];
        
        const scenario: Scenario = {
          id: 's1',
          name: 'Extra Bonus',
          color: 'green',
          isActive: true,
          adjustments: [
            {
              id: 'a1',
              projectionId: 'p1',
              type: AdjustmentType.ADD_AMOUNT,
              value: 200,
              startDate: '2026-03-01'
            }
          ]
        };
        
        const timeline = generateTimeline(startingBalance, [], projections, 60, [scenario]);
        
        const march15 = timeline.find(p => p.date === '2026-03-15');
        expect(march15?.projectedBalance).toBe(1500);
        expect(march15?.scenario_s1).toBe(1700);
      });

    it('should handle leap years (Feb 29) in non-leap years', () => {
      const startingBalance = 1000;
      const projections: Projection[] = [
        {
          id: 'p1',
          name: 'Annual Fee',
          amount: 100,
          frequency: Frequency.YEARLY,
          startDate: '2024-02-29', // Leap year
          categoryId: 'fee',
          type: TransactionType.EXPENSE,
          isActive: true
        }
      ];
      
      // Project from 2026-02-07
      const timeline = generateTimeline(startingBalance, [], projections, 365);
      
      // In 2026, there is no Feb 29. 
      // It should trigger on Feb 28th because it's the last day of February.
      const feb28 = timeline.find(p => p.date === '2026-02-28');
      expect(feb28?.projectedBalance).toBe(900);
    });

    it('should trigger yearly projections on Feb 29 during a leap year', () => {
        vi.setSystemTime(new Date('2024-02-01T00:00:00Z'));
        const startingBalance = 1000;
        const projections: Projection[] = [
          {
            id: 'p1',
            name: 'Leap Year Gift',
            amount: 500,
            frequency: Frequency.YEARLY,
            startDate: '2020-02-29',
            categoryId: 'gift',
            type: TransactionType.INCOME,
            isActive: true
          }
        ];

        const timeline = generateTimeline(startingBalance, [], projections, 60);
        const feb29 = timeline.find(p => p.date === '2024-02-29');
        expect(feb29?.projectedBalance).toBe(1500);
    });

    it('should trigger monthly projections on the last day of shorter months', () => {
        vi.setSystemTime(new Date('2026-04-01T00:00:00Z'));
        const startingBalance = 1000;
        const projections: Projection[] = [
          {
            id: 'p1',
            name: 'Subscription',
            amount: 50,
            frequency: Frequency.MONTHLY,
            startDate: '2026-01-31',
            categoryId: 'sub',
            type: TransactionType.EXPENSE,
            isActive: true
          }
        ];

        const timeline = generateTimeline(startingBalance, [], projections, 60);
        // April has only 30 days. Should trigger on April 30th.
        const april30 = timeline.find(p => p.date === '2026-04-30');
        expect(april30?.projectedBalance).toBe(950);

        // May has 31 days. Should trigger on May 31st.
        const may31 = timeline.find(p => p.date === '2026-05-31');
        expect(may31?.projectedBalance).toBe(900);
    });

    it('should expand startDate if first transaction is older than 30 days', () => {
      const startingBalance = 1000;
      const transactions: Transaction[] = [
        {
          id: '1',
          date: '2025-12-01',
          description: 'Old Transaction',
          amount: 500,
          categoryId: '1',
          type: TransactionType.INCOME
        }
      ];
      const timeline = generateTimeline(startingBalance, transactions, [], 30);
      expect(timeline[0].date).toBe('2025-12-01');
    });

    it('should handle PERCENT_DEC adjustments', () => {
      const startingBalance = 1000;
      const projections: Projection[] = [
        {
          id: 'p1',
          name: 'Expenses',
          amount: 1000,
          frequency: Frequency.MONTHLY,
          startDate: '2026-02-10',
          categoryId: 'exp',
          type: TransactionType.EXPENSE,
          isActive: true
        }
      ];
      
      const scenario: Scenario = {
        id: 's1',
        name: 'Cut Costs',
        color: 'green',
        isActive: true,
        adjustments: [
          {
            id: 'a1',
            projectionId: 'p1',
            type: AdjustmentType.PERCENTAGE_DECREASE,
            value: 20, // 20% decrease
            startDate: '2026-03-01'
          }
        ]
      };
      
      const timeline = generateTimeline(startingBalance, [], projections, 60, [scenario]);
      
      // March 10:
      // Base: 0 - 1000 = -1000
      // Scenario: 0 - (1000 * 0.8) = -800
      const march10 = timeline.find(p => p.date === '2026-03-10');
      expect(march10?.projectedBalance).toBe(-1000);
      expect(march10?.scenario_s1).toBe(-800);
    });

    it('should ignore inactive projections and scenarios', () => {
      const startingBalance = 1000;
      const projections: Projection[] = [
        {
          id: 'p1',
          name: 'Inactive Proj',
          amount: 1000,
          frequency: Frequency.MONTHLY,
          startDate: '2026-02-10',
          categoryId: '1',
          type: TransactionType.INCOME,
          isActive: false
        }
      ];
      
      const scenario: Scenario = {
        id: 's1',
        name: 'Inactive Scenario',
        color: 'red',
        isActive: false,
        adjustments: []
      };
      
      const timeline = generateTimeline(startingBalance, [], projections, 30, [scenario]);
      const feb10 = timeline.find(p => p.date === '2026-02-10');
      expect(feb10?.projectedBalance).toBe(1000);
      expect(feb10?.scenario_s1).toBeUndefined();
    });

    it('should handle daily projections', () => {
        const startingBalance = 1000;
        const projections: Projection[] = [
          {
            id: 'p1',
            name: 'Daily Expense',
            amount: 10,
            frequency: Frequency.DAILY,
            startDate: '2026-02-10',
            categoryId: '1',
            type: TransactionType.EXPENSE,
            isActive: true
          }
        ];
        const timeline = generateTimeline(startingBalance, [], projections, 5);
        
        // Today is Feb 07. 
        // Feb 10: 1000 - 10 = 990
        // Feb 11: 990 - 10 = 980
        // Feb 12: 980 - 10 = 970
        const feb12 = timeline.find(p => p.date === '2026-02-12');
        expect(feb12?.projectedBalance).toBe(970);
    });

    it('should handle projections starting in the future or ending in the past', () => {
        const startingBalance = 1000;
        const projections: Projection[] = [
            {
                id: 'p1',
                name: 'Future Proj',
                amount: 100,
                frequency: Frequency.WEEKLY,
                startDate: '2026-04-01',
                categoryId: '1',
                type: TransactionType.INCOME,
                isActive: true
            },
            {
                id: 'p2',
                name: 'Ended Proj',
                amount: 100,
                frequency: Frequency.WEEKLY,
                startDate: '2026-01-01',
                endDate: '2026-01-31',
                categoryId: '2',
                type: TransactionType.INCOME,
                isActive: true
            }
        ];
        
        const timeline = generateTimeline(startingBalance, [], projections, 30);
        const anyDay = timeline[timeline.length - 1];
        expect(anyDay.projectedBalance).toBe(1000); // Neither should have triggered
    });

    it('should handle adjustments with dates', () => {
        const startingBalance = 1000;
        const projections: Projection[] = [
          {
            id: 'p1',
            name: 'Salary',
            amount: 3000,
            frequency: Frequency.MONTHLY,
            startDate: '2026-02-25',
            categoryId: 'salary',
            type: TransactionType.INCOME,
            isActive: true
          }
        ];
        
        const scenario: Scenario = {
          id: 's1',
          name: 'Temporary Raise',
          color: 'blue',
          isActive: true,
          adjustments: [
            {
              id: 'a1',
              projectionId: 'p1',
              type: AdjustmentType.SET_AMOUNT,
              value: 4000,
              startDate: '2026-03-01',
              endDate: '2026-04-01'
            }
          ]
        };
        
        const timeline = generateTimeline(startingBalance, [], projections, 90, [scenario]);
        
        // March 25: Adjustment active (4000)
        const march25 = timeline.find(p => p.date === '2026-03-25');
        expect(march25?.scenario_s1).toBe(1000 + 3000 + 4000); // 1000 starting + 3000 feb + 4000 march

        // April 25: Adjustment inactive (back to 3000)
        const april25 = timeline.find(p => p.date === '2026-04-25');
        // Base: 1000 + 3000 + 3000 + 3000 = 10000
        // Scenario: 1000 + 3000 (feb) + 4000 (march) + 3000 (april) = 11000
        expect(april25?.projectedBalance).toBe(10000);
        expect(april25?.scenario_s1).toBe(11000);
    });
  });
});

