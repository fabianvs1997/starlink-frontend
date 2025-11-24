/**
 * Módulo Pagos
 */
import ApiClient from '../core/api.js';
import { 
  formatearMoneda, 
  formatearFecha, 
  sanitizeHTML,
  getFechaActual 
} from '../core/utils.js';
import { Toast } from '../components/toast.js';
import { Modal } from '../components/modal.js';
import { Loader } from '../components/loader.js';

export class PagosModule {
  constructor() {
    this.container = null;
    this.pagos = [];
    this.equipos = [];
    this.modalPago = null;
  }
  
  /**
   * Renderizar módulo
   */
  async render() {
    this.container = document.getElementById('app-content');
    if (!this.container) return;
    
    this.container.innerHTML = `
      <div class="pagos-module">
        <div class="module-header">
          <div class="module-title">
            <h1>💰 Gestión de Pagos</h1>
            <p class="module-subtitle">Registra y administra todos los pagos de los equipos</p>
          </div>
          
          <div class="module-actions">
            <button class="btn btn-success" id="btn-registrar-pago">
              <span>💵</span> Registrar Pago
            </button>
            <button class="btn btn-secondary" id="btn-exportar-pagos">
              <span>📥</span> Exportar
            </button>
          </div>
        </div>
        
        <div class="module-filters">
          <input 
            type="month" 
            id="filter-mes" 
            class="filter-select">
          
          <select id="filter-metodo" class="filter-select">
            <option value="">💳 Todos los métodos</option>
            <option value="Efectivo">💵 Efectivo</option>
            <option value="Transferencia">🏦 Transferencia</option>
            <option value="Tarjeta">💳 Tarjeta</option>
            <option value="Cheque">📝 Cheque</option>
          </select>
        </div>
        
        <div id="pagos-content">
          <div class="sl-loading">⏳ Cargando pagos...</div>
        </div>
        
        <div id="pagos-resumen" class="pagos-resumen"></div>
      </div>
    `;
    
    await this.cargarDatos();
    this.setupEventListeners();
  }
  
  /**
   * Configurar event listeners
   */
  setupEventListeners() {
    // Botón registrar pago
    const btnRegistrar = document.getElementById('btn-registrar-pago');
    if (btnRegistrar) {
      btnRegistrar.addEventListener('click', () => this.abrirModalPago());
    }
    
    // Botón exportar
    const btnExportar = document.getElementById('btn-exportar-pagos');
    if (btnExportar) {
      btnExportar.addEventListener('click', () => this.exportarPagos());
    }
    
    // Filtros
    const filterMes = document.getElementById('filter-mes');
    const filterMetodo = document.getElementById('filter-metodo');
    
    if (filterMes) {
      filterMes.addEventListener('change', () => this.filtrarPagos());
    }
    
    if (filterMetodo) {
      filterMetodo.addEventListener('change', () => this.filtrarPagos());
    }
  }
  
  /**
   * Cargar datos
   */
  async cargarDatos() {
    // Cargar equipos para el selector
    const equiposResult = await ApiClient.get('/equipos');
    if (equiposResult && equiposResult.data) {
      this.equipos = equiposResult.data.filter(e => e.activo === 'SI');
    }
    
    // Cargar pagos
    await this.cargarPagos();
  }
  
  /**
   * Cargar pagos
   */
  async cargarPagos() {
    const equiposResult = await ApiClient.get('/equipos');
    
    if (!equiposResult || !equiposResult.data) {
      document.getElementById('pagos-content').innerHTML = 
        '<div class="sl-error-state">❌ Error al cargar pagos</div>';
      return;
    }
    
    let todosLosPagos = [];
    
    // Obtener pagos de cada equipo
    for (const equipo of equiposResult.data) {
      const pagosResult = await ApiClient.get(`/pagos/equipo/${equipo.id}`);
      
      if (pagosResult && pagosResult.data) {
        const pagosConEquipo = pagosResult.data.map(pago => ({
          ...pago,
          nombreEquipo: equipo.nombre,
          categoriaEquipo: equipo.categoria,
          estadoEquipo: equipo.estadoPago
        }));
        
        todosLosPagos = todosLosPagos.concat(pagosConEquipo);
      }
    }
    
    // Ordenar por fecha descendente
    this.pagos = todosLosPagos.sort((a, b) => 
      new Date(b.fechaPago) - new Date(a.fechaPago)
    );
    
    this.renderPagos();
    this.renderResumen();
  }
  
