/**
 * Aplicación principal - Router
 */
import CONFIG from './core/config.js';
import { Storage } from './core/storage.js';
import { Toast } from './components/toast.js';
import { Loader } from './components/loader.js';

// Importar módulos
import { DashboardModule } from './modules/dashboard.js';
import { EquiposModule } from './modules/equipos.js';
import { PagosModule } from './modules/pagos.js';
import { StarlinkModule } from './modules/starlink.js';
import { NotificacionesModule } from './modules/notificaciones.js';
import { ReportesModule } from './modules/reportes.js';
import { GraficosModule } from './modules/graficos.js';

class App {
  constructor() {
    this.currentModule = null;
    this.currentPage = null;
    
    // Inicializar módulos
    this.modules = {
      dashboard: null,
      equipos: null,
      pagos: null,
      starlink: null,
      graficos: null,
      notificaciones: null,
      reportes: null
    };
    
    this.init();
  }
  
  /**
   * Inicializar aplicación
   */
  async init() {
    console.log(`🚀 Iniciando Starlink Manager v${CONFIG.VERSION}`);
    
    // Aplicar tema guardado
    this.aplicarTema();
    
    // Renderizar header
    this.renderHeader();
    
    // Configurar router
    this.setupRouter();
    
    // Cargar página inicial
    const initialPage = window.location.hash.slice(1) || 'dashboard';
    await this.navigate(initialPage);
    
    // Inicializar verificación de notificaciones
    this.iniciarNotificaciones();
    
    console.log('✅ Aplicación iniciada');
  }
  
  /**
   * Configurar router
   */
  setupRouter() {
    window.addEventListener('hashchange', async () => {
      const page = window.location.hash.slice(1) || 'dashboard';
      await this.navigate(page);
    });
  }
  
  /**
   * Navegar a una página
   */
  async navigate(page) {
    console.log(`📄 Navegando a: ${page}`);
    
    // Actualizar navegación activa
    this.updateNavigation(page);
    
    // Destruir módulo actual si existe
    if (this.currentModule && typeof this.currentModule.destroy === 'function') {
      this.currentModule.destroy();
    }
    
    // Cargar nuevo módulo
    try {
      Loader.show(`Cargando ${page}...`);
      
      // Lazy loading de módulos
      if (!this.modules[page]) {
        this.modules[page] = await this.loadModule(page);
      }
      
      this.currentModule = this.modules[page];
      this.currentPage = page;
      
      // Renderizar módulo
      if (this.currentModule && typeof this.currentModule.render === 'function') {
        await this.currentModule.render();
      }
      
      Loader.hide();
      
    } catch (error) {
      console.error(`❌ Error al cargar módulo ${page}:`, error);
      Toast.error(`Error al cargar ${page}`);
      Loader.hide();
    }
  }
  
  /**
   * Cargar módulo
   */
  async loadModule(page) {
    switch(page) {
      case 'dashboard':
        return new DashboardModule();
      case 'equipos':
        return new EquiposModule();
      case 'pagos':
        return new PagosModule();
      case 'starlink':
        return new StarlinkModule();
      case 'graficos':
        return new GraficosModule();
      case 'notificaciones':
        return new NotificacionesModule();
      case 'reportes':
        return new ReportesModule();
      default:
        Toast.warning(`Página no encontrada: ${page}`);
        return new DashboardModule();
    }
  }
  
  /**
   * Renderizar header
   */
  renderHeader() {
    const header = document.getElementById('app-header');
    if (!header) return;
    
    header.innerHTML = `
      <div class="sl-header">
        <div class="sl-logo">
          <span class="sl-logo-icon">🛰️</span>
          <span class="sl-logo-text">STARLINK MANAGER</span>
        </div>
        
        <nav class="sl-nav">
          <a href="#dashboard" class="sl-nav-link" data-page="dashboard">
            <span class="nav-icon">📊</span>
            <span class="nav-text">Dashboard</span>
          </a>
          <a href="#equipos" class="sl-nav-link" data-page="equipos">
            <span class="nav-icon">📱</span>
            <span class="nav-text">Equipos</span>
          </a>
          <a href="#pagos" class="sl-nav-link" data-page="pagos">
            <span class="nav-icon">💰</span>
            <span class="nav-text">Pagos</span>
          </a>
          <a href="#graficos" class="sl-nav-link" data-page="graficos">
            <span class="nav-icon">📈</span>
            <span class="nav-text">Gráficos</span>
          </a>
          <a href="#notificaciones" class="sl-nav-link" data-page="notificaciones">
            <span class="nav-icon">🔔</span>
            <span class="nav-text">Notificaciones</span>
            <span class="sl-notification-badge" id="notif-badge" style="display:none">
              <span id="notif-count">0</span>
            </span>
          </a>
          <a href="#starlink" class="sl-nav-link" data-page="starlink">
            <span class="nav-icon">🛰️</span>
            <span class="nav-text">Starlink</span>
          </a>
          <a href="#reportes" class="sl-nav-link" data-page="reportes">
            <span class="nav-icon">📋</span>
            <span class="nav-text">Reportes</span>
          </a>
        </nav>
        
        <div class="sl-header-actions">
          <button class="sl-theme-toggle" id="theme-toggle" 
                  title="Cambiar tema" 
                  aria-label="Cambiar tema">
            🌙
          </button>
        </div>
      </div>
    `;
    
    // Adjuntar evento de tema
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTema());
    }
  }
  
  /**
   * Actualizar navegación activa
   */
  updateNavigation(page) {
    document.querySelectorAll('.sl-nav-link').forEach(link => {
      const linkPage = link.getAttribute('data-page');
      if (linkPage === page) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
  
  /**
   * Aplicar tema
   */
  aplicarTema() {
    const tema = Storage.getTema();
    const body = document.getElementById('app-body');
    
    if (tema === 'light') {
      body.classList.add('light-theme');
    } else {
      body.classList.remove('light-theme');
    }
    
    this.actualizarBotonTema(tema);
  }
  
  /**
   * Toggle tema
   */
  toggleTema() {
    const body = document.getElementById('app-body');
    const temaActual = body.classList.contains('light-theme') ? 'light' : 'dark';
    const temaNuevo = temaActual === 'dark' ? 'light' : 'dark';
    
    if (temaNuevo === 'light') {
      body.classList.add('light-theme');
    } else {
      body.classList.remove('light-theme');
    }
    
    Storage.setTema(temaNuevo);
    this.actualizarBotonTema(temaNuevo);
    
    Toast.success(`Tema ${temaNuevo === 'dark' ? 'oscuro' : 'claro'} activado`);
  }
  
  /**
   * Actualizar botón de tema
   */
  actualizarBotonTema(tema) {
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.textContent = tema === 'dark' ? '☀️' : '🌙';
      btn.setAttribute('aria-label', tema === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
    }
  }
  
  /**
   * Iniciar verificación de notificaciones
   */
  iniciarNotificaciones() {
    // Verificar cada 30 segundos
    setInterval(() => {
      if (this.modules.notificaciones) {
        this.modules.notificaciones.verificarNuevas();
      }
    }, CONFIG.NOTIFICACIONES.INTERVALO_VERIFICACION);
  }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});

export default App;
