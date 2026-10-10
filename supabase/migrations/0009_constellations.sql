-- ============================================================================
-- COSMOS — 0009 "Constelaciones" (Hito 8 · Sprint D — Observatorio vivo)
-- The living sky derives a star from each interaction (memories, papelitos,
-- comets, adventures, notes, sincronías) on the client — nothing is stored for
-- those. What IS stored is the lines the two of you draw between stars and the
-- name you give them. `stars` is an ordered array of star keys ("kind:id").
-- ============================================================================

create table if not exists public.constellations (
  id         uuid primary key default gen_random_uuid(),
  cosmos_id  uuid not null references public.cosmos(id) on delete cascade,
  author_id  uuid not null references public.profiles(id) on delete cascade,
  name       text not null,
  stars      jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_constellations_cosmos on public.constellations(cosmos_id, created_at);
create trigger trg_constellations_updated before update on public.constellations
  for each row execute function public.set_updated_at();

alter table public.constellations enable row level security;

create policy "constellations: read" on public.constellations
  for select using (public.is_cosmos_member(cosmos_id));
create policy "constellations: write" on public.constellations
  for insert with check (public.is_cosmos_member(cosmos_id) and author_id = auth.uid());
create policy "constellations: update" on public.constellations
  for update using (public.is_cosmos_member(cosmos_id)) with check (public.is_cosmos_member(cosmos_id));
create policy "constellations: delete" on public.constellations
  for delete using (public.is_cosmos_member(cosmos_id) and author_id = auth.uid());

do $$
begin
  alter publication supabase_realtime add table public.constellations;
exception when others then null;
end $$;
