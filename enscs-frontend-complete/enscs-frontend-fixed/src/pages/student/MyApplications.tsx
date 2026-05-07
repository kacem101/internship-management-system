import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Download, X, FileText, Building2, Loader2 } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useMyApplications, useWithdrawApplication, useDownloadResume } from '../../hooks/useApi';
import { clsx } from 'clsx';

const FILTERS = ['ALL', 'PENDING', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'];

export function MyApplications() {
  const { 
    mutateAsync: withdrawAsync, 
    isPending: isWithdrawing, 
    error: withdrawError, 
    reset: resetWithdraw 
  } = useWithdrawApplication();
  const { data: page, isLoading } = useMyApplications({ size: 50 });
  const withdrawMutation          = useWithdrawApplication();
  const downloadResume            = useDownloadResume();
  const [expanded, setExpanded]   = useState<number | null>(null);
  const [confirm, setConfirm]     = useState<number | null>(null);
  const [withdrawReason, setWithdrawReason] = useState('');
  const [withdrawStatus, setWithdrawStatus] = useState('');
  const [filter, setFilter]       = useState('ALL');

  const apps     = page?.content ?? [];
  const filtered = apps.filter(a => filter === 'ALL' || a.status === filter);

  const handleWithdraw = async (id: number) => {
    try {
      await withdrawAsync({ id, withdrawalReason: withdrawReason });
      // Only close and reset if successful
      setConfirm(null);
      setWithdrawReason('');
      setWithdrawStatus('');
      resetWithdraw(); // Clear any previous errors
    } catch (err) {
      // Catching here prevents the app from crashing; 
      // the error UI is handled by the 'withdrawError' object below
      console.error("Withdrawal failed:", err);
    }
  };

  if (isLoading) return (
    <div className="card p-16 flex items-center justify-center">
      <Loader2 size={28} className="animate-spin text-accent" />
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">My Applications</h1>
        <p className="page-subtitle">{apps.length} total application{apps.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={clsx('px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
              filter === f
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-600 border-gray-200 hover:border-primary/30 hover:bg-gray-50')}>
            {f.replace('_', ' ')}
            {f !== 'ALL' && (
              <span className="ml-1.5 opacity-60">({apps.filter(a => a.status === f).length})</span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-16 text-center animate-fade-in">
          <p className="text-3xl mb-3">📋</p>
          <p className="font-semibold text-primary">No applications</p>
          <p className="text-sm text-gray-500 mt-1">
            {filter === 'ALL' ? "You haven't applied to any offers yet." : `No ${filter.replace('_', ' ').toLowerCase()} applications.`}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="table-header">Offer</th>
                  <th className="table-header hidden md:table-cell">Company</th>
                  <th className="table-header">Status</th>
                  <th className="table-header hidden sm:table-cell">Applied</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(app => (
                  // React.Fragment with key — correct way to return 2 sibling <tr> rows
                  <React.Fragment key={app.id}>
                    <tr
                      className="hover:bg-gray-50/70 transition-colors cursor-pointer"
                      onClick={() => setExpanded(e => e === app.id ? null : app.id)}>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-primary/10 rounded-md flex items-center justify-center flex-shrink-0">
                            <Building2 size={13} className="text-primary" />
                          </div>
                          <span className="font-medium text-primary text-sm line-clamp-1">{app.offerTitle}</span>
                        </div>
                      </td>
                      <td className="table-cell hidden md:table-cell text-gray-500 text-xs">{app.companyName}</td>
                      <td className="table-cell"><StatusBadge status={app.status} /></td>
                      <td className="table-cell hidden sm:table-cell text-gray-400 text-xs">
                        {new Date(app.appliedAt).toLocaleDateString('en-GB')}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          {app.hasResume && (
                            <button
                              onClick={e => { e.stopPropagation(); downloadResume.mutate({ applicationId: app.id, studentName: app.studentName }); }}
                              disabled={downloadResume.isPending}
                              className="p-1.5 rounded-md text-gray-400 hover:text-accent hover:bg-accent/8 transition-colors"
                              title="Download resume">
                              {downloadResume.isPending ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                            </button>
                          )}
                          {(app.status === 'PENDING' || app.status === 'UNDER_REVIEW') && (
                            <button
                              onClick={e => { e.stopPropagation(); setWithdrawStatus(app.status); setWithdrawReason(''); setConfirm(app.id); }}
                              className="p-1.5 rounded-md text-gray-400 hover:text-danger hover:bg-danger/8 transition-colors"
                              title="Withdraw">
                              <X size={14} />
                            </button>
                          )}
                          <button
                            onClick={e => { e.stopPropagation(); setExpanded(ev => ev === app.id ? null : app.id); }}
                            className="p-1.5 rounded-md text-gray-400 hover:text-primary transition-colors">
                            {expanded === app.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded details row */}
                    {expanded === app.id && (
                      <tr>
                        <td colSpan={5} className="bg-gray-50/80 border-t border-gray-100 px-4 py-4 animate-fade-in">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <FileText size={11} /> Cover Letter
                              </p>
                              <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">{app.coverLetter}</p>
                            </div>
                            {app.adminNotes && (
                              <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Admin Notes</p>
                                <div className="bg-white rounded-lg border border-gray-200 p-3">
                                  <p className="text-sm text-gray-600">{app.adminNotes}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirm !== null}
        title="Withdraw Application"
        description={withdrawStatus === 'UNDER_REVIEW'
          ? "Your application is under review. Please provide a reason for withdrawal (required)."
          : "Are you sure you want to withdraw? This cannot be undone."}
        confirmLabel={isWithdrawing ? "Withdrawing..." : "Withdraw"}
        variant="danger"
        // Use isWithdrawing to show a loader on the button
        onConfirm={() => confirm !== null && handleWithdraw(confirm)}
        onCancel={() => { 
          setConfirm(null); 
          setWithdrawReason(''); 
          setWithdrawStatus('');
          resetWithdraw(); // Crucial: clear error when user closes dialog
        }}
        extra={
          <div className="space-y-3">
            {withdrawStatus === 'UNDER_REVIEW' && (
              <textarea
                value={withdrawReason}
                onChange={e => setWithdrawReason(e.target.value)}
                rows={3}
                placeholder="Reason for withdrawal (min 20 characters)…"
                className="input resize-none w-full mt-3 text-sm"
              />
            )}
            
            {/* 2. Display the Error Message */}
            {withdrawError && (
              <div className="p-3 rounded-md bg-danger/10 border border-danger/20 text-danger text-xs animate-shake">
                <strong>Withdrawal Failed:</strong> {
                  // Adjust based on your API error structure (e.g., error.message or error.response.data)
                  (withdrawError as any)?.response?.data?.message || withdrawError.message
                }
              </div>
            )}
          </div>
        }
        confirmDisabled={
          isWithdrawing || 
          (withdrawStatus === 'UNDER_REVIEW' && withdrawReason.trim().length < 20)
        }
      />
    </div>
  );
}
