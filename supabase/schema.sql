-- Eco Elan admin console schema (Supabase Postgres).
-- Run in the Supabase SQL editor, or `supabase db push`.
--
-- One row per commercial order. The quotation/invoice/payment documents are
-- stored as JSONB (mirrors the console's Order shape for a near-trivial port),
-- with a couple of summary columns hoisted out for cheap dashboard queries.
--
-- Security model: RLS is ON and NO policies are granted to anon/authenticated,
-- so the table is unreadable with the public anon key. All access goes through
-- the /api/admin/* serverless functions, which use the service-role key (which
-- bypasses RLS) AFTER verifying the caller is an allow-listed admin.

create extension if not exists "pgcrypto";

create sequence if not exists public.orders_seq_num_seq;

create table if not exists public.orders (
  id             uuid primary key default gen_random_uuid(),
  seq_num        int  not null default nextval('public.orders_seq_num_seq'),
  client         jsonb not null default '{}'::jsonb,
  quote          jsonb not null default '{}'::jsonb,
  invoice        jsonb not null default '{}'::jsonb,
  payment        jsonb not null default '{}'::jsonb,
  payment_status text not null default 'unpaid',   -- mirror of payment->>'status'
  total_amount   numeric(12,2) not null default 0, -- mirror of computed invoice total
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter sequence public.orders_seq_num_seq owned by public.orders.seq_num;

create unique index if not exists orders_seq_num_key on public.orders (seq_num);
create index if not exists orders_payment_status_idx on public.orders (payment_status);

-- keep updated_at fresh on every write
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- Lock the table down. Service-role (used by the API) bypasses RLS entirely.
alter table public.orders enable row level security;
revoke all on public.orders from anon, authenticated;

-- Seed data is inserted by the API on first load when the table is empty
-- (see api/admin/orders.ts) so it stays in sync with src/data/admin.ts.
