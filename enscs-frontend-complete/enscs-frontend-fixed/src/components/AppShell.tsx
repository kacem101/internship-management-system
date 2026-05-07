import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { clsx } from 'clsx';

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden" 
          onClick={() => setMobileOpen(false)} 
        />
      )}

      {/* Sidebar — fixed positioning with proper z-index */}
      <div className={clsx(
        'fixed top-0 left-0 bottom-0 z-50 transition-transform duration-300',
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      </div>

      {/* Main content area */}
      <div className={clsx(
        'flex-1 flex flex-col min-w-0 transition-all duration-300',
        collapsed ? 'md:ml-16' : 'md:ml-64'
      )}>
        {/* Topbar with higher z-index to stay above content */}
        <div className="sticky top-0 z-40">
          <TopBar onMobileMenuToggle={() => setMobileOpen(m => !m)} />
        </div>
        
        {/* Main content with proper padding */}
        <main className="flex-1 p-4 md:p-6 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
