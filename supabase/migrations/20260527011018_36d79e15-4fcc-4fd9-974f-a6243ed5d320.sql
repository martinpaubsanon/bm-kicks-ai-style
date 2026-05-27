DO $$
DECLARE
  v_signup integer;
  r record;
BEGIN
  SELECT COALESCE(signup_bonus, 0) INTO v_signup FROM public.loyalty_settings LIMIT 1;
  IF v_signup IS NULL OR v_signup <= 0 THEN RETURN; END IF;

  FOR r IN
    SELECT la.user_id
    FROM public.loyalty_accounts la
    WHERE NOT EXISTS (
      SELECT 1 FROM public.loyalty_transactions lt
      WHERE lt.user_id = la.user_id AND lt.type = 'earn_signup'
    )
  LOOP
    PERFORM public.apply_loyalty_delta(
      r.user_id,
      v_signup,
      'earn_signup',
      NULL,
      'Welcome bonus (backfill)'
    );
  END LOOP;
END $$;