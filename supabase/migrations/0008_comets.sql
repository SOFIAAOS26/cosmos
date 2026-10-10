-- ============================================================================
-- COSMOS — 0008 "Cometas" (Hito 8 · Sprint C)
-- A comet is a little message sent to the other with something attached — a
-- photo, a song or a link — "hoy me recordó a ti". When the recipient next
-- opens the app it unfolds on its own (a shooting star), then lives in their
-- bandeja. Directed & private: only author and recipient can read it.
-- ============================================================================

create table if not exists public.comets (
  id           uuid primary key default gen_random_uuid(),
  cosmos_id    uuid not null references public.cosmos(id) on delete cascade,
  author_id    uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  note         text,
  image_url    text,                 -- storage path in the `photos` bucket
  link_url     text,                 -- a song or any external link
  seen_at      timestamptz,          -- when the recipient first opened it
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint comets_has_content check (
    coalesce(note, '') <> '' or image_url is not null or link_url is not null
  )
);
create index if not exists idx_comets_recipient on public.comets(recipient_id, seen_at, created_at desc);
create index if not exists idx_comets_cosmos on public.comets(cosmos_id, created_at desc);
create trigger trg_comets_updated before update on public.comets
  for each row execute function public.set_updated_at();

alter table public.comets enable row level security;

-- Read: only the two people on this comet.
create policy "comets: read" on public.comets
  for select using (
    public.is_cosmos_member(cosmos_id) and (author_id = auth.uid() or recipient_id = auth.uid())
  );
-- Write: a member sends as themselves, to someone other than themselves.
create policy "comets: write" on public.comets
  for insert with check (
    public.is_cosmos_member(cosmos_id) and author_id = auth.uid() and recipient_id <> auth.uid()
  );
-- Update: only the recipient (to mark it seen).
create policy "comets: update" on public.comets
  for update using (public.is_cosmos_member(cosmos_id) and recipient_id = auth.uid())
  with check (public.is_cosmos_member(cosmos_id) and recipient_id = auth.uid());
-- Delete: only the author can take back what they sent.
create policy "comets: delete" on public.comets
  for delete using (author_id = auth.uid());

-- Mark a comet seen (idempotent; only the recipient may). SECURITY DEFINER so
-- the single seen_at write is atomic regardless of policy evaluation order.
create or replace function public.mark_comet_seen(p_id uuid)
returns public.comets
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.comets;
begin
  update public.comets
  set seen_at = coalesce(seen_at, now())
  where id = p_id and recipient_id = auth.uid()
  returning * into v_row;
  if v_row.id is null then
    raise exception 'No autorizado o cometa no encontrado.' using errcode = 'insufficient_privilege';
  end if;
  return v_row;
end $$;
grant execute on function public.mark_comet_seen(uuid) to authenticated;

-- Realtime so a sent comet lands live. Guarded (see 0007).
do $$
begin
  alter publication supabase_realtime add table public.comets;
exception when others then null;
end $$;
