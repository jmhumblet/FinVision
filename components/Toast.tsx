import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  message: string;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  return (
    <div className={`
      flex items-center w-full max-w-sm p-4 mb-4 text-gray-500 bg-white rounded-lg shadow-lg border border-slate-100 animate-slide-in-right
    `}>
      <div className={`
        inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg
        ${toast.type === 'success' ? 'text-green-500 bg-green-100' : 'text-red-500 bg-red-100'}
      `}>
        {toast.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
      </div>
      <div className="ml-3 text-sm font-normal text-slate-800">{toast.message}</div>
      <button 
        onClick={() => onClose(toast.id)}
        className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 items-center justify-center"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;