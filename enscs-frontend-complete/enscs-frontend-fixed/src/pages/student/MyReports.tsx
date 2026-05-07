import { useState } from 'react';
import { FileText, Upload, CheckCircle2, AlertTriangle, Clock, Download, Loader2, Star, User, MessageSquare, Briefcase, Wrench, Building2, ChevronDown, ChevronUp } from 'lucide-react';
import { FileUploadZone } from '../../components/FileUploadZone';
import { useMyApplications, useSubmitReport, useDownloadReport, useDownloadDailyLog, useEvaluationByReport, useReportByApplication } from '../../hooks/useApi';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../../lib/api';

interface ReportState { report: File | null; log: File | null; }

// ─── Grade badge (0–20 scale) ────────────────────────────────────────────────
function getGradeStyle(grade: number): { bg: string; text: string; ring: string; label: string } {
  if (grade >= 18) return { bg: 'bg-emerald-50',  text: 'text-emerald-700', ring: 'ring-emerald-300', label: 'Excellent'    };
  if (grade >= 16) return { bg: 'bg-green-50',    text: 'text-green-700',   ring: 'ring-green-300',   label: 'Very Good'   };
  if (grade >= 14) return { bg: 'bg-blue-50',     text: 'text-blue-700',    ring: 'ring-blue-300',    label: 'Good'        };
  if (grade >= 12) return { bg: 'bg-yellow-50',   text: 'text-yellow-700',  ring: 'ring-yellow-300',  label: 'Average'     };
  if (grade >= 10) return { bg: 'bg-orange-50',   text: 'text-orange-700',  ring: 'ring-orange-300',  label: 'Pass'        };
  return                  { bg: 'bg-red-50',      text: 'text-red-700',     ring: 'ring-red-300',     label: 'Fail'        };
}

function GradeBadge({ grade }: { grade: number }) {
  const style = getGradeStyle(grade);
  return (
    <div className={`inline-flex flex-col items-center justify-center w-16 h-16 rounded-2xl ring-2 ${style.bg} ${style.ring}`}>
      <span className={`text-2xl font-black leading-none ${style.text}`}>{grade}</span>
      <span className={`text-[9px] font-bold uppercase tracking-wide ${style.text} opacity-70`}>/20</span>
    </div>
  );
}

