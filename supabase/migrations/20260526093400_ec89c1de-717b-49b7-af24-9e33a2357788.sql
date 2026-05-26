
-- 1. Orders: require auth and self-owned
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Authenticated users can create their own orders"
ON public.orders FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. Order items: remove guest order injection path
DROP POLICY IF EXISTS "Users can insert order items for their orders" ON public.order_items;
DROP POLICY IF EXISTS "Users can create order items for their orders" ON public.order_items;
CREATE POLICY "Users can create order items for their orders"
ON public.order_items FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
  ) OR public.is_admin()
);

-- 3. Customer profiles: allow self-insert
CREATE POLICY "Users can create their own profile"
ON public.customer_profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

-- 4. Order rate limits: deny direct writes (SECURITY DEFINER function bypasses RLS)
CREATE POLICY "Block direct inserts to rate limits"
ON public.order_rate_limits FOR INSERT TO authenticated, anon
WITH CHECK (false);
CREATE POLICY "Block direct updates to rate limits"
ON public.order_rate_limits FOR UPDATE TO authenticated, anon
USING (false);
CREATE POLICY "Block direct deletes from rate limits"
ON public.order_rate_limits FOR DELETE TO authenticated, anon
USING (false);

-- 5. Product images bucket: remove broad listing, keep direct URL access
-- Drop any overly permissive SELECT policies on storage.objects for product-images
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects'
      AND (qual LIKE '%product-images%' OR with_check LIKE '%product-images%')
      AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

-- Admins can manage product images
CREATE POLICY "Admins manage product images"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'product-images' AND public.is_admin())
WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

-- 6. Revoke broad EXECUTE on SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.check_order_rate_limit(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.generate_order_number() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recalculate_order_totals() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_order_number() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_customer() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_assign_first_admin() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_single_default_colorway() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
