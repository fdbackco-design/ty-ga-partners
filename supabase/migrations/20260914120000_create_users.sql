create table if not exists public.ga_users (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  username_lower text not null unique,
  password_hash text not null,
  name text not null,
  phone text not null,
  rrn_front text not null,
  rrn_back_first text not null,
  created_at timestamptz not null default now()
);

alter table public.ga_users enable row level security;

revoke all on table public.ga_users from anon, authenticated;
grant all on table public.ga_users to service_role;
