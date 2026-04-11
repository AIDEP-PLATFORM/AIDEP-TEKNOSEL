import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../api/supabaseClient';
import { authService } from '../../features/auth/services/auth.service';

interface AuthState {
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  loading: false,

  login: async (email, password) => {
    set({ loading: true });
    const error = await authService.login(email, password);
    set({ loading: false });
    return error;
  },

  logout: async () => {
    await authService.logout();
    set({ session: null });
  },

  setSession: (session) => set({ session }),
}));

// Supabase auth state değişikliklerini dinle
supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setSession(session);
});
