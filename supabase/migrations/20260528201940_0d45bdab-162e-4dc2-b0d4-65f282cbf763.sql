
-- Lock down SECURITY DEFINER functions: revoke broad execute, grant only the client-facing RPCs.

-- Internal helpers / triggers / policy helpers — no direct API access needed
REVOKE EXECUTE ON FUNCTION public.check_order_rate_limit(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_single_default_colorway() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_assign_first_admin() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_customer() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_referral_code() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_order_number() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_order_number() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.decrement_stock_on_order_item() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_user_sensitive_order_updates() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.run_birthday_bonus() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.award_welcome_bonus_on_first_paid_order() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.refresh_tier_on_order_paid() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.apply_loyalty_delta(uuid, integer, public.loyalty_txn_type, uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_loyalty() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recalculate_tier(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recalculate_order_totals() FROM PUBLIC, anon, authenticated;

-- Client-facing RPCs — keep execute for signed-in users only
REVOKE EXECUTE ON FUNCTION public.place_order(jsonb, jsonb, text, text, text, text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.place_order(jsonb, jsonb, text, text, text, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.redeem_reward(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.redeem_reward(uuid) TO authenticated;
