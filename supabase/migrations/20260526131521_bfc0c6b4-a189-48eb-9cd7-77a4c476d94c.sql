
REVOKE EXECUTE ON FUNCTION public.generate_referral_code() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recalculate_tier(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.apply_loyalty_delta(uuid, integer, public.loyalty_txn_type, uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_loyalty() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.award_points_on_order_paid() FROM PUBLIC, anon, authenticated;
