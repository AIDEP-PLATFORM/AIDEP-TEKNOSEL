import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000') + '/api/v1',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Her istekte access_token ekle
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 gelirse token temizle
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
    }
    return Promise.reject(error);
  }
);

export default api;
