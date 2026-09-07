-- ============================================================================
-- COSMOS — development seed (OPTIONAL, dev only) §57
-- Never run against production. Creates a demo cosmos "COSMOS Demo" with two
-- members (Noir & Blossom) and a little content.
--
-- Prerequisite: create two auth users first (e.g. via the Supabase dashboard
-- or `supabase auth`), then set their emails below.
-- ============================================================================

do $$
declare
  v_noir_email    text := 'noir@example.com';
  v_blossom_email text := 'blossom@example.com';
  v_noir uuid;
  v_blossom uuid;
  v_cosmos uuid;
  v_mem uuid;
  v_task uuid;
begin
  select id into v_noir from auth.users where email = v_noir_email;
  select id into v_blossom from auth.users where email = v_blossom_email;

  if v_noir is null or v_blossom is null then
    raise notice 'Seed skipped: create the two demo auth users first (% and %).',
      v_noir_email, v_blossom_email;
    return;
  end if;

  -- Idempotency: wipe a previous demo cosmos.
  delete from public.cosmos where name = 'COSMOS Demo';

  insert into public.profiles (id, display_name, identity)
  values (v_noir, 'Noir', 'noir')
  on conflict (id) do update set display_name = excluded.display_name, identity = excluded.identity;

  insert into public.profiles (id, display_name, identity)
  values (v_blossom, 'Blossom', 'blossom')
  on conflict (id) do update set display_name = excluded.display_name, identity = excluded.identity;

  insert into public.cosmos (name, timezone, created_by)
  values ('COSMOS Demo', 'America/Monterrey', v_noir)
  returning id into v_cosmos;

  insert into public.cosmos_members (cosmos_id, user_id, identity, role) values
    (v_cosmos, v_noir, 'noir', 'owner'),
    (v_cosmos, v_blossom, 'blossom', 'member');

  -- A memory (postcard)
  insert into public.memories (cosmos_id, date, author_id, story)
  values (v_cosmos, current_date - 3, v_blossom,
    'Terminamos caminando bajo la lluvia y ninguno quería pedir un taxi.')
  returning id into v_mem;

  insert into public.songs (cosmos_id, memory_id, platform, url, title, artist)
  values (v_cosmos, v_mem, 'spotify', 'https://open.spotify.com/track/0', 'A Whole New World', 'Peabo Bryson');

  -- Tasks for today
  insert into public.tasks (cosmos_id, author_id, date, title, priority, category)
  values (v_cosmos, v_noir, current_date, 'Examen de Cálculo', 'high', 'Examen')
  returning id into v_task;

  insert into public.tasks (cosmos_id, author_id, date, title, priority, category)
  values (v_cosmos, v_blossom, current_date, 'Cita con el dentista', 'important', 'Salud');

  insert into public.task_support (cosmos_id, task_id, from_user, message)
  values (v_cosmos, v_task, v_blossom, 'Mucho éxito hoy ♡');

  -- An event + primary countdown
  insert into public.events (cosmos_id, title, date, time, location, type, created_by)
  values (v_cosmos, 'Concierto', current_date + 12, '20:00', 'Auditorio', 'concert', v_noir);

  insert into public.countdowns (cosmos_id, title, target_date, created_by, is_primary)
  values (v_cosmos, 'Próxima aventura', now() + interval '12 days', v_noir, true);

  -- Bucket list
  insert into public.bucket_items (cosmos_id, title, created_by) values
    (v_cosmos, 'Ver auroras boreales', v_blossom),
    (v_cosmos, 'Aprender a bailar', v_noir);

  raise notice 'Seed complete: COSMOS Demo (%).', v_cosmos;
end $$;
