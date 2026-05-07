import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import { AppShell } from './components/AppShell';
import { RoleGuard } from './components/RoleGuard';
import { Login }    from './pages/Login';
import { Register } from './pages/Register';
import { NotFound } from './pages/NotFound';
import { StudentDashboard } from './pages/student/Dashboard';
import { BrowseOffers }     from './pages/student/BrowseOffers';
import { OfferDetail }      from './pages/student/OfferDetail';
import { MyApplications }   from './pages/student/MyApplications';
import { MyReports }        from './pages/student/MyReports';
import { AdminDashboard }      from './pages/admin/Dashboard';
import { ManageOffers }        from './pages/admin/ManageOffers';
import { ReviewApplications }  from './pages/admin/ReviewApplications';
import { ReportsOverview }     from './pages/admin/ReportsOverview';
import { AuditLog } from './pages/admin/AuditLog';
import { UserManagement }      from './pages/admin/UserManagement';
import { SupervisorDashboard } from './pages/supervisor/Dashboard';
import { ReportsQueue }        from './pages/supervisor/ReportsQueue';
import { EvaluateReport }      from './pages/supervisor/EvaluateReport';
import { EvaluationHistory }   from './pages/supervisor/EvaluationHistory';

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 300000, retry: 1 } } });
const ROLE_HOME: Record<string, string> = { STUDENT:'/student/dashboard', SUPERVISOR:'/supervisor/dashboard', ADMIN:'/admin/dashboard' };

function AuthRedirect() {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated && user) return <Navigate to={ROLE_HOME[user.role]} replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthRedirect />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<RoleGuard allowedRoles={['STUDENT']}><AppShell /></RoleGuard>}>
            <Route path="/student/dashboard"    element={<StudentDashboard />} />
            <Route path="/student/offers"       element={<BrowseOffers />} />
            <Route path="/student/offers/:id"   element={<OfferDetail />} />
            <Route path="/student/applications" element={<MyApplications />} />
            <Route path="/student/reports"      element={<MyReports />} />
          </Route>
          <Route element={<RoleGuard allowedRoles={['ADMIN']}><AppShell /></RoleGuard>}>
            <Route path="/admin/dashboard"    element={<AdminDashboard />} />
            <Route path="/admin/offers"       element={<ManageOffers />} />
            <Route path="/admin/applications" element={<ReviewApplications />} />
            <Route path="/admin/reports"      element={<ReportsOverview />} />
            <Route path="/admin/users"        element={<UserManagement />} />
            <Route path="/admin/audit-log"     element={<AuditLog />} />
          </Route>
          <Route element={<RoleGuard allowedRoles={['SUPERVISOR']}><AppShell /></RoleGuard>}>
            <Route path="/supervisor/dashboard"                  element={<SupervisorDashboard />} />
            <Route path="/supervisor/reports"                    element={<ReportsQueue />} />
            <Route path="/supervisor/reports/:reportId/evaluate" element={<EvaluateReport />} />
            <Route path="/supervisor/evaluations"                element={<EvaluationHistory />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
