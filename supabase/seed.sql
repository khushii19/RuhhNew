-- Ruhh bakery: seed with the real menu from the prototype.
-- Chocolate Bark prices are still pending; they are seeded as unavailable
-- until prices are entered in the admin panel.

update settings set
  -- TODO before launch (or set in Admin → Settings): real WhatsApp number, Instagram, pickup address, bank details.
  whatsapp_number = '',
  instagram_handle = null,
  pickup_address = null,
  bank_details = null,
  default_lead_time_hours = 24
where id = 1;

insert into categories (name, sort_order, lead_time_hours) values
  ('Cookies', 1, 4),
  ('Chocolate Barks', 2, 24),
  ('Tiramisu', 3, 24),
  ('Mono Cheesecakes', 4, 24),
  ('Cheesecakes', 5, 48),
  ('Tea Cakes', 6, 24);

insert into delivery_zones (name, fee_aed, min_order_aed, sort_order) values
  ('Downtown / Business Bay / DIFC', 15, 0, 1),
  ('Dubai Marina / JBR / JLT', 20, 0, 2),
  ('Jumeirah / Umm Suqeim / Al Safa', 15, 0, 3),
  ('Al Barsha / Motor City / Sports City', 20, 0, 4),
  ('Deira / Bur Dubai / Karama', 20, 0, 5),
  ('Mirdif / Silicon Oasis / Academic City', 25, 60, 6),
  ('Arabian Ranches / Damac Hills / Dubailand', 30, 80, 7),
  ('Other Dubai area (fee confirmed on WhatsApp)', 30, 0, 99);

-- Helper to insert an item with sizes and flavours in one go.
create or replace function seed_item(
  p_cat text, p_name text, p_desc text, p_emoji text, p_mixable boolean, p_sort int,
  p_sizes jsonb, p_flavours text[], p_available boolean default true
) returns void language plpgsql as $$
declare
  v_cat uuid; v_item uuid; s jsonb; i int := 0; f text;
begin
  select id into v_cat from categories where name = p_cat;
  insert into menu_items (category_id, name, description, emoji, mixable, sort_order, is_available)
    values (v_cat, p_name, p_desc, p_emoji, p_mixable, p_sort, p_available) returning id into v_item;
  for s in select * from jsonb_array_elements(p_sizes) loop
    i := i + 1;
    insert into item_sizes (item_id, label, piece_count, price_aed, sort_order)
      values (v_item, s->>'label', coalesce((s->>'count')::int, 1), (s->>'price')::numeric, i);
  end loop;
  i := 0;
  foreach f in array p_flavours loop
    i := i + 1;
    insert into item_flavours (item_id, name, sort_order) values (v_item, f, i);
  end loop;
end $$;

-- Cookies
select seed_item('Cookies', 'Build Your Own Cookie Box', 'Pick a box and mix the flavours', '🍪', true, 1,
  '[{"label":"Box of 6","count":6,"price":60},{"label":"Box of 12","count":12,"price":110}]',
  array['Dark Chocolate Chip','Milk Chocolate Chip','White Chocolate Chip']);
select seed_item('Cookies', 'Dark Chocolate Chip Cookies', 'Rich dark chocolate chunks', '🍪', false, 2,
  '[{"label":"Box of 6","count":6,"price":60},{"label":"Box of 12","count":12,"price":110}]', array[]::text[]);
select seed_item('Cookies', 'Milk Chocolate Chip Cookies', 'Classic milk chocolate', '🍪', false, 3,
  '[{"label":"Box of 6","count":6,"price":60},{"label":"Box of 12","count":12,"price":110}]', array[]::text[]);
select seed_item('Cookies', 'White Chocolate Chip Cookies', 'Creamy white chocolate', '🍪', false, 4,
  '[{"label":"Box of 6","count":6,"price":60},{"label":"Box of 12","count":12,"price":110}]', array[]::text[]);

-- Chocolate Barks (prices pending → unavailable until set in admin)
select seed_item('Chocolate Barks', 'Build Your Own Bark Box', 'Pick a box and mix the bark flavours', '🍫', true, 1,
  '[{"label":"Box of 3 bars","count":3,"price":0},{"label":"Box of 6 bars","count":6,"price":0}]',
  array['Milk + Pistachio','Dark + Orange Rind','White + Nuts'], false);
