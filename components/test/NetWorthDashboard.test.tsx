import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NetWorthDashboard from '../NetWorthDashboard';
import { Asset, AssetType, Debt } from '../../types';

// Mock Recharts
vi.mock('recharts', () => {
  const OriginalModule = vi.importActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: any) => <div style={{ width: 800, height: 600 }}>{children}</div>,
    ComposedChart: () => <div>MockChart</div>,
    Area: () => <div>MockArea</div>,
    XAxis: () => <div>MockXAxis</div>,
    YAxis: () => <div>MockYAxis</div>,
    CartesianGrid: () => <div>MockGrid</div>,
    Tooltip: () => <div>MockTooltip</div>,
    Legend: () => <div>MockLegend</div>,
    ReferenceLine: () => <div>MockRefLine</div>,
  };
});

describe('NetWorthDashboard', () => {
  const mockAssets: Asset[] = [
    { id: '1', name: 'House', value: 300000, type: AssetType.PROPERTY, liquidity: 'LOW' },
    { id: '2', name: 'Stocks', value: 50000, type: AssetType.INVESTMENT, liquidity: 'HIGH' }
  ];

  const mockDebts: Debt[] = [
    { id: 'd1', name: 'Mortgage', currentBalance: 200000, interestRate: 3.5, minimumPayment: 1000 }
  ];

  const mockTimelineData: any[] = [
    { date: '2026-01-01', historicalBalance: 5000, projectedBalance: null }
  ];

  const mockOnAddAsset = vi.fn();
  const mockOnUpdateAsset = vi.fn();
  const mockOnDeleteAsset = vi.fn();

  const defaultProps = {
    assets: mockAssets,
    debts: mockDebts,
    currentBalance: 5000,
    timelineData: mockTimelineData,
    onAddAsset: mockOnAddAsset,
    onUpdateAsset: mockOnUpdateAsset,
    onDeleteAsset: mockOnDeleteAsset
  };

  it('renders Net Worth summary correctly', () => {
    render(<NetWorthDashboard {...defaultProps} />);

    // Total Assets = 300k + 50k + 5k (Cash) = 355k
    // Total Liabilities = 200k
    // Net Worth = 155k

    expect(screen.getByText('Total Assets')).toBeInTheDocument();
    expect(screen.getByText(/€355,000/)).toBeInTheDocument();

    expect(screen.getByText('Total Liabilities')).toBeInTheDocument();
    const liabilitiesAmounts = screen.getAllByText(/€200,000/);
    expect(liabilitiesAmounts.length).toBeGreaterThanOrEqual(1);

    expect(screen.getByText('Net Worth')).toBeInTheDocument();
    expect(screen.getByText(/€155,000/)).toBeInTheDocument();
  });

  it('renders asset list correctly', () => {
    render(<NetWorthDashboard {...defaultProps} />);
    expect(screen.getByText('House')).toBeInTheDocument();
    expect(screen.getByText('Stocks')).toBeInTheDocument();
    expect(screen.getByText('Operating Cash')).toBeInTheDocument();
  });

  it('allows adding a new asset', async () => {
    render(<NetWorthDashboard {...defaultProps} />);

    fireEvent.click(screen.getByText('Add Asset'));

    // Check if form appears
    const nameInput = screen.getByPlaceholderText('New Asset Name');
    expect(nameInput).toBeInTheDocument();

    fireEvent.change(nameInput, { target: { value: 'Car' } });
    fireEvent.change(screen.getByPlaceholderText('Value'), { target: { value: '15000' } });

    const saveButton = screen.getByTitle('Save');
    fireEvent.click(saveButton);

    expect(mockOnAddAsset).toHaveBeenCalledTimes(1);
    expect(mockOnAddAsset).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Car',
      value: 15000
    }));
  });

  it('allows deleting an asset', () => {
    render(<NetWorthDashboard {...defaultProps} />);

    const deleteButtons = screen.getAllByLabelText('Delete Asset');
    fireEvent.click(deleteButtons[0]);

    expect(mockOnDeleteAsset).toHaveBeenCalledTimes(1);
    expect(mockOnDeleteAsset).toHaveBeenCalledWith('1');
  });
});
