import { useState, useEffect } from 'react';
import { Users, Briefcase, DollarSign, ArrowLeftRight } from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import PortfolioChart from '../components/charts/PortfolioChart';
import { SkeletonCard } from '../components/ui/LoadingSkeleton';
import { useSocket } from '../hooks/useSocket';
import api from '../services/api';

const CHART_DATA = [
  { name: 'Jan', value: 40000 }, { name: 'Feb', value: 52000 },
  { name: 'Mar', value: 47000 }, { name: 'Apr', value: 61000 },
  { name: 'May', value: 58000 }, { name: 'Jun', value: 74000 },
  { name: 'Jul', value: 82000 }, { name: 'Aug', value: 79000 },
];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentTxns, setRecentTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveData, setLiveData] = useState(null);

  useSocket({ market_update: (data) => setLiveData(data.data) });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [inv, port, txn] = await Promise.all([
          api.get('/investors'),
          api.get('/portfolios'),
          api.get('/transactions?limit=5'),
        ]);
        setStats({
          investors: inv.data?.length || 0,
          portfolios: port.data?.length || 0,
          totalValue: port.data?.reduce((s, p) => s + Number(p.total_value || 0), 0) || 0,
          transactions: txn.data?.length || 0,
        });
        setRecentTxns(txn.data?.slice(0, 5) || []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Your portfolio overview at a glance
        </p>
      </div>

      {/* Live ticker */}
      {liveData && (
        <div className="card px-5 py-3 flex items-center gap-6 text-sm animate-fade-in">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse-slow" />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">LIVE</span>
          </span>
          {Object.entries(liveData).map(([key, val]) => (
            <span key={key} className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{key}</span>
              <span className="text-brand-600 dark:text-brand-400 font-mono text-xs">
                {typeof val === 'number' ? val.toLocaleString() : val}
              </span>
            </span>
          ))}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard title="Total Portfolio Value" value={`$${(stats?.totalValue || 0).toLocaleString()}`} change="+12.4%" icon={DollarSign} color="brand" />
            <StatCard title="Total Investors" value={stats?.investors ?? 0} change="+3" icon={Users} color="green" />
            <StatCard title="Active Portfolios" value={stats?.portfolios ?? 0} change="+1" icon={Briefcase} color="purple" />
            <StatCard title="Transactions" value={stats?.transactions ?? 0} icon={ArrowLeftRight} color="amber" />
          </>
        )}
      </div>

      {/* Chart + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">Portfolio Value Trend</h2>
          <PortfolioChart data={CHART_DATA} />
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">Recent Transactions</h2>
          {recentTxns.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {recentTxns.map((txn, i) => {
                const txnType = (txn.type || txn.transaction_type || '').toLowerCase();
                const isBuy = txnType === 'buy';
                return (
                  <div key={i} className="flex items-center gap-3 py-1.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold
                      ${isBuy ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' 
                        : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                      {(txnType || 'T')?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                        {txn.asset_name || `TXN #${txn.transaction_id}`}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(txn.transaction_date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold ${isBuy ? 'text-emerald-600' : 'text-red-600'}`}>
                      ${Number(txn.amount).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}