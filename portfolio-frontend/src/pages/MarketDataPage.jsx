import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { getMarketData } from '../services/marketService';
import { useSocket } from '../hooks/useSocket';
import MarketChart from '../components/charts/MarketChart';
import Badge from '../components/ui/Badge';
import { SkeletonCard } from '../components/ui/LoadingSkeleton';

export default function MarketDataPage() {
  const { data: markets, loading } = useApi(getMarketData);
  const [liveData, setLiveData] = useState({});
  const [history, setHistory] = useState({});

  useSocket({
    market_update: ({ data }) => {
      setLiveData((prev) => ({ ...prev, ...data }));
      const time = new Date().toLocaleTimeString();
      setHistory((prev) => {
        const next = { ...prev };
        Object.entries(data).forEach(([key, val]) => {
          next[key] = [...(prev[key] || []).slice(-19), { time, price: val }];
        });
        return next;
      });
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Market Data</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse-slow inline-block" />
            Live WebSocket feed active
          </p>
        </div>
      </div>

      {/* Live index cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.keys(liveData).length === 0 ? (
          loading ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />) :
          <div className="card p-5 col-span-3 text-center text-slate-400 text-sm py-10">Waiting for live data...</div>
        ) : Object.entries(liveData).map(([key, val]) => (
          <div key={key} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-display font-bold text-slate-900 dark:text-white">{key}</span>
              <Badge label="LIVE" variant="success" />
            </div>
            <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {Number(val).toLocaleString()}
            </p>
            <div className="mt-3">
              <MarketChart data={history[key] || []} dataKey="price"
                color={key === 'GOLD' ? '#f59e0b' : key === 'SENSEX' ? '#6366f1' : '#10b981'} />
            </div>
          </div>
        ))}
      </div>

      {/* Market table */}
      {(markets || []).length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">All Market Listings</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  {['Symbol', 'Name', 'Price', 'Change %', 'Volume', 'Updated'].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {markets.map((m, i) => (
                  <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-brand-600 dark:text-brand-400">{m.symbol}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">{m.name}</td>
                    <td className="py-3.5 px-4 font-mono">${Number(m.price || 0).toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <Badge
                        label={`${m.change_percent > 0 ? '+' : ''}${Number(m.change_percent || 0).toFixed(2)}%`}
                        variant={m.change_percent >= 0 ? 'success' : 'danger'}
                      />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">{m.volume?.toLocaleString() || '—'}</td>
                    <td className="py-3.5 px-4 text-slate-400 text-xs">{m.updated_at ? new Date(m.updated_at).toLocaleTimeString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}