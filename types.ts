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

// --- Scenario / What-If Types ---

export enum AdjustmentType {
  PERCENTAGE_INCREASE = 'PERCENT_INC',
  PERCENTAGE_DECREASE = 'PERCENT_DEC',
  SET_AMOUNT = 'SET_AMOUNT',
  ADD_AMOUNT = 'ADD_AMOUNT'
}

export interface ScenarioAdjustment {
  id: string;
  projectionId: string; // The ID of the base projection being modified
  type: AdjustmentType;
  value: number; // The % or absolute value
  startDate?: string; // Optional: When this change takes effect
  endDate?: string; // Optional: When this change stops
}

export interface Scenario {
  id: string;
  name: string;
  color: string;
  isActive: boolean; // Visible on chart
  adjustments: ScenarioAdjustment[];
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