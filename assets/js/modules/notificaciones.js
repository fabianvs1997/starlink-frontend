/**
 * Módulo Notificaciones
 */
import ApiClient from '../core/api.js';
import { Toast } from '../components/toast.js';
import { generateId } from '../core/utils.js';
import CONFIG from '../core/config.js';

export class NotificacionesModule {
  constructor() {
    this.container = null;
    this.notificaciones = [];
  }
  
  /**
   * Renderizar módulo
   */
  async render() {
    this.container = document.getElementById('app-content');
    if (!this.container) return;
    
    this.container.innerHTML = `
      <div class="notificaciones-module">
        <div class="module-header">
          <div class="module-title">
            <h1>🔔 Centro de Notificaciones</h1>
            <p class="module-subtitle">Alertas y recordatorios del sistema</p>
          </div>
          
          <div class="module-actions">
            <button class="btn btn-secondary" id="btn-marcar-todas-leidas">
              <span>✓</span> Marcar todas como leídas
            </button>
            <button class="btn btn-danger" id="btn-limpiar-notificaciones">
              <span>🗑️</span> Limpiar todas
            </button>
          </div>
        </div>
        
        <div class="module-filters">
          <button class="filter-btn active" data-filter="all">
            Todas
          </button>
          <button class="filter-btn" data-filter="unread">
            No leídas
          </button>
          <button class="filter-btn" data-filter="success">
            ✅ Éxito
          </button>
          <button class="filter-btn" data-filter="warning">
            ⚠️ Advertencias
          </button>
          <button class="filter-btn" data-filter="danger">
            ❌ Urgentes
          </button>
        </div>
        
        <div id="notificaciones-content">
          <div class="sl-loading">⏳ Cargando notificaciones...</div>
        </div>
      </div>
    `;
    
    await this.cargarNotificaciones();
    this.setupEventListeners();
  }
  
