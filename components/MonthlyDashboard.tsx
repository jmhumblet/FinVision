import React from 'react';
import { MonthlySummary, Transaction, Projection, Category } from '../types';
import { formatCurrency } from '../utils/financialUtils';
import { ArrowUpCircle, ArrowDownCircle, Info, Settings, LayoutDashboard } from 'lucide-react';
import TransactionTable from './TransactionTable';
import ProjectionTable from './ProjectionTable';
import MonthNavigator from './MonthNavigator';

interface MonthlyDashboardProps {
  summary: MonthlySummary;
  selectedDate: Date;
  onNavigate: (date: Date) => void;
  onSwitchView: () => void;
  onOpenSettings: () => void;
  // Table Props
  transactions: Transaction[];
  projections: Projection[];
  categories: Category[];
  onUpdateTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onAddTransaction: () => void;
  onUpdateProjection: (p: Projection) => void;
  onDeleteProjection: (id: string) => void;
  onAddProjection: () => void;
}

const MonthlyDashboard: React.FC<MonthlyDashboardProps> = ({ 
  summary, 
  selectedDate,
  onNavigate,
  onSwitchView,
  onOpenSettings,
  transactions,
  projections,
  categories,
  onUpdateTransaction,
  onDeleteTransaction,
  onAddTransaction,
  onUpdateProjection,
  onDeleteProjection,
  onAddProjection
}) => {
  return (
    <div data-testid="monthly-dashboard" className="flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Navigator */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <MonthNavigator currentDate={selectedDate} onNavigate={onNavigate} />
        
        <div className="flex space-x-2 w-full md:w-auto">
           <button 
             onClick={onSwitchView}
             className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600 hover:bg-slate-50 transition-colors"
             title="Switch to Charts"
           >
             <LayoutDashboard size={20} />
             <span className="text-sm font-medium">Main Dashboard</span>
           </button>
           <button 
             onClick={onOpenSettings}
             className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600 hover:bg-slate-50 transition-colors"
             title="Monthly Setup"
           >
             <Settings size={20} />
           </button>
        </div>
      </div>

      {/* Hero Counter */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500"></div>
        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 italic">Forecasted End of Month</span>
        <div className={`text-6xl sm:text-7xl font-black transition-colors ${summary.remainingSpendable >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
          {formatCurrency(summary.remainingSpendable)}
        </div>
        <div className="mt-4 flex items-center space-x-2 text-slate-400">
            <span className="text-sm">Your projected "Remaining Budget" for this month</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center space-x-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                <ArrowUpCircle size={28} />
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500">Total Income</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(summary.totalProjectedIncome)}</p>
            </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center space-x-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                <ArrowDownCircle size={28} />
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500">Total Expenses</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(summary.totalProjectedExpenses)}</p>
            </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
        <div className="flex justify-between items-center">
            <h3 className="font-semibold text-slate-800">Monthly Budget Progress</h3>
            <span className="text-sm font-bold text-slate-500">{Math.round(summary.spentPercentage)}%</span>
        </div>
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
            <div 
              role="progressbar"
              className={`h-full transition-all duration-1000 ${summary.spentPercentage > 100 ? 'bg-red-500' : 'bg-blue-600'}`}
              style={{ width: `${Math.min(summary.spentPercentage, 100)}%` }}
            ></div>
        </div>
        <p className="text-xs text-slate-400">
            {summary.spentPercentage > 100 
                ? 'You have exceeded your projected expenses for this month.' 
                : `You have cleared ${Math.round(summary.spentPercentage)}% of your expected monthly expenses.`}
        </p>
      </div>

      {/* Monthly Tables */}
      <div className="flex flex-col space-y-8 pt-4 border-t border-slate-100">
        <TransactionTable 
          transactions={transactions} 
          categories={categories}
          onUpdateTransaction={onUpdateTransaction}
          onDeleteTransaction={onDeleteTransaction}
          onAddTransaction={onAddTransaction}
        />
        <ProjectionTable
          projections={projections}
          categories={categories}
          onUpdateProjection={onUpdateProjection}
          onDeleteProjection={onDeleteProjection}
          onAddProjection={onAddProjection}
        />
      </div>
    </div>
  );
};

export default MonthlyDashboard;
