alter table public.partner_applications
  add column if not exists emp_pswd_enc text;
