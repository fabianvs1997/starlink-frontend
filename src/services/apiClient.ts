import axios from 'axios';
import { obtenerConfiguracion } from '@/types/config';

const config = obtenerConfiguracion();

const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 10000
});

// Interceptor de solicitudes
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(config.tokenStorageKey);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuestas
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401: // No autorizado
          localStorage.removeItem(config.tokenStorageKey);
          window.location.href = '/login';
          break;
        case 403: // Prohibido
          console.error('Acceso denegado');
          break;
        case 500: // Error del servidor
          console.error('Error interno del servidor');
          break;
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;