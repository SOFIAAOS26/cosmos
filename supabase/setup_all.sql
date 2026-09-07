
-- ============================================================
-- >>> migrations/0001_schema.sql
-- ============================================================
-- ============================================================================
-- COSMOS — 0001 schema
-- our little universe. A private space for exactly two people.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
do $$ begin
  create type identity as enum ('noir', 'blossom');
exception when duplicate_object then null; end $$;

do $$ begin
  create type member_role as enum ('owner', 'member');
exception when duplicate_object then null; end $$;

do $$ begin
  create type task_priority as enum ('normal', 'important', 'high');
exception when duplicate_object then null; end $$;

do $$ begin
  create type event_type as enum ('date', 'trip', 'concert', 'dinner', 'experience', 'other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type note_kind as enum ('immediate', 'scheduled', 'sealed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type checkin_mood as enum ('relief', 'good', 'survived', 'win', 'rough');
exception when duplicate_object then null; end $$;

do $$ begin
  create type song_platform as enum ('spotify', 'youtube');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_type as enum (
    'support_received', 'task_completed', 'checkin_received', 'note_unlocked', 'event_upcoming'
  );
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- Shared helpers
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ----------------------------------------------------------------------------
-- profiles — one per auth user
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Alguien',
  identity     identity not null default 'noir',
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', 'Alguien'))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- cosmos — the shared universe
-- ----------------------------------------------------------------------------
create table if not exists public.cosmos (
  id         uuid primary key default gen_random_uuid(),
  name       text not null default 'Nuestro cosmos',
  timezone   text not null default 'UTC',
  created_by uuid not null references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_cosmos_updated before update on public.cosmos
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- cosmos_members — exactly two per cosmos, distinct identities
-- ----------------------------------------------------------------------------
create table if not exists public.cosmos_members (
  id        uuid primary key default gen_random_uuid(),
  cosmos_id uuid not null references public.cosmos(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  identity  identity not null,
  role      member_role not null default 'member',
  joined_at timestamptz not null default now(),
  unique (cosmos_id, user_id),
  unique (cosmos_id, identity)
);
create index if not exists idx_members_user on public.cosmos_members(user_id);
create index if not exists idx_members_cosmos on public.cosmos_members(cosmos_id);

-- Hard cap of two members per cosmos, enforced in the database (§27).
create or replace function public.enforce_two_members()
returns trigger language plpgsql as $$
begin
  if (select count(*) from public.cosmos_members where cosmos_id = new.cosmos_id) >= 2 then
    raise exception 'Este cosmos ya está completo (máximo 2 personas).'
      using errcode = 'check_violation';
  end if;
  return new;
end $$;

drop trigger if exists trg_two_members on public.cosmos_members;
create trigger trg_two_members before insert on public.cosmos_members
  for each row execute function public.enforce_two_members();

-- ----------------------------------------------------------------------------
-- cosmos_invites — first user invites the second
-- ----------------------------------------------------------------------------
create or replace function public.gen_invite_code()
returns text language plpgsql as $$
declare
  alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; -- no ambiguous chars
  result text := '';
  i int;
begin
  for i in 1..8 loop
    result := result || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
  end loop;
  return result;
end $$;

create table if not exists public.cosmos_invites (
  id          uuid primary key default gen_random_uuid(),
  cosmos_id   uuid not null references public.cosmos(id) on delete cascade,
  code        text not null unique default public.gen_invite_code(),
  created_by  uuid not null references public.profiles(id) on delete cascade,
  expires_at  timestamptz default (now() + interval '30 days'),
  accepted_by uuid references public.profiles(id) on delete set null,
  accepted_at timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists idx_invites_cosmos on public.cosmos_invites(cosmos_id);

-- ----------------------------------------------------------------------------
-- memories (postcards) + media + songs + stickers
-- ----------------------------------------------------------------------------
create table if not exists public.memories (
  id         uuid primary key default gen_random_uuid(),
  cosmos_id  uuid not null references public.cosmos(id) on delete cascade,
  date       date not null,
  author_id  uuid not null references public.profiles(id) on delete set null,
  photo_url  text,
  story      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_memories_cosmos_date on public.memories(cosmos_id, date);
create trigger trg_memories_updated before update on public.memories
  for each row execute function public.set_updated_at();

create table if not exists public.memory_media (
  id         uuid primary key default gen_random_uuid(),
  memory_id  uuid not null references public.memories(id) on delete cascade,
  cosmos_id  uuid not null references public.cosmos(id) on delete cascade,
  url        text not null,
  thumb_url  text,
  width      int,
  height     int,
  position   int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_media_memory on public.memory_media(memory_id);

create table if not exists public.songs (
  id         uuid primary key default gen_random_uuid(),
  cosmos_id  uuid not null references public.cosmos(id) on delete cascade,
  memory_id  uuid references public.memories(id) on delete cascade,
  date       date,
  platform   song_platform not null,
  url        text not null,
  title      text,
  artist     text,
  thumbnail  text,
  created_at timestamptz not null default now()
);
create index if not exists idx_songs_cosmos on public.songs(cosmos_id);

create table if not exists public.stickers (
  id         uuid primary key default gen_random_uuid(),
  cosmos_id  uuid references public.cosmos(id) on delete cascade, -- null = global library
  name       text not null,
  url        text not null,
  is_global  boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_stickers_cosmos on public.stickers(cosmos_id);

create table if not exists public.memory_stickers (
  id         uuid primary key default gen_random_uuid(),
  cosmos_id  uuid not null references public.cosmos(id) on delete cascade,
  memory_id  uuid not null references public.memories(id) on delete cascade,
  sticker_id uuid not null references public.stickers(id) on delete cascade,
  x          real not null default 0.5,
  y          real not null default 0.5,
  scale      real not null default 1,
  rotation   real not null default 0,
  z          int  not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_memstickers_memory on public.memory_stickers(memory_id);
create trigger trg_memstickers_updated before update on public.memory_stickers
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- tasks + support + reactions + check-ins (Task Radar)
-- ----------------------------------------------------------------------------
create table if not exists public.tasks (
  id           uuid primary key default gen_random_uuid(),
  cosmos_id    uuid not null references public.cosmos(id) on delete cascade,
  author_id    uuid not null references public.profiles(id) on delete cascade,
  date         date not null,
  title        text not null,
  description  text,
  priority     task_priority not null default 'normal',
  category     text,
  completed    boolean not null default false,
  completed_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists idx_tasks_cosmos_date on public.tasks(cosmos_id, date);
create trigger trg_tasks_updated before update on public.tasks
  for each row execute function public.set_updated_at();

create table if not exists public.task_support (
  id         uuid primary key default gen_random_uuid(),
  cosmos_id  uuid not null references public.cosmos(id) on delete cascade,
  task_id    uuid not null references public.tasks(id) on delete cascade,
  from_user  uuid not null references public.profiles(id) on delete cascade,
  message    text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_support_task on public.task_support(task_id);

create table if not exists public.task_reactions (
  id         uuid primary key default gen_random_uuid(),
  cosmos_id  uuid not null references public.cosmos(id) on delete cascade,
  task_id    uuid not null references public.tasks(id) on delete cascade,
  from_user  uuid not null references public.profiles(id) on delete cascade,
  sticker_id uuid references public.stickers(id) on delete set null,
  emoji      text,
  created_at timestamptz not null default now()
);
create index if not exists idx_reactions_task on public.task_reactions(task_id);

create table if not exists public.task_checkins (
  id         uuid primary key default gen_random_uuid(),
  cosmos_id  uuid not null references public.cosmos(id) on delete cascade,
  task_id    uuid not null references public.tasks(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  mood       checkin_mood not null,
  note       text,
  created_at timestamptz not null default now()
);
create index if not exists idx_checkins_task on public.task_checkins(task_id);

-- ----------------------------------------------------------------------------
-- events + bucket list + countdowns
-- ----------------------------------------------------------------------------
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  cosmos_id   uuid not null references public.cosmos(id) on delete cascade,
  title       text not null,
  date        date not null,
  time        text,
  location    text,
  latitude    double precision,
  longitude   double precision,
  description text,
  type        event_type not null default 'other',
  created_by  uuid not null references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists idx_events_cosmos_date on public.events(cosmos_id, date);
create trigger trg_events_updated before update on public.events
  for each row execute function public.set_updated_at();

create table if not exists public.bucket_items (
  id             uuid primary key default gen_random_uuid(),
  cosmos_id      uuid not null references public.cosmos(id) on delete cascade,
  title          text not null,
  description    text,
  created_by     uuid not null references public.profiles(id) on delete set null,
  completed      boolean not null default false,
  completed_at   timestamptz,
  scheduled_date date,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists idx_bucket_cosmos on public.bucket_items(cosmos_id);
create trigger trg_bucket_updated before update on public.bucket_items
  for each row execute function public.set_updated_at();

create table if not exists public.countdowns (
  id          uuid primary key default gen_random_uuid(),
  cosmos_id   uuid not null references public.cosmos(id) on delete cascade,
  title       text not null,
  target_date timestamptz not null,
  event_id    uuid references public.events(id) on delete set null,
  created_by  uuid not null references public.profiles(id) on delete set null,
  is_primary  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists idx_countdowns_cosmos on public.countdowns(cosmos_id);
-- Only one primary countdown per cosmos.
create unique index if not exists uniq_primary_countdown
  on public.countdowns(cosmos_id) where is_primary;
create trigger trg_countdowns_updated before update on public.countdowns
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- notes (immediate / scheduled / sealed)
-- ----------------------------------------------------------------------------
create table if not exists public.notes (
  id           uuid primary key default gen_random_uuid(),
  cosmos_id    uuid not null references public.cosmos(id) on delete cascade,
  author_id    uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid references public.profiles(id) on delete set null,
  kind         note_kind not null default 'immediate',
  title        text,
  body         text not null,
  unlock_at    timestamptz,
  opened_at    timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists idx_notes_cosmos on public.notes(cosmos_id);
create trigger trg_notes_updated before update on public.notes
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- notifications — internal, per-recipient
-- ----------------------------------------------------------------------------
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  cosmos_id  uuid not null references public.cosmos(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       notification_type not null,
  payload    jsonb not null default '{}'::jsonb,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_notifications_user on public.notifications(user_id, read_at);


-- ============================================================
-- >>> migrations/0002_rls.sql
-- ============================================================
-- ============================================================================
-- COSMOS — 0002 Row Level Security
-- Principle (§28): USER -> COSMOS MEMBERSHIP -> AUTHORIZED DATA.
-- A user may never touch data from a cosmos they don't belong to.
-- ============================================================================

-- Membership check that bypasses RLS (avoids recursive policy evaluation).
create or replace function public.is_cosmos_member(p_cosmos uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.cosmos_members m
    where m.cosmos_id = p_cosmos and m.user_id = auth.uid()
  );
$$;

-- Do two users share a cosmos? (for profile visibility)
create or replace function public.shares_cosmos(p_user uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.cosmos_members me
    join public.cosmos_members other on other.cosmos_id = me.cosmos_id
    where me.user_id = auth.uid() and other.user_id = p_user
  );
$$;

-- ----------------------------------------------------------------------------
-- Enable RLS everywhere
-- ----------------------------------------------------------------------------
alter table public.profiles         enable row level security;
alter table public.cosmos           enable row level security;
alter table public.cosmos_members   enable row level security;
alter table public.cosmos_invites   enable row level security;
alter table public.memories         enable row level security;
alter table public.memory_media     enable row level security;
alter table public.songs            enable row level security;
alter table public.stickers         enable row level security;
alter table public.memory_stickers  enable row level security;
alter table public.tasks            enable row level security;
alter table public.task_support     enable row level security;
alter table public.task_reactions   enable row level security;
alter table public.task_checkins    enable row level security;
alter table public.events           enable row level security;
alter table public.bucket_items     enable row level security;
alter table public.countdowns       enable row level security;
alter table public.notes            enable row level security;
alter table public.notifications    enable row level security;

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------
create policy "profiles: read self or partner" on public.profiles
  for select using (id = auth.uid() or public.shares_cosmos(id));
create policy "profiles: update self" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- ----------------------------------------------------------------------------
-- cosmos (created/joined via SECURITY DEFINER rpc; here we allow read/update)
-- ----------------------------------------------------------------------------
create policy "cosmos: members read" on public.cosmos
  for select using (public.is_cosmos_member(id));
create policy "cosmos: members update" on public.cosmos
  for update using (public.is_cosmos_member(id)) with check (public.is_cosmos_member(id));

-- ----------------------------------------------------------------------------
-- cosmos_members (mutations go through rpc; direct read allowed)
-- ----------------------------------------------------------------------------
create policy "members: read own cosmos" on public.cosmos_members
  for select using (public.is_cosmos_member(cosmos_id));
create policy "members: leave (delete self)" on public.cosmos_members
  for delete using (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- cosmos_invites
-- ----------------------------------------------------------------------------
create policy "invites: members read" on public.cosmos_invites
  for select using (public.is_cosmos_member(cosmos_id));
create policy "invites: members create" on public.cosmos_invites
  for insert with check (public.is_cosmos_member(cosmos_id) and created_by = auth.uid());
create policy "invites: members delete" on public.cosmos_invites
  for delete using (public.is_cosmos_member(cosmos_id));

-- ----------------------------------------------------------------------------
-- Generic per-cosmos content policies
-- Members can do everything within their cosmos; author columns must be self.
-- ----------------------------------------------------------------------------

-- memories
create policy "memories: read" on public.memories
  for select using (public.is_cosmos_member(cosmos_id));
create policy "memories: write" on public.memories
  for insert with check (public.is_cosmos_member(cosmos_id) and author_id = auth.uid());
create policy "memories: update" on public.memories
  for update using (public.is_cosmos_member(cosmos_id)) with check (public.is_cosmos_member(cosmos_id));
create policy "memories: delete" on public.memories
  for delete using (public.is_cosmos_member(cosmos_id));

-- memory_media
create policy "media: read" on public.memory_media
  for select using (public.is_cosmos_member(cosmos_id));
create policy "media: write" on public.memory_media
  for insert with check (public.is_cosmos_member(cosmos_id));
create policy "media: update" on public.memory_media
  for update using (public.is_cosmos_member(cosmos_id)) with check (public.is_cosmos_member(cosmos_id));
create policy "media: delete" on public.memory_media
  for delete using (public.is_cosmos_member(cosmos_id));

-- songs
create policy "songs: read" on public.songs
  for select using (public.is_cosmos_member(cosmos_id));
create policy "songs: write" on public.songs
  for insert with check (public.is_cosmos_member(cosmos_id));
create policy "songs: update" on public.songs
  for update using (public.is_cosmos_member(cosmos_id)) with check (public.is_cosmos_member(cosmos_id));
create policy "songs: delete" on public.songs
  for delete using (public.is_cosmos_member(cosmos_id));

-- stickers (global library readable by all; cosmos stickers by members)
create policy "stickers: read" on public.stickers
  for select using (is_global or (cosmos_id is not null and public.is_cosmos_member(cosmos_id)));
create policy "stickers: write" on public.stickers
  for insert with check (cosmos_id is not null and public.is_cosmos_member(cosmos_id) and is_global = false);
create policy "stickers: delete" on public.stickers
  for delete using (cosmos_id is not null and public.is_cosmos_member(cosmos_id));

-- memory_stickers
create policy "memstickers: read" on public.memory_stickers
  for select using (public.is_cosmos_member(cosmos_id));
create policy "memstickers: write" on public.memory_stickers
  for insert with check (public.is_cosmos_member(cosmos_id));
create policy "memstickers: update" on public.memory_stickers
  for update using (public.is_cosmos_member(cosmos_id)) with check (public.is_cosmos_member(cosmos_id));
create policy "memstickers: delete" on public.memory_stickers
  for delete using (public.is_cosmos_member(cosmos_id));

-- tasks
create policy "tasks: read" on public.tasks
  for select using (public.is_cosmos_member(cosmos_id));
create policy "tasks: write" on public.tasks
  for insert with check (public.is_cosmos_member(cosmos_id) and author_id = auth.uid());
create policy "tasks: update" on public.tasks
  for update using (public.is_cosmos_member(cosmos_id)) with check (public.is_cosmos_member(cosmos_id));
create policy "tasks: delete" on public.tasks
  for delete using (public.is_cosmos_member(cosmos_id));

-- task_support
create policy "support: read" on public.task_support
  for select using (public.is_cosmos_member(cosmos_id));
create policy "support: write" on public.task_support
  for insert with check (public.is_cosmos_member(cosmos_id) and from_user = auth.uid());
create policy "support: delete" on public.task_support
  for delete using (from_user = auth.uid());

-- task_reactions
create policy "reactions: read" on public.task_reactions
  for select using (public.is_cosmos_member(cosmos_id));
create policy "reactions: write" on public.task_reactions
  for insert with check (public.is_cosmos_member(cosmos_id) and from_user = auth.uid());
create policy "reactions: delete" on public.task_reactions
  for delete using (from_user = auth.uid());

-- task_checkins
create policy "checkins: read" on public.task_checkins
  for select using (public.is_cosmos_member(cosmos_id));
create policy "checkins: write" on public.task_checkins
  for insert with check (public.is_cosmos_member(cosmos_id) and user_id = auth.uid());
create policy "checkins: delete" on public.task_checkins
  for delete using (user_id = auth.uid());

-- events
create policy "events: read" on public.events
  for select using (public.is_cosmos_member(cosmos_id));
create policy "events: write" on public.events
  for insert with check (public.is_cosmos_member(cosmos_id) and created_by = auth.uid());
create policy "events: update" on public.events
  for update using (public.is_cosmos_member(cosmos_id)) with check (public.is_cosmos_member(cosmos_id));
create policy "events: delete" on public.events
  for delete using (public.is_cosmos_member(cosmos_id));

-- bucket_items
create policy "bucket: read" on public.bucket_items
  for select using (public.is_cosmos_member(cosmos_id));
create policy "bucket: write" on public.bucket_items
  for insert with check (public.is_cosmos_member(cosmos_id) and created_by = auth.uid());
create policy "bucket: update" on public.bucket_items
  for update using (public.is_cosmos_member(cosmos_id)) with check (public.is_cosmos_member(cosmos_id));
create policy "bucket: delete" on public.bucket_items
  for delete using (public.is_cosmos_member(cosmos_id));

-- countdowns
create policy "countdowns: read" on public.countdowns
  for select using (public.is_cosmos_member(cosmos_id));
create policy "countdowns: write" on public.countdowns
  for insert with check (public.is_cosmos_member(cosmos_id) and created_by = auth.uid());
create policy "countdowns: update" on public.countdowns
  for update using (public.is_cosmos_member(cosmos_id)) with check (public.is_cosmos_member(cosmos_id));
create policy "countdowns: delete" on public.countdowns
  for delete using (public.is_cosmos_member(cosmos_id));

-- notes (cosmos-scoped read; the sealed/scheduled "lock" is UX, not crypto §17/§20)
create policy "notes: read" on public.notes
  for select using (public.is_cosmos_member(cosmos_id));
create policy "notes: write" on public.notes
  for insert with check (public.is_cosmos_member(cosmos_id) and author_id = auth.uid());
create policy "notes: update" on public.notes
  for update using (public.is_cosmos_member(cosmos_id)) with check (public.is_cosmos_member(cosmos_id));
create policy "notes: delete" on public.notes
  for delete using (public.is_cosmos_member(cosmos_id));

-- notifications (recipient reads/updates own; a member may create for the cosmos)
create policy "notifications: read own" on public.notifications
  for select using (user_id = auth.uid());
create policy "notifications: create in cosmos" on public.notifications
  for insert with check (public.is_cosmos_member(cosmos_id));
create policy "notifications: update own" on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "notifications: delete own" on public.notifications
  for delete using (user_id = auth.uid());


-- ============================================================
-- >>> migrations/0003_functions.sql
-- ============================================================
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


-- ============================================================
-- >>> migrations/0004_storage.sql
-- ============================================================
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

