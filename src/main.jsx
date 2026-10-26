import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';

const rootEl = document.getElementById('root');
if (rootEl) {
  const initialPage = rootEl.getAttribute('data-page') || 'home';
  createRoot(rootEl).render(
    <React.StrictMode>
      <App initialPage={initialPage} />
    </React.StrictMode>
  );
}
