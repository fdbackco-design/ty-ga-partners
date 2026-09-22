-- 코드 발급 컬럼 + 상태. TY 사원등록은 취소 API가 없어 중복 등록만 막는다.
alter table public.partner_applications drop constraint if exists partner_applications_status_check;
alter table public.partner_applications add constraint partner_applications_status_check
  check (status in (
    'DRAFT',
    'VERIFIED',
    'CONTRACT',
    'SIGNING',
    'CONTRACT_SIGNED',
    'SUBMITTING',
    'ISSUED',
    'FAILED',
    'NEEDS_MANUAL_CHECK'
  ));

alter table public.partner_applications
  add column if not exists idempotency_key text,
  add column if not exists emp_id text,
  add column if not exists emp_code text,
  add column if not exists org_name text,
  add column if not exists issued_at timestamptz,
  add column if not exists issue_attempts int default 0,
  add column if not exists last_error_code int,
  add column if not exists last_error_message text,
  add column if not exists manual_check_note text,
  add column if not exists manual_resolved_by text,
  add column if not exists manual_resolved_at timestamptz;

create unique index if not exists partner_applications_idempotency_key_idx
  on public.partner_applications (idempotency_key)
  where idempotency_key is not null;

create unique index if not exists idx_emp_code_issued
  on public.partner_applications (emp_code)
  where status = 'ISSUED' and emp_code is not null;

create unique index if not exists idx_emp_id_issued
  on public.partner_applications (emp_id)
  where status = 'ISSUED' and emp_id is not null;
