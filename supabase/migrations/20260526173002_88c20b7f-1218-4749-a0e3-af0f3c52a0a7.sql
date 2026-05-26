
-- 1. Restrict user UPDATE on orders to non-sensitive columns via a trigger
CREATE OR REPLACE FUNCTION public.prevent_user_sensitive_order_updates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Admins and service role bypass
  IF public.is_admin() OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  IF NEW.payment_status IS DISTINCT FROM OLD.payment_status
     OR NEW.order_status IS DISTINCT FROM OLD.order_status
     OR NEW.preorder_status IS DISTINCT FROM OLD.preorder_status
     OR NEW.total IS DISTINCT FROM OLD.total
     OR NEW.subtotal IS DISTINCT FROM OLD.subtotal
     OR NEW.discount_total IS DISTINCT FROM OLD.discount_total
     OR NEW.downpayment_total IS DISTINCT FROM OLD.downpayment_total
     OR NEW.balance_total IS DISTINCT FROM OLD.balance_total
     OR NEW.has_preorder_items IS DISTINCT FROM OLD.has_preorder_items
     OR NEW.order_number IS DISTINCT FROM OLD.order_number
     OR NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Not authorized to modify sensitive order fields';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_user_sensitive_order_updates ON public.orders;
CREATE TRIGGER trg_prevent_user_sensitive_order_updates
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.prevent_user_sensitive_order_updates();

-- 2. Add explicit restrictive deny policies to enforce that inserts only flow through
-- SECURITY DEFINER functions (redeem_reward, handle_new_user_loyalty, apply_loyalty_delta).
CREATE POLICY "Block direct user inserts on reward_redemptions"
ON public.reward_redemptions
AS RESTRICTIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Block direct user inserts on loyalty_accounts"
ON public.loyalty_accounts
AS RESTRICTIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Block direct user inserts on loyalty_transactions"
ON public.loyalty_transactions
AS RESTRICTIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (public.is_admin());
