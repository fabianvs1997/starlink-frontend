# 🛰️ Starlink Manager Frontend

Frontend moderno y modular estilo Starlink para administración de equipos de internet satelital.

## 🚀 Inicio Rápido

### Opción 1: Servidor Python (Recomendado)
```bash
cd frontend
python -m http.server 8000
```
Abre navegador: http://localhost:8000

### Opción 2: Servidor Node.js
```bash
cd frontend
npx http-server -p 8000
```
Abre navegador: http://localhost:8000

### Opción 3: Live Server (VS Code)
1. Instala extensión "Live Server"
2. Click derecho en `index.html` → "Open with Live Server"

## ⚙️ Requisitos

- ✅ Backend Spring Boot corriendo en `http://localhost:8081/api`
- ✅ Python 3.x o Node.js (para servidor local)
- ✅ Navegador moderno (Chrome, Firefox, Edge)
- ✅ Base de datos MySQL configurada

## 📋 Funcionalidades

### Dashboard
- ✅ Estadísticas en tiempo real (15 equipos, montos, vencimientos)
- ✅ Alertas de equipos vencidos
- ✅ Progreso de cobranza mensual
- ✅ Tarjetas informativas con iconos

### Gestión de Equipos
- ✅ Ver lista completa de equipos
- ✅ Crear nuevos equipos con formulario completo
- ✅ Editar equipos existentes
- ✅ Eliminar equipos con confirmación
- ✅ Activar/Cancelar equipos (suspender servicio)
- ✅ Filtros por categoría y estado
- ✅ Búsqueda en tiempo real

### Registro de Pagos
- ✅ Ver historial de pagos por equipo
- ✅ Registrar nuevos pagos
- ✅ Eliminar pagos con confirmación
- ✅ Validación automática de montos

### Interfaz
- ✅ Diseño responsivo (móvil, tablet, desktop)
- ✅ Tema oscuro estilo Starlink
- ✅ Notificaciones toast elegantes
- ✅ Modales reutilizables
- ✅ Loader animado
- ✅ Navegación fluida sin recargas

## 📁 Estructura del Proyecto

```
frontend/
├── index.html                 # Punto de entrada
├── assets/
│   ├── css/
│   │   └── starlink.css      # Estilos globales
│   └── js/
│       ├── app.js            # Inicialización y navegación
│       ├── core/
│       │   ├── api.js        # Cliente HTTP
│       │   ├── config.js     # Configuración
│       │   └── utils.js      # Utilidades
│       ├── modules/
│       │   ├── dashboard.js  # Módulo estadísticas
│       │   ├── equipos.js    # Módulo equipos
│       │   └── pagos.js      # Módulo pagos
│       └── components/
│           ├── toast.js      # Notificaciones
│           ├── modal.js      # Ventanas modales
│           └── loader.js     # Indicador de carga
└── README.md                 # Esta documentación
```

## 🔗 API Endpoints

El frontend conecta automáticamente con el backend:

### Estadísticas
- `GET /api/estadisticas` - Obtener dashboard

### Equipos
- `GET /api/equipos` - Listar todos
- `GET /api/equipos/{id}` - Obtener por ID
- `POST /api/equipos` - Crear nuevo
- `PUT /api/equipos/{id}` - Actualizar
- `DELETE /api/equipos/{id}` - Eliminar

### Pagos
- `GET /api/pagos/equipo/{equipoId}` - Pagos por equipo
- `POST /api/pagos` - Registrar pago
- `DELETE /api/pagos/{id}` - Eliminar pago

## 🎨 Arquitectura Modular

### Core
- **api.js**: Cliente HTTP con manejo de ApiResponse
- **config.js**: URLs, constantes y configuración
- **utils.js**: Funciones de formato (moneda, fechas, validaciones)

### Modules
Cada módulo maneja su propia vista:
- **dashboard.js**: Estadísticas y métricas
- **equipos.js**: CRUD completo de equipos
- **pagos.js**: Registro y gestión de pagos

### Components
Componentes reutilizables:
- **toast.js**: Sistema de notificaciones
- **modal.js**: Ventanas emergentes
- **loader.js**: Indicadores de carga

## 🔧 Configuración

Edita `assets/js/core/config.js`:

```javascript
const CONFIG = {
  API_URL: 'http://localhost:8081/api',
  STORAGE_KEYS: {
    TOKEN: 'starlink_token',
    USER: 'starlink_user'
  }
};
```

## 🐛 Solución de Problemas

### Backend no responde
```bash
# Verificar que el backend esté corriendo
curl http://localhost:8081/api/estadisticas
```

### CORS Error
Asegúrate que el backend tenga configurado:
```java
@CrossOrigin(origins = "*")
```

### Estadísticas en 0
1. Verifica datos en la base de datos
2. Revisa la consola del navegador (F12)
3. Confirma que el endpoint devuelve datos

### Cache del navegador
```bash
# Limpiar cache
Ctrl + Shift + Delete (Chrome/Edge)
Cmd + Shift + Delete (Mac)
```

## 📊 Datos de Ejemplo

El sistema espera equipos con:
- Categorías: Residencial, Empresarial, RV, Marítimo, Premium
- Estados: PAGADO, PENDIENTE, VENCIDO, CANCELADO (activo='NO')
- Montos mensuales y fechas de vencimiento

## 🚀 Próximas Características

- [ ] Gráficos interactivos (Chart.js)
- [ ] Exportar reportes PDF/Excel
- [ ] Sistema de autenticación
- [ ] Notificaciones push
- [ ] Historial de cambios
- [ ] Búsqueda avanzada con filtros

## 📝 Changelog

### v2.0.0 (Noviembre 2025)
- ✅ Arquitectura modular completa
- ✅ Dashboard con estadísticas reales
- ✅ Activar/Cancelar equipos
- ✅ Desempaquetado automático de ApiResponse
- ✅ Componentes reutilizables (Toast, Modal, Loader)

### v1.0.0 (Inicial)
- ✅ Versión monolítica básica
- ✅ CRUD de equipos y pagos

## 👨‍💻 Desarrollo

```bash
# Estructura recomendada
git clone <repo>
cd starlink-manager/frontend
python -m http.server 8000

# En otra terminal, backend
cd starlink-manager/backend
mvn spring-boot:run
```

## 📄 Licencia

Proyecto privado - Todos los derechos reservados

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'feat: agregar nueva funcionalidad'`)
4. Push (`git push origin feature/nueva-funcionalidad`)
5. Abre Pull Request

---

**¡Sistema listo para producción!** 🎉

Para soporte: contacta al equipo de desarrollo