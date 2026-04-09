import { create } from 'zustand';
import { supabase } from '../core/supabase';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

export type Role = 'admin' | 'stk' | 'afad' | 'user' | null;

export interface User {
  uid: string;
  email: string;
  role: Role;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setSession: (session: Session | null) => void;
  logout: () => Promise<void>;
}

function mapSupabaseUser(supabaseUser: SupabaseUser): User {
  return {
    uid: supabaseUser.id,
    email: supabaseUser.email ?? '',
    role: (supabaseUser.user_metadata?.role as Role) ?? 'user',
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,

  setSession: (session) => {
    set({
      session,
      user: session?.user ? mapSupabaseUser(session.user) : null,
      isAuthenticated: !!session,
      isLoading: false,
    });
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, isAuthenticated: false });
  },
}));

// Uygulama başladığında mevcut oturumu yükle ve değişiklikleri dinle
supabase.auth.getSession().then(({ data: { session } }) => {
  useAuthStore.getState().setSession(session);
});

supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setSession(session);
});
