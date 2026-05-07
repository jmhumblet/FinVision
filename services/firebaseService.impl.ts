import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInAnonymously, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  deleteDoc, 
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore/lite';
import { Transaction, Projection, MonthlyCheckpoint, TransactionType, MonthlySetup, Debt, SavingsGoal, Asset } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyCOnTNxkj1f7VHlp6ppXdYbzsCi_9tCtWk",
  authDomain: "finvision-84e90.firebaseapp.com",
  projectId: "finvision-84e90",
  storageBucket: "finvision-84e90.firebasestorage.app",
  messagingSenderId: "974792551265",
  appId: "1:974792551265:web:0fe9964dcece2267777320",
  measurementId: "G-FMN39834BK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
// Use Firestore
export const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {  
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error("Firebase Auth Error:", error);
    throw error;
  }
};

export const signInGuest = async () => {
  try {
    return await signInAnonymously(auth);
  } catch (error) {
    console.error("Firebase Guest Auth Error:", error);
    throw error;
  }
};

export const logout = () => signOut(auth);

// Wrapper for onAuthStateChanged to allow mocking
export const observeAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Helper to calculate monthly checkpoints from all transactions
// In a production app, this would be a Cloud Function.
// Here we run it on Save to keep data optimized.
const calculateCheckpoints = (transactions: Transaction[], initialBalance: number): MonthlyCheckpoint[] => {
  const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const checkpoints: MonthlyCheckpoint[] = [];
  
  if (sorted.length === 0) return [];

  let runningBalance = initialBalance;
  
  // Group by month
  const txByMonth = new Map<string, Transaction[]>();
  sorted.forEach(tx => {
    const monthKey = tx.date.substring(0, 7); // YYYY-MM
    if (!txByMonth.has(monthKey)) txByMonth.set(monthKey, []);
    txByMonth.get(monthKey)!.push(tx);
  });

  // Iterate chronologically through months found
  const months = Array.from(txByMonth.keys()).sort();
  
  // We need to calculate cumulative balance up to the start of each month
  // But actually, we just need to know the end balance of each month to serve as start for next
  
  // However, simpler logic for the "Optimization" request:
  // We just save the End Balance of every month.
  
  months.forEach(month => {
    const txs = txByMonth.get(month)!;
    const startBalance = runningBalance;
    
    txs.forEach(tx => {
        const val = tx.type === TransactionType.INCOME ? tx.amount : -tx.amount;
        runningBalance += val;
    });

    checkpoints.push({
        monthKey: month,
        startBalance: startBalance,
        endBalance: runningBalance
    });
  });

  return checkpoints;
};

export const saveUserData = async (
  uid: string, 
  data: { 
    initialBalance: number; 
    projectionDays: number;
    transactions: Transaction[];
    projections: Projection[];
  }
) => {
  const userDocRef = doc(db, 'users', uid);
  
  // 1. Save Settings
  await setDoc(userDocRef, {
    initialBalance: data.initialBalance, // Base initial balance (t0)
    projectionDays: data.projectionDays,
    lastUpdated: new Date().toISOString()
  }, { merge: true });

  // 2. Save Transactions (Batch simulation)
  const txCollection = collection(db, 'users', uid, 'transactions');
  const txPromises = data.transactions.map(tx => {
    const d = doc(txCollection, tx.id);
    return setDoc(d, tx);
  });
  
  // 3. Save Projections
  const projCollection = collection(db, 'users', uid, 'projections');
  const projPromises = data.projections.map(p => {
    const d = doc(projCollection, p.id);
    return setDoc(d, p);
  });

  // 4. Optimization: Calculate and Save Monthly Checkpoints
  // This allows us to load just one month later without re-summing everything.
  const checkpoints = calculateCheckpoints(data.transactions, data.initialBalance);
  const cpCollection = collection(db, 'users', uid, 'checkpoints');
  const cpPromises = checkpoints.map(cp => {
      const d = doc(cpCollection, cp.monthKey);
      return setDoc(d, cp);
  });

  await Promise.all([...txPromises, ...projPromises, ...cpPromises]);
};

