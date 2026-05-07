import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { ChevronLeft, Download, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { evaluationSchema, type EvaluationForm } from '../../lib/schemas';
import { useEvaluationByReport, useSubmitEvaluation, useUpdateEvaluation, useDownloadReport, useDownloadDailyLog } from '../../hooks/useApi';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../../lib/api';

const gradeColor = (g: number) => g >= 16 ? '#1E8449' : g >= 14 ? '#2E86C1' : g >= 12 ? '#E67E22' : g >= 10 ? '#E67E22' : '#C0392B';
const gradeLabel = (g: number) => g >= 16 ? 'Excellent' : g >= 14 ? 'Very Good' : g >= 12 ? 'Good' : g >= 10 ? 'Sufficient' : 'Insufficient';

export function EvaluateReport() {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const rId = Number(reportId);

  const { data: report, isLoading: reportLoading } = useQuery({
    queryKey: ['reports', rId],
    queryFn: () => reportsApi.getById(rId),
    enabled: !!rId,
  });
  const { data: existing, isLoading: evalLoading } = useEvaluationByReport(rId);
  const submitEval = useSubmitEvaluation();
  const updateEval = useUpdateEvaluation();
  const downloadReport = useDownloadReport();
  const downloadLog = useDownloadDailyLog();

  const [submitted, setSubmitted] = useState(false);
  const [gradeVal, setGradeVal] = useState(12);
  const [apiError, setApiError] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<EvaluationForm>({
    resolver: zodResolver(evaluationSchema) as any,
    defaultValues: { grade: 12, technicalFeedback: '', professionalFeedback: '', generalComments: '', companyFeedback: '' },
  });

  useEffect(() => {
    if (existing) {
      reset({
        grade: existing.grade, technicalFeedback: existing.technicalFeedback,
        professionalFeedback: existing.professionalFeedback, generalComments: existing.generalComments,
        companyFeedback: existing.companyFeedback,
      });
      setGradeVal(existing.grade);
    }
  }, [existing, reset]);

  const watchedGrade = watch('grade', gradeVal);
  useEffect(() => { setGradeVal(Number(watchedGrade)); }, [watchedGrade]);

  if (reportLoading || evalLoading) return <div className="card p-16 flex items-center justify-center"><Loader2 size={28} className="animate-spin text-accent" /></div>;
  if (!report) return <div className="card p-16 text-center"><p className="text-gray-500">Report not found.</p><button onClick={() => navigate(-1)} className="btn-outline mt-4 text-sm">Go back</button></div>;

  const onSubmit = async (data: EvaluationForm) => {
    setApiError(null);
    try {
      if (existing) await updateEval.mutateAsync({ id: existing.id, data });
      else await submitEval.mutateAsync({ reportId: rId, data });
      setSubmitted(true);
    } catch (err: any) {
      setApiError(err?.response?.data?.message ?? 'Failed to submit evaluation.');
    }
  };

  const saving = submitEval.isPending || updateEval.isPending;

  if (submitted) return (
    <div className="max-w-lg mx-auto card p-12 text-center animate-scale-in">
      <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 size={32} className="text-success" /></div>
      <h2 className="font-display text-xl font-700 text-primary mb-2">Evaluation Submitted!</h2>
      <p className="text-gray-500 text-sm mb-6">
        You gave <strong>{report.studentName}</strong> a grade of <strong style={{ color: gradeColor(gradeVal) }}>{gradeVal}/20</strong> — {gradeLabel(gradeVal)}.
      </p>
      <div className="flex gap-3 justify-center">
        <button onClick={() => navigate('/supervisor/reports')} className="btn-primary text-sm">Back to Queue</button>
        <button onClick={() => navigate('/supervisor/evaluations')} className="btn-outline text-sm">All Evaluations</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors"><ChevronLeft size={16} /> Back to reports</button>
      <div className="flex items-start justify-between gap-4">
        <div><h1 className="page-title">Evaluate Report</h1><p className="page-subtitle">{report.studentName} · {report.offerTitle}</p></div>
        {existing && <span className="badge-blue text-xs">Editing existing evaluation</span>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Report viewer */}
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-semibold text-primary mb-4">Report Files</h2>
            <div className="space-y-3">
              {report.hasReport ? (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-primary">Internship Report</p>
                    <button onClick={() => downloadReport.mutate({ reportId: rId, filename: `report_${report.studentName}.pdf` })} className="flex items-center gap-1.5 text-xs text-accent hover:underline font-medium"><Download size={12} /> Download</button>
                  </div>
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300">
                    <span className="text-3xl">📄</span>
                    <p className="text-xs text-gray-500 font-medium">internship_report.pdf</p>
                    <p className="text-[11px] text-gray-400">{((report.reportFileSizeBytes ?? 0) / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-center text-gray-400 text-sm">No report file uploaded</div>
              )}
              {report.hasDailyLog && (
                <button onClick={() => downloadLog.mutate({ reportId: rId, filename: `daily_log_${report.studentName}.pdf` })} className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-accent/40 transition-all text-left">
                  <Download size={16} className="text-accent flex-shrink-0" />
                  <div><p className="text-sm font-medium text-primary">Daily Log</p><p className="text-xs text-gray-400">Click to download</p></div>
                </button>
              )}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold text-primary mb-3">Submission Details</h2>
            <div className="space-y-2 text-sm">
              {[
                { l: 'Student',   v: report.studentName },
                { l: 'Submitted', v: report.submittedAt ? new Date(report.submittedAt).toLocaleDateString('en-GB', { dateStyle: 'long' }) : 'N/A' },
                { l: 'Deadline',  v: new Date(report.submissionDeadline).toLocaleDateString('en-GB', { dateStyle: 'long' }) },
                { l: 'Status',    v: report.isLate ? '⚠️ Late' : '✅ On time' },
              ].map(({ l, v }) => (
                <div key={l} className="flex justify-between border-b border-gray-50 pb-2 last:border-0">
                  <span className="text-gray-500">{l}</span><span className="font-medium text-primary">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Evaluation form */}
        <div className="card p-5">
          <h2 className="font-semibold text-primary mb-5">Evaluation Form</h2>
          {apiError && <div className="p-3 bg-danger/8 rounded-lg border border-danger/20 mb-4 text-xs text-danger">{apiError}</div>}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="label">Grade (0–20) *</label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold font-mono" style={{ color: gradeColor(gradeVal) }}>{Number(gradeVal).toFixed(1)}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: gradeColor(gradeVal), background: `${gradeColor(gradeVal)}18` }}>{gradeLabel(gradeVal)}</span>
                </div>
              </div>
              <input type="range" min={0} max={20} step={0.5}
                style={{ '--val': `${(gradeVal / 20) * 100}%` } as React.CSSProperties}
                {...register('grade')}
                onChange={e => { setValue('grade', Number(e.target.value)); setGradeVal(Number(e.target.value)); }}
                className="w-full" />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono">
                {[0, 5, 10, 12, 14, 16, 20].map(v => <span key={v}>{v}</span>)}
              </div>
              {errors.grade && <p className="text-xs text-danger mt-1">{errors.grade.message}</p>}
            </div>

            {[
              { name: 'technicalFeedback',    label: 'Technical Feedback *',  placeholder: 'Comment on technical skills, tools used, problem-solving…' },
              { name: 'professionalFeedback', label: 'Professional Feedback', placeholder: 'Punctuality, communication, teamwork…' },
              { name: 'companyFeedback',      label: 'Company Feedback',      placeholder: 'Feedback received from the host company…' },
              { name: 'generalComments',      label: 'General Comments',      placeholder: 'Any other observations…' },
            ].map(({ name, label, placeholder }) => (
              <div key={name}>
                <label className="label">{label}</label>
                <textarea {...register(name as keyof EvaluationForm)} rows={3} placeholder={placeholder}
                  className={`input resize-none leading-relaxed ${errors[name as keyof EvaluationForm] ? 'input-error' : ''}`} />
                {errors[name as keyof EvaluationForm] && <p className="text-xs text-danger mt-1">{(errors[name as keyof EvaluationForm] as any)?.message}</p>}
              </div>
            ))}

            <button type="submit" disabled={saving} className="btn-primary w-full justify-center py-3 text-sm font-semibold">
              {saving ? <><Loader2 size={15} className="animate-spin" /> Submitting…</> : <><Send size={15} /> {existing ? 'Update Evaluation' : 'Submit Evaluation'}</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
