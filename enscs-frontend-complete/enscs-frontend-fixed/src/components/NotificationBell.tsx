import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Loader2, FileText, ClipboardList, AlertTriangle, Info } from 'lucide-react';
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from '../hooks/useApi';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';
import type { NotificationItem } from '../lib/api';

const TYPE_ICON: Record<string, React.ReactNode> = {
  APPLICATION_STATUS: <ClipboardList size={14} className="text-accent" />,
  NEW_APPLICATION:    <ClipboardList size={14} className="text-green-600" />,
  REPORT_SUBMITTED:   <FileText size={14} className="text-accent" />,
  OVERDUE:            <AlertTriangle size={14} className="text-danger" />,
  WITHDRAWAL:         <AlertTriangle size={14} className="text-warning" />,
};

function typeIcon(type: string) {
  return TYPE_ICON[type] ?? <Info size={14} className="text-gray-400" />;
}

function navPath(n: NotificationItem): string | null {
  if (!n.entityType || !n.entityId) return null;
  switch (n.entityType) {
    case 'APPLICATION': return '/admin/applications';
    case 'REPORT':      return '/admin/reports';
    case 'OFFER':       return '/admin/offers';
    default:            return null;
  }
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data: countData }       = useUnreadCount();
  const { data: notifPage, isLoading } = useNotifications({ size: 15 });
  const markAsRead    = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const count = countData?.count ?? 0;
  const notifications = notifPage?.content ?? [];

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleClick = (n: NotificationItem) => {
    if (!n.isRead) markAsRead.mutate(n.id);
    const path = navPath(n);
    if (path) { navigate(path); setOpen(false); }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
        <Bell size={20} />
        {count > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-gray-100 z-50 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="font-semibold text-sm text-primary">Notifications</span>
            {count > 0 && (
              <button
                onClick={() => markAllAsRead.mutate()}
                disabled={markAllAsRead.isPending}
                className="flex items-center gap-1 text-xs text-accent hover:underline font-medium">
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-50">
            {isLoading && (
              <div className="p-8 flex justify-center">
                <Loader2 size={20} className="animate-spin text-accent" />
              </div>
            )}
            {!isLoading && notifications.length === 0 && (
              <div className="p-8 text-center text-sm text-gray-400">No notifications yet</div>
            )}
            {notifications.map(n => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={clsx(
                  'w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors',
                  !n.isRead && 'bg-accent/4'
                )}>
                <div className="mt-0.5 flex-shrink-0">{typeIcon(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={clsx('text-xs font-semibold text-primary truncate', !n.isRead && 'font-bold')}>
                      {n.title}
                    </p>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-[10px] text-gray-300 mt-1">
                    {new Date(n.createdAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
