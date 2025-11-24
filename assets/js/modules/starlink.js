/**
 * Módulo Starlink - Integración con dispositivo
 */
import ApiClient from '../core/api.js';
import { Toast } from '../components/toast.js';
import { Loader } from '../components/loader.js';
import { Storage } from '../core/storage.js';
import CONFIG from '../core/config.js';

export class StarlinkModule {
  constructor() {
    this.container = null;
    this.stats = null;
    this.intervalId = null;
  }
  
  /**
   * Renderizar módulo
   */
  async render() {
    this.container = document.getElementById('app-content');
    if (!this.container) return;
    
    this.container.innerHTML = `
      <div class="starlink-module">
        <div class="module-header">
          <div class="module-title">
            <h1>🛰️ Monitoreo Starlink</h1>
            <p class="module-subtitle">Estado y estadísticas del terminal satelital</p>
          </div>
          
          <div class="module-actions">
            <button class="btn btn-primary" id="btn-refresh-starlink">
              <span>🔄</span> Actualizar
            </button>
          </div>
        </div>
        
        <div id="starlink-content">
          <div class="sl-loading">⏳ Consultando terminal Starlink...</div>
        </div>
      </div>
    `;
    
    await this.cargarEstadisticas();
    this.setupEventListeners();
    
    // Actualizar cada minuto
    this.iniciarActualizacionAutomatica();
  }
  
  /**
   * Configurar event listeners
   */
  setupEventListeners() {
    const btnRefresh = document.getElementById('btn-refresh-starlink');
    if (btnRefresh) {
      btnRefresh.addEventListener('click', () => this.cargarEstadisticas());
    }
  }
  
  /**
   * Cargar estadísticas de Starlink
   */
  async cargarEstadisticas() {
    try {
      const result = await ApiClient.get('/starlink/stats');
      
      if (result && result.data) {
        this.stats = result.data;
        this.renderEstadisticas();
      } else {
        this.renderError();
      }
      
    } catch (error) {
      console.error('Error al obtener estadísticas Starlink:', error);
      this.renderError();
    }
  }
  
  /**
   * Renderizar estadísticas
   */
  renderEstadisticas() {
    const content = document.getElementById('starlink-content');
    if (!content) return;
    
    const stats = this.stats;
    
    let html = '<div class="starlink-dashboard">';
    
    // Estado de conexión
    html += `
      <div class="connection-status ${stats.isConnected ? 'connected' : 'disconnected'}">
        <div class="status-icon">${stats.isConnected ? '✅' : '❌'}</div>
        <div class="status-content">
          <h2>${stats.statusMessage}</h2>
          <p>Última actualización: ${new Date().toLocaleTimeString('es-MX')}</p>
        </div>
      </div>
    `;
    
    if (stats.isConnected) {
      // Grid de estadísticas
      html += '<div class="starlink-stats-grid">';
      
      // Uptime
      html += `
        <div class="stat-card">
          <div class="stat-icon">⏱️</div>
          <div class="stat-content">
            <h3 class="stat-label">Tiempo Activo</h3>
            <div class="stat-value">${this.formatUptime(stats.uptime)}</div>
            <p class="stat-description">Horas de operación continua</p>
          </div>
        </div>
      `;
      
      // Latencia
      html += `
        <div class="stat-card ${this.getLatencyClass(stats.latency)}">
          <div class="stat-icon">⚡</div>
          <div class="stat-content">
            <h3 class="stat-label">Latencia</h3>
            <div class="stat-value">${stats.latency} ms</div>
            <p class="stat-description">${this.getLatencyDescription(stats.latency)}</p>
          </div>
        </div>
      `;
      
      // Download Speed
      html += `
        <div class="stat-card stat-card-success">
          <div class="stat-icon">⬇️</div>
          <div class="stat-content">
            <h3 class="stat-label">Velocidad Descarga</h3>
            <div class="stat-value">${stats.downloadSpeed} Mbps</div>
            <p class="stat-description">Velocidad actual</p>
          </div>
        </div>
      `;
      
      // Upload Speed
      html += `
        <div class="stat-card stat-card-info">
          <div class="stat-icon">⬆️</div>
          <div class="stat-content">
            <h3 class="stat-label">Velocidad Subida</h3>
            <div class="stat-value">${stats.uploadSpeed} Mbps</div>
            <p class="stat-description">Velocidad actual</p>
          </div>
        </div>
      `;
      
      // Señal
      html += `
        <div class="stat-card ${this.getSignalClass(stats.signalStrength)}">
          <div class="stat-icon">📡</div>
          <div class="stat-content">
            <h3 class="stat-label">Señal</h3>
            <div class="stat-value">${stats.signalStrength}%</div>
            <p class="stat-description">${this.getSignalDescription(stats.signalStrength)}</p>
          </div>
        </div>
      `;
      
      // Obstrucciones
      html += `
        <div class="stat-card ${stats.obstructed ? 'stat-card-warning' : 'stat-card-success'}">
          <div class="stat-icon">${stats.obstructed ? '⚠️' : '✅'}</div>
          <div class="stat-content">
            <h3 class="stat-label">Obstrucciones</h3>
            <div class="stat-value">${stats.obstructed ? 'Detectadas' : 'Sin obstrucciones'}</div>
            <p class="stat-description">Estado del campo de visión</p>
          </div>
        </div>
      `;
      
      html += '</div>'; // Cierre starlink-stats-grid
      
      // Información adicional
      html += `
        <div class="starlink-info">
          <h3>📊 Información del Sistema</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Dirección IP:</span>
              <span class="info-value">${stats.ipAddress || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Hardware Version:</span>
              <span class="info-value">${stats.hardwareVersion || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Software Version:</span>
              <span class="info-value">${stats.softwareVersion || 'N/A'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Temperatura:</span>
              <span class="info-value">${stats.temperature ? stats.temperature + '°C' : 'N/A'}</span>
            </div>
          </div>
        </div>
      `;
      
    } else {
      // No conectado
      html += `
        <div class="starlink-error">
          <div class="error-icon">🔴</div>
          <h3>Terminal Starlink no disponible</h3>
          <p>No se pudo establecer conexión con el dispositivo local.</p>
          <p class="error-help">Verifica que el terminal esté encendido y conectado a la red local.</p>
        </div>
      `;
    }
    
    html += '</div>'; // Cierre starlink-dashboard
    
    content.innerHTML = html;
  }
  
