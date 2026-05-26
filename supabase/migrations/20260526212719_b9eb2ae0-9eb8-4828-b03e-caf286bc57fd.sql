
-- Welcome bonus: award on first paid order
CREATE OR REPLACE FUNCTION public.award_welcome_bonus_on_first_paid_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_settings public.loyalty_settings%ROWTYPE;
  v_already_received boolean;
  v_prior_paid_count integer;
BEGIN
  IF NEW.user_id IS NULL THEN RETURN NEW; END IF;
  IF NEW.payment_status IS DISTINCT FROM 'paid' THEN RETURN NEW; END IF;
  IF TG_OP = 'UPDATE' AND OLD.payment_status = 'paid' THEN RETURN NEW; END IF;

  SELECT * INTO v_settings FROM public.loyalty_settings LIMIT 1;
  IF COALESCE(v_settings.welcome_bonus_points, 0) <= 0 THEN RETURN NEW; END IF;

  -- Skip if already received a welcome bonus before
  SELECT EXISTS (
    SELECT 1 FROM public.loyalty_transactions
    WHERE user_id = NEW.user_id AND type = 'earn_welcome'
  ) INTO v_already_received;
  IF v_already_received THEN RETURN NEW; END IF;

  -- Skip if this user already had a prior paid order (i.e. not truly their first)
  SELECT COUNT(*) INTO v_prior_paid_count
  FROM public.orders
  WHERE user_id = NEW.user_id
    AND payment_status = 'paid'
    AND id <> NEW.id;
  IF v_prior_paid_count > 0 THEN RETURN NEW; END IF;

  PERFORM public.apply_loyalty_delta(
    NEW.user_id,
    v_settings.welcome_bonus_points,
    'earn_welcome'::public.loyalty_txn_type,
    NEW.id,
    'Welcome bonus — first order'
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_award_welcome_bonus ON public.orders;
CREATE TRIGGER trg_award_welcome_bonus
AFTER INSERT OR UPDATE OF payment_status ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.award_welcome_bonus_on_first_paid_order();

-- Birthday bonus runner (called daily by a cron job)
CREATE OR REPLACE FUNCTION public.run_birthday_bonus()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_settings public.loyalty_settings%ROWTYPE;
  v_today date := (now() AT TIME ZONE 'Asia/Qatar')::date;
  v_count integer := 0;
  v_rec record;
BEGIN
  SELECT * INTO v_settings FROM public.loyalty_settings LIMIT 1;
  IF COALESCE(v_settings.birthday_bonus_points, 0) <= 0 THEN RETURN 0; END IF;

  FOR v_rec IN
    SELECT cp.id AS user_id
    FROM public.customer_profiles cp
    JOIN public.loyalty_accounts la ON la.user_id = cp.id
    WHERE cp.birthdate IS NOT NULL
      AND EXTRACT(MONTH FROM cp.birthdate) = EXTRACT(MONTH FROM v_today)
      AND EXTRACT(DAY   FROM cp.birthdate) = EXTRACT(DAY   FROM v_today)
      AND NOT EXISTS (
        SELECT 1 FROM public.loyalty_transactions lt
        WHERE lt.user_id = cp.id
          AND lt.type = 'earn_birthday'
          AND EXTRACT(YEAR FROM lt.created_at AT TIME ZONE 'Asia/Qatar') = EXTRACT(YEAR FROM v_today)
      )
  LOOP
    PERFORM public.apply_loyalty_delta(
      v_rec.user_id,
      v_settings.birthday_bonus_points,
      'earn_birthday'::public.loyalty_txn_type,
      NULL,
      'Happy birthday from BmKicks!'
    );
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;
