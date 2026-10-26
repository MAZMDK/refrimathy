# Refrimathy — Servicio técnico en Bogotá + Dashboard de Analítica

## Archivos del sitio

- `index.html`: página principal, estilos, interacciones, etiquetas para buscadores, datos estructurados y rastreador automático de visitas.
- `dashboard.html`: **Dashboard y Base de Datos de Analítica** para consultar cuántas personas entraron, qué secciones vieron, cuánto tiempo permanecieron, qué servicios y barrios consultaron, y cuántas conversiones a WhatsApp o llamadas se generaron.
- `analytics-tracker.js`: motor de rastreo y base de datos local/cloud en tiempo real (sincroniza visitas entre `index.html` y `dashboard.html` y soporta Supabase REST API).
- `supabase-analytics.sql`: esquema SQL listo para ejecutar en Supabase si deseas centralizar las visitas de todos los dispositivos en la nube.
- `robots.txt` y `sitemap.xml`: acceso e índice del sitio para buscadores.
- `refrimathy-logo.png`: recurso gráfico de marca disponible para el sitio.

## Cómo usar el Dashboard de Estadísticas y Base de Datos

1. Abre `dashboard.html` en tu navegador (o visita `/dashboard.html` cuando esté publicado en `https://refrimathy.netlify.app/dashboard.html`).
2. En la pestaña **📊 Resumen & Estadísticas** verás:
   - **KPIs Ejecutivos**: Personas que entraron (visitantes totales, únicos y recurrentes), conversiones a WhatsApp/Llamadas, tiempo promedio en la página, profundidad de scroll, tasa de rebote y servicio/barrio líder.
   - **¿Qué vieron en la página?**: Porcentaje de visitantes que vieron cada una de las 8 secciones del sitio y el tiempo promedio en segundos dedicado a cada sección.
   - **Embudo de Conversión**: Entradas → Vieron Servicios → Interactuaron → Contactaron por WhatsApp o teléfono.
   - **Estadísticas del Negocio**: Equipos más solicitados (*Neveras*, *Lavadoras*, *Estufas*, *Calentadores*, *Aire acondicionado*, *Refrigeración comercial*), barrios más consultados en Bogotá, preguntas frecuentes más leídas, horas pico, dispositivos y fuentes de tráfico.
3. En **👥 Base de Datos de Visitantes** y **⚡ Registro de Eventos** puedes buscar, filtrar e inspeccionar el recorrido paso a paso de cada visitante y exportar la base de datos en **Excel (.CSV)** o **JSON**.
4. En **🗄️ Conexión Cloud & Respaldos** puedes conectar un proyecto gratuito de **Supabase** pegando tu `Project URL` y `Anon Key` tras ejecutar `supabase-analytics.sql`.

## Publicación e indexación

El sitio publicado es `https://refrimathy.netlify.app/`. Para que Google pueda indexarlo, el propietario debe verificar ese dominio en [Google Search Console](https://search.google.com/search-console/), enviar `https://refrimathy.netlify.app/sitemap.xml` y solicitar la indexación de la página de inicio.
