import React, { useState, useEffect } from 'react';
import { COOKIE_TABLE } from '../data/siteData';

export default function CookiesPage({ onNavigate, onOpenCookiePreferences }) {
  const [consentState, setConsentState] = useState({
    necessary: true,
    analytics: true,
    preferences: true,
    status: 'accepted_all'
  });
  const [savedNotice, setSavedNotice] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('refrimathy_cookie_consent_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        setConsentState({
          necessary: true,
          analytics: parsed.analytics !== false,
          preferences: parsed.preferences !== false,
          status: parsed.status || 'custom'
        });
      }
    } catch (_) {}
  }, []);

  const handleSave = (analytics, preferences, statusLabel) => {
    const next = {
      necessary: true,
      analytics,
      preferences,
      status: statusLabel,
      updatedAt: new Date().toISOString()
    };
    setConsentState(next);
    try {
      if (window.RefrimathyAnalytics && window.RefrimathyAnalytics.saveCookieConsent) {
        window.RefrimathyAnalytics.saveCookieConsent(next);
      } else {
        localStorage.setItem('refrimathy_cookie_consent_v1', JSON.stringify(next));
      }
    } catch (_) {}
    setSavedNotice('✓ Tus preferencias de cookies han sido actualizadas correctamente.');
    setTimeout(() => setSavedNotice(''), 4000);
  };

  return (
    <main className="legal-page page-transition">
      <div className="wrap">
        <div className="legal-header-card">
          <span
            style={{
              background: 'rgba(255,179,71,0.2)',
              color: 'var(--sun)',
              padding: '5px 14px',
              borderRadius: '99px',
              fontSize: '12.5px',
              fontWeight: 700
            }}
          >
            TRANSPARENCIA DIGITAL · REFRIMATHY
          </span>
          <h1>Política de Cookies y Almacenamiento Local</h1>
          <p>
            Conoce qué tecnologías de almacenamiento utilizamos en nuestro sitio web para ofrecerte
            una experiencia rápida, segura y adaptada a tus necesidades en Bogotá.
          </p>
          <div style={{ marginTop: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn wa sm"
              onClick={() => onNavigate('home', '#inicio')}
            >
              ← Volver a la página principal
            </button>
            <button
              type="button"
              className="btn sm"
              style={{ background: 'rgba(255,255,255,0.14)', color: '#fff' }}
              onClick={() => onNavigate('privacidad')}
            >
              Ver Cláusula de Privacidad →
            </button>
          </div>
        </div>

        <div className="legal-layout">
          <aside className="legal-sidebar">
            <h3>Secciones de Cookies</h3>
            <ul>
              <li><a href="#que-son">1. ¿Qué son las cookies?</a></li>
              <li><a href="#tipos-cookies">2. Tipos de cookies que usamos</a></li>
              <li><a href="#tabla-cookies">3. Detalle técnico de almacenamiento</a></li>
              <li><a href="#gestionar-cookies">4. Panel de control de cookies</a></li>
            </ul>
            <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '18px 0' }} />
            <button
              type="button"
              className="btn navy sm"
              style={{ width: '100%' }}
              onClick={() => onOpenCookiePreferences && onOpenCookiePreferences()}
            >
              🍪 Abrir modal de cookies
            </button>
          </aside>

          <div className="legal-content">
            <article className="legal-block" id="que-son">
              <h2>1. ¿Qué son las cookies y el almacenamiento local?</h2>
              <p>
                Las cookies y el almacenamiento local (<code>localStorage</code>) son pequeños
                registros de texto que tu navegador guarda en tu dispositivo (celular, tablet o
                computador) cuando visitas el sitio web de <b>Refrimathy</b>.
              </p>
              <p>
                Estos archivos no contienen virus ni extraen información privada de tu teléfono; su
                única función es recordar tus preferencias de privacidad y generar estadísticas
                anónimas sobre el funcionamiento de nuestra página.
              </p>
            </article>

            <article className="legal-block" id="tipos-cookies">
              <h2>2. Tipos de cookies utilizadas en Refrimathy</h2>
              <p>
                <b>• Cookies Técnicas o Estrictamente Necesarias:</b> Permiten que la página cargue
                correctamente, que puedas navegar entre secciones y que se guarde tu aceptación o
                rechazo del aviso de cookies.
              </p>
              <p>
                <b>• Cookies de Analítica y Desempeño Propio:</b> Nos permiten contabilizar cuántas
                personas visitan el sitio, qué servicios (neveras, lavadoras, estufas, calentadores,
                aire acondicionado) generan mayor interés y qué localidades de Bogotá demandan más
                visitas técnicas.
              </p>
              <p>
                <b>• Cookies de Preferencias:</b> Recuerdan temporalmente el equipo o barrio que
                seleccionaste para pre-llenar tu solicitud de contacto sin que tengas que escribirlo
                dos veces.
              </p>
            </article>

            <article className="legal-block" id="tabla-cookies">
              <h2>3. Tabla detallada de identificadores utilizados</h2>
              <div className="table-wrap" style={{ marginTop: '14px' }}>
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Identificador / Clave</th>
                      <th>Categoría</th>
                      <th>Duración</th>
                      <th>Finalidad específica</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COOKIE_TABLE.map((item) => (
                      <tr key={item.name}>
                        <td className="mono"><b>{item.name}</b></td>
                        <td><span className="pill blue">{item.type}</span></td>
                        <td>{item.duration}</td>
                        <td>{item.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="legal-block" id="gestionar-cookies">
              <h2>4. Gestionar tus preferencias de cookies ahora mismo</h2>
              <p>
                Puedes activar o desactivar las categorías opcionales en cualquier momento desde este
                panel interactivo:
              </p>

              <div style={{ display: 'grid', gap: '12px', margin: '18px 0' }}>
                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: '14px',
                    border: '1px solid var(--line)',
                    background: 'var(--paper)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <b>Cookies Técnicas Necesarias</b>
                    <div style={{ fontSize: '13px', color: 'var(--mut)' }}>
                      Requeridas para el funcionamiento básico del sitio web.
                    </div>
                  </div>
                  <span className="pill wa">Siempre Activas</span>
                </div>

                <label
                  style={{
                    padding: '14px 18px',
                    borderRadius: '14px',
                    border: '1px solid var(--line)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div>
                    <b>Analítica de Navegación y Estadísticas Locales</b>
                    <div style={{ fontSize: '13px', color: 'var(--mut)' }}>
                      Ayuda a medir el rendimiento de las secciones del sitio.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={consentState.analytics}
                    onChange={(e) =>
                      handleSave(e.target.checked, consentState.preferences, 'custom')
                    }
                    style={{ width: '20px', height: '20px', accentColor: 'var(--cyan)' }}
                  />
                </label>

                <label
                  style={{
                    padding: '14px 18px',
                    borderRadius: '14px',
                    border: '1px solid var(--line)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div>
                    <b>Preferencias de Agendamiento Rápido</b>
                    <div style={{ fontSize: '13px', color: 'var(--mut)' }}>
                      Recuerda selecciones de servicio y localidad en el formulario.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={consentState.preferences}
                    onChange={(e) =>
                      handleSave(consentState.analytics, e.target.checked, 'custom')
                    }
                    style={{ width: '20px', height: '20px', accentColor: 'var(--cyan)' }}
                  />
                </label>
              </div>

              {savedNotice && (
                <p style={{ color: '#15803d', fontWeight: 700, marginBottom: '12px' }}>
                  {savedNotice}
                </p>
              )}

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn wa sm"
                  onClick={() => handleSave(true, true, 'accepted_all')}
                >
                  Aceptar todas las cookies
                </button>
                <button
                  type="button"
                  className="btn ghost sm"
                  onClick={() => handleSave(false, false, 'essential_only')}
                >
                  Dejar solo las necesarias
                </button>
              </div>
            </article>
          </div>
        </div>
      </div>
    </main>
  );
}
