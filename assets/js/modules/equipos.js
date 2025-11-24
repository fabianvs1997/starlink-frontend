/**
 * Módulo Equipos
 * Con cifrado AES-256 para datos sensibles
 */
import ApiClient from '../core/api.js';
import CryptoService from '../core/crypto.js';
import { 
  formatearMoneda, 
  formatearFecha, 
  calcularDiasHastaVencimiento,
  getBadgeClass,
  sanitizeHTML,
  debounce 
} from '../core/utils.js';
import { Toast } from '../components/toast.js';
import { Modal, showConfirmModal } from '../components/modal.js';
import { Loader } from '../components/loader.js';

export class EquiposModule {
  constructor() {
    this.container = null;
    this.equipos = [];
    this.equiposFiltrados = [];
    this.equipoActual = null;
    this.modalEquipo = null;
    this.modalDetalle = null;
    
    // ✅ CAMPOS SENSIBLES QUE SE CIFRAN/DESCIFRAN
    this.camposSensibles = [
      'nombre',
      'correo',
      'contraseña',
      'cuentaTarjeta',
      'numeroId',
      'numeroSerie',
      'numeroKit',
      'notas'
    ];
  }
  
  /**
   * Renderizar módulo
   */
  async render() {
    this.container = document.getElementById('app-content');
    if (!this.container) return;
    
    this.container.innerHTML = `
      <div class="equipos-module">
        <div class="module-header">
          <div class="module-title">
            <h1>📱 Gestión de Equipos</h1>
            <p class="module-subtitle">Administra todos los equipos de internet Starlink</p>
          </div>
          
          <div class="module-actions">
            <button class="btn btn-primary" id="btn-nuevo-equipo">
              <span>➕</span> Nuevo Equipo
            </button>
          </div>
        </div>
        
        <div class="module-filters">
          <input 
            type="text" 
            id="search-equipos" 
            placeholder="🔍 Buscar por nombre, categoría, correo o número de serie..." 
            class="search-input">
          
          <select id="filter-categoria" class="filter-select">
            <option value="">📋 Todas las categorías</option>
            <option value="Residencial">🏠 Residencial</option>
            <option value="RESIDENCIAL">🏠 RESIDENCIAL</option>
            <option value="Empresarial">🏢 Empresarial</option>
            <option value="RV">🚐 RV</option>
            <option value="MOVIL">🚗 MOVIL</option>
            <option value="Marítimo">⛵ Marítimo</option>
            <option value="Premium">⭐ Premium</option>
          </select>
          
          <select id="filter-estado" class="filter-select">
            <option value="">🏷️ Todos los estados</option>
            <option value="PAGADO">✅ Pagado</option>
            <option value="PENDIENTE">⏳ Pendiente</option>
            <option value="VENCIDO">🔴 Vencido</option>
            <option value="CANCELADO">❌ Cancelado</option>
          </select>
        </div>
        
        <div id="equipos-content">
          <div class="sl-loading">⏳ Cargando equipos...</div>
        </div>
      </div>
    `;
    
    await this.cargarEquipos();
    this.setupEventListeners();
  }
  
  /**
   * Configurar event listeners
   */
  setupEventListeners() {
    // Botón nuevo equipo
    const btnNuevo = document.getElementById('btn-nuevo-equipo');
    if (btnNuevo) {
      btnNuevo.addEventListener('click', () => this.abrirModalEquipo());
    }
    
    // Búsqueda con debounce
    const searchInput = document.getElementById('search-equipos');
    if (searchInput) {
      searchInput.addEventListener('input', debounce(() => {
        this.filtrarEquipos();
      }, 300));
    }
    
    // Filtros
    const filterCategoria = document.getElementById('filter-categoria');
    const filterEstado = document.getElementById('filter-estado');
    
    if (filterCategoria) {
      filterCategoria.addEventListener('change', () => this.filtrarEquipos());
    }
    
    if (filterEstado) {
      filterEstado.addEventListener('change', () => this.filtrarEquipos());
    }
  }
  
