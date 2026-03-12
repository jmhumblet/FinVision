export interface MarketIndex {
  name: string;
  value: number;
  changePercent: number;
}

export interface MarketNews {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
}

export const fetchMarketIndices = async (): Promise<MarketIndex[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return [
    { name: 'S&P 500', value: 5088.80, changePercent: 0.85 },
    { name: 'NASDAQ', value: 15996.82, changePercent: 1.14 },
    { name: 'Dow Jones', value: 39131.53, changePercent: 0.16 },
    { name: 'Russell 2000', value: 2016.69, changePercent: 0.14 }
  ];
};

export const fetchMarketNews = async (): Promise<MarketNews[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));

  return [
    {
      id: '1',
      title: 'Federal Reserve Signals Potential Rate Cuts Later This Year',
      source: 'Financial Times',
      url: '#',
      publishedAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '2',
      title: 'Tech Stocks Rally on AI Optimism and Earnings Beats',
      source: 'Wall Street Journal',
      url: '#',
      publishedAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: '3',
      title: 'Inflation Cools Slightly, Beating Analyst Expectations',
      source: 'Bloomberg',
      url: '#',
      publishedAt: new Date(Date.now() - 14400000).toISOString()
    }
  ];
};

export const generateMarketInsight = async (currentBalance: number, projectedFinalBalance: number): Promise<string> => {
  // Simulate AI generation delay
  await new Promise(resolve => setTimeout(resolve, 1200));

  const trend = projectedFinalBalance > currentBalance ? 'growing' : 'shrinking';
  const buffer = currentBalance > 5000 ? 'healthy' : 'tight';

  return `Based on current global trends, including easing inflation and anticipated interest rate cuts, your ${buffer} cash position allows for some flexibility. With your projected balance ${trend} over the next period, consider directing any surplus towards high-yield savings or investments to capitalize on compounding returns before rate cuts take effect.`;
};
