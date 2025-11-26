-- Add pre-order support to products table
ALTER TABLE public.products
ADD COLUMN is_preorder BOOLEAN DEFAULT false;

-- Add pre-order fields to order_items table
ALTER TABLE public.order_items
ADD COLUMN is_preorder BOOLEAN DEFAULT false,
ADD COLUMN downpayment_amount NUMERIC DEFAULT 0,
ADD COLUMN balance_due NUMERIC DEFAULT 0;

-- Add pre-order fields to orders table
ALTER TABLE public.orders
ADD COLUMN has_preorder_items BOOLEAN DEFAULT false,
ADD COLUMN downpayment_total NUMERIC DEFAULT 0,
ADD COLUMN balance_total NUMERIC DEFAULT 0,
ADD COLUMN preorder_status TEXT DEFAULT NULL;

-- Update the recalculate_order_totals function to handle pre-order calculations
CREATE OR REPLACE FUNCTION public.recalculate_order_totals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Recalculate discount_total, downpayment_total, balance_total, and total for the order
  UPDATE orders
  SET 
    discount_total = (
      SELECT COALESCE(SUM(discount_amount), 0)
      FROM order_items
      WHERE order_id = NEW.order_id
    ),
    downpayment_total = (
      SELECT COALESCE(SUM(downpayment_amount), 0)
      FROM order_items
      WHERE order_id = NEW.order_id
    ),
    balance_total = (
      SELECT COALESCE(SUM(balance_due), 0)
      FROM order_items
      WHERE order_id = NEW.order_id
    ),
    has_preorder_items = (
      SELECT COALESCE(bool_or(is_preorder), false)
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
$function$;