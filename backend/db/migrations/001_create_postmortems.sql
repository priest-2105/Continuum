-- Continuum: postmortems table
-- Run this in your Supabase SQL editor

create table if not exists postmortems (
  id             text primary key,
  company        text not null,
  title          text not null,
  url            text not null,
  published_at   timestamptz,
  severity       text,
  affected_services text[] default '{}',
  root_cause_category text,
  ai_summary     text,
  tags           text[] default '{}',
  status         text not null default 'pending', 
  created_at     timestamptz default now()
);

-- Index for common queries
create index if not exists idx_postmortems_company  on postmortems(company);
create index if not exists idx_postmortems_status   on postmortems(status);
create index if not exists idx_postmortems_published on postmortems(published_at desc);

-- Row Level Security: public can only read published entries
alter table postmortems enable row level security;

create policy "Public read published"
  on postmortems for select
  using (status = 'published');