// ─── Feedback row ────────────────────────────────────────────────────────────
function FeedbackBlock({ icon: Icon, label, text }: { icon: any; label: string; text: string }) {
  if (!text) return null;
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 w-7 h-7 rounded-lg bg-accent/10 flex-shrink-0 flex items-center justify-center">
        <Icon size={13} className="text-accent" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">{label}</p>
        <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

// ─── Evaluation panel ────────────────────────────────────────────────────────
function EvaluationPanel({ evaluation }: { evaluation: any }) {
  const [expanded, setExpanded] = useState(false);

  const formattedDate = evaluation.evaluatedAt
    ? new Date(evaluation.evaluatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <div className="border-t border-gray-100">
      {/* Collapsed header – always visible */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors group"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center">
            <Star size={12} className="text-success fill-success" />
          </div>
          <span className="text-sm font-semibold text-primary">Supervisor Evaluation</span>
          {evaluation.grade != null && (() => {
            const s = getGradeStyle(Number(evaluation.grade));
            return (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ring-1 ${s.bg} ${s.text} ${s.ring}`}>
                {evaluation.grade}/20 · {s.label}
              </span>
            );
          })()}
        </div>
        <div className="flex items-center gap-2 text-gray-400 group-hover:text-gray-600 transition-colors">
          {formattedDate && <span className="text-[10px]">{formattedDate}</span>}
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="px-5 pb-5 animate-fade-in">
          {/* Top strip: grade + evaluator */}
          <div className="flex items-center gap-4 mb-4">
            {evaluation.grade != null && <GradeBadge grade={evaluation.grade} />}
            <div>
              {evaluation.supervisorName && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <User size={11} />
                  <span className="font-medium text-gray-700">{evaluation.supervisorName}</span>
                </div>
              )}
              {formattedDate && (
                <p className="text-[10px] text-gray-400 mt-0.5">Evaluated on {formattedDate}</p>
              )}
            </div>
          </div>

          {/* Feedback blocks */}
          <div className="space-y-4">
            <FeedbackBlock icon={MessageSquare} label="General Comments"      text={evaluation.generalComments} />
            <FeedbackBlock icon={Wrench}        label="Technical Feedback"    text={evaluation.technicalFeedback} />
            <FeedbackBlock icon={Briefcase}     label="Professional Feedback" text={evaluation.professionalFeedback} />
            <FeedbackBlock icon={Building2}     label="Company Feedback"      text={evaluation.companyFeedback} />
          </div>

          {/* Empty state */}
          {!evaluation.generalComments && !evaluation.technicalFeedback &&
           !evaluation.professionalFeedback && !evaluation.companyFeedback && (
            <p className="text-sm text-gray-400 italic text-center py-2">No detailed feedback provided yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Report card ─────────────────────────────────────────────────────────────
function ReportCard({ app }: { app: any }) {
  const [files, setFiles] = useState<ReportState>({ report: null, log: null });
  const [uploaded, setUploaded] = useState(false);

  const { data: existing, isLoading: reportLoading } = useQuery({
    queryKey: ['reports', 'application', app.id],
    queryFn: () => reportsApi.getByApplication(app.id),
    retry: false,
  });
  const { data: report }     = useReportByApplication(app.id);
  const { data: evaluation } = useEvaluationByReport(report?.id);

  const submitMutation = useSubmitReport();
  const downloadReport = useDownloadReport();
  const downloadLog    = useDownloadDailyLog();

  const daysUntil = (d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
  const days      = existing ? daysUntil(existing.submissionDeadline) : 30;
  const isUrgent  = days <= 7 && days >= 0;
  const isLate    = days < 0;
  const progress  = existing ? ((existing.hasReport ? 1 : 0) + (existing.hasDailyLog ? 1 : 0)) : 0;

  const calculateStatus = () => {
    if (!app.endDate || !app.reportDeadlineDays) return { label: 'No Date', color: 'gray', days: 0 };
    const end = new Date(app.endDate);
    const deadlineDate = new Date(end.setDate(end.getDate() + app.reportDeadlineDays));
    const daysRemaining = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysRemaining < 0)  return { label: 'Late',     color: 'red',    days: daysRemaining };
    if (daysRemaining <= 7) return { label: 'Urgent',   color: 'orange', days: daysRemaining };
    return                         { label: 'On Track', color: 'green',  days: daysRemaining };
  };
  const status = calculateStatus();

  const handleUpload = async () => {
    await submitMutation.mutateAsync({ applicationId: app.id, reportFile: files.report, dailyLog: files.log });
    setUploaded(true);
    setFiles({ report: null, log: null });
  };

  return (
    <div className="card overflow-hidden animate-slide-in-u">
      {/* ── Header ── */}
      <div className={`p-5 border-b ${isLate ? 'bg-danger/5 border-danger/20' : isUrgent ? 'bg-warning/5 border-warning/20' : 'bg-gray-50 border-gray-100'}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText size={18} className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-primary">{app.offerTitle}</h3>
              <p className="text-xs text-gray-500">{app.companyName}</p>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-tight">Submission Window</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    status.color === 'red'    ? 'bg-red-100 text-red-700' :
                    status.color === 'orange' ? 'bg-orange-100 text-orange-700 animate-pulse' :
                                                'bg-green-100 text-green-700'
                  }`}>{status.label}</span>
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className={`text-2xl font-black ${
                    status.color === 'red'    ? 'text-red-600'    :
                    status.color === 'orange' ? 'text-orange-600' : 'text-green-600'
                  }`}>{Math.abs(status.days)}</span>
                  <span className="text-xs font-medium text-gray-500">
                    {status.days < 0 ? 'days overdue' : 'days left to submit'}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1 italic">
                  * Deadline is {app.reportDeadlineDays} days after internship ends
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {existing && (
              <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${isLate ? 'bg-danger/10 text-danger' : isUrgent ? 'bg-warning/10 text-warning' : 'bg-gray-100 text-gray-600'}`}>
                {isLate ? <AlertTriangle size={12} /> : <Clock size={12} />}
                {isLate ? `${Math.abs(days)}d overdue` : `${days}d left`}
              </div>
            )}
            <span className={`text-xs font-bold ${progress === 2 ? 'text-success' : 'text-warning'}`}>
              {progress}/2 files
            </span>
          </div>
        </div>
        <div className="mt-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${progress === 2 ? 'bg-success' : 'bg-warning'}`}
            style={{ width: `${(progress / 2) * 100}%` }}
          />
        </div>
      </div>

      {/* ── File upload body ── */}
      <div className="p-5">
        {(uploaded || submitMutation.isSuccess) && (
          <div className="flex items-center gap-2 p-3 bg-success/8 rounded-lg border border-success/20 mb-4 animate-fade-in">
            <CheckCircle2 size={16} className="text-success" />
            <p className="text-sm text-success font-medium">Files uploaded successfully!</p>
          </div>
        )}

        {reportLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin text-accent" size={20} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Report */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText size={11} /> Internship Report{' '}
                {existing?.hasReport && <CheckCircle2 size={11} className="text-success" />}
              </p>
              {existing?.hasReport ? (
                <div className="border border-success/20 bg-success/5 rounded-lg p-3 flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-success" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-700">report_submitted.pdf</p>
                    <p className="text-[10px] text-gray-400">Submitted</p>
                  </div>
                  <button onClick={() => existing?.id && downloadReport.mutate({ reportId: existing.id, filename: 'my-report.pdf' })} className="text-accent hover:text-accent-dark">
                    <Download size={14} />
                  </button>
                </div>
              ) : (
                <FileUploadZone label="Upload Report" file={files.report} onChange={(f) => setFiles(p => ({ ...p, report: f }))} />
              )}
            </div>

            {/* Daily Log */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText size={11} /> Daily Log{' '}
                {existing?.hasDailyLog && <CheckCircle2 size={11} className="text-success" />}
              </p>
              {existing?.hasDailyLog ? (
                <div className="border border-success/20 bg-success/5 rounded-lg p-3 flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-success" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-700">daily_log_submitted.pdf</p>
                    <p className="text-[10px] text-gray-400">Submitted</p>
                  </div>
                  <button onClick={() => existing?.id && downloadLog.mutate({ reportId: existing.id, filename: 'my-daily-log.pdf' })} className="text-accent hover:text-accent-dark">
                    <Download size={14} />
                  </button>
                </div>
              ) : (
                <FileUploadZone label="Upload Daily Log" file={files.log} onChange={(f) => setFiles(p => ({ ...p, log: f }))} />
              )}
            </div>
          </div>
        )}

        {(files.report || files.log) && !uploaded && !submitMutation.isSuccess && (
          <button onClick={handleUpload} disabled={submitMutation.isPending} className="btn-primary mt-4 w-full justify-center py-2.5 text-sm animate-fade-in">
            {submitMutation.isPending
              ? <><Loader2 size={15} className="animate-spin" /> Uploading…</>
              : <><Upload size={15} /> Submit Files</>}
          </button>
        )}
      </div>

      {/* ── Evaluation panel (only when supervisor has reviewed) ── */}
      {evaluation && <EvaluationPanel evaluation={evaluation} />}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export function MyReports() {
  const { data: appsPage, isLoading } = useMyApplications({ size: 50 });
  const accepted = (appsPage?.content ?? []).filter((a: any) => a.status === 'ACCEPTED');

  if (isLoading) return (
    <div className="card p-16 flex items-center justify-center">
      <Loader2 size={28} className="animate-spin text-accent" />
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">My Reports</h1>
        <p className="page-subtitle">Upload your internship reports and daily logs</p>
      </div>
      {accepted.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-4xl mb-3">📂</p>
          <p className="font-semibold text-primary">No Active Internships</p>
          <p className="text-sm text-gray-500 mt-1">You'll be able to upload reports once an application is accepted.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {accepted.map((app: any) => <ReportCard key={app.id} app={app} />)}
        </div>
      )}
    </div>
  );
}