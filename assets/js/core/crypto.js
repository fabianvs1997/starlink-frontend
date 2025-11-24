/**
 * Servicio de Cifrado/Descifrado AES-256-CBC
 * Compatible con backend Java CryptoService
 */

class CryptoService {
  constructor() {
    // ⚠️ DEBE SER LA MISMA CLAVE QUE EN EL BACKEND
    // En producción, obtenerla de variables de entorno
    this.secretKey = 'MySecretKey12345MySecretKey12345'; // 32 caracteres = 256 bits
  }
  
  /**
   * Convertir string a ArrayBuffer
   */
  str2ab(str) {
    const encoder = new TextEncoder();
    return encoder.encode(str);
  }
  
  /**
   * Convertir ArrayBuffer a string
   */
  ab2str(buffer) {
    const decoder = new TextDecoder();
    return decoder.decode(buffer);
  }
  
  /**
   * Importar clave secreta para Web Crypto API
   */
  async getKey() {
    const keyData = this.str2ab(this.secretKey);
    return await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-CBC' },
      false,
      ['encrypt', 'decrypt']
    );
  }
  
  /**
   * Descifrar datos que vienen del backend
   * @param {string} encryptedBase64 - Texto cifrado en Base64 (IV + datos)
   * @returns {Promise<string>} Texto plano descifrado
   */
  async decrypt(encryptedBase64) {
    if (!encryptedBase64) return encryptedBase64;
    
    try {
      // Decodificar Base64
      const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
      
      // Extraer IV (primeros 16 bytes)
      const iv = combined.slice(0, 16);
      
      // Extraer datos cifrados (resto)
      const encrypted = combined.slice(16);
      
      // Obtener clave
      const key = await this.getKey();
      
      // Descifrar usando Web Crypto API
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-CBC', iv },
        key,
        encrypted
      );
      
      return this.ab2str(decrypted);
      
    } catch (error) {
      console.error('❌ Error al descifrar:', error);
      return encryptedBase64; // Retornar original si falla
    }
  }
  
  /**
   * Cifrar datos para enviar al backend
   * @param {string} plainText - Texto plano a cifrar
   * @returns {Promise<string>} Texto cifrado en Base64
   */
  async encrypt(plainText) {
    if (!plainText) return plainText;
    
    try {
      // Generar IV aleatorio de 16 bytes
      const iv = crypto.getRandomValues(new Uint8Array(16));
      
      // Obtener clave
      const key = await this.getKey();
      
      // Cifrar usando Web Crypto API
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-CBC', iv },
        key,
        this.str2ab(plainText)
      );
      
      // Combinar IV + datos cifrados
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(encrypted), iv.length);
      
      // Codificar en Base64
      return btoa(String.fromCharCode(...combined));
      
    } catch (error) {
      console.error('❌ Error al cifrar:', error);
      return plainText; // Retornar original si falla
    }
  }
  
  /**
   * Descifrar múltiples campos de un objeto
   * @param {Object} obj - Objeto con campos cifrados
   * @param {Array<string>} fieldsToDecrypt - Nombres de campos a descifrar
   * @returns {Promise<Object>} Objeto con campos descifrados
   */
  async decryptObject(obj, fieldsToDecrypt) {
    if (!obj) return obj;
    
    const decrypted = { ...obj };
    
    // Descifrar cada campo especificado
    for (const field of fieldsToDecrypt) {
      if (decrypted[field]) {
        decrypted[field] = await this.decrypt(decrypted[field]);
      }
    }
    
    return decrypted;
  }
  
  /**
   * Descifrar array de objetos
   * @param {Array<Object>} array - Array de objetos con campos cifrados
   * @param {Array<string>} fieldsToDecrypt - Campos a descifrar
   * @returns {Promise<Array<Object>>} Array con objetos descifrados
   */
  async decryptArray(array, fieldsToDecrypt) {
    if (!array || !Array.isArray(array)) return array;
    
    return Promise.all(
      array.map(obj => this.decryptObject(obj, fieldsToDecrypt))
    );
  }
  
  /**
   * Cifrar múltiples campos de un objeto
   * @param {Object} obj - Objeto con campos en texto plano
   * @param {Array<string>} fieldsToEncrypt - Campos a cifrar
   * @returns {Promise<Object>} Objeto con campos cifrados
   */
  async encryptObject(obj, fieldsToEncrypt) {
    if (!obj) return obj;
    
    const encrypted = { ...obj };
    
    // Cifrar cada campo especificado
    for (const field of fieldsToEncrypt) {
      if (encrypted[field]) {
        encrypted[field] = await this.encrypt(encrypted[field]);
      }
    }
    
    return encrypted;
  }
  
  /**
   * Verificar si un string está cifrado (es Base64 válido)
   * @param {string} str - String a verificar
   * @returns {boolean} true si parece estar cifrado
   */
  isEncrypted(str) {
    if (!str || typeof str !== 'string') return false;
    
    try {
      return btoa(atob(str)) === str;
    } catch (e) {
      return false;
    }
  }
}

// Exportar instancia singleton
const cryptoService = new CryptoService();
export default cryptoService;
