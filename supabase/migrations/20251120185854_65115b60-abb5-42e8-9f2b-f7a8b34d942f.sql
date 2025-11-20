-- Fix missing INSERT policy on order_items table
CREATE POLICY "Users can insert order items for their orders"
ON order_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
  )
);

-- Remove guest cart support - require authentication for cart operations
DROP POLICY IF EXISTS "Users and guests can view their cart items" ON cart_items;
DROP POLICY IF EXISTS "Users and guests can insert cart items" ON cart_items;
DROP POLICY IF EXISTS "Users and guests can update their cart items" ON cart_items;
DROP POLICY IF EXISTS "Users and guests can delete their cart items" ON cart_items;

-- Create new authenticated-only policies
CREATE POLICY "Users can view their cart items"
ON cart_items FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert cart items"
ON cart_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their cart items"
ON cart_items FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their cart items"
ON cart_items FOR DELETE
USING (auth.uid() = user_id);