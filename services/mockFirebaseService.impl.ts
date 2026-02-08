import { Transaction, Projection } from '../types';
import { mockUser, mockTransactions, mockProjections, mockSettings } from '../e2e/fixtures/mockData';

// Mock Firestore
export const db = {};

// In-memory state for the mock service
let currentTransactions = [...mockTransactions];
let currentProjections = [...mockProjections];
let currentSettings = { ...mockSettings };
let currentUser = null;

const authListeners: Array<(user: any) => void> = [];

const notifyAuthListeners = () => {
  authListeners.forEach(cb => cb(currentUser));
};

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

export const observeAuth = (callback: (user: any) => void) => {
  authListeners.push(callback);
  callback(currentUser); // Immediate call
  return () => {
    const idx = authListeners.indexOf(callback);
    if (idx > -1) authListeners.splice(idx, 1);
  };
};

// Data Operations
export const fetchUserData = async (uid: string) => {
  console.log('MOCK fetchUserData called for', uid);
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