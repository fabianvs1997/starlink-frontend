// ==================== CONFIGURACIÓN GLOBAL ====================

const API_URL = 'http://localhost:8081/api';
let equipoActualId = null;
let todosEquipos = [];
let equipoEnEdicion = null;
let notificaciones = [];
let chartsPagadoDeuda = null;
let chartsCategoria = null;
let chartsEstado = null;
let chartsProgreso = null;
let accionConfirmacionCallback = null;

// ==================== INICIALIZACIÓN ====================

window.onload = () => {
  inicializarEventListeners();
  inicializarValidacionFormularios();
  renderDashboard();
  verificarNotificaciones();
  setInterval(verificarNotificaciones, 30000);
  establecerFechaActual();
  obtenerEstadisticasStarlink();
};

function inicializarEventListeners() {
  document.getElementById('nav-dashboard').onclick = e => { 
    e.preventDefault(); 
    showPage('dashboard'); 
    renderDashboard(); 
  };
  
  document.getElementById('nav-equipos').onclick = e => { 
    e.preventDefault(); 
    showPage('equipos'); 
    renderEquipos(); 
  };
  
  document.getElementById('nav-pagos').onclick = e => { 
    e.preventDefault(); 
    showPage('pagos'); 
    renderPagos(); 
  };
  
  document.getElementById('nav-graficos').onclick = e => { 
    e.preventDefault(); 
    showPage('graficos'); 
    renderGraficos(); 
  };
  
  document.getElementById('nav-notificaciones').onclick = e => { 
    e.preventDefault(); 
    showPage('notificaciones'); 
    renderNotificaciones(); 
  };
  
  document.getElementById('nav-reportes').onclick = e => { 
    e.preventDefault(); 
    showPage('reportes'); 
    renderReportes(); 
  };
  
  // Búsqueda con debounce
  let searchTimeout;
  const searchInput = document.getElementById('search-equipos');
  if (searchInput) {
    searchInput.addEventListener('keyup', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => buscarEquipos(), 300);
    });
  }
}

function establecerFechaActual() {
  const hoy = new Date().toISOString().split('T')[0];
  const inputFechaPago = document.getElementById('form-pago-fecha');
  if (inputFechaPago) inputFechaPago.value = hoy;
}

function showPage(page) {
  document.querySelectorAll('.sl-page').forEach(p => p.style.display = 'none');
  document.getElementById('page-' + page).style.display = 'block';
  document.querySelectorAll('.sl-nav-link').forEach(a => a.classList.remove('active'));
  document.getElementById('nav-' + page).classList.add('active');
}

function showGlobalLoader() {
  document.getElementById('global-loader').style.display = 'flex';
}

function hideGlobalLoader() {
  document.getElementById('global-loader').style.display = 'none';
}

// ==================== API CALLS ====================

async function apiCall(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method, 
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    
    if (data) options.body = JSON.stringify(data);

    console.log('🔵 [API] ' + method + ' ' + endpoint, data);

    const response = await fetch(API_URL + endpoint, options);
    
    // Manejar respuestas sin contenido (204 No Content)
    if (response.status === 204) {
      console.log('🟢 [API RESPONSE] 204 No Content');
      return {success: true, data: null};
    }

    const responseData = await response.json();
    console.log('🟢 [API RESPONSE]', responseData);

    if (!response.ok) {
      const errorMsg = responseData.message || responseData.error || 'Error en la solicitud';
      crearNotificacion('❌ Error: ' + errorMsg, 'danger', '❌');
      console.error('🔴 [API ERROR]', errorMsg);
      return null;
    }

    return responseData;
  } catch (error) {
    const errorMsg = 'Error de conexión: ' + error.message;
    crearNotificacion(errorMsg, 'danger', '❌');
    console.error('🔴 [CONEXIÓN ERROR]', error);
    return null;
  }
}

// ==================== VALIDACIONES ====================

function inicializarValidacionFormularios() {
  const formEquipo = document.getElementById('form-equipo');
  const formPago = document.getElementById('form-pago');
  
  if (formEquipo) {
    const campos = ['categoria', 'nombre', 'correo', 'password', 'monto', 'vencimiento', 'cuenta', 'num-equipos', 'id', 'serie', 'kit'];
    campos.forEach(campo => {
      const input = document.getElementById('form-' + campo);
      if (input) {
        input.addEventListener('blur', () => validarCampo(campo, input));
        input.addEventListener('input', () => limpiarError(campo));
      }
    });
  }
  
  if (formPago) {
    const camposPago = ['equipo-select', 'pago-monto', 'pago-fecha'];
    camposPago.forEach(campo => {
      const input = document.getElementById('form-' + campo);
      if (input) {
        input.addEventListener('blur', () => validarCampoPago(campo, input));
        input.addEventListener('input', () => limpiarError(campo));
      }
    });
  }
}

function validarCampo(campo, input) {
  const valor = input.value.trim();
  let error = '';
  
  switch(campo) {
    case 'categoria':
      if (!valor) error = 'Debes seleccionar una categoría';
      break;
    case 'nombre':
      if (!valor) error = 'El nombre es requerido';
      else if (valor.length < 3) error = 'El nombre debe tener al menos 3 caracteres';
      else if (valor.length > 100) error = 'El nombre no puede exceder 100 caracteres';
      break;
    case 'correo':
      if (!valor) error = 'El correo es requerido';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) error = 'Correo electrónico inválido';
      break;
    case 'password':
      if (!valor) error = 'La contraseña es requerida';
      else if (valor.length < 6) error = 'La contraseña debe tener al menos 6 caracteres';
      break;
    case 'monto':
      const monto = parseFloat(valor);
      if (!valor) error = 'El monto es requerido';
      else if (isNaN(monto) || monto <= 0) error = 'El monto debe ser mayor a 0';
      else if (monto > 999999) error = 'El monto es demasiado alto';
      break;
    case 'vencimiento':
      if (!valor) error = 'La fecha de vencimiento es requerida';
      else {
        const fecha = new Date(valor);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        if (fecha < hoy) error = 'La fecha de vencimiento no puede ser en el pasado';
      }
      break;
    case 'cuenta':
      if (!valor) error = 'La cuenta/tarjeta es requerida';
      else if (valor.length < 4) error = 'Debe tener al menos 4 caracteres';
      break;
    case 'num-equipos':
      const numEquipos = parseInt(valor);
      if (!valor) error = 'El número de equipos es requerido';
      else if (isNaN(numEquipos) || numEquipos < 1) error = 'Debe ser al menos 1 equipo';
      else if (numEquipos > 100) error = 'Máximo 100 equipos';
      break;
    case 'id':
    case 'serie':
    case 'kit':
      if (!valor) error = 'Este campo es requerido';
      else if (valor.length < 3) error = 'Debe tener al menos 3 caracteres';
      break;
  }
  
  if (error) {
    mostrarError(campo, error);
    return false;
  }
  return true;
}

