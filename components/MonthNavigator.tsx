import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface MonthNavigatorProps {
  currentDate: Date;
  onNavigate: (date: Date) => void;
}

const MonthNavigator: React.FC<MonthNavigatorProps> = ({ currentDate, onNavigate }) => {
  const monthName = currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  const handlePrev = () => {
    const prev = new Date(currentDate);
    prev.setMonth(prev.getMonth() - 1);
    onNavigate(prev);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + 1);
    onNavigate(next);
  };

  const handleToday = () => {
    onNavigate(new Date());
  };

  return (
    <div className="flex items-center space-x-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center space-x-1">
        <button 
          onClick={handlePrev}
          className="p-2 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors"
          title="Previous Month"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div 
          onClick={handleToday}
          className="px-4 py-2 flex items-center space-x-2 cursor-pointer hover:bg-slate-50 rounded-xl transition-colors min-w-[180px] justify-center"
        >
          <Calendar size={18} className="text-blue-500" />
          <span className="font-bold text-slate-800">{monthName}</span>
        </div>

        <button 
          onClick={handleNext}
          className="p-2 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors"
          title="Next Month"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default MonthNavigator;
