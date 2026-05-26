
-- =====================================================================
-- LOYALTY PROGRAM SCHEMA
-- =====================================================================

-- Enums
CREATE TYPE public.loyalty_txn_type AS ENUM (
  'earn_signup',
  'earn_order',
  'earn_referral',
  'earn_bonus',
  'redeem_store',
  'redeem_gift',
  'redeem_partner',
  'admin_adjustment',
  'expiry',
  'refund'
);

CREATE TYPE public.reward_kind AS ENUM (
  'store_discount',
  'physical_gift',
  'partner_voucher'
);

CREATE TYPE public.redemption_status AS ENUM (
  'pending',
  'fulfilled',
  'expired',
  'cancelled'
);

CREATE TYPE public.referral_status AS ENUM (
  'pending',
  'completed',
  'cancelled'
);

-- =====================================================================
-- loyalty_settings (singleton)
-- =====================================================================
CREATE TABLE public.loyalty_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  points_per_qar numeric NOT NULL DEFAULT 1,
  points_per_order integer NOT NULL DEFAULT 50,
  signup_bonus integer NOT NULL DEFAULT 250,
  referral_bonus integer NOT NULL DEFAULT 500,
  redemption_enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  singleton boolean NOT NULL DEFAULT true UNIQUE
);

ALTER TABLE public.loyalty_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view loyalty settings"
  ON public.loyalty_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins manage loyalty settings"
  ON public.loyalty_settings FOR ALL
  TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE TRIGGER trg_loyalty_settings_updated
  BEFORE UPDATE ON public.loyalty_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.loyalty_settings (singleton) VALUES (true);

-- =====================================================================
-- loyalty_tiers
-- =====================================================================
CREATE TABLE public.loyalty_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  min_points integer NOT NULL,
  multiplier numeric NOT NULL DEFAULT 1,
  perks jsonb NOT NULL DEFAULT '[]'::jsonb,
  color_hex text DEFAULT '#a3a3a3',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.loyalty_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tiers"
  ON public.loyalty_tiers FOR SELECT
  USING (true);

CREATE POLICY "Admins manage tiers"
  ON public.loyalty_tiers FOR ALL
  TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE TRIGGER trg_loyalty_tiers_updated
  BEFORE UPDATE ON public.loyalty_tiers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.loyalty_tiers (name, min_points, multiplier, color_hex, sort_order, perks) VALUES
  ('Bronze',   0,    1.00, '#cd7f32', 0, '["Welcome bonus","Member-only drops"]'::jsonb),
  ('Silver',   1000, 1.25, '#c0c0c0', 1, '["1.25x points","Early access"]'::jsonb),
  ('Gold',     3000, 1.50, '#d4af37', 2, '["1.5x points","Free shipping","Birthday gift"]'::jsonb),
  ('Platinum', 8000, 2.00, '#e5e4e2', 3, '["2x points","Concierge support","VIP events"]'::jsonb);

-- =====================================================================
-- loyalty_accounts
-- =====================================================================
CREATE TABLE public.loyalty_accounts (
  user_id uuid PRIMARY KEY,
  points_balance integer NOT NULL DEFAULT 0,
  lifetime_points integer NOT NULL DEFAULT 0,
  current_tier text NOT NULL DEFAULT 'Bronze',
  referral_code text NOT NULL UNIQUE,
  referred_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.loyalty_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own loyalty account"
  ON public.loyalty_accounts FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Admins manage loyalty accounts"
  ON public.loyalty_accounts FOR ALL
  TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE TRIGGER trg_loyalty_accounts_updated
  BEFORE UPDATE ON public.loyalty_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================================
-- loyalty_transactions
-- =====================================================================
CREATE TABLE public.loyalty_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  delta integer NOT NULL,
  type public.loyalty_txn_type NOT NULL,
  reference_id uuid,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_loyalty_txn_user ON public.loyalty_transactions(user_id, created_at DESC);

ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own loyalty transactions"
  ON public.loyalty_transactions FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Admins manage loyalty transactions"
  ON public.loyalty_transactions FOR ALL
  TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- =====================================================================
-- loyalty_referrals
-- =====================================================================
CREATE TABLE public.loyalty_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id uuid NOT NULL,
  referred_user_id uuid NOT NULL UNIQUE,
  status public.referral_status NOT NULL DEFAULT 'pending',
  rewarded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_loyalty_referrals_referrer ON public.loyalty_referrals(referrer_user_id);

ALTER TABLE public.loyalty_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own referrals"
  ON public.loyalty_referrals FOR SELECT
  USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id OR is_admin());

