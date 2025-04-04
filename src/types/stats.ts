export interface EstadisticaGeneral {
  totalEquipos: number;
  equiposActivos: number;
  equiposInactivos: number;
}

export interface EstadisticasPagos {
  totalPagos: number;
  promedioPagos: number;
  equiposConPagosPendientes: number;
}

export interface EstadisticasPorMes {
  mes: string;
  nuevoEquipos: number;
  totalPagos: number;
}

export interface StatsData {
  general: EstadisticaGeneral;
  pagos: EstadisticasPagos;
  porMes: EstadisticasPorMes[];
}