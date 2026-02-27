import React, { useState, useMemo } from 'react';
import {
  Transaction,
  Projection,
  DailyBalance,
  TransactionType,
  Category
} from '../types';
import { calculateProjectionValueForDate, formatCurrency } from '../utils/financialUtils';
import { ChevronLeft, ChevronRight, Plus, AlertCircle, Calendar as CalendarIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface SmartBillCalendarProps {
  transactions: Transaction[];
  projections: Projection[];
  timelineData: DailyBalance[];
  categories: Category[];
  onAddTransaction: (date: string) => void;
}

interface CalendarDay {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  isCurrentMonth: boolean;
  transactions: Transaction[];
  projections: { proj: Projection; amount: number }[];
  projectedBalance: number | null;
  hasLowBalance: boolean;
}

const SmartBillCalendar: React.FC<SmartBillCalendarProps> = ({
  transactions,
  projections,
  timelineData,
  categories,
  onAddTransaction
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const calendarData = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Calculate padding for start of week (Monday start)
    // getDay(): 0 = Sunday, 1 = Monday. We want Monday=0, Sunday=6
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6; // Sunday

    const days: CalendarDay[] = [];

    // Previous month padding
    for (let i = startDayOfWeek; i > 0; i--) {
        const d = new Date(year, month, 1 - i);
        days.push(createCalendarDay(d, false));
    }

    // Current month
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
        days.push(createCalendarDay(new Date(d), true));
    }

    // Next month padding (to fill 6 rows = 42 cells, or just complete the week)
    // Let's just complete the week for now
    const remainingCells = 7 - (days.length % 7);
    if (remainingCells < 7) {
        for (let i = 1; i <= remainingCells; i++) {
            const d = new Date(year, month + 1, i);
            days.push(createCalendarDay(d, false));
        }
    }

    return days;
  }, [currentMonth, transactions, projections, timelineData]);

  function createCalendarDay(date: Date, isCurrentMonth: boolean): CalendarDay {
    // Local YYYY-MM-DD
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    // 1. Transactions
    const daysTransactions = transactions.filter(t => t.date === dateStr);

    // 2. Projections
    const daysProjections: { proj: Projection; amount: number }[] = [];
    projections.forEach(p => {
        if (!p.isActive) return;
        const val = calculateProjectionValueForDate(p, date, dateStr);
        if (val !== 0) {
            daysProjections.push({ proj: p, amount: val });
        }
    });

    // 3. Balance from Timeline
    const timelinePoint = timelineData.find(td => td.date === dateStr);
    const projectedBalance = timelinePoint
        ? (timelinePoint.projectedBalance !== null ? timelinePoint.projectedBalance : timelinePoint.historicalBalance)
        : null;

    const hasLowBalance = projectedBalance !== null && projectedBalance < 0;

    return {
        date,
        dateStr,
        isCurrentMonth,
        transactions: daysTransactions,
        projections: daysProjections,
        projectedBalance,
        hasLowBalance
    };
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                    <CalendarIcon size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Smart Bill Calendar</h2>
                    <p className="text-xs text-slate-500 font-medium">Visualise your cash flow timeline</p>
                </div>
            </div>

            <div className="flex items-center space-x-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-500 transition-all">
                    <ChevronLeft size={20} />
                </button>
                <div className="px-4 py-1 min-w-[140px] text-center">
                    <span className="font-bold text-slate-700">
                        {currentMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                    </span>
                </div>
                <button onClick={handleNextMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-500 transition-all">
                    <ChevronRight size={20} />
                </button>
            </div>

            <button
                onClick={goToToday}
                className="px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
                Jump to Today
            </button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Days Header */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                {weekDays.map(day => (
                    <div key={day} className="py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Cells */}
            <div className="grid grid-cols-7 auto-rows-fr">
                {calendarData.map((day, idx) => {
                    const isToday = day.dateStr === new Date().toISOString().split('T')[0];
                    return (
                        <div
                            key={day.dateStr}
                            className={`
                                min-h-[140px] p-2 border-b border-r border-slate-100 relative group transition-colors
                                ${!day.isCurrentMonth ? 'bg-slate-50/50' : 'bg-white'}
                                ${(idx + 1) % 7 === 0 ? 'border-r-0' : ''}
                                hover:bg-slate-50
                            `}
                            onClick={() => onAddTransaction(day.dateStr)}
                        >
                            {/* Date Header */}
                            <div className="flex items-center justify-between mb-2">
                                <span className={`
                                    text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full
                                    ${isToday ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-700'}
                                    ${!day.isCurrentMonth ? 'text-slate-400' : ''}
                                `}>
                                    {day.date.getDate()}
                                </span>
                                {day.hasLowBalance && (
                                    <div className="text-red-500" title="Projected balance drops below zero">
                                        <AlertCircle size={14} />
                                    </div>
                                )}
                            </div>

                            {/* Events List */}
                            <div className="space-y-1.5 overflow-y-auto max-h-[100px] no-scrollbar">
                                {/* Transactions (Actual) */}
                                {day.transactions.map(tx => (
                                    <div key={tx.id} className={`
                                        text-[10px] px-1.5 py-1 rounded border truncate flex items-center justify-between
                                        ${tx.type === TransactionType.INCOME
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                            : 'bg-slate-50 text-slate-600 border-slate-100'}
                                    `}>
                                        <span className="truncate mr-1 font-medium">{tx.description}</span>
                                        <span className="font-bold">{formatCurrency(tx.amount)}</span>
                                    </div>
                                ))}

                                {/* Projections (Expected) */}
                                {day.projections.map(({ proj, amount }) => (
                                    <div key={`${proj.id}-${day.dateStr}`} className={`
                                        text-[10px] px-1.5 py-1 rounded border border-dashed truncate flex items-center justify-between opacity-80
                                        ${amount > 0
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                            : 'bg-red-50 text-red-600 border-red-200'}
                                    `}>
                                        <span className="truncate mr-1">{proj.name}</span>
                                        <span>{formatCurrency(Math.abs(amount))}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Add Button (Hover) */}
                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    className="p-1.5 bg-indigo-600 text-white rounded-full shadow-md hover:bg-indigo-700 transition-colors"
                                    title="Add Transaction"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddTransaction(day.dateStr);
                                    }}
                                >
                                    <Plus size={14} />
                                </button>
                            </div>

                            {/* Balance Indicator (Bottom) */}
                             {day.projectedBalance !== null && (
                                <div className={`
                                    absolute bottom-1 left-2 text-[9px] font-bold opacity-60
                                    ${day.projectedBalance < 0 ? 'text-red-500' : 'text-slate-400'}
                                `}>
                                    Bal: {formatCurrency(day.projectedBalance)}
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