function validarCampoPago(campo, input) {
  const valor = input.value.trim();
  let error = '';
  
  switch(campo) {
    case 'equipo-select':
      if (!valor) error = 'Debes seleccionar un equipo';
      break;
    case 'pago-monto':
      const monto = parseFloat(valor);
      if (!valor) error = 'El monto es requerido';
      else if (isNaN(monto) || monto <= 0) error = 'El monto debe ser mayor a 0';
      else if (monto > 999999) error = 'El monto es demasiado alto';
      break;
    case 'pago-fecha':
      if (!valor) error = 'La fecha de pago es requerida';
      else {
        const fecha = new Date(valor);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const hace30Dias = new Date();
        hace30Dias.setDate(hace30Dias.getDate() - 30);
        
        if (fecha > hoy) error = 'La fecha de pago no puede ser futura';
        else if (fecha < hace30Dias) error = 'La fecha de pago no puede ser mayor a 30 días atrás';
      }
      break;
  }
  
  if (error) {
    mostrarError(campo, error);
    return false;
  }
  return true;
}

function mostrarError(campo, mensaje) {
  const errorSpan = document.getElementById('error-' + campo);
  if (errorSpan) {
    errorSpan.textContent = mensaje;
    errorSpan.style.display = 'block';
  }
  
  const input = document.getElementById('form-' + campo);
  if (input) {
    input.classList.add('sl-input-error');
    input.setAttribute('aria-invalid', 'true');
  }
}

function limpiarError(campo) {
  const errorSpan = document.getElementById('error-' + campo);
  if (errorSpan) {
    errorSpan.textContent = '';
    errorSpan.style.display = 'none';
  }
  
  const input = document.getElementById('form-' + campo);
  if (input) {
    input.classList.remove('sl-input-error');
    input.removeAttribute('aria-invalid');
  }
}

function limpiarTodosErrores() {
  document.querySelectorAll('.sl-error-message').forEach(span => {
    span.textContent = '';
    span.style.display = 'none';
  });
  
  document.querySelectorAll('.sl-input-error').forEach(input => {
    input.classList.remove('sl-input-error');
    input.removeAttribute('aria-invalid');
  });
}

function validarEquipo(data) {
  const errores = [];

  if (!data.nombre || data.nombre.trim() === '') errores.push('Nombre es requerido');
  else if (data.nombre.trim().length < 3) errores.push('El nombre debe tener al menos 3 caracteres');
  
  if (!data.categoria || data.categoria.trim() === '') errores.push('Categoría es requerida');
  
  if (!data.correo || data.correo.trim() === '') errores.push('Correo es requerido');
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.correo)) errores.push('Correo inválido');
  
  if (!data.contraseña || data.contraseña.trim() === '') errores.push('Contraseña es requerida');
  else if (data.contraseña.length < 6) errores.push('La contraseña debe tener al menos 6 caracteres');
  
  if (!data.montoMensual || data.montoMensual <= 0) errores.push('Monto debe ser mayor a 0');
  
  if (!data.vencimiento) errores.push('Vencimiento es requerido');
  
  if (!data.cuentaTarjeta || data.cuentaTarjeta.trim() === '') errores.push('Cuenta tarjeta es requerida');
  
  if (!data.numeroEquipos || data.numeroEquipos <= 0) errores.push('Número de equipos inválido');
  
  if (!data.numeroId || data.numeroId.trim() === '') errores.push('Número de ID es requerido');
  
  if (!data.numeroSerie || data.numeroSerie.trim() === '') errores.push('Número de serie es requerido');
  
  if (!data.numeroKit || data.numeroKit.trim() === '') errores.push('Número de kit es requerido');

  return errores;
}

