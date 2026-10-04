-- SAVIS M-Pesa/Daraja production foundation
alter table public.payments add column if not exists merchant_request_id text;
alter table public.payments add column if not exists mpesa_receipt text;
alter table public.payments add column if not exists result_code integer;
alter table public.payments add column if not exists result_desc text;
alter table public.payments add column if not exists callback_received_at timestamptz;
alter table public.payments add column if not exists phone_number text;
alter table public.payments add column if not exists failure_reason text;
create unique index if not exists payments_checkout_request_unique on public.payments(checkout_request_id) where checkout_request_id is not null;
create unique index if not exists payments_merchant_request_unique on public.payments(merchant_request_id) where merchant_request_id is not null;
create index if not exists payments_mpesa_receipt_idx on public.payments(mpesa_receipt) where mpesa_receipt is not null;
drop policy if exists "payer creates pending payment" on public.payments;
create policy "payer creates pending payment" on public.payments for insert to authenticated with check (payer_id=auth.uid() and status='pending');
drop policy if exists "payment payer participant read" on public.payments;
create policy "payment payer participant read" on public.payments for select to authenticated using (
 payer_id=auth.uid() or payee_id=auth.uid()::text
 or exists(select 1 from public.jobs j where j.id=job_id and (j.consumer_id=auth.uid() or j.provider_id=auth.uid()::text))
 or exists(select 1 from public.product_orders o where o.id=order_id and (o.buyer_id=auth.uid() or o.seller_id=auth.uid()))
);
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