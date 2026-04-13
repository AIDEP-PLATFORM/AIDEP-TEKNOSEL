import axiosInstance from "../core/api/axiosInstance";
import { volunteerEndpoints } from "../core/api/endpoints";
import type { Team, TeamAssignBody, TeamCreateBody, Volunteer } from "../types/api";

const volunteerService = {
  async fetchVolunteers(params?: {
    team_id?: string;
    is_available?: boolean;
    no_team?: boolean;
  }): Promise<Volunteer[]> {
    const { data } = await axiosInstance.get<Volunteer[]>(volunteerEndpoints.list, { params });
    return data;
  },

  async fetchTeams(params?: { team_status?: string; organization?: string }): Promise<Team[]> {
    const { data } = await axiosInstance.get<Team[]>(volunteerEndpoints.teams, { params });
    return data;
  },

  async fetchTeam(teamId: string): Promise<Team> {
    const { data } = await axiosInstance.get<Team>(volunteerEndpoints.teamById(teamId));
    return data;
  },

  async createTeam(body: TeamCreateBody): Promise<Team> {
    const { data } = await axiosInstance.post<Team>(volunteerEndpoints.teams, body);
    return data;
  },

  async addMember(teamId: string, volunteerId: string): Promise<Team> {
    const { data } = await axiosInstance.post<Team>(volunteerEndpoints.teamMembers(teamId), {
      volunteer_id: volunteerId,
    });
    return data;
  },

  async removeMember(teamId: string, volunteerId: string): Promise<Team> {
    const { data } = await axiosInstance.delete<Team>(
      volunteerEndpoints.teamMember(teamId, volunteerId),
    );
    return data;
  },

  async assignToDamage(teamId: string, body: TeamAssignBody): Promise<Team> {
    const { data } = await axiosInstance.post<Team>(volunteerEndpoints.teamAssign(teamId), body);
    return data;
  },

  async updateStatus(teamId: string, status: string): Promise<Team> {
    const { data } = await axiosInstance.patch<Team>(volunteerEndpoints.teamStatus(teamId), {
      status,
    });
    return data;
  },
};

export default volunteerService;
