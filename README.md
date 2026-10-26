# Refrimathy — Servicio técnico en Bogotá + Dashboard de Analítica (React + Vite)

Sitio web oficial y plataforma de analítica en tiempo real para **Refrimathy**, construido con **React 18** y **Vite**, con animaciones fluidas, diseño responsivo libre de espacios vacíos y cumplimiento normativo colombiano.

## Estructura del Proyecto

- `index.html`, `privacidad.html`, `cookies.html`, `404.html`, `dashboard.html`: Puntos de entrada multi-página y SPA gestionados por Vite y React.
- `src/`:
  - `App.jsx` y `main.jsx`: Enrutador híbrido (soporta rutas limpias y `.html`), control de animaciones `IntersectionObserver` y sincronización analítica.
  - `data/siteData.js`: Catálogo estructurado de servicios, marcas, localidades de Bogotá, historia de **Quiénes Somos**, preguntas frecuentes, **Cláusula de Privacidad (Ley 1581 de 2012)** y **Política de Cookies**.
  - `components/`:
    - `Navbar.jsx` y `Hero.jsx`: Encabezado con efecto cristal, menú móvil animado y termómetro interactivo (25 °C → 4 °C).
    - `AboutUs.jsx`: Apartado **Quiénes Somos** con historia, misión, visión, valores corporativos y métricas de trayectoria (+7 años en Bogotá).
    - `ServicesSection.jsx`: Catálogo filtrable de los 6 servicios técnicos con conexión directa al formulario de agendamiento y WhatsApp.
    - `WorkAndProcess.jsx` y `CoverageAndFaq.jsx`: Galería de técnicos uniformados, proceso en 4 pasos, buscador interactivo de barrios de Bogotá y sección de preguntas frecuentes a dos columnas sin espacios en blanco.
    - `ContactSection.jsx`: **Centro de Contacto y Agendamiento Rápido** libre de espacios en blanco, con tarjetas de atención directa y generador de solicitudes para WhatsApp y correo.
    - `CookieBanner.jsx`, `CookiesPage.jsx` y `PrivacyPage.jsx`: Banner interactivo de consentimiento de cookies, panel de preferencias, Política de Cookies detallada y Cláusula de Privacidad con generador de solicitudes Habeas Data (ARCO).
    - `NotFoundPage.jsx`: **Página de Error 404** personalizada con redireccionamiento automático regresivo hacia el inicio.
    - `DashboardPage.jsx`: **Dashboard & Base de Datos de Analítica y Centro de Contacto** con métricas de las 9 secciones del sitio, embudo de conversión, despachador rápido de WhatsApp, exportación CSV/JSON y conexión a Supabase Cloud.
- `public/analytics-tracker.js`: Motor de rastreo en tiempo real (`LocalStorage`, `BroadcastChannel` y `Supabase REST API`).
- `supabase-analytics.sql`: Esquema SQL para centralizar la analítica en Supabase.
- `netlify.toml` y `public/_redirects`: Configuración de despliegue automático y redireccionamiento 404 para Netlify.

## Comandos de Desarrollo, Pruebas y Producción

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo (Vite)
npm run dev

# Ejecutar suite de pruebas automatizadas (Vitest + React Testing Library)
npm test

# Compilar versión optimizada para producción en dist/
npm run build

# Previsualizar compilación de producción
npm run preview
```
