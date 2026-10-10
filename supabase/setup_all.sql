
-- ============================================================
-- >>> migrations/0005_stickers.sql
-- ============================================================
-- ============================================================================
-- COSMOS — 0005 sticker library
-- A small global sticker set (§16). Stored as emoji tokens ("emoji:<char>") so
-- the MVP needs no image assets; swap `url` for real PNG paths later without any
-- schema change. Idempotent: only inserts stickers that aren't present yet.
-- ============================================================================

insert into public.stickers (name, url, is_global)
select v.name, v.url, true
from (values
  ('Corazón',    'emoji:❤️'),
  ('Destello',   'emoji:✨'),
  ('Estrella',   'emoji:⭐'),
  ('Luna',       'emoji:🌙'),
  ('Sol',        'emoji:☀️'),
  ('Fuego',      'emoji:🔥'),
  ('Ternura',    'emoji:🥹'),
  ('Cool',       'emoji:😎'),
  ('Fiesta',     'emoji:🎉'),
  ('Carta',      'emoji:💌'),
  ('Flor',       'emoji:🌸'),
  ('Brillo',     'emoji:🌟'),
  ('Café',       'emoji:☕'),
  ('Música',     'emoji:🎸'),
  ('Foto',       'emoji:📸'),
  ('Manos',      'emoji:🫶'),
  ('Cometa',     'emoji:💫'),
  ('Beso',       'emoji:😘')
) as v(name, url)
where not exists (
  select 1 from public.stickers s where s.is_global and s.url = v.url
);

-- ============================================================
-- >>> migrations/0006_memory_papers.sql
-- ============================================================
-- ============================================================================
-- COSMOS — 0006 "El Frasco de Nosotros" (memory jar)
-- Small folded papers a couple keeps in a jar to open later. Scoped per cosmos,
-- protected by RLS. Secret papers are visible only to their author & recipient.
-- `color` and `intention` are plain text (app-validated) so new kinds can be
-- added later without a migration (§11, §36).
-- ============================================================================

create table if not exists public.memory_papers (
  id             uuid primary key default gen_random_uuid(),
  cosmos_id      uuid not null references public.cosmos(id) on delete cascade,
  author_id      uuid not null references public.profiles(id) on delete cascade,
  recipient_id   uuid references public.profiles(id) on delete set null,
  message        text not null,
  image_url      text,                         -- storage path in the `photos` bucket
  color          text not null default 'cream',
  intention      text not null default 'anytime',
  is_secret      boolean not null default false,
  opened_count   int not null default 0,
  last_opened_at timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists idx_papers_cosmos on public.memory_papers(cosmos_id, created_at);
create trigger trg_papers_updated before update on public.memory_papers
  for each row execute function public.set_updated_at();

alter table public.memory_papers enable row level security;

-- Read: members of the cosmos, but a secret paper only for its author/recipient.
create policy "papers: read" on public.memory_papers
  for select using (
    public.is_cosmos_member(cosmos_id)
    and (is_secret = false or author_id = auth.uid() or recipient_id = auth.uid())
  );
create policy "papers: write" on public.memory_papers
  for insert with check (public.is_cosmos_member(cosmos_id) and author_id = auth.uid());
create policy "papers: update" on public.memory_papers
  for update using (public.is_cosmos_member(cosmos_id)) with check (public.is_cosmos_member(cosmos_id));
create policy "papers: delete" on public.memory_papers
  for delete using (public.is_cosmos_member(cosmos_id) and author_id = auth.uid());

-- Opening a paper bumps its counters (any member may open). SECURITY DEFINER so
-- the count updates atomically regardless of who opens it; still cosmos-gated.
create or replace function public.open_memory_paper(p_id uuid)
returns public.memory_papers
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.memory_papers;
  v_cosmos uuid;
begin
  select cosmos_id into v_cosmos from public.memory_papers where id = p_id;
  if v_cosmos is null then
    raise exception 'Papel no encontrado.' using errcode = 'no_data_found';
  end if;
  if not public.is_cosmos_member(v_cosmos) then
    raise exception 'No autorizado.' using errcode = 'insufficient_privilege';
  end if;

  update public.memory_papers
  set opened_count = opened_count + 1, last_opened_at = now()
  where id = p_id
  returning * into v_row;

  return v_row;
end $$;

grant execute on function public.open_memory_paper(uuid) to authenticated;

-- ============================================================
-- >>> migrations/0007_thoughts.sql
-- ============================================================
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
