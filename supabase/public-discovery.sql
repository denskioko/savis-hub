-- Logged-out provider discovery. Run after schema.sql and dynamic-marketplace.sql.
drop function if exists public.search_public_providers(double precision,double precision,double precision,text,text,integer);
create or replace function public.search_public_providers(
  p_lat double precision,p_lng double precision,p_radius_km double precision default 25,
  p_category text default null,p_query text default null,p_limit integer default 24
)
returns table(id uuid,full_name text,role text,avatar_url text,latitude double precision,longitude double precision,location_name text,service_category text,hourly_rate integer,rating numeric,review_count integer,availability text,verified boolean,verification_status text,bio text,distance_km double precision)
language sql stable security definer set search_path=''
as $$
  with candidates as (
    select p.id,p.full_name,p.role,p.avatar_url,p.latitude,p.longitude,p.location_name,p.service_category,p.hourly_rate,p.rating,p.review_count,p.availability,p.verified,p.verification_status,p.bio,
    6371*acos(least(1,greatest(-1,sin(radians(p_lat))*sin(radians(p.latitude))+cos(radians(p_lat))*cos(radians(p.latitude))*cos(radians(p.longitude)-radians(p_lng))))) distance_km
    from public.profiles p
    where p.role in ('provider','professional') and p.latitude is not null and p.longitude is not null
    and (p_category is null or lower(coalesce(p.service_category,''))=lower(p_category))
    and (p_query is null or trim(p_query)='' or lower(coalesce(p.full_name,'')) like '%'||lower(trim(p_query))||'%' or lower(coalesce(p.service_category,'')) like '%'||lower(trim(p_query))||'%' or lower(coalesce(p.location_name,'')) like '%'||lower(trim(p_query))||'%' or lower(coalesce(p.bio,'')) like '%'||lower(trim(p_query))||'%')
  ) select * from candidates where distance_km<=greatest(1,p_radius_km) order by distance_km limit greatest(1,least(p_limit,100));
$$;
revoke all on function public.search_public_providers(double precision,double precision,double precision,text,text,integer) from public;
grant execute on function public.search_public_providers(double precision,double precision,double precision,text,text,integer) to anon,authenticated;

drop function if exists public.get_public_provider(uuid);
create or replace function public.get_public_provider(p_provider_id uuid)
returns table(id uuid,full_name text,role text,avatar_url text,latitude double precision,longitude double precision,location_name text,service_category text,hourly_rate integer,rating numeric,review_count integer,availability text,verified boolean,verification_status text,bio text)
language sql stable security definer set search_path=''
as $$ select p.id,p.full_name,p.role,p.avatar_url,p.latitude,p.longitude,p.location_name,p.service_category,p.hourly_rate,p.rating,p.review_count,p.availability,p.verified,p.verification_status,p.bio from public.profiles p where p.id=p_provider_id and p.role in ('provider','professional') limit 1 $$;
revoke all on function public.get_public_provider(uuid) from public;
grant execute on function public.get_public_provider(uuid) to anon,authenticated;

drop function if exists public.get_public_provider_services(uuid);
create or replace function public.get_public_provider_services(p_provider_id uuid)
returns table(id uuid,name text,description text,starting_price integer,unit text)
language sql stable security definer set search_path=''
as $$ select s.id,s.name,s.description,s.starting_price,s.unit from public.provider_services s where s.provider_id=p_provider_id and s.is_active=true order by s.starting_price $$;
revoke all on function public.get_public_provider_services(uuid) from public;
grant execute on function public.get_public_provider_services(uuid) to anon,authenticated;
