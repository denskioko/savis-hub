-- SAVIS M-Pesa/Daraja payment foundation
-- Self-contained: creates the payment ledger if final-dream.sql was not applied.
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  job_id uuid,
  order_id uuid,
  payer_id uuid references auth.users(id) on delete set null,
  payee_id text,
  amount integer not null check(amount>=0),
  platform_fee integer not null default 0 check(platform_fee>=0),
  method text not null default 'mpesa' check(method in ('mpesa','card','wallet','cash')),
  status text not null default 'pending' check(status in ('pending','authorized','held','released','refunded','failed','cancelled')),
  provider_reference text,
  checkout_request_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  merchant_request_id text,
  mpesa_receipt text,
  result_code integer,
  result_desc text,
  callback_received_at timestamptz,
  phone_number text,
  failure_reason text,
  check(job_id is not null or order_id is not null)
);
alter table public.payments add column if not exists merchant_request_id text;
alter table public.payments add column if not exists mpesa_receipt text;
alter table public.payments add column if not exists result_code integer;
alter table public.payments add column if not exists result_desc text;
alter table public.payments add column if not exists callback_received_at timestamptz;
alter table public.payments add column if not exists phone_number text;
alter table public.payments add column if not exists failure_reason text;
create index if not exists payments_payer_idx on public.payments(payer_id,created_at desc);
create unique index if not exists payments_checkout_request_unique on public.payments(checkout_request_id) where checkout_request_id is not null;
create unique index if not exists payments_merchant_request_unique on public.payments(merchant_request_id) where merchant_request_id is not null;
create index if not exists payments_mpesa_receipt_idx on public.payments(mpesa_receipt) where mpesa_receipt is not null;
alter table public.payments enable row level security;
drop policy if exists "payment participants read" on public.payments;
create policy "payment participants read" on public.payments for select to authenticated using(payer_id=auth.uid() or payee_id=auth.uid()::text);
drop policy if exists "payer creates pending payment" on public.payments;
create policy "payer creates pending payment" on public.payments for insert to authenticated with check(payer_id=auth.uid() and status='pending');

create or replace function public.mark_mpesa_callback(p_checkout_request_id text,p_merchant_request_id text,p_result_code integer,p_result_desc text,p_receipt text default null,p_callback_at timestamptz default now())
returns public.payments language plpgsql security definer set search_path=public as $$
declare v_payment public.payments;
begin
 select * into v_payment from public.payments where checkout_request_id=p_checkout_request_id or merchant_request_id=p_merchant_request_id order by created_at desc limit 1 for update;
 if not found then raise exception 'Payment not found for Daraja callback'; end if;
 if v_payment.status in ('released','refunded','cancelled') then return v_payment; end if;
 update public.payments set merchant_request_id=coalesce(p_merchant_request_id,merchant_request_id),result_code=p_result_code,result_desc=p_result_desc,mpesa_receipt=coalesce(p_receipt,mpesa_receipt),callback_received_at=p_callback_at,status=case when p_result_code=0 then 'held' else 'failed' end,failure_reason=case when p_result_code=0 then null else p_result_desc end,updated_at=now() where id=v_payment.id returning * into v_payment;
 return v_payment;
end; $$;
revoke all on function public.mark_mpesa_callback(text,text,integer,text,text,timestamptz) from public,anon,authenticated;
grant execute on function public.mark_mpesa_callback(text,text,integer,text,text,timestamptz) to service_role;
