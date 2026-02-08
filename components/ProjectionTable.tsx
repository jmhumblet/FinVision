import React, { useState } from 'react';
import { Projection, Category, TransactionType, Frequency } from '../types';
import { Trash2, Plus, ArrowUpRight, ArrowDownLeft, Calendar, ChevronUp, ChevronDown } from 'lucide-react';

interface ProjectionTableProps {
  projections: Projection[];
  categories: Category[];
  onUpdateProjection: (projection: Projection) => void;
  onDeleteProjection: (id: string) => void;
  onAddProjection: () => void;
}

const ProjectionTable: React.FC<ProjectionTableProps> = ({
  projections,
  categories,
  onUpdateProjection,
  onDeleteProjection,
  onAddProjection
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col transition-all duration-300">
      <div 
        className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl cursor-pointer hover:bg-slate-100 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm">
                <Calendar size={18} className="text-indigo-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">Future Projections</h2>
            <span className="text-xs text-slate-400 font-medium px-2 py-0.5 bg-slate-200 rounded-full">
                {projections.length}
            </span>
        </div>
        <div className="flex items-center space-x-3" onClick={e => e.stopPropagation()}>
           {isOpen && (
             <button 
                onClick={onAddProjection}
                className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition-colors"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Add Projection</span>
              </button>
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
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Active</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Frequency</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Start Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">End Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {projections.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 group">
                  <td className="px-4 py-2 whitespace-nowrap text-center">
                    <input 
                      type="checkbox"
                      checked={p.isActive}
                      onChange={(e) => onUpdateProjection({...p, isActive: e.target.checked})}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <input 
                      type="text" 
                      value={p.name}
                      onChange={(e) => onUpdateProjection({...p, name: e.target.value})}
                      className="w-full bg-transparent border-none focus:ring-1 focus:ring-indigo-500 rounded px-1 text-sm text-slate-800 font-medium"
                      placeholder="E.g., Rent, Salary, Trip"
                    />
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <select
                      value={p.categoryId}
                      onChange={(e) => onUpdateProjection({...p, categoryId: e.target.value})}
                      className="w-full bg-transparent border-none focus:ring-1 focus:ring-indigo-500 rounded px-1 text-sm text-slate-600 cursor-pointer"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <select
                      value={p.frequency}
                      onChange={(e) => onUpdateProjection({...p, frequency: e.target.value as Frequency})}
                      className="w-full bg-transparent border-none focus:ring-1 focus:ring-indigo-500 rounded px-1 text-sm text-slate-600 cursor-pointer"
                    >
                      {Object.values(Frequency).map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <input 
                      type="date" 
                      value={p.startDate}
                      onChange={(e) => onUpdateProjection({...p, startDate: e.target.value})}
                      className="w-full bg-transparent border-none focus:ring-1 focus:ring-indigo-500 rounded px-1 text-sm text-slate-600"
                    />
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <input 
                      type="date" 
                      value={p.endDate || ''}
                      onChange={(e) => onUpdateProjection({...p, endDate: e.target.value})}
                      className="w-full bg-transparent border-none focus:ring-1 focus:ring-indigo-500 rounded px-1 text-sm text-slate-600 placeholder-slate-300"
                    />
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <input 
                      type="number" 
                      value={p.amount}
                      onChange={(e) => onUpdateProjection({...p, amount: parseFloat(e.target.value) || 0})}
                      className={`w-full bg-transparent border-none focus:ring-1 focus:ring-indigo-500 rounded px-1 text-sm font-semibold ${p.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-800'}`}
                    />
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <button 
                        onClick={() => onUpdateProjection({...p, type: p.type === TransactionType.INCOME ? TransactionType.EXPENSE : TransactionType.INCOME})}
                        className={`p-1 rounded ${p.type === TransactionType.INCOME ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
                    >
                      {p.type === TransactionType.INCOME ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                    </button>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-right">
                    <button 
                      onClick={() => onDeleteProjection(p.id)}
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

export default ProjectionTable;