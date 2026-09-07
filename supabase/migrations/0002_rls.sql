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
