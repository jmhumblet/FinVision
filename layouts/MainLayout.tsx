import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '../store/useAppStore';
import { logout, clearAllUserData } from '../services/firebaseService';
import Toast from '../components/Toast';
import { 
  Wallet, 
  TrendingUp,
  LayoutDashboard,
  CreditCard,
  Repeat,
  PiggyBank,
  Landmark,
  Calendar,
  HeartPulse,
  Database,
  Trash2,
  LogOut,
  Loader2,
  Check
} from 'lucide-react';
import { useUserData } from '../queries/useUserData';

// A mock 'user' object until we handle auth properly in a context
import { auth } from '../services/firebaseService';

export const MainLayout: React.FC = () => {
  const { toasts, removeToast } = useAppStore();
  const location = useLocation();
  const queryClient = useQueryClient();
  const user = auth.currentUser;

  // We check if queries are fetching/mutating to show the syncing indicator
  const isSyncing = queryClient.isMutating() > 0;

  const handleResetData = async () => {
    if (!user) return;
    const confirm = window.confirm("Are you sure you want to delete ALL your data? This cannot be undone.");
    if (!confirm) return;

    try {
        await clearAllUserData(user.uid);
        queryClient.invalidateQueries();
        useAppStore.getState().addToast("All data has been successfully reset.", "success");
    } catch (e) {
        console.error("Error resetting data:", e);
        useAppStore.getState().addToast("Failed to reset data.", "error");
    }
  };

  const navItems = [
    { path: '/', icon: <TrendingUp size={20} />, title: 'Dashboard' },
    { path: '/monthly', icon: <LayoutDashboard size={20} />, title: 'Monthly Focus' },
    { path: '/debt', icon: <CreditCard size={20} />, title: 'Debt Strategist' },
    { path: '/subscriptions', icon: <Repeat size={20} />, title: 'Subscriptions' },
    { path: '/savings', icon: <PiggyBank size={20} />, title: 'Smart Savings' },
    { path: '/calendar', icon: <Calendar size={20} />, title: 'Bill Calendar' },
    { path: '/net-worth', icon: <Landmark size={20} />, title: 'Net Worth' },
    { path: '/health', icon: <HeartPulse size={20} />, title: 'Financial Health' },
    { path: '/data', icon: <Database size={20} />, title: 'Data Viewer' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative">
      <div className="fixed top-4 right-4 z-[60] flex flex-col items-end space-y-2 pointer-events-none">
        <div className="pointer-events-auto">
          {toasts.map(toast => (
            <Toast key={toast.id} toast={toast} onClose={removeToast} />
          ))}
        </div>
      </div>

      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md shadow-blue-100">
              <Wallet size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">FinVision</h1>
              <div className="flex items-center text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">
                {isSyncing ? (
                  <span className="flex items-center text-blue-500 transition-all duration-300">
                    <Loader2 size={10} className="mr-1 animate-spin" /> Syncing...
                  </span>
                ) : (
                  <span className="flex items-center text-emerald-500 transition-all duration-300">
                    <Check size={10} className="mr-1" /> Saved
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl">
                {navItems.map(item => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`p-2 rounded-lg transition-all ${isActive ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                      title={item.title}
                    >
                      {item.icon}
                    </Link>
                  );
                })}
            </div>

            <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>

            <div className="flex items-center space-x-3">
               <div className="hidden lg:block text-right">
                  <p className="text-xs font-bold text-slate-900 leading-none">{user?.displayName || 'User'}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{user?.email || 'Guest Session'}</p>
               </div>
               <button 
                  onClick={handleResetData}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Reset All Data"
               >
                 <Trash2 size={20} />
               </button>
               <button 
                  onClick={() => logout()}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Sign Out"
               >
                 <LogOut size={20} />
               </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
         <Outlet />
      </main>
    </div>
  );
};
