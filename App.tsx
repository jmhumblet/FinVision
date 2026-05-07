import React, { useEffect, useState } from 'react';
import { AppProviders } from './providers/AppProviders';
import { Router } from './Router';
import { observeAuth } from './services/firebaseService';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAppStore } from './store/useAppStore';

const App: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const { authError, setAuthError, setUser } = useAppStore();

  useEffect(() => {
    try {
      const unsubscribe = observeAuth((u) => {
        setUser(u);
        setIsInitializing(false);
      });
      return () => unsubscribe();
    } catch (e: any) {
      console.error("Auth observer setup failed:", e);
      setAuthError(e.message || "Authentication system failed to initialize.");
      setIsInitializing(false);
    }
  }, [setAuthError]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-400 mt-4">Initializing Auth...</p>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">System Error</h2>
        <p className="text-slate-600 text-center max-w-md">{authError}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <AppProviders>
      <Router />
    </AppProviders>
  );
};

export default App;
