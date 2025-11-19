-- Fix RLS policies to remove guest order access from order_items and payment_confirmations

-- Drop existing policies for order_items
DROP POLICY IF EXISTS "Users can view order items for their orders" ON public.order_items;
DROP POLICY IF EXISTS "Users can create order items for their orders" ON public.order_items;

-- Create new policies without guest access
CREATE POLICY "Users can view order items for their orders"
ON public.order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
  OR public.is_admin()
);

CREATE POLICY "Users can create order items for their orders"
ON public.order_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
  OR public.is_admin()
);

-- Drop existing policies for payment_confirmations
DROP POLICY IF EXISTS "Users can view payment confirmations for their orders" ON public.payment_confirmations;
DROP POLICY IF EXISTS "Users can create payment confirmations for their orders" ON public.payment_confirmations;

-- Create new policies without guest access
CREATE POLICY "Users can view payment confirmations for their orders"
ON public.payment_confirmations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = payment_confirmations.order_id 
    AND orders.user_id = auth.uid()
  )
  OR public.is_admin()
);

CREATE POLICY "Users can create payment confirmations for their orders"
ON public.payment_confirmations FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = payment_confirmations.order_id 
    AND orders.user_id = auth.uid()
  )
  OR public.is_admin()
);