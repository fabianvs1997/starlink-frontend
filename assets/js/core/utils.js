/**
 * Utilidades generales
 */

/**
 * Sanitizar HTML para prevenir XSS
 */
export function sanitizeHTML(str) {
  if (!str) return '';
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

/**
 * Formatear moneda
 */
export function formatearMoneda(valor) {
  return '$' + parseFloat(valor).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

/**
 * Formatear fecha
 */
export function formatearFecha(fecha) {
  if (!fecha) return '-';
  const date = new Date(fecha + 'T00:00:00');
  return date.toLocaleDateString('es-MX', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

/**
 * Calcular días hasta vencimiento
 */
export function calcularDiasHastaVencimiento(fechaVencimiento) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const vencimiento = new Date(fechaVencimiento + 'T00:00:00');
  const diferencia = vencimiento - hoy;
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
}

/**
 * Obtener clase de badge según estado
 */
export function getBadgeClass(estado) {
  const clases = {
    'PAGADO': 'success',
    'PENDIENTE': 'warning',
    'VENCIDO': 'danger',
    'CANCELADO': 'secondary'
  };
  return clases[estado] || 'secondary';
}

/**
 * Debounce para optimizar búsquedas
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Generar ID único
 */
export function generateId() {
  return Date.now() + Math.random().toString(36).substr(2, 9);
}

/**
 * Validar email
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Obtener fecha actual en formato YYYY-MM-DD
 */
export function getFechaActual() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Escape para regex
 */
export function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