// Optimized Fetch
export const fetchUserData = async (uid: string) => {
  const userDocRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userDocRef);
  const userData = userDoc.exists() ? userDoc.data() : {};
  const baseInitialBalance = userData.initialBalance || 0;

  // OPTIMIZATION:
  // Instead of fetching ALL transactions, we want to fetch:
  // 1. Transactions from the last 2 months (Current & Previous) so the user sees immediate history.
  // 2. The Checkpoint for the START of the previous month.
  
  // Define "Load Window"
  const today = new Date();
  const currentMonthKey = today.toISOString().substring(0, 7); // YYYY-MM
  
  // Previous Month
  const prevDate = new Date(today);
  prevDate.setMonth(prevDate.getMonth() - 1);
  const prevMonthKey = prevDate.toISOString().substring(0, 7);

  // 1. Fetch Transactions for this window (Date >= prevMonthKey-01)
  const startOfWindow = `${prevMonthKey}-01`;
  
  const txQuery = query(
      collection(db, 'users', uid, 'transactions'),
      where('date', '>=', startOfWindow)
  );
  const txDocs = await getDocs(txQuery);
  const transactions = txDocs.docs.map(d => d.data() as Transaction);

  // Fetch Debts
  const debtQuery = query(collection(db, 'users', uid, 'debts'));
  const debtDocs = await getDocs(debtQuery);
  const debts = debtDocs.docs.map(d => d.data() as Debt);

  // Fetch Savings Goals
  const savingsQuery = query(collection(db, 'users', uid, 'savingsGoals'));
  const savingsDocs = await getDocs(savingsQuery);
  const savingsGoals = savingsDocs.docs.map(d => d.data() as SavingsGoal);

  // Fetch Assets
  const assetsQuery = query(collection(db, 'users', uid, 'assets'));
  const assetsDocs = await getDocs(assetsQuery);
  const assets = assetsDocs.docs.map(d => d.data() as Asset);

  // 2. Fetch Checkpoint for prevMonthKey
  // This checkpoint contains the startBalance and endBalance for that month.
  // We actually need the checkpoint of the month BEFORE the window to get the starting balance.
  // i.e. If window starts Oct 1, we need Sep's End Balance (or Oct's Start Balance if stored that way).
  // Our logic stored: { monthKey: '2023-10', startBalance, endBalance }
  // So fetching '2023-10' checkpoint gives us the startBalance for Oct 1.
  
  const cpDocRef = doc(db, 'users', uid, 'checkpoints', prevMonthKey);
  const cpDoc = await getDoc(cpDocRef);
  
  let calculatedInitialBalance = baseInitialBalance;

  if (cpDoc.exists()) {
      const cp = cpDoc.data() as MonthlyCheckpoint;
      // The startBalance in the checkpoint is the accumulated balance at the beginning of that month
      calculatedInitialBalance = cp.startBalance;
  } else {
      // If no checkpoint found (maybe gap in data or first load), we might need to fallback to full load
      // For this demo, we'll assume if no checkpoint, we are at the beginning or data is sparse.
      // To be safe for the user during this transition phase: 
      // IF transactions returned is small, maybe fetch all? 
      // For now, let's trigger a full fetch if the optimized fetch seems weird, 
      // OR just rely on the fact that saveUserData will eventually heal this.
      
      // FALLBACK: If we have transactions but no checkpoint, we can't calculate correct balance.
      // So we must fetch all.
      if (transactions.length > 0) {
          const allTxQuery = query(collection(db, 'users', uid, 'transactions'));
          const allDocs = await getDocs(allTxQuery);
          const allTxs = allDocs.docs.map(d => d.data() as Transaction);
          
          const projQuery = query(collection(db, 'users', uid, 'projections'));
          const projDocs = await getDocs(projQuery);
          const projections = projDocs.docs.map(d => d.data() as Projection);

          return {
              settings: userData,
              transactions: allTxs,
              projections,
              debts,
              savingsGoals,
              assets,
              optimized: false
          };
      }
  }

  // Fetch Projections (Always fetch all active ones, usually small dataset)
  const projQuery = query(collection(db, 'users', uid, 'projections'));
  const projDocs = await getDocs(projQuery);
  const projections = projDocs.docs.map(d => d.data() as Projection);

  return {
    settings: { ...userData, initialBalance: calculatedInitialBalance }, // Override initial balance with the checkpoint
    transactions, // Only the window transactions
    projections,
    debts,
    savingsGoals,
    assets,
    optimized: true
  };
};