  /**
   * Cargar equipos desde API
   */
  async cargarEquipos() {
    try {
      const result = await ApiClient.get('/equipos');
      
      if (!result || !result.data) {
        document.getElementById('equipos-content').innerHTML = 
          '<div class="sl-error-state">❌ Error al cargar equipos</div>';
        return;
      }
      
      console.log('📦 Equipos cifrados recibidos:', result.data);
      
      // ✅ DESCIFRAR TODOS LOS EQUIPOS
      this.equipos = await CryptoService.decryptArray(result.data, this.camposSensibles);
      
      console.log('🔓 Equipos descifrados:', this.equipos);
      
      this.equiposFiltrados = [...this.equipos];
      this.renderEquipos();
      
    } catch (error) {
      console.error('❌ Error al cargar equipos:', error);
      document.getElementById('equipos-content').innerHTML = 
        '<div class="sl-error-state">❌ Error al cargar equipos</div>';
    }
  }
  
  /**
   * Filtrar equipos
   */
  filtrarEquipos() {
    const searchTerm = document.getElementById('search-equipos')?.value.toLowerCase() || '';
    const categoria = document.getElementById('filter-categoria')?.value || '';
    const estado = document.getElementById('filter-estado')?.value || '';
    
    this.equiposFiltrados = this.equipos.filter(equipo => {
      // Búsqueda por texto
      const matchSearch = !searchTerm || 
        equipo.nombre.toLowerCase().includes(searchTerm) ||
        equipo.correo.toLowerCase().includes(searchTerm) ||
        equipo.categoria.toLowerCase().includes(searchTerm) ||
        equipo.numeroId.toLowerCase().includes(searchTerm) ||
        equipo.numeroSerie.toLowerCase().includes(searchTerm);
      
      // Filtro por categoría
      const matchCategoria = !categoria || equipo.categoria === categoria;
      
      // Filtro por estado
      let matchEstado = true;
      if (estado === 'CANCELADO') {
        matchEstado = equipo.activo === 'NO';
      } else if (estado) {
        matchEstado = equipo.estadoPago === estado && equipo.activo !== 'NO';
      }
      
      return matchSearch && matchCategoria && matchEstado;
    });
    
    this.renderEquipos();
  }
  
