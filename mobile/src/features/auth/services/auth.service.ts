import { supabase } from '../../../core/api/supabaseClient';
import api from '../../../core/api/axiosInstance';

export const authService = {
  async login(email: string, password: string): Promise<string | null> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.log('Login error:', error.message, error.status);
      return error.message;
    }
    return null;
  },

  async register(
    email: string,
    password: string,
    profile: { full_name: string; phone: string; city?: string; organization?: string }
  ): Promise<string | null> {
    // 1. Supabase'e kayıt
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: profile.full_name },
        emailRedirectTo: undefined,
        captchaToken: undefined,
      },
    });

    if (error) {
      // Rate limit hatası: hesap zaten oluşturulmuş olabilir, giriş yapmayı dene
      if (
        error.message?.toLowerCase().includes('rate limit') ||
        error.message?.toLowerCase().includes('email') ||
        (error as any)?.code === 'over_email_send_rate_limit'
      ) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (!signInError && signInData.session) {
          // Giriş başarılı — profil güncelle ve devam et
          try {
            await api.patch('/api/v1/users/me', {
              full_name: profile.full_name,
              phone: profile.phone,
              city: profile.city ?? '',
              organization: profile.organization ?? null,
            });
          } catch {}
          return null;
        }
        return 'E-posta gönderim limiti aşıldı. Birkaç dakika bekleyip tekrar deneyin.';
      }
      return error.message;
    }
    if (!data.session) return 'Kayıt tamamlanamadı, lütfen tekrar deneyin.';

    // 2. Backend'e profil bilgilerini gönder (auto-sync + update)
    try {
      await api.patch('/api/v1/users/me', {
        full_name: profile.full_name,
        phone: profile.phone,
        city: profile.city ?? '',
        organization: profile.organization ?? null,
      });
    } catch (e: any) {
      console.log('Profil güncelleme hatası:', e?.response?.data ?? e?.message);
      // Auth başarılı oldu, profil hatası kritik değil
    }

    return null;
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  },

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },
};
