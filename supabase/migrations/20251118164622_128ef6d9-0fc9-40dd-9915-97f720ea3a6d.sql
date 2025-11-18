-- Remove the style constraint to allow any style values
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_style_check;