/**
 * Módulo Gráficos
 */
import ApiClient from '../core/api.js';
import { formatearMoneda } from '../core/utils.js';
import { Toast } from '../components/toast.js';
import { Loader } from '../components/loader.js';

export class GraficosModule {
  constructor() {
    this.container = null;
    this.stats = null;
    this.equipos = [];
    this.charts = {
      pagadoDeuda: null,
      categoria: null,
      estado: null,
      progreso: null
    };
  }
  
  /**
   * Renderizar módulo
   */
  async render() {
    this.container = document.getElementById('app-content');
    if (!this.container) return;
    
    this.container.innerHTML = `
      <div class="graficos-module">
        <div class="module-header">
          <div class="module-title">
            <h1>📈 Análisis y Gráficos</h1>
            <p class="module-subtitle">Visualización de datos y estadísticas</p>
          </div>
          
          <div class="module-actions">
            <button class="btn btn-primary" id="btn-refresh-graficos">
              <span>🔄</span> Actualizar
            </button>
            <button class="btn btn-secondary" id="btn-exportar-graficos">
              <span>📥</span> Exportar
            </button>
          </div>
        </div>
        
        <div id="graficos-content">
          <div class="sl-loading">⏳ Cargando gráficos...</div>
        </div>
      </div>
    `;
    
    await this.cargarDatos();
    this.setupEventListeners();
  }
  
  /**
   * Configurar event listeners
   */
  setupEventListeners() {
    const btnRefresh = document.getElementById('btn-refresh-graficos');
    if (btnRefresh) {
      btnRefresh.addEventListener('click', () => this.cargarDatos());
    }
    
    const btnExportar = document.getElementById('btn-exportar-graficos');
    if (btnExportar) {
      btnExportar.addEventListener('click', () => this.exportarGraficos());
    }
  }
  
  /**
   * Cargar datos
   */
  async cargarDatos() {
    Loader.show('Cargando datos...');
    
    // Cargar estadísticas
    const statsResult = await ApiClient.get('/estadisticas');
    if (statsResult && statsResult.data) {
      this.stats = statsResult.data;
    }
    
    // Cargar equipos
    const equiposResult = await ApiClient.get('/equipos');
    if (equiposResult && equiposResult.data) {
      this.equipos = equiposResult.data;
    }
    
    Loader.hide();
    
    if (this.stats && this.equipos) {
      this.renderGraficos();
      setTimeout(() => this.crearGraficos(), 100);
    } else {
      this.renderError();
    }
  }
  
  /**
   * Renderizar contenedor de gráficos
   */
  renderGraficos() {
    const content = document.getElementById('graficos-content');
    if (!content) return;
    
    content.innerHTML = `
      <div class="graficos-grid">
        <!-- Gráfico 1: Pagado vs Deuda -->
        <div class="grafico-card">
          <div class="grafico-header">
            <h3>💰 Pagado vs Deuda del Mes</h3>
          </div>
          <div class="grafico-body">
            <canvas id="chart-pagado-deuda"></canvas>
          </div>
        </div>
        
        <!-- Gráfico 2: Equipos por Categoría -->
        <div class="grafico-card">
          <div class="grafico-header">
            <h3>📊 Equipos por Categoría</h3>
          </div>
          <div class="grafico-body">
            <canvas id="chart-categoria"></canvas>
          </div>
        </div>
        
        <!-- Gráfico 3: Estado de Equipos -->
        <div class="grafico-card">
          <div class="grafico-header">
            <h3>🏷️ Estado de Equipos</h3>
          </div>
          <div class="grafico-body">
            <canvas id="chart-estado"></canvas>
          </div>
        </div>
        
        <!-- Gráfico 4: Progreso de Cobranza -->
        <div class="grafico-card grafico-card-full">
          <div class="grafico-header">
            <h3>📈 Progreso de Cobranza Mensual</h3>
          </div>
          <div class="grafico-body">
            <canvas id="chart-progreso"></canvas>
          </div>
        </div>
      </div>
    `;
  }
  
  /**
   * Crear gráficos
   */
  crearGraficos() {
    this.crearGraficoPagadoDeuda();
    this.crearGraficoCategoria();
    this.crearGraficoEstado();
    this.crearGraficoProgreso();
  }
  
