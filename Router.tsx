import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { useUserData, useMutations } from './queries/useUserData';
import { auth } from './services/firebaseService';
import AuthScreen from './components/AuthScreen';

// Pages
import DashboardPage from './pages/DashboardPage';
import MonthlyPage from './pages/MonthlyPage';
import DebtPage from './pages/DebtPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import SmartSavingsPage from './pages/SmartSavingsPage';
import BillCalendarPage from './pages/BillCalendarPage';
import NetWorthPage from './pages/NetWorthPage';
import FinancialHealthPage from './pages/FinancialHealthPage';
import DataViewerPage from './pages/DataViewerPage';
import { useAppStore } from './store/useAppStore';

export const Router: React.FC = () => {
  const user = useAppStore(state => state.user);

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/monthly" element={<MonthlyPage />} />
        <Route path="/debt" element={<DebtPage />} />
        <Route path="/subscriptions" element={<SubscriptionsPage />} />
        <Route path="/savings" element={<SmartSavingsPage />} />
        <Route path="/calendar" element={<BillCalendarPage />} />
        <Route path="/net-worth" element={<NetWorthPage />} />
        <Route path="/health" element={<FinancialHealthPage />} />
        <Route path="/data" element={<DataViewerPage />} />
      </Route>
    </Routes>
  );
};
