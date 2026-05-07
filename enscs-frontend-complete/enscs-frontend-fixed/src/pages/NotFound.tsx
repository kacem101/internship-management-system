import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function NotFound() {
  const { user } = useAuthStore();
  const home = user?.role === 'ADMIN' ? '/admin/dashboard' : user?.role === 'SUPERVISOR' ? '/supervisor/dashboard' : '/student/dashboard';

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="text-center animate-fade-in">
        <p className="text-8xl font-display font-700 text-primary/10 leading-none">404</p>
        <h1 className="font-display text-2xl font-700 text-primary mt-2">Page not found</h1>
        <p className="text-gray-500 mt-2 text-sm">The page you're looking for doesn't exist.</p>
        <Link to={user ? home : '/login'} className="btn-primary mt-6 inline-flex">
          {user ? 'Back to Dashboard' : 'Go to Login'}
        </Link>
      </div>
    </div>
  );
}
