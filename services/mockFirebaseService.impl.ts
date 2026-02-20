import { Transaction, Projection, MonthlySetup, Debt } from '../types';
import { mockUser, mockTransactions, mockProjections, mockSettings } from '../e2e/fixtures/mockData';

// Mock Firestore
export const db = {};

// In-memory state for the mock service with localStorage persistence

const getStored = (key: string, fallback: any) => {

  if (typeof localStorage === 'undefined') return fallback;

  const val = localStorage.getItem(`mock_${key}`);

  return val ? JSON.parse(val) : fallback;

};



const setStored = (key: string, val: any) => {

  if (typeof localStorage !== 'undefined') {

    localStorage.setItem(`mock_${key}`, JSON.stringify(val));

  }

};



let currentTransactions = getStored('transactions', [...mockTransactions]);

let currentProjections = getStored('projections', [...mockProjections]);

let currentSettings = getStored('settings', { ...mockSettings });

let currentMonthlySetups = getStored('monthlySetups', {});

let currentDebts = getStored('debts', []);

let currentUser = getStored('user', null);



const authListeners: Array<(user: any) => void> = [];



const notifyAuthListeners = () => {

  setStored('user', currentUser);

  authListeners.forEach(cb => cb(currentUser));

};



// Mock Auth

export const auth = {

  get currentUser() { return currentUser; },

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

    debts: currentDebts,

    optimized: true

  };

};



export const loadMoreTransactions = async (uid: string, olderThanDate: string) => {

  return [];

};



export const deleteRemoteTransaction = async (uid: string, txId: string) => {

  currentTransactions = currentTransactions.filter((t: any) => t.id !== txId);

  setStored('transactions', currentTransactions);

};



export const deleteRemoteProjection = async (uid: string, projId: string) => {

  currentProjections = currentProjections.filter((p: any) => p.id !== projId);

  setStored('projections', currentProjections);

};



export const updateRemoteTransaction = async (uid: string, tx: Transaction) => {

  const index = currentTransactions.findIndex((t: any) => t.id === tx.id);

  if (index > -1) {

    currentTransactions[index] = tx;

  } else {

    currentTransactions.push(tx);

  }

  setStored('transactions', currentTransactions);

};



export const updateRemoteProjection = async (uid: string, p: Projection) => {

  const index = currentProjections.findIndex((proj: any) => proj.id === p.id);

  if (index > -1) {

    currentProjections[index] = p;

  } else {

    currentProjections.push(p);

  }

  setStored('projections', currentProjections);

};



export const updateRemoteSettings = async (uid: string, settings: any) => {

  currentSettings = { ...currentSettings, ...settings };

  setStored('settings', currentSettings);

};



export const saveMonthlySetup = async (uid: string, setup: MonthlySetup) => {

  currentMonthlySetups[setup.monthKey] = setup;

  setStored('monthlySetups', currentMonthlySetups);

};



export const getMonthlySetup = async (uid: string, monthKey: string): Promise<MonthlySetup | null> => {

  return currentMonthlySetups[monthKey] || null;

};

export const updateRemoteDebt = async (uid: string, debt: Debt) => {
  const index = currentDebts.findIndex((d: any) => d.id === debt.id);
  if (index > -1) {
    currentDebts[index] = debt;
  } else {
    currentDebts.push(debt);
  }
  setStored('debts', currentDebts);
};

export const deleteRemoteDebt = async (uid: string, debtId: string) => {
  currentDebts = currentDebts.filter((d: any) => d.id !== debtId);
  setStored('debts', currentDebts);
};

// Helper to reset state for tests (exposed to window for Playwright)

if (typeof window !== 'undefined') {

  (window as any).__resetMockData = () => {

    localStorage.clear();

    currentTransactions = [...mockTransactions];

    currentProjections = [...mockProjections];

    currentSettings = { ...mockSettings };

    currentMonthlySetups = {};

    currentDebts = [];

    currentUser = null;

    notifyAuthListeners();

  };

}
