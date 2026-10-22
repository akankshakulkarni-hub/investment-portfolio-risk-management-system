import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-surface-secondary dark:bg-surface-dark">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Navbar sidebarCollapsed={collapsed} onMenuToggle={() => setCollapsed(!collapsed)} />
      <main
        className={`pt-16 min-h-screen transition-all duration-300 ${
          collapsed ? 'ml-16' : 'ml-[248px]'
        }`}
      >
        <div className="p-6 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}