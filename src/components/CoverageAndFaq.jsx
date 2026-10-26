import React, { useState } from 'react';
import { BOGOTA_LOCALIDADES, FAQS, BUSINESS_INFO, buildWhatsAppUrl } from '../data/siteData';

export default function CoverageAndFaq({ onSelectBarrioForForm }) {
  const [barrioQuery, setBarrioQuery] = useState('');

  const filteredLocalidades = BOGOTA_LOCALIDADES.filter((loc) => {
    const q = barrioQuery.toLowerCase().trim();
    if (!q) return true;
    return loc.name.toLowerCase().includes(q) || loc.zone.toLowerCase().includes(q);
  });

  const handleBarrioClick = (barrioName) => {
    if (onSelectBarrioForForm) {
      onSelectBarrioForForm(barrioName);
    }
    window.open(
      buildWhatsAppUrl(
        `Hola, ¿tienen cobertura de servicio técnico en ${barrioName}, Bogotá?`
      ),
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <>
      <section id="cobertura">
        <div className="wrap two">
          <div>
            <p className="kick">Cobertura</p>
            <h2>Atendemos en toda Bogotá D.C.</h2>
            <p className="sub" style={{ marginBottom: '22px' }}>
              Dinos tu barrio o localidad y el tipo de equipo, y te confirmamos disponibilidad de
              visita técnica el mismo día o al día siguiente.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a
                className="btn dark"
                href={buildWhatsAppUrl(
                  'Hola, ¿tienen cobertura en mi barrio de Bogotá?'
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                Confirmar mi barrio por WhatsApp
              </a>
              <a className="btn ghost" href="#contacto">
                Seleccionar en formulario ↓
              </a>
            </div>
          </div>

          <div>
            <div className="coverage-search">
              <input
                type="search"
                value={barrioQuery}
                onChange={(e) => setBarrioQuery(e.target.value)}
                placeholder="🔍 Buscar localidad o zona (ej. Suba, Usaquén, Chapinero, Norte...)"
                aria-label="Buscar localidad o barrio en Bogotá"
              />
            </div>
            <div className="chips">
              {filteredLocalidades.map((loc) => (
                <span
                  key={loc.name}
                  data-barrio-chip="true"
                  data-barrio-name={loc.name}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleBarrioClick(loc.name)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleBarrioClick(loc.name);
                    }
                  }}
                >
                  📍 {loc.name} <small>· {loc.zone}</small>
                </span>
              ))}
              {filteredLocalidades.length === 0 && (
                <p style={{ color: 'var(--mut)', fontSize: '14.5px' }}>
                  Cubrimos todos los barrios de Bogotá D.C. Haz clic en &ldquo;Confirmar mi barrio&rdquo;
                  para atención personalizada.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="preguntas" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="faq-grid-layout">
            <div className="faq-side-card rv">
              <span
                style={{
                  background: 'rgba(255,179,71,0.2)',
                  color: 'var(--sun)',
                  padding: '5px 12px',
                  borderRadius: '99px',
                  fontSize: '12.5px',
                  fontWeight: 700
                }}
              >
                RESPUESTA INMEDIATA
              </span>
              <h3>¿Tienes otra duda antes de agendar?</h3>
              <p>
                Nuestro equipo de coordinación en Bogotá te orienta sin compromiso sobre costos de
                revisión, disponibilidad de repuestos y tiempos de visita.
              </p>

              <div className="faq-side-features">
                <div>
                  <span>⚡</span>
                  <span>Respuesta promedio por WhatsApp en menos de 10 minutos</span>
                </div>
                <div>
                  <span>🛡️</span>
                  <span>Presupuesto claro antes de intervenir tu electrodoméstico</span>
                </div>
                <div>
                  <span>🏠</span>
                  <span>Atención a hogares, oficinas, restaurantes y comercios</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <a
                  className="btn wa sm"
                  href={buildWhatsAppUrl('Hola, tengo una consulta sobre un servicio técnico en Bogotá.')}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Preguntar por WhatsApp
                </a>
                <a
                  className="btn sm"
                  style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}
                  href={BUSINESS_INFO.phoneHref}
                >
                  Llamar: {BUSINESS_INFO.phoneDisplay}
                </a>
              </div>
            </div>

            <div>
              <p className="kick">Preguntas frecuentes</p>
              <h2 style={{ marginBottom: '22px' }}>Todo claro antes de agendar.</h2>
              <div className="faq">
                {FAQS.map((item, idx) => (
                  <details key={idx} open={idx === 0}>
                    <summary data-faq-question={item.q}>{item.q}</summary>
                    <p>{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
