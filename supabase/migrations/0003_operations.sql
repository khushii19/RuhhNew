-- Operational safeguards and admin flexibility
alter table settings
  add column if not exists slot_capacity int check (slot_capacity is null or slot_capacity >= 1),
  add column if not exists tax_note text;

alter table orders
  add column if not exists adjustment_aed numeric(10,2) not null default 0,
  add column if not exists adjustment_note text;

-- Keeps the free-tier project awake: touched by the daily health check.
create table if not exists heartbeats (
  id int primary key default 1 check (id = 1),
  last_seen timestamptz not null default now()
);
insert into heartbeats (id) values (1) on conflict (id) do nothing;
alter table heartbeats enable row level security;
