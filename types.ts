export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum Frequency {
  ONCE = 'ONCE',
  DAILY = 'DAILY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
  WEEKLY = 'WEEKLY'
}

export interface Category {
  id: string;
  name: string;
  color: string;
  budgetLimit?: number; // Monthly budget limit
}

export interface Transaction {
  id: string;
  date: string; // ISO Date string YYYY-MM-DD
  description: string;
  amount: number;
  categoryId: string;
  type: TransactionType;
  skipAutoCategorization?: boolean; // If AI fails to categorize, don't try again
}

export interface Projection {
  id: string;
  name: string;
  amount: number;
  frequency: Frequency;
  startDate: string;
  endDate?: string; // Optional for recurring
  categoryId: string;
  type: TransactionType;
  isActive: boolean;
}

// --- Debt Strategy Types ---

export enum DebtStrategy {
  SNOWBALL = 'SNOWBALL',
  AVALANCHE = 'AVALANCHE'
}

export interface Debt {
  id: string;
  name: string;
  currentBalance: number;
  interestRate: number; // Annual Percentage Rate (APR)
  minimumPayment: number;
  dueDate?: string; // Day of month (1-31)
  categoryId?: string; // Link to category (e.g., Credit Card)
}

// --- Scenario / What-If Types ---

export enum AdjustmentType {
  PERCENTAGE_INCREASE = 'PERCENT_INC',
  PERCENTAGE_DECREASE = 'PERCENT_DEC',
  SET_AMOUNT = 'SET_AMOUNT',
  ADD_AMOUNT = 'ADD_AMOUNT',
  REMOVE_RECORD = 'REMOVE'
}

export interface ScenarioAdjustment {
  id: string;
  projectionId: string; // The ID of the base projection being modified
  type: AdjustmentType;
  value: number; // The % or absolute value (ignored for REMOVE)
  startDate?: string; // Optional: When this change takes effect
  endDate?: string; // Optional: When this change stops
}

export interface Scenario {
  id: string;
  name: string;
  color: string;
  isActive: boolean; // Visible on chart
  adjustments: ScenarioAdjustment[];
  newProjections?: Projection[]; // Projections that only exist in this scenario
}

export interface DailyBalance {
  date: string;
  historicalBalance: number | null;
  projectedBalance: number | null;
  isProjected: boolean;
  // Dynamic keys for scenarios will be added at runtime (e.g., "scenario_id_1": 1050)
  [key: string]: any; 
}

export interface MonthlyCheckpoint {
  monthKey: string; // YYYY-MM
  startBalance: number;
  endBalance: number;
}

// --- User Settings & Setup Types ---

export enum AppView {
  MAIN = 'MAIN',
  MONTHLY = 'MONTHLY',
  DEBT_STRATEGIST = 'DEBT_STRATEGIST',
  SUBSCRIPTIONS = 'SUBSCRIPTIONS',
  SMART_SAVINGS = 'SMART_SAVINGS',
  NET_WORTH = 'NET_WORTH'
}

export enum AssetType {
  CASH = 'CASH',
  INVESTMENT = 'INVESTMENT',
  PROPERTY = 'PROPERTY',
  VEHICLE = 'VEHICLE',
  OTHER = 'OTHER'
}

export interface Asset {
  id: string;
  name: string;
  value: number;
  type: AssetType;
  liquidity?: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // ISO Date YYYY-MM-DD
  icon?: string;
  color?: string;
}

export interface UserPreferences {
  defaultView: AppView;
  projectionDays: number;
  lastReconciledDate?: string; // ISO Date string
  debtStrategy?: DebtStrategy;
  debtMonthlyExtra?: number;
}

export interface MonthlySetup {
  monthKey: string; // YYYY-MM
  actualBalance: number;
  clearedProjectionIds: string[];
  completedAt: string; // ISO Date
}

export interface MonthlySummary {
  remainingSpendable: number;
  totalProjectedIncome: number;
  totalProjectedExpenses: number;
  spentPercentage: number;
}

export interface UnreconciledOccurrence {
  id: string; // projId_dateStr
  projId: string;
  name: string;
  amount: number;
  dateStr: string;
  type: TransactionType;
}

// --- Quick Action / Chat Types ---

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface QuickActionResponse {
  status: 'CLARIFICATION_NEEDED' | 'COMPLETED';
  message: string; // The question to ask the user OR the summary of action
  actionType?: 'CREATE' | 'UPDATE';
  recordType?: 'TRANSACTION' | 'PROJECTION';
  transactionData?: Partial<Transaction>;
  projectionData?: Partial<Projection>;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  isMinimized: boolean;
  isLoading: boolean;
  hasUnread: boolean; // For visual indicator when minimized
}
// Appending to types.ts won't work well because UserPreferences is already defined.
// I need to rewrite types.ts or use sed.
// I'll rewrite types.ts to be safe.
