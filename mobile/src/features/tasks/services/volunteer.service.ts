import api from '../../../core/api/axiosInstance';

export interface VolunteerProfile {
  id: string;
  user_id: string;
  skills: string[];
  team_id: string | null;
  is_available: boolean;
  status: string;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

export interface TeamInfo {
  id: string;
  name: string;
  organization: string;
  max_size: number;
  status: string;
  assigned_damage_id: string | null;
  member_count: number;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

export interface DamageReport {
  id: string;
  user_id: string;
  description: string | null;
  photo_url: string;
  damage_class: string | null;
  severity: number | null;
  priority_score: number | null;
  status: string;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

export const volunteerService = {
  // Gönüllü profilini oluştur (yoksa oluştur, varsa geç)
  async createProfile(): Promise<VolunteerProfile | null> {
    try {
      const res = await api.post('/volunteers/me', {});
      return res.data;
    } catch (e: any) {
      // 400 = zaten kayıtlı → sorun değil
      if (e?.response?.status === 400) return {} as VolunteerProfile;
      return null;
    }
  },

  // Müsaitlik durumunu güncelle
  async updateAvailability(is_available: boolean): Promise<VolunteerProfile | null> {
    try {
      const res = await api.patch('/volunteers/me/availability', { is_available });
      return res.data;
    } catch (e: any) {
      console.warn('updateAvailability error:', e?.response?.status, e?.response?.data);
      return null;
    }
  },

  // Konumu güncelle
  async updateLocation(lat: number, lng: number): Promise<VolunteerProfile | null> {
    try {
      const res = await api.patch('/volunteers/me/location', { lat, lng });
      return res.data;
    } catch (e: any) {
      console.warn('updateLocation error:', e?.response?.status, e?.response?.data);
      return null;
    }
  },

  // Hasar raporlarını listele (görevler)
  async getDamageReports(params?: { skip?: number; limit?: number; severity_min?: number }): Promise<{ total: number; items: DamageReport[] }> {
    try {
      const res = await api.get('/damage', { params: { skip: 0, limit: 20, ...params } });
      return res.data;
    } catch {
      return { total: 0, items: [] };
    }
  },
};
