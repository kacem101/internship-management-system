import { useState } from 'react';
import { Download, Eye, Loader2, AlertCircle } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';
import { DrawerPanel } from '../../components/DrawerPanel';
import { useAllApplications, useUpdateApplicationStatus, useDownloadResume } from '../../hooks/useApi';
import { clsx } from 'clsx';
import type { ApplicationResponse } from '../../lib/api';

const STATUSES = ['ALL', 'PENDING', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED'];
const PAGE_SIZE = 20;

export function ReviewApplications() {
  const [filter, setFilter] = useState('ALL');
  const [page, setPage]   = useState(0);
  const [selected, setSelected]   = useState<ApplicationResponse | null>(null);
  const [notes, setNotes]         = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);

  const updateStatus    = useUpdateApplicationStatus();
  const downloadResume  = useDownloadResume();

  // ── Use the new GET /api/applications endpoint directly ──────────────────
  const { data: appsPage, isLoading } = useAllApplications({
    status: filter === 'ALL' ? undefined : filter,
    page,
    size: PAGE_SIZE,
  });

  const apps        = appsPage?.content ?? [];
  const totalPages  = appsPage?.totalPages ?? 0;
  const totalElements = appsPage?.totalElements ?? 0;

  const openReview = (app: ApplicationResponse) => {
    setSelected(app);
    setNotes(app.adminNotes ?? '');
    setNewStatus(app.status);
    setSaveError(null);
  };

  const saveDecision = async () => {
    if (!selected) return;
    setSaveError(null);
    try {
      await updateStatus.mutateAsync({ id: selected.id, status: newStatus, adminNotes: notes });
      setSelected(null);
    } catch (err: any) {
      setSaveError(err?.response?.data?.message ?? 'Failed to save decision. Please try again.');
    }
  };

  const STATUS_OPTS = [
    { v: 'PENDING',      label: 'Pending',      cls: 'text-warning' },
    { v: 'UNDER_REVIEW', label: 'Under Review', cls: 'text-accent' },
    { v: 'ACCEPTED',     label: 'Accepted',     cls: 'text-success' },
    { v: 'REJECTED',     label: 'Rejected',     cls: 'text-danger' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Review Applications</h1>
        <p className="page-subtitle">{totalElements} application{totalElements !== 1 ? 's' : ''}</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map(f => (
          <button key={f} onClick={() => { setFilter(f); setPage(0); }}
            className={clsx('px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
              filter === f ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-primary/30')}>
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex justify-center"><Loader2 size={28} className="animate-spin text-accent" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="table-header">Student</th>
                  <th className="table-header hidden md:table-cell">Offer</th>
                  <th className="table-header hidden lg:table-cell">Applied</th>
                  <th className="table-header">Status</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {apps.map(app => (
                  <tr key={app.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="table-cell">
                      <p className="font-medium text-sm text-primary">{app.studentName}</p>
                      <p className="text-xs text-gray-400 md:hidden">{app.offerTitle}</p>
                    </td>
                    <td className="table-cell hidden md:table-cell text-xs text-gray-500 max-w-[160px] truncate">{app.offerTitle}</td>
                    <td className="table-cell hidden lg:table-cell text-xs text-gray-400">
                      {new Date(app.appliedAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="table-cell"><StatusBadge status={app.status} /></td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1">
                        {app.hasResume && (
                          <button
                            onClick={() => downloadResume.mutate({ applicationId: app.id, studentName: app.studentName })}
                            disabled={downloadResume.isPending}
                            className="p-1.5 rounded-md text-gray-400 hover:text-accent hover:bg-accent/8 transition-colors"
                            title="Download resume">
                            {downloadResume.isPending ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                          </button>
                        )}
                        <button onClick={() => openReview(app)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-primary hover:bg-primary/8 transition-colors">
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {apps.length === 0 && (
              <div className="p-12 text-center text-gray-400 text-sm">No applications found</div>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">Page {page + 1} of {totalPages} · {totalElements} total</p>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">← Prev</button>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next →</button>
          </div>
        </div>
      )}

      {/* Review Drawer */}
      <DrawerPanel open={selected !== null} onClose={() => setSelected(null)}
        title="Review Application"
        subtitle={selected ? `${selected.studentName} → ${selected.offerTitle}` : ''}
        footer={
          <div className="flex gap-3">
            <button onClick={() => setSelected(null)} className="btn-outline flex-1 justify-center text-sm">Cancel</button>
            <button onClick={saveDecision} disabled={updateStatus.isPending} className="btn-primary flex-1 justify-center text-sm">
              {updateStatus.isPending ? 'Saving…' : 'Save Decision'}
            </button>
          </div>
        }>
        {selected && (
          <div className="space-y-5">
            {/* API error */}
            {saveError && (
              <div className="flex items-start gap-2 p-3 bg-danger/8 rounded-lg border border-danger/20">
                <AlertCircle size={15} className="text-danger flex-shrink-0 mt-0.5" />
                <p className="text-xs text-danger">{saveError}</p>
              </div>
            )}

            {/* Info grid */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              {[
                { l: 'Student', v: selected.studentName },
                { l: 'Offer',   v: selected.offerTitle },
                { l: 'Company', v: selected.companyName },
                { l: 'Applied', v: new Date(selected.appliedAt).toLocaleDateString('en-GB', { dateStyle: 'long' }) },
              ].map(({ l, v }) => (
                <div key={l} className="flex justify-between text-sm">
                  <span className="text-gray-500">{l}</span>
                  <span className="font-medium text-primary text-right max-w-[200px]">{v}</span>
                </div>
              ))}
            </div>

            {/* Cover letter */}
            <div>
              <p className="label">Cover Letter</p>
              <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                <p className="text-sm text-gray-600 leading-relaxed">{selected.coverLetter}</p>
              </div>
            </div>

            {/* Resume download */}
            {selected.hasResume && (
              <div>
                <p className="label">Resume</p>
                <button
                  onClick={() => downloadResume.mutate({ applicationId: selected.id, studentName: selected.studentName })}
                  disabled={downloadResume.isPending}
                  className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-accent/40 hover:bg-gray-50 transition-all w-full text-left">
                  {downloadResume.isPending
                    ? <Loader2 size={16} className="animate-spin text-accent" />
                    : <Download size={16} className="text-accent" />}
                  <span className="text-sm font-medium text-primary">Download Resume</span>
                </button>
              </div>
            )}

            {/* Decision buttons */}
            <div>
              <p className="label">Decision</p>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_OPTS.map(opt => (
                  <button key={opt.v} onClick={() => setNewStatus(opt.v)}
                    className={clsx('p-3 rounded-lg border-2 text-sm font-semibold transition-all',
                      newStatus === opt.v
                        ? `border-current bg-current/5 ${opt.cls}`
                        : 'border-gray-200 text-gray-500 hover:border-gray-300')}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Admin notes */}
            <div>
              <label className="label">Admin Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                rows={3} className="input resize-none"
                placeholder="Optional notes for the student…" />
            </div>
          </div>
        )}
      </DrawerPanel>
    </div>
  );
}
