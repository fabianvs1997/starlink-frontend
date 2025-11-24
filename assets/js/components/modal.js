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

/**
 * Mostrar modal de confirmación
 * @param {string} titulo - Título del modal
 * @param {string} mensaje - Mensaje del modal
 * @returns {Promise<boolean>} - True si confirmó, false si canceló
 */
export function showConfirmModal(titulo, mensaje) {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content modal-confirm">
        <div class="modal-header">
          <h3>${titulo}</h3>
        </div>
        <div class="modal-body">
          <p>${mensaje}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="modal-cancel">❌ Cancelar</button>
          <button class="btn btn-primary" id="modal-confirm">✅ Confirmar</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Mostrar modal con animación
    setTimeout(() => modal.classList.add('show'), 10);
    
    document.getElementById('modal-confirm').onclick = () => {
      modal.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(modal);
        resolve(true);
      }, 200);
    };
    
    document.getElementById('modal-cancel').onclick = () => {
      modal.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(modal);
        resolve(false);
      }, 200);
    };
    
    // Cerrar con ESC
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        modal.classList.remove('show');
        setTimeout(() => {
          document.body.removeChild(modal);
          document.removeEventListener('keydown', escHandler);
          resolve(false);
        }, 200);
      }
    };
    document.addEventListener('keydown', escHandler);
  });
}

export default Modal;

