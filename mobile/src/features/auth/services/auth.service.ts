import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../core/api/axiosInstance';
import { ENDPOINTS } from '../../../core/api/endpoints';

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

export interface UserUpdatePayload {
  full_name?: string;
  phone?: string;
  city?: string;
  organization?: string;
}

export const authService = {
  // Giriş yap
  async login(email: string, password: string): Promise<string | null> {
    try {
      // Eski token'ı kaldır: interceptor login POST'una Bearer eklemesin; undefined alanlar JSON'dan düşmesin.
      await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
      const payload = {
        email: String(email ?? '').trim(),
        password: String(password ?? ''),
      };
      const res = await api.post('/auth/login', payload);
      const { access_token, refresh_token } = res.data;
      await AsyncStorage.setItem('access_token', access_token);
      await AsyncStorage.setItem('refresh_token', refresh_token);
      // Kullanıcı bilgilerini çek
      const me = await api.get('/auth/me');
      await AsyncStorage.setItem('user', JSON.stringify(me.data));
      return null;
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      // 422: FastAPI/Pydantic — dizi veya tek mesaj
      if (Array.isArray(detail)) {
        const first = detail[0];
        const field = Array.isArray(first?.loc) ? String(first.loc[first.loc.length - 1]) : '';
        const hint =
          field === 'email'
            ? 'Geçerli bir e-posta adresi girin.'
            : field === 'password'
              ? 'Şifre alanı eksik veya geçersiz.'
              : 'Gönderilen bilgiler sunucu tarafından kabul edilmedi.';
        return hint;
      }
      if (typeof detail === 'string') {
        if (detail === 'Invalid credentials') return 'E-posta veya şifre hatalı.';
        if (detail === 'User not found') return 'Bu e-posta ile kayıtlı kullanıcı bulunamadı.';
        if (detail === 'User is not active') return 'Hesabınız aktif değil.';
        return detail;
      }
      return 'Giriş yapılamadı. Lütfen tekrar deneyin.';
    }
  },

  // Kayıt ol
  async register(
    email: string,
    password: string,
    profile: { full_name: string; phone: string; tc_no: string; city?: string; role?: string }
  ): Promise<string | null> {
    try {
      const res = await api.post('/auth/register', {
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
      const me = await api.get('/auth/me');
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

  // Sunucudan güncel profil çek ve storage'ı güncelle
  async getProfile(): Promise<User | null> {
    try {
      const res = await api.get<User>(ENDPOINTS.USERS.ME);
      await AsyncStorage.setItem('user', JSON.stringify(res.data));
      return res.data;
    } catch {
      return null;
    }
  },

  // Profil güncelle
  async updateProfile(payload: UserUpdatePayload): Promise<{ user: User | null; error: string | null }> {
    try {
      const res = await api.patch<User>(ENDPOINTS.USERS.ME, payload);
      await AsyncStorage.setItem('user', JSON.stringify(res.data));
      return { user: res.data, error: null };
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      if (typeof detail === 'string') return { user: null, error: detail };
      return { user: null, error: 'Profil güncellenemedi. Lütfen tekrar deneyin.' };
    }
  },
};
