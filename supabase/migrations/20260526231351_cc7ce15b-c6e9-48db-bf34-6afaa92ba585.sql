DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT o.id, o.user_id, o.payment_status
    FROM public.orders o
    WHERE o.user_id IS NOT NULL
      AND o.payment_status IN ('paid','partial')
      AND NOT EXISTS (
        SELECT 1 FROM public.loyalty_transactions lt
        WHERE lt.reference_id = o.id AND lt.type = 'earn_order'
      )
    ORDER BY o.created_at ASC
  LOOP
    -- Re-trigger by toggling payment_status to itself
    UPDATE public.orders
    SET payment_status = r.payment_status
    WHERE id = r.id;
  END LOOP;
END $$;