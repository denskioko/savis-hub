-- SAVIS dynamic marketplace migration
-- Run after schema.sql and final-dream.sql.

alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists verification_status text not null default 'unverified'
  check (verification_status in ('unverified','pending','verified','rejected'));
alter table public.profiles add column if not exists service_area_km integer not null default 25
  check (service_area_km between 1 and 200);

create table if not exists public.provider_services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  category text not null,
  starting_price integer not null default 0 check (starting_price >= 0),
  unit text not null default 'job',
  is_active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists provider_services_provider_idx
  on public.provider_services(provider_id,is_active,category);

alter table public.provider_services enable row level security;

drop policy if exists "Published provider services readable" on public.provider_services;
create policy "Published provider services readable"
  on public.provider_services for select to authenticated
  using (is_active = true or provider_id = auth.uid());

drop policy if exists "Providers manage own services" on public.provider_services;
create policy "Providers manage own services"
  on public.provider_services for all to authenticated
  using (provider_id = auth.uid())
  with check (provider_id = auth.uid());

drop trigger if exists provider_services_updated_at on public.provider_services;
create trigger provider_services_updated_at
  before update on public.provider_services
  for each row execute function public.set_updated_at();

-- Keep provider discovery privacy-safe: no email in the public discovery result.
drop function if exists public.search_nearby_providers(double precision,double precision,double precision,text,integer);
create or replace function public.search_nearby_providers(
  p_lat double precision,
  p_lng double precision,
  p_radius_km double precision default 25,
  p_category text default null,
  p_limit integer default 40
)
returns table (
  id uuid, full_name text, role text, avatar_url text,
  latitude double precision, longitude double precision, location_name text,
  service_category text, hourly_rate integer, rating numeric, review_count integer,
  availability text, verified boolean, verification_status text, bio text,
  distance_km double precision
)
language sql stable security invoker
as $$
  with candidates as (
    select
      p.id, p.full_name, p.role, p.avatar_url,
      p.latitude, p.longitude, p.location_name, p.service_category,
      p.hourly_rate, p.rating, p.review_count, p.availability, p.verified,
      p.verification_status, p.bio,
      6371 * acos(least(1,greatest(-1,
        sin(radians(p_lat)) * sin(radians(p.latitude))
        + cos(radians(p_lat)) * cos(radians(p.latitude))
        * cos(radians(p.longitude) - radians(p_lng))
      ))) as distance_km
    from public.profiles p
    where p.role in ('provider','professional')
      and p.latitude is not null and p.longitude is not null
      and (p_category is null or lower(coalesce(p.service_category,'')) = lower(p_category))
  )
  select * from candidates
  where distance_km <= greatest(1,p_radius_km)
  order by distance_km asc
  limit greatest(1,least(p_limit,100));
$$;

grant execute on function public.search_nearby_providers(double precision,double precision,double precision,text,integer) to authenticated;
