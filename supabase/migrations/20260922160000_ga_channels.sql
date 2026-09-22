create table if not exists public.ga_channels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  org_code text not null default '611361',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ga_channels_slug_format
    check (slug ~ '^[a-zA-Z0-9_-]{1,20}$'),
  constraint ga_channels_name_len
    check (char_length(btrim(name)) between 1 and 80)
);

insert into public.ga_channels (name, slug, org_code, active)
values ('TY_GA파트너스 채널1', 'channel1', '611361', true)
on conflict (slug) do nothing;

alter table public.ga_channels enable row level security;
revoke all on table public.ga_channels from anon, authenticated;
grant all on table public.ga_channels to service_role;

alter table public.ga_users
  add column if not exists channel text;

update public.partner_applications
  set channel_slug = 'channel1'
  where channel_slug in ('default', '');
