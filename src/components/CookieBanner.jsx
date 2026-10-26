import React, { useState, useEffect } from 'react';

export default function CookieBanner({
  forceOpenPreferences,
  onClosePreferences,
  onNavigate
}) {
  const [visible, setVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [preferencesEnabled, setPreferencesEnabled] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('refrimathy_cookie_consent_v1');
      if (!saved) {
        setVisible(true);
      } else {
        const parsed = JSON.parse(saved);
        setAnalyticsEnabled(parsed.analytics !== false);
        setPreferencesEnabled(parsed.preferences !== false);
      }
    } catch (_) {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (forceOpenPreferences) {
      setShowModal(true);
    }
  }, [forceOpenPreferences]);

  const persistConsent = (status, analytics, preferences) => {
    const payload = {
      necessary: true,
      analytics,
      preferences,
      status,
      updatedAt: new Date().toISOString()
    };
    try {
      if (window.RefrimathyAnalytics && window.RefrimathyAnalytics.saveCookieConsent) {
        window.RefrimathyAnalytics.saveCookieConsent(payload);
      } else {
        localStorage.setItem('refrimathy_cookie_consent_v1', JSON.stringify(payload));
      }
    } catch (_) {}
    setVisible(false);
    setShowModal(false);
    if (onClosePreferences) onClosePreferences();
  };

  const handleAcceptAll = () => {
    setAnalyticsEnabled(true);
    setPreferencesEnabled(true);
    persistConsent('accepted_all', true, true);
  };

  const handleEssentialOnly = () => {
    setAnalyticsEnabled(false);
    setPreferencesEnabled(false);
    persistConsent('essential_only', false, false);
  };

  const handleSaveCustom = () => {
    persistConsent('custom', analyticsEnabled, preferencesEnabled);
  };

  return (
    <>
      {visible && !showModal && (
        <aside className="cookie-banner" role="region" aria-label="Aviso de política de cookies">
          <div className="cookie-banner-text">
            <h4>🍪 Uso de Cookies y Privacidad en Refrimathy</h4>
            <p>
              Utilizamos cookies propias técnicas y de analítica local para mejorar tu experiencia,
              recordar tus preferencias y conocer qué servicios técnicos son los más solicitados en
              Bogotá. Consulta nuestra{' '}
              <button
                type="button"
                className="cookie-inline-link"
                onClick={() => onNavigate('cookies')}
              >
                Política de Cookies
              </button>{' '}
              y la{' '}
              <button
                type="button"
                className="cookie-inline-link"
                onClick={() => onNavigate('privacidad')}
              >
                Cláusula de Privacidad
              </button>
              .
            </p>
          </div>

          <div className="cookie-banner-actions">
            <button type="button" className="cookie-btn accept" onClick={handleAcceptAll}>
              Aceptar todas
            </button>
            <button type="button" className="cookie-btn essential" onClick={handleEssentialOnly}>
              Solo necesarias
            </button>
            <button
              type="button"
              className="cookie-btn config"
              onClick={() => setShowModal(true)}
            >
              Configurar
            </button>
          </div>
        </aside>
      )}

      {showModal && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target.classList.contains('modal-backdrop')) {
              setShowModal(false);
              if (onClosePreferences) onClosePreferences();
            }
          }}
        >
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="cookieModalTitle">
            <div className="modal-head">
              <div>
                <h3 id="cookieModalTitle" style={{ fontSize: '21px' }}>
                  🍪 Configurar Preferencias de Cookies
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--mut)' }}>
                  Elige qué categorías de cookies y almacenamiento local autorizas en este navegador.
                </p>
              </div>
              <button
                type="button"
                className="close-btn"
                aria-label="Cerrar preferencias de cookies"
                onClick={() => {
                  setShowModal(false);
                  if (onClosePreferences) onClosePreferences();
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gap: '14px', marginBottom: '22px' }}>
              <div
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  border: '1px solid var(--line)',
                  background: 'var(--paper)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px'
                }}
              >
                <div>
                  <b>Cookies Técnicas y Estrictamente Necesarias</b>
                  <p style={{ fontSize: '13px', color: 'var(--mut)', marginTop: '3px' }}>
                    Indispensables para la navegación, seguridad del sitio y almacenamiento de tu
                    decisión sobre privacidad.
                  </p>
                </div>
                <span className="pill wa">Siempre activas</span>
              </div>

              <label
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  border: '1px solid var(--line)',
                  background: '#fff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px',
                  cursor: 'pointer'
                }}
              >
                <div>
                  <b>Cookies de Analítica y Estadísticas de Servicio</b>
                  <p style={{ fontSize: '13px', color: 'var(--mut)', marginTop: '3px' }}>
                    Nos ayudan a medir qué secciones, equipos (neveras, lavadoras, etc.) y barrios
                    de Bogotá se consultan más.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--cyan)' }}
                />
              </label>

              <label
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  border: '1px solid var(--line)',
                  background: '#fff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px',
                  cursor: 'pointer'
                }}
              >
                <div>
                  <b>Cookies de Preferencias y Funcionalidad</b>
                  <p style={{ fontSize: '13px', color: 'var(--mut)', marginTop: '3px' }}>
                    Permiten recordar el equipo o localidad seleccionada para agilizar tu contacto
                    por WhatsApp.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferencesEnabled}
                  onChange={(e) => setPreferencesEnabled(e.target.checked)}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--cyan)' }}
                />
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <button type="button" className="btn ghost sm" onClick={handleEssentialOnly}>
                Rechazar opcionales
              </button>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="btn navy sm" onClick={handleSaveCustom}>
                  Guardar mis preferencias
                </button>
                <button type="button" className="btn wa sm" onClick={handleAcceptAll}>
                  Aceptar todas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
