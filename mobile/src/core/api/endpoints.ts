export const ENDPOINTS = {
  AUTH: {
    LOGIN:    '/auth/login',
    REGISTER: '/auth/register',
    ME:       '/auth/me',
    LOGOUT:   '/auth/logout',
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
    LIST:   '/volunteers',
    DETAIL: (id: string) => `/volunteers/${id}`,
  },
  REQUESTS: {
    LIST:   '/requests',
    DETAIL: (id: string) => `/requests/${id}`,
  },
};
