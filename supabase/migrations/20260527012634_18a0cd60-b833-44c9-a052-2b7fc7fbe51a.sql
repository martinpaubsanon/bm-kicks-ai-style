
-- Navy (default) — inherits product images, sizes and price
INSERT INTO public.product_colorways
  (product_id, name, slug, swatch_hex, images, sizes, stock_total, price_override, is_default, is_preorder, is_limited_edition, sort_order)
VALUES
  ('e9273037-b2f3-4ed8-a24e-ac71902f8496', 'Navy', 'navy', '#1c2a4a', '{}', '{}'::jsonb, 3, NULL, true, true, true, 0);

-- Pine Green — inquiry only (price 0, stock 0 = message-us signal)
INSERT INTO public.product_colorways
  (product_id, name, slug, swatch_hex, images, sizes, stock_total, price_override, is_default, is_preorder, is_limited_edition, sort_order)
VALUES
  ('e9273037-b2f3-4ed8-a24e-ac71902f8496', 'Pine Green', 'pine-green', '#1f3d2a', '{}', '{}'::jsonb, 0, 0, false, true, true, 10);

-- Sapphire — inquiry only
INSERT INTO public.product_colorways
  (product_id, name, slug, swatch_hex, images, sizes, stock_total, price_override, is_default, is_preorder, is_limited_edition, sort_order)
VALUES
  ('e9273037-b2f3-4ed8-a24e-ac71902f8496', 'Sapphire', 'sapphire', '#0f52ba', '{}', '{}'::jsonb, 0, 0, false, true, true, 20);

-- Black / White — inquiry only
INSERT INTO public.product_colorways
  (product_id, name, slug, swatch_hex, images, sizes, stock_total, price_override, is_default, is_preorder, is_limited_edition, sort_order)
VALUES
  ('e9273037-b2f3-4ed8-a24e-ac71902f8496', 'Black / White', 'black-white', '#0a0a0a', '{}', '{}'::jsonb, 0, 0, false, true, true, 30);
