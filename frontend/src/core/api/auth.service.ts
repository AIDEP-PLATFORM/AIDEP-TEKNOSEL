import axiosInstance from './axiosInstance';
import { authEndpoints } from './endpoints';
import type { User } from '../../stores/authStore';

export interface RegisterPayload {
  email: string;
  password: string;
  phone: string;
  tc_no: string;
  full_name: string;
  role: 'ngo';
  organization: string;
  city?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

const authService = {
  async register(payload: RegisterPayload): Promise<AuthTokens> {
    const { data } = await axiosInstance.post<AuthTokens>(authEndpoints.register, payload);
    return data;
  },

  async login(payload: LoginPayload): Promise<AuthTokens> {
    const { data } = await axiosInstance.post<AuthTokens>(authEndpoints.login, payload);
    return data;
  },

  async me(accessToken?: string): Promise<User> {
    const { data } = await axiosInstance.get<User>(authEndpoints.me, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });
    return data;
  },
};

export default authService;
