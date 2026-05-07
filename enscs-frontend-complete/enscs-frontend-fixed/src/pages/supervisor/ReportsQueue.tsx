import { Link } from 'react-router-dom';
import { Download, Star, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { useSubmittedReports, useMyEvaluations, useDownloadReport, useDownloadDailyLog } from '../../hooks/useApi';

export function ReportsQueue() {
  const { data: reportsPage, isLoading } = useSubmittedReports({ size: 50 });
  const { data: evalsPage } = useMyEvaluations({ size: 100 });
  const downloadReport = useDownloadReport();
  const downloadLog = useDownloadDailyLog();

  const reports = reportsPage?.content ?? [];
  const evaluatedIds = new Set((evalsPage?.content ?? []).map(e => e.reportId));

  return (
    <div className="space-y-5">
      <div><h1 className="page-title">Reports Queue</h1><p className="page-subtitle">Review submitted student reports and submit evaluations</p></div>

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
                  <th className="table-header">Evaluation</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => {
                  const isEvaluated = evaluatedIds.has(report.id);
                  return (
                    <tr key={report.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="table-cell font-medium text-sm text-primary">{report.studentName}</td>
                      <td className="table-cell hidden md:table-cell text-xs text-gray-500 max-w-[160px] truncate">{report.offerTitle}</td>
                      <td className="table-cell hidden sm:table-cell text-xs text-gray-400">
                        {report.submittedAt ? new Date(report.submittedAt).toLocaleDateString('en-GB') : <span className="flex items-center gap-1 text-warning"><Clock size={11} /> Not yet</span>}
                      </td>
                      <td className="table-cell">
                        <div className="flex gap-1">
                          <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${report.hasReport ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-400'}`}>{report.hasReport ? '✓' : '–'} Report</span>
                          <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${report.hasDailyLog ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-400'}`}>{report.hasDailyLog ? '✓' : '–'} Log</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        {isEvaluated
                          ? <span className="flex items-center gap-1 text-xs font-semibold text-success"><CheckCircle2 size={13} /> Done</span>
                          : <span className="flex items-center gap-1 text-xs font-semibold text-warning"><Clock size={13} /> Pending</span>}
                      </td>
                      <td className="table-cell text-right">
                        <div className="flex items-center justify-end gap-1">
                          {report.hasReport && (
                            <button onClick={() => downloadReport.mutate({ reportId: report.id, filename: `report_${report.studentName}.pdf` })} className="p-1.5 rounded-md text-gray-400 hover:text-accent hover:bg-accent/8 transition-colors"><Download size={14} /></button>
                          )}
                          {report.submittedAt && (
                            <Link to={`/supervisor/reports/${report.id}/evaluate`}
                              className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-md transition-all ${isEvaluated ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-accent/10 text-accent hover:bg-accent/20'}`}>
                              <Star size={12} />{isEvaluated ? 'Edit' : 'Evaluate'}
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {reports.length === 0 && <div className="p-12 text-center text-gray-400"><p className="text-2xl mb-2">📭</p><p className="text-sm">No reports assigned yet.</p></div>}
          </div>
        )}
      </div>
    </div>
  );
}
