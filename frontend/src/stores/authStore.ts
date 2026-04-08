import { create } from 'zustand';

export type Role = 'admin' | 'stk' | 'user' | null;

export interface User {
  uid: string;
  email: string;
  role: Role;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),

  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    // Hem tarayıcıdan hem bellekten siler, yetkileri çeker
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
