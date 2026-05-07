import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { Shield, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { loginSchema, type LoginForm } from '../lib/schemas';
import { useLogin } from '../hooks/useApi';

const DEMO_ACCOUNTS = [
  { label: 'Student',    email: 'ahmed.benali@enscs.dz', password: 'password123' },
  { label: 'Supervisor', email: 'dr.meziane@enscs.dz',   password: 'password123' },
  { label: 'Admin',      email: 'admin@enscs.dz',        password: 'password123' },
];

const ROLE_DEST: Record<string, string> = {
  STUDENT: '/student/dashboard', SUPERVISOR: '/supervisor/dashboard', ADMIN: '/admin/dashboard'
};

export function Login() {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const [showPass, setShowPass] = useState(false);
  const [demoRole, setDemoRole] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, setValue, setError } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema) as any,
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await loginMutation.mutateAsync(data);
      navigate(ROLE_DEST[res.role] ?? '/login');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Invalid email or password.';
      setError('root', { message: msg });
    }
  };

  const fillDemo = (d: typeof DEMO_ACCOUNTS[0]) => {
    setValue('email', d.email);
    setValue('password', d.password);
    setDemoRole(d.label);
  };

  return (
    <div className="auth-container flex items-center justify-center p-4">
      <div className="auth-grid pointer-events-none" />
      <div className="w-full max-w-md animate-slide-in-u relative z-10">
        <div className="text-center mb-8">
          <div className="auth-logo mx-auto mb-4"><Shield size={32} className="text-white" /></div>
          <h1 className="font-display text-3xl font-700 text-white">ENSCS Portal</h1>
          <p className="text-white/60 mt-1 text-sm">Internship Management System</p>
        </div>

        <div className="auth-card p-8">
          <h2 className="text-xl font-semibold text-primary mb-1">Welcome back</h2>
          <p className="text-sm text-gray-500 mb-6">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 auth-form">
            {errors.root && (
              <div className="flex items-start gap-2 p-3 bg-danger/8 rounded-lg border border-danger/20">
                <AlertCircle size={15} className="text-danger flex-shrink-0 mt-0.5" />
                <p className="text-xs text-danger">{errors.root.message}</p>
              </div>
            )}

            <div>
              <label className="label">Email Address</label>
              <input {...register('email')} type="email" placeholder="your.email@enscs.dz" className={`input w-full ${errors.email ? 'input-error' : ''}`} />
              {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPass ? 'text' : 'password'} placeholder="Enter your password" className={`input w-full pr-10 ${errors.password ? 'input-error' : ''}`} />
                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-danger mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-accent" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-accent hover:underline font-medium">Forgot password?</a>
            </div>

            <button type="submit" disabled={loginMutation.isPending} className="auth-submit-btn w-full flex items-center justify-center gap-2">
              {loginMutation.isPending ? (
                <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" /></svg> Signing in…</>
              ) : (
                <><LogIn size={16} /> Sign In</>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-3">Try a demo account (requires backend)</p>
            <div className="grid grid-cols-3 gap-3">
              {DEMO_ACCOUNTS.map(d => (
                <button key={d.label} onClick={() => fillDemo(d)} className={`demo-btn ${demoRole === d.label ? 'active' : ''}`}>{d.label}</button>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            New student?{' '}<Link to="/register" className="text-accent font-medium hover:underline">Create account</Link>
          </p>
        </div>
        <p className="text-center text-white/30 text-xs mt-6">© 2026 National School of Cybersecurity · NSCS</p>
      </div>
    </div>
  );
}
