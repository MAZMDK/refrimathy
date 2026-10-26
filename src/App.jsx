import React, { useState, useEffect, useCallback } from 'react';
import { SvgDefs } from './components/Icons';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AboutUs from './components/AboutUs';
import ServicesSection from './components/ServicesSection';
import WorkAndProcess from './components/WorkAndProcess';
import CoverageAndFaq from './components/CoverageAndFaq';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';
import PrivacyPage from './components/PrivacyPage';
import CookiesPage from './components/CookiesPage';
import NotFoundPage from './components/NotFoundPage';
import DashboardPage from './components/DashboardPage';
import { buildWhatsAppUrl } from './data/siteData';

export function resolveViewFromLocation(pathname, dataPage) {
  const cleanPath = (pathname || '/').toLowerCase();
  if (cleanPath === '/' || cleanPath === '/index.html') {
    if (dataPage && dataPage !== 'home') return dataPage;
    return 'home';
  }
  if (cleanPath === '/privacidad' || cleanPath === '/privacidad.html') return 'privacidad';
  if (cleanPath === '/cookies' || cleanPath === '/cookies.html') return 'cookies';
  if (cleanPath === '/dashboard' || cleanPath === '/dashboard.html') return 'dashboard';
  if (cleanPath === '/404' || cleanPath === '/404.html') return '404';
  return '404';
}

export default function App({ initialPage }) {
  const [view, setView] = useState(() =>
    resolveViewFromLocation(window.location.pathname, initialPage)
  );
  const [preselectedService, setPreselectedService] = useState('');
  const [preselectedBarrio, setPreselectedBarrio] = useState('');
  const [openCookieModal, setOpenCookieModal] = useState(false);

  const navigateTo = useCallback((nextView, hash = '') => {
    setView(nextView);

    const urlMap = {
      home: '/' + (hash || ''),
      privacidad: '/privacidad.html',
      cookies: '/cookies.html',
      dashboard: '/dashboard.html',
      '404': '/404.html'
    };

    const nextUrl = urlMap[nextView] || '/';
    try {
      window.history.pushState({ view: nextView, hash }, '', nextUrl);
    } catch (_) {}

    if (nextView === 'home' && hash) {
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el && el.scrollIntoView) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const onPopState = () => {
      setView(resolveViewFromLocation(window.location.pathname, 'home'));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Actualizar título del documento según la vista activa
  useEffect(() => {
    const titles = {
      home: 'Servicio técnico a domicilio en Bogotá | Refrimathy',
      privacidad: 'Cláusula de Privacidad y Tratamiento de Datos | Refrimathy Bogotá',
      cookies: 'Política de Cookies | Refrimathy Bogotá',
      dashboard: 'Dashboard & Base de Datos de Analítica y Contacto | Refrimathy',
      '404': 'Error 404 — Página no encontrada | Refrimathy Bogotá'
    };
    document.title = titles[view] || titles.home;
  }, [view]);

  // Activar animaciones de aparición (.rv -> .rv.in) y sincronizar con el rastreador de secciones
  useEffect(() => {
    const elements = document.querySelectorAll('.rv');
    if (typeof IntersectionObserver !== 'undefined') {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const parentChildren = entry.target.parentNode
                ? Array.from(entry.target.parentNode.children)
                : [];
              const idx = Math.max(0, parentChildren.indexOf(entry.target));
              entry.target.style.transitionDelay = `${idx * 75}ms`;
              entry.target.classList.add('in');
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 }
      );
      elements.forEach((el) => io.observe(el));

      if (window.RefrimathyAnalytics && window.RefrimathyAnalytics.observeSections) {
        window.RefrimathyAnalytics.observeSections();
      }
      return () => io.disconnect();
    } else {
      elements.forEach((el) => el.classList.add('in'));
    }
  }, [view]);

  const handleSelectServiceForForm = (serviceName) => {
    setPreselectedService(serviceName);
    navigateTo('home', '#contacto');
  };

  const handleSelectBarrioForForm = (barrioName) => {
    setPreselectedBarrio(barrioName);
  };

  if (view === 'dashboard') {
    return (
      <>
        <SvgDefs />
        <DashboardPage onNavigate={navigateTo} />
      </>
    );
  }

  return (
    <>
      <SvgDefs />
      <Navbar currentView={view} onNavigate={navigateTo} />

      {view === 'home' && (
        <main id="inicio">
          <Hero onQuickSchedule={() => navigateTo('home', '#contacto')} />
          <AboutUs />
          <ServicesSection onSelectServiceForForm={handleSelectServiceForForm} />
          <WorkAndProcess />
          <CoverageAndFaq onSelectBarrioForForm={handleSelectBarrioForForm} />
          <ContactSection
            preselectedService={preselectedService}
            preselectedBarrio={preselectedBarrio}
            onNavigate={navigateTo}
          />
        </main>
      )}

      {view === 'privacidad' && <PrivacyPage onNavigate={navigateTo} />}

      {view === 'cookies' && (
        <CookiesPage
          onNavigate={navigateTo}
          onOpenCookiePreferences={() => setOpenCookieModal(true)}
        />
      )}

      {view === '404' && <NotFoundPage onNavigate={navigateTo} />}

      <Footer
        onNavigate={navigateTo}
        onOpenCookiePreferences={() => setOpenCookieModal(true)}
      />

      <a
        className="fab"
        href={buildWhatsAppUrl('Hola, quiero consultar un servicio técnico en Bogotá.')}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escribir por WhatsApp"
      >
        <b>¿Necesitas ayuda? Escríbenos</b>
        <span>
          <svg aria-hidden="true">
            <use href="#wa" />
          </svg>
        </span>
      </a>

      <CookieBanner
        forceOpenPreferences={openCookieModal}
        onClosePreferences={() => setOpenCookieModal(false)}
        onNavigate={navigateTo}
      />
    </>
  );
}
