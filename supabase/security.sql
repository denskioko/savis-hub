-- Tighter job policies (run in Supabase SQL Editor after schema.sql)
-- Consumers manage their jobs; any authenticated user can accept/decline/complete for prototype providers

drop policy if exists "Authenticated users can update jobs" on public.jobs;

-- Allow update if you created the job OR you are accepting a requested job
create policy "Users can update relevant jobs"
  on public.jobs for update
  to authenticated
  using (
    auth.uid() = consumer_id
    or status in ('requested', 'accepted')
  )
  with check (
    auth.uid() = consumer_id
    or status in ('requested', 'accepted', 'declined', 'completed')
  );
