import React, { useState } from 'react';
import { SavingsGoal } from '../types';
import { formatCurrency } from '../utils/financialUtils';
import { Plus, Target, Calendar, TrendingUp, Trash2, Edit2, X, PiggyBank, Save } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface SavingsGoalsWidgetProps {
  goals: SavingsGoal[];
  onAddGoal: (goal: SavingsGoal) => void;
  onUpdateGoal: (goal: SavingsGoal) => void;
  onDeleteGoal: (id: string) => void;
}

const SavingsGoalsWidget: React.FC<SavingsGoalsWidgetProps> = ({ goals, onAddGoal, onUpdateGoal, onDeleteGoal }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [color, setColor] = useState('#3b82f6'); // Default blue

  const resetForm = () => {
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setTargetDate('');
    setColor('#3b82f6');
    setEditingGoal(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setName(goal.name);
    setTargetAmount(goal.targetAmount.toString());
    setCurrentAmount(goal.currentAmount.toString());
    setTargetDate(goal.targetDate);
    setColor(goal.color);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newGoal: SavingsGoal = {
      id: editingGoal ? editingGoal.id : uuidv4(),
      name,
      targetAmount: parseFloat(targetAmount) || 0,
      currentAmount: parseFloat(currentAmount) || 0,
      targetDate,
      color
    };

    if (editingGoal) {
      onUpdateGoal(newGoal);
    } else {
      onAddGoal(newGoal);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const calculateMonthlyContribution = (goal: SavingsGoal) => {
    const today = new Date();
    const target = new Date(goal.targetDate);

    // Calculate months difference
    let months = (target.getFullYear() - today.getFullYear()) * 12 + (target.getMonth() - today.getMonth());

    // If target is in future but less than a month away, count as 1 month if not passed
    if (months <= 0) {
        // Check days
        if (target > today) months = 1;
        else return 0; // Already passed
    }

    const remaining = goal.targetAmount - goal.currentAmount;
    if (remaining <= 0) return 0;

    return remaining / months;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <PiggyBank className="mr-2 text-indigo-600" size={24} />
            Smart Savings Goals
        </h2>
        <button
          onClick={openAddModal}
          className="flex items-center space-x-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-all active:scale-95 shadow-sm"
        >
          <Plus size={16} />
          <span>New Goal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map(goal => {
            const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
            const monthlyNeed = calculateMonthlyContribution(goal);
            const isCompleted = goal.currentAmount >= goal.targetAmount;

            return (
                <div key={goal.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col relative group hover:shadow-md transition-all">
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                        <button onClick={() => openEditModal(goal)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                            <Edit2 size={14} />
                        </button>
                        <button onClick={() => onDeleteGoal(goal.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                            <Trash2 size={14} />
                        </button>
                    </div>

                    <div className="flex items-start mb-4">
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm mr-3"
                            style={{ backgroundColor: goal.color }}
                        >
                            {goal.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 leading-tight">{goal.name}</h3>
                            <div className="text-xs text-slate-500 mt-1 flex items-center">
                                <Target size={12} className="mr-1" />
                                Target: {formatCurrency(goal.targetAmount)}
                            </div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="flex justify-between text-xs font-semibold mb-1">
                            <span className={isCompleted ? 'text-emerald-600' : 'text-slate-600'}>
                                {formatCurrency(goal.currentAmount)}
                            </span>
                            <span className="text-slate-400">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : ''}`}
                                style={{ width: `${progress}%`, backgroundColor: isCompleted ? undefined : goal.color }}
                            ></div>
                        </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                         <div>
                            <span className="block text-slate-400 mb-0.5">Target Date</span>
                            <span className="font-semibold text-slate-700 flex items-center">
                                <Calendar size={12} className="mr-1 text-slate-400" />
                                {new Date(goal.targetDate).toLocaleDateString()}
                            </span>
                         </div>
                         <div>
                            <span className="block text-slate-400 mb-0.5">Monthly Need</span>
                            <span className="font-semibold text-slate-700 flex items-center">
                                <TrendingUp size={12} className="mr-1 text-slate-400" />
                                {isCompleted ? 'Done!' : formatCurrency(monthlyNeed)}
                            </span>
                         </div>
                    </div>
                </div>
            );
        })}

        {goals.length === 0 && (
            <div className="col-span-full py-10 text-center border-2 border-dashed border-slate-200 rounded-xl">
                <PiggyBank className="mx-auto text-slate-300 mb-3" size={48} />
                <p className="text-slate-500 font-medium">No savings goals yet.</p>
                <button onClick={openAddModal} className="text-indigo-600 text-sm font-semibold hover:underline mt-1">Create your first goal</button>
            </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-lg text-slate-800">
                        {editingGoal ? 'Edit Goal' : 'New Savings Goal'}
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="goalName" className="block text-sm font-medium text-slate-700 mb-1">Goal Name</label>
                        <input
                            id="goalName"
                            type="text"
                            required
                            placeholder="e.g., Vacation Fund"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="targetAmount" className="block text-sm font-medium text-slate-700 mb-1">Target Amount</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-slate-400 font-semibold">$</span>
                                <input
                                    id="targetAmount"
                                    type="number"
                                    required
                                    min="1"
                                    step="0.01"
                                    className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    value={targetAmount}
                                    onChange={e => setTargetAmount(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="currentSaved" className="block text-sm font-medium text-slate-700 mb-1">Current Saved</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-slate-400 font-semibold">$</span>
                                <input
                                    id="currentSaved"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    value={currentAmount}
                                    onChange={e => setCurrentAmount(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="targetDate" className="block text-sm font-medium text-slate-700 mb-1">Target Date</label>
                        <input
                            id="targetDate"
                            type="date"
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            value={targetDate}
                            onChange={e => setTargetDate(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Color Code</label>
                        <div className="flex space-x-2">
                            {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'].map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-slate-600 scale-110' : 'border-transparent hover:scale-105'}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex space-x-3">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all active:scale-95 flex justify-center items-center"
                        >
                            <Save size={18} className="mr-2" />
                            {editingGoal ? 'Save Changes' : 'Create Goal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default SavingsGoalsWidget;
