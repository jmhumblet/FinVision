import React, { useState, useMemo } from 'react';
import { Transaction, Category, TransactionType } from '../types';
import { ChevronUp, ChevronDown, Trash2, Plus, ArrowUpRight, ArrowDownLeft, Receipt } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  categories: Category[];
  onUpdateTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onAddTransaction: () => void;
}

type SortField = 'date' | 'description' | 'amount' | 'category';
type SortDirection = 'asc' | 'desc';

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  categories,
  onUpdateTransaction,
  onDeleteTransaction,
  onAddTransaction
}) => {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterText, setFilterText] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedTransactions = useMemo(() => {
    return transactions
      .filter(t => 
        t.description.toLowerCase().includes(filterText.toLowerCase()) ||
        categories.find(c => c.id === t.categoryId)?.name.toLowerCase().includes(filterText.toLowerCase())
      )
      .sort((a, b) => {
        let valA: any = a[sortField as keyof Transaction];
        let valB: any = b[sortField as keyof Transaction];

        if (sortField === 'category') {
          valA = categories.find(c => c.id === a.categoryId)?.name || '';
          valB = categories.find(c => c.id === b.categoryId)?.name || '';
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [transactions, categories, filterText, sortField, sortDirection]);

  const TableHeader = ({ field, label }: { field: SortField, label: string }) => (
    <th 
      className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        {sortField === field && (
          sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
        )}
      </div>
    </th>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col transition-all duration-300">
      <div 
        className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl cursor-pointer hover:bg-slate-100 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm">
                <Receipt size={18} className="text-slate-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">Historical Transactions</h2>
            <span className="text-xs text-slate-400 font-medium px-2 py-0.5 bg-slate-200 rounded-full">
                {transactions.length}
            </span>
        </div>
        <div className="flex items-center space-x-3" onClick={e => e.stopPropagation()}>
           {isOpen && (
             <>
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="px-3 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 hidden sm:block"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                />
                <button 
                  onClick={onAddTransaction}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">Add Row</span>
                </button>
             </>
           )}
           <button className="text-slate-400 hover:text-slate-600">
             {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
           </button>
        </div>
      </div>

      {isOpen && (
        <div className="overflow-auto max-h-[600px] custom-scrollbar">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <TableHeader field="date" label="Date" />
                <TableHeader field="description" label="Description" />
                <TableHeader field="category" label="Category" />
                <TableHeader field="amount" label="Amount" />
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredAndSortedTransactions.map((t, idx) => (
                <tr key={`${t.id}-${idx}`} className="hover:bg-slate-50 group">
                  <td className="px-4 py-2 whitespace-nowrap">
                    <input 
                      type="date" 
                      value={t.date}
                      onChange={(e) => onUpdateTransaction({...t, date: e.target.value})}
                      className="w-full bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded px-1 text-sm text-slate-600"
                    />
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <input 
                      type="text" 
                      value={t.description}
                      onChange={(e) => onUpdateTransaction({...t, description: e.target.value})}
                      className="w-full bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded px-1 text-sm text-slate-800 font-medium"
                    />
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <select
                      value={t.categoryId}
                      onChange={(e) => onUpdateTransaction({...t, categoryId: e.target.value})}
                      className="w-full bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded px-1 text-sm text-slate-600 cursor-pointer"
                      style={{
                          color: categories.find(c => c.id === t.categoryId)?.color
                      }}
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id} style={{ color: c.color }}>{c.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <input 
                      type="number" 
                      value={t.amount}
                      onChange={(e) => onUpdateTransaction({...t, amount: parseFloat(e.target.value) || 0})}
                      className={`w-full bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded px-1 text-sm font-semibold ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-800'}`}
                    />
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <button 
                        onClick={() => onUpdateTransaction({...t, type: t.type === TransactionType.INCOME ? TransactionType.EXPENSE : TransactionType.INCOME})}
                        className={`p-1 rounded ${t.type === TransactionType.INCOME ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
                    >
                      {t.type === TransactionType.INCOME ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                    </button>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-right">
                    <button 
                      onClick={() => onDeleteTransaction(t.id)}
                      className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;