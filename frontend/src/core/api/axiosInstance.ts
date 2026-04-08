import axios from 'axios';

// 1. Temel Axios konfigürasyonu
// API URL'ini Vite'in ortam (environment) değişkenlerinden alıyoruz.
// Eğer tanımlı değilse, geliştirme aşamasında olduğumuzu varsayıp localhost:8080 veriyoruz.
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 10000, // 10 saniye sonra isteği iptal et
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Request Interceptor
// Uygulamadan çıkan her bir istek (request) sunucuya ulaşmadan hemen önce buraya düşer.
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // istekten önce gelen hataları yakalar
    return Promise.reject(error);
  }
);

// 3. Response Interceptor (Cevap Araya Giricisi)
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Eğer sunucudan 401 hatası gelirse:
    if (error.response && error.response.status === 401) {
      console.warn("Token geçersiz veya süresi dolmuş. Kullanıcı çıkışına yönlendirilecek...");

      localStorage.removeItem('token');
      // window.location.href = '/login'; 
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
