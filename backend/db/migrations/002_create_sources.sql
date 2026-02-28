create table if not exists sources (
  id           uuid default gen_random_uuid() primary key,
  company      text not null,
  slug         text not null unique,
  method       text not null default 'github_json',
  config       jsonb not null default '{}',
  active       boolean not null default true,
  last_synced_at timestamptz,
  created_at   timestamptz default now()
);
create index idx_sources_slug on sources(slug);
alter table sources enable row level security;
