import apiClient from './apiClient';
import { obtenerConfiguracion } from '@/types/config';
import { LoginCredentials } from '@/types';

const config = obtenerConfiguracion();

export const authService = {
  async login(credentials: LoginCredentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      
      if (response.data.token) {
        // Almacenar token
        localStorage.setItem(config.tokenStorageKey, response.data.token);
        return response.data;
      }
      
      throw new Error('No se recibió un token válido');
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Error de inicio de sesión');
      }
      throw error;
    }
  },

  logout() {
    localStorage.removeItem(config.tokenStorageKey);
    window.location.href = '/login';
  },

  async validarToken(token: string) {
    try {
      const response = await apiClient.post('/auth/validate', { token });
      return response.data.isValid;
    } catch {
      return false;
    }
  }
};