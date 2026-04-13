import axiosInstance from "../core/api/axiosInstance";

export interface EarthquakeItem {
  id: string;
  magnitude: number;
  depth_km: number | null;
  lat: number;
  lng: number;
  location_name: string;
  event_time: string;
  source: string;
  url: string | null;
}

export interface EarthquakeListResponse {
  total: number;
  items: EarthquakeItem[];
}

const earthquakeService = {
  async fetchAll(params?: {
    min_mag?: number;
    hours?: number;
    limit?: number;
  }): Promise<EarthquakeListResponse> {
    const { data } = await axiosInstance.get<EarthquakeListResponse>(
      "/earthquakes",
      { params },
    );
    return data;
  },

  async fetchLatest(min_mag = 3.0): Promise<EarthquakeItem | null> {
    const { data } = await axiosInstance.get<EarthquakeItem | null>(
      "/earthquakes/latest",
      { params: { min_mag } },
    );
    return data;
  },
};

export default earthquakeService;