  /**
   * Gráfico: Pagado vs Deuda
   */
  crearGraficoPagadoDeuda() {
    const ctx = document.getElementById('chart-pagado-deuda');
    if (!ctx) return;
    
    if (this.charts.pagadoDeuda) {
      this.charts.pagadoDeuda.destroy();
    }
    
    const textColor = getComputedStyle(document.body).getPropertyValue('--sl-text-primary').trim();
    
    this.charts.pagadoDeuda = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Pagado', 'Deuda'],
        datasets: [{
          data: [
            this.stats.montoPagadoMesActual,
            this.stats.deudaTotalMesActual
          ],
          backgroundColor: ['#22d3ee', '#ef4444'],
          borderColor: ['#0891b2', '#dc2626'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: textColor,
              font: { size: 12 },
              padding: 15
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return context.label + ': ' + formatearMoneda(context.parsed);
              }
            }
          }
        }
      }
    });
  }
  
  /**
   * Gráfico: Equipos por Categoría
   */
  crearGraficoCategoria() {
    const ctx = document.getElementById('chart-categoria');
    if (!ctx) return;
    
    if (this.charts.categoria) {
      this.charts.categoria.destroy();
    }
    
    // Agrupar equipos por categoría
    const categorias = {};
    this.equipos.forEach(eq => {
      if (eq.activo === 'SI') {
        categorias[eq.categoria] = (categorias[eq.categoria] || 0) + 1;
      }
    });
    
    const textColor = getComputedStyle(document.body).getPropertyValue('--sl-text-primary').trim();
    const borderColor = getComputedStyle(document.body).getPropertyValue('--sl-border').trim();
    
    this.charts.categoria = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(categorias),
        datasets: [{
          label: 'Cantidad de Equipos',
          data: Object.values(categorias),
          backgroundColor: '#27a8de',
          borderColor: '#1e88c6',
          borderWidth: 1,
          borderRadius: 5
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            labels: { color: textColor }
          }
        },
        scales: {
          x: {
            ticks: { color: textColor },
            grid: { color: borderColor }
          },
          y: {
            ticks: { color: textColor },
            grid: { color: borderColor }
          }
        }
      }
    });
  }
  
  /**
   * Gráfico: Estado de Equipos
   */
  crearGraficoEstado() {
    const ctx = document.getElementById('chart-estado');
    if (!ctx) return;
    
    if (this.charts.estado) {
      this.charts.estado.destroy();
    }
    
    const textColor = getComputedStyle(document.body).getPropertyValue('--sl-text-primary').trim();
    
    this.charts.estado = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Activos', 'Pendiente', 'Vencidos', 'Cancelados'],
        datasets: [{
          data: [
            this.stats.equiposActivos,
            this.stats.equiposPendientePago,
            this.stats.equiposVencidos,
            this.stats.equiposCancelados || 0
          ],
          backgroundColor: ['#22d3ee', '#eab308', '#ef4444', '#6b7280'],
          borderColor: ['#0891b2', '#ca8a04', '#dc2626', '#4b5563'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: textColor,
              font: { size: 12 },
              padding: 15
            }
          }
        }
      }
    });
  }
  
  /**
   * Gráfico: Progreso de Cobranza
   */
  crearGraficoProgreso() {
    const ctx = document.getElementById('chart-progreso');
    if (!ctx) return;
    
    if (this.charts.progreso) {
      this.charts.progreso.destroy();
    }
    
    const porcentajePagado = this.stats.montoTotalMensual > 0
      ? (this.stats.montoPagadoMesActual / this.stats.montoTotalMensual * 100).toFixed(1)
      : 0;
    
    const textColor = getComputedStyle(document.body).getPropertyValue('--sl-text-primary').trim();
    const borderColor = getComputedStyle(document.body).getPropertyValue('--sl-border').trim();
    
    this.charts.progreso = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4', 'Actual'],
        datasets: [{
          label: 'Progreso de Pago (%)',
          data: [15, 30, 50, 70, porcentajePagado],
          borderColor: '#4de0ff',
          backgroundColor: 'rgba(77, 224, 255, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#4de0ff',
          pointBorderColor: '#0891b2',
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            labels: { color: textColor }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              color: textColor,
              callback: (value) => value + '%'
            },
            grid: { color: borderColor }
          },
          x: {
            ticks: { color: textColor },
            grid: { color: borderColor }
          }
        }
      }
    });
  }
  
  /**
   * Renderizar error
   */
  renderError() {
    const content = document.getElementById('graficos-content');
    if (!content) return;
    
    content.innerHTML = `
      <div class="sl-error-state">
        <div class="error-icon">❌</div>
        <h3>Error al cargar gráficos</h3>
        <p>No se pudieron obtener los datos necesarios</p>
        <button class="btn btn-primary" onclick="window.app.currentModule.cargarDatos()">
          🔄 Reintentar
        </button>
      </div>
    `;
  }
  
  /**
   * Exportar gráficos
   */
  exportarGraficos() {
    Toast.info('📥 Función de exportación en desarrollo');
    // Aquí puedes implementar la exportación de gráficos como imágenes
  }
  
  /**
   * Destruir módulo
   */
  destroy() {
    // Destruir gráficos
    Object.values(this.charts).forEach(chart => {
      if (chart) chart.destroy();
    });
    
    this.charts = {
      pagadoDeuda: null,
      categoria: null,
      estado: null,
      progreso: null
    };
    
    this.stats = null;
    this.equipos = [];
  }
}

export default GraficosModule;
