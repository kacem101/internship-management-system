import { useState } from 'react';
import { Shield, Loader2, Search } from 'lucide-react';
import { useAuditLog } from '../../hooks/useApi';

const ACTION_COLOR: Record<string, string> = {
  OFFER_CREATED:            'text-green-600 bg-green-50',
  OFFER_UPDATED:            'text-accent bg-accent/8',
  OFFER_DELETED:            'text-danger bg-danger/8',
  OFFER_STATUS_CHANGED:     'text-orange-500 bg-orange-50',
  APPLICATION_STATUS_CHANGED:'text-accent bg-accent/8',
  APPLICATION_WITHDRAWN:    'text-orange-500 bg-orange-50',
  USER_ENABLED:             'text-green-600 bg-green-50',
  USER_DISABLED:            'text-orange-500 bg-orange-50',
  USER_DELETED:             'text-danger bg-danger/8',
};

const PAGE_SIZE = 50;

export function AuditLog() {
  const [page, setPage]   = useState(0);
  const [search, setSearch] = useState('');

  const { data: logPage, isLoading } = useAuditLog({ page, size: PAGE_SIZE });

  const entries    = (logPage?.content ?? []).filter(e =>
    !search || e.description.toLowerCase().includes(search.toLowerCase()) ||
    e.actorName.toLowerCase().includes(search.toLowerCase()) ||
    e.action.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = logPage?.totalPages ?? 0;
  const totalElements = logPage?.totalElements ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Shield size={22} className="text-purple-600" /> Audit Log
          </h1>
          <p className="page-subtitle">{totalElements} total actions recorded</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Filter by actor, action, description…"
          value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" />
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex justify-center"><Loader2 size={28} className="animate-spin text-accent" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="table-header">Time</th>
                  <th className="table-header">Actor</th>
                  <th className="table-header">Action</th>
                  <th className="table-header hidden lg:table-cell">Description</th>
                  <th className="table-header hidden md:table-cell">Change</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell text-xs text-gray-400 whitespace-nowrap">
                      {new Date(e.createdAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="table-cell text-sm font-medium text-primary">{e.actorName}</td>
                    <td className="table-cell">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${ACTION_COLOR[e.action] ?? 'text-gray-500 bg-gray-100'}`}>
                        {e.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="table-cell hidden lg:table-cell text-xs text-gray-500 max-w-[260px] truncate">
                      {e.description}
                    </td>
                    <td className="table-cell hidden md:table-cell text-xs text-gray-400">
                      {e.oldValue && e.newValue ? (
                        <span>
                          <span className="line-through text-danger/60">{e.oldValue}</span>
                          {' → '}
                          <span className="text-green-600 font-medium">{e.newValue}</span>
                        </span>
                      ) : (e.newValue ?? e.oldValue ?? '—')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {entries.length === 0 && (
              <div className="p-12 text-center text-gray-400 text-sm">No audit entries found</div>
            )}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">Page {page + 1} of {totalPages}</p>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">← Prev</button>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}
