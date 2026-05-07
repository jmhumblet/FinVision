import * as RealService from './firebaseService.impl';
import * as MockService from './mockFirebaseService.impl';
import { Transaction, Projection, MonthlySetup, Debt, SavingsGoal, Asset } from '../types';
import { User } from 'firebase/auth';

const useMock = import.meta.env.VITE_USE_MOCK_API === 'true';

// Proxy functions
export const auth = useMock ? MockService.auth : RealService.auth;
export const db = useMock ? (MockService as any).db : RealService.db; // Mock might not export db

export const signInWithGoogle = useMock ? MockService.signInWithGoogle : RealService.signInWithGoogle;
export const signInGuest = useMock ? MockService.signInGuest : RealService.signInGuest;
export const logout = useMock ? MockService.logout : RealService.logout;
export const observeAuth = useMock ? MockService.observeAuth : RealService.observeAuth;

export const fetchUserData = async (uid: string) => {
  return useMock ? MockService.fetchUserData(uid) : RealService.fetchUserData(uid);
};

export const loadMoreTransactions = async (uid: string, olderThanDate: string) => {
  return useMock ? MockService.loadMoreTransactions(uid, olderThanDate) : RealService.loadMoreTransactions(uid, olderThanDate);
};

export const deleteRemoteTransaction = async (uid: string, txId: string) => {
  return useMock ? MockService.deleteRemoteTransaction(uid, txId) : RealService.deleteRemoteTransaction(uid, txId);
};

export const deleteRemoteProjection = async (uid: string, projId: string) => {
  return useMock ? MockService.deleteRemoteProjection(uid, projId) : RealService.deleteRemoteProjection(uid, projId);
};

export const updateRemoteTransaction = async (uid: string, tx: Transaction) => {
  return useMock ? MockService.updateRemoteTransaction(uid, tx) : RealService.updateRemoteTransaction(uid, tx);
};

export const updateRemoteProjection = async (uid: string, p: Projection) => {
  return useMock ? MockService.updateRemoteProjection(uid, p) : RealService.updateRemoteProjection(uid, p);
};

export const updateRemoteSettings = async (uid: string, settings: any) => {
  return useMock ? MockService.updateRemoteSettings(uid, settings) : RealService.updateRemoteSettings(uid, settings);
};

export const saveMonthlySetup = async (uid: string, setup: MonthlySetup) => {
  return useMock ? MockService.saveMonthlySetup(uid, setup) : RealService.saveMonthlySetup(uid, setup);
};

export const getMonthlySetup = async (uid: string, monthKey: string) => {
  return useMock ? MockService.getMonthlySetup(uid, monthKey) : RealService.getMonthlySetup(uid, monthKey);
};

// --- Debt Functions ---

export const updateRemoteDebt = async (uid: string, debt: Debt) => {
  return useMock ? MockService.updateRemoteDebt(uid, debt) : RealService.updateRemoteDebt(uid, debt);
};

export const deleteRemoteDebt = async (uid: string, debtId: string) => {
  return useMock ? MockService.deleteRemoteDebt(uid, debtId) : RealService.deleteRemoteDebt(uid, debtId);
};

// --- Smart Savings Functions ---

export const updateRemoteSavingsGoal = async (uid: string, goal: SavingsGoal) => {
  return useMock ? MockService.updateRemoteSavingsGoal(uid, goal) : RealService.updateRemoteSavingsGoal(uid, goal);
};

export const deleteRemoteSavingsGoal = async (uid: string, goalId: string) => {
  return useMock ? MockService.deleteRemoteSavingsGoal(uid, goalId) : RealService.deleteRemoteSavingsGoal(uid, goalId);
};

// --- Asset Functions ---

export const updateRemoteAsset = async (uid: string, asset: Asset) => {
  return useMock ? MockService.updateRemoteAsset(uid, asset) : RealService.updateRemoteAsset(uid, asset);
};

export const deleteRemoteAsset = async (uid: string, assetId: string) => {
  return useMock ? MockService.deleteRemoteAsset(uid, assetId) : RealService.deleteRemoteAsset(uid, assetId);
};

export const clearAllUserData = async (uid: string) => {
  return useMock ? MockService.clearAllUserData(uid) : RealService.clearAllUserData(uid);
};
