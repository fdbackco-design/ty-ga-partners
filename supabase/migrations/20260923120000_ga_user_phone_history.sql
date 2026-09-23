create table if not exists public.ga_user_phone_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.ga_users(id) on delete cascade,
  phone text not null,
  created_at timestamptz not null default now()
);

create index if not exists ga_user_phone_history_user_id_created_at_idx
  on public.ga_user_phone_history (user_id, created_at desc);

alter table public.ga_user_phone_history enable row level security;

revoke all on table public.ga_user_phone_history from anon, authenticated;
grant all on table public.ga_user_phone_history to service_role;
