export interface DamageReport {
  id: string;
  user_id: string;
  description: string | null;
  photo_url: string | null;
  damage_class: string | null;
  severity: number | null;
  priority_score: number | null;
  status: string;
  lat: number | null;
  lng: number | null;
  created_at: string;
  updated_at: string;
}

export interface DamageReportListResponse {
  total: number;
  items: DamageReport[];
}

export interface RouteCoordinate {
  lat: number;
  lng: number;
}

export interface Route {
  id: string;
  volunteer_id: string | null;
  request_id: string | null;
  coordinates: RouteCoordinate[];
  duration_seconds: number | null;
  distance_meters: number | null;
  risk_score: number | null;
  status: string;
  created_at: string;
}

export interface RouteCalculateRequest {
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  volunteer_id?: string;
  request_id?: string;
}

export type MapFilter = 'hasar' | 'ekip' | 'toplanma' | 'guzergah';
