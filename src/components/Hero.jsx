import React, { useEffect, useState } from 'react';
import { BUSINESS_INFO, BRANDS, buildWhatsAppUrl } from '../data/siteData';

export default function Hero({ onQuickSchedule }) {
  const [temperature, setTemperature] = useState(25);
  const [cooledOk, setCooledOk] = useState(false);
  const [yearsCount, setYearsCount] = useState(0);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setTemperature(4);
      setCooledOk(true);
      setYearsCount(7);
      return;
    }

    let startTs = null;
    let rafId = null;
    const duration = 3400;

    function step(ts) {
      if (!startTs) startTs = ts;
      const progress = Math.min((ts - startTs) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentTemp = Math.round(25 - 21 * eased);
      setTemperature(currentTemp);
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        setCooledOk(true);
      }
    }
    rafId = requestAnimationFrame(step);

    let currentYear = 0;
    const yearInterval = setInterval(() => {
      currentYear += 1;
      setYearsCount(currentYear);
      if (currentYear >= 7) {
        clearInterval(yearInterval);
      }
    }, 120);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      clearInterval(yearInterval);
    };
  }, []);

  const barScale = Math.max(0.16, (temperature - 1) / 25);

  return (
    <>
      <div className="hero">
        <div className="wrap">
          <div className="page-transition">
            <span className="badge">
              <i className="dot" aria-hidden="true"></i> Técnicos disponibles hoy en Bogotá
            </span>
            <h1>
              Si tu equipo falla, <span className="cold">nosotros llegamos.</span>
            </h1>
            <p className="lead">
              Reparamos neveras, lavadoras, estufas, calentadores y aire acondicionado en tu casa o
              negocio. Te explicamos la falla antes de tocar nada, y tú decides.
            </p>
            <div className="cta">
              <a
                className="btn wa"
                href={buildWhatsAppUrl(
                  'Hola, quiero cotizar un servicio técnico a domicilio en Bogotá.'
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg width="22" height="22" fill="currentColor" aria-hidden="true">
                  <use href="#wa" />
                </svg>{' '}
                Escribir por WhatsApp
              </a>
              <a className="btn ghost" href={BUSINESS_INFO.phoneHref}>
                Llamar ahora
              </a>
              <button
                type="button"
                className="btn navy sm"
                onClick={() => onQuickSchedule && onQuickSchedule()}
              >
                Agendar en línea ↓
              </button>
            </div>
            <div className="trust">
              <div>
                <b data-n="7">
                  {yearsCount}
                  {yearsCount >= 7 ? '+' : ''}
                </b>
                años de experiencia
              </div>
              <div>
                <b>Todas</b>las marcas
              </div>
              <div>
                <b>✓</b>servicio garantizado
              </div>
            </div>
          </div>

          <div className="hp page-transition">
            <img
              src="https://images.pexels.com/photos/32391499/pexels-photo-32391499/free-photo-of-repair-technicians-fixing-industrial-freezer.jpeg?auto=compress&cs=tinysrgb&w=1400"
              width="850"
              height="1194"
              alt="Profesionales realizando una reparación de refrigeración en Bogotá"
            />
            <div className="mini" aria-label="Temperatura de nevera bajando a 4 grados">
              <div className="gh">
                <span>Nevera en revisión</span>
                <span>Bogotá D.C.</span>
              </div>
              <div className="temp">
                <span id="t">{temperature}</span>
                <sup>°C</sup>
              </div>
              <div className="bar">
                <i style={{ transform: `scaleX(${barScale.toFixed(2)})` }}></i>
              </div>
              <div className="gstat">
                <span
                  className="ok"
                  style={{ opacity: cooledOk ? 1 : 0.45, transition: 'opacity 0.4s' }}
                >
                  {cooledOk ? '✓ Enfriando en rango óptimo' : '❄️ Calibrando termostato...'}
                </span>
              </div>
            </div>
            <div className="chip">Servicio garantizado</div>
          </div>
        </div>
      </div>

      <div className="brands" aria-label="Marcas que reparamos">
        <div className="track" id="tr">
          {[...BRANDS, ...BRANDS].map((brand, idx) => (
            <span key={`${brand}-${idx}`}>{brand}</span>
          ))}
        </div>
      </div>
    </>
  );
}
