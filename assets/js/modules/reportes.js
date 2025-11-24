/**
 * Módulo Reportes
 */
import ApiClient from '../core/api.js';
import { formatearMoneda, formatearFecha } from '../core/utils.js';
import { Toast } from '../components/toast.js';
import { Loader } from '../components/loader.js';

export class ReportesModule {
  constructor() {
    this.container = null;
    this.stats = null;
    this.equipos = [];
  }
  
  /**
   * Renderizar módulo
   */
  async render() {
    this.container = document.getElementById('app-content');
    if (!this.container) return;
    
    this.container.innerHTML = `
      <div class="reportes-module">
        <div class="module-header">
          <div class="module-title">
            <h1>📋 Reportes</h1>
            <p class="module-subtitle">Genera reportes detallados del sistema</p>
          </div>
        </div>
        
        <div class="reportes-grid">
          <!-- Reporte Mensual -->
          <div class="reporte-card">
            <div class="reporte-icon">📄</div>
            <h3>Reporte Mensual</h3>
            <p>Resumen completo de ingresos, pagos y equipos del mes actual</p>
            <button class="btn btn-primary" onclick="window.app.currentModule.generarReporteMensual()">
              📥 Generar Reporte
            </button>
          </div>
          
          <!-- Reporte por Categoría -->
          <div class="reporte-card">
            <div class="reporte-icon">📊</div>
            <h3>Reporte por Categoría</h3>
            <p>Análisis de equipos agrupados por categoría</p>
            <button class="btn btn-primary" onclick="window.app.currentModule.generarReporteCategoria()">
              📥 Generar Reporte
            </button>
          </div>
          
          <!-- Reporte de Vencimientos -->
          <div class="reporte-card">
            <div class="reporte-icon">⏰</div>
            <h3>Reporte de Vencimientos</h3>
            <p>Lista de equipos próximos a vencer y vencidos</p>
            <button class="btn btn-primary" onclick="window.app.currentModule.generarReporteVencimientos()">
              📥 Generar Reporte
            </button>
          </div>
          
          <!-- Reporte Anual -->
          <div class="reporte-card">
            <div class="reporte-icon">📅</div>
            <h3>Reporte Anual</h3>
            <p>Resumen de todo el año con estadísticas generales</p>
            <button class="btn btn-primary" onclick="window.app.currentModule.generarReporteAnual()">
              📥 Generar Reporte
            </button>
          </div>
          
          <!-- Reporte de Deudas -->
          <div class="reporte-card">
            <div class="reporte-icon">💸</div>
            <h3>Reporte de Deudas</h3>
            <p>Lista detallada de equipos con deuda pendiente</p>
            <button class="btn btn-primary" onclick="window.app.currentModule.generarReporteDeudas()">
              📥 Generar Reporte
            </button>
          </div>
          
          <!-- Reporte de Pagos -->
          <div class="reporte-card">
            <div class="reporte-icon">💰</div>
            <h3>Reporte de Pagos</h3>
            <p>Historial completo de pagos registrados</p>
            <button class="btn btn-primary" onclick="window.app.currentModule.generarReportePagos()">
              📥 Generar Reporte
            </button>
          </div>
        </div>
        
        <div id="reporte-preview" class="reporte-preview" style="display:none;">
          <div class="preview-header">
            <h2>Vista Previa del Reporte</h2>
            <button class="btn btn-secondary" onclick="window.app.currentModule.cerrarPreview()">
              ✕ Cerrar
            </button>
          </div>
          <div id="preview-content" class="preview-content"></div>
        </div>
      </div>
    `;
  }
  
