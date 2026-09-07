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
