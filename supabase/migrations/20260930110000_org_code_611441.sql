-- 잘못된 기본 조직코드 611361을 611441로 고칩니다.
alter table public.ga_channels
  alter column org_code set default '611441';

update public.ga_channels
  set org_code = '611441',
      updated_at = now()
  where org_code = '611361';

update public.partner_applications
  set org_code = '611441',
      updated_at = now()
  where org_code = '611361';
