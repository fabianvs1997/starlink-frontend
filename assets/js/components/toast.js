/**
 * Componente Toast para notificaciones
 */
import { generateId } from '../core/utils.js';
import CONFIG from '../core/config.js';

export class Toast {
  static container = null;
  
  /**
   * Inicializar contenedor
   */
  static init() {
    if (!this.container) {
      this.container = document.getElementById('toast-container');
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
      }
    }
  }
  
  /**
   * Mostrar toast
   */
  static show(message, type = 'info', duration = CONFIG.NOTIFICACIONES.DURACION_DEFAULT) {
    this.init();
    
    const id = generateId();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.id = `toast-${id}`;
    
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: '🔔'
    };
    
    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || icons.info}</div>
      <div class="toast-message">${message}</div>
      <button class="toast-close" onclick="document.getElementById('toast-${id}').remove()">×</button>
    `;
    
    this.container.appendChild(toast);
    
    // Auto-cerrar
    setTimeout(() => {
      if (toast.parentNode) {
        toast.classList.add('toast-fade-out');
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);
    
    return id;
  }
  
  /**
   * Toast de éxito
   */
  static success(message, duration) {
    return this.show(message, 'success', duration);
  }
  
  /**
   * Toast de error
   */
  static error(message, duration) {
    return this.show(message, 'error', duration);
  }
  
  /**
   * Toast de advertencia
   */
  static warning(message, duration) {
    return this.show(message, 'warning', duration);
  }
  
  /**
   * Toast de información
   */
  static info(message, duration) {
    return this.show(message, 'info', duration);
  }
}

export default Toast;
