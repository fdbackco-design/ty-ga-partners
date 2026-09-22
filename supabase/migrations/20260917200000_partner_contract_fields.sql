-- 위촉계약서 작성 컬럼 + 제출 상태
alter table public.partner_applications drop constraint if exists partner_applications_status_check;
alter table public.partner_applications add constraint partner_applications_status_check
  check (status in ('DRAFT', 'VERIFIED', 'CONTRACT', 'SIGNING', 'CONTRACT_SIGNED', 'ISSUED', 'FAILED'));

alter table public.partner_applications
  add column if not exists contract_version text,
  add column if not exists agreements jsonb,
  add column if not exists privacy_agreed boolean default false,
  add column if not exists ssn_back_enc text,
  add column if not exists ssn_masked text,
  add column if not exists zip_code text,
  add column if not exists address1 text,
  add column if not exists address2 text,
  add column if not exists bank_code text,
  add column if not exists bank_name text,
  add column if not exists account_no_enc text,
  add column if not exists account_no_masked text,
  add column if not exists account_holder text,
  add column if not exists biz_reg_no text,
  add column if not exists signature_path text,
  add column if not exists signature_at timestamptz,
  add column if not exists doc_token text,
  add column if not exists doc_path text,
  add column if not exists doc_hash text,
  add column if not exists doc_revoked boolean default false,
  add column if not exists signed_at timestamptz;

create unique index if not exists partner_applications_doc_token_idx
  on public.partner_applications (doc_token)
  where doc_token is not null;
