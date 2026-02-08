import { Transaction, Projection } from '../types';
import { mockUser, mockTransactions, mockProjections, mockSettings } from '../e2e/fixtures/mockData';

// In-memory state for the mock service
let currentTransactions = [...mockTransactions];
let currentProjections = [...mockProjections];
let currentSettings = { ...mockSettings };
let currentUser = null;

// Mock Auth
export const auth = {
  currentUser: null,
  onAuthStateChanged: (callback: (user: any) => void) => {
    callback(currentUser);
    return () => {}; // Unsubscribe
  }
};

export const signInWithGoogle = async () => {
  currentUser = mockUser;
  // Trigger auth listener manually if needed, or rely on app re-render
  // In a real app, onAuthStateChanged fires. Here we might need a simpler way.
  // For now, we assume the app checks auth status or we trigger the listener.
  // But since we can't easily trigger the exported auth.onAuthStateChanged from here if it's already bound,
  // we might need a simpler approach: reload the page or assume the test forces a state check.
  // actually, the real `onAuthStateChanged` is a listener. We need to implement a mini observer.
  notifyAuthListeners();
  return { user: currentUser };
};

export const signInGuest = async () => {
  currentUser = mockUser;
  notifyAuthListeners();
  return { user: currentUser };
};

export const logout = async () => {
  currentUser = null;
  notifyAuthListeners();
};

const authListeners: Array<(user: any) => void> = [];
// Override the export to allow subscription
import { onAuthStateChanged as firebaseOnAuthStateChanged } from 'firebase/auth'; // Just for type? No.

// We need to mimic the export `auth` object structure or the function usage.
// The real code uses `onAuthStateChanged(auth, callback)`.
// So we need to mock that *function* from firebase/auth if we can, 
// OR we mock the service that wraps it?
// `App.tsx` imports `auth` from this file, but `onAuthStateChanged` from `firebase/auth`.
// Ah! `App.tsx` imports:
// import { auth, ... } from './services/firebaseService';
// import { onAuthStateChanged, User } from 'firebase/auth';
// AND calls `onAuthStateChanged(auth, ...)`
// This makes mocking harder because `onAuthStateChanged` comes from the library, not our service file.

// CRITICAL FIX: We need to wrap `onAuthStateChanged` in our service to make it mockable via this alias method.
// OR we rely on `vite` to alias `firebase/auth` too? That's messy.

// Better approach: Refactor `App.tsx` to use a listener exported from `firebaseService`.
// This aligns with "Refactor" phase but enables the testing strategy.

// I will add `observeAuth` to `firebaseService.ts` and `mockFirebaseService.ts` and update `App.tsx`.

export const observeAuth = (callback: (user: any) => void) => {
  authListeners.push(callback);
  callback(currentUser); // Immediate call
  return () => {
    const idx = authListeners.indexOf(callback);
    if (idx > -1) authListeners.splice(idx, 1);
  };
};

const notifyAuthListeners = () => {
  authListeners.forEach(cb => cb(currentUser));
};

// Data Operations
export const fetchUserData = async (uid: string) => {
  return {
    settings: currentSettings,
    transactions: currentTransactions,
    projections: currentProjections,
    optimized: true
  };
};

export const loadMoreTransactions = async (uid: string, olderThanDate: string) => {
  return [];
};

export const deleteRemoteTransaction = async (uid: string, txId: string) => {
  currentTransactions = currentTransactions.filter(t => t.id !== txId);
};

export const deleteRemoteProjection = async (uid: string, projId: string) => {
  currentProjections = currentProjections.filter(p => p.id !== projId);
};

export const updateRemoteTransaction = async (uid: string, tx: Transaction) => {
  const index = currentTransactions.findIndex(t => t.id === tx.id);
  if (index > -1) {
    currentTransactions[index] = tx;
  } else {
    currentTransactions.push(tx);
  }
};

export const updateRemoteProjection = async (uid: string, p: Projection) => {
  const index = currentProjections.findIndex(proj => proj.id === p.id);
  if (index > -1) {
    currentProjections[index] = p;
  } else {
    currentProjections.push(p);
  }
};

export const updateRemoteSettings = async (uid: string, settings: any) => {
  currentSettings = { ...currentSettings, ...settings };
};

// Helper to reset state for tests (exposed to window for Playwright)
if (typeof window !== 'undefined') {
  (window as any).__resetMockData = () => {
    currentTransactions = [...mockTransactions];
    currentProjections = [...mockProjections];
    currentSettings = { ...mockSettings };
    currentUser = null;
    notifyAuthListeners();
  };
}
