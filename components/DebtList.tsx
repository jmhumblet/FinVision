import React, { useState } from 'react';
import { Debt } from '../types';
import { Trash2, Plus, CreditCard, Percent, Calendar } from 'lucide-react';
import { formatCurrency } from '../utils/financialUtils';

interface DebtListProps {
  debts: Debt[];
  onAddDebt: () => void;
  onUpdateDebt: (debt: Debt) => void;
  onDeleteDebt: (id: string) => void;
}

const DebtList: React.FC<DebtListProps> = ({ debts, onAddDebt, onUpdateDebt, onDeleteDebt }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div
        className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-2">
           <div className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm">
             <CreditCard size={18} className="text-red-500" />
           </div>
           <div>
             <h2 className="text-lg font-semibold text-slate-800">Your Debts</h2>
             <p className="text-xs text-slate-500">
               Total: <span className="font-bold text-slate-700">{formatCurrency(debts.reduce((sum, d) => sum + d.currentBalance, 0))}</span>
             </p>
           </div>
        </div>
        <button
           onClick={(e) => { e.stopPropagation(); onAddDebt(); }}
           className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
        >
           <Plus size={16} />
           <span className="hidden sm:inline">Add Debt</span>
        </button>
      </div>

      {isOpen && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Balance</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">APR (%)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Min Payment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Due Date</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {debts.map(debt => (
                <tr key={debt.id} className="hover:bg-slate-50 group">
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={debt.name}
                      onChange={(e) => onUpdateDebt({ ...debt, name: e.target.value })}
                      className="w-full bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded px-1 text-sm font-medium text-slate-800"
                      placeholder="Debt Name"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <div className="relative">
                        <span className="absolute left-1 top-1.5 text-slate-400 text-xs">€</span>
                        <input
                        type="number"
                        value={debt.currentBalance}
                        onChange={(e) => onUpdateDebt({ ...debt, currentBalance: parseFloat(e.target.value) || 0 })}
                        className="w-full pl-4 bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded px-1 text-sm text-slate-800"
                        />
                    </div>
                  </td>
                  <td className="px-4 py-2">
                     <div className="flex items-center space-x-1">
                        <input
                        type="number"
                        value={debt.interestRate}
                        onChange={(e) => onUpdateDebt({ ...debt, interestRate: parseFloat(e.target.value) || 0 })}
                        className="w-16 bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded px-1 text-sm text-slate-600"
                        />
                        <Percent size={12} className="text-slate-400" />
                     </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="relative">
                        <span className="absolute left-1 top-1.5 text-slate-400 text-xs">€</span>
                        <input
                        type="number"
                        value={debt.minimumPayment}
                        onChange={(e) => onUpdateDebt({ ...debt, minimumPayment: parseFloat(e.target.value) || 0 })}
                        className="w-full pl-4 bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded px-1 text-sm text-slate-600"
                        />
                    </div>
                  </td>
                  <td className="px-4 py-2">
                     <div className="flex items-center space-x-1">
                        <Calendar size={14} className="text-slate-400" />
                        <input
                            type="text"
                            value={debt.dueDate || ''}
                            onChange={(e) => onUpdateDebt({ ...debt, dueDate: e.target.value })}
                            className="w-16 bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded px-1 text-sm text-slate-600"
                            placeholder="Day"
                        />
                     </div>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => onDeleteDebt(debt.id)}
                      className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {debts.length === 0 && (
                <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-sm">
                        No debts added. Click "Add Debt" to start planning your payoff.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DebtList;