  /**
   * Renderizar error
   */
  renderError() {
    const content = document.getElementById('starlink-content');
    if (!content) return;
    
    content.innerHTML = `
      <div class="starlink-error">
        <div class="error-icon">❌</div>
        <h3>Error al consultar Starlink</h3>
        <p>No se pudo obtener información del terminal.</p>
        <button class="btn btn-primary" onclick="window.app.currentModule.cargarEstadisticas()">
          🔄 Reintentar
        </button>
      </div>
    `;
  }
  
  /**
   * Formatear uptime
   */
  formatUptime(seconds) {
    if (!seconds) return 'N/A';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours}h`;
    }
    
    return `${hours}h ${minutes}m`;
  }
  
  /**
   * Obtener clase de latencia
   */
  getLatencyClass(latency) {
    if (latency < 30) return 'stat-card-success';
    if (latency < 60) return 'stat-card-info';
    if (latency < 100) return 'stat-card-warning';
    return 'stat-card-danger';
  }
  
  /**
   * Obtener descripción de latencia
   */
  getLatencyDescription(latency) {
    if (latency < 30) return 'Excelente';
    if (latency < 60) return 'Buena';
    if (latency < 100) return 'Aceptable';
    return 'Mejorable';
  }
  
  /**
   * Obtener clase de señal
   */
  getSignalClass(signal) {
    if (signal >= 80) return 'stat-card-success';
    if (signal >= 60) return 'stat-card-info';
    if (signal >= 40) return 'stat-card-warning';
    return 'stat-card-danger';
  }
  
  /**
   * Obtener descripción de señal
   */
  getSignalDescription(signal) {
    if (signal >= 80) return 'Excelente';
    if (signal >= 60) return 'Buena';
    if (signal >= 40) return 'Regular';
    return 'Débil';
  }
  
  /**
   * Iniciar actualización automática
   */
  iniciarActualizacionAutomatica() {
    // Actualizar cada 60 segundos
    this.intervalId = setInterval(() => {
      this.cargarEstadisticas();
    }, 60000);
  }
  
  /**
   * Destruir módulo
   */
  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.stats = null;
  }
}

export default StarlinkModule;
