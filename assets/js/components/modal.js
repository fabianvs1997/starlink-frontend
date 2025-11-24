/**
 * Componente Modal reutilizable
 */
import { generateId } from '../core/utils.js';

export class Modal {
  constructor(config) {
    this.id = config.id || `modal-${generateId()}`;
    this.title = config.title || '';
    this.content = config.content || '';
    this.size = config.size || 'medium'; // small, medium, large
    this.onClose = config.onClose || null;
    this.footer = config.footer || null;
    
    this.element = null;
    this.isOpen = false;
  }
  
  /**
   * Crear estructura del modal
   */
  create() {
    const container = document.getElementById('modal-container');
    
    this.element = document.createElement('div');
    this.element.id = this.id;
    this.element.className = `sl-modal modal-${this.size}`;
    this.element.setAttribute('role', 'dialog');
    this.element.setAttribute('aria-modal', 'true');
    this.element.setAttribute('aria-hidden', 'true');
    
    this.element.innerHTML = `
      <div class="sl-modal-backdrop" data-close="true"></div>
      <div class="sl-modal-content">
        <div class="sl-modal-header">
          <h2 class="sl-modal-title">${this.title}</h2>
          <button class="sl-modal-close" aria-label="Cerrar modal" data-close="true">×</button>
        </div>
        <div class="sl-modal-body">
          ${this.content}
        </div>
        ${this.footer ? `<div class="sl-modal-footer">${this.footer}</div>` : ''}
      </div>
    `;
    
    container.appendChild(this.element);
    this.attachEvents();
    
    return this;
  }
  
  /**
   * Adjuntar eventos
   */
  attachEvents() {
    // Cerrar al hacer clic en backdrop o botón cerrar
    this.element.addEventListener('click', (e) => {
      if (e.target.hasAttribute('data-close')) {
        this.close();
      }
    });
    
    // Cerrar con ESC
    this.escHandler = (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    };
    document.addEventListener('keydown', this.escHandler);
  }
  
  /**
   * Abrir modal
   */
  open() {
    if (!this.element) {
      this.create();
    }
    
    this.element.style.display = 'flex';
    this.element.setAttribute('aria-hidden', 'false');
    this.isOpen = true;
    
    // Focus en el primer elemento interactivo
    setTimeout(() => {
      const focusable = this.element.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable) focusable.focus();
    }, 100);
    
    return this;
  }
  
  /**
   * Cerrar modal
   */
  close() {
    if (!this.element) return;
    
    this.element.style.display = 'none';
    this.element.setAttribute('aria-hidden', 'true');
    this.isOpen = false;
    
    if (this.onClose) {
      this.onClose();
    }
    
    return this;
  }
  
  /**
   * Destruir modal
   */
  destroy() {
    if (this.element) {
      document.removeEventListener('keydown', this.escHandler);
      this.element.remove();
      this.element = null;
      this.isOpen = false;
    }
  }
  
  /**
   * Actualizar contenido
   */
  updateContent(content) {
    if (this.element) {
      const body = this.element.querySelector('.sl-modal-body');
      if (body) {
        body.innerHTML = content;
      }
    }
    return this;
  }
  
  /**
   * Actualizar título
   */
  updateTitle(title) {
    if (this.element) {
      const titleElement = this.element.querySelector('.sl-modal-title');
      if (titleElement) {
        titleElement.textContent = title;
      }
    }
    return this;
  }
}

export default Modal;
