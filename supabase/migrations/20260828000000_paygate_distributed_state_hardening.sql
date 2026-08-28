begin;

alter table public.apis
  add column if not exists setup_expires_at timestamptz;

update public.apis
set setup_expires_at = now() + interval '7 days'
where status = 'pending_setup'
  and setup_expires_at is null;

drop index if exists public.apis_unique_live_endpoint_idx;

create unique index if not exists apis_unique_active_endpoint_idx
  on public.apis (lower(method), lower(upstream_base_url), path)
  where status = 'active';

create unique index if not exists apis_unique_pending_owner_endpoint_idx
  on public.apis (owner_wallet, lower(method), lower(upstream_base_url), path)
  where status = 'pending_setup';

create index if not exists apis_pending_setup_expiry_idx
  on public.apis (setup_expires_at)
  where status = 'pending_setup';

comment on column public.apis.setup_expires_at is
  'Pending setup claim expiry. Only verified active records reserve an endpoint globally.';

do $$
begin
  if exists (
    select 1
    from public.withdrawals
    where tx_hash is not null
    group by tx_hash
    having count(*) > 1
  ) then
    raise exception 'Cannot enforce withdrawal transaction uniqueness: duplicate tx_hash rows require review';
  end if;
end;
$$;

create unique index if not exists withdrawals_tx_hash_unique_idx
  on public.withdrawals (tx_hash);

alter table public.proxy_requests
  add column if not exists forwarding_started_at timestamptz,
  add column if not exists forwarding_attempt_id text;

create index if not exists proxy_requests_forwarding_status_idx
  on public.proxy_requests (status, forwarding_started_at);

comment on column public.proxy_requests.forwarding_attempt_id is
  'Opaque claim token used to make paid upstream delivery transitions atomic.';

alter table public.payments
  add column if not exists credit_status text,
  add column if not exists credit_transaction_xdr text,
  add column if not exists credit_attempt_id text,
  add column if not exists credit_started_at timestamptz,
  add column if not exists credit_submitted_at timestamptz,
  add column if not exists credit_error text;

update public.payments
set credit_status = case
  when credited_at is not null and credit_tx_hash is not null then 'credited'
  else 'unsubmitted'
end
where credit_status is null;

alter table public.payments
  alter column credit_status set default 'unsubmitted',
  alter column credit_status set not null;

alter table public.payments
  drop constraint if exists payments_credit_status_check;

alter table public.payments
  add constraint payments_credit_status_check
  check (credit_status in (
    'unsubmitted',
    'preparing',
    'prepared',
    'submitted',
    'uncertain',
    'credited',
    'failed'
  ));

create index if not exists payments_credit_recovery_idx
  on public.payments (credit_status, credit_started_at)
  where credit_status <> 'credited';

comment on column public.payments.credit_transaction_xdr is
  'Signed, fixed-purpose escrow credit transaction persisted before submission for crash-safe replay.';

