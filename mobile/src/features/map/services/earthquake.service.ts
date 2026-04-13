import api from '../../../core/api/axiosInstance';
import { ENDPOINTS } from '../../../core/api/endpoints';

export interface Earthquake {
  id: string;
  magnitude: number;
  place: string;
  time: string;
  lat: number;
  lng: number;
  depth: number;
  source: string;
}

export interface EarthquakeListResponse {
  total: number;
  items: Earthquake[];
}

export const earthquakeService = {
  async listEarthquakes(params?: {
    min_mag?: number;
    hours?: number;
    limit?: number;
  }): Promise<EarthquakeListResponse> {
    try {
      const res = await api.get<EarthquakeListResponse>(ENDPOINTS.EARTHQUAKES.LIST, {
        params: { min_mag: 2.0, hours: 48, limit: 100, ...params },
      });
      return res.data;
    } catch {
      return { total: 0, items: [] };
    }
  },

  async getLatest(min_mag = 3.0): Promise<Earthquake | null> {
    try {
      const res = await api.get<Earthquake | null>(ENDPOINTS.EARTHQUAKES.LATEST, {
        params: { min_mag },
      });
      return res.data ?? null;
    } catch {
      return null;
    }
  },
};
