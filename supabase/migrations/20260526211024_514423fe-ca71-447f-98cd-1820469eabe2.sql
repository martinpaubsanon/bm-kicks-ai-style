
-- 1. loyalty_accounts: restrict UPDATE/DELETE to admins only
CREATE POLICY "Block direct user updates on loyalty_accounts"
ON public.loyalty_accounts AS RESTRICTIVE FOR UPDATE TO anon, authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Block direct user deletes on loyalty_accounts"
ON public.loyalty_accounts AS RESTRICTIVE FOR DELETE TO anon, authenticated
USING (public.is_admin());

-- 2. loyalty_referrals: restrict INSERT to admins (created via trigger as SECURITY DEFINER)
CREATE POLICY "Block direct user inserts on loyalty_referrals"
ON public.loyalty_referrals AS RESTRICTIVE FOR INSERT TO anon, authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Block direct user updates on loyalty_referrals"
ON public.loyalty_referrals AS RESTRICTIVE FOR UPDATE TO anon, authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Block direct user deletes on loyalty_referrals"
ON public.loyalty_referrals AS RESTRICTIVE FOR DELETE TO anon, authenticated
USING (public.is_admin());

-- 3. loyalty_transactions: restrict UPDATE/DELETE to admins
CREATE POLICY "Block direct user updates on loyalty_transactions"
ON public.loyalty_transactions AS RESTRICTIVE FOR UPDATE TO anon, authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Block direct user deletes on loyalty_transactions"
ON public.loyalty_transactions AS RESTRICTIVE FOR DELETE TO anon, authenticated
USING (public.is_admin());

-- 4. reward_redemptions: restrict UPDATE/DELETE to admins
CREATE POLICY "Block direct user updates on reward_redemptions"
ON public.reward_redemptions AS RESTRICTIVE FOR UPDATE TO anon, authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Block direct user deletes on reward_redemptions"
ON public.reward_redemptions AS RESTRICTIVE FOR DELETE TO anon, authenticated
USING (public.is_admin());

-- 5. orders: remove user DELETE policy
DROP POLICY IF EXISTS "Users can delete their own orders" ON public.orders;

-- 6. orders: enforce field-level restriction on user UPDATEs via existing
--    prevent_user_sensitive_order_updates() trigger function. Attach it.
DROP TRIGGER IF EXISTS trg_prevent_user_sensitive_order_updates ON public.orders;
CREATE TRIGGER trg_prevent_user_sensitive_order_updates
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.prevent_user_sensitive_order_updates();
