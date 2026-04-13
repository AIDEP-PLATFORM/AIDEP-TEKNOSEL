import { create } from 'zustand';
import { authService, User } from '../../features/auth/services/auth.service';

interface RegisterProfile {
  full_name: string;
  phone: string;
  tc_no: string;
  city?: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (email: string, password: string, profile: RegisterProfile) => Promise<string | null>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  loading: false,

  login: async (email, password) => {
    set({ loading: true });
    const error = await authService.login(email, password);
    if (!error) {
      const user = await authService.getUser();
      set({ user, isLoggedIn: true });
    }
    set({ loading: false });
    return error;
  },

  register: async (email, password, profile) => {
    set({ loading: true });
    const error = await authService.register(email, password, profile);
    if (!error) {
      const user = await authService.getUser();
      set({ user, isLoggedIn: true });
    }
    set({ loading: false });
    return error;
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, isLoggedIn: false });
  },

  setUser: (user) => set({ user, isLoggedIn: !!user }),
}));
