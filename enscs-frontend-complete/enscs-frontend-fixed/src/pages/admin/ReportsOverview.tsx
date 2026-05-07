import { Download, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useSubmittedReports, useOverdueReports, useDownloadReport, useDownloadDailyLog } from '../../hooks/useApi';

export function ReportsOverview() {
  const [tab, setTab] = useState<'submitted' | 'overdue'>('submitted');
  const { data: submittedPage, isLoading: submittedLoading } = useSubmittedReports({ size: 50 });
  const { data: overduePage, isLoading: overdueLoading } = useOverdueReports({ size: 50 });
  const downloadReport = useDownloadReport();
  const downloadLog = useDownloadDailyLog();

  const reports = tab === 'submitted' ? (submittedPage?.content ?? []) : (overduePage?.content ?? []);
  const isLoading = tab === 'submitted' ? submittedLoading : overdueLoading;
  const overdueCount = overduePage?.totalElements ?? 0;

  return (
    <div className="space-y-5">
      <div><h1 className="page-title">Reports Overview</h1><p className="page-subtitle">Review student internship reports and daily logs</p></div>

      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
        {(['submitted', 'overdue'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-md text-sm font-semibold capitalize transition-all ${tab === t ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t}
            {t === 'overdue' && overdueCount > 0 && <span className="ml-1.5 px-1.5 py-0.5 bg-danger text-white rounded-full text-[10px]">{overdueCount}</span>}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {isLoading ? <div className="p-16 flex justify-center"><Loader2 size={28} className="animate-spin text-accent" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="table-header">Student</th>
                  <th className="table-header hidden md:table-cell">Internship</th>
                  <th className="table-header hidden sm:table-cell">Submitted</th>
                  <th className="table-header">Files</th>
                  <th className="table-header text-right">Download</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium text-sm text-primary">{r.studentName}</td>
                    <td className="table-cell hidden md:table-cell text-xs text-gray-500 max-w-[160px] truncate">{r.offerTitle}</td>
                    <td className="table-cell hidden sm:table-cell text-xs text-gray-400">{r.submittedAt ? new Date(r.submittedAt).toLocaleDateString('en-GB') : '—'}</td>
                    <td className="table-cell">
                      <div className="flex gap-1.5">
                        <span className={`flex items-center gap-1 text-xs font-medium ${r.hasReport ? 'text-success' : 'text-gray-400'}`}>
                          {r.hasReport ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />} Report
                        </span>
                        <span className={`flex items-center gap-1 text-xs font-medium ${r.hasDailyLog ? 'text-success' : 'text-gray-400'}`}>
                          {r.hasDailyLog ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />} Log
                        </span>
                      </div>
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex gap-1 justify-end">
                        {r.hasReport && (
                          <button onClick={() => downloadReport.mutate({ reportId: r.id, filename: `report_${r.studentName}.pdf` })}
                            className="p-1.5 rounded-md text-gray-400 hover:text-accent hover:bg-accent/8 transition-colors" title="Download report">
                            <Download size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {reports.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-2xl mb-2">{tab === 'overdue' ? '🎉' : '📄'}</p>
                <p className="text-sm text-gray-500">{tab === 'overdue' ? 'No overdue reports!' : 'No submitted reports yet.'}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
