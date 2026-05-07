import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { Shield, Eye, EyeOff, ChevronRight, ChevronLeft, Check, AlertCircle } from 'lucide-react';
import { registerSchema, type RegisterForm } from '../lib/schemas';
import { useRegister } from '../hooks/useApi';

const STEPS = ['Personal Info', 'Role & Details', 'Confirm'];
const ROLE_DEST: Record<string, string> = { STUDENT: '/student/dashboard', SUPERVISOR: '/supervisor/dashboard' };

export function Register() {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const [step, setStep] = useState(0);
  const [showPass, setShowPass] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const { register, handleSubmit, watch, trigger, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: { role: 'STUDENT' },
  });

  const role = watch('role');
  const firstName = watch('firstName');
  const lastName = watch('lastName');
  const email = watch('email');

  const stepFields: (keyof RegisterForm)[][] = [
    ['firstName', 'lastName', 'email'],
    [
      'password', 'confirmPassword', 'role',
      ...(role === 'STUDENT'     ? ['matricule', 'department', 'yearOfStudy'] as (keyof RegisterForm)[] : []),
      ...(role === 'SUPERVISOR'  ? ['specialization'] as (keyof RegisterForm)[] : []),
    ],
  ];

  const nextStep = async () => {
    const valid = await trigger(stepFields[step]);
    if (valid) { setStep(s => Math.min(s + 1, 2)); setApiError(null); }
  };

  const onSubmit = async (data: any) => {
    setApiError(null);
    try {
      const res = await registerMutation.mutateAsync({
        firstName: data.firstName, lastName: data.lastName,
        email: data.email, password: data.password,
        role: data.role,
        // Student fields
        matricule: data.matricule, department: data.department,
        yearOfStudy: data.yearOfStudy, phoneNumber: data.phoneNumber,
        // Supervisor fields
        specialization: data.specialization, officeNumber: data.officeNumber,
      });
      navigate(ROLE_DEST[res.role] ?? '/login');
    } catch (err: any) {
      setApiError(err?.response?.data?.message ?? 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-container flex items-center justify-center p-4">
      <div className="auth-grid pointer-events-none" />
      <div className="w-full max-w-md animate-slide-in-u relative z-10">
        <div className="text-center mb-8">
          <div className="auth-logo mx-auto mb-4"><Shield size={32} className="text-white" /></div>
          <h1 className="font-display text-3xl font-700 text-white">Create Account</h1>
          <p className="text-white/60 mt-1 text-sm">Join the ENSCS Internship Portal</p>
        </div>

        <div className="auth-card p-8">
          <div className="step-indicator mb-8">
            {STEPS.map((s, i) => (
              <div key={i} className="step-item">
                <div className="flex flex-col items-center gap-2">
                  <div className={`step-circle ${i < step ? 'completed' : i === step ? 'active' : 'pending'}`}>
                    {i < step ? <Check size={16} /> : i + 1}
                  </div>
                  <span className={`text-[11px] font-semibold whitespace-nowrap ${i === step ? 'text-primary' : i < step ? 'text-success' : 'text-gray-400'}`}>{s}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`step-line ${i < step ? 'completed' : 'pending'}`} />}
              </div>
            ))}
          </div>

          {apiError && (
            <div className="flex items-start gap-2 p-3 bg-danger/8 rounded-lg border border-danger/20 mb-4">
              <AlertCircle size={15} className="text-danger flex-shrink-0 mt-0.5" />
              <p className="text-xs text-danger">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
            {step === 0 && (
              <div className="space-y-5 animate-fade-in">
                <h3 className="font-semibold text-primary text-lg">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">First Name</label>
                    <input {...register('firstName')} placeholder="Ahmed" className={`input w-full ${errors.firstName ? 'input-error' : ''}`} />
                    {errors.firstName && <p className="text-xs text-danger mt-1">{errors.firstName.message}</p>}
                  </div>
                  <div>
                    <label className="label">Last Name</label>
                    <input {...register('lastName')} placeholder="Benali" className={`input w-full ${errors.lastName ? 'input-error' : ''}`} />
                    {errors.lastName && <p className="text-xs text-danger mt-1">{errors.lastName.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="label">Institutional Email</label>
                  <input {...register('email')} type="email" placeholder="firstname.lastname@enscs.dz" className={`input w-full ${errors.email ? 'input-error' : ''}`} />
                  {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5 animate-fade-in">
                <h3 className="font-semibold text-primary text-lg">Role & Credentials</h3>
                <div>
                  <label className="label">I am a…</label>
                  <div className="grid grid-cols-2 gap-4">
                    {(['STUDENT', 'SUPERVISOR'] as const).map(r => (
                      <label key={r} className={`role-card ${role === r ? 'selected' : ''}`}>
                        <input type="radio" value={r} {...register('role')} className="sr-only" />
                        <div className="text-center">
                          <div className="text-3xl mb-2">{r === 'STUDENT' ? '🎓' : '👨‍🏫'}</div>
                          <span className={`text-sm font-semibold ${role === r ? 'text-accent' : 'text-gray-600'}`}>{r === 'STUDENT' ? 'Student' : 'Supervisor'}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                {role === 'STUDENT' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">Matricule *</label>
                        <input {...register('matricule')} placeholder="NSC2024001" className={`input w-full ${errors.matricule ? 'input-error' : ''}`} />
                        {errors.matricule && <p className="text-xs text-danger mt-1">{errors.matricule.message}</p>}
                      </div>
                      <div>
                        <label className="label">Year of Study *</label>
                        <input {...register('yearOfStudy')} type="number" min={1} max={5} placeholder="3" className={`input w-full ${errors.yearOfStudy ? 'input-error' : ''}`} />
                        {errors.yearOfStudy && <p className="text-xs text-danger mt-1">{errors.yearOfStudy.message}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="label">Department *</label>
                      <input {...register('department')} placeholder="Cybersecurity" className={`input w-full ${errors.department ? 'input-error' : ''}`} />
                      {errors.department && <p className="text-xs text-danger mt-1">{errors.department.message}</p>}
                    </div>
                    <div>
                      <label className="label">Phone Number <span className="text-gray-400 font-normal">(optional)</span></label>
                      <input {...register('phoneNumber')} type="tel" placeholder="+213 555 123 456" className="input w-full" />
                    </div>
                  </div>
                )}
                {role === 'SUPERVISOR' && (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <label className="label">Specialization *</label>
                      <input {...register('specialization')} placeholder="e.g. Network Security" className={`input w-full ${errors.specialization ? 'input-error' : ''}`} />
                      {errors.specialization && <p className="text-xs text-danger mt-1">{errors.specialization.message}</p>}
                    </div>
                    <div>
                      <label className="label">Office Number <span className="text-gray-400 font-normal">(optional)</span></label>
                      <input {...register('officeNumber')} placeholder="e.g. B204" className="input w-full" />
                    </div>
                  </div>
                )}
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <input {...register('password')} type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters" className={`input w-full pr-10 ${errors.password ? 'input-error' : ''}`} />
                    <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-danger mt-1">{errors.password.message}</p>}
                </div>
                <div>
                  <label className="label">Confirm Password</label>
                  <input {...register('confirmPassword')} type="password" placeholder="Repeat password" className={`input w-full ${errors.confirmPassword ? 'input-error' : ''}`} />
                  {errors.confirmPassword && <p className="text-xs text-danger mt-1">{errors.confirmPassword.message}</p>}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-fade-in">
                <h3 className="font-semibold text-primary text-lg mb-4">Confirm Details</h3>
                <div className="bg-muted rounded-xl p-5 space-y-4">
                  {[{ l: 'Full Name', v: `${firstName} ${lastName}` }, { l: 'Email', v: email }, { l: 'Role', v: role }].map(({ l, v }) => (
                    <div key={l} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-500">{l}</span>
                      <span className="font-semibold text-primary">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-success/8 rounded-xl border border-success/20 flex items-start gap-3">
                  <Check size={16} className="text-success mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-success">By creating an account you agree to the ENSCS internship platform terms of use.</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-8">
              {step > 0 && (
                <button type="button" onClick={() => setStep(s => s - 1)} className="btn-outline flex-1 justify-center py-3 text-sm font-medium">
                  <ChevronLeft size={16} /> Back
                </button>
              )}
              {step < 2 ? (
                <button type="button" onClick={nextStep} className="auth-submit-btn flex-1 flex items-center justify-center gap-2">
                  Continue <ChevronRight size={16} />
                </button>
              ) : (
                <button type="submit" disabled={registerMutation.isPending} className="auth-submit-btn flex-1 flex items-center justify-center gap-2">
                  {registerMutation.isPending ? (
                    <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" /></svg> Creating…</>
                  ) : <><Check size={16} /> Create Account</>}
                </button>
              )}
            </div>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}<Link to="/login" className="text-accent font-medium hover:underline">Sign in</Link>
          </p>
        </div>
        <p className="text-center text-white/30 text-xs mt-6">© 2026 National School of Cybersecurity · NSCS</p>
      </div>
    </div>
  );
}
