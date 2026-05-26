
-- 1. Schema additions
ALTER TABLE public.customer_profiles
  ADD COLUMN IF NOT EXISTS birthdate date;

ALTER TABLE public.rewards_catalog
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

ALTER TABLE public.loyalty_settings
  ADD COLUMN IF NOT EXISTS welcome_bonus_points integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS birthday_bonus_points integer NOT NULL DEFAULT 0;

-- 2. Enum values for new transaction types
ALTER TYPE public.loyalty_txn_type ADD VALUE IF NOT EXISTS 'earn_welcome';
ALTER TYPE public.loyalty_txn_type ADD VALUE IF NOT EXISTS 'earn_birthday';
