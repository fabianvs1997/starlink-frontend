/**
 * Módulo Dashboard
 */
import ApiClient from '../core/api.js';
import { formatearMoneda } from '../core/utils.js';
import { Toast } from '../components/toast.js';
import { Loader } from '../components/loader.js';

export class DashboardModule {
  constructor() {
    this.stats = null;
    this.container = null;
  }
  
  /**
   * Renderizar módulo
   */
  async render() {
    this.container = document.getElementById('app-content');
    if (!this.container) return;
    
    this.container.innerHTML = '<div class="sl-loading">⏳ Cargando estadísticas...</div>';
    
    await this.cargarEstadisticas();
  }
  
  /**
   * Cargar estadísticas
   */
  async cargarEstadisticas() {
    try {
      Loader.show();
      
      // ✅ Llamar al endpoint y desempaquetar data
      const response = await ApiClient.get('/estadisticas');
      
      console.log('📊 Response completo:', response);
      
      // Desempaquetar data si viene en ApiResponse
      const stats = response?.data || response;
      
      console.log('📊 Estadísticas procesadas:', stats);
      
      // Validar que stats tenga las propiedades necesarias
      if (!stats || typeof stats !== 'object') {
        throw new Error('Respuesta inválida del servidor');
      }
      
      this.stats = stats;
      this.renderEstadisticas();
      
      Loader.hide();
      
    } catch (error) {
      console.error('❌ Error al cargar estadísticas:', error);
      Loader.hide();
      Toast.error('Error al cargar estadísticas');
      
      if (this.container) {
        this.container.innerHTML = `
          <div class="sl-alert sl-alert-danger">
            <span class="alert-icon">❌</span>
            <div class="alert-content">
              <strong>Error:</strong> No se pudieron cargar las estadísticas.
              <br><small>${error.message}</small>
            </div>
          </div>
        `;
      }
    }
  }
  
  /**
   * Renderizar estadísticas
   */
  renderEstadisticas() {
    if (!this.stats) {
      console.error('❌ No hay estadísticas para renderizar');
      return;
    }
    
    const stats = this.stats;
    
    console.log('🎨 Renderizando estadísticas:', stats);
    
    let html = '<div class="dashboard-container">';
    
    // Alertas urgentes
    if (stats.equiposVencidos && stats.equiposVencidos > 0) {
      html += `
        <div class="sl-alert sl-alert-danger">
          <span class="alert-icon">🔴</span>
          <div class="alert-content">
            <strong>URGENTE:</strong> Tienes ${stats.equiposVencidos} equipo(s) vencido(s) que requieren atención inmediata
          </div>
        </div>
      `;
    }
    
    if (stats.proximoVencimiento && stats.proximoVencimiento <= 5 && stats.proximoVencimiento > 0) {
      html += `
        <div class="sl-alert sl-alert-warning">
          <span class="alert-icon">⏰</span>
          <div class="alert-content">
            <strong>Próximo vencimiento:</strong> Un equipo vencerá en ${stats.proximoVencimiento} día(s)
          </div>
        </div>
      `;
    }
    
    // Tarjetas de estadísticas
    html += '<div class="stats-grid">';
    
    // Total Equipos
    html += `
      <div class="stat-card">
        <div class="stat-icon">📱</div>
        <div class="stat-content">
          <h3 class="stat-label">Total Equipos</h3>
          <div class="stat-value">${stats.totalEquipos || 0}</div>
          <p class="stat-description">Registrados en el sistema</p>
        </div>
      </div>
    `;
    
    // Equipos Activos
    html += `
      <div class="stat-card stat-card-success">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <h3 class="stat-label">Equipos Activos</h3>
          <div class="stat-value">${stats.equiposActivos || 0}</div>
          <p class="stat-description">Funcionando correctamente</p>
        </div>
      </div>
    `;
    
    // Pendiente Pago
    html += `
      <div class="stat-card stat-card-warning">
        <div class="stat-icon">⏳</div>
        <div class="stat-content">
          <h3 class="stat-label">Pendiente Pago</h3>
          <div class="stat-value">${stats.equiposPendientePago || 0}</div>
          <p class="stat-description">Requieren pago</p>
        </div>
      </div>
    `;
    
    // Vencidos
    html += `
      <div class="stat-card stat-card-danger">
        <div class="stat-icon">🔴</div>
        <div class="stat-content">
          <h3 class="stat-label">Vencidos</h3>
          <div class="stat-value">${stats.equiposVencidos || 0}</div>
          <p class="stat-description">Pasaron la fecha límite</p>
        </div>
      </div>
    `;
    
    // Cancelados
    html += `
      <div class="stat-card stat-card-secondary">
        <div class="stat-icon">❌</div>
        <div class="stat-content">
          <h3 class="stat-label">Cancelados</h3>
          <div class="stat-value">${stats.equiposCancelados || 0}</div>
          <p class="stat-description">Servicios cancelados</p>
        </div>
      </div>
    `;
    
    // Monto Total Mensual
    html += `
      <div class="stat-card">
        <div class="stat-icon">💵</div>
        <div class="stat-content">
          <h3 class="stat-label">Monto Total Mensual</h3>
          <div class="stat-value">${formatearMoneda(stats.montoTotalMensual || 0)}</div>
          <p class="stat-description">Ingresos esperados</p>
        </div>
      </div>
    `;
    
    // Pagado Este Mes
    const porcentajePagado = stats.montoTotalMensual && stats.montoTotalMensual > 0
      ? Math.round((stats.montoPagadoMesActual / stats.montoTotalMensual) * 100) 
      : 0;
    
    html += `
      <div class="stat-card stat-card-success">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <h3 class="stat-label">Pagado Este Mes</h3>
          <div class="stat-value">${formatearMoneda(stats.montoPagadoMesActual || 0)}</div>
          <p class="stat-description">${porcentajePagado}% del total</p>
        </div>
      </div>
    `;
    
    // Deuda Pendiente
    html += `
      <div class="stat-card stat-card-danger">
        <div class="stat-icon">💸</div>
        <div class="stat-content">
          <h3 class="stat-label">Deuda Pendiente</h3>
          <div class="stat-value">${formatearMoneda(stats.deudaTotalMesActual || 0)}</div>
          <p class="stat-description">Por cobrar este mes</p>
        </div>
      </div>
    `;
    
    // Próximo Vencimiento
    html += `
      <div class="stat-card stat-card-info">
        <div class="stat-icon">⏰</div>
        <div class="stat-content">
          <h3 class="stat-label">Próximo Vence</h3>
          <div class="stat-value">${stats.proximoVencimiento || 'N/A'}</div>
          <p class="stat-description">${stats.proximoVencimiento > 0 ? 'días restantes' : 'sin vencimientos'}</p>
        </div>
      </div>
    `;
    
    html += '</div>'; // Cierre stats-grid
    
    // Gráfico de progreso
    html += `
      <div class="dashboard-chart">
        <h3>📊 Progreso de Cobranza del Mes</h3>
        <div class="progress-bar-container">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${porcentajePagado}%"></div>
          </div>
          <div class="progress-label">${porcentajePagado}% completado</div>
        </div>
      </div>
    `;
    
    html += '</div>'; // Cierre dashboard-container
    
    this.container.innerHTML = html;
    
    console.log('✅ Estadísticas renderizadas exitosamente');
  }
  
  /**
   * Destruir módulo
   */
  destroy() {
    this.stats = null;
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

export default DashboardModule;