function mostrarErroresValidacion(errores) {
  let html = '<div class="sl-alert sl-alert-danger" style="margin-bottom:1rem;">';
  html += '<strong>❌ Errores en el formulario:</strong><ul style="margin-top:0.5rem;margin-bottom:0;">';
  errores.forEach(err => {
    html += '<li>' + err + '</li>';
  });
  html += '</ul></div>';

  const form = document.getElementById('form-equipo');
  const alertaExistente = form.querySelector('.sl-alert-danger');
  if (alertaExistente) alertaExistente.remove();
  
  form.insertAdjacentHTML('afterbegin', html);
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ==================== UTILIDADES ====================

function sanitizeHTML(str) {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

function formatearMoneda(valor) {
  return '$' + parseFloat(valor).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function formatearFecha(fecha) {
  const date = new Date(fecha + 'T00:00:00');
  return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
}

function calcularDiasHastaVencimiento(fechaVencimiento) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const vencimiento = new Date(fechaVencimiento + 'T00:00:00');
  const diferencia = vencimiento - hoy;
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
}

function togglePasswordVisibility() {
  const input = document.getElementById('form-password');
  const btn = event.target.closest('button');
  
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
    btn.setAttribute('aria-label', 'Ocultar contraseña');
  } else {
    input.type = 'password';
    btn.textContent = '👁️';
    btn.setAttribute('aria-label', 'Mostrar contraseña');
  }
}

// ==================== NOTIFICACIONES ====================

function crearNotificacion(mensaje, tipo = 'info', icono = '🔔', persistente = false) {
  const notif = {
    id: Date.now(),
    mensaje: sanitizeHTML(mensaje),
    tipo: tipo,
    icono: icono,
    leido: false,
    timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    persistente: persistente
  };

  notificaciones.unshift(notif);
  mostrarNotificacionToast(notif);
  actualizarBadgeNotificaciones();

  if (!persistente) {
    setTimeout(() => eliminarNotificacion(notif.id), 5000);
  }
}

function mostrarNotificacionToast(notif) {
  const container = document.getElementById('notifications-container');
  const toast = document.createElement('div');
  toast.className = 'sl-notification-toast ' + notif.tipo;
  toast.id = 'notif-' + notif.id;
  toast.innerHTML = `
    <div class="sl-notification-icon">${notif.icono}</div>
    <div class="sl-notification-toast-content">
      <div class="sl-notification-toast-title">
        ${notif.tipo === 'success' ? '✅ Éxito' : notif.tipo === 'danger' ? '❌ Error' : notif.tipo === 'warning' ? '⚠️ Advertencia' : '🔔 Información'}
      </div>
      <div class="sl-notification-toast-message">${notif.mensaje}</div>
    </div>
    <button class="sl-notification-close-btn" onclick="cerrarToast(${notif.id})" aria-label="Cerrar notificación">×</button>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    const elem = document.getElementById('notif-' + notif.id);
    if (elem) {
      elem.classList.add('sl-fade-out');
      setTimeout(() => elem.remove(), 300);
    }
  }, 5000);
}

function cerrarToast(id) {
  const elem = document.getElementById('notif-' + id);
  if (elem) {
    elem.classList.add('sl-fade-out');
    setTimeout(() => elem.remove(), 300);
  }
}

function actualizarBadgeNotificaciones() {
  const noLeidas = notificaciones.filter(n => !n.leido).length;
  const badge = document.getElementById('notif-badge');
  const count = document.getElementById('notif-count');

  if (noLeidas > 0) {
    badge.style.display = 'flex';
    count.textContent = noLeidas > 99 ? '99+' : noLeidas;
  } else {
    badge.style.display = 'none';
  }
}

function renderNotificaciones() {
  const container = document.getElementById('notificaciones-content');

  if (notificaciones.length === 0) {
    container.innerHTML = `
      <div class="sl-empty-state">
        <div class="sl-empty-state-icon">🔔</div>
        <div class="sl-empty-state-title">Sin notificaciones</div>
        <div class="sl-empty-state-message">No hay alertas en este momento</div>
      </div>
    `;
    return;
  }

  container.innerHTML = notificaciones.map(notif => {
    const estadoClass = notif.leido ? '' : 'unread';
    const tipoIcon = notif.tipo === 'success' ? '✅' : notif.tipo === 'danger' ? '❌' : notif.tipo === 'warning' ? '⚠️' : '🔔';
    
    return `
      <div class="sl-notification-item ${notif.tipo} ${estadoClass}">
        <div class="sl-notification-icon-big">${tipoIcon}</div>
        <div style="flex:1;">
          <div class="sl-notification-title">${notif.mensaje}</div>
          <div class="sl-notification-time">${notif.timestamp}</div>
        </div>
        <div class="sl-notification-actions">
          ${!notif.leido ? `<button class="sl-notification-mark" onclick="marcarLeido(${notif.id})" title="Marcar como leído" aria-label="Marcar como leído">✓</button>` : ''}
          <button class="sl-notification-close" onclick="eliminarNotificacion(${notif.id})" title="Eliminar" aria-label="Eliminar notificación">×</button>
        </div>
      </div>
    `;
  }).join('');
}

function marcarLeido(id) {
  const notif = notificaciones.find(n => n.id === id);
  if (notif) notif.leido = true;
  actualizarBadgeNotificaciones();
  renderNotificaciones();
}

function marcarTodosLeidos() {
  notificaciones.forEach(n => n.leido = true);
  actualizarBadgeNotificaciones();
  renderNotificaciones();
  crearNotificacion('Todas las notificaciones marcadas como leídas', 'success', '✅');
}

function eliminarNotificacion(id) {
  notificaciones = notificaciones.filter(n => n.id !== id);
  actualizarBadgeNotificaciones();
  renderNotificaciones();
}

function limpiarNotificaciones() {
  mostrarConfirmacion(
    '¿Limpiar todas las notificaciones?',
    'Esta acción no se puede deshacer',
    () => {
      notificaciones = [];
      actualizarBadgeNotificaciones();
      renderNotificaciones();
      crearNotificacion('Notificaciones limpiadas', 'success', '✅');
    }
  );
}

async function verificarNotificaciones() {
  const result = await apiCall('/estadisticas');
  if (!result || !result.data) return;

  const stats = result.data;

  if (stats.equiposVencidos > 0) {
    const existeVencidos = notificaciones.some(n => n.mensaje.includes('equipo(s) vencido(s)') && !n.leido);
    if (!existeVencidos) {
      crearNotificacion(
        `🔴 URGENTE: ${stats.equiposVencidos} equipo(s) vencido(s)`, 
        'danger', 
        '🔴', 
        true
      );
    }
  }

  if (stats.equiposPendientePago > 0) {
    crearNotificacion(
      `💰 ${stats.equiposPendientePago} equipo(s) con pago pendiente`, 
      'warning', 
      '⚠️', 
      false
    );
  }

  if (stats.proximoVencimiento <= 5 && stats.proximoVencimiento > 0) {
    crearNotificacion(
      `⏰ Vencimiento próximo en ${stats.proximoVencimiento} día(s)`, 
      'warning', 
      '⏰', 
      true
    );
  }
}

// ==================== MODALES ====================

function openModal(id) { 
  const modal = document.getElementById(id);
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
  
  const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusableElements.length > 0) {
    focusableElements[0].focus();
  }
}

function closeModal(id) { 
  const modal = document.getElementById(id);
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
  limpiarTodosErrores();
}

function openModalEquipo() {
  equipoEnEdicion = null;
  document.getElementById('equipo-id').value = '';
  document.getElementById('form-equipo').reset();
  document.getElementById('modal-equipo-title').textContent = 'Nuevo Equipo';
  limpiarTodosErrores();
  openModal('modal-equipo');
}

function openModalPago() {
  document.getElementById('form-pago').reset();
  establecerFechaActual();
  cargarEquiposSelect();
  limpiarTodosErrores();
  openModal('modal-pago');
}

function mostrarConfirmacion(titulo, mensaje, callback) {
  document.getElementById('modal-confirmacion-title').innerHTML = titulo;
  document.getElementById('modal-confirmacion-mensaje').innerHTML = mensaje;
  
  accionConfirmacionCallback = callback;
  
  document.getElementById('btn-confirmar-accion').onclick = () => {
    if (accionConfirmacionCallback) {
      accionConfirmacionCallback();
    }
    closeModal('modal-confirmacion');
  };
  
  openModal('modal-confirmacion');
}

// ==================== DASHBOARD ====================

async function renderDashboard() {
  const pageContent = document.getElementById('page-dashboard');
  pageContent.innerHTML = '<div class="sl-loading">⏳ Cargando estadísticas...</div>';
  
  const result = await apiCall('/estadisticas');
  if (!result || !result.data) {
    pageContent.innerHTML = '<div class="sl-error-state">❌ Error al cargar estadísticas</div>';
    return;
  }
  
  const stats = result.data;
  let html = '<div class="sl-cards">';
  
  if (stats.equiposVencidos > 0) {
    html += `<div class="sl-alert sl-alert-danger" style="grid-column: 1 / -1;">
      🔴 <strong>URGENTE:</strong> Tienes ${stats.equiposVencidos} equipo(s) vencido(s) que requieren atención inmediata
    </div>`;
  }
  
  if (stats.proximoVencimiento <= 5 && stats.proximoVencimiento > 0) {
    html += `<div class="sl-alert sl-alert-warning" style="grid-column: 1 / -1;">
      ⏰ <strong>Próximo vencimiento:</strong> Un equipo vencerá en ${stats.proximoVencimiento} día(s)
    </div>`;
  }
  
  html += `
    <div class="sl-card">
      <div class="sl-card-icon">📱</div>
      <h3>Total Equipos</h3>
      <div class="sl-value">${stats.totalEquipos}</div>
      <p class="sl-card-subtitle">Registrados en el sistema</p>
    </div>
    
    <div class="sl-card sl-card-success">
      <div class="sl-card-icon">✅</div>
      <h3>Equipos Activos</h3>
      <div class="sl-value">${stats.equiposActivos}</div>
      <p class="sl-card-subtitle">Funcionando correctamente</p>
    </div>
    
    <div class="sl-card sl-card-warning">
      <div class="sl-card-icon">⏳</div>
      <h3>Pendiente Pago</h3>
      <div class="sl-value">${stats.equiposPendientePago}</div>
      <p class="sl-card-subtitle">Requieren pago</p>
    </div>
    
    <div class="sl-card sl-card-danger">
      <div class="sl-card-icon">🔴</div>
      <h3>Vencidos</h3>
      <div class="sl-value">${stats.equiposVencidos}</div>
      <p class="sl-card-subtitle">Pasaron la fecha límite</p>
    </div>
    
    <div class="sl-card sl-card-secondary">
      <div class="sl-card-icon">❌</div>
      <h3>Cancelados</h3>
      <div class="sl-value">${stats.equiposCancelados || 0}</div>
      <p class="sl-card-subtitle">Servicios cancelados</p>
    </div>
    
    <div class="sl-card">
      <div class="sl-card-icon">💵</div>
      <h3>Monto Total Mensual</h3>
      <div class="sl-value">${formatearMoneda(stats.montoTotalMensual)}</div>
      <p class="sl-card-subtitle">Ingresos esperados</p>
    </div>
    
    <div class="sl-card sl-card-success">
      <div class="sl-card-icon">💰</div>
      <h3>Pagado Este Mes</h3>
      <div class="sl-value">${formatearMoneda(stats.montoPagadoMesActual)}</div>
      <p class="sl-card-subtitle">${stats.montoTotalMensual > 0 ? Math.round((stats.montoPagadoMesActual / stats.montoTotalMensual) * 100) : 0}% del total</p>
    </div>
    
    <div class="sl-card sl-card-danger">
      <div class="sl-card-icon">💸</div>
      <h3>Deuda Pendiente</h3>
      <div class="sl-value">${formatearMoneda(stats.deudaTotalMesActual)}</div>
      <p class="sl-card-subtitle">Por cobrar este mes</p>
    </div>
    
    <div class="sl-card sl-card-info">
      <div class="sl-card-icon">⏰</div>
      <h3>Próximo Vence</h3>
      <div class="sl-value">${stats.proximoVencimiento}</div>
      <p class="sl-card-subtitle">días restantes</p>
    </div>
  </div>`;
  
  pageContent.innerHTML = html;
}

// ==================== EQUIPOS ====================

async function renderEquipos() {
  const content = document.getElementById('equipos-content');
  content.innerHTML = '<div class="sl-loading">⏳ Cargando equipos...</div>';
  
  const result = await apiCall('/equipos');
  if (!result || !result.data) {
    content.innerHTML = '<div class="sl-error-state">❌ Error al cargar equipos</div>';
    return;
  }
  
  todosEquipos = result.data;
  mostrarEquipos(todosEquipos);
}

function mostrarEquipos(equipos) {
  let html = '<div class="sl-table-container"><table class="sl-table"><thead><tr>';
  html += '<th>Nombre</th><th>Categoría</th><th>Monto</th><th>Vencimiento</th><th>Días</th><th>Estado</th><th>Acciones</th>';
  html += '</tr></thead><tbody>';
  
  if (equipos.length === 0) {
    html += '<tr><td colspan="7" style="text-align:center;color:var(--sl-text-tertiary);padding:3rem;">No hay equipos registrados</td></tr>';
  } else {
    equipos.forEach(eq => {
      let estado = eq.estadoPago || 'PENDIENTE';
      let badgeClass = 'warning';
      let diasRestantes = calcularDiasHastaVencimiento(eq.vencimiento);
      let diasHtml = diasRestantes;
      
      if (eq.activo === 'NO') {
        estado = 'CANCELADO';
        badgeClass = 'secondary';
        diasHtml = '-';
      } else {
        if (estado === 'PAGADO') {
          badgeClass = 'success';
        } else if (estado === 'VENCIDO') {
          badgeClass = 'danger';
        } else {
          badgeClass = 'warning';
        }
        
        if (diasRestantes < 0) {
          diasHtml = `<span style="color:var(--sl-danger);font-weight:bold;">${diasRestantes}</span>`;
        } else if (diasRestantes <= 5) {
          diasHtml = `<span style="color:var(--sl-warning);font-weight:bold;">${diasRestantes}</span>`;
        }
      }
      
      html += `<tr>
        <td><strong>${sanitizeHTML(eq.nombre)}</strong></td>
        <td>${sanitizeHTML(eq.categoria)}</td>
        <td>${formatearMoneda(eq.montoMensual)}</td>
        <td>${formatearFecha(eq.vencimiento)}</td>
        <td>${diasHtml}</td>
        <td><span class="sl-badge sl-badge-${badgeClass}">${estado}</span></td>
        <td>
          <button class="sl-btn-primary sl-btn-small" onclick="verEquipo(${eq.id})" aria-label="Ver detalles de ${sanitizeHTML(eq.nombre)}">
            👁️ Ver
          </button>
        </td>
      </tr>`;
    });
  }
  
  html += '</tbody></table></div>';
  document.getElementById('equipos-content').innerHTML = html;
}

function buscarEquipos() {
  const termino = document.getElementById('search-equipos').value.toLowerCase().trim();
  
  if (!termino) {
    mostrarEquipos(todosEquipos);
    return;
  }
  
  const filtrados = todosEquipos.filter(e => 
    e.nombre.toLowerCase().includes(termino) || 
    e.categoria.toLowerCase().includes(termino) ||
    e.correo.toLowerCase().includes(termino) ||
    e.numeroId.toLowerCase().includes(termino) ||
    e.numeroSerie.toLowerCase().includes(termino)
  );
  
  mostrarEquipos(filtrados);
}

function filtrarEquipos() {
  const estado = document.getElementById('filter-estado').value;
  let filtrados = todosEquipos;
  
  if (estado === 'CANCELADO') {
    filtrados = todosEquipos.filter(e => e.activo === 'NO');
  } else if (estado) {
    filtrados = todosEquipos.filter(e => e.estadoPago === estado && e.activo !== 'NO');
  }
  
  mostrarEquipos(filtrados);
}

async function verEquipo(id) {
  showGlobalLoader();
  
  const result = await apiCall('/equipos/' + id);
  if (!result || !result.data) {
    hideGlobalLoader();
    return;
  }
  
  equipoActualId = id;
  equipoEnEdicion = result.data;
  const eq = result.data;
  
  let estadoFinal = eq.estadoPago || 'PENDIENTE';
  let badgeClass = 'warning';
  
  if (eq.activo === 'NO') {
    estadoFinal = 'CANCELADO';
    badgeClass = 'secondary';
  } else {
    if (estadoFinal === 'PAGADO') badgeClass = 'success';
    else if (estadoFinal === 'VENCIDO') badgeClass = 'danger';
  }
  
  const diasRestantes = calcularDiasHastaVencimiento(eq.vencimiento);
  
  let html = '<div class="sl-detalle-grid">';
  
  html += '<div class="sl-detalle-section">';
  html += '<h3>📋 Información General</h3>';
  html += `<p><strong>Nombre:</strong> ${sanitizeHTML(eq.nombre)}</p>`;
  html += `<p><strong>Categoría:</strong> ${sanitizeHTML(eq.categoria)}</p>`;
  html += `<p><strong>Estado:</strong> <span class="sl-badge sl-badge-${badgeClass}">${estadoFinal}</span></p>`;
  html += `<p><strong>Activo:</strong> ${eq.activo === 'SI' ? '✅ Sí' : '❌ No'}</p>`;
  html += '</div>';
  
  html += '<div class="sl-detalle-section">';
  html += '<h3>📧 Contacto</h3>';
  html += `<p><strong>Correo:</strong> <a href="mailto:${eq.correo}">${sanitizeHTML(eq.correo)}</a></p>`;
  html += `<p><strong>Contraseña:</strong> ${'•'.repeat(eq.contraseña.length)}</p>`;
  html += '</div>';
  
  html += '<div class="sl-detalle-section">';
  html += '<h3>💰 Información Financiera</h3>';
  html += `<p><strong>Monto Mensual:</strong> ${formatearMoneda(eq.montoMensual)}</p>`;
  html += `<p><strong>Deuda:</strong> <span style="color:var(--sl-danger);">${formatearMoneda(eq.deudaMensual || 0)}</span></p>`;
  html += `<p><strong>Pagado este mes:</strong> <span style="color:var(--sl-success);">${formatearMoneda(eq.totalPagadoMesActual || 0)}</span></p>`;
  html += `<p><strong>Cuenta/Tarjeta:</strong> ${sanitizeHTML(eq.cuentaTarjeta)}</p>`;
  html += '</div>';
  
  html += '<div class="sl-detalle-section">';
  html += '<h3>⏰ Vencimiento</h3>';
  html += `<p><strong>Fecha:</strong> ${formatearFecha(eq.vencimiento)}</p>`;
  html += `<p><strong>Días restantes:</strong> <span style="color:${diasRestantes < 0 ? 'var(--sl-danger)' : diasRestantes <= 5 ? 'var(--sl-warning)' : 'inherit'};\">${diasRestantes} días</span></p>`;
  html += '</div>';
  
  html += '<div class="sl-detalle-section">';
  html += '<h3>🛰️ Información Técnica</h3>';
  html += `<p><strong>Cantidad:</strong> ${eq.numeroEquipos} equipo(s)</p>`;
  html += `<p><strong>ID:</strong> ${sanitizeHTML(eq.numeroId)}</p>`;
  html += `<p><strong>Serie:</strong> ${sanitizeHTML(eq.numeroSerie)}</p>`;
  html += `<p><strong>Kit:</strong> ${sanitizeHTML(eq.numeroKit)}</p>`;
  html += '</div>';
  
  if (eq.notas && eq.notas.trim() !== '') {
    html += '<div class="sl-detalle-section" style="grid-column: 1 / -1;">';
    html += '<h3>📝 Notas</h3>';
    html += `<p>${sanitizeHTML(eq.notas)}</p>`;
    html += '</div>';
  }
  
  html += '</div>';
  
  document.getElementById('detalle-content').innerHTML = html;
  
  const btnToggle = document.getElementById('btn-toggle-estado');
  if (btnToggle) {
    btnToggle.style.display = 'inline-block';
    if (eq.activo === 'SI') {
      btnToggle.textContent = '❌ Cancelar Equipo';
      btnToggle.className = 'sl-btn-warning';
    } else {
      btnToggle.textContent = '✅ Reactivar Equipo';
      btnToggle.className = 'sl-btn-success';
    }
  }
  
  hideGlobalLoader();
  openModal('modal-detalle');
}

function editarEquipo() {
  if (!equipoEnEdicion) return;
  
  document.getElementById('equipo-id').value = equipoEnEdicion.id;
  document.getElementById('form-categoria').value = equipoEnEdicion.categoria;
  document.getElementById('form-nombre').value = equipoEnEdicion.nombre;
  document.getElementById('form-correo').value = equipoEnEdicion.correo;
  document.getElementById('form-password').value = equipoEnEdicion.contraseña;
  document.getElementById('form-monto').value = equipoEnEdicion.montoMensual;
  document.getElementById('form-vencimiento').value = equipoEnEdicion.vencimiento;
  document.getElementById('form-cuenta').value = equipoEnEdicion.cuentaTarjeta;
  document.getElementById('form-num-equipos').value = equipoEnEdicion.numeroEquipos;
  document.getElementById('form-id').value = equipoEnEdicion.numeroId;
  document.getElementById('form-serie').value = equipoEnEdicion.numeroSerie;
  document.getElementById('form-kit').value = equipoEnEdicion.numeroKit;
  
  const notasInput = document.getElementById('form-notas');
  if (notasInput && equipoEnEdicion.notas) {
    notasInput.value = equipoEnEdicion.notas;
  }
  
  document.getElementById('modal-equipo-title').textContent = 'Editar Equipo';
  closeModal('modal-detalle');
  openModal('modal-equipo');
}

async function guardarEquipo(e) {
  e.preventDefault();
  
  console.log('📝 Intentando guardar equipo...');
  
  limpiarTodosErrores();
  const alertaExistente = document.querySelector('#form-equipo .sl-alert-danger');
  if (alertaExistente) alertaExistente.remove();

  const id = document.getElementById('equipo-id').value;
  const data = {
    categoria: document.getElementById('form-categoria').value.trim(),
    nombre: document.getElementById('form-nombre').value.trim(),
    correo: document.getElementById('form-correo').value.trim(),
    contraseña: document.getElementById('form-password').value.trim(),
    montoMensual: parseFloat(document.getElementById('form-monto').value),
    vencimiento: document.getElementById('form-vencimiento').value,
    cuentaTarjeta: document.getElementById('form-cuenta').value.trim(),
    numeroEquipos: parseInt(document.getElementById('form-num-equipos').value),
    numeroId: document.getElementById('form-id').value.trim(),
    numeroSerie: document.getElementById('form-serie').value.trim(),
    numeroKit: document.getElementById('form-kit').value.trim(),
    activo: 'SI'
  };
  
  const notasInput = document.getElementById('form-notas');
  if (notasInput && notasInput.value.trim()) {
    data.notas = notasInput.value.trim();
  }

  const errores = validarEquipo(data);
  if (errores.length > 0) {
    console.error('❌ Errores de validación:', errores);
    mostrarErroresValidacion(errores);
    return;
  }

  const btnGuardar = document.getElementById('btn-guardar-equipo');
  const textoOriginal = btnGuardar.innerHTML;
  btnGuardar.disabled = true;
  btnGuardar.innerHTML = '⏳ Guardando...';

  const method = id ? 'PUT' : 'POST';
  const endpoint = id ? '/equipos/' + id : '/equipos';

  console.log('📤 Enviando:', method, endpoint, data);

  const result = await apiCall(endpoint, method, data);

  btnGuardar.disabled = false;
  btnGuardar.innerHTML = textoOriginal;

  if (result) {
    console.log('✅ Equipo guardado exitosamente');
    crearNotificacion(
      (id ? '✏️ Equipo actualizado' : '➕ Equipo creado') + ' exitosamente', 
      'success', 
      '✅', 
      false
    );

    closeModal('modal-equipo');
    await renderEquipos();
    await renderDashboard();
  } else {
    console.error('❌ Error al guardar equipo');
  }
}

function toggleEstadoEquipo() {
  if (!equipoActualId || !equipoEnEdicion) return;
  
  const esActivo = equipoEnEdicion.activo === 'SI';
  const accion = esActivo ? 'cancelar' : 'reactivar';
  const titulo = esActivo ? '❌ ¿Cancelar equipo?' : '✅ ¿Reactivar equipo?';
  const mensaje = esActivo 
    ? 'El equipo se marcará como <strong>CANCELADO</strong> y no aparecerá en los reportes activos.' 
    : 'El equipo se marcará como <strong>ACTIVO</strong> y volverá a los reportes normales.';
  
  mostrarConfirmacion(titulo, mensaje, async () => {
    showGlobalLoader();
    
    const result = await apiCall('/equipos/' + equipoActualId, 'PUT', {
      ...equipoEnEdicion,
      activo: esActivo ? 'NO' : 'SI'
    });
    
    hideGlobalLoader();
    
    if (result) {
      crearNotificacion(
        esActivo ? '❌ Equipo cancelado exitosamente' : '✅ Equipo reactivado exitosamente', 
        'success', 
        esActivo ? '🚫' : '✅', 
        false
      );
      
      closeModal('modal-detalle');
      await renderEquipos();
      await renderDashboard();
    }
  });
}

async function eliminarEquipoActual() {
  if (!equipoActualId) return;
  
  mostrarConfirmacion(
    '🗑️ ¿Eliminar este equipo?',
    '<strong>ADVERTENCIA:</strong> Esta acción eliminará permanentemente el equipo y todos sus pagos asociados. No se puede deshacer.',
    async () => {
      showGlobalLoader();
      
      const result = await apiCall('/equipos/' + equipoActualId, 'DELETE');
      
      hideGlobalLoader();
      
      if (result) {
        crearNotificacion('🗑️ Equipo eliminado exitosamente', 'success', '✅', false);
        closeModal('modal-detalle');
        await renderEquipos();
        await renderDashboard();
      }
    }
  );
}

// ==================== PAGOS ====================

async function cargarEquiposSelect() {
  const result = await apiCall('/equipos');
  if (!result || !result.data) {
    document.getElementById('form-equipo-select').innerHTML = '<option value="">Error al cargar equipos</option>';
    return;
  }
  
  const equiposActivos = result.data.filter(eq => eq.activo === 'SI');
  
  const select = document.getElementById('form-equipo-select');
  
  if (equiposActivos.length === 0) {
    select.innerHTML = '<option value="">No hay equipos activos disponibles</option>';
    return;
  }
  
  select.innerHTML = '<option value="">Seleccionar equipo...</option>' + 
    equiposActivos.map(eq => {
      const estadoIcon = eq.estadoPago === 'PAGADO' ? '✅' : eq.estadoPago === 'VENCIDO' ? '🔴' : '⏳';
      return `<option value="${eq.id}">${estadoIcon} ${sanitizeHTML(eq.nombre)} - ${formatearMoneda(eq.montoMensual)}</option>`;
    }).join('');
}

async function renderPagos() {
  const content = document.getElementById('pagos-content');
  content.innerHTML = '<div class="sl-loading">⏳ Cargando pagos...</div>';
  
  const result = await apiCall('/equipos');
  if (!result || !result.data) {
    content.innerHTML = '<div class="sl-error-state">❌ Error al cargar pagos</div>';
    return;
  }
  
  let pagosAll = [];
  for (let eq of result.data) {
    const pagosResult = await apiCall('/pagos/equipo/' + eq.id);
    if (pagosResult && pagosResult.data) {
      pagosAll = pagosAll.concat(pagosResult.data.map(p => ({
        ...p, 
        nombreEquipo: eq.nombre,
        estadoEquipo: eq.estadoPago
      })));
    }
  }
  
  pagosAll.sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago));
  
  let html = '<div class="sl-table-container"><table class="sl-table"><thead><tr>';
  html += '<th>Equipo</th><th>Monto</th><th>Fecha</th><th>Método</th><th>Descripción</th><th>Acciones</th>';
  html += '</tr></thead><tbody>';
  
  if (pagosAll.length === 0) {
    html += '<tr><td colspan="6" style="text-align:center;color:var(--sl-text-tertiary);padding:3rem;">No hay pagos registrados</td></tr>';
  } else {
    pagosAll.forEach(p => {
      const metodoIcon = p.metodo === 'Efectivo' ? '💵' : p.metodo === 'Transferencia' ? '🏦' : p.metodo === 'Tarjeta' ? '💳' : '📝';
      
      html += `<tr>
        <td><strong>${sanitizeHTML(p.nombreEquipo)}</strong></td>
        <td><strong>${formatearMoneda(p.monto)}</strong></td>
        <td>${formatearFecha(p.fechaPago)}</td>
        <td>${metodoIcon} ${p.metodo || 'N/A'}</td>
        <td>${sanitizeHTML(p.descripcion || '-')}</td>
        <td>
          <button class="sl-btn-danger sl-btn-small" onclick="eliminarPago(${p.id})" aria-label="Eliminar pago">
            🗑️ Eliminar
          </button>
        </td>
      </tr>`;
    });
  }
  
  html += '</tbody></table></div>';
  
  const totalPagado = pagosAll.reduce((sum, p) => sum + p.monto, 0);
  html += `<div class="sl-resumen-pagos">
    <strong>Total pagado:</strong> ${formatearMoneda(totalPagado)}
    <span style="margin-left:2rem;"><strong>Total registros:</strong> ${pagosAll.length}</span>
  </div>`;
  
  document.getElementById('pagos-content').innerHTML = html;
}

