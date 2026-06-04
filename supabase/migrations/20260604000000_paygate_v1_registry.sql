create extension if not exists "pgcrypto";

create table if not exists public.developers (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null unique,
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

create table if not exists public.auth_challenges (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null,
  nonce text not null,
  message text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.apis (
  id uuid primary key default gen_random_uuid(),
  owner_wallet text not null references public.developers(wallet_address) on delete cascade,
  name text not null,
  upstream_base_url text not null,
  path text not null,
  method text not null default 'GET' check (method = 'GET'),
  price_usdc numeric(18, 7) not null check (price_usdc > 0),
  secret_ciphertext text not null,
  secret_iv text not null,
  secret_auth_tag text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.proxy_requests (
  id uuid primary key default gen_random_uuid(),
  api_id uuid not null references public.apis(id) on delete cascade,
  owner_wallet text not null references public.developers(wallet_address) on delete cascade,
  payment_id text not null,
  status text not null,
  price_usdc numeric(18, 7) not null check (price_usdc > 0),
  payer_wallet text,
  tx_hash text,
  upstream_status integer,
  error_message text,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  forwarded_at timestamptz
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.proxy_requests(id) on delete cascade,
  api_id uuid not null references public.apis(id) on delete cascade,
  payment_id text not null,
  tx_hash text not null,
  gross_amount_usdc numeric(18, 7) not null check (gross_amount_usdc > 0),
  developer_amount_usdc numeric(18, 7) not null check (developer_amount_usdc >= 0),
  platform_fee_usdc numeric(18, 7) not null check (platform_fee_usdc >= 0),
  recipient_mode text not null check (recipient_mode in ('contract', 'paygate_wallet_fallback')),
  verified_at timestamptz,
  credited_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null references public.developers(wallet_address) on delete cascade,
  amount_usdc numeric(18, 7) not null check (amount_usdc > 0),
  tx_hash text,
  status text not null check (status in ('pending', 'succeeded', 'failed')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists developers_wallet_address_idx on public.developers(wallet_address);
create index if not exists auth_challenges_wallet_idx on public.auth_challenges(wallet_address);
create index if not exists auth_challenges_expires_idx on public.auth_challenges(expires_at);
create index if not exists apis_owner_wallet_idx on public.apis(owner_wallet);
create index if not exists proxy_requests_api_idx on public.proxy_requests(api_id);
create index if not exists proxy_requests_owner_idx on public.proxy_requests(owner_wallet);
create unique index if not exists proxy_requests_payment_id_idx on public.proxy_requests(payment_id);
create unique index if not exists payments_payment_id_idx on public.payments(payment_id);
create index if not exists payments_api_idx on public.payments(api_id);
create index if not exists withdrawals_wallet_idx on public.withdrawals(wallet_address);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists apis_set_updated_at on public.apis;
create trigger apis_set_updated_at
before update on public.apis
for each row
execute function public.set_updated_at();

alter table public.developers enable row level security;
alter table public.auth_challenges enable row level security;
alter table public.apis enable row level security;
alter table public.proxy_requests enable row level security;
alter table public.payments enable row level security;
alter table public.withdrawals enable row level security;

comment on table public.apis is 'PayGate V1 API registry. Access is mediated by Vercel Functions using the Supabase service role key.';
