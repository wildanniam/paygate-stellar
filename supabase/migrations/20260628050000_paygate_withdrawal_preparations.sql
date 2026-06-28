create table if not exists public.withdrawal_preparations (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null references public.developers(wallet_address) on delete cascade,
  withdrawal_id uuid references public.withdrawals(id) on delete set null,
  tx_hash text not null,
  amount_usdc numeric(18, 7) not null check (amount_usdc > 0),
  amount_base_units text not null,
  status text not null default 'prepared' check (status in ('prepared', 'submitted', 'succeeded', 'failed', 'expired')),
  expires_at timestamptz not null,
  submitted_tx_hash text,
  created_at timestamptz not null default now(),
  submitted_at timestamptz,
  completed_at timestamptz
);

create index if not exists withdrawal_preparations_wallet_status_idx
  on public.withdrawal_preparations(wallet_address, status, expires_at);

create index if not exists withdrawal_preparations_tx_hash_idx
  on public.withdrawal_preparations(tx_hash);

alter table public.withdrawal_preparations enable row level security;

comment on table public.withdrawal_preparations is 'Server-side withdrawal intent records that bind Freighter-signed submit requests to PayGate-prepared escrow transactions.';
