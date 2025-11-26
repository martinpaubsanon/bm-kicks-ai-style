-- Add discount tracking columns to order_items
ALTER TABLE order_items
ADD COLUMN original_price NUMERIC NOT NULL DEFAULT 0,
ADD COLUMN actual_price NUMERIC NOT NULL DEFAULT 0,
ADD COLUMN discount_amount NUMERIC GENERATED ALWAYS AS ((original_price - actual_price) * quantity) STORED;

-- Add discount tracking to orders
ALTER TABLE orders
ADD COLUMN discount_total NUMERIC NOT NULL DEFAULT 0;

-- Populate existing data with current prices (assuming no historical discounts)
UPDATE order_items
SET original_price = price,
    actual_price = price;

UPDATE orders
SET discount_total = 0;

-- Create function to recalculate order totals when actual_price changes
CREATE OR REPLACE FUNCTION recalculate_order_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate discount_total for the order
  UPDATE orders
  SET discount_total = (
    SELECT COALESCE(SUM(discount_amount), 0)
    FROM order_items
    WHERE order_id = NEW.order_id
  ),
  total = (
    SELECT COALESCE(SUM(actual_price * quantity), 0)
    FROM order_items
    WHERE order_id = NEW.order_id
  )
  WHERE id = NEW.order_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-recalculate when actual_price is updated
CREATE TRIGGER recalculate_order_totals_trigger
AFTER UPDATE OF actual_price ON order_items
FOR EACH ROW
EXECUTE FUNCTION recalculate_order_totals();

-- Also trigger on insert for new items
CREATE TRIGGER recalculate_order_totals_insert_trigger
AFTER INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION recalculate_order_totals();