import axiosInstance from "../core/api/axiosInstance";
import {
  authEndpoints,
  damageEndpoints,
  routingEndpoints,
  userEndpoints,
  volunteerEndpoints,
} from "../core/api/endpoints";
import type {
  DamageReport,
  DamageReportListResponse,
  RouteCalculateBody,
  RouteCalculated,
  Team,
  TeamAssignBody,
  TeamCreateBody,
  UserProfilePatch,
  Volunteer,
} from "../types/api";

/** Auth */
export async function refreshSession(refreshToken: string) {
  const { data } = await axiosInstance.post<{ access_token: string; refresh_token: string }>(
    authEndpoints.refresh,
    { refresh_token: refreshToken },
  );
  return data;
}

/** Profil — /users/me (PATCH) */
export async function patchUserProfile(body: UserProfilePatch) {
  const { data } = await axiosInstance.patch(userEndpoints.me, body);
  return data;
}

/** Hasar raporları */
export async function fetchDamageReports(params?: {
  skip?: number;
  limit?: number;
  severity_min?: number;
  report_status?: string;
}) {
  const { data } = await axiosInstance.get<DamageReportListResponse>(damageEndpoints.base, {
    params,
  });
  return data;
}

export async function fetchDamageReport(id: string) {
  const { data } = await axiosInstance.get<DamageReport>(damageEndpoints.byId(id));
  return data;
}

/** Gönüllüler (STK) */
export async function fetchVolunteers(params?: {
  team_id?: string;
  is_available?: boolean;
  no_team?: boolean;
}) {
  const { data } = await axiosInstance.get<Volunteer[]>(volunteerEndpoints.list, { params });
  return data;
}

/** Ekipler (STK) */
export async function fetchTeams(params?: { team_status?: string; organization?: string }) {
  const { data } = await axiosInstance.get<Team[]>(volunteerEndpoints.teams, { params });
  return data;
}

export async function fetchTeam(teamId: string) {
  const { data } = await axiosInstance.get<Team>(volunteerEndpoints.teamById(teamId));
  return data;
}

export async function createTeam(body: TeamCreateBody) {
  const { data } = await axiosInstance.post<Team>(volunteerEndpoints.teams, body);
  return data;
}

export async function addVolunteerToTeam(teamId: string, volunteerId: string) {
  const { data } = await axiosInstance.post<Team>(volunteerEndpoints.teamMembers(teamId), {
    volunteer_id: volunteerId,
  });
  return data;
}

export async function removeVolunteerFromTeam(teamId: string, volunteerId: string) {
  const { data } = await axiosInstance.delete<Team>(
    volunteerEndpoints.teamMember(teamId, volunteerId),
  );
  return data;
}

export async function assignTeamToDamage(teamId: string, body: TeamAssignBody) {
  const { data } = await axiosInstance.post<Team>(volunteerEndpoints.teamAssign(teamId), body);
  return data;
}

export async function updateTeamStatus(teamId: string, status: string) {
  const { data } = await axiosInstance.patch<Team>(volunteerEndpoints.teamStatus(teamId), {
    status,
  });
  return data;
}

/** Rota (OSRM) — auth yok backend’de */
export async function calculateRoute(body: RouteCalculateBody) {
  const { data } = await axiosInstance.post<RouteCalculated>(routingEndpoints.calculate, body);
  return data;
}

export async function fetchRoute(routeId: string) {
  const { data } = await axiosInstance.get<RouteCalculated>(routingEndpoints.byId(routeId));
  return data;
}
