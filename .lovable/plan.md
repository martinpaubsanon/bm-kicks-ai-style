## Goal

Two tracks shipped together:

1. **Modernize the UI** to the approved **Glass & Glow** direction — dark glassmorphism shell, crimson glow, condensed display type, member-only loyalty hooks visible across the site.
2. **Lay the loyalty-program backbone** (database + UI surfaces + admin tools) so points, tiers, referrals, BM store discounts, physical gifts, and Qatar partner vouchers can all be turned on. Earning rules are wired in immediately; redemption is scaffolded so we can flip individual reward types live without another migration.

Existing brand rules stay: QAR base currency, dark theme with red accent, no guest checkout, real-time products/orders.

---

## Track 1 — Visual modernization (Glass & Glow)

### Design tokens (`src/index.css`, `tailwind.config.ts`)

- Switch default theme to dark surface tokens:
  - `--background 0 0% 4%`, `--card 0 0% 7%`, `--border 0 0% 100% / 0.08`
  - `--primary` stays the crimson red, with a new `--primary-glow` for haloed buttons.
  - Add `--gold 43 96% 56%` and `--gold-foreground` for loyalty tier accents.
- Add tokens used by the prototype:
  - `--gradient-glass: linear-gradient(135deg, hsl(0 0% 100% / 0.06), hsl(0 0% 100% / 0.02))`
  - `--shadow-glow: 0 8px 30px hsl(var(--primary) / 0.3)`
  - `--shadow-card: 0 30px 80px -20px hsl(0 0% 0% / 0.6)`
- Load **Oswald** (display) + **Inter** (body) via `index.html`; expose as `font-display` and `font-sans` in Tailwind.
- Add `bg-glass`, `border-glass`, `shadow-glow`, `text-gold` utilities driven by the tokens above so components never hardcode colors.

### Components to refresh

- **`Header.tsx`** — Becomes a rounded glass pill that floats with `backdrop-blur-xl`, hairline white border, cart badge in crimson, account avatar with a small gold "tier" ring when a member is signed in, plus a new **Rewards** entry in the account dropdown.
- **`HeroSection.tsx`** — Rebuild to match the chosen prototype: glass card container, crimson radial glow, Oswald `Beyond Measure. / Beyond Limits.` headline (red for the second line), member points/tier chip on the left, floating "+500 pts on this purchase" badge on the right, primary CTA with red glow shadow, secondary glass CTA. For signed-out users the chip becomes a "Join the Inner Circle" call-to-action instead of points.
- **`CategorySection.tsx`, `FeaturedProducts.tsx`, `AllProducts.tsx`, `ProductCard.tsx`, `CompactProductCard.tsx`** — Convert cards to glass surfaces: `bg-card/60 backdrop-blur border border-white/5 rounded-2xl`, hover lifts product images with a subtle red glow, price uses Oswald, "limited edition" / "pre-order" badges restyled as glass chips. Add a small "+N pts" hint on each card.
- **`Footer.tsx`** — Darker glass band, social row with hover glow, new "Inner Circle" mini-CTA above the legal links.
- **`FloatingButtons.tsx` / `WhatsAppButton.tsx`** — Match the new glow/radius language.
- **Animations** — Lean on existing `animate-fade-in`, add `animate-pulse-slow` for the loyalty status dot, `hover:-translate-y-0.5` for cards. No new animation libraries.

### Pages touched lightly

- `ProductDetail.tsx` — Apply the glass surface treatment, add a "Earn ~N points" line under the price.
- `Checkout.tsx` — Add a points-to-be-earned summary block + a "Redeem points / voucher" placeholder (disabled until redemption is enabled by admin).
- `CustomerAuth.tsx` — Glass card styling, copy mentions the rewards program.

### New loyalty surfaces (member-only)

- **`/customer/rewards`** — Tier card (Bronze → Silver → Gold → Platinum) with progress bar to next tier, current point balance, lifetime points, "earn more" tips, referral code with share + copy, points history table, and a tabbed reward catalog (BM Store / Physical Gifts / Partner Vouchers).
- Add a compact **rewards widget** on `customer/Dashboard.tsx` linking to the full page.

---

## Track 2 — Loyalty backbone

Built behind a single feature flag so we can launch UI before turning on public redemption.

### Database (one migration)

New tables, all RLS-protected:

