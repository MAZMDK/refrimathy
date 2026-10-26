import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import App, { resolveViewFromLocation } from './App';
import '../analytics-tracker.js';

describe('Refrimathy React + Vite Comprehensive Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.pushState({}, '', '/');
    window.open = vi.fn();
  });

  it('renderiza la página principal con Hero, Quiénes Somos, Servicios, Cobertura, FAQ y Contacto', () => {
    render(<App initialPage="home" />);

    expect(screen.getByText(/Si tu equipo falla/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Más que técnicos: somos aliados del bienestar de tu hogar y negocio en Bogotá/i
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/Nuestra Misión/i)).toBeInTheDocument();
    expect(screen.getByText(/Nuestro Compromiso y Visión/i)).toBeInTheDocument();

    expect(screen.getAllByText('Refrigeración comercial').length).toBeGreaterThan(0);
    const filterCocina = screen.getByRole('tab', { name: /Estufas y Calentadores/i });
    fireEvent.click(filterCocina);
    expect(screen.getAllByText('Estufas').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Calentadores').length).toBeGreaterThan(0);

    const searchInput = screen.getByPlaceholderText(/Buscar localidad o zona/i);
    fireEvent.change(searchInput, { target: { value: 'Chapinero' } });
    expect(screen.getAllByText(/Chapinero/i).length).toBeGreaterThan(0);

    expect(screen.getByText(/Agendar visita técnica rápida/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Equipo a revisar/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Localidad \/ Barrio en Bogotá/i)).toBeInTheDocument();
  });

  it('valida la Cláusula de Privacidad en el formulario de contacto y registra conversión en WhatsApp', () => {
    render(<App initialPage="home" />);

    // Preseleccionar servicio desde tarjeta
    const agendarBtns = screen.getAllByRole('button', { name: /Agendar aquí/i });
    fireEvent.click(agendarBtns[1]); // Lavadoras
    const selectEquipo = screen.getByLabelText(/Equipo a revisar/i);
    expect(selectEquipo.value).toBe('Lavadoras');

    // Desmarcar privacidad debe bloquear el envío y mostrar aviso
    const privacyCheckbox = screen.getByRole('checkbox');
    fireEvent.click(privacyCheckbox);
    expect(privacyCheckbox.checked).toBe(false);

    const submitWaBtn = screen.getByRole('button', { name: /Enviar por WhatsApp/i });
    fireEvent.click(submitWaBtn);
    expect(
      screen.getByText(/Por favor acepta la Cláusula de Privacidad/i)
    ).toBeInTheDocument();
    expect(window.open).not.toHaveBeenCalled();

    // Volver a marcar privacidad y enviar
    fireEvent.click(privacyCheckbox);
    fireEvent.change(screen.getByLabelText(/Tu nombre/i), {
      target: { value: 'María Rodríguez' }
    });
    fireEvent.change(screen.getByLabelText(/¿Qué falla presenta el equipo\?/i), {
      target: { value: 'No centrifuga' }
    });
    fireEvent.click(submitWaBtn);

    expect(window.open).toHaveBeenCalledTimes(1);
    expect(window.open.mock.calls[0][0]).toContain('wa.me/573112955131');
    expect(
      screen.getByText(/Redirigiendo a WhatsApp con los datos de tu equipo/i)
    ).toBeInTheDocument();
  });

  it('muestra y gestiona correctamente el Banner y el Modal de Configuración de Cookies', () => {
    render(<App initialPage="home" />);

    expect(screen.getByText(/Uso de Cookies y Privacidad en Refrimathy/i)).toBeInTheDocument();

    // Abrir modal de configuración
    fireEvent.click(screen.getByRole('button', { name: /^Configurar$/i }));
    expect(screen.getByText(/Configurar Preferencias de Cookies/i)).toBeInTheDocument();

    // Guardar preferencias personalizadas
    fireEvent.click(screen.getByRole('button', { name: /Guardar mis preferencias/i }));
    const saved = JSON.parse(localStorage.getItem('refrimathy_cookie_consent_v1'));
    expect(saved).toBeTruthy();
    expect(saved.status).toBe('custom');
  });

  it('navega y renderiza la Cláusula de Privacidad (Ley 1581 de 2012) completa', () => {
    render(<App initialPage="privacidad" />);

    expect(
      screen.getByText(/Cláusula de Privacidad y Tratamiento de Datos Personales/i)
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/1\. Identificación del Responsable del Tratamiento/i).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/4\. Derechos de los Titulares \(Habeas Data \/ Derechos ARCO\)/i).length
    ).toBeGreaterThan(0);
  });

  it('navega y renderiza la Política de Cookies con tabla técnica y controles interactivos', () => {
    render(<App initialPage="cookies" />);

    expect(
      screen.getByText(/Política de Cookies y Almacenamiento Local/i)
    ).toBeInTheDocument();
    expect(screen.getByText('refrimathy_cookie_consent_v1')).toBeInTheDocument();
    expect(screen.getByText('refrimathy_db_sessions_v1')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Dejar solo las necesarias/i }));
    expect(
      screen.getByText(/Tus preferencias de cookies han sido actualizadas/i)
    ).toBeInTheDocument();
  });

  it('muestra la página de error 404, permite pausar/reanudar y redirige automáticamente al inicio', () => {
    vi.useFakeTimers();
    window.history.pushState({}, '', '/ruta-inexistente-prueba');
    expect(resolveViewFromLocation(window.location.pathname, 'home')).toBe('404');

    render(<App initialPage="404" />);
    expect(
      screen.getByText(/Esta página se descongeló o cambió de dirección/i)
    ).toBeInTheDocument();

    // Probar botón de pausa y reanudación
    const pauseBtn = screen.getByRole('button', { name: /Pausar/i });
    fireEvent.click(pauseBtn);
    expect(
      screen.getByText(/Redireccionamiento automático en pausa/i)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Reanudar/i }));

    for (let i = 0; i < 10; i++) {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }

    expect(screen.getByText(/Si tu equipo falla/i)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('renderiza todas las 5 pestañas del Dashboard, simula visitas y abre el modal de recorrido', () => {
    window.history.pushState({}, '', '/dashboard.html');
    render(<App initialPage="dashboard" />);

    expect(screen.getByText('PERSONAS QUE ENTRARON')).toBeInTheDocument();
    expect(
      screen.getByText(/Canales Oficiales de Contacto & Agendamiento/i)
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/Quiénes Somos \(Historia y Valores\)/i).length
    ).toBeGreaterThan(0);

    // Simular visita real
    fireEvent.click(screen.getByRole('button', { name: /\+ Simular Visita Real/i }));

    // Pestaña 2: Centro de Contacto Rápido
    fireEvent.click(screen.getByRole('button', { name: /Centro de Contacto Rápido/i }));
    expect(
      screen.getByText(/Despacho y Respuesta Rápida por WhatsApp/i)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Enviar por WhatsApp/i }));
    expect(window.open).toHaveBeenCalled();

    // Pestaña 3: Base de Datos de Visitantes + Modal de recorrido
    fireEvent.click(screen.getByRole('button', { name: /Base de Datos de Visitantes/i }));
    const inspectBtns = screen.getAllByRole('button', { name: /Ver recorrido/i });
    expect(inspectBtns.length).toBeGreaterThan(0);
    fireEvent.click(inspectBtns[0]);
    expect(screen.getByText(/Ficha del Visitante/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Cerrar/i }));

    // Pestaña 4: Registro de Eventos
    fireEvent.click(screen.getByRole('button', { name: /Registro de Eventos/i }));
    expect(
      screen.getByText(/Tabla de Base de Datos: Eventos e Interacciones/i)
    ).toBeInTheDocument();

    // Pestaña 5: Conexión Cloud & Respaldos
    fireEvent.click(screen.getByRole('button', { name: /Conexión Cloud & Respaldos/i }));
    expect(
      screen.getByText(/Conexión a Base de Datos en la Nube \(Supabase\)/i)
    ).toBeInTheDocument();
  });
});
