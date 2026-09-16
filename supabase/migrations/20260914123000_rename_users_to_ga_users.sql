-- 이미 public.users를 만들어 둔 경우 ga_users로 이름을 바꿉니다.
do $$
begin
  if to_regclass('public.users') is not null
     and to_regclass('public.ga_users') is null then
    alter table public.users rename to ga_users;
  end if;
end $$;

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
