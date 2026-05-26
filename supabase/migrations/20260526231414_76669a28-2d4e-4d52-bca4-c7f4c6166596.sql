DO $$
DECLARE
  r RECORD;
  v_settings public.loyalty_settings%ROWTYPE;
  v_mult numeric;
  v_pts integer;
BEGIN
  SELECT * INTO v_settings FROM public.loyalty_settings LIMIT 1;
  FOR r IN
    SELECT o.id, o.user_id, o.total, o.order_number, la.current_tier
    FROM public.orders o
    JOIN public.loyalty_accounts la ON la.user_id = o.user_id
    WHERE o.user_id IS NOT NULL
      AND o.payment_status IN ('paid','partial')
      AND NOT EXISTS (
        SELECT 1 FROM public.loyalty_transactions lt
        WHERE lt.reference_id = o.id AND lt.type = 'earn_order'
      )
    ORDER BY o.created_at ASC
  LOOP
    SELECT COALESCE(multiplier,1) INTO v_mult FROM public.loyalty_tiers WHERE name = r.current_tier;
    v_pts := floor(
      (floor(COALESCE(r.total,0) * COALESCE(v_settings.points_per_qar,1))
       + COALESCE(v_settings.points_per_order,0))
      * COALESCE(v_mult,1)
    );
    IF v_pts > 0 THEN
      PERFORM public.apply_loyalty_delta(
        r.user_id, v_pts, 'earn_order'::loyalty_txn_type, r.id,
        'Backfill: Order ' || COALESCE(r.order_number, r.id::text)
      );
    END IF;
  END LOOP;
END $$;