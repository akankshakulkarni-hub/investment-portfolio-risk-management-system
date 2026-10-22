import { Search, Bell, Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ sidebarCollapsed, onMenuToggle }) {
  const { dark, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16 bg-white dark:bg-surface-dark-secondary
                  border-b border-slate-100 dark:border-slate-800 flex items-center px-6
                  transition-all duration-300 ${sidebarCollapsed ? 'left-16' : 'left-[248px]'}`}
    >
      {/* Mobile menu button */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden mr-4 text-slate-500 hover:text-slate-800 dark:hover:text-white"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search investors, portfolios..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-surface-dark-tertiary 
                       border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 
                       dark:text-slate-300 placeholder:text-slate-400 focus:outline-none 
                       focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white 
                     hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white 
                           hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-500 rounded-full" />
        </button>

        {/* Avatar */}
        <div className="ml-1 w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 
                        flex items-center justify-center text-white text-sm font-semibold cursor-pointer">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}