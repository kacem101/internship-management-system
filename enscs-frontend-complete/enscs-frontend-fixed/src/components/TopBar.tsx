import { Menu, Search, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { NotificationBell } from './NotificationBell';

const CRUMBS: Record<string, string[]> = {
  '/student/dashboard':    ['Student', 'Dashboard'],
  '/student/offers':       ['Student', 'Browse Offers'],
  '/student/applications': ['Student', 'My Applications'],
  '/student/reports':      ['Student', 'My Reports'],
  '/supervisor/dashboard':   ['Supervisor', 'Dashboard'],
  '/supervisor/reports':     ['Supervisor', 'Reports Queue'],
  '/supervisor/evaluations': ['Supervisor', 'Evaluations'],
  '/admin/dashboard':    ['Admin', 'Dashboard'],
  '/admin/offers':       ['Admin', 'Manage Offers'],
  '/admin/applications': ['Admin', 'Applications'],
  '/admin/reports':      ['Admin', 'Reports'],
  '/admin/users':        ['Admin', 'User Management'],
  '/admin/audit-log':    ['Admin', 'Audit Log'],
};

interface Props { onMobileMenuToggle: () => void; }

export function TopBar({ onMobileMenuToggle }: Props) {
  const { pathname }    = useLocation();
  const { user }        = useAuthStore();
  const [searchVal, setSearchVal] = useState('');
  const crumbs = CRUMBS[pathname] ?? ['Portal'];

  return (
    <header className="sticky top-0 w-full h-16 bg-white/95 backdrop-blur border-b border-gray-100 z-20 flex items-center gap-4 px-4 md:px-6">
      <button className="md:hidden text-gray-500 hover:text-primary transition-colors" onClick={onMobileMenuToggle}>
        <Menu size={20} />
      </button>

      {/* Breadcrumb */}
      <nav className="hidden md:flex items-center gap-1.5 text-sm min-w-0">
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={13} className="text-gray-300 flex-shrink-0" />}
            <span className={i === crumbs.length - 1 ? 'font-semibold text-primary truncate' : 'text-gray-400'}>{crumb}</span>
          </span>
        ))}
      </nav>

      {/* Search */}
      <div className="flex-1 max-w-sm mx-auto md:mx-0">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search offers, applications…"
            value={searchVal} onChange={e => setSearchVal(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all placeholder-gray-400" />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* SPRINT 2 — Real notification bell replaces mock */}
        <NotificationBell />

        {/* Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {user?.fullName?.[0] ?? 'U'}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-gray-800 leading-none">{user?.fullName}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
