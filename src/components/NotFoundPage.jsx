import React, { useState, useEffect } from 'react';
import { buildWhatsAppUrl } from '../data/siteData';

export default function NotFoundPage({ onNavigate }) {
  const TOTAL_SECONDS = 10;
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (secondsLeft <= 0) {
      onNavigate('home', '#inicio');
      return;
    }
    const timer = setTimeout(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, paused, onNavigate]);

  const progressPct = Math.max(0, Math.round((secondsLeft / TOTAL_SECONDS) * 100));

  return (
    <main className="notfound-wrap page-transition">
      <div className="wrap" style={{ display: 'grid', placeItems: 'center' }}>
        <div className="notfound-card">
          <span className="badge" style={{ marginBottom: '12px' }}>
            <i className="dot" aria-hidden="true"></i> Diagnóstico del sistema: Ruta no encontrada
          </span>

          <div className="notfound-code" aria-label="Error 404">
            404
          </div>

          <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', margin: '8px 0 14px' }}>
            ¡Ups! Esta página se descongeló o cambió de dirección.
          </h1>
          <p style={{ color: 'var(--mut)', maxWidth: '540px', margin: '0 auto', fontSize: '16.5px' }}>
            El enlace que intentaste abrir no existe, pero nuestros técnicos en Bogotá siguen listos
            para atender tu nevera, lavadora, estufa, calentador o aire acondicionado.
          </p>

          <div className="redirect-box" role="status" aria-live="polite">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '10px',
                fontSize: '14px',
                fontWeight: 700
              }}
            >
              <span>
                {paused
                  ? '⏸️ Redireccionamiento automático en pausa'
                  : `🔄 Redirigiendo automáticamente al inicio en ${secondsLeft}s...`}
              </span>
              <button
                type="button"
                className="btn-sm"
                onClick={() => setPaused((p) => !p)}
              >
                {paused ? 'Reanudar' : 'Pausar'}
              </button>
            </div>
            <div className="redirect-progress">
              <div
                className="redirect-progress-bar"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              flexWrap: 'wrap',
              marginTop: '24px'
            }}
          >
            <button
              type="button"
              className="btn navy"
              onClick={() => onNavigate('home', '#inicio')}
            >
              Ir al Inicio ahora →
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={() => onNavigate('home', '#servicios')}
            >
              Ver Servicios Técnicos
            </button>
            <a
              className="btn wa"
              href={buildWhatsAppUrl(
                'Hola Refrimathy, entré al sitio web y quiero agendar un servicio técnico en Bogotá.'
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="20" height="20" fill="currentColor" aria-hidden="true">
                <use href="#wa" />
              </svg>
              Contactar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
