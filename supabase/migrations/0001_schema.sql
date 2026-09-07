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
