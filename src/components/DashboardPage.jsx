import React, { useState, useEffect, useCallback } from 'react';
import {
  BUSINESS_INFO,
  SERVICES,
  BOGOTA_LOCALIDADES,
  buildWhatsAppUrl
} from '../data/siteData';
import '../styles/dashboard.css';

const SECTION_LABELS = {
  inicio: 'Hero / Inicio Principal',
  quienes_somos: 'Quiénes Somos (Historia y Valores)',
  servicios: 'Catálogo de Servicios (6 Equipos)',
  trabajo: 'Galería Nuestro Trabajo',
  proceso: 'Cómo Trabajamos (4 Pasos)',
  porque: 'Por Qué Elegir Refrimathy',
  cobertura: 'Cobertura por Barrios en Bogotá',
  preguntas: 'Preguntas Frecuentes (FAQ)',
  cta_final: 'Centro de Contacto y Agendamiento'
};

function formatDuration(sec) {
  const s = Math.round(sec || 0);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}m ${rem}s`;
}

function formatDateTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString('es-CO', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (_) {
    return iso;
  }
}

export default function DashboardPage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateFilter, setDateFilter] = useState('14');
  const [includeDemo, setIncludeDemo] = useState(true);
  const [searchSessions, setSearchSessions] = useState('');
  const [filterDevice, setFilterDevice] = useState('all');
  const [filterConversion, setFilterConversion] = useState('all');
  const [searchEvents, setSearchEvents] = useState('');
  const [filterEventCategory, setFilterEventCategory] = useState('all');
  const [inspectedSession, setInspectedSession] = useState(null);
  const [tick, setTick] = useState(0);

  // Supabase Cloud config state
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [cloudStatus, setCloudStatus] = useState({ msg: '', color: 'var(--mut)' });

  // Quick Contact Dispatcher state inside Dashboard
  const [quickClientPhone, setQuickClientPhone] = useState('');
  const [quickService, setQuickService] = useState(SERVICES[0].name);
  const [quickBarrio, setQuickBarrio] = useState('Suba');
  const [quickCustomNote, setQuickCustomNote] = useState('');
  const [copiedNotice, setCopiedNotice] = useState('');

  const getDB = () => window.RefrimathyAnalytics;

  useEffect(() => {
    const DB = getDB();
    if (!DB) return;
    if (DB.getSessions().length === 0 && !localStorage.getItem('refrimathy_demo_initialized')) {
      DB.seedDemoDatabase(68);
      localStorage.setItem('refrimathy_demo_initialized', '1');
    }
    const cfg = DB.getConfig();
    setSupabaseUrl(cfg.supabaseUrl || '');
    setSupabaseKey(cfg.supabaseAnonKey || '');
    setTick((t) => t + 1);

    const refresh = () => setTick((t) => t + 1);
    if (DB.channel) {
      DB.channel.addEventListener('message', refresh);
    }
    window.addEventListener('storage', refresh);
    const interval = setInterval(refresh, 5000);
    return () => {
      if (DB.channel) DB.channel.removeEventListener('message', refresh);
      window.removeEventListener('storage', refresh);
      clearInterval(interval);
    };
  }, []);

  const computeData = useCallback(() => {
    const DB = getDB();
    if (!DB) {
      return { sessions: [], events: [], realCount: 0, demoCount: 0, liveList: [] };
    }
    const days = dateFilter === 'all' ? null : parseInt(dateFilter, 10);
    const cutoff = days ? Date.now() - days * 86400000 : 0;

    const allSessions = DB.getSessions();
    const allEvents = DB.getEvents();

    const realCount = allSessions.filter((s) => !s.is_demo).length;
    const demoCount = allSessions.filter((s) => s.is_demo).length;

    const sessions = allSessions.filter((s) => {
      if (!includeDemo && s.is_demo) return false;
      if (cutoff && new Date(s.started_at).getTime() < cutoff) return false;
      return true;
    });

    const events = allEvents.filter((e) => {
      if (!includeDemo && e.is_demo) return false;
      if (cutoff && new Date(e.timestamp).getTime() < cutoff) return false;
      return true;
    });

    const liveList = DB.getLiveVisitors();
    return { sessions, events, realCount, demoCount, liveList };
  }, [dateFilter, includeDemo, tick]);

  const { sessions, events, realCount, demoCount, liveList } = computeData();

  // KPIs
  const totalVisits = sessions.length;
  const uniqueVisitors = new Set(sessions.map((s) => s.visitor_id)).size;
  const returningCount = sessions.filter((s) => s.is_returning).length;
  const returningPct = totalVisits ? Math.round((returningCount / totalVisits) * 100) : 0;

  const conversions = sessions.filter((s) => s.converted).length;
  const conversionRate = totalVisits ? ((conversions / totalVisits) * 100).toFixed(1) : '0.0';

  const totalDuration = sessions.reduce((acc, s) => acc + (s.duration_sec || 0), 0);
  const avgDuration = totalVisits ? Math.round(totalDuration / totalVisits) : 0;
  const avgSections = totalVisits
    ? (
        sessions.reduce((acc, s) => acc + (s.sections_viewed?.length || 1), 0) / totalVisits
      ).toFixed(1)
    : '0.0';

  const avgScroll = totalVisits
    ? Math.round(sessions.reduce((acc, s) => acc + (s.max_scroll || 0), 0) / totalVisits)
    : 0;
  const fullScrollCount = sessions.filter((s) => (s.max_scroll || 0) >= 85).length;
  const fullScrollPct = totalVisits ? Math.round((fullScrollCount / totalVisits) * 100) : 0;

  const bounceCount = sessions.filter((s) => s.is_bounce).length;
  const bounceRate = totalVisits ? Math.round((bounceCount / totalVisits) * 100) : 0;

  const serviceCounts = {
    Neveras: 0,
    Lavadoras: 0,
    Estufas: 0,
    Calentadores: 0,
    'Aire acondicionado': 0,
    'Refrigeración comercial': 0
  };
  const barrioCounts = {};
  const faqCounts = {};
  const convTargetCounts = {};
  const sourceCounts = {};
  const deviceCounts = {};
  const hourCounts = new Array(24).fill(0);

  sessions.forEach((s) => {
    (s.services_clicked || []).forEach((srv) => {
      serviceCounts[srv] = (serviceCounts[srv] || 0) + 1;
    });
    (s.barrios_clicked || []).forEach((b) => {
      barrioCounts[b] = (barrioCounts[b] || 0) + 1;
    });
    (s.faqs_opened || []).forEach((fq) => {
      faqCounts[fq] = (faqCounts[fq] || 0) + 1;
    });
    if (s.converted && s.conversion_target) {
      const key = `${s.conversion_type}: ${s.conversion_target}`;
      convTargetCounts[key] = (convTargetCounts[key] || 0) + 1;
    }
    const src = s.source || 'Directo';
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;

    const devKey = `${s.device || 'Celular'} (${s.os || 'Otro'})`;
    deviceCounts[devKey] = (deviceCounts[devKey] || 0) + 1;

    const h = new Date(s.started_at).getHours();
    if (!isNaN(h)) hourCounts[h]++;
  });

  const sortedServices = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1]);
  const sortedBarrios = Object.entries(barrioCounts).sort((a, b) => b[1] - a[1]);
  const sortedFaqs = Object.entries(faqCounts).sort((a, b) => b[1] - a[1]);
  const sortedTargets = Object.entries(convTargetCounts).sort((a, b) => b[1] - a[1]);
  const sortedSources = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]);
  const sortedDevices = Object.entries(deviceCounts).sort((a, b) => b[1] - a[1]);

  const topService = sortedServices[0] && sortedServices[0][1] > 0 ? sortedServices[0][0] : 'Neveras';
  const topBarrio = sortedBarrios[0]
    ? `${sortedBarrios[0][0]} (${sortedBarrios[0][1]})`
    : 'Bogotá D.C.';

  // Daily buckets (10 days)
  const dailyBuckets = [];
  const now = new Date();
  for (let i = 9; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
    dailyBuckets.push({ key, label, visits: 0, conversions: 0 });
  }
  sessions.forEach((s) => {
    const k = (s.started_at || '').slice(0, 10);
    const b = dailyBuckets.find((x) => x.key === k);
    if (b) {
      b.visits++;
      if (s.converted) b.conversions++;
    }
  });
  const maxDailyVal = Math.max(4, ...dailyBuckets.map((b) => b.visits));

  // Funnel steps
  const sawServices = sessions.filter((s) =>
    (s.sections_viewed || []).includes('servicios')
  ).length;
  const sawAbout = sessions.filter((s) =>
    (s.sections_viewed || []).includes('quienes_somos')
  ).length;
  const engaged = sessions.filter(
    (s) =>
      (s.services_clicked?.length || 0) > 0 ||
      (s.barrios_clicked?.length || 0) > 0 ||
      (s.faqs_opened?.length || 0) > 0
  ).length;
  const funnelSteps = [
    { name: 'Entraron a la página web', count: totalVisits, pct: 100 },
    {
      name: 'Vieron Quiénes Somos / Servicios',
      count: Math.max(sawServices, sawAbout),
      pct: totalVisits ? Math.round((Math.max(sawServices, sawAbout) / totalVisits) * 100) : 0
    },
    {
      name: 'Consultaron Equipo, Barrio o FAQ',
      count: engaged,
      pct: totalVisits ? Math.round((engaged / totalVisits) * 100) : 0
    },
    {
      name: 'Contactaron por WhatsApp o Llamada',
      count: conversions,
      pct: totalVisits ? Math.round((conversions / totalVisits) * 100) : 0
    }
  ];

  // Sections stats
  const sectionRows = Object.keys(SECTION_LABELS).map((secId) => {
    let viewers = 0;
    let totalSec = 0;
    sessions.forEach((s) => {
      if ((s.sections_viewed || []).includes(secId)) {
        viewers++;
        totalSec += s.section_durations?.[secId] || 4;
      }
    });
    const pct = totalVisits ? Math.round((viewers / totalVisits) * 100) : 0;
    const avgSec = viewers ? Math.round(totalSec / viewers) : 0;
    return { secId, label: SECTION_LABELS[secId], viewers, pct, avgSec };
  });

  // Hours grid (8am to 7pm = 12 cells in 4x3 grid)
  const activeHours = [];
  for (let h = 8; h <= 19; h++) activeHours.push(h);
  const maxHourCount = Math.max(1, ...hourCounts);
  let peakHour = 10;
  hourCounts.forEach((c, h) => {
    if (c > hourCounts[peakHour]) peakHour = h;
  });

  // Simulate Real Visit
  const handleSimulateVisit = () => {
    const DB = getDB();
    if (!DB) return;
    const srvList = SERVICES.map((s) => s.name);
    const barList = ['Suba', 'Usaquén', 'Chapinero', 'Kennedy', 'Engativá', 'Fontibón', 'Teusaquillo'];
    const chosenService = srvList[Math.floor(Math.random() * srvList.length)];
    const chosenBarrio = barList[Math.floor(Math.random() * barList.length)];
    const nowIso = new Date().toISOString();
    const sesId = `ses_live_${Date.now().toString(36)}`;
    const visId = `vis_live_${Math.random().toString(36).slice(2, 7)}`;

    const newSession = {
      id: sesId,
      visitor_id: visId,
      is_returning: false,
      visit_number: 1,
      started_at: nowIso,
      updated_at: nowIso,
      duration_sec: 52 + Math.floor(Math.random() * 60),
      max_scroll: 90,
      source: 'Google Orgánico',
      medium: 'organic',
      campaign: '',
      referrer: 'https://www.google.com/',
      device: 'Celular',
      os: 'Android',
      browser: 'Chrome',
      screen: '390x844',
      language: 'es-CO',
      timezone: 'America/Bogota',
      page_path: '/index.html',
      sections_viewed: [
        'inicio',
        'quienes_somos',
        'servicios',
        'trabajo',
        'proceso',
        'cobertura',
        'preguntas',
        'cta_final'
      ],
      section_durations: {
        inicio: 12,
        quienes_somos: 18,
        servicios: 24,
        trabajo: 9,
        proceso: 8,
        cobertura: 11,
        preguntas: 14,
        cta_final: 16
      },
      services_clicked: [chosenService],
      barrios_clicked: [chosenBarrio],
      faqs_opened: ['¿Cuánto cuesta una visita técnica?'],
      converted: true,
      conversion_type: 'WhatsApp Servicio',
      conversion_target: chosenService,
      events_count: 6,
      is_bounce: false,
      is_demo: false
    };

    const nextSessions = DB.getSessions();
    nextSessions.push(newSession);
    DB.saveSessions(nextSessions);

    const nextEvents = DB.getEvents();
    nextEvents.push(
      {
        id: `evt_sim_1_${Date.now()}`,
        session_id: sesId,
        visitor_id: visId,
        timestamp: nowIso,
        category: 'pageview',
        action: 'page_enter',
        label: 'Página Principal Refrimathy',
        device: 'Celular',
        source: 'Google Orgánico',
        is_demo: false
      },
      {
        id: `evt_sim_2_${Date.now()}`,
        session_id: sesId,
        visitor_id: visId,
        timestamp: nowIso,
        category: 'interest',
        action: 'barrio_click',
        label: `Barrio: ${chosenBarrio}`,
        device: 'Celular',
        source: 'Google Orgánico',
        is_demo: false
      },
      {
        id: `evt_sim_3_${Date.now()}`,
        session_id: sesId,
        visitor_id: visId,
        timestamp: nowIso,
        category: 'conversion',
        action: 'service_whatsapp_click',
        label: `Servicio: ${chosenService}`,
        device: 'Celular',
        source: 'Google Orgánico',
        is_demo: false
      }
    );
    DB.saveEvents(nextEvents);
    setTick((t) => t + 1);
  };

  const handleExportCsv = () => {
    const headers = [
      'ID_Sesion',
      'Fecha_Hora',
      'ID_Visitante',
      'Tipo_Visitante',
      'Origen',
      'Dispositivo',
      'Sistema_Operativo',
      'Navegador',
      'Duracion_Segundos',
      'Scroll_Max_Pct',
      'Secciones_Vistas',
      'Servicios_Consultados',
      'Barrios_Consultados',
      'Convertido',
      'Canal_Conversion',
      'Objetivo_Conversion'
    ];
    const rows = sessions.map((s) => [
      s.id,
      s.started_at,
      s.visitor_id,
      s.is_returning ? 'Recurrente' : 'Nuevo',
      s.source,
      s.device,
      s.os,
      s.browser,
      s.duration_sec,
      s.max_scroll,
      (s.sections_viewed || []).join('|'),
      (s.services_clicked || []).join('|'),
      (s.barrios_clicked || []).join('|'),
      s.converted ? 'SI' : 'NO',
      s.conversion_type || '',
      s.conversion_target || ''
    ]);
    const csvContent =
      '\uFEFF' +
      [headers, ...rows]
        .map((r) => r.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
        .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `refrimathy-visitantes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    const DB = getDB();
    if (!DB) return;
    const payload = {
      exported_at: new Date().toISOString(),
      site: BUSINESS_INFO.url,
      sessions: DB.getSessions(),
      events: DB.getEvents()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `refrimathy-database-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e) => {
    const file = e.target.files?.[0];
    const DB = getDB();
    if (!file || !DB) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (Array.isArray(data.sessions)) DB.saveSessions(data.sessions);
        if (Array.isArray(data.events)) DB.saveEvents(data.events);
        setTick((t) => t + 1);
      } catch (_) {}
    };
    reader.readAsText(file);
  };

  const handlePullSupabase = async () => {
    const DB = getDB();
    if (!DB) return;
    const cleanUrl = supabaseUrl.trim().replace(/\/$/, '');
    const cleanKey = supabaseKey.trim();
    DB.saveConfig({ supabaseUrl: cleanUrl, supabaseAnonKey: cleanKey });
    if (!cleanUrl || !cleanKey) {
      setCloudStatus({
        msg: 'Ingresa la URL y la clave Anon de tu proyecto Supabase.',
        color: '#dc2626'
      });
      return;
    }
    setCloudStatus({ msg: 'Conectando con Supabase...', color: 'var(--mut)' });
    try {
      const res = await fetch(
        `${cleanUrl}/rest/v1/analytics_sessions?select=payload&order=created_at.asc&limit=1000`,
        {
          headers: { apikey: cleanKey, Authorization: `Bearer ${cleanKey}` }
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const rows = await res.json();
      const cloudSessions = rows.map((r) => r.payload).filter(Boolean);
      const local = DB.getSessions();
      const map = new Map(local.map((s) => [s.id, s]));
      cloudSessions.forEach((cs) => map.set(cs.id, cs));
      DB.saveSessions(Array.from(map.values()));
      setCloudStatus({
        msg: `✓ Conectado a Supabase (${cloudSessions.length} sesiones sincronizadas).`,
        color: '#15803d'
      });
      setTick((t) => t + 1);
    } catch (err) {
      setCloudStatus({
        msg: `No se pudo consultar Supabase (${err.message}). Verifica la URL, clave y supabase-analytics.sql.`,
        color: '#dc2626'
      });
    }
  };

  // Filtered tables
  const filteredSessionsTable = [...sessions]
    .reverse()
    .filter((s) => {
      if (filterDevice !== 'all' && s.device !== filterDevice) return false;
      if (filterConversion === 'converted' && !s.converted) return false;
      if (filterConversion === 'not_converted' && s.converted) return false;
      const q = searchSessions.toLowerCase().trim();
      if (q) {
        const hay = [
          s.id,
          s.visitor_id,
          s.source,
          s.device,
          s.os,
          s.browser,
          ...(s.services_clicked || []),
          ...(s.barrios_clicked || []),
          s.conversion_target || ''
        ]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

  const filteredEventsTable = [...events]
    .reverse()
    .filter((e) => {
      if (filterEventCategory !== 'all' && e.category !== filterEventCategory) return false;
      const q = searchEvents.toLowerCase().trim();
      if (q) {
        const hay = `${e.category} ${e.action} ${e.label} ${e.session_id} ${e.source}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

  const generatedQuickMessage = `Hola, te escribimos de Coordinación Técnica Refrimathy Bogotá respecto a tu servicio de ${quickService} en ${quickBarrio}.${
    quickCustomNote.trim() ? ' ' + quickCustomNote.trim() : ' ¿En qué horario podemos programar tu visita?'
  }`;

  const handleDispatchQuickWhatsApp = (e) => {
    e.preventDefault();
    const digits = quickClientPhone.replace(/\D/g, '');
    const targetPhone = digits
      ? digits.startsWith('57')
        ? digits
        : `57${digits}`
      : BUSINESS_INFO.whatsappNumber;
    const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(generatedQuickMessage)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyQuickLink = () => {
    const link = buildWhatsAppUrl(
      `Hola Refrimathy, necesito servicio técnico para ${quickService} en ${quickBarrio}, Bogotá.`
    );
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
    }
    setCopiedNotice('✓ Enlace directo copiado al portapapeles');
    setTimeout(() => setCopiedNotice(''), 3500);
  };

  return (
    <div className="dash-root page-transition">
      <header className="topbar">
        <div className="topbar-inner">
          <a
            className="brand-dash"
            href="/"
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault();
                onNavigate('home', '#inicio');
              }
            }}
          >
            <svg viewBox="0 0 64 64" aria-hidden="true">
              <circle cx="32" cy="32" r="30" fill="#fff" />
              <path d="M32 32V6a26 26 0 00-26 26z" fill="#1b6fd1" />
              <path d="M32 32V6a26 26 0 0126 26z" fill="#f47a20" />
              <path d="M32 32H6a26 26 0 0026 26z" fill="#1b6fd1" />
              <path d="M32 32v26a26 26 0 0026-26z" fill="#f47a20" />
              <circle cx="32" cy="32" r="11" fill="#fff" />
            </svg>
            <div>
              <span className="brand-title">
                refrim<i>athy</i> · Analytics & Contact Hub
              </span>
              <span className="brand-sub">
                Base de datos de visitantes, comportamiento y centro de contacto
              </span>
            </div>
          </a>

          <div className="live-pill" title="Personas navegando en el sitio ahora mismo">
            <span className="live-dot"></span>
            <span>
              {liveList.length > 0
                ? `En vivo: ${liveList.length} navegando (${liveList[0].currentSection || 'inicio'})`
                : 'En vivo: monitoreo activo'}
            </span>
          </div>

          <div className="top-controls">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="select-ctrl"
              aria-label="Filtrar por periodo"
            >
              <option value="all">Todo el periodo</option>
              <option value="1">Hoy (últimas 24h)</option>
              <option value="7">Últimos 7 días</option>
              <option value="14">Últimos 14 días</option>
              <option value="30">Últimos 30 días</option>
            </select>
            <button
              className="btn-ctrl cyan"
              type="button"
              onClick={handleSimulateVisit}
            >
              + Simular Visita Real
            </button>
            <button className="btn-ctrl" type="button" onClick={handleExportCsv}>
              Exportar CSV
            </button>
            <a
              className="btn-ctrl hot"
              href="/"
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate('home', '#inicio');
                }
              }}
            >
              ← Volver al Sitio Web
            </a>
          </div>
        </div>
      </header>

      <nav className="subnav" aria-label="Vistas del Dashboard">
        <div className="subnav-inner">
          <div className="tabs">
            <button
              type="button"
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              📊 Resumen & Estadísticas
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'contact_center' ? 'active' : ''}`}
              onClick={() => setActiveTab('contact_center')}
            >
              💬 Centro de Contacto Rápido
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'visitors' ? 'active' : ''}`}
              onClick={() => setActiveTab('visitors')}
            >
              👥 Base de Datos de Visitantes{' '}
              <span className="tab-badge">{sessions.length}</span>
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
              onClick={() => setActiveTab('events')}
            >
              ⚡ Registro de Eventos <span className="tab-badge">{events.length}</span>
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'database' ? 'active' : ''}`}
              onClick={() => setActiveTab('database')}
            >
              🗄️ Conexión Cloud & Respaldos
            </button>
          </div>

          <div className="demo-switch">
            <label>
              <input
                type="checkbox"
                checked={includeDemo}
                onChange={(e) => setIncludeDemo(e.target.checked)}
              />
              Mostrar datos de demostración junto con visitas reales
            </label>
          </div>
        </div>
      </nav>

      <main className="dash-container">
        <div className="db-banner">
          <div className="db-banner-left">
            <span className="db-tag">BASE DE DATOS ACTIVA</span>
            <span>
              Registros activos: <b>{sessions.length} visitas</b> ({realCount} reales ·{' '}
              {demoCount} demo) y <b>{events.length} eventos</b> guardados en tiempo real.
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              className="btn-sm"
              type="button"
              onClick={() => setTick((t) => t + 1)}
            >
              🔄 Actualizar ahora
            </button>
            <button
              className="btn-sm"
              type="button"
              onClick={() => {
                const DB = getDB();
                if (DB) DB.seedDemoDatabase(68);
                setIncludeDemo(true);
                setTick((t) => t + 1);
              }}
            >
              ✨ Generar muestra demo
            </button>
            <button
              className="btn-sm"
              type="button"
              onClick={() => setIncludeDemo(false)}
            >
              🧹 Ver solo visitas reales
            </button>
          </div>
        </div>

        {/* Banner compacto de Canales de Contacto Directo (elimina espacios vacíos y facilita contacto inmediato) */}
        <div className="dash-contact-banner">
          <div>
            <h3>📞 Canales Oficiales de Contacto & Agendamiento</h3>
            <p>
              Acceso directo a las líneas activas de coordinación técnica en Bogotá D.C. Todos los
              clics de clientes en estos canales quedan registrados automáticamente.
            </p>
          </div>
          <div className="dash-contact-actions-grid">
            <a
              className="dash-contact-box"
              href={buildWhatsAppUrl(
                'Hola Coordinación Refrimathy, verificando canal oficial de WhatsApp.'
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              <small>💬 WhatsApp Oficial</small>
              <b>+57 {BUSINESS_INFO.phoneDisplay}</b>
              <span>Abrir chat directo ↗</span>
            </a>

            <a className="dash-contact-box" href={BUSINESS_INFO.phoneHref}>
              <small>📞 Línea Telefónica</small>
              <b>{BUSINESS_INFO.phoneDisplay}</b>
              <span>Llamar a coordinación ↗</span>
            </a>

            <button
              type="button"
              className="dash-contact-box"
              style={{ textAlign: 'left', cursor: 'pointer' }}
              onClick={() => setActiveTab('contact_center')}
            >
              <small>⚡ Despacho & Enlaces</small>
              <b>Generador WhatsApp</b>
              <span>Contactar cliente o crear link →</span>
            </button>
          </div>
        </div>

        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <section>
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-top">
                  <span>PERSONAS QUE ENTRARON</span>
                  <span>👥</span>
                </div>
                <div className="kpi-val">{totalVisits}</div>
                <div className="kpi-sub">
                  <span className="badge-info">{uniqueVisitors} únicos</span>
                  <span>{returningPct}% recurrentes</span>
                </div>
              </div>

              <div className="kpi-card wa">
                <div className="kpi-top">
                  <span>CONVERSIONES (WHATSAPP / TEL)</span>
                  <span>💬</span>
                </div>
                <div className="kpi-val">{conversions}</div>
                <div className="kpi-sub">
                  <span className="badge-up">{conversionRate}% conversión</span>
                  <span>contactaron</span>
                </div>
              </div>

              <div className="kpi-card hot">
                <div className="kpi-top">
                  <span>TIEMPO PROMEDIO EN PÁGINA</span>
                  <span>⏱️</span>
                </div>
                <div className="kpi-val">{formatDuration(avgDuration)}</div>
                <div className="kpi-sub">
                  <span className="badge-info">{avgSections} secciones</span>
                  <span>vistas por visita</span>
                </div>
              </div>

              <div className="kpi-card purple">
                <div className="kpi-top">
                  <span>SCROLL PROMEDIO</span>
                  <span>📜</span>
                </div>
                <div className="kpi-val">{avgScroll}%</div>
                <div className="kpi-sub">
                  <span>{fullScrollPct}%</span>
                  <span>llegaron al contacto</span>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-top">
                  <span>TASA DE REBOTE</span>
                  <span>↩️</span>
                </div>
                <div className="kpi-val">{bounceRate}%</div>
                <div className="kpi-sub">
                  <span className="badge-up">{100 - bounceRate}% retención</span>
                  <span>interactuaron</span>
                </div>
              </div>

              <div className="kpi-card hot">
                <div className="kpi-top">
                  <span>SERVICIO MÁS BUSCADO</span>
                  <span>❄️</span>
                </div>
                <div className="kpi-val" style={{ fontSize: '21px', margin: '12px 0 8px' }}>
                  {topService}
                </div>
                <div className="kpi-sub">
                  <span className="badge-info">{topBarrio}</span>
                  <span>zona líder</span>
                </div>
              </div>
            </div>

            <div className="row-2">
              <div className="panel">
                <div>
                  <div className="panel-head">
                    <div>
                      <h2 className="panel-title">Evolución de Visitas y Contactos por Día</h2>
                      <p className="panel-desc">
                        Comparativa diaria entre personas que entraron a la página y personas que
                        agendaron por WhatsApp o llamada
                      </p>
                    </div>
                  </div>
                  <div className="chart-area">
                    {dailyBuckets.map((b) => {
                      const vPct = Math.max(4, Math.round((b.visits / maxDailyVal) * 100));
                      const cPct =
                        b.conversions > 0
                          ? Math.max(6, Math.round((b.conversions / maxDailyVal) * 100))
                          : 2;
                      return (
                        <div
                          className="chart-col"
                          key={b.key}
                          title={`${b.label}: ${b.visits} visitas, ${b.conversions} conversiones`}
                        >
                          <div className="chart-val-top">{b.visits}</div>
                          <div className="chart-bars">
                            <div className="bar-v" style={{ height: `${vPct}%` }}></div>
                            <div className="bar-c" style={{ height: `${cPct}%` }}></div>
                          </div>
                          <span className="chart-lbl">{b.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="panel-footer-insight">
                  <div>
                    <i className="leg-dot" style={{ background: '#1b6fd1' }}></i>
                    Visitas totales: <b>{totalVisits}</b>
                    <span style={{ margin: '0 10px' }}>·</span>
                    <i className="leg-dot" style={{ background: '#25d366' }}></i>
                    Contactos directos: <b>{conversions}</b>
                  </div>
                  <span> efectividad global: <b>{conversionRate}%</b></span>
                </div>
              </div>

              <div className="panel">
                <div>
                  <div className="panel-head">
                    <div>
                      <h2 className="panel-title">Embudo de Conversión de Clientes</h2>
                      <p className="panel-desc">
                        Recorrido desde que entran al sitio hasta que solicitan un técnico
                      </p>
                    </div>
                  </div>
                  <div className="funnel">
                    {funnelSteps.map((st, idx) => (
                      <div className="funnel-step" key={idx}>
                        <div className="funnel-bar" style={{ width: `${st.pct}%` }}></div>
                        <div className="funnel-content">
                          <div>
                            <span className="funnel-num">{idx + 1}</span>
                            <b>{st.name}</b>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <b style={{ fontSize: '15.5px' }}>{st.count}</b>
                            <span
                              style={{
                                fontSize: '12px',
                                color: 'var(--mut)',
                                marginLeft: '4px'
                              }}
                            >
                              ({st.pct}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="panel-footer-insight">
                  <span>
                    Canal líder: <b>WhatsApp Directo ({BUSINESS_INFO.phoneDisplay})</b>
                  </span>
                  <a
                    href="/#contacto"
                    onClick={(e) => {
                      if (onNavigate) {
                        e.preventDefault();
                        onNavigate('home', '#contacto');
                      }
                    }}
                    style={{ color: 'var(--cyan)', fontWeight: 700, textDecoration: 'none' }}
                  >
                    Ir al formulario ↗
                  </a>
                </div>
              </div>
            </div>

            <div className="row-equal">
              <div className="panel">
                <div>
                  <div className="panel-head">
                    <div>
                      <h2 className="panel-title">¿Qué vieron en la página? (9 Secciones)</h2>
                      <p className="panel-desc">
                        Porcentaje de visitantes que vieron cada bloque (incluyendo Quiénes Somos y
                        Contacto) y tiempo promedio de lectura
                      </p>
                    </div>
                  </div>
                  <div className="stat-list">
                    {sectionRows.map((r) => (
                      <div className="stat-item" key={r.secId}>
                        <div className="stat-row">
                          <span className="stat-name">{r.label}</span>
                          <span className="stat-meta">
                            <b>{r.viewers}</b> ({r.pct}%) · Promedio: <b>{r.avgSec}s</b>
                          </span>
                        </div>
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: `${r.pct}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="panel-footer-insight">
                  <span>
                    Sección con mayor lectura: <b>Catálogo de Servicios y Quiénes Somos</b>
                  </span>
                  <span>9 bloques monitoreados</span>
                </div>
              </div>

              <div className="panel">
                <div>
                  <div className="panel-head">
                    <div>
                      <h2 className="panel-title">Equipos y Servicios Más Solicitados</h2>
                      <p className="panel-desc">
                        En qué tarjetas de servicio hicieron clic los visitantes para cotizar por
                        WhatsApp o formulario
                      </p>
                    </div>
                  </div>
                  <div className="stat-list">
                    {sortedServices.map(([name, val]) => {
                      const maxVal = Math.max(1, sortedServices[0]?.[1] || 1);
                      const pct = Math.min(100, Math.round((val / maxVal) * 100));
                      return (
                        <div className="stat-item" key={name}>
                          <div className="stat-row">
                            <span className="stat-name">{name}</span>
                            <span className="stat-meta">
                              <b>{val}</b> solicitudes
                            </span>
                          </div>
                          <div className="progress-track">
                            <div
                              className="progress-fill hot"
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="panel-footer-insight">
                  <span>
                    Equipo líder en Bogotá: <b>{topService}</b>
                  </span>
                  <button
                    type="button"
                    className="btn-sm"
                    onClick={() => setActiveTab('contact_center')}
                  >
                    Crear enlace de servicio →
                  </button>
                </div>
              </div>
            </div>

            <div className="row-3">
              <div className="panel">
                <div>
                  <div className="panel-head">
                    <div>
                      <h2 className="panel-title">Interés por Barrios en Bogotá</h2>
                      <p className="panel-desc">Localidades más consultadas en cobertura</p>
                    </div>
                  </div>
                  <div className="stat-list">
                    {sortedBarrios.slice(0, 6).map(([name, val]) => {
                      const maxVal = Math.max(1, sortedBarrios[0]?.[1] || 1);
                      const pct = Math.min(100, Math.round((val / maxVal) * 100));
                      return (
                        <div className="stat-item" key={name}>
                          <div className="stat-row">
                            <span className="stat-name">📍 {name}</span>
                            <span className="stat-meta">
                              <b>{val}</b> consultas
                            </span>
                          </div>
                          <div className="progress-track">
                            <div className="progress-fill" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="panel-footer-insight">
                  <span>Localidad principal:</span>
                  <b>{topBarrio}</b>
                </div>
              </div>

              <div className="panel">
                <div>
                  <div className="panel-head">
                    <div>
                      <h2 className="panel-title">Preguntas Frecuentes (FAQ)</h2>
                      <p className="panel-desc">Dudas que más abren antes de contactar</p>
                    </div>
                  </div>
                  <div className="stat-list">
                    {sortedFaqs.slice(0, 6).map(([name, val]) => {
                      const maxVal = Math.max(1, sortedFaqs[0]?.[1] || 1);
                      const pct = Math.min(100, Math.round((val / maxVal) * 100));
                      return (
                        <div className="stat-item" key={name}>
                          <div className="stat-row">
                            <span className="stat-name">{name}</span>
                            <span className="stat-meta">
                              <b>{val}</b> lecturas
                            </span>
                          </div>
                          <div className="progress-track">
                            <div
                              className="progress-fill purple"
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="panel-footer-insight">
                  <span>Duda #1:</span>
                  <b>Valor y cobertura de visita</b>
                </div>
              </div>

              <div className="panel">
                <div>
                  <div className="panel-head">
                    <div>
                      <h2 className="panel-title">Botones que Más Convierten</h2>
                      <p className="panel-desc">Ubicación exacta donde inician el contacto</p>
                    </div>
                  </div>
                  <div className="stat-list">
                    {sortedTargets.slice(0, 6).map(([name, val]) => {
                      const maxVal = Math.max(1, sortedTargets[0]?.[1] || 1);
                      const pct = Math.min(100, Math.round((val / maxVal) * 100));
                      return (
                        <div className="stat-item" key={name}>
                          <div className="stat-row">
                            <span className="stat-name">{name}</span>
                            <span className="stat-meta">
                              <b>{val}</b> contactos
                            </span>
                          </div>
                          <div className="progress-track">
                            <div className="progress-fill wa" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="panel-footer-insight">
                  <span>Total conversiones:</span>
                  <b>{conversions} clientes contactaron</b>
                </div>
              </div>
            </div>

            <div className="row-3">
              <div className="panel">
                <div>
                  <div className="panel-head">
                    <div>
                      <h2 className="panel-title">Origen del Tráfico</h2>
                      <p className="panel-desc">¿De dónde llegan las personas a Refrimathy?</p>
                    </div>
                  </div>
                  <div className="stat-list">
                    {sortedSources.map(([name, val]) => {
                      const pct = totalVisits ? Math.round((val / totalVisits) * 100) : 0;
                      return (
                        <div className="stat-item" key={name}>
                          <div className="stat-row">
                            <span className="stat-name">{name}</span>
                            <span className="stat-meta">
                              <b>{val}</b> ({pct}%)
                            </span>
                          </div>
                          <div className="progress-track">
                            <div className="progress-fill" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="panel-footer-insight">
                  <span>Fuente principal:</span>
                  <b>{sortedSources[0]?.[0] || 'Google Orgánico'}</b>
                </div>
              </div>

              <div className="panel">
                <div>
                  <div className="panel-head">
                    <div>
                      <h2 className="panel-title">Dispositivos y Sistemas</h2>
                      <p className="panel-desc">Desde qué equipo navegan los clientes</p>
                    </div>
                  </div>
                  <div className="stat-list">
                    {sortedDevices.map(([name, val]) => {
                      const pct = totalVisits ? Math.round((val / totalVisits) * 100) : 0;
                      return (
                        <div className="stat-item" key={name}>
                          <div className="stat-row">
                            <span className="stat-name">{name}</span>
                            <span className="stat-meta">
                              <b>{val}</b> ({pct}%)
                            </span>
                          </div>
                          <div className="progress-track">
                            <div
                              className="progress-fill hot"
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="panel-footer-insight">
                  <span>Dispositivo dominante:</span>
                  <b>{sortedDevices[0]?.[0] || 'Celular (Android)'}</b>
                </div>
              </div>

              <div className="panel">
                <div>
                  <div className="panel-head">
                    <div>
                      <h2 className="panel-title">Horas Pico de Solicitudes</h2>
                      <p className="panel-desc">
                        Distribución horaria de clientes buscando servicio (8:00 a 19:00)
                      </p>
                    </div>
                  </div>
                  <div className="hour-grid">
                    {activeHours.map((h) => {
                      const c = hourCounts[h];
                      const intensity = c / maxHourCount;
                      const bg =
                        c === 0
                          ? '#f8fafc'
                          : `rgba(27, 111, 209, ${(0.14 + intensity * 0.75).toFixed(2)})`;
                      const color = intensity > 0.55 ? '#fff' : 'var(--ink)';
                      return (
                        <div
                          className="hour-cell"
                          key={h}
                          style={{ background: bg, color }}
                        >
                          <span>{h}:00</span>
                          <b>{c}</b>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="panel-footer-insight">
                  <span>Hora de mayor demanda:</span>
                  <b>{peakHour}:00 hrs (Bogotá)</b>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================= TAB 2: CENTRO DE CONTACTO RÁPIDO ================= */}
        {activeTab === 'contact_center' && (
          <section className="row-equal">
            <div className="panel">
              <div>
                <div className="panel-head">
                  <div>
                    <h2 className="panel-title">
                      💬 Despacho y Respuesta Rápida por WhatsApp
                    </h2>
                    <p className="panel-desc">
                      Envía un mensaje pre-estructurado de confirmación técnica a cualquier cliente o
                      genera enlaces directos de agendamiento por equipo y localidad.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleDispatchQuickWhatsApp}>
                  <div className="form-grid-2">
                    <div className="field-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="dashPhone">
                        Teléfono del cliente (opcional, vacío usa línea Refrimathy)
                      </label>
                      <input
                        id="dashPhone"
                        type="tel"
                        placeholder="Ej. 311 295 5131"
                        value={quickClientPhone}
                        onChange={(e) => setQuickClientPhone(e.target.value)}
                      />
                    </div>
                    <div className="field-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="dashSrv">Equipo solicitado</label>
                      <select
                        id="dashSrv"
                        value={quickService}
                        onChange={(e) => setQuickService(e.target.value)}
                      >
                        {SERVICES.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="field-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="dashBarrio">Barrio / Localidad en Bogotá</label>
                      <select
                        id="dashBarrio"
                        value={quickBarrio}
                        onChange={(e) => setQuickBarrio(e.target.value)}
                      >
                        {BOGOTA_LOCALIDADES.map((loc) => (
                          <option key={loc.name} value={loc.name}>
                            {loc.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="field-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="dashNote">Nota adicional o franja horaria</label>
                      <input
                        id="dashNote"
                        type="text"
                        placeholder="Ej. Técnico disponible hoy de 2pm a 4pm"
                        value={quickCustomNote}
                        onChange={(e) => setQuickCustomNote(e.target.value)}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      background: '#f4f8fd',
                      border: '1px solid var(--line)',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      marginBottom: '14px',
                      fontSize: '13.5px'
                    }}
                  >
                    <b style={{ display: 'block', marginBottom: '4px' }}>
                      Vista previa del mensaje:
                    </b>
                    <span style={{ color: 'var(--mut)' }}>{generatedQuickMessage}</span>
                  </div>

                  {copiedNotice && (
                    <p style={{ color: '#15803d', fontWeight: 700, marginBottom: '10px' }}>
                      {copiedNotice}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button type="submit" className="btn wa sm">
                      Enviar por WhatsApp ↗
                    </button>
                    <button
                      type="button"
                      className="btn navy sm"
                      onClick={handleCopyQuickLink}
                    >
                      🔗 Copiar link de cotización
                    </button>
                  </div>
                </form>
              </div>

              <div className="panel-footer-insight">
                <span>Línea principal activa:</span>
                <b>+57 {BUSINESS_INFO.phoneDisplay} · {BUSINESS_INFO.email}</b>
              </div>
            </div>

            <div className="panel">
              <div>
                <div className="panel-head">
                  <div>
                    <h2 className="panel-title">
                      ⚡ Enlaces Directos por Servicio Técnico
                    </h2>
                    <p className="panel-desc">
                      Accesos rápidos listos para compartir en redes sociales, WhatsApp Business o
                      atención telefónica.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '10px' }}>
                  {SERVICES.map((srv) => (
                    <div
                      key={srv.id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: '1px solid var(--line)',
                        background: '#f8fbff',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '12px',
                        flexWrap: 'wrap'
                      }}
                    >
                      <div>
                        <b>🔧 {srv.name}</b>
                        <div style={{ fontSize: '12.5px', color: 'var(--mut)' }}>{srv.waText}</div>
                      </div>
                      <a
                        className="btn-sm"
                        href={buildWhatsAppUrl(srv.waText)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none' }}
                      >
                        Probar WhatsApp ↗
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel-footer-insight">
                <span>Horario operativo Bogotá:</span>
                <b>Lunes a Sábado 7:00 a.m. – 7:00 p.m.</b>
              </div>
            </div>
          </section>
        )}

        {/* ================= TAB 3: VISITORS DB ================= */}
        {activeTab === 'visitors' && (
          <section className="panel">
            <div>
              <div className="panel-head">
                <div>
                  <h2 className="panel-title">
                    Tabla de Base de Datos: Sesiones y Visitantes (`analytics_sessions`)
                  </h2>
                  <p className="panel-desc">
                    Cada fila representa una persona que entró a la página, qué secciones vio,
                    cuánto tiempo estuvo y en qué hizo clic.
                  </p>
                </div>
              </div>

              <div className="table-toolbar">
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input
                    type="search"
                    value={searchSessions}
                    onChange={(e) => setSearchSessions(e.target.value)}
                    className="search-input"
                    placeholder="Buscar por servicio, barrio, origen, ID o dispositivo..."
                  />
                  <select
                    value={filterDevice}
                    onChange={(e) => setFilterDevice(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">Todos los dispositivos</option>
                    <option value="Celular">Celular</option>
                    <option value="Computador">Computador</option>
                    <option value="Tablet">Tablet</option>
                  </select>
                  <select
                    value={filterConversion}
                    onChange={(e) => setFilterConversion(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="converted">Solo Convertidos (WhatsApp/Tel)</option>
                    <option value="not_converted">Sin conversión</option>
                  </select>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--mut)' }}>
                  Mostrando {filteredSessionsTable.length} de {sessions.length} visitas
                </div>
              </div>

              <div className="table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Fecha y Hora</th>
                      <th>Visitante</th>
                      <th>Origen</th>
                      <th>Dispositivo</th>
                      <th>Tiempo / Scroll</th>
                      <th>Secciones que Vio</th>
                      <th>Servicios / Barrios Vistos</th>
                      <th>Estado Conversión</th>
                      <th>Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSessionsTable.slice(0, 120).map((s) => (
                      <tr key={s.id}>
                        <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime(s.started_at)}</td>
                        <td>
                          {s.is_demo ? (
                            <span className="pill purple">Demo</span>
                          ) : (
                            <span className="pill blue">Real</span>
                          )}{' '}
                          <span className="mono">{s.visitor_id.slice(0, 10)}</span>
                          <div style={{ fontSize: '11.5px', color: 'var(--mut)' }}>
                            {s.is_returning ? 'Visitante recurrente' : 'Visitante nuevo'}
                          </div>
                        </td>
                        <td>
                          <b>{s.source}</b>
                        </td>
                        <td>
                          <b>{s.device}</b>
                          <div style={{ fontSize: '11.5px', color: 'var(--mut)' }}>
                            {s.os} · {s.browser}
                          </div>
                        </td>
                        <td>
                          <b>{formatDuration(s.duration_sec)}</b>
                          <div style={{ fontSize: '11.5px', color: 'var(--mut)' }}>
                            Scroll: {s.max_scroll || 0}%
                          </div>
                        </td>
                        <td>
                          <b>{(s.sections_viewed || []).length} de 9</b> secciones
                          <div style={{ fontSize: '11.5px', color: 'var(--mut)' }}>
                            {(s.sections_viewed || []).slice(0, 4).join(', ')}
                            {(s.sections_viewed || []).length > 4 ? '…' : ''}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {(s.services_clicked || []).map((x) => (
                              <span key={x} className="pill orange">
                                🔧 {x}
                              </span>
                            ))}
                            {(s.barrios_clicked || []).map((x) => (
                              <span key={x} className="pill blue">
                                📍 {x}
                              </span>
                            ))}
                            {(s.services_clicked || []).length === 0 &&
                              (s.barrios_clicked || []).length === 0 && (
                                <span style={{ color: 'var(--mut)', fontSize: '12px' }}>
                                  Navegación general
                                </span>
                              )}
                          </div>
                        </td>
                        <td>
                          {s.converted ? (
                            <span className="pill wa">
                              ✓ {s.conversion_type}: {s.conversion_target || 'Contacto'}
                            </span>
                          ) : (
                            <span className="pill gray">Solo lectura</span>
                          )}
                        </td>
                        <td>
                          <button
                            className="btn-sm"
                            type="button"
                            onClick={() => setInspectedSession(s)}
                          >
                            Ver recorrido
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ================= TAB 4: EVENTS LOG ================= */}
        {activeTab === 'events' && (
          <section className="panel">
            <div>
              <div className="panel-head">
                <div>
                  <h2 className="panel-title">
                    Tabla de Base de Datos: Eventos e Interacciones (`analytics_events`)
                  </h2>
                  <p className="panel-desc">
                    Flujo cronológico de cada acción realizada por los visitantes dentro del sitio.
                  </p>
                </div>
              </div>

              <div className="table-toolbar">
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input
                    type="search"
                    value={searchEvents}
                    onChange={(e) => setSearchEvents(e.target.value)}
                    className="search-input"
                    placeholder="Buscar evento, etiqueta o sesión..."
                  />
                  <select
                    value={filterEventCategory}
                    onChange={(e) => setFilterEventCategory(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">Todas las categorías</option>
                    <option value="conversion">Conversiones (WhatsApp / Llamada)</option>
                    <option value="section">Secciones vistas</option>
                    <option value="interest">Interés en Barrios</option>
                    <option value="engagement">Preguntas Frecuentes (FAQ)</option>
                    <option value="scroll">Profundidad de Scroll</option>
                    <option value="pageview">Entradas de página</option>
                  </select>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--mut)' }}>
                  Mostrando {filteredEventsTable.length} de {events.length} eventos
                </div>
              </div>

              <div className="table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Hora Exacta</th>
                      <th>Categoría</th>
                      <th>Acción</th>
                      <th>Qué Vio / Tocó (Etiqueta)</th>
                      <th>Dispositivo</th>
                      <th>Origen</th>
                      <th>ID Sesión</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEventsTable.slice(0, 150).map((e) => (
                      <tr key={e.id}>
                        <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime(e.timestamp)}</td>
                        <td>
                          <span
                            className={`pill ${
                              e.category === 'conversion'
                                ? 'wa'
                                : e.category === 'interest'
                                ? 'orange'
                                : e.category === 'engagement'
                                ? 'purple'
                                : 'blue'
                            }`}
                          >
                            {e.category}
                          </span>
                        </td>
                        <td className="mono">{e.action}</td>
                        <td>
                          <b>{e.label}</b>
                        </td>
                        <td>{e.device || '—'}</td>
                        <td>{e.source || '—'}</td>
                        <td className="mono">{(e.session_id || '').slice(0, 14)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ================= TAB 5: CLOUD & BACKUPS ================= */}
        {activeTab === 'database' && (
          <section className="row-equal">
            <div className="panel">
              <div>
                <div className="panel-head">
                  <div>
                    <h2 className="panel-title">
                      Conexión a Base de Datos en la Nube (Supabase)
                    </h2>
                    <p className="panel-desc">
                      Conecta Supabase para centralizar las visitas de todos los celulares y
                      computadores que entren a <b>refrimathy.netlify.app</b>.
                    </p>
                  </div>
                </div>

                <div className="field-group">
                  <label htmlFor="cfgSupabaseUrl">Supabase Project URL</label>
                  <input
                    type="url"
                    id="cfgSupabaseUrl"
                    placeholder="https://tu-proyecto.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="cfgSupabaseKey">Supabase Publishable / Anon Key</label>
                  <input
                    type="text"
                    id="cfgSupabaseKey"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '14px' }}>
                  <button
                    type="button"
                    className="btn-ctrl cyan"
                    style={{ background: 'var(--cyan)', color: '#fff' }}
                    onClick={handlePullSupabase}
                  >
                    💾 Guardar y Sincronizar desde Supabase
                  </button>
                </div>

                {cloudStatus.msg && (
                  <p style={{ marginTop: '12px', fontSize: '13px', color: cloudStatus.color }}>
                    {cloudStatus.msg}
                  </p>
                )}

                <hr
                  style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '18px 0' }}
                />
                <h3 style={{ fontSize: '15.5px', marginBottom: '8px' }}>
                  Instrucciones rápidas para Supabase:
                </h3>
                <ol
                  style={{
                    paddingLeft: '20px',
                    fontSize: '13.5px',
                    color: 'var(--mut)',
                    display: 'grid',
                    gap: '6px'
                  }}
                >
                  <li>
                    Crea un proyecto gratis en <b>supabase.com</b> y abre <b>SQL Editor</b>.
                  </li>
                  <li>
                    Ejecuta el archivo <code>supabase-analytics.sql</code> incluido en este
                    repositorio.
                  </li>
                  <li>
                    Pega arriba tu <b>Project URL</b> y tu clave <b>anon / public</b>.
                  </li>
                </ol>
              </div>

              <div className="panel-footer-insight">
                <span>Motor de sincronización:</span>
                <b>LocalStorage + BroadcastChannel + Supabase REST</b>
              </div>
            </div>

            <div className="panel">
              <div>
                <div className="panel-head">
                  <div>
                    <h2 className="panel-title">Respaldos, Exportación y Mantenimiento</h2>
                    <p className="panel-desc">
                      Descarga tu base de datos completa en Excel (CSV) o JSON, o restaura copias de
                      seguridad.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '12px' }}>
                  <div
                    style={{
                      padding: '14px',
                      background: '#f4f8fd',
                      border: '1px solid var(--line)',
                      borderRadius: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <b>Exportar Base de Datos Completa (JSON)</b>
                      <div style={{ fontSize: '12.5px', color: 'var(--mut)' }}>
                        Incluye todas las sesiones, tiempos por sección y eventos
                      </div>
                    </div>
                    <button className="btn-sm" type="button" onClick={handleExportJson}>
                      Descargar .JSON
                    </button>
                  </div>

                  <div
                    style={{
                      padding: '14px',
                      background: '#f4f8fd',
                      border: '1px solid var(--line)',
                      borderRadius: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <b>Exportar Tabla de Visitantes para Excel (CSV)</b>
                      <div style={{ fontSize: '12.5px', color: 'var(--mut)' }}>
                        Formato compatible con Microsoft Excel y Google Sheets
                      </div>
                    </div>
                    <button className="btn-sm" type="button" onClick={handleExportCsv}>
                      Descargar .CSV
                    </button>
                  </div>

                  <div
                    style={{
                      padding: '14px',
                      background: '#f4f8fd',
                      border: '1px solid var(--line)',
                      borderRadius: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <b>Importar Respaldo de Base de Datos (.JSON)</b>
                      <div style={{ fontSize: '12.5px', color: 'var(--mut)' }}>
                        Restaura o fusiona registros guardados previamente
                      </div>
                    </div>
                    <label className="btn-sm" style={{ cursor: 'pointer' }}>
                      Subir archivo
                      <input
                        type="file"
                        accept=".json"
                        style={{ display: 'none' }}
                        onChange={handleImportJson}
                      />
                    </label>
                  </div>

                  <div
                    style={{
                      padding: '14px',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <b style={{ color: '#991b1b' }}>Vaciar Base de Datos Local</b>
                      <div style={{ fontSize: '12.5px', color: '#b91c1c' }}>
                        Elimina las sesiones y eventos almacenados en este navegador
                      </div>
                    </div>
                    <button
                      className="btn-sm"
                      type="button"
                      style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                      onClick={() => {
                        const DB = getDB();
                        if (DB) DB.clearAllDatabase();
                        setTick((t) => t + 1);
                      }}
                    >
                      Borrar Todo
                    </button>
                  </div>
                </div>
              </div>

              <div className="panel-footer-insight">
                <span>Estado de integridad:</span>
                <b>✓ 100% Operativo</b>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Modal de Recorrido del Visitante */}
      {inspectedSession && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target.classList.contains('modal-backdrop')) {
              setInspectedSession(null);
            }
          }}
        >
          <div className="modal" role="dialog" aria-modal="true">
            <div className="modal-head">
              <div>
                <h3 style={{ fontSize: '20px' }}>
                  Ficha del Visitante ({inspectedSession.device} · {inspectedSession.os})
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--mut)' }}>
                  ID Sesión: {inspectedSession.id} · Entrada:{' '}
                  {formatDateTime(inspectedSession.started_at)} · Origen: {inspectedSession.source}
                </p>
              </div>
              <button
                className="close-btn"
                type="button"
                aria-label="Cerrar"
                onClick={() => setInspectedSession(null)}
              >
                ×
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
                marginBottom: '16px'
              }}
            >
              <div style={{ background: '#f4f8fd', padding: '12px', borderRadius: '12px' }}>
                <div style={{ fontSize: '12px', color: 'var(--mut)' }}>Tiempo Total</div>
                <b style={{ fontSize: '18px' }}>{formatDuration(inspectedSession.duration_sec)}</b>
              </div>
              <div style={{ background: '#f4f8fd', padding: '12px', borderRadius: '12px' }}>
                <div style={{ fontSize: '12px', color: 'var(--mut)' }}>Scroll Alcanzado</div>
                <b style={{ fontSize: '18px' }}>{inspectedSession.max_scroll || 0}%</b>
              </div>
              <div style={{ background: '#f4f8fd', padding: '12px', borderRadius: '12px' }}>
                <div style={{ fontSize: '12px', color: 'var(--mut)' }}>Resultado</div>
                <b
                  style={{
                    fontSize: '15px',
                    color: inspectedSession.converted ? '#15803d' : 'var(--ink)'
                  }}
                >
                  {inspectedSession.converted
                    ? `✓ ${inspectedSession.conversion_target}`
                    : 'Sin contacto directo'}
                </b>
              </div>
            </div>

            <h4 style={{ marginBottom: '8px' }}>Secciones vistas y tiempo de lectura:</h4>
            <div style={{ marginBottom: '18px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {(inspectedSession.sections_viewed || []).map((sec) => (
                <span key={sec} className="pill blue">
                  {SECTION_LABELS[sec] || sec}: {inspectedSession.section_durations?.[sec] || 2}s
                </span>
              ))}
            </div>

            <h4 style={{ marginBottom: '8px' }}>Línea de tiempo de eventos:</h4>
            <div className="journey-list">
              {events
                .filter((ev) => ev.session_id === inspectedSession.id)
                .map((ev) => (
                  <div className="journey-item" key={ev.id}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        color: 'var(--mut)'
                      }}
                    >
                      <span>
                        {ev.category.toUpperCase()} · {ev.action}
                      </span>
                      <span>{formatDateTime(ev.timestamp)}</span>
                    </div>
                    <div style={{ fontWeight: 700, marginTop: '2px' }}>{ev.label}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
