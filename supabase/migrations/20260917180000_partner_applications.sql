-- Partner application (코드 발급 신청) + audit log
create table if not exists public.partner_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.ga_users(id) on delete cascade,
  status text not null default 'DRAFT',
  channel_slug text not null,
  org_code text not null,
  join_channel varchar(20) not null,
  cert_name text,
  cert_birthdate text,
  cert_mobile text,
  cert_gender integer,
  cert_national text,
  cert_di text,
  cert_response_no text,
  cert_at timestamptz,
  ssn_gender_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint partner_applications_status_check
    check (status in ('DRAFT', 'VERIFIED', 'CONTRACT', 'ISSUED', 'FAILED')),
  constraint partner_applications_join_channel_len
    check (char_length(join_channel) <= 20)
);

create index if not exists partner_applications_status_idx
  on public.partner_applications (status);

create table if not exists public.application_audit_logs (
  id uuid primary key default gen_random_uuid(),
  application_id uuid,
  user_id uuid,
  event text not null,
  meta jsonb not null default '{}'::jsonb,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists application_audit_logs_user_created_idx
  on public.application_audit_logs (user_id, created_at desc);

create index if not exists application_audit_logs_event_idx
  on public.application_audit_logs (event);

alter table public.partner_applications enable row level security;
alter table public.application_audit_logs enable row level security;

revoke all on table public.partner_applications from anon, authenticated;
revoke all on table public.application_audit_logs from anon, authenticated;
grant all on table public.partner_applications to service_role;
grant all on table public.application_audit_logs to service_role;
