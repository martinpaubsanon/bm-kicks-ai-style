-- Drop the old constraint
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;

-- Update existing products to new categories
UPDATE products SET category = 'Running' WHERE category = 'mens';
UPDATE products SET category = 'Basketball' WHERE category = 'womens';
UPDATE products SET category = 'Lifestyle' WHERE category = 'limited';

-- Add new constraint with updated categories
ALTER TABLE products ADD CONSTRAINT products_category_check 
  CHECK (category IN ('Running', 'Basketball', 'Lifestyle', 'Training', 'Skateboarding'));