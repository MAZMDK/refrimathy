import React, { useState } from 'react';
import { SERVICES, buildWhatsAppUrl } from '../data/siteData';

const CATEGORIES = [
  { id: 'all', label: 'Todos los equipos' },
  { id: 'hogar', label: 'Neveras y Lavadoras' },
  { id: 'cocina', label: 'Estufas y Calentadores' },
  { id: 'climatizacion', label: 'Aire y Comercial' }
];

export default function ServicesSection({ onSelectServiceForForm }) {
  const [activeCat, setActiveCat] = useState('all');

  const filteredServices =
    activeCat === 'all'
      ? SERVICES
      : SERVICES.filter((s) => s.category === activeCat);

  return (
    <section id="servicios">
      <div className="wrap">
        <div className="section-head-flex">
          <div>
            <p className="kick">Servicios</p>
            <h2>Un técnico para cada equipo de tu casa o negocio.</h2>
            <p className="sub">
              Hogares y negocios en Bogotá. Cuéntanos la marca y la falla, y te orientamos de
              inmediato.
            </p>
          </div>

          <div className="filter-pills" role="tablist" aria-label="Filtrar servicios por categoría">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={activeCat === cat.id}
                className={`filter-pill ${activeCat === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCat(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid" id="sv">
          {filteredServices.map((srv) => (
            <div
              key={srv.id}
              className={`card rv in ${srv.featured ? 'feat' : ''}`}
              data-service-card="true"
              data-service-name={srv.name}
            >
              <div className="card-top">
                <div className="ico">
                  <svg
                    viewBox="0 0 24 24"
                    dangerouslySetInnerHTML={{ __html: srv.iconPaths }}
                    aria-hidden="true"
                  />
                </div>
                <span className="card-badge">{srv.badge}</span>
              </div>

              <h3>{srv.name}</h3>
              <p>{srv.desc}</p>

              <ul className="card-list">
                {srv.highlights.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>

              <div className="card-actions">
                <a
                  href={buildWhatsAppUrl(srv.waText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <em>Consultar por WhatsApp →</em>
                </a>
                <button
                  type="button"
                  className="card-quick-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectServiceForForm && onSelectServiceForForm(srv.name);
                  }}
                >
                  Agendar aquí
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
