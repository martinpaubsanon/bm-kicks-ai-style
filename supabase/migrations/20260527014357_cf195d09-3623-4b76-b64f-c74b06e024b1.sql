
-- Remove Sapphire and Black/White colorways (only Navy, Pine Green, Red exist)
DELETE FROM product_colorways WHERE id IN ('1eefa24a-cdd9-4135-acfe-9dd3f81c2b8b','38335bad-c20e-4d56-b82d-64b48184d65c');

-- Add Red (rarest) — inquiry-only
INSERT INTO product_colorways (
  product_id, name, slug, swatch_hex, images, sizes, stock_total,
  price_override, is_default, is_preorder, is_limited_edition, sort_order
) VALUES (
  'e9273037-b2f3-4ed8-a24e-ac71902f8496',
  'University Red',
  'red',
  '#c8102e',
  ARRAY[
    'https://optuhyfoqurwgadcdqnb.supabase.co/storage/v1/object/public/product-images/colorways/e9273037-red.png',
    'https://optuhyfoqurwgadcdqnb.supabase.co/storage/v1/object/public/product-images/colorways/e9273037-red-side.png',
    'https://optuhyfoqurwgadcdqnb.supabase.co/storage/v1/object/public/product-images/colorways/e9273037-red-back.png'
  ],
  '{}'::jsonb,
  0,
  0,
  false,
  false,
  true,
  20
);
