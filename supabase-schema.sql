-- Run this in your Supabase SQL editor

create table if not exists stores (
  id bigserial primary key,
  name text not null,
  category text not null,
  city text not null,
  neighborhood text,
  address text not null,
  lat double precision not null,
  lng double precision not null,
  tags text[] default '{}',
  note text,
  created_at timestamptz default now()
);

-- Enable Row Level Security (you'll tighten this later when adding auth)
alter table stores enable row level security;

-- For now: allow anonymous reads and inserts (no auth)
create policy "Allow public read" on stores
  for select using (true);

create policy "Allow public insert" on stores
  for insert with check (true);

-- Seed data
insert into stores (name, category, city, neighborhood, address, lat, lng, tags, note)
values
  (
    'No Man Walks Alone',
    'Menswear',
    'New York',
    'Flatiron',
    '19 W 21st St',
    40.7378,
    -73.9903,
    array['Curation', 'Great Service'],
    'Greg''s edit is always on point. Deep Italian and Japanese mix.'
  ),
  (
    'Blue in Green',
    'Denim',
    'New York',
    'SoHo',
    '8 Greene St',
    40.7245,
    -73.9927,
    array['Aesthetic', 'Curation'],
    'The temple of Japanese denim in NYC.'
  );
