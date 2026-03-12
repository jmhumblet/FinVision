import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MarketTrendsDashboard from '../components/MarketTrendsDashboard';
import * as marketService from '../services/marketService';

// Mock the services to not delay testing and ensure deterministic output
vi.mock('../services/marketService', () => ({
  fetchMarketIndices: vi.fn(),
  fetchMarketNews: vi.fn(),
  generateMarketInsight: vi.fn()
}));

describe('MarketTrendsDashboard', () => {
  it('renders market indices, news, and insights correctly', async () => {
    // Setup mock return values
    const mockIndices = [
      { name: 'S&P 500', value: 5000, changePercent: 1.5 }
    ];
    const mockNews = [
      {
        id: '1',
        title: 'Mock News Title',
        source: 'Mock Source',
        url: 'http://example.com',
        publishedAt: new Date('2024-01-01T12:00:00Z').toISOString()
      }
    ];
    const mockInsight = 'Mock AI insight text generated based on balance.';

    (marketService.fetchMarketIndices as any).mockResolvedValue(mockIndices);
    (marketService.fetchMarketNews as any).mockResolvedValue(mockNews);
    (marketService.generateMarketInsight as any).mockResolvedValue(mockInsight);

    render(<MarketTrendsDashboard currentBalance={1000} projectedFinalBalance={1500} />);

    // Initially loading states
    expect(screen.getByText(/Analyzing market impact/i)).toBeInTheDocument();

    // Wait for the data to load and be displayed
    await waitFor(() => {
      expect(screen.getByText('S&P 500')).toBeInTheDocument();
      expect(screen.getByText('5,000.00')).toBeInTheDocument();
      expect(screen.getByText('+1.50%')).toBeInTheDocument();

      expect(screen.getByText('Mock News Title')).toBeInTheDocument();
      expect(screen.getByText('Mock Source')).toBeInTheDocument();

      expect(screen.getByText('Mock AI insight text generated based on balance.')).toBeInTheDocument();
    });
  });
});
