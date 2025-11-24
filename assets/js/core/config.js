/**
 * Configuración global de la aplicación
 */
export const CONFIG = {
  // URL base del API
  API_URL: 'http://localhost:8081/api',
  
  // Timeout para requests
  TIMEOUT: 30000,
  
  // Versión de la aplicación
  VERSION: '2.0.0',
  
  // Endpoints del API
  ENDPOINTS: {
    AUTH: '/auth',
    EQUIPOS: '/equipos',
    PAGOS: '/pagos',
    STARLINK: '/starlink',
    ESTADISTICAS: '/estadisticas',
    NOTIFICACIONES: '/notificaciones',
    REPORTES: '/reportes'
  },
  
  // Configuración de notificaciones
  NOTIFICACIONES: {
    DURACION_DEFAULT: 5000,
    INTERVALO_VERIFICACION: 30000,
    MAX_NOTIFICACIONES: 50
  },
  
  // Configuración de almacenamiento
  STORAGE_KEYS: {
    TEMA: 'sl-tema',
    TOKEN: 'sl-token',
    USUARIO: 'sl-usuario',
    ULTIMA_NOTIF_STARLINK: 'ultima_notif_starlink'
  },
  
  // Configuración de paginación
  PAGINATION: {
    PAGE_SIZE: 20,
    MAX_PAGES_SHOWN: 5
  },
  
  // Días de alerta de vencimiento
  DIAS_ALERTA_VENCIMIENTO: 7
};

export default CONFIG;
