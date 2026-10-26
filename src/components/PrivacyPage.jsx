import React, { useState } from 'react';
import { BUSINESS_INFO, PRIVACY_CLAUSES, buildWhatsAppUrl } from '../data/siteData';

export default function PrivacyPage({ onNavigate }) {
  const [holderName, setHolderName] = useState('');
  const [requestType, setRequestType] = useState('Consulta de datos personales');
  const [details, setDetails] = useState('');

  const handleSendArcoRequest = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Solicitud Habeas Data (${requestType}) - Refrimathy`);
    const body = encodeURIComponent(
      `Solicitud de Protección de Datos Personales (Ley 1581 de 2012)\n\nTitular: ${holderName || 'No especificado'}\nTipo de solicitud: ${requestType}\nDetalle: ${details || 'Solicito información sobre mis datos personales.'}`
    );
    window.location.href = `mailto:${BUSINESS_INFO.email}?subject=${subject}&body=${body}`;
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
            LEY 1581 DE 2012 · HABEAS DATA COLOMBIA
          </span>
          <h1>Cláusula de Privacidad y Tratamiento de Datos Personales</h1>
          <p>
            En Refrimathy protegemos tu información personal con total transparencia y responsabilidad
            legal en cada visita técnica a domicilio en Bogotá D.C.
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
              onClick={() => onNavigate('cookies')}
            >
              Ver Política de Cookies →
            </button>
          </div>
        </div>

        <div className="legal-layout">
          <aside className="legal-sidebar">
            <h3>Contenido de la Cláusula</h3>
            <ul>
              {PRIVACY_CLAUSES.map((clause) => (
                <li key={clause.id}>
                  <a href={`#${clause.id}`}>{clause.title}</a>
                </li>
              ))}
              <li>
                <a href="#ejercer-derechos">7. Formulario Habeas Data (ARCO)</a>
              </li>
            </ul>

            <hr style={{ border: 'none', borderTop: '1px solid var(--line)', margin: '18px 0' }} />
            <div style={{ fontSize: '13px', color: 'var(--mut)' }}>
              <b style={{ color: 'var(--ink)', display: 'block', marginBottom: '4px' }}>
                Responsable Legal:
              </b>
              Refrimathy Bogotá D.C.
              <br />
              Tel: {BUSINESS_INFO.phoneDisplay}
              <br />
              Email: {BUSINESS_INFO.email}
            </div>
          </aside>

          <div className="legal-content">
            {PRIVACY_CLAUSES.map((clause) => (
              <article className="legal-block" id={clause.id} key={clause.id}>
                <h2>{clause.title}</h2>
                {clause.content.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </article>
            ))}

            <article className="legal-block" id="ejercer-derechos">
              <h2>7. Canal Directo para Ejercer tus Derechos (ARCO / Habeas Data)</h2>
              <p>
                Si deseas conocer, actualizar, rectificar o solicitar la supresión de tus datos de
                nuestros registros de coordinación técnica, completa este formulario rápido o
                escríbenos a <b>{BUSINESS_INFO.email}</b>:
              </p>

              <form onSubmit={handleSendArcoRequest} style={{ marginTop: '16px' }}>
                <div className="form-grid-2">
                  <div className="field-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="arcoName">Nombre completo del Titular</label>
                    <input
                      id="arcoName"
                      type="text"
                      required
                      placeholder="Tu nombre y apellido"
                      value={holderName}
                      onChange={(e) => setHolderName(e.target.value)}
                    />
                  </div>
                  <div className="field-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="arcoType">Tipo de solicitud</label>
                    <select
                      id="arcoType"
                      value={requestType}
                      onChange={(e) => setRequestType(e.target.value)}
                    >
                      <option value="Consulta de datos personales">
                        Conocer / Consultar mis datos
                      </option>
                      <option value="Actualización o rectificación">
                        Actualizar o rectificar datos
                      </option>
                      <option value="Supresión o revocatoria de autorización">
                        Suprimir datos / Revocar autorización
                      </option>
                    </select>
                  </div>
                </div>

                <div className="field-group">
                  <label htmlFor="arcoDetails">Descripción de tu solicitud</label>
                  <textarea
                    id="arcoDetails"
                    rows="3"
                    placeholder="Indica el número telefónico o correo con el que agendaste tu servicio técnico..."
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button type="submit" className="btn navy sm">
                    Enviar solicitud por Correo Oficial
                  </button>
                  <a
                    className="btn wa sm"
                    href={buildWhatsAppUrl(
                      `Hola Refrimathy, deseo realizar una solicitud de Habeas Data (${requestType}).`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Solicitar por WhatsApp
                  </a>
                </div>
              </form>
            </article>
          </div>
        </div>
      </div>
    </main>
  );
}
