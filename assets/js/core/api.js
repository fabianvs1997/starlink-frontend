/**
 * Cliente HTTP para comunicación con el API
 */
import CONFIG from './config.js';
import { Toast } from '../components/toast.js';

export class ApiClient {
  /**
   * Request GET
   */
  static async get(endpoint) {
    return this.request(endpoint, 'GET');
  }
  
  /**
   * Request POST
   */
  static async post(endpoint, data) {
    return this.request(endpoint, 'POST', data);
  }
  
  /**
   * Request PUT
   */
  static async put(endpoint, data) {
    return this.request(endpoint, 'PUT', data);
  }
  
  /**
   * Request DELETE
   */
  static async delete(endpoint) {
    return this.request(endpoint, 'DELETE');
  }
  
  /**
   * Request genérico
   */
  static async request(endpoint, method = 'GET', data = null) {
    try {
      const url = CONFIG.API_URL + endpoint;
      
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };
      
      // Agregar token si existe
      const token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
      if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
      }
      
      if (data) {
        options.body = JSON.stringify(data);
      }
      
      console.log(`🔵 [API ${method}] ${endpoint}`, data);
      
      const response = await fetch(url, options);
      
      // Manejar 204 No Content
      if (response.status === 204) {
        console.log('🟢 [API] 204 No Content');
        return { success: true, data: null };
      }
      
      const responseData = await response.json();
      console.log('🟢 [API Response]', responseData);
      
      if (!response.ok) {
        const errorMsg = responseData.message || responseData.error || 'Error en la solicitud';
        Toast.error(errorMsg);
        console.error('🔴 [API Error]', errorMsg);
        return null;
      }
      
      return responseData;
      
    } catch (error) {
      const errorMsg = 'Error de conexión: ' + error.message;
      Toast.error(errorMsg);
      console.error('🔴 [Connection Error]', error);
      return null;
    }
  }
}

export default ApiClient;

