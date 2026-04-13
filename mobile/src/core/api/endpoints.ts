export const ENDPOINTS = {
  AUTH: {
    LOGIN:    '/auth/login',
    REGISTER: '/auth/register',
    ME:       '/auth/me',
    LOGOUT:   '/auth/logout',
    REFRESH:  '/auth/refresh',
  },
  USERS: {
    ME: '/users/me',
  },
  EARTHQUAKES: {
    LIST:   '/earthquakes',
    LATEST: '/earthquakes/latest',
  },
  DAMAGE: {
    LIST:   '/damage',
    CREATE: '/damage',
    DETAIL: (id: string) => `/damage/${id}`,
  },
  ROUTES: {
    CALCULATE: '/routing/calculate',
    GET:       (id: string) => `/routing/${id}`,
  },
  VOLUNTEERS: {
    ME:           '/volunteers/me',
    LIST:         '/volunteers',
    LOCATION:     '/volunteers/me/location',
    AVAILABILITY: '/volunteers/me/availability',
    TEAMS:        {
      LIST:       '/volunteers/teams',
      CREATE:     '/volunteers/teams',
      DETAIL:     (id: string) => `/volunteers/teams/${id}`,
      MEMBERS:    (id: string) => `/volunteers/teams/${id}/members`,
      MEMBER:     (teamId: string, volId: string) => `/volunteers/teams/${teamId}/members/${volId}`,
      ASSIGN:     (id: string) => `/volunteers/teams/${id}/assign`,
      STATUS:     (id: string) => `/volunteers/teams/${id}/status`,
      LOCATIONS:  '/volunteers/teams/locations',
    },
  },
  REQUESTS: {
    LIST:   '/requests',
    DETAIL: (id: string) => `/requests/${id}`,
  },
};
