import axios from 'axios';
import { DashboardData } from '@/types/dashboard';

const BASE_URL = 'https://starlink-equipos.onrender.com/api';

export const dashboardService = {
  async obtenerMetricas(): Promise<DashboardData> {
    try {
      const response = await axios.get<DashboardData>(`${BASE_URL}/dashboard`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener métricas:', error);
      throw error;
    }
  }
};