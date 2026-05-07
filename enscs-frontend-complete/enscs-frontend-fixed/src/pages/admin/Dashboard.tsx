import { Briefcase, ClipboardList, AlertTriangle, Users, TrendingUp, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { StatsCard } from '../../components/StatsCard';
import { StatusBadge } from '../../components/StatusBadge';
import { useOffers, useAllApplications, useSubmittedReports, useOverdueReports, useUsers } from '../../hooks/useApi';

const PIE_COLORS: Record<string, string> = {
  PENDING: '#E67E22', UNDER_REVIEW: '#2E86C1', ACCEPTED: '#1E8449',
  REJECTED: '#C0392B', WITHDRAWN: '#9CA3AF',
};
const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending', UNDER_REVIEW: 'Under Review', ACCEPTED: 'Accepted',
  REJECTED: 'Rejected', WITHDRAWN: 'Withdrawn',
};

export function AdminDashboard() {
  const { data: openOffers,   isLoading: offersLoading } = useOffers({ status: 'OPEN', size: 5 });
  const { data: allOffers }                              = useOffers({ size: 1 });
  const { data: allAppsPage,  isLoading: appsLoading }   = useAllApplications({ size: 200 });
  const { data: reportsPage }                            = useSubmittedReports({ size: 1 });
  const { data: overdueReports }                         = useOverdueReports({ size: 10 });
  const { data: usersPage }                              = useUsers({ size: 200 });

  // Build real pie data from application statuses
  const apps = allAppsPage?.content ?? [];
  const statusCounts = apps.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(statusCounts).map(([status, value]) => ({
    name: STATUS_LABELS[status] ?? status,
    value,
    color: PIE_COLORS[status] ?? '#9CA3AF',
  }));

  // Real stats
  const pendingCount   = statusCounts['PENDING'] ?? 0;
  const overdueCount   = overdueReports?.totalElements ?? 0;
  const totalOffers    = allOffers?.totalElements ?? 0;
  const openCount      = openOffers?.totalElements ?? 0;
  const totalApps      = allAppsPage?.totalElements ?? 0;
  const recentApps     = apps.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">ENSCS Internship Management Overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatsCard label="Total Offers"    value={offersLoading ? '…' : totalOffers} icon={Briefcase}     iconBg="bg-primary/10"  iconColor="text-primary"  delay={0} />
        <StatsCard label="Open Offers"     value={offersLoading ? '…' : openCount}   icon={TrendingUp}    iconBg="bg-success/10"  iconColor="text-success"  delay={50} />
        <StatsCard label="Applications"    value={appsLoading   ? '…' : totalApps}   icon={ClipboardList} iconBg="bg-accent/10"   iconColor="text-accent"   delay={100} />
        <StatsCard label="Pending Review"  value={appsLoading   ? '…' : pendingCount} icon={Users}        iconBg="bg-warning/10"  iconColor="text-warning"  delay={150} />
        <StatsCard label="Overdue Reports" value={overdueCount}                       icon={AlertTriangle} iconBg="bg-danger/10"   iconColor="text-danger"   delay={200} />
      </div>

      {/* Overdue alert */}
      {overdueCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-danger/8 border border-danger/20 rounded-card animate-fade-in">
          <AlertTriangle size={18} className="text-danger flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-danger">{overdueCount} reports are overdue</p>
            <p className="text-xs text-gray-500">Students have missed their submission deadlines.</p>
          </div>
          <Link to="/admin/reports" className="text-xs font-semibold text-danger hover:underline flex items-center gap-1 flex-shrink-0">
            View <ChevronRight size={12} />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie chart — real data */}
        <div className="card p-5 animate-slide-in-u" style={{ animationDelay: '100ms' }}>
          <h2 className="section-title mb-4">Applications by Status</h2>
          {appsLoading ? (
            <div className="flex justify-center py-12"><Loader2 size={22} className="animate-spin text-accent" /></div>
          ) : pieData.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">No applications yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v} applications`, '']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Open offers table */}
        <div className="lg:col-span-2 card p-5 animate-slide-in-u" style={{ animationDelay: '150ms' }}>
          <div className="section-header">
            <h2 className="section-title">Open Offers</h2>
            <Link to="/admin/offers" className="text-xs text-accent hover:underline flex items-center gap-1 font-medium">
              Manage <ChevronRight size={12} />
            </Link>
          </div>
          {offersLoading ? (
            <div className="flex justify-center py-8"><Loader2 size={22} className="animate-spin text-accent" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-gray-100">
                  <th className="table-header">Title</th>
                  <th className="table-header hidden md:table-cell">Company</th>
                  <th className="table-header">Status</th>
                </tr></thead>
                <tbody>
                  {(openOffers?.content ?? []).map(o => (
                    <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                      <td className="table-cell font-medium text-sm text-primary max-w-[160px] truncate">{o.title}</td>
                      <td className="table-cell hidden md:table-cell text-xs text-gray-500">{o.companyName}</td>
                      <td className="table-cell"><StatusBadge status={o.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(openOffers?.content ?? []).length === 0 && (
                <div className="py-8 text-center text-gray-400 text-sm">No open offers</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent applications */}
      {recentApps.length > 0 && (
        <div className="card p-5 animate-slide-in-u" style={{ animationDelay: '200ms' }}>
          <div className="section-header">
            <h2 className="section-title">Recent Applications</h2>
            <Link to="/admin/applications" className="text-xs text-accent hover:underline flex items-center gap-1 font-medium">
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-100">
                <th className="table-header">Student</th>
                <th className="table-header hidden md:table-cell">Offer</th>
                <th className="table-header">Status</th>
                <th className="table-header hidden sm:table-cell">Applied</th>
              </tr></thead>
              <tbody>
                {recentApps.map(app => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium text-sm text-primary">{app.studentName}</td>
                    <td className="table-cell hidden md:table-cell text-xs text-gray-500 max-w-[160px] truncate">{app.offerTitle}</td>
                    <td className="table-cell"><StatusBadge status={app.status} /></td>
                    <td className="table-cell hidden sm:table-cell text-xs text-gray-400">
                      {new Date(app.appliedAt).toLocaleDateString('en-GB')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
