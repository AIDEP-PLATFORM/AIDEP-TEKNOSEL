import api from '../../../core/api/axiosInstance';
import { ENDPOINTS } from '../../../core/api/endpoints';

export interface VolunteerInfo {
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
  member_count: number;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

export interface CreateTeamParams {
  name: string;
  organization: string;
  max_size: number;
}

export const tasksService = {
  // ── Gönüllüler ──────────────────────────────────────────────────────────────

  async getVolunteers(params?: {
    team_id?: string;
    is_available?: boolean;
    no_team?: boolean;
  }): Promise<VolunteerInfo[]> {
    try {
      const res = await api.get<VolunteerInfo[]>(ENDPOINTS.VOLUNTEERS.LIST, { params });
      return res.data;
    } catch {
      return [];
    }
  },

  // ── Ekipler ─────────────────────────────────────────────────────────────────

  async getTeams(params?: { team_status?: string; organization?: string }): Promise<Team[]> {
    try {
      const res = await api.get<Team[]>(ENDPOINTS.VOLUNTEERS.TEAMS.LIST, { params });
      return res.data;
    } catch {
      return [];
    }
  },

  async createTeam(params: CreateTeamParams): Promise<Team | null> {
    try {
      const res = await api.post<Team>(ENDPOINTS.VOLUNTEERS.TEAMS.CREATE, params);
      return res.data;
    } catch {
      return null;
    }
  },

  async getTeamDetail(teamId: string): Promise<Team | null> {
    try {
      const res = await api.get<Team>(ENDPOINTS.VOLUNTEERS.TEAMS.DETAIL(teamId));
      return res.data;
    } catch {
      return null;
    }
  },

  async addMember(teamId: string, volunteerId: string): Promise<Team | null> {
    try {
      const res = await api.post<Team>(ENDPOINTS.VOLUNTEERS.TEAMS.MEMBERS(teamId), {
        volunteer_id: volunteerId,
      });
      return res.data;
    } catch {
      return null;
    }
  },

  async removeMember(teamId: string, volunteerId: string): Promise<Team | null> {
    try {
      const res = await api.delete<Team>(ENDPOINTS.VOLUNTEERS.TEAMS.MEMBER(teamId, volunteerId));
      return res.data;
    } catch {
      return null;
    }
  },

  async assignTeam(teamId: string, damageReportId: string): Promise<Team | null> {
    try {
      const res = await api.post<Team>(ENDPOINTS.VOLUNTEERS.TEAMS.ASSIGN(teamId), {
        damage_report_id: damageReportId,
      });
      return res.data;
    } catch {
      return null;
    }
  },

  async updateTeamStatus(
    teamId: string,
    status: 'available' | 'on_mission' | 'inactive',
  ): Promise<Team | null> {
    try {
      const res = await api.patch<Team>(ENDPOINTS.VOLUNTEERS.TEAMS.STATUS(teamId), { status });
      return res.data;
    } catch {
      return null;
    }
  },
};
