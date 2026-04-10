import { create } from 'zustand';
import { supabase } from '../supabase';
import type { Session } from '@supabase/supabase-js';

export type Role = 'admin' | 'stk' | 'afad' | 'user' | null;

export interface AuthUser {
  uid: string;
  email: string;
  role: Role;
}

interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setSession: (session: Session | null) => void;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,

  setSession: (session) => {
    set({
      session,
      user: session
        ? {
            uid: session.user.id,
            email: session.user.email ?? '',
            role: (session.user.user_metadata?.role as Role) ?? 'user',
          }
        : null,
      isAuthenticated: !!session,
      isLoading: false,
    });
  },

  login: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;
    return null;
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, isAuthenticated: false });
  },
}));

// Oturumu başlangıçta yükle
supabase.auth.getSession().then(({ data: { session } }) => {
  useAuthStore.getState().setSession(session);
});

supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setSession(session);
});
