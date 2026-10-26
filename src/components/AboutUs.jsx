import React from 'react';
import { ABOUT_DATA, buildWhatsAppUrl } from '../data/siteData';

export default function AboutUs() {
  return (
    <section id="quienes-somos" className="about-section">
      <div className="wrap">
        <div className="about-top-grid">
          <div className="about-story rv">
            <p className="kick">{ABOUT_DATA.kicker}</p>
            <h2>{ABOUT_DATA.title}</h2>
            <p className="sub" style={{ marginBottom: '18px', fontWeight: 500, color: 'var(--ink)' }}>
              {ABOUT_DATA.lead}
            </p>
            {ABOUT_DATA.storyParagraphs.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}

            <div className="about-mission-grid">
              <div className="mission-card">
                <h3>🎯 {ABOUT_DATA.mission.title}</h3>
                <p>{ABOUT_DATA.mission.text}</p>
              </div>
              <div className="mission-card hot-border">
                <h3>🚀 {ABOUT_DATA.vision.title}</h3>
                <p>{ABOUT_DATA.vision.text}</p>
              </div>
            </div>
          </div>

          <div className="about-stats-panel rv">
            <div className="about-stats-header">
              <span>RESPALDO TÉCNICO EN BOGOTÁ</span>
              <h3>Nuestra trayectoria en números reales</h3>
              <p style={{ color: '#c5d8f0', fontSize: '14.5px', marginTop: '6px' }}>
                Cada visita representa una familia o un comercio bogotano que vuelve a tener sus
                equipos funcionando al 100%.
              </p>
            </div>

            <div className="about-stats-grid">
              {ABOUT_DATA.stats.map((st, idx) => (
                <div className="about-stat-box" key={idx}>
                  <strong>{st.value}</strong>
                  <b>{st.label}</b>
                  <small>{st.sub}</small>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: '22px',
                paddingTop: '18px',
                borderTop: '1px solid rgba(255,255,255,0.16)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap'
              }}
            >
              <span style={{ fontSize: '13.5px', color: '#dbeafe' }}>
                ✓ Atención directa sin intermediarios
              </span>
              <a
                className="btn wa sm"
                href={buildWhatsAppUrl(
                  'Hola equipo Refrimathy, vi su sección Quiénes Somos y deseo agendar una revisión técnica en Bogotá.'
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                Hablar con coordinación →
              </a>
            </div>
          </div>
        </div>

        <div className="about-values-grid">
          {ABOUT_DATA.values.map((val, idx) => (
            <article className="value-card rv" key={idx}>
              <div className="value-icon" aria-hidden="true">
                {val.icon}
              </div>
              <h3>{val.title}</h3>
              <p>{val.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
