import React, { useState, useMemo } from 'react';
import { Projection, Category, TransactionType, Frequency } from '../types';
import { formatCurrency } from '../utils/financialUtils';
import { Repeat, Calendar, Search, X } from 'lucide-react';

interface SubscriptionManagerProps {
  projections: Projection[];
  categories: Category[];
  onUpdateProjection: (projection: Projection) => void;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({
  projections,
  categories,
  onUpdateProjection
}) => {
  const [viewMode, setViewMode] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [cancelModalId, setCancelModalId] = useState<string | null>(null);

  // Helper to calculate next due date
  const getNextDueDate = (startDate: string, frequency: Frequency): Date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);

    if (start >= today) return start;

    const nextDate = new Date(start);
    while (nextDate < today) {
        if (frequency === Frequency.DAILY) {
            nextDate.setDate(nextDate.getDate() + 1);
        } else if (frequency === Frequency.WEEKLY) {
            nextDate.setDate(nextDate.getDate() + 7);
        } else if (frequency === Frequency.MONTHLY) {
            nextDate.setMonth(nextDate.getMonth() + 1);
        } else if (frequency === Frequency.YEARLY) {
            nextDate.setFullYear(nextDate.getFullYear() + 1);
        } else {
            return start; // Should not happen for recurring
        }
    }
    return nextDate;
  };

  const subscriptions = useMemo(() => {
    return projections
      .filter(p => p.isActive && p.type === TransactionType.EXPENSE && p.frequency !== Frequency.ONCE)
      .map(p => {
        const nextDue = getNextDueDate(p.startDate, p.frequency);

        let monthlyCost = 0;
        let yearlyCost = 0;

        if (p.frequency === Frequency.DAILY) {
             monthlyCost = p.amount * 30;
             yearlyCost = p.amount * 365;
        } else if (p.frequency === Frequency.WEEKLY) {
             monthlyCost = p.amount * 4.33;
             yearlyCost = p.amount * 52;
        } else if (p.frequency === Frequency.MONTHLY) {
             monthlyCost = p.amount;
             yearlyCost = p.amount * 12;
        } else if (p.frequency === Frequency.YEARLY) {
             monthlyCost = p.amount / 12;
             yearlyCost = p.amount;
        }

        return {
            ...p,
            nextDueDate: nextDue,
            monthlyCost,
            yearlyCost
        };
      })
      .sort((a, b) => a.nextDueDate.getTime() - b.nextDueDate.getTime());
  }, [projections]);

  const totalCost = useMemo(() => {
    return subscriptions.reduce((acc, sub) => acc + (viewMode === 'MONTHLY' ? sub.monthlyCost : sub.yearlyCost), 0);
  }, [subscriptions, viewMode]);

  const handleCancelClick = (id: string) => {
    setCancelModalId(id);
  };

  const closeCancelModal = () => {
    setCancelModalId(null);
  };

  const selectedProjection = useMemo(() => {
    return projections.find(p => p.id === cancelModalId);
  }, [projections, cancelModalId]);

  return (
    <div className="space-y-6">
      {/* Header & Summary */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
             <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
                <Repeat size={24} />
             </div>
             <div>
                <h1 className="text-2xl font-bold text-slate-900">Subscription Manager</h1>
                <p className="text-slate-500 text-sm">Track recurring expenses and upcoming renewals</p>
             </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="bg-slate-100 p-1 rounded-lg flex items-center">
                <button
                    onClick={() => setViewMode('MONTHLY')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'MONTHLY' ? 'bg-white shadow-sm text-purple-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Monthly
                </button>
                <button
                    onClick={() => setViewMode('YEARLY')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'YEARLY' ? 'bg-white shadow-sm text-purple-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Yearly
                </button>
            </div>

            <div className="text-right">
                <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total {viewMode === 'MONTHLY' ? 'Monthly' : 'Yearly'} Cost</div>
                <div className="text-2xl font-bold text-slate-900">{formatCurrency(totalCost)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription List */}
      <div className="grid grid-cols-1 gap-4">
        {subscriptions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
                <p className="text-slate-400">No recurring subscriptions found.</p>
            </div>
        ) : (
            subscriptions.map(sub => {
                const category = categories.find(c => c.id === sub.categoryId);
                const isUpcoming = (sub.nextDueDate.getTime() - new Date().getTime()) < (7 * 24 * 60 * 60 * 1000); // Due within 7 days

                return (
                    <div key={sub.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center space-x-4 w-full md:w-auto">
                            <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0" style={{ backgroundColor: category?.color || '#94a3b8' }}>
                                {sub.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">{sub.name}</h3>
                                <div className="flex items-center space-x-2 text-sm text-slate-500">
                                    <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-medium">{sub.frequency}</span>
                                    <span>&bull;</span>
                                    <span className="flex items-center text-slate-600">
                                       <Calendar size={12} className="mr-1" />
                                       Next: {sub.nextDueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                    </span>
                                    {isUpcoming && (
                                        <span className="text-amber-600 text-xs font-bold bg-amber-50 px-2 py-0.5 rounded-full">
                                            Upcoming
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between w-full md:w-auto space-x-6">
                             <div className="text-right">
                                <div className="font-bold text-slate-900 text-lg">
                                    {formatCurrency(viewMode === 'MONTHLY' ? sub.monthlyCost : sub.yearlyCost)}
                                </div>
                                <div className="text-xs text-slate-400">
                                    per {viewMode === 'MONTHLY' ? 'month' : 'year'}
                                </div>
                             </div>

                             <button
                                onClick={() => handleCancelClick(sub.id)}
                                className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                             >
                                Cancel
                             </button>
                        </div>
                    </div>
                );
            })
        )}
      </div>

      {/* Cancellation Modal */}
      {cancelModalId && selectedProjection && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-slate-900">Cancel {selectedProjection.name}</h3>
                        <button onClick={closeCancelModal} className="text-slate-400 hover:text-slate-600">
                            <X size={24} />
                        </button>
                    </div>

                    <p className="text-slate-600 mb-6">
                        We can't cancel subscriptions directly, but here is a quick way to find the instructions for <strong>{selectedProjection.name}</strong>.
                    </p>

                    <a
                        href={`https://www.google.com/search?q=how+to+cancel+${encodeURIComponent(selectedProjection.name)}+subscription`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors mb-3"
                    >
                        <Search size={18} className="mr-2" />
                        Find Cancellation Guide
                    </a>

                    <button
                        onClick={() => {
                            onUpdateProjection({ ...selectedProjection, isActive: false });
                            closeCancelModal();
                        }}
                        className="w-full py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors mb-3 border border-red-100"
                    >
                        Stop Tracking (Deactivate)
                    </button>

                    <button
                        onClick={closeCancelModal}
                        className="w-full py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManager;
