import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { SavingsGoal } from '../types';
import { formatCurrency } from '../utils/financialUtils';
import {
  PiggyBank,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Target,
  Calendar,
  DollarSign,
  TrendingUp
} from 'lucide-react';

interface SmartSavingsDashboardProps {
  goals: SavingsGoal[];
  onAddGoal: (goal: SavingsGoal) => void;
  onUpdateGoal: (goal: SavingsGoal) => void;
  onDeleteGoal: (id: string) => void;
}

const SmartSavingsDashboard: React.FC<SmartSavingsDashboardProps> = ({
  goals,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<SavingsGoal>>({
    name: '',
    targetAmount: 0,
    currentAmount: 0,
    targetDate: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      targetAmount: 0,
      currentAmount: 0,
      targetDate: ''
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEditClick = (goal: SavingsGoal) => {
    setFormData({ ...goal });
    setEditingId(goal.id);
    setIsAdding(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.targetAmount || !formData.targetDate) return;

    const goal: SavingsGoal = {
      id: editingId || uuidv4(),
      name: formData.name,
      targetAmount: Number(formData.targetAmount),
      currentAmount: Number(formData.currentAmount || 0),
      targetDate: formData.targetDate,
      color: formData.color || '#3b82f6', // Default blue
      icon: formData.icon || 'piggy'
    };

    if (editingId) {
      onUpdateGoal(goal);
    } else {
      onAddGoal(goal);
    }
    resetForm();
  };

  const calculateMonthlyContribution = (goal: SavingsGoal) => {
    if (goal.currentAmount >= goal.targetAmount) return 0;

    const today = new Date();
    const target = new Date(goal.targetDate);

    // Simple month difference
    const months = (target.getFullYear() - today.getFullYear()) * 12 + (target.getMonth() - today.getMonth());

    // If less than a month, treat as 1 month (or immediate)
    const remainingMonths = Math.max(1, months);

    const remainingAmount = goal.targetAmount - goal.currentAmount;
    return remainingAmount / remainingMonths;
  };

  const getProgressPercentage = (goal: SavingsGoal) => {
    if (goal.targetAmount === 0) return 0;
    return Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 flex items-center">
             <PiggyBank className="mr-3 text-pink-500" size={32} />
             Smart Savings Goals
           </h2>
           <p className="text-slate-500 text-sm mt-1">
             Track your progress and calculate monthly contributions to reach your dreams.
           </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm font-medium"
          >
            <Plus size={20} />
            <span>New Goal</span>
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">
              {editingId ? 'Edit Goal' : 'Create New Savings Goal'}
            </h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Goal Name</label>
                <div className="relative">
                  <Target className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-slate-800"
                    placeholder="e.g. New Car, House Deposit"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Target Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    type="date"
                    required
                    value={formData.targetDate}
                    onChange={e => setFormData({ ...formData, targetDate: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Target Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    value={formData.targetAmount || ''}
                    onChange={e => setFormData({ ...formData, targetAmount: parseFloat(e.target.value) })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-slate-800"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Current Saved Amount</label>
                <div className="relative">
                  <PiggyBank className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.currentAmount || ''}
                    onChange={e => setFormData({ ...formData, currentAmount: parseFloat(e.target.value) })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-slate-800"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2.5 rounded-xl font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md shadow-blue-200 transition-all transform active:scale-95"
              >
                <Check size={20} />
                <span>{editingId ? 'Update Goal' : 'Create Goal'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {goals.length === 0 && !isAdding ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
           <PiggyBank className="mx-auto text-slate-200 mb-4" size={64} />
           <h3 className="text-lg font-bold text-slate-400">No Savings Goals Yet</h3>
           <p className="text-slate-400 text-sm mt-1">Create your first goal to start tracking!</p>
           <button
             onClick={() => setIsAdding(true)}
             className="mt-6 text-blue-600 font-semibold hover:underline"
           >
             Create a Goal
           </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => {
            const monthlyNeeded = calculateMonthlyContribution(goal);
            const progress = getProgressPercentage(goal);
            const isCompleted = goal.currentAmount >= goal.targetAmount;

            return (
              <div key={goal.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden group">
                 {isCompleted && (
                    <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10">
                        COMPLETED
                    </div>
                 )}

                 <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <Target size={24} />
                    </div>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                           onClick={() => handleEditClick(goal)}
                           className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                            <Edit2 size={16} />
                        </button>
                        <button
                           onClick={() => onDeleteGoal(goal.id)}
                           className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                 </div>

                 <h3 className="text-lg font-bold text-slate-800 mb-1">{goal.name}</h3>
                 <p className="text-xs text-slate-400 font-medium flex items-center mb-4">
                    <Calendar size={12} className="mr-1" />
                    Target: {new Date(goal.targetDate).toLocaleDateString()}
                 </p>

                 <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Progress</span>
                        <span className="text-slate-900 font-bold">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                           className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : 'bg-blue-600'}`}
                           style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>{formatCurrency(goal.currentAmount)}</span>
                        <span>{formatCurrency(goal.targetAmount)}</span>
                    </div>
                 </div>

                 <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Monthly Saving Needed</p>
                        <p className={`text-lg font-extrabold ${monthlyNeeded > 0 ? 'text-slate-800' : 'text-emerald-600'}`}>
                            {monthlyNeeded > 0 ? formatCurrency(monthlyNeeded) : 'Goal Reached!'}
                        </p>
                    </div>
                    {monthlyNeeded > 0 && (
                        <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                            <TrendingUp size={20} />
                        </div>
                    )}
                 </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SmartSavingsDashboard;
