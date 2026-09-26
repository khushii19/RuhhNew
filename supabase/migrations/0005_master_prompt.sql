-- Order refs by day, sold-out items, dated specials and an internal order note.
-- Safe to run more than once.

-- ---------- order refs: RUH-YYMMDD-NNN ----------
-- One counter row per Dubai calendar day; the upsert takes a row lock, so
-- two orders placed at the same moment still get different numbers.
create table if not exists order_ref_counters (
  day date primary key,
  n int not null default 0
);
alter table order_ref_counters enable row level security;

create or replace function next_order_ref() returns text
language plpgsql
as $$
declare
  d date := (now() at time zone 'Asia/Dubai')::date;
  seq int;
begin
  insert into order_ref_counters as c (day, n) values (d, 1)
  on conflict (day) do update set n = c.n + 1
  returning n into seq;
  return 'RUH-' || to_char(d, 'YYMMDD') || '-' || lpad(seq::text, 3, '0');
end;
$$;

-- Earlier refs (RUH-1001 …) stay valid; only new orders use the new form.
alter table orders alter column ref set default next_order_ref();

-- ---------- orders: private note for the baker ----------
alter table orders add column if not exists admin_note text;

-- ---------- menu items: sold out (still listed, can't be ordered) ----------
alter table menu_items add column if not exists is_sold_out boolean not null default false;

-- ---------- specials: optional show-from / show-until dates ----------
alter table specials add column if not exists starts_on date;
alter table specials add column if not exists ends_on date;
