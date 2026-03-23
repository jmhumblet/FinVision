import React, { useMemo } from 'react';
import { DailyBalance } from '../types';
import { AlertTriangle, TrendingDown, Clock, ArrowRight } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/financialUtils';

interface CashFlowAlertsProps {
  timelineData: DailyBalance[];
}

const CashFlowAlerts: React.FC<CashFlowAlertsProps> = ({ timelineData }) => {
  const alertData = useMemo(() => {
    if (!timelineData || timelineData.length === 0) return null;

    // Find the current date index or split point
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstFutureIndex = timelineData.findIndex(d => {
      const date = new Date(d.date);
      date.setHours(0, 0, 0, 0);
      return date >= today;
    });

    if (firstFutureIndex === -1) return null;

    // Look ahead up to 30 days from today
    const lookaheadDays = 30;
    const limitDate = new Date(today);
    limitDate.setDate(limitDate.getDate() + lookaheadDays);

    for (let i = firstFutureIndex; i < timelineData.length; i++) {
      const point = timelineData[i];
      const date = new Date(point.date);
      date.setHours(0, 0, 0, 0);

      if (date > limitDate) break;

      const balance = point.projectedBalance !== null ? point.projectedBalance : point.historicalBalance;

      if (balance !== null && balance < 0) {
        // Calculate days away more accurately based on date diff
        const timeDiff = date.getTime() - today.getTime();
        const daysAway = Math.floor(timeDiff / (1000 * 3600 * 24));

        return {
          date: point.date,
          deficit: Math.abs(balance),
          daysAway: daysAway
        };
      }
    }

    return null;
  }, [timelineData]);

  if (!alertData) return null;

  const isUrgent = alertData.daysAway <= 7;

  return (
    <div className={`mt-6 p-4 md:p-6 rounded-2xl border ${isUrgent ? 'bg-red-50 border-red-200 shadow-sm shadow-red-100' : 'bg-orange-50 border-orange-200 shadow-sm shadow-orange-100'} transition-all`}>
      <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-4">

        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-xl flex-shrink-0 ${isUrgent ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className={`text-lg font-bold ${isUrgent ? 'text-red-900' : 'text-orange-900'} flex items-center`}>
              Cash Flow Alert
              {isUrgent && <span className="ml-2 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide font-bold">Urgent</span>}
            </h3>
            <p className={`text-sm mt-1 ${isUrgent ? 'text-red-700' : 'text-orange-700'}`}>
              Projected balance drops below zero on <span className="font-bold">{formatDate(alertData.date)}</span> (in {alertData.daysAway} {alertData.daysAway === 1 ? 'day' : 'days'}).
            </p>
            <div className={`flex items-center mt-2 text-sm font-semibold ${isUrgent ? 'text-red-800' : 'text-orange-800'}`}>
               <TrendingDown size={16} className="mr-1" />
               Projected Deficit: {formatCurrency(alertData.deficit)}
            </div>
          </div>
        </div>

        <div className="w-full md:w-auto flex-shrink-0">
           <div className={`bg-white p-3 rounded-xl border ${isUrgent ? 'border-red-100' : 'border-orange-100'} shadow-sm`}>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                 <Clock size={12} className="mr-1" /> Actionable Steps
              </p>
              <ul className="text-sm space-y-1">
                 <li className="flex items-center text-slate-700">
                    <ArrowRight size={14} className="mr-2 text-slate-400" /> Delay non-essential purchases
                 </li>
                 <li className="flex items-center text-slate-700">
                    <ArrowRight size={14} className="mr-2 text-slate-400" /> Move funds from savings
                 </li>
                 <li className="flex items-center text-slate-700">
                    <ArrowRight size={14} className="mr-2 text-slate-400" /> Reschedule upcoming flexible bills
                 </li>
              </ul>
           </div>
        </div>

      </div>
    </div>
  );
};

export default CashFlowAlerts;
