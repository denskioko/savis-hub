-- Developer-managed agent registry
create table if not exists public.developer_agents (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  agent_code text unique,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.developer_agents enable row level security;

create or replace function public.list_developer_agents()
returns setof public.developer_agents
language sql stable security definer set search_path=public
as $$ select * from public.developer_agents where public.is_developer_admin() order by created_at desc $$;
grant execute on function public.list_developer_agents() to authenticated;

create or replace function public.set_developer_agent_active(p_user_id uuid,p_active boolean)
returns void language plpgsql security definer set search_path=public
as $$
begin
 if not public.is_developer_admin() then raise exception 'developer access required'; end if;
 if not exists(select 1 from public.profiles where id=p_user_id and role='agent') then raise exception 'target must be an agent'; end if;
 update public.developer_agents set active=p_active,updated_at=now() where user_id=p_user_id;
 perform public.write_developer_audit('agent.active.update',jsonb_build_object('target_user_id',p_user_id,'active',p_active));
end $$;
grant execute on function public.set_developer_agent_active(uuid,boolean) to authenticated;
