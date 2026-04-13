import api from '../../../core/api/axiosInstance';
import { ENDPOINTS } from '../../../core/api/endpoints';

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

export interface DamageReportListResponse {
  total: number;
  items: DamageReport[];
}

export interface SubmitReportParams {
  lat: number;
  lng: number;
  description: string;
  photoUri: string;
}

export const reportService = {
  async submitReport(params: SubmitReportParams): Promise<DamageReport> {
    const formData = new FormData();
    formData.append('lat', String(params.lat));
    formData.append('lng', String(params.lng));
    formData.append('description', params.description);
    formData.append('photo', {
      uri: params.photoUri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    } as any);

    const res = await api.post<DamageReport>(ENDPOINTS.DAMAGE.CREATE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 40000,
    });
    return res.data;
  },

  async getReport(id: string): Promise<DamageReport | null> {
    try {
      const res = await api.get<DamageReport>(ENDPOINTS.DAMAGE.DETAIL(id));
      return res.data;
    } catch {
      return null;
    }
  },

  async listReports(params?: {
    skip?: number;
    limit?: number;
    severity_min?: number;
    report_status?: string;
  }): Promise<DamageReportListResponse> {
    try {
      const res = await api.get<DamageReportListResponse>(ENDPOINTS.DAMAGE.LIST, {
        params: { skip: 0, limit: 20, ...params },
      });
      return res.data;
    } catch {
      return { total: 0, items: [] };
    }
  },
};
