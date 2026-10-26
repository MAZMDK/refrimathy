/**
 * Refrimathy Analytics & Database Engine (analytics-tracker.js)
 * Registra visitas, visitantes únicos, secciones vistas (incluyendo Quiénes Somos y Contacto),
 * tiempo por sección, profundidad de scroll, clics en servicios, barrios, FAQ,
 * consentimiento de cookies y conversiones a WhatsApp/Llamadas/Formulario.
 * Soporta almacenamiento en LocalStorage, BroadcastChannel en tiempo real,
 * endpoint Netlify (/.netlify/functions/analytics) y Supabase Cloud REST API.
 */
(function () {
  'use strict';

  const STORAGE_KEYS = {
    SESSIONS: 'refrimathy_db_sessions_v1',
    EVENTS: 'refrimathy_db_events_v1',
    VISITOR_ID: 'refrimathy_visitor_id_v1',
    VISIT_COUNT: 'refrimathy_visit_count_v1',
    CONFIG: 'refrimathy_db_config_v1',
    HEARTBEAT: 'refrimathy_live_visitors_v1',
    COOKIE_CONSENT: 'refrimathy_cookie_consent_v1'
  };

  const MAX_LOCAL_SESSIONS = 1500;
  const MAX_LOCAL_EVENTS = 5000;

  const channel = typeof BroadcastChannel !== 'undefined'
    ? new BroadcastChannel('refrimathy_analytics_live')
    : null;

  function uid(prefix = 'id') {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function safeParse(json, fallback) {
    try {
      const val = JSON.parse(json);
      return val !== null && val !== undefined ? val : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function getConfig() {
    return safeParse(localStorage.getItem(STORAGE_KEYS.CONFIG), {
      supabaseUrl: '',
      supabaseAnonKey: '',
      useNetlifyEndpoint: false,
      excludeAdminVisits: false
    });
  }

  function saveConfig(newConfig) {
    const merged = { ...getConfig(), ...newConfig };
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(merged));
    return merged;
  }

  function getCookieConsent() {
    return safeParse(localStorage.getItem(STORAGE_KEYS.COOKIE_CONSENT), null);
  }

  function saveCookieConsent(consentData) {
    const payload = {
      necessary: true,
      analytics: consentData.analytics !== false,
      preferences: consentData.preferences !== false,
      status: consentData.status || 'accepted',
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.COOKIE_CONSENT, JSON.stringify(payload));
    broadcastUpdate('cookie_consent', payload);
    return payload;
  }

  function getSessions() {
    return safeParse(localStorage.getItem(STORAGE_KEYS.SESSIONS), []);
  }

  function saveSessions(sessions) {
    const trimmed = sessions.slice(-MAX_LOCAL_SESSIONS);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(trimmed));
  }

  function getEvents() {
    return safeParse(localStorage.getItem(STORAGE_KEYS.EVENTS), []);
  }

  function saveEvents(events) {
    const trimmed = events.slice(-MAX_LOCAL_EVENTS);
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(trimmed));
  }

  function parseUserAgent() {
    const ua = navigator.userAgent || '';
    let device = 'Computador';
    if (/ipad|tablet|playbook|silk/i.test(ua) || (navigator.maxTouchPoints > 1 && /macintosh/i.test(ua))) {
      device = 'Tablet';
    } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
      device = 'Celular';
    }

    let os = 'Otro';
    if (/windows nt/i.test(ua)) os = 'Windows';
    else if (/android/i.test(ua)) os = 'Android';
    else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
    else if (/mac os x/i.test(ua)) os = 'macOS';
    else if (/linux/i.test(ua)) os = 'Linux';

    let browser = 'Otro';
    if (/edg\//i.test(ua)) browser = 'Edge';
    else if (/opr\//i.test(ua) || /opera/i.test(ua)) browser = 'Opera';
    else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
    else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
    else if (/safari/i.test(ua)) browser = 'Safari';

    return {
      device,
      os,
      browser,
      screen: typeof window !== 'undefined' && window.screen ? `${window.screen.width}x${window.screen.height}` : '1920x1080'
    };
  }

  function parseTrafficSource() {
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source');
    const utmMedium = params.get('utm_medium');
    const utmCampaign = params.get('utm_campaign');
    const ref = document.referrer || '';

    if (utmSource) {
      const s = utmSource.toLowerCase();
      if (s.includes('google')) return { source: 'Google', medium: utmMedium || 'cpc', campaign: utmCampaign || '' };
      if (s.includes('facebook') || s.includes('fb') || s.includes('ig') || s.includes('instagram')) {
        return { source: 'Redes Sociales', medium: utmMedium || 'social', campaign: utmCampaign || '' };
      }
      if (s.includes('whatsapp') || s.includes('wa')) {
        return { source: 'WhatsApp', medium: utmMedium || 'chat', campaign: utmCampaign || '' };
      }
      return { source: utmSource, medium: utmMedium || 'utm', campaign: utmCampaign || '' };
    }

    if (!ref) return { source: 'Directo', medium: 'none', campaign: '' };
    const r = ref.toLowerCase();
    if (r.includes('google.') || r.includes('bing.') || r.includes('yahoo.') || r.includes('duckduckgo.')) {
      return { source: 'Google Orgánico', medium: 'organic', campaign: '' };
    }
    if (r.includes('facebook.') || r.includes('instagram.') || r.includes('t.co') || r.includes('tiktok.')) {
      return { source: 'Redes Sociales', medium: 'social', campaign: '' };
    }
    if (r.includes('whatsapp.') || r.includes('wa.me')) {
      return { source: 'WhatsApp', medium: 'referral', campaign: '' };
    }
    if (r.includes(window.location.hostname) && window.location.hostname !== '') {
      return { source: 'Interno', medium: 'internal', campaign: '' };
    }
    try {
      return { source: new URL(ref).hostname, medium: 'referral', campaign: '' };
    } catch (_) {
      return { source: 'Referido', medium: 'referral', campaign: '' };
    }
  }

  async function syncToCloud(type, record) {
    const cfg = getConfig();

    if (cfg.supabaseUrl && cfg.supabaseAnonKey) {
      const table = type === 'session' ? 'analytics_sessions' : 'analytics_events';
      const url = `${cfg.supabaseUrl.replace(/\/$/, '')}/rest/v1/${table}`;
      try {
        await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': cfg.supabaseAnonKey,
            'Authorization': `Bearer ${cfg.supabaseAnonKey}`,
            'Prefer': 'resolution=merge-duplicates,return=minimal'
          },
          body: JSON.stringify({
            id: record.id,
            session_id: record.session_id || record.id,
            visitor_id: record.visitor_id,
            created_at: record.timestamp || record.started_at,
            payload: record
          }),
          keepalive: true
        });
      } catch (_) {}
    }

    if (cfg.useNetlifyEndpoint) {
      try {
        await fetch('/.netlify/functions/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, record }),
          keepalive: true
        });
      } catch (_) {}
    }
  }

  function broadcastUpdate(type, data) {
    if (channel) {
      try {
        channel.postMessage({ type, data, timestamp: new Date().toISOString() });
      } catch (_) {}
    }
  }

  let activeSessionRef = null;
  let activeRecordEventFn = null;
  let activeObserveSectionsFn = null;

  function initPageTracker() {
    if (window.REFRIMATHY_DISABLE_AUTO_TRACK) return;
    if (window.location.pathname.includes('dashboard')) return;

    const cfg = getConfig();
    if (cfg.excludeAdminVisits && localStorage.getItem('refrimathy_is_admin') === '1') {
      return;
    }

    let visitorId = localStorage.getItem(STORAGE_KEYS.VISITOR_ID);
    const prevVisits = parseInt(localStorage.getItem(STORAGE_KEYS.VISIT_COUNT) || '0', 10);
    const isReturning = Boolean(visitorId && prevVisits > 0);
    if (!visitorId) {
      visitorId = uid('vis');
      localStorage.setItem(STORAGE_KEYS.VISITOR_ID, visitorId);
    }
    localStorage.setItem(STORAGE_KEYS.VISIT_COUNT, String(prevVisits + 1));

    const sessionId = uid('ses');
    const startedAt = new Date().toISOString();
    const startMs = Date.now();
    const uaInfo = parseUserAgent();
    const traffic = parseTrafficSource();

    const session = {
      id: sessionId,
      visitor_id: visitorId,
      is_returning: isReturning,
      visit_number: prevVisits + 1,
      started_at: startedAt,
      updated_at: startedAt,
      duration_sec: 1,
      max_scroll: 0,
      source: traffic.source,
      medium: traffic.medium,
      campaign: traffic.campaign,
      referrer: document.referrer || 'Directo',
      device: uaInfo.device,
      os: uaInfo.os,
      browser: uaInfo.browser,
      screen: uaInfo.screen,
      language: navigator.language || 'es-CO',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Bogota',
      page_path: window.location.pathname || '/index.html',
      sections_viewed: ['inicio'],
      section_durations: { inicio: 1 },
      services_clicked: [],
      barrios_clicked: [],
      faqs_opened: [],
      converted: false,
      conversion_type: null,
      conversion_target: null,
      events_count: 1,
      is_bounce: true
    };

    activeSessionRef = session;

    let currentActiveSection = 'inicio';
    let lastActionText = 'Entró a la página de inicio';

    function updateHeartbeat() {
      const heartbeats = safeParse(localStorage.getItem(STORAGE_KEYS.HEARTBEAT), {});
      const now = Date.now();
      Object.keys(heartbeats).forEach((k) => {
        if (now - heartbeats[k].lastSeen > 45000) delete heartbeats[k];
      });
      heartbeats[sessionId] = {
        sessionId,
        visitorId,
        device: session.device,
        source: session.source,
        currentSection: currentActiveSection,
        lastAction: lastActionText,
        lastSeen: now
      };
      localStorage.setItem(STORAGE_KEYS.HEARTBEAT, JSON.stringify(heartbeats));
    }

    function persistSession() {
      session.duration_sec = Math.max(1, Math.round((Date.now() - startMs) / 1000));
      session.updated_at = new Date().toISOString();
      if (
        session.duration_sec >= 12 ||
        session.max_scroll >= 35 ||
        session.sections_viewed.length > 1 ||
        session.events_count > 1
      ) {
        session.is_bounce = false;
      }

      const sessions = getSessions();
      const idx = sessions.findIndex((s) => s.id === session.id);
      if (idx >= 0) {
        sessions[idx] = { ...session };
      } else {
        sessions.push({ ...session });
      }
      saveSessions(sessions);
      updateHeartbeat();
      broadcastUpdate('session_update', session);
      syncToCloud('session', session);
    }

    function recordEvent(category, action, label, metadata = {}) {
      const ev = {
        id: uid('evt'),
        session_id: sessionId,
        visitor_id: visitorId,
        timestamp: new Date().toISOString(),
        category,
        action,
        label,
        device: session.device,
        source: session.source,
        metadata
      };
      const events = getEvents();
      events.push(ev);
      saveEvents(events);

      session.events_count += 1;
      if (category !== 'pageview') {
        session.is_bounce = false;
      }
      persistSession();
      broadcastUpdate('new_event', ev);
      syncToCloud('event', ev);
      return ev;
    }

    activeRecordEventFn = recordEvent;

    persistSession();
    recordEvent('pageview', 'page_enter', 'Página Principal Refrimathy', {
      title: document.title,
      url: window.location.href
    });

    function onScroll() {
      const docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      ) - window.innerHeight;
      if (docHeight <= 0) return;
      const pct = Math.min(100, Math.round((window.scrollY / docHeight) * 100));
      if (pct > session.max_scroll) {
        const prevMilestone = Math.floor(session.max_scroll / 25) * 25;
        session.max_scroll = pct;
        const newMilestone = Math.floor(pct / 25) * 25;
        if (newMilestone >= 25 && newMilestone > prevMilestone) {
          recordEvent('scroll', 'scroll_depth', `Scroll ${newMilestone}%`, { depth: newMilestone });
        } else {
          persistSession();
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    const sectionMap = [
      { selector: '.hero', id: 'inicio', name: 'Hero / Inicio' },
      { selector: '#quienes-somos', id: 'quienes_somos', name: 'Quiénes Somos (Historia y Valores)' },
      { selector: '#servicios', id: 'servicios', name: 'Servicios Técnicos' },
      { selector: '#trabajo', id: 'trabajo', name: 'Galería Nuestro Trabajo' },
      { selector: '#proceso', id: 'proceso', name: 'Cómo Trabajamos (4 Pasos)' },
      { selector: '.why', id: 'porque', name: 'Por Qué Refrimathy' },
      { selector: '#cobertura', id: 'cobertura', name: 'Cobertura en Bogotá' },
      { selector: '#preguntas', id: 'preguntas', name: 'Preguntas Frecuentes (FAQ)' },
      { selector: '#contacto, .final', id: 'cta_final', name: 'Centro de Contacto y Agendamiento' }
    ];

    const visibleSections = new Set(['inicio']);
    let secObserver = null;

    if ('IntersectionObserver' in window) {
      secObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const secId = entry.target.getAttribute('data-analytics-sec');
            const secName = entry.target.getAttribute('data-analytics-name');
            if (!secId) return;
            if (entry.isIntersecting) {
              visibleSections.add(secId);
              currentActiveSection = secId;
              if (!session.sections_viewed.includes(secId)) {
                session.sections_viewed.push(secId);
                lastActionText = `Vio sección: ${secName}`;
                recordEvent('section', 'section_view', secName, { section_id: secId });
              } else {
                updateHeartbeat();
              }
            } else {
              visibleSections.delete(secId);
            }
          });
        },
        { threshold: 0.25 }
      );
    }

    function observeSections() {
      if (!secObserver) return;
      sectionMap.forEach((s) => {
        const el = document.querySelector(s.selector);
        if (el && !el.hasAttribute('data-analytics-observed')) {
          el.setAttribute('data-analytics-sec', s.id);
          el.setAttribute('data-analytics-name', s.name);
          el.setAttribute('data-analytics-observed', '1');
          secObserver.observe(el);
        }
      });
    }

    activeObserveSectionsFn = observeSections;
    observeSections();
    setTimeout(observeSections, 600);
    setTimeout(observeSections, 1800);

    setInterval(() => {
      if (document.hidden) return;
      visibleSections.forEach((secId) => {
        session.section_durations[secId] = (session.section_durations[secId] || 0) + 2;
      });
      persistSession();
    }, 2000);

    document.addEventListener('click', (e) => {
      const card = e.target.closest('#sv .card, [data-service-card]');
      if (card) {
        const serviceName = (
          card.getAttribute('data-service-name') ||
          card.querySelector('h3')?.textContent ||
          'Servicio'
        ).trim();
        if (!session.services_clicked.includes(serviceName)) {
          session.services_clicked.push(serviceName);
        }
        session.converted = true;
        session.conversion_type = 'WhatsApp Servicio';
        session.conversion_target = serviceName;
        lastActionText = `Cotizó servicio: ${serviceName}`;
        recordEvent('conversion', 'service_whatsapp_click', `Servicio: ${serviceName}`, {
          service: serviceName,
          channel: 'WhatsApp'
        });
        return;
      }

      const chip = e.target.closest('#cobertura .chips span, [data-barrio-chip]');
      if (chip) {
        const barrio = (chip.getAttribute('data-barrio-name') || chip.textContent || '').trim();
        if (barrio && !session.barrios_clicked.includes(barrio)) {
          session.barrios_clicked.push(barrio);
        }
        lastActionText = `Consultó barrio: ${barrio}`;
        recordEvent('interest', 'barrio_click', `Barrio: ${barrio}`, { barrio });
        return;
      }

      const faqSummary = e.target.closest('#preguntas summary, [data-faq-question]');
      if (faqSummary) {
        const question = (
          faqSummary.getAttribute('data-faq-question') ||
          faqSummary.textContent ||
          'Pregunta'
        ).trim().replace(/[+−-]$/, '').trim();
        if (question && !session.faqs_opened.includes(question)) {
          session.faqs_opened.push(question);
          lastActionText = `Leyó FAQ: ${question}`;
          recordEvent('engagement', 'faq_open', question, { question });
        }
      }

      const link = e.target.closest('a');
      if (link) {
        const href = link.getAttribute('href') || '';
        const text = (link.textContent || link.getAttribute('aria-label') || 'Enlace').trim().replace(/\s+/g, ' ');

        if (href.includes('wa.me') || href.includes('whatsapp')) {
          let locationTag = 'General';
          if (link.classList.contains('fab')) locationTag = 'Botón Flotante WhatsApp';
          else if (link.closest('header')) locationTag = 'Header WhatsApp';
          else if (link.closest('.hero')) locationTag = 'Hero Principal WhatsApp';
          else if (link.closest('#quienes-somos')) locationTag = 'Quiénes Somos WhatsApp';
          else if (link.closest('#cobertura')) locationTag = 'Confirmar Barrio WhatsApp';
          else if (link.closest('#contacto') || link.closest('.final')) locationTag = 'Formulario Contacto WhatsApp';
          else if (link.closest('footer')) locationTag = 'Footer WhatsApp';

          session.converted = true;
          session.conversion_type = 'WhatsApp';
          session.conversion_target = locationTag;
          lastActionText = `Clic en ${locationTag}`;
          recordEvent('conversion', 'whatsapp_click', locationTag, { text, href });
        } else if (href.startsWith('tel:')) {
          session.converted = true;
          session.conversion_type = 'Llamada Telefónica';
          session.conversion_target = text || '311 295 5131';
          lastActionText = `Llamada telefónica (${text})`;
          recordEvent('conversion', 'phone_click', `Llamada: ${text}`, { href });
        } else if (href.startsWith('mailto:')) {
          session.converted = true;
          session.conversion_type = 'Correo Electrónico';
          session.conversion_target = href.replace('mailto:', '').split('?')[0];
          lastActionText = 'Clic en correo electrónico';
          recordEvent('conversion', 'email_click', 'Correo Electrónico', { href });
        } else if (href.startsWith('#')) {
          lastActionText = `Navegó a ${text}`;
          recordEvent('navigation', 'nav_click', `Menú: ${text}`, { target: href });
        }
      }
    });

    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        persistSession();
      }
    });
    window.addEventListener('pagehide', persistSession);
  }

  function recordCustomConversion(type, target, serviceName, barrioName) {
    if (!activeSessionRef) return;
    if (serviceName && !activeSessionRef.services_clicked.includes(serviceName)) {
      activeSessionRef.services_clicked.push(serviceName);
    }
    if (barrioName && !activeSessionRef.barrios_clicked.includes(barrioName)) {
      activeSessionRef.barrios_clicked.push(barrioName);
    }
    activeSessionRef.converted = true;
    activeSessionRef.conversion_type = type || 'Formulario Contacto';
    activeSessionRef.conversion_target = target || serviceName || 'Contacto Directo';
    if (activeRecordEventFn) {
      activeRecordEventFn('conversion', 'contact_form_submit', `${type}: ${target}`, {
        service: serviceName,
        barrio: barrioName
      });
    }
  }

  function seedDemoDatabase(count = 68) {
    const services = [
      'Neveras',
      'Lavadoras',
      'Estufas',
      'Calentadores',
      'Aire acondicionado',
      'Refrigeración comercial'
    ];
    const serviceWeights = [0.34, 0.26, 0.12, 0.11, 0.09, 0.08];
    const barrios = [
      'Suba', 'Usaquén', 'Chapinero', 'Kennedy', 'Engativá',
      'Fontibón', 'Teusaquillo', 'Cedritos', 'Bosa', 'Barrios Unidos', 'Puente Aranda'
    ];
    const faqs = [
      '¿Cuánto cuesta una visita?',
      '¿Atienden en toda Bogotá?',
      '¿Qué debo enviar para pedir servicio?',
      '¿Reparan neveras y equipos de negocios?',
      '¿Reparan sin explicarme antes?',
      '¿Qué garantía tienen las reparaciones?'
    ];
    const sources = [
      { source: 'Google Orgánico', medium: 'organic', weight: 0.44 },
      { source: 'Directo', medium: 'none', weight: 0.24 },
      { source: 'WhatsApp', medium: 'referral', weight: 0.15 },
      { source: 'Redes Sociales', medium: 'social', weight: 0.12 },
      { source: 'Google Ads', medium: 'cpc', weight: 0.05 }
    ];
    const devices = [
      { device: 'Celular', os: 'Android', browser: 'Chrome', screen: '390x844', weight: 0.56 },
      { device: 'Celular', os: 'iOS', browser: 'Safari', screen: '393x852', weight: 0.19 },
      { device: 'Computador', os: 'Windows', browser: 'Chrome', screen: '1920x1080', weight: 0.18 },
      { device: 'Computador', os: 'macOS', browser: 'Safari', screen: '1440x900', weight: 0.04 },
      { device: 'Tablet', os: 'Android', browser: 'Chrome', screen: '800x1280', weight: 0.03 }
    ];
    const allSections = [
      'inicio',
      'quienes_somos',
      'servicios',
      'trabajo',
      'proceso',
      'porque',
      'cobertura',
      'preguntas',
      'cta_final'
    ];

    function pickWeighted(items) {
      const r = Math.random();
      let acc = 0;
      for (const item of items) {
        acc += item.weight;
        if (r <= acc) return item;
      }
      return items[0];
    }

    function pickService() {
      const r = Math.random();
      let acc = 0;
      for (let i = 0; i < services.length; i++) {
        acc += serviceWeights[i];
        if (r <= acc) return services[i];
      }
      return services[0];
    }

    const sessions = getSessions().filter((s) => !s.is_demo);
    const events = getEvents().filter((e) => !e.is_demo);
    const now = Date.now();

    for (let i = 0; i < count; i++) {
      const daysAgo = Math.floor(Math.pow(Math.random(), 1.35) * 14);
      const hour = Math.floor(7 + Math.random() * 14);
      const min = Math.floor(Math.random() * 60);
      const d = new Date(now - daysAgo * 86400000);
      d.setHours(hour, min, Math.floor(Math.random() * 59), 0);
      if (d.getTime() > now) d.setTime(now - Math.floor(Math.random() * 18000000));

      const startedAt = d.toISOString();
      const sessionId = `ses_demo_${i}_${d.getTime().toString(36)}`;
      const visitorId = `vis_demo_${Math.floor(i * 0.78)}`;
      const isReturning = Math.random() < 0.24;
      const src = pickWeighted(sources);
      const dev = pickWeighted(devices);

      const reachCount = Math.random() < 0.14 ? 1 : Math.floor(2 + Math.random() * (allSections.length - 1));
      const viewed = allSections.slice(0, reachCount);
      const secDurations = {};
      let totalDur = 0;
      viewed.forEach((sec) => {
        const base =
          sec === 'servicios'
            ? 24
            : sec === 'quienes_somos'
            ? 19
            : sec === 'inicio'
            ? 16
            : sec === 'preguntas'
            ? 20
            : sec === 'cta_final'
            ? 18
            : 12;
        const dur = Math.max(3, Math.round(base * (0.5 + Math.random() * 1.3)));
        secDurations[sec] = dur;
        totalDur += dur;
      });

      const isBounce = reachCount === 1 && totalDur < 12;
      const maxScroll = isBounce ? 15 : Math.min(100, Math.round((reachCount / allSections.length) * 100));

      const clickedServices = [];
      const clickedBarrios = [];
      const openedFaqs = [];
      let converted = false;
      let conversionType = null;
      let conversionTarget = null;
      let evCount = 1 + viewed.length;

      events.push({
        id: `evt_demo_pv_${i}`,
        session_id: sessionId,
        visitor_id: visitorId,
        timestamp: startedAt,
        category: 'pageview',
        action: 'page_enter',
        label: 'Página Principal Refrimathy',
        device: dev.device,
        source: src.source,
        is_demo: true
      });

      if (viewed.includes('servicios') && Math.random() < 0.68) {
        const s1 = pickService();
        clickedServices.push(s1);
        if (Math.random() < 0.22) {
          const s2 = pickService();
          if (s2 !== s1) clickedServices.push(s2);
        }
      }

      if (viewed.includes('cobertura') && Math.random() < 0.55) {
        const b = barrios[Math.floor(Math.random() * barrios.length)];
        clickedBarrios.push(b);
        evCount++;
        events.push({
          id: `evt_demo_bar_${i}`,
          session_id: sessionId,
          visitor_id: visitorId,
          timestamp: new Date(d.getTime() + 18000).toISOString(),
          category: 'interest',
          action: 'barrio_click',
          label: `Barrio: ${b}`,
          device: dev.device,
          source: src.source,
          is_demo: true
        });
      }

      if (viewed.includes('preguntas') && Math.random() < 0.6) {
        const fq = faqs[Math.floor(Math.random() * faqs.length)];
        openedFaqs.push(fq);
        evCount++;
        events.push({
          id: `evt_demo_faq_${i}`,
          session_id: sessionId,
          visitor_id: visitorId,
          timestamp: new Date(d.getTime() + 25000).toISOString(),
          category: 'engagement',
          action: 'faq_open',
          label: fq,
          device: dev.device,
          source: src.source,
          is_demo: true
        });
      }

      if (!isBounce && Math.random() < 0.44) {
        converted = true;
        const rConv = Math.random();
        if (rConv < 0.58 && clickedServices.length > 0) {
          conversionType = 'WhatsApp Servicio';
          conversionTarget = clickedServices[0];
          events.push({
            id: `evt_demo_conv_${i}`,
            session_id: sessionId,
            visitor_id: visitorId,
            timestamp: new Date(d.getTime() + totalDur * 1000).toISOString(),
            category: 'conversion',
            action: 'service_whatsapp_click',
            label: `Servicio: ${clickedServices[0]}`,
            device: dev.device,
            source: src.source,
            is_demo: true
          });
        } else if (rConv < 0.85) {
          const btns = [
            'Hero Principal WhatsApp',
            'Formulario Contacto WhatsApp',
            'Botón Flotante WhatsApp',
            'Confirmar Barrio WhatsApp',
            'Quiénes Somos WhatsApp'
          ];
          conversionType = 'WhatsApp';
          conversionTarget = btns[Math.floor(Math.random() * btns.length)];
          events.push({
            id: `evt_demo_conv_${i}`,
            session_id: sessionId,
            visitor_id: visitorId,
            timestamp: new Date(d.getTime() + totalDur * 1000).toISOString(),
            category: 'conversion',
            action: 'whatsapp_click',
            label: conversionTarget,
            device: dev.device,
            source: src.source,
            is_demo: true
          });
        } else {
          conversionType = 'Llamada Telefónica';
          conversionTarget = '311 295 5131';
          events.push({
            id: `evt_demo_conv_${i}`,
            session_id: sessionId,
            visitor_id: visitorId,
            timestamp: new Date(d.getTime() + totalDur * 1000).toISOString(),
            category: 'conversion',
            action: 'phone_click',
            label: 'Llamada: 311 295 5131',
            device: dev.device,
            source: src.source,
            is_demo: true
          });
        }
        evCount++;
      }

      sessions.push({
        id: sessionId,
        visitor_id: visitorId,
        is_returning: isReturning,
        visit_number: isReturning ? 2 : 1,
        started_at: startedAt,
        updated_at: new Date(d.getTime() + totalDur * 1000).toISOString(),
        duration_sec: totalDur,
        max_scroll: maxScroll,
        source: src.source,
        medium: src.medium,
        campaign: '',
        referrer: src.source === 'Directo' ? 'Directo' : `https://www.${src.source.toLowerCase().replace(/\s+/g, '')}.com`,
        device: dev.device,
        os: dev.os,
        browser: dev.browser,
        screen: dev.screen,
        language: 'es-CO',
        timezone: 'America/Bogota',
        page_path: '/index.html',
        sections_viewed: viewed,
        section_durations: secDurations,
        services_clicked: clickedServices,
        barrios_clicked: clickedBarrios,
        faqs_opened: openedFaqs,
        converted,
        conversion_type: conversionType,
        conversion_target: conversionTarget,
        events_count: evCount,
        is_bounce: isBounce,
        is_demo: true
      });
    }

    sessions.sort((a, b) => new Date(a.started_at) - new Date(b.started_at));
    events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    saveSessions(sessions);
    saveEvents(events);
    return { sessionsCount: sessions.length, eventsCount: events.length };
  }

  function clearDemoData() {
    const sessions = getSessions().filter((s) => !s.is_demo);
    const events = getEvents().filter((e) => !e.is_demo);
    saveSessions(sessions);
    saveEvents(events);
  }

  function clearAllDatabase() {
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.EVENTS);
    localStorage.removeItem(STORAGE_KEYS.HEARTBEAT);
  }

  function getLiveVisitors() {
    const heartbeats = safeParse(localStorage.getItem(STORAGE_KEYS.HEARTBEAT), {});
    const now = Date.now();
    return Object.values(heartbeats).filter((h) => now - h.lastSeen <= 45000);
  }

  window.RefrimathyAnalytics = {
    STORAGE_KEYS,
    getSessions,
    saveSessions,
    getEvents,
    saveEvents,
    getConfig,
    saveConfig,
    getCookieConsent,
    saveCookieConsent,
    getLiveVisitors,
    seedDemoDatabase,
    clearDemoData,
    clearAllDatabase,
    recordCustomConversion,
    observeSections: () => activeObserveSectionsFn && activeObserveSectionsFn(),
    channel
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPageTracker);
  } else {
    initPageTracker();
  }
})();