async function guardarPago(e) {
  e.preventDefault();
  
  limpiarTodosErrores();
  
  const equipoId = document.getElementById('form-equipo-select').value;
  
  if (!equipoId) {
    mostrarError('equipo-select', 'Debes seleccionar un equipo');
    return;
  }
  
  const data = {
    monto: parseFloat(document.getElementById('form-pago-monto').value),
    fechaPago: document.getElementById('form-pago-fecha').value,
    metodo: document.getElementById('form-pago-metodo').value,
    descripcion: document.getElementById('form-pago-desc').value.trim()
  };
  
  if (!data.monto || data.monto <= 0) {
    mostrarError('pago-monto', 'El monto debe ser mayor a 0');
    return;
  }
  
  if (!data.fechaPago) {
    mostrarError('pago-fecha', 'La fecha de pago es requerida');
    return;
  }
  
  showGlobalLoader();
  
  const result = await apiCall('/pagos/equipo/' + equipoId, 'POST', data);
  
  hideGlobalLoader();
  
  if (result) {
    crearNotificacion('💰 Pago registrado exitosamente', 'success', '✅', false);
    closeModal('modal-pago');
    await renderPagos();
    await renderDashboard();
  }
}

async function eliminarPago(id) {
  mostrarConfirmacion(
    '🗑️ ¿Eliminar este pago?',
    'Esta acción eliminará el registro de pago permanentemente.',
    async () => {
      showGlobalLoader();
      
      const result = await apiCall('/pagos/' + id, 'DELETE');
      
      hideGlobalLoader();
      
      if (result) {
        crearNotificacion('🗑️ Pago eliminado exitosamente', 'success', '✅', false);
        await renderPagos();
        await renderDashboard();
      }
    }
  );
}