  /**
   * Renderizar equipos en tabla
   */
  renderEquipos() {
    const content = document.getElementById('equipos-content');
    if (!content) return;
    
    if (this.equiposFiltrados.length === 0) {
      content.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📱</div>
          <h3>No se encontraron equipos</h3>
          <p>Intenta ajustar los filtros o crea un nuevo equipo</p>
        </div>
      `;
      return;
    }
    
    let html = `
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Monto</th>
              <th>Vencimiento</th>
              <th>Días</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    this.equiposFiltrados.forEach(equipo => {
      const diasRestantes = calcularDiasHastaVencimiento(equipo.vencimiento);
      let estadoFinal = equipo.estadoPago || 'PENDIENTE';
      
      if (equipo.activo === 'NO') {
        estadoFinal = 'CANCELADO';
      }
      
      const badgeClass = getBadgeClass(estadoFinal);
      
      let diasHtml = diasRestantes;
      if (equipo.activo === 'NO') {
        diasHtml = '-';
      } else if (diasRestantes < 0) {
        diasHtml = `<span class="text-danger">${diasRestantes}</span>`;
      } else if (diasRestantes <= 5) {
        diasHtml = `<span class="text-warning">${diasRestantes}</span>`;
      }
      
      html += `
        <tr>
          <td><strong>${sanitizeHTML(equipo.nombre)}</strong></td>
          <td>${sanitizeHTML(equipo.categoria)}</td>
          <td>${formatearMoneda(equipo.montoMensual)}</td>
          <td>${formatearFecha(equipo.vencimiento)}</td>
          <td>${diasHtml}</td>
          <td><span class="badge badge-${badgeClass}">${estadoFinal}</span></td>
          <td>
            <button class="btn btn-sm btn-primary" onclick="window.app.currentModule.verEquipo(${equipo.id})">
              👁️ Ver
            </button>
          </td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
      </div>
    `;
    
    content.innerHTML = html;
  }
  
  /**
   * Abrir modal de equipo
   */
  abrirModalEquipo(equipo = null) {
    this.equipoActual = equipo;
    
    const isEdit = !!equipo;
    const title = isEdit ? '✏️ Editar Equipo' : '➕ Nuevo Equipo';
    
    const content = this.renderFormularioEquipo(equipo);
    
    this.modalEquipo = new Modal({
      title: title,
      content: content,
      size: 'large'
    });
    
    this.modalEquipo.open();
    
    // Adjuntar evento al formulario
    setTimeout(() => {
      const form = document.getElementById('form-equipo');
      if (form) {
        form.addEventListener('submit', (e) => this.guardarEquipo(e));
      }
    }, 100);
  }
  
  /**
   * Renderizar formulario de equipo
   */
  renderFormularioEquipo(equipo) {
    const data = equipo || {};
    
    return `
      <form id="form-equipo" class="form-equipo">
        <input type="hidden" id="equipo-id" value="${data.id || ''}">
        
        <div class="form-section">
          <h3>📋 Información General</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label for="form-categoria">Categoría <span class="required">*</span></label>
              <select id="form-categoria" required>
                <option value="">Seleccionar categoría</option>
                <option value="Residencial" ${data.categoria === 'Residencial' ? 'selected' : ''}>🏠 Residencial</option>
                <option value="Empresarial" ${data.categoria === 'Empresarial' ? 'selected' : ''}>🏢 Empresarial</option>
                <option value="RV" ${data.categoria === 'RV' ? 'selected' : ''}>🚐 RV (Vehículos)</option>
                <option value="Marítimo" ${data.categoria === 'Marítimo' ? 'selected' : ''}>⛵ Marítimo</option>
                <option value="Premium" ${data.categoria === 'Premium' ? 'selected' : ''}>⭐ Premium</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="form-nombre">Nombre del Cliente <span class="required">*</span> 🔒</label>
              <input type="text" id="form-nombre" required value="${data.nombre || ''}" 
                     placeholder="Ej: Juan Pérez">
              <small>Este campo se guarda cifrado</small>
            </div>
          </div>
        </div>
        
        <div class="form-section">
          <h3>📧 Información de Contacto</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label for="form-correo">Correo Electrónico <span class="required">*</span> 🔒</label>
              <input type="email" id="form-correo" required value="${data.correo || ''}"
                     placeholder="correo@ejemplo.com">
              <small>Este campo se guarda cifrado</small>
            </div>
            
            <div class="form-group">
              <label for="form-password">Contraseña <span class="required">*</span> 🔒</label>
              <input type="password" id="form-password" required value="${data.contraseña || ''}"
                     placeholder="Mínimo 6 caracteres">
              <small>Este campo se guarda cifrado</small>
            </div>
          </div>
        </div>
        
        <div class="form-section">
          <h3>💳 Información de Pago</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label for="form-monto">Monto Mensual ($) <span class="required">*</span></label>
              <input type="number" id="form-monto" step="0.01" required value="${data.montoMensual || ''}"
                     placeholder="0.00">
            </div>
            
            <div class="form-group">
              <label for="form-vencimiento">Fecha de Vencimiento <span class="required">*</span></label>
              <input type="date" id="form-vencimiento" required value="${data.vencimiento || ''}">
            </div>
          </div>
          
          <div class="form-group">
            <label for="form-cuenta">Cuenta/Tarjeta <span class="required">*</span> 🔒</label>
            <input type="text" id="form-cuenta" required value="${data.cuentaTarjeta || ''}"
                   placeholder="Últimos 4 dígitos o referencia">
            <small>Este campo se guarda cifrado</small>
          </div>
        </div>
        
        <div class="form-section">
          <h3>🛰️ Información Técnica del Equipo</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label for="form-num-equipos">Cantidad de Equipos <span class="required">*</span></label>
              <input type="number" id="form-num-equipos" min="1" required value="${data.numeroEquipos || 1}">
            </div>
            
            <div class="form-group">
              <label for="form-id">Número de ID <span class="required">*</span> 🔒</label>
              <input type="text" id="form-id" required value="${data.numeroId || ''}"
                     placeholder="ID único del equipo">
              <small>Este campo se guarda cifrado</small>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="form-serie">Número de Serie <span class="required">*</span> 🔒</label>
              <input type="text" id="form-serie" required value="${data.numeroSerie || ''}"
                     placeholder="Serie del dispositivo">
              <small>Este campo se guarda cifrado</small>
            </div>
            
            <div class="form-group">
              <label for="form-kit">Número de Kit <span class="required">*</span> 🔒</label>
              <input type="text" id="form-kit" required value="${data.numeroKit || ''}"
                     placeholder="Kit de instalación">
              <small>Este campo se guarda cifrado</small>
            </div>
          </div>
        </div>
        
        <div class="form-section">
          <h3>📝 Notas Adicionales</h3>
          
          <div class="form-group">
            <label for="form-notas">Observaciones 🔒</label>
            <textarea id="form-notas" rows="3" placeholder="Notas o comentarios adicionales...">${data.notas || ''}</textarea>
            <small>Este campo se guarda cifrado</small>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" onclick="document.querySelector('.sl-modal')?.style?.display='none'">
            ❌ Cancelar
          </button>
          <button type="submit" class="btn btn-primary">
            💾 Guardar Equipo
          </button>
        </div>
      </form>
    `;
  }
  
  /**
   * Guardar equipo (crear o actualizar)
   */
  async guardarEquipo(e) {
    e.preventDefault();
    
    const id = document.getElementById('equipo-id')?.value;
    
    const formData = {
      categoria: document.getElementById('form-categoria').value,
      nombre: document.getElementById('form-nombre').value,
      correo: document.getElementById('form-correo').value,
      contraseña: document.getElementById('form-password').value,
      montoMensual: parseFloat(document.getElementById('form-monto').value),
      vencimiento: document.getElementById('form-vencimiento').value,
      cuentaTarjeta: document.getElementById('form-cuenta').value,
      numeroEquipos: parseInt(document.getElementById('form-num-equipos').value),
      numeroId: document.getElementById('form-id').value,
      numeroSerie: document.getElementById('form-serie').value,
      numeroKit: document.getElementById('form-kit').value,
      notas: document.getElementById('form-notas').value,
      activo: 'SI'
    };
    
    try {
      Loader.show('Guardando equipo...');
      
      console.log('📝 Datos del formulario (descifrados):', formData);
      
      // ✅ CIFRAR DATOS SENSIBLES ANTES DE ENVIAR
      const dataCifrada = await CryptoService.encryptObject(formData, this.camposSensibles);
      
      console.log('🔒 Datos cifrados para enviar:', dataCifrada);
      
      const method = id ? 'PUT' : 'POST';
      const endpoint = id ? `/equipos/${id}` : '/equipos';
      
      const result = await ApiClient.request(endpoint, method, dataCifrada);
      
      Loader.hide();
      
      if (result) {
        Toast.success(id ? '✏️ Equipo actualizado' : '➕ Equipo creado');
        this.modalEquipo?.close();
        await this.cargarEquipos();
        this.renderEquipos();
      }
      
    } catch (error) {
      console.error('❌ Error al guardar equipo:', error);
      Loader.hide();
      Toast.error('Error al guardar equipo');
    }
  }
  
  /**
   * Ver detalle de equipo
   */
  async verEquipo(id) {
    try {
      Loader.show('Cargando equipo...');
      
      const result = await ApiClient.get(`/equipos/${id}`);
      
      if (!result || !result.data) {
        throw new Error('No se pudo cargar el equipo');
      }
      
      console.log('📦 Equipo cifrado:', result.data);
      
      // ✅ DESCIFRAR EQUIPO
      const equipo = await CryptoService.decryptObject(result.data, this.camposSensibles);
      
      console.log('🔓 Equipo descifrado:', equipo);
      
      this.equipoActual = equipo;
      
      const content = this.renderDetalleEquipo(equipo);
      
      this.modalDetalle = new Modal({
        title: `📱 ${equipo.nombre}`,
        content: content,
        size: 'large'
      });
      
      this.modalDetalle.open();
      
      Loader.hide();
      
    } catch (error) {
      console.error('❌ Error al cargar equipo:', error);
      Loader.hide();
      Toast.error('Error al cargar equipo');
    }
  }
  
  /**
   * Renderizar detalle de equipo
   */
  renderDetalleEquipo(equipo) {
    const diasRestantes = calcularDiasHastaVencimiento(equipo.vencimiento);
    let estadoFinal = equipo.estadoPago || 'PENDIENTE';
    
    if (equipo.activo === 'NO') {
      estadoFinal = 'CANCELADO';
    }
    
    const badgeClass = getBadgeClass(estadoFinal);
    
    // Botón de cancelar o activar
    const btnEstado = equipo.activo === 'NO' 
      ? `<button class="btn btn-success" onclick="window.app.currentModule.cambiarEstadoEquipo(${equipo.id}, 'NO')">
           ✅ Activar Equipo
         </button>`
      : `<button class="btn btn-warning" onclick="window.app.currentModule.cambiarEstadoEquipo(${equipo.id}, 'SI')">
           ⏸️ Cancelar Equipo
         </button>`;
    
    return `
      <div class="detalle-grid">
        <div class="detalle-section">
          <h3>📋 Información General</h3>
          <p><strong>Nombre:</strong> ${sanitizeHTML(equipo.nombre)}</p>
          <p><strong>Categoría:</strong> ${sanitizeHTML(equipo.categoria)}</p>
          <p><strong>Estado:</strong> <span class="badge badge-${badgeClass}">${estadoFinal}</span></p>
          <p><strong>Activo:</strong> ${equipo.activo === 'SI' ? '✅ Sí' : '❌ No'}</p>
        </div>
        
        <div class="detalle-section">
          <h3>📧 Contacto 🔒</h3>
          <p><strong>Correo:</strong> <a href="mailto:${equipo.correo}">${sanitizeHTML(equipo.correo)}</a></p>
          <p><strong>Contraseña:</strong> ${'•'.repeat(equipo.contraseña?.length || 8)}</p>
          <small>Datos cifrados</small>
        </div>
        
        <div class="detalle-section">
          <h3>💰 Información Financiera</h3>
          <p><strong>Monto Mensual:</strong> ${formatearMoneda(equipo.montoMensual)}</p>
          <p><strong>Deuda:</strong> <span class="text-danger">${formatearMoneda(equipo.deudaMensual || 0)}</span></p>
          <p><strong>Pagado este mes:</strong> <span class="text-success">${formatearMoneda(equipo.totalPagadoMesActual || 0)}</span></p>
          <p><strong>Cuenta/Tarjeta:</strong> ${sanitizeHTML(equipo.cuentaTarjeta)} 🔒</p>
        </div>
        
        <div class="detalle-section">
          <h3>⏰ Vencimiento</h3>
          <p><strong>Fecha:</strong> ${formatearFecha(equipo.vencimiento)}</p>
          <p><strong>Días restantes:</strong> <span class="${diasRestantes < 0 ? 'text-danger' : diasRestantes <= 5 ? 'text-warning' : ''}">${equipo.activo === 'NO' ? '-' : diasRestantes + ' días'}</span></p>
        </div>
        
        <div class="detalle-section">
          <h3>🛰️ Información Técnica 🔒</h3>
          <p><strong>Cantidad:</strong> ${equipo.numeroEquipos} equipo(s)</p>
          <p><strong>ID:</strong> ${sanitizeHTML(equipo.numeroId)}</p>
          <p><strong>Serie:</strong> ${sanitizeHTML(equipo.numeroSerie)}</p>
          <p><strong>Kit:</strong> ${sanitizeHTML(equipo.numeroKit)}</p>
        </div>
        
        ${equipo.notas ? `
        <div class="detalle-section full-width">
          <h3>📝 Notas 🔒</h3>
          <p>${sanitizeHTML(equipo.notas)}</p>
        </div>
        ` : ''}
      </div>
      
      <div class="detalle-actions">
        <button class="btn btn-primary" onclick="window.app.currentModule.editarEquipo()">
          ✏️ Editar
        </button>
        <button class="btn btn-danger" onclick="window.app.currentModule.eliminarEquipo()">
          🗑️ Eliminar
        </button>
        ${btnEstado}
      </div>
    `;
  }
  
  /**
   * Editar equipo
   */
  editarEquipo() {
    if (this.modalDetalle) {
      this.modalDetalle.close();
    }
    this.abrirModalEquipo(this.equipoActual);
  }
  
  /**
   * Eliminar equipo
   */
  async eliminarEquipo() {
    if (!this.equipoActual) return;
    
    const confirmado = await showConfirmModal(
      '¿Eliminar equipo?',
      '¿Estás seguro de eliminar este equipo? Esta acción no se puede deshacer.'
    );
    
    if (!confirmado) return;
    
    try {
      Loader.show('Eliminando equipo...');
      
      const result = await ApiClient.delete(`/equipos/${this.equipoActual.id}`);
      
      Loader.hide();
      
      if (result) {
        Toast.success('🗑️ Equipo eliminado');
        if (this.modalDetalle) {
          this.modalDetalle.close();
        }
        await this.cargarEquipos();
        this.renderEquipos();
      }
      
    } catch (error) {
      console.error('❌ Error al eliminar:', error);
      Loader.hide();
      Toast.error('Error al eliminar equipo');
    }
  }
  
  /**
   * Cambiar estado de un equipo (CANCELADO ↔ ACTIVO)
   */
  async cambiarEstadoEquipo(equipoId, activo) {
    try {
      const nuevoEstado = activo === 'NO' ? 'SI' : 'NO';
      const accion = nuevoEstado === 'NO' ? 'cancelar' : 'activar';
      
      const confirmado = await showConfirmModal(
        `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} equipo?`,
        `¿Estás seguro de que deseas ${accion} este equipo?`
      );
      
      if (!confirmado) return;
      
      Loader.show(`${accion === 'cancelar' ? 'Cancelando' : 'Activando'} equipo...`);
      
      // Obtener equipo actual
      const result = await ApiClient.get(`/equipos/${equipoId}`);
      
      if (!result || !result.data) {
        throw new Error('No se pudo obtener el equipo');
      }
      
      const equipo = result.data;
      
      // ✅ DESCIFRAR PARA ACTUALIZAR
      const equipoDescifrado = await CryptoService.decryptObject(equipo, this.camposSensibles);
      
      // Actualizar estado activo
      equipoDescifrado.activo = nuevoEstado;
      
      // ✅ CIFRAR ANTES DE ENVIAR
      const dataCifrada = await CryptoService.encryptObject(equipoDescifrado, this.camposSensibles);
      
      const updateResult = await ApiClient.request(`/equipos/${equipoId}`, 'PUT', dataCifrada);
      
      if (updateResult) {
        const mensaje = accion === 'cancelar' ? 'cancelado' : 'activado';
        Toast.success(`✅ Equipo ${mensaje}`);
        
        if (this.modalDetalle) {
          this.modalDetalle.close();
        }
        
        await this.cargarEquipos();
        this.renderEquipos();
      }
      
      Loader.hide();
      
    } catch (error) {
      console.error('❌ Error:', error);
      Loader.hide();
      Toast.error('Error al cambiar estado del equipo');
    }
  }
  
  /**
   * Destruir módulo
   */
  destroy() {
    if (this.modalEquipo) {
      this.modalEquipo.destroy();
    }
    if (this.modalDetalle) {
      this.modalDetalle.destroy();
    }
    this.equipos = [];
    this.equiposFiltrados = [];
    this.equipoActual = null;
  }
}

export default EquiposModule;

