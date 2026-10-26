import React, { useState, useEffect } from 'react';
import {
  BUSINESS_INFO,
  SERVICES,
  BRANDS,
  BOGOTA_LOCALIDADES,
  buildWhatsAppUrl
} from '../data/siteData';

export default function ContactSection({
  preselectedService,
  preselectedBarrio,
  onNavigate
}) {
  const [nombre, setNombre] = useState('');
  const [equipo, setEquipo] = useState(SERVICES[0].name);
  const [marca, setMarca] = useState('Whirlpool');
  const [barrio, setBarrio] = useState('Suba');
  const [falla, setFalla] = useState('');
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    if (preselectedService) {
      setEquipo(preselectedService);
    }
  }, [preselectedService]);

  useEffect(() => {
    if (preselectedBarrio) {
      setBarrio(preselectedBarrio);
    }
  }, [preselectedBarrio]);

  const composeMessage = () => {
    const cleanName = nombre.trim() ? `Soy ${nombre.trim()}. ` : '';
    const cleanFalla = falla.trim()
      ? ` Detalle de la falla: ${falla.trim()}.`
      : '';
    return `Hola Refrimathy, ${cleanName}quiero agendar una visita técnica en Bogotá. Equipo: ${equipo} (${marca}). Barrio/Localidad: ${barrio}.${cleanFalla}`;
  };

  const handleWhatsAppSubmit = (e) => {
    e.preventDefault();
    if (!acceptedPrivacy) {
      setFeedbackMsg(
        'Por favor acepta la Cláusula de Privacidad y Tratamiento de Datos para continuar.'
      );
      return;
    }

    if (window.RefrimathyAnalytics && window.RefrimathyAnalytics.recordCustomConversion) {
      window.RefrimathyAnalytics.recordCustomConversion(
        'WhatsApp Formulario',
        `${equipo} (${barrio})`,
        equipo,
        barrio
      );
    }

    const msg = composeMessage();
    setFeedbackMsg('✓ Redirigiendo a WhatsApp con los datos de tu equipo...');
    window.open(buildWhatsAppUrl(msg), '_blank', 'noopener,noreferrer');
  };

  const handleEmailSubmit = () => {
    if (!acceptedPrivacy) {
      setFeedbackMsg(
        'Por favor acepta la Cláusula de Privacidad y Tratamiento de Datos para continuar.'
      );
      return;
    }

    if (window.RefrimathyAnalytics && window.RefrimathyAnalytics.recordCustomConversion) {
      window.RefrimathyAnalytics.recordCustomConversion(
        'Correo Formulario',
        `${equipo} (${barrio})`,
        equipo,
        barrio
      );
    }

    const subject = encodeURIComponent(`Solicitud de Visita Técnica - ${equipo} (${barrio})`);
    const body = encodeURIComponent(composeMessage());
    window.location.href = `mailto:${BUSINESS_INFO.email}?subject=${subject}&body=${body}`;
  };

  return (
    <section id="contacto" style={{ paddingTop: '10px', paddingBottom: '20px' }}>
      <div className="contact-hub final">
        <div className="wrap contact-hub-grid">
          <div className="contact-info-col">
            <div>
              <span
                style={{
                  display: 'inline-block',
                  background: 'rgba(255,179,71,0.2)',
                  color: 'var(--sun)',
                  padding: '5px 14px',
                  borderRadius: '99px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  marginBottom: '12px'
                }}
              >
                ATENCIÓN DIRECTA EN BOGOTÁ D.C.
              </span>
              <h2>¿Qué equipo necesita atención hoy?</h2>
              <p className="sub-light">
                Escríbenos directamente o completa los datos de tu equipo para asignarte el técnico
                especialista en tu zona sin tiempos de espera.
              </p>
            </div>

            <div className="contact-cards-grid">
              <a
                className="contact-channel-card"
                href={buildWhatsAppUrl(
                  'Hola, quiero agendar un servicio técnico a domicilio en Bogotá.'
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="ch-tag">💬 WhatsApp Inmediato</span>
                <strong>{BUSINESS_INFO.phoneDisplay}</strong>
                <small>Respuesta en menos de 10 min</small>
              </a>

              <a className="contact-channel-card" href={BUSINESS_INFO.phoneHref}>
                <span className="ch-tag">📞 Línea Telefónica</span>
                <strong>+57 {BUSINESS_INFO.phoneDisplay}</strong>
                <small>Coordinación directa de visitas</small>
              </a>

              <a
                className="contact-channel-card"
                href={`mailto:${BUSINESS_INFO.email}`}
              >
                <span className="ch-tag">✉️ Correo Electrónico</span>
                <strong style={{ fontSize: '14.5px' }}>{BUSINESS_INFO.email}</strong>
                <small>Cotizaciones empresas y comercios</small>
              </a>

              <div className="contact-channel-card">
                <span className="ch-tag">🕒 Horario de Servicio</span>
                <strong>Lun a Sáb: 7am – 7pm</strong>
                <small>Domingos y festivos: Urgencias</small>
              </div>
            </div>

            <div className="contact-trust-strip">
              <div>
                <b>100%</b>
                <span>A domicilio en Bogotá</span>
              </div>
              <div>
                <b>7+ Años</b>
                <span>Experiencia comprobada</span>
              </div>
              <div>
                <b>Garantía</b>
                <span>Respaldo por escrito</span>
              </div>
            </div>
          </div>

          <form className="contact-form-card" onSubmit={handleWhatsAppSubmit}>
            <div>
              <h3>Agendar visita técnica rápida</h3>
              <p>
                Selecciona tu equipo y localidad para enviar el diagnóstico inicial listo por
                WhatsApp o correo.
              </p>

              <div className="form-grid-2">
                <div className="field-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="contactNombre">Tu nombre (opcional)</label>
                  <input
                    id="contactNombre"
                    type="text"
                    placeholder="Ej. Carlos Gómez"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />
                </div>

                <div className="field-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="contactEquipo">Equipo a revisar</label>
                  <select
                    id="contactEquipo"
                    value={equipo}
                    onChange={(e) => setEquipo(e.target.value)}
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
                  <label htmlFor="contactMarca">Marca del equipo</label>
                  <select
                    id="contactMarca"
                    value={marca}
                    onChange={(e) => setMarca(e.target.value)}
                  >
                    {BRANDS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                    <option value="Otra marca">Otra marca</option>
                  </select>
                </div>

                <div className="field-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="contactBarrio">Localidad / Barrio en Bogotá</label>
                  <select
                    id="contactBarrio"
                    value={barrio}
                    onChange={(e) => setBarrio(e.target.value)}
                  >
                    {BOGOTA_LOCALIDADES.map((loc) => (
                      <option key={loc.name} value={loc.name}>
                        {loc.name} ({loc.zone})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="contactFalla">¿Qué falla presenta el equipo?</label>
                <textarea
                  id="contactFalla"
                  rows="2"
                  placeholder="Ej. La nevera prende pero no congela en la parte de arriba..."
                  value={falla}
                  onChange={(e) => setFalla(e.target.value)}
                />
              </div>

              <label className="privacy-check-row">
                <input
                  type="checkbox"
                  checked={acceptedPrivacy}
                  onChange={(e) => {
                    setAcceptedPrivacy(e.target.checked);
                    if (e.target.checked) setFeedbackMsg('');
                  }}
                />
                <span>
                  Autorizo el tratamiento de mis datos personales para coordinar la visita técnica
                  conforme a la{' '}
                  <button
                    type="button"
                    className="inline-link"
                    onClick={() => onNavigate && onNavigate('privacidad')}
                  >
                    Cláusula de Privacidad (Ley 1581 de 2012)
                  </button>{' '}
                  y la{' '}
                  <button
                    type="button"
                    className="inline-link"
                    onClick={() => onNavigate && onNavigate('cookies')}
                  >
                    Política de Cookies
                  </button>
                  .
                </span>
              </label>

              {feedbackMsg && (
                <p
                  style={{
                    fontSize: '13.5px',
                    fontWeight: 700,
                    color: acceptedPrivacy ? '#15803d' : '#dc2626',
                    marginBottom: '12px'
                  }}
                >
                  {feedbackMsg}
                </p>
              )}
            </div>

            <div className="contact-submit-row">
              <button type="submit" className="btn wa" style={{ width: '100%' }}>
                <svg width="20" height="20" fill="currentColor" aria-hidden="true">
                  <use href="#wa" />
                </svg>
                Enviar por WhatsApp
              </button>
              <button
                type="button"
                className="btn ghost"
                style={{ width: '100%' }}
                onClick={handleEmailSubmit}
              >
                Enviar por Correo
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
