import React from 'react';
import { WORK_GALLERY, PROCESS_STEPS, WHY_POINTS } from '../data/siteData';

export default function WorkAndProcess() {
  return (
    <>
      <section id="trabajo" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <p className="kick">Nuestro trabajo</p>
          <h2>Técnicos uniformados que llegan a tu casa.</h2>
          <p className="sub">
            Revisamos, explicamos y reparamos en tu hogar o negocio, con las herramientas y el
            equipo necesarios.
          </p>
          <div className="gal">
            {WORK_GALLERY.map((item, idx) => (
              <figure className="rv" key={idx}>
                <img
                  loading="lazy"
                  src={item.src}
                  width="850"
                  height="1090"
                  alt={item.alt}
                  style={{ objectPosition: item.pos }}
                />
                <figcaption>
                  {item.title}
                  <small>{item.subtitle}</small>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="proceso" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <p className="kick">Cómo trabajamos</p>
          <h2>Cuatro pasos, sin sorpresas.</h2>
          <p className="sub">
            Primero escuchamos, luego revisamos, y solo reparamos con tu aprobación.
          </p>
          <div className="steps">
            {PROCESS_STEPS.map((st) => (
              <div className="step rv" key={st.num}>
                <h3>{st.title}</h3>
                <p>{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="why">
        <div className="wrap two">
          <div>
            <p className="kick">Por qué Refrimathy</p>
            <h2>Más de 7 años cuidando equipos en Bogotá.</h2>
            <p className="sub" style={{ marginBottom: 0 }}>
              Trato directo desde el primer mensaje, diagnóstico claro y atención cercana para
              hogares y negocios.
            </p>
          </div>
          <div className="pts">
            {WHY_POINTS.map((pt, idx) => (
              <div className="pt" key={idx}>
                <i aria-hidden="true">✓</i>
                <div>
                  <b>{pt.title}</b>
                  <span>{pt.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
