// src/hooks/useApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  authApi, 
  offersApi, 
  applicationsApi, 
  reportsApi, 
  evaluationsApi, 
  notificationsApi, // From api.ts
  auditApi,         // From api.ts
  usersApi,         // Fixed name
  downloadBlob,
  type LoginRequest, 
  type RegisterRequest, 
  type OfferRequest,
  type EvaluationRequest 
} from '../lib/api';
import { useAuthStore } from '../store/authStore';

// ── Query key factory ─────────────────────────────────────────────────────────
export const QK = {
  offers:             (p?: object) => ['offers', p] as const,
  offer:              (id: number) => ['offers', id] as const,
  applications:       (p?: object) => ['applications', p] as const,
  application:        (id: number) => ['applications', id] as const,
  myApplications:     (studentId: number, p?: object) => ['applications', 'student', studentId, p] as const,
  offerApps:          (offerId: number, p?: object) => ['applications', 'offer', offerId, p] as const,
  allApplications:    (p?: object) => ['applications', 'all', p] as const,
  reports:            (p?: object) => ['reports', p] as const,
  report:             (id: number) => ['reports', id] as const,
  reportByApp:        (appId: number) => ['reports', 'application', appId] as const,
  overdueReports:     () => ['reports', 'overdue'] as const,
  evaluations:        (supervisorId: number) => ['evaluations', 'supervisor', supervisorId] as const,
  evaluationByReport: (reportId: number) => ['evaluations', 'report', reportId] as const,
  users:              (p?: object) => ['users', p] as const,
  user:               (id: number) => ['users', id] as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// AUTH — AuthResponse now includes `id`, so we store it directly
// ─────────────────────────────────────────────────────────────────────────────

export function useLogin() {
  const loginStore = useAuthStore(s => s.login);
  const setUser    = useAuthStore(s => s.setUser);
  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: async (res) => {
      // Store basic info from login response immediately
      loginStore(res.token, {
        id: res.id, email: res.email, fullName: res.fullName, role: res.role,
      });
      // Hydrate role-specific fields (specialization, matricule, etc.) from /me
      try {
        const me = await usersApi.me();
        setUser({
          id: me.id, email: me.email,
          fullName: `${me.firstName} ${me.lastName}`,
          role: res.role,
          matricule: me.matricule, department: me.department,
          yearOfStudy: me.yearOfStudy, phoneNumber: me.phoneNumber,
          specialization: me.specialization, officeNumber: me.officeNumber,
        });
      } catch { /* non-critical */ }
    },
  });
}

export function useRegister() {
  const loginStore = useAuthStore(s => s.login);
  const setUser    = useAuthStore(s => s.setUser);
  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: async (res) => {
      loginStore(res.token, {
        id: res.id, email: res.email, fullName: res.fullName, role: res.role,
      });
      try {
        const me = await usersApi.me();
        setUser({
          id: me.id, email: me.email,
          fullName: `${me.firstName} ${me.lastName}`,
          role: res.role,
          matricule: me.matricule, department: me.department,
          yearOfStudy: me.yearOfStudy, phoneNumber: me.phoneNumber,
          specialization: me.specialization, officeNumber: me.officeNumber,
        });
      } catch { /* non-critical */ }
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────────────────────────────────────

export function useUsers(params?: { role?: string; page?: number; size?: number }) {
  return useQuery({
    queryKey: QK.users(params),
    queryFn: () => usersApi.getAll(params),
  });
}

export function useSetUserEnabled() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) => usersApi.setEnabled(id, enabled),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// OFFERS
// ─────────────────────────────────────────────────────────────────────────────

export function useOffers(params?: { status?: string; page?: number; size?: number }) {
  return useQuery({
    queryKey: QK.offers(params),
    queryFn: () => offersApi.getAll(params),
    staleTime: 60_000,
  });
}

export function useSearchOffers(keyword: string, params?: { status?: string; page?: number; size?: number }) {
  return useQuery({
    queryKey: ['offers', 'search', keyword, params],
    queryFn: () => offersApi.search(keyword, params),
    enabled: keyword.length > 0,
    staleTime: 30_000,
  });
}

export function useOffer(id: number) {
  return useQuery({
    queryKey: QK.offer(id),
    queryFn: () => offersApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateOffer() {
  const qc = useQueryClient();
  const user = useAuthStore(s => s.user);
  return useMutation({
    mutationFn: (data: OfferRequest) => offersApi.create(user?.id ?? 0, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['offers'] }),
  });
}

export function useUpdateOffer(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: OfferRequest) => offersApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['offers'] }),
  });
}

export function useUpdateOfferStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => offersApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['offers'] }),
  });
}

export function useDeleteOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => offersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['offers'] }),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// APPLICATIONS
// ─────────────────────────────────────────────────────────────────────────────

export function useMyApplications(params?: { page?: number; size?: number }) {
  const user = useAuthStore(s => s.user);
  return useQuery({
    queryKey: QK.myApplications(user?.id ?? 0, params),
    queryFn: () => applicationsApi.getByStudent(user?.id ?? 0, params),
    enabled: !!user?.id && user.role === 'STUDENT',
  });
}