  /**
   * Generar Reporte Mensual
   */
  async generarReporteMensual() {
    Loader.show('Generando reporte mensual...');
    
    const stats = await ApiClient.get('/estadisticas');
    
    Loader.hide();
    
    if (!stats || !stats.data) {
      Toast.error('Error al generar reporte');
      return;
    }
    
    const data = stats.data;
    const fecha = new Date();
    const mes = fecha.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
    
    let html = `
      <div class="reporte-documento">
        <div class="reporte-header">
          <h1>📄 REPORTE MENSUAL</h1>
          <p class="reporte-fecha">${mes}</p>
        </div>
        
        <div class="reporte-section">
          <h2>📊 Resumen General</h2>
          <table class="reporte-table">
            <tr>
              <td><strong>Total de Equipos:</strong></td>
              <td>${data.totalEquipos}</td>
            </tr>
            <tr>
              <td><strong>Equipos Activos:</strong></td>
              <td>${data.equiposActivos}</td>
            </tr>
            <tr>
              <td><strong>Equipos Cancelados:</strong></td>
              <td>${data.equiposCancelados || 0}</td>
            </tr>
          </table>
        </div>
        
        <div class="reporte-section">
          <h2>💰 Estado Financiero</h2>
          <table class="reporte-table">
            <tr>
              <td><strong>Monto Total Mensual:</strong></td>
              <td>${formatearMoneda(data.montoTotalMensual)}</td>
            </tr>
            <tr>
              <td><strong>Pagado Este Mes:</strong></td>
              <td class="text-success">${formatearMoneda(data.montoPagadoMesActual)}</td>
            </tr>
            <tr>
              <td><strong>Deuda Pendiente:</strong></td>
              <td class="text-danger">${formatearMoneda(data.deudaTotalMesActual)}</td>
            </tr>
            <tr>
              <td><strong>Porcentaje de Cobranza:</strong></td>
              <td>${Math.round((data.montoPagadoMesActual / data.montoTotalMensual) * 100)}%</td>
            </tr>
          </table>
        </div>
        
        <div class="reporte-section">
          <h2>🏷️ Estado de Pagos</h2>
          <table class="reporte-table">
            <tr>
              <td><strong>Equipos Pagados:</strong></td>
              <td class="text-success">${data.equiposActivos - data.equiposPendientePago - data.equiposVencidos}</td>
            </tr>
            <tr>
              <td><strong>Equipos Pendientes:</strong></td>
              <td class="text-warning">${data.equiposPendientePago}</td>
            </tr>
            <tr>
              <td><strong>Equipos Vencidos:</strong></td>
              <td class="text-danger">${data.equiposVencidos}</td>
            </tr>
          </table>
        </div>
        
        <div class="reporte-footer">
          <p>Reporte generado el ${fecha.toLocaleString('es-MX')}</p>
        </div>
      </div>
    `;
    
    this.mostrarPreview(html);
    Toast.success('📄 Reporte mensual generado');
  }
  
  /**
   * Generar Reporte por Categoría
   */
  async generarReporteCategoria() {
    Loader.show('Generando reporte por categoría...');
    
    const result = await ApiClient.get('/equipos');
    
    Loader.hide();
    
    if (!result || !result.data) {
      Toast.error('Error al generar reporte');
      return;
    }
    
    const equipos = result.data.filter(e => e.activo === 'SI');
    
    // Agrupar por categoría
    const categorias = {};
    equipos.forEach(eq => {
      if (!categorias[eq.categoria]) {
        categorias[eq.categoria] = {
          cantidad: 0,
          montoTotal: 0,
          pagado: 0,
          deuda: 0
        };
      }
      
      categorias[eq.categoria].cantidad++;
      categorias[eq.categoria].montoTotal += eq.montoMensual;
      categorias[eq.categoria].pagado += eq.totalPagadoMesActual || 0;
      categorias[eq.categoria].deuda += eq.deudaMensual || 0;
    });
    
    let html = `
      <div class="reporte-documento">
        <div class="reporte-header">
          <h1>📊 REPORTE POR CATEGORÍA</h1>
          <p class="reporte-fecha">${new Date().toLocaleDateString('es-MX')}</p>
        </div>
        
        <div class="reporte-section">
          <h2>📋 Desglose por Categoría</h2>
          <table class="reporte-table">
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Cantidad</th>
                <th>Monto Total</th>
                <th>Pagado</th>
                <th>Deuda</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(categorias).map(([cat, data]) => `
                <tr>
                  <td><strong>${cat}</strong></td>
                  <td>${data.cantidad}</td>
                  <td>${formatearMoneda(data.montoTotal)}</td>
                  <td class="text-success">${formatearMoneda(data.pagado)}</td>
                  <td class="text-danger">${formatearMoneda(data.deuda)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="reporte-footer">
          <p>Reporte generado el ${new Date().toLocaleString('es-MX')}</p>
        </div>
      </div>
    `;
    
    this.mostrarPreview(html);
    Toast.success('📊 Reporte por categoría generado');
  }
  
  /**
   * Generar Reporte de Vencimientos
   */
  async generarReporteVencimientos() {
    Toast.info('⏰ Generando reporte de vencimientos...');
    // Implementación similar a los anteriores
  }
  
  /**
   * Generar Reporte Anual
   */
  async generarReporteAnual() {
    Toast.info('📅 Generando reporte anual...');
    // Implementación similar a los anteriores
  }
  
  /**
   * Generar Reporte de Deudas
   */
  async generarReporteDeudas() {
    Toast.info('💸 Generando reporte de deudas...');
    // Implementación similar a los anteriores
  }
  
  /**
   * Generar Reporte de Pagos
   */
  async generarReportePagos() {
    Toast.info('💰 Generando reporte de pagos...');
    // Implementación similar a los anteriores
  }
  
  /**
   * Mostrar preview del reporte
   */
  mostrarPreview(html) {
    const preview = document.getElementById('reporte-preview');
    const content = document.getElementById('preview-content');
    
    if (preview && content) {
      content.innerHTML = html;
      preview.style.display = 'block';
      preview.scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  /**
   * Cerrar preview
   */
  cerrarPreview() {
    const preview = document.getElementById('reporte-preview');
    if (preview) {
      preview.style.display = 'none';
    }
  }
  
  /**
   * Destruir módulo
   */
  destroy() {
    this.stats = null;
    this.equipos = [];
  }
}

export default ReportesModule;
