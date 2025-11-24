/**
 * Helper para localStorage
 */
import CONFIG from './config.js';

export class Storage {
  /**
   * Guardar en localStorage
   */
  static set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error('Error al guardar en localStorage:', error);
      return false;
    }
  }
  
  /**
   * Obtener de localStorage
   */
  static get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error al leer de localStorage:', error);
      return defaultValue;
    }
  }
  
  /**
   * Eliminar de localStorage
   */
  static remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error al eliminar de localStorage:', error);
      return false;
    }
  }
  
  /**
   * Limpiar todo el localStorage
   */
  static clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error al limpiar localStorage:', error);
      return false;
    }
  }
  
  /**
   * Verificar si existe una clave
   */
  static has(key) {
    return localStorage.getItem(key) !== null;
  }
  
  // Métodos específicos de la aplicación
  
  static getTema() {
    return this.get(CONFIG.STORAGE_KEYS.TEMA, 'dark');
  }
  
  static setTema(tema) {
    return this.set(CONFIG.STORAGE_KEYS.TEMA, tema);
  }
  
  static getToken() {
    return this.get(CONFIG.STORAGE_KEYS.TOKEN);
  }
  
  static setToken(token) {
    return this.set(CONFIG.STORAGE_KEYS.TOKEN, token);
  }
  
  static removeToken() {
    return this.remove(CONFIG.STORAGE_KEYS.TOKEN);
  }
  
  static getUsuario() {
    return this.get(CONFIG.STORAGE_KEYS.USUARIO);
  }
  
  static setUsuario(usuario) {
    return this.set(CONFIG.STORAGE_KEYS.USUARIO, usuario);
  }
}

export default Storage;
