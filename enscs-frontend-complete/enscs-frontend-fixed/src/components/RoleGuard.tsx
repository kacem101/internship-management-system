import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface Props {
  allowedRoles: string[];
  children: React.ReactNode;
}

const ROLE_HOME: Record<string, string> = {
  STUDENT: '/student/dashboard',
  SUPERVISOR: '/supervisor/dashboard',
  ADMIN: '/admin/dashboard',
};

export function RoleGuard({ allowedRoles, children }: Props) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to={ROLE_HOME[user.role] ?? '/login'} replace />;
  return <>{children}</>;
}
