-- SAVIS Final Dream backend foundation
-- Run AFTER supabase/schema.sql in Supabase SQL Editor. Safe to re-run.

alter table public.jobs drop constraint if exists jobs_status_check;
alter table public.jobs add constraint jobs_status_check check (
  status in ('requested','quote_pending','accepted','en_route','in_progress','completed','declined','cancelled','rescheduled')
);
alter table public.jobs add column if not exists cancelled_reason text;
alter table public.jobs add column if not exists completed_at timestamptz;
alter table public.jobs add column if not exists quoted_amount integer;

create table if not exists public.job_status_events (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  status text not null check (status in ('requested','quote_pending','accepted','en_route','in_progress','completed','declined','cancelled','rescheduled')),
  note text, latitude double precision, longitude double precision, created_at timestamptz default now()
);
create index if not exists job_status_events_job_idx on public.job_status_events(job_id,created_at desc);
alter table public.job_status_events enable row level security;
drop policy if exists "job event participants read" on public.job_status_events;
create policy "job event participants read" on public.job_status_events for select to authenticated using (
  exists(select 1 from public.jobs j where j.id=job_id and (j.consumer_id=auth.uid() or j.provider_id=auth.uid()::text))
);
drop policy if exists "job event actor insert" on public.job_status_events;
create policy "job event actor insert" on public.job_status_events for insert to authenticated with check(actor_id=auth.uid());

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  provider_id text not null, amount integer not null check(amount>=0), message text,
  status text not null default 'pending' check(status in ('pending','accepted','declined','expired','cancelled')),
  expires_at timestamptz, created_at timestamptz default now(), updated_at timestamptz default now()
);
create index if not exists quotes_job_idx on public.quotes(job_id,created_at desc);
alter table public.quotes enable row level security;
drop policy if exists "quote participants read" on public.quotes;
create policy "quote participants read" on public.quotes for select to authenticated using(
  provider_id=auth.uid()::text or exists(select 1 from public.jobs j where j.id=job_id and j.consumer_id=auth.uid())
);
drop policy if exists "provider creates quote" on public.quotes;
create policy "provider creates quote" on public.quotes for insert to authenticated with check(provider_id=auth.uid()::text);
drop policy if exists "provider updates quote" on public.quotes;
create policy "provider updates quote" on public.quotes for update to authenticated using(provider_id=auth.uid()::text) with check(provider_id=auth.uid()::text);
drop trigger if exists quotes_updated_at on public.quotes;
create trigger quotes_updated_at before update on public.quotes for each row execute function public.set_updated_at();

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  consumer_id uuid not null references auth.users(id) on delete cascade,
  provider_id text not null, job_id uuid references public.jobs(id) on delete set null,
  last_message_at timestamptz default now(), created_at timestamptz default now(),
  unique(consumer_id,provider_id,job_id)
);
create index if not exists conversations_consumer_idx on public.conversations(consumer_id,last_message_at desc);
create index if not exists conversations_provider_idx on public.conversations(provider_id,last_message_at desc);
alter table public.conversations enable row level security;
drop policy if exists "conversation participants read" on public.conversations;
create policy "conversation participants read" on public.conversations for select to authenticated using(consumer_id=auth.uid() or provider_id=auth.uid()::text);
drop policy if exists "consumer creates conversation" on public.conversations;
create policy "consumer creates conversation" on public.conversations for insert to authenticated with check(consumer_id=auth.uid());
drop policy if exists "conversation participants update" on public.conversations;
create policy "conversation participants update" on public.conversations for update to authenticated using(consumer_id=auth.uid() or provider_id=auth.uid()::text) with check(consumer_id=auth.uid() or provider_id=auth.uid()::text);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text, attachment_url text, created_at timestamptz default now(), read_at timestamptz
);
create index if not exists messages_conversation_idx on public.messages(conversation_id,created_at);
alter table public.messages enable row level security;
drop policy if exists "message participants read" on public.messages;
create policy "message participants read" on public.messages for select to authenticated using(
  exists(select 1 from public.conversations c where c.id=conversation_id and (c.consumer_id=auth.uid() or c.provider_id=auth.uid()::text))
);
drop policy if exists "message participants send" on public.messages;
create policy "message participants send" on public.messages for insert to authenticated with check(
  sender_id=auth.uid() and exists(select 1 from public.conversations c where c.id=conversation_id and (c.consumer_id=auth.uid() or c.provider_id=auth.uid()::text))
);
drop policy if exists "message participants readmark" on public.messages;
create policy "message participants readmark" on public.messages for update to authenticated using(
  exists(select 1 from public.conversations c where c.id=conversation_id and (c.consumer_id=auth.uid() or c.provider_id=auth.uid()::text))
) with check(true);

