import React, { useState, useEffect } from 'react';
import { BUSINESS_INFO, buildWhatsAppUrl } from '../data/siteData';
import { BrandLogo } from './Icons';

export default function Navbar({ currentView, onNavigate }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 18);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSectionClick = (e, sectionHash) => {
    e.preventDefault();
    setMobileOpen(false);
    onNavigate('home', sectionHash);
  };

  const handleViewClick = (e, viewName) => {
    e.preventDefault();
    setMobileOpen(false);
    onNavigate(viewName);
  };

  return (
    <>
      <div className="top">
        <div className="wrap top-inner">
          <span>
            Atención técnica a domicilio en toda Bogotá D.C. ·{' '}
            <a href={BUSINESS_INFO.phoneHref}>Llámanos: {BUSINESS_INFO.phoneDisplay}</a>
          </span>
          <div className="top-links">
            <a href="#quienes-somos" onClick={(e) => handleSectionClick(e, '#quienes-somos')}>
              Quiénes somos
            </a>
            <span>·</span>
            <a href="/privacidad.html" onClick={(e) => handleViewClick(e, 'privacidad')}>
              Privacidad
            </a>
            <span>·</span>
            <a href="/cookies.html" onClick={(e) => handleViewClick(e, 'cookies')}>
              Cookies
            </a>
          </div>
        </div>
      </div>

      <header className={`site-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="wrap nav">
          <BrandLogo
            onClick={(e) => handleSectionClick(e, '#inicio')}
            showTagline={true}
          />

          <nav aria-label="Principal">
            <ul className="nav-menu">
              <li>
                <a
                  href="#quienes-somos"
                  onClick={(e) => handleSectionClick(e, '#quienes-somos')}
                >
                  Quiénes somos
                </a>
              </li>
              <li>
                <a
                  href="#servicios"
                  onClick={(e) => handleSectionClick(e, '#servicios')}
                >
                  Servicios
                </a>
              </li>
              <li>
                <a
                  href="#trabajo"
                  onClick={(e) => handleSectionClick(e, '#trabajo')}
                >
                  Trabajos
                </a>
              </li>
              <li>
                <a
                  href="#proceso"
                  onClick={(e) => handleSectionClick(e, '#proceso')}
                >
                  Cómo trabajamos
                </a>
              </li>
              <li>
                <a
                  href="#cobertura"
                  onClick={(e) => handleSectionClick(e, '#cobertura')}
                >
                  Cobertura
                </a>
              </li>
              <li>
                <a
                  href="#preguntas"
                  onClick={(e) => handleSectionClick(e, '#preguntas')}
                >
                  Preguntas
                </a>
              </li>
              <li>
                <a
                  href="#contacto"
                  onClick={(e) => handleSectionClick(e, '#contacto')}
                >
                  Contacto
                </a>
              </li>
              <li>
                <a
                  href="/dashboard.html"
                  onClick={(e) => handleViewClick(e, 'dashboard')}
                  style={{ color: 'var(--cyan)', fontWeight: 700 }}
                  className={currentView === 'dashboard' ? 'active' : ''}
                >
                  📊 Dashboard
                </a>
              </li>
            </ul>
          </nav>

          <div className="nav-actions">
            <a
              className="btn wa sm hd"
              href={buildWhatsAppUrl('Hola, quiero agendar una visita técnica a domicilio en Bogotá.')}
              target="_blank"
              rel="noopener noreferrer"
            >
              Agendar por WhatsApp
            </a>
            <button
              type="button"
              className="mobile-toggle"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        <div className={`mobile-drawer ${mobileOpen ? 'open' : ''}`}>
          <a href="#quienes-somos" onClick={(e) => handleSectionClick(e, '#quienes-somos')}>
            👥 Quiénes somos
          </a>
          <a href="#servicios" onClick={(e) => handleSectionClick(e, '#servicios')}>
            🔧 Servicios técnicos
          </a>
          <a href="#trabajo" onClick={(e) => handleSectionClick(e, '#trabajo')}>
            📸 Nuestro trabajo
          </a>
          <a href="#proceso" onClick={(e) => handleSectionClick(e, '#proceso')}>
            📋 Cómo trabajamos
          </a>
          <a href="#cobertura" onClick={(e) => handleSectionClick(e, '#cobertura')}>
            📍 Cobertura en Bogotá
          </a>
          <a href="#preguntas" onClick={(e) => handleSectionClick(e, '#preguntas')}>
            ❓ Preguntas frecuentes
          </a>
          <a href="#contacto" onClick={(e) => handleSectionClick(e, '#contacto')}>
            ✉️ Formulario de Contacto
          </a>
          <a href="/privacidad.html" onClick={(e) => handleViewClick(e, 'privacidad')}>
            🔒 Cláusula de Privacidad
          </a>
          <a href="/cookies.html" onClick={(e) => handleViewClick(e, 'cookies')}>
            🍪 Política de Cookies
          </a>
          <a
            href="/dashboard.html"
            onClick={(e) => handleViewClick(e, 'dashboard')}
            style={{ color: 'var(--cyan)', fontWeight: 700 }}
          >
            📊 Dashboard de Analítica
          </a>
        </div>
      </header>
    </>
  );
}
