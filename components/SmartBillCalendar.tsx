import React, { useMemo, useState } from 'react';
import {
  Transaction,
  Projection,
  TransactionType,
  DailyBalance,
  Frequency
} from '../types';
import { calculateProjectionValueForDate } from '../utils/financialUtils';
import { ChevronLeft, ChevronRight, Plus, AlertCircle } from 'lucide-react';

interface SmartBillCalendarProps {
  transactions: Transaction[];
  projections: Projection[];
  timelineData: DailyBalance[];
  onUpdateTransaction: (t: Transaction) => void;
  onUpdateProjection: (p: Projection) => void;
  onAddTransaction: (dateStr: string) => void;
  onAddProjection: (dateStr: string) => void;
}

const SmartBillCalendar: React.FC<SmartBillCalendarProps> = ({
  transactions,
  projections,
  timelineData,
  onUpdateTransaction,
  onUpdateProjection,
  onAddTransaction,
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
    return new Date(year, month, 1).getDay();
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const parseLocalYYYYMMDD = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingArray = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const getEventsForDay = (dateStr: string) => {
    const dayDate = parseLocalYYYYMMDD(dateStr);

    const dayTransactions = transactions.filter(t => t.date === dateStr);

    const dayProjections = projections.filter(p => {
        if (!p.isActive) return false;
        const val = calculateProjectionValueForDate(p, dayDate, dateStr);
        return val !== 0;
    });

    return { dayTransactions, dayProjections };
  };

  const getBalanceWarning = (dateStr: string) => {
      const dataPoint = timelineData.find(d => d.date === dateStr);
      if (dataPoint) {
          const balance = dataPoint.projectedBalance !== null ? dataPoint.projectedBalance : dataPoint.historicalBalance;
          if (balance !== null && balance < 0) {
              return true;
          }
      }
      return false;
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string, type: 'transaction' | 'projection') => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ id, type }));
  };

  const handleDrop = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    const dataStr = e.dataTransfer.getData('text/plain');
    if (!dataStr) return;

    try {
        const { id, type } = JSON.parse(dataStr);

        if (type === 'transaction') {
            const tx = transactions.find(t => t.id === id);
            if (tx && tx.date !== dateStr) {
                onUpdateTransaction({ ...tx, date: dateStr });
            }
        } else if (type === 'projection') {
            const proj = projections.find(p => p.id === id);
            // Flexible bills logic:
            // For ONCE frequency, just update startDate.
            // For recurring, maybe we don't allow drag and drop easily without splitting,
            // but for simplicity, let's just update startDate if it's ONCE.
            if (proj && proj.startDate !== dateStr && proj.frequency === Frequency.ONCE) {
                onUpdateProjection({ ...proj, startDate: dateStr });
            }
        }
    } catch (err) {
        console.error("Failed to parse drag data", err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800">Smart Bill Calendar</h2>
        <div className="flex items-center space-x-4 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
           <button onClick={handlePrevMonth} className="p-1.5 hover:bg-white rounded-lg text-slate-600 transition-colors shadow-sm">
             <ChevronLeft size={20} />
           </button>
           <span className="font-bold text-slate-700 min-w-[120px] text-center">
             {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
           </span>
           <button onClick={handleNextMonth} className="p-1.5 hover:bg-white rounded-lg text-slate-600 transition-colors shadow-sm">
             <ChevronRight size={20} />
           </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-xl overflow-hidden flex-1">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-slate-50 py-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
            {day}
          </div>
        ))}

        {/* Padding cells */}
        {paddingArray.map(i => (
          <div key={`pad-${i}`} className="bg-white min-h-[100px]" />
        ))}

        {/* Day cells */}
        {daysArray.map(day => {
          const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const date = String(d.getDate()).padStart(2, '0');
          const dateStr = `${y}-${m}-${date}`;

          const { dayTransactions, dayProjections } = getEventsForDay(dateStr);
          const hasWarning = getBalanceWarning(dateStr);
          const isToday = new Date().toISOString().split('T')[0] === dateStr;

          return (
            <div
                key={day}
                className={`bg-white min-h-[120px] p-2 relative group transition-colors hover:bg-slate-50 ${isToday ? 'ring-2 ring-inset ring-blue-500' : ''}`}
                onDrop={(e) => handleDrop(e, dateStr)}
                onDragOver={handleDragOver}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-sm font-semibold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-500 text-white' : 'text-slate-700'}`}>
                  {day}
                </span>
                {hasWarning && (
                   <div title="Projected balance drops below $0">
                      <AlertCircle size={16} className="text-red-500" />
                   </div>
                )}
              </div>

              {/* Quick Add Overlay */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                 <button
                    onClick={() => onAddTransaction(dateStr)}
                    className="p-1 bg-slate-200 hover:bg-slate-300 rounded text-slate-600"
                    title="Add Transaction"
                 >
                    <Plus size={12} />
                 </button>
                 <button
                    onClick={() => onAddProjection(dateStr)}
                    className="p-1 bg-blue-100 hover:bg-blue-200 rounded text-blue-600"
                    title="Add Bill/Income"
                 >
                    <Plus size={12} />
                 </button>
              </div>

              <div className="space-y-1 mt-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                {dayProjections.map(p => (
                   <div
                      key={`p-${p.id}`}
                      draggable={p.frequency === Frequency.ONCE}
                      onDragStart={(e) => handleDragStart(e, p.id, 'projection')}
                      className={`text-xs px-1.5 py-1 rounded truncate flex justify-between cursor-grab active:cursor-grabbing
                        ${p.type === TransactionType.INCOME ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}
                      `}
                      title={p.name}
                   >
                     <span className="truncate mr-1">{p.name}</span>
                     <span className="font-semibold">{formatCurrency(p.amount)}</span>
                   </div>
                ))}
                {dayTransactions.map(t => (
                   <div
                      key={`t-${t.id}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, t.id, 'transaction')}
                      className={`text-xs px-1.5 py-1 rounded truncate flex justify-between cursor-grab active:cursor-grabbing
                        ${t.type === TransactionType.INCOME ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}
                      `}
                      title={t.description}
                   >
                     <span className="truncate mr-1">{t.description}</span>
                     <span className="font-semibold">{formatCurrency(t.amount)}</span>
                   </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Pad remaining cells to complete the grid */}
        {Array.from({ length: (42 - (paddingArray.length + daysArray.length)) % 7 }).map((_, i) => (
           <div key={`endpad-${i}`} className="bg-white min-h-[100px]" />
        ))}
      </div>
    </div>
  );
};

export default SmartBillCalendar;
