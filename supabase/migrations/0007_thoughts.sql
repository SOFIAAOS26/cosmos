-- ============================================================================
-- COSMOS — 0007 "Pensando en ti" (Hito 8 · Sprint B)
-- A tiny pulse one sends the other: "I'm thinking of you right now." Thoughts
-- are immutable (no edit/delete). A "sincronía" — both thinking within 30 min —
-- is derived on the client from these rows; nothing extra is stored for it.
-- ============================================================================

create table if not exists public.thoughts (
  id         uuid primary key default gen_random_uuid(),
  cosmos_id  uuid not null references public.cosmos(id) on delete cascade,
  author_id  uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists idx_thoughts_cosmos on public.thoughts(cosmos_id, created_at desc);

alter table public.thoughts enable row level security;

create policy "thoughts: read" on public.thoughts
  for select using (public.is_cosmos_member(cosmos_id));
create policy "thoughts: write" on public.thoughts
  for insert with check (public.is_cosmos_member(cosmos_id) and author_id = auth.uid());
-- No update/delete policies on purpose: a sent thought can't be taken back.

-- Realtime so the other's pulse arrives live. Guarded: ignore if the table is
-- already published or the publication is FOR ALL TABLES.
do $$
begin
  alter publication supabase_realtime add table public.thoughts;
exception when others then null;
end $$;
