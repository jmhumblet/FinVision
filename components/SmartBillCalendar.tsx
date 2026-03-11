import React, { useState, useMemo } from 'react';
import { Projection, DailyBalance, TransactionType, Frequency, Category } from '../types';
import { calculateProjectionValueForDate, formatCurrency, getMonthKey } from '../utils/financialUtils';
import { ChevronLeft, ChevronRight, Plus, AlertCircle } from 'lucide-react';

interface SmartBillCalendarProps {
  projections: Projection[];
  timelineData: DailyBalance[];
  categories: Category[];
  onUpdateProjection: (p: Projection) => void;
  onAddProjection: (dateStr?: string) => void;
  onAddTransaction: (dateStr?: string) => void;
}

const SmartBillCalendar: React.FC<SmartBillCalendarProps> = ({
  projections,
  timelineData,
  categories,
  onUpdateProjection,
  onAddProjection,
  onAddTransaction,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const getCategoryColor = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.color || '#94a3b8';
  };

  const handleDragStart = (e: React.DragEvent, projectionId: string, originalDateStr: string) => {
    e.dataTransfer.setData('projectionId', projectionId);
    e.dataTransfer.setData('originalDateStr', originalDateStr);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e: React.DragEvent, targetDateStr: string) => {
    e.preventDefault();
    const projectionId = e.dataTransfer.getData('projectionId');
    const originalDateStr = e.dataTransfer.getData('originalDateStr');

    if (!projectionId || originalDateStr === targetDateStr) return;

    const projection = projections.find(p => p.id === projectionId);
    if (!projection) return;

    // Only allow rescheduling ONE-TIME or MONTHLY for simplicity,
    // or just update startDate and let the frequency handle it.
    // If it's a recurring bill, moving it might just change its startDate.
    // Let's change its startDate.
    const updatedProjection = { ...projection, startDate: targetDateStr };
    onUpdateProjection(updatedProjection);
  };

  // Build grid data
  const monthData = useMemo(() => {
    const data: any[] = [];

    // Previous month padding
    const prevMonthDays = getDaysInMonth(currentYear, currentMonth - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
      data.push({
        date: new Date(currentYear, currentMonth - 1, prevMonthDays - i),
        isCurrentMonth: false,
        events: [],
        balance: null
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(currentYear, currentMonth, i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;

      const events: any[] = [];
      projections.forEach(proj => {
        if (!proj.isActive) return;
        const val = calculateProjectionValueForDate(proj, d, dateStr);
        if (val !== 0) {
          events.push({
             projection: proj,
             amount: val,
             dateStr
          });
        }
      });

      const dayTimeline = timelineData.find(td => td.date === dateStr);
      let balance = null;
      if (dayTimeline) {
          balance = dayTimeline.projectedBalance !== null ? dayTimeline.projectedBalance : dayTimeline.historicalBalance;
      }

      data.push({
        date: d,
        dateStr,
        isCurrentMonth: true,
        events,
        balance
      });
    }

    // Next month padding
    const remainingCells = 42 - data.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingCells; i++) {
      data.push({
        date: new Date(currentYear, currentMonth + 1, i),
        isCurrentMonth: false,
        events: [],
        balance: null
      });
    }

    return data;
  }, [currentDate, projections, timelineData]);


  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Smart Bill Calendar</h2>
          <p className="text-sm text-slate-500">Track and reschedule your upcoming cash flow</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-slate-50 rounded-lg p-1 border border-slate-200">
            <button
              onClick={prevMonth}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-md transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="px-4 font-semibold text-slate-700 min-w-[120px] text-center">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-md transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex space-x-2">
            <button
               onClick={() => onAddTransaction()}
               className="flex items-center space-x-1 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={16} /> <span className="hidden sm:inline">Transaction</span>
            </button>
            <button
               onClick={() => onAddProjection()}
               className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={16} /> <span className="hidden sm:inline">Bill / Income</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto bg-slate-50 p-4">
        <div className="min-w-[800px]">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Cells */}
          <div className="grid grid-cols-7 gap-2">
            {monthData.map((dayData, index) => {
              const isToday = new Date().toDateString() === dayData.date.toDateString();
              const isWarning = dayData.balance !== null && dayData.balance < 0;

              return (
                <div
                  key={index}
                  onDragOver={dayData.isCurrentMonth ? handleDragOver : undefined}
                  onDrop={dayData.isCurrentMonth ? (e) => handleDrop(e, dayData.dateStr) : undefined}
                  onClick={() => dayData.isCurrentMonth && onAddTransaction(dayData.dateStr)}
                  className={`
                    min-h-[120px] p-2 rounded-xl border flex flex-col cursor-pointer transition-all
                    ${!dayData.isCurrentMonth ? 'bg-slate-100/50 border-transparent opacity-50' : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'}
                    ${isToday ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                    ${isWarning && dayData.isCurrentMonth ? 'bg-red-50 border-red-200' : ''}
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-sm font-bold ${isToday ? 'text-blue-600' : 'text-slate-700'}`}>
                      {dayData.date.getDate()}
                    </span>
                    {dayData.isCurrentMonth && dayData.balance !== null && (
                       <span className={`text-xs font-semibold ${isWarning ? 'text-red-600 flex items-center' : 'text-slate-400'}`}>
                          {isWarning && <AlertCircle size={10} className="mr-1" />}
                          {formatCurrency(dayData.balance)}
                       </span>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col space-y-1 overflow-y-auto custom-scrollbar pr-1">
                     {dayData.events.map((evt: any, i: number) => {
                       const isIncome = evt.amount > 0;
                       const p = evt.projection;
                       const color = getCategoryColor(p.categoryId);

                       return (
                         <div
                           key={`${p.id}-${i}`}
                           draggable
                           onDragStart={(e) => handleDragStart(e, p.id, evt.dateStr)}
                           onClick={(e) => e.stopPropagation()} // Prevent triggering quick add
                           className={`
                             text-[10px] px-2 py-1 rounded border flex justify-between items-center group
                             ${isIncome ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}
                             hover:opacity-80 cursor-grab active:cursor-grabbing
                           `}
                           title={p.name}
                         >
                            <span className="truncate mr-1 font-medium">{p.name}</span>
                            <span className="font-bold flex-shrink-0">{formatCurrency(Math.abs(evt.amount))}</span>
                         </div>
                       );
                     })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartBillCalendar;
