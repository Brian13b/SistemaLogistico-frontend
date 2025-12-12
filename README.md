# 💻 Frontend - Sistema de Gestión de Flotas

Interfaz de usuario moderna y reactiva para el **Sistema Logístico**. Construida con React, ofrece una experiencia de usuario fluida para administradores y operadores logísticos.

---

## 🌟 Funcionalidades Principales
- **Dashboard Interactivo:** Vista general de métricas clave y estados de flota.
- **Mapas en Vivo:** Integración con **Leaflet** para visualizar la ubicación de los vehículos.
- **Gestión Modular:** Paneles separados para Vehículos, Conductores, Viajes y Facturación.
- **Seguridad:** Manejo de sesiones con JWT y rutas protegidas (Private Routes).
- **Reportes Visuales:** Tablas dinámicas.

---

## 🔧 Stack Tecnológico
- **Core:** React.js (Vite)
- **Estado Global:** Redux Toolkit
- **Estilos:** TailwindCSS
- **Mapas:** React-Leaflet
- **HTTP:** Axios (con interceptors para manejo de tokens)

---

## 📚 Estructura del Proyecto
- `/src/components`: Componentes reutilizables (Botones, Modales, Tablas).
- `/src/pages`: Vistas principales (Login, Dashboard, ABMs).
- `/src/store`: Slices de Redux para manejo de estado.
- `/src/services`: Conectores a la API (Gateway).

---

## 🌱 Futuras Actualizaciones
- [ ] **PWA (Progressive Web App):** Habilitar instalación en escritorio y móviles.
- [ ] **WebSockets:** Integración para recibir actualizaciones de ubicación sin recargar.
- [ ] **Internacionalización (i18n):** Soporte multi-idioma.

---

## 👤 Autor
**Brian Battauz** - [GitHub](https://github.com/Brian13b)