create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  provider_id text not null, created_at timestamptz default now(), primary key(user_id,provider_id)
);
alter table public.favorites enable row level security;
drop policy if exists "users manage favorites" on public.favorites;
create policy "users manage favorites" on public.favorites for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(), seller_id uuid not null references auth.users(id) on delete cascade,
  title text not null, description text, category text, price integer not null default 0 check(price>=0),
  currency text not null default 'KES', stock integer not null default 0 check(stock>=0),
  image_url text, status text not null default 'draft' check(status in ('draft','published','paused','sold_out')),
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create index if not exists products_discovery_idx on public.products(status,category,created_at desc);
alter table public.products enable row level security;
drop policy if exists "published products readable" on public.products;
create policy "published products readable" on public.products for select to authenticated using(status='published' or seller_id=auth.uid());
drop policy if exists "seller manages products" on public.products;
create policy "seller manages products" on public.products for all to authenticated using(seller_id=auth.uid()) with check(seller_id=auth.uid());
drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();

create table if not exists public.product_orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references auth.users(id) on delete set null,
  seller_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending' check(status in ('pending','confirmed','processing','ready','out_for_delivery','completed','cancelled')),
  total_amount integer not null default 0 check(total_amount>=0), delivery_location text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create index if not exists product_orders_buyer_idx on public.product_orders(buyer_id,created_at desc);
create index if not exists product_orders_seller_idx on public.product_orders(seller_id,created_at desc);
alter table public.product_orders enable row level security;
drop policy if exists "order participants read" on public.product_orders;
create policy "order participants read" on public.product_orders for select to authenticated using(buyer_id=auth.uid() or seller_id=auth.uid());
drop policy if exists "buyer creates order" on public.product_orders;
create policy "buyer creates order" on public.product_orders for insert to authenticated with check(buyer_id=auth.uid());
drop policy if exists "order participants update" on public.product_orders;
create policy "order participants update" on public.product_orders for update to authenticated using(buyer_id=auth.uid() or seller_id=auth.uid()) with check(buyer_id=auth.uid() or seller_id=auth.uid());
drop trigger if exists product_orders_updated_at on public.product_orders;
create trigger product_orders_updated_at before update on public.product_orders for each row execute function public.set_updated_at();

create table if not exists public.product_order_items (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.product_orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict, quantity integer not null check(quantity>0),
  unit_price integer not null check(unit_price>=0)
);
alter table public.product_order_items enable row level security;
drop policy if exists "order items participants read" on public.product_order_items;
create policy "order items participants read" on public.product_order_items for select to authenticated using(
  exists(select 1 from public.product_orders o where o.id=order_id and (o.buyer_id=auth.uid() or o.seller_id=auth.uid()))
);
drop policy if exists "buyer creates order items" on public.product_order_items;
create policy "buyer creates order items" on public.product_order_items for insert to authenticated with check(
  exists(select 1 from public.product_orders o where o.id=order_id and o.buyer_id=auth.uid())
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(), job_id uuid references public.jobs(id) on delete set null,
  order_id uuid references public.product_orders(id) on delete set null, payer_id uuid references auth.users(id) on delete set null,
  payee_id text, amount integer not null check(amount>=0), platform_fee integer not null default 0 check(platform_fee>=0),
  method text not null default 'mpesa' check(method in ('mpesa','card','wallet','cash')),
  status text not null default 'pending' check(status in ('pending','authorized','held','released','refunded','failed','cancelled')),
  provider_reference text, checkout_request_id text, created_at timestamptz default now(), updated_at timestamptz default now(),
  check(job_id is not null or order_id is not null)
);
create index if not exists payments_payer_idx on public.payments(payer_id,created_at desc);
alter table public.payments enable row level security;
drop policy if exists "payment participants read" on public.payments;
create policy "payment participants read" on public.payments for select to authenticated using(payer_id=auth.uid() or payee_id=auth.uid()::text);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  type text not null, title text not null, body text, data jsonb not null default '{}'::jsonb,
  read_at timestamptz, created_at timestamptz default now()
);
create index if not exists notifications_user_idx on public.notifications(user_id,created_at desc);
alter table public.notifications enable row level security;
drop policy if exists "users manage notifications" on public.notifications;
create policy "users manage notifications" on public.notifications for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());

