
REVOKE EXECUTE ON FUNCTION public.award_welcome_bonus_on_first_paid_order() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.run_birthday_bonus() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.run_birthday_bonus() TO service_role;
