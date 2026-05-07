import axios from 'axios';

export const api = axios.create({
  baseURL: (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem('enscs-auth');
    if (stored) {
      const { state } = JSON.parse(stored);
      if (state?.token) config.headers.Authorization = `Bearer ${state.token}`;
    }
  } catch {}
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('enscs-auth');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Types (mirrors Spring Boot DTOs) ─────────────────────────────────────────
export interface AuthResponse { id: number; token: string; email: string; role: 'STUDENT' | 'SUPERVISOR' | 'ADMIN'; fullName: string; }
export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest { firstName: string; lastName: string; email: string; password: string; role: 'STUDENT' | 'SUPERVISOR'; matricule?: string; department?: string; yearOfStudy?: number; phoneNumber?: string; specialization?: string; officeNumber?: string; }
export interface OfferResponse { id: number; title: string; description: string; companyName: string; companyLocation: string; startDate: string; endDate: string; durationWeeks: number; requiredSkills: string; status: 'OPEN' | 'CLOSED' | 'ARCHIVED'; applicationCount: number; reportDeadlineDays: number; createdAt: string; }
export interface OfferRequest { title: string; description: string; companyName: string; companyLocation?: string; startDate: string; endDate: string; durationWeeks: number; requiredSkills?: string; reportDeadlineDays?: number; }
export interface ApplicationResponse { id: number; studentId: number; studentName: string; offerId: number; offerTitle: string; companyName: string; coverLetter: string; status: 'PENDING' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'; adminNotes: string | null; hasResume: boolean; appliedAt: string; }
export interface ReportResponse { id: number; studentId: number; studentName: string; applicationId: number; offerTitle: string; hasReport: boolean; hasDailyLog: boolean; submissionDeadline: string; submittedAt: string | null; isLate: boolean; reportFileSizeBytes: number | null; }
export interface EvaluationResponse { id: number; supervisorId: number; supervisorName: string; reportId: number; studentName: string; offerTitle: string; grade: number; technicalFeedback: string; professionalFeedback: string; generalComments: string; companyFeedback: string; evaluatedAt: string; }
export interface EvaluationRequest { grade: number; technicalFeedback: string; professionalFeedback?: string; generalComments?: string; companyFeedback?: string; }
export interface UserResponse { id: number; email: string; firstName: string; lastName: string; fullName: string; role: string; enabled: boolean; createdAt: string; matricule?: string; department?: string; yearOfStudy?: number; phoneNumber?: string; specialization?: string; officeNumber?: string; }
export interface PageResponse<T> { content: T[]; totalElements: number; totalPages: number; number: number; size: number; }

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersApi = {
  /** GET /api/users/me — returns the authenticated user's full profile including id */
  me:         ()         => api.get<UserResponse>('/api/users/me').then(r => r.data),
  getAll:     (p?: { role?: string; page?: number; size?: number }) => api.get<PageResponse<UserResponse>>('/api/users', { params: p }).then(r => r.data),
  getById:    (id: number) => api.get<UserResponse>(`/api/users/${id}`).then(r => r.data),
  setEnabled: (id: number, enabled: boolean) => api.patch<UserResponse>(`/api/users/${id}/enable`, null, { params: { enabled } }).then(r => r.data),
  delete:     (id: number) => api.delete(`/api/users/${id}`),
};

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login:    (data: LoginRequest)    => api.post<AuthResponse>('/api/auth/login', data).then(r => r.data),
  register: (data: RegisterRequest) => api.post<AuthResponse>('/api/auth/register', data).then(r => r.data),
};

// ── Offers ────────────────────────────────────────────────────────────────────
export const offersApi = {
  getAll:       (p?: { status?: string; page?: number; size?: number }) => api.get<PageResponse<OfferResponse>>('/api/offers', { params: p }).then(r => r.data),
  search:       (keyword: string, p?: { status?: string; page?: number; size?: number }) => api.get<PageResponse<OfferResponse>>('/api/offers/search', { params: { keyword, ...p } }).then(r => r.data),
  getById:      (id: number) => api.get<OfferResponse>(`/api/offers/${id}`).then(r => r.data),
  create:       (adminId: number, data: OfferRequest) => api.post<OfferResponse>('/api/offers', data, { params: { adminId } }).then(r => r.data),
  update:       (id: number, data: OfferRequest) => api.put<OfferResponse>(`/api/offers/${id}`, data).then(r => r.data),
  updateStatus: (id: number, status: string) => api.patch<OfferResponse>(`/api/offers/${id}/status`, null, { params: { status } }).then(r => r.data),
  delete:       (id: number) => api.delete(`/api/offers/${id}`),
};

// ── Applications ──────────────────────────────────────────────────────────────
export const applicationsApi = {
  apply: (offerId: number, studentId: number, coverLetter: string, resume?: File | null) => {
    const form = new FormData();
    form.append('data', new Blob([JSON.stringify({ coverLetter })], { type: 'application/json' }));
    if (resume) form.append('resume', resume);
    return api.post<ApplicationResponse>(`/api/applications/offers/${offerId}/apply`, form, {
      params: { studentId }, headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data);
  },
  getById:        (id: number) => api.get<ApplicationResponse>(`/api/applications/${id}`).then(r => r.data),
  /** Admin-wide: GET /api/applications?status=&page=&size= */
  getAll:         (p?: { status?: string; page?: number; size?: number }) => api.get<PageResponse<ApplicationResponse>>('/api/applications', { params: p }).then(r => r.data),
  getByStudent:   (studentId: number, p?: { page?: number; size?: number }) => api.get<PageResponse<ApplicationResponse>>(`/api/applications/students/${studentId}`, { params: p }).then(r => r.data),
  getByOffer:     (offerId: number, p?: { page?: number; size?: number }) => api.get<PageResponse<ApplicationResponse>>(`/api/applications/offers/${offerId}`, { params: p }).then(r => r.data),
  updateStatus:   (id: number, status: string, adminNotes?: string) => api.patch<ApplicationResponse>(`/api/applications/${id}/status`, null, { params: { status, ...(adminNotes ? { adminNotes } : {}) } }).then(r => r.data),
  withdraw:       (id: number, studentId: number, withdrawalReason?: string) => api.patch(`/api/applications/${id}/withdraw`, withdrawalReason ? { withdrawalReason } : null, { params: { studentId } }),
  downloadResume: (id: number) => api.get<Blob>(`/api/applications/${id}/resume/download`, { responseType: 'blob' }).then(r => r.data),
};

// ── Reports ───────────────────────────────────────────────────────────────────
export const reportsApi = {
  submit: (applicationId: number, studentId: number, reportFile?: File | null, dailyLog?: File | null) => {
    const form = new FormData();
    if (reportFile) form.append('reportFile', reportFile);
    if (dailyLog)   form.append('dailyLog', dailyLog);
    return api.post<ReportResponse>(`/api/reports/applications/${applicationId}/submit`, form, {
      params: { studentId }, headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data);
  },
  getById:          (id: number) => api.get<ReportResponse>(`/api/reports/${id}`).then(r => r.data),
  getByApplication: (applicationId: number) => api.get<ReportResponse>(`/api/reports/applications/${applicationId}`).then(r => r.data),
  getAllSubmitted:   (p?: { page?: number; size?: number }) => api.get<PageResponse<ReportResponse>>('/api/reports', { params: p }).then(r => r.data),
  getOverdue:       (p?: { page?: number; size?: number }) => api.get<PageResponse<ReportResponse>>('/api/reports/overdue', { params: p }).then(r => r.data),
  downloadReport:   (id: number) => api.get<Blob>(`/api/reports/${id}/download/report`, { responseType: 'blob' }).then(r => r.data),
  downloadDailyLog: (id: number) => api.get<Blob>(`/api/reports/${id}/download/daily-log`, { responseType: 'blob' }).then(r => r.data),
};

// ── Evaluations ───────────────────────────────────────────────────────────────
export const evaluationsApi = {
  submit:          (reportId: number, supervisorId: number, data: EvaluationRequest) => api.post<EvaluationResponse>(`/api/evaluations/reports/${reportId}`, data, { params: { supervisorId } }).then(r => r.data),
  update:          (id: number, data: EvaluationRequest) => api.put<EvaluationResponse>(`/api/evaluations/${id}`, data).then(r => r.data),
  getById:         (id: number) => api.get<EvaluationResponse>(`/api/evaluations/${id}`).then(r => r.data),
  getByReport:     (reportId: number) => api.get<EvaluationResponse>(`/api/evaluations/reports/${reportId}`).then(r => r.data),
  getBySupervisor: (supervisorId: number, p?: { page?: number; size?: number }) => api.get<PageResponse<EvaluationResponse>>(`/api/evaluations/supervisors/${supervisorId}`, { params: p }).then(r => r.data),
};

// ── Download helper ───────────────────────────────────────────────────────────
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── Notifications (SPRINT 2) ──────────────────────────────────────────────────
export interface NotificationItem {
  id: number; title: string; message: string; type: string;
  entityType: string | null; entityId: number | null;
  isRead: boolean; createdAt: string;
}

export const notificationsApi = {
  getAll:       (p?: { page?: number; size?: number }) =>
    api.get<PageResponse<NotificationItem>>('/api/notifications', { params: p }).then(r => r.data),
  getUnreadCount: () =>
    api.get<{ count: number }>('/api/notifications/unread-count').then(r => r.data),
  markAsRead:   (id: number) =>
    api.patch(`/api/notifications/${id}/read`),
  markAllAsRead: () =>
    api.patch('/api/notifications/read-all'),
};

// ── Audit Log (SPRINT 3) ──────────────────────────────────────────────────────
export interface AuditLogEntry {
  id: number; actorId: number; actorName: string; action: string;
  entityType: string; entityId: number | null;
  oldValue: string | null; newValue: string | null;
  description: string; createdAt: string;
}

export const auditApi = {
  getAll:      (p?: { page?: number; size?: number }) =>
    api.get<PageResponse<AuditLogEntry>>('/api/admin/audit-log', { params: p }).then(r => r.data),
  getByActor:  (actorId: number, p?: { page?: number; size?: number }) =>
    api.get<PageResponse<AuditLogEntry>>(`/api/admin/audit-log/actor/${actorId}`, { params: p }).then(r => r.data),
  getByEntity: (entityType: string, entityId: number, p?: { page?: number; size?: number }) =>
    api.get<PageResponse<AuditLogEntry>>(`/api/admin/audit-log/entity/${entityType}/${entityId}`, { params: p }).then(r => r.data),
};