create table if not exists public.provider_verifications (
  provider_id uuid primary key references auth.users(id) on delete cascade,
  id_front_path text, id_back_path text, selfie_path text, certificate_path text, consent_at timestamptz,
  status text not null default 'not_started' check(status in ('not_started','submitted','under_review','verified','rejected')),
  rejection_reason text, reviewed_at timestamptz, updated_at timestamptz default now()
);
alter table public.provider_verifications enable row level security;
drop policy if exists "provider reads verification" on public.provider_verifications;
create policy "provider reads verification" on public.provider_verifications for select to authenticated using(provider_id=auth.uid());
drop policy if exists "provider submits verification" on public.provider_verifications;
create policy "provider submits verification" on public.provider_verifications for insert to authenticated with check(provider_id=auth.uid());
drop policy if exists "provider updates verification" on public.provider_verifications;
create policy "provider updates verification" on public.provider_verifications for update to authenticated using(provider_id=auth.uid()) with check(provider_id=auth.uid());

create or replace function public.transition_job(
  p_job_id uuid,p_next_status text,p_note text default null,
  p_latitude double precision default null,p_longitude double precision default null
) returns public.jobs language plpgsql security definer set search_path='' as $
declare j public.jobs; ok boolean:=false;
begin
  select * into j from public.jobs where public.jobs.id=p_job_id for update;
  if not found then raise exception 'Job not found'; end if;
  if not (j.consumer_id=auth.uid() or j.provider_id=auth.uid()::text) then raise exception 'Not authorized'; end if;
  ok:=case
    when j.status='requested' and p_next_status in('quote_pending','accepted','declined','cancelled') then true
    when j.status='quote_pending' and p_next_status in('accepted','declined','cancelled') then true
    when j.status='accepted' and p_next_status in('en_route','cancelled','rescheduled') then true
    when j.status='en_route' and p_next_status in('in_progress','cancelled') then true
    when j.status='in_progress' and p_next_status in('completed','cancelled') then true
    when j.status='rescheduled' and p_next_status in('accepted','cancelled') then true else false end;
  if not ok then raise exception 'Invalid job status transition: % -> %',j.status,p_next_status; end if;
  update public.jobs set status=p_next_status,
    completed_at=case when p_next_status='completed' then now() else completed_at end,
    cancelled_reason=case when p_next_status='cancelled' then p_note else cancelled_reason end
    where id=p_job_id returning * into j;
  insert into public.job_status_events(job_id,actor_id,status,note,latitude,longitude)
    values(p_job_id,auth.uid(),p_next_status,p_note,p_latitude,p_longitude);
  return j;
end $$;
grant execute on function public.transition_job(uuid,text,text,double precision,double precision) to authenticated;

drop function if exists public.search_nearby_providers(double precision,double precision,double precision,text,integer);
create or replace function public.search_nearby_providers(
  p_lat double precision,p_lng double precision,p_radius_km double precision default 25,
  p_category text default null,p_limit integer default 40
) returns table(
  id uuid,full_name text,role text,latitude double precision,longitude double precision,location_name text,
  service_category text,hourly_rate integer,rating numeric,review_count integer,availability text,verified boolean,bio text,distance_km double precision
) language sql stable security invoker as $$
  with candidates as(
    select p.id,p.full_name,p.role,p.latitude,p.longitude,p.location_name,p.service_category,p.hourly_rate,
      p.rating,p.review_count,p.availability,p.verified,p.bio,
      6371*acos(least(1,greatest(-1,
        sin(radians(p_lat))*sin(radians(p.latitude))+
        cos(radians(p_lat))*cos(radians(p.latitude))*cos(radians(p.longitude)-radians(p_lng))
      ))) distance_km
    from public.profiles p
    where p.role in('provider','professional') and p.latitude is not null and p.longitude is not null
      and (p_category is null or lower(coalesce(p.service_category,''))=lower(p_category))
  )
  select * from candidates where distance_km<=greatest(1,p_radius_km)
  order by distance_km asc limit greatest(1,least(p_limit,100));
$$;
grant execute on function public.search_nearby_providers(double precision,double precision,double precision,text,integer) to authenticated;


-- Tighten the original prototype job policies now that transition_job exists.
drop policy if exists "Authenticated users can read jobs" on public.jobs;
create policy "Job participants and providers can read jobs" on public.jobs for select to authenticated using (
  consumer_id = auth.uid()
  or provider_id = auth.uid()::text
  or (provider_id is null and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('provider','professional')))
);
drop policy if exists "Authenticated users can update jobs" on public.jobs;
create policy "Job participants can update jobs" on public.jobs for update to authenticated using (
  consumer_id = auth.uid() or provider_id = auth.uid()::text
) with check (
  consumer_id = auth.uid() or provider_id = auth.uid()::text
);

drop policy if exists "job event actor insert" on public.job_status_events;
create policy "job event participant insert" on public.job_status_events for insert to authenticated with check (
  actor_id = auth.uid() and exists(
    select 1 from public.jobs j
    where j.id = job_id and (j.consumer_id = auth.uid() or j.provider_id = auth.uid()::text)
  )
);
