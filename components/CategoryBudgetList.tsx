import React, { useMemo } from 'react';
import { Category, Transaction, TransactionType } from '../types';
import { formatCurrency } from '../utils/financialUtils';
import { AlertCircle, Target, TrendingUp } from 'lucide-react';

interface CategoryBudgetListProps {
  categories: Category[];
  transactions: Transaction[];
  onOpenSettings: () => void;
}

const CategoryBudgetList: React.FC<CategoryBudgetListProps> = ({ categories, transactions, onOpenSettings }) => {

  const budgetData = useMemo(() => {
    // Filter out categories without budget
    const budgetedCategories = categories.filter(c => c.budgetLimit !== undefined && c.budgetLimit > 0);

    const data = budgetedCategories.map(cat => {
        const spent = transactions
            .filter(t => t.categoryId === cat.id && t.type === TransactionType.EXPENSE)
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            ...cat,
            spent,
            percentage: Math.min((spent / (cat.budgetLimit || 1)) * 100, 100),
            isOver: spent > (cat.budgetLimit || 0)
        };
    }).sort((a, b) => b.percentage - a.percentage); // Sort by highest usage

    return data;
  }, [categories, transactions]);

  if (budgetData.length === 0) {
    return (
        <div className="bg-white rounded-3xl p-8 border border-slate-100 text-center flex flex-col items-center justify-center space-y-4 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-2 shadow-inner">
                <Target size={32} />
            </div>
            <div>
                <h3 className="font-bold text-slate-900 text-lg">Set Your Budgets</h3>
                <p className="text-sm text-slate-500 max-w-xs mx-auto mt-1">
                    Track spending limits per category to stay on top of your financial goals.
                </p>
            </div>
            <button
                onClick={onOpenSettings}
                className="mt-2 px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-100"
            >
                Setup Budgets
            </button>
        </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                    <Target size={20} />
                </div>
                <h3 className="font-bold text-slate-900 text-lg tracking-tight">Category Budgets</h3>
            </div>
            <button
                onClick={onOpenSettings}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
            >
                Edit Limits
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgetData.map(item => (
                <div key={item.id} className="group relative bg-slate-50/50 rounded-2xl p-4 border border-slate-100 hover:bg-white hover:shadow-md transition-all duration-300">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3">
                            <div
                                className="w-10 h-10 rounded-xl shadow-sm flex items-center justify-center text-white font-bold text-lg"
                                style={{ backgroundColor: item.color }}
                            >
                                {item.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm leading-tight">{item.name}</h4>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${item.isOver ? 'text-red-500' : 'text-slate-400'}`}>
                                    {item.isOver ? 'Over Budget' : 'On Track'}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                             <span className={`block font-extrabold ${item.isOver ? 'text-red-600' : 'text-slate-900'}`}>
                                {formatCurrency(item.spent)}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400 block">
                                of {formatCurrency(item.budgetLimit || 0)}
                            </span>
                        </div>
                    </div>

                    <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                        <div
                            className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${
                                item.isOver ? 'bg-red-500' :
                                item.percentage > 90 ? 'bg-amber-400' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${item.percentage}%` }}
                        ></div>
                    </div>

                    {item.isOver && (
                        <div className="flex items-center text-red-500 text-[10px] font-bold mt-1 bg-red-50 px-2 py-1 rounded-lg w-fit">
                            <AlertCircle size={10} className="mr-1.5" />
                            Exceeded by {formatCurrency(item.spent - (item.budgetLimit || 0))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
  );
};

export default CategoryBudgetList;
