import React from 'react';

export function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <symbol id="lg" viewBox="0 0 64 64">
        <clipPath id="cl"><rect width="32" height="64" /></clipPath>
        <clipPath id="cr"><rect x="32" width="32" height="64" /></clipPath>
        <g fill="none" strokeWidth="7" strokeDasharray="8.8 8.8">
          <circle cx="32" cy="32" r="28" stroke="#1b6fd1" clipPath="url(#cl)" />
          <circle cx="32" cy="32" r="28" stroke="#f47a20" clipPath="url(#cr)" />
        </g>
        <circle cx="32" cy="32" r="25" fill="#fff" />
        <path d="M32 32V9a23 23 0 00-23 23z" fill="#1b6fd1" />
        <path d="M32 32V9a23 23 0 0123 23z" fill="#f47a20" />
        <path d="M32 32H9a23 23 0 0023 23z" fill="#1b6fd1" />
        <path d="M32 32v23a23 23 0 0023-23z" fill="#f47a20" />
        <path d="M32 9v46M9 32h46" stroke="#fff" strokeWidth="2.5" />
        <g stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="none">
          <path d="M20.5 14.5v13M14 18.2l13 6.6M27 18.2l-13 6.6" />
          <path d="M38 40l11 11M49 40L38 51" />
        </g>
        <path
          d="M43.5 14c3.3 3.2 5 5.5 5 8.3a5 5 0 01-10 0c0-1.6.8-3 1.8-4 .2 1.2.9 1.8 1.6 1.8 0-2 .3-3.8 1.6-6.1z"
          fill="#fff"
        />
        <path
          d="M20.5 36c3.5 4 5.2 6.5 5.2 8.7a5.2 5.2 0 01-10.4 0c0-2.2 1.7-4.7 5.2-8.7z"
          fill="#fff"
        />
      </symbol>
      <symbol id="wa" viewBox="0 0 32 32">
        <path d="M16 3a13 13 0 00-11 19.8L3 29l6.4-1.9A13 13 0 1016 3z" />
        <path
          fill="#25d366"
          d="M12 9.5c-.7.7-1 1.8-.4 3.2 1.1 2.6 3.5 5 6.2 6.2 1.5.6 2.6.3 3.3-.4l.5-.9-2.5-1.5-1.1 1c-1.3-.6-2.9-2.1-3.5-3.5l1-1.1-1.5-2.5z"
        />
      </symbol>
    </svg>
  );
}

export function BrandLogo({ onClick, showTagline = true }) {
  return (
    <a
      className="logo"
      href="#inicio"
      onClick={onClick}
      aria-label="Refrimathy, inicio"
    >
      <svg aria-hidden="true">
        <use href="#lg" />
      </svg>
      <span>
        refrim<i>athy</i>
        {showTagline && <small>Servicio técnico · Bogotá</small>}
      </span>
    </a>
  );
}