function exportarPagosCSV() {
  crearNotificacion('📥 Generando archivo CSV...', 'info', '⬇️', false);
}

function exportarPagosPDF() {
  crearNotificacion('📄 Generando archivo PDF...', 'info', '📄', false);
}

// ==================== GRÁFICOS ====================

async function renderGraficos() {
  const result = await apiCall('/estadisticas');
  if (!result || !result.data) return;
  const stats = result.data;

  setTimeout(() => {
    crearGraficoPagadoDeuda(stats);
    crearGraficoCategoria();
    crearGraficoEstado(stats);
    crearGraficoProgreso(stats);
  }, 100);
}

function crearGraficoPagadoDeuda(stats) {
  const ctx = document.getElementById('chartPagadoDeuda');
  if (!ctx) return;
  
  if (chartsPagadoDeuda) chartsPagadoDeuda.destroy();
  
  chartsPagadoDeuda = new Chart(ctx.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: ['Pagado', 'Deuda'],
      datasets: [{
        data: [stats.montoPagadoMesActual, stats.deudaTotalMesActual],
        backgroundColor: ['#22d3ee', '#ef4444'],
        borderColor: ['#0891b2', '#dc2626'],
        borderWidth: 2,
        borderRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: getComputedStyle(document.body).getPropertyValue('--sl-text-primary'), 
            font: {size: 12}, 
            padding: 15
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.label + ': ' + formatearMoneda(context.parsed);
            }
          }
        }
      }
    }
  });
}

