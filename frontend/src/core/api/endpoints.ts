/**
 * Tüm göreli yollar /api/v1 altında; axios baseURL tam v1 kökünü içermelidir.
 */
export const authEndpoints = {
  login: "/auth/login",
  register: "/auth/register",
  refresh: "/auth/refresh",
  me: "/auth/me",
  forgotPassword: "/auth/forgot-password",
} as const;

export const userEndpoints = {
  me: "/users/me",
} as const;

export const damageEndpoints = {
  base: "/damage",
  byId: (id: string) => `/damage/${id}` as const,
} as const;

export const volunteerEndpoints = {
  list: "/volunteers",
  teams: "/volunteers/teams",
  teamById: (id: string) => `/volunteers/teams/${id}` as const,
  teamMembers: (teamId: string) => `/volunteers/teams/${teamId}/members` as const,
  teamMember: (teamId: string, volunteerId: string) =>
    `/volunteers/teams/${teamId}/members/${volunteerId}` as const,
  teamAssign: (teamId: string) => `/volunteers/teams/${teamId}/assign` as const,
  teamStatus: (teamId: string) => `/volunteers/teams/${teamId}/status` as const,
} as const;

export const routingEndpoints = {
  calculate: "/routing/calculate",
  byId: (id: string) => `/routing/${id}` as const,
} as const;
