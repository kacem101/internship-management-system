import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { clsx } from 'clsx';
import {
  LayoutDashboard, Briefcase, FileText, ClipboardList,
  Users, Shield, ChevronRight, LogOut, Settings,
  BookOpen, Star, ListChecks, BarChart3
} from 'lucide-react';

const NAV: Record<string, { href: string; icon: React.ElementType; label: string }[]> = {
  STUDENT: [
    { href: '/student/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/student/offers',       icon: Briefcase,       label: 'Browse Offers' },
    { href: '/student/applications', icon: ClipboardList,   label: 'My Applications' },
    { href: '/student/reports',      icon: FileText,        label: 'My Reports' },
  ],
  SUPERVISOR: [
    { href: '/supervisor/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/supervisor/reports',     icon: BookOpen,        label: 'Reports Queue' },
    { href: '/supervisor/evaluations', icon: Star,            label: 'Evaluations' },
  ],
  ADMIN: [
    { href: '/admin/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/offers',        icon: Briefcase,       label: 'Manage Offers' },
    { href: '/admin/applications',  icon: ListChecks,      label: 'Applications' },
    { href: '/admin/reports',       icon: BarChart3,       label: 'Reports' },
    { href: '/admin/users',         icon: Users,           label: 'Users' },
    { href: '/admin/audit-log',      icon: Settings,        label: 'Audit Log' },
  ],
};

interface Props { collapsed: boolean; onToggle: () => void; }

export function Sidebar({ collapsed, onToggle }: Props) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const items = NAV[user?.role ?? 'STUDENT'] ?? [];

  const handleLogout = () => { logout(); navigate('/login'); };

  const roleColor: Record<string, string> = {
    STUDENT: 'bg-accent/20 text-accent-light',
    SUPERVISOR: 'bg-purple-500/20 text-purple-300',
    ADMIN: 'bg-danger/20 text-red-300',
  };

  return (
    <aside className={clsx(
      'h-full flex flex-col transition-all duration-300 ease-out',
      'bg-gradient-to-b from-[#0F2D45] via-[#1B4F72] to-[#1a4868]',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

      {/* Logo */}
      <div className={clsx('relative flex items-center border-b border-white/10 h-16 flex-shrink-0', collapsed ? 'justify-center px-0' : 'px-5 gap-3')}>
        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
          <Shield size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-display font-700 text-white text-sm leading-none">ENSCS</p>
            <p className="text-white/50 text-[10px] mt-0.5 leading-none">Internship Portal</p>
          </div>
        )}
        {!collapsed && (
          <button onClick={onToggle} className="ml-auto p-1 rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors">
            <ChevronRight size={14} className="rotate-180" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {!collapsed && (
          <p className="text-white/30 text-[10px] font-semibold uppercase tracking-widest px-3 pb-2">Navigation</p>
        )}
        {items.map(({ href, icon: Icon, label }) => (
          <NavLink key={href} to={href} className={({ isActive }) => clsx(
            'relative flex items-center gap-3 rounded-lg transition-all duration-150 group',
            collapsed ? 'px-0 py-2.5 justify-center' : 'px-3 py-2.5',
            isActive
              ? 'bg-white/15 text-white shadow-sm'
              : 'text-white/60 hover:bg-white/8 hover:text-white/90'
          )}>
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent rounded-r-full" />}
                <Icon size={17} className={isActive ? 'text-accent-light' : ''} />
                {!collapsed && <span className="text-sm font-medium">{label}</span>}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                    {label}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className={clsx('border-t border-white/10 p-3', collapsed ? 'flex flex-col items-center gap-2' : '')}>
        {!collapsed ? (
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/8 transition-colors">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-white text-sm">
              {user?.fullName?.[0] ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.fullName}</p>
              <span className={clsx('text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded', roleColor[user?.role ?? 'STUDENT'])}>
                {user?.role}
              </span>
            </div>
            <button onClick={handleLogout} title="Logout" className="text-white/40 hover:text-danger transition-colors">
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <>
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center font-semibold text-white text-sm">
              {user?.fullName?.[0] ?? 'U'}
            </div>
            <button onClick={handleLogout} title="Logout" className="text-white/40 hover:text-danger transition-colors p-1">
              <LogOut size={15} />
            </button>
          </>
        )}
        {collapsed && (
          <button onClick={onToggle} className="text-white/30 hover:text-white transition-colors p-1">
            <ChevronRight size={14} />
          </button>
        )}
      </div>
    </aside>
  );
}
