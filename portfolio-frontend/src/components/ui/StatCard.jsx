import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, change, changeType = 'positive', icon: Icon, color = 'brand' }) {
  const colorMap = {
    brand: 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400',
    green: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="card p-5 hover:shadow-card-hover transition-all duration-200 animate-slide-up">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          {Icon && <Icon size={18} />}
        </div>
        {change !== undefined && (
          <span
            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${
              changeType === 'positive'
                ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400'
                : 'text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400'
            }`}
          >
            {changeType === 'positive' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {change}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white font-display">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{title}</p>
    </div>
  );
}