import React from 'react';
import { Wallet, LogIn, User } from 'lucide-react';
import { signInWithGoogle, signInGuest } from '../services/firebaseService';

interface AuthScreenProps {
  onLoginSuccess?: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = () => {
  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed:", error);
      alert("Failed to sign in. Please try again or use Guest mode if popups are blocked.");
    }
  };

  const handleGuestLogin = async () => {
    try {
      await signInGuest();
    } catch (error) {
      console.error("Guest Login failed:", error);
      alert("Failed to sign in as guest. Please ensure Anonymous Auth is enabled in Firebase Console.");
    }
  };

  return (
    <div className="min-h-screen auth-gradient flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all hover:scale-[1.01]">
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-blue-600 rounded-2xl text-white mb-6 shadow-lg shadow-blue-200">
            <Wallet size={40} />
          </div>
          
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">FinVision</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Take full control of your financial future. Track transactions, predict cash flow, and achieve your goals with AI-powered clarity.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-white border-2 border-slate-100 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-200 transition-all shadow-sm"
            >
              <img 
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                alt="Google logo" 
                className="w-5 h-5"
              />
              <span>Continue with Google</span>
            </button>

            <button
              onClick={handleGuestLogin}
              className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition-all shadow-sm"
            >
              <User className="w-5 h-5 text-slate-500" />
              <span>Continue as Guest</span>
            </button>
            
            <p className="text-xs text-slate-400 mt-6">
              By signing in, you agree to secure your data with Google Authentication. Guest data is saved locally to your browser session.
            </p>
          </div>
        </div>
        
        <div className="bg-slate-50 p-6 border-t border-slate-100">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-slate-900 font-bold text-sm">Secure</p>
              <p className="text-slate-400 text-xs">Cloud Sync</p>
            </div>
            <div className="border-x border-slate-200">
              <p className="text-slate-900 font-bold text-sm">Smart</p>
              <p className="text-slate-400 text-xs">AI Insight</p>
            </div>
            <div>
              <p className="text-slate-900 font-bold text-sm">Visual</p>
              <p className="text-slate-400 text-xs">Projections</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;