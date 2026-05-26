DROP TRIGGER IF EXISTS trg_award_points_on_order ON public.orders;
DROP FUNCTION IF EXISTS public.award_points_on_order_paid();

-- Reverse all earn_order points from balances/lifetime
WITH sums AS (
  SELECT user_id, SUM(delta)::int AS total_earned
  FROM public.loyalty_transactions
  WHERE type = 'earn_order'
  GROUP BY user_id
)
UPDATE public.loyalty_accounts la
SET points_balance = GREATEST(0, la.points_balance - s.total_earned),
    lifetime_points = GREATEST(0, la.lifetime_points - s.total_earned)
FROM sums s
WHERE la.user_id = s.user_id;

DELETE FROM public.loyalty_transactions WHERE type = 'earn_order';

-- Recalculate tiers based on remaining (bonus-only) lifetime points
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT user_id FROM public.loyalty_accounts LOOP
    PERFORM public.recalculate_tier(r.user_id);
  END LOOP;
END $$;

-- Zero out points_per_qar / points_per_order so future orders don't earn points
UPDATE public.loyalty_settings
SET points_per_qar = 0, points_per_order = 0;