/** Admin-wide list of all applications with optional status filter */
export function useAllApplications(params?: { status?: string; page?: number; size?: number }) {
  return useQuery({
    queryKey: QK.allApplications(params),
    queryFn: () => applicationsApi.getAll(params),
    staleTime: 30_000,
  });
}

export function useOfferApplications(offerId: number, params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: QK.offerApps(offerId, params),
    queryFn: () => applicationsApi.getByOffer(offerId, params),
    enabled: !!offerId,
  });
}

export function useApply() {
  const qc = useQueryClient();
  const user = useAuthStore(s => s.user);
  return useMutation({
    mutationFn: ({ offerId, coverLetter, resume }: { offerId: number; coverLetter: string; resume?: File | null }) =>
      applicationsApi.apply(offerId, user?.id ?? 0, coverLetter, resume),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] }),
  });
}

export function useWithdrawApplication() {
  const qc = useQueryClient();
  const user = useAuthStore(s => s.user);
  return useMutation({
    mutationFn: ({ id, withdrawalReason }: { id: number; withdrawalReason?: string }) =>
      applicationsApi.withdraw(id, user?.id ?? 0, withdrawalReason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] }),
  });
}

export function useUpdateApplicationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, adminNotes }: { id: number; status: string; adminNotes?: string }) =>
      applicationsApi.updateStatus(id, status, adminNotes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] }),
  });
}

export function useDownloadResume() {
  return useMutation({
    mutationFn: async ({ applicationId, studentName }: { applicationId: number; studentName: string }) => {
      const blob = await applicationsApi.downloadResume(applicationId);
      downloadBlob(blob, `resume_${studentName.replace(/\s+/g, '_')}.pdf`);
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// REPORTS
// ─────────────────────────────────────────────────────────────────────────────

export function useSubmittedReports(params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: QK.reports(params),
    queryFn: () => reportsApi.getAllSubmitted(params),
  });
}

export function useOverdueReports(params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: QK.overdueReports(),
    queryFn: () => reportsApi.getOverdue(params),
  });
}

export function useReportByApplication(applicationId: number) {
  return useQuery({
    queryKey: QK.reportByApp(applicationId),
    queryFn: () => reportsApi.getByApplication(applicationId),
    enabled: !!applicationId,
    retry: false,
  });
}

export function useSubmitReport() {
  const qc = useQueryClient();
  const user = useAuthStore(s => s.user);
  return useMutation({
    mutationFn: ({ applicationId, reportFile, dailyLog }: { applicationId: number; reportFile?: File | null; dailyLog?: File | null }) =>
      reportsApi.submit(applicationId, user?.id ?? 0, reportFile, dailyLog),
    onSuccess: (_, { applicationId }) => {
      qc.invalidateQueries({ queryKey: QK.reportByApp(applicationId) });
      qc.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useDownloadReport() {
  return useMutation({
    mutationFn: async ({ reportId, filename }: { reportId: number; filename: string }) => {
      const blob = await reportsApi.downloadReport(reportId);
      downloadBlob(blob, filename);
    },
  });
}

export function useDownloadDailyLog() {
  return useMutation({
    mutationFn: async ({ reportId, filename }: { reportId: number; filename: string }) => {
      const blob = await reportsApi.downloadDailyLog(reportId);
      downloadBlob(blob, filename);
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// EVALUATIONS
// ─────────────────────────────────────────────────────────────────────────────

export function useMyEvaluations(params?: { page?: number; size?: number }) {
  const user = useAuthStore(s => s.user);
  return useQuery({
    queryKey: QK.evaluations(user?.id ?? 0),
    queryFn: () => evaluationsApi.getBySupervisor(user?.id ?? 0, params),
    enabled: !!user?.id && user.role === 'SUPERVISOR',
  });
}

export function useEvaluationByReport(reportId: number) {
  return useQuery({
    queryKey: QK.evaluationByReport(reportId),
    queryFn: () => evaluationsApi.getByReport(reportId),
    enabled: !!reportId,
    retry: false,
  });
}

export function useSubmitEvaluation() {
  const qc = useQueryClient();
  const user = useAuthStore(s => s.user);
  return useMutation({
    mutationFn: ({ reportId, data }: { reportId: number; data: EvaluationRequest }) =>
      evaluationsApi.submit(reportId, user?.id ?? 0, data),
    onSuccess: (_, { reportId }) => {
      qc.invalidateQueries({ queryKey: QK.evaluationByReport(reportId) });
      qc.invalidateQueries({ queryKey: ['evaluations'] });
    },
  });
}

export function useUpdateEvaluation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: EvaluationRequest }) =>
      evaluationsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['evaluations'] }),
  });
}

// ── SPRINT 2: Notification hooks ─────────────────────────────────────────────

export function useUnreadCount() {
  const user = useAuthStore(s => s.user);
  return useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 30_000,   // poll every 30s
    enabled: !!user,
  });
}

export function useNotifications(params?: { page?: number; size?: number }) {
  const user = useAuthStore(s => s.user);
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => notificationsApi.getAll(params),
    enabled: !!user,
  });
}

export function useMarkAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationsApi.markAsRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

// ── SPRINT 3: Audit log hooks ─────────────────────────────────────────────────

export function useAuditLog(params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: ['audit', params],
    queryFn: () => auditApi.getAll(params),
  });
}
