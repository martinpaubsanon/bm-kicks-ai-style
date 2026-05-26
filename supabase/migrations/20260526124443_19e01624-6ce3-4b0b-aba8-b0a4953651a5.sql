
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_category_check;
ALTER TABLE public.products ADD CONSTRAINT products_category_check
  CHECK (category = ANY (ARRAY['Running','Basketball','Lifestyle','Training','Skateboarding','Bags','Watches','Cosmetics']));

INSERT INTO public.products (name, description, price, brand, category, style, colors, images, sizes, stock_total, is_featured)
VALUES (
  'Nike Brasilia Backpack',
  'Durable everyday backpack with padded straps, a roomy main compartment, and a dedicated laptop sleeve. Built for gym, school, and street.',
  220.00,
  'Nike',
  'Bags',
  'Backpack',
  ARRAY['Black','Red'],
  ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200','https://images.unsplash.com/photo-1577733966973-d680bffd2e80?w=1200'],
  '{"One Size": 25}'::jsonb,
  25,
  true
);
