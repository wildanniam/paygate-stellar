create table if not exists public.mpp_store (
  key text primary key,
  value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.payments
add column if not exists credit_tx_hash text;

create unique index if not exists payments_tx_hash_idx on public.payments(tx_hash);
create index if not exists mpp_store_updated_at_idx on public.mpp_store(updated_at);

alter table public.mpp_store enable row level security;

comment on table public.mpp_store is 'Server-side MPP replay-protection state. Access only through Vercel Functions using the Supabase service role key.';
