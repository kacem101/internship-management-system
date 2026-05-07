import { Link } from 'react-router-dom';
import { BookOpen, Star, Clock, ChevronRight, Loader2 } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';
import { StatsCard } from '../../components/StatsCard';
import { useMyEvaluations, useSubmittedReports } from '../../hooks/useApi';
import { useAuthStore } from '../../store/authStore';

const gradeColor = (g: number) => g >= 16 ? '#1E8449' : g >= 14 ? '#2E86C1' : g >= 12 ? '#E67E22' : '#C0392B';
const gradeLabel = (g: number) => g >= 16 ? 'Excellent' : g >= 14 ? 'Very Good' : g >= 12 ? 'Good' : g >= 10 ? 'Sufficient' : 'Insufficient';

export function SupervisorDashboard() {
  const user = useAuthStore(s => s.user);
  const { data: evalsPage, isLoading: evalsLoading } = useMyEvaluations({ size: 50 });
  const { data: reportsPage, isLoading: reportsLoading } = useSubmittedReports({ size: 20 });

  const evals = evalsPage?.content ?? [];
  const reports = reportsPage?.content ?? [];
  const evaluatedIds = new Set(evals.map(e => e.reportId));
  const pendingReports = reports.filter(r => r.submittedAt && !evaluatedIds.has(r.id));
  const avgGrade = evals.length ? evals.reduce((sum, e) => sum + e.grade, 0) / evals.length : 0;

  const gaugeData = [{ name: 'Avg Grade', value: Number(avgGrade.toFixed(1)), fill: gradeColor(avgGrade) }];

  return (
    <div className="space-y-6">
      <div className="dashboard-hero">
        <p className="hero-greeting">Welcome back,</p>
        <h1 className="hero-title">{user?.fullName} 👋</h1>
        <p className="hero-subtitle">{user?.specialization ?? 'Supervisor'} · NSCS</p>
        <div className="hero-actions">
          <Link to="/supervisor/reports" className="hero-btn-primary">Reports Queue <ChevronRight size={14} /></Link>
          <Link to="/supervisor/evaluations" className="hero-btn-secondary">My Evaluations</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatsCard label="Reports Assigned" value={reports.length}        icon={BookOpen} iconBg="bg-primary/10" iconColor="text-primary"  delay={0} />
        <StatsCard label="Evaluated"        value={evals.length}          icon={Star}     iconBg="bg-success/10" iconColor="text-success"  delay={60} />
        <StatsCard label="Pending"          value={pendingReports.length} icon={Clock}    iconBg="bg-warning/10" iconColor="text-warning"  delay={120} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5 flex flex-col items-center animate-slide-in-u" style={{ animationDelay: '100ms' }}>
          <h2 className="section-title self-start mb-4">Average Grade</h2>
          {evalsLoading ? <div className="flex justify-center py-8"><Loader2 size={22} className="animate-spin text-accent" /></div> : evals.length === 0 ? (
            <div className="text-center py-8 text-gray-400"><p className="text-2xl mb-2">⭐</p><p className="text-sm">No evaluations yet</p></div>
          ) : (
            <>
              <div className="relative w-48 h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="80%" innerRadius="70%" outerRadius="100%" startAngle={180} endAngle={0} data={gaugeData}>
                    <RadialBar dataKey="value" cornerRadius={8} background={{ fill: '#f1f5f9' }} />
                    <Tooltip formatter={(v: number) => [`${v}/20`, 'Average Grade']} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
                  <p className="text-3xl font-bold font-display" style={{ color: gradeColor(avgGrade) }}>{avgGrade.toFixed(1)}</p>
                  <p className="text-xs font-semibold text-gray-500">{gradeLabel(avgGrade)}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 w-full text-center">
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-lg font-bold text-primary font-display">{evals.length}</p><p className="text-[11px] text-gray-500">Evaluated</p></div>
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-lg font-bold text-warning font-display">{pendingReports.length}</p><p className="text-[11px] text-gray-500">Pending</p></div>
              </div>
            </>
          )}
        </div>

        <div className="lg:col-span-2 card p-5 animate-slide-in-u" style={{ animationDelay: '150ms' }}>
          <div className="section-header">
            <h2 className="section-title">Pending Evaluations</h2>
            <Link to="/supervisor/reports" className="text-xs text-accent hover:underline font-medium flex items-center gap-1">View all <ChevronRight size={12} /></Link>
          </div>
          {reportsLoading ? <div className="flex justify-center py-8"><Loader2 size={22} className="animate-spin text-accent" /></div> : (
            <div className="space-y-3">
              {pendingReports.slice(0, 5).map(report => (
                <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-accent/30 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-accent/10 rounded-lg flex items-center justify-center"><BookOpen size={16} className="text-accent" /></div>
                    <div>
                      <p className="font-medium text-sm text-primary">{report.studentName}</p>
                      <p className="text-xs text-gray-500">{report.offerTitle}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Submitted {report.submittedAt ? new Date(report.submittedAt).toLocaleDateString('en-GB') : '—'}</p>
                    </div>
                  </div>
                  <Link to={`/supervisor/reports/${report.id}/evaluate`} className="btn-accent text-xs px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-all">Evaluate</Link>
                </div>
              ))}
              {pendingReports.length === 0 && <div className="text-center py-8 text-gray-400"><p className="text-2xl mb-2">🎉</p><p className="text-sm">All caught up!</p></div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
