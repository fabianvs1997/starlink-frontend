// Tipos para Equipo
export interface Equipo {
  id?: string;
  nombre: string;
  correo: string;
  contrasena: string;
  pagos: number;
  vencimientoPagos?: string | null;
  cuentaTarjeta?: string;
  numeroEquipos: number;
  numeroId: string;
  numeroSerie: string;
  numeroKit: string;
  equiposActivos: boolean;
  createdAt?: string;
}

// Tipos de Estado de Autenticación
export interface AuthState {
  token: string | null;
  userId: string | null;
  loading: boolean;
}

// Tipos para Credenciales de Login
export interface LoginCredentials {
  correo: string;
  password: string;
  recaptchaToken: string;
}

// Enumeración de Roles de Usuario
export enum UserRole {
  ADMIN = 'ADMIN',
  STANDARD = 'STANDARD',
  GUEST = 'GUEST'
}

// Tipos para Contexto de Autenticación
export interface AuthContextType {
  auth: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

// Tipos para Métricas del Dashboard
export interface DashboardMetrics {
  totalEquipos: number;
  equiposActivos: number;
  equiposInactivos: number;
  proximosVencer: number;
  sumPagos: number;
  avgPagos: number;
}

// Tipos para Gráficos
export interface PieChartData {
  name: string;
  value: number;
}

export interface LineChartData {
  month: string;
  count: number;
}

// Tipos para Filtrado y Búsqueda
export interface SearchFilter {
  term: string;
  field?: keyof Equipo;
}

// Tipos para Respuestas de API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

// Tipos para Formularios
export interface FormErrors {
  [key: string]: string;
}

// Tipos para Paginación
export interface PaginationConfig {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

// Tipos para Opciones de Configuración
export interface AppConfig {
  theme: 'light' | 'dark';
  language: 'es' | 'en';
}

// Tipos para Eventos
export type EventHandler<T = React.SyntheticEvent> = (event: T) => void;

// Tipos para Datos de Gráficos de Pagos
export interface PaymentChartData {
  month: string;
  total: number;
}

// Tipos para Notificaciones
export interface Notification {
  id?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp?: Date;
}