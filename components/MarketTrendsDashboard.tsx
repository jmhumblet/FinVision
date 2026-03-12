import React, { useEffect, useState } from 'react';
import { LineChart, TrendingUp, TrendingDown, Newspaper, Sparkles, Loader2 } from 'lucide-react';
import {
  MarketIndex,
  MarketNews,
  fetchMarketIndices,
  fetchMarketNews,
  generateMarketInsight
} from '../services/marketService';

interface MarketTrendsDashboardProps {
  currentBalance: number;
  projectedFinalBalance: number;
}

const MarketTrendsDashboard: React.FC<MarketTrendsDashboardProps> = ({ currentBalance, projectedFinalBalance }) => {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [news, setNews] = useState<MarketNews[]>([]);
  const [insight, setInsight] = useState<string | null>(null);

  const [loadingIndices, setLoadingIndices] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingInsight, setLoadingInsight] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const [indicesData, newsData, insightData] = await Promise.all([
          fetchMarketIndices(),
          fetchMarketNews(),
          generateMarketInsight(currentBalance, projectedFinalBalance)
        ]);

        if (mounted) {
          setIndices(indicesData);
          setLoadingIndices(false);

          setNews(newsData);
          setLoadingNews(false);

          setInsight(insightData);
          setLoadingInsight(false);
        }
      } catch (error) {
        console.error("Failed to fetch market data:", error);
        if (mounted) {
          setLoadingIndices(false);
          setLoadingNews(false);
          setLoadingInsight(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [currentBalance, projectedFinalBalance]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 flex items-center">
             <LineChart className="mr-3 text-indigo-600" size={32} />
             Market Trends & Insights
           </h2>
           <p className="text-slate-500 text-sm mt-1">
             Stay informed about global markets and how they affect your personal cash flow.
           </p>
        </div>
      </div>

      {/* Market Indices Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loadingIndices ? (
          <div className="col-span-2 md:col-span-4 flex justify-center py-8">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : (
          indices.map((idx) => (
            <div key={idx.name} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{idx.name}</span>
              <span className="text-xl font-extrabold text-slate-900">{idx.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <div className={`mt-2 flex items-center text-xs font-bold ${idx.changePercent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {idx.changePercent >= 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                {idx.changePercent > 0 ? '+' : ''}{idx.changePercent.toFixed(2)}%
              </div>
            </div>
          ))
        )}
      </div>

      {/* AI Insight Section */}
      <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sparkles size={100} className="text-indigo-500" />
        </div>
        <h3 className="text-lg font-bold text-indigo-900 mb-2 flex items-center">
          <Sparkles className="mr-2 text-indigo-500" size={20} />
          AI Financial Insight
        </h3>
        {loadingInsight ? (
          <div className="flex items-center text-indigo-500">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            <span className="text-sm font-medium">Analyzing market impact on your projections...</span>
          </div>
        ) : (
          <p className="text-indigo-800 text-sm leading-relaxed relative z-10 font-medium">
            {insight}
          </p>
        )}
      </div>

      {/* News Feed */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
          <Newspaper className="mr-2 text-slate-400" size={20} />
          Curated Financial News
        </h3>

        {loadingNews ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {news.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-colors group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">{item.title}</h4>
                    <div className="flex items-center mt-2 text-xs font-medium text-slate-400">
                      <span className="bg-slate-100 px-2 py-1 rounded-md text-slate-500 mr-3">{item.source}</span>
                      {new Date(item.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default MarketTrendsDashboard;
