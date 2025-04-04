export interface EquipoMetrica {
  id: string;
  nombre: string;
  correo: string;
}

export interface DashboardData {
  totalEquipos: number;
  equiposActivos: number;
  equiposInactivos: number;
  proximosVencer: number;
  sumPagos: number;
  avgPagos: number;
  ultimosEquipos: EquipoMetrica[];
}

export interface GraficoData {
  name: string;
  value: number;
}