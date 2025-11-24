/**
 * Componente Loader global
 */

export class Loader {
  static element = null;
  static isLoading = false;
  
  /**
   * Inicializar loader
   */
  static init() {
    if (!this.element) {
      this.element = document.getElementById('global-loader');
      if (!this.element) {
        this.element = document.createElement('div');
        this.element.id = 'global-loader';
        this.element.className = 'global-loader';
        this.element.innerHTML = `
          <div class="loader-spinner"></div>
          <p class="loader-text">Cargando...</p>
        `;
        document.body.appendChild(this.element);
      }
    }
  }
  
  /**
   * Mostrar loader
   */
  static show(text = 'Cargando...') {
    this.init();
    
    const textElement = this.element.querySelector('.loader-text');
    if (textElement) {
      textElement.textContent = text;
    }
    
    this.element.style.display = 'flex';
    this.isLoading = true;
  }
  
  /**
   * Ocultar loader
   */
  static hide() {
    if (this.element) {
      this.element.style.display = 'none';
      this.isLoading = false;
    }
  }
  
  /**
   * Verificar si está cargando
   */
  static isVisible() {
    return this.isLoading;
  }
}

export default Loader;