select seed_item('Chocolate Barks', 'Milk Chocolate with Pistachio', 'Milk chocolate, roasted pistachio', '🍫', false, 2,
  '[{"label":"100g","price":0},{"label":"250g","price":0},{"label":"500g","price":0},{"label":"1Kg","price":0}]', array[]::text[], false);
select seed_item('Chocolate Barks', 'Dark Chocolate with Orange Rind', 'Dark chocolate, candied orange', '🍫', false, 3,
  '[{"label":"100g","price":0},{"label":"250g","price":0},{"label":"500g","price":0},{"label":"1Kg","price":0}]', array[]::text[], false);
select seed_item('Chocolate Barks', 'White Chocolate with Nuts', 'White chocolate, mixed nuts', '🍫', false, 4,
  '[{"label":"100g","price":0},{"label":"250g","price":0},{"label":"500g","price":0},{"label":"1Kg","price":0}]', array[]::text[], false);

-- Tiramisu
select seed_item('Tiramisu', 'Classic Tiramisu', 'Espresso-soaked layers, mascarpone, cocoa', '☕', false, 1,
  '[{"label":"250g","price":35},{"label":"500g","price":85},{"label":"1Kg","price":160}]', array[]::text[]);

-- Mono Cheesecakes
select seed_item('Mono Cheesecakes', 'Biscoff Mono Cheesecake', 'Single-serve, Biscoff crumb', '🧁', false, 1,
  '[{"label":"Single serve","price":35}]', array[]::text[]);
select seed_item('Mono Cheesecakes', 'Nutella Mono Cheesecake', 'Single-serve, Nutella swirl', '🧁', false, 2,
  '[{"label":"Single serve","price":35}]', array[]::text[]);
select seed_item('Mono Cheesecakes', 'Baked New York Mono Cheesecake', 'Single-serve, classic baked', '🧁', false, 3,
  '[{"label":"Single serve","price":35}]', array[]::text[]);

-- Cheesecakes
select seed_item('Cheesecakes', 'Biscoff Cheesecake', 'Biscoff base & topping', '🍰', false, 1,
  '[{"label":"500g","price":85},{"label":"1Kg","price":160}]', array[]::text[]);
select seed_item('Cheesecakes', 'Nutella Cheesecake', 'Rich Nutella filling', '🍰', false, 2,
  '[{"label":"500g","price":85},{"label":"1Kg","price":160}]', array[]::text[]);
select seed_item('Cheesecakes', 'Baked New York Cheesecake', 'Classic baked New York style', '🍰', false, 3,
  '[{"label":"500g","price":85},{"label":"1Kg","price":160}]', array[]::text[]);

-- Tea Cakes
select seed_item('Tea Cakes', 'Almond Blueberry Tea Cake', 'Almond sponge, fresh blueberries', '🫐', false, 1,
  '[{"label":"500g","price":85},{"label":"1Kg","price":165}]', array[]::text[]);
select seed_item('Tea Cakes', 'Chocolate Strawberry Tea Cake', 'Chocolate sponge, strawberry', '🍓', false, 2,
  '[{"label":"500g","price":65},{"label":"1Kg","price":110}]', array[]::text[]);
select seed_item('Tea Cakes', 'Orange Tea Cake', 'Zesty orange loaf', '🍊', false, 3,
  '[{"label":"500g","price":65},{"label":"1Kg","price":110}]', array[]::text[]);
select seed_item('Tea Cakes', 'Flourless Chocolate Cake', 'Dense, gluten-free chocolate', '🍫', false, 4,
  '[{"label":"500g","price":80},{"label":"1Kg","price":165}]', array[]::text[]);

drop function seed_item(text, text, text, text, boolean, int, jsonb, text[], boolean);

insert into specials (name, description, emoji, price_aed, tag, accent, sort_order) values
  ('Classic Tiramisu', 'Our signature 500g tiramisu: espresso-soaked layers and mascarpone cream.', '☕', 85, 'Bestseller', 'lav', 1),
  ('Biscoff Cheesecake', 'Creamy Biscoff cheesecake, 500g. A weekend favourite.', '🍰', 85, 'Popular', 'peach', 2);