  /**
   * Configurar event listeners
   */
  setupEventListeners() {
    // Botón marcar todas leídas
    const btnMarcarTodas = document.getElementById('btn-marcar-todas-leidas');
    if (btnMarcarTodas) {
      btnMarcarTodas.addEventListener('click', () => this.marcarTodasLeidas());
    }
    
    // Botón limpiar
    const btnLimpiar = document.getElementById('btn-limpiar-notificaciones');
    if (btnLimpiar) {
      btnLimpiar.addEventListener('click', () => this.limpiarNotificaciones());
    }
    
    // Filtros
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.filtrarNotificaciones(e.target.dataset.filter);
      });
    });
  }
  
  /**
   * Cargar notificaciones
   */
  async cargarNotificaciones() {
    // Obtener estadísticas para generar notificaciones
    const result = await ApiClient.get('/estadisticas');
    
    if (!result || !result.data) {
      document.getElementById('notificaciones-content').innerHTML = 
        '<div class="sl-error-state">❌ Error al cargar notificaciones</div>';
      return;
    }
    
    const stats = result.data;
    
    // Generar notificaciones basadas en estadísticas
    this.notificaciones = [];
    
    // Notificación de equipos vencidos
    if (stats.equiposVencidos > 0) {
      this.notificaciones.push({
        id: generateId(),
        tipo: 'danger',
        icono: '🔴',
        titulo: 'Equipos Vencidos',
        mensaje: `Tienes ${stats.equiposVencidos} equipo(s) vencido(s) que requieren atención inmediata`,
        timestamp: new Date().toISOString(),
        leido: false,
        acciones: [
          { texto: 'Ver equipos', link: '#equipos' }
        ]
      });
    }
    
    // Notificación de próximo vencimiento
    if (stats.proximoVencimiento <= 5 && stats.proximoVencimiento > 0) {
      this.notificaciones.push({
        id: generateId(),
        tipo: 'warning',
        icono: '⏰',
        titulo: 'Próximo Vencimiento',
        mensaje: `Un equipo vencerá en ${stats.proximoVencimiento} día(s)`,
        timestamp: new Date().toISOString(),
        leido: false,
        acciones: [
          { texto: 'Ver detalles', link: '#equipos' }
        ]
      });
    }
    
    // Notificación de pagos pendientes
    if (stats.equiposPendientePago > 0) {
      this.notificaciones.push({
        id: generateId(),
        tipo: 'warning',
        icono: '💰',
        titulo: 'Pagos Pendientes',
        mensaje: `${stats.equiposPendientePago} equipo(s) con pago pendiente`,
        timestamp: new Date().toISOString(),
        leido: false,
        acciones: [
          { texto: 'Registrar pago', link: '#pagos' }
        ]
      });
    }
    
    // Notificación de deuda total
    if (stats.deudaTotalMesActual > 0) {
      this.notificaciones.push({
        id: generateId(),
        tipo: 'info',
        icono: '💸',
        titulo: 'Deuda Total del Mes',
        mensaje: `Deuda pendiente: $${stats.deudaTotalMesActual.toFixed(2)}`,
        timestamp: new Date().toISOString(),
        leido: false,
        acciones: [
          { texto: 'Ver reporte', link: '#reportes' }
        ]
      });
    }
    
    // Notificación de éxito si todo está al día
    if (stats.equiposVencidos === 0 && stats.equiposPendientePago === 0) {
      this.notificaciones.push({
        id: generateId(),
        tipo: 'success',
        icono: '✅',
        titulo: '¡Todo al día!',
        mensaje: 'Todos los equipos activos están al corriente con sus pagos',
        timestamp: new Date().toISOString(),
        leido: false,
        acciones: []
      });
    }
    
    this.renderNotificaciones();
    this.actualizarBadge();
  }
  
  /**
   * Filtrar notificaciones
   */
  filtrarNotificaciones(filtro) {
    const notificaciones = document.querySelectorAll('.notif-item');
    
    notificaciones.forEach(notif => {
      const tipo = notif.dataset.tipo;
      const leido = notif.classList.contains('leido');
      
      let mostrar = true;
      
      if (filtro === 'unread') {
        mostrar = !leido;
      } else if (filtro !== 'all') {
        mostrar = tipo === filtro;
      }
      
      notif.style.display = mostrar ? 'flex' : 'none';
    });
  }
  
  /**
   * Renderizar notificaciones
   */
  renderNotificaciones() {
    const content = document.getElementById('notificaciones-content');
    if (!content) return;
    
    if (this.notificaciones.length === 0) {
      content.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔔</div>
          <h3>Sin notificaciones</h3>
          <p>No hay alertas en este momento</p>
        </div>
      `;
      return;
    }
    
    let html = '<div class="notificaciones-list">';
    
    this.notificaciones.forEach(notif => {
      const tipoClass = notif.tipo || 'info';
      const leidoClass = notif.leido ? 'leido' : '';
      const fecha = new Date(notif.timestamp);
      const horaFormateada = fecha.toLocaleTimeString('es-MX', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      html += `
        <div class="notif-item ${tipoClass} ${leidoClass}" data-tipo="${tipoClass}" data-id="${notif.id}">
          <div class="notif-icon">${notif.icono}</div>
          
          <div class="notif-content">
            <div class="notif-header">
              <h4 class="notif-titulo">${notif.titulo}</h4>
              <span class="notif-time">${horaFormateada}</span>
            </div>
            
            <p class="notif-mensaje">${notif.mensaje}</p>
            
            ${notif.acciones && notif.acciones.length > 0 ? `
              <div class="notif-acciones">
                ${notif.acciones.map(accion => `
                  <a href="${accion.link}" class="notif-btn">${accion.texto}</a>
                `).join('')}
              </div>
            ` : ''}
          </div>
          
          <div class="notif-controles">
            ${!notif.leido ? `
              <button class="notif-control-btn" onclick="window.app.currentModule.marcarLeida('${notif.id}')" 
                      title="Marcar como leída">
                ✓
              </button>
            ` : ''}
            <button class="notif-control-btn" onclick="window.app.currentModule.eliminarNotificacion('${notif.id}')"
                    title="Eliminar">
              ×
            </button>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    
    content.innerHTML = html;
  }
  
  /**
   * Marcar como leída
   */
  marcarLeida(id) {
    const notif = this.notificaciones.find(n => n.id === id);
    if (notif) {
      notif.leido = true;
      this.renderNotificaciones();
      this.actualizarBadge();
      Toast.success('Notificación marcada como leída');
    }
  }
  
  /**
   * Marcar todas como leídas
   */
  marcarTodasLeidas() {
    this.notificaciones.forEach(n => n.leido = true);
    this.renderNotificaciones();
    this.actualizarBadge();
    Toast.success('Todas las notificaciones marcadas como leídas');
  }
  
  /**
   * Eliminar notificación
   */
  eliminarNotificacion(id) {
    this.notificaciones = this.notificaciones.filter(n => n.id !== id);
    this.renderNotificaciones();
    this.actualizarBadge();
    Toast.success('Notificación eliminada');
  }
  
  /**
   * Limpiar notificaciones
   */
  limpiarNotificaciones() {
    if (!confirm('¿Estás seguro de limpiar todas las notificaciones?')) {
      return;
    }
    
    this.notificaciones = [];
    this.renderNotificaciones();
    this.actualizarBadge();
    Toast.success('Notificaciones limpiadas');
  }
  
  /**
   * Actualizar badge de notificaciones
   */
  actualizarBadge() {
    const noLeidas = this.notificaciones.filter(n => !n.leido).length;
    const badge = document.getElementById('notif-badge');
    const count = document.getElementById('notif-count');
    
    if (badge && count) {
      if (noLeidas > 0) {
        badge.style.display = 'flex';
        count.textContent = noLeidas > 99 ? '99+' : noLeidas;
      } else {
        badge.style.display = 'none';
      }
    }
  }
  
  /**
   * Verificar nuevas notificaciones
   */
  async verificarNuevas() {
    await this.cargarNotificaciones();
  }
  
  /**
   * Destruir módulo
   */
  destroy() {
    this.notificaciones = [];
  }
}

export default NotificacionesModule;
