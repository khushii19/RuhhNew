-- Ruhh bakery: initial schema
-- Run in the Supabase SQL editor (or `supabase db push`).

create extension if not exists pgcrypto;

-- ---------- enums ----------
create type order_status as enum (
  'pending', 'confirmed', 'baking', 'out_for_delivery', 'ready_for_pickup', 'delivered', 'cancelled'
);
create type fulfilment_mode as enum ('delivery', 'pickup');
create type payment_method as enum ('cash', 'bank_transfer', 'card');
create type payment_status as enum ('unpaid', 'paid', 'refunded');
create type accent_color as enum ('rose', 'lav', 'sage', 'peach');

-- ---------- helper: updated_at trigger ----------
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- settings (single row) ----------
create table settings (
  id int primary key default 1 check (id = 1),
  business_name text not null default 'Ruhh',
  tagline text not null default 'Baked to perfection · est. 2019',
  owner_name text not null default 'Shweta',
  about_text text not null default 'Ruhh means soul, and that is what Shweta puts into every recipe. Baking from the heart since 2019, made slowly and from scratch.',
  whatsapp_number text not null default '',
  instagram_handle text,
  pickup_address text,
  logo_url text,
  bank_details text,
  closed_weekdays int[] not null default '{}',
  closed_dates date[] not null default '{}',
  slots jsonb not null default '["10 AM – 12 PM","12 PM – 2 PM","2 PM – 4 PM","4 PM – 6 PM","6 PM – 8 PM"]',
  daily_order_cap int,
  default_lead_time_hours int not null default 24,
  free_delivery_over numeric(10,2),
  accept_cash boolean not null default true,
  accept_bank_transfer boolean not null default true,
  updated_at timestamptz not null default now()
);
create trigger settings_updated before update on settings for each row execute function set_updated_at();
insert into settings (id) values (1);

-- ---------- catalogue ----------
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int not null default 0,
  lead_time_hours int,
  created_at timestamptz not null default now()
);

create table menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete set null,
  name text not null,
  description text not null default '',
  emoji text not null default '🍰',
  image_url text,
  mixable boolean not null default false,
  is_available boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger menu_items_updated before update on menu_items for each row execute function set_updated_at();
create index menu_items_category_idx on menu_items(category_id);

create table item_sizes (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references menu_items(id) on delete cascade,
  label text not null,
  piece_count int not null default 1 check (piece_count >= 1),
  price_aed numeric(10,2) not null default 0 check (price_aed >= 0),
  sort_order int not null default 0
);
create index item_sizes_item_idx on item_sizes(item_id);

create table item_flavours (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references menu_items(id) on delete cascade,
  name text not null,
  sort_order int not null default 0
);
create index item_flavours_item_idx on item_flavours(item_id);

create table specials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  emoji text not null default '✨',
  price_aed numeric(10,2) not null default 0 check (price_aed >= 0),
  old_price_aed numeric(10,2),
  tag text,
  accent accent_color not null default 'rose',
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table delivery_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  fee_aed numeric(10,2) not null default 0 check (fee_aed >= 0),
  min_order_aed numeric(10,2) not null default 0 check (min_order_aed >= 0),
  is_active boolean not null default true,
  sort_order int not null default 0
);

-- ---------- orders ----------
create sequence order_ref_seq start 1001;

create table orders (
  id uuid primary key default gen_random_uuid(),
  ref text not null unique default ('RUH-' || nextval('order_ref_seq')::text),
  status order_status not null default 'pending',
  mode fulfilment_mode not null,
  customer_name text not null,
  phone text not null,
  phone_normalized text not null,
  address text,
  zone_id uuid references delivery_zones(id) on delete set null,
  zone_name text,
  slot_date date not null,
  slot_label text not null,
  notes text,
  is_gift boolean not null default false,
  gift_recipient text,
  gift_message text,
  payment_method payment_method not null default 'cash',
  payment_status payment_status not null default 'unpaid',
  subtotal numeric(10,2) not null,
  delivery_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  whatsapp_updates boolean not null default true,
  marketing_opt_in boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger orders_updated before update on orders for each row execute function set_updated_at();
create index orders_phone_idx on orders(phone_normalized);
create index orders_slot_date_idx on orders(slot_date);
create index orders_status_idx on orders(status);
create index orders_created_idx on orders(created_at desc);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  item_id uuid references menu_items(id) on delete set null,
  special_id uuid references specials(id) on delete set null,
  item_name text not null,
  emoji text not null default '',
  size_label text not null default '',
  flavour_text text not null default '',
  unit_price numeric(10,2) not null,
  qty int not null check (qty >= 1),
  line_total numeric(10,2) not null
);
create index order_items_order_idx on order_items(order_id);

create table order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  status order_status not null,
  note text,
  actor text,
  created_at timestamptz not null default now()
);
create index order_events_order_idx on order_events(order_id, created_at);

-- ---------- enquiries (custom cakes) ----------
create table enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  occasion text,
  event_date date,
  servings text,
  description text not null,
  budget_aed numeric(10,2),
  reference_image_url text,
  status text not null default 'new' check (status in ('new','quoted','confirmed','closed')),
  admin_notes text,
  created_at timestamptz not null default now()
);

-- ---------- reviews ----------
create table reviews (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  rating int not null check (rating between 1 and 5),
  body text not null,
  order_ref text,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);
create index reviews_approved_idx on reviews(is_approved, created_at desc);

-- ---------- admins ----------
create table admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  added_by text,
  created_at timestamptz not null default now()
);

-- ---------- whatsapp log ----------
create table whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete set null,
  direction text not null check (direction in ('in','out')),
  wa_message_id text,
  phone text,
  body text,
  template_name text,
  status text,
  payload jsonb,
  created_at timestamptz not null default now()
);
create index whatsapp_messages_order_idx on whatsapp_messages(order_id);
create unique index whatsapp_messages_wa_id_idx on whatsapp_messages(wa_message_id) where wa_message_id is not null;

-- ---------- row level security ----------
-- Public (anon key) may only READ the storefront tables. All writes and all
-- private reads go through the server using the service role key.
alter table settings enable row level security;
alter table categories enable row level security;
alter table menu_items enable row level security;
alter table item_sizes enable row level security;
alter table item_flavours enable row level security;
alter table specials enable row level security;
alter table delivery_zones enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_events enable row level security;
alter table enquiries enable row level security;
alter table reviews enable row level security;
alter table admin_users enable row level security;
alter table whatsapp_messages enable row level security;

grant usage on schema public to anon, authenticated;
grant select on settings, categories, menu_items, item_sizes, item_flavours, specials, delivery_zones, reviews to anon, authenticated;

create policy "public read settings" on settings for select to anon, authenticated using (true);
create policy "public read categories" on categories for select to anon, authenticated using (true);
create policy "public read menu" on menu_items for select to anon, authenticated using (is_available);
create policy "public read sizes" on item_sizes for select to anon, authenticated using (true);
create policy "public read flavours" on item_flavours for select to anon, authenticated using (true);
create policy "public read specials" on specials for select to anon, authenticated using (is_active);
create policy "public read zones" on delivery_zones for select to anon, authenticated using (is_active);
create policy "public read approved reviews" on reviews for select to anon, authenticated using (is_approved);

-- ---------- storage ----------
insert into storage.buckets (id, name, public) values ('media', 'media', true)
on conflict (id) do nothing;
create policy "public read media" on storage.objects for select to anon, authenticated using (bucket_id = 'media');
