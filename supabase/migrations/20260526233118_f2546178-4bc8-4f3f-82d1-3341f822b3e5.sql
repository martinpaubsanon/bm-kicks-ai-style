-- 1) Sync loyalty_tiers with the UI tiers
DELETE FROM public.loyalty_tiers;
INSERT INTO public.loyalty_tiers (name, min_points, multiplier, sort_order, color_hex) VALUES
  ('Rookie',   0,     1.00, 0, '#cbd5e1'),
  ('Bronze',   500,   1.00, 1, '#d97706'),
  ('Silver',   2000,  1.00, 2, '#d4d4d8'),
  ('Gold',     5000,  1.00, 3, '#facc15'),
  ('Platinum', 10000, 1.00, 4, '#67e8f9'),
  ('Diamond',  25000, 1.00, 5, '#e879f9');

-- 2) Recalculate tier based on combined score (lifetime bonus points + paid spend)
CREATE OR REPLACE FUNCTION public.recalculate_tier(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_lifetime integer;
  v_spent numeric;
  v_combined integer;
  v_tier text;
BEGIN
  SELECT lifetime_points INTO v_lifetime
  FROM public.loyalty_accounts WHERE user_id = p_user_id;

  SELECT COALESCE(SUM(total), 0) INTO v_spent
  FROM public.orders
  WHERE user_id = p_user_id AND payment_status = 'paid';

  v_combined := COALESCE(v_lifetime, 0) + COALESCE(floor(v_spent)::int, 0);

  SELECT name INTO v_tier
  FROM public.loyalty_tiers
  WHERE min_points <= v_combined
  ORDER BY min_points DESC
  LIMIT 1;

  UPDATE public.loyalty_accounts
  SET current_tier = COALESCE(v_tier, 'Rookie')
  WHERE user_id = p_user_id;
END;
$$;

-- 3) Trigger: refresh tier on order payment changes
CREATE OR REPLACE FUNCTION public.refresh_tier_on_order_paid()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN RETURN NEW; END IF;
  IF TG_OP = 'INSERT' AND NEW.payment_status = 'paid' THEN
    PERFORM public.recalculate_tier(NEW.user_id);
  ELSIF TG_OP = 'UPDATE' AND NEW.payment_status IS DISTINCT FROM OLD.payment_status THEN
    PERFORM public.recalculate_tier(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_refresh_tier_on_order ON public.orders;
CREATE TRIGGER trg_refresh_tier_on_order
AFTER INSERT OR UPDATE OF payment_status ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.refresh_tier_on_order_paid();

-- 4) Backfill: recalculate every existing account
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT user_id FROM public.loyalty_accounts LOOP
    PERFORM public.recalculate_tier(r.user_id);
  END LOOP;
END $$;