  /**
   * Filtrar pagos
   */
  filtrarPagos() {
    // Implementar filtros si es necesario
    this.renderPagos();
  }
  
  /**
   * Renderizar pagos
   */
  renderPagos() {
    const content = document.getElementById('pagos-content');
    if (!content) return;
    
    if (this.pagos.length === 0) {
      content.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">💰</div>
          <h3>No hay pagos registrados</h3>
          <p>Comienza registrando el primer pago</p>
        </div>
      `;
      return;
    }
    
    let html = `
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Equipo</th>
              <th>Categoría</th>
              <th>Monto</th>
              <th>Fecha</th>
              <th>Método</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    this.pagos.forEach(pago => {
      const metodoIcon = this.getMetodoIcon(pago.metodo);
      
      html += `
        <tr>
          <td><strong>${sanitizeHTML(pago.nombreEquipo)}</strong></td>
          <td>${sanitizeHTML(pago.categoriaEquipo || '-')}</td>
          <td><strong>${formatearMoneda(pago.monto)}</strong></td>
          <td>${formatearFecha(pago.fechaPago)}</td>
          <td>${metodoIcon} ${pago.metodo || 'N/A'}</td>
          <td>${sanitizeHTML(pago.descripcion || '-')}</td>
          <td>
            <button class="btn btn-sm btn-danger" onclick="window.app.currentModule.eliminarPago(${pago.id})">
              🗑️
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
   * Renderizar resumen
   */
  renderResumen() {
    const resumen = document.getElementById('pagos-resumen');
    if (!resumen) return;
    
    const totalPagado = this.pagos.reduce((sum, p) => sum + p.monto, 0);
    const totalRegistros = this.pagos.length;
    
    // Calcular por método
    const porMetodo = {};
    this.pagos.forEach(p => {
      const metodo = p.metodo || 'Sin especificar';
      porMetodo[metodo] = (porMetodo[metodo] || 0) + p.monto;
    });
    
    let html = `
      <div class="resumen-cards">
        <div class="resumen-card">
          <div class="resumen-icon">💰</div>
          <div class="resumen-content">
            <h4>Total Pagado</h4>
            <div class="resumen-value">${formatearMoneda(totalPagado)}</div>
          </div>
        </div>
        
        <div class="resumen-card">
          <div class="resumen-icon">📊</div>
          <div class="resumen-content">
            <h4>Total Registros</h4>
            <div class="resumen-value">${totalRegistros}</div>
          </div>
        </div>
        
        <div class="resumen-card">
          <div class="resumen-icon">📈</div>
          <div class="resumen-content">
            <h4>Promedio por Pago</h4>
            <div class="resumen-value">${formatearMoneda(totalRegistros > 0 ? totalPagado / totalRegistros : 0)}</div>
          </div>
        </div>
      </div>
    `;
    
    // Desglose por método
    if (Object.keys(porMetodo).length > 0) {
      html += `
        <div class="resumen-metodos">
          <h3>💳 Desglose por Método de Pago</h3>
          <div class="metodos-grid">
      `;
      
      for (const [metodo, monto] of Object.entries(porMetodo)) {
        const icon = this.getMetodoIcon(metodo);
        html += `
          <div class="metodo-item">
            <span class="metodo-icon">${icon}</span>
            <span class="metodo-nombre">${metodo}</span>
            <span class="metodo-monto">${formatearMoneda(monto)}</span>
          </div>
        `;
      }
      
      html += `
          </div>
        </div>
      `;
    }
    
    resumen.innerHTML = html;
  }
  
  /**
   * Obtener icono de método de pago
   */
  getMetodoIcon(metodo) {
    const iconos = {
      'Efectivo': '💵',
      'Transferencia': '🏦',
      'Tarjeta': '💳',
      'Cheque': '📝'
    };
    return iconos[metodo] || '💰';
  }
  
  /**
   * Abrir modal de pago
   */
  abrirModalPago() {
    const content = this.renderFormularioPago();
    
    this.modalPago = new Modal({
      title: '💰 Registrar Pago',
      content: content,
      size: 'medium'
    });
    
    this.modalPago.open();
    
    // Adjuntar evento al formulario
    setTimeout(() => {
      const form = document.getElementById('form-pago');
      if (form) {
        form.addEventListener('submit', (e) => this.guardarPago(e));
      }
      
      // Auto-completar monto al seleccionar equipo
      const selectEquipo = document.getElementById('form-equipo-select');
      if (selectEquipo) {
        selectEquipo.addEventListener('change', (e) => {
          const equipoId = e.target.value;
          const equipo = this.equipos.find(eq => eq.id == equipoId);
          if (equipo) {
            const montoInput = document.getElementById('form-pago-monto');
            if (montoInput) {
              montoInput.value = equipo.montoMensual;
            }
          }
        });
      }
    }, 100);
  }
  
  /**
   * Renderizar formulario de pago
   */
  renderFormularioPago() {
    const hoy = getFechaActual();
    
    return `
      <form id="form-pago" class="form-pago">
        <div class="form-group">
          <label for="form-equipo-select">Equipo <span class="required">*</span></label>
          <select id="form-equipo-select" required>
            <option value="">Seleccionar equipo...</option>
            ${this.equipos.map(eq => {
              const estadoIcon = eq.estadoPago === 'PAGADO' ? '✅' : 
                                eq.estadoPago === 'VENCIDO' ? '🔴' : '⏳';
              return `
                <option value="${eq.id}">
                  ${estadoIcon} ${sanitizeHTML(eq.nombre)} - ${formatearMoneda(eq.montoMensual)}
                </option>
              `;
            }).join('')}
          </select>
          <small class="form-help">Selecciona el equipo al que corresponde este pago</small>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="form-pago-monto">Monto ($) <span class="required">*</span></label>
            <input type="number" id="form-pago-monto" step="0.01" required 
                   placeholder="0.00" min="0.01">
          </div>
          
          <div class="form-group">
            <label for="form-pago-fecha">Fecha de Pago <span class="required">*</span></label>
            <input type="date" id="form-pago-fecha" required value="${hoy}">
          </div>
        </div>
        
        <div class="form-group">
          <label for="form-pago-metodo">Método de Pago <span class="required">*</span></label>
          <select id="form-pago-metodo" required>
            <option value="Efectivo">💵 Efectivo</option>
            <option value="Transferencia">🏦 Transferencia</option>
            <option value="Tarjeta">💳 Tarjeta</option>
            <option value="Cheque">📝 Cheque</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="form-pago-desc">Descripción</label>
          <textarea id="form-pago-desc" rows="3" 
                    placeholder="Notas o descripción del pago (opcional)"></textarea>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" 
                  onclick="document.querySelector('.sl-modal').style.display='none'">
            ❌ Cancelar
          </button>
          <button type="submit" class="btn btn-success">
            💾 Guardar Pago
          </button>
        </div>
      </form>
    `;
  }
  
  /**
   * Guardar pago
   */
  async guardarPago(e) {
    e.preventDefault();
    
    const equipoId = document.getElementById('form-equipo-select').value;
    
    if (!equipoId) {
      Toast.error('Debes seleccionar un equipo');
      return;
    }
    
    const data = {
      monto: parseFloat(document.getElementById('form-pago-monto').value),
      fechaPago: document.getElementById('form-pago-fecha').value,
      metodo: document.getElementById('form-pago-metodo').value,
      descripcion: document.getElementById('form-pago-desc').value.trim()
    };
    
    if (!data.monto || data.monto <= 0) {
      Toast.error('El monto debe ser mayor a 0');
      return;
    }
    
    Loader.show('Registrando pago...');
    
    const result = await ApiClient.post(`/pagos/equipo/${equipoId}`, data);
    
    Loader.hide();
    
    if (result) {
      Toast.success('💰 Pago registrado exitosamente');
      this.modalPago.close();
      await this.cargarPagos();
    }
  }
  
  /**
   * Eliminar pago
   */
  async eliminarPago(id) {
    if (!confirm('¿Estás seguro de eliminar este pago?')) {
      return;
    }
    
    Loader.show('Eliminando pago...');
    
    const result = await ApiClient.delete(`/pagos/${id}`);
    
    Loader.hide();
    
    if (result) {
      Toast.success('🗑️ Pago eliminado exitosamente');
      await this.cargarPagos();
    }
  }
  
  /**
   * Exportar pagos
   */
  exportarPagos() {
    Toast.info('📥 Función de exportación en desarrollo');
    // Aquí puedes implementar la exportación a CSV/Excel
  }
  
  /**
   * Destruir módulo
   */
  destroy() {
    if (this.modalPago) {
      this.modalPago.destroy();
    }
    this.pagos = [];
    this.equipos = [];
  }
}

export default PagosModule;
