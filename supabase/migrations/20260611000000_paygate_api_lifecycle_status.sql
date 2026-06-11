alter table public.apis
  add column if not exists status text,
  add column if not exists verified_at timestamptz,
  add column if not exists archived_at timestamptz;

update public.apis
set status = case
  when archived_at is not null then 'archived'
  when active is true then 'active'
  else 'pending_setup'
end
where status is null;

alter table public.apis
  alter column status set default 'pending_setup',
  alter column status set not null;

alter table public.apis
  drop constraint if exists apis_status_check;

alter table public.apis
  add constraint apis_status_check
  check (status in ('pending_setup', 'active', 'archived'));

update public.apis
set active = (status = 'active');

comment on column public.apis.status is 'PayGate API lifecycle: pending_setup, active, or archived.';
comment on column public.apis.verified_at is 'Timestamp when PayGate verified the upstream X-PayGate-Secret guard.';
comment on column public.apis.archived_at is 'Timestamp when the API was archived and removed from active proxy usage.';
