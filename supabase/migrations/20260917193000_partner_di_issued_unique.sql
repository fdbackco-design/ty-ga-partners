-- DI는 코드 발급(ISSUED)된 건만 중복을 막습니다. 진행 중 신청은 같은 DI로 재개할 수 있습니다.
alter table public.partner_applications drop constraint if exists partner_applications_cert_di_key;

create unique index if not exists partner_applications_issued_di_idx
  on public.partner_applications (cert_di)
  where status = 'ISSUED' and cert_di is not null;
