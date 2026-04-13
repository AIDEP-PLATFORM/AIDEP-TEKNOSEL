import axios, { AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENDPOINTS } from './endpoints';

const BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000') + '/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Her istekte access_token ekle
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('[API] →', config.method?.toUpperCase(), config.baseURL + config.url);
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => {
    console.log('[API] ←', res.status, res.config.url);
    return res;
  },
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    console.warn('[API] ERR', error?.response?.status, error?.config?.url, error?.response?.data);

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Refresh endpoint'inin kendisi 401 dönerse → çık
      if (originalRequest.url?.includes(ENDPOINTS.AUTH.REFRESH)) {
        await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
          }
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('no_refresh_token');

        const res = await axios.post(
          BASE_URL + ENDPOINTS.AUTH.REFRESH,
          { refresh_token: refreshToken },
          { headers: { 'Content-Type': 'application/json' } },
        );

        const { access_token, refresh_token: newRefresh } = res.data;
        await AsyncStorage.setItem('access_token', access_token);
        if (newRefresh) await AsyncStorage.setItem('refresh_token', newRefresh);

        processQueue(null, access_token);
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
