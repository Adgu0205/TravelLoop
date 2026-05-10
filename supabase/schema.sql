-- Traveloop Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ===========================
-- CITIES (public reference data)
-- ===========================
create table if not exists public.cities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  country text not null,
  region text not null,
  lat double precision not null,
  lng double precision not null,
  cost_index integer not null default 50,
  popularity_score integer not null default 50,
  cover_image_url text
);

-- ===========================
-- ACTIVITIES (public reference data)
-- ===========================
create table if not exists public.activities (
  id uuid primary key default uuid_generate_v4(),
  city_id uuid references public.cities(id) on delete cascade,
  name text not null,
  category text not null check (category in ('adventure','culture','food','nightlife','nature','shopping','wellness')),
  cost_estimate numeric(10,2) not null default 0,
  duration_hours numeric(4,1) not null default 1,
  description text,
  image_url text
);

-- ===========================
-- USERS (mirrors auth.users)
-- ===========================
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  avatar_url text,
  language text not null default 'en',
  currency text not null default 'INR',
  created_at timestamptz not null default now()
);

-- ===========================
-- TRIPS
-- ===========================
create table if not exists public.trips (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  name text not null,
  description text,
  cover_photo_url text,
  start_date date,
  end_date date,
  total_budget numeric(12,2) not null default 0,
  is_public boolean not null default false,
  share_token uuid not null default uuid_generate_v4(),
  created_at timestamptz not null default now()
);

-- ===========================
-- STOPS
-- ===========================
create table if not exists public.stops (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid references public.trips(id) on delete cascade,
  city_id uuid references public.cities(id),
  position_order integer not null default 0,
  start_date date,
  end_date date
);

-- ===========================
-- STOP_ACTIVITIES
-- ===========================
create table if not exists public.stop_activities (
  id uuid primary key default uuid_generate_v4(),
  stop_id uuid references public.stops(id) on delete cascade,
  activity_id uuid references public.activities(id),
  scheduled_time time,
  cost_override numeric(10,2),
  notes text
);

-- ===========================
-- BUDGETS
-- ===========================
create table if not exists public.budgets (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid references public.trips(id) on delete cascade unique,
  transport numeric(12,2) not null default 0,
  stay numeric(12,2) not null default 0,
  activities numeric(12,2) not null default 0,
  meals numeric(12,2) not null default 0,
  misc numeric(12,2) not null default 0,
  total_limit numeric(12,2) not null default 0
);

-- ===========================
-- CHECKLIST_ITEMS
-- ===========================
create table if not exists public.checklist_items (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid references public.trips(id) on delete cascade,
  category text not null default 'misc',
  item_name text not null,
  is_packed boolean not null default false,
  note text
);

-- ===========================
-- TRIP_NOTES
-- ===========================
create table if not exists public.trip_notes (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid references public.trips(id) on delete cascade,
  stop_id uuid references public.stops(id) on delete set null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ===========================
-- ROW LEVEL SECURITY
-- ===========================

alter table public.users enable row level security;
alter table public.trips enable row level security;
alter table public.stops enable row level security;
alter table public.stop_activities enable row level security;
alter table public.budgets enable row level security;
alter table public.checklist_items enable row level security;
alter table public.trip_notes enable row level security;
alter table public.cities enable row level security;
alter table public.activities enable row level security;

-- Cities: public read
create policy "cities_public_read" on public.cities for select using (true);
create policy "activities_public_read" on public.activities for select using (true);

-- Users: own record only
create policy "users_own" on public.users
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Trips: own + public read
create policy "trips_own" on public.trips
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "trips_public_read" on public.trips
  for select using (is_public = true);

-- Stops: via trip ownership
create policy "stops_own" on public.stops
  using (
    trip_id in (select id from public.trips where user_id = auth.uid())
  )
  with check (
    trip_id in (select id from public.trips where user_id = auth.uid())
  );

-- Stop activities: via stop > trip ownership
create policy "stop_activities_own" on public.stop_activities
  using (
    stop_id in (
      select s.id from public.stops s
      join public.trips t on t.id = s.trip_id
      where t.user_id = auth.uid()
    )
  );

-- Budgets: via trip ownership
create policy "budgets_own" on public.budgets
  using (
    trip_id in (select id from public.trips where user_id = auth.uid())
  )
  with check (
    trip_id in (select id from public.trips where user_id = auth.uid())
  );

-- Checklist: via trip ownership
create policy "checklist_own" on public.checklist_items
  using (
    trip_id in (select id from public.trips where user_id = auth.uid())
  )
  with check (
    trip_id in (select id from public.trips where user_id = auth.uid())
  );

-- Notes: via trip ownership
create policy "notes_own" on public.trip_notes
  using (
    trip_id in (select id from public.trips where user_id = auth.uid())
  )
  with check (
    trip_id in (select id from public.trips where user_id = auth.uid())
  );

-- ===========================
-- TRIGGER: auto-update updated_at on trip_notes
-- ===========================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trip_notes_updated_at
  before update on public.trip_notes
  for each row execute function public.handle_updated_at();