export const loadMoreTransactions = async (uid: string, olderThanDate: string) => {
    // This allows the user to scroll back.
    // Fetch transactions for the month prior to 'olderThanDate'
    const date = new Date(olderThanDate);
    date.setDate(0); // Go to last day of prev month
    const targetMonthKey = date.toISOString().substring(0, 7);
    const startDate = `${targetMonthKey}-01`;
    const endDate = olderThanDate; // Up to where we have data

    const q = query(
        collection(db, 'users', uid, 'transactions'),
        where('date', '>=', startDate),
        where('date', '<', endDate)
    );
    
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Transaction);
};

export const deleteRemoteTransaction = async (uid: string, txId: string) => {
  await deleteDoc(doc(db, 'users', uid, 'transactions', txId));
};

export const deleteRemoteProjection = async (uid: string, projId: string) => {
  await deleteDoc(doc(db, 'users', uid, 'projections', projId));
};

export const updateRemoteTransaction = async (uid: string, tx: Transaction) => {
  await setDoc(doc(db, 'users', uid, 'transactions', tx.id), tx);
};

export const updateRemoteProjection = async (uid: string, p: Projection) => {
  await setDoc(doc(db, 'users', uid, 'projections', p.id), p);
};

export const updateRemoteSettings = async (uid: string, settings: any) => {

  await setDoc(doc(db, 'users', uid), settings, { merge: true });

};

export const saveMonthlySetup = async (uid: string, setup: MonthlySetup) => {

  const setupDocRef = doc(db, 'users', uid, 'monthlySetups', setup.monthKey);

  await setDoc(setupDocRef, setup);

};

export const getMonthlySetup = async (uid: string, monthKey: string): Promise<MonthlySetup | null> => {

  const setupDocRef = doc(db, 'users', uid, 'monthlySetups', monthKey);

  const setupDoc = await getDoc(setupDocRef);

  return setupDoc.exists() ? setupDoc.data() as MonthlySetup : null;

};

export const updateRemoteDebt = async (uid: string, debt: Debt) => {
  await setDoc(doc(db, 'users', uid, 'debts', debt.id), debt);
};

export const deleteRemoteDebt = async (uid: string, debtId: string) => {
  await deleteDoc(doc(db, 'users', uid, 'debts', debtId));
};

export const updateRemoteSavingsGoal = async (uid: string, goal: SavingsGoal) => {
  await setDoc(doc(db, 'users', uid, 'savingsGoals', goal.id), goal);
};

export const deleteRemoteSavingsGoal = async (uid: string, goalId: string) => {
  await deleteDoc(doc(db, 'users', uid, 'savingsGoals', goalId));
};

export const updateRemoteAsset = async (uid: string, asset: Asset) => {
  await setDoc(doc(db, 'users', uid, 'assets', asset.id), asset);
};

export const deleteRemoteAsset = async (uid: string, assetId: string) => {
  await deleteDoc(doc(db, 'users', uid, 'assets', assetId));
};

export const clearAllUserData = async (uid: string) => {
  const collections = ['transactions', 'projections', 'checkpoints', 'monthlySetups', 'debts', 'savingsGoals', 'assets'];
  for (const col of collections) {
    const q = query(collection(db, 'users', uid, col));
    const docs = await getDocs(q);
    const deletePromises = docs.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletePromises);
  }
  // Reset user document settings
  await setDoc(doc(db, 'users', uid), {
    initialBalance: 0,
    projectionDays: 180,
    lastUpdated: new Date().toISOString()
  });
};