CREATE POLICY "Admins manage referrals"
  ON public.loyalty_referrals FOR ALL
  TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- =====================================================================
-- loyalty_partners
-- =====================================================================
CREATE TABLE public.loyalty_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  category text,
  website text,
  location_text text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.loyalty_partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active partners"
  ON public.loyalty_partners FOR SELECT
  USING (is_active = true OR is_admin());

CREATE POLICY "Admins manage partners"
  ON public.loyalty_partners FOR ALL
  TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE TRIGGER trg_loyalty_partners_updated
  BEFORE UPDATE ON public.loyalty_partners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================================
-- rewards_catalog
-- =====================================================================
CREATE TABLE public.rewards_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind public.reward_kind NOT NULL,
  title text NOT NULL,
  description text,
  image_url text,
  points_cost integer NOT NULL,
  qar_value numeric,
  stock integer,
  partner_id uuid REFERENCES public.loyalty_partners(id) ON DELETE SET NULL,
  terms text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.rewards_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active rewards"
  ON public.rewards_catalog FOR SELECT
  USING (is_active = true OR is_admin());

CREATE POLICY "Admins manage rewards"
  ON public.rewards_catalog FOR ALL
  TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE TRIGGER trg_rewards_catalog_updated
  BEFORE UPDATE ON public.rewards_catalog
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================================
-- reward_redemptions
-- =====================================================================
CREATE TABLE public.reward_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reward_id uuid NOT NULL REFERENCES public.rewards_catalog(id) ON DELETE RESTRICT,
  points_spent integer NOT NULL,
  status public.redemption_status NOT NULL DEFAULT 'pending',
  code text,
  code_expires_at timestamptz,
  fulfilled_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_redemptions_user ON public.reward_redemptions(user_id, created_at DESC);
CREATE INDEX idx_redemptions_status ON public.reward_redemptions(status);

ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own redemptions"
  ON public.reward_redemptions FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Admins manage redemptions"
  ON public.reward_redemptions FOR ALL
  TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE TRIGGER trg_redemptions_updated
  BEFORE UPDATE ON public.reward_redemptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================================
-- Helper functions
-- =====================================================================

CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code text;
  attempt integer := 0;
