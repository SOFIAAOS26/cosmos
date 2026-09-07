-- ============================================================================
-- COSMOS — 0003 RPCs
-- Onboarding actions that must run with elevated rights but strict checks.
-- ============================================================================

-- Create a new cosmos and make the caller its first member (owner).
create or replace function public.create_cosmos(
  p_name text,
  p_identity identity,
  p_timezone text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_cosmos uuid;
begin
  if v_uid is null then
    raise exception 'No autenticado.' using errcode = 'insufficient_privilege';
  end if;

  -- MVP: a user belongs to at most one cosmos.
  if exists (select 1 from public.cosmos_members where user_id = v_uid) then
    raise exception 'Ya perteneces a un cosmos.' using errcode = 'check_violation';
  end if;

  insert into public.cosmos (name, timezone, created_by)
  values (coalesce(nullif(trim(p_name), ''), 'Nuestro cosmos'), coalesce(p_timezone, 'UTC'), v_uid)
  returning id into v_cosmos;

  insert into public.cosmos_members (cosmos_id, user_id, identity, role)
  values (v_cosmos, v_uid, p_identity, 'owner');

  return v_cosmos;
end $$;

-- Accept an invitation code and join its cosmos as the second member.
create or replace function public.accept_invite(
  p_code text,
  p_identity identity
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_invite public.cosmos_invites;
  v_count int;
begin
  if v_uid is null then
    raise exception 'No autenticado.' using errcode = 'insufficient_privilege';
  end if;

  select * into v_invite
  from public.cosmos_invites
  where code = upper(trim(p_code))
  limit 1;

  if v_invite.id is null then
    raise exception 'Invitación no encontrada.' using errcode = 'no_data_found';
  end if;

  if v_invite.expires_at is not null and v_invite.expires_at < now() then
    raise exception 'Esta invitación expiró.' using errcode = 'check_violation';
  end if;

  -- Already a member of this cosmos? Just return it.
  if exists (
    select 1 from public.cosmos_members
    where cosmos_id = v_invite.cosmos_id and user_id = v_uid
  ) then
    return v_invite.cosmos_id;
  end if;

  -- MVP: a user belongs to at most one cosmos.
  if exists (select 1 from public.cosmos_members where user_id = v_uid) then
    raise exception 'Ya perteneces a un cosmos.' using errcode = 'check_violation';
  end if;

  -- Two-member cap (also enforced by trigger; checked here for a clear message).
  select count(*) into v_count from public.cosmos_members where cosmos_id = v_invite.cosmos_id;
  if v_count >= 2 then
    raise exception 'Este cosmos ya está completo.' using errcode = 'check_violation';
  end if;

  -- Identity must be free (distinct from the other member).
  if exists (
    select 1 from public.cosmos_members
    where cosmos_id = v_invite.cosmos_id and identity = p_identity
  ) then
    raise exception 'Esa identidad ya está tomada en este cosmos.' using errcode = 'unique_violation';
  end if;

  insert into public.cosmos_members (cosmos_id, user_id, identity, role)
  values (v_invite.cosmos_id, v_uid, p_identity, 'member');

  update public.cosmos_invites
  set accepted_by = v_uid, accepted_at = now()
  where id = v_invite.id;

  return v_invite.cosmos_id;
end $$;

grant execute on function public.create_cosmos(text, identity, text) to authenticated;
grant execute on function public.accept_invite(text, identity) to authenticated;
