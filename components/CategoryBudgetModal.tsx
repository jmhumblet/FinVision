import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import { X, Save } from 'lucide-react';
import { formatCurrency } from '../utils/financialUtils';

interface CategoryBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onUpdateCategories: (categories: Category[]) => void;
}

const CategoryBudgetModal: React.FC<CategoryBudgetModalProps> = ({ isOpen, onClose, categories, onUpdateCategories }) => {
  const [localLimits, setLocalLimits] = useState<{ [id: string]: string }>({});

  useEffect(() => {
    if (isOpen) {
      const initial: { [id: string]: string } = {};
      categories.forEach(c => {
        initial[c.id] = c.budgetLimit !== undefined ? c.budgetLimit.toString() : '';
      });
      setLocalLimits(initial);
    }
  }, [isOpen, categories]);

  const handleSave = () => {
    const newCategories = categories.map(c => {
      const valStr = localLimits[c.id];
      let val: number | undefined = undefined;
      if (valStr && valStr.trim() !== '') {
        const parsed = parseFloat(valStr);
        if (!isNaN(parsed)) {
          val = parsed;
        }
      }
      return { ...c, budgetLimit: val };
    });

    onUpdateCategories(newCategories);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Category Budgets</h2>
              <p className="text-sm text-slate-500 mt-1">Set monthly spending limits for each category.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                <X size={20} />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-4 p-4 border border-slate-100 rounded-2xl hover:border-slate-200 transition-colors bg-white shadow-sm">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md"
                        style={{ backgroundColor: category.color }}
                    >
                        {category.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-slate-800">{category.name}</p>
                        <p className="text-xs text-slate-400 font-medium">Monthly Limit</p>
                    </div>
                    <div className="w-32">
                        <div className="relative group">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium group-focus-within:text-blue-500 transition-colors">€</span>
                            <input
                                type="number"
                                step="any"
                                value={localLimits[category.id] !== undefined ? localLimits[category.id] : ''}
                                onChange={(e) => setLocalLimits(prev => ({ ...prev, [category.id]: e.target.value }))}
                                placeholder="0"
                                className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-right"
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl flex justify-end">
            <button
                onClick={handleSave}
                className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-200 transition-all active:scale-95"
            >
                Done
            </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryBudgetModal;
