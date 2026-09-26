-- Allergen note shown in the storefront product view, e.g. "Nuts, gluten, dairy".
-- Free text and optional: nothing is shown until the owner fills it in.
alter table menu_items
  add column if not exists allergens text;
