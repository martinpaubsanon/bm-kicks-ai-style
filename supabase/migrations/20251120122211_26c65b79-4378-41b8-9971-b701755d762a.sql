-- Add DELETE policies for orders table
CREATE POLICY "Admins can delete all orders"
ON public.orders
FOR DELETE
USING (is_admin());

-- Allow users to delete their own orders (optional but useful for customer self-service)
CREATE POLICY "Users can delete their own orders"
ON public.orders
FOR DELETE
USING (auth.uid() = user_id);