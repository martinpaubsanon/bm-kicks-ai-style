-- Fix 1: Remove public access to guest orders
-- Only authenticated users can view their own orders, admins can view all
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can still view all orders (this policy already exists)

-- Fix 2: Restrict order_items creation to legitimate order creation
-- Only allow creation if the order exists and belongs to the user or is being created
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;

CREATE POLICY "Users can create order items for their orders"
ON public.order_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
  )
  OR is_admin()
);

-- Note: Guest order creation still works because order_items are created 
-- immediately after the order is created in the same transaction