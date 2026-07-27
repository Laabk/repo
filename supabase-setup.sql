create table if not exists public.reports (
  id text primary key,
  public_token text not null unique,
  template_id text not null,
  title text not null,
  status text not null default 'awaiting_signatures',
  lead_name text not null,
  lead_email text,
  form_data jsonb not null default '{}'::jsonb,
  created_at bigint not null,
  updated_at bigint not null,
  submitted_at bigint
);

create index if not exists reports_status_idx on public.reports(status);
create index if not exists reports_created_at_idx on public.reports(created_at desc);

create table if not exists public.team_members (
  id text primary key,
  report_id text not null references public.reports(id) on delete cascade,
  display_order integer not null,
  assigned_name text not null,
  staff_number text,
  designation text,
  department text,
  phone text,
  email text,
  signature_key text,
  signed_at bigint,
  consent_accepted_at bigint,
  updated_at bigint not null,
  unique(report_id, display_order)
);

create index if not exists team_members_report_idx on public.team_members(report_id);

alter table public.reports enable row level security;
alter table public.team_members enable row level security;

insert into storage.buckets (id, name, public)
values ('signatures', 'signatures', false)
on conflict (id) do nothing;
