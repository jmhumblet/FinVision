import React, { useState, useMemo } from 'react';
import { Transaction, Projection, DailyBalance, TransactionType, Frequency } from '../types';
import { formatCurrency, calculateProjectionValueForDate } from '../utils/financialUtils';
import { ChevronLeft, ChevronRight, AlertCircle, Plus } from 'lucide-react';

interface SmartBillCalendarProps {
  transactions: Transaction[];
  projections: Projection[];
  timelineData: DailyBalance[];
  onAddTransaction: (dateStr: string) => void;
  onUpdateTransaction: (tx: Transaction) => void;
  onUpdateProjection: (p: Projection) => void;
}

const SmartBillCalendar: React.FC<SmartBillCalendarProps> = ({
  transactions,
  projections,
  timelineData,
  onAddTransaction,
  onUpdateTransaction,
  onUpdateProjection,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    // 0 is Sunday, 1 is Monday, etc. Adjusting to make Monday the first day.
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = () => setCurrentDate(new Date());

  const days = useMemo(() => {
    const arr = [];
    for (let i = 0; i < firstDay; i++) {
      arr.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      arr.push(i);
    }
    return arr;
  }, [firstDay, daysInMonth]);

  const monthName = currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  const getEventsForDay = (day: number) => {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const d = new Date(year, month, day);

    const dayTx = transactions.filter(t => t.date === dStr).map(t => ({ ...t, isProjection: false }));
    const dayProj = projections.filter(p => {
        if (!p.isActive) return false;
        const val = calculateProjectionValueForDate(p, d, dStr);
        return val !== 0;
    }).map(p => ({ ...p, isProjection: true, amount: Math.abs(calculateProjectionValueForDate(p, d, dStr)) }));

    return [...dayTx, ...dayProj].sort((a, b) => b.amount - a.amount);
  };

  const getBalanceForDay = (day: number) => {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const timelineEntry = timelineData.find(d => d.date === dStr);
    if (!timelineEntry) return null;
    return timelineEntry.projectedBalance !== null ? timelineEntry.projectedBalance : timelineEntry.historicalBalance;
  };

  const handleDragStart = (e: React.DragEvent, eventId: string, isProjection: boolean, originalDate: string) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ id: eventId, isProjection, originalDate }));
  };

  const handleDrop = (e: React.DragEvent, targetDay: number) => {
    e.preventDefault();
    const dataStr = e.dataTransfer.getData('text/plain');
    if (!dataStr) return;

    try {
        const data = JSON.parse(dataStr);
        const targetDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`;

        if (data.originalDate === targetDateStr) return; // No change

        if (data.isProjection) {
            const proj = projections.find(p => p.id === data.id);
            if (proj) {
                // If it's a recurring projection, updating startDate might have unintended consequences
                // Let's only allow moving ONCE projections or changing the start date of recurring ones
                if (proj.frequency === Frequency.ONCE) {
                    onUpdateProjection({ ...proj, startDate: targetDateStr });
                } else {
                     if(window.confirm(`This is a recurring bill (${proj.frequency}). Do you want to change its start date to ${targetDateStr}?`)) {
                          onUpdateProjection({ ...proj, startDate: targetDateStr });
                     }
                }
            }
        } else {
            const tx = transactions.find(t => t.id === data.id);
            if (tx) {
                onUpdateTransaction({ ...tx, date: targetDateStr });
            }
        }
    } catch(err) {
        console.error("Drop failed", err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-140px)] min-h-[600px]">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
        <div>
           <h2 className="text-xl font-bold text-slate-800">Smart Bill Calendar</h2>
           <p className="text-sm text-slate-500">Track and reschedule your upcoming cash flow</p>
        </div>
        <div className="flex items-center space-x-4">
            <button onClick={today} className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                Today
            </button>
            <div className="flex items-center space-x-2 bg-white border border-slate-300 rounded-lg p-1 shadow-sm">
                <button onClick={prevMonth} className="p-1 rounded hover:bg-slate-100 text-slate-600 transition-colors">
                    <ChevronLeft size={20} />
                </button>
                <span className="text-sm font-bold w-36 text-center text-slate-800">{monthName}</span>
                <button onClick={nextMonth} className="p-1 rounded hover:bg-slate-100 text-slate-600 transition-colors">
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-slate-100/50 p-4">
          <div className="min-w-[800px] h-full flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 shrink-0">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <div key={day} className="py-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider border-r last:border-r-0 border-slate-200">
                          {day}
                      </div>
                  ))}
              </div>

              {/* Grid */}
              <div className="flex-1 grid grid-cols-7 grid-rows-5 md:grid-rows-auto">
                  {days.map((day, idx) => {
                      if (day === null) {
                          return <div key={`empty-${idx}`} className="border-r border-b border-slate-100 bg-slate-50/50 min-h-[100px]" />;
                      }

                      const events = getEventsForDay(day);
                      const balance = getBalanceForDay(day);
                      const isNegative = balance !== null && balance < 0;
                      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const isToday = new Date().toISOString().split('T')[0] === dateStr;

                      return (
                          <div
                              key={`day-${day}`}
                              className={`border-r border-b border-slate-200 min-h-[120px] p-1.5 flex flex-col group relative transition-colors ${isToday ? 'bg-blue-50/30' : 'hover:bg-slate-50'}`}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, day)}
                          >
                              <div className="flex items-start justify-between mb-1">
                                  <span className={`text-sm font-semibold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700'}`}>
                                      {day}
                                  </span>
                                  <button
                                      onClick={() => onAddTransaction(dateStr)}
                                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                                      title="Quick Add"
                                      data-testid={`quick-add-${day}`}
                                  >
                                      <Plus size={14} />
                                  </button>
                              </div>

                              <div className="flex-1 overflow-y-auto space-y-1 no-scrollbar pr-1">
                                  {events.map((ev, eIdx) => {
                                      const isIncome = ev.type === TransactionType.INCOME;
                                      return (
                                          <div
                                              key={`${ev.id}-${eIdx}`}
                                              draggable={true}
                                              onDragStart={(e) => handleDragStart(e, ev.id, ev.isProjection, dateStr)}
                                              className={`text-xs px-1.5 py-1 rounded border border-l-2 cursor-grab active:cursor-grabbing truncate shadow-sm transition-transform hover:scale-[1.02]
                                                  ${isIncome ? 'bg-emerald-50 text-emerald-700 border-emerald-200 border-l-emerald-500' : 'bg-red-50 text-red-700 border-red-200 border-l-red-500'}
                                                  ${ev.isProjection ? 'border-dashed' : ''}
                                              `}
                                              title={`${(ev as any).name || (ev as any).description}: ${formatCurrency(ev.amount)}`}
                                          >
                                              <span className="font-semibold">{formatCurrency(ev.amount)}</span>
                                              <span className="ml-1 opacity-80">{(ev as any).name || (ev as any).description}</span>
                                          </div>
                                      );
                                  })}
                              </div>

                              {balance !== null && (
                                  <div className={`mt-2 text-right text-xs font-bold pt-1 border-t ${isNegative ? 'text-red-600 border-red-200 bg-red-50 -mx-1.5 -mb-1.5 px-1.5 pb-1.5 rounded-b-sm' : 'text-slate-500 border-slate-100'}`}>
                                      <div className="flex items-center justify-end space-x-1">
                                          {isNegative && <AlertCircle size={10} />}
                                          <span>{formatCurrency(balance)}</span>
                                      </div>
                                  </div>
                              )}
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