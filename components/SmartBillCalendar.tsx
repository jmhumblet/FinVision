import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import {
  Transaction,
  Projection,
  Category,
  DailyBalance,
  TransactionType,
  Frequency
} from '../types';
import { formatCurrency, calculateProjectionValueForDate } from '../utils/financialUtils';

interface SmartBillCalendarProps {
  transactions: Transaction[];
  projections: Projection[];
  categories: Category[];
  timelineData: DailyBalance[];
  onAddTransaction: (t: Transaction) => void;
  onUpdateTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onAddProjection: (p: Projection) => void;
  onUpdateProjection: (p: Projection) => void;
  onDeleteProjection: (id: string) => void;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const SmartBillCalendar: React.FC<SmartBillCalendarProps> = ({
  transactions,
  projections,
  categories,
  timelineData,
  onAddTransaction
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // --- Calendar Logic ---
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Adjust for Monday start (0=Sun, 1=Mon... -> 0=Mon, 6=Sun)
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days = [];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }

    // Next month padding
    const remainingCells = 42 - days.length; // 6 rows * 7 cols
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }

    return days;
  };

  const calendarDays = useMemo(() => getDaysInMonth(currentMonth), [currentMonth]);

  // --- Data Logic ---
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];

    // 1. Transactions (Actual)
    const txs = transactions.filter(t => t.date === dateStr);

    // 2. Projections (Planned) - Only if date is in future or today?
    // Actually, show projections for all days to see what was PLANNED vs actual
    // But usually projections "turn into" transactions.
    // Let's filter projections:
    // If it's in the past, maybe show them as "Missed" if no matching transaction?
    // For simplicity, we just show what `timelineData` uses essentially.

    const projs = projections.filter(p => {
        if (!p.isActive) return false;
        const val = calculateProjectionValueForDate(p, date, dateStr);
        return val !== 0;
    }).map(p => ({ ...p, isProjection: true }));

    return { txs, projs };
  };

  const getBalanceForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const point = timelineData.find(d => d.date === dateStr);
    if (!point) return null;
    return point.projectedBalance !== null ? point.projectedBalance : point.historicalBalance;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // --- Render ---
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
            <Calendar size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Bill Calendar</h2>
            <p className="text-slate-500 text-sm">Visualize your cash flow</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 bg-slate-50 p-1 rounded-xl">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-600 transition-all">
            <ChevronLeft size={20} />
          </button>
          <span className="text-base font-bold text-slate-800 min-w-[140px] text-center">
            {currentMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={handleNextMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-600 transition-all">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Weekday Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
          {WEEKDAYS.map(day => (
            <div key={day} className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 auto-rows-fr">
          {calendarDays.map((cell, idx) => {
            const { date, isCurrentMonth } = cell;
            const { txs, projs } = getEventsForDate(date);
            const balance = getBalanceForDate(date);
            const isDayToday = isToday(date);

            // Combine events for list
            const allEvents = [
                ...txs.map(t => ({ ...t, isProjection: false, color: categories.find(c => c.id === t.categoryId)?.color })),
                ...projs.map(p => ({ ...p, isProjection: true, color: categories.find(c => c.id === p.categoryId)?.color }))
            ];

            const hasNegativeBalance = balance !== null && balance < 0;

            return (
              <div
                key={idx}
                onClick={() => setSelectedDate(date)}
                className={`
                  min-h-[120px] p-2 border-b border-r border-slate-100 transition-colors cursor-pointer relative group
                  ${!isCurrentMonth ? 'bg-slate-50/50' : 'bg-white hover:bg-blue-50/30'}
                  ${isDayToday ? 'ring-2 ring-inset ring-blue-500' : ''}
                `}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`
                    text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full
                    ${isDayToday ? 'bg-blue-600 text-white' : isCurrentMonth ? 'text-slate-700' : 'text-slate-400'}
                  `}>
                    {date.getDate()}
                  </span>

                  {balance !== null && (
                    <span className={`text-[10px] font-bold ${hasNegativeBalance ? 'text-red-500 bg-red-50 px-1 rounded' : 'text-slate-400'}`}>
                      {formatCurrency(balance)}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                   {allEvents.slice(0, 3).map((evt, i) => (
                     <div
                        key={`${evt.id}-${i}`}
                        className={`
                          text-[10px] px-1.5 py-0.5 rounded truncate flex items-center
                          ${evt.isProjection ? 'border border-dashed bg-white' : 'text-white shadow-sm'}
                        `}
                        style={!evt.isProjection ? { backgroundColor: evt.color || '#94a3b8' } : { borderColor: evt.color || '#94a3b8', color: '#475569' }}
                     >
                        {evt.isProjection && <Clock size={8} className="mr-1 opacity-50" />}
                        {!evt.isProjection && <CheckCircle2 size={8} className="mr-1 opacity-70" />}
                        {evt.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(evt.amount)}
                        <span className="ml-1 opacity-75 truncate">{('name' in evt) ? evt.name : evt.description}</span>
                     </div>
                   ))}
                   {allEvents.length > 3 && (
                     <div className="text-[10px] text-slate-400 pl-1 font-medium">
                        +{allEvents.length - 3} more
                     </div>
                   )}
                </div>

                {/* Quick Add Button (Hover) */}
                <button className="absolute bottom-2 right-2 p-1 bg-blue-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                   <Plus size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal (Placeholder for now) */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedDate(null)}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-lg text-slate-800">
                        {selectedDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </h3>
                    <button onClick={() => setSelectedDate(null)} className="text-slate-400 hover:text-slate-600">
                        <Plus size={24} className="rotate-45" />
                    </button>
                </div>
                <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                    {/* List Events */}
                    {(() => {
                        const { txs, projs } = getEventsForDate(selectedDate);
                        const hasEvents = txs.length > 0 || projs.length > 0;

                        if (!hasEvents) {
                            return <p className="text-center text-slate-400 py-8 italic">No events scheduled for this day.</p>;
                        }

                        return (
                            <div className="space-y-3">
                                {txs.map(t => (
                                    <div key={t.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-2 h-8 rounded-full" style={{ backgroundColor: categories.find(c => c.id === t.categoryId)?.color || '#94a3b8' }}></div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">{t.description}</p>
                                                <p className="text-xs text-slate-500">Transaction • {t.type}</p>
                                            </div>
                                        </div>
                                        <span className={`font-bold ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-800'}`}>
                                            {t.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(t.amount)}
                                        </span>
                                    </div>
                                ))}
                                {projs.map(p => (
                                    <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-2 h-8 rounded-full opacity-50" style={{ backgroundColor: categories.find(c => c.id === p.categoryId)?.color || '#94a3b8' }}></div>
                                            <div>
                                                <p className="font-bold text-slate-600 text-sm">{p.name}</p>
                                                <p className="text-xs text-slate-400">Scheduled Bill</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-slate-500">
                                            {p.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(p.amount)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 grid grid-cols-2 gap-3">
                    <button
                        onClick={() => {
                            // Quick Add Transaction logic
                            const newTx: Transaction = {
                                id: `manual-${Date.now()}`,
                                date: selectedDate.toISOString().split('T')[0],
                                description: 'New Expense',
                                amount: 0,
                                categoryId: '8', // Other
                                type: TransactionType.EXPENSE
                            };
                            onAddTransaction(newTx);
                            setSelectedDate(null);
                        }}
                        className="flex items-center justify-center space-x-2 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={18} />
                        <span>Add Transaction</span>
                    </button>
                    <button
                         className="flex items-center justify-center space-x-2 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                         onClick={() => alert("To add a recurring bill, please use the Main Dashboard.")}
                    >
                        <Clock size={18} />
                        <span>Add Recurring</span>
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default SmartBillCalendar;
