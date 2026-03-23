import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CashFlowAlerts from '../components/CashFlowAlerts';
import { DailyBalance } from '../types';

describe('CashFlowAlerts', () => {
  const baseDate = new Date('2024-05-15T00:00:00');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(baseDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders nothing when timelineData is empty', () => {
    const { container } = render(<CashFlowAlerts timelineData={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when there is no projected or historical overdraft in the next 30 days', () => {
    const timelineData: DailyBalance[] = [
      { date: '2024-05-15', historicalBalance: 100, projectedBalance: 100, isProjected: false },
      { date: '2024-05-20', historicalBalance: null, projectedBalance: 200, isProjected: true },
      { date: '2024-06-10', historicalBalance: null, projectedBalance: 300, isProjected: true }
    ];

    const { container } = render(<CashFlowAlerts timelineData={timelineData} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders an urgent alert when overdraft is within 7 days', () => {
    const timelineData: DailyBalance[] = [
      { date: '2024-05-15', historicalBalance: 100, projectedBalance: 100, isProjected: false },
      { date: '2024-05-20', historicalBalance: null, projectedBalance: -50, isProjected: true }, // 5 days away
      { date: '2024-06-10', historicalBalance: null, projectedBalance: -100, isProjected: true }
    ];

    render(<CashFlowAlerts timelineData={timelineData} />);

    expect(screen.getByText(/Cash Flow Alert/)).toBeInTheDocument();
    expect(screen.getByText(/Urgent/i)).toBeInTheDocument();
    expect(screen.getByText(/20 May 2024/i)).toBeInTheDocument();
    expect(screen.getByText(/Projected Deficit:/i)).toHaveTextContent('€50');
  });

  it('renders a warning alert when overdraft is more than 7 days but within 30 days', () => {
    const timelineData: DailyBalance[] = [
      { date: '2024-05-15', historicalBalance: 100, projectedBalance: 100, isProjected: false },
      { date: '2024-05-25', historicalBalance: null, projectedBalance: -75, isProjected: true }, // 10 days away
    ];

    render(<CashFlowAlerts timelineData={timelineData} />);

    expect(screen.getByText(/Cash Flow Alert/)).toBeInTheDocument();
    expect(screen.queryByText(/Urgent/i)).not.toBeInTheDocument();
    expect(screen.getByText(/25 May 2024/i)).toBeInTheDocument();
    expect(screen.getByText(/Projected Deficit:/i)).toHaveTextContent('€75');
  });

  it('renders nothing if the overdraft is more than 30 days away', () => {
    const timelineData: DailyBalance[] = [
      { date: '2024-05-15', historicalBalance: 100, projectedBalance: 100, isProjected: false },
      { date: '2024-06-20', historicalBalance: null, projectedBalance: -100, isProjected: true } // 36 days away
    ];

    const { container } = render(<CashFlowAlerts timelineData={timelineData} />);
    expect(container.firstChild).toBeNull();
  });

  it('checks historicalBalance if projectedBalance is null', () => {
    // This could happen on the split point or if only historical is provided
    const timelineData: DailyBalance[] = [
      { date: '2024-05-15', historicalBalance: -25, projectedBalance: null, isProjected: false } // Today
    ];

    render(<CashFlowAlerts timelineData={timelineData} />);

    expect(screen.getByText(/Cash Flow Alert/)).toBeInTheDocument();
    expect(screen.getByText(/15 May 2024/i)).toBeInTheDocument();
    expect(screen.getByText(/Projected Deficit:/i)).toHaveTextContent('€25');
  });

  it('handles plural vs singular for days', () => {
     const timelineData: DailyBalance[] = [
      { date: '2024-05-15', historicalBalance: 100, projectedBalance: 100, isProjected: false },
      { date: '2024-05-16', historicalBalance: null, projectedBalance: -10, isProjected: true }, // 1 day away
    ];

    render(<CashFlowAlerts timelineData={timelineData} />);
    expect(screen.getByText(/\(in 1 day\)/)).toBeInTheDocument();
  });
});
