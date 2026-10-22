import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Briefcase, BarChart2,
  TrendingUp, ArrowLeftRight, Globe, ChevronLeft, LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/investors', icon: Users, label: 'Investors' },
  { to: '/portfolios', icon: Briefcase, label: 'Portfolios' },
  { to: '/assets', icon: BarChart2, label: 'Assets' },
  { to: '/investments', icon: TrendingUp, label: 'Investments' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/market', icon: Globe, label: 'Market Data' },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white dark:bg-surface-dark-secondary 
                  border-r border-slate-100 dark:border-slate-800 z-40 flex flex-col
                  transition-all duration-300 ${collapsed ? 'w-16' : 'w-[248px]'}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-100 dark:border-slate-800">
        <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <TrendingUp size={16} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-slate-900 dark:text-white text-lg">
            FolioAI
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
        >
          <ChevronLeft
            size={16}
            className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {!collapsed && (
          <p className="section-title px-3 mb-3 mt-1">Navigation</p>
        )}
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        {!collapsed ? (
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 group">
            <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <button
            onClick={logout}
            className="w-full flex justify-center p-2 text-slate-400 hover:text-red-500 transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </aside>
  );
}