async function crearGraficoCategoria() {
  const equipos = await apiCall('/equipos');
  if (!equipos || !equipos.data) return;

  const categorias = {};
  equipos.data.forEach(eq => {
    if (eq.activo === 'SI') {
      categorias[eq.categoria] = (categorias[eq.categoria] || 0) + 1;
    }
  });

  const ctx = document.getElementById('chartCategoria');
  if (!ctx) return;
  
  if (chartsCategoria) chartsCategoria.destroy();

  const textColor = getComputedStyle(document.body).getPropertyValue('--sl-text-primary');
  const borderColor = getComputedStyle(document.body).getPropertyValue('--sl-border');

  chartsCategoria = new Chart(ctx.getContext('2d'), {
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
          labels: {color: textColor, font: {size: 12}}
        }
      },
      scales: {
        x: {
          ticks: {color: textColor},
          grid: {color: borderColor}
        },
        y: {
          ticks: {color: textColor},
          grid: {color: borderColor}
        }
      }
    }
  });
}

function crearGraficoEstado(stats) {
  const ctx = document.getElementById('chartEstado');
  if (!ctx) return;
  
  if (chartsEstado) chartsEstado.destroy();

  chartsEstado = new Chart(ctx.getContext('2d'), {
    type: 'pie',
    data: {
      labels: ['Activos', 'Pendiente', 'Vencidos', 'Cancelados'],
      datasets: [{
        data: [
          stats.equiposActivos, 
          stats.equiposPendientePago, 
          stats.equiposVencidos, 
          stats.equiposCancelados || 0
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
            color: getComputedStyle(document.body).getPropertyValue('--sl-text-primary'), 
            font: {size: 12}, 
            padding: 15
          }
        }
      }
    }
  });
}

