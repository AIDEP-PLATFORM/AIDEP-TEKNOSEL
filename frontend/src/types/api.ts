/** Backend API v1 ile uyumlu tipler (STK paneli) */

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
  updated_at: string | null;
}

export interface DamageReportListResponse {
  total: number;
  items: DamageReport[];
}

export interface Volunteer {
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

export interface Team {
  id: string;
  name: string;
  organization: string;
  max_size: number;
  status: string;
  assigned_damage_id: string | null;
  member_count?: number;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

/** GET /volunteers/teams/locations — harita için ekip üyesi konumları */
export interface TeamMemberLocation {
  volunteer_id: string;
  lat: number | null;
  lng: number | null;
}

export interface TeamLocationSnapshot {
  team_id: string;
  team_name: string;
  status: string;
  assigned_damage_id: string | null;
  damage_lat: number | null;
  damage_lng: number | null;
  members: TeamMemberLocation[];
}

export interface TeamCreateBody {
  name: string;
  organization: string;
  max_size?: number;
}

export interface TeamAssignBody {
  damage_report_id: string;
}

export interface RouteCalculateBody {
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  volunteer_id?: string | null;
  request_id?: string | null;
}

export interface RouteAlternative {
  index: number;
  coordinates: number[][];   // [[lng, lat], ...]
  duration_seconds: number;
  distance_meters: number;
  risk_score: number;
  is_best: boolean;
}

export interface RouteCalculated {
  id: string;
  volunteer_id: string | null;
  request_id: string | null;
  coordinates: number[][];
  duration_seconds: number | null;
  distance_meters: number | null;
  risk_score: number | null;
  status: string;
  created_at: string | null;
  alternatives?: RouteAlternative[];
}

export interface UserProfilePatch {
  full_name?: string;
  city?: string | null;
  phone?: string;
  tc_no?: string;
  organization?: string | null;
  is_active?: boolean;
}
