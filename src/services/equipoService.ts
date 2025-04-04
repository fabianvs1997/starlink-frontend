import axios from 'axios';
import { Equipo, EquipoFiltros } from '@/types/equipo';

const BASE_URL = 'https://starlink-equipos.onrender.com/api/equipos';

export const equipoService = {
  async obtenerTodos(): Promise<Equipo[]> {
    try {
      const response = await axios.get<Equipo[]>(BASE_URL);
      return response.data;
    } catch (error) {
      console.error('Error al obtener equipos:', error);
      throw error;
    }
  },

  async obtenerPorFiltros(filtros: EquipoFiltros): Promise<Equipo[]> {
    try {
      const response = await axios.get<Equipo[]>(BASE_URL, { params: filtros });
      return response.data;
    } catch (error) {
      console.error('Error al filtrar equipos:', error);
      throw error;
    }
  },

  async crear(equipo: Omit<Equipo, 'id'>): Promise<Equipo> {
    try {
      const response = await axios.post<Equipo>(BASE_URL, equipo);
      return response.data;
    } catch (error) {
      console.error('Error al crear equipo:', error);
      throw error;
    }
  },

  async actualizar(id: string, equipo: Partial<Equipo>): Promise<Equipo> {
    try {
      const response = await axios.put<Equipo>(`${BASE_URL}/${id}`, equipo);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar equipo:', error);
      throw error;
    }
  },

  async eliminar(id: string): Promise<void> {
    try {
      await axios.delete(`${BASE_URL}/${id}`);
    } catch (error) {
      console.error('Error al eliminar equipo:', error);
      throw error;
    }
  }
};