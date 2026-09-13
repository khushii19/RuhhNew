-- Home page imagery and featured items
alter table settings
  add column if not exists hero_image_url text,
  add column if not exists about_image_url text;

alter table menu_items
  add column if not exists is_featured boolean not null default false;

alter table specials
  add column if not exists image_url text;
