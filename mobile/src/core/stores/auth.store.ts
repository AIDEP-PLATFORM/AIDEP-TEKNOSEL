import { create } from 'zustand';
import { authService, User } from '../../features/auth/services/auth.service';

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
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

  logout: async () => {
    await authService.logout();
    set({ user: null, isLoggedIn: false });
  },

  setUser: (user) => set({ user, isLoggedIn: !!user }),
}));
