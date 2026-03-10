import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, AlertCircle } from 'lucide-react';
import { Transaction, Projection, Category, DailyBalance, TransactionType } from '../types';
import { calculateProjectionValueForDate, formatCurrency } from '../utils/financialUtils';

interface SmartBillCalendarProps {
  transactions: Transaction[];
  projections: Projection[];
  categories: Category[];
  timelineData: DailyBalance[];
  onUpdateTransaction: (tx: Transaction) => void;
  onAddTransaction: (date: string) => void;
  onUpdateProjection: (p: Projection) => void;
  onAddProjection: (date: string) => void;
}

const SmartBillCalendar: React.FC<SmartBillCalendarProps> = ({
  transactions,
  projections,
  categories,
  timelineData,
  onUpdateTransaction,
  onAddTransaction,
  onUpdateProjection,
  onAddProjection
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return new Date(year, month + 1, 0).getDate();
  }, [currentDate]);

  const firstDayOfMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return new Date(year, month, 1).getDay(); // 0 is Sunday
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Pre-calculate data per day for the current month view to optimize rendering
  const calendarData = useMemo(() => {
    const data: Record<string, {
      transactions: Transaction[],
      projections: (Projection & { occurrenceValue: number })[],
      balanceInfo?: DailyBalance
    }> = {};

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= days; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const d = new Date(year, month, day);

      const dayTransactions = transactions.filter(t => t.date === dateStr);

      const dayProjections = projections.filter(p => p.isActive).map(p => {
        const value = calculateProjectionValueForDate(p, d, dateStr);
        return value !== 0 ? { ...p, occurrenceValue: value } : null;
      }).filter(Boolean) as (Projection & { occurrenceValue: number })[];

      const balanceInfo = timelineData.find(b => b.date === dateStr);

      data[dateStr] = {
        transactions: dayTransactions,
        projections: dayProjections,
        balanceInfo
      };
    }

    return data;
  }, [currentDate, transactions, projections, timelineData]);

  const getCategoryColor = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.color || '#94a3b8';
  };

  const handleDragStart = (e: React.DragEvent, id: string, type: 'transaction' | 'projection') => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ id, type }));
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-blue-50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-blue-50');
  };

  const handleDrop = (e: React.DragEvent, targetDateStr: string) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-blue-50');

    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.type === 'transaction') {
        const tx = transactions.find(t => t.id === data.id);
        if (tx && tx.date !== targetDateStr) {
          onUpdateTransaction({ ...tx, date: targetDateStr });
        }
      } else if (data.type === 'projection') {
        const p = projections.find(p => p.id === data.id);
        if (p && p.startDate !== targetDateStr) {
          // Note: for recurring projections, dragging might only make sense if changing the start date
          // or we might need a more complex logic to change just the day of the month.
          // For simplicity, we update the startDate.
          onUpdateProjection({ ...p, startDate: targetDateStr });
        }
      }
    } catch (err) {
      console.error('Drop error', err);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-10rem)]">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <h2 className="text-xl font-bold text-slate-800">Smart Bill Calendar</h2>
        <div className="flex items-center space-x-4">
          <button onClick={handlePrevMonth} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <ChevronLeft size={20} />
          </button>
          <span className="font-semibold text-slate-700 min-w-[140px] text-center">{monthName}</span>
          <button onClick={handleNextMonth} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto flex flex-col">
        {/* Day Names */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100/50 sticky top-0 z-10">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200 last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-slate-200 gap-px">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-slate-50/50 min-h-[100px]" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = new Date().toISOString().split('T')[0] === dateStr;
            const dayData = calendarData[dateStr] || { transactions: [], projections: [] };

            const effectiveBalance = dayData.balanceInfo?.projectedBalance !== null
              ? dayData.balanceInfo?.projectedBalance
              : dayData.balanceInfo?.historicalBalance;

            const isWarning = effectiveBalance !== undefined && effectiveBalance !== null && effectiveBalance < 0;

            return (
              <div
                key={day}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, dateStr)}
                className={`bg-white min-h-[100px] p-2 flex flex-col relative group transition-colors hover:bg-slate-50 overflow-hidden ${isWarning ? 'bg-red-50/30' : ''}`}
              >
                {/* Quick Add Buttons Overlay */}
                <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none flex items-center justify-center">
                   <div className="flex space-x-2 pointer-events-auto opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                      <button
                        onClick={() => onAddTransaction(dateStr)}
                        className="bg-white text-slate-700 shadow-md p-1.5 rounded-full hover:bg-blue-600 hover:text-white transition-colors"
                        title="Add Transaction"
                      >
                         <Plus size={16} />
                      </button>
                      <button
                        onClick={() => onAddProjection(dateStr)}
                        className="bg-white text-slate-700 shadow-md p-1.5 rounded-full hover:bg-emerald-600 hover:text-white transition-colors border border-dashed border-slate-300"
                        title="Add Projection"
                      >
                         <Plus size={16} />
                      </button>
                   </div>
                </div>

                <div className="flex justify-between items-start mb-1 shrink-0 relative z-20">
                  <span className={`text-sm font-semibold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-slate-700'}`}>
                    {day}
                  </span>
                  {isWarning && (
                    <AlertCircle size={14} className="text-red-500" title={`Projected balance: ${formatCurrency(effectiveBalance || 0)}`} />
                  )}
                </div>

                <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {/* Render Historical Transactions */}
                  {dayData.transactions.map(tx => (
                    <div
                      key={tx.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, tx.id, 'transaction')}
                      onDragEnd={handleDragEnd}
                      className="text-[10px] leading-tight px-1.5 py-1 rounded shadow-sm border truncate font-medium flex justify-between cursor-grab active:cursor-grabbing relative z-20"
                      style={{
                        backgroundColor: `${getCategoryColor(tx.categoryId)}15`,
                        borderColor: `${getCategoryColor(tx.categoryId)}30`,
                        color: tx.type === TransactionType.INCOME ? '#059669' : '#dc2626'
                      }}
                      title={`${tx.description} (${formatCurrency(tx.amount)})`}
                    >
                      <span className="truncate mr-1">{tx.description}</span>
                      <span>{formatCurrency(tx.amount)}</span>
                    </div>
                  ))}

                  {/* Render Projections */}
                  {dayData.projections.map(p => (
                    <div
                      key={`${p.id}-${dateStr}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, p.id, 'projection')}
                      onDragEnd={handleDragEnd}
                      className="text-[10px] leading-tight px-1.5 py-1 rounded shadow-sm border border-dashed truncate font-medium flex justify-between opacity-80 hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing relative z-20"
                      style={{
                        backgroundColor: `${getCategoryColor(p.categoryId)}10`,
                        borderColor: getCategoryColor(p.categoryId),
                        color: p.type === TransactionType.INCOME ? '#059669' : '#dc2626'
                      }}
                      title={`${p.name} (${formatCurrency(Math.abs(p.occurrenceValue))})`}
                    >
                      <span className="truncate mr-1">{p.name}</span>
                      <span>{formatCurrency(Math.abs(p.occurrenceValue))}</span>
                    </div>
                  ))}
                </div>

                {effectiveBalance !== undefined && effectiveBalance !== null && (
                   <div className="mt-1 text-[10px] font-semibold text-right text-slate-400 border-t border-slate-100 pt-1 shrink-0">
                      {formatCurrency(effectiveBalance)}
                   </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SmartBillCalendar;
