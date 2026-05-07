import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Role = 'STUDENT' | 'SUPERVISOR' | 'ADMIN';

export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  // Student
  matricule?: string;
  department?: string;
  yearOfStudy?: number;
  phoneNumber?: string;
  // Supervisor
  specialization?: string;
  officeNumber?: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login:   (token: string, user: AuthUser) => void;
  logout:  () => void;
  setUser: (user: AuthUser) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      login:   (token, user) => set({ token, user, isAuthenticated: true }),
      logout:  ()            => set({ token: null, user: null, isAuthenticated: false }),
      setUser: (user)        => set({ user }),
    }),
    { name: 'enscs-auth' }
  )
);
