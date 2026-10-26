-- =====================================================================
-- REFRIMATHY ANALYTICS & DATABASE SCHEMA (Supabase PostgreSQL)
-- Ejecuta este script en Supabase > SQL Editor > New query
-- =====================================================================

-- 1. Tabla de Sesiones (Visitantes, dispositivos, secciones vistas, tiempo, conversiones)
create table if not exists public.analytics_sessions (
  id text primary key,
  session_id text not null,
  visitor_id text not null,
  created_at timestamptz not null default now(),
  payload jsonb not null
);

-- 2. Tabla de Eventos (Clics en servicios, WhatsApp, llamadas, barrios, FAQ, scroll)
create table if not exists public.analytics_events (
  id text primary key,
  session_id text not null,
  visitor_id text not null,
  created_at timestamptz not null default now(),
  payload jsonb not null
);

-- Índices para consultas rápidas en el Dashboard
create index if not exists idx_analytics_sessions_created_at on public.analytics_sessions (created_at desc);
create index if not exists idx_analytics_sessions_visitor on public.analytics_sessions (visitor_id);
create index if not exists idx_analytics_events_created_at on public.analytics_events (created_at desc);
create index if not exists idx_analytics_events_session on public.analytics_events (session_id);

-- Habilitar Row Level Security (RLS)
alter table public.analytics_sessions enable row level security;
alter table public.analytics_events enable row level security;

-- Políticas para permitir que la página web registre visitas (anon insert/update) y el dashboard las consulte
create policy "Permitir insertar sesiones desde el sitio web"
on public.analytics_sessions for insert to anon, authenticated
with check (true);

create policy "Permitir actualizar sesiones activas desde el sitio web"
on public.analytics_sessions for update to anon, authenticated
using (true) with check (true);

create policy "Permitir leer sesiones en el dashboard"
on public.analytics_sessions for select to anon, authenticated
using (true);

create policy "Permitir insertar eventos desde el sitio web"
on public.analytics_events for insert to anon, authenticated
with check (true);

create policy "Permitir leer eventos en el dashboard"
on public.analytics_events for select to anon, authenticated
using (true);
