import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    // If there's an action, maybe don't auto-close or keep it longer
    const duration = toast.action ? 8000 : 5000;
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, duration);
    return () => clearTimeout(timer);
  }, [toast.id, onClose, toast.action]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <CheckCircle size={20} className="text-green-500" />;
      case 'error': return <XCircle size={20} className="text-red-500" />;
      case 'info': return <Info size={20} className="text-blue-500" />;
    }
  };

  const getBg = () => {
    switch (toast.type) {
      case 'success': return 'bg-green-50 border-green-100';
      case 'error': return 'bg-red-50 border-red-100';
      case 'info': return 'bg-blue-50 border-blue-100';
    }
  };

  return (
    <div className={`
      flex items-center w-full max-w-sm p-4 mb-4 text-gray-500 bg-white rounded-lg shadow-lg border border-slate-100 animate-slide-in-right
    `}>
      <div className={`
        inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg
        ${toast.type === 'success' ? 'bg-green-100' : toast.type === 'error' ? 'bg-red-100' : 'bg-blue-100'}
      `}>
        {getIcon()}
      </div>
      <div className="ml-3 flex-1">
        <div className="text-sm font-normal text-slate-800">{toast.message}</div>
        {toast.action && (
          <button 
            onClick={() => {
              toast.action?.onClick();
              onClose(toast.id);
            }}
            className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button 
        onClick={() => onClose(toast.id)}
        className="ml-auto -mx-1.5 -my-1.5 bg-transparent text-gray-400 hover:text-gray-900 rounded-lg p-1.5 inline-flex h-8 w-8 items-center justify-center"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;