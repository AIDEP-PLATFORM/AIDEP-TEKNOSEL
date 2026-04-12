import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../core/api/axiosInstance';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  tc_no: string;
  city?: string;
  role: string;
  organization?: string;
}

export const authService = {
  // Giriş yap
  async login(email: string, password: string): Promise<string | null> {
    try {
      const res = await api.post('/api/v1/auth/login', { email, password });
      const { access_token, refresh_token } = res.data;
      await AsyncStorage.setItem('access_token', access_token);
      await AsyncStorage.setItem('refresh_token', refresh_token);
      // Kullanıcı bilgilerini çek
      const me = await api.get('/api/v1/auth/me');
      await AsyncStorage.setItem('user', JSON.stringify(me.data));
      return null;
    } catch (e: any) {
      const msg = e?.response?.data?.detail;
      if (msg === 'Invalid credentials') return 'E-posta veya şifre hatalı.';
      if (msg === 'User not found') return 'Bu e-posta ile kayıtlı kullanıcı bulunamadı.';
      if (msg === 'User is not active') return 'Hesabınız aktif değil.';
      return msg ?? 'Giriş yapılamadı. Lütfen tekrar deneyin.';
    }
  },

  // Kayıt ol
  async register(
    email: string,
    password: string,
    profile: { full_name: string; phone: string; tc_no: string; city?: string; role?: string }
  ): Promise<string | null> {
    try {
      const res = await api.post('/api/v1/auth/register', {
        email,
        password,
        full_name: profile.full_name,
        phone: profile.phone,
        tc_no: profile.tc_no,
        city: profile.city ?? '',
        role: profile.role ?? 'citizen',
      });
      const { access_token, refresh_token } = res.data;
      await AsyncStorage.setItem('access_token', access_token);
      await AsyncStorage.setItem('refresh_token', refresh_token);
      const me = await api.get('/api/v1/auth/me');
      await AsyncStorage.setItem('user', JSON.stringify(me.data));
      return null;
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      // Array (Pydantic validation hatası)
      if (Array.isArray(detail)) {
        return 'Lütfen tüm alanları doğru doldurun.';
      }
      // String hata mesajı
      if (typeof detail === 'string') {
        if (detail.includes('email') || detail.includes('Email')) return 'Bu e-posta adresi zaten kullanılıyor.';
        if (detail.includes('phone') || detail.includes('telefon')) return 'Bu telefon numarası zaten kayıtlı.';
        if (detail.includes('tc_no') || detail.includes('TC') || detail.includes('tc')) return 'Bu TC kimlik numarası zaten kayıtlı.';
        // Backend Türkçe mesaj döndürüyorsa direkt göster
        return detail;
      }
      return 'Kayıt tamamlanamadı. Lütfen tekrar deneyin.';
    }
  },

  // Çıkış yap
  async logout(): Promise<void> {
    await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
  },

  // Mevcut kullanıcıyı getir
  async getUser(): Promise<User | null> {
    const raw = await AsyncStorage.getItem('user');
    if (!raw) return null;
    return JSON.parse(raw);
  },

  // Token var mı kontrol et
  async getAccessToken(): Promise<string | null> {
    return AsyncStorage.getItem('access_token');
  },
};