function crearGraficoProgreso(stats) {
  const ctx = document.getElementById('chartProgreso');
  if (!ctx) return;
  
  if (chartsProgreso) chartsProgreso.destroy();

  const porcentajePagado = stats.montoTotalMensual > 0 
    ? (stats.montoPagadoMesActual / stats.montoTotalMensual * 100).toFixed(1)
    : 0;

  const textColor = getComputedStyle(document.body).getPropertyValue('--sl-text-primary');
  const borderColor = getComputedStyle(document.body).getPropertyValue('--sl-border');

  chartsProgreso = new Chart(ctx.getContext('2d'), {
    type: 'line',
    data: {
      labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4', 'Actual'],
      datasets: [{
        label: 'Progreso de Pago (%)',
        data: [20, 35, 50, 70, porcentajePagado],
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
          labels: {color: textColor, font: {size: 12}}
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            color: textColor,
            callback: function(value) {
              return value + '%';
            }
          },
          grid: {color: borderColor}
        },
        x: {
          ticks: {color: textColor},
          grid: {color: borderColor}
        }
      }
    }
  });
}

// ==================== REPORTES ====================

async function renderReportes() {
  // La UI ya está en el HTML
}

function generarReporteMensual() {
  crearNotificacion('📄 Generando reporte mensual...', 'info', '📊', false);
}