-- Photos generated for launch (replace from Admin → Menu as real photography comes in)
update menu_items set image_url = 'https://mcp.portermetrics.com/creative/asset/eyJjbyI6IjhjYTM0YWFmLWRiNjYtNGE4Zi1hYTc0LTFjNDljMmY2ZTI2NCIsImoiOiIyZGJlNmViNi1jOThmLTQ5NGQtYTkwMS1kNDkxN2UzMGZlNDIiLCJ1IjoiZ3M6Ly9wb3J0ZXItbWNwLWhpZ2dzZmllbGQtcHJvZC84Y2EzNGFhZi1kYjY2LTRhOGYtYWE3NC0xYzQ5YzJmNmUyNjQvMmRiZTZlYjYtYzk4Zi00OTRkLWE5MDEtZDQ5MTdlMzBmZTQyL2U2ZmJjMzM2LTJjNDQtNDQxYy1iMGIyLTE4OTRkYmMzNmZmZi5wbmciLCJrIjoiaW1hZ2UifQ.8af9840ecab2d86fc3499357d981f41afea6a294dfd6575663947c22f32a72dc', is_featured = true where name = 'Build Your Own Cookie Box';
update menu_items set image_url = 'https://mcp.portermetrics.com/creative/asset/eyJjbyI6IjhjYTM0YWFmLWRiNjYtNGE4Zi1hYTc0LTFjNDljMmY2ZTI2NCIsImoiOiI5NWM2YThlNC0zNDhmLTQ5ZjEtYTMzYS0yZTdjMWVjZDc2MTciLCJ1IjoiZ3M6Ly9wb3J0ZXItbWNwLWhpZ2dzZmllbGQtcHJvZC84Y2EzNGFhZi1kYjY2LTRhOGYtYWE3NC0xYzQ5YzJmNmUyNjQvOTVjNmE4ZTQtMzQ4Zi00OWYxLWEzM2EtMmU3YzFlY2Q3NjE3LzQ0YTRlMWNiLTdhOWMtNDA3My1iNTc4LWJkOGRlZDQyMjEwZC5wbmciLCJrIjoiaW1hZ2UifQ.3bd135f1b7a2ec87e964ab5262425f7ba7bd9a2aa2f7534bf7acc3ae5a973501' where name = 'Dark Chocolate Chip Cookies';
update menu_items set image_url = 'https://mcp.portermetrics.com/creative/asset/eyJjbyI6IjhjYTM0YWFmLWRiNjYtNGE4Zi1hYTc0LTFjNDljMmY2ZTI2NCIsImoiOiJhMDlmNDI0OS02NjUwLTQxNmQtYmEzNS1iN2U4ZDAzMmE1MzYiLCJ1IjoiZ3M6Ly9wb3J0ZXItbWNwLWhpZ2dzZmllbGQtcHJvZC84Y2EzNGFhZi1kYjY2LTRhOGYtYWE3NC0xYzQ5YzJmNmUyNjQvYTA5ZjQyNDktNjY1MC00MTZkLWJhMzUtYjdlOGQwMzJhNTM2LzIwZTVmNzU4LWEwYmItNDIyNS1hYTc4LTE3NGQ4ZDA4MmM3Zi5wbmciLCJrIjoiaW1hZ2UifQ.554fc5d7d23aabc6edfa25b58861ff5d4c5ba87ab0fbc2af00e9fe5b0de09ca1' where name = 'Milk Chocolate Chip Cookies';
update menu_items set image_url = 'https://mcp.portermetrics.com/creative/asset/eyJjbyI6IjhjYTM0YWFmLWRiNjYtNGE4Zi1hYTc0LTFjNDljMmY2ZTI2NCIsImoiOiI2MDk5MDM2YS1jNzFjLTRlM2ItYTdhYS05ZjM3NmYwNzhlNzAiLCJ1IjoiZ3M6Ly9wb3J0ZXItbWNwLWhpZ2dzZmllbGQtcHJvZC84Y2EzNGFhZi1kYjY2LTRhOGYtYWE3NC0xYzQ5YzJmNmUyNjQvNjA5OTAzNmEtYzcxYy00ZTNiLWE3YWEtOWYzNzZmMDc4ZTcwLzRhNjhmMzQ4LTZiZWItNDIyNy05NjFlLWNkNzRhYzhkMTFlYy5wbmciLCJrIjoiaW1hZ2UifQ.7c7c399da0d4e98a57a7af5ca9df1a0b35c9ff3c5b52230ec3268ad62a12d09e' where name = 'White Chocolate Chip Cookies';
update menu_items set image_url = 'https://mcp.portermetrics.com/creative/asset/eyJjbyI6IjhjYTM0YWFmLWRiNjYtNGE4Zi1hYTc0LTFjNDljMmY2ZTI2NCIsImoiOiJkMzIzMTZiZC02YmU3LTQzODUtODUxYS04ZmE4NjBiZWU1ZGYiLCJ1IjoiZ3M6Ly9wb3J0ZXItbWNwLWhpZ2dzZmllbGQtcHJvZC84Y2EzNGFhZi1kYjY2LTRhOGYtYWE3NC0xYzQ5YzJmNmUyNjQvZDMyMzE2YmQtNmJlNy00Mzg1LTg1MWEtOGZhODYwYmVlNWRmL2Q0ZDY0Y2JjLTViMmQtNGMxZS1hMjYzLTdmMmI1YjczZTMyMC5wbmciLCJrIjoiaW1hZ2UifQ.f8c9804981c2ea781f4c513ecb52d06e18e1dac8e7a11a95e8da994f38a00909' where name = 'Build Your Own Bark Box';
update menu_items set image_url = 'https://mcp.portermetrics.com/creative/asset/eyJjbyI6IjhjYTM0YWFmLWRiNjYtNGE4Zi1hYTc0LTFjNDljMmY2ZTI2NCIsImoiOiIwYjI2NDA5Mi1lMzY2LTRiMDQtYTAxYS0xNWNkM2Y5MTc5YjMiLCJ1IjoiZ3M6Ly9wb3J0ZXItbWNwLWhpZ2dzZmllbGQtcHJvZC84Y2EzNGFhZi1kYjY2LTRhOGYtYWE3NC0xYzQ5YzJmNmUyNjQvMGIyNjQwOTItZTM2Ni00YjA0LWEwMWEtMTVjZDNmOTE3OWIzLzdiZDA0OTA0LTM3ODMtNGU1OS1hMTM3LWIyZDNhYTBhOGRjNS5wbmciLCJrIjoiaW1hZ2UifQ.2b63f71f9c0899dfee5070657d7059099af1fa6b107b1d045be0a70acf1d992c' where name = 'Milk Chocolate with Pistachio';
update menu_items set image_url = 'https://mcp.portermetrics.com/creative/asset/eyJjbyI6IjhjYTM0YWFmLWRiNjYtNGE4Zi1hYTc0LTFjNDljMmY2ZTI2NCIsImoiOiI0YWI3MWY3ZS0wMDI5LTQ4MmMtYWUwNi1kOTUyMWE1NjYxZGQiLCJ1IjoiZ3M6Ly9wb3J0ZXItbWNwLWhpZ2dzZmllbGQtcHJvZC84Y2EzNGFhZi1kYjY2LTRhOGYtYWE3NC0xYzQ5YzJmNmUyNjQvNGFiNzFmN2UtMDAyOS00ODJjLWFlMDYtZDk1MjFhNTY2MWRkLzczMmRhMTlkLWFiMDEtNDY0Zi1iY2YxLWIxNDc1YWI4ODA3Ni5wbmciLCJrIjoiaW1hZ2UifQ.dab0c52112911197e9e19ade8bfceb99f9ee1e3df78e03284e0a165fe935b968' where name = 'Dark Chocolate with Orange Rind';
update menu_items set image_url = 'https://mcp.portermetrics.com/creative/asset/eyJjbyI6IjhjYTM0YWFmLWRiNjYtNGE4Zi1hYTc0LTFjNDljMmY2ZTI2NCIsImoiOiI5MGUzYzc4Ny0xNWIyLTQzYmYtYTM2Ni1jMWU1MWRhZGJkYTMiLCJ1IjoiZ3M6Ly9wb3J0ZXItbWNwLWhpZ2dzZmllbGQtcHJvZC84Y2EzNGFhZi1kYjY2LTRhOGYtYWE3NC0xYzQ5YzJmNmUyNjQvOTBlM2M3ODctMTViMi00M2JmLWEzNjYtYzFlNTFkYWRiZGEzLzgwN2I4N2Q5LWIwOTQtNDhjNC1iNzY5LTU3ODU5YzcwZTM1YS5wbmciLCJrIjoiaW1hZ2UifQ.de0fde028a69767164967c88a8da404e42ca4150687445dfeb068130979cdba4' where name = 'White Chocolate with Nuts';
update menu_items set image_url = 'https://mcp.portermetrics.com/creative/asset/eyJjbyI6IjhjYTM0YWFmLWRiNjYtNGE4Zi1hYTc0LTFjNDljMmY2ZTI2NCIsImoiOiI1NGQ3OTVlNy01ZDliLTQ1ODMtYmU5Zi0yODFkNTJhOTVhNjUiLCJ1IjoiZ3M6Ly9wb3J0ZXItbWNwLWhpZ2dzZmllbGQtcHJvZC84Y2EzNGFhZi1kYjY2LTRhOGYtYWE3NC0xYzQ5YzJmNmUyNjQvNTRkNzk1ZTctNWQ5Yi00NTgzLWJlOWYtMjgxZDUyYTk1YTY1LzQyMjdiMGE0LWUzNWMtNDVlNS1hMjFiLTNjMDI2NTdkOGQzMC5wbmciLCJrIjoiaW1hZ2UifQ.b126091a525215c51eba7a968b06081ef811ec2dc20c0a00362274b9f2208e4a', is_featured = true where name = 'Classic Tiramisu';
update menu_items set image_url = 'https://mcp.portermetrics.com/creative/asset/eyJjbyI6IjhjYTM0YWFmLWRiNjYtNGE4Zi1hYTc0LTFjNDljMmY2ZTI2NCIsImoiOiJkZjIyZmYyMS02MDJmLTQ3ODAtYjdiYy0xOTAxZWI0MDhiY2UiLCJ1IjoiZ3M6Ly9wb3J0ZXItbWNwLWhpZ2dzZmllbGQtcHJvZC84Y2EzNGFhZi1kYjY2LTRhOGYtYWE3NC0xYzQ5YzJmNmUyNjQvZGYyMmZmMjEtNjAyZi00NzgwLWI3YmMtMTkwMWViNDA4YmNlLzdlYjcxMmJmLTgwMGMtNDQ1NC1iMzI4LWIwYmI2YTVkOTIzYy5wbmciLCJrIjoiaW1hZ2UifQ.6aaff768f9c9c29c4900fa76c53a93f17e6c34b69eef72905d47910e7877a36c' where name = 'Biscoff Mono Cheesecake';
update menu_items set image_url = 'https://mcp.portermetrics.com/creative/asset/eyJjbyI6IjhjYTM0YWFmLWRiNjYtNGE4Zi1hYTc0LTFjNDljMmY2ZTI2NCIsImoiOiIwNzUyOGViNS02OGQwLTRiYWEtYjA5Ny00NDcwNDMwYTNlY2IiLCJ1IjoiZ3M6Ly9wb3J0ZXItbWNwLWhpZ2dzZmllbGQtcHJvZC84Y2EzNGFhZi1kYjY2LTRhOGYtYWE3NC0xYzQ5YzJmNmUyNjQvMDc1MjhlYjUtNjhkMC00YmFhLWIwOTctNDQ3MDQzMGEzZWNiL2IxMGY5ZmIwLWQ0MjctNDBjYS04MmJjLTY0OTNmOTBmYjE1NS5wbmciLCJrIjoiaW1hZ2UifQ.e5b1cbf7d7510177f2805221629573c06e4dc85e2575d426b12807eda4d44746' where name = 'Nutella Mono Cheesecake';
update menu_items set image_url = 'https://mcp.portermetrics.com/creative/asset/eyJjbyI6IjhjYTM0YWFmLWRiNjYtNGE4Zi1hYTc0LTFjNDljMmY2ZTI2NCIsImoiOiI3NzI2MWRiNC03ZmUwLTRjMWUtYWE5Ni0wM2ZlMTRkMGE5M2YiLCJ1IjoiZ3M6Ly9wb3J0ZXItbWNwLWhpZ2dzZmllbGQtcHJvZC84Y2EzNGFhZi1kYjY2LTRhOGYtYWE3NC0xYzQ5YzJmNmUyNjQvNzcyNjFkYjQtN2ZlMC00YzFlLWFhOTYtMDNmZTE0ZDBhOTNmL2M2ZWM1NjEzLWNmMTctNDk4Mi1iZmMwLWQxOWU1NTEzMmE2OC5wbmciLCJrIjoiaW1hZ2UifQ.6a9ced14447fed9c6cc60bd6050af3b5770877c991dc8c343e07d86bf9773349' where name = 'Baked New York Mono Cheesecake';
update menu_items set image_url = 'https://mcp.portermetrics.com/creative/asset/eyJjbyI6IjhjYTM0YWFmLWRiNjYtNGE4Zi1hYTc0LTFjNDljMmY2ZTI2NCIsImoiOiJiN2NjMjczOC0xMDc5LTQyZGYtODMyNy0yMTJmNTRiM2FiNWUiLCJ1IjoiZ3M6Ly9wb3J0ZXItbWNwLWhpZ2dzZmllbGQtcHJvZC84Y2EzNGFhZi1kYjY2LTRhOGYtYWE3NC0xYzQ5YzJmNmUyNjQvYjdjYzI3MzgtMTA3OS00MmRmLTgzMjctMjEyZjU0YjNhYjVlLzkyMGI3ZjE1LWI1OTItNDNiMS1iNjNmLWE4NmZmNzI3YTc1Ni5wbmciLCJrIjoiaW1hZ2UifQ.84c752f3060c6e568c5547f66102fc9569100072209aa742fa1137a09facdaba', is_featured = true where name = 'Biscoff Cheesecake';
update menu_items set image_url = 'https://mcp.portermetrics.com/creative/asset/eyJjbyI6IjhjYTM0YWFmLWRiNjYtNGE4Zi1hYTc0LTFjNDljMmY2ZTI2NCIsImoiOiI0ZDhjMmI5ZC04MTZiLTQ0ZTMtYjVkZS1jZWZiZjdjYjZmODMiLCJ1IjoiZ3M6Ly9wb3J0ZXItbWNwLWhpZ2dzZmllbGQtcHJvZC84Y2EzNGFhZi1kYjY2LTRhOGYtYWE3NC0xYzQ5YzJmNmUyNjQvNGQ4YzJiOWQtODE2Yi00NGUzLWI1ZGUtY2VmYmY3Y2I2ZjgzL2NmMjFkMjEwLTljOTUtNDBkYy1iY2ZjLTY3ZDRmYTQ2NWRlNi5wbmciLCJrIjoiaW1hZ2UifQ.bfcd9fb4547a31feb4a29ce78633587090762801800e27547dd95ed62a274345' where name = 'Nutella Cheesecake';
update menu_items set image_url = 'https://mcp.portermetrics.com/creative/asset/eyJjbyI6IjhjYTM0YWFmLWRiNjYtNGE4Zi1hYTc0LTFjNDljMmY2ZTI2NCIsImoiOiJmY2RkZjNlMS0yYmNkLTRkYWQtYWYxOS1lMjkzYjNiM2NkMmMiLCJ1IjoiZ3M6Ly9wb3J0ZXItbWNwLWhpZ2dzZmllbGQtcHJvZC84Y2EzNGFhZi1kYjY2LTRhOGYtYWE3NC0xYzQ5YzJmNmUyNjQvZmNkZGYzZTEtMmJjZC00ZGFkLWFmMTktZTI5M2IzYjNjZDJjL2YzY2FhOTA3LWRmN2MtNGRkMC04MjlhLTM3M2FiNmM0NzAwMC5wbmciLCJrIjoiaW1hZ2UifQ.b7dfae5c0421543ceb48224d8570ecf6f76ec723e6a9d6455704a33e1011d50b' where name = 'Baked New York Cheesecake';
update menu_items set image_url = 'https://mcp.portermetrics.com/creative/asset/eyJjbyI6IjhjYTM0YWFmLWRiNjYtNGE4Zi1hYTc0LTFjNDljMmY2ZTI2NCIsImoiOiIyNDMwNmRkOS00ZWZkLTRmZTAtYWI3Ny00NDI5M2Q1MTA2MjciLCJ1IjoiZ3M6Ly9wb3J0ZXItbWNwLWhpZ2dzZmllbGQtcHJvZC84Y2EzNGFhZi1kYjY2LTRhOGYtYWE3NC0xYzQ5YzJmNmUyNjQvMjQzMDZkZDktNGVmZC00ZmUwLWFiNzctNDQyOTNkNTEwNjI3L2Y4MGNlMWYyLTM4MGQtNGNmNC1hNTZlLTBmOTRjYjZhMzkzOC5wbmciLCJrIjoiaW1hZ2UifQ.7fced2b807aa41a365fba7ab6cbc91bca3cf984fc45fa03ceae8b6ef1ea81bbf', is_featured = true where name = 'Almond Blueberry Tea Cake';
update menu_items set image_url = 'https://mcp.portermetrics.com/creative/asset/eyJjbyI6IjhjYTM0YWFmLWRiNjYtNGE4Zi1hYTc0LTFjNDljMmY2ZTI2NCIsImoiOiIwODdiYzliYS0zNTM2LTQyZWMtODc4MC0zMjE0YTZjMGM3NTYiLCJ1IjoiZ3M6Ly9wb3J0ZXItbWNwLWhpZ2dzZmllbGQtcHJvZC84Y2EzNGFhZi1kYjY2LTRhOGYtYWE3NC0xYzQ5YzJmNmUyNjQvMDg3YmM5YmEtMzUzNi00MmVjLTg3ODAtMzIxNGE2YzBjNzU2LzA2MTJhYThkLWM0MzAtNDRkMi04NjhhLTcxMzc5YjY1ZjFkYi5wbmciLCJrIjoiaW1hZ2UifQ.d1be6fb05d5deafbc2850f7fea3eea6107c98bb93d57a2080a3aee7aeef74a37' where name = 'Chocolate Strawberry Tea Cake';
update menu_items set image_url = 'https://mcp.portermetrics.com/creative/asset/eyJjbyI6IjhjYTM0YWFmLWRiNjYtNGE4Zi1hYTc0LTFjNDljMmY2ZTI2NCIsImoiOiIyMTEzNmM4My1iZmM4LTRkNjUtODc5OS05MTBiNGVlZWRjMGIiLCJ1IjoiZ3M6Ly9wb3J0ZXItbWNwLWhpZ2dzZmllbGQtcHJvZC84Y2EzNGFhZi1kYjY2LTRhOGYtYWE3NC0xYzQ5YzJmNmUyNjQvMjExMzZjODMtYmZjOC00ZDY1LTg3OTktOTEwYjRlZWVkYzBiL2I0OTRlZGJhLTAzZjEtNDBkMC1iMTkzLTdlMjVkZDk1YjJmOC5wbmciLCJrIjoiaW1hZ2UifQ.f81d22e56514582d205816352bc559f5cf9c0b217266d116244a79bc63acbb2d' where name = 'Orange Tea Cake';
update menu_items set image_url = 'https://mcp.portermetrics.com/creative/asset/eyJjbyI6IjhjYTM0YWFmLWRiNjYtNGE4Zi1hYTc0LTFjNDljMmY2ZTI2NCIsImoiOiJkZGE5NzEyMy1jMmNjLTQ1MDAtYjQ0Ni0wM2VlNGY4MWM1NWMiLCJ1IjoiZ3M6Ly9wb3J0ZXItbWNwLWhpZ2dzZmllbGQtcHJvZC84Y2EzNGFhZi1kYjY2LTRhOGYtYWE3NC0xYzQ5YzJmNmUyNjQvZGRhOTcxMjMtYzJjYy00NTAwLWI0NDYtMDNlZTRmODFjNTVjL2RmYjIwZWQ3LTUzMDItNDQ5MS04MjRhLTdlZWMwNTllOGY0OS5wbmciLCJrIjoiaW1hZ2UifQ.09285e66f274f61673d4e114794a8f83f51862b22fd26de2bad59a910d739146' where name = 'Flourless Chocolate Cake';
update settings set hero_image_url = 'https://mcp.portermetrics.com/creative/asset/eyJjbyI6IjhjYTM0YWFmLWRiNjYtNGE4Zi1hYTc0LTFjNDljMmY2ZTI2NCIsImoiOiIzZjIwOTIzNS00OTM5LTRlODYtOTAyMi1kMWVhYTIyM2FlNzQiLCJ1IjoiZ3M6Ly9wb3J0ZXItbWNwLWhpZ2dzZmllbGQtcHJvZC84Y2EzNGFhZi1kYjY2LTRhOGYtYWE3NC0xYzQ5YzJmNmUyNjQvM2YyMDkyMzUtNDkzOS00ZTg2LTkwMjItZDFlYWEyMjNhZTc0LzcxNjY2NDUwLWQyYTMtNDBjZC04YjViLThjODIyODNmNGU5NC5wbmciLCJrIjoiaW1hZ2UifQ.9ab01592b94434bc4d85d937a7e9d5c9f629a6fd19bde44bf9e064373dfdfcd8', about_image_url = 'https://mcp.portermetrics.com/creative/asset/eyJjbyI6IjhjYTM0YWFmLWRiNjYtNGE4Zi1hYTc0LTFjNDljMmY2ZTI2NCIsImoiOiI1ZGVlMjgwMi01OWE2LTRkM2EtOWI2Yi0zN2ZjYTA1YjEyMGQiLCJ1IjoiZ3M6Ly9wb3J0ZXItbWNwLWhpZ2dzZmllbGQtcHJvZC84Y2EzNGFhZi1kYjY2LTRhOGYtYWE3NC0xYzQ5YzJmNmUyNjQvNWRlZTI4MDItNTlhNi00ZDNhLTliNmItMzdmY2EwNWIxMjBkL2M4YzJmYWQxLWY5NDMtNDVkOC1hYjg2LTQ4MjUxMDU0M2E0ZS5wbmciLCJrIjoiaW1hZ2UifQ.5e924ebfde3403628c205b809caff170a826cb52b444874ee7193bef7e68011e' where id = 1;
update specials set image_url = 'https://mcp.portermetrics.com/creative/asset/eyJjbyI6IjhjYTM0YWFmLWRiNjYtNGE4Zi1hYTc0LTFjNDljMmY2ZTI2NCIsImoiOiI1NGQ3OTVlNy01ZDliLTQ1ODMtYmU5Zi0yODFkNTJhOTVhNjUiLCJ1IjoiZ3M6Ly9wb3J0ZXItbWNwLWhpZ2dzZmllbGQtcHJvZC84Y2EzNGFhZi1kYjY2LTRhOGYtYWE3NC0xYzQ5YzJmNmUyNjQvNTRkNzk1ZTctNWQ5Yi00NTgzLWJlOWYtMjgxZDUyYTk1YTY1LzQyMjdiMGE0LWUzNWMtNDVlNS1hMjFiLTNjMDI2NTdkOGQzMC5wbmciLCJrIjoiaW1hZ2UifQ.b126091a525215c51eba7a968b06081ef811ec2dc20c0a00362274b9f2208e4a' where name = 'Classic Tiramisu';
update specials set image_url = 'https://mcp.portermetrics.com/creative/asset/eyJjbyI6IjhjYTM0YWFmLWRiNjYtNGE4Zi1hYTc0LTFjNDljMmY2ZTI2NCIsImoiOiJiN2NjMjczOC0xMDc5LTQyZGYtODMyNy0yMTJmNTRiM2FiNWUiLCJ1IjoiZ3M6Ly9wb3J0ZXItbWNwLWhpZ2dzZmllbGQtcHJvZC84Y2EzNGFhZi1kYjY2LTRhOGYtYWE3NC0xYzQ5YzJmNmUyNjQvYjdjYzI3MzgtMTA3OS00MmRmLTgzMjctMjEyZjU0YjNhYjVlLzkyMGI3ZjE1LWI1OTItNDNiMS1iNjNmLWE4NmZmNzI3YTc1Ni5wbmciLCJrIjoiaW1hZ2UifQ.84c752f3060c6e568c5547f66102fc9569100072209aa742fa1137a09facdaba' where name = 'Biscoff Cheesecake';

-- First admin: replace with Shweta's real email before running.
insert into admin_users (email, name, added_by) values ('shweta@example.com', 'Shweta', 'seed')
on conflict (email) do nothing;