- `loyalty_settings` — singleton row with `points_per_qar` (default 1), `points_per_order` (default 50), `signup_bonus` (default 250), `referral_bonus` (default 500), `redemption_enabled` (default false). Admin-only writes; readable by authenticated users.
- `loyalty_tiers` — `name`, `min_points`, `multiplier`, `perks` (jsonb). Seeded with Bronze (0, 1x), Silver (1000, 1.25x), Gold (3000, 1.5x), Platinum (8000, 2x). Publicly readable.
- `loyalty_accounts` — one row per `auth.users.id`: `points_balance`, `lifetime_points`, `current_tier`, `referral_code` (unique). Auto-created via trigger on signup + signup bonus applied. Users read their own; admins read all.
- `loyalty_transactions` — append-only ledger: `account_id`, `delta` (+/-), `type` (`earn_order`, `earn_signup`, `earn_referral`, `redeem_store`, `redeem_partner`, `redeem_gift`, `admin_adjustment`, `expiry`), `reference_id` (order/redemption id), `description`, `created_at`. Users read their own; only admins (or backend functions via service role) can insert.
- `loyalty_referrals` — `referrer_account_id`, `referred_user_id`, `status` (`pending`/`completed`), `rewarded_at`. Created when a new signup uses a referral code; completed (and bonus posted) on first paid order.
- `rewards_catalog` — `kind` (`store_discount` / `physical_gift` / `partner_voucher`), `title`, `description`, `image_url`, `points_cost`, `qar_value`, `stock`, `partner_id` (nullable), `terms`, `is_active`, `sort_order`. Publicly readable, admin writes.
- `loyalty_partners` — Qatar partner businesses: `name`, `logo_url`, `category` (cafe/gym/salon/etc.), `website`, `location_text`, `is_active`. Publicly readable, admin writes.
- `reward_redemptions` — `account_id`, `reward_id`, `points_spent`, `status` (`pending`/`fulfilled`/`expired`/`cancelled`), `code` (nullable, for voucher codes), `code_expires_at`, `fulfilled_at`, `notes`. Users read their own; admins read/update all.

Triggers / functions (all `SECURITY DEFINER`, `search_path = public`):

- `handle_new_user_loyalty()` — fires on `auth.users` insert: create `loyalty_accounts` row, assign unique referral code, log `earn_signup` transaction.
- `apply_referral_on_signup()` — if `raw_user_meta_data->>'referral_code'` is set, create a pending `loyalty_referrals` row.
- `award_points_on_order_paid()` — fires on `orders.payment_status` change to `paid`: calculates points = `floor(total * points_per_qar) + points_per_order`, applies tier multiplier, inserts ledger row, updates `points_balance`/`lifetime_points`/`current_tier`, and completes any pending referral (posting `referral_bonus` to the referrer).
- `recalculate_tier(account_id)` — helper used by the trigger above.
- `redeem_reward(reward_id)` — RPC users call from the rewards page: validates `redemption_enabled`, sufficient points, and stock; deducts points; creates a `reward_redemptions` row; for `partner_voucher` generates a unique code with 30-day expiry; returns the redemption record.

All inserts/updates above are atomic in a single transaction to avoid double-spending.

### Edge functions

- `loyalty-statement` — returns paginated transaction history with running balance (used by `/customer/rewards`).
- `admin-loyalty-adjust` — admin-only manual point adjustments with audit notes (writes a transaction row).

No public-secret changes needed; uses existing service role + JWT.

### Admin surfaces (under `src/pages/admin`)

- `Loyalty.tsx` — settings (earn rates, signup/referral bonuses, redemption toggle), tier editor, transactions ledger search.
- `Rewards.tsx` — CRUD for `rewards_catalog`, including kind, points cost, stock, image upload.
- `Partners.tsx` — CRUD for `loyalty_partners`.
- `Redemptions.tsx` — queue of pending redemptions: mark fulfilled, attach tracking note, regenerate voucher code.

Existing `admin/Dashboard.tsx` gains a "Loyalty" KPI row (members, points outstanding, redemptions this month).

### Customer surfaces

- `customer/Rewards.tsx` (new) — described above.
- `customer/Dashboard.tsx` — points/tier widget linking out.
- `CustomerAuth.tsx` — optional referral-code field on signup, stored to user metadata so the trigger can pick it up.
- `Checkout.tsx` — "You'll earn ~N points" line; redemption controls behind the `redemption_enabled` flag.

---

## Rollout

1. Run the migration (creates tables, triggers, seeds tiers + a default `loyalty_settings` row with `redemption_enabled = false`).
2. Ship UI: hero, header, cards, footer, customer rewards page in read-only mode (earning is live, redemption hidden).
3. Admin team adds rewards + partners through the new admin pages.
4. Flip `redemption_enabled = true` when the catalog is ready — no code change required.

## Out of scope (called out so we don't surprise the user)

- Real-time partner API integrations — schema supports `partner_id` and code pools, but only manual / generated codes ship now.
- Point expiry job — schema supports `expiry` transactions; we can add a scheduled function in a follow-up.
- Email/WhatsApp notifications for redemptions — can be wired into the existing transactional email + WhatsApp setup later.
- Cosmetic redesign of admin pages beyond adding the new sections.

## Technical notes

- Roles continue to use the existing `user_roles` table + `is_admin()` helper for all admin policies.
- All point math runs in Postgres triggers/RPCs to prevent client tampering.
- New tokens added in HSL only; no hardcoded colors in components.
- Animations stay within the existing Tailwind keyframes; no new dependencies.
