import React, { useState, useMemo } from 'react';
import { Debt, DebtStrategy } from '../types';
import DebtList from './DebtList';
import DebtStrategyToggle from './DebtStrategyToggle';
import DebtPayoffChart from './DebtPayoffChart';
import { calculatePayoff } from '../utils/debtUtils';
import { v4 as uuidv4 } from 'uuid';

interface DebtDashboardProps {
  debts: Debt[];
  onAddDebt: (debt: Debt) => void;
  onUpdateDebt: (debt: Debt) => void;
  onDeleteDebt: (id: string) => void;
  strategy: DebtStrategy;
  onStrategyChange: (s: DebtStrategy) => void;
  monthlyExtra: number;
  onMonthlyExtraChange: (val: number) => void;
}

const DebtDashboard: React.FC<DebtDashboardProps> = ({
  debts,
  onAddDebt,
  onUpdateDebt,
  onDeleteDebt,
  strategy,
  onStrategyChange,
  monthlyExtra,
  onMonthlyExtraChange
}) => {
  const payoffSummary = useMemo(() => {
    return calculatePayoff(debts, strategy, monthlyExtra);
  }, [debts, strategy, monthlyExtra]);

  const handleAddDebt = () => {
    const newDebt: Debt = {
      id: uuidv4(),
      name: 'New Debt',
      currentBalance: 0,
      interestRate: 0,
      minimumPayment: 0
    };
    onAddDebt(newDebt);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
       {/* Left Column: Strategy & Chart */}
       <div className="space-y-6">
          <DebtStrategyToggle
             strategy={strategy}
             onChange={onStrategyChange}
             monthlyExtra={monthlyExtra}
             onMonthlyExtraChange={onMonthlyExtraChange}
          />
          <DebtPayoffChart summary={payoffSummary} />
       </div>

       {/* Right Column: Debt List */}
       <div className="space-y-6">
          <DebtList
             debts={debts}
             onAddDebt={handleAddDebt}
             onUpdateDebt={onUpdateDebt}
             onDeleteDebt={onDeleteDebt}
          />
       </div>
    </div>
  );
};

export default DebtDashboard;
