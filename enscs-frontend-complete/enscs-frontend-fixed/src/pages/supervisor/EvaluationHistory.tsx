import { Link } from 'react-router-dom';
import { Edit2, TrendingUp, Loader2 } from 'lucide-react';
import { useMyEvaluations } from '../../hooks/useApi';

const gradeColor = (g: number) => g >= 16 ? '#1E8449' : g >= 14 ? '#2E86C1' : g >= 12 ? '#E67E22' : '#C0392B';
const gradeLabel = (g: number) => g >= 16 ? 'Excellent' : g >= 14 ? 'Very Good' : g >= 12 ? 'Good' : g >= 10 ? 'Sufficient' : 'Insufficient';

export function EvaluationHistory() {
  const { data: evalsPage, isLoading } = useMyEvaluations({ size: 50 });
  const evals = evalsPage?.content ?? [];
  const avgGrade = evals.length ? evals.reduce((s, e) => s + e.grade, 0) / evals.length : 0;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div><h1 className="page-title">Evaluation History</h1><p className="page-subtitle">{evals.length} evaluations submitted</p></div>
        {evals.length > 0 && (
          <div className="flex items-center gap-2 card px-4 py-2.5 flex-shrink-0">
            <TrendingUp size={16} className="text-accent" />
            <div>
              <p className="text-xs text-gray-500 leading-none">Avg Grade</p>
              <p className="text-base font-bold font-mono" style={{ color: gradeColor(avgGrade) }}>{avgGrade.toFixed(1)}/20</p>
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="card p-16 flex justify-center"><Loader2 size={28} className="animate-spin text-accent" /></div>
      ) : evals.length === 0 ? (
        <div className="card p-16 text-center"><p className="text-3xl mb-3">⭐</p><p className="font-semibold text-primary">No evaluations yet</p><p className="text-sm text-gray-500 mt-1">Your submitted evaluations will appear here.</p></div>
      ) : (
        <div className="space-y-4">
          {evals.map(ev => (
            <div key={ev.id} className="card p-5 animate-slide-in-u">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-semibold text-primary">{ev.studentName}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{ev.offerTitle}</p>
                  <p className="text-[11px] text-gray-400 mt-1">Evaluated {new Date(ev.evaluatedAt).toLocaleDateString('en-GB', { dateStyle: 'long' })}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-2xl font-bold font-mono leading-none" style={{ color: gradeColor(ev.grade) }}>{ev.grade}/20</p>
                    <p className="text-xs font-semibold mt-0.5" style={{ color: gradeColor(ev.grade) }}>{gradeLabel(ev.grade)}</p>
                  </div>
                  <Link to={`/supervisor/reports/${ev.reportId}/evaluate`} className="p-2 rounded-lg text-gray-400 hover:text-accent hover:bg-accent/8 transition-colors"><Edit2 size={15} /></Link>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                {[
                  { l: 'Technical Feedback',    v: ev.technicalFeedback },
                  { l: 'Professional Feedback', v: ev.professionalFeedback },
                  { l: 'Company Feedback',      v: ev.companyFeedback },
                  { l: 'General Comments',      v: ev.generalComments },
                ].filter(item => item.v).map(({ l, v }) => (
                  <div key={l}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">{l}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{v}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(ev.grade / 20) * 100}%`, background: gradeColor(ev.grade) }} />
                  </div>
                  <span className="text-xs font-mono text-gray-500">{((ev.grade / 20) * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
