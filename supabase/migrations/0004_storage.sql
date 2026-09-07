-- ============================================================================
-- COSMOS — 0004 Storage
-- Private buckets. Path convention: <kind>/cosmos/<cosmosId>/...
-- Access is gated by cosmos membership; nothing private is served publicly (§29).
-- ============================================================================

insert into storage.buckets (id, name, public)
values
  ('photos', 'photos', false),
  ('stickers', 'stickers', false),
  ('avatars', 'avatars', false)
on conflict (id) do nothing;

-- Helper: extract the cosmos id from an object path 'cosmos/<uuid>/...'
create or replace function public.storage_cosmos_id(object_name text)
returns uuid
language sql
immutable
as $$
  select nullif((storage.foldername(object_name))[2], '')::uuid;
$$;

-- Members of the owning cosmos may read/write objects under their cosmos path.
create policy "storage: cosmos read" on storage.objects
  for select using (
    bucket_id in ('photos', 'stickers', 'avatars')
    and public.is_cosmos_member(public.storage_cosmos_id(name))
  );

create policy "storage: cosmos insert" on storage.objects
  for insert with check (
    bucket_id in ('photos', 'stickers', 'avatars')
    and public.is_cosmos_member(public.storage_cosmos_id(name))
  );

create policy "storage: cosmos update" on storage.objects
  for update using (
    bucket_id in ('photos', 'stickers', 'avatars')
    and public.is_cosmos_member(public.storage_cosmos_id(name))
  ) with check (
    bucket_id in ('photos', 'stickers', 'avatars')
    and public.is_cosmos_member(public.storage_cosmos_id(name))
  );

create policy "storage: cosmos delete" on storage.objects
  for delete using (
    bucket_id in ('photos', 'stickers', 'avatars')
    and public.is_cosmos_member(public.storage_cosmos_id(name))
  );
