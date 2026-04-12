import { create } from 'zustand';
import axiosInstance from '../core/api/axiosInstance';
import { authEndpoints } from '../core/api/endpoints';

export type Role = 'citizen' | 'volunteer' | 'ngo' | 'admin' | null;

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  tc_no: string;
  city?: string | null;
  role: Role;
  organization?: string | null;
  is_active?: boolean;
  created_at?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  fetchMe: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),

  fetchMe: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const { data } = await axiosInstance.get<User>(authEndpoints.me);
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    set({ user: null, isAuthenticated: false });
  },
}));

// Uygulama başladığında token varsa kullanıcıyı yükle
useAuthStore.getState().fetchMe();