function generarReportePorCategoria() {
  crearNotificacion('📊 Generando reporte por categoría...', 'info', '📈', false);
}

function generarReporteVencimientos() {
  crearNotificacion('⏰ Generando reporte de vencimientos...', 'info', '⏰', false);
}

function generarReporteAnual() {
  crearNotificacion('📅 Generando reporte anual...', 'info', '📅', false);
}

// ==================== TEMA CLARO/OSCURO ====================

window.addEventListener('load', () => {
  const temaGuardado = localStorage.getItem('sl-tema') || 'dark';
  aplicarTema(temaGuardado);
  actualizarBotonTema(temaGuardado);
});

function toggleTema() {
  const body = document.getElementById('app-body');
  const temaActual = body.classList.contains('light-theme') ? 'light' : 'dark';
  const temaNuevo = temaActual === 'dark' ? 'light' : 'dark';

  aplicarTema(temaNuevo);
  actualizarBotonTema(temaNuevo);
  localStorage.setItem('sl-tema', temaNuevo);
}

function aplicarTema(tema) {
  const body = document.getElementById('app-body');

  if (tema === 'light') {
    body.classList.add('light-theme');
  } else {
    body.classList.remove('light-theme');
  }

  setTimeout(actualizarGraficos, 100);
}

function actualizarBotonTema(tema) {
  const botón = document.getElementById('theme-toggle');
  botón.textContent = tema === 'dark' ? '☀️' : '🌙';
  botón.setAttribute('aria-label', tema === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
}

function actualizarGraficos() {
  const style = getComputedStyle(document.body);
  const textColor = style.getPropertyValue('--sl-text-primary').trim();
  const borderColor = style.getPropertyValue('--sl-border').trim();
  
  if (chartsPagadoDeuda) {
    chartsPagadoDeuda.options.plugins.legend.labels.color = textColor;
    chartsPagadoDeuda.update('none');
  }
  
  if (chartsCategoria) {
    chartsCategoria.options.plugins.legend.labels.color = textColor;
    chartsCategoria.options.scales.x.ticks.color = textColor;
    chartsCategoria.options.scales.y.ticks.color = textColor;
    chartsCategoria.options.scales.x.grid.color = borderColor;
    chartsCategoria.options.scales.y.grid.color = borderColor;
    chartsCategoria.update('none');
  }
  
  if (chartsEstado) {
    chartsEstado.options.plugins.legend.labels.color = textColor;
    chartsEstado.update('none');
  }
  
  if (chartsProgreso) {
    chartsProgreso.options.plugins.legend.labels.color = textColor;
    chartsProgreso.options.scales.y.ticks.color = textColor;
    chartsProgreso.options.scales.x.ticks.color = textColor;
    chartsProgreso.options.scales.y.grid.color = borderColor;
    chartsProgreso.options.scales.x.grid.color = borderColor;
    chartsProgreso.update('none');
  }
}

// ==================== STARLINK ====================

async function obtenerEstadisticasStarlink() {
  try {
    const response = await fetch('http://localhost:8081/api/starlink/stats');
    if (!response.ok) throw new Error('Starlink no accesible');

    const result = await response.json();
    const stats = result.data;
    
    console.log('🛰️ Estadísticas Starlink:', stats);

    if (stats.isConnected) {
      crearNotificacion(
        `🛰️ ${stats.statusMessage}`,
        'info', 
        '📡'
      );
    } else {
      crearNotificacion(
        `🛰️ ${stats.statusMessage}`,
        'warning', 
        '⚠️'
      );
    }

  } catch (error) {
    console.error('❌ Error obteniendo Starlink:', error);
  }
}

// Verificar Starlink cada 60 segundos
setInterval(obtenerEstadisticasStarlink, 60000);
window.addEventListener('load', () => {
  setTimeout(obtenerEstadisticasStarlink, 2000);
});