BEGIN
  LOOP
    new_code := 'BM' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
    IF NOT EXISTS (SELECT 1 FROM public.loyalty_accounts WHERE referral_code = new_code) THEN
      RETURN new_code;
    END IF;
    attempt := attempt + 1;
    IF attempt > 10 THEN
      RAISE EXCEPTION 'Could not generate unique referral code';
    END IF;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.recalculate_tier(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lifetime integer;
  v_tier text;
BEGIN
  SELECT lifetime_points INTO v_lifetime
  FROM public.loyalty_accounts WHERE user_id = p_user_id;

  SELECT name INTO v_tier
  FROM public.loyalty_tiers
  WHERE min_points <= v_lifetime
  ORDER BY min_points DESC
  LIMIT 1;

  UPDATE public.loyalty_accounts
  SET current_tier = COALESCE(v_tier, 'Bronze')
  WHERE user_id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.apply_loyalty_delta(
  p_user_id uuid,
  p_delta integer,
  p_type public.loyalty_txn_type,
  p_reference uuid DEFAULT NULL,
  p_description text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.loyalty_transactions (user_id, delta, type, reference_id, description)
  VALUES (p_user_id, p_delta, p_type, p_reference, p_description);

  IF p_delta > 0 THEN
    UPDATE public.loyalty_accounts
    SET points_balance = points_balance + p_delta,
        lifetime_points = lifetime_points + p_delta
    WHERE user_id = p_user_id;
  ELSE
    UPDATE public.loyalty_accounts
    SET points_balance = points_balance + p_delta
    WHERE user_id = p_user_id;
  END IF;

  PERFORM public.recalculate_tier(p_user_id);
END;
$$;

-- =====================================================================
-- Signup hook: create loyalty account + signup bonus + referral link
-- =====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user_loyalty()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_settings public.loyalty_settings%ROWTYPE;
  v_referral_code_in text;
  v_referrer_id uuid;
  v_new_code text;
BEGIN
  SELECT * INTO v_settings FROM public.loyalty_settings LIMIT 1;
  v_new_code := public.generate_referral_code();

  v_referral_code_in := NULLIF(NEW.raw_user_meta_data->>'referral_code', '');
  IF v_referral_code_in IS NOT NULL THEN
    SELECT user_id INTO v_referrer_id
    FROM public.loyalty_accounts
    WHERE referral_code = upper(v_referral_code_in);
  END IF;

  INSERT INTO public.loyalty_accounts (user_id, referral_code, referred_by)
  VALUES (NEW.id, v_new_code, v_referrer_id)
  ON CONFLICT (user_id) DO NOTHING;

  IF COALESCE(v_settings.signup_bonus, 0) > 0 THEN
    PERFORM public.apply_loyalty_delta(
      NEW.id,
      v_settings.signup_bonus,
      'earn_signup',
      NULL,
      'Welcome bonus'
    );
  END IF;

  IF v_referrer_id IS NOT NULL THEN
    INSERT INTO public.loyalty_referrals (referrer_user_id, referred_user_id, status)
    VALUES (v_referrer_id, NEW.id, 'pending')
    ON CONFLICT (referred_user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_loyalty
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_loyalty();

-- =====================================================================
-- Order paid hook: award points + complete pending referral
-- =====================================================================
CREATE OR REPLACE FUNCTION public.award_points_on_order_paid()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_settings public.loyalty_settings%ROWTYPE;
  v_account public.loyalty_accounts%ROWTYPE;
  v_tier_multiplier numeric := 1;
  v_base_points integer;
  v_total_points integer;
  v_referral public.loyalty_referrals%ROWTYPE;
BEGIN
  IF NEW.user_id IS NULL THEN
    RETURN NEW;
  END IF;
  IF NEW.payment_status IS DISTINCT FROM 'paid' THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.payment_status = 'paid' THEN
    RETURN NEW;
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.loyalty_transactions
    WHERE reference_id = NEW.id AND type = 'earn_order'
  ) THEN
    RETURN NEW;
  END IF;

  SELECT * INTO v_settings FROM public.loyalty_settings LIMIT 1;
  SELECT * INTO v_account FROM public.loyalty_accounts WHERE user_id = NEW.user_id;

  IF v_account.user_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT multiplier INTO v_tier_multiplier
  FROM public.loyalty_tiers WHERE name = v_account.current_tier;

  v_base_points := floor(COALESCE(NEW.total, 0) * COALESCE(v_settings.points_per_qar, 1))
                   + COALESCE(v_settings.points_per_order, 0);
  v_total_points := floor(v_base_points * COALESCE(v_tier_multiplier, 1));

  IF v_total_points > 0 THEN
    PERFORM public.apply_loyalty_delta(
      NEW.user_id,
      v_total_points,
      'earn_order',
      NEW.id,
      'Order ' || COALESCE(NEW.order_number, NEW.id::text)
    );
  END IF;

  -- Complete pending referral
  SELECT * INTO v_referral
  FROM public.loyalty_referrals
  WHERE referred_user_id = NEW.user_id AND status = 'pending'
  LIMIT 1;

  IF v_referral.id IS NOT NULL AND COALESCE(v_settings.referral_bonus, 0) > 0 THEN
    PERFORM public.apply_loyalty_delta(
      v_referral.referrer_user_id,
      v_settings.referral_bonus,
      'earn_referral',
      v_referral.id,
      'Referral reward'
    );
    UPDATE public.loyalty_referrals
    SET status = 'completed', rewarded_at = now()
    WHERE id = v_referral.id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_award_points_on_order
  AFTER INSERT OR UPDATE OF payment_status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.award_points_on_order_paid();

-- =====================================================================
-- Redeem reward RPC
-- =====================================================================
CREATE OR REPLACE FUNCTION public.redeem_reward(p_reward_id uuid)
RETURNS public.reward_redemptions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_settings public.loyalty_settings%ROWTYPE;
  v_reward public.rewards_catalog%ROWTYPE;
  v_account public.loyalty_accounts%ROWTYPE;
  v_redemption public.reward_redemptions%ROWTYPE;
  v_code text;
  v_expires timestamptz;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO v_settings FROM public.loyalty_settings LIMIT 1;
  IF NOT v_settings.redemption_enabled THEN
    RAISE EXCEPTION 'Reward redemption is not yet open';
  END IF;

  SELECT * INTO v_reward FROM public.rewards_catalog WHERE id = p_reward_id;
  IF v_reward.id IS NULL OR NOT v_reward.is_active THEN
    RAISE EXCEPTION 'Reward unavailable';
  END IF;

  IF v_reward.stock IS NOT NULL AND v_reward.stock <= 0 THEN
    RAISE EXCEPTION 'Reward out of stock';
  END IF;

  SELECT * INTO v_account FROM public.loyalty_accounts WHERE user_id = v_user_id FOR UPDATE;
  IF v_account.user_id IS NULL THEN
    RAISE EXCEPTION 'No loyalty account found';
  END IF;

  IF v_account.points_balance < v_reward.points_cost THEN
    RAISE EXCEPTION 'Not enough points';
  END IF;

  IF v_reward.kind = 'partner_voucher' THEN
    v_code := 'BMV-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    v_expires := now() + interval '30 days';
  END IF;

  INSERT INTO public.reward_redemptions (
    user_id, reward_id, points_spent, status, code, code_expires_at
  )
  VALUES (
    v_user_id, p_reward_id, v_reward.points_cost,
    CASE WHEN v_reward.kind = 'partner_voucher' THEN 'fulfilled'::public.redemption_status ELSE 'pending'::public.redemption_status END,
    v_code, v_expires
  )
  RETURNING * INTO v_redemption;

  PERFORM public.apply_loyalty_delta(
    v_user_id,
    -v_reward.points_cost,
    CASE
      WHEN v_reward.kind = 'store_discount' THEN 'redeem_store'::public.loyalty_txn_type
      WHEN v_reward.kind = 'physical_gift'  THEN 'redeem_gift'::public.loyalty_txn_type
      ELSE 'redeem_partner'::public.loyalty_txn_type
    END,
    v_redemption.id,
    'Redeemed: ' || v_reward.title
  );

  IF v_reward.stock IS NOT NULL THEN
    UPDATE public.rewards_catalog
    SET stock = stock - 1
    WHERE id = p_reward_id;
  END IF;

  RETURN v_redemption;
END;
$$;

-- =====================================================================
-- Backfill loyalty accounts for existing users
-- =====================================================================
INSERT INTO public.loyalty_accounts (user_id, referral_code)
SELECT u.id, public.generate_referral_code()
FROM auth.users u
LEFT JOIN public.loyalty_accounts la ON la.user_id = u.id
WHERE la.user_id IS NULL;
