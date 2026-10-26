import React from 'react';
import { BUSINESS_INFO, buildWhatsAppUrl } from '../data/siteData';
import { BrandLogo } from './Icons';

export default function Footer({ onNavigate, onOpenCookiePreferences }) {
  const year = new Date().getFullYear();

  const handleSection = (e, hash) => {
    e.preventDefault();
    onNavigate('home', hash);
  };

  const handlePage = (e, view) => {
    e.preventDefault();
    onNavigate(view);
  };

  return (
    <footer className="site-footer">
      <div className="wrap fg">
        <div>
          <BrandLogo onClick={(e) => handleSection(e, '#inicio')} showTagline={false} />
          <p style={{ marginTop: '14px', maxWidth: '300px', fontSize: '14.5px' }}>
            Servicio técnico profesional a domicilio en Bogotá D.C. Más de 7 años cuidando los
            equipos de tu hogar y negocio con diagnóstico transparente.
          </p>
          <p style={{ marginTop: '10px', fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
            📍 {BUSINESS_INFO.city}
          </p>
        </div>

        <div>
          <h4>Navegación</h4>
          <a href="#quienes-somos" onClick={(e) => handleSection(e, '#quienes-somos')}>
            Quiénes somos
          </a>
          <a href="#servicios" onClick={(e) => handleSection(e, '#servicios')}>
            Servicios técnicos
          </a>
          <a href="#trabajo" onClick={(e) => handleSection(e, '#trabajo')}>
            Nuestro trabajo
          </a>
          <a href="#proceso" onClick={(e) => handleSection(e, '#proceso')}>
            Cómo trabajamos
          </a>
          <a href="#cobertura" onClick={(e) => handleSection(e, '#cobertura')}>
            Cobertura en Bogotá
          </a>
        </div>

        <div>
          <h4>Equipos que reparamos</h4>
          <a href="#servicios" onClick={(e) => handleSection(e, '#servicios')}>
            Neveras y nevecones
          </a>
          <a href="#servicios" onClick={(e) => handleSection(e, '#servicios')}>
            Lavadoras y secadoras
          </a>
          <a href="#servicios" onClick={(e) => handleSection(e, '#servicios')}>
            Estufas y calentadores
          </a>
          <a href="#servicios" onClick={(e) => handleSection(e, '#servicios')}>
            Aire acondicionado
          </a>
          <a href="#servicios" onClick={(e) => handleSection(e, '#servicios')}>
            Refrigeración comercial
          </a>
        </div>

        <div>
          <h4>Contacto y Legal</h4>
          <a
            href={buildWhatsAppUrl('Hola, quiero consultar un servicio técnico en Bogotá.')}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp: {BUSINESS_INFO.phoneDisplay}
          </a>
          <a href={BUSINESS_INFO.phoneHref}>Llamar al equipo</a>
          <a href={`mailto:${BUSINESS_INFO.email}`}>{BUSINESS_INFO.email}</a>
          <a href="/privacidad.html" onClick={(e) => handlePage(e, 'privacidad')}>
            🔒 Cláusula de Privacidad
          </a>
          <a href="/cookies.html" onClick={(e) => handlePage(e, 'cookies')}>
            🍪 Política de Cookies
          </a>
        </div>
      </div>

      <div className="wrap footer-bottom-bar">
        <p>
          © <span id="y">{year}</span> Refrimathy. Todos los derechos reservados. Atención sujeta a
          coordinación y disponibilidad en Bogotá D.C.
        </p>

        <div className="footer-legal-links">
          <a href="/privacidad.html" onClick={(e) => handlePage(e, 'privacidad')}>
            Cláusula de Privacidad
          </a>
          <a href="/cookies.html" onClick={(e) => handlePage(e, 'cookies')}>
            Política de Cookies
          </a>
          <button
            type="button"
            className="footer-link-btn"
            onClick={() => onOpenCookiePreferences && onOpenCookiePreferences()}
          >
            Configurar Cookies
          </button>
          <a href="/404.html" onClick={(e) => handlePage(e, '404')}>
            Vista 404
          </a>
          <a
            href="/dashboard.html"
            onClick={(e) => handlePage(e, 'dashboard')}
            style={{ color: 'var(--cyan)' }}
          >
            📊 Panel de Estadísticas
          </a>
        </div>
      </div>
    </footer>
  );
}
