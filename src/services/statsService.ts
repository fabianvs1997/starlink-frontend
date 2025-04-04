import axios from 'axios';
import { StatsData } from '@/types/stats';

const BASE_URL = 'https://starlink-equipos.onrender.com/api/stats';

export const statsService = {
  async obtenerEstadisticas(): Promise<StatsData> {
    try {
      const response = await axios.get<StatsData>(BASE_URL);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }
};