create table if not exists public.operator_submission_locks (
  lock_name text primary key,
  lease_token text not null,
  lease_expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

alter table public.operator_submission_locks enable row level security;

revoke all on table public.operator_submission_locks from public, anon, authenticated;
grant all on table public.operator_submission_locks to service_role;

create or replace function public.claim_operator_submission_lock(
  p_lock_name text,
  p_lease_token text,
  p_lease_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed_token text;
begin
  if p_lease_seconds < 1 or p_lease_seconds > 300 then
    raise exception 'Operator lock lease must be between 1 and 300 seconds';
  end if;

  insert into public.operator_submission_locks (
    lock_name,
    lease_token,
    lease_expires_at,
    updated_at
  ) values (
    p_lock_name,
    p_lease_token,
    now() + make_interval(secs => p_lease_seconds),
    now()
  )
  on conflict (lock_name) do update
  set
    lease_token = excluded.lease_token,
    lease_expires_at = excluded.lease_expires_at,
    updated_at = excluded.updated_at
  where public.operator_submission_locks.lease_expires_at <= now()
  returning lease_token into claimed_token;

  return claimed_token = p_lease_token;
end;
$$;

create or replace function public.release_operator_submission_lock(
  p_lock_name text,
  p_lease_token text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  released_count integer;
begin
  delete from public.operator_submission_locks
  where lock_name = p_lock_name
    and lease_token = p_lease_token;

  get diagnostics released_count = row_count;
  return released_count = 1;
end;
$$;

revoke all on function public.claim_operator_submission_lock(text, text, integer) from public, anon, authenticated;
revoke all on function public.release_operator_submission_lock(text, text) from public, anon, authenticated;
grant execute on function public.claim_operator_submission_lock(text, text, integer) to service_role;
grant execute on function public.release_operator_submission_lock(text, text) to service_role;

create or replace function public.get_paygate_dashboard_analytics(
  p_owner_wallet text,
  p_since timestamptz
)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with owned_apis as (
    select id
    from public.apis
    where owner_wallet = p_owner_wallet
  ),
  request_all as (
    select request.*
    from public.proxy_requests request
    join owned_apis owned on owned.id = request.api_id
  ),
  payment_all as (
    select payment.*
    from public.payments payment
    join owned_apis owned on owned.id = payment.api_id
  ),
  request_totals as (
    select
      count(*)::bigint as total_calls,
      count(*) filter (where status = 'forwarded')::bigint as successful_calls,
      count(*) filter (where status in ('payment_failed', 'duplicate_payment', 'upstream_failed'))::bigint as failed_calls,
      count(*) filter (where status = 'challenge_sent')::bigint as payment_required_calls,
      max(created_at) as last_request_at
    from request_all
  ),
  payment_totals as (
    select
      coalesce(sum(gross_amount_usdc) filter (where credit_status = 'credited'), 0) as gross_revenue_usdc,
      coalesce(sum(developer_amount_usdc) filter (where credit_status = 'credited'), 0) as developer_revenue_usdc,
      coalesce(sum(platform_fee_usdc) filter (where credit_status = 'credited'), 0) as platform_fee_usdc,
      max(created_at) as last_payment_at
    from payment_all
  ),
  per_api_requests as (
    select
      api_id,
      count(*)::bigint as total_calls,
      count(*) filter (where status = 'forwarded')::bigint as successful_calls,
      count(*) filter (where status in ('payment_failed', 'duplicate_payment', 'upstream_failed'))::bigint as failed_calls,
      count(*) filter (where status = 'challenge_sent')::bigint as payment_required_calls,
      max(created_at) as last_request_at
    from request_all
    group by api_id
  ),
  per_api_payments as (
    select
      api_id,
      coalesce(sum(gross_amount_usdc) filter (where credit_status = 'credited'), 0) as gross_revenue_usdc,
      coalesce(sum(developer_amount_usdc) filter (where credit_status = 'credited'), 0) as developer_revenue_usdc,
      coalesce(sum(platform_fee_usdc) filter (where credit_status = 'credited'), 0) as platform_fee_usdc,
      max(created_at) as last_payment_at
    from payment_all
    group by api_id
  ),
  per_api_rows as (
    select
      owned.id as api_id,
      coalesce(requests.total_calls, 0)::bigint as total_calls,
      coalesce(requests.successful_calls, 0)::bigint as successful_calls,
      coalesce(requests.failed_calls, 0)::bigint as failed_calls,
      coalesce(requests.payment_required_calls, 0)::bigint as payment_required_calls,
      coalesce(payments.gross_revenue_usdc, 0) as gross_revenue_usdc,
      coalesce(payments.developer_revenue_usdc, 0) as developer_revenue_usdc,
      coalesce(payments.platform_fee_usdc, 0) as platform_fee_usdc,
      requests.last_request_at,
      payments.last_payment_at
    from owned_apis owned
    left join per_api_requests requests on requests.api_id = owned.id
    left join per_api_payments payments on payments.api_id = owned.id
  ),
  daily_requests as (
    select
      api_id,
      created_at::date as bucket_date,
      count(*)::bigint as total_calls,
      count(*) filter (where status = 'forwarded')::bigint as successful_calls,
      count(*) filter (where status in ('payment_failed', 'duplicate_payment', 'upstream_failed'))::bigint as failed_calls,
      count(*) filter (where status = 'challenge_sent')::bigint as payment_required_calls
    from request_all
    where created_at >= p_since
    group by api_id, created_at::date
  ),
  daily_payments as (
    select
      api_id,
      coalesce(credited_at, created_at)::date as bucket_date,
      coalesce(sum(gross_amount_usdc), 0) as gross_revenue_usdc,
      coalesce(sum(developer_amount_usdc), 0) as developer_revenue_usdc,
      coalesce(sum(platform_fee_usdc), 0) as platform_fee_usdc
    from payment_all
    where credit_status = 'credited'
      and coalesce(credited_at, created_at) >= p_since
    group by api_id, coalesce(credited_at, created_at)::date
  ),
  daily_keys as (
    select api_id, bucket_date from daily_requests
    union
    select api_id, bucket_date from daily_payments
  ),
  daily_rows as (
    select
      keys.api_id,
      keys.bucket_date,
      coalesce(requests.total_calls, 0)::bigint as total_calls,
      coalesce(requests.successful_calls, 0)::bigint as successful_calls,
      coalesce(requests.failed_calls, 0)::bigint as failed_calls,
      coalesce(requests.payment_required_calls, 0)::bigint as payment_required_calls,
      coalesce(payments.gross_revenue_usdc, 0) as gross_revenue_usdc,
      coalesce(payments.developer_revenue_usdc, 0) as developer_revenue_usdc,
      coalesce(payments.platform_fee_usdc, 0) as platform_fee_usdc
    from daily_keys keys
    left join daily_requests requests
      on requests.api_id = keys.api_id and requests.bucket_date = keys.bucket_date
    left join daily_payments payments
      on payments.api_id = keys.api_id and payments.bucket_date = keys.bucket_date
  )
  select jsonb_build_object(
    'all_time', (
      select jsonb_build_object(
        'total_calls', requests.total_calls,
        'successful_calls', requests.successful_calls,
        'failed_calls', requests.failed_calls,
        'payment_required_calls', requests.payment_required_calls,
        'gross_revenue_usdc', payments.gross_revenue_usdc,
        'developer_revenue_usdc', payments.developer_revenue_usdc,
        'platform_fee_usdc', payments.platform_fee_usdc,
        'last_request_at', requests.last_request_at,
        'last_payment_at', payments.last_payment_at
      )
      from request_totals requests cross join payment_totals payments
    ),
    'per_api', coalesce((
      select jsonb_agg(to_jsonb(row_data) order by row_data.api_id)
      from per_api_rows row_data
    ), '[]'::jsonb),
    'daily', coalesce((
      select jsonb_agg(to_jsonb(row_data) order by row_data.bucket_date, row_data.api_id)
      from daily_rows row_data
    ), '[]'::jsonb)
  );
$$;

revoke all on function public.get_paygate_dashboard_analytics(text, timestamptz) from public, anon, authenticated;
grant execute on function public.get_paygate_dashboard_analytics(text, timestamptz) to service_role;

commit;
