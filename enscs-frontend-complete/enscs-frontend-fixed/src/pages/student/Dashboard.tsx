import { Link } from 'react-router-dom';
import { Briefcase, ClipboardList, FileText, Clock, ChevronRight, CheckCircle2, Hourglass, Loader2 } from 'lucide-react';
import { StatsCard } from '../../components/StatsCard';
import { StatusBadge } from '../../components/StatusBadge';
import { OfferCard } from '../../components/OfferCard';
import { useMyApplications, useOffers } from '../../hooks/useApi';
import { useAuthStore } from '../../store/authStore';

export function StudentDashboard() {
  const user = useAuthStore(s => s.user);
  const { data: appsPage, isLoading: appsLoading } = useMyApplications({ size: 20 });
  const { data: offersPage, isLoading: offersLoading } = useOffers({ status: 'OPEN', size: 3 });

  const apps = appsPage?.content ?? [];
  const offers = offersPage?.content ?? [];
  const accepted = apps.filter(a => a.status === 'ACCEPTED').length;
  const pending = apps.filter(a => a.status === 'PENDING' || a.status === 'UNDER_REVIEW').length;
  const openOffersCount = offersPage?.totalElements ?? 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="dashboard-hero">
        <p className="hero-greeting">{greeting},</p>
        <h1 className="hero-title">{user?.fullName} 👋</h1>
        <p className="hero-subtitle">{user?.department} · Year {user?.yearOfStudy} · {user?.matricule}</p>
        <div className="hero-actions">
          <Link to="/student/offers" className="hero-btn-primary">Browse Offers <ChevronRight size={14} /></Link>
          <Link to="/student/applications" className="hero-btn-secondary">My Applications</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard label="Total Applications" value={appsPage?.totalElements ?? 0} icon={ClipboardList} iconBg="bg-accent/10" iconColor="text-accent" delay={0} />
        <StatsCard label="Accepted"           value={accepted}      icon={CheckCircle2} iconBg="bg-success/10" iconColor="text-success" delay={50} />
        <StatsCard label="In Review"          value={pending}       icon={Hourglass}    iconBg="bg-warning/10" iconColor="text-warning" delay={100} />
        <StatsCard label="Open Offers"        value={openOffersCount} icon={Briefcase}  iconBg="bg-primary/10" iconColor="text-primary" delay={150} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent applications */}
        <div className="lg:col-span-2 card p-5 animate-slide-in-u" style={{ animationDelay: '100ms' }}>
          <div className="section-header">
            <h2 className="section-title">My Applications</h2>
            <Link to="/student/applications" className="text-xs text-accent hover:underline font-medium flex items-center gap-1">View all <ChevronRight size={12} /></Link>
          </div>
          {appsLoading ? (
            <div className="flex justify-center py-8"><Loader2 size={22} className="animate-spin text-accent" /></div>
          ) : apps.length === 0 ? (
            <div className="text-center py-8 text-gray-400"><p className="text-2xl mb-2">📋</p><p className="text-sm">No applications yet</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-gray-100">
                  <th className="table-header">Offer</th>
                  <th className="table-header">Company</th>
                  <th className="table-header">Status</th>
                  <th className="table-header hidden sm:table-cell">Applied</th>
                </tr></thead>
                <tbody>
                  {apps.slice(0, 5).map(app => (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="table-cell font-medium text-primary max-w-[180px] truncate text-sm">{app.offerTitle}</td>
                      <td className="table-cell text-gray-500 text-xs">{app.companyName}</td>
                      <td className="table-cell"><StatusBadge status={app.status} /></td>
                      <td className="table-cell hidden sm:table-cell text-gray-400 text-xs">{new Date(app.appliedAt).toLocaleDateString('en-GB')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Deadlines */}
        <div className="card p-5 animate-slide-in-u" style={{ animationDelay: '150ms' }}>
          <h2 className="section-title mb-4">Upcoming Deadlines</h2>
          {accepted === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm">No active internships yet</div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-warning">Report Submission</p>
                    <p className="text-xs text-gray-600 mt-0.5">Active internship</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1 text-[10px] text-gray-500"><Clock size={10} /> Check My Reports for deadlines</div>
              </div>
            </div>
          )}
          <Link to="/student/reports" className="mt-4 flex items-center justify-center gap-1 text-xs text-accent hover:underline font-medium">
            <FileText size={12} /> Manage reports
          </Link>
        </div>
      </div>

      {/* Featured offers */}
      <div className="animate-slide-in-u" style={{ animationDelay: '200ms' }}>
        <div className="section-header">
          <h2 className="section-title">Featured Offers</h2>
          <Link to="/student/offers" className="text-xs text-accent hover:underline font-medium flex items-center gap-1">Browse all <ChevronRight size={12} /></Link>
        </div>
        {offersLoading ? (
          <div className="flex justify-center py-8"><Loader2 size={22} className="animate-spin text-accent" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {offers.map((offer, i) => (
              <OfferCard key={offer.id} offer={offer as any}
                applied={(appsPage?.content ?? []).some(a => a.offerId === offer.id)} delay={i * 60} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
