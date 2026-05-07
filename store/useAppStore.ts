import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { ToastMessage } from '../components/Toast';

interface AppState {
  toasts: ToastMessage[];
  addToast: (message: string, type: 'success' | 'error' | 'info', action?: { label: string, onClick: () => void }) => void;
  removeToast: (id: string) => void;
  
  showReconciliationModal: boolean;
  setShowReconciliationModal: (show: boolean) => void;
  
  selectedMonthDate: Date;
  setSelectedMonthDate: (date: Date) => void;
  
  authError: string | null;
  setAuthError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  toasts: [],
  addToast: (message, type, action) => set((state) => ({
    toasts: [...state.toasts, { id: uuidv4(), message, type, action }]
  })),
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter(t => t.id !== id)
  })),
  
  showReconciliationModal: false,
  setShowReconciliationModal: (show) => set({ showReconciliationModal: show }),
  
  selectedMonthDate: new Date(),
  setSelectedMonthDate: (date) => set({ selectedMonthDate: date }),
  
  authError: null,
  setAuthError: (error) => set({ authError: error }